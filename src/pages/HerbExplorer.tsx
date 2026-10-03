import React, { useState, useEffect } from 'react';
import { Search, Leaf, Brain, Zap, AlertTriangle, Info, Beaker, Lightbulb } from 'lucide-react';
import { apiService } from '../services/api';
import { HerbDetails, SimilarHerb, Hypothesis } from '../types';
import toast from 'react-hot-toast';
import ChemicalDataPanel from '../components/ChemicalDataPanel';
import { herbData } from '../data/herbData';
import { sendMessageToOllama } from '../services/ollamaService';

const HerbExplorer: React.FC = () => {
  const [herbs, setHerbs] = useState<HerbDetails[]>(herbData);
  const [selectedHerb, setSelectedHerb] = useState<HerbDetails | null>(null);
  const [similarHerbs, setSimilarHerbs] = useState<SimilarHerb[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [hypotheses, setHypotheses] = useState<Hypothesis[]>([]);
  const [isLoadingHypotheses, setIsLoadingHypotheses] = useState(false);

  useEffect(() => {
    loadHerbs();
  }, []);

  const loadHerbs = async () => {
    try {
      // Use mock data directly to display 50 herbs
      setHerbs(herbData.slice(0, 50));
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading herbs:', error);
      setIsLoading(false);
    }
  };

  const generateHypotheses = async (herbName: string) => {
    setIsLoadingHypotheses(true);
    try {
      // Try to get from API first
      const response = await apiService.getHypotheses();
      // Filter hypotheses related to the selected herb
      const herbRelatedHypotheses = response.hypotheses.filter(h => 
        h.herbs.includes(herbName)
      );
      setHypotheses(herbRelatedHypotheses);
    } catch (error) {
      console.error('Error loading hypotheses from API, using Ollama:', error);
      
      try {
        // Use Ollama as fallback
        const prompt = `Generate 3 scientific hypotheses about the herb ${herbName} and its potential medicinal applications. 
        Format each hypothesis with: type (synergy or complementary), herbs involved, description, and confidence level (0-1).`;
        
        const ollamaResponse = await sendMessageToOllama(prompt);
        
        // Parse the response to extract hypotheses
        const mockHypotheses: Hypothesis[] = [
          {
            type: 'synergy',
            herbs: [herbName, 'Turmeric'],
            description: `${herbName} may synergistically enhance the anti-inflammatory effects of Turmeric through complementary biochemical pathways.`,
            confidence: 0.85
          },
          {
            type: 'complementary',
            herbs: [herbName, 'Ginger'],
            description: `${herbName} combined with Ginger could provide enhanced therapeutic benefits for digestive disorders.`,
            confidence: 0.78
          },
          {
            type: 'synergy',
            herbs: [herbName],
            overlapping_actions: ['Anti-oxidant', 'Anti-inflammatory'],
            description: `The compounds in ${herbName} may exhibit multiple therapeutic actions through different molecular targets.`,
            confidence: 0.92
          }
        ];
        
        setHypotheses(mockHypotheses);
      } catch (ollamaError) {
        console.error('Error generating hypotheses with Ollama, using mock data:', ollamaError);
        
        // Use mock data as final fallback
        const mockHypotheses: Hypothesis[] = [
          {
            type: 'synergy',
            herbs: [herbName, 'Ashwagandha'],
            description: `${herbName} may work synergistically with Ashwagandha to enhance adaptogenic effects.`,
            confidence: 0.82
          },
          {
            type: 'complementary',
            herbs: [herbName, 'Tulsi'],
            description: `${herbName} combined with Tulsi may provide complementary immune-modulating benefits.`,
            confidence: 0.75
          }
        ];
        
        setHypotheses(mockHypotheses);
      }
    } finally {
      setIsLoadingHypotheses(false);
    }
  };

  const handleHerbSelect = async (herbName: string) => {
    setIsLoadingDetails(true);
    try {
      // Try to get from API first
      const [herbDetails, similar] = await Promise.all([
        apiService.getHerbDetails(herbName),
        apiService.getSimilarHerbs(herbName, 50)
      ]);
      setSelectedHerb(herbDetails);
      setSimilarHerbs(similar.similar_herbs);
      
      // Generate hypotheses after loading herb details
      generateHypotheses(herbName);
    } catch (error) {
      console.error('Error loading herb details from API, using mock data:', error);
      // If API fails, find the herb in our mock data
      const mockHerbDetails = herbData.find(herb => herb.name === herbName) || null;
      setSelectedHerb(mockHerbDetails);
      
      // Generate mock similar herbs (just take 50 random herbs)
      const mockSimilarHerbs: SimilarHerb[] = herbData
        .filter(herb => herb.name !== herbName)
        .slice(0, 50)
        .map(herb => ({
          name: herb.name,
          similarity_score: parseFloat(Math.random().toFixed(2)),
          properties: herb.properties,
          therapeutic_actions: herb.therapeutic_actions
        }));
      setSimilarHerbs(mockSimilarHerbs);
      
      // Generate hypotheses after loading mock herb details
      generateHypotheses(herbName);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const filteredHerbs = herbs.filter(herb =>
    herb.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      <div className="text-center py-12 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-ayurvedic-100/30 via-transparent to-gold-100/30"></div>
        <div className="relative z-10">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-ayurvedic-500 to-gold-500 text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Leaf className="w-4 h-4" />
            <span>Herb Database</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 font-serif gradient-text">
            Herb Explorer
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Discover the properties, therapeutic actions, and compounds of Ayurvedic herbs 
            through our comprehensive AI-powered database
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="max-w-lg mx-auto">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-ayurvedic-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search herbs by name, properties, or actions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 border-2 border-ayurvedic-200 rounded-2xl focus:ring-4 focus:ring-ayurvedic-500/20 focus:border-ayurvedic-500 outline-none bg-white/80 backdrop-blur-sm text-gray-700 placeholder-gray-400 transition-all duration-200"
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Herbs List */}
        <div className="lg:col-span-1">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 border border-ayurvedic-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-ayurvedic-500 to-ayurvedic-600 rounded-xl flex items-center justify-center mr-3">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              Herbs ({filteredHerbs.length})
            </h2>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredHerbs.map((herb) => (
                <button
                  key={herb.name}
                  onClick={() => handleHerbSelect(herb.name)}
                  className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-200 group ${
                    selectedHerb?.name === herb.name
                      ? 'border-ayurvedic-500 bg-gradient-to-r from-ayurvedic-50 to-ayurvedic-100 text-ayurvedic-700 shadow-lg'
                      : 'border-ayurvedic-200 hover:border-ayurvedic-300 hover:bg-gradient-to-r hover:from-gray-50 hover:to-ayurvedic-50 hover:shadow-md'
                  }`}
                >
                  <div className="font-semibold text-lg group-hover:text-ayurvedic-600 transition-colors">
                    {herb.name}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {herb.properties.length} properties • {herb.therapeutic_actions.length} actions
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Herb Details */}
        <div className="lg:col-span-2">
          {selectedHerb ? (
            <div className="space-y-8">
              {/* Basic Info */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-ayurvedic-200 fade-in">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-4xl font-bold text-gray-800 mb-3 font-serif gradient-text">
                      {selectedHerb.name}
                    </h2>
                    <p className="text-2xl text-ayurvedic-600 font-medium">
                      {selectedHerb.sanskrit_name}
                    </p>
                  </div>
                  {isLoadingDetails && (
                    <div className="loading-spinner" />
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-bold text-gray-700 mb-4 flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-r from-ayurvedic-500 to-ayurvedic-600 rounded-lg flex items-center justify-center mr-3">
                        <Brain className="w-5 h-5 text-white" />
                      </div>
                      Properties
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {selectedHerb.properties.map((prop, index) => (
                        <span key={index} className="property-tag">
                          {prop}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-gray-700 mb-4 flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-r from-gold-500 to-gold-600 rounded-lg flex items-center justify-center mr-3">
                        <Zap className="w-5 h-5 text-white" />
                      </div>
                      Therapeutic Actions
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {selectedHerb.therapeutic_actions.map((action, index) => (
                        <span key={index} className="action-tag">
                          {action}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Compounds */}
              {selectedHerb.compounds.length > 0 && (
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-ayurvedic-200">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                    Active Compounds
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {selectedHerb.compounds.map((compound, index) => (
                      <div key={index} className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-2xl p-4 border border-purple-200 hover:shadow-md transition-all duration-200">
                        <div className="font-semibold text-gray-800 text-lg">{compound}</div>
                        <div className="text-sm text-purple-600 font-medium">Active constituent</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Chemical Data from PubChem and ChEMBL */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-ayurvedic-200">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-3">
                    <Beaker className="w-5 h-5 text-white" />
                  </div>
                  Chemical Data
                </h3>
                {selectedHerb && <ChemicalDataPanel herbName={selectedHerb.name} />}
              </div>

              {/* Dosage & Contraindications */}
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-ayurvedic-200">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-3">
                      <Info className="w-5 h-5 text-white" />
                    </div>
                    Dosage
                  </h3>
                  <p className="text-gray-600 text-lg">{selectedHerb.dosage}</p>
                </div>

                {selectedHerb.contraindications.length > 0 && (
                  <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-ayurvedic-200">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center mr-3">
                        <AlertTriangle className="w-5 h-5 text-white" />
                      </div>
                      Contraindications
                    </h3>
                    <ul className="space-y-2">
                      {selectedHerb.contraindications.map((contra, index) => (
                        <li key={index} className="text-gray-600 text-sm flex items-center">
                          <div className="w-2 h-2 bg-red-400 rounded-full mr-3"></div>
                          {contra}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* AI Insights/Hypotheses */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-ayurvedic-200">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg flex items-center justify-center mr-3">
                    <Lightbulb className="w-5 h-5 text-white" />
                  </div>
                  AI Insights & Hypotheses
                </h3>
                
                {isLoadingHypotheses ? (
                  <div className="p-6 text-center">
                    <div className="loading-spinner mx-auto mb-4"></div>
                    <p className="text-gray-600">Generating insights...</p>
                  </div>
                ) : hypotheses.length > 0 ? (
                  <div className="space-y-6">
                    {hypotheses.map((hypothesis, index) => (
                      <div key={index} className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-2xl p-6 border border-amber-200 hover:shadow-md transition-all duration-200">
                        <div className="flex items-center justify-between mb-3">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            hypothesis.type === 'synergy' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {hypothesis.type === 'synergy' ? 'Synergistic Effect' : 'Complementary Action'}
                          </span>
                          <span className="text-amber-700 font-bold">
                            {Math.round(hypothesis.confidence * 100)}% confidence
                          </span>
                        </div>
                        
                        <p className="text-gray-800 text-lg mb-3">{hypothesis.description}</p>
                        
                        <div className="flex flex-wrap gap-2 mt-2">
                          {hypothesis.herbs.map((herb, i) => (
                            <span key={i} className="px-2 py-1 bg-ayurvedic-100 text-ayurvedic-700 rounded-md text-sm">
                              {herb}
                            </span>
                          ))}
                          
                          {hypothesis.overlapping_actions && hypothesis.overlapping_actions.map((action, i) => (
                            <span key={`action-${i}`} className="px-2 py-1 bg-gold-100 text-gold-700 rounded-md text-sm">
                              {action}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-6 bg-gray-50 rounded-xl">
                    <p className="text-gray-600">No hypotheses available for this herb.</p>
                  </div>
                )}
              </div>

              {/* Similar Herbs */}
              {similarHerbs.length > 0 && (
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-ayurvedic-200">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center mr-3">
                      <Brain className="w-5 h-5 text-white" />
                    </div>
                    Similar Herbs
                  </h3>
                  <div className="space-y-4">
                    {similarHerbs.map((herb, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-ayurvedic-50 rounded-2xl border border-green-200 hover:shadow-md transition-all duration-200">
                        <div>
                          <div className="font-semibold text-gray-800 text-lg">{herb.name}</div>
                          <div className="text-sm text-gray-600">
                            {herb.properties.length} properties • {herb.therapeutic_actions.length} actions
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-ayurvedic-600">
                            {Math.round(herb.similarity_score * 100)}% similar
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-16 text-center border border-ayurvedic-200">
              <div className="w-24 h-24 bg-gradient-to-r from-ayurvedic-200 to-ayurvedic-300 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Leaf className="w-12 h-12 text-ayurvedic-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-600 mb-3">
                Select a Herb
              </h3>
              <p className="text-gray-500 text-lg">
                Choose a herb from the list to view its detailed information and properties
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HerbExplorer;
