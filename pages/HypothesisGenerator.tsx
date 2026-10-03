import React, { useState, useEffect } from 'react';
import { Lightbulb, Search, Plus, X, Target, Zap, Brain, TrendingUp } from 'lucide-react';
import { apiService } from '../services/api';
import { Hypothesis, HerbCombination } from '../types';
import toast from 'react-hot-toast';

const HypothesisGenerator: React.FC = () => {
  const [hypotheses, setHypotheses] = useState<Hypothesis[]>([]);
  const [combinations, setCombinations] = useState<HerbCombination[]>([]);
  const [selectedActions, setSelectedActions] = useState<string[]>([]);
  const [availableActions, setAvailableActions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingCombinations, setIsGeneratingCombinations] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadHypotheses();
    loadAvailableActions();
  }, []);

  const loadHypotheses = async () => {
    try {
      const response = await apiService.getHypotheses();
      setHypotheses(response.hypotheses);
    } catch (error) {
      toast.error('Failed to load hypotheses');
      console.error('Error loading hypotheses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAvailableActions = async () => {
    try {
      const response = await apiService.getAllHerbs();
      const allActions = new Set<string>();
      response.herbs.forEach(herb => {
        herb.therapeutic_actions.forEach((action: string) => allActions.add(action));
      });
      setAvailableActions(Array.from(allActions).sort());
    } catch (error) {
      console.error('Error loading available actions:', error);
    }
  };

  const handleActionToggle = (action: string) => {
    setSelectedActions(prev => 
      prev.includes(action) 
        ? prev.filter(a => a !== action)
        : [...prev, action]
    );
  };

  const generateCombinations = async () => {
    if (selectedActions.length === 0) {
      toast.error('Please select at least one therapeutic action');
      return;
    }

    setIsGeneratingCombinations(true);
    try {
      const response = await apiService.findHerbCombinations(selectedActions, 10);
      setCombinations(response.combinations);
      toast.success(`Found ${response.combinations.length} herb combinations`);
    } catch (error) {
      toast.error('Failed to generate combinations');
      console.error('Error generating combinations:', error);
    } finally {
      setIsGeneratingCombinations(false);
    }
  };

  const filteredActions = availableActions.filter(action =>
    action.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getHypothesisIcon = (type: string) => {
    switch (type) {
      case 'synergy': return <Zap className="w-5 h-5" />;
      case 'complementary': return <Brain className="w-5 h-5" />;
      default: return <Lightbulb className="w-5 h-5" />;
    }
  };

  const getHypothesisColor = (type: string) => {
    switch (type) {
      case 'synergy': return 'from-green-500 to-green-600';
      case 'complementary': return 'from-blue-500 to-blue-600';
      default: return 'from-ayurvedic-500 to-ayurvedic-600';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4 font-serif">
          Hypothesis Generator
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          AI-powered insights for herb combinations and potential synergies
        </p>
      </div>

      {/* Action Selection */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <Target className="w-5 h-5 mr-2 text-ayurvedic-600" />
          Select Therapeutic Actions
        </h2>
        
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search therapeutic actions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ayurvedic-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Selected Actions */}
          {selectedActions.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Selected Actions:</h3>
              <div className="flex flex-wrap gap-2">
                {selectedActions.map((action) => (
                  <span
                    key={action}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-ayurvedic-100 text-ayurvedic-800"
                  >
                    {action}
                    <button
                      onClick={() => handleActionToggle(action)}
                      className="ml-2 text-ayurvedic-600 hover:text-ayurvedic-800"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Available Actions */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Available Actions:</h3>
            <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {filteredActions.map((action) => (
                  <button
                    key={action}
                    onClick={() => handleActionToggle(action)}
                    className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedActions.includes(action)
                        ? 'bg-ayurvedic-100 text-ayurvedic-800 border border-ayurvedic-300'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-transparent'
                    }`}
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={generateCombinations}
            disabled={selectedActions.length === 0 || isGeneratingCombinations}
            className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGeneratingCombinations ? (
              <div className="loading-spinner" />
            ) : (
              <>
                <Plus className="w-5 h-5" />
                <span>Generate Combinations</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Generated Combinations */}
      {combinations.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-gold-600" />
            Generated Herb Combinations
          </h2>
          
          <div className="space-y-4">
            {combinations.map((combination, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-800 text-lg">
                      {combination.herbs.join(' + ')}
                    </h3>
                    <div className="text-sm text-gray-600">
                      Coverage: {combination.coverage_percentage.toFixed(1)}%
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gold-600">
                      {combination.covered_actions.length} actions covered
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {combination.covered_actions.map((action, actionIndex) => (
                    <span key={actionIndex} className="action-tag">
                      {action}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Hypotheses */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <Lightbulb className="w-5 h-5 mr-2 text-ayurvedic-600" />
          AI-Generated Hypotheses
        </h2>
        
        <div className="space-y-4">
          {hypotheses.map((hypothesis, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start space-x-3">
                <div className={`w-10 h-10 bg-gradient-to-r ${getHypothesisColor(hypothesis.type)} rounded-lg flex items-center justify-center text-white flex-shrink-0`}>
                  {getHypothesisIcon(hypothesis.type)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-800 capitalize">
                      {hypothesis.type} Hypothesis
                    </h3>
                    <div className="text-sm text-gray-500">
                      Confidence: {Math.round(hypothesis.confidence * 100)}%
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-3">
                    {hypothesis.description}
                  </p>
                  
                  <div className="flex items-center space-x-4">
                    <div>
                      <span className="text-sm font-medium text-gray-700">Herbs:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {hypothesis.herbs.map((herb, herbIndex) => (
                          <span key={herbIndex} className="property-tag">
                            {herb}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    {hypothesis.overlapping_actions && hypothesis.overlapping_actions.length > 0 && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">Overlapping Actions:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {hypothesis.overlapping_actions.map((action, actionIndex) => (
                            <span key={actionIndex} className="action-tag">
                              {action}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HypothesisGenerator;
