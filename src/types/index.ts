export type RubroId =
  | "gastronomia"
  | "salud"
  | "estetica"
  | "talleres"
  | "comercios"
  | "inmobiliarias"
  | "educacion"
  | "hoteleria"
  | "otros";

export type LeadStatus =
  | "nuevo"
  | "contactado"
  | "interesado"
  | "cerrado"
  | "descartado";

export type OpportunityLevel = "critica" | "alta" | "media" | "baja";

export interface WebsiteAudit {
  hasWebsite: boolean;
  url?: string;
  isSocialOnly: boolean;
  reachable: boolean;
  hasHttps: boolean;
  responseTimeMs?: number;
  hasMobileViewport: boolean;
  hasTitle: boolean;
  hasMetaDescription: boolean;
  hasWhatsappLink: boolean;
  hasBookingOrCatalog: boolean;
  issues: string[];
  strengths: string[];
}

export interface Lead {
  id: string;
  name: string;
  rubro: RubroId;
  subRubro?: string;
  specificSystemNeeded?: string;
  country?: string;
  province?: string;
  city: string;
  district?: string;
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
  opportunityScore: number;
  opportunityLevel: OpportunityLevel;
  audit: WebsiteAudit;
  recommendedSolution: string;
  recommendedSystemModules: string[];
  estimatedValue: number;
  status: LeadStatus;
  notes: string;
  clientViewedProposal?: boolean;
  clientRequestedInfo?: boolean;
  clientMessage?: string;
  source?: "osm" | "manual" | "web-publica" | "demo";
  createdAt: string;
  updatedAt: string;
}

export interface InboundInquiry {
  id: string;
  businessName: string;
  contactName: string;
  phone: string;
  email?: string;
  rubro: RubroId;
  currentPainPoint: string;
  website?: string;
  leadId?: string;
  createdAt: string;
  status: "pendiente" | "atendido";
}

export interface DatabaseSchema {
  leads: Lead[];
  inquiries: InboundInquiry[];
}

export interface RubroDefinition {
  id: RubroId;
  name: string;
  shortName: string;
  description: string;
  iconName: string;
  accentColor: string;
  badgeClasses: string;
  osmFilters: string[];
  searchKeywords: string[];
  commonProblems: string[];
  recommendedWebTitle: string;
  recommendedSystemTitle: string;
  recommendedModules: string[];
  expectedImpact: string[];
  suggestedValueUsd: number;
  todayVsOptimized: {
    today: string[];
    optimized: string[];
  };
}
