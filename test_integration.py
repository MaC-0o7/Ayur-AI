"""
Test script for PubChem and ChEMBL integration
"""

import json
from pubchem_api import PubChemAPI
from chembl_api import ChEMBLAPI
from dataset_loader import DatasetLoader
from nlp_pipeline import AyurvedicNLP

def test_pubchem_integration():
    """Test PubChem API integration"""
    print("\n=== Testing PubChem API Integration ===")
    
    pubchem = PubChemAPI()
    
    # Test with a common Ayurvedic herb
    herb_name = "Turmeric"
    print(f"Fetching PubChem data for: {herb_name}")
    
    result = pubchem.get_ayurvedic_herb_data(herb_name)
    
    if result and "pubchem_data" in result and result["pubchem_data"]:
        print("✅ PubChem integration successful!")
        print(f"Found data for {herb_name}:")
        if "cid" in result["pubchem_data"]:
            print(f"  - CID: {result['pubchem_data']['cid']}")
        if "iupac_name" in result["pubchem_data"]:
            print(f"  - IUPAC Name: {result['pubchem_data']['iupac_name']}")
        if "synonyms" in result["pubchem_data"] and result["pubchem_data"]["synonyms"]:
            print(f"  - Synonyms: {', '.join(result['pubchem_data']['synonyms'][:3])}...")
    else:
        print("❌ PubChem integration failed or no data found")
        print(f"Result: {result}")

def test_chembl_integration():
    """Test ChEMBL API integration"""
    print("\n=== Testing ChEMBL API Integration ===")
    
    chembl = ChEMBLAPI()
    
    # Test with a common Ayurvedic herb
    herb_name = "Curcumin"
    print(f"Fetching ChEMBL data for: {herb_name}")
    
    result = chembl.get_ayurvedic_herb_data(herb_name)
    
    if result and "chembl_data" in result and result["chembl_data"]:
        print("✅ ChEMBL integration successful!")
        print(f"Found data for {herb_name}:")
        if "chembl_id" in result["chembl_data"]:
            print(f"  - ChEMBL ID: {result['chembl_data']['chembl_id']}")
        if "pref_name" in result["chembl_data"]:
            print(f"  - Preferred Name: {result['chembl_data']['pref_name']}")
        if "molecular_weight" in result["chembl_data"]:
            print(f"  - Molecular Weight: {result['chembl_data']['molecular_weight']}")
    else:
        print("❌ ChEMBL integration failed or no data found")
        print(f"Result: {result}")

def test_dataset_loader():
    """Test dataset loader"""
    print("\n=== Testing Dataset Loader ===")
    
    loader = DatasetLoader()
    data = loader.load_all_datasets()
    
    if data:
        print("✅ Dataset loader successful!")
        print(f"Loaded data for {len(data['herbs_data'])} herbs")
        print(f"Loaded {len(data['ayurvedic_texts'])} text datasets")
        
        # Show a sample of herbs if available
        if data['herbs_data']:
            print("\nSample herbs:")
            for i, herb in enumerate(list(data['herbs_data'].keys())[:3]):
                print(f"  {i+1}. {herb}")
    else:
        print("❌ Dataset loader failed or no data found")

def test_nlp_pipeline():
    """Test NLP pipeline with integrated data sources"""
    print("\n=== Testing NLP Pipeline with Integrated Data Sources ===")
    
    nlp = AyurvedicNLP()
    
    # Test with a common Ayurvedic herb
    herb_name = "Turmeric"
    print(f"Getting detailed information for: {herb_name}")
    
    result = nlp.get_herb_details(herb_name)
    
    if result:
        print("✅ NLP pipeline with integrated data sources successful!")
        print(f"Found details for {herb_name}:")
        for key, value in result.items():
            if isinstance(value, (str, int, float, bool)):
                print(f"  - {key}: {value}")
            elif isinstance(value, list) and value:
                print(f"  - {key}: {', '.join(str(v) for v in value[:3])}...")
            elif isinstance(value, dict) and value:
                print(f"  - {key}: {len(value)} items")
    else:
        print("❌ NLP pipeline integration failed or no data found")
        print(f"Result: {result}")

def main():
    """Run all tests"""
    print("Starting integration tests...\n")
    
    # Test PubChem API
    test_pubchem_integration()
    
    # Test ChEMBL API
    test_chembl_integration()
    
    # Test dataset loader
    test_dataset_loader()
    
    # Test NLP pipeline with integrated data sources
    test_nlp_pipeline()
    
    print("\nIntegration tests completed!")

if __name__ == "__main__":
    main()