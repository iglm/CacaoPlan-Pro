import { Activity, StageType, CostCategory } from './types';

// Definition of Phenological Stages
export const STAGE_LABELS: Record<StageType, string> = {
  PREPARACION: '1. Planificación y Preparación (Mes 0-2)',
  SIEMBRA: '2. Establecimiento y Siembra (Mes 2-6)',
  CRECIMIENTO: '3. Desarrollo Vegetativo (Mes 7-24)',
  PRODUCCION: '4. Fase Productiva y Cosecha (Año 2+)',
};

export const CATEGORY_LABELS: Record<CostCategory, string> = {
  MANO_DE_OBRA: 'Mano de Obra',
  INSUMOS: 'Insumos Agrícolas',
  HERRAMIENTAS: 'Herramientas y Equipos',
  ADMINISTRATIVO: 'Gastos Administrativos',
};

// Database of Activities per Hectare (based on general technical averages)
// Prices are estimated in COP (Colombian Peso) for context, can be adjusted.
export const CACAO_ACTIVITIES: Activity[] = [
  // --- FASE 1: PREPARACIÓN ---
  {
    id: 'p1',
    name: 'Análisis de Suelos',
    description: 'Toma de muestras y análisis de laboratorio para determinar requerimientos nutricionales.',
    stage: 'PREPARACION',
    category: 'INSUMOS',
    unit: 'Muestras',
    quantityPerHa: 1,
    basePricePerUnit: 150000,
    frequency: 'Única vez',
    technicalNote: 'Fundamental para el plan de fertilización.'
  },
  {
    id: 'p2',
    name: 'Trazado y Ahoyado',
    description: 'Marcación del terreno (3x3m o 3x4m) y apertura de hoyos.',
    stage: 'PREPARACION',
    category: 'MANO_DE_OBRA',
    unit: 'Jornales',
    quantityPerHa: 12,
    basePricePerUnit: 0, // Will be overridden by user input
    frequency: 'Única vez',
  },
  {
    id: 'p3',
    name: 'Enmiendas (Cal)',
    description: 'Aplicación de cal dolomita según análisis de suelos.',
    stage: 'PREPARACION',
    category: 'INSUMOS',
    unit: 'Bultos (50kg)',
    quantityPerHa: 10,
    basePricePerUnit: 25000,
    frequency: 'Única vez',
  },

  // --- FASE 2: SIEMBRA ---
  {
    id: 's1',
    name: 'Material Vegetal (Cacao)',
    description: 'Plántulas de clones regionales (Ej. TCS 01, FEC 2) injertadas y certificadas.',
    stage: 'SIEMBRA',
    category: 'INSUMOS',
    unit: 'Plántulas',
    quantityPerHa: 1100, // Densidad promedio
    basePricePerUnit: 3500,
    frequency: 'Única vez',
    technicalNote: 'Incluye 10% de resiembra.'
  },
  {
    id: 's2',
    name: 'Sombrío Transitorio (Plátano)',
    description: 'Establecimiento de sombrío temporal para protección inicial.',
    stage: 'SIEMBRA',
    category: 'INSUMOS',
    unit: 'Colinos',
    quantityPerHa: 500,
    basePricePerUnit: 1500,
    frequency: 'Única vez',
  },
  {
    id: 's3',
    name: 'Labor de Siembra',
    description: 'Distribución, siembra y tapado de plántulas.',
    stage: 'SIEMBRA',
    category: 'MANO_DE_OBRA',
    unit: 'Jornales',
    quantityPerHa: 15,
    basePricePerUnit: 0,
    frequency: 'Única vez',
  },
  {
    id: 's4',
    name: 'Fertilización de Arranque',
    description: 'Aplicación de fuente rica en Fósforo (DAP o similar).',
    stage: 'SIEMBRA',
    category: 'INSUMOS',
    unit: 'Bultos (50kg)',
    quantityPerHa: 2,
    basePricePerUnit: 180000,
    frequency: 'Única vez',
  },

  // --- FASE 3: CRECIMIENTO (Años 1-2) ---
  {
    id: 'c1',
    name: 'Poda de Formación',
    description: 'Eliminación de chupones y definición de arquitectura del árbol.',
    stage: 'CRECIMIENTO',
    category: 'MANO_DE_OBRA',
    unit: 'Jornales',
    quantityPerHa: 8,
    basePricePerUnit: 0,
    frequency: 'Semestral',
    technicalNote: 'Clave para facilitar futuras labores de cosecha.'
  },
  {
    id: 'c2',
    name: 'Control de Arvenses (Plateo)',
    description: 'Limpieza manual o mecánica alrededor del árbol.',
    stage: 'CRECIMIENTO',
    category: 'MANO_DE_OBRA',
    unit: 'Jornales',
    quantityPerHa: 12,
    basePricePerUnit: 0,
    frequency: 'Trimestral',
  },
  {
    id: 'c3',
    name: 'Fertilización de Crecimiento',
    description: 'Plan nutricional balanceado (N-P-K + Menores).',
    stage: 'CRECIMIENTO',
    category: 'INSUMOS',
    unit: 'Bultos (50kg)',
    quantityPerHa: 6,
    basePricePerUnit: 160000,
    frequency: 'Anual',
  },

  // --- FASE 4: PRODUCCIÓN ---
  {
    id: 'prod1',
    name: 'Manejo Fitosanitario (MIPE)',
    description: 'Control cultural de Monilia y Escoba de Bruja (Remoción de frutos enfermos).',
    stage: 'PRODUCCION',
    category: 'MANO_DE_OBRA',
    unit: 'Jornales',
    quantityPerHa: 20,
    basePricePerUnit: 0,
    frequency: 'Mensual (Rondas)',
    technicalNote: 'La labor más crítica para garantizar la producción.'
  },
  {
    id: 'prod2',
    name: 'Poda de Mantenimiento',
    description: 'Regulación de altura y entrada de luz.',
    stage: 'PRODUCCION',
    category: 'MANO_DE_OBRA',
    unit: 'Jornales',
    quantityPerHa: 10,
    basePricePerUnit: 0,
    frequency: 'Anual (Salida de cosecha)',
  },
  {
    id: 'prod3',
    name: 'Cosecha y Beneficio',
    description: 'Recolección, desgrane, fermentación y secado.',
    stage: 'PRODUCCION',
    category: 'MANO_DE_OBRA',
    unit: 'Jornales',
    quantityPerHa: 25,
    basePricePerUnit: 0,
    frequency: 'Por cosecha principal',
  },
  {
    id: 'prod4',
    name: 'Herramientas de Poda',
    description: 'Tijeras, serruchos de poda y desinfectantes.',
    stage: 'PRODUCCION',
    category: 'HERRAMIENTAS',
    unit: 'Kit',
    quantityPerHa: 0.5, // 1 kit cada 2 hectáreas
    basePricePerUnit: 250000,
    frequency: 'Reposición anual',
  }
];