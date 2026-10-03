import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Upload, Search, Brain, Network, Lightbulb, ArrowRight, Leaf, BookOpen, Zap, Sparkles } from 'lucide-react';
import { apiService } from '../services/api';
import { NLPResult } from '../types';
import toast from 'react-hot-toast';

const Home: React.FC = () => {
  const [text, setText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<NLPResult | null>(null);

  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      toast.error('Please enter some text to analyze');
      return;
    }

    setIsProcessing(true);
    try {
      const result = await apiService.processText(text);
      setResults(result);
      toast.success('Text processed successfully!');
    } catch (error) {
      toast.error('Failed to process text. Please try again.');
      console.error('Error processing text:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'text/plain') {
      toast.error('Please upload a text file (.txt)');
      return;
    }

    setIsProcessing(true);
    try {
      const result = await apiService.uploadTextFile(file);
      setResults(result.processing_result);
      toast.success('File processed successfully!');
    } catch (error) {
      toast.error('Failed to process file. Please try again.');
      console.error('Error processing file:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const features = [
    {
      icon: Brain,
      title: 'Herb Explorer',
      description: 'Discover Ayurvedic herbs with their properties, therapeutic actions, and compounds',
      link: '/herbs',
      color: 'from-ayurvedic-500 to-ayurvedic-600'
    },
    {
      icon: Network,
      title: 'Knowledge Graph',
      description: 'Visualize complex relationships between herbs, properties, and therapeutic actions',
      link: '/graph',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: Lightbulb,
      title: 'Hypothesis Generator',
      description: 'AI-powered insights for herb combinations and potential synergies',
      link: '/hypotheses',
      color: 'from-gold-500 to-gold-600'
    }
  ];

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center py-16 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-ayurvedic-100/30 via-transparent to-gold-100/30"></div>
        <div className="absolute top-20 left-10 w-20 h-20 bg-ayurvedic-200/20 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-gold-200/20 rounded-full blur-xl"></div>
        
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-ayurvedic-500 to-gold-500 text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            <span>Powered by Advanced AI</span>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold text-gray-900 mb-6 font-serif bg-gradient-to-r from-ayurvedic-600 via-ayurvedic-700 to-gold-600 bg-clip-text text-transparent">
            Ayur AI
          </h1>
          
          <p className="text-2xl text-gray-600 mb-4 leading-relaxed font-medium">
            Ancient Wisdom Meets Modern Intelligence
          </p>
          
          <p className="text-lg text-gray-500 mb-12 max-w-3xl mx-auto leading-relaxed">
            Discover the hidden connections in Ayurvedic medicine through our AI-powered platform. 
            Extract insights, explore herb relationships, and unlock the therapeutic potential 
            of traditional knowledge with cutting-edge technology.
          </p>
          
          {/* Upload Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 mb-8 border border-ayurvedic-200">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-3 font-serif">
                Upload Ayurvedic Text
              </h2>
              <p className="text-gray-600">
                Paste your text or upload a file to extract herbs, properties, and therapeutic actions
              </p>
            </div>
            
            <form onSubmit={handleTextSubmit} className="space-y-6">
              <div className="relative">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Paste your Ayurvedic text here... (e.g., herb descriptions, formulations, therapeutic properties)"
                  className="w-full h-40 px-6 py-4 border-2 border-ayurvedic-200 rounded-2xl focus:ring-4 focus:ring-ayurvedic-500/20 focus:border-ayurvedic-500 outline-none resize-none text-gray-700 placeholder-gray-400 transition-all duration-200"
                  disabled={isProcessing}
                />
                <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                  {text.length} characters
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  type="submit"
                  disabled={isProcessing || !text.trim()}
                  className="group relative px-8 py-4 bg-gradient-to-r from-ayurvedic-500 to-ayurvedic-600 hover:from-ayurvedic-600 hover:to-ayurvedic-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isProcessing ? (
                    <div className="loading-spinner" />
                  ) : (
                    <>
                      <Search className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                      <span>Analyze Text</span>
                    </>
                  )}
                </button>
                
                <label className="group relative px-8 py-4 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
                  <Upload className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                  <span>Upload File</span>
                  <input
                    type="file"
                    accept=".txt"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={isProcessing}
                  />
                </label>
              </div>
            </form>
          </div>

          {/* Results Display */}
          {results && (
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 text-left border border-ayurvedic-200 fade-in">
              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold text-gray-800 mb-3 font-serif">
                  Analysis Results
                </h3>
                <p className="text-gray-600">
                  AI-powered extraction of Ayurvedic entities from your text
                </p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-6 bg-gradient-to-br from-ayurvedic-50 to-ayurvedic-100 rounded-2xl border border-ayurvedic-200 hover:shadow-lg transition-all duration-200">
                  <div className="w-12 h-12 bg-gradient-to-r from-ayurvedic-500 to-ayurvedic-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Leaf className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-4xl font-bold text-ayurvedic-600 mb-1">{results.summary.total_herbs}</div>
                  <div className="text-sm font-medium text-gray-600">Herbs Found</div>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-gold-50 to-gold-100 rounded-2xl border border-gold-200 hover:shadow-lg transition-all duration-200">
                  <div className="w-12 h-12 bg-gradient-to-r from-gold-500 to-gold-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-4xl font-bold text-gold-600 mb-1">{results.summary.total_properties}</div>
                  <div className="text-sm font-medium text-gray-600">Properties</div>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-200 hover:shadow-lg transition-all duration-200">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-4xl font-bold text-blue-600 mb-1">{results.summary.total_actions}</div>
                  <div className="text-sm font-medium text-gray-600">Therapeutic Actions</div>
                </div>
              </div>

              <div className="space-y-4">
                {results.herbs.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Herbs:</h4>
                    <div className="flex flex-wrap gap-2">
                      {results.herbs.map((herb, index) => (
                        <span key={index} className="property-tag">
                          {herb.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {results.properties && results.properties.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Properties:</h4>
                    <div className="flex flex-wrap gap-2">
                      {results.properties.map((property, index) => (
                        <span key={index} className="property-tag bg-gold-100 text-gold-700 border-gold-200">
                          {property.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {results.therapeutic_actions.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Therapeutic Actions:</h4>
                    <div className="flex flex-wrap gap-2">
                      {results.therapeutic_actions.map((action, index) => (
                        <span key={index} className="action-tag">
                          {action.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 relative">
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-ayurvedic-500 to-gold-500 text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            <span>Advanced Features</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 font-serif">
            Explore Ayurvedic Knowledge
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Our AI-powered system helps you discover, analyze, and understand 
            the complex relationships in Ayurvedic medicine through cutting-edge technology.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Link
                key={index}
                to={feature.link}
                className="group bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-ayurvedic-200 hover:border-ayurvedic-300"
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-200 shadow-lg`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4 font-serif group-hover:text-ayurvedic-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {feature.description}
                </p>
                <div className="flex items-center text-ayurvedic-600 font-semibold group-hover:text-ayurvedic-700">
                  <span>Explore Feature</span>
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative overflow-hidden">
        <div className="bg-gradient-to-br from-ayurvedic-600 via-ayurvedic-700 to-ayurvedic-800 rounded-3xl p-12 text-white relative">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-32 h-32 bg-gold-300 rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 right-10 w-40 h-40 bg-ayurvedic-300 rounded-full blur-3xl"></div>
          </div>
          
          <div className="text-center mb-12 relative z-10">
            <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              <span>Powered by Advanced AI</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 font-serif">
              Ancient Wisdom with Modern Intelligence
            </h2>
            <p className="text-ayurvedic-100 text-xl max-w-3xl mx-auto leading-relaxed">
              Combining traditional knowledge with cutting-edge technology to unlock 
              the full potential of Ayurvedic medicine
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 text-center relative z-10">
            <div className="group">
              <div className="w-16 h-16 bg-gradient-to-r from-gold-400 to-gold-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
                <Leaf className="w-8 h-8 text-white" />
              </div>
              <div className="text-5xl font-bold mb-2 group-hover:text-gold-300 transition-colors">25+</div>
              <div className="text-ayurvedic-200 font-medium">Herbs Analyzed</div>
            </div>
            <div className="group">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <div className="text-5xl font-bold mb-2 group-hover:text-blue-300 transition-colors">50+</div>
              <div className="text-ayurvedic-200 font-medium">Properties Mapped</div>
            </div>
            <div className="group">
              <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <div className="text-5xl font-bold mb-2 group-hover:text-green-300 transition-colors">30+</div>
              <div className="text-ayurvedic-200 font-medium">Therapeutic Actions</div>
            </div>
            <div className="group">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
                <Network className="w-8 h-8 text-white" />
              </div>
              <div className="text-5xl font-bold mb-2 group-hover:text-purple-300 transition-colors">100+</div>
              <div className="text-ayurvedic-200 font-medium">Relationships</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
