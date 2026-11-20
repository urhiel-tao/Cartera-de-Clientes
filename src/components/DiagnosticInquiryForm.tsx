"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { RubroId } from "@/types";

interface DiagnosticInquiryFormProps {
  leadId: string;
  businessName: string;
  rubro: RubroId;
  website?: string;
  alreadyViewed?: boolean;
  alreadyRequested?: boolean;
}

export function DiagnosticInquiryForm({
  leadId,
  businessName,
  rubro,
  website,
  alreadyViewed,
  alreadyRequested,
}: DiagnosticInquiryFormProps) {
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(
    `Hola, vi el diagnóstico de ${businessName} y me gustaría ver una demo y precios.`
  );
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(Boolean(alreadyRequested));
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!alreadyViewed) {
      fetch(`/api/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientViewedProposal: true }),
      }).catch(() => {});
    }
  }, [leadId, alreadyViewed]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId,
          businessName,
          rubro,
          website,
          contactName,
          phone,
          email,
          currentPainPoint: message,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(data.error || "No se pudo enviar la solicitud.");
      }
      setSubmitted(true);
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Error al enviar solicitud."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-emerald-900">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-emerald-600" />
          <div>
            <h4 className="text-base font-bold">
              ¡Solicitud recibida para {businessName}!
            </h4>
            <p className="mt-1 text-sm text-emerald-800">
              Ya registramos tu interés en nuestro sistema. Te vamos a contactar a la
              brevedad para mostrarte una demo adaptada a tu rubro.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-semibold text-slate-700">
            Tu nombre *
          </label>
          <input
            type="text"
            required
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            placeholder="Ej. Carlos / Laura"
            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
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
            placeholder="Ej. +54 9 351 123-4567"
            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700">
          Email (opcional)
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="correo@tunegocio.com"
          className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700">
          ¿Qué te gustaría priorizar primero?
        </label>
        <textarea
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
        />
      </div>

      {errorMsg && (
        <p className="rounded-xl bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">
          {errorMsg}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:opacity-60 cursor-pointer"
      >
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Enviando solicitud...</span>
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            <span>Quiero más información y ver una demo</span>
          </>
        )}
      </button>
    </form>
  );
}
