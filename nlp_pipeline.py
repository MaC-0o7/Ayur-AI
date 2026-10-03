"""
Ayurvedic NLP Pipeline for extracting herbs, properties, and therapeutic actions
from Ayurvedic texts using spaCy and NLTK with integration to PubChem and ChEMBL APIs.
"""

import spacy
import nltk
import json
import re
import os
import csv
from typing import List, Dict, Any
from dataclasses import dataclass
import pandas as pd
import logging

# Import PubChem and ChEMBL API modules
from pubchem_api import PubChemAPI
from chembl_api import ChEMBLAPI

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Download required NLTK data
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')

try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords')

@dataclass
class AyurvedicEntity:
    """Data class for Ayurvedic entities"""
    name: str
    entity_type: str  # 'herb', 'property', 'therapeutic_action'
    confidence: float
    context: str

class AyurvedicNLP:
    """Main NLP class for processing Ayurvedic texts"""
    
    def __init__(self):
        # Load spaCy model (using en_core_web_sm as base)
        try:
            self.nlp = spacy.load("en_core_web_sm")
        except OSError:
            print("Please install spaCy English model: python -m spacy download en_core_web_sm")
            self.nlp = None
        
        # Ayurvedic knowledge base
        self.herbs = {
            'ashwagandha', 'neem', 'tulsi', 'turmeric', 'ginger', 'amla', 'brahmi',
            'guduchi', 'shankhpushpi', 'arjuna', 'punarnava', 'haritaki', 'bibhitaki',
            'amalaki', 'triphala', 'shatavari', 'yastimadhu', 'pippali', 'sunthi',
            'maricha', 'lavanga', 'ela', 'cardamom', 'cinnamon', 'clove'
        }
        
        self.properties = {
            'rasa': ['madhura', 'amla', 'lavana', 'katu', 'tikta', 'kashaya'],
            'guna': ['guru', 'laghu', 'manda', 'tikshna', 'snigdha', 'ruksha', 'ushna', 'sita'],
            'vipaka': ['madhura', 'amla', 'katu'],
            'virya': ['ushna', 'sita'],
            'prabhava': ['special_action']
        }
        
        self.therapeutic_actions = {
            'anti-inflammatory', 'antioxidant', 'adaptogenic', 'immunomodulatory',
            'hepatoprotective', 'cardioprotective', 'neuroprotective', 'anti-diabetic',
            'anti-microbial', 'anti-cancer', 'anti-aging', 'stress-relief', 'memory-enhancement',
            'digestive', 'detoxifying', 'cooling', 'warming', 'tonic', 'rejuvenating'
        }
        
        # Compile patterns for better matching
        self.herb_pattern = re.compile(r'\b(' + '|'.join(self.herbs) + r')\b', re.IGNORECASE)
        self.property_pattern = re.compile(r'\b(' + '|'.join([p for prop_list in self.properties.values() for p in prop_list]) + r')\b', re.IGNORECASE)
        self.action_pattern = re.compile(r'\b(' + '|'.join(self.therapeutic_actions) + r')\b', re.IGNORECASE)

    def extract_entities(self, text: str) -> List[AyurvedicEntity]:
        """Extract Ayurvedic entities from text"""
        entities = []
        
        if not self.nlp:
            return entities
        
        # Process text with spaCy
        doc = self.nlp(text)
        
        # Extract herbs
        herb_matches = self.herb_pattern.finditer(text)
        for match in herb_matches:
            entities.append(AyurvedicEntity(
                name=match.group(1).title(),
                entity_type='herb',
                confidence=0.9,
                context=self._get_context(text, match.start(), match.end())
            ))
        
        # Extract properties
        property_matches = self.property_pattern.finditer(text)
        for match in property_matches:
            entities.append(AyurvedicEntity(
                name=match.group(1).title(),
                entity_type='property',
                confidence=0.8,
                context=self._get_context(text, match.start(), match.end())
            ))
        
        # Extract therapeutic actions
        action_matches = self.action_pattern.finditer(text)
        for match in action_matches:
            entities.append(AyurvedicEntity(
                name=match.group(1).replace('-', ' ').title(),
                entity_type='therapeutic_action',
                confidence=0.7,
                context=self._get_context(text, match.start(), match.end())
            ))
        
        return entities

    def _get_context(self, text: str, start: int, end: int, window: int = 50) -> str:
        """Get context around a match"""
        context_start = max(0, start - window)
        context_end = min(len(text), end + window)
        return text[context_start:context_end].strip()

    def process_text(self, text: str) -> Dict[str, Any]:
        """Process text and return structured results"""
        entities = self.extract_entities(text)
        
        # Group entities by type
        herbs = [e for e in entities if e.entity_type == 'herb']
        properties = [e for e in entities if e.entity_type == 'property']
        actions = [e for e in entities if e.entity_type == 'therapeutic_action']
        
        # Create structured output
        result = {
            'text': text,
            'herbs': [{'name': h.name, 'confidence': h.confidence, 'context': h.context} for h in herbs],
            'properties': [{'name': p.name, 'confidence': p.confidence, 'context': p.context} for p in properties],
            'therapeutic_actions': [{'name': a.name, 'confidence': a.confidence, 'context': a.context} for a in actions],
            'summary': {
                'total_herbs': len(herbs),
                'total_properties': len(properties),
                'total_actions': len(actions)
            }
        }
        
        return result

    def get_herb_details(self, herb_name: str) -> Dict[str, Any]:
        """Get detailed information about a specific herb"""
        herb_lower = herb_name.lower()
        
        # Check if we have cached data for this herb
        if hasattr(self, 'herb_data_cache') and herb_lower in self.herb_data_cache:
            return self.herb_data_cache[herb_lower]
            
        # Mock herb database - in real implementation, this would come from a database
        herb_database = {
            'ashwagandha': {
                'sanskrit_name': 'अश्वगंधा',
                'scientific_name': 'Withania somnifera',
                'properties': ['balya', 'rasayana', 'vajikarana'],
                'therapeutic_actions': ['adaptogenic', 'anti-inflammatory', 'stress-relief'],
                'compounds': ['withanolides', 'alkaloids', 'saponins'],
                'dosage': '1-3g powder',
                'contraindications': ['pregnancy', 'hyperthyroidism']
            },
            'neem': {
                'sanskrit_name': 'निम्ब',
                'scientific_name': 'Azadirachta indica',
                'properties': ['tikta', 'kashaya', 'ruksha'],
                'therapeutic_actions': ['anti-microbial', 'anti-inflammatory', 'detoxifying'],
                'compounds': ['azadirachtin', 'nimbin', 'nimbidin'],
                'dosage': '1-2g powder',
                'contraindications': ['pregnancy', 'diabetes']
            },
            'tulsi': {
                'sanskrit_name': 'तुलसी',
                'scientific_name': 'Ocimum sanctum',
                'properties': ['katu', 'tikta', 'ushna'],
                'therapeutic_actions': ['immunomodulatory', 'anti-microbial', 'adaptogenic'],
                'compounds': ['eugenol', 'ursolic_acid', 'rosmarinic_acid'],
                'dosage': '1-3g powder',
                'contraindications': ['bleeding_disorders']
            }
        }
        
        # Start with basic info from our database
        herb_info = herb_database.get(herb_lower, {
            'sanskrit_name': 'Unknown',
            'scientific_name': '',
            'properties': [],
            'therapeutic_actions': [],
            'compounds': [],
            'dosage': 'Consult practitioner',
            'contraindications': []
        })
        
        try:
            # Fetch data from PubChem and ChEMBL if APIs are available
            if hasattr(self, 'pubchem_api'):
                pubchem_data = self.pubchem_api.get_ayurvedic_herb_data(herb_name)
                if pubchem_data:
                    herb_info['pubchem_data'] = pubchem_data
                    
            if hasattr(self, 'chembl_api'):
                chembl_data = self.chembl_api.get_ayurvedic_herb_data(herb_name)
                if chembl_data:
                    herb_info['chembl_data'] = chembl_data
                    
            # Cache the enhanced data
            if not hasattr(self, 'herb_data_cache'):
                self.herb_data_cache = {}
            self.herb_data_cache[herb_lower] = herb_info
            
            logger.info(f"Retrieved and enhanced data for herb: {herb_name}")
            
        except Exception as e:
            logger.error(f"Error retrieving external data for herb {herb_name}: {str(e)}")
        
        return herb_info

def main():
    """Example usage of the NLP pipeline"""
    nlp = AyurvedicNLP()
    
    # Sample Ayurvedic text
    sample_text = """
    Ashwagandha (Withania somnifera) is a powerful adaptogenic herb known for its 
    stress-relieving properties. It has madhura rasa and ushna virya, making it 
    excellent for vata and kapha doshas. The herb contains withanolides that provide 
    anti-inflammatory and neuroprotective benefits. It is commonly used for anxiety, 
    insomnia, and as a general tonic for rejuvenation.
    
    Neem (Azadirachta indica) is another important herb with tikta rasa and cooling 
    properties. It has strong anti-microbial and detoxifying actions, making it 
    useful for skin conditions and blood purification.
    """
    
    # Process the text
    result = nlp.process_text(sample_text)
    
    # Print results
    print("NLP Processing Results:")
    print(json.dumps(result, indent=2))
    
    # Get specific herb details
    ashwagandha_details = nlp.get_herb_details("Ashwagandha")
    print("\nAshwagandha Details:")
    print(json.dumps(ashwagandha_details, indent=2))

if __name__ == "__main__":
    main()
