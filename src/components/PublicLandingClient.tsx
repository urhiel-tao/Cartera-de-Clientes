"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Globe,
  Layers,
  Loader2,
  MessageSquare,
  SearchCheck,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { RUBRO_LIST, getRubroDefinition } from "@/lib/rubros";
import { RubroId } from "@/types";
import { RubroIcon } from "./RubroIcon";

export function PublicLandingClient() {
  const [selectedRubro, setSelectedRubro] = useState<RubroId>("gastronomia");

  // Formulario de autodiagnóstico gratuito
  const [businessName, setBusinessName] = useState("");
  const [formRubro, setFormRubro] = useState<RubroId>("gastronomia");
  const [city, setCity] = useState("");
  const [website, setWebsite] = useState("");
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [painPoint, setPainPoint] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [createdResult, setCreatedResult] = useState<{
    leadId: string;
    businessName: string;
    rubro: RubroId;
  } | null>(null);

  const activeRubro = getRubroDefinition(selectedRubro);

  function handleSelectRubroForForm(rubroId: RubroId) {
    setFormRubro(rubroId);
    const el = document.getElementById("diagnostico-gratis");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName,
          contactName,
          phone,
          email,
          rubro: formRubro,
          city: city || "Mi ciudad",
          website,
          currentPainPoint: painPoint,
        }),
      });

      const data = (await res.json()) as {
        error?: string;
        leadId?: string;
      };

      if (!res.ok || !data.leadId) {
        throw new Error(data.error || "No se pudo procesar tu solicitud.");
      }

      setCreatedResult({
        leadId: data.leadId,
        businessName,
        rubro: formRubro,
      });

      setBusinessName("");
      setWebsite("");
      setContactName("");
      setPhone("");
      setEmail("");
      setPainPoint("");
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Ocurrió un error al enviar."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex-1">
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.28),transparent_48%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/15 px-3.5 py-1.5 text-xs font-semibold text-indigo-200">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Soluciones Web + Sistemas a Medida para Negocios Locales</span>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl lg:leading-[1.12]">
                ¿Tu negocio pierde tiempo con planillas o clientes por falta de web?
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
                Diseñamos <strong>páginas web que posicionan en Google</strong> y{" "}
                <strong>sistemas simples adaptados a tu rubro</strong> (turnos, pedidos,
                stock, órdenes de trabajo o reservas) para que vendas más y trabajes ordenado.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3.5">
                <a
                  href="#diagnostico-gratis"
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-400"
                >
                  <SearchCheck className="h-4 w-4" />
                  <span>Analizar mi negocio gratis</span>
                </a>
                <a
                  href="#rubros"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/60 px-5 py-3.5 text-sm font-semibold text-slate-100 transition hover:bg-slate-800"
                >
                  <span>Ver soluciones por rubro</span>
                  <ArrowRight className="h-4 w-4" />
                </a>
                <Link
                  href="/diagnostico/lead-demo-1"
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-indigo-300 hover:text-white"
                >
                  <span>Ver ejemplo de diagnóstico</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="mt-10 grid grid-cols-3 gap-4 border-t border-slate-800 pt-6 text-sm">
                <div>
                  <p className="font-bold text-white">Todos los rubros</p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    Sistemas pensados para tu día a día
                  </p>
                </div>
                <div>
                  <p className="font-bold text-white">Sin comisiones</p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    Tu propia web, tus clientes directos
                  </p>
                </div>
                <div>
                  <p className="font-bold text-white">Diagnóstico en vivo</p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    Detectamos qué te falta hoy mismo
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
                    ¿Qué detectamos al analizar un local?
                  </span>
                  <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-medium text-emerald-300">
                    Auditoría real
                  </span>
                </div>
                <ul className="space-y-3.5 text-sm text-slate-200">
                  <li className="flex items-start gap-3 rounded-xl bg-slate-900/60 p-3">
                    <Globe className="mt-0.5 h-4 w-4 shrink-0 text-indigo-400" />
                    <div>
                      <p className="font-semibold text-white">Presencia Web y Google</p>
                      <p className="text-xs text-slate-400">
                        Si tienes web propia, si carga rápido en celulares y si te encuentran en tu ciudad.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3 rounded-xl bg-slate-900/60 p-3">
                    <Layers className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                    <div>
                      <p className="font-semibold text-white">Cuellos de Botella Operativos</p>
                      <p className="text-xs text-slate-400">
                        Si pierdes horas anotando turnos, pedidos, presupuestos o precios a mano.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3 rounded-xl bg-slate-900/60 p-3">
                    <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                    <div>
                      <p className="font-semibold text-white">Plan Concreto de Mejora</p>
                      <p className="text-xs text-slate-400">
                        Recibes una ficha visual personalizada con módulos recomendados para tu rubro.
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* EXPLORADOR INTERACTIVO DE RUBROS */}
      <section id="rubros" className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-block rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
            Soluciones adaptadas a cada actividad
          </span>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Elige tu rubro y descubre qué sistema o web impulsa tu negocio
          </h2>
          <p className="mt-3 text-base text-slate-600">
            No usamos plantillas genéricas. Cada actividad tiene problemas distintos y necesita
            herramientas concretas que ahorren tiempo desde la primera semana.
          </p>
        </div>

        {/* Selector de rubros en tarjetas visuales */}
        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {RUBRO_LIST.map((rubro) => {
            const isActive = rubro.id === selectedRubro;
            return (
              <button
                key={rubro.id}
                type="button"
                onClick={() => setSelectedRubro(rubro.id)}
                className={`flex items-center gap-3 rounded-2xl border p-3.5 text-left transition-all cursor-pointer ${
                  isActive
                    ? "border-indigo-600 bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                    : "border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/40"
                }`}
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-indigo-50 text-indigo-600"
                  }`}
                >
                  <RubroIcon iconName={rubro.iconName} className="h-4 w-4" />
                </div>
                <span className="text-xs font-bold leading-snug sm:text-sm">
                  {rubro.shortName}
                </span>
              </button>
            );
          })}
        </div>

        {/* Detalle del rubro seleccionado */}
        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="grid gap-8 lg:grid-cols-12">
            {/* Columna izquierda: Resumen, Web + Sistema + Módulos */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-5">
                <div className="flex items-start gap-3.5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                    <RubroIcon iconName={activeRubro.iconName} className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 sm:text-2xl">
                      {activeRubro.name}
                    </h3>
                    <p className="mt-1 text-sm text-slate-600">
                      {activeRubro.description}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                    Presencia Web Ideal
                  </span>
                  <p className="mt-1.5 text-base font-bold text-slate-900">
                    {activeRubro.recommendedWebTitle}
                  </p>
                </div>
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                    Sistema de Optimización
                  </span>
                  <p className="mt-1.5 text-base font-bold text-slate-900">
                    {activeRubro.recommendedSystemTitle}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                  Módulos que podemos implementar en tu negocio
                </h4>
                <ul className="mt-3 grid gap-2.5 sm:grid-cols-2">
                  {activeRubro.recommendedModules.map((mod) => (
                    <li
                      key={mod}
                      className="flex items-start gap-2.5 rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm text-slate-700"
                    >
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                      <span>{mod}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-slate-900 px-5 py-4 text-white">
                <div>
                  <p className="text-xs font-medium text-slate-400">
                    ¿Trabajas en el rubro {activeRubro.shortName}?
                  </p>
                  <p className="text-sm font-semibold">
                    Pide una demo o diagnóstico sin cargo para tu local
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleSelectRubroForForm(activeRubro.id)}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-400 cursor-pointer"
                >
                  <span>Quiero más información</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Columna derecha: Hoy vs Optimizado + Impacto */}
            <div className="lg:col-span-5 flex flex-col justify-between gap-5 rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Problemas comunes vs. Trabajo optimizado
                </h4>

                <div className="mt-4 space-y-3">
                  <div className="rounded-xl border border-rose-200/70 bg-rose-50/70 p-3.5">
                    <p className="text-xs font-bold uppercase tracking-wider text-rose-700">
                      Situación común hoy (Sin sistema)
                    </p>
                    <ul className="mt-2 space-y-1.5 text-xs text-rose-950">
                      {activeRubro.todayVsOptimized.today.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-500" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-3.5">
                    <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                      Con tu Web + Sistema
                    </p>
                    <ul className="mt-2 space-y-1.5 text-xs text-emerald-950">
                      {activeRubro.todayVsOptimized.optimized.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Resultados que buscan nuestros clientes
                </p>
                <ul className="mt-2 space-y-1 text-xs font-medium text-slate-700">
                  {activeRubro.expectedImpact.map((imp) => (
                    <li key={imp} className="flex items-center gap-2">
                      <TrendingUp className="h-3.5 w-3.5 shrink-0 text-indigo-600" />
                      <span>{imp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FORMULARIO DE AUTODIAGNÓSTICO GRATUITO */}
      <section
        id="diagnostico-gratis"
        className="border-t border-slate-200 bg-white py-16"
      >
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-5 space-y-4">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Sin compromiso</span>
              </span>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Genera tu Diagnóstico Digital en el momento
              </h2>
              <p className="text-sm leading-relaxed text-slate-600">
                Completa los datos de tu local. Si ya tienes una página web o Instagram, nuestro
                sistema la audita al instante y te crea un reporte personalizado con lo que
                conviene mejorar primero.
              </p>

              <div className="space-y-3 pt-2 text-sm text-slate-700">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" />
                  <span>Análisis automático de web, HTTPS, celular y velocidad.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" />
                  <span>Recomendación de sistema específico según tu rubro.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" />
                  <span>Contacto directo para mostrarte una demo funcionando.</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7">
              {createdResult ? (
                <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 sm:p-8">
                  <div className="flex items-center gap-3 text-emerald-800">
                    <CheckCircle2 className="h-7 w-7 shrink-0 text-emerald-600" />
                    <div>
                      <h3 className="text-lg font-bold">
                        ¡Listo! Ya armamos el diagnóstico de {createdResult.businessName}
                      </h3>
                      <p className="text-sm text-emerald-700">
                        Registramos tu consulta y generamos tu ficha personalizada.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <Link
                      href={`/diagnostico/${createdResult.leadId}`}
                      className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500"
                    >
                      <span>Ver mi Reporte de Diagnóstico ahora</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => setCreatedResult(null)}
                      className="rounded-xl border border-emerald-300 bg-white px-4 py-3 text-sm font-medium text-emerald-800 hover:bg-emerald-100/50 cursor-pointer"
                    >
                      Analizar otro negocio
                    </button>
                  </div>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="rounded-3xl border border-slate-200 bg-slate-50/70 p-6 shadow-xs sm:p-8"
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700">
                        Nombre de tu local o empresa *
                      </label>
                      <input
                        type="text"
                        required
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="Ej. Café Central / Taller López / Consultorio Vital"
                        className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700">
                        Rubro *
                      </label>
                      <select
                        value={formRubro}
                        onChange={(e) => setFormRubro(e.target.value as RubroId)}
                        className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
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
                        Ciudad / Barrio
                      </label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Ej. Córdoba, Palermo, Rosario..."
                        className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700">
                        Web actual o Instagram (opcional — si pones tu web la analizamos en vivo)
                      </label>
                      <input
                        type="text"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        placeholder="Ej. https://minegocio.com o instagram.com/minegocio"
                        className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700">
                        Tu nombre *
                      </label>
                      <input
                        type="text"
                        required
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        placeholder="Ej. Martín Pérez"
                        className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700">
                        WhatsApp / Teléfono *
                      </label>
                      <input
                        type="text"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Ej. +54 9 11 1234-5678"
                        className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700">
                        Email (opcional)
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="tu@correo.com"
                        className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700">
                        ¿Qué te gustaría mejorar o qué tarea te quita más tiempo hoy?
                      </label>
                      <textarea
                        rows={3}
                        value={painPoint}
                        onChange={(e) => setPainPoint(e.target.value)}
                        placeholder="Ej. Queremos dejar de coordinar turnos por chat, mostrar un catálogo actualizado o tener web propia..."
                        className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>
                  </div>

                  {errorMsg && (
                    <p className="mt-4 rounded-xl bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-700">
                      {errorMsg}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:opacity-60 cursor-pointer"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Analizando negocio y generando ficha...</span>
                      </>
                    ) : (
                      <>
                        <SearchCheck className="h-4 w-4" />
                        <span>Ver mi diagnóstico gratuito y solicitar info</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-slate-900 py-8 text-slate-400">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 text-xs sm:px-6">
          <p>
            CarteraPro · Soluciones Web y Sistemas de Gestión por Rubro
          </p>
          <div className="flex items-center gap-4">
            <Link href="/" className="font-medium text-indigo-300 hover:text-white">
              Ir al Buscador de Negocios por Zona →
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
