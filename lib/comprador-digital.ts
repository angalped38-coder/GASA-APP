import { SupermarketCategory } from './finance-logic';

export interface CompradorDigitalProduct {
  id: string;
  name: string;
  genericName: string;
  category: SupermarketCategory;
  categoryLabel: string;
  unit: string;
  suggestedQty: number;
  averagePriceGs: number; // Precio promedio de referencia en Gs.
  minPriceGs: number;
  maxPriceGs: number;
  storesComparedCount: number; // Número de supermercados en la muestra
  description: string;
  tip: string;
  isStaple: boolean; // Producto de la Canasta Básica Familiar
}

/**
 * Catálogo de productos básicos sin marcas (genéricos de canasta básica)
 * con precios de referencia recopilados del observatorio comprador.digital en Paraguay.
 * comprador.digital monitorea cadenas como Stock, Superseis, Casa Rica, Fortis, Biggie, Real, Box Mayorista, etc.
 */
export const COMPRADOR_DIGITAL_CATALOG: CompradorDigitalProduct[] = [
  {
    id: 'cd-arroz-1k',
    name: 'Arroz Blanco Tipo 1 (1 kg)',
    genericName: 'Arroz blanco sin marca',
    category: 'almacen',
    categoryLabel: 'Almacén',
    unit: 'kg',
    suggestedQty: 2,
    averagePriceGs: 7200,
    minPriceGs: 6200,
    maxPriceGs: 8500,
    storesComparedCount: 12,
    description: 'Arroz blanco pulido de grano largo, empaque estándar de 1 kg.',
    tip: 'En cadenas mayoristas como Fortis o Box suele costar hasta 15% menos al llevar fardo de 10 unidades.',
    isStaple: true,
  },
  {
    id: 'cd-leche-sachet-1l',
    name: 'Leche Entera en Sachet (1 Litro)',
    genericName: 'Leche entera fluida sachet',
    category: 'lacteos_huevos',
    categoryLabel: 'Lácteos y Huevos',
    unit: 'litro',
    suggestedQty: 6,
    averagePriceGs: 6200,
    minPriceGs: 5800,
    maxPriceGs: 6800,
    storesComparedCount: 14,
    description: 'Leche fluida pasteurizada entera sachet 1L (precio regulado y monitoreado).',
    tip: 'El sachet suele costar hasta Gs. 1.800 menos por litro que el cartón tetra brik.',
    isStaple: true,
  },
  {
    id: 'cd-huevos-docena',
    name: 'Huevos Blancos Tipo A (Docena)',
    genericName: 'Huevos blancos frescos 12 unidades',
    category: 'lacteos_huevos',
    categoryLabel: 'Lácteos y Huevos',
    unit: 'docena',
    suggestedQty: 2,
    averagePriceGs: 16000,
    minPriceGs: 14000,
    maxPriceGs: 18500,
    storesComparedCount: 11,
    description: 'Bandeja o maple de 12 huevos blancos frescos de tamaño mediano/grande.',
    tip: 'Comprar maple de 30 huevos suele ahorrar un 20% por unidad.',
    isStaple: true,
  },
  {
    id: 'cd-aceite-girasol-900',
    name: 'Aceite Comestible de Girasol / Soja (900 ml)',
    genericName: 'Aceite vegetal para cocinar',
    category: 'almacen',
    categoryLabel: 'Almacén',
    unit: 'unid',
    suggestedQty: 2,
    averagePriceGs: 12500,
    minPriceGs: 11000,
    maxPriceGs: 14500,
    storesComparedCount: 13,
    description: 'Botella de aceite refinado 100% puro para fritura y ensaladas.',
    tip: 'Comparar el precio por litro; los bidones de 3L o 5L ofrecen mejor rendimiento.',
    isStaple: true,
  },
  {
    id: 'cd-fideo-500g',
    name: 'Fideo Tallarín / Espagueti Seco (500 g)',
    genericName: 'Fideo de sémola común 500g',
    category: 'almacen',
    categoryLabel: 'Almacén',
    unit: 'paquete',
    suggestedQty: 3,
    averagePriceGs: 4800,
    minPriceGs: 4100,
    maxPriceGs: 5600,
    storesComparedCount: 12,
    description: 'Pasta seca al huevo o sémola de trigo candeal, paquete clásico de 500g.',
    tip: 'Las marcas nacionales y genéricas de supermercado tienen la misma calidad de cocción.',
    isStaple: true,
  },
  {
    id: 'cd-harina-1k',
    name: 'Harina de Trigo Tipo 000 (1 kg)',
    genericName: 'Harina de trigo común',
    category: 'almacen',
    categoryLabel: 'Almacén',
    unit: 'kg',
    suggestedQty: 2,
    averagePriceGs: 5800,
    minPriceGs: 5000,
    maxPriceGs: 6900,
    storesComparedCount: 10,
    description: 'Harina de trigo fortificada para panes, chipa guasu y repostería casera.',
    tip: 'Revisa fecha de vencimiento y conserva en lugar seco en envase hermético.',
    isStaple: true,
  },
  {
    id: 'cd-azucar-1k',
    name: 'Azúcar Blanco Común Refinado (1 kg)',
    genericName: 'Azúcar blanco',
    category: 'almacen',
    categoryLabel: 'Almacén',
    unit: 'kg',
    suggestedQty: 2,
    averagePriceGs: 6200,
    minPriceGs: 5500,
    maxPriceGs: 7200,
    storesComparedCount: 13,
    description: 'Azúcar refinado estándar nacional de caña.',
    tip: 'El azúcar nacional mantiene excelente precio en comparación con el importado.',
    isStaple: true,
  },
  {
    id: 'cd-carne-molida-1k',
    name: 'Carne Vacuna Molida Especial (1 kg)',
    genericName: 'Carne molida magra de primera',
    category: 'carniceria_pollo',
    categoryLabel: 'Carnicería y Pollo',
    unit: 'kg',
    suggestedQty: 1,
    averagePriceGs: 39500,
    minPriceGs: 35000,
    maxPriceGs: 45000,
    storesComparedCount: 9,
    description: 'Corte magro de novillo procesado en el momento con bajo contenido graso.',
    tip: 'Solicita al carnicero moler el corte de bola de lomo o cuadril fresco.',
    isStaple: true,
  },
  {
    id: 'cd-pechuga-pollo-1k',
    name: 'Pechuga de Pollo Fresca sin Hueso (1 kg)',
    genericName: 'Pechuga deshuesada de pollo',
    category: 'carniceria_pollo',
    categoryLabel: 'Carnicería y Pollo',
    unit: 'kg',
    suggestedQty: 2,
    averagePriceGs: 26000,
    minPriceGs: 22800,
    maxPriceGs: 29500,
    storesComparedCount: 11,
    description: 'Filet de pechuga fresca limpia, ideal para milanesas y comidas saludables.',
    tip: 'Los miércoles y jueves suelen ser días de ofertas en carnes blancas en la mayoría de cadenas.',
    isStaple: true,
  },
  {
    id: 'cd-queso-paraguay-1k',
    name: 'Queso Paraguay Artesanal Tradicional (1 kg)',
    genericName: 'Queso Paraguay para sopa paraguaya y chipa',
    category: 'lacteos_huevos',
    categoryLabel: 'Lácteos y Huevos',
    unit: 'kg',
    suggestedQty: 1,
    averagePriceGs: 38000,
    minPriceGs: 33500,
    maxPriceGs: 43000,
    storesComparedCount: 10,
    description: 'Queso fresco criollo de textura suave, esencial en la cocina familiar paraguaya.',
    tip: 'Verifica consistencia fresca sin exceso de suero en góndola refrigerada.',
    isStaple: true,
  },
  {
    id: 'cd-galleta-cuartel-1k',
    name: 'Galleta Cuartel / Pan Felipe Tradicional (1 kg)',
    genericName: 'Panificación básica diaria',
    category: 'panaderia',
    categoryLabel: 'Panadería',
    unit: 'kg',
    suggestedQty: 1,
    averagePriceGs: 10500,
    minPriceGs: 9000,
    maxPriceGs: 12000,
    storesComparedCount: 12,
    description: 'Pan fresco crujiente o galleta cuartel recién horneada del día.',
    tip: 'El pan a granel por kilo suele ser 30% más económico que el pan de molde envasado.',
    isStaple: true,
  },
  {
    id: 'cd-papa-1k',
    name: 'Papa Blanca Cepillada / Lavada (1 kg)',
    genericName: 'Papa blanca a granel',
    category: 'verduras_frutas',
    categoryLabel: 'Frutas y Verduras',
    unit: 'kg',
    suggestedQty: 2,
    averagePriceGs: 7500,
    minPriceGs: 5900,
    maxPriceGs: 9200,
    storesComparedCount: 12,
    description: 'Tubérculo seleccionado de tamaño medio, apto para puré y horneados.',
    tip: 'Los feriados y domingos tienen ferias de verduras en varias cadenas de Asunción.',
    isStaple: true,
  },
  {
    id: 'cd-cebolla-1k',
    name: 'Cebolla de Cabeza Colorada / Blanca (1 kg)',
    genericName: 'Cebolla común de cocina',
    category: 'verduras_frutas',
    categoryLabel: 'Frutas y Verduras',
    unit: 'kg',
    suggestedQty: 1,
    averagePriceGs: 6800,
    minPriceGs: 5200,
    maxPriceGs: 8400,
    storesComparedCount: 12,
    description: 'Cebolla firme para aderezos, sofritos y ensaladas.',
    tip: 'Elige piezas secas y firmes sin brotes verdes para mayor duración en despensa.',
    isStaple: true,
  },
  {
    id: 'cd-tomate-1k',
    name: 'Tomate Santa Cruz / Perita (1 kg)',
    genericName: 'Tomate para ensalada y salsa',
    category: 'verduras_frutas',
    categoryLabel: 'Frutas y Verduras',
    unit: 'kg',
    suggestedQty: 2,
    averagePriceGs: 9200,
    minPriceGs: 7200,
    maxPriceGs: 12500,
    storesComparedCount: 12,
    description: 'Tomate carnoso fresco para ensalada o salsa casera.',
    tip: 'El tomate es estacional; su precio fluctúa con la cosecha local y la frontera.',
    isStaple: true,
  },
  {
    id: 'cd-banana-docena',
    name: 'Banana Nanica Nacional (Docena)',
    genericName: 'Bananas maduras de producción paraguaya',
    category: 'verduras_frutas',
    categoryLabel: 'Frutas y Verduras',
    unit: 'docena',
    suggestedQty: 1,
    averagePriceGs: 8500,
    minPriceGs: 7000,
    maxPriceGs: 10500,
    storesComparedCount: 10,
    description: 'Fruta rica en potasio ideal para la merienda de los chicos (Mateo y Valentina).',
    tip: 'La banana nacional tiene excelente precio y frescura comparada a la importada.',
    isStaple: false,
  },
  {
    id: 'cd-yerba-mate-1k',
    name: 'Yerba Mate Tradicional con Palo (1 kg)',
    genericName: 'Yerba para tereré y mate familiar',
    category: 'bebidas',
    categoryLabel: 'Bebidas e Infusiones',
    unit: 'kg',
    suggestedQty: 1,
    averagePriceGs: 21000,
    minPriceGs: 17500,
    maxPriceGs: 25000,
    storesComparedCount: 14,
    description: 'Yerba mate clásica elaborada con palo para el tereré diario del hogar.',
    tip: 'Paquetes de 2 kg o promociones familiares bajan el costo por kilo a menos de Gs. 19.000.',
    isStaple: true,
  },
  {
    id: 'cd-detergente-500ml',
    name: 'Detergente Líquido Lavavajillas (500 ml)',
    genericName: 'Detergente antigrasa para vajilla',
    category: 'limpieza',
    categoryLabel: 'Limpieza y Hogar',
    unit: 'unid',
    suggestedQty: 2,
    averagePriceGs: 6500,
    minPriceGs: 5200,
    maxPriceGs: 8000,
    storesComparedCount: 12,
    description: 'Detergente con alto poder desengrasante para cocina y platos.',
    tip: 'El repuesto económico (doypack) reduce el precio y genera menos residuos.',
    isStaple: true,
  },
  {
    id: 'cd-lavandina-1l',
    name: 'Lavandina / Cloro Líquido Desinfectante (1 Litro)',
    genericName: 'Lavandina común desinfectante',
    category: 'limpieza',
    categoryLabel: 'Limpieza y Hogar',
    unit: 'unid',
    suggestedQty: 1,
    averagePriceGs: 5000,
    minPriceGs: 4200,
    maxPriceGs: 6500,
    storesComparedCount: 13,
    description: 'Solución desinfectante multiuso para pisos, baños y superficies.',
    tip: 'Diluir siempre según la recomendación del fabricante para máxima seguridad y rendimiento.',
    isStaple: true,
  },
  {
    id: 'cd-papel-higienico-4u',
    name: 'Papel Higiénico Doble Hoja (Paquete de 4 Rollos)',
    genericName: 'Papel higiénico suave doble hoja',
    category: 'higiene',
    categoryLabel: 'Higiene y Cuidado Personal',
    unit: 'paquete',
    suggestedQty: 2,
    averagePriceGs: 8800,
    minPriceGs: 7400,
    maxPriceGs: 10800,
    storesComparedCount: 12,
    description: 'Rollos de 30 metros doble hoja texturada.',
    tip: 'Los bolsones familiares de 12 o 16 rollos ofrecen ahorros de hasta 25% por rollo.',
    isStaple: true,
  },
  {
    id: 'cd-jabon-polvo-800g',
    name: 'Jabón en Polvo para Ropa (800 g)',
    genericName: 'Detergente en polvo para lavarropas',
    category: 'limpieza',
    categoryLabel: 'Limpieza y Hogar',
    unit: 'paquete',
    suggestedQty: 1,
    averagePriceGs: 11500,
    minPriceGs: 9600,
    maxPriceGs: 13900,
    storesComparedCount: 11,
    description: 'Fórmula de lavado intensivo con blanqueador óptico.',
    tip: 'Comparar el formato de 3 kg para optimizar el gasto mensual en lavandería.',
    isStaple: true,
  },
  {
    id: 'cd-sal-fina-500g',
    name: 'Sal Fina Yodada Comestible (500 g)',
    genericName: 'Sal de mesa fortificada',
    category: 'almacen',
    categoryLabel: 'Almacén',
    unit: 'paquete',
    suggestedQty: 1,
    averagePriceGs: 2200,
    minPriceGs: 1800,
    maxPriceGs: 2800,
    storesComparedCount: 11,
    description: 'Sal pura enriquecida con yodo para uso en cocina familiar.',
    tip: 'Producto de bajísimo costo y consumo dosificado.',
    isStaple: true,
  },
];

/**
 * Genera la URL oficial de búsqueda o página principal de comprador.digital
 */
export function getCompradorDigitalUrl(query?: string): string {
  const baseUrl = 'https://comprador.digital';
  if (!query || !query.trim()) {
    return baseUrl;
  }
  const cleanQuery = encodeURIComponent(query.trim());
  return `${baseUrl}/?q=${cleanQuery}`;
}

/**
 * Busca productos de referencia sin marcas que coincidan con un texto
 */
export function searchCompradorDigitalProducts(search: string): CompradorDigitalProduct[] {
  if (!search || !search.trim()) return COMPRADOR_DIGITAL_CATALOG;
  const term = search.toLowerCase().trim();
  return COMPRADOR_DIGITAL_CATALOG.filter(
    (p) =>
      p.name.toLowerCase().includes(term) ||
      p.genericName.toLowerCase().includes(term) ||
      p.categoryLabel.toLowerCase().includes(term) ||
      p.description.toLowerCase().includes(term)
  );
}

/**
 * Información explicativa para la familia sobre la integración con comprador.digital
 */
export const COMPRADOR_DIGITAL_INFO = {
  website: 'https://comprador.digital',
  platformName: 'Comprador.digital Paraguay',
  summary:
    'Observatorio paraguayo de precios que compara más de 150.000 artículos diarios entre las principales cadenas de supermercados de Asunción y Gran Asunción (Stock, Superseis, Casa Rica, Fortis, Biggie, Real, Box, etc.).',
  benefitForGasa:
    'Permite a la Familia Galindo Salomon comparar los precios aproximados de productos genéricos y de primera necesidad sin depender de marcas costosas, garantizando el mejor rendimiento del presupuesto familiar.',
  lastUpdatedNotice: 'Precios referenciales actualizados para el mercado paraguayo (Gs.).',
};
