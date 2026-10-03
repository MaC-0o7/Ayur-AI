"""
Dataset Loader for Ayurvedic Knowledge System
Loads and processes local datasets from the Datasets folder
"""

import os
import csv
import json
import pandas as pd
import logging
from typing import Dict, List, Any, Set, Optional

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DatasetLoader:
    """Class for loading and processing local datasets"""
    
    def __init__(self, datasets_dir: Optional[str] = None):
        """Initialize the dataset loader
        
        Args:
            datasets_dir: Path to the datasets directory (optional)
        """
        # Set the datasets directory
        if datasets_dir:
            self.datasets_dir = datasets_dir
        else:
            # Default to the Datasets folder in the project root
            self.datasets_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "Datasets")
        
        # Initialize data containers
        self.herbs_data = {}
        self.phytochemicals = {}
        self.ayurvedic_texts = {}
        
        logger.info(f"Dataset loader initialized with directory: {self.datasets_dir}")
    
    def load_all_datasets(self) -> Dict[str, Any]:
        """Load all available datasets
        
        Returns:
            Dictionary with loaded data
        """
        # Load phytochemicals data
        self.load_phytochemicals()
        
        # Load text datasets for NLP processing
        self.load_text_datasets()
        
        # Compile all data
        return {
            "herbs_data": self.herbs_data,
            "phytochemicals": self.phytochemicals,
            "ayurvedic_texts": self.ayurvedic_texts
        }
    
    def load_phytochemicals(self) -> Dict[str, List[str]]:
        """Load phytochemicals data from CSV file
        
        Returns:
            Dictionary mapping herbs to their phytochemicals
        """
        phytochemicals_path = os.path.join(self.datasets_dir, "prefphytochemicals.csv")
        
        if os.path.exists(phytochemicals_path):
            try:
                # Read CSV file
                df = pd.read_csv(phytochemicals_path)
                
                # Process data
                for _, row in df.iterrows():
                    herb_name = row[0].lower().strip() if len(row) > 0 else ""
                    if herb_name:
                        # Extract phytochemicals if available
                        phytochemicals = []
                        if len(row) > 1:
                            phytochemicals = [chem.strip() for chem in row[1:] if isinstance(chem, str) and chem.strip()]
                        
                        # Add to phytochemicals dictionary
                        self.phytochemicals[herb_name] = phytochemicals
                        
                        # Add to herbs data
                        if herb_name not in self.herbs_data:
                            self.herbs_data[herb_name] = {}
                        
                        self.herbs_data[herb_name]["phytochemicals"] = phytochemicals
                
                logger.info(f"Loaded phytochemicals data for {len(self.phytochemicals)} herbs")
            
            except Exception as e:
                logger.error(f"Error loading phytochemicals data: {str(e)}")
        else:
            logger.warning(f"Phytochemicals file not found at {phytochemicals_path}")
        
        return self.phytochemicals
    
    def load_text_datasets(self) -> Dict[str, str]:
        """Load text datasets for NLP processing
        
        Returns:
            Dictionary mapping text names to their content
        """
        # Get all text files in the datasets directory
        text_files = []
        for root, _, files in os.walk(self.datasets_dir):
            for file in files:
                if file.endswith(('.txt', '.md')):
                    text_files.append(os.path.join(root, file))
        
        # Load text content
        for file_path in text_files:
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Use filename as key
                file_name = os.path.basename(file_path)
                self.ayurvedic_texts[file_name] = content
            
            except Exception as e:
                logger.error(f"Error loading text file {file_path}: {str(e)}")
        
        logger.info(f"Loaded {len(self.ayurvedic_texts)} text datasets")
        
        return self.ayurvedic_texts
    
    def get_herb_data(self, herb_name: str) -> Dict[str, Any]:
        """Get data for a specific herb
        
        Args:
            herb_name: Name of the herb
            
        Returns:
            Dictionary with herb data
        """
        herb_lower = herb_name.lower()
        
        # Return herb data if found, otherwise empty dict
        return self.herbs_data.get(herb_lower, {})
    
    def get_herb_phytochemicals(self, herb_name: str) -> List[str]:
        """Get phytochemicals for a specific herb
        
        Args:
            herb_name: Name of the herb
            
        Returns:
            List of phytochemicals
        """
        herb_lower = herb_name.lower()
        
        # Return phytochemicals if found, otherwise empty list
        return self.phytochemicals.get(herb_lower, [])
    
    def get_all_herbs(self) -> Set[str]:
        """Get all herb names from the datasets
        
        Returns:
            Set of herb names
        """
        return set(self.herbs_data.keys())

# Example usage
if __name__ == "__main__":
    loader = DatasetLoader()
    data = loader.load_all_datasets()
    print(f"Loaded data for {len(data['herbs_data'])} herbs")
    print(f"Loaded {len(data['ayurvedic_texts'])} text datasets")