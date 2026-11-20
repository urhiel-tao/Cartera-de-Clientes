"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  BookmarkPlus,
  CheckCircle2,
  CheckSquare,
  Flame,
  Globe,
  List,
  Loader2,
  Map as MapIcon,
  MapPin,
  Phone,
  PlusCircle,
  Search,
  Settings,
  Sparkles,
  Square,
  Trash2,
  Trophy,
  Users,
  Wand2,
} from "lucide-react";
import {
  getAllCountryNames,
  getDistrictsForLocality,
  getLocalitiesForProvince,
  getProvincesForCountry,
} from "@/lib/locations";
import { RUBRO_LIST, getRubroDefinition } from "@/lib/rubros";
import { Lead, LeadStatus, OpportunityLevel, RubroId } from "@/types";
import { BusinessMap } from "./BusinessMap";
import { LeadDetailDrawer } from "./LeadDetailDrawer";
import { PitchModal } from "./PitchModal";
import { RubroIcon } from "./RubroIcon";
import { SearchableSelect } from "./SearchableSelect";

interface PanelClientProps {
  initialLeads: Lead[];
}

type PanelTab = "buscar" | "cartera" | "analizar";
type QuickResultFilter =
  | "todos"
  | "sin_web"
  | "sin_sistema"
  | "con_contacto"
  | "guardados";

const STATUS_META: Record<
  LeadStatus,
  { label: string; badgeClass: string }
> = {
  nuevo: {
    label: "Por Contactar",
    badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
  },
  contactado: {
    label: "Contactado",
    badgeClass: "bg-sky-50 text-sky-700 border-sky-200",
  },
  interesado: {
    label: "Interesado",
    badgeClass: "bg-amber-50 text-amber-800 border-amber-200",
  },
  cerrado: {
    label: "Cliente Ganado",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  descartado: {
    label: "Descartado",
    badgeClass: "bg-zinc-100 text-zinc-500 border-zinc-200",
  },
};

const LEVEL_META: Record<
  OpportunityLevel,
  { label: string; badgeClass: string }
> = {
  critica: {
    label: "Le hace falta sistema",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
  },
  alta: {
    label: "Alta necesidad",
    badgeClass: "bg-orange-50 text-orange-700 border-orange-200",
  },
  media: {
    label: "Mejorable",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
  },
  baja: {
    label: "Base digital OK",
    badgeClass: "bg-slate-100 text-slate-600 border-slate-200",
  },
};

export function PanelClient({ initialLeads }: PanelClientProps) {
  const [activeTab, setActiveTab] = useState<PanelTab>("buscar");
  const [leads, setLeads] = useState<Lead[]>(initialLeads);

  // Filtros geográficos en cascada: País -> Provincia -> Localidad -> Distrito
  const [searchCountry, setSearchCountry] = useState("Argentina");
  const [searchProvince, setSearchProvince] = useState("Córdoba");
  const [searchLocality, setSearchLocality] = useState("Córdoba Capital");
  const [searchDistrict, setSearchDistrict] = useState(
    "Todos los distritos / barrios"
  );
  const [extraLocalities, setExtraLocalities] = useState<string[]>([]);
  const [extraDistricts, setExtraDistricts] = useState<string[]>([]);
  const [loadingLocalities, setLoadingLocalities] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const locationReqRef = useRef(0);

  const [searchRubro, setSearchRubro] = useState<RubroId | "todos">("todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Lead[]>([]);
  const [searchSource, setSearchSource] = useState<string | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  // Filtros rápidos sobre resultados
  const [quickFilter, setQuickFilter] = useState<QuickResultFilter>("todos");

  // Mapa, foco y selección
  const [viewMode, setViewMode] = useState<"ambos" | "mapa" | "lista">("ambos");
  const [mapCenter, setMapCenter] = useState<{ lat: number; lon: number } | null>(
    null
  );
  const [focusPoint, setFocusPoint] = useState<{
    lat: number;
    lon: number;
    seq: number;
  } | null>(null);
  const [selectedMapIds, setSelectedMapIds] = useState<string[]>([]);
  const [activeSearchLeadId, setActiveSearchLeadId] = useState<string | null>(
    initialLeads[0]?.id || null
  );
  const [activeCarteraLeadId, setActiveCarteraLeadId] = useState<string | null>(
    initialLeads[0]?.id || null
  );
  const [batchSaving, setBatchSaving] = useState(false);

  // Auditor Manual
  const [manualName, setManualName] = useState("");
  const [manualRubro, setManualRubro] = useState<RubroId>("comercios");
  const [manualCity, setManualCity] = useState("Córdoba");
  const [manualAddress, setManualAddress] = useState("");
  const [manualPhone, setManualPhone] = useState("");
  const [manualWebsite, setManualWebsite] = useState("");
  const [manualNotes, setManualNotes] = useState("");
  const [auditing, setAuditing] = useState(false);
  const [manualResult, setManualResult] = useState<Lead | null>(null);
  const [manualError, setManualError] = useState<string | null>(null);

  // Filtros de Cartera
  const [filterText, setFilterText] = useState("");
  const [filterRubro, setFilterRubro] = useState<string>("todos");
  const [filterStatus, setFilterStatus] = useState<string>("todos");
  const [pitchLead, setPitchLead] = useState<Lead | null>(null);

  // Listas geográficas derivadas para los desplegables completos
  const countryOptions = useMemo(() => getAllCountryNames(), []);

  const provinceOptions = useMemo(() => {
    const provs = getProvincesForCountry(searchCountry).map((p) => p.name);
    if (provs.length === 0 && searchProvince) return [searchProvince];
    return provs;
  }, [searchCountry, searchProvince]);

  const localityOptions = useMemo(() => {
    const base = getLocalitiesForProvince(searchCountry, searchProvince).map(
      (l) => l.name
    );
    const seen = new Set(base.map((b) => b.toLowerCase()));
    const merged = [...base];
    for (const item of extraLocalities) {
      if (!seen.has(item.toLowerCase())) {
        seen.add(item.toLowerCase());
        merged.push(item);
      }
    }
    if (searchLocality && !seen.has(searchLocality.toLowerCase())) {
      merged.push(searchLocality);
    }
    return merged;
  }, [searchCountry, searchProvince, extraLocalities, searchLocality]);

  const districtOptions = useMemo(() => {
    const base = getDistrictsForLocality(
      searchCountry,
      searchProvince,
      searchLocality
    );
    const seen = new Set(base.map((b) => b.toLowerCase()));
    const merged = [...base];
    for (const item of extraDistricts) {
      if (!seen.has(item.toLowerCase())) {
        seen.add(item.toLowerCase());
        merged.push(item);
      }
    }
    if (
      searchDistrict &&
      searchDistrict !== "Todos los distritos / barrios" &&
      !seen.has(searchDistrict.toLowerCase())
    ) {
      merged.push(searchDistrict);
    }
    return ["Todos los distritos / barrios", ...merged];
  }, [
    searchCountry,
    searchProvince,
    searchLocality,
    extraDistricts,
    searchDistrict,
  ]);

  const effectiveLocality = searchLocality.trim() || searchProvince;
  const effectiveDistrict =
    searchDistrict === "Todos los distritos / barrios" ? "" : searchDistrict.trim();

  async function enrichCascadeLocations(
    country: string,
    province: string,
    locality: string
  ) {
    const reqId = ++locationReqRef.current;
    setLoadingLocalities(true);
    setLoadingDistricts(true);
    try {
      const [locRes, distRes] = await Promise.all([
        fetch(
          `/api/locations?type=localities&country=${encodeURIComponent(
            country
          )}&province=${encodeURIComponent(province)}`
        ).then((r) => (r.ok ? r.json() : { items: [] })),
        fetch(
          `/api/locations?type=districts&country=${encodeURIComponent(
            country
          )}&province=${encodeURIComponent(
            province
          )}&locality=${encodeURIComponent(locality)}`
        ).then((r) => (r.ok ? r.json() : { items: [] })),
      ]);
      if (locationReqRef.current !== reqId) return;
      setExtraLocalities(Array.isArray(locRes.items) ? locRes.items : []);
      setExtraDistricts(Array.isArray(distRes.items) ? distRes.items : []);
    } catch {
      if (locationReqRef.current === reqId) {
        setExtraLocalities([]);
        setExtraDistricts([]);
      }
    } finally {
      if (locationReqRef.current === reqId) {
        setLoadingLocalities(false);
        setLoadingDistricts(false);
      }
    }
  }

  useEffect(() => {
    let cancelled = false;
    fetch(
      `/api/locations?type=districts&country=${encodeURIComponent(
        "Argentina"
      )}&province=${encodeURIComponent("Córdoba")}&locality=${encodeURIComponent(
        "Córdoba Capital"
      )}`
    )
      .then((r) => (r.ok ? r.json() : { items: [] }))
      .then((data: { items?: string[] }) => {
        if (!cancelled && Array.isArray(data.items)) {
          setExtraDistricts(data.items);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  function handleCountryChange(newCountry: string) {
    setSearchCountry(newCountry);
    const provs = getProvincesForCountry(newCountry);
    const firstProv = provs[0]?.name || "";
    setSearchProvince(firstProv);
    const locs = getLocalitiesForProvince(newCountry, firstProv);
    const firstLoc = locs[0]?.name || firstProv;
    setSearchLocality(firstLoc);
    setSearchDistrict("Todos los distritos / barrios");
    setExtraLocalities([]);
    setExtraDistricts([]);
    void enrichCascadeLocations(newCountry, firstProv, firstLoc);
  }

  function handleProvinceChange(newProv: string) {
    setSearchProvince(newProv);
    const locs = getLocalitiesForProvince(searchCountry, newProv);
    const firstLoc = locs[0]?.name || newProv;
    setSearchLocality(firstLoc);
    setSearchDistrict("Todos los distritos / barrios");
    setExtraLocalities([]);
    setExtraDistricts([]);
    void enrichCascadeLocations(searchCountry, newProv, firstLoc);
  }

  function handleLocalityChange(newLoc: string) {
    setSearchLocality(newLoc);
    setSearchDistrict("Todos los distritos / barrios");
    setExtraDistricts([]);
    void enrichCascadeLocations(searchCountry, searchProvince, newLoc);
  }

  const savedIds = useMemo(
    () => new Set(leads.map((l) => l.name.toLowerCase())),
    [leads]
  );

  const existingLeadsByName = useMemo(() => {
    const map = new Map<string, Lead>();
    for (const l of leads) {
      map.set(l.name.toLowerCase(), l);
    }
    return map;
  }, [leads]);

  const baseDisplayedLeads = useMemo(
    () => (searchResults.length > 0 ? searchResults : leads),
    [searchResults, leads]
  );

  const quickFilterCounts = useMemo(() => {
    let sinWeb = 0;
    let sinSistema = 0;
    let conContacto = 0;
    let guardados = 0;
    for (const item of baseDisplayedLeads) {
      if (!item.audit.hasWebsite || item.audit.isSocialOnly) sinWeb += 1;
      if (!item.audit.hasBookingOrCatalog) sinSistema += 1;
      if (item.phone || item.instagram || item.email) conContacto += 1;
      if (savedIds.has(item.name.toLowerCase())) guardados += 1;
    }
    return {
      todos: baseDisplayedLeads.length,
      sin_web: sinWeb,
      sin_sistema: sinSistema,
      con_contacto: conContacto,
      guardados,
    };
  }, [baseDisplayedLeads, savedIds]);

  const filteredSearchLeads = useMemo(() => {
    return baseDisplayedLeads.filter((item) => {
      if (quickFilter === "sin_web") {
        return !item.audit.hasWebsite || item.audit.isSocialOnly;
      }
      if (quickFilter === "sin_sistema") {
        return !item.audit.hasBookingOrCatalog;
      }
      if (quickFilter === "con_contacto") {
        return Boolean(item.phone || item.instagram || item.email);
      }
      if (quickFilter === "guardados") {
        return savedIds.has(item.name.toLowerCase());
      }
      return true;
    });
  }, [baseDisplayedLeads, quickFilter, savedIds]);

  const selectedSearchLead = useMemo(() => {
    const raw =
      filteredSearchLeads.find((l) => l.id === activeSearchLeadId) ||
      filteredSearchLeads[0] ||
      null;
    if (!raw) return null;
    return existingLeadsByName.get(raw.name.toLowerCase()) || raw;
  }, [filteredSearchLeads, activeSearchLeadId, existingLeadsByName]);

  const metrics = useMemo(() => {
    const active = leads.filter((l) => l.status !== "descartado");
    const highOpp = active.filter(
      (l) => l.opportunityLevel === "critica" || l.opportunityLevel === "alta"
    );
    const withContact = active.filter((l) => Boolean(l.phone || l.instagram));
    const closed = active.filter((l) => l.status === "cerrado");
    return {
      total: active.length,
      highOpp: highOpp.length,
      withContact: withContact.length,
      closed: closed.length,
    };
  }, [leads]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      todos: leads.length,
      nuevo: 0,
      contactado: 0,
      interesado: 0,
      cerrado: 0,
    };
    for (const l of leads) {
      if (l.status in counts) counts[l.status] += 1;
    }
    return counts;
  }, [leads]);

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      if (filterRubro !== "todos" && lead.rubro !== filterRubro) return false;
      if (filterStatus !== "todos" && lead.status !== filterStatus) return false;
      if (filterText.trim()) {
        const q = filterText.toLowerCase();
        const matches =
          lead.name.toLowerCase().includes(q) ||
          lead.city.toLowerCase().includes(q) ||
          (lead.district || "").toLowerCase().includes(q) ||
          lead.address.toLowerCase().includes(q) ||
          lead.notes.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [leads, filterRubro, filterStatus, filterText]);

  const selectedCarteraLead = useMemo(() => {
    return (
      filteredLeads.find((l) => l.id === activeCarteraLeadId) ||
      filteredLeads[0] ||
      null
    );
  }, [filteredLeads, activeCarteraLeadId]);

  async function runPlaceSearch(payload: {
    country: string;
    province: string;
    locality: string;
    district: string;
    rubro: RubroId | "todos";
    query: string;
    lat?: number;
    lon?: number;
  }) {
    setSearchError(null);
    setSearching(true);
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, limit: 35 }),
      });
      const data = (await res.json()) as {
        results?: Lead[];
        dataSource?: string;
        center?: { lat: number; lon: number };
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || "Error al buscar comercios.");
      }
      const nextResults = data.results || [];
      setSearchResults(nextResults);
      setSearchSource(data.dataSource || null);
      if (data.center) setMapCenter(data.center);
      setQuickFilter("todos");
      setSelectedMapIds([]);
      setActiveSearchLeadId(nextResults[0]?.id || null);
    } catch (err) {
      setSearchError(
        err instanceof Error ? err.message : "No se pudo realizar la búsqueda."
      );
    } finally {
      setSearching(false);
    }
  }

  async function handleSearchPlaces(e: React.FormEvent) {
    e.preventDefault();
    await runPlaceSearch({
      country: searchCountry,
      province: searchProvince,
      locality: effectiveLocality,
      district: effectiveDistrict,
      rubro: searchRubro,
      query: searchQuery,
    });
  }

  async function handleSearchMapArea(lat: number, lon: number) {
    await runPlaceSearch({
      country: searchCountry,
      province: searchProvince,
      locality: effectiveLocality,
      district: effectiveDistrict,
      rubro: searchRubro,
      query: searchQuery,
      lat,
      lon,
    });
  }

  function handleToggleCheckLead(leadId: string) {
    setSelectedMapIds((prev) =>
      prev.includes(leadId)
        ? prev.filter((id) => id !== leadId)
        : [...prev, leadId]
    );
  }

  async function handleBatchSaveLeads() {
    const toSave = filteredSearchLeads.filter(
      (l) =>
        selectedMapIds.includes(l.id) && !savedIds.has(l.name.toLowerCase())
    );
    if (toSave.length === 0) {
      setSelectedMapIds([]);
      return;
    }
    setBatchSaving(true);
    try {
      const savedResponses = await Promise.all(
        toSave.map(async (lead) => {
          const res = await fetch("/api/leads", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(lead),
          });
          if (!res.ok) return null;
          const data = (await res.json()) as { lead?: Lead };
          return data.lead || null;
        })
      );
      const validSaved = savedResponses.filter((l): l is Lead => l !== null);
      if (validSaved.length > 0) {
        setLeads((prev) => {
          const existingIds = new Set(prev.map((p) => p.id));
          const fresh = validSaved.filter((v) => !existingIds.has(v.id));
          return [...fresh, ...prev];
        });
      }
      setSelectedMapIds([]);
    } finally {
      setBatchSaving(false);
    }
  }

  async function handleSaveLeadToCrm(lead: Lead): Promise<Lead | null> {
    setSavingId(lead.id);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lead),
      });
      const data = (await res.json()) as { lead?: Lead };
      if (res.ok && data.lead) {
        const saved = data.lead;
        setLeads((prev) => {
          const exists = prev.some((p) => p.id === saved.id);
          if (exists) {
            return prev.map((p) => (p.id === saved.id ? saved : p));
          }
          return [saved, ...prev];
        });
        return saved;
      }
      return null;
    } finally {
      setSavingId(null);
    }
  }

  async function handleUpdateLead(id: string, patch: Partial<Lead>) {
    const res = await fetch(`/api/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    const data = (await res.json()) as { lead?: Lead };
    if (res.ok && data.lead) {
      const updated = data.lead;
      setLeads((prev) => prev.map((l) => (l.id === id ? updated : l)));
      setSearchResults((prev) =>
        prev.map((l) => (l.id === id ? updated : l))
      );
    }
  }

  function handleReplaceEvaluatedLead(updated: Lead) {
    setSearchResults((prev) =>
      prev.map((l) => (l.id === updated.id ? updated : l))
    );
    setLeads((prev) =>
      prev.map((l) => (l.id === updated.id ? updated : l))
    );
    if (manualResult && manualResult.id === updated.id) {
      setManualResult(updated);
    }
  }

  function handleFocusLeadOnMap(lead: Lead) {
    if (typeof lead.lat !== "number" || typeof lead.lon !== "number") return;
    setActiveSearchLeadId(lead.id);
    if (viewMode === "lista") setViewMode("ambos");
    setFocusPoint({
      lat: lead.lat,
      lon: lead.lon,
      seq: Date.now(),
    });
  }

  async function handleManualAudit(saveToCrm: boolean) {
    if (!manualName.trim()) {
      setManualError("Ingresa el nombre del local o negocio.");
      return;
    }
    setManualError(null);
    setAuditing(true);
    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: manualName,
          rubro: manualRubro,
          city: manualCity,
          address: manualAddress,
          phone: manualPhone,
          website: manualWebsite,
          notes: manualNotes,
          saveToCrm,
        }),
      });
      const data = (await res.json()) as {
        lead?: Lead;
        saved?: boolean;
        error?: string;
      };
      if (!res.ok || !data.lead) {
        throw new Error(data.error || "No se pudo analizar el local.");
      }
      setManualResult(data.lead);
      if (data.saved) {
        setLeads((prev) => [data.lead!, ...prev]);
      }
    } catch (err) {
      setManualError(
        err instanceof Error ? err.message : "Error al auditar el local."
      );
    } finally {
      setAuditing(false);
    }
  }

  async function handleDeleteLead(id: string) {
    const res = await fetch(`/api/leads/${id}`, { method: "DELETE" });
    if (res.ok) {
      setLeads((prev) => prev.filter((l) => l.id !== id));
    }
  }

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6">
      {/* Cabecera intuitiva + resumen */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Encuentra Comercios que Necesitan un Sistema o Web
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Elige <strong>País, Provincia, Localidad y Distrito</strong>, trae
            todos los comercios de la zona y toca cualquiera para ver su{" "}
            <strong>Diagnóstico, Ubicación y Contacto</strong>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-700">
            <Users className="h-3.5 w-3.5 text-indigo-600" />
            {metrics.total} guardados
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-700">
            <Flame className="h-3.5 w-3.5 text-rose-500" />
            {metrics.highOpp} necesitan sistema
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 font-bold text-emerald-800">
            <Trophy className="h-3.5 w-3.5 text-emerald-600" />
            {metrics.closed} ganados
          </span>
        </div>
      </div>

      {/* Menú principal de 3 pasos */}
      <nav
        aria-label="Opciones principales"
        className="mt-5 grid gap-3 sm:grid-cols-3"
      >
        <button
          type="button"
          onClick={() => setActiveTab("buscar")}
          className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition cursor-pointer ${
            activeTab === "buscar"
              ? "border-indigo-600 bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
              : "border-slate-200 bg-white text-slate-800 hover:border-indigo-300"
          }`}
        >
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
              activeTab === "buscar"
                ? "bg-white/20 text-white"
                : "bg-indigo-50 text-indigo-600"
            }`}
          >
            <Search className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-sm font-bold">
              1. Buscar Comercios por Zona
            </span>
            <span
              className={`block text-xs ${
                activeTab === "buscar" ? "text-indigo-100" : "text-slate-500"
              }`}
            >
              País, provincia, localidad, distrito y rubro
            </span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("cartera")}
          className={`flex items-center justify-between gap-3 rounded-2xl border p-4 text-left transition cursor-pointer ${
            activeTab === "cartera"
              ? "border-indigo-600 bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
              : "border-slate-200 bg-white text-slate-800 hover:border-indigo-300"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                activeTab === "cartera"
                  ? "bg-white/20 text-white"
                  : "bg-indigo-50 text-indigo-600"
              }`}
            >
              <Users className="h-5 w-5" />
            </div>
            <div>
              <span className="block text-sm font-bold">
                2. Mi Cartera ({leads.length})
              </span>
              <span
                className={`block text-xs ${
                  activeTab === "cartera" ? "text-indigo-100" : "text-slate-500"
                }`}
              >
                Negocios guardados, seguimiento y WhatsApp
              </span>
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("analizar")}
          className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition cursor-pointer ${
            activeTab === "analizar"
              ? "border-indigo-600 bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
              : "border-slate-200 bg-white text-slate-800 hover:border-indigo-300"
          }`}
        >
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
              activeTab === "analizar"
                ? "bg-white/20 text-white"
                : "bg-indigo-50 text-indigo-600"
            }`}
          >
            <PlusCircle className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-sm font-bold">
              3. Cargar Local Manual
            </span>
            <span
              className={`block text-xs ${
                activeTab === "analizar" ? "text-indigo-100" : "text-slate-500"
              }`}
            >
              Analiza un comercio o URL puntual
            </span>
          </div>
        </button>
      </nav>

      {/* PESTAÑA 1: BUSCADOR POR PAÍS / PROVINCIA / LOCALIDAD / DISTRITO */}
      {activeTab === "buscar" && (
        <div className="mt-6 space-y-5">
          {/* Paso 1: Formulario en cascada con desplegables completos */}
          <section className="relative z-20 rounded-3xl border border-slate-200 bg-white p-5 shadow-xs">
            <form onSubmit={handleSearchPlaces} className="space-y-4">
              {/* Fila 1: Ubicación jerárquica */}
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-indigo-600">
                  Paso 1 · ¿En qué zona quieres buscar comercios?
                </p>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <SearchableSelect
                    label="País"
                    value={searchCountry}
                    options={countryOptions}
                    searchPlaceholder="Buscar país"
                    countLabel={`${countryOptions.length} países`}
                    allowCustom={false}
                    onChange={handleCountryChange}
                  />

                  <SearchableSelect
                    label="Provincia / Estado"
                    value={searchProvince}
                    options={provinceOptions}
                    searchPlaceholder="Buscar provincia o estado"
                    countLabel={`${provinceOptions.length} prov./est.`}
                    allowCustom={true}
                    onChange={handleProvinceChange}
                  />

                  <SearchableSelect
                    label="Localidad / Ciudad"
                    value={searchLocality}
                    options={localityOptions}
                    searchPlaceholder="Buscar localidad"
                    countLabel={`${localityOptions.length} localidades`}
                    loading={loadingLocalities}
                    allowCustom={true}
                    onChange={handleLocalityChange}
                  />

                  <SearchableSelect
                    label="Distrito / Barrio"
                    value={searchDistrict}
                    options={districtOptions}
                    searchPlaceholder="Buscar barrio o distrito"
                    countLabel={`${Math.max(districtOptions.length - 1, 0)} barrios`}
                    loading={loadingDistricts}
                    allowCustom={true}
                    onChange={setSearchDistrict}
                  />
                </div>

                <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-xs text-slate-600">
                  <MapPin className="h-3.5 w-3.5 text-rose-500" />
                  <span className="font-semibold text-slate-700">
                    Zona seleccionada:
                  </span>
                  <span className="rounded-lg bg-indigo-50 px-2.5 py-0.5 font-semibold text-indigo-700">
                    {effectiveDistrict
                      ? `${effectiveDistrict} → `
                      : "Toda la localidad → "}
                    {effectiveLocality} → {searchProvince} → {searchCountry}
                  </span>
                </div>
              </div>

              {/* Fila 2: Rubro + Palabra clave + Botón */}
              <div className="border-t border-slate-100 pt-3">
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-indigo-600">
                  Paso 2 · ¿Qué tipo de comercios buscas?
                </p>
                <div className="grid items-end gap-3 md:grid-cols-12">
                  <div className="md:col-span-5">
                    <label className="block text-xs font-semibold text-slate-700">
                      Rubro o Búsqueda General
                    </label>
                    <select
                      value={searchRubro}
                      onChange={(e) =>
                        setSearchRubro(e.target.value as RubroId | "todos")
                      }
                      className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 outline-none focus:border-indigo-500"
                    >
                      <option value="todos">
                        Todos los comercios (Búsqueda General)
                      </option>
                      {RUBRO_LIST.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-xs font-semibold text-slate-700">
                      Palabra clave (opcional)
                    </label>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Ej. ferretería, taller, café..."
                      className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="md:col-span-4">
                    <button
                      type="submit"
                      disabled={searching}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-60 cursor-pointer"
                    >
                      {searching ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Buscando comercios en la zona...</span>
                        </>
                      ) : (
                        <>
                          <Search className="h-4 w-4" />
                          <span>Buscar Comercios que Necesitan Sistema</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </form>

            {searchError && (
              <p className="mt-3 rounded-xl bg-rose-50 p-3 text-xs font-medium text-rose-700">
                {searchError}
              </p>
            )}
          </section>

          {/* Barra de Filtros Rápidos sobre los resultados + Modo de vista */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xs">
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                {
                  id: "todos" as QuickResultFilter,
                  label: `Todos (${quickFilterCounts.todos})`,
                },
                {
                  id: "sin_web" as QuickResultFilter,
                  label: `Sin Web (${quickFilterCounts.sin_web})`,
                },
                {
                  id: "sin_sistema" as QuickResultFilter,
                  label: `Sin Sistema (${quickFilterCounts.sin_sistema})`,
                },
                {
                  id: "con_contacto" as QuickResultFilter,
                  label: `Con Contacto (${quickFilterCounts.con_contacto})`,
                },
                {
                  id: "guardados" as QuickResultFilter,
                  label: `Guardados (${quickFilterCounts.guardados})`,
                },
              ].map((pill) => (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => setQuickFilter(pill.id)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                    quickFilter === pill.id
                      ? "bg-indigo-600 text-white shadow-2xs"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200/70"
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              {searchSource && (
                <span className="hidden rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600 sm:inline-block">
                  {searchSource === "openstreetmap"
                    ? "Fuente: OpenStreetMap en vivo"
                    : searchSource === "mixed"
                    ? "Fuente: OpenStreetMap + zona local"
                    : "Fuente: Cartera de zona"}
                </span>
              )}
              <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
                <button
                  type="button"
                  onClick={() => setViewMode("ambos")}
                  className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold cursor-pointer ${
                    viewMode === "ambos"
                      ? "bg-white text-indigo-700 shadow-2xs"
                      : "text-slate-600"
                  }`}
                >
                  <MapIcon className="h-3.5 w-3.5" />
                  <span>Mapa + Lista</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("mapa")}
                  className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold cursor-pointer ${
                    viewMode === "mapa"
                      ? "bg-white text-indigo-700 shadow-2xs"
                      : "text-slate-600"
                  }`}
                >
                  <MapPin className="h-3.5 w-3.5" />
                  <span>Mapa</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("lista")}
                  className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold cursor-pointer ${
                    viewMode === "lista"
                      ? "bg-white text-indigo-700 shadow-2xs"
                      : "text-slate-600"
                  }`}
                >
                  <List className="h-3.5 w-3.5" />
                  <span>Lista</span>
                </button>
              </div>
            </div>
          </div>

          {/* Vista dividida: Izquierda (Mapa + Comercios) | Derecha (Ficha 3 pestañas) */}
          <div className="grid items-start gap-6 lg:grid-cols-12">
            {/* Columna izquierda */}
            <div className="space-y-4 lg:col-span-7">
              {(viewMode === "ambos" || viewMode === "mapa") && (
                <BusinessMap
                  leads={filteredSearchLeads}
                  center={mapCenter}
                  focusPoint={focusPoint}
                  savedNames={savedIds}
                  existingLeadsByName={existingLeadsByName}
                  selectedIds={selectedMapIds}
                  activeLeadId={selectedSearchLead?.id || null}
                  onSelectActiveLead={(lead) => setActiveSearchLeadId(lead.id)}
                  onToggleCheckLead={handleToggleCheckLead}
                  onClearSelection={() => setSelectedMapIds([])}
                  onSaveSingle={handleSaveLeadToCrm}
                  onSaveSelected={handleBatchSaveLeads}
                  onSearchArea={handleSearchMapArea}
                  onOpenPitch={(lead) => setPitchLead(lead)}
                  searchingArea={searching}
                  savingId={savingId}
                  batchSaving={batchSaving}
                  hideDetailCard={true}
                />
              )}

              {(viewMode === "ambos" || viewMode === "lista") && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>
                      <strong>{filteredSearchLeads.length}</strong> comercios{" "}
                      {searchResults.length > 0
                        ? `en ${effectiveDistrict ? `${effectiveDistrict}, ` : ""}${effectiveLocality}`
                        : "(cartera inicial — presiona Buscar arriba para traer comercios de otra zona)"}
                    </span>
                    <span className="hidden sm:inline font-medium text-indigo-600">
                      Toca cualquier comercio →
                    </span>
                  </div>

                  {filteredSearchLeads.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-600">
                      No hay comercios que coincidan con el filtro rápido{" "}
                      <strong>{quickFilter.replace("_", " ")}</strong>. Prueba
                      tocar <strong>Todos</strong> arriba.
                    </div>
                  ) : (
                    filteredSearchLeads.map((item) => {
                      const rDef = getRubroDefinition(item.rubro);
                      const lvl = LEVEL_META[item.opportunityLevel];
                      const isSaved = savedIds.has(item.name.toLowerCase());
                      const isSelectedForBatch = selectedMapIds.includes(item.id);
                      const isActive = selectedSearchLead?.id === item.id;

                      return (
                        <div
                          key={item.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => setActiveSearchLeadId(item.id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              setActiveSearchLeadId(item.id);
                            }
                          }}
                          className={`rounded-2xl border bg-white p-4 text-left transition cursor-pointer ${
                            isActive
                              ? "border-indigo-600 ring-2 ring-indigo-600/20 shadow-sm"
                              : "border-slate-200 hover:border-indigo-300"
                          }`}
                        >
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div className="space-y-1">
                              <div className="flex flex-wrap items-center gap-1.5">
                                {!isSaved && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleToggleCheckLead(item.id);
                                    }}
                                    className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold cursor-pointer ${
                                      isSelectedForBatch
                                        ? "border-indigo-600 bg-indigo-600 text-white"
                                        : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
                                    }`}
                                  >
                                    {isSelectedForBatch ? (
                                      <CheckSquare className="h-3 w-3" />
                                    ) : (
                                      <Square className="h-3 w-3" />
                                    )}
                                    <span>
                                      {isSelectedForBatch ? "Marcado" : "Marcar"}
                                    </span>
                                  </button>
                                )}
                                <span
                                  className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${rDef.badgeClasses}`}
                                >
                                  <RubroIcon
                                    iconName={rDef.iconName}
                                    className="h-3 w-3"
                                  />
                                  <span>{item.subRubro || rDef.shortName}</span>
                                </span>
                                <span
                                  className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${lvl.badgeClass}`}
                                >
                                  {item.opportunityScore}/100
                                </span>
                                {isSaved && (
                                  <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                                    <CheckCircle2 className="h-3 w-3" />
                                    Guardado
                                  </span>
                                )}
                              </div>

                              <h3 className="text-base font-bold text-slate-900">
                                {item.name}
                              </h3>
                              <p className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                                <span className="inline-flex items-center gap-1">
                                  <MapPin className="h-3.5 w-3.5 text-rose-500" />
                                  {item.address}
                                  {item.district && !item.address.includes(item.district)
                                    ? `, ${item.district}`
                                    : ""}
                                  , {item.city}
                                </span>
                              </p>
                            </div>

                            <div className="flex flex-col items-end gap-1">
                              {item.phone ? (
                                <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-800">
                                  <Phone className="h-3 w-3" />
                                  {item.phone}
                                </span>
                              ) : item.instagram || item.website ? (
                                <span className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-700">
                                  <Globe className="h-3 w-3" />
                                  {item.instagram || "Tiene web"}
                                </span>
                              ) : (
                                <span className="rounded-lg bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-800">
                                  Sin teléfono
                                </span>
                              )}
                              <span className="text-[11px] font-bold text-indigo-600">
                                {isActive ? "Viendo ficha →" : "Ver ficha →"}
                              </span>
                            </div>
                          </div>

                          <p className="mt-2 flex items-start gap-1.5 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-700">
                            <Settings className="mt-0.5 h-3.5 w-3.5 shrink-0 text-indigo-600" />
                            <span>
                              <strong>Sistema que necesita:</strong>{" "}
                              {item.specificSystemNeeded || item.recommendedSolution}
                            </span>
                          </p>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {/* Columna derecha: Ficha con 3 pestañas simples */}
            <div className="lg:col-span-5 lg:sticky lg:top-20">
              {selectedSearchLead ? (
                <LeadDetailDrawer
                  key={selectedSearchLead.id}
                  lead={selectedSearchLead}
                  isSaved={savedIds.has(selectedSearchLead.name.toLowerCase())}
                  saving={savingId === selectedSearchLead.id}
                  onSaveLead={handleSaveLeadToCrm}
                  onUpdateLead={handleUpdateLead}
                  onReplaceEvaluatedLead={handleReplaceEvaluatedLead}
                  onFocusOnMap={handleFocusLeadOnMap}
                />
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
                  <Search className="mx-auto h-8 w-8 text-slate-400" />
                  <p className="mt-3 text-sm font-bold text-slate-800">
                    Selecciona un comercio de la lista o del mapa
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Aquí verás sus pestañas de Diagnóstico, Ubicación y Contacto.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PESTAÑA 2: MI CARTERA GUARDADA */}
      {activeTab === "cartera" && (
        <div className="mt-6 space-y-5">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  {[
                    { key: "todos", label: "Todos" },
                    { key: "nuevo", label: "Por Contactar" },
                    { key: "contactado", label: "Contactados" },
                    { key: "interesado", label: "Interesados" },
                    { key: "cerrado", label: "Ganados" },
                  ].map((pill) => {
                    const active = filterStatus === pill.key;
                    const count = statusCounts[pill.key] ?? 0;
                    return (
                      <button
                        key={pill.key}
                        type="button"
                        onClick={() => setFilterStatus(pill.key)}
                        className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
                          active
                            ? "bg-indigo-600 text-white shadow-2xs"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200/70"
                        }`}
                      >
                        <span>{pill.label}</span>
                        <span
                          className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                            active
                              ? "bg-white/25 text-white"
                              : "bg-white text-slate-600"
                          }`}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <input
                    type="text"
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                    placeholder="Buscar por nombre, localidad, distrito o nota..."
                    className="min-w-[220px] flex-1 rounded-xl border border-slate-300 px-3.5 py-2 text-sm outline-none focus:border-indigo-500"
                  />
                  <select
                    value={filterRubro}
                    onChange={(e) => setFilterRubro(e.target.value)}
                    className="rounded-xl border border-slate-300 px-3.5 py-2 text-sm outline-none focus:border-indigo-500"
                  >
                    <option value="todos">Todos los rubros</option>
                    {RUBRO_LIST.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.shortName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {filteredLeads.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
                  <p className="text-base font-bold text-slate-800">
                    No hay negocios guardados con este filtro
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Cambia el filtro o busca comercios en la pestaña{" "}
                    <strong>1. Buscar Comercios por Zona</strong>.
                  </p>
                </div>
              ) : (
                <div className="grid items-start gap-6 lg:grid-cols-12">
                  <div className="space-y-3 lg:col-span-7">
                    {filteredLeads.map((lead) => {
                      const rDef = getRubroDefinition(lead.rubro);
                      const statusMeta = STATUS_META[lead.status];
                      const isActive = selectedCarteraLead?.id === lead.id;

                      return (
                        <div
                          key={lead.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => setActiveCarteraLeadId(lead.id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              setActiveCarteraLeadId(lead.id);
                            }
                          }}
                          className={`rounded-2xl border bg-white p-4 text-left transition cursor-pointer ${
                            isActive
                              ? "border-indigo-600 ring-2 ring-indigo-600/20 shadow-sm"
                              : "border-slate-200 hover:border-indigo-300"
                          }`}
                        >
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div className="space-y-1">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span
                                  className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${rDef.badgeClasses}`}
                                >
                                  <RubroIcon
                                    iconName={rDef.iconName}
                                    className="h-3 w-3"
                                  />
                                  <span>{lead.subRubro || rDef.shortName}</span>
                                </span>
                                <span
                                  className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${statusMeta.badgeClass}`}
                                >
                                  {statusMeta.label}
                                </span>
                                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                                  Score {lead.opportunityScore}/100
                                </span>
                              </div>
                              <h3 className="text-base font-bold text-slate-900">
                                {lead.name}
                              </h3>
                              <p className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                                <span className="inline-flex items-center gap-1">
                                  <MapPin className="h-3.5 w-3.5 text-rose-500" />
                                  {lead.address}, {lead.city}
                                </span>
                                {lead.phone && (
                                  <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                                    <Phone className="h-3.5 w-3.5" />
                                    {lead.phone}
                                  </span>
                                )}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteLead(lead.id);
                              }}
                              aria-label={`Eliminar ${lead.name}`}
                              className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>

                          {lead.clientMessage && (
                            <p className="mt-2 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs text-emerald-900">
                              <strong>Consulta del dueño:</strong>{" "}
                              {lead.clientMessage}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="lg:col-span-5 lg:sticky lg:top-20">
                    {selectedCarteraLead && (
                      <LeadDetailDrawer
                        key={selectedCarteraLead.id}
                        lead={selectedCarteraLead}
                        isSaved={true}
                        saving={savingId === selectedCarteraLead.id}
                        onSaveLead={handleSaveLeadToCrm}
                        onUpdateLead={handleUpdateLead}
                        onReplaceEvaluatedLead={handleReplaceEvaluatedLead}
                      />
                    )}
                  </div>
                </div>
              )}
        </div>
      )}

      {/* PESTAÑA 3: CARGAR LOCAL MANUAL */}
      {activeTab === "analizar" && (
        <div className="mt-6 grid items-start gap-6 lg:grid-cols-12">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs lg:col-span-6">
            <div className="flex items-center gap-2 text-emerald-600">
              <Wand2 className="h-5 w-5" />
              <h2 className="text-lg font-bold text-slate-900">
                Cargar o Auditar un Comercio Puntual
              </h2>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Ingresa un local que viste en la calle, Google Maps o Instagram y
              genera su diagnóstico al instante.
            </p>

            <div className="mt-5 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Nombre del local *
                </label>
                <input
                  type="text"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  placeholder="Ej. Ferretería San Jorge"
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Rubro
                  </label>
                  <select
                    value={manualRubro}
                    onChange={(e) => setManualRubro(e.target.value as RubroId)}
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-indigo-500"
                  >
                    {RUBRO_LIST.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Localidad / Ciudad
                  </label>
                  <input
                    type="text"
                    value={manualCity}
                    onChange={(e) => setManualCity(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Dirección (opcional)
                  </label>
                  <input
                    type="text"
                    value={manualAddress}
                    onChange={(e) => setManualAddress(e.target.value)}
                    placeholder="Av. Colón 2400"
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Teléfono / WhatsApp
                  </label>
                  <input
                    type="text"
                    value={manualPhone}
                    onChange={(e) => setManualPhone(e.target.value)}
                    placeholder="+54 9 ..."
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Sitio Web o Instagram (dejar vacío si no tiene web)
                </label>
                <input
                  type="text"
                  value={manualWebsite}
                  onChange={(e) => setManualWebsite(e.target.value)}
                  placeholder="https://... o instagram.com/..."
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Notas iniciales
                </label>
                <input
                  type="text"
                  value={manualNotes}
                  onChange={(e) => setManualNotes(e.target.value)}
                  placeholder="Ej. Tiene mucho público pero anota turnos en cuaderno"
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-indigo-500"
                />
              </div>

              {manualError && (
                <p className="rounded-xl bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">
                  {manualError}
                </p>
              )}

              <div className="grid gap-2.5 pt-1 sm:grid-cols-2">
                <button
                  type="button"
                  disabled={auditing}
                  onClick={() => handleManualAudit(false)}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-60 cursor-pointer"
                >
                  {auditing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  <span>Solo Diagnosticar</span>
                </button>

                <button
                  type="button"
                  disabled={auditing}
                  onClick={() => handleManualAudit(true)}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-60 cursor-pointer"
                >
                  {auditing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <BookmarkPlus className="h-4 w-4" />
                  )}
                  <span>Diagnosticar y Guardar</span>
                </button>
              </div>
            </div>
          </section>

          <section className="lg:col-span-6">
            {manualResult ? (
              <LeadDetailDrawer
                key={manualResult.id}
                lead={
                  existingLeadsByName.get(manualResult.name.toLowerCase()) ||
                  manualResult
                }
                isSaved={savedIds.has(manualResult.name.toLowerCase())}
                saving={savingId === manualResult.id}
                onSaveLead={handleSaveLeadToCrm}
                onUpdateLead={handleUpdateLead}
                onReplaceEvaluatedLead={handleReplaceEvaluatedLead}
              />
            ) : (
              <div className="flex min-h-[340px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center">
                <Wand2 className="h-10 w-10 text-indigo-400" />
                <h3 className="mt-3 text-base font-bold text-slate-900">
                  Aquí aparecerá la ficha de Diagnóstico, Ubicación y Contacto
                </h3>
                <p className="mt-1 max-w-sm text-xs text-slate-500">
                  Completa el nombre del negocio a la izquierda y presiona{" "}
                  <strong>Solo Diagnosticar</strong> o{" "}
                  <strong>Diagnosticar y Guardar</strong>.
                </p>
              </div>
            )}
          </section>
        </div>
      )}

      {pitchLead && (
        <PitchModal
          lead={pitchLead}
          onClose={() => setPitchLead(null)}
          onMarkContacted={(leadId) =>
            handleUpdateLead(leadId, { status: "contactado" })
          }
        />
      )}
    </main>
  );
}
