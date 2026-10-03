"""
Knowledge Graph Builder for Ayurvedic entities using NetworkX
Creates relationships between herbs, properties, and therapeutic actions
"""

import networkx as nx
import json
import pandas as pd
from typing import Dict, List, Any, Tuple
from dataclasses import dataclass
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

@dataclass
class GraphNode:
    """Represents a node in the knowledge graph"""
    id: str
    label: str
    node_type: str  # 'herb', 'property', 'therapeutic_action', 'compound'
    attributes: Dict[str, Any]

@dataclass
class GraphEdge:
    """Represents an edge in the knowledge graph"""
    source: str
    target: str
    relationship: str
    weight: float
    attributes: Dict[str, Any]

class AyurvedicKnowledgeGraph:
    """Main class for building and managing the Ayurvedic knowledge graph"""
    
    def __init__(self):
        self.graph = nx.Graph()
        self.nodes = {}
        self.edges = []
        
        # Initialize with some sample data
        self._initialize_sample_data()
    
    def _initialize_sample_data(self):
        """Initialize the graph with sample Ayurvedic data"""
        
        # Sample herbs with their properties and actions
        herb_data = {
            'Ashwagandha': {
                'sanskrit_name': 'अश्वगंधा',
                'properties': ['balya', 'rasayana', 'vajikarana'],
                'therapeutic_actions': ['adaptogenic', 'anti-inflammatory', 'stress-relief', 'neuroprotective'],
                'compounds': ['withanolides', 'alkaloids', 'saponins'],
                'dosha_effects': {'vata': 'pacifying', 'kapha': 'pacifying', 'pitta': 'neutral'}
            },
            'Neem': {
                'sanskrit_name': 'निम्ब',
                'properties': ['tikta', 'kashaya', 'ruksha'],
                'therapeutic_actions': ['anti-microbial', 'anti-inflammatory', 'detoxifying', 'blood_purifying'],
                'compounds': ['azadirachtin', 'nimbin', 'nimbidin'],
                'dosha_effects': {'vata': 'aggravating', 'kapha': 'pacifying', 'pitta': 'pacifying'}
            },
            'Tulsi': {
                'sanskrit_name': 'तुलसी',
                'properties': ['katu', 'tikta', 'ushna'],
                'therapeutic_actions': ['immunomodulatory', 'anti-microbial', 'adaptogenic', 'respiratory_health'],
                'compounds': ['eugenol', 'ursolic_acid', 'rosmarinic_acid'],
                'dosha_effects': {'vata': 'pacifying', 'kapha': 'pacifying', 'pitta': 'aggravating'}
            },
            'Turmeric': {
                'sanskrit_name': 'हरिद्रा',
                'properties': ['katu', 'tikta', 'ushna'],
                'therapeutic_actions': ['anti-inflammatory', 'antioxidant', 'hepatoprotective', 'anti-cancer'],
                'compounds': ['curcumin', 'demethoxycurcumin', 'bisdemethoxycurcumin'],
                'dosha_effects': {'vata': 'pacifying', 'kapha': 'pacifying', 'pitta': 'neutral'}
            },
            'Ginger': {
                'sanskrit_name': 'शुंठी',
                'properties': ['katu', 'ushna'],
                'therapeutic_actions': ['digestive', 'anti-inflammatory', 'warming', 'respiratory_health'],
                'compounds': ['gingerol', 'shogaol', 'paradol'],
                'dosha_effects': {'vata': 'pacifying', 'kapha': 'pacifying', 'pitta': 'aggravating'}
            }
        }
        
        # Add herbs as nodes
        for herb_name, data in herb_data.items():
            self.add_node(herb_name, 'herb', data)
            
            # Add properties as nodes and create relationships
            for prop in data['properties']:
                self.add_node(prop, 'property', {'sanskrit_name': prop})
                self.add_edge(herb_name, prop, 'has_property', 1.0)
            
            # Add therapeutic actions as nodes and create relationships
            for action in data['therapeutic_actions']:
                self.add_node(action, 'therapeutic_action', {'category': 'therapeutic'})
                self.add_edge(herb_name, action, 'has_therapeutic_action', 1.0)
            
            # Add compounds as nodes and create relationships
            for compound in data['compounds']:
                self.add_node(compound, 'compound', {'chemical_type': 'active_constituent'})
                self.add_edge(herb_name, compound, 'contains_compound', 0.8)
    
    def add_node(self, node_id: str, node_type: str, attributes: Dict[str, Any] = None):
        """Add a node to the graph"""
        if attributes is None:
            attributes = {}
        
        node = GraphNode(
            id=node_id,
            label=node_id,
            node_type=node_type,
            attributes=attributes
        )
        
        self.nodes[node_id] = node
        self.graph.add_node(node_id, **{
            'label': node_id,
            'type': node_type,
            **attributes
        })
    
    def add_edge(self, source: str, target: str, relationship: str, weight: float = 1.0, attributes: Dict[str, Any] = None):
        """Add an edge to the graph"""
        if attributes is None:
            attributes = {}
        
        edge = GraphEdge(
            source=source,
            target=target,
            relationship=relationship,
            weight=weight,
            attributes=attributes
        )
        
        self.edges.append(edge)
        self.graph.add_edge(source, target, 
                          relationship=relationship, 
                          weight=weight, 
                          **attributes)
    
    def find_similar_herbs(self, herb_name: str, top_k: int = 5) -> List[Tuple[str, float]]:
        """Find herbs similar to the given herb based on shared properties and actions"""
        if herb_name not in self.graph:
            return []
        
        herb_neighbors = set(self.graph.neighbors(herb_name))
        similarities = []
        
        for node in self.graph.nodes():
            if (node != herb_name and 
                self.graph.nodes[node].get('type') == 'herb'):
                
                node_neighbors = set(self.graph.neighbors(node))
                intersection = len(herb_neighbors.intersection(node_neighbors))
                union = len(herb_neighbors.union(node_neighbors))
                
                if union > 0:
                    jaccard_similarity = intersection / union
                    similarities.append((node, jaccard_similarity))
        
        return sorted(similarities, key=lambda x: x[1], reverse=True)[:top_k]
    
    def find_herb_combinations(self, target_actions: List[str]) -> List[Dict[str, Any]]:
        """Find herb combinations that together provide the target therapeutic actions"""
        combinations = []
        
        # Get all herbs
        herbs = [node for node in self.graph.nodes() 
                if self.graph.nodes[node].get('type') == 'herb']
        
        # For each herb, check which target actions it covers
        herb_action_coverage = {}
        for herb in herbs:
            actions = [neighbor for neighbor in self.graph.neighbors(herb)
                      if self.graph.nodes[neighbor].get('type') == 'therapeutic_action']
            covered_actions = [action for action in actions if action in target_actions]
            herb_action_coverage[herb] = covered_actions
        
        # Find combinations that cover all target actions
        for i, herb1 in enumerate(herbs):
            for herb2 in herbs[i+1:]:
                combined_actions = set(herb_action_coverage[herb1] + herb_action_coverage[herb2])
                if len(combined_actions.intersection(set(target_actions))) >= len(target_actions) * 0.7:
                    combinations.append({
                        'herbs': [herb1, herb2],
                        'covered_actions': list(combined_actions.intersection(set(target_actions))),
                        'coverage_percentage': len(combined_actions.intersection(set(target_actions))) / len(target_actions) * 100
                    })
        
        return sorted(combinations, key=lambda x: x['coverage_percentage'], reverse=True)
    
    def get_herb_pathway(self, herb_name: str) -> Dict[str, Any]:
        """Get the complete pathway for a herb (properties -> actions -> compounds)"""
        if herb_name not in self.graph:
            return {}
        
        pathway = {
            'herb': herb_name,
            'properties': [],
            'therapeutic_actions': [],
            'compounds': []
        }
        
        for neighbor in self.graph.neighbors(herb_name):
            node_type = self.graph.nodes[neighbor].get('type')
            if node_type == 'property':
                pathway['properties'].append(neighbor)
            elif node_type == 'therapeutic_action':
                pathway['therapeutic_actions'].append(neighbor)
            elif node_type == 'compound':
                pathway['compounds'].append(neighbor)
        
        return pathway
    
    def export_to_json(self) -> Dict[str, Any]:
        """Export the graph to JSON format for frontend consumption"""
        nodes = []
        for node_id, node in self.nodes.items():
            nodes.append({
                'id': node_id,
                'label': node.label,
                'type': node.node_type,
                'attributes': node.attributes
            })
        
        edges = []
        for edge in self.edges:
            edges.append({
                'source': edge.source,
                'target': edge.target,
                'relationship': edge.relationship,
                'weight': edge.weight,
                'attributes': edge.attributes
            })
        
        return {
            'nodes': nodes,
            'edges': edges,
            'statistics': {
                'total_nodes': len(nodes),
                'total_edges': len(edges),
                'node_types': list(set(node['type'] for node in nodes)),
                'relationship_types': list(set(edge['relationship'] for edge in edges))
            }
        }
    
    def generate_hypotheses(self) -> List[Dict[str, Any]]:
        """Generate hypotheses about herb synergies and potential combinations"""
        hypotheses = []
        
        # Find herbs with overlapping therapeutic actions
        herbs = [node for node in self.graph.nodes() 
                if self.graph.nodes[node].get('type') == 'herb']
        
        for i, herb1 in enumerate(herbs):
            for herb2 in herbs[i+1:]:
                herb1_actions = set(neighbor for neighbor in self.graph.neighbors(herb1)
                                  if self.graph.nodes[neighbor].get('type') == 'therapeutic_action')
                herb2_actions = set(neighbor for neighbor in self.graph.neighbors(herb2)
                                  if self.graph.nodes[neighbor].get('type') == 'therapeutic_action')
                
                overlap = herb1_actions.intersection(herb2_actions)
                if len(overlap) > 0:
                    hypotheses.append({
                        'type': 'synergy',
                        'herbs': [herb1, herb2],
                        'overlapping_actions': list(overlap),
                        'description': f"{herb1} and {herb2} share {len(overlap)} therapeutic actions: {', '.join(overlap)}",
                        'confidence': min(len(overlap) / 3, 1.0)
                    })
        
        # Find complementary herb pairs
        for i, herb1 in enumerate(herbs):
            for herb2 in herbs[i+1:]:
                herb1_actions = set(neighbor for neighbor in self.graph.neighbors(herb1)
                                  if self.graph.nodes[neighbor].get('type') == 'therapeutic_action')
                herb2_actions = set(neighbor for neighbor in self.graph.neighbors(herb2)
                                  if self.graph.nodes[neighbor].get('type') == 'therapeutic_action')
                
                # Check if herbs have complementary actions (different but related)
                if len(herb1_actions.intersection(herb2_actions)) == 0:
                    # Check for complementary patterns
                    if any('anti' in action1 and 'pro' in action2 or 
                          'anti' in action2 and 'pro' in action1
                          for action1 in herb1_actions for action2 in herb2_actions):
                        hypotheses.append({
                            'type': 'complementary',
                            'herbs': [herb1, herb2],
                            'description': f"{herb1} and {herb2} may have complementary therapeutic effects",
                            'confidence': 0.6
                        })
        
        return sorted(hypotheses, key=lambda x: x['confidence'], reverse=True)

def main():
    """Example usage of the knowledge graph"""
    kg = AyurvedicKnowledgeGraph()
    
    # Export graph data
    graph_data = kg.export_to_json()
    print("Knowledge Graph Statistics:")
    print(f"Total nodes: {graph_data['statistics']['total_nodes']}")
    print(f"Total edges: {graph_data['statistics']['total_edges']}")
    print(f"Node types: {graph_data['statistics']['node_types']}")
    print(f"Relationship types: {graph_data['statistics']['relationship_types']}")
    
    # Find similar herbs
    similar_herbs = kg.find_similar_herbs('Ashwagandha', top_k=3)
    print(f"\nHerbs similar to Ashwagandha: {similar_herbs}")
    
    # Find herb combinations for specific actions
    combinations = kg.find_herb_combinations(['anti-inflammatory', 'adaptogenic'])
    print(f"\nHerb combinations for anti-inflammatory and adaptogenic actions:")
    for combo in combinations[:3]:
        print(f"  {combo['herbs']}: {combo['coverage_percentage']:.1f}% coverage")
    
    # Generate hypotheses
    hypotheses = kg.generate_hypotheses()
    print(f"\nGenerated hypotheses:")
    for hyp in hypotheses[:3]:
        print(f"  {hyp['type']}: {hyp['description']} (confidence: {hyp['confidence']:.2f})")

if __name__ == "__main__":
    main()
