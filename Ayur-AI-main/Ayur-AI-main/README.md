# Ayur AI - Ancient Wisdom Meets Modern Intelligence

A comprehensive AI-powered platform for extracting, analyzing, and visualizing Ayurvedic knowledge from traditional texts using modern natural language processing and machine learning techniques. Bridging ancient wisdom with cutting-edge technology.

## 🌟 Features

- **NLP Text Processing**: Extract herbs, properties, and therapeutic actions from Ayurvedic texts
- **Knowledge Graph Construction**: Build interactive graphs showing relationships between entities
- **AI Hypothesis Generation**: Generate insights about herb synergies and potential combinations
- **Interactive Visualization**: Dynamic D3.js-based visualizations for exploring complex relationships
- **Modern Web Interface**: Responsive React TypeScript frontend with Tailwind CSS

## 🏗️ Architecture

```
AyurAI/
├── backend/                 # FastAPI backend
│   ├── nlp_pipeline.py     # NLP processing with spaCy
│   ├── graph_builder.py    # Knowledge graph construction
│   ├── api_server.py       # FastAPI REST API
│   └── requirements.txt    # Python dependencies
├── frontend/               # React TypeScript frontend
│   ├── src/
│   │   ├── pages/          # Main application pages
│   │   ├── components/     # Reusable UI components
│   │   ├── services/       # API service layer
│   │   └── types/          # TypeScript type definitions
│   ├── package.json        # Node.js dependencies
│   └── tailwind.config.js  # Tailwind CSS configuration
└── report/                 # System documentation
```

## 🚀 Quick Start

### Prerequisites

- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Download spaCy English model:
```bash
python -m spacy download en_core_web_sm
```

5. Start the FastAPI server:
```bash
python api_server.py
```

The API will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
echo "REACT_APP_API_URL=http://localhost:8000" > .env
```

4. Start the development server:
```bash
npm start
```

The application will be available at `http://localhost:3000`

## 📚 API Endpoints

### NLP Processing
- `POST /api/nlp/process` - Process Ayurvedic text
- `POST /api/upload` - Upload text file for processing

### Herbs
- `GET /api/herbs` - Get all herbs
- `GET /api/herbs/{herb_name}` - Get specific herb details
- `GET /api/herbs/{herb_name}/similar` - Get similar herbs

### Knowledge Graph
- `GET /api/graph` - Get complete knowledge graph data

### Hypotheses
- `GET /api/hypotheses` - Get AI-generated hypotheses
- `POST /api/combinations` - Find herb combinations for specific actions

### System
- `GET /api/stats` - Get system statistics
- `GET /` - API information

## 🧠 NLP Pipeline

The NLP pipeline uses spaCy and NLTK to:

1. **Entity Extraction**: Identify herbs, properties, and therapeutic actions
2. **Context Analysis**: Extract surrounding context for each entity
3. **Confidence Scoring**: Assign confidence scores to extracted entities
4. **Structured Output**: Return results in structured JSON format

### Supported Entities

- **Herbs**: Ashwagandha, Neem, Tulsi, Turmeric, etc.
- **Properties**: Rasa (taste), Guna (qualities), Vipaka (post-digestive effect)
- **Therapeutic Actions**: Anti-inflammatory, adaptogenic, immunomodulatory, etc.

## 🕸️ Knowledge Graph

The knowledge graph is built using NetworkX and includes:

- **Nodes**: Herbs, properties, therapeutic actions, compounds
- **Edges**: Relationships between entities (has_property, treats_condition, etc.)
- **Algorithms**: Similarity computation, combination finding, hypothesis generation

## 🎨 Frontend Features

### Pages
1. **Home**: Text upload and NLP processing
2. **Herb Explorer**: Browse and explore herb details
3. **Knowledge Graph**: Interactive D3.js visualization
4. **Hypothesis Generator**: AI-powered insights and combinations
5. **About**: Project information and team details

### Technologies
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **D3.js** for data visualization
- **Axios** for API communication
- **React Router** for navigation

## 🔬 Research Applications

This system can be used for:

- **Traditional Medicine Research**: Analyze historical texts and formulations
- **Drug Discovery**: Identify potential herb combinations and synergies
- **Clinical Practice**: Support evidence-based Ayurvedic treatment planning
- **Education**: Interactive learning tool for students and practitioners

## 📊 Sample Data

The system comes with sample data including:

- 25+ Ayurvedic herbs with detailed properties
- 50+ therapeutic properties and actions
- 100+ relationships between entities
- Pre-built knowledge graph with herb-compound relationships

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines for details on:

- Code style and standards
- Testing requirements
- Pull request process
- Issue reporting

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Traditional Ayurvedic texts and practitioners
- Open source NLP and ML libraries
- Research institutions and collaborators
- The broader AI and medical research community

## 📞 Contact

For questions, suggestions, or collaboration opportunities:

- Email: contact@ayurvedic-ai.com
- GitHub: https://github.com/ayurvedic-ai
- LinkedIn: https://linkedin.com/company/ayurvedic-ai

---

Built with ❤️ for preserving and advancing traditional medicine through modern technology.
