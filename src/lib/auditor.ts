import {
  Lead,
  OpportunityLevel,
  RubroId,
  WebsiteAudit,
} from "@/types";
import { getRubroDefinition } from "./rubros";

const SOCIAL_DOMAINS = [
  "instagram.com",
  "facebook.com",
  "fb.com",
  "linktr.ee",
  "wa.me",
  "api.whatsapp.com",
  "tiktok.com",
];

function normalizeUrl(rawUrl?: string): string | undefined {
  if (!rawUrl) return undefined;
  const trimmed = rawUrl.trim();
  if (!trimmed) return undefined;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function isSocialOnlyUrl(url: string): boolean {
  const lower = url.toLowerCase();
  return SOCIAL_DOMAINS.some((domain) => lower.includes(domain));
}

export async function auditWebsite(
  rawUrl?: string,
  rubro: RubroId = "otros"
): Promise<WebsiteAudit> {
  const rubroDef = getRubroDefinition(rubro);
  const normalizedUrl = normalizeUrl(rawUrl);

  if (!normalizedUrl) {
    return {
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
        "El local no cuenta con sitio web propio en su ficha pública",
        "No aparece en búsquedas orgánicas de Google fuera del mapa",
        `Carece de un portal digital para ${rubroDef.recommendedSystemTitle.toLowerCase()}`,
      ],
      strengths: [],
    };
  }

  if (isSocialOnlyUrl(normalizedUrl)) {
    return {
      hasWebsite: false,
      url: normalizedUrl,
      isSocialOnly: true,
      reachable: true,
      hasHttps: normalizedUrl.startsWith("https://"),
      hasMobileViewport: true,
      hasTitle: false,
      hasMetaDescription: false,
      hasWhatsappLink: normalizedUrl.includes("wa.me") || normalizedUrl.includes("whatsapp"),
      hasBookingOrCatalog: false,
      issues: [
        "Usa únicamente una red social / enlace externo como sitio web",
        "Depender solo de Instagram/Facebook limita el posicionamiento en Google",
        "No permite automatizar turnos, catálogo propio ni seguimiento de clientes",
      ],
      strengths: [
        "Tiene presencia activa en redes sociales que puede conectarse a una web propia",
      ],
    };
  }

  const startedAt = Date.now();
  try {
    const response = await fetch(normalizedUrl, {
      method: "GET",
      redirect: "follow",
      signal: AbortSignal.timeout(6000),
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; CarteraProAuditor/1.0; +https://localhost)",
        Accept: "text/html,application/xhtml+xml",
      },
    });

    const responseTimeMs = Date.now() - startedAt;
    const finalUrl = response.url || normalizedUrl;
    const hasHttps = finalUrl.startsWith("https://");
    const reachable = response.ok;
    const html = await response.text();
    const lowerHtml = html.toLowerCase();

    const hasMobileViewport = /<meta[^>]+name=["']viewport["']/i.test(html);
    const hasTitle = /<title[^>]*>[^<]{2,}<\/title>/i.test(html);
    const hasMetaDescription = /<meta[^>]+name=["']description["']/i.test(html);
    const hasWhatsappLink =
      lowerHtml.includes("wa.me/") ||
      lowerHtml.includes("whatsapp.com") ||
      lowerHtml.includes("whatsapp");
    const hasBookingOrCatalog =
      /(reserva|turno|carrito|pedido|catalogo|catálogo|agenda|clientes|cita|tienda|comprar|presupuesto|portal)/.test(
        lowerHtml
      );

    const issues: string[] = [];
    const strengths: string[] = [];

    if (!reachable) {
      issues.push(`El sitio respondió con estado HTTP ${response.status}`);
    } else {
      strengths.push("Cuenta con dominio web activo y accesible");
    }

    if (!hasHttps) {
      issues.push("No utiliza certificado seguro HTTPS (los navegadores muestran 'No seguro')");
    } else {
      strengths.push("Conexión segura HTTPS activa");
    }

    if (responseTimeMs > 2500) {
      issues.push(`Tiempo de carga lento (${(responseTimeMs / 1000).toFixed(1)}s)`);
    } else if (reachable) {
      strengths.push(`Velocidad de respuesta saludable (${responseTimeMs}ms)`);
    }

    if (!hasMobileViewport) {
      issues.push("No está optimizada para celulares (falta meta viewport adaptable)");
    } else {
      strengths.push("Configuración básica adaptable a móviles");
    }

    if (!hasTitle || !hasMetaDescription) {
      issues.push("Faltan etiquetas SEO clave (título o descripción para Google)");
    } else {
      strengths.push("Incluye título y descripción SEO básicos");
    }

    if (!hasWhatsappLink) {
      issues.push("No detectamos botón o enlace directo a WhatsApp para consultas rápidas");
    } else {
      strengths.push("Tiene acceso directo a WhatsApp");
    }

    if (!hasBookingOrCatalog) {
      issues.push(
        `Web meramente informativa: no se detectó sistema interactivo para ${rubroDef.shortName.toLowerCase()} (turnos, pedidos, catálogo o portal)`
      );
    } else {
      strengths.push("Incluye señales de interacción/catálogo o agenda online");
    }

    return {
      hasWebsite: true,
      url: finalUrl,
      isSocialOnly: false,
      reachable,
      hasHttps,
      responseTimeMs,
      hasMobileViewport,
      hasTitle,
      hasMetaDescription,
      hasWhatsappLink,
      hasBookingOrCatalog,
      issues,
      strengths,
    };
  } catch {
    const responseTimeMs = Date.now() - startedAt;
    return {
      hasWebsite: true,
      url: normalizedUrl,
      isSocialOnly: false,
      reachable: false,
      hasHttps: normalizedUrl.startsWith("https://"),
      responseTimeMs,
      hasMobileViewport: false,
      hasTitle: false,
      hasMetaDescription: false,
      hasWhatsappLink: false,
      hasBookingOrCatalog: false,
      issues: [
        "El sitio web configurado no respondió o dio error de conexión/certificado",
        "Los clientes que intentan entrar desde Google encuentran la página caída",
        `Oportunidad directa de reemplazarla por ${rubroDef.recommendedWebTitle}`,
      ],
      strengths: [],
    };
  }
}

export function calculateOpportunityScore(
  audit: WebsiteAudit,
  rubro: RubroId,
  rating?: number,
  reviewCount?: number
): { score: number; level: OpportunityLevel } {
  let score = 15;

  if (!audit.hasWebsite) {
    score += 48;
  } else if (audit.isSocialOnly) {
    score += 42;
  } else if (!audit.reachable) {
    score += 44;
  } else {
    if (!audit.hasHttps) score += 12;
    if (!audit.hasMobileViewport) score += 15;
    if (!audit.hasTitle || !audit.hasMetaDescription) score += 8;
    if (!audit.hasWhatsappLink) score += 10;
    if (!audit.hasBookingOrCatalog) score += 20;
    if ((audit.responseTimeMs ?? 0) > 2500) score += 8;
  }

  // Rubros con altísima necesidad de sistema operativo propio
  if (
    rubro === "gastronomia" ||
    rubro === "salud" ||
    rubro === "estetica" ||
    rubro === "talleres" ||
    rubro === "hoteleria"
  ) {
    score += 8;
  } else {
    score += 5;
  }

  // Negocio con buena demanda comprobada (reseñas/calificación)
  if ((reviewCount ?? 0) >= 25) {
    score += 14;
  } else if ((reviewCount ?? 0) >= 8) {
    score += 8;
  }

  if ((rating ?? 0) >= 4.2) {
    score += 6;
  }

  const clamped = Math.max(10, Math.min(99, score));
  let level: OpportunityLevel = "baja";
  if (clamped >= 80) level = "critica";
  else if (clamped >= 60) level = "alta";
  else if (clamped >= 38) level = "media";

  return { score: clamped, level };
}

export function buildRecommendedSolution(
  audit: WebsiteAudit,
  rubro: RubroId
): { solution: string; modules: string[]; estimatedValue: number } {
  const rubroDef = getRubroDefinition(rubro);

  if (!audit.hasWebsite || audit.isSocialOnly || !audit.reachable) {
    return {
      solution: `${rubroDef.recommendedWebTitle} + ${rubroDef.recommendedSystemTitle}`,
      modules: rubroDef.recommendedModules,
      estimatedValue: rubroDef.suggestedValueUsd,
    };
  }

  if (!audit.hasBookingOrCatalog) {
    return {
      solution: `${rubroDef.recommendedSystemTitle} integrado a su web actual`,
      modules: rubroDef.recommendedModules,
      estimatedValue: Math.round(rubroDef.suggestedValueUsd * 0.85),
    };
  }

  return {
    solution: `Optimización Web (SEO, velocidad y conversión WhatsApp) + Automatización para ${rubroDef.shortName}`,
    modules: rubroDef.recommendedModules.slice(0, 3),
    estimatedValue: Math.round(rubroDef.suggestedValueUsd * 0.65),
  };
}

export function detectSubRubroAndSpecificSystem(
  name: string,
  rubro: RubroId,
  tags?: Record<string, string>
): { subRubro: string; specificSystemNeeded: string } {
  const n = name.toLowerCase();
  const amenity = (tags?.amenity || "").toLowerCase();
  const shop = (tags?.shop || "").toLowerCase();
  const office = (tags?.office || "").toLowerCase();
  const craft = (tags?.craft || "").toLowerCase();
  const tourism = (tags?.tourism || "").toLowerCase();
  const leisure = (tags?.leisure || "").toLowerCase();

  // Gastronomía
  if (shop === "bakery" || /panader|confiter|pastel|factur/.test(n)) {
    return {
      subRubro: "Panadería / Confitería",
      specificSystemNeeded:
        "Catálogo web de encargos y tortas + control de producción y caja diaria",
    };
  }
  if (amenity === "ice_cream" || /helader/.test(n)) {
    return {
      subRubro: "Heladería",
      specificSystemNeeded:
        "Carta digital QR con sabores en vivo y pedidos directos por WhatsApp sin comisiones",
    };
  }
  if (amenity === "cafe" || /café|cafe|coffee|espresso/.test(n)) {
    return {
      subRubro: "Cafetería",
      specificSystemNeeded:
        "Carta QR rápida en mesa, sistema de comandas y pedidos take-away por WhatsApp",
    };
  }
  if (/pizz|empanad|rotiser|hamburg|burger|parrilla|bodeg|sushi/.test(n) || amenity === "fast_food") {
    return {
      subRubro: "Pizzería / Rotisería / Comidas",
      specificSystemNeeded:
        "Sistema de pedidos propios por WhatsApp sin comisiones + control de delivery y caja",
    };
  }
  if (rubro === "gastronomia" || amenity === "restaurant" || amenity === "bar") {
    return {
      subRubro: "Restaurante / Bar",
      specificSystemNeeded:
        "Carta digital QR autoadministrable + reservas de mesas y control de comandas/caja",
    };
  }

  // Salud
  if (amenity === "dentist" || /odonto|dental|sonrisa/.test(n)) {
    return {
      subRubro: "Consultorio Odontológico",
      specificSystemNeeded:
        "Turnero online por odontólogo + recordatorios por WhatsApp y ficha dental digital",
    };
  }
  if (amenity === "veterinary" || shop === "pet" || /veterin/.test(n)) {
    return {
      subRubro: "Veterinaria",
      specificSystemNeeded:
        "Agenda de turnos médicos + historial de vacunas por mascota y avisos automáticos",
    };
  }
  if (amenity === "pharmacy" || shop === "optician" || /farmac|optic/.test(n)) {
    return {
      subRubro: "Farmacia / Óptica",
      specificSystemNeeded:
        "Catálogo web de productos + pedidos de recetas por WhatsApp y control de stock",
    };
  }
  if (rubro === "salud" || amenity === "clinic" || amenity === "doctors") {
    return {
      subRubro: "Clínica / Consultorios",
      specificSystemNeeded:
        "Sistema de turnos online 24/7 por especialidad + recordatorios e historia clínica",
    };
  }

  // Estética y Bienestar
  if (shop === "hairdresser" || /barber|peluquer|coiffeur/.test(n)) {
    return {
      subRubro: "Barbería / Peluquería",
      specificSystemNeeded:
        "Agenda de turnos por profesional + recordatorios y cálculo automático de comisiones",
    };
  }
  if (leisure === "fitness_centre" || leisure === "sports_centre" || /gimnasio|gym|crossfit|pilates/.test(n)) {
    return {
      subRubro: "Gimnasio / Centro Fitness",
      specificSystemNeeded:
        "Sistema de control de socios, cuotas mensuales, vencimientos y reserva de clases",
    };
  }
  if (rubro === "estetica" || shop === "beauty" || shop === "massage") {
    return {
      subRubro: "Centro de Estética / Uñas / Spa",
      specificSystemNeeded:
        "Web visual de servicios con reserva online, seña previa y fidelización de clientas",
    };
  }

  // Talleres y Servicios Técnicos
  if (shop === "car_repair" || shop === "tyres" || craft === "car_repair" || /mecanic|lubric|gomer|inyecc|freno/.test(n)) {
    return {
      subRubro: "Taller Mecánico / Lubricentro",
      specificSystemNeeded:
        "Sistema de órdenes de reparación por patente + portal de estado en vivo y aviso de próximo service",
    };
  }
  if (craft === "electronics_repair" || shop === "repair" || /tecnic|celu|repar|refrigera|comput|pc/.test(n)) {
    return {
      subRubro: "Servicio Técnico",
      specificSystemNeeded:
        "Seguimiento de reparaciones con código para clientes + presupuestos rápidos por WhatsApp",
    };
  }
  if (rubro === "talleres") {
    return {
      subRubro: "Taller y Servicios",
      specificSystemNeeded:
        "Sistema de órdenes de trabajo digitales, presupuestos aprobables en 1 clic y stock de repuestos",
    };
  }

  // Comercios
  if (shop === "hardware" || shop === "doityourself" || shop === "paint" || /ferreter|pintur|corralon/.test(n)) {
    return {
      subRubro: "Ferretería y Materiales",
      specificSystemNeeded:
        "Catálogo web con buscador + actualización masiva de listas de precios y control de stock",
    };
  }
  if (shop === "clothes" || shop === "shoes" || shop === "boutique" || /ropa|indument|showroom|calzado|zapater/.test(n)) {
    return {
      subRubro: "Tienda de Indumentaria / Calzado",
      specificSystemNeeded:
        "Catálogo online por talles y colores con carrito a WhatsApp + control de stock por variante",
    };
  }
  if (/pet|huellas|mascot|forraj/.test(n)) {
    return {
      subRubro: "Pet Shop / Forrajería",
      specificSystemNeeded:
        "Tienda web de alimento y accesorios con recompra rápida + control de entregas y stock",
    };
  }
  if (rubro === "comercios" || Boolean(shop)) {
    return {
      subRubro: "Comercio / Tienda Local",
      specificSystemNeeded:
        "Catálogo digital conectado a WhatsApp + sistema de inventario, ventas y precios actualizados",
    };
  }

  // Inmobiliarias y Estudios
  if (office === "estate_agent" || /inmobil|propied|desarroll/.test(n)) {
    return {
      subRubro: "Inmobiliaria",
      specificSystemNeeded:
        "Portal web de propiedades con filtros avanzados + CRM de interesados, visitas y contratos",
    };
  }
  if (office === "accountant" || office === "lawyer" || /contab|abogad|jurid|escriban|estudio/.test(n)) {
    return {
      subRubro: "Estudio Profesional",
      specificSystemNeeded:
        "Web profesional de captación + portal de clientes para vencimientos, legajos y consultas",
    };
  }
  if (rubro === "inmobiliarias") {
    return {
      subRubro: "Inmobiliaria / Estudio",
      specificSystemNeeded:
        "Web institucional + CRM de seguimiento de clientes, casos y documentación",
    };
  }

  // Educación
  if (rubro === "educacion" || /academ|institut|idioma|escuela|curso|danza/.test(n)) {
    return {
      subRubro: "Academia / Instituto",
      specificSystemNeeded:
        "Web de cursos con pre-inscripción + sistema de alumnos, cuotas mensuales y asistencias",
    };
  }

  // Hotelería
  if (rubro === "hoteleria" || Boolean(tourism) || /hotel|caban|cabañ|posada|hostel/.test(n)) {
    return {
      subRubro: "Alojamiento / Turismo",
      specificSystemNeeded:
        "Web con motor de reserva directa sin comisiones + calendario de cabañas/habitaciones y tarifas",
    };
  }

  return {
    subRubro: "Negocio Local",
    specificSystemNeeded:
      "Web profesional enfocada en captación por Google + sistema simple de presupuestos, clientes y caja",
  };
}

export async function createAnalyzedLead(input: {
  id?: string;
  name: string;
  rubro: RubroId;
  subRubro?: string;
  specificSystemNeeded?: string;
  country?: string;
  province?: string;
  city: string;
  district?: string;
  address?: string;
  lat?: number;
  lon?: number;
  phone?: string;
  email?: string;
  openingHours?: string;
  website?: string;
  instagram?: string;
  rating?: number;
  reviewCount?: number;
  notes?: string;
  tags?: Record<string, string>;
  source?: Lead["source"];
  skipNetworkAudit?: boolean;
}): Promise<Lead> {
  const audit = input.skipNetworkAudit
    ? buildStaticAudit(input.website, input.rubro)
    : await auditWebsite(input.website, input.rubro);

  const { score, level } = calculateOpportunityScore(
    audit,
    input.rubro,
    input.rating,
    input.reviewCount
  );

  const rec = buildRecommendedSolution(audit, input.rubro);
  const specific = detectSubRubroAndSpecificSystem(
    input.name,
    input.rubro,
    input.tags
  );
  const now = new Date().toISOString();

  return {
    id: input.id || `lead-${crypto.randomUUID().slice(0, 8)}`,
    name: input.name.trim(),
    rubro: input.rubro,
    subRubro: input.subRubro || specific.subRubro,
    specificSystemNeeded:
      input.specificSystemNeeded || specific.specificSystemNeeded,
    country: input.country?.trim() || undefined,
    province: input.province?.trim() || undefined,
    city: input.city.trim() || "Tu ciudad",
    district: input.district?.trim() || undefined,
    address: input.address?.trim() || "Zona centro",
    lat: input.lat,
    lon: input.lon,
    phone: input.phone?.trim() || undefined,
    email: input.email?.trim() || undefined,
    openingHours: input.openingHours?.trim() || undefined,
    website: normalizeUrl(input.website),
    instagram: input.instagram?.trim() || undefined,
    rating: input.rating,
    reviewCount: input.reviewCount,
    opportunityScore: score,
    opportunityLevel: level,
    audit,
    recommendedSolution: rec.solution,
    recommendedSystemModules: rec.modules,
    estimatedValue: rec.estimatedValue,
    status: "nuevo",
    notes: input.notes || "",
    clientViewedProposal: false,
    clientRequestedInfo: false,
    source: input.source || "manual",
    createdAt: now,
    updatedAt: now,
  };
}

function buildStaticAudit(rawUrl?: string, rubro: RubroId = "otros"): WebsiteAudit {
  const rubroDef = getRubroDefinition(rubro);
  const url = normalizeUrl(rawUrl);
  if (!url) {
    return {
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
        "El local no figura con sitio web propio en OpenStreetMap / mapas públicos",
        "No capta búsquedas orgánicas en Google fuera de redes",
        `Falta herramienta digital para ${rubroDef.recommendedSystemTitle.toLowerCase()}`,
      ],
      strengths: [],
    };
  }

  if (isSocialOnlyUrl(url)) {
    return {
      hasWebsite: false,
      url,
      isSocialOnly: true,
      reachable: true,
      hasHttps: true,
      hasMobileViewport: true,
      hasTitle: false,
      hasMetaDescription: false,
      hasWhatsappLink: url.includes("wa.me"),
      hasBookingOrCatalog: false,
      issues: [
        "Enlace público apunta solo a redes sociales, no a una web propia",
        "Pierde visibilidad en Google y automatización de pedidos/turnos",
      ],
      strengths: ["Presencia en redes sociales activa"],
    };
  }

  return {
    hasWebsite: true,
    url,
    isSocialOnly: false,
    reachable: true,
    hasHttps: url.startsWith("https://"),
    hasMobileViewport: true,
    hasTitle: true,
    hasMetaDescription: false,
    hasWhatsappLink: false,
    hasBookingOrCatalog: false,
    issues: [
      `Sitio registrado (${url}): conviene auditar en vivo si tiene turnos, catálogo o WhatsApp integrado`,
    ],
    strengths: ["Cuenta con dominio web declarado"],
  };
}

export interface PitchTemplate {
  id: string;
  title: string;
  angle: string;
  message: string;
}

export function generatePitchMessages(
  lead: Lead,
  _diagnosticUrl?: string
): PitchTemplate[] {
  void _diagnosticUrl;
  const rubroDef = getRubroDefinition(lead.rubro);
  const subRubroLabel = lead.subRubro || rubroDef.shortName;
  const specificNeed =
    lead.specificSystemNeeded || rubroDef.recommendedSystemTitle;
  const mainIssue =
    lead.audit.issues[0] ||
    "falta de herramientas digitales para automatizar la atención";

  return [
    {
      id: "diagnostico",
      title: "1. Enfoque Diagnóstico Directo (Recomendado)",
      angle: "Sin venta agresiva: le comentas exactamente qué oportunidad detectaste.",
      message: `Hola equipo de ${lead.name}! 👋 Estuve viendo comercios de ${subRubroLabel} en ${lead.city} y noté algo concreto que los puede ayudar a ahorrar tiempo y sumar clientes.\n\nDetecté que hoy: "${mainIssue}".\n\nPara su local vendría ideal un ${specificNeed}, y si quieren en 10 minutos les muestro cómo funciona sin compromiso.`,
    },
    {
      id: "sistema",
      title: "2. Enfoque Sistema de Optimización Operativa",
      angle: "Ideal cuando el local tiene movimiento pero gestiona todo a mano por WhatsApp o papel.",
      message: `¡Hola ${lead.name}! ¿Cómo están? Trabajo ayudando a negocios de ${subRubroLabel} a ordenar su trabajo diario y evitar mensajes repetitivos.\n\nPara locales como el de ustedes implementamos ${lead.recommendedSolution}, que incluye:\n• ${lead.recommendedSystemModules[0] || rubroDef.recommendedModules[0]}\n• ${lead.recommendedSystemModules[1] || rubroDef.recommendedModules[1]}\n\n¿Les gustaría que les muestre una demo rápida esta semana?`,
    },
    {
      id: "web",
      title: "3. Enfoque Captación de Clientes desde Google",
      angle: "Ideal si no tienen web o solo dependen de Instagram/Maps.",
      message: `Hola ${lead.name}! Vi su negocio en ${lead.city} y tienen un gran potencial para captar más gente que hoy busca "${rubroDef.searchKeywords[0]} en ${lead.city}" en Google.\n\nHoy al no contar con una web optimizada con ${rubroDef.recommendedWebTitle.toLowerCase()}, muchas de esas consultas se van a la competencia.\n\nSi les interesa, les cuento sin compromiso cómo podemos armarlo para ${lead.name}.`,
    },
  ];
}
