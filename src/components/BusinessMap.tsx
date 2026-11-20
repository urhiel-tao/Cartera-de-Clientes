"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type * as LeafletNS from "leaflet";
import {
  AlertCircle,
  BookmarkPlus,
  Check,
  CheckCircle2,
  Crosshair,
  Loader2,
  MapPin,
  MessageSquareText,
  Square,
  CheckSquare,
} from "lucide-react";
import { getRubroDefinition } from "@/lib/rubros";
import { Lead } from "@/types";
import { RubroIcon } from "./RubroIcon";

interface BusinessMapProps {
  leads: Lead[];
  center?: { lat: number; lon: number } | null;
  savedNames: Set<string>;
  existingLeadsByName: Map<string, Lead>;
  selectedIds: string[];
  activeLeadId: string | null;
  onSelectActiveLead: (lead: Lead) => void;
  onToggleCheckLead: (leadId: string) => void;
  onClearSelection: () => void;
  onSaveSingle: (lead: Lead) => void;
  onSaveSelected: () => void;
  onSearchArea?: (lat: number, lon: number) => void;
  onOpenPitch?: (lead: Lead) => void;
  searchingArea?: boolean;
  savingId?: string | null;
  batchSaving?: boolean;
  hideDetailCard?: boolean;
  focusPoint?: { lat: number; lon: number; seq: number } | null;
}

function getMarkerStyle(
  lead: Lead,
  isSaved: boolean,
  isChecked: boolean,
  isActive: boolean
): { bg: string; border: string; ring: string } {
  let bg = "#475569";
  if (isSaved) {
    bg = "#059669";
  } else if (lead.opportunityScore >= 80) {
    bg = "#e11d48";
  } else if (lead.opportunityScore >= 60) {
    bg = "#ea580c";
  } else if (lead.opportunityScore >= 38) {
    bg = "#d97706";
  }

  const border = isChecked ? "#4f46e5" : "#ffffff";
  const ring = isActive
    ? "0 0 0 4px rgba(79, 70, 229, 0.35), 0 6px 14px rgba(15, 23, 42, 0.35)"
    : isChecked
    ? "0 0 0 3px rgba(79, 70, 229, 0.28), 0 4px 10px rgba(15, 23, 42, 0.25)"
    : "0 4px 10px rgba(15, 23, 42, 0.28)";

  return { bg, border, ring };
}

export function BusinessMap({
  leads,
  center,
  savedNames,
  existingLeadsByName,
  selectedIds,
  activeLeadId,
  onSelectActiveLead,
  onToggleCheckLead,
  onClearSelection,
  onSaveSingle,
  onSaveSelected,
  onSearchArea,
  onOpenPitch,
  searchingArea = false,
  savingId = null,
  batchSaving = false,
  hideDetailCard = false,
  focusPoint = null,
}: BusinessMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const leafletRef = useRef<typeof LeafletNS | null>(null);
  const mapRef = useRef<LeafletNS.Map | null>(null);
  const layerGroupRef = useRef<LeafletNS.LayerGroup | null>(null);
  const onSelectRef = useRef(onSelectActiveLead);
  const lastLeadsKeyRef = useRef<string>("");
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    onSelectRef.current = onSelectActiveLead;
  }, [onSelectActiveLead]);

  const mappableLeads = useMemo(
    () =>
      leads.filter(
        (l) => typeof l.lat === "number" && typeof l.lon === "number"
      ),
    [leads]
  );

  const activeLead = useMemo(
    () =>
      mappableLeads.find((l) => l.id === activeLeadId) ||
      mappableLeads[0] ||
      null,
    [mappableLeads, activeLeadId]
  );

  // Inicializar instancia Leaflet una sola vez en cliente
  useEffect(() => {
    let cancelled = false;

    async function initMap() {
      if (!containerRef.current || mapRef.current) return;
      const L = await import("leaflet");
      if (cancelled || !containerRef.current || mapRef.current) return;

      leafletRef.current = L;
      const initialLat = center?.lat ?? -31.4201;
      const initialLon = center?.lon ?? -64.1888;

      const map = L.map(containerRef.current, {
        center: [initialLat, initialLon],
        zoom: 13,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map);

      const group = L.layerGroup().addTo(map);
      mapRef.current = map;
      layerGroupRef.current = group;
      setMapReady(true);

      // Forzar recálculo por si se montó dentro de un contenedor flex/grid
      setTimeout(() => {
        if (!cancelled && mapRef.current) {
          mapRef.current.invalidateSize();
        }
      }, 150);
    }

    initMap();

    return () => {
      cancelled = true;
      setMapReady(false);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        layerGroupRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Actualizar marcadores y encuadre cuando cambien leads o selección
  useEffect(() => {
    if (!mapReady) return;
    const L = leafletRef.current;
    const map = mapRef.current;
    const group = layerGroupRef.current;
    if (!L || !map || !group) return;

    group.clearLayers();

    const boundsPoints: Array<[number, number]> = [];
    const selectedSet = new Set(selectedIds);

    mappableLeads.forEach((lead) => {
      const lat = lead.lat!;
      const lon = lead.lon!;
      boundsPoints.push([lat, lon]);

      const isSaved = savedNames.has(lead.name.toLowerCase());
      const isChecked = selectedSet.has(lead.id);
      const isActive = activeLead?.id === lead.id;
      const style = getMarkerStyle(lead, isSaved, isChecked, isActive);

      const badgeLabel = isSaved ? `${lead.opportunityScore}✓` : `${lead.opportunityScore}`;
      const size = isActive ? 38 : 32;

      const icon = L.divIcon({
        className: "carterapro-map-marker",
        html: `<div style="width:${size}px;height:${size}px;border-radius:9999px;background:${style.bg};border:3px solid ${style.border};box-shadow:${style.ring};color:#ffffff;font-weight:800;font-size:${isActive ? "12px" : "11px"};display:flex;align-items:center;justify-content:center;cursor:pointer;transition:transform 0.15s;">${badgeLabel}</div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      });

      const marker = L.marker([lat, lon], { icon });
      marker.bindTooltip(lead.name, {
        direction: "top",
        offset: [0, -(size / 2)],
      });
      marker.on("click", () => {
        onSelectRef.current(lead);
      });
      marker.addTo(group);
    });

    const leadsKey = mappableLeads.map((l) => l.id).join("|");
    if (leadsKey && leadsKey !== lastLeadsKeyRef.current) {
      lastLeadsKeyRef.current = leadsKey;
      if (boundsPoints.length === 1) {
        map.setView(boundsPoints[0], 14, { animate: true });
      } else if (boundsPoints.length > 1) {
        map.fitBounds(boundsPoints, { padding: [45, 45], maxZoom: 15 });
      }
    } else if (boundsPoints.length === 0 && center) {
      map.setView([center.lat, center.lon], 13, { animate: true });
    }
  }, [mapReady, mappableLeads, savedNames, selectedIds, activeLead, center]);

  useEffect(() => {
    if (!mapReady || !focusPoint || !mapRef.current) return;
    mapRef.current.setView([focusPoint.lat, focusPoint.lon], 16, {
      animate: true,
    });
  }, [mapReady, focusPoint]);

  function handleSearchCurrentArea() {
    if (!mapRef.current || !onSearchArea) return;
    const c = mapRef.current.getCenter();
    onSearchArea(Number(c.lat.toFixed(5)), Number(c.lng.toFixed(5)));
  }

  const activeIsSaved = activeLead
    ? savedNames.has(activeLead.name.toLowerCase())
    : false;
  const activeExisting = activeLead
    ? existingLeadsByName.get(activeLead.name.toLowerCase()) ||
      (activeIsSaved ? activeLead : undefined)
    : undefined;
  const activeIsChecked = activeLead
    ? selectedIds.includes(activeLead.id)
    : false;
  const activeRubro = activeLead ? getRubroDefinition(activeLead.rubro) : null;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-xs sm:p-5">
      {/* Barra de controles del mapa */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
          <span className="font-bold text-slate-800">
            Mapa interactivo ({mappableLeads.length} negocios)
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-600" />
            Crítica
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-orange-600" />
            Alta
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-600" />
            Media
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" />
            En Cartera
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {selectedIds.length > 0 && (
            <>
              <button
                type="button"
                disabled={batchSaving}
                onClick={onSaveSelected}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-500 disabled:opacity-60 cursor-pointer"
              >
                {batchSaving ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Check className="h-3.5 w-3.5" />
                )}
                <span>Guardar seleccionados ({selectedIds.length})</span>
              </button>
              <button
                type="button"
                onClick={onClearSelection}
                className="rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Limpiar
              </button>
            </>
          )}

          {onSearchArea && (
            <button
              type="button"
              disabled={searchingArea}
              onClick={handleSearchCurrentArea}
              className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3.5 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 disabled:opacity-60 cursor-pointer"
            >
              {searchingArea ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Crosshair className="h-3.5 w-3.5" />
              )}
              <span>Buscar negocios en esta zona</span>
            </button>
          )}
        </div>
      </div>

      {/* Contenedor del mapa */}
      <div className="relative isolate overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
        <div ref={containerRef} className="h-[340px] w-full sm:h-[380px]" />
      </div>

      {/* Tarjeta del negocio seleccionado en el mapa */}
      {!hideDetailCard &&
        (activeLead && activeRubro ? (
        <div className="mt-4 rounded-2xl border border-indigo-200 bg-indigo-50/40 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${activeRubro.badgeClasses}`}
                >
                  <RubroIcon
                    iconName={activeRubro.iconName}
                    className="h-3 w-3"
                  />
                  <span>{activeRubro.shortName}</span>
                </span>
                <span className="rounded-full bg-slate-900 px-2.5 py-0.5 text-[11px] font-bold text-white">
                  Score {activeLead.opportunityScore}/100
                </span>
                {activeIsSaved && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                    <CheckCircle2 className="h-3 w-3" />
                    En tu Cartera
                  </span>
                )}
              </div>

              <h4 className="mt-2 text-base font-bold text-slate-900">
                {activeLead.name}
              </h4>
              <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-600">
                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                <span>
                  {activeLead.address}, {activeLead.city}
                </span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {!activeIsSaved && (
                <button
                  type="button"
                  onClick={() => onToggleCheckLead(activeLead.id)}
                  className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition cursor-pointer ${
                    activeIsChecked
                      ? "border-indigo-600 bg-indigo-600 text-white"
                      : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {activeIsChecked ? (
                    <CheckSquare className="h-3.5 w-3.5" />
                  ) : (
                    <Square className="h-3.5 w-3.5" />
                  )}
                  <span>
                    {activeIsChecked ? "Seleccionado" : "Seleccionar en mapa"}
                  </span>
                </button>
              )}

              {activeIsSaved && activeExisting ? (
                <>
                  {onOpenPitch && (
                    <button
                      type="button"
                      onClick={() => onOpenPitch(activeExisting)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-500 cursor-pointer"
                    >
                      <MessageSquareText className="h-3.5 w-3.5" />
                      <span>Contactar</span>
                    </button>
                  )}
                </>
              ) : (
                <button
                  type="button"
                  disabled={savingId === activeLead.id}
                  onClick={() => onSaveSingle(activeLead)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-60 cursor-pointer"
                >
                  {savingId === activeLead.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <BookmarkPlus className="h-3.5 w-3.5" />
                  )}
                  <span>Guardar en Cartera</span>
                </button>
              )}
            </div>
          </div>

          <div className="mt-3 rounded-xl bg-white p-3 text-xs text-slate-700 border border-indigo-100">
            <p className="font-bold text-slate-900">
              Qué ofrecerle: {activeLead.recommendedSolution}
            </p>
            {activeLead.audit.issues[0] && (
              <p className="mt-1 flex items-start gap-1.5 text-rose-700">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>{activeLead.audit.issues[0]}</span>
              </p>
            )}
          </div>
        </div>
      ) : (
        <p className="mt-3 text-center text-xs text-slate-500">
          Mueve el mapa y haz clic en &quot;Buscar negocios en esta zona&quot; o toca cualquier marcador para ver su diagnóstico.
        </p>
      ))}
    </div>
  );
}
