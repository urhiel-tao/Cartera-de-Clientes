import { NextResponse } from "next/server";
import { createAnalyzedLead } from "@/lib/auditor";
import { upsertLead } from "@/lib/db";
import { RubroId } from "@/types";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      name?: string;
      rubro?: RubroId;
      city?: string;
      address?: string;
      phone?: string;
      website?: string;
      instagram?: string;
      rating?: number;
      reviewCount?: number;
      notes?: string;
      saveToCrm?: boolean;
    };

    const name = body.name?.trim();
    if (!name) {
      return NextResponse.json(
        { error: "El nombre del local o negocio es obligatorio." },
        { status: 400 }
      );
    }

    const lead = await createAnalyzedLead({
      name,
      rubro: body.rubro || "otros",
      city: body.city || "Tu ciudad",
      address: body.address,
      phone: body.phone,
      website: body.website,
      instagram: body.instagram,
      rating: body.rating,
      reviewCount: body.reviewCount,
      notes: body.notes,
      source: "manual",
    });

    if (body.saveToCrm) {
      const saved = await upsertLead(lead);
      return NextResponse.json({ lead: saved, saved: true });
    }

    return NextResponse.json({ lead, saved: false });
  } catch (error) {
    console.error("Error en /api/audit:", error);
    return NextResponse.json(
      { error: "Ocurrió un error al analizar el negocio." },
      { status: 500 }
    );
  }
}
