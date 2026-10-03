// API service for communicating with the FastAPI backend

import axios from 'axios';
import {
  NLPResult,
  HerbDetails,
  KnowledgeGraph,
  SimilarHerb,
  HerbCombination,
  Hypothesis,
  SystemStats,
  AyurvedicEntity,
  ChemicalData
} from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000,
  withCredentials: false,
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const apiService = {
  // NLP Processing
  async processText(text: string): Promise<NLPResult> {
    const response = await api.post('/api/nlp/process', { text });
    return response.data;
  },

  // Herbs
  async getAllHerbs(): Promise<{ herbs: any[]; total_count: number }> {
    const response = await api.get('/api/herbs');
    return response.data;
  },

  async getHerbDetails(herbName: string): Promise<HerbDetails> {
    const response = await api.get(`/api/herbs/${encodeURIComponent(herbName)}`);
    return response.data;
  },

  async getSimilarHerbs(herbName: string, topK: number = 5): Promise<{ target_herb: string; similar_herbs: SimilarHerb[] }> {
    const response = await api.get(`/api/herbs/${encodeURIComponent(herbName)}/similar?top_k=${topK}`);
    return response.data;
  },

  // Knowledge Graph
  async getKnowledgeGraph(): Promise<KnowledgeGraph> {
    const response = await api.get('/api/graph');
    return response.data;
  },

  // Hypotheses
  async getHypotheses(): Promise<{ hypotheses: Hypothesis[]; total_count: number }> {
    const response = await api.get('/api/hypotheses');
    return response.data;
  },
  
  async getHerbHypotheses(herbName: string): Promise<{ hypotheses: Hypothesis[] }> {
    const response = await api.get(`/api/herbs/${encodeURIComponent(herbName)}/hypotheses`);
    return response.data;
  },

  // Combinations
  async findHerbCombinations(targetActions: string[], maxCombinations: number = 5): Promise<{
    target_actions: string[];
    combinations: HerbCombination[];
    total_found: number;
  }> {
    const response = await api.post('/api/combinations', {
      target_actions: targetActions,
      max_combinations: maxCombinations
    });
    return response.data;
  },

  // Chemical Data
  async getChemicalData(herbName: string): Promise<ChemicalData> {
    const response = await api.get(`/chemical-data/${encodeURIComponent(herbName)}`);
    return response.data;
  },

  async getAllDatasetHerbs(): Promise<{ herbs: string[] }> {
    const response = await api.get('/datasets/herbs');
    return response.data;
  },

  async getHerbDataset(herbName: string): Promise<any> {
    const response = await api.get(`/datasets/herb/${encodeURIComponent(herbName)}`);
    return response.data;
  },

  // File Upload
  async uploadTextFile(file: File): Promise<{
    filename: string;
    file_size: number;
    processing_result: NLPResult;
  }> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // System Stats
  async getSystemStats(): Promise<SystemStats> {
    const response = await api.get('/api/stats');
    return response.data;
  },

  // Health Check
  async healthCheck(): Promise<{ message: string; version: string }> {
    const response = await api.get('/');
    return response.data;
  }
};

export default apiService;
