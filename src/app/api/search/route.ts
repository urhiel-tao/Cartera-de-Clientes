import { NextResponse } from "next/server";
import { createAnalyzedLead } from "@/lib/auditor";
import { getLocationSeedInfo } from "@/lib/locations";
import { getRubroDefinition, inferRubroFromTags } from "@/lib/rubros";
import { Lead, RubroId } from "@/types";

interface NominatimItem {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  name?: string;
  type?: string;
  class?: string;
  address?: Record<string, string>;
  extratags?: Record<string, string>;
}

interface OverpassElement {
  id: number;
  type: string;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

function approxDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const dLat = (lat2 - lat1) * 111;
  const dLon = (lon2 - lon1) * 111 * Math.cos((lat1 * Math.PI) / 180);
  return Math.sqrt(dLat * dLat + dLon * dLon);
}

async function fetchNominatimGeocode(
  placeQuery: string
): Promise<{ lat: number; lon: number } | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        placeQuery
      )}&limit=1`,
      {
        signal: AbortSignal.timeout(4000),
        headers: {
          "User-Agent": "CarteraPro-LocalProspecting/2.0",
          "Accept-Language": "es",
        },
      }
    );
    if (!res.ok) return null;
    const data = (await res.json()) as NominatimItem[];
    if (data.length === 0) return null;
    const lat = Number(data[0].lat);
    const lon = Number(data[0].lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
    return { lat, lon };
  } catch {
    return null;
  }
}

async function fetchNominatimCategory(
  keyword: string,
  placeQuery: string
): Promise<NominatimItem[]> {
  try {
    const q = `${keyword} ${placeQuery}`.trim();
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(
        q
      )}&addressdetails=1&extratags=1&limit=12`,
      {
        signal: AbortSignal.timeout(4500),
        headers: {
          "User-Agent": "CarteraPro-LocalProspecting/2.0",
          "Accept-Language": "es",
        },
      }
    );
    if (!res.ok) return [];
    return (await res.json()) as NominatimItem[];
  } catch {
    return [];
  }
}

async function queryOverpassMirror(
  endpoint: string,
  overpassQuery: string
): Promise<OverpassElement[]> {
  const res = await fetch(endpoint, {
    method: "POST",
    body: `data=${encodeURIComponent(overpassQuery)}`,
    signal: AbortSignal.timeout(5500),
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "CarteraPro-LocalProspecting/2.0",
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = (await res.json()) as { elements?: OverpassElement[] };
  return (data.elements || []).filter((el) => el.tags && el.tags.name);
}

async function fetchOverpassPlaces(
  lat: number,
  lon: number,
  rubro: RubroId | "todos"
): Promise<OverpassElement[]> {
  const radius = 3800;
  const filterQueries =
    rubro === "todos"
      ? [
          `node["shop"]["name"](around:${radius},${lat},${lon});`,
          `way["shop"]["name"](around:${radius},${lat},${lon});`,
          `node["amenity"~"restaurant|cafe|bar|fast_food|bakery|ice_cream|clinic|dentist|doctors|pharmacy|veterinary|school|language_school|driving_school"]["name"](around:${radius},${lat},${lon});`,
          `way["amenity"~"restaurant|cafe|bar|fast_food|bakery|ice_cream|clinic|dentist|doctors|pharmacy|veterinary|school|language_school|driving_school"]["name"](around:${radius},${lat},${lon});`,
          `node["office"]["name"](around:${radius},${lat},${lon});`,
          `node["craft"]["name"](around:${radius},${lat},${lon});`,
          `node["leisure"~"fitness_centre|sports_centre"]["name"](around:${radius},${lat},${lon});`,
          `node["tourism"~"hotel|hostel|guest_house|chalet"]["name"](around:${radius},${lat},${lon});`,
        ].join("\n")
      : getRubroDefinition(rubro)
          .osmFilters.map((f) => `nwr${f}["name"](around:${radius},${lat},${lon});`)
          .join("\n");

  const overpassQuery = `
    [out:json][timeout:6];
    (
      ${filterQueries}
    );
    out center tags 120;
  `;

  try {
    return await Promise.any([
      queryOverpassMirror("https://overpass-api.de/api/interpreter", overpassQuery),
      queryOverpassMirror("https://lz4.overpass-api.de/api/interpreter", overpassQuery),
    ]);
  } catch {
    return [];
  }
}

function buildAddressFromTags(
  tags: Record<string, string>,
  fallbackDistrict: string,
  fallbackCity: string
): string {
  const street = tags["addr:street"];
  const number = tags["addr:housenumber"];
  const suburb = tags["addr:suburb"] || tags["addr:neighbourhood"] || fallbackDistrict;

  const parts: string[] = [];
  if (street) {
    parts.push(number ? `${street} ${number}` : street);
  }
  if (suburb && suburb !== "Todos") parts.push(suburb);
  if (parts.length === 0) return `Zona comercial (${fallbackCity})`;
  return parts.join(", ");
}

function extractContactFromTags(tags: Record<string, string>): {
  phone?: string;
  email?: string;
  website?: string;
  instagram?: string;
  openingHours?: string;
} {
  const phone =
    tags["contact:whatsapp"] ||
    tags["contact:mobile"] ||
    tags["contact:phone"] ||
    tags.phone ||
    undefined;

  const email = tags["contact:email"] || tags.email || undefined;

  const website =
    tags.website ||
    tags["contact:website"] ||
    tags.url ||
    tags["contact:instagram"] ||
    tags["contact:facebook"] ||
    undefined;

  const instagram = tags["contact:instagram"] || undefined;
  const openingHours = tags.opening_hours || undefined;

  return { phone, email, website, instagram, openingHours };
}

interface DeepCandidate {
  name: string;
  rubro: RubroId;
  subRubro: string;
  specificSystemNeeded: string;
  address: string;
  phone?: string;
  email?: string;
  website?: string;
  instagram?: string;
  openingHours?: string;
  rating: number;
  reviewCount: number;
}

function buildDeepLocalCandidates(
  rubro: RubroId | "todos",
  locality: string,
  district: string,
  phonePrefix: string,
  areaCode: string,
  query?: string
): DeepCandidate[] {
  const zoneTag = district && district !== "Todos" ? district : "Centro";
  const prefix = query?.trim() ? `${query.trim()} ` : "";
  const tel = (num: string) => `${phonePrefix} ${areaCode} ${num}`;

  const bank: DeepCandidate[] = [
    // Gastronomía (6)
    {
      name: `${prefix}Bodegón & Parrilla La Esquina`,
      rubro: "gastronomia",
      subRubro: "Restaurante / Parrilla",
      specificSystemNeeded: "Carta digital QR autoadministrable + pedidos directos sin comisiones y control de mesas",
      address: `Av. Principal 420, ${zoneTag}`,
      phone: tel("542-1180"),
      instagram: "@laesquina.bodegon",
      openingHours: "Mar a Dom 12:00 - 00:00",
      rating: 4.7,
      reviewCount: 185,
    },
    {
      name: `${prefix}Panadería & Confitería Artesanal Sol`,
      rubro: "gastronomia",
      subRubro: "Panadería / Confitería",
      specificSystemNeeded: "Catálogo web de encargos y tortas + control de producción y caja diaria",
      address: `San Martín 815, ${zoneTag}`,
      phone: tel("488-3021"),
      openingHours: "Lun a Sáb 07:00 - 20:30",
      rating: 4.5,
      reviewCount: 92,
    },
    {
      name: `${prefix}Pizzería & Empanadas Don Antonio`,
      rubro: "gastronomia",
      subRubro: "Pizzería / Rotisería / Comidas",
      specificSystemNeeded: "Sistema de pedidos propios por WhatsApp sin comisiones + control de delivery",
      address: `Belgrano 1105, ${zoneTag}`,
      phone: tel("619-4402"),
      website: "https://instagram.com/pizzeriadonantonio",
      instagram: "@pizzeriadonantonio",
      rating: 4.8,
      reviewCount: 240,
    },
    {
      name: `${prefix}Café de Especialidad Bruma`,
      rubro: "gastronomia",
      subRubro: "Cafetería",
      specificSystemNeeded: "Carta QR rápida en mesa + pedidos take-away por WhatsApp",
      address: `Rivadavia 310, ${zoneTag}`,
      instagram: "@brumacafe.ok",
      rating: 4.6,
      reviewCount: 74,
    },
    {
      name: `${prefix}Rotisería Sabores de Casa`,
      rubro: "gastronomia",
      subRubro: "Pizzería / Rotisería / Comidas",
      specificSystemNeeded: "Menú diario actualizable en 1 clic + toma automática de pedidos por viandas",
      address: `Sarmiento 540, ${zoneTag}`,
      phone: tel("411-7890"),
      rating: 4.4,
      reviewCount: 68,
    },
    {
      name: `${prefix}Heladería Artesanal Alpes`,
      rubro: "gastronomia",
      subRubro: "Heladería",
      specificSystemNeeded: "Carta QR con sabores disponibles en tiempo real y pedidos por kilo a WhatsApp",
      address: `Bv. Central 290, ${zoneTag}`,
      rating: 4.7,
      reviewCount: 118,
    },

    // Talleres y Servicios Técnicos (5)
    {
      name: `${prefix}Taller Mecánico & Inyección Delta`,
      rubro: "talleres",
      subRubro: "Taller Mecánico / Lubricentro",
      specificSystemNeeded: "Sistema de órdenes de reparación por patente + portal de estado en vivo y aviso de service",
      address: `Av. Circunvalación 1520, ${zoneTag}`,
      phone: tel("492-3310"),
      openingHours: "Lun a Vie 08:30 - 18:00",
      rating: 4.6,
      reviewCount: 112,
    },
    {
      name: `${prefix}Servicio Técnico TecnoFix Celulares & PC`,
      rubro: "talleres",
      subRubro: "Servicio Técnico",
      specificSystemNeeded: "Seguimiento de reparaciones con código web + aprobación de presupuestos por WhatsApp",
      address: `Galería Central Local 14, ${zoneTag}`,
      phone: tel("588-1409"),
      instagram: "@tecnofix.local",
      rating: 4.5,
      reviewCount: 63,
    },
    {
      name: `${prefix}Lubricentro y Gomería El Rayo`,
      rubro: "talleres",
      subRubro: "Taller Mecánico / Lubricentro",
      specificSystemNeeded: "Historial de cambios de aceite/filtros por patente + recordatorio automático por km",
      address: `Av. Colón 2150, ${zoneTag}`,
      phone: tel("419-6650"),
      rating: 4.5,
      reviewCount: 84,
    },
    {
      name: `${prefix}Refrigeración y Aire Acondicionado Sur`,
      rubro: "talleres",
      subRubro: "Servicio Técnico",
      specificSystemNeeded: "Agenda de visitas técnicas a domicilio + generación rápida de presupuestos",
      address: `Vélez Sarsfield 890, ${zoneTag}`,
      rating: 4.4,
      reviewCount: 41,
    },
    {
      name: `${prefix}Taller de Chapa y Pintura ProAuto`,
      rubro: "talleres",
      subRubro: "Taller Mecánico / Lubricentro",
      specificSystemNeeded: "Recepción digital con fotos del vehículo + seguimiento de etapas para aseguradoras y clientes",
      address: `Ruta Provincial Km 3, ${zoneTag}`,
      phone: tel("504-2281"),
      rating: 4.7,
      reviewCount: 55,
    },

    // Salud (5)
    {
      name: `${prefix}Consultorios Odontológicos Sonrisa`,
      rubro: "salud",
      subRubro: "Consultorio Odontológico",
      specificSystemNeeded: "Turnero online por odontólogo + recordatorios automáticos por WhatsApp y ficha dental",
      address: `Mitre 312, ${zoneTag}`,
      phone: tel("510-8944"),
      openingHours: "Lun a Vie 09:00 - 19:00",
      rating: 4.8,
      reviewCount: 105,
    },
    {
      name: `${prefix}Centro Médico Integral ${locality}`,
      rubro: "salud",
      subRubro: "Clínica / Consultorios",
      specificSystemNeeded: "Sistema de turnos 24/7 por especialidad/obra social + historia clínica digital",
      address: `Av. Libertador 650, ${zoneTag}`,
      phone: tel("423-7710"),
      rating: 4.5,
      reviewCount: 77,
    },
    {
      name: `${prefix}Veterinaria & Farmacia Huellas Sanas`,
      rubro: "salud",
      subRubro: "Veterinaria",
      specificSystemNeeded: "Agenda veterinaria + carnet de vacunas digital y recordatorios automáticos",
      address: `25 de Mayo 1140, ${zoneTag}`,
      phone: tel("601-2255"),
      instagram: "@huellassanas.vet",
      rating: 4.9,
      reviewCount: 132,
    },
    {
      name: `${prefix}Centro Kinésico y Rehabilitación Vital`,
      rubro: "salud",
      subRubro: "Clínica / Consultorios",
      specificSystemNeeded: "Control de sesiones por paciente y obra social + agenda recurrente sin superposiciones",
      address: `Sarmiento 940, ${zoneTag}`,
      rating: 4.6,
      reviewCount: 49,
    },
    {
      name: `${prefix}Óptica y Contactología Visión Clara`,
      rubro: "salud",
      subRubro: "Farmacia / Óptica",
      specificSystemNeeded: "Catálogo web de marcos/lentes + registro de recetas graduadas y aviso de pedido listo",
      address: `Peatonal 210, ${zoneTag}`,
      phone: tel("431-9908"),
      rating: 4.7,
      reviewCount: 62,
    },

    // Estética y Bienestar (5)
    {
      name: `${prefix}Barbería Clásica 1920`,
      rubro: "estetica",
      subRubro: "Barbería / Peluquería",
      specificSystemNeeded: "Agenda de turnos por barbero + recordatorios WhatsApp y liquidación de comisiones",
      address: `Rivadavia 530, ${zoneTag}`,
      phone: tel("574-9901"),
      instagram: "@barberia1920",
      rating: 4.9,
      reviewCount: 158,
    },
    {
      name: `${prefix}Estudio de Uñas & Pestañas Aura`,
      rubro: "estetica",
      subRubro: "Centro de Estética / Uñas / Spa",
      specificSystemNeeded: "Web visual de servicios con reserva online, seña previa y fidelización de clientas",
      address: `9 de Julio 245, ${zoneTag}`,
      phone: tel("633-4120"),
      instagram: "@aura.studio",
      rating: 4.8,
      reviewCount: 89,
    },
    {
      name: `${prefix}Peluquería & Colorimetría Estilo`,
      rubro: "estetica",
      subRubro: "Barbería / Peluquería",
      specificSystemNeeded: "Turnero multi-estilista + historial de fórmulas de coloración por clienta",
      address: `Lavalle 770, ${zoneTag}`,
      phone: tel("455-7812"),
      rating: 4.4,
      reviewCount: 51,
    },
    {
      name: `${prefix}Gimnasio & Entrenamiento Fuerza Gym`,
      rubro: "estetica",
      subRubro: "Gimnasio / Centro Fitness",
      specificSystemNeeded: "Control de socios, vencimientos de cuotas mensuales y reserva de clases/horarios",
      address: `Av. Italia 920, ${zoneTag}`,
      phone: tel("590-1477"),
      rating: 4.6,
      reviewCount: 114,
    },
    {
      name: `${prefix}Centro Estético & Depilación Renacer`,
      rubro: "estetica",
      subRubro: "Centro de Estética / Uñas / Spa",
      specificSystemNeeded: "Agenda de cabinas y aparatología + venta de packs de sesiones y recordatorios",
      address: `Alvear 390, ${zoneTag}`,
      rating: 4.7,
      reviewCount: 60,
    },

    // Comercios y Tiendas (6)
    {
      name: `${prefix}Ferretería y Pinturería El Constructor`,
      rubro: "comercios",
      subRubro: "Ferretería y Materiales",
      specificSystemNeeded: "Catálogo web con buscador + actualización masiva de precios y control de stock",
      address: `Av. Independencia 1280, ${zoneTag}`,
      phone: tel("477-8015"),
      openingHours: "Lun a Sáb 08:30 - 19:30",
      rating: 4.5,
      reviewCount: 94,
    },
    {
      name: `${prefix}Showroom Indumentaria Urbana Mix`,
      rubro: "comercios",
      subRubro: "Tienda de Indumentaria / Calzado",
      specificSystemNeeded: "Catálogo online por talles y colores con carrito a WhatsApp + stock sincronizado",
      address: `Peatonal 340, ${zoneTag}`,
      phone: tel("645-2910"),
      instagram: "@urbanamix.showroom",
      rating: 4.7,
      reviewCount: 73,
    },
    {
      name: `${prefix}Pet Shop & Forrajería Mundo Mascotas`,
      rubro: "comercios",
      subRubro: "Pet Shop / Forrajería",
      specificSystemNeeded: "Tienda web de alimentos con recompra rápida por WhatsApp + control de repartos",
      address: `Moreno 615, ${zoneTag}`,
      phone: tel("509-1143"),
      rating: 4.8,
      reviewCount: 81,
    },
    {
      name: `${prefix}Librería & Papelería Comercial Centro`,
      rubro: "comercios",
      subRubro: "Comercio / Tienda Local",
      specificSystemNeeded: "Lista de precios escolar/oficina online + pedidos por WhatsApp y cuentas corrientes",
      address: `Dean Funes 480, ${zoneTag}`,
      phone: tel("448-5520"),
      rating: 4.5,
      reviewCount: 67,
    },
    {
      name: `${prefix}Tienda de Calzado y Deportes Paso Firme`,
      rubro: "comercios",
      subRubro: "Tienda de Indumentaria / Calzado",
      specificSystemNeeded: "Vidriera digital filtrable por talle y marca + control rápido de stock de depósito",
      address: `Av. España 710, ${zoneTag}`,
      instagram: "@pasofirme.calzado",
      rating: 4.6,
      reviewCount: 44,
    },
    {
      name: `${prefix}Dietética & Almacén Natural Raíces`,
      rubro: "comercios",
      subRubro: "Comercio / Tienda Local",
      specificSystemNeeded: "Catálogo fraccionado por peso/unidad con pedidos por WhatsApp + control de vencimientos",
      address: `Caseros 605, ${zoneTag}`,
      phone: tel("521-6034"),
      rating: 4.8,
      reviewCount: 59,
    },

    // Inmobiliarias y Estudios (3)
    {
      name: `${prefix}Alianza Propiedades & Alquileres`,
      rubro: "inmobiliarias",
      subRubro: "Inmobiliaria",
      specificSystemNeeded: "Portal web con filtros por zona/precio + CRM de interesados, visitas y contratos",
      address: `Av. Colón 310, ${zoneTag}`,
      phone: tel("421-9050"),
      email: "consultas@alianzapropiedades.example",
      rating: 4.3,
      reviewCount: 38,
    },
    {
      name: `${prefix}Estudio Contable & Impositivo Sur`,
      rubro: "inmobiliarias",
      subRubro: "Estudio Profesional",
      specificSystemNeeded: "Web de captación + portal de clientes para vencimientos impositivos y documentación",
      address: `25 de Mayo 590, ${zoneTag}`,
      phone: tel("532-4418"),
      rating: 4.6,
      reviewCount: 29,
    },
    {
      name: `${prefix}Estudio Jurídico & Escribanía ${locality}`,
      rubro: "inmobiliarias",
      subRubro: "Estudio Profesional",
      specificSystemNeeded: "Web institucional profesional + sistema de seguimiento de expedientes y turnos",
      address: `Tribunales 180, ${zoneTag}`,
      rating: 4.5,
      reviewCount: 24,
    },

    // Educación (2)
    {
      name: `${prefix}Instituto de Idiomas Global`,
      rubro: "educacion",
      subRubro: "Academia / Instituto",
      specificSystemNeeded: "Web de cursos con pre-inscripción + sistema de alumnos, cuotas mensuales y asistencias",
      address: `Urquiza 415, ${zoneTag}`,
      phone: tel("511-3340"),
      instagram: "@globalidiomas",
      rating: 4.8,
      reviewCount: 61,
    },
    {
      name: `${prefix}Academia de Danza & Movimiento Arte`,
      rubro: "educacion",
      subRubro: "Academia / Instituto",
      specificSystemNeeded: "Gestión de cuotas mensuales, asistencias desde celular y cronograma de clases",
      address: `Alberdi 720, ${zoneTag}`,
      phone: tel("620-8831"),
      rating: 4.7,
      reviewCount: 43,
    },

    // Hotelería (2)
    {
      name: `${prefix}Hotel Boutique & Posada del Sol`,
      rubro: "hoteleria",
      subRubro: "Alojamiento / Turismo",
      specificSystemNeeded: "Web con motor de reserva directa sin comisiones + calendario de habitaciones y señas",
      address: `Av. Costanera 980, ${zoneTag}`,
      phone: tel("480-7745"),
      instagram: "@posadadelsol.ok",
      rating: 4.6,
      reviewCount: 120,
    },
    {
      name: `${prefix}Apart & Alojamiento Temporario Centro`,
      rubro: "hoteleria",
      subRubro: "Alojamiento / Turismo",
      specificSystemNeeded: "Calendario unificado de unidades por temporada + respuestas instantáneas de disponibilidad",
      address: `Frente a Plaza Principal, ${zoneTag}`,
      phone: tel("412-5588"),
      rating: 4.4,
      reviewCount: 87,
    },

    // Otros Rubros (2)
    {
      name: `${prefix}Imprenta & Cartelería Express`,
      rubro: "otros",
      subRubro: "Imprenta / Gráfica",
      specificSystemNeeded: "Formulario web de cotización rápida + seguimiento de órdenes de impresión y entregas",
      address: `Tucumán 510, ${zoneTag}`,
      phone: tel("456-7890"),
      rating: 4.5,
      reviewCount: 48,
    },
    {
      name: `${prefix}Lavandería & Tintorería Clean`,
      rubro: "otros",
      subRubro: "Lavandería / Servicios",
      specificSystemNeeded: "Sistema de tickets digitales con aviso automático por WhatsApp cuando la ropa está lista",
      address: `Salta 320, ${zoneTag}`,
      phone: tel("530-9914"),
      rating: 4.4,
      reviewCount: 36,
    },
  ];

  if (rubro === "todos") {
    return bank;
  }

  const filtered = bank.filter((item) => item.rubro === rubro);
  // Si el rubro puntual tiene pocos ítems en el banco base, ampliar con variantes para garantizar cartera abundante
  if (filtered.length >= 6) return filtered;

  const extraNames = [
    "Norte",
    "del Centro",
    "San Martín",
    "24 Horas",
  ];
  const expanded = [...filtered];
  for (let i = 0; expanded.length < 8 && i < extraNames.length; i++) {
    const base = filtered[i % filtered.length];
    expanded.push({
      ...base,
      name: `${base.name} (${extraNames[i]})`,
      address: `${base.address.split(",")[0]} bis, ${zoneTag}`,
    });
  }
  return expanded;
}

function getSpiralOffset(index: number): { dLat: number; dLon: number } {
  const angle = index * 1.45;
  const radius = 0.002 + (index % 9) * 0.0014;
  return {
    dLat: Number((Math.sin(angle) * radius).toFixed(6)),
    dLon: Number((Math.cos(angle) * radius * 1.15).toFixed(6)),
  };
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      country?: string;
      province?: string;
      locality?: string;
      district?: string;
      city?: string;
      rubro?: RubroId | "todos";
      query?: string;
      lat?: number;
      lon?: number;
      limit?: number;
    };

    const country = (body.country || "Argentina").trim();
    const province = (body.province || "").trim();
    const locality = (body.locality || body.city || "Córdoba Capital").trim();
    const district = (body.district || "").trim();
    const rubro: RubroId | "todos" = body.rubro || "todos";
    const query = (body.query || "").trim();
    const maxResults = Math.min(Math.max(body.limit || 32, 10), 60);

    const hasExplicitCoords =
      typeof body.lat === "number" &&
      Number.isFinite(body.lat) &&
      typeof body.lon === "number" &&
      Number.isFinite(body.lon);

    const placeQuery = [
      district && district !== "Todos" ? district : "",
      locality,
      province,
      country,
    ]
      .filter(Boolean)
      .join(", ");

    const seedInfo = getLocationSeedInfo(country, province, locality);

    const nominatimKeywords =
      query
        ? [query]
        : rubro === "todos"
        ? ["restaurante", "taller mecanico", "ferreteria", "peluqueria", "odontologo"]
        : getRubroDefinition(rubro).searchKeywords.slice(0, 3);

    const [geocoded, ...nominatimBatches] = await Promise.all([
      hasExplicitCoords
        ? Promise.resolve({ lat: body.lat!, lon: body.lon! })
        : fetchNominatimGeocode(placeQuery),
      ...(hasExplicitCoords
        ? []
        : nominatimKeywords.map((kw) => fetchNominatimCategory(kw, placeQuery))),
    ]);

    const center = geocoded || { lat: seedInfo.lat, lon: seedInfo.lon };

    const overpassElements = await fetchOverpassPlaces(
      center.lat,
      center.lon,
      rubro
    );

    const seenNames = new Set<string>();
    const rawPlaces: Array<{
      name: string;
      rubro: RubroId;
      subRubro?: string;
      specificSystemNeeded?: string;
      country: string;
      province: string;
      city: string;
      district: string;
      address: string;
      lat?: number;
      lon?: number;
      phone?: string;
      email?: string;
      openingHours?: string;
      website?: string;
      instagram?: string;
      rating?: number;
      reviewCount?: number;
      tags?: Record<string, string>;
      source: Lead["source"];
    }> = [];

    const fallbackRubro: RubroId = rubro === "todos" ? "otros" : rubro;

    for (const el of overpassElements) {
      const tags = el.tags || {};
      const name = tags.name?.trim();
      if (!name || seenNames.has(name.toLowerCase())) continue;

      if (query && !name.toLowerCase().includes(query.toLowerCase())) {
        continue;
      }

      const elLat = el.lat ?? el.center?.lat;
      const elLon = el.lon ?? el.center?.lon;
      if (typeof elLat !== "number" || typeof elLon !== "number") continue;

      seenNames.add(name.toLowerCase());
      const contact = extractContactFromTags(tags);

      rawPlaces.push({
        name,
        rubro: inferRubroFromTags(tags, fallbackRubro),
        country,
        province,
        city: tags["addr:city"] || locality,
        district:
          tags["addr:suburb"] ||
          tags["addr:neighbourhood"] ||
          (district && district !== "Todos" ? district : "Centro"),
        address: buildAddressFromTags(tags, district, locality),
        lat: elLat,
        lon: elLon,
        phone: contact.phone,
        email: contact.email,
        openingHours: contact.openingHours,
        website: contact.website,
        instagram: contact.instagram,
        tags,
        source: "osm",
      });

      if (rawPlaces.length >= maxResults) break;
    }

    for (const batch of nominatimBatches) {
      for (const item of batch) {
        if (rawPlaces.length >= maxResults) break;
        const name = (item.name || item.display_name.split(",")[0] || "").trim();
        if (
          !name ||
          name.toLowerCase() === locality.toLowerCase() ||
          name.toLowerCase() === district.toLowerCase() ||
          seenNames.has(name.toLowerCase())
        ) {
          continue;
        }
        if (item.class === "boundary" || item.class === "place") continue;

        const poiLat = Number(item.lat);
        const poiLon = Number(item.lon);
        if (!Number.isFinite(poiLat) || !Number.isFinite(poiLon)) continue;

        if (approxDistanceKm(center.lat, center.lon, poiLat, poiLon) > 25) {
          continue;
        }

        seenNames.add(name.toLowerCase());
        const extra = item.extratags || {};
        const contact = extractContactFromTags(extra);

        const addressParts = [
          item.address?.road,
          item.address?.house_number,
          item.address?.suburb || item.address?.neighbourhood,
        ].filter(Boolean);

        rawPlaces.push({
          name,
          rubro: inferRubroFromTags(extra, fallbackRubro),
          country,
          province,
          city: item.address?.city || item.address?.town || locality,
          district:
            item.address?.suburb ||
            item.address?.neighbourhood ||
            (district && district !== "Todos" ? district : "Centro"),
          address:
            addressParts.length > 0
              ? addressParts.join(" ")
              : item.display_name.split(",").slice(1, 3).join(",").trim() ||
                `Zona ${locality}`,
          lat: poiLat,
          lon: poiLon,
          phone: contact.phone,
          email: contact.email,
          openingHours: contact.openingHours,
          website: contact.website,
          instagram: contact.instagram,
          tags: extra,
          source: "osm",
        });
      }
    }

    let dataSource: "openstreetmap" | "mixed" | "fallback" = "openstreetmap";
    const targetMinimum = 24;

    if (rawPlaces.length < targetMinimum) {
      dataSource = rawPlaces.length === 0 ? "fallback" : "mixed";
      const localBank = buildDeepLocalCandidates(
        rubro,
        locality,
        district,
        seedInfo.phonePrefix,
        seedInfo.areaCode,
        query
      );

      for (let i = 0; i < localBank.length && rawPlaces.length < maxResults; i++) {
        const fb = localBank[i];
        if (seenNames.has(fb.name.toLowerCase())) continue;
        seenNames.add(fb.name.toLowerCase());

        const offset = getSpiralOffset(rawPlaces.length + i);
        rawPlaces.push({
          name: fb.name,
          rubro: fb.rubro,
          subRubro: fb.subRubro,
          specificSystemNeeded: fb.specificSystemNeeded,
          country,
          province,
          city: locality,
          district: district && district !== "Todos" ? district : "Centro",
          address: fb.address,
          lat: Number((center.lat + offset.dLat).toFixed(6)),
          lon: Number((center.lon + offset.dLon).toFixed(6)),
          phone: fb.phone,
          email: fb.email,
          openingHours: fb.openingHours,
          website: fb.website,
          instagram: fb.instagram,
          rating: fb.rating,
          reviewCount: fb.reviewCount,
          source: "demo",
        });
      }
    }

    // Auditar en vivo solo los primeros 5 sitios web reales para mantener rapidez
    let liveAuditsUsed = 0;
    const results = await Promise.all(
      rawPlaces.map((place) => {
        const hasRealWeb =
          Boolean(place.website) &&
          !/instagram\.com|facebook\.com|linktr\.ee|wa\.me/i.test(
            place.website || ""
          );
        const shouldAuditLive = hasRealWeb && liveAuditsUsed < 5;
        if (shouldAuditLive) liveAuditsUsed += 1;

        return createAnalyzedLead({
          ...place,
          skipNetworkAudit: hasRealWeb && !shouldAuditLive,
        });
      })
    );

    results.sort((a, b) => b.opportunityScore - a.opportunityScore);

    return NextResponse.json({
      results,
      dataSource,
      count: results.length,
      center,
    });
  } catch (error) {
    console.error("Error en /api/search:", error);
    return NextResponse.json(
      { error: "No se pudo completar la búsqueda de comercios." },
      { status: 500 }
    );
  }
}
