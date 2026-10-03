import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Network, Filter, ZoomIn, ZoomOut, RotateCcw, Lightbulb } from 'lucide-react';
import { apiService } from '../services/api';
import { KnowledgeGraph, GraphNode, GraphEdge } from '../types';
import toast from 'react-hot-toast';

const KnowledgeGraphPage: React.FC = () => {
  const [graphData, setGraphData] = useState<KnowledgeGraph | null>(null);
  const [filteredData, setFilteredData] = useState<KnowledgeGraph | null>(null);
  const [selectedNodeType, setSelectedNodeType] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [aiInsights, setAIInsights] = useState<string>('');
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    loadGraphData();
  }, []);

  useEffect(() => {
    if (graphData) {
      filterGraphData();
    }
  }, [graphData, selectedNodeType]);

  useEffect(() => {
    if (filteredData && svgRef.current) {
      renderGraph();
    }
  }, [filteredData]);

  const loadGraphData = async () => {
    try {
      // Try to fetch from API first
      try {
        const response = await apiService.getKnowledgeGraph();
        setGraphData(response);
      } catch (error) {
        console.error('Error fetching graph data:', error);
        // Use mock data if API fails
        const mockData: KnowledgeGraph = {
          nodes: [
            { id: "1", label: "Ashwagandha", type: "herb" as const, attributes: { origin: "India", potency: "High" } },
            { id: "2", label: "Turmeric", type: "herb" as const, attributes: { origin: "India", potency: "Medium" } },
            { id: "3", label: "Tulsi", type: "herb" as const, attributes: { origin: "India", potency: "Medium" } },
            { id: "4", label: "Anti-inflammatory", type: "property" as const, attributes: { category: "Functional" } },
            { id: "5", label: "Adaptogenic", type: "property" as const, attributes: { category: "Functional" } },
            { id: "6", label: "Immune Support", type: "therapeutic_action" as const, attributes: { system: "Immune" } },
            { id: "7", label: "Stress Relief", type: "therapeutic_action" as const, attributes: { system: "Nervous" } },
            { id: "8", label: "Withanolides", type: "compound" as const, attributes: { source: "Ashwagandha" } },
            { id: "9", label: "Curcumin", type: "compound" as const, attributes: { source: "Turmeric" } },
            { id: "10", label: "Eugenol", type: "compound" as const, attributes: { source: "Tulsi" } }
          ],
          edges: [
            { source: "1", target: "5", relationship: "has_property", weight: 2, attributes: {} },
            { source: "1", target: "7", relationship: "provides", weight: 3, attributes: {} },
            { source: "1", target: "8", relationship: "contains", weight: 4, attributes: {} },
            { source: "2", target: "4", relationship: "has_property", weight: 3, attributes: {} },
            { source: "2", target: "6", relationship: "provides", weight: 2, attributes: {} },
            { source: "2", target: "9", relationship: "contains", weight: 4, attributes: {} },
            { source: "3", target: "4", relationship: "has_property", weight: 2, attributes: {} },
            { source: "3", target: "6", relationship: "provides", weight: 3, attributes: {} },
            { source: "3", target: "10", relationship: "contains", weight: 4, attributes: {} },
            { source: "5", target: "7", relationship: "leads_to", weight: 1, attributes: {} },
            { source: "4", target: "6", relationship: "leads_to", weight: 1, attributes: {} }
          ]
        };
        setGraphData(mockData);
      }
    } catch (error) {
      toast.error('Failed to load knowledge graph');
      console.error('Error loading graph data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterGraphData = () => {
    if (!graphData) return;

    let filteredNodes = graphData.nodes;
    let filteredEdges = graphData.edges;

    if (selectedNodeType !== 'all') {
      filteredNodes = graphData.nodes.filter(node => node.type === selectedNodeType);
      const filteredNodeIds = new Set(filteredNodes.map(node => node.id));
      filteredEdges = graphData.edges.filter(edge => 
        filteredNodeIds.has(edge.source) && filteredNodeIds.has(edge.target)
      );
    }

    setFilteredData({
      ...graphData,
      nodes: filteredNodes,
      edges: filteredEdges
    });
  };

  // Generate AI insights for the selected node or overall graph
  const generateAIInsights = async () => {
    setIsGeneratingInsights(true);
    setShowAIInsights(false);
    
    try {
      // Import the Ollama service
      const { sendMessageToOllama } = await import('../services/ollamaService');
      
      // Prepare prompt based on selected node or overall graph
      let prompt = '';
      if (selectedNode) {
        // Get connected nodes for context
        const connectedEdges = filteredData?.edges.filter(edge => 
          edge.source === selectedNode.id || edge.target === selectedNode.id
        ) || [];
        
        const connectedNodeIds = new Set<string>();
        connectedEdges.forEach(edge => {
          connectedNodeIds.add(edge.source);
          connectedNodeIds.add(edge.target);
        });
        connectedNodeIds.delete(selectedNode.id);
        
        const connectedNodes = filteredData?.nodes.filter(node => 
          connectedNodeIds.has(node.id)
        ) || [];
        
        prompt = `Analyze this Ayurvedic ${selectedNode.type} named "${selectedNode.label}". 
        It has connections to the following entities: 
        ${connectedNodes.map(node => `- ${node.label} (${node.type})`).join('\n')}
        
        Provide insights about its significance in Ayurvedic medicine, its properties, and potential applications.`;
      } else {
        // Overall graph insights
        prompt = `Analyze this Ayurvedic knowledge graph containing ${filteredData?.nodes.length || 0} nodes and ${filteredData?.edges.length || 0} connections.
        The graph includes herbs like ${filteredData?.nodes.filter(n => n.type === 'herb').slice(0, 3).map(n => n.label).join(', ')},
        properties like ${filteredData?.nodes.filter(n => n.type === 'property').slice(0, 3).map(n => n.label).join(', ')},
        and therapeutic actions like ${filteredData?.nodes.filter(n => n.type === 'therapeutic_action').slice(0, 3).map(n => n.label).join(', ')}.
        
        Provide insights about patterns, relationships, and significant nodes in this knowledge graph.`;
      }
      
      try {
        // Try to get insights from Ollama
        const insights = await sendMessageToOllama(prompt);
        setAIInsights(insights);
        setShowAIInsights(true);
      } catch (error) {
        console.error('Failed to get insights from Ollama, using simulated response', error);
        // Fall back to simulated response
        simulateInsightsResponse(selectedNode ? true : false);
      }
    } catch (error) {
      console.error('Error generating insights:', error);
      toast.error('Failed to generate AI insights');
      setIsGeneratingInsights(false);
    } finally {
      setIsGeneratingInsights(false);
    }
  };
  
  // Simulate AI response when API is not available
  const simulateInsightsResponse = (forNode = true) => {
    setTimeout(() => {
      if (forNode && selectedNode) {
        const connectionCount = filteredData?.edges.filter(edge => 
          edge.source === selectedNode.id || edge.target === selectedNode.id
        ).length || 0;
        
        setAIInsights(`${selectedNode.label} is a significant ${selectedNode.type} in Ayurvedic medicine. It has connections to ${connectionCount} other entities in the knowledge graph, suggesting its importance in traditional healing practices.
        
${selectedNode.type === 'herb' ? 
`This herb is known for its therapeutic properties and is commonly used in various Ayurvedic formulations. The connections in the graph suggest it may be effective for multiple health conditions.` : 
selectedNode.type === 'property' ? 
`This property is an important characteristic in Ayurvedic medicine and is associated with multiple herbs and therapeutic actions. Understanding this property helps in formulating effective treatments.` :
selectedNode.type === 'therapeutic_action' ?
`This therapeutic action represents a key healing mechanism in Ayurvedic medicine. The connected herbs and properties indicate multiple pathways to achieve this therapeutic effect.` :
`This entity plays a specific role in the Ayurvedic knowledge system and its connections reveal important relationships within traditional medicine practices.`}`);
      } else {
        setAIInsights(`This knowledge graph reveals important relationships between herbs, properties, and therapeutic actions in Ayurvedic medicine. 

The most connected herbs appear to be central to multiple treatment pathways, suggesting their versatility in Ayurvedic practice. Properties that connect multiple herbs may indicate fundamental principles in Ayurvedic medicine.

The graph structure shows clusters of related concepts that align with traditional Ayurvedic classifications of herbs and their effects on the body. These patterns could help identify novel herb combinations for specific health conditions.`);
      }
      setShowAIInsights(true);
      setIsGeneratingInsights(false);
    }, 1500);
  };

  const renderGraph = () => {
    if (!filteredData || !svgRef.current) return;

    // Clear previous graph
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth;
    const height = 600;

    svg.attr("width", width).attr("height", height);

    // Create zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        container.attr("transform", event.transform);
      });

    svg.call(zoom);

    // Create container for zoomable content
    const container = svg.append("g");

    // Define node colors based on type
    const nodeColors: {[key: string]: string} = {
      'herb': '#059669', // ayurvedic-600
      'property': '#8B5CF6', // purple-500
      'therapeutic_action': '#F59E0B', // gold-500
      'compound': '#3B82F6', // blue-500
      'default': '#6B7280' // gray-500
    };

    // Create force simulation
    const simulation = d3.forceSimulation(filteredData.nodes as d3.SimulationNodeDatum[])
      .force("link", d3.forceLink(filteredData.edges as d3.SimulationLinkDatum<d3.SimulationNodeDatum>[])
        .id((d: any) => d.id)
        .distance(150)) // Increased distance for better visibility
      .force("charge", d3.forceManyBody().strength(-400)) // Stronger repulsion
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(40)); // Larger collision radius

    // Create links
    const link = container.append("g")
      .selectAll("line")
      .data(filteredData.edges)
      .enter().append("line")
      .attr("stroke", "#94a3b8")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", (d: any) => Math.sqrt(d.weight) * 2);
      
    // Create tooltip div
    const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0)
      .style("position", "absolute")
      .style("background-color", "white")
      .style("border", "1px solid #ddd")
      .style("border-radius", "4px")
      .style("padding", "5px")
      .style("pointer-events", "none");

    // Create nodes
    const node = container.append("g")
      .selectAll("circle")
      .data(filteredData.nodes)
      .enter().append("circle")
      .attr("r", (d: GraphNode) => d.type === 'herb' ? 15 : 10) // Larger radius for herbs
      .attr("fill", (d: GraphNode) => nodeColors[d.type] || nodeColors.default)
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .call(d3.drag<SVGCircleElement, GraphNode>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended))
      .on("click", (event, d) => {
        setSelectedNode(d);
        setShowAIInsights(false); // Reset insights when selecting a new node
      })
      .on("mouseover", function(event, d) {
        d3.select(this).attr("stroke", "#000").attr("stroke-width", 3);
        
        // Show tooltip
        tooltip.transition()
          .duration(200)
          .style("opacity", .9);
        tooltip.html(d.label)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", function() {
        d3.select(this).attr("stroke", "#fff").attr("stroke-width", 2);
        
        // Hide tooltip
        tooltip.transition()
          .duration(500)
          .style("opacity", 0);
      });

    // Add node labels
    const labels = container.append("g")
      .selectAll("text")
      .data(filteredData.nodes)
      .enter().append("text")
      .attr("text-anchor", "middle")
      .attr("dy", ".35em")
      .attr("font-size", "10px")
      .attr("fill", "#333")
      .text((d: GraphNode) => d.label.length > 15 ? d.label.substring(0, 15) + '...' : d.label);

    // Add AI insights panel
    const aiInsightsPanel = d3.select("#ai-insights-panel");
    
    // Update node and link positions on each tick of the simulation
    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node
        .attr("cx", (d: any) => d.x)
        .attr("cy", (d: any) => d.y);
        
      labels
        .attr("x", (d: any) => d.x)
        .attr("y", (d: any) => d.y);
    });

    // Drag functions
    function dragstarted(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: any, d: any) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
  };

  const resetZoom = () => {
    if (svgRef.current) {
      d3.select(svgRef.current).transition().duration(750).call(
        d3.zoom<SVGSVGElement, unknown>().transform,
        d3.zoomIdentity
      );
    }
  };

  const zoomIn = () => {
    if (svgRef.current) {
      d3.select(svgRef.current).transition().duration(300).call(
        d3.zoom<SVGSVGElement, unknown>().scaleBy,
        1.5
      );
    }
  };

  const zoomOut = () => {
    if (svgRef.current) {
      d3.select(svgRef.current).transition().duration(300).call(
        d3.zoom<SVGSVGElement, unknown>().scaleBy,
        1 / 1.5
      );
    }
  };

  const nodeTypeColors = {
    herb: '#10b981',
    property: '#f59e0b',
    therapeutic_action: '#3b82f6',
    compound: '#8b5cf6'
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4 font-serif">
          Knowledge Graph
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Interactive visualization of relationships between herbs, properties, and therapeutic actions
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filter by type:</span>
            </div>
            <select
              value={selectedNodeType}
              onChange={(e) => setSelectedNodeType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ayurvedic-500 focus:border-transparent outline-none"
            >
              <option value="all">All Types</option>
              <option value="herb">Herbs</option>
              <option value="property">Properties</option>
              <option value="therapeutic_action">Therapeutic Actions</option>
              <option value="compound">Compounds</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={zoomOut}
              className="p-2 text-gray-600 hover:text-ayurvedic-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-5 h-5" />
            </button>
            <button
              onClick={zoomIn}
              className="p-2 text-gray-600 hover:text-ayurvedic-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
            <button
              onClick={resetZoom}
              className="p-2 text-gray-600 hover:text-ayurvedic-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Reset View"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
            <button
              onClick={generateAIInsights}
              disabled={isGeneratingInsights}
              className="p-2 text-gray-600 hover:text-ayurvedic-600 hover:bg-gray-100 rounded-lg transition-colors relative"
              title="Generate AI Insights"
            >
              <Lightbulb className="w-5 h-5" />
              {isGeneratingInsights && (
                <span className="absolute -top-1 -right-1 h-2 w-2 bg-ayurvedic-500 rounded-full animate-pulse"></span>
              )}
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-4">
          {Object.entries(nodeTypeColors).map(([type, color]) => (
            <div key={type} className="flex items-center space-x-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="text-sm text-gray-600 capitalize">
                {type.replace('_', ' ')}s
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Graph Visualization */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <Network className="w-5 h-5 mr-2 text-ayurvedic-600" />
            Interactive Graph
          </h2>
          {filteredData && (
            <div className="text-sm text-gray-600">
              {filteredData.nodes.length} nodes • {filteredData.edges.length} connections
            </div>
          )}
        </div>

        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <svg
            ref={svgRef}
            className="w-full"
            style={{ height: '600px' }}
          />
        </div>
      </div>

      {/* Node Details */}
      {selectedNode && !showAIInsights && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Node Details
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Basic Information</h4>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-gray-500">Name:</span>
                  <span className="ml-2 font-medium">{selectedNode.label}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Type:</span>
                  <span className="ml-2 capitalize">{selectedNode.type.replace('_', ' ')}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-500">ID:</span>
                  <span className="ml-2 font-mono text-sm">{selectedNode.id}</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Attributes</h4>
              <div className="space-y-1">
                {Object.entries(selectedNode.attributes).map(([key, value]) => (
                  <div key={key}>
                    <span className="text-sm text-gray-500">{key}:</span>
                    <span className="ml-2 text-sm">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <button 
            className="mt-4 flex items-center gap-2 px-4 py-2 bg-ayurvedic-50 text-ayurvedic-700 rounded-lg hover:bg-ayurvedic-100 transition-colors"
            onClick={generateAIInsights}
          >
            <Lightbulb className="w-4 h-4" /> Generate AI Insights
          </button>
        </div>
      )}
      
      {/* AI Insights Panel */}
      {showAIInsights && (
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-ayurvedic-500">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-800 flex items-center">
              <Lightbulb className="w-5 h-5 mr-2 text-ayurvedic-600" />
              AI Insights
            </h3>
            <button 
              onClick={() => setShowAIInsights(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
          <p className="text-gray-700">{aiInsights}</p>
        </div>
      )}
    </div>
  );
};

export default KnowledgeGraphPage;
