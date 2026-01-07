export type StageType = 'PREPARACION' | 'SIEMBRA' | 'CRECIMIENTO' | 'PRODUCCION';

export type CostCategory = 'MANO_DE_OBRA' | 'INSUMOS' | 'HERRAMIENTAS' | 'ADMINISTRATIVO';

export interface Activity {
  id: string;
  name: string;
  description: string;
  stage: StageType;
  category: CostCategory;
  unit: string; // e.g., 'Jornales', 'Plántulas', 'Bultos'
  quantityPerHa: number; // Base quantity required per hectare
  basePricePerUnit: number; // Estimated market price (can be overridden)
  frequency: string; // e.g., 'Única vez', 'Semestral', 'Mensual'
  technicalNote?: string; // Additional info (e.g., specific fertilizer formula)
}

export interface SimulationState {
  hectares: number;
  laborCost: number; // Costo del jornal
  currency: string;
}

export interface SummaryData {
  totalInvestment: number;
  totalLaborDays: number;
  costPerStage: Record<StageType, number>;
  costPerCategory: Record<CostCategory, number>;
}