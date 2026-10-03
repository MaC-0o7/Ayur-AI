"""
FastAPI Backend Server for Ayurvedic AI Knowledge System
Provides REST API endpoints for frontend consumption
"""

from fastapi import FastAPI, HTTPException, UploadFile, File, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import json
import uvicorn
from nlp_pipeline import AyurvedicNLP
from graph_builder import AyurvedicKnowledgeGraph
from dataset_loader import DatasetLoader
from pubchem_api import PubChemAPI
from chembl_api import ChEMBLAPI

# Initialize FastAPI app
app = FastAPI(
    title="Ayurvedic AI Knowledge System",
    description="API for extracting and analyzing Ayurvedic knowledge from texts",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify actual frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize components
dataset_loader = DatasetLoader()
dataset_loader.load_all_datasets()

# Initialize NLP and Graph components
nlp_processor = AyurvedicNLP()
knowledge_graph = AyurvedicKnowledgeGraph()
pubchem_api = PubChemAPI()
chembl_api = ChEMBLAPI()

# Pydantic models for request/response
class TextInput(BaseModel):
    text: str

class HerbQuery(BaseModel):
    herb_name: str

class ActionQuery(BaseModel):
    actions: List[str]

class HypothesisRequest(BaseModel):
    target_actions: List[str]
    max_combinations: int = 5

# API Endpoints

@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Ayurvedic AI Knowledge System API",
        "version": "1.0.0",
        "endpoints": {
            "nlp": "/api/nlp/process",
            "herbs": "/api/herbs",
            "herb_details": "/api/herbs/{herb_name}",
            "graph": "/api/graph",
            "hypotheses": "/api/hypotheses",
            "similar_herbs": "/api/herbs/{herb_name}/similar",
            "combinations": "/api/combinations"
        }
    }

@app.post("/api/nlp/process")
async def process_text(input_data: TextInput):
    """Process Ayurvedic text and extract entities"""
    try:
        result = nlp_processor.process_text(input_data.text)
        return JSONResponse(content=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing text: {str(e)}")

@app.get("/api/herbs")
async def get_all_herbs():
    """Get all herbs in the knowledge base"""
    try:
        herbs = [node for node in knowledge_graph.graph.nodes() 
                if knowledge_graph.graph.nodes[node].get('type') == 'herb']
        
        herb_data = []
        for herb in herbs:
            pathway = knowledge_graph.get_herb_pathway(herb)
            herb_data.append({
                'name': herb,
                'properties': pathway.get('properties', []),
                'therapeutic_actions': pathway.get('therapeutic_actions', []),
                'compounds': pathway.get('compounds', [])
            })
        
        return JSONResponse(content={
            'herbs': herb_data,
            'total_count': len(herb_data)
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving herbs: {str(e)}")

@app.get("/api/herbs/{herb_name}")
async def get_herb_details(herb_name: str):
    """Get detailed information about a specific herb"""
    try:
        # Get from NLP processor
        nlp_details = nlp_processor.get_herb_details(herb_name)
        
        # Get from knowledge graph
        pathway = knowledge_graph.get_herb_pathway(herb_name)
        
        # Combine information
        combined_details = {
            'name': herb_name,
            'sanskrit_name': nlp_details.get('sanskrit_name', 'Unknown'),
            'properties': pathway.get('properties', []),
            'therapeutic_actions': pathway.get('therapeutic_actions', []),
            'compounds': pathway.get('compounds', []),
            'dosage': nlp_details.get('dosage', 'Consult practitioner'),
            'contraindications': nlp_details.get('contraindications', [])
        }
        
        return JSONResponse(content=combined_details)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving herb details: {str(e)}")

@app.get("/api/herbs/{herb_name}/similar")
async def get_similar_herbs(herb_name: str, top_k: int = 5):
    """Get herbs similar to the specified herb"""
    try:
        similar_herbs = knowledge_graph.find_similar_herbs(herb_name, top_k)
        
        result = []
        for herb, similarity in similar_herbs:
            pathway = knowledge_graph.get_herb_pathway(herb)
            result.append({
                'name': herb,
                'similarity_score': similarity,
                'properties': pathway.get('properties', []),
                'therapeutic_actions': pathway.get('therapeutic_actions', [])
            })
        
        return JSONResponse(content={
            'target_herb': herb_name,
            'similar_herbs': result
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error finding similar herbs: {str(e)}")

@app.get("/api/graph")
async def get_knowledge_graph():
    """Get the complete knowledge graph data"""
    try:
        graph_data = knowledge_graph.export_to_json()
        return JSONResponse(content=graph_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving graph data: {str(e)}")

@app.post("/api/insights")
async def generate_insights(request: Request):
    """Generate AI insights about nodes in the knowledge graph"""
    try:
        data = await request.json()
        node = data.get("node")
        connected_nodes = data.get("connectedNodes", [])
        prompt = data.get("prompt", "")
        
        # Generate context from the node and its connections
        context = f"Node: {node['label']} (Type: {node['type']})\n"
        context += f"Connected to: {', '.join([n['label'] for n in connected_nodes])}\n\n"
        
        # Create a detailed prompt for the LLM
        detailed_prompt = f"""
        Based on Ayurvedic knowledge, provide insights about {node['label']} which is a {node['type']} in Ayurvedic medicine.
        Consider its connections to: {', '.join([n['label'] for n in connected_nodes])}.
        
        Focus on:
        1. Its significance in Ayurvedic medicine
        2. Traditional uses and applications
        3. Relationships with connected entities
        4. Potential therapeutic implications
        
        Provide a concise but informative analysis (3-4 paragraphs).
        """
        
        # For now, generate a simulated response based on node type
        # In a production environment, this would call an LLM API
        insights = ""
        if node['type'] == 'herb':
            insights = f"{node['label']} is a significant herb in Ayurvedic medicine with connections to {len(connected_nodes)} other entities. "
            insights += f"It is known for its therapeutic properties and is commonly used in various Ayurvedic formulations. "
            insights += f"Traditional texts describe it as having specific effects on doshas and dhatus. "
            insights += f"\n\nThe connections in the graph suggest it may be effective for multiple health conditions. "
            insights += f"Its relationship with other herbs and properties in the knowledge graph indicates potential synergistic effects when used in combination therapies."
            insights += f"\n\nFurther research into {node['label']} could reveal new applications based on its position in the Ayurvedic knowledge system."
        elif node['type'] == 'property':
            insights = f"{node['label']} is an important property in Ayurvedic medicine associated with {len(connected_nodes)} entities. "
            insights += f"This property helps classify herbs and substances according to their effects on the body. "
            insights += f"\n\nUnderstanding this property is crucial for formulating effective treatments as it determines how substances interact with the body's systems. "
            insights += f"The connected herbs that share this property may have similar therapeutic applications despite different origins."
            insights += f"\n\nAyurvedic practitioners consider this property when balancing doshas and addressing specific health conditions."
        elif node['type'] == 'therapeutic_action':
            insights = f"{node['label']} represents a key therapeutic action in Ayurvedic medicine connected to {len(connected_nodes)} entities. "
            insights += f"This action describes a specific effect on the body's systems and processes that contributes to healing. "
            insights += f"\n\nThe connected herbs and properties indicate multiple pathways to achieve this therapeutic effect. "
            insights += f"Traditional Ayurvedic formulations often combine herbs to enhance this action for specific health conditions."
            insights += f"\n\nModern research might investigate the biochemical mechanisms behind this therapeutic action to validate traditional knowledge."
        else:
            insights = f"{node['label']} plays a specific role in the Ayurvedic knowledge system with {len(connected_nodes)} connections. "
            insights += f"Its position in the knowledge graph reveals important relationships within traditional medicine practices. "
            insights += f"\n\nThese connections help practitioners understand how different aspects of Ayurvedic medicine relate to each other. "
            insights += f"Further analysis of these relationships could provide insights into traditional healing approaches."
        
        return JSONResponse(content={"insights": insights})
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate insights: {str(e)}")

@app.get("/api/chemical-data/{herb_name}")
async def get_chemical_data(herb_name: str):
    """Get chemical data for a specific herb from PubChem and ChEMBL"""
    try:
        # Get PubChem data
        pubchem_data = pubchem_api.get_ayurvedic_herb_data(herb_name)
        
        # Get ChEMBL data
        chembl_data = chembl_api.get_ayurvedic_herb_data(herb_name)
        
        # Get phytochemicals from local datasets
        phytochemicals = dataset_loader.get_herb_phytochemicals(herb_name)
        
        return JSONResponse(content={
            "pubchem_data": pubchem_data,
            "chembl_data": chembl_data,
            "phytochemicals": phytochemicals
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving chemical data: {str(e)}")

@app.get("/api/datasets/herbs")
async def get_all_dataset_herbs():
    """Get all herbs from the local datasets"""
    try:
        herbs = dataset_loader.get_all_herbs()
        return JSONResponse(content={"herbs": list(herbs)})
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving herbs: {str(e)}")

@app.get("/api/hypotheses")
async def get_hypotheses():
    """Get all generated hypotheses about herb synergies"""
    try:
        hypotheses = knowledge_graph.generate_hypotheses()
        return JSONResponse(content={
            'hypotheses': hypotheses,
            'total_count': len(hypotheses)
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating hypotheses: {str(e)}")

@app.post("/api/combinations")
async def find_herb_combinations(request: HypothesisRequest):
    """Find herb combinations for specific therapeutic actions"""
    try:
        combinations = knowledge_graph.find_herb_combinations(request.target_actions)
        
        # Limit results
        limited_combinations = combinations[:request.max_combinations]
        
        return JSONResponse(content={
            'target_actions': request.target_actions,
            'combinations': limited_combinations,
            'total_found': len(combinations)
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error finding combinations: {str(e)}")

@app.post("/api/upload")
async def upload_text_file(file: UploadFile = File(...)):
    """Upload and process a text file containing Ayurvedic content"""
    try:
        # Read file content
        content = await file.read()
        text = content.decode('utf-8')
        
        # Process the text
        result = nlp_processor.process_text(text)
        
        return JSONResponse(content={
            'filename': file.filename,
            'file_size': len(content),
            'processing_result': result
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing uploaded file: {str(e)}")

@app.get("/api/stats")
async def get_system_stats():
    """Get system statistics and health information"""
    try:
        graph_data = knowledge_graph.export_to_json()
        
        stats = {
            'system_status': 'healthy',
            'knowledge_graph': {
                'total_nodes': graph_data['statistics']['total_nodes'],
                'total_edges': graph_data['statistics']['total_edges'],
                'node_types': graph_data['statistics']['node_types'],
                'relationship_types': graph_data['statistics']['relationship_types']
            },
            'nlp_processor': {
                'status': 'ready',
                'supported_herbs': len(nlp_processor.herbs),
                'supported_properties': len([p for prop_list in nlp_processor.properties.values() for p in prop_list]),
                'supported_actions': len(nlp_processor.therapeutic_actions)
            }
        }
        
        return JSONResponse(content=stats)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving system stats: {str(e)}")

# Error handlers
@app.exception_handler(404)
async def not_found_handler(request, exc):
    return JSONResponse(
        status_code=404,
        content={"message": "Endpoint not found", "available_endpoints": [
            "/api/nlp/process",
            "/api/herbs",
            "/api/graph",
            "/api/hypotheses"
        ]}
    )

@app.exception_handler(500)
async def internal_error_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={"message": "Internal server error", "error": str(exc)}
    )

if __name__ == "__main__":
    uvicorn.run(
        "api_server:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
