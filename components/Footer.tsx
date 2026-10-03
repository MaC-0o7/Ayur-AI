import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Github, Linkedin, Mail, Heart } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-r from-ayurvedic-800 to-ayurvedic-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-gold-400 to-gold-600 rounded-xl flex items-center justify-center">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold font-serif">Ayur AI</span>
            </Link>
            <p className="text-ayurvedic-200 mb-6 max-w-md leading-relaxed">
              Bridging ancient Ayurvedic wisdom with modern AI technology to unlock 
              the full potential of traditional medicine through intelligent analysis.
            </p>
            <div className="flex space-x-4">
              <a
                href="mailto:contact@ayur-ai.com"
                className="w-10 h-10 bg-ayurvedic-700 hover:bg-ayurvedic-600 rounded-lg flex items-center justify-center transition-colors"
                title="Email"
              >
                <Mail className="w-5 h-5" />
              </a>
              <a
                href="https://github.com/ayur-ai"
                className="w-10 h-10 bg-ayurvedic-700 hover:bg-ayurvedic-600 rounded-lg flex items-center justify-center transition-colors"
                title="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://linkedin.com/company/ayur-ai"
                className="w-10 h-10 bg-ayurvedic-700 hover:bg-ayurvedic-600 rounded-lg flex items-center justify-center transition-colors"
                title="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Explore</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-ayurvedic-200 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/herbs" className="text-ayurvedic-200 hover:text-white transition-colors">
                  Herb Explorer
                </Link>
              </li>
              <li>
                <Link to="/graph" className="text-ayurvedic-200 hover:text-white transition-colors">
                  Knowledge Graph
                </Link>
              </li>
              <li>
                <Link to="/hypotheses" className="text-ayurvedic-200 hover:text-white transition-colors">
                  AI Hypotheses
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-ayurvedic-200 hover:text-white transition-colors">
                  About
                </Link>
              </li>
            </ul>
          </div>

          {/* Features */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Features</h3>
            <ul className="space-y-2 text-ayurvedic-200">
              <li>NLP Text Processing</li>
              <li>Knowledge Graph</li>
              <li>AI Hypothesis Generation</li>
              <li>Interactive Visualization</li>
              <li>Herb Combination Analysis</li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-ayurvedic-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-ayurvedic-300 text-sm">
              © 2024 Ayur AI. All rights reserved.
            </p>
            <p className="text-ayurvedic-300 text-sm mt-2 md:mt-0 flex items-center">
              Made with <Heart className="w-4 h-4 text-red-400 mx-1" /> for preserving traditional medicine
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
