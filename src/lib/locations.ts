export interface LocalityNode {
  name: string;
  lat: number;
  lon: number;
  areaCode: string;
  districts: string[];
}

export interface ProvinceNode {
  name: string;
  localities: LocalityNode[];
}

export interface CountryNode {
  name: string;
  phonePrefix: string;
  provinces: ProvinceNode[];
}

function loc(
  name: string,
  lat: number,
  lon: number,
  areaCode: string,
  districts: string[] = ["Centro"]
): LocalityNode {
  return { name, lat, lon, areaCode, districts };
}

function prov(name: string, localities: LocalityNode[]): ProvinceNode {
  return { name, localities };
}

const AR_CABA_BARRIOS = [
  "Agronomía", "Almagro", "Balvanera", "Barracas", "Belgrano", "Boedo",
  "Caballito", "Chacarita", "Coghlan", "Colegiales", "Constitución", "Flores",
  "Floresta", "La Boca", "La Paternal", "Liniers", "Mataderos", "Monte Castro",
  "Monserrat", "Nueva Pompeya", "Núñez", "Palermo", "Parque Avellaneda",
  "Parque Chacabuco", "Parque Chas", "Parque Patricios", "Puerto Madero",
  "Recoleta", "Retiro", "Saavedra", "San Cristóbal", "San Nicolás (Microcentro)",
  "San Telmo", "Vélez Sársfield", "Versalles", "Villa Crespo", "Villa del Parque",
  "Villa Devoto", "Villa General Mitre", "Villa Lugano", "Villa Luro",
  "Villa Ortúzar", "Villa Pueyrredón", "Villa Real", "Villa Riachuelo",
  "Villa Santa Rita", "Villa Soldati", "Villa Urquiza",
];

const DETAILED_COUNTRIES: CountryNode[] = [
  {
    name: "Argentina",
    phonePrefix: "+54 9",
    provinces: [
      prov("Ciudad Autónoma de Buenos Aires", [
        loc("Buenos Aires (CABA)", -34.6037, -58.3816, "11", AR_CABA_BARRIOS),
      ]),
      prov("Buenos Aires (Provincia)", [
        loc("La Plata", -34.9215, -57.9545, "221", ["Centro", "City Bell", "Gonnet", "Los Hornos", "Tolosa", "Ringuelet", "Villa Elisa", "San Carlos", "Altos de San Lorenzo"]),
        loc("Mar del Plata", -38.0055, -57.5426, "223", ["Centro", "Güemes", "Playa Grande", "La Perla", "Puerto", "Constitución", "Los Troncos", "Mogotes"]),
        loc("Vicente López", -34.525, -58.475, "11", ["Olivos", "Vicente López Centro", "Florida", "Munro", "Carapachay", "Villa Martelli", "La Lucila"]),
        loc("San Isidro", -34.4708, -58.5287, "11", ["San Isidro Centro", "Martínez", "Acassuso", "Beccar", "Boulogne", "Villa Adelina"]),
        loc("Tigre", -34.426, -58.5796, "11", ["Tigre Centro", "Nordelta", "Don Torcuato", "General Pacheco", "El Talar", "Benavídez", "Rincón de Milberg"]),
        loc("San Fernando", -34.4417, -58.5583, "11", ["San Fernando Centro", "Victoria", "Virreyes"]),
        loc("Pilar", -34.4587, -58.9142, "11", ["Pilar Centro", "Del Viso", "Villa Rosa", "Presidente Derqui", "Manuel Alberti", "Fátima"]),
        loc("Escobar", -34.3489, -58.7927, "348", ["Belén de Escobar", "Ingeniero Maschwitz", "Garín", "Maquinista Savio", "Matheu"]),
        loc("General San Martín", -34.5764, -58.5364, "11", ["San Martín Centro", "Villa Ballester", "José León Suárez", "San Andrés", "Villa Lynch", "Billinghurst"]),
        loc("Tres de Febrero", -34.605, -58.563, "11", ["Caseros", "Ciudadela", "Santos Lugares", "Ciudad Jardín", "Loma Hermosa", "Villa Bosch"]),
        loc("Morón", -34.6534, -58.6198, "11", ["Morón Centro", "Castelar", "Haedo", "El Palomar", "Villa Sarmiento"]),
        loc("Ituzaingó", -34.658, -58.667, "11", ["Ituzaingó Centro", "Ituzaingó Norte", "Ituzaingó Sur", "Parque Leloir", "Udaondo"]),
        loc("Hurlingham", -34.5883, -58.6361, "11", ["Hurlingham Centro", "Villa Tesei", "William C. Morris"]),
        loc("La Matanza", -34.682, -58.556, "11", ["San Justo", "Ramos Mejía", "Lomas del Mirador", "La Tablada", "Isidro Casanova", "Gregorio de Laferrere", "González Catán", "Ciudad Evita"]),
        loc("Avellaneda", -34.662, -58.365, "11", ["Avellaneda Centro", "Sarandí", "Wilde", "Villa Domínico", "Gerli", "Dock Sud", "Piñeyro"]),
        loc("Lanús", -34.706, -58.391, "11", ["Lanús Oeste", "Lanús Este", "Remedios de Escalada", "Valentín Alsina", "Monte Chingolo"]),
        loc("Lomas de Zamora", -34.7573, -58.4027, "11", ["Lomas Centro", "Banfield", "Temperley", "Turdera", "Llavallol", "Ingeniero Budge"]),
        loc("Almirante Brown", -34.798, -58.394, "11", ["Adrogué", "Burzaco", "Longchamps", "Glew", "Rafael Calzada", "José Mármol", "Claypole"]),
        loc("Quilmes", -34.7242, -58.2526, "11", ["Quilmes Centro", "Bernal", "Don Bosco", "Ezpeleta", "San Francisco Solano"]),
        loc("Berazategui", -34.7633, -58.2117, "11", ["Berazategui Centro", "Ranelagh", "Hudson", "Plátanos", "Sourigues"]),
        loc("Florencio Varela", -34.807, -58.276, "11", ["Varela Centro", "Bosques", "Zeballos", "Ingeniero Allan"]),
        loc("Esteban Echeverría", -34.819, -58.463, "11", ["Monte Grande", "Luis Guillón", "El Jagüel", "9 de Abril"]),
        loc("Ezeiza", -34.854, -58.523, "11", ["Ezeiza Centro", "Canning", "Tristán Suárez", "Carlos Spegazzini"]),
        loc("Moreno", -34.634, -58.791, "11", ["Moreno Centro", "Paso del Rey", "La Reja", "Francisco Álvarez", "Trujui"]),
        loc("Merlo", -34.666, -58.728, "11", ["Merlo Centro", "San Antonio de Padua", "Parque San Martín", "Libertad", "Mariano Acosta"]),
        loc("Bahía Blanca", -38.7183, -62.2663, "291", ["Centro", "Universitario", "Palihue", "Villa Mitre", "Ingeniero White"]),
        loc("Tandil", -37.3217, -59.1332, "249", ["Centro", "Villa Italia", "El Cerrito", "Las Tunitas"]),
        loc("Olavarría", -36.8927, -60.3225, "2284", ["Centro", "Pueblo Nuevo", "Mariano Moreno", "San Vicente"]),
        loc("Junín", -34.585, -60.958, "236", ["Centro", "Pueblo Nuevo", "Belgrano", "Villa Talleres"]),
        loc("Pergamino", -33.89, -60.573, "2477", ["Centro", "Acevedo", "Cruce Caminos"]),
        loc("San Nicolás de los Arroyos", -33.335, -60.225, "336", ["Centro", "Barrio Somisa", "La Emilia"]),
        loc("Zárate", -34.098, -59.028, "3487", ["Centro", "Villa Fox", "Lima"]),
        loc("Campana", -34.168, -58.959, "3489", ["Centro", "Dálmine", "Los Cardales"]),
        loc("Luján", -34.57, -59.105, "2323", ["Centro", "Basílica", "Jáuregui", "Open Door"]),
        loc("Necochea", -38.554, -58.739, "2262", ["Centro", "Villa Díaz Vélez", "Quequén"]),
      ]),
      prov("Córdoba", [
        loc("Córdoba Capital", -31.4201, -64.1888, "351", ["Centro", "Nueva Córdoba", "Alberdi", "General Paz", "Güemes", "Cerro de las Rosas", "Alta Córdoba", "Cofico", "Villa Cabrera", "Jardín", "Urca", "Argüello", "San Vicente", "Observatorio"]),
        loc("Villa Carlos Paz", -31.4241, -64.4978, "3541", ["Centro", "Villa del Lago", "Santa Rita", "La Cuesta", "Sol y Río"]),
        loc("Río Cuarto", -33.1232, -64.3493, "358", ["Centro", "Banda Norte", "Alberdi", "Abilene", "Bimaco"]),
        loc("Villa María", -32.4075, -63.2402, "353", ["Centro", "Ameghino", "Rivadavia", "San Martín", "Lamadrid"]),
        loc("San Francisco", -31.4279, -62.0827, "3564", ["Centro", "Catedral", "Sarmiento", "Consolata"]),
        loc("Alta Gracia", -31.6529, -64.4283, "3547", ["Centro", "El Crucero", "Liniers", "Villa Oviedo"]),
        loc("Jesús María", -30.9815, -64.0942, "3525", ["Centro", "Sierras y Parque", "Costanera"]),
        loc("Río Tercero", -32.173, -64.114, "3571", ["Centro", "Libertador", "Escuela"]),
        loc("Bell Ville", -32.6259, -62.6887, "3537", ["Centro", "Fátima", "Bulevar"]),
        loc("Villa Dolores", -31.945, -65.189, "3544", ["Centro", "San Martín", "Las Encrucijadas"]),
        loc("Cosquín", -31.244, -64.466, "3541", ["Centro", "Pan de Azúcar"]),
        loc("La Falda", -31.089, -64.487, "3548", ["Centro", "Villa Edén"]),
        loc("Villa General Belgrano", -31.978, -64.561, "3546", ["Centro", "La Cumbrecita", "Los Reartes"]),
      ]),
      prov("Santa Fe", [
        loc("Rosario", -32.9468, -60.6393, "341", ["Centro", "Pichincha", "Echesortu", "Fisherton", "Arroyito", "Alberdi / Zona Norte", "Abasto", "República de la Sexta", "Zona Sur / San Martín", "Puerto Norte"]),
        loc("Santa Fe Capital", -31.6107, -60.6973, "342", ["Centro", "Candioti Norte", "Candioti Sur", "Guadalupe", "Puerto", "7 Jefes", "Roma"]),
        loc("Rafaela", -31.2503, -61.4867, "3492", ["Centro", "9 de Julio", "Sarmiento", "Ilolay"]),
        loc("Venado Tuerto", -33.7456, -61.9688, "3462", ["Centro", "San Martín", "Rivadavia"]),
        loc("Reconquista", -29.144, -59.644, "3482", ["Centro", "Chapero", "Moreno"]),
        loc("San Lorenzo", -32.747, -60.733, "3476", ["Centro", "Díaz Vélez", "Bouchard"]),
        loc("Santo Tomé", -31.667, -60.767, "342", ["Centro", "Adelina", "El Tanque"]),
        loc("Villa Gobernador Gálvez", -33.026, -60.633, "341", ["Centro", "Pueblo Nuevo"]),
      ]),
      prov("Mendoza", [
        loc("Mendoza Capital", -32.8895, -68.8458, "261", ["Microcentro", "Quinta Sección / Arístides", "Sexta Sección", "Cuarta Sección", "Bombal"]),
        loc("Godoy Cruz", -32.9277, -68.8414, "261", ["Centro", "Palmares", "Villa Hipódromo", "Benegas", "Trapiche"]),
        loc("Guaymallén", -32.897, -68.798, "261", ["San José", "Dorrego", "Villa Nueva", "Rodeo de la Cruz"]),
        loc("Las Heras", -32.852, -68.828, "261", ["Las Heras Centro", "El Challao", "Panquehua"]),
        loc("Luján de Cuyo", -33.035, -68.878, "261", ["Luján Centro", "Chacras de Coria", "Vistalba", "Carrodilla"]),
        loc("Maipú", -32.98, -68.786, "261", ["Maipú Centro", "Gutiérrez", "Coquimbito", "Luzuriaga"]),
        loc("San Rafael", -34.6177, -68.3301, "260", ["Centro", "Pueblo Diamante", "Las Paredes", "Cuadro Nacional"]),
        loc("San Martín", -33.081, -68.468, "263", ["Centro", "Palmira"]),
      ]),
      prov("Tucumán", [
        loc("San Miguel de Tucumán", -26.8083, -65.2176, "381", ["Centro", "Barrio Norte", "Barrio Sur", "Villa Luján", "Ciudadela", "El Bosque"]),
        loc("Yerba Buena", -26.8167, -65.3167, "381", ["Av. Aconquija", "San José", "Marcos Paz"]),
        loc("Tafí Viejo", -26.733, -65.266, "381", ["Centro", "Lomas de Tafí"]),
        loc("Concepción", -27.345, -65.588, "3865", ["Centro", "Alberdi"]),
      ]),
      prov("Salta", [
        loc("Salta Capital", -24.7821, -65.4232, "387", ["Centro", "Tres Cerritos", "Grand Bourg", "San Lorenzo", "Castañares", "Portezuelo"]),
        loc("San Ramón de la Nueva Orán", -23.137, -64.324, "3878", ["Centro", "Aeroparque"]),
        loc("Tartagal", -22.516, -63.801, "3873", ["Centro", "Villa Güemes"]),
      ]),
      prov("Entre Ríos", [
        loc("Paraná", -31.7333, -60.5333, "343", ["Centro", "Parque Urquiza", "San Agustín", "La Floresta"]),
        loc("Concordia", -31.393, -58.021, "345", ["Centro", "Costanera", "La Bianca"]),
        loc("Gualeguaychú", -33.009, -58.517, "3446", ["Centro", "Costanera", "Pueblo Nuevo"]),
        loc("Concepción del Uruguay", -32.482, -58.237, "3442", ["Centro", "Puerto"]),
      ]),
      prov("Misiones", [
        loc("Posadas", -27.3621, -55.9009, "376", ["Centro", "Villa Sarita", "Costanera", "Itaembé Miní", "Miguel Lanús"]),
        loc("Oberá", -27.487, -55.12, "3755", ["Centro", "Villa Svea"]),
        loc("Puerto Iguazú", -25.599, -54.573, "3757", ["Centro", "600 Hectáreas", "Villa Alta"]),
        loc("Eldorado", -26.401, -54.624, "3751", ["Km 9 Centro", "Km 6"]),
      ]),
      prov("Chaco", [
        loc("Resistencia", -27.4514, -58.9867, "362", ["Centro", "Villa San Martín", "Villa Centenario", "Güiraldes"]),
        loc("Presidencia Roque Sáenz Peña", -26.785, -60.439, "364", ["Centro", "Ensanche Sur"]),
      ]),
      prov("Corrientes", [
        loc("Corrientes Capital", -27.4692, -58.8306, "379", ["Centro", "Costanera", "Cambá Cuá", "Libertad", "San Benito"]),
        loc("Goya", -29.14, -59.265, "3777", ["Centro", "Belgrano"]),
        loc("Paso de los Libres", -29.712, -57.088, "3772", ["Centro", "Puente"]),
      ]),
      prov("Santiago del Estero", [
        loc("Santiago del Estero Capital", -27.7834, -64.2642, "385", ["Centro", "Cabildo", "Alberdi", "Belgrano"]),
        loc("La Banda", -27.734, -64.243, "385", ["Centro", "25 de Mayo"]),
        loc("Termas de Río Hondo", -27.493, -64.859, "3858", ["Centro Termas"]),
      ]),
      prov("San Juan", [
        loc("San Juan Capital", -31.5375, -68.5364, "264", ["Centro", "Desamparados", "Trinidad", "Concepción"]),
        loc("Rivadavia", -31.531, -68.591, "264", ["Rivadavia Centro", "Marquesado"]),
        loc("Rawson", -31.566, -68.533, "264", ["Villa Krause", "Médano de Oro"]),
      ]),
      prov("Jujuy", [
        loc("San Salvador de Jujuy", -24.1858, -65.2995, "388", ["Centro", "Ciudad de Nieva", "Los Perales", "Alto Comedero"]),
        loc("San Pedro de Jujuy", -24.231, -64.866, "3888", ["Centro"]),
        loc("Palpalá", -24.256, -65.211, "388", ["Centro"]),
      ]),
      prov("Río Negro", [
        loc("San Carlos de Bariloche", -41.1335, -71.3103, "294", ["Centro Cívico", "Melipal", "Km 4 - Pioneros", "Belgrano", "Dina Huapi"]),
        loc("General Roca", -39.033, -67.583, "298", ["Centro", "Stefenelli", "J.J. Gómez"]),
        loc("Cipolletti", -38.933, -67.983, "299", ["Centro", "Manzanar", "Rosauer"]),
        loc("Viedma", -40.8135, -62.9967, "2920", ["Centro", "Costanera"]),
      ]),
      prov("Neuquén", [
        loc("Neuquén Capital", -38.9516, -68.0591, "299", ["Centro Este", "Centro Oeste", "Alta Barda", "Santa Genoveva", "Área Centro Sur", "Confluencia"]),
        loc("San Martín de los Andes", -40.1579, -71.3534, "2972", ["Centro", "Vega Maipú"]),
        loc("Plottier", -38.95, -68.233, "299", ["Centro", "Los Canales"]),
        loc("Cutral Có", -38.937, -69.23, "299", ["Centro"]),
      ]),
      prov("Formosa", [
        loc("Formosa Capital", -26.1849, -58.1731, "370", ["Centro", "San Martín", "Circuito Cinco"]),
        loc("Clorinda", -25.284, -57.718, "3718", ["Centro"]),
      ]),
      prov("Chubut", [
        loc("Comodoro Rivadavia", -45.8641, -67.4966, "297", ["Centro", "Rada Tilly", "Km 3", "Km 8"]),
        loc("Puerto Madryn", -42.7692, -65.0385, "280", ["Centro", "Costanera", "Sur"]),
        loc("Trelew", -43.2489, -65.305, "280", ["Centro", "San David"]),
        loc("Esquel", -42.9115, -71.3195, "2945", ["Centro"]),
      ]),
      prov("San Luis", [
        loc("San Luis Capital", -33.3017, -66.3378, "266", ["Centro", "Juana Koslay", "Potrero de los Funes"]),
        loc("Villa Mercedes", -33.6757, -65.4578, "2657", ["Centro", "Estación"]),
        loc("Merlo", -32.3429, -65.014, "2656", ["Centro", "Piedra Blanca", "Rincón del Este"]),
      ]),
      prov("Catamarca", [
        loc("San Fernando del Valle de Catamarca", -28.4696, -65.7795, "383", ["Centro", "Choya", "Villa Cubas"]),
      ]),
      prov("La Rioja", [
        loc("La Rioja Capital", -29.4131, -66.8558, "380", ["Centro", "Vargas", "Evita"]),
        loc("Chilecito", -29.162, -67.497, "3825", ["Centro"]),
      ]),
      prov("La Pampa", [
        loc("Santa Rosa", -36.6167, -64.2833, "2954", ["Centro", "Villa Santillán", "Toay"]),
        loc("General Pico", -35.6566, -63.7568, "2302", ["Centro", "Talleres"]),
      ]),
      prov("Santa Cruz", [
        loc("Río Gallegos", -51.6226, -69.2181, "2966", ["Centro", "San Benito"]),
        loc("El Calafate", -50.3379, -72.2648, "2902", ["Centro"]),
        loc("Caleta Olivia", -46.4393, -67.5281, "297", ["Centro"]),
      ]),
      prov("Tierra del Fuego", [
        loc("Ushuaia", -54.8019, -68.303, "2901", ["Centro", "Andorra", "Pista del Andino"]),
        loc("Río Grande", -53.7877, -67.7095, "2964", ["Centro", "Chacra II", "Margen Sur"]),
      ]),
    ],
  },
  {
    name: "España",
    phonePrefix: "+34",
    provinces: [
      prov("Comunidad de Madrid", [
        loc("Madrid", 40.4168, -3.7038, "91", ["Centro / Sol", "Salamanca", "Chamberí", "Chamartín", "Retiro", "Arganzuela", "Moncloa-Aravaca", "Tetuán", "Carabanchel", "Vallecas"]),
        loc("Alcalá de Henares", 40.4818, -3.3643, "91", ["Centro Histórico", "Ensanche", "Reyes Católicos"]),
        loc("Móstoles", 40.3223, -3.8649, "91", ["Centro", "El Soto", "Coimbra"]),
        loc("Getafe", 40.3083, -3.7327, "91", ["Centro", "Getafe Norte", "El Bercial"]),
      ]),
      prov("Cataluña", [
        loc("Barcelona", 41.3874, 2.1686, "93", ["Eixample", "Ciutat Vella", "Gràcia", "Sarrià-Sant Gervasi", "Sant Martí / Poblenou", "Sants-Montjuïc", "Les Corts"]),
        loc("Girona", 41.9794, 2.8214, "972", ["Barri Vell", "Eixample"]),
        loc("Tarragona", 41.1189, 1.2445, "977", ["Part Alta", "Eixample"]),
        loc("Lleida", 41.6176, 0.62, "973", ["Centro Histórico", "Cappont"]),
      ]),
      prov("Andalucía", [
        loc("Sevilla", 37.3891, -5.9845, "95", ["Casco Antiguo", "Triana", "Nervión", "Los Remedios", "Macarena"]),
        loc("Málaga", 36.7213, -4.4214, "95", ["Centro", "Soho", "Teatinos", "El Palo", "Carretera de Cádiz"]),
        loc("Granada", 37.1773, -3.5986, "958", ["Centro", "Albaicín", "Zaidín", "Realejo"]),
        loc("Córdoba", 37.8882, -4.7794, "957", ["Centro", "Ciudad Jardín", "Vial Norte"]),
        loc("Cádiz", 36.5271, -6.2886, "956", ["Casco Antiguo", "Bahía Blanca"]),
      ]),
      prov("Comunidad Valenciana", [
        loc("Valencia", 39.4699, -0.3763, "96", ["Ciutat Vella", "Ruzafa / Eixample", "Benimaclet", "Campanar", "Poblats Marítims"]),
        loc("Alicante", 38.3452, -0.481, "96", ["Centro", "Playa San Juan", "Carolinas"]),
        loc("Castellón de la Plana", 39.9864, -0.0513, "964", ["Centro", "Grao"]),
      ]),
      prov("País Vasco", [
        loc("Bilbao", 43.263, -2.935, "94", ["Abando / Indautxu", "Casco Viejo", "Deusto"]),
        loc("San Sebastián", 43.3183, -1.9812, "943", ["Centro", "Gros", "Antiguo"]),
        loc("Vitoria-Gasteiz", 42.8467, -2.6716, "945", ["Centro", "Ensanche"]),
      ]),
      prov("Galicia", [
        loc("A Coruña", 43.3623, -8.4115, "981", ["Centro", "Riazor", "Los Mallos"]),
        loc("Vigo", 42.2406, -8.7207, "986", ["Centro", "Coia", "Bouzas"]),
        loc("Santiago de Compostela", 42.8782, -8.5448, "981", ["Zona Vieja", "Ensanche"]),
      ]),
      prov("Aragón", [loc("Zaragoza", 41.6488, -0.8891, "976", ["Centro", "Delicias", "Actur", "Universidad"])]),
      prov("Castilla y León", [loc("Valladolid", 41.6523, -4.7245, "983", ["Centro", "Parquesol", "Delicias"])]),
      prov("Islas Baleares", [loc("Palma de Mallorca", 39.5696, 2.6502, "971", ["Centro", "Santa Catalina", "Paseo Marítimo"])]),
      prov("Canarias", [loc("Las Palmas de Gran Canaria", 28.1235, -15.4363, "928", ["Triana", "Vegueta", "Mesa y López"]), loc("Santa Cruz de Tenerife", 28.4636, -16.2518, "922", ["Centro", "Toscal"])]),
      prov("Región de Murcia", [loc("Murcia", 37.9922, -1.1307, "968", ["Centro", "El Carmen", "Juan Carlos I"])]),
      prov("Principado de Asturias", [loc("Oviedo", 43.3619, -5.8494, "98", ["Centro", "Uría"]), loc("Gijón", 43.5322, -5.6611, "98", ["Centro", "La Arena"])]),
      prov("Castilla-La Mancha", [loc("Toledo", 39.8628, -4.0273, "925", ["Casco Histórico", "Santa Bárbara"])]),
      prov("Navarra", [loc("Pamplona", 42.8125, -1.6458, "948", ["Casco Antiguo", "Ensanche", "Iturrama"])]),
      prov("Cantabria", [loc("Santander", 43.4623, -3.8099, "942", ["Centro", "El Sardinero"])]),
      prov("Extremadura", [loc("Badajoz", 38.8794, -6.9707, "924", ["Centro", "Valdepasillas"])]),
      prov("La Rioja", [loc("Logroño", 42.4627, -2.4449, "941", ["Centro", "Laurel"])]),
    ],
  },
  {
    name: "México",
    phonePrefix: "+52",
    provinces: [
      prov("Ciudad de México", [loc("Ciudad de México", 19.4326, -99.1332, "55", ["Roma Norte", "Condesa", "Polanco", "Coyoacán", "Del Valle", "Nápoles", "Centro Histórico", "Santa Fe"])]),
      prov("Estado de México", [loc("Naucalpan / Satélite", 19.4785, -99.2397, "55", ["Ciudad Satélite", "Lomas Verdes", "Interlomas"]), loc("Toluca", 19.2826, -99.6557, "722", ["Centro", "Metepec"])]),
      prov("Jalisco", [loc("Guadalajara", 20.6597, -103.3496, "33", ["Centro", "Providencia", "Americana / Chapultepec", "Chapalita", "Zapopan Centro", "Andares"])]),
      prov("Nuevo León", [loc("Monterrey", 25.6866, -100.3161, "81", ["Centro", "San Pedro Garza García", "Cumbres", "Valle Oriente", "Barrio Antiguo"])]),
      prov("Puebla", [loc("Puebla", 19.0414, -98.2063, "222", ["Centro", "Angelópolis", "Cholula", "La Paz"])]),
      prov("Querétaro", [loc("Santiago de Querétaro", 20.5888, -100.3899, "442", ["Centro", "Juriquilla", "Álamos"])]),
      prov("Guanajuato", [loc("León", 21.125, -101.686, "477", ["Centro", "Campestre", "Zona Piel"])]),
      prov("Yucatán", [loc("Mérida", 20.9674, -89.5926, "999", ["Centro", "Montejo", "Norte / Altabrisa"])]),
      prov("Quintana Roo", [loc("Cancún", 21.1619, -86.8515, "998", ["Centro", "Zona Hotelera", "Puerto Cancún"]), loc("Playa del Carmen", 20.6296, -87.0739, "984", ["Centro", "Quinta Avenida"])]),
      prov("Baja California", [loc("Tijuana", 32.5149, -117.0382, "664", ["Zona Río", "Centro", "Playas"])]),
      prov("Veracruz", [loc("Veracruz", 19.1738, -96.1342, "229", ["Centro", "Boca del Río"])]),
      prov("Chihuahua", [loc("Chihuahua", 28.633, -106.0691, "614", ["Centro", "San Felipe"])]),
      prov("Aguascalientes", [loc("Aguascalientes", 21.8853, -102.2916, "449", ["Centro", "Norte"])]),
      prov("Baja California Sur", [loc("La Paz", 24.1426, -110.3128, "612", ["Centro", "Malecón"])]),
      prov("Campeche", [loc("San Francisco de Campeche", 19.8301, -90.5349, "981", ["Centro"])]),
      prov("Chiapas", [loc("Tuxtla Gutiérrez", 16.7528, -93.1152, "961", ["Centro", "Poniente"])]),
      prov("Coahuila", [loc("Saltillo", 25.4232, -101.0053, "844", ["Centro", "Norte"])]),
      prov("Colima", [loc("Colima", 19.2452, -103.7241, "312", ["Centro"])]),
      prov("Durango", [loc("Victoria de Durango", 24.0277, -104.6532, "618", ["Centro"])]),
      prov("Guerrero", [loc("Acapulco", 16.8531, -99.8237, "744", ["Costera", "Diamante"])]),
      prov("Hidalgo", [loc("Pachuca", 20.1011, -98.7591, "771", ["Centro", "Zona Plateada"])]),
      prov("Michoacán", [loc("Morelia", 19.706, -101.195, "443", ["Centro", "Altozano"])]),
      prov("Morelos", [loc("Cuernavaca", 18.9242, -99.2216, "777", ["Centro", "Vista Hermosa"])]),
      prov("Nayarit", [loc("Tepic", 21.5042, -104.8946, "311", ["Centro"])]),
      prov("Oaxaca", [loc("Oaxaca de Juárez", 17.0732, -96.7266, "951", ["Centro", "Reforma"])]),
      prov("San Luis Potosí", [loc("San Luis Potosí", 22.1565, -100.9855, "444", ["Centro", "Lomas"])]),
      prov("Sinaloa", [loc("Culiacán", 24.8091, -107.394, "667", ["Centro", "Tres Ríos"])]),
      prov("Sonora", [loc("Hermosillo", 29.0729, -110.9559, "662", ["Centro", "Pitic"])]),
      prov("Tabasco", [loc("Villahermosa", 17.9895, -92.9475, "993", ["Centro", "Tabasco 2000"])]),
      prov("Tamaulipas", [loc("Tampico", 22.2331, -97.8611, "833", ["Centro", "Petrolera"])]),
      prov("Tlaxcala", [loc("Tlaxcala", 19.3182, -98.2375, "246", ["Centro"])]),
      prov("Zacatecas", [loc("Zacatecas", 22.7709, -102.5832, "492", ["Centro"])]),
    ],
  },
  {
    name: "Chile",
    phonePrefix: "+56 9",
    provinces: [
      prov("Región Metropolitana de Santiago", [loc("Santiago", -33.4489, -70.6693, "2", ["Providencia", "Las Condes", "Santiago Centro", "Ñuñoa", "Vitacura", "La Reina", "Maipú", "La Florida"])]),
      prov("Valparaíso", [loc("Viña del Mar", -33.0153, -71.55, "32", ["Centro", "Reñaca", "Miraflores"]), loc("Valparaíso", -33.0472, -71.6127, "32", ["Plan", "Cerro Alegre", "Cerro Concepción"])]),
      prov("Biobío", [loc("Concepción", -36.8201, -73.0444, "41", ["Centro", "San Pedro de la Paz", "Talcahuano"])]),
      prov("Antofagasta", [loc("Antofagasta", -23.6509, -70.3975, "55", ["Centro", "Sector Sur"])]),
      prov("Coquimbo", [loc("La Serena", -29.9027, -71.2519, "51", ["Centro", "Avenida del Mar"])]),
      prov("Araucanía", [loc("Temuco", -38.7359, -72.5904, "45", ["Centro", "Avenida Alemania"])]),
      prov("Los Lagos", [loc("Puerto Montt", -41.4689, -72.9411, "65", ["Centro", "Pelluco"]), loc("Puerto Varas", -41.3167, -72.9833, "65", ["Centro"])]),
      prov("O'Higgins", [loc("Rancagua", -34.1708, -70.7444, "72", ["Centro"])]),
      prov("Maule", [loc("Talca", -35.4264, -71.6554, "71", ["Centro"])]),
      prov("Arica y Parinacota", [loc("Arica", -18.4783, -70.3126, "58", ["Centro"])]),
      prov("Tarapacá", [loc("Iquique", -20.2307, -70.1357, "57", ["Centro", "Cavancha"])]),
      prov("Atacama", [loc("Copiapó", -27.3668, -70.3314, "52", ["Centro"])]),
      prov("Ñuble", [loc("Chillán", -36.6063, -72.1034, "42", ["Centro"])]),
      prov("Los Ríos", [loc("Valdivia", -39.8196, -73.2452, "63", ["Centro", "Isla Teja"])]),
      prov("Aysén", [loc("Coyhaique", -45.5712, -72.0685, "67", ["Centro"])]),
      prov("Magallanes", [loc("Punta Arenas", -53.1638, -70.9171, "61", ["Centro"])]),
    ],
  },
  {
    name: "Uruguay",
    phonePrefix: "+598",
    provinces: [
      prov("Montevideo", [loc("Montevideo", -34.9011, -56.1645, "99", ["Pocitos", "Centro", "Cordón", "Carrasco", "Punta Carretas", "Parque Rodó", "Prado", "Malvín"])]),
      prov("Canelones", [loc("Ciudad de la Costa", -34.8167, -55.95, "99", ["Solymar", "Lagomar", "Shangrilá"]), loc("Las Piedras", -34.73, -56.219, "99", ["Centro"])]),
      prov("Maldonado", [loc("Punta del Este", -34.9667, -54.95, "99", ["Península", "La Barra", "Roosevelt"]), loc("Maldonado", -34.9089, -54.958, "99", ["Centro"])]),
      prov("Colonia", [loc("Colonia del Sacramento", -34.4626, -57.8398, "99", ["Centro", "Barrio Histórico"])]),
      prov("Salto", [loc("Salto", -31.3833, -57.9667, "99", ["Centro"])]),
      prov("Paysandú", [loc("Paysandú", -32.3214, -58.0756, "99", ["Centro"])]),
      prov("Rocha", [loc("Rocha", -34.4833, -54.3333, "99", ["Centro", "La Paloma"])]),
      prov("San José", [loc("San José de Mayo", -34.3375, -56.7136, "99", ["Centro"])]),
      prov("Soriano", [loc("Mercedes", -33.2524, -58.0305, "99", ["Centro"])]),
      prov("Rivera", [loc("Rivera", -30.9053, -55.5508, "99", ["Centro"])]),
      prov("Tacuarembó", [loc("Tacuarembó", -31.7169, -55.9811, "99", ["Centro"])]),
      prov("Cerro Largo", [loc("Melo", -32.3703, -54.1675, "99", ["Centro"])]),
      prov("Florida", [loc("Florida", -34.0956, -56.2142, "99", ["Centro"])]),
      prov("Lavalleja", [loc("Minas", -34.3759, -55.2377, "99", ["Centro"])]),
      prov("Durazno", [loc("Durazno", -33.3806, -56.5236, "99", ["Centro"])]),
      prov("Artigas", [loc("Artigas", -30.407, -56.467, "99", ["Centro"])]),
      prov("Río Negro", [loc("Fray Bentos", -33.1165, -58.3107, "99", ["Centro"])]),
      prov("Treinta y Tres", [loc("Treinta y Tres", -33.2333, -54.3833, "99", ["Centro"])]),
      prov("Flores", [loc("Trinidad", -33.5165, -56.8996, "99", ["Centro"])]),
    ],
  },
  {
    name: "Colombia",
    phonePrefix: "+57",
    provinces: [
      prov("Bogotá D.C.", [loc("Bogotá", 4.711, -74.0721, "601", ["Chapinero", "Usaquén", "Teusaquillo", "Suba", "Zona T", "La Candelaria", "Cedritos"])]),
      prov("Antioquia", [loc("Medellín", 6.2442, -75.5812, "604", ["El Poblado", "Laureles", "Envigado", "Belén", "Sabaneta", "Centro"])]),
      prov("Valle del Cauca", [loc("Cali", 3.4516, -76.532, "602", ["Granada", "San Fernando", "Ciudad Jardín", "El Peñón"])]),
      prov("Atlántico", [loc("Barranquilla", 10.9685, -74.7813, "605", ["El Prado", "Alto Prado", "Riomar"])]),
      prov("Bolívar", [loc("Cartagena", 10.391, -75.4794, "605", ["Centro Amurallado", "Bocagrande", "Manga"])]),
      prov("Santander", [loc("Bucaramanga", 7.1193, -73.1227, "607", ["Cabecera", "Centro"])]),
      prov("Risaralda", [loc("Pereira", 4.8087, -75.6906, "606", ["Centro", "Álamos"])]),
      prov("Cundinamarca", [loc("Chía", 4.8616, -74.0326, "601", ["Centro"])]),
    ],
  },
  {
    name: "Perú",
    phonePrefix: "+51",
    provinces: [
      prov("Lima", [loc("Lima", -12.0464, -77.0428, "1", ["Miraflores", "San Isidro", "Barranco", "Santiago de Surco", "San Borja", "Magdalena", "Jesús María", "Los Olivos"])]),
      prov("Arequipa", [loc("Arequipa", -16.409, -71.5375, "54", ["Cercado", "Yanahuara", "Cayma"])]),
      prov("Cusco", [loc("Cusco", -13.5319, -71.9675, "84", ["Centro Histórico", "Wanchaq", "San Blas"])]),
      prov("La Libertad", [loc("Trujillo", -8.1116, -79.0288, "44", ["Centro", "Víctor Larco"])]),
      prov("Piura", [loc("Piura", -5.1945, -80.6328, "73", ["Centro", "Castilla"])]),
      prov("Lambayeque", [loc("Chiclayo", -6.7714, -79.8409, "74", ["Centro"])]),
    ],
  },
  {
    name: "Paraguay",
    phonePrefix: "+595",
    provinces: [
      prov("Asunción", [loc("Asunción", -25.2637, -57.5759, "21", ["Centro", "Villa Morra", "Carmelitas", "Sajonia"])]),
      prov("Alto Paraná", [loc("Ciudad del Este", -25.5097, -54.6111, "61", ["Microcentro", "Área 1"])]),
      prov("Itapúa", [loc("Encarnación", -27.3306, -55.8667, "71", ["Centro", "Costanera"])]),
      prov("Central", [loc("San Lorenzo", -25.3397, -57.5088, "21", ["Centro"]), loc("Luque", -25.2667, -57.4872, "21", ["Centro"])]),
    ],
  },
  {
    name: "Bolivia",
    phonePrefix: "+591",
    provinces: [
      prov("Santa Cruz", [loc("Santa Cruz de la Sierra", -17.7833, -63.1821, "3", ["Equipetrol", "Casco Viejo", "Urubó"])]),
      prov("La Paz", [loc("La Paz", -16.4897, -68.1193, "2", ["Centro", "Sopocachi", "Zona Sur / Calacoto"])]),
      prov("Cochabamba", [loc("Cochabamba", -17.3895, -66.1568, "4", ["Centro", "Cala Cala"])]),
    ],
  },
  {
    name: "Ecuador",
    phonePrefix: "+593",
    provinces: [
      prov("Pichincha", [loc("Quito", -0.1807, -78.4678, "2", ["La Carolina", "La Mariscal", "Centro Histórico", "Cumbayá"])]),
      prov("Guayas", [loc("Guayaquil", -2.1709, -79.9224, "4", ["Urdesa", "Samborondón", "Centro", "Kennedy"])]),
      prov("Azuay", [loc("Cuenca", -2.9001, -79.0059, "7", ["Centro Histórico", "El Vergel"])]),
    ],
  },
  {
    name: "Estados Unidos",
    phonePrefix: "+1",
    provinces: [
      prov("Florida", [loc("Miami", 25.7617, -80.1918, "305", ["Brickell", "Downtown", "Wynwood", "Coral Gables", "Doral"]), loc("Orlando", 28.5383, -81.3792, "407", ["Downtown", "Kissimmee"])]),
      prov("New York", [loc("New York City", 40.7128, -74.006, "212", ["Manhattan", "Brooklyn", "Queens"])]),
      prov("California", [loc("Los Angeles", 34.0522, -118.2437, "213", ["Downtown", "Hollywood", "Santa Monica"]), loc("San Francisco", 37.7749, -122.4194, "415", ["SoMa", "Mission"])]),
      prov("Texas", [loc("Houston", 29.7604, -95.3698, "713", ["Downtown", "Midtown"]), loc("Austin", 30.2672, -97.7431, "512", ["Downtown"])]),
    ],
  },
  {
    name: "Brasil",
    phonePrefix: "+55",
    provinces: [
      prov("São Paulo", [loc("São Paulo", -23.5505, -46.6333, "11", ["Pinheiros", "Vila Madalena", "Jardins", "Centro"])]),
      prov("Rio de Janeiro", [loc("Rio de Janeiro", -22.9068, -43.1729, "21", ["Copacabana", "Ipanema", "Botafogo", "Centro"])]),
      prov("Rio Grande do Sul", [loc("Porto Alegre", -30.0346, -51.2177, "51", ["Centro Histórico", "Moinhos de Vento"])]),
    ],
  },
];

// Lista completa adicional de países del mundo (para desplegar absolutamente todos los países)
const ADDITIONAL_WORLD_COUNTRIES: Array<{ name: string; prefix: string; capital: string }> = [
  { name: "Afganistán", prefix: "+93", capital: "Kabul" },
  { name: "Albania", prefix: "+355", capital: "Tirana" },
  { name: "Alemania", prefix: "+49", capital: "Berlín" },
  { name: "Andorra", prefix: "+376", capital: "Andorra la Vieja" },
  { name: "Angola", prefix: "+244", capital: "Luanda" },
  { name: "Arabia Saudita", prefix: "+966", capital: "Riad" },
  { name: "Argelia", prefix: "+213", capital: "Argel" },
  { name: "Armenia", prefix: "+374", capital: "Ereván" },
  { name: "Australia", prefix: "+61", capital: "Sídney" },
  { name: "Austria", prefix: "+43", capital: "Viena" },
  { name: "Bélgica", prefix: "+32", capital: "Bruselas" },
  { name: "Belice", prefix: "+501", capital: "Ciudad de Belice" },
  { name: "Bielorrusia", prefix: "+375", capital: "Minsk" },
  { name: "Bulgaria", prefix: "+359", capital: "Sofía" },
  { name: "Canadá", prefix: "+1", capital: "Toronto" },
  { name: "Catar", prefix: "+974", capital: "Doha" },
  { name: "China", prefix: "+86", capital: "Pekín" },
  { name: "Corea del Sur", prefix: "+82", capital: "Seúl" },
  { name: "Costa Rica", prefix: "+506", capital: "San José" },
  { name: "Croacia", prefix: "+385", capital: "Zagreb" },
  { name: "Cuba", prefix: "+53", capital: "La Habana" },
  { name: "Dinamarca", prefix: "+45", capital: "Copenhague" },
  { name: "Egipto", prefix: "+20", capital: "El Cairo" },
  { name: "El Salvador", prefix: "+503", capital: "San Salvador" },
  { name: "Emiratos Árabes Unidos", prefix: "+971", capital: "Dubái" },
  { name: "Eslovaquia", prefix: "+421", capital: "Bratislava" },
  { name: "Eslovenia", prefix: "+386", capital: "Liubliana" },
  { name: "Estonia", prefix: "+372", capital: "Tallin" },
  { name: "Filipinas", prefix: "+63", capital: "Manila" },
  { name: "Finlandia", prefix: "+358", capital: "Helsinki" },
  { name: "Francia", prefix: "+33", capital: "París" },
  { name: "Grecia", prefix: "+30", capital: "Atenas" },
  { name: "Guatemala", prefix: "+502", capital: "Ciudad de Guatemala" },
  { name: "Haití", prefix: "+509", capital: "Puerto Príncipe" },
  { name: "Honduras", prefix: "+504", capital: "Tegucigalpa" },
  { name: "Hungría", prefix: "+36", capital: "Budapest" },
  { name: "India", prefix: "+91", capital: "Nueva Delhi" },
  { name: "Indonesia", prefix: "+62", capital: "Yakarta" },
  { name: "Irlanda", prefix: "+353", capital: "Dublín" },
  { name: "Islandia", prefix: "+354", capital: "Reikiavik" },
  { name: "Israel", prefix: "+972", capital: "Tel Aviv" },
  { name: "Italia", prefix: "+39", capital: "Roma" },
  { name: "Jamaica", prefix: "+1", capital: "Kingston" },
  { name: "Japón", prefix: "+81", capital: "Tokio" },
  { name: "Letonia", prefix: "+371", capital: "Riga" },
  { name: "Lituania", prefix: "+370", capital: "Vilna" },
  { name: "Luxemburgo", prefix: "+352", capital: "Luxemburgo" },
  { name: "Malasia", prefix: "+60", capital: "Kuala Lumpur" },
  { name: "Marruecos", prefix: "+212", capital: "Casablanca" },
  { name: "Nicaragua", prefix: "+505", capital: "Managua" },
  { name: "Noruega", prefix: "+47", capital: "Oslo" },
  { name: "Nueva Zelanda", prefix: "+64", capital: "Auckland" },
  { name: "Países Bajos", prefix: "+31", capital: "Ámsterdam" },
  { name: "Panamá", prefix: "+507", capital: "Ciudad de Panamá" },
  { name: "Polonia", prefix: "+48", capital: "Varsovia" },
  { name: "Portugal", prefix: "+351", capital: "Lisboa" },
  { name: "Puerto Rico", prefix: "+1", capital: "San Juan" },
  { name: "Reino Unido", prefix: "+44", capital: "Londres" },
  { name: "República Checa", prefix: "+420", capital: "Praga" },
  { name: "República Dominicana", prefix: "+1", capital: "Santo Domingo" },
  { name: "Rumania", prefix: "+40", capital: "Bucarest" },
  { name: "Rusia", prefix: "+7", capital: "Moscú" },
  { name: "Singapur", prefix: "+65", capital: "Singapur" },
  { name: "Sudáfrica", prefix: "+27", capital: "Ciudad del Cabo" },
  { name: "Suecia", prefix: "+46", capital: "Estocolmo" },
  { name: "Suiza", prefix: "+41", capital: "Zúrich" },
  { name: "Tailandia", prefix: "+66", capital: "Bangkok" },
  { name: "Turquía", prefix: "+90", capital: "Estambul" },
  { name: "Ucrania", prefix: "+380", capital: "Kiev" },
  { name: "Venezuela", prefix: "+58", capital: "Caracas" },
  { name: "Vietnam", prefix: "+84", capital: "Hanói" },
];

export const LOCATION_TREE: CountryNode[] = [
  ...DETAILED_COUNTRIES,
  ...ADDITIONAL_WORLD_COUNTRIES.map((c) => ({
    name: c.name,
    phonePrefix: c.prefix,
    provinces: [prov(c.capital, [loc(c.capital, 0, 0, "", ["Centro"])])],
  })),
];

export function getAllCountryNames(): string[] {
  return LOCATION_TREE.map((c) => c.name);
}

export function getProvincesForCountry(countryName: string): ProvinceNode[] {
  const country = LOCATION_TREE.find(
    (c) => c.name.toLowerCase() === countryName.toLowerCase()
  );
  return country ? country.provinces : [];
}

export function getLocalitiesForProvince(
  countryName: string,
  provinceName: string
): LocalityNode[] {
  const provinces = getProvincesForCountry(countryName);
  const provNode = provinces.find(
    (p) => p.name.toLowerCase() === provinceName.toLowerCase()
  );
  return provNode ? provNode.localities : [];
}

export function getDistrictsForLocality(
  countryName: string,
  provinceName: string,
  localityName: string
): string[] {
  const localities = getLocalitiesForProvince(countryName, provinceName);
  const locNode = localities.find(
    (l) => l.name.toLowerCase() === localityName.toLowerCase()
  );
  return locNode ? locNode.districts : [];
}

export function getLocationSeedInfo(
  countryName: string,
  provinceName: string,
  localityName: string
): { lat: number; lon: number; phonePrefix: string; areaCode: string } {
  const country = LOCATION_TREE.find(
    (c) => c.name.toLowerCase() === countryName.toLowerCase()
  );
  if (country) {
    const provNode = country.provinces.find(
      (p) => p.name.toLowerCase() === provinceName.toLowerCase()
    );
    const locNode =
      provNode?.localities.find(
        (l) => l.name.toLowerCase() === localityName.toLowerCase()
      ) || provNode?.localities[0];
    if (locNode && (locNode.lat !== 0 || locNode.lon !== 0)) {
      return {
        lat: locNode.lat,
        lon: locNode.lon,
        phonePrefix: country.phonePrefix,
        areaCode: locNode.areaCode,
      };
    }
    return {
      lat: -31.4201,
      lon: -64.1888,
      phonePrefix: country.phonePrefix,
      areaCode: locNode?.areaCode || "",
    };
  }
  return {
    lat: -31.4201,
    lon: -64.1888,
    phonePrefix: "+54 9",
    areaCode: "351",
  };
}
