import type { Product, Category } from "@/types";

// ============================================================
// Demo / Fallback Data for CENPOD
// Used when Shopify is not configured or returns an error
// ============================================================

const NOW = new Date().toISOString();

// ── Categories ────────────────────────────────────────────────

export const demoCategories: Category[] = [
  {
    id: "cat-instrumentos",
    name: "Instrumentos",
    slug: "instrumentos",
    description:
      "Instrumentos de acero inoxidable de alta calidad para procedimientos podológicos profesionales. Pinzas, tijeras, curetas y más.",
    image: null,
    icon: null,
    order: 0,
    productCount: 4,
  },
  {
    id: "cat-insumos",
    name: "Insumos",
    slug: "insumos",
    description:
      "Insumos y consumibles esenciales para la práctica podológica. Guantes, fresas, apósitos y material desechable.",
    image: null,
    icon: null,
    order: 1,
    productCount: 4,
  },
  {
    id: "cat-equipamiento",
    name: "Equipamiento",
    slug: "equipamiento",
    description:
      "Equipamiento profesional para consultorios podológicos. Micromotores, lámparas, unidades de succión y mobiliario clínico.",
    image: null,
    icon: null,
    order: 2,
    productCount: 4,
  },
  {
    id: "cat-cuidado-de-pies",
    name: "Cuidado de Pies",
    slug: "cuidado-de-pies",
    description:
      "Productos de cuidado y tratamiento para pies. Cremas, ungüentos, tratamientos para uñas y piel.",
    image: null,
    icon: null,
    order: 3,
    productCount: 4,
  },
];

// ── Products ──────────────────────────────────────────────────

export const demoProducts: Product[] = [
  // ── Instrumentos (4 products) ──
  {
    id: "prod-pinza-universal",
    name: "Pinza Universal de Acero Inoxidable",
    slug: "pinza-universal-acero-inoxidable",
    description:
      "Pinza universal de acero inoxidable quirúrgico, ideal para retirar piel muerta y cortar uñas en procedimientos podológicos.",
    content:
      "<p>Pinza universal fabricada en acero inoxidable quirúrgico de grado médico. Diseño ergonómico con mango serrado para un agarre firme y seguro. Ideal para procedimientos de podología como retirada de piel muerta, corte de uñas y manipulación de tejidos.</p><h3>Características:</h3><ul><li>Acero inoxidable AISI 420</li><li>Autoclavable a 134°C</li><li>Mango serrado antideslizante</li><li>Longitud: 14 cm</li></ul>",
    price: 485,
    comparePrice: 620,
    costPrice: null,
    sku: "INST-001",
    barcode: null,
    stock: 35,
    lowStock: 5,
    images: '["/images/products/pinza-universal.png"]',
    categoryId: "cat-instrumentos",
    tags: '["featured","acero inoxidable","quirúrgico"]',
    rating: 4.8,
    reviewCount: 24,
    usage: "professional",
    status: "active",
    featured: true,
    professional: true,
    variants: "[]",
    weight: 0.12,
    dimensions: null,
    createdAt: NOW,
    updatedAt: NOW,
    category: demoCategories[0],
  },
  {
    id: "prod-tijera-punta-curva",
    name: "Tijera Podal de Punta Curva",
    slug: "tijera-podal-punta-curva",
    description:
      "Tijera podal de punta curva con hojas afiladas para cortes precisos en piel y uñas. Acero inoxidable de alta resistencia.",
    content:
      "<p>Tijera podal profesional con punta curva diseñada para cortes precisos en procedimientos de podología. Fabricada en acero inoxidable de alta resistencia con mecanismo de cierre suave.</p><h3>Características:</h3><ul><li>Acero inoxidable AISI 420</li><li>Punta curva de 15°</li><li>Longitud: 11.5 cm</li><li>Autoclavable</li></ul>",
    price: 390,
    comparePrice: null,
    costPrice: null,
    sku: "INST-002",
    barcode: null,
    stock: 28,
    lowStock: 5,
    images: '["/images/products/tijera-podal.png"]',
    categoryId: "cat-instrumentos",
    tags: '["acero inoxidable","punta curva"]',
    rating: 4.6,
    reviewCount: 18,
    usage: "professional",
    status: "active",
    featured: false,
    professional: true,
    variants: "[]",
    weight: 0.08,
    dimensions: null,
    createdAt: NOW,
    updatedAt: NOW,
    category: demoCategories[0],
  },
  {
    id: "prod-cureta-doble",
    name: "Cureta Doble de Acero Quirúrgico",
    slug: "cureta-doble-acero-quirurgico",
    description:
      "Cureta de doble extremo para limpieza y raspado de tejidos. Acero quirúrgico autoclavable con mango hexagonal.",
    content:
      "<p>Cureta de doble extremo diseñada para limpieza y raspado de tejidos en procedimientos podológicos. El extremo recto es ideal para superficies planas y el extremo curvo para áreas de difícil acceso.</p><h3>Características:</h3><ul><li>Acero inoxidable quirúrgico</li><li>Doble extremo: recto y curvo</li><li>Mango hexagonal antideslizante</li><li>Longitud: 18 cm</li><li>Autoclavable a 134°C</li></ul>",
    price: 320,
    comparePrice: 410,
    costPrice: null,
    sku: "INST-003",
    barcode: null,
    stock: 42,
    lowStock: 5,
    images: '["/images/products/cureta-doble.png"]',
    categoryId: "cat-instrumentos",
    tags: '["featured","acero inoxidable","quirúrgico"]',
    rating: 4.7,
    reviewCount: 15,
    usage: "professional",
    status: "active",
    featured: true,
    professional: true,
    variants: "[]",
    weight: 0.09,
    dimensions: null,
    createdAt: NOW,
    updatedAt: NOW,
    category: demoCategories[0],
  },
  {
    id: "prod-lima-metalica",
    name: "Lima Metálica Podal Profesional",
    slug: "lima-metalica-podal-profesional",
    description:
      "Lima metálica de grano fino/mediano para pulido y forma de uñas. Doble cara con mango ergonómico.",
    content:
      "<p>Lima metálica profesional de doble cara diseñada para el pulido y forma de uñas en tratamientos podológicos. Grano fino de un lado y medio del otro para versatilidad en el trabajo.</p><h3>Características:</h3><ul><li>Acero inoxidable</li><li>Doble cara: fino/mediano</li><li>Mango ergonómico</li><li>Longitud: 20 cm</li><li>Autoclavable</li></ul>",
    price: 225,
    comparePrice: null,
    costPrice: null,
    sku: "INST-004",
    barcode: null,
    stock: 60,
    lowStock: 10,
    images: '["/images/products/lima-metalica.png"]',
    categoryId: "cat-instrumentos",
    tags: '["acero inoxidable","pulido"]',
    rating: 4.4,
    reviewCount: 22,
    usage: "professional",
    status: "active",
    featured: false,
    professional: true,
    variants: "[]",
    weight: 0.06,
    dimensions: null,
    createdAt: NOW,
    updatedAt: NOW,
    category: demoCategories[0],
  },

  // ── Insumos (4 products) ──
  {
    id: "prod-guantes-nitrilo",
    name: "Guantes de Nitrilo (Caja 100)",
    slug: "guantes-nitrilo-caja-100",
    description:
      "Guantes de nitrilo sin polvo, caja de 100 unidades. Resistencia química superior, textura en dedos para mejor agarre.",
    content:
      "<p>Guantes de nitrilo de grado médico sin polvo. Ideales para procedimientos podológicos que requieren protección contra químicos y fluidos. Textura en la punta de los dedos para un agarre seguro incluso en condiciones húmedas.</p><h3>Características:</h3><ul><li>Material: Nitrilo sin polvo</li><li>Caja de 100 unidades</li><li>Disponible en S, M, L, XL</li><li>Ambidextros</li><li>Resistencia química superior</li><li>Libres de látex</li></ul>",
    price: 289,
    comparePrice: 340,
    costPrice: null,
    sku: "INSU-001",
    barcode: null,
    stock: 150,
    lowStock: 20,
    images: '["/images/products/guantes-nitrilo.png"]',
    categoryId: "cat-insumos",
    tags: '["featured","desechable","protección"]',
    rating: 4.9,
    reviewCount: 67,
    usage: "general",
    status: "active",
    featured: true,
    professional: false,
    variants: "[]",
    weight: 0.35,
    dimensions: null,
    createdAt: NOW,
    updatedAt: NOW,
    category: demoCategories[1],
  },
  {
    id: "prod-fresas-carburo",
    name: "Fresas de Carburo Surtidas (Set 10)",
    slug: "fresas-carburo-surtidas-set-10",
    description:
      "Set de 10 fresas de carburo de tungsteno con diferentes formas y granos. Para uso con micromotor podal.",
    content:
      "<p>Set de 10 fresas de carburo de tungsteno de alta calidad para uso con micromotor podal. Incluye las formas más utilizadas en podología: cilíndrica, cónica, esférica y llama. Diferentes granos para trabajo grueso y fino.</p><h3>Incluye:</h3><ul><li>2 fresas cilíndricas (grano medio y fino)</li><li>2 fresas cónicas (grano medio y fino)</li><li>2 fresas esféricas (grano medio y fino)</li><li>2 fresas llama (grano medio y fino)</li><li>1 fresa invertida</li><li>1 fresa de diamante</li></ul>",
    price: 650,
    comparePrice: null,
    costPrice: null,
    sku: "INSU-002",
    barcode: null,
    stock: 45,
    lowStock: 10,
    images: '["/images/products/fresas-carburo.png"]',
    categoryId: "cat-insumos",
    tags: '["carburo","micromotor","fresas"]',
    rating: 4.7,
    reviewCount: 33,
    usage: "professional",
    status: "active",
    featured: false,
    professional: true,
    variants: "[]",
    weight: 0.05,
    dimensions: null,
    createdAt: NOW,
    updatedAt: NOW,
    category: demoCategories[1],
  },
  {
    id: "prod-apositos-hidrocoloides",
    name: "Apósitos Hidrocoloides (Caja 20)",
    slug: "apositos-hidrocoloides-caja-20",
    description:
      "Apósitos hidrocoloides para protección y cicatrización de heridas podales. Caja con 20 unidades de diferentes tamaños.",
    content:
      "<p>Apósitos hidrocoloides diseñados para la protección y cicatrización acelerada de heridas en procedimientos podológicos. Forman un gel al contacto con la herida manteniendo el ambiente húmedo óptimo para la regeneración tisular.</p><h3>Características:</h3><ul><li>Caja de 20 unidades</li><li>3 tamaños: pequeño (5x5cm), mediano (7x7cm), grande (10x10cm)</li><li>Impermeables al agua</li><li>Hipoalergénicos</li><li>Hasta 7 días de permanencia</li></ul>",
    price: 420,
    comparePrice: 520,
    costPrice: null,
    sku: "INSU-003",
    barcode: null,
    stock: 80,
    lowStock: 15,
    images: '["/images/products/apositos-hidrocoloides.png"]',
    categoryId: "cat-insumos",
    tags: '["cicatrización","heridas","protección"]',
    rating: 4.5,
    reviewCount: 19,
    usage: "general",
    status: "active",
    featured: false,
    professional: false,
    variants: "[]",
    weight: 0.15,
    dimensions: null,
    createdAt: NOW,
    updatedAt: NOW,
    category: demoCategories[1],
  },
  {
    id: "prod-algodon-rollo",
    name: "Algodón Rollo Clínico 500g",
    slug: "algodon-rollo-clinico-500g",
    description:
      "Algodón en rollo clínico de 500 gramos, alta absorción y suavidad. Ideal para limpieza y procedimientos podológicos.",
    content:
      "<p>Algodón en rollo clínico de alta calidad con excelente poder de absorción y suavidad. Fabricado con fibras 100% puras sin blanqueadores químicos. Indispensable para cualquier consulta podológica.</p><h3>Características:</h3><ul><li>Peso: 500g</li><li>Alta absorción</li><li>100% fibras puras</li><li>Sin blanqueadores químicos</li><li>Esterilizable</li></ul>",
    price: 125,
    comparePrice: null,
    costPrice: null,
    sku: "INSU-004",
    barcode: null,
    stock: 200,
    lowStock: 30,
    images: '["/images/products/algodon-rollo.png"]',
    categoryId: "cat-insumos",
    tags: '["básico","absorción","limpieza"]',
    rating: 4.3,
    reviewCount: 41,
    usage: "general",
    status: "active",
    featured: false,
    professional: false,
    variants: "[]",
    weight: 0.5,
    dimensions: null,
    createdAt: NOW,
    updatedAt: NOW,
    category: demoCategories[1],
  },

  // ── Equipamiento (4 products) ──
  {
    id: "prod-micromotor-35k",
    name: "Micromotor Podal 35K RPM",
    slug: "micromotor-podal-35k-rpm",
    description:
      "Micromotor podal profesional de 35,000 RPM con pedal de control y juego de fresas. Motor de alto torque y bajo vibración.",
    content:
      "<p>Micromotor podal profesional de alta velocidad diseñado para procedimientos podológicos avanzados. Motor de alto torque con tecnología de baja vibración para mayor precisión y comodidad del paciente.</p><h3>Características:</h3><ul><li>Velocidad máxima: 35,000 RPM</li><li>Torque: 3.5 N·cm</li><li>Control de velocidad con pedal</li><li>Sistema de baja vibración</li><li>Portafresas de ajuste rápido</li><li>Incluye set de 6 fresas</li><li>Garantía: 1 año</li></ul>",
    price: 4290,
    comparePrice: 5100,
    costPrice: null,
    sku: "EQUIP-001",
    barcode: null,
    stock: 8,
    lowStock: 2,
    images: '["/images/products/micromotor-podal.png"]',
    categoryId: "cat-equipamiento",
    tags: '["featured","professional","micromotor","alta velocidad"]',
    rating: 4.9,
    reviewCount: 12,
    usage: "professional",
    status: "active",
    featured: true,
    professional: true,
    variants: "[]",
    weight: 1.8,
    dimensions: null,
    createdAt: NOW,
    updatedAt: NOW,
    category: demoCategories[2],
  },
  {
    id: "prod-lampara-curado-led",
    name: "Lámpara de Curado LED",
    slug: "lampara-curado-led",
    description:
      "Lámpara de curado LED para tratamientos de uñas y resinas. Dos modos de tiempo, luz fría sin dañar la piel.",
    content:
      "<p>Lámpara de curado LED profesional diseñada para tratamientos de uñas y resinas en podología. Tecnología de luz fría que no daña la piel del paciente. Dos modos de temporizador para mayor versatilidad.</p><h3>Características:</h3><ul><li>Tecnología LED de luz fría</li><li>2 modos: 30s y 60s</li><li>Potencia: 36W</li><li>Vida útil del LED: 50,000 horas</li><li>Sensor automático de encendido</li><li>Diseño compacto y portátil</li></ul>",
    price: 1280,
    comparePrice: null,
    costPrice: null,
    sku: "EQUIP-002",
    barcode: null,
    stock: 15,
    lowStock: 3,
    images: '["/images/products/lampara-led.png"]',
    categoryId: "cat-equipamiento",
    tags: '["LED","curado","uñas"]',
    rating: 4.6,
    reviewCount: 9,
    usage: "professional",
    status: "active",
    featured: false,
    professional: true,
    variants: "[]",
    weight: 0.6,
    dimensions: null,
    createdAt: NOW,
    updatedAt: NOW,
    category: demoCategories[2],
  },
  {
    id: "pod-suction-unit",
    name: "Unidad de Succión Podal",
    slug: "unidad-succcion-podal",
    description:
      "Unidad de succión profesional para evacuación de residuos durante procedimientos podológicos. Filtro HEPA y tanque de 2L.",
    content:
      "<p>Unidad de succión profesional diseñada específicamente para procedimientos podológicos. Sistema de filtración HEPA que captura partículas finas y polvo de uñas, protegiendo la calidad del aire en el consultorio.</p><h3>Características:</h3><ul><li>Potencia de succión: 80 L/min</li><li>Filtro HEPA reemplazable</li><li>Tanque colector de 2L</li><li>Nivel de ruido: &lt;55 dB</li><li>3 modos de potencia</li><li>Mango de transporte integrado</li><li>Garantía: 2 años</li></ul>",
    price: 6890,
    comparePrice: 7950,
    costPrice: null,
    sku: "EQUIP-003",
    barcode: null,
    stock: 5,
    lowStock: 2,
    images: '["/images/products/suction-unit.png"]',
    categoryId: "cat-equipamiento",
    tags: '["featured","professional","succión","HEPA"]',
    rating: 4.8,
    reviewCount: 7,
    usage: "professional",
    status: "active",
    featured: true,
    professional: true,
    variants: "[]",
    weight: 4.5,
    dimensions: null,
    createdAt: NOW,
    updatedAt: NOW,
    category: demoCategories[2],
  },
  {
    id: "prod-silla-podal",
    name: "Silla Podal Ergonómica con Ruedas",
    slug: "silla-podal-ergonomica-ruedas",
    description:
      "Silla podal ergonómica con ruedas de giro libre, regulable en altura y reposabrazos ajustable. Tapizada en vinilo médico.",
    content:
      "<p>Silla podal ergonómica diseñada para la comodidad del podólogo durante procedimientos prolongados. Sistema de ruedas de giro libre para movilidad sin esfuerzo. Ajuste hidráulico de altura y reposabrazos configurable.</p><h3>Características:</h3><ul><li>Altura regulable: 45-62 cm (hidráulica)</li><li>5 ruedas de giro libre con freno</li><li>Reposabrazos ajustable en ángulo</li><li>Tapizado en vinilo médico antimicrobiano</li><li>Respaldo lumbar ergonómico</li><li>Capacidad: 150 kg</li><li>Color: Blanco con detalles navy</li></ul>",
    price: 8920,
    comparePrice: 10500,
    costPrice: null,
    sku: "EQUIP-004",
    barcode: null,
    stock: 3,
    lowStock: 1,
    images: '["/images/products/silla-podal.png"]',
    categoryId: "cat-equipamiento",
    tags: '["professional","mobiliario","ergonómica"]',
    rating: 4.7,
    reviewCount: 5,
    usage: "professional",
    status: "active",
    featured: false,
    professional: true,
    variants: "[]",
    weight: 12,
    dimensions: null,
    createdAt: NOW,
    updatedAt: NOW,
    category: demoCategories[2],
  },

  // ── Cuidado de Pies (4 products) ──
  {
    id: "prod-crema-urea-40",
    name: "Crema de Urea al 40%",
    slug: "crema-urea-40",
    description:
      "Crema de urea al 40% para tratamiento intensivo de piel agrietada y callosidades. Fórmula con ácido láctico y vitamina E.",
    content:
      "<p>Crema de urea de concentración al 40% formulada para el tratamiento intensivo de piel agrietada, callosidades e hiperqueratosis. La combinación de urea con ácido láctico y vitamina E proporciona hidratación profunda y renovación celular.</p><h3>Características:</h3><ul><li>Urea al 40%</li><li>Ácido láctico al 5%</li><li>Vitamina E</li><li>Envase de 120 ml</li><li>Uso profesional y doméstico</li><li>Resultados visibles en 7 días</li></ul>",
    price: 385,
    comparePrice: 460,
    costPrice: null,
    sku: "CUID-001",
    barcode: null,
    stock: 75,
    lowStock: 15,
    images: '["/images/products/crema-urea.png"]',
    categoryId: "cat-cuidado-de-pies",
    tags: '["featured","urea","hidratación","callosidades"]',
    rating: 4.9,
    reviewCount: 89,
    usage: "general",
    status: "active",
    featured: true,
    professional: false,
    variants: "[]",
    weight: 0.15,
    dimensions: null,
    createdAt: NOW,
    updatedAt: NOW,
    category: demoCategories[3],
  },
  {
    id: "prod-tratamiento-onicomicosis",
    name: "Tratamiento para Onicomicosis",
    slug: "tratamiento-onicomicosis",
    description:
      "Tratamiento tópico para hongos en las uñas con ciclopirox al 8%. Aplicador de precisión incluido.",
    content:
      "<p>Tratamiento tópico profesional para onicomicosis (hongos en las uñas) formulado con ciclopirox al 8%. Incluye aplicador de precisión que permite alcanzar la base de la uña de manera efectiva. Fórmula de secado rápido sin olor.</p><h3>Características:</h3><ul><li>Ciclopirox olamina al 8%</li><li>Aplicador de precisión incluido</li><li>Secado rápido</li><li>Sin olor</li><li>Envase de 10 ml</li><li>Tratamiento para 3 meses</li></ul>",
    price: 560,
    comparePrice: null,
    costPrice: null,
    sku: "CUID-002",
    barcode: null,
    stock: 40,
    lowStock: 10,
    images: '["/images/products/tratamiento-onicomicosis.png"]',
    categoryId: "cat-cuidado-de-pies",
    tags: '["hongos","uñas","tratamiento","antifúngico"]',
    rating: 4.5,
    reviewCount: 36,
    usage: "general",
    status: "active",
    featured: false,
    professional: false,
    variants: "[]",
    weight: 0.03,
    dimensions: null,
    createdAt: NOW,
    updatedAt: NOW,
    category: demoCategories[3],
  },
  {
    id: "prod-gel-descalcificador",
    name: "Gel Descalcificador Profesional",
    slug: "gel-descalcificador-profesional",
    description:
      "Gel descalcificador profesional con ácido salicílico al 20% para eliminación de callosidades. Aplicación controlada.",
    content:
      "<p>Gel descalcificador profesional formulado con ácido salicílico al 20% para la eliminación efectiva y controlada de callosidades e hiperqueratosis. Su formato en gel permite una aplicación precisa, evitando el contacto con piel sana.</p><h3>Características:</h3><ul><li>Ácido salicílico al 20%</li><li>Formato gel para aplicación precisa</li><li>Envase de 30 ml con dosificador</li><li>Uso exclusivo profesional</li><li>Efecto visible desde la primera aplicación</li></ul>",
    price: 310,
    comparePrice: 380,
    costPrice: null,
    sku: "CUID-003",
    barcode: null,
    stock: 55,
    lowStock: 10,
    images: '["/images/products/gel-descalcificador.png"]',
    categoryId: "cat-cuidado-de-pies",
    tags: '["professional","descalcificador","callosidades","ácido salicílico"]',
    rating: 4.6,
    reviewCount: 28,
    usage: "professional",
    status: "active",
    featured: true,
    professional: true,
    variants: "[]",
    weight: 0.04,
    dimensions: null,
    createdAt: NOW,
    updatedAt: NOW,
    category: demoCategories[3],
  },
  {
    id: "prod-aceite-arbol-te",
    name: "Aceite Esencial de Árbol de Té (30ml)",
    slug: "aceite-esencial-arbol-te-30ml",
    description:
      "Aceite esencial puro de árbol de té (Melaleuca alternifolia) con propiedades antisépticas y antifúngicas naturales.",
    content:
      "<p>Aceite esencial 100% puro de árbol de té (Melaleuca alternifolia) con certificación de pureza. Reconocido por sus propiedades antisépticas, antibacterianas y antifúngicas naturales. Ideal como complemento en tratamientos podológicos preventivos.</p><h3>Características:</h3><ul><li>100% aceite esencial puro</li><li>Origen: Australia</li><li>Envase de 30 ml con gotero</li><li>Propiedades antisépticas y antifúngicas</li><li>Uso tópico diluido</li><li>Certificado de pureza incluido</li></ul>",
    price: 195,
    comparePrice: null,
    costPrice: null,
    sku: "CUID-004",
    barcode: null,
    stock: 90,
    lowStock: 20,
    images: '["/images/products/aceite-arbol-te.png"]',
    categoryId: "cat-cuidado-de-pies",
    tags: '["natural","antiséptico","antifúngico","aceite esencial"]',
    rating: 4.4,
    reviewCount: 52,
    usage: "general",
    status: "active",
    featured: false,
    professional: false,
    variants: "[]",
    weight: 0.04,
    dimensions: null,
    createdAt: NOW,
    updatedAt: NOW,
    category: demoCategories[3],
  },
];

// ── Helper: filter & paginate demo products ──────────────────

interface DemoFilterParams {
  q?: string;
  category?: string;
  usage?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  featured?: boolean;
  professional?: boolean;
  page?: number;
  limit?: number;
}

export function getDemoProducts(params: DemoFilterParams = {}) {
  const {
    q = "",
    category = "",
    usage = "",
    minPrice = 0,
    maxPrice = 20000,
    sort = "featured",
    featured = false,
    professional = false,
    page = 1,
    limit = 12,
  } = params;

  let filtered = [...demoProducts];

  // Text search
  if (q) {
    const query = q.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        (p.description && p.description.toLowerCase().includes(query))
    );
  }

  // Category filter (comma-separated slugs)
  if (category) {
    const categorySlugs = category.split(",").map((s) => s.trim());
    filtered = filtered.filter(
      (p) => p.category && categorySlugs.includes(p.category.slug)
    );
  }

  // Usage filter
  if (usage) {
    const usageValues = usage.split(",").map((s) => s.trim());
    filtered = filtered.filter((p) => usageValues.includes(p.usage));
  }

  // Price range filter
  if (minPrice > 0) {
    filtered = filtered.filter((p) => p.price >= minPrice);
  }
  if (maxPrice < 20000) {
    filtered = filtered.filter((p) => p.price <= maxPrice);
  }

  // Featured filter
  if (featured) {
    filtered = filtered.filter((p) => p.featured);
  }

  // Professional filter
  if (professional) {
    filtered = filtered.filter((p) => p.professional);
  }

  // Sort
  switch (sort) {
    case "price-asc":
      filtered.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      filtered.sort((a, b) => b.price - a.price);
      break;
    case "name":
      filtered.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "newest":
      filtered.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      break;
    case "rating":
      filtered.sort((a, b) => b.rating - a.rating);
      break;
    case "featured":
    default:
      filtered.sort((a, b) => {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return b.rating - a.rating;
      });
      break;
  }

  // Pagination
  const total = filtered.length;
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  const products = filtered.slice(start, start + limit);

  return { products, total, page, totalPages };
}

// ── Helper: find a single demo product by slug ───────────────

export function getDemoProductBySlug(slug: string): Product | undefined {
  return demoProducts.find((p) => p.slug === slug);
}

// ── Helper: search demo products ─────────────────────────────

export function searchDemoProducts(q: string, limit: number = 10) {
  if (!q || q.length < 2) return { products: [], total: 0 };

  const query = q.toLowerCase();
  const results = demoProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(query) ||
      (p.description && p.description.toLowerCase().includes(query)) ||
      (p.sku && p.sku.toLowerCase().includes(query))
  );

  return {
    products: results.slice(0, limit),
    total: results.length,
  };
}
