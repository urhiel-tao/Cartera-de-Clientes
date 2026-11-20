"use client";

import { useState } from "react";
import { Check, Copy, MessageCircle, X } from "lucide-react";
import { generatePitchMessages } from "@/lib/auditor";
import { Lead } from "@/types";

interface PitchModalProps {
  lead: Lead;
  onClose: () => void;
  onMarkContacted?: (leadId: string) => void;
}

export function PitchModal({
  lead,
  onClose,
  onMarkContacted,
}: PitchModalProps) {
  const templates = generatePitchMessages(lead);

  const [selectedId, setSelectedId] = useState(templates[0].id);
  const [customMessage, setCustomMessage] = useState(templates[0].message);
  const [copiedMsg, setCopiedMsg] = useState(false);

  const activeTemplate =
    templates.find((t) => t.id === selectedId) || templates[0];

  function handleSelectTemplate(id: string) {
    setSelectedId(id);
    const found = templates.find((t) => t.id === id);
    if (found) setCustomMessage(found.message);
  }

  async function copyMessage() {
    try {
      await navigator.clipboard.writeText(customMessage);
      setCopiedMsg(true);
      setTimeout(() => setCopiedMsg(false), 2000);
    } catch {
      // Fallback silencioso
    }
  }

  const cleanPhone = (lead.phone || "").replace(/[^\d]/g, "");
  const whatsappHref = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(customMessage)}`
    : `https://wa.me/?text=${encodeURIComponent(customMessage)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Mensaje de Contacto Directo
            </span>
            <h3 className="mt-1 text-xl font-bold text-slate-900">
              Contactar a {lead.name}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Selector de enfoque */}
        <div className="mt-5">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Elige el enfoque del mensaje
          </p>
          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            {templates.map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => handleSelectTemplate(tpl.id)}
                className={`rounded-xl border p-2.5 text-left text-xs transition cursor-pointer ${
                  selectedId === tpl.id
                    ? "border-indigo-600 bg-indigo-50 font-semibold text-indigo-900"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                {tpl.title}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-slate-500">{activeTemplate.angle}</p>
        </div>

        {/* Texto editable */}
        <div className="mt-4">
          <label className="block text-xs font-semibold text-slate-700">
            Mensaje listo para enviar (puedes editarlo antes de copiar):
          </label>
          <textarea
            rows={7}
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            className="mt-1.5 w-full rounded-2xl border border-slate-300 bg-slate-50 p-3.5 text-sm leading-relaxed text-slate-900 outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        {/* Acciones */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={copyMessage}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 cursor-pointer"
          >
            {copiedMsg ? (
              <>
                <Check className="h-4 w-4 text-emerald-600" />
                <span>Mensaje copiado</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                <span>Copiar mensaje</span>
              </>
            )}
          </button>

          <div className="flex flex-wrap items-center gap-2">
            {lead.status === "nuevo" && onMarkContacted && (
              <button
                type="button"
                onClick={() => {
                  onMarkContacted(lead.id);
                  onClose();
                }}
                className="rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-semibold text-indigo-700 hover:bg-indigo-100 cursor-pointer"
              >
                Marcar como Contactado
              </button>
            )}
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                if (lead.status === "nuevo" && onMarkContacted) {
                  onMarkContacted(lead.id);
                }
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Enviar por WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
