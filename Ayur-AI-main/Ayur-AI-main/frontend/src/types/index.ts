// Type definitions for the Ayurvedic AI Knowledge System

export interface AyurvedicEntity {
  name: string;
  confidence: number;
  context: string;
}

export interface NLPResult {
  text: string;
  herbs: AyurvedicEntity[];
  properties: AyurvedicEntity[];
  therapeutic_actions: AyurvedicEntity[];
  summary: {
    total_herbs: number;
    total_properties: number;
    total_actions: number;
  };
}

export interface HerbDetails {
  name: string;
  sanskrit_name: string;
  properties: string[];
  therapeutic_actions: string[];
  compounds: string[];
  dosage: string;
  contraindications: string[];
}

export interface GraphNode {
  id: string;
  label: string;
  type: 'herb' | 'property' | 'therapeutic_action' | 'compound';
  attributes: Record<string, any>;
}

export interface GraphEdge {
  source: string;
  target: string;
  relationship: string;
  weight: number;
  attributes: Record<string, any>;
}
export interface KnowledgeGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface ChemicalData {
  pubchem_data?: {
    cid?: number;
    iupac_name?: string;
    molecular_formula?: string;
    molecular_weight?: string;
    description?: string;
    synonyms?: string[];
    properties?: Record<string, any>;
  };
  chembl_data?: {
    chembl_id?: string;
    pref_name?: string;
    molecular_weight?: string;
    activities?: Array<{
      target_name: string;
      standard_type: string;
      standard_value: string;
      standard_units: string;
      assay_description: string;
    }>;
    targets?: any[];
  };
  phytochemicals?: string[];
  statistics?: {
    total_nodes: number;
    total_edges: number;
    node_types: string[];
    relationship_types: string[];
  };
}

export interface SimilarHerb {
  name: string;
  similarity_score: number;
  properties: string[];
  therapeutic_actions: string[];
}

export interface HerbCombination {
  herbs: string[];
  covered_actions: string[];
  coverage_percentage: number;
}

export interface Hypothesis {
  type: 'synergy' | 'complementary';
  herbs: string[];
  overlapping_actions?: string[];
  description: string;
  confidence: number;
}

export interface SystemStats {
  system_status: string;
  knowledge_graph: {
    total_nodes: number;
    total_edges: number;
    node_types: string[];
    relationship_types: string[];
  };
  nlp_processor: {
    status: string;
    supported_herbs: number;
    supported_properties: number;
    supported_actions: number;
  };
}

export interface APIResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}
