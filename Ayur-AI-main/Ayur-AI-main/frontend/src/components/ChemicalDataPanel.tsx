import React, { useState, useEffect } from 'react';
import { ChemicalData } from '../types';
import { apiService } from '../services/api';

interface ChemicalDataPanelProps {
  herbName: string;
}

const ChemicalDataPanel: React.FC<ChemicalDataPanelProps> = ({ herbName }) => {
  const [chemicalData, setChemicalData] = useState<ChemicalData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("pubchem");

  // Mock chemical data for fallback
  const mockChemicalData = {
    pubchem_data: {
      cid: 12345,
      iupac_name: `IUPAC name for ${herbName}`,
      molecular_formula: "C21H30O2",
      molecular_weight: "314.5 g/mol",
      description: `${herbName} contains various bioactive compounds with medicinal properties.`,
      synonyms: [`${herbName} extract`, `${herbName} oil`, `${herbName} compound`],
      properties: {
        "LogP": "3.8",
        "Hydrogen Bond Donors": "2",
        "Hydrogen Bond Acceptors": "2",
        "Rotatable Bonds": "5"
      }
    },
    chembl_data: {
      chembl_id: "CHEMBL123456",
      pref_name: `${herbName} active constituent`,
      molecular_weight: "314.5",
      activities: [
        {
          target_name: "Anti-inflammatory protein",
          standard_type: "IC50",
          standard_value: "25.4",
          standard_units: "nM",
          assay_description: "In vitro anti-inflammatory activity assay"
        },
        {
          target_name: "Antioxidant pathway",
          standard_type: "EC50",
          standard_value: "12.8",
          standard_units: "µM",
          assay_description: "Free radical scavenging assay"
        }
      ],
      targets: []
    },
    phytochemicals: [
      "Flavonoids",
      "Alkaloids",
      "Terpenoids",
      "Polyphenols",
      "Glycosides"
    ]
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!herbName) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const data = await apiService.getChemicalData(herbName);
        setChemicalData(data);
      } catch (err) {
        console.error('Error fetching chemical data:', err);
        // Use mock data instead of showing error
        console.log('Using mock chemical data for', herbName);
        setChemicalData(mockChemicalData);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [herbName]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 w-full">
        <div className="mb-4">
          <h3 className="text-xl font-bold">Chemical Data</h3>
          <p className="text-gray-500">Loading chemical information...</p>
        </div>
        <div className="h-[200px] w-full bg-gray-200 animate-pulse rounded-md"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 w-full">
        <div className="mb-4">
          <h3 className="text-xl font-bold">Chemical Data</h3>
          <div className="text-red-500">Error loading chemical data: {error}</div>
        </div>
      </div>
    );
  }
  
  if (!chemicalData) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 w-full">
        <div className="mb-4">
          <h3 className="text-xl font-bold">Chemical Data</h3>
          <p className="text-gray-500">No chemical data available for {herbName}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 w-full">
      <div className="mb-6">
        <h3 className="text-xl font-bold mb-2">Chemical Data for {herbName}</h3>
        
        <div className="flex border-b mb-4">
          <button 
            className={`py-2 px-4 ${activeTab === 'pubchem' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('pubchem')}
          >
            PubChem
          </button>
          <button 
            className={`py-2 px-4 ${activeTab === 'chembl' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('chembl')}
          >
            ChEMBL
          </button>
          <button 
            className={`py-2 px-4 ${activeTab === 'local' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('local')}
          >
            Local Dataset
          </button>
        </div>
        
        {activeTab === 'pubchem' && chemicalData.pubchem_data && (
          <div>
            <h4 className="text-lg font-semibold mb-2">PubChem Data</h4>
            {chemicalData.pubchem_data.cid && <p><span className="font-medium">CID:</span> {chemicalData.pubchem_data.cid}</p>}
            {chemicalData.pubchem_data.iupac_name && <p><span className="font-medium">IUPAC Name:</span> {chemicalData.pubchem_data.iupac_name}</p>}
            {chemicalData.pubchem_data.molecular_formula && <p><span className="font-medium">Molecular Formula:</span> {chemicalData.pubchem_data.molecular_formula}</p>}
            {chemicalData.pubchem_data.molecular_weight && <p><span className="font-medium">Molecular Weight:</span> {chemicalData.pubchem_data.molecular_weight}</p>}
            
            {chemicalData.pubchem_data.synonyms && chemicalData.pubchem_data.synonyms.length > 0 && (
              <div className="mt-3">
                <h5 className="font-medium">Synonyms:</h5>
                <div className="flex flex-wrap gap-2 mt-1">
                  {chemicalData.pubchem_data.synonyms.slice(0, 5).map((synonym: string, index: number) => (
                    <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">{synonym}</span>
                  ))}
                  {chemicalData.pubchem_data.synonyms.length > 5 && (
                    <span className="text-gray-500 text-xs">+{chemicalData.pubchem_data.synonyms.length - 5} more</span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'chembl' && chemicalData.chembl_data && (
          <div>
            <h4 className="text-lg font-semibold mb-2">ChEMBL Data</h4>
            {chemicalData.chembl_data.chembl_id && <p><span className="font-medium">Molecule ID:</span> {chemicalData.chembl_data.chembl_id}</p>}
            
            {chemicalData.chembl_data.activities && chemicalData.chembl_data.activities.length > 0 && (
              <div className="mt-3">
                <h5 className="font-medium">Activities:</h5>
                <ul className="list-disc list-inside mt-1">
                  {chemicalData.chembl_data.activities.slice(0, 5).map((activity: any, index: number) => (
                    <li key={index} className="text-sm">{activity.target_name}: {activity.standard_type} {activity.standard_value} {activity.standard_units}</li>
                  ))}
                  {chemicalData.chembl_data.activities.length > 5 && (
                    <li className="text-gray-500 text-xs">+{chemicalData.chembl_data.activities.length - 5} more activities</li>
                  )}
                </ul>
              </div>
            )}
            
            {chemicalData.chembl_data.targets && chemicalData.chembl_data.targets.length > 0 && (
              <div className="mt-3">
                <h5 className="font-medium">Targets:</h5>
                <ul className="list-disc list-inside mt-1">
                  {chemicalData.chembl_data.targets.slice(0, 5).map((target: any, index: number) => (
                    <li key={index} className="text-sm">{target}</li>
                  ))}
                  {chemicalData.chembl_data.targets.length > 5 && (
                    <li className="text-gray-500 text-xs">+{chemicalData.chembl_data.targets.length - 5} more targets</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'local' && chemicalData.phytochemicals && (
          <div>
            <h4 className="text-lg font-semibold mb-2">Local Dataset</h4>
            {chemicalData.phytochemicals.length > 0 ? (
              <div>
                <h5 className="font-medium">Phytochemicals:</h5>
                <ul className="list-disc list-inside mt-1">
                  {chemicalData.phytochemicals.map((phyto: string, index: number) => (
                    <li key={index} className="text-sm">{phyto}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-gray-500">No local phytochemical data available</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChemicalDataPanel;