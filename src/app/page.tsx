import { Suspense } from "react";
import { connection } from "next/server";
import { Navbar } from "@/components/Navbar";
import { PanelClient } from "@/components/PanelClient";
import { getAllLeads } from "@/lib/db";

async function MainWorkspaceContent() {
  await connection();
  const leads = await getAllLeads();
  return <PanelClient initialLeads={leads} />;
}

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar active="buscar" />
      <Suspense
        fallback={
          <div className="mx-auto max-w-7xl px-4 py-16 text-center text-sm text-slate-500">
            Cargando buscador de comercios y cartera...
          </div>
        }
      >
        <MainWorkspaceContent />
      </Suspense>
    </div>
  );
}
