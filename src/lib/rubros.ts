import { RubroDefinition, RubroId } from "@/types";

export const RUBROS: Record<RubroId, RubroDefinition> = {
  gastronomia: {
    id: "gastronomia",
    name: "Gastronomía y Cafeterías",
    shortName: "Gastronomía",
    description:
      "Restaurantes, bares, cafeterías, pizzerías, rotiserías y locales de comida con atención en salón o delivery.",
    iconName: "UtensilsCrossed",
    accentColor: "orange",
    badgeClasses: "bg-orange-50 text-orange-700 border-orange-200",
    osmFilters: [
      '["amenity"~"restaurant|cafe|bar|fast_food|bakery|ice_cream"]',
    ],
    searchKeywords: [
      "restaurante",
      "cafeteria",
      "bar",
      "pizzeria",
      "comida",
      "panaderia",
      "hamburgueseria",
    ],
    commonProblems: [
      "Pagos altos de comisiones a apps de delivery (25%-35%)",
      "Menú desactualizado en PDF o fotos difíciles de leer en el celular",
      "Pedidos por WhatsApp desordenados y demoras en horarios pico",
      "Falta de reservas online de mesas o control simple de caja",
    ],
    recommendedWebTitle: "Web con Carta Digital QR y Pedidos Directos",
    recommendedSystemTitle: "Sistema de Pedidos, Mesas y Control de Caja",
    recommendedModules: [
      "Carta digital QR autoadministrable (precios y stock en 1 clic)",
      "Carrito de pedidos directos a WhatsApp / cocina sin comisiones",
      "Sistema de reservas de mesas y turnos",
      "Control de caja diaria, comandas y reporte de platos más vendidos",
    ],
    expectedImpact: [
      "Ahorro en comisiones de terceros al pasar clientes a canal propio",
      "Aumento del ticket promedio con fotos y combos destacados",
      "Atención más ágil sin errores en los pedidos",
    ],
    suggestedValueUsd: 550,
    todayVsOptimized: {
      today: [
        "Clientes pidiendo la carta por chat o esperando al mozo",
        "Precios desactualizados en PDFs viejos o redes sociales",
        "Pedidos anotados en papel con riesgo de confusión",
        "Dependencia total de apps con altas comisiones",
      ],
      optimized: [
        "Carta interactiva rápida desde Google o código QR en mesa",
        "Pedidos claros con detalle, extras y envío calculado al instante",
        "Panel de comandas y caja diaria en tiempo real",
        "Base de clientes recurrentes para promociones directas",
      ],
    },
  },
  salud: {
    id: "salud",
    name: "Salud y Consultorios",
    shortName: "Salud",
    description:
      "Clínicas, odontólogos, kinesiólogos, psicólogos, centros médicos, ópticas y veterinarias.",
    iconName: "Stethoscope",
    accentColor: "emerald",
    badgeClasses: "bg-emerald-50 text-emerald-700 border-emerald-200",
    osmFilters: [
      '["amenity"~"clinic|dentist|doctors|pharmacy|veterinary|hospital"]',
      '["healthcare"]',
    ],
    searchKeywords: [
      "clinica",
      "odontologia",
      "consultorio",
      "medico",
      "veterinaria",
      "farmacia",
      "kinesiologia",
    ],
    commonProblems: [
      "Secretaría saturada respondiendo mensajes para coordinar horarios",
      "Pacientes que faltan por no recibir recordatorios automáticos",
      "Historias clínicas o fichas de pacientes dispersas en papel o Excel",
      "Ausencia en búsquedas de Google cuando buscan especialistas en la zona",
    ],
    recommendedWebTitle: "Web Institucional con Agenda de Turnos Médicos",
    recommendedSystemTitle: "Sistema de Turnos, Recordatorios e Historial Clínico",
    recommendedModules: [
      "Turnero online 24/7 por profesional, especialidad y obra social",
      "Recordatorios automáticos por WhatsApp para reducir inasistencias",
      "Ficha digital del paciente e historial de consultas/estudios",
      "Panel de liquidación por profesional y control de consultorios",
    ],
    expectedImpact: [
      "Hasta 60% menos ausentismo gracias a confirmaciones previas",
      "Menos carga operativa en recepción durante el horario de atención",
      "Mayor captación de nuevos pacientes desde Google Maps y web",
    ],
    suggestedValueUsd: 750,
    todayVsOptimized: {
      today: [
        "Turnos coordinados uno por uno por WhatsApp o teléfono",
        "Huecos en la agenda por olvidos de último momento",
        "Búsqueda lenta de antecedentes en carpetas o planillas",
        "Sin visibilidad clara de especialidades y horarios en Google",
      ],
      optimized: [
        "Reserva automática online con confirmación inmediata",
        "Recordatorios previos que liberan y reasignan turnos cancelados",
        "Historia clínica digital ordenada y accesible en segundos",
        "Web profesional que transmite confianza médica desde el primer clic",
      ],
    },
  },
  estetica: {
    id: "estetica",
    name: "Estética, Barberías y Bienestar",
    shortName: "Estética y Barbería",
    description:
      "Peluquerías, barberías, spas, centros de estética, uñas, depilación y gimnasios.",
    iconName: "Scissors",
    accentColor: "fuchsia",
    badgeClasses: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200",
    osmFilters: [
      '["shop"~"hairdresser|beauty|massage|cosmetics"]',
      '["leisure"~"fitness_centre|sports_centre"]',
    ],
    searchKeywords: [
      "peluqueria",
      "barberia",
      "estetica",
      "spa",
      "unas",
      "gimnasio",
      "belleza",
    ],
    commonProblems: [
      "Se pierden clientes fuera de horario porque no pueden agendar solos",
      "Doble reserva o confusión entre agendas de distintos estilistas",
      "No tienen seña online ni recordatorio y sufren plantones",
      "Solo usan Instagram y pierden tráfico orgánico en Google",
    ],
    recommendedWebTitle: "Web Visual de Servicios con Reserva Instantánea",
    recommendedSystemTitle: "Sistema de Agenda Multi-Profesional y Fidelización",
    recommendedModules: [
      "Reserva de turnos por servicio, duración y profesional preferido",
      "Confirmación automática y aviso de turno por WhatsApp",
      "Control de comisiones por estilista y caja por servicios/productos",
      "Historial de visitas, preferencias y cupones de recompra",
    ],
    expectedImpact: [
      "Agenda completa incluso mientras el local está cerrado",
      "Cero superposición de horarios entre profesionales",
      "Cálculo exacto de comisiones y ventas de productos en segundos",
    ],
    suggestedValueUsd: 490,
    todayVsOptimized: {
      today: [
        "Mensajes acumulados a la noche preguntando '¿tenés turno mañana?'",
        "Agenda de papel o chat con errores de horario",
        "Cálculo manual de comisiones cada fin de semana",
        "Perfil de Instagram sin lista clara de precios ni ubicación SEO",
      ],
      optimized: [
        "Link de reservas 24/7 con disponibilidad real por profesional",
        "Catálogo visual de servicios, tiempos y valores claros",
        "Liquidación automática de comisiones y control de ingresos",
        "Ficha profesional en Google conectada a tu propia web",
      ],
    },
  },
  talleres: {
    id: "talleres",
    name: "Talleres y Servicios Técnicos",
    shortName: "Talleres y Servicios",
    description:
      "Talleres mecánicos, lubricentros, servicio técnico de celulares/PC, electricidad, refrigeración y cerrajería.",
    iconName: "Wrench",
    accentColor: "amber",
    badgeClasses: "bg-amber-50 text-amber-700 border-amber-200",
    osmFilters: [
      '["shop"~"car_repair|tyres|car_parts|electronics|repair"]',
      '["craft"~"car_repair|electronics_repair|plumber|electrician"]',
    ],
    searchKeywords: [
      "taller",
      "mecanico",
      "servicio tecnico",
      "lubricentro",
      "gomeria",
      "reparacion",
      "celulares",
    ],
    commonProblems: [
      "Clientes llamando todo el día para preguntar '¿ya está listo mi vehículo/equipo?'",
      "Presupuestos escritos a mano difíciles de seguir o aprobar",
      "Pérdida de historial de reparaciones y repuestos usados por patente o equipo",
      "Web inexistente o desactualizada que no genera confianza para trabajos grandes",
    ],
    recommendedWebTitle: "Web de Servicios + Consulta de Estado de Reparación",
    recommendedSystemTitle: "Sistema de Órdenes de Trabajo, Presupuestos y Stock",
    recommendedModules: [
      "Órdenes de trabajo digitales con fotos de ingreso y diagnóstico",
      "Link de seguimiento en vivo para que el cliente vea el estado sin llamar",
      "Generador rápido de presupuestos en PDF/WhatsApp para aprobación",
      "Historial por vehículo/equipo, recordatorios de service y control de repuestos",
    ],
    expectedImpact: [
      "Reducción drástica de llamadas de consulta durante el trabajo en taller",
      "Imagen súper profesional que justifica mejores honorarios",
      "Mayor recurrencia con avisos automáticos de próximo mantenimiento",
    ],
    suggestedValueUsd: 680,
    todayVsOptimized: {
      today: [
        "Interrupciones constantes en el taller respondiendo consultas de estado",
        "Órdenes de trabajo en papel que se pierden o manchan",
        "Sin registro claro de qué repuesto se colocó ni garantía aplicada",
        "Poca presencia digital para captar flotas o clientes nuevos",
      ],
      optimized: [
        "Portal web donde el cliente ingresa su código y ve avance en vivo",
        "Presupuestos digitales aprobados con un clic desde el celular",
        "Historial completo de trabajos, repuestos y vencimientos de service",
        "Web enfocada en captar urgencias y trabajos programados en tu zona",
      ],
    },
  },
  comercios: {
    id: "comercios",
    name: "Comercios, Tiendas y Ferreterías",
    shortName: "Comercios y Tiendas",
    description:
      "Ferreterías, indumentaria, showrooms, bazares, librerías, pet shops, distribuidoras y almacenes.",
    iconName: "Store",
    accentColor: "blue",
    badgeClasses: "bg-blue-50 text-blue-700 border-blue-200",
    osmFilters: [
      '["shop"~"hardware|clothes|shoes|convenience|supermarket|pet|stationery|furniture|electronics"]',
    ],
    searchKeywords: [
      "ferreteria",
      "tienda",
      "indumentaria",
      "ropa",
      "pet shop",
      "bazar",
      "libreria",
      "comercio",
    ],
    commonProblems: [
      "No tienen catálogo online y responden consultas de precio una por una",
      "Descontrol de stock entre el mostrador físico y lo que venden por redes",
      "Actualizaciones lentas de listas de precios frente a cambios de proveedores",
      "Clientes de la zona compran en grandes plataformas por no saber que el local lo tiene",
    ],
    recommendedWebTitle: "Catálogo Web / Tienda Online Conectada a WhatsApp",
    recommendedSystemTitle: "Sistema de Inventario, Punto de Venta y Listas de Precios",
    recommendedModules: [
      "Catálogo web filtrable por categoría, marca y disponibilidad",
      "Control de stock en tiempo real con alertas de reposición",
      "Actualización masiva de precios por porcentaje o archivo Excel",
      "Punto de venta ágil + ventas mayoristas/minoristas y cuentas corrientes",
    ],
    expectedImpact: [
      "Ventas las 24 hs sin tener que responder cada precio manualmente",
      "Control exacto de mercadería y márgenes de ganancia",
      "Aparición en búsquedas locales de productos específicos en Google",
    ],
    suggestedValueUsd: 650,
    todayVsOptimized: {
      today: [
        "Preguntas constantes por foto y precio en WhatsApp/Instagram",
        "Faltantes de stock descubiertos recién al buscar el producto",
        "Remarcación manual lenta y propensa a errores de margen",
        "Vidriera limitada únicamente a quienes pasan caminando",
      ],
      optimized: [
        "Catálogo online siempre actualizado con buscador rápido",
        "Stock sincronizado con ventas de mostrador y pedidos web",
        "Ajuste masivo de precios por proveedor o rubro en segundos",
        "Vidriera digital abierta todo el día para toda la ciudad",
      ],
    },
  },
  inmobiliarias: {
    id: "inmobiliarias",
    name: "Inmobiliarias y Estudios Profesionales",
    shortName: "Inmobiliarias y Estudios",
    description:
      "Inmobiliarias, desarrolladoras, estudios contables, jurídicos, arquitectura y consultoras.",
    iconName: "Building2",
    accentColor: "indigo",
    badgeClasses: "bg-indigo-50 text-indigo-700 border-indigo-200",
    osmFilters: [
      '["office"~"estate_agent|lawyer|accountant|architect|company|consulting"]',
    ],
    searchKeywords: [
      "inmobiliaria",
      "estudio contable",
      "abogados",
      "arquitectura",
      "consultora",
      "propiedades",
    ],
    commonProblems: [
      "Web lenta, anticuada o sin filtros reales para buscar propiedades/servicios",
      "Seguimiento desordenado de consultas y visitas en planillas aisladas",
      "Falta de portal para clientes o gestión documental centralizada",
      "Pérdida de leads interesados por demoras en responder fuera de horario",
    ],
    recommendedWebTitle: "Portal Web Profesional con Buscador Avanzado y Captación",
    recommendedSystemTitle: "CRM de Propiedades/Casos, Agenda de Visitas y Documentación",
    recommendedModules: [
      "Catálogo con filtros avanzados, mapa interactivo y fichas compartibles",
      "CRM de seguimiento de interesados, visitas y vencimientos de contratos",
      "Generador automático de fichas PDF / links para enviar por WhatsApp",
      "Portal de clientes para descargar comprobantes, planos o avances",
    ],
    expectedImpact: [
      "Posicionamiento profesional superior frente a competidores de la zona",
      "Cero consultas olvidadas gracias al seguimiento automático en CRM",
      "Ahorro de horas semanales enviando información repetitiva",
    ],
    suggestedValueUsd: 890,
    todayVsOptimized: {
      today: [
        "Envío manual de fotos sueltas y textos largos por cada consulta",
        "Prospectos anotados en libretas o chats sin seguimiento",
        "Web desactualizada que no inspira confianza en operaciones altas",
        "Falta de trazabilidad sobre qué cliente vio qué propuesta",
      ],
      optimized: [
        "Fichas web impecables compartibles en un clic con galería y mapa",
        "Embudo CRM para saber exactamente a quién llamar cada día",
        "Captación automatizada con calificación previa de presupuesto y zona",
        "Panel centralizado de contratos, vencimientos y documentación",
      ],
    },
  },
  educacion: {
    id: "educacion",
    name: "Academias, Institutos y Cursos",
    shortName: "Educación y Academias",
    description:
      "Institutos de idiomas, academias de danza/música, centros de capacitación, guarderías y escuelas de manejo.",
    iconName: "GraduationCap",
    accentColor: "teal",
    badgeClasses: "bg-teal-50 text-teal-700 border-teal-200",
    osmFilters: [
      '["amenity"~"school|language_school|music_school|driving_school|kindergarten|training"]',
    ],
    searchKeywords: [
      "academia",
      "instituto",
      "curso",
      "idiomas",
      "danza",
      "capacitacion",
      "escuela",
    ],
    commonProblems: [
      "Inscripciones manuales por formularios sueltos o planillas interminables",
      "Control difícil de cuotas mensuales, morosidad y asistencias",
      "Falta de web clara con programas, horarios y modalidad de cursado",
      "Comunicación dispersa con alumnos o familias",
    ],
    recommendedWebTitle: "Web de Cursos con Pre-Inscripción Online",
    recommendedSystemTitle: "Sistema de Alumnos, Cuotas, Asistencias y Comisiones",
    recommendedModules: [
      "Catálogo de cursos/carreras con temarios, horarios y formulario de inscripción",
      "Control de legajos de alumnos, grupos y registro rápido de asistencia",
      "Gestión de cuotas mensuales, vencimientos y recibos digitales",
      "Portal simple para alumnos con material de estudio y avisos",
    ],
    expectedImpact: [
      "Orden total en cobranzas y reducción de atrasos mensuales",
      "Inscripciones más rápidas durante campañas de inicio de ciclo",
      "Menos trabajo administrativo para directivos y docentes",
    ],
    suggestedValueUsd: 620,
    todayVsOptimized: {
      today: [
        "Control de pagos de cuotas en cuadernos o múltiples Excel",
        "Responder diez veces al día horarios, precios y requisitos",
        "Asistencias en papel difíciles de consolidar a fin de mes",
        "Pérdida de interesados que no encuentran información clara online",
      ],
      optimized: [
        "Web clara con inscripción directa y envío automático de requisitos",
        "Semáforo de cuotas al día y generación de comprobantes en 1 clic",
        "Asistencia digital tomada desde el celular en segundos",
        "Base histórica de alumnos para ofrecer nuevos cursos y niveles",
      ],
    },
  },
  hoteleria: {
    id: "hoteleria",
    name: "Hotelería, Cabañas y Turismo",
    shortName: "Hotelería y Turismo",
    description:
      "Hoteles boutique, cabañas, hostales, complejos turísticos, agencias de viajes y alquiler temporal.",
    iconName: "BedDouble",
    accentColor: "rose",
    badgeClasses: "bg-rose-50 text-rose-700 border-rose-200",
    osmFilters: [
      '["tourism"~"hotel|hostel|guest_house|chalet|motel|apartment|camp_site"]',
    ],
    searchKeywords: [
      "hotel",
      "cabanas",
      "hostal",
      "turismo",
      "alojamiento",
      "posada",
    ],
    commonProblems: [
      "Pagan entre 15% y 20% de comisión a portales externos por reservas directas",
      "Consultas repetitivas de disponibilidad fecha por fecha en WhatsApp",
      "Riesgo de doble reserva al coordinar calendario a mano",
      "Falta de web propia rápida con fotos reales y botón de reserva directa",
    ],
    recommendedWebTitle: "Web de Alojamiento con Motor de Reserva Directa",
    recommendedSystemTitle: "Sistema de Calendario de Unidades, Tarifas y Check-in",
    recommendedModules: [
      "Motor de disponibilidad por fechas y capacidad sin comisiones",
      "Calendario centralizado de cabañas/habitaciones por temporada",
      "Registro digital de huéspedes, señas y saldos pendientes",
      "Web multidispositivo optimizada para viajeros que buscan en Google Maps",
    ],
    expectedImpact: [
      "Más reservas directas con mayor margen de rentabilidad",
      "Respuestas inmediatas con disponibilidad y tarifa exacta",
      "Eliminación de errores de superposición de fechas",
    ],
    suggestedValueUsd: 780,
    todayVsOptimized: {
      today: [
        "Revisar manualmente un calendario para responder si hay lugar",
        "Depender 100% de plataformas intermediarias que cobran comisión",
        "Fotos pesadas enviadas una por una por WhatsApp",
        "Control informal de señas y horarios de check-in/out",
      ],
      optimized: [
        "El huésped consulta fechas, ve fotos y reserva directo en tu web",
        "Tarifas por temporada y disponibilidad actualizadas en un solo lugar",
        "Control ordenado de señas, ingresos y egresos por unidad",
        "Posicionamiento local sólido frente a turistas de paso",
      ],
    },
  },
  otros: {
    id: "otros",
    name: "Servicios y Otros Rubros",
    shortName: "Otros Rubros",
    description:
      "Gimnasios, lavanderías, imprentas, logística, estudios creativos, eventos y todo negocio local.",
    iconName: "Briefcase",
    accentColor: "slate",
    badgeClasses: "bg-slate-100 text-slate-700 border-slate-200",
    osmFilters: [
      '["shop"]',
      '["office"]',
      '["craft"]',
    ],
    searchKeywords: [
      "servicios",
      "negocio",
      "empresa",
      "imprenta",
      "lavanderia",
      "eventos",
      "logistica",
    ],
    commonProblems: [
      "Procesos internos manejados con planillas desconectadas o mensajes sueltos",
      "Falta de presencia web profesional que explique servicios y diferenciales",
      "Demoras al cotizar o hacer seguimiento de clientes interesados",
      "Poca visibilidad frente a competidores mejor posicionados en Google",
    ],
    recommendedWebTitle: "Web Corporativa de Captación y Cotización Rápida",
    recommendedSystemTitle: "Sistema de Gestión a Medida (Clientes, Pedidos y Caja)",
    recommendedModules: [
      "Landing page / web institucional enfocada en conversión y WhatsApp",
      "Formulario inteligente de cotización o solicitud de servicio",
      "Panel interno de clientes, trabajos en curso y facturación simple",
      "Automatización de seguimiento y recordatorios operativos",
    ],
    expectedImpact: [
      "Digitalización adaptada exactamente al flujo real del negocio",
      "Ahorro de horas semanales en tareas repetitivas",
      "Captación constante de clientes desde búsquedas locales",
    ],
    suggestedValueUsd: 590,
    todayVsOptimized: {
      today: [
        "Información dispersa en chats, cuadernos y hojas de cálculo",
        "Poca claridad online sobre qué ofrece el negocio y cómo contratar",
        "Seguimiento manual que hace perder oportunidades de venta",
        "Tareas operativas que consumen el tiempo del dueño",
      ],
      optimized: [
        "Presencia web clara que convierte visitas en consultas reales",
        "Flujo de trabajo ordenado en un sistema simple hecho a medida",
        "Control en tiempo real de clientes, trabajos y rentabilidad",
        "Escalabilidad para atender más clientes sin sumar caos",
      ],
    },
  },
};

export const RUBRO_LIST: RubroDefinition[] = Object.values(RUBROS);

export function getRubroDefinition(rubro: RubroId | string): RubroDefinition {
  if (rubro in RUBROS) {
    return RUBROS[rubro as RubroId];
  }
  return RUBROS.otros;
}

export function inferRubroFromTags(tags: Record<string, string> | undefined, fallback: RubroId): RubroId {
  if (!tags) return fallback;
  const amenity = tags.amenity || "";
  const shop = tags.shop || "";
  const office = tags.office || "";
  const tourism = tags.tourism || "";
  const craft = tags.craft || "";
  const leisure = tags.leisure || "";
  const healthcare = tags.healthcare || "";

  if (/restaurant|cafe|bar|fast_food|bakery|ice_cream/.test(amenity)) return "gastronomia";
  if (/clinic|dentist|doctors|pharmacy|veterinary|hospital/.test(amenity) || Boolean(healthcare)) return "salud";
  if (/hairdresser|beauty|massage|cosmetics/.test(shop) || /fitness_centre|sports_centre/.test(leisure)) return "estetica";
  if (/car_repair|tyres|car_parts|repair/.test(shop) || /car_repair|electronics_repair|plumber|electrician/.test(craft)) return "talleres";
  if (/estate_agent|lawyer|accountant|architect|consulting/.test(office)) return "inmobiliarias";
  if (/school|language_school|music_school|driving_school|kindergarten|training/.test(amenity)) return "educacion";
  if (/hotel|hostel|guest_house|chalet|motel|apartment|camp_site/.test(tourism)) return "hoteleria";
  if (Boolean(shop)) return "comercios";
  return fallback;
}
