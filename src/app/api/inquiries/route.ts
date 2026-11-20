import { NextResponse } from "next/server";
import { createAnalyzedLead } from "@/lib/auditor";
import {
  addInquiry,
  getAllInquiries,
  getLeadById,
  updateInquiryStatus,
  updateLeadFields,
  upsertLead,
} from "@/lib/db";
import { InboundInquiry, RubroId } from "@/types";

export async function GET() {
  try {
    const inquiries = await getAllInquiries();
    return NextResponse.json({ inquiries });
  } catch (error) {
    console.error("Error en GET /api/inquiries:", error);
    return NextResponse.json(
      { error: "No se pudieron obtener las consultas." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      businessName?: string;
      contactName?: string;
      phone?: string;
      email?: string;
      rubro?: RubroId;
      city?: string;
      currentPainPoint?: string;
      website?: string;
      leadId?: string;
    };

    const businessName = body.businessName?.trim();
    const contactName = body.contactName?.trim();
    const phone = body.phone?.trim();

    if (!businessName || !contactName || !phone) {
      return NextResponse.json(
        {
          error:
            "Por favor completa el nombre del local, tu nombre y tu WhatsApp o teléfono.",
        },
        { status: 400 }
      );
    }

    let linkedLeadId = body.leadId;
    const rubro: RubroId = body.rubro || "otros";

    if (linkedLeadId) {
      const existing = await getLeadById(linkedLeadId);
      if (existing) {
        await updateLeadFields(linkedLeadId, {
          status: existing.status === "cerrado" ? "cerrado" : "interesado",
          clientViewedProposal: true,
          clientRequestedInfo: true,
          clientMessage:
            body.currentPainPoint?.trim() ||
            "Solicitó más información desde su link de diagnóstico.",
          phone: existing.phone || phone,
        });
      } else {
        linkedLeadId = undefined;
      }
    }

    if (!linkedLeadId) {
      const createdLead = await createAnalyzedLead({
        name: businessName,
        rubro,
        city: body.city || "Consulta Web",
        phone,
        website: body.website,
        notes: `Consulta entrante de ${contactName}: ${
          body.currentPainPoint?.trim() || "Pidió más información desde la web."
        }`,
        source: "web-publica",
      });
      createdLead.status = "interesado";
      createdLead.clientRequestedInfo = true;
      createdLead.clientMessage = body.currentPainPoint?.trim();
      const savedLead = await upsertLead(createdLead);
      linkedLeadId = savedLead.id;
    }

    const inquiry: InboundInquiry = {
      id: `inq-${crypto.randomUUID().slice(0, 8)}`,
      businessName,
      contactName,
      phone,
      email: body.email?.trim() || undefined,
      rubro,
      currentPainPoint:
        body.currentPainPoint?.trim() ||
        "Solicitó asesoramiento personalizado sobre web y sistema para su rubro.",
      website: body.website?.trim() || undefined,
      leadId: linkedLeadId,
      createdAt: new Date().toISOString(),
      status: "pendiente",
    };

    const savedInquiry = await addInquiry(inquiry);

    return NextResponse.json(
      { inquiry: savedInquiry, leadId: linkedLeadId },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error en POST /api/inquiries:", error);
    return NextResponse.json(
      { error: "No se pudo registrar tu solicitud." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const body = (await req.json()) as {
      id?: string;
      status?: InboundInquiry["status"];
    };
    if (!body.id || !body.status) {
      return NextResponse.json(
        { error: "Faltan datos para actualizar la consulta." },
        { status: 400 }
      );
    }
    const updated = await updateInquiryStatus(body.id, body.status);
    if (!updated) {
      return NextResponse.json(
        { error: "Consulta no encontrada." },
        { status: 404 }
      );
    }
    return NextResponse.json({ inquiry: updated });
  } catch (error) {
    console.error("Error en PATCH /api/inquiries:", error);
    return NextResponse.json(
      { error: "No se pudo actualizar la consulta." },
      { status: 500 }
    );
  }
}
