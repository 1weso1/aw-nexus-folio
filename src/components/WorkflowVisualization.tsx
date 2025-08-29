import { useEffect, useRef, useState, useMemo } from "react";
import { 
  ReactFlow, 
  Node, 
  Edge, 
  Background, 
  Controls, 
  MiniMap,
  useNodesState,
  useEdgesState,
  Panel
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import dagre from "dagre";
import type { N8nWorkflow } from "@/types/workflow";
import { Loader2, AlertTriangle } from "lucide-react";

interface WorkflowVisualizationProps {
  workflow: N8nWorkflow;
}

// Node types for different n8n node types
const NODE_TYPES = {
  trigger: { color: 'hsl(142, 76%, 36%)', borderColor: 'hsl(142, 76%, 46%)' },
  action: { color: 'hsl(217, 91%, 60%)', borderColor: 'hsl(217, 91%, 70%)' },
  logic: { color: 'hsl(45, 93%, 47%)', borderColor: 'hsl(45, 93%, 57%)' },
  data: { color: 'hsl(262, 83%, 58%)', borderColor: 'hsl(262, 83%, 68%)' },
  default: { color: 'hsl(var(--surface-card))', borderColor: 'hsl(var(--neon-primary))' }
};

// Categorize n8n node types
function getNodeCategory(nodeType: string): keyof typeof NODE_TYPES {
  const type = nodeType.toLowerCase();
  
  // Trigger nodes
  if (type.includes('trigger') || type.includes('webhook') || type.includes('cron') || type.includes('start')) {
    return 'trigger';
  }
  
  // Logic nodes
  if (type.includes('if') || type.includes('switch') || type.includes('merge') || 
      type.includes('split') || type.includes('function') || type.includes('code')) {
    return 'logic';
  }
  
  // Data transformation nodes
  if (type.includes('set') || type.includes('json') || type.includes('xml') || 
      type.includes('csv') || type.includes('html') || type.includes('transform')) {
    return 'data';
  }
  
  // Default to action for service integrations
  return 'action';
}

// Layout nodes using dagre
function getLayoutedElements(nodes: Node[], edges: Edge[]) {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ 
    rankdir: 'TB', 
    nodesep: 100,
    edgesep: 50,
    ranksep: 100
  });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 180, height: 80 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - 90, // Center the node
        y: nodeWithPosition.y - 40,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
}

export function WorkflowVisualization({ workflow }: WorkflowVisualizationProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Convert n8n workflow to React Flow format
  const flowElements = useMemo(() => {
    try {
      if (!workflow?.nodes || !Array.isArray(workflow.nodes)) {
        throw new Error('Invalid workflow structure');
      }

      // Create nodes
      const nodes: Node[] = workflow.nodes.map((n8nNode) => {
        const category = getNodeCategory(n8nNode.type);
        const colors = NODE_TYPES[category];
        
        return {
          id: n8nNode.id || n8nNode.name,
          type: 'default',
          position: n8nNode.position ? { x: n8nNode.position[0], y: n8nNode.position[1] } : { x: 0, y: 0 },
          data: { 
            label: n8nNode.name || n8nNode.type,
            nodeType: n8nNode.type
          },
          style: {
            background: colors.color,
            border: `2px solid ${colors.borderColor}`,
            borderRadius: '8px',
            color: 'white',
            fontSize: '12px',
            fontWeight: '600',
            padding: '8px 12px',
            minWidth: '160px',
            textAlign: 'center',
            boxShadow: `0 4px 12px ${colors.borderColor}40`
          }
        };
      });

      // Create edges from connections
      const edges: Edge[] = [];
      if (workflow.connections) {
        Object.entries(workflow.connections).forEach(([sourceNodeName, connections]) => {
          if (connections && typeof connections === 'object') {
            Object.entries(connections).forEach(([outputName, outputs]) => {
              if (Array.isArray(outputs)) {
                outputs.forEach((output) => {
                  if (Array.isArray(output)) {
                    output.forEach((connection) => {
                      if (connection && typeof connection === 'object' && connection.node) {
                        edges.push({
                          id: `${sourceNodeName}-${connection.node}-${outputName}`,
                          source: sourceNodeName,
                          target: connection.node,
                          type: 'smoothstep',
                          style: { stroke: 'hsl(var(--neon-primary))', strokeWidth: 2 },
                          animated: true
                        });
                      }
                    });
                  }
                });
              }
            });
          }
        });
      }

      return getLayoutedElements(nodes, edges);
    } catch (err) {
      console.error('Error converting workflow:', err);
      return { nodes: [], edges: [] };
    }
  }, [workflow]);

  const [nodes, setNodes, onNodesChange] = useNodesState(flowElements.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(flowElements.edges);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (flowElements.nodes.length === 0) {
        setError('Unable to parse workflow structure');
      }
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [flowElements.nodes.length]);

  useEffect(() => {
    setNodes(flowElements.nodes);
    setEdges(flowElements.edges);
  }, [flowElements.nodes, flowElements.edges, setNodes, setEdges]);

  if (loading) {
    return (
      <div className="h-96 bg-surface-card/30 rounded-lg flex items-center justify-center border border-neon-primary/10">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-neon-primary mx-auto mb-2" />
          <p className="text-text-secondary text-sm">Loading workflow visualization...</p>
        </div>
      </div>
    );
  }

  if (error || flowElements.nodes.length === 0) {
    return (
      <div className="h-96 bg-surface-card/30 rounded-lg flex items-center justify-center border border-neon-primary/10">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
          <p className="text-text-secondary text-sm">
            {error || 'Unable to visualize this workflow'}
          </p>
          <p className="text-text-secondary text-xs mt-2">
            The workflow structure may be incompatible with the visualization engine.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-96 bg-surface-card/30 rounded-lg border border-neon-primary/10 overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        attributionPosition="bottom-left"
        style={{ background: 'hsl(var(--surface-card) / 0.5)' }}
        minZoom={0.1}
        maxZoom={2}
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
      >
        <Background 
          color="hsl(var(--neon-primary) / 0.1)" 
          gap={20} 
          size={1} 
        />
        <Controls 
          style={{
            background: 'hsl(var(--surface-card))',
            border: '1px solid hsl(var(--neon-primary) / 0.2)',
            borderRadius: '8px'
          }}
        />
        <MiniMap 
          nodeColor={(node) => {
            const nodeType = typeof node.data?.nodeType === 'string' ? node.data.nodeType : '';
            const category = getNodeCategory(nodeType);
            return NODE_TYPES[category].color;
          }}
          style={{
            background: 'hsl(var(--surface-card))',
            border: '1px solid hsl(var(--neon-primary) / 0.2)',
            borderRadius: '8px'
          }}
          pannable
          zoomable
        />
        <Panel position="top-right" className="bg-surface-card/80 backdrop-blur rounded-lg p-2 border border-neon-primary/20">
          <div className="text-xs text-text-secondary">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded" style={{ background: NODE_TYPES.trigger.color }}></div>
              <span>Triggers</span>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded" style={{ background: NODE_TYPES.action.color }}></div>
              <span>Actions</span>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded" style={{ background: NODE_TYPES.logic.color }}></div>
              <span>Logic</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ background: NODE_TYPES.data.color }}></div>
              <span>Data</span>
            </div>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}