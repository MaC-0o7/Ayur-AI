"""
PubChem API Integration Module for Ayurvedic AI Knowledge System
Provides functions to fetch chemical compound data from PubChem
"""

import requests
import json
import time
from typing import Dict, List, Any, Optional
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class PubChemAPI:
    """Class for interacting with the PubChem API"""
    
    BASE_URL = "https://pubchem.ncbi.nlm.nih.gov/rest/pug"
    
    def __init__(self, rate_limit_delay: float = 0.2):
        """Initialize PubChem API client
        
        Args:
            rate_limit_delay: Delay between API calls to respect rate limits (seconds)
        """
        self.rate_limit_delay = rate_limit_delay
    
    def _make_request(self, endpoint: str, params: Optional[Dict] = None) -> Dict:
        """Make a request to the PubChem API with rate limiting
        
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
                logger.error(f"PubChem API error: {response.status_code} - {response.text}")
                return {"error": f"API error: {response.status_code}", "message": response.text}
                
        except Exception as e:
            logger.error(f"Error making PubChem API request: {str(e)}")
            return {"error": "Request failed", "message": str(e)}
    
    def search_compound(self, name: str) -> Dict:
        """Search for a compound by name
        
        Args:
            name: Compound name to search for
            
        Returns:
            Compound information
        """
        endpoint = f"compound/name/{name}/JSON"
        return self._make_request(endpoint)
    
    def get_compound_by_cid(self, cid: int) -> Dict:
        """Get compound information by PubChem CID
        
        Args:
            cid: PubChem Compound ID
            
        Returns:
            Compound information
        """
        endpoint = f"compound/cid/{cid}/JSON"
        return self._make_request(endpoint)
    
    def get_compound_properties(self, cid: int, properties: List[str]) -> Dict:
        """Get specific properties for a compound
        
        Args:
            cid: PubChem Compound ID
            properties: List of property names to retrieve
            
        Returns:
            Requested compound properties
        """
        properties_str = ",".join(properties)
        endpoint = f"compound/cid/{cid}/property/{properties_str}/JSON"
        return self._make_request(endpoint)
    
    def get_compound_synonyms(self, cid: int) -> Dict:
        """Get synonyms for a compound
        
        Args:
            cid: PubChem Compound ID
            
        Returns:
            Compound synonyms
        """
        endpoint = f"compound/cid/{cid}/synonyms/JSON"
        return self._make_request(endpoint)
    
    def get_ayurvedic_herb_data(self, herb_name: str) -> Dict[str, Any]:
        """Get comprehensive data for an Ayurvedic herb
        
        Args:
            herb_name: Name of the Ayurvedic herb
            
        Returns:
            Dictionary with herb data from PubChem
        """
        try:
            # Search for the compound
            search_result = self.search_compound(herb_name)
            
            if "PC_Compounds" not in search_result or not search_result["PC_Compounds"]:
                logger.info(f"No PubChem data found for herb: {herb_name}")
                return {"name": herb_name, "pubchem_data": {}}
            
            # Get the first compound's CID
            cid = search_result["PC_Compounds"][0]["id"]["id"]["cid"]
            
            # Get basic properties
            properties = ["MolecularFormula", "MolecularWeight", "CanonicalSMILES", 
                         "IUPACName", "XLogP", "HBondDonorCount", "HBondAcceptorCount"]
            
            prop_data = self.get_compound_properties(cid, properties)
            
            # Get synonyms
            synonyms_data = self.get_compound_synonyms(cid)
            
            # Compile the data
            pubchem_data = {
                "cid": cid,
                "properties": prop_data.get("PropertyTable", {}).get("Properties", [{}])[0] if "PropertyTable" in prop_data else {},
                "synonyms": synonyms_data.get("InformationList", {}).get("Information", [{}])[0].get("Synonym", []) if "InformationList" in synonyms_data else []
            }
            
            return {
                "name": herb_name,
                "pubchem_data": pubchem_data
            }
            
        except Exception as e:
            logger.error(f"Error getting PubChem data for {herb_name}: {str(e)}")
            return {"name": herb_name, "pubchem_data": {}, "error": str(e)}

# Example usage
if __name__ == "__main__":
    pubchem = PubChemAPI()
    result = pubchem.get_ayurvedic_herb_data("Turmeric")
    print(json.dumps(result, indent=2))