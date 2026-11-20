"use client";

import { useState } from "react";
import {
  AlertCircle,
  AtSign,
  BookmarkPlus,
  Check,
  CheckCircle2,
  Copy,
  Crosshair,
  ExternalLink,
  Globe,
  Loader2,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  RefreshCw,
  Search,
  Sparkles,
  Star,
  Wrench,
  XCircle,
} from "lucide-react";
import { generatePitchMessages } from "@/lib/auditor";
import { getRubroDefinition } from "@/lib/rubros";
import { Lead, LeadStatus } from "@/types";
import { RubroIcon } from "./RubroIcon";

interface LeadDetailDrawerProps {
  lead: Lead;
  isSaved: boolean;
  saving?: boolean;
  onSaveLead: (lead: Lead) => Promise<Lead | null>;
  onUpdateLead: (id: string, patch: Partial<Lead>) => Promise<void>;
  onReplaceEvaluatedLead: (updated: Lead) => void;
  onFocusOnMap?: (lead: Lead) => void;
}

type DrawerTab = "diagnostico" | "ubicacion" | "contacto";

const STATUS_OPTIONS: Array<{ value: LeadStatus; label: string }> = [
  { value: "nuevo", label: "Por Contactar" },
  { value: "contactado", label: "Contactado" },
  { value: "interesado", label: "Interesado" },
  { value: "cerrado", label: "Cliente Ganado" },
  { value: "descartado", label: "Descartado" },
];

export function LeadDetailDrawer({
  lead,
  isSaved,
  saving = false,
  onSaveLead,
  onUpdateLead,
  onReplaceEvaluatedLead,
  onFocusOnMap,
}: LeadDetailDrawerProps) {
  const rubroDef = getRubroDefinition(lead.rubro);
  const templates = generatePitchMessages(lead);

  const [drawerTab, setDrawerTab] = useState<DrawerTab>("diagnostico");
  const [websiteDraft, setWebsiteDraft] = useState(lead.website || "");
  const [phoneDraft, setPhoneDraft] = useState(lead.phone || "");
  const [notesDraft, setNotesDraft] = useState(lead.notes || "");
  const [auditingUrl, setAuditingUrl] = useState(false);
  const [savingContact, setSavingContact] = useState(false);
  const [contactSavedFeedback, setContactSavedFeedback] = useState(false);

  const [selectedTplId, setSelectedTplId] = useState(templates[0].id);
  const [copiedMsg, setCopiedMsg] = useState(false);

  const activeTemplate =
    templates.find((t) => t.id === selectedTplId) || templates[0];

  const hasAnyContact = Boolean(
    lead.phone || lead.instagram || lead.email || lead.website
  );

  const googleMapsUrl =
    typeof lead.lat === "number" && typeof lead.lon === "number"
      ? `https://www.google.com/maps/search/?api=1&query=${lead.lat},${lead.lon}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          `${lead.name} ${lead.address} ${lead.city}`
        )}`;

  const googlePhoneSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(
    `${lead.name} ${lead.city} telefono whatsapp`
  )}`;

  const cleanPhone = (phoneDraft || lead.phone || "").replace(/[^\d]/g, "");
  const whatsappUrl = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(activeTemplate.message)}`
    : `https://wa.me/?text=${encodeURIComponent(activeTemplate.message)}`;

  async function handleReAuditWebsite() {
    setAuditingUrl(true);
    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: lead.name,
          rubro: lead.rubro,
          city: lead.city,
          address: lead.address,
          phone: phoneDraft || lead.phone,
          website: websiteDraft,
          instagram: lead.instagram,
          rating: lead.rating,
          reviewCount: lead.reviewCount,
          notes: notesDraft || lead.notes,
          saveToCrm: false,
        }),
      });
      const data = (await res.json()) as { lead?: Lead };
      if (res.ok && data.lead) {
        const merged: Lead = {
          ...data.lead,
          id: lead.id,
          country: lead.country,
          province: lead.province,
          district: lead.district,
          subRubro: lead.subRubro,
          specificSystemNeeded: lead.specificSystemNeeded,
          lat: lead.lat,
          lon: lead.lon,
          email: lead.email,
          openingHours: lead.openingHours,
          status: lead.status,
          source: lead.source,
        };
        onReplaceEvaluatedLead(merged);
        if (isSaved) {
          await onSaveLead(merged);
        }
      }
    } finally {
      setAuditingUrl(false);
    }
  }

  async function handleSaveContactDetails() {
    setSavingContact(true);
    try {
      if (isSaved) {
        await onUpdateLead(lead.id, {
          phone: phoneDraft.trim() || undefined,
          notes: notesDraft,
        });
      } else {
        await onSaveLead({
          ...lead,
          phone: phoneDraft.trim() || undefined,
          notes: notesDraft,
        });
      }
      setContactSavedFeedback(true);
      setTimeout(() => setContactSavedFeedback(false), 2000);
    } finally {
      setSavingContact(false);
    }
  }

  async function handleCopyMessage() {
    try {
      await navigator.clipboard.writeText(activeTemplate.message);
      setCopiedMsg(true);
      setTimeout(() => setCopiedMsg(false), 2000);
    } catch {
      // ignore
    }
  }

  const scoreBadgeClass =
    lead.opportunityScore >= 80
      ? "bg-rose-600 text-white"
      : lead.opportunityScore >= 60
      ? "bg-orange-600 text-white"
      : "bg-amber-500 text-white";

  return (
    <aside className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      {/* Cabecera siempre visible */}
      <div className="border-b border-slate-100 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${rubroDef.badgeClasses}`}
          >
            <RubroIcon iconName={rubroDef.iconName} className="h-3 w-3" />
            <span>{lead.subRubro || rubroDef.shortName}</span>
          </span>
          <span
            className={`rounded-full px-3 py-0.5 text-xs font-extrabold ${scoreBadgeClass}`}
          >
            Necesidad: {lead.opportunityScore}/100
          </span>
        </div>

        <h2 className="mt-2.5 text-xl font-extrabold text-slate-900 leading-tight">
          {lead.name}
        </h2>

        <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-rose-500" />
          <span>
            {lead.address}, {lead.city}
          </span>
        </p>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          {lead.rating ? (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              {lead.rating} ({lead.reviewCount || 0} reseñas)
            </span>
          ) : (
            <span className="text-xs font-medium text-slate-500">
              Proyecto est.:{" "}
              <strong className="text-indigo-600">${lead.estimatedValue} USD</strong>
            </span>
          )}

          {isSaved ? (
            <select
              value={lead.status}
              onChange={(e) =>
                onUpdateLead(lead.id, { status: e.target.value as LeadStatus })
              }
              className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800 outline-none cursor-pointer"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  En cartera: {opt.label}
                </option>
              ))}
            </select>
          ) : (
            <button
              type="button"
              disabled={saving}
              onClick={() => onSaveLead(lead)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-60 cursor-pointer"
            >
              {saving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <BookmarkPlus className="h-3.5 w-3.5" />
              )}
              <span>Guardar en Cartera</span>
            </button>
          )}
        </div>
      </div>

      {/* 3 Pestañas Simples: Diagnóstico | Ubicación | Contacto */}
      <div className="mt-4 grid grid-cols-3 gap-1.5 rounded-2xl bg-slate-100 p-1">
        <button
          type="button"
          onClick={() => setDrawerTab("diagnostico")}
          className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-2.5 py-2 text-xs font-bold transition cursor-pointer ${
            drawerTab === "diagnostico"
              ? "bg-white text-indigo-700 shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Wrench className="h-3.5 w-3.5" />
          <span>Diagnóstico</span>
        </button>

        <button
          type="button"
          onClick={() => setDrawerTab("ubicacion")}
          className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-2.5 py-2 text-xs font-bold transition cursor-pointer ${
            drawerTab === "ubicacion"
              ? "bg-white text-rose-600 shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <MapPin className="h-3.5 w-3.5" />
          <span>Ubicación</span>
        </button>

        <button
          type="button"
          onClick={() => setDrawerTab("contacto")}
          className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-2.5 py-2 text-xs font-bold transition cursor-pointer ${
            drawerTab === "contacto"
              ? "bg-white text-emerald-700 shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Phone className="h-3.5 w-3.5" />
          <span>Contacto</span>
        </button>
      </div>

      {/* PESTAÑA 1: DIAGNÓSTICO */}
      {drawerTab === "diagnostico" && (
        <div className="mt-4 space-y-3.5">
          <div className="rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wider text-indigo-700">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Sistema puntual que le falta</span>
              </span>
              <span className="text-xs font-bold text-indigo-700">
                ${lead.estimatedValue} USD est.
              </span>
            </div>
            <p className="mt-1.5 text-sm font-bold text-slate-900">
              {lead.specificSystemNeeded || lead.recommendedSolution}
            </p>
            <p className="mt-1 text-xs text-slate-600">
              Solución completa: {lead.recommendedSolution}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div
              className={`flex items-center gap-1.5 rounded-xl border px-2.5 py-2 font-semibold ${
                lead.audit.hasWebsite && !lead.audit.isSocialOnly
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-rose-200 bg-rose-50 text-rose-800"
              }`}
            >
              {lead.audit.hasWebsite && !lead.audit.isSocialOnly ? (
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
              ) : (
                <XCircle className="h-3.5 w-3.5 shrink-0" />
              )}
              <span>
                {lead.audit.isSocialOnly
                  ? "Solo redes sociales"
                  : lead.audit.hasWebsite
                  ? "Tiene sitio web"
                  : "Sin sitio web"}
              </span>
            </div>

            <div
              className={`flex items-center gap-1.5 rounded-xl border px-2.5 py-2 font-semibold ${
                lead.audit.hasBookingOrCatalog
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-rose-200 bg-rose-50 text-rose-800"
              }`}
            >
              {lead.audit.hasBookingOrCatalog ? (
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
              ) : (
                <XCircle className="h-3.5 w-3.5 shrink-0" />
              )}
              <span>
                {lead.audit.hasBookingOrCatalog
                  ? "Tiene sistema"
                  : "Sin sistema propio"}
              </span>
            </div>
          </div>

          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Problemas detectados hoy
            </p>
            <ul className="mt-1.5 space-y-1.5 text-xs text-rose-800">
              {lead.audit.issues.map((issue) => (
                <li
                  key={issue}
                  className="flex items-start gap-1.5 rounded-xl bg-rose-50/70 px-3 py-2"
                >
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-500" />
                  <span>{issue}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Módulos recomendados para este comercio
            </p>
            <ul className="mt-1.5 space-y-1 text-xs text-slate-700">
              {lead.recommendedSystemModules.slice(0, 3).map((mod) => (
                <li key={mod} className="flex items-start gap-1.5">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                  <span>{mod}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl bg-slate-50 p-3">
            <label className="block text-[11px] font-semibold text-slate-600">
              ¿Encontraste su web? Pégala para auditarla en vivo:
            </label>
            <div className="mt-1.5 flex gap-2">
              <input
                type="text"
                value={websiteDraft}
                onChange={(e) => setWebsiteDraft(e.target.value)}
                placeholder="https://..."
                className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                disabled={auditingUrl}
                onClick={handleReAuditWebsite}
                className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-60 cursor-pointer"
              >
                {auditingUrl ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="h-3.5 w-3.5" />
                )}
                <span>Auditar</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PESTAÑA 2: UBICACIÓN */}
      {drawerTab === "ubicacion" && (
        <div className="mt-4 space-y-3.5">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-2 text-xs">
            <div className="grid grid-cols-2 gap-2">
              {lead.country && (
                <div>
                  <span className="block text-[10px] font-bold uppercase text-slate-400">
                    País
                  </span>
                  <span className="font-semibold text-slate-800">
                    {lead.country}
                  </span>
                </div>
              )}
              {lead.province && (
                <div>
                  <span className="block text-[10px] font-bold uppercase text-slate-400">
                    Provincia / Región
                  </span>
                  <span className="font-semibold text-slate-800">
                    {lead.province}
                  </span>
                </div>
              )}
              <div>
                <span className="block text-[10px] font-bold uppercase text-slate-400">
                  Localidad / Ciudad
                </span>
                <span className="font-semibold text-slate-800">{lead.city}</span>
              </div>
              {lead.district && (
                <div>
                  <span className="block text-[10px] font-bold uppercase text-slate-400">
                    Distrito / Barrio
                  </span>
                  <span className="font-semibold text-slate-800">
                    {lead.district}
                  </span>
                </div>
              )}
            </div>

            <div className="border-t border-slate-200 pt-2">
              <span className="block text-[10px] font-bold uppercase text-slate-400">
                Dirección exacta
              </span>
              <span className="text-sm font-bold text-slate-900">
                {lead.address}
              </span>
            </div>

            {lead.openingHours && (
              <div>
                <span className="block text-[10px] font-bold uppercase text-slate-400">
                  Horario de atención
                </span>
                <span className="font-medium text-slate-700">
                  {lead.openingHours}
                </span>
              </div>
            )}

            {typeof lead.lat === "number" && typeof lead.lon === "number" && (
              <p className="font-mono text-[11px] text-slate-500">
                GPS: {lead.lat.toFixed(5)}, {lead.lon.toFixed(5)}
              </p>
            )}
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {onFocusOnMap &&
              typeof lead.lat === "number" &&
              typeof lead.lon === "number" && (
                <button
                  type="button"
                  onClick={() => onFocusOnMap(lead)}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100 cursor-pointer"
                >
                  <Crosshair className="h-3.5 w-3.5" />
                  <span>Ubicar en el Mapa</span>
                </button>
              )}
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-3 py-2.5 text-xs font-bold text-white hover:bg-slate-800"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Abrir en Google Maps</span>
            </a>
          </div>
        </div>
      )}

      {/* PESTAÑA 3: CONTACTO Y WHATSAPP */}
      {drawerTab === "contacto" && (
        <div className="mt-4 space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">
              Estado del contacto
            </span>
            {hasAnyContact ? (
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                Tiene contacto directo
              </span>
            ) : (
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-800">
                Sin teléfono público
              </span>
            )}
          </div>

          <div className="space-y-1.5 rounded-2xl bg-slate-50 p-3.5 text-xs text-slate-700">
            {lead.phone ? (
              <p className="flex items-center gap-2 font-bold text-slate-900">
                <Phone className="h-3.5 w-3.5 text-emerald-600" />
                <span>{lead.phone}</span>
              </p>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-2 text-amber-800">
                <span>No figura teléfono en su ficha pública.</span>
                <a
                  href={googlePhoneSearchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-bold text-indigo-600 hover:underline"
                >
                  <Search className="h-3 w-3" />
                  <span>Buscar en Google</span>
                </a>
              </div>
            )}

            {lead.instagram && (
              <p className="flex items-center gap-2">
                <AtSign className="h-3.5 w-3.5 text-fuchsia-600" />
                <span>{lead.instagram}</span>
              </p>
            )}
            {lead.email && (
              <p className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-indigo-600" />
                <span>{lead.email}</span>
              </p>
            )}
            {lead.website && (
              <a
                href={lead.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-indigo-600 hover:underline break-all"
              >
                <Globe className="h-3.5 w-3.5 shrink-0" />
                <span>{lead.website}</span>
              </a>
            )}
          </div>

          <div className="space-y-2 rounded-2xl border border-slate-200 p-3">
            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600">
                  Teléfono / WhatsApp
                </label>
                <input
                  type="text"
                  value={phoneDraft}
                  onChange={(e) => setPhoneDraft(e.target.value)}
                  placeholder="+54 9 ..."
                  className="mt-1 w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600">
                  Nota de seguimiento
                </label>
                <input
                  type="text"
                  value={notesDraft}
                  onChange={(e) => setNotesDraft(e.target.value)}
                  placeholder="Ej. Llamar a la tarde"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs outline-none focus:border-indigo-500"
                />
              </div>
            </div>
            <button
              type="button"
              disabled={savingContact}
              onClick={handleSaveContactDetails}
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-200 cursor-pointer"
            >
              {savingContact ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : contactSavedFeedback ? (
                <Check className="h-3.5 w-3.5 text-emerald-600" />
              ) : null}
              <span>
                {contactSavedFeedback
                  ? "Contacto guardado"
                  : isSaved
                  ? "Actualizar contacto y nota"
                  : "Guardar negocio con este contacto"}
              </span>
            </button>
          </div>

          <div className="space-y-2 pt-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Mensaje listo para enviar
            </p>
            <div className="flex flex-wrap gap-1.5">
              {templates.map((tpl, idx) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => setSelectedTplId(tpl.id)}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold cursor-pointer ${
                    selectedTplId === tpl.id
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  Opción {idx + 1}
                </button>
              ))}
            </div>

            <p className="rounded-xl bg-slate-50 p-2.5 text-[11px] leading-relaxed text-slate-600 line-clamp-4">
              {activeTemplate.message}
            </p>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleCopyMessage}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs font-semibold text-slate-800 hover:bg-slate-50 cursor-pointer"
              >
                {copiedMsg ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Copiado</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copiar mensaje</span>
                  </>
                )}
              </button>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={async () => {
                  if (!isSaved) {
                    const saved = await onSaveLead(lead);
                    if (saved) {
                      await onUpdateLead(saved.id, { status: "contactado" });
                    }
                  } else if (lead.status === "nuevo") {
                    await onUpdateLead(lead.id, { status: "contactado" });
                  }
                }}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-500"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                <span>Enviar WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
