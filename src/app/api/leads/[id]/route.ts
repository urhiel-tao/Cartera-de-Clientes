import { NextResponse } from "next/server";
import { deleteLeadById, getLeadById, updateLeadFields } from "@/lib/db";
import { Lead } from "@/types";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const lead = await getLeadById(id);
  if (!lead) {
    return NextResponse.json(
      { error: "Prospecto no encontrado." },
      { status: 404 }
    );
  }
  return NextResponse.json({ lead });
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = (await req.json()) as Partial<Lead>;
    const updated = await updateLeadFields(id, body);
    if (!updated) {
      return NextResponse.json(
        { error: "Prospecto no encontrado." },
        { status: 404 }
      );
    }
    return NextResponse.json({ lead: updated });
  } catch (error) {
    console.error("Error en PATCH /api/leads/[id]:", error);
    return NextResponse.json(
      { error: "No se pudo actualizar el prospecto." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const deleted = await deleteLeadById(id);
  if (!deleted) {
    return NextResponse.json(
      { error: "Prospecto no encontrado." },
      { status: 404 }
    );
  }
  return NextResponse.json({ ok: true });
}
