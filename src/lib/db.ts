import { promises as fs } from "fs";
import path from "path";
import { DatabaseSchema, InboundInquiry, Lead } from "@/types";
import { detectSubRubroAndSpecificSystem } from "./auditor";
import { RUBROS } from "./rubros";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "db.json");

function createSeedData(): DatabaseSchema {
  const now = new Date().toISOString();

  const leads: Lead[] = [
    {
      id: "lead-demo-1",
      name: "Parrilla y Bodegón Don Mateo",
      rubro: "gastronomia",
      city: "Córdoba",
      address: "Av. Colón 1420, Centro",
      lat: -31.4096,
      lon: -64.1977,
      phone: "+54 9 351 555-0142",
      instagram: "@donmateook",
      rating: 4.7,
      reviewCount: 184,
      opportunityScore: 94,
      opportunityLevel: "critica",
      audit: {
        hasWebsite: false,
        isSocialOnly: true,
        url: "https://instagram.com/donmateook",
        reachable: true,
        hasHttps: true,
        hasMobileViewport: true,
        hasTitle: false,
        hasMetaDescription: false,
        hasWhatsappLink: false,
        hasBookingOrCatalog: false,
        issues: [
          "Solo utiliza Instagram; no posee sitio web ni carta digital propia en Google",
          "Pierde hasta un 30% en comisiones de plataformas de delivery externas",
          "Los clientes piden menú y precios por mensaje generando demoras en hora pico",
        ],
        strengths: [
          "Excelente reputación local (4.7★ con 184 reseñas) y alta demanda comprobada",
        ],
      },
      recommendedSolution: `${RUBROS.gastronomia.recommendedWebTitle} + ${RUBROS.gastronomia.recommendedSystemTitle}`,
      recommendedSystemModules: RUBROS.gastronomia.recommendedModules,
      estimatedValue: 550,
      status: "nuevo",
      notes: "Gran candidato: tiene muchísimas reseñas pero cero sistema propio de pedidos.",
      clientViewedProposal: false,
      clientRequestedInfo: false,
      source: "demo",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "lead-demo-2",
      name: "Taller Mecánico Integral Norte",
      rubro: "talleres",
      city: "Rosario",
      address: "Bv. Rondeau 890",
      lat: -32.9056,
      lon: -60.6844,
      phone: "+54 9 341 555-0198",
      rating: 4.5,
      reviewCount: 67,
      opportunityScore: 89,
      opportunityLevel: "critica",
      audit: {
        hasWebsite: false,
        isSocialOnly: false,
        reachable: false,
        hasHttps: false,
        hasMobileViewport: false,
        hasTitle: false,
        hasMetaDescription: false,
        hasWhatsappLink: false,
        hasBookingOrCatalog: false,
        issues: [
          "No tiene sitio web propio ni canal digital de presupuestos",
          "En reseñas mencionan demora al responder por teléfono el estado de los vehículos",
          "Carece de sistema de órdenes de trabajo y recordatorios de próximo service",
        ],
        strengths: [
          "Buena calificación (4.5★) y clientela fija en zona norte",
        ],
      },
      recommendedSolution: `${RUBROS.talleres.recommendedWebTitle} + ${RUBROS.talleres.recommendedSystemTitle}`,
      recommendedSystemModules: RUBROS.talleres.recommendedModules,
      estimatedValue: 680,
      status: "contactado",
      notes: "Se envió mensaje inicial por WhatsApp consultando por el dueño (Sr. Carlos).",
      clientViewedProposal: true,
      clientRequestedInfo: false,
      source: "demo",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "lead-demo-3",
      name: "Centro Odontológico Sonrisa Clara",
      rubro: "salud",
      city: "Buenos Aires",
      address: "Av. Santa Fe 3115, Palermo",
      lat: -34.5889,
      lon: -58.4106,
      phone: "+54 9 11 5555-0231",
      website: "http://sonrisaclara-ejemplo.com.ar",
      rating: 4.8,
      reviewCount: 92,
      opportunityScore: 82,
      opportunityLevel: "critica",
      audit: {
        hasWebsite: true,
        url: "http://sonrisaclara-ejemplo.com.ar",
        isSocialOnly: false,
        reachable: true,
        hasHttps: false,
        responseTimeMs: 3200,
        hasMobileViewport: false,
        hasTitle: true,
        hasMetaDescription: false,
        hasWhatsappLink: false,
        hasBookingOrCatalog: false,
        issues: [
          "Sitio web sin certificado HTTPS (aparece como 'No seguro' en Chrome)",
          "Diseño antiguo no adaptable a teléfonos celulares",
          "No permite sacar turno online ni envía recordatorios automáticos",
        ],
        strengths: [
          "Clínica con 4 profesionales activos y excelente reputación",
        ],
      },
      recommendedSolution: `${RUBROS.salud.recommendedWebTitle} + ${RUBROS.salud.recommendedSystemTitle}`,
      recommendedSystemModules: RUBROS.salud.recommendedModules,
      estimatedValue: 750,
      status: "interesado",
      notes: "Vieron la propuesta de diagnóstico y pidieron coordinar demo del turnero.",
      clientViewedProposal: true,
      clientRequestedInfo: true,
      clientMessage: "Nos interesa ver cómo funcionan los recordatorios automáticos por WhatsApp.",
      source: "demo",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "lead-demo-4",
      name: "Barbería & Club El Barón",
      rubro: "estetica",
      city: "Mendoza",
      address: "Arístides Villanueva 450",
      lat: -32.8919,
      lon: -68.8551,
      phone: "+54 9 261 555-0177",
      instagram: "@elbaronbarber",
      rating: 4.9,
      reviewCount: 115,
      opportunityScore: 86,
      opportunityLevel: "critica",
      audit: {
        hasWebsite: false,
        isSocialOnly: true,
        url: "https://instagram.com/elbaronbarber",
        reachable: true,
        hasHttps: true,
        hasMobileViewport: true,
        hasTitle: false,
        hasMetaDescription: false,
        hasWhatsappLink: true,
        hasBookingOrCatalog: false,
        issues: [
          "Coordina todos los turnos por DM y WhatsApp manualmente",
          "Sufren cancelaciones sin aviso por falta de seña o confirmación automática",
          "No cuentan con web propia para aparecer en Google Maps con enlace de reserva",
        ],
        strengths: [
          "Marca muy fuerte en Instagram y 4.9★ en reseñas locales",
        ],
      },
      recommendedSolution: `${RUBROS.estetica.recommendedWebTitle} + ${RUBROS.estetica.recommendedSystemTitle}`,
      recommendedSystemModules: RUBROS.estetica.recommendedModules,
      estimatedValue: 490,
      status: "nuevo",
      notes: "Ideal para ofrecer agenda multi-barbero con cálculo automático de comisiones.",
      clientViewedProposal: false,
      clientRequestedInfo: false,
      source: "demo",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "lead-demo-5",
      name: "Ferretería Industrial del Sur",
      rubro: "comercios",
      city: "La Plata",
      address: "Calle 12 N° 1140",
      lat: -34.9205,
      lon: -57.9536,
      phone: "+54 9 221 555-0164",
      rating: 4.3,
      reviewCount: 54,
      opportunityScore: 76,
      opportunityLevel: "alta",
      audit: {
        hasWebsite: false,
        isSocialOnly: false,
        reachable: false,
        hasHttps: false,
        hasMobileViewport: false,
        hasTitle: false,
        hasMetaDescription: false,
        hasWhatsappLink: false,
        hasBookingOrCatalog: false,
        issues: [
          "No tiene catálogo web donde constructores y vecinos consulten precios y stock",
          "Responden consultas de stock por mostrador y teléfono perdiendo ventas rápidas",
          "Actualización manual lenta de listas de precios de proveedores",
        ],
        strengths: [
          "Amplio surtido en zona comercial de alto tránsito",
        ],
      },
      recommendedSolution: `${RUBROS.comercios.recommendedWebTitle} + ${RUBROS.comercios.recommendedSystemTitle}`,
      recommendedSystemModules: RUBROS.comercios.recommendedModules,
      estimatedValue: 650,
      status: "nuevo",
      notes: "Ofrecer catálogo online con buscador rápido + actualización masiva de precios.",
      clientViewedProposal: false,
      clientRequestedInfo: false,
      source: "demo",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "lead-demo-6",
      name: "Vanguardia Propiedades",
      rubro: "inmobiliarias",
      city: "Mar del Plata",
      address: "Güemes 2640",
      lat: -38.0155,
      lon: -57.5432,
      phone: "+54 9 223 555-0110",
      website: "https://vanguardia-ejemplo.com.ar",
      rating: 4.4,
      reviewCount: 38,
      opportunityScore: 64,
      opportunityLevel: "alta",
      audit: {
        hasWebsite: true,
        url: "https://vanguardia-ejemplo.com.ar",
        isSocialOnly: false,
        reachable: true,
        hasHttps: true,
        responseTimeMs: 1450,
        hasMobileViewport: true,
        hasTitle: true,
        hasMetaDescription: false,
        hasWhatsappLink: true,
        hasBookingOrCatalog: false,
        issues: [
          "La web actual es estática y no tiene buscador con filtros ni fichas compartibles",
          "No cuenta con CRM para hacer seguimiento de visitas y consultas por propiedad",
          "Falta optimización SEO en descripciones para búsquedas de alquiler/venta",
        ],
        strengths: [
          "Cuenta con dominio HTTPS y buena velocidad de carga",
        ],
      },
      recommendedSolution: `${RUBROS.inmobiliarias.recommendedSystemTitle} integrado a su web actual`,
      recommendedSystemModules: RUBROS.inmobiliarias.recommendedModules,
      estimatedValue: 890,
      status: "cerrado",
      notes: "Cliente cerrado: contrataron portal de propiedades + CRM de seguimiento.",
      clientViewedProposal: true,
      clientRequestedInfo: true,
      source: "demo",
      createdAt: now,
      updatedAt: now,
    },
  ];

  const inquiries: InboundInquiry[] = [
    {
      id: "inq-demo-1",
      businessName: "Centro Odontológico Sonrisa Clara",
      contactName: "Dra. Valeria Gómez",
      phone: "+54 9 11 5555-0231",
      email: "administracion@sonrisaclara.example",
      rubro: "salud",
      currentPainPoint:
        "Queremos modernizar la web para que sea adaptable a celular y sumar turnos online con recordatorios por WhatsApp.",
      website: "http://sonrisaclara-ejemplo.com.ar",
      leadId: "lead-demo-3",
      createdAt: now,
      status: "pendiente",
    },
  ];

  return { leads, inquiries };
}

let writeLock: Promise<void> = Promise.resolve();

const DEFAULT_CITY_COORDS: Record<string, { lat: number; lon: number }> = {
  "lead-demo-1": { lat: -31.4096, lon: -64.1977 },
  "lead-demo-2": { lat: -32.9056, lon: -60.6844 },
  "lead-demo-3": { lat: -34.5889, lon: -58.4106 },
  "lead-demo-4": { lat: -32.8919, lon: -68.8551 },
  "lead-demo-5": { lat: -34.9205, lon: -57.9536 },
  "lead-demo-6": { lat: -38.0155, lon: -57.5432 },
  "córdoba": { lat: -31.4201, lon: -64.1888 },
  "cordoba": { lat: -31.4201, lon: -64.1888 },
  "rosario": { lat: -32.9468, lon: -60.6393 },
  "buenos aires": { lat: -34.6037, lon: -58.3816 },
  "palermo": { lat: -34.5889, lon: -58.4106 },
  "mendoza": { lat: -32.8895, lon: -68.8458 },
  "la plata": { lat: -34.9215, lon: -57.9545 },
  "mar del plata": { lat: -38.0055, lon: -57.5426 },
};

async function ensureDbExists(): Promise<DatabaseSchema> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    const raw = await fs.readFile(DB_PATH, "utf-8");
    const parsed = JSON.parse(raw) as DatabaseSchema;
    if (!Array.isArray(parsed.leads) || !Array.isArray(parsed.inquiries)) {
      throw new Error("Invalid DB schema");
    }
    let updatedAny = false;
    parsed.leads = parsed.leads.map((lead, idx) => {
      const hasCoords =
        typeof lead.lat === "number" && typeof lead.lon === "number";
      const hasSubRubro =
        Boolean(lead.subRubro) && Boolean(lead.specificSystemNeeded);

      if (hasCoords && hasSubRubro) {
        return lead;
      }

      const byId = DEFAULT_CITY_COORDS[lead.id];
      const byCity = DEFAULT_CITY_COORDS[lead.city.toLowerCase()];
      const base = byId || byCity || { lat: -31.4201, lon: -64.1888 };
      const offset = byId ? 0 : (idx % 5) * 0.0025;
      const detected = detectSubRubroAndSpecificSystem(lead.name, lead.rubro);
      updatedAny = true;

      return {
        ...lead,
        lat: hasCoords ? lead.lat : Number((base.lat + offset).toFixed(6)),
        lon: hasCoords ? lead.lon : Number((base.lon + offset).toFixed(6)),
        subRubro: lead.subRubro || detected.subRubro,
        specificSystemNeeded:
          lead.specificSystemNeeded || detected.specificSystemNeeded,
      };
    });
    if (updatedAny) {
      await fs.writeFile(DB_PATH, JSON.stringify(parsed, null, 2), "utf-8");
    }
    return parsed;
  } catch {
    const seed = createSeedData();
    await fs.writeFile(DB_PATH, JSON.stringify(seed, null, 2), "utf-8");
    return seed;
  }
}

export async function readDb(): Promise<DatabaseSchema> {
  return ensureDbExists();
}

export async function mutateDb<T>(
  mutator: (db: DatabaseSchema) => Promise<T> | T
): Promise<T> {
  let result!: T;
  const next = writeLock.then(async () => {
    const db = await ensureDbExists();
    result = await mutator(db);
    await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
  });
  writeLock = next.catch(() => {});
  await next;
  return result;
}

export async function getAllLeads(): Promise<Lead[]> {
  const db = await readDb();
  return [...db.leads].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt)
  );
}

export async function getLeadById(id: string): Promise<Lead | undefined> {
  const db = await readDb();
  return db.leads.find((l) => l.id === id);
}

export async function upsertLead(lead: Lead): Promise<Lead> {
  return mutateDb((db) => {
    const idx = db.leads.findIndex((l) => l.id === lead.id);
    const updated = { ...lead, updatedAt: new Date().toISOString() };
    if (idx >= 0) {
      db.leads[idx] = updated;
    } else {
      db.leads.unshift(updated);
    }
    return updated;
  });
}

export async function updateLeadFields(
  id: string,
  patch: Partial<Lead>
): Promise<Lead | null> {
  return mutateDb((db) => {
    const idx = db.leads.findIndex((l) => l.id === id);
    if (idx === -1) return null;
    const updated: Lead = {
      ...db.leads[idx],
      ...patch,
      id,
      updatedAt: new Date().toISOString(),
    };
    db.leads[idx] = updated;
    return updated;
  });
}

export async function deleteLeadById(id: string): Promise<boolean> {
  return mutateDb((db) => {
    const before = db.leads.length;
    db.leads = db.leads.filter((l) => l.id !== id);
    return db.leads.length < before;
  });
}

export async function getAllInquiries(): Promise<InboundInquiry[]> {
  const db = await readDb();
  return [...db.inquiries].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt)
  );
}

export async function addInquiry(inquiry: InboundInquiry): Promise<InboundInquiry> {
  return mutateDb((db) => {
    db.inquiries.unshift(inquiry);
    return inquiry;
  });
}

export async function updateInquiryStatus(
  id: string,
  status: InboundInquiry["status"]
): Promise<InboundInquiry | null> {
  return mutateDb((db) => {
    const found = db.inquiries.find((i) => i.id === id);
    if (!found) return null;
    found.status = status;
    return found;
  });
}
