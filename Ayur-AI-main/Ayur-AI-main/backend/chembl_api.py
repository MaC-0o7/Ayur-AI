"""
ChEMBL API Integration Module for Ayurvedic AI Knowledge System
Provides functions to fetch bioactivity data from ChEMBL
"""

import requests
import json
import time
from typing import Dict, List, Any, Optional
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ChEMBLAPI:
    """Class for interacting with the ChEMBL API"""
    
    BASE_URL = "https://www.ebi.ac.uk/chembl/api/data"
    
    def __init__(self, rate_limit_delay: float = 0.3):
        """Initialize ChEMBL API client
        
        Args:
            rate_limit_delay: Delay between API calls to respect rate limits (seconds)
        """
        self.rate_limit_delay = rate_limit_delay
    
    def _make_request(self, endpoint: str, params: Optional[Dict] = None) -> Dict:
        """Make a request to the ChEMBL API with rate limiting
        
        Args:
            endpoint: API endpoint to call
            params: Query parameters
            
        Returns:
            JSON response as dictionary
        """
        url = f"{self.BASE_URL}/{endpoint}"
        
        try:
            response = requests.get(url, params=params)
            time.sleep(self.rate_limit_delay)  # Respect rate limits
            
            if response.status_code == 200:
                return response.json()
            else:
                logger.error(f"ChEMBL API error: {response.status_code} - {response.text}")
                return {"error": f"API error: {response.status_code}", "message": response.text}
                
        except Exception as e:
            logger.error(f"Error making ChEMBL API request: {str(e)}")
            return {"error": "Request failed", "message": str(e)}
    
    def search_molecule(self, query: str) -> Dict:
        """Search for molecules by name or synonym
        
        Args:
            query: Molecule name or synonym to search for
            
        Returns:
            Molecule search results
        """
        endpoint = "molecule"
        params = {
            "molecule_structures__canonical_smiles__flexmatch": query,
            "format": "json"
        }
        return self._make_request(endpoint, params)
    
    def search_molecule_by_name(self, name: str) -> Dict:
        """Search for molecules by name
        
        Args:
            name: Molecule name to search for
            
        Returns:
            Molecule search results
        """
        endpoint = "molecule"
        params = {
            "pref_name__icontains": name,
            "format": "json"
        }
        return self._make_request(endpoint, params)
    
    def get_molecule_by_chembl_id(self, chembl_id: str) -> Dict:
        """Get molecule information by ChEMBL ID
        
        Args:
            chembl_id: ChEMBL molecule ID
            
        Returns:
            Molecule information
        """
        endpoint = f"molecule/{chembl_id}"
        return self._make_request(endpoint)
    
    def get_molecule_targets(self, chembl_id: str) -> Dict:
        """Get targets for a molecule
        
        Args:
            chembl_id: ChEMBL molecule ID
            
        Returns:
            Molecule targets
        """
        endpoint = "mechanism"
        params = {
            "molecule_chembl_id": chembl_id,
            "format": "json"
        }
        return self._make_request(endpoint, params)
    
    def get_molecule_activities(self, chembl_id: str) -> Dict:
        """Get bioactivity data for a molecule
        
        Args:
            chembl_id: ChEMBL molecule ID
            
        Returns:
            Molecule bioactivity data
        """
        endpoint = "activity"
        params = {
            "molecule_chembl_id": chembl_id,
            "format": "json"
        }
        return self._make_request(endpoint, params)
    
    def get_ayurvedic_herb_data(self, herb_name: str) -> Dict[str, Any]:
        """Get comprehensive data for an Ayurvedic herb
        
        Args:
            herb_name: Name of the Ayurvedic herb
            
        Returns:
            Dictionary with herb data from ChEMBL
        """
        try:
            # Search for the molecule by name
            search_result = self.search_molecule_by_name(herb_name)
            
            if "molecules" not in search_result or not search_result["molecules"]:
                logger.info(f"No ChEMBL data found for herb: {herb_name}")
                return {"name": herb_name, "chembl_data": {}}
            
            # Get the first molecule's ChEMBL ID
            molecule = search_result["molecules"][0]
            chembl_id = molecule["molecule_chembl_id"]
            
            # Get targets
            targets_data = self.get_molecule_targets(chembl_id)
            
            # Get bioactivity data (limit to 10 records)
            activities_data = self.get_molecule_activities(chembl_id)
            
            # Extract relevant activities (limit to 10)
            activities = []
            if "activities" in activities_data and activities_data["activities"]:
                for activity in activities_data["activities"][:10]:
                    activities.append({
                        "target_name": activity.get("target_pref_name", ""),
                        "standard_type": activity.get("standard_type", ""),
                        "standard_value": activity.get("standard_value", ""),
                        "standard_units": activity.get("standard_units", ""),
                        "assay_description": activity.get("assay_description", "")
                    })
            
            # Compile the data
            chembl_data = {
                "chembl_id": chembl_id,
                "pref_name": molecule.get("pref_name", ""),
                "molecule_type": molecule.get("molecule_type", ""),
                "max_phase": molecule.get("max_phase", 0),
                "molecular_weight": molecule.get("molecular_weight", ""),
                "targets": targets_data.get("mechanisms", []),
                "activities": activities
            }
            
            return {
                "name": herb_name,
                "chembl_data": chembl_data
            }
            
        except Exception as e:
            logger.error(f"Error getting ChEMBL data for {herb_name}: {str(e)}")
            return {"name": herb_name, "chembl_data": {}, "error": str(e)}

# Example usage
if __name__ == "__main__":
    chembl = ChEMBLAPI()
    result = chembl.get_ayurvedic_herb_data("Curcumin")
    print(json.dumps(result, indent=2))