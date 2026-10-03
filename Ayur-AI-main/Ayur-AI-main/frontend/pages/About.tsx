import React from 'react';
import { Leaf, Brain, Code, Database, Users, Award, Github, Linkedin, Mail } from 'lucide-react';

const About: React.FC = () => {
  const teamMembers = [
    {
      name: 'K.Sainadh Maharaj',
      role: 'UI/UX Designer',
      bio: 'Experienced User Experience Designer with good experience in creating intuitive and user-centered interfaces.',
      expertise: ['User Experience Design', 'Wireframing', 'Prototyping'],
      image: '👨🏻‍🎨'
    },
    {
      name: 'A.Sree Sanjay',
      role: 'Tech Lead',
      bio: 'Experienced Software Engineer with a strong background in AI/ML and full-stack development.',
      expertise: ['AI/ML', 'Full-Stack Development', 'Backend Services'],
      image: '👨🏻‍💻'
    },
    {
      name: 'T.Keerthi Kireeti',
      role: 'ML Engineer / Business Analyst',
      bio: 'Experienced Data Scientist with a strong background in statistical modeling, data analysis, and business intelligence.',
      expertise: ['Data Science', 'Statistical Modeling', 'Business Intelligence'],
      image: '🧑🏻‍🔬'
    },
    {
      name: 'D. Venkata Dinesh Sai',
      role: 'Data Scientist',
      bio: 'Expert in biomedical data analysis and machine learning applications in traditional medicine.',
      expertise: ['Data Science', 'Biomedical Analysis', 'Statistical Modeling'],
      image: '👨🏻‍🔧'
    },
    {
      name: 'Ch. Pruthvi',
      role: 'Backend Developer',
      bio: 'Expert in backend development with a strong background in AI/ML and full-stack development.',
      expertise: ['Backend Development', 'AI/ML', 'Full-Stack Development'],
      image: '👷🏻‍♂️'
    }
  ];

  const technologies = [
    {
      name: 'spaCy & NLTK',
      description: 'Natural Language Processing for text analysis and entity extraction',
      icon: '🧠'
    },
    {
      name: 'NetworkX',
      description: 'Graph construction and analysis for knowledge representation',
      icon: '🕸️'
    },
    {
      name: 'FastAPI',
      description: 'High-performance API framework for backend services',
      icon: '⚡'
    },
    {
      name: 'React & TypeScript',
      description: 'Modern frontend framework with type safety',
      icon: '⚛️'
    },
    {
      name: 'D3.js',
      description: 'Interactive data visualization for knowledge graphs',
      icon: '📊'
    },
    {
      name: 'Tailwind CSS',
      description: 'Utility-first CSS framework for responsive design',
      icon: '🎨'
    }
  ];

  const features = [
    {
      title: 'NLP Text Processing',
      description: 'Advanced natural language processing to extract herbs, properties, and therapeutic actions from Ayurvedic texts',
      icon: Brain
    },
    {
      title: 'Knowledge Graph Construction',
      description: 'Build comprehensive knowledge graphs showing relationships between herbs, properties, and therapeutic actions',
      icon: Database
    },
    {
      title: 'AI Hypothesis Generation',
      description: 'Machine learning algorithms to identify potential herb synergies and therapeutic combinations',
      icon: Leaf
    },
    {
      title: 'Interactive Visualization',
      description: 'Dynamic, interactive visualizations to explore complex relationships in Ayurvedic knowledge',
      icon: Code
    }
  ];

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="text-center py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-6 font-serif">
          About Ayurvedic AI
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Bridging ancient wisdom with modern technology to unlock the full potential 
          of Ayurvedic medicine through artificial intelligence and data science.
        </p>
      </div>

      {/* Mission Statement */}
      <div className="bg-gradient-to-r from-ayurvedic-600 to-ayurvedic-700 rounded-2xl p-8 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6 font-serif">Our Mission</h2>
          <p className="text-lg leading-relaxed mb-6">
            To preserve and enhance traditional Ayurvedic knowledge by applying cutting-edge 
            AI technologies, making this ancient wisdom more accessible, understandable, and 
            applicable in modern healthcare contexts.
          </p>
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">500+</div>
              <div className="text-ayurvedic-200">Years of Knowledge</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">25+</div>
              <div className="text-ayurvedic-200">Herbs Analyzed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">100+</div>
              <div className="text-ayurvedic-200">Relationships Mapped</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="py-12">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12 font-serif">
          Key Features
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="card hover:shadow-xl transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-r from-ayurvedic-500 to-ayurvedic-600 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Technology Stack */}
      <div className="py-12">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12 font-serif">
          Technology Stack
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {technologies.map((tech, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">{tech.icon}</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {tech.name}
              </h3>
              <p className="text-gray-600 text-sm">
                {tech.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Team */}
      <div className="py-12">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12 font-serif">
          Our Team
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {teamMembers.map((member, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
              <div className="text-6xl mb-4">{member.image}</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {member.name}
              </h3>
              <p className="text-ayurvedic-600 font-medium mb-3">
                {member.role}
              </p>
              <p className="text-gray-600 text-sm mb-4">
                {member.bio}
              </p>
              <div className="space-y-1">
                {member.expertise.map((skill, skillIndex) => (
                  <span key={skillIndex} className="property-tag">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Project Credits */}
      <div className="bg-gray-50 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-8 font-serif">
          Project Credits
        </h2>
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Research Partners</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• National Institute of Ayurveda, Jaipur</li>
                <li>• Central Council for Research in Ayurvedic Sciences</li>
                <li>• All India Institute of Ayurveda, New Delhi</li>
                <li>• Banaras Hindu University, Varanasi</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Data Sources</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Charaka Samhita</li>
                <li>• Sushruta Samhita</li>
                <li>• Ashtanga Hridayam</li>
                <li>• Modern Ayurvedic Research Papers</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 font-serif">
          Get in Touch
        </h2>
        <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
          Interested in collaborating or learning more about our research? 
          We'd love to hear from you.
        </p>
        <div className="flex justify-center space-x-6">
          <a
            href="mailto:23kq1a05g6@pace.ac.in"
            className="flex items-center space-x-2 text-gray-600 hover:text-ayurvedic-600 transition-colors"
          >
            <Mail className="w-5 h-5" />
            <span>Email</span>
          </a>
          <a
            href="https://github.com/Keerthi-Kireeti"
            className="flex items-center space-x-2 text-gray-600 hover:text-ayurvedic-600 transition-colors"
          >
            <Github className="w-5 h-5" />
            <span>GitHub</span>
          </a>
          <a
            href="https://www.linkedin.com/in/keerthi-c25p8e18/"
            className="flex items-center space-x-2 text-gray-600 hover:text-ayurvedic-600 transition-colors"
          >
            <Linkedin className="w-5 h-5" />
            <span>LinkedIn</span>
          </a>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-8 border-t border-gray-200">
        <p className="text-gray-600">
          © 2024 Ayurvedic AI Knowledge System. All rights reserved.
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Built with ❤️ for preserving and advancing traditional medicine
        </p>
      </div>
    </div>
  );
};

export default About;
