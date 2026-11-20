import Link from "next/link";
import { MapPin, Sparkles } from "lucide-react";

interface NavbarProps {
  active?: "buscar" | "soluciones" | "diagnostic";
}

export function Navbar({ active = "buscar" }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-sm transition-transform group-hover:scale-105">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-base font-extrabold tracking-tight text-slate-900 leading-none">
              CarteraPro
            </span>
            <span className="mt-0.5 block text-xs font-medium text-slate-500">
              Buscador y Cartera de Clientes por Zona
            </span>
          </div>
        </Link>

        <nav className="flex items-center">
          <Link
            href="/"
            className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold transition ${
              active === "buscar"
                ? "bg-indigo-600 text-white shadow-xs"
                : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            <MapPin className="h-4 w-4" />
            <span>Buscar Negocios por Zona</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
