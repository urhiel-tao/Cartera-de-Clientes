import { NextResponse } from "next/server";
import { createAnalyzedLead } from "@/lib/auditor";
import { getAllLeads, upsertLead } from "@/lib/db";
import { Lead, RubroId } from "@/types";

export async function GET() {
  try {
    const leads = await getAllLeads();
    return NextResponse.json({ leads });
  } catch (error) {
    console.error("Error en GET /api/leads:", error);
    return NextResponse.json(
      { error: "No se pudieron cargar los prospectos." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<Lead> & { rubro?: RubroId };

    if (body.audit && body.name && body.rubro) {
      const saved = await upsertLead(body as Lead);
      return NextResponse.json({ lead: saved }, { status: 201 });
    }

    if (!body.name?.trim()) {
      return NextResponse.json(
        { error: "El nombre del negocio es obligatorio." },
        { status: 400 }
      );
    }

    const analyzed = await createAnalyzedLead({
      id: body.id,
      name: body.name,
      rubro: body.rubro || "otros",
      city: body.city || "Tu ciudad",
      address: body.address,
      phone: body.phone,
      website: body.website,
      instagram: body.instagram,
      rating: body.rating,
      reviewCount: body.reviewCount,
      notes: body.notes,
      source: body.source || "manual",
    });

    const saved = await upsertLead(analyzed);
    return NextResponse.json({ lead: saved }, { status: 201 });
  } catch (error) {
    console.error("Error en POST /api/leads:", error);
    return NextResponse.json(
      { error: "No se pudo guardar el cliente en la cartera." },
      { status: 500 }
    );
  }
}
