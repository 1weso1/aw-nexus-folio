import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  Background,
  MiniMap,
  Controls,
  Panel,
  useReactFlow,
  ReactFlowProvider,
} from '@xyflow/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ZoomIn, ZoomOut, Maximize2, RotateCcw } from 'lucide-react';
import dagre from 'dagre';
import '@xyflow/react/dist/style.css';

interface N8nNode {
  id?: string;
  name: string;
  type: string;
  position?: [number, number];
  parameters?: any;
  credentials?: any;
}

interface N8nWorkflow {
  nodes: N8nNode[];
  connections: Record<string, any>;
  name?: string;
}

interface N8nPreviewProps {
  workflow: N8nWorkflow;
  className?: string;
  height?: string;
}

const N8nNodeComponent: React.FC<{ data: any }> = ({ data }) => {
  const { name, type, hasCredentials } = data;
  
  // Clean up the type name for display
  const displayType = type.replace('n8n-nodes-base.', '').replace(/([A-Z])/g, ' $1').trim();
  
  return (
    <div className="bg-card border border-brand-primary/20 rounded-lg shadow-sm p-3 min-w-[160px] max-w-[200px]">
      <div className="font-medium text-text-high text-sm mb-1 truncate" title={name}>
        {name}
      </div>
      <div className="text-xs text-text-mid mb-2 truncate" title={displayType}>
        {displayType}
      </div>
      {hasCredentials && (
        <Badge variant="secondary" className="text-xs">
          Creds
        </Badge>
      )}
    </div>
  );
};

const nodeTypes = {
  n8nNode: N8nNodeComponent,
};

const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: 'LR', ranksep: 150, nodesep: 100 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 180, height: 80 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.position = {
      x: nodeWithPosition.x - 90,
      y: nodeWithPosition.y - 40,
    };
  });

  return { nodes, edges };
};

const N8nPreviewContent: React.FC<N8nPreviewProps> = ({ workflow, className, height = '600px' }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isAutoLayout, setIsAutoLayout] = useState(false);
  const { fitView, zoomIn, zoomOut } = useReactFlow();

  const { nodeCount, edgeCount } = useMemo(() => {
    return {
      nodeCount: workflow?.nodes?.length || 0,
      edgeCount: Object.keys(workflow?.connections || {}).length || 0,
    };
  }, [workflow]);

  const parseWorkflow = useCallback(() => {
    if (!workflow?.nodes) {
      console.error('No nodes found in workflow');
      return;
    }

    // Convert n8n nodes to React Flow nodes
    const flowNodes: Node[] = workflow.nodes.map((n8nNode, index) => {
      const nodeId = n8nNode.id || n8nNode.name || `node-${index}`;
      const hasValidPosition = n8nNode.position && Array.isArray(n8nNode.position) && n8nNode.position.length >= 2;
      
      return {
        id: nodeId,
        type: 'n8nNode',
        position: hasValidPosition 
          ? { x: n8nNode.position[0], y: n8nNode.position[1] }
          : { x: 0, y: 0 }, // Will be set by auto-layout if needed
        data: {
          name: n8nNode.name,
          type: n8nNode.type,
          hasCredentials: !!n8nNode.credentials,
        },
      };
    });

    // Convert n8n connections to React Flow edges
    const flowEdges: Edge[] = [];
    if (workflow.connections) {
      Object.entries(workflow.connections).forEach(([sourceNodeName, connections]) => {
        if (connections && typeof connections === 'object') {
          Object.entries(connections).forEach(([outputIndex, targets]) => {
            if (Array.isArray(targets)) {
              targets.forEach((target: any) => {
                if (target?.node) {
                  const edgeId = `${sourceNodeName}-${target.node}-${outputIndex}-${target.type || 0}`;
                  flowEdges.push({
                    id: edgeId,
                    source: sourceNodeName,
                    target: target.node,
                    type: 'smoothstep',
                    animated: false,
                    style: { stroke: 'hsl(var(--brand-primary))' },
                    markerEnd: {
                      type: 'arrowclosed',
                      color: 'hsl(var(--brand-primary))',
                    },
                  });
                }
              });
            }
          });
        }
      });
    }

    // Check if any nodes have valid positions
    const hasValidPositions = flowNodes.some(node => 
      node.position.x !== 0 || node.position.y !== 0
    );

    let finalNodes = flowNodes;
    let finalEdges = flowEdges;

    if (!hasValidPositions) {
      console.log('No valid positions found, applying auto-layout');
      const layouted = getLayoutedElements(flowNodes, flowEdges);
      finalNodes = layouted.nodes;
      finalEdges = layouted.edges;
      setIsAutoLayout(true);
    }

    setNodes(finalNodes);
    setEdges(finalEdges);
    
    // Fit view after a short delay to ensure nodes are rendered
    setTimeout(() => fitView({ padding: 0.1 }), 100);
  }, [workflow, setNodes, setEdges, fitView]);

  useEffect(() => {
    parseWorkflow();
  }, [parseWorkflow]);

  const handleReLayout = useCallback(() => {
    const layouted = getLayoutedElements(nodes, edges);
    setNodes(layouted.nodes);
    setEdges(layouted.edges);
    setIsAutoLayout(true);
    setTimeout(() => fitView({ padding: 0.1 }), 100);
  }, [nodes, edges, setNodes, setEdges, fitView]);

  const handleFitView = useCallback(() => {
    fitView({ padding: 0.1 });
  }, [fitView]);

  if (!workflow?.nodes || workflow.nodes.length === 0) {
    return (
      <div className={`bg-card border border-brand-primary/20 rounded-lg p-8 text-center ${className}`} style={{ height }}>
        <p className="text-text-mid mb-4">No workflow nodes found</p>
        <div className="text-sm text-text-mid">
          This workflow appears to be empty or invalid.
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-card border border-brand-primary/20 rounded-lg overflow-hidden ${className}`} style={{ height }}>
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 border-b border-brand-primary/20 bg-bg-hero/20">
        <div className="text-sm text-text-mid">
          Nodes: {nodeCount} | Connections: {edgeCount}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleFitView}>
            <Maximize2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => zoomIn()}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => zoomOut()}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleReLayout}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* React Flow Canvas */}
      <div style={{ height: 'calc(100% - 60px)' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-left"
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={true}
          panOnDrag={true}
          zoomOnScroll={true}
          zoomOnPinch={true}
          className="bg-muted/20"
        >
          <Background 
            gap={20} 
            size={1} 
            color="hsl(var(--brand-primary) / 0.1)"
          />
          <MiniMap 
            nodeColor="hsl(var(--brand-primary))"
            maskColor="hsl(var(--bg-card) / 0.8)"
            className="!bg-card !border !border-brand-primary/20"
            pannable
            zoomable
          />
        </ReactFlow>
      </div>
    </div>
  );
};

const N8nPreview: React.FC<N8nPreviewProps> = (props) => {
  return (
    <ReactFlowProvider>
      <N8nPreviewContent {...props} />
    </ReactFlowProvider>
  );
};

export default N8nPreview;