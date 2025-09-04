import React, { useCallback, useMemo } from 'react';
import { 
  ReactFlow, 
  Node, 
  Edge, 
  Controls, 
  Background, 
  useNodesState, 
  useEdgesState,
  ConnectionMode,
  Panel
} from '@xyflow/react';
import dagre from 'dagre';
import '@xyflow/react/dist/style.css';

interface N8nNode {
  id: string;
  name: string;
  type: string;
  position: [number, number];
  parameters?: any;
  disabled?: boolean;
}

interface N8nConnection {
  [outputNodeName: string]: {
    [outputIndex: string]: Array<{
      node: string;
      type: string;
      index: number;
    }>;
  };
}

interface WorkflowData {
  name: string;
  nodes: N8nNode[];
  connections: N8nConnection;
}

interface N8nPreviewProps {
  workflow: WorkflowData;
  height?: string;
  width?: string;
}

const nodeWidth = 180;
const nodeHeight = 60;

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    (node as any).targetPosition = 'top';
    (node as any).sourcePosition = 'bottom';
    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    };
    return node;
  });

  return { nodes, edges };
};

const getNodeTypeColor = (nodeType: string) => {
  const typeColors: { [key: string]: string } = {
    'n8n-nodes-base.start': '#00E5D4',
    'n8n-nodes-base.webhook': '#00C8FF',
    'n8n-nodes-base.httpRequest': '#4F46E5',
    'n8n-nodes-base.set': '#10B981',
    'n8n-nodes-base.if': '#F59E0B',
    'n8n-nodes-base.function': '#EF4444',
    'n8n-nodes-base.merge': '#8B5CF6',
    'n8n-nodes-base.code': '#F97316',
    'n8n-nodes-base.emailSend': '#06B6D4',
    'n8n-nodes-base.spreadsheetFile': '#22C55E',
    'n8n-nodes-base.googleSheets': '#22C55E',
    'n8n-nodes-base.slack': '#7C3AED',
    'n8n-nodes-base.discord': '#6366F1',
    'n8n-nodes-base.telegram': '#0EA5E9',
    'n8n-nodes-base.mysql': '#F97316',
    'n8n-nodes-base.postgres': '#3B82F6',
    'n8n-nodes-base.mongodb': '#22C55E',
    'n8n-nodes-base.redis': '#DC2626',
    // Default colors for unknown types
    'default': '#6B7280'
  };
  
  return typeColors[nodeType] || typeColors.default;
};

const N8nPreview: React.FC<N8nPreviewProps> = ({ 
  workflow, 
  height = '400px', 
  width = '100%' 
}) => {
  // Convert n8n nodes to React Flow nodes
  const initialNodes: Node[] = useMemo(() => {
    if (!workflow?.nodes) return [];
    
    return workflow.nodes.map((n8nNode) => ({
      id: n8nNode.name,
      type: 'default',
      position: { x: n8nNode.position[0], y: n8nNode.position[1] },
      data: {
        label: (
          <div className="text-center">
            <div className="font-semibold text-xs mb-1 truncate max-w-[160px]">
              {n8nNode.name}
            </div>
            <div className="text-xs opacity-70 truncate max-w-[160px]">
              {n8nNode.type.split('.').pop()?.replace(/([A-Z])/g, ' $1').trim() || n8nNode.type}
            </div>
          </div>
        ),
      },
      style: {
        background: getNodeTypeColor(n8nNode.type),
        color: 'white',
        border: '2px solid rgba(255,255,255,0.2)',
        borderRadius: '8px',
        width: nodeWidth,
        height: nodeHeight,
        fontSize: '11px',
        opacity: n8nNode.disabled ? 0.5 : 1,
      },
      draggable: false,
    }));
  }, [workflow]);

  // Convert n8n connections to React Flow edges
  const initialEdges: Edge[] = useMemo(() => {
    if (!workflow?.connections || !workflow?.nodes) return [];
    
    const edges: Edge[] = [];
    
    Object.entries(workflow.connections).forEach(([sourceNodeName, outputs]) => {
      Object.entries(outputs).forEach(([outputIndex, connections]) => {
        connections.forEach((connection, connIndex) => {
          edges.push({
            id: `${sourceNodeName}-${outputIndex}-${connection.node}-${connection.index}-${connIndex}`,
            source: sourceNodeName,
            target: connection.node,
            type: 'smoothstep',
            style: {
              stroke: '#00E5D4',
              strokeWidth: 2,
            },
            markerEnd: {
              type: 'arrowclosed' as const,
              color: '#00E5D4',
            },
          });
        });
      });
    });
    
    return edges;
  }, [workflow]);

  // Apply layout
  const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(() => {
    return getLayoutedElements(initialNodes, initialEdges);
  }, [initialNodes, initialEdges]);

  const [nodes, , onNodesChange] = useNodesState(layoutedNodes);
  const [edges, , onEdgesChange] = useEdgesState(layoutedEdges);

  const onInit = useCallback((reactFlowInstance: any) => {
    reactFlowInstance.fitView({ padding: 0.2 });
  }, []);

  if (!workflow || !workflow.nodes || workflow.nodes.length === 0) {
    return (
      <div 
        className="flex items-center justify-center border border-primary/20 rounded-lg bg-card/50"
        style={{ height, width }}
      >
        <div className="text-center text-muted-foreground">
          <p className="mb-2">No workflow data available</p>
          <p className="text-sm">Unable to render workflow preview</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height, width }} className="border border-primary/20 rounded-lg overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onInit={onInit}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={true}
        panOnDrag={true}
        zoomOnScroll={true}
        zoomOnPinch={true}
        connectionMode={ConnectionMode.Loose}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        className="bg-card/30"
      >
        <Background 
          color="#00E5D4" 
          gap={20} 
          size={1}
          className="opacity-20"
        />
        <Controls 
          className="bg-card/80 border border-primary/30 rounded-lg"
          showInteractive={false}
        />
        <Panel position="top-left" className="text-xs text-muted-foreground bg-card/80 px-3 py-2 rounded-lg border border-primary/20">
          {workflow.name} • {nodes.length} nodes
        </Panel>
      </ReactFlow>
    </div>
  );
};

export default N8nPreview;