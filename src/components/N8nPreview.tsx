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
  Handle,
  Position,
} from '@xyflow/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  RotateCcw, 
  Sun, 
  Moon,
  Zap,
  Globe,
  Settings,
  Database,
  Mail,
  MessageSquare,
  FileText,
  Calendar,
  DollarSign,
  Bot,
  Phone,
  Share,
  Code,
  GitBranch,
  Filter,
  Shuffle,
  Play,
  AlertCircle
} from 'lucide-react';
import dagre from 'dagre';
import '@xyflow/react/dist/style.css';

interface N8nNode {
  id?: string;
  name: string;
  type: string;
  position?: [number, number];
  parameters?: any;
  credentials?: any;
  disabled?: boolean;
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

// Node type mapping with colors and icons
const getNodeTypeInfo = (type: string) => {
  const cleanType = type.replace(/^n8n-nodes-base\./, '').toLowerCase();
  
  // Triggers/Start nodes
  if (cleanType.includes('trigger') || cleanType.includes('start') || cleanType.includes('webhook')) {
    return { color: '#00D2D2', bgColor: 'rgba(0, 210, 210, 0.1)', icon: Zap };
  }
  
  // HTTP/API nodes
  if (cleanType.includes('http') || cleanType.includes('api') || cleanType.includes('request')) {
    return { color: '#4A90E2', bgColor: 'rgba(74, 144, 226, 0.1)', icon: Globe };
  }
  
  // Logic nodes
  if (cleanType.includes('if') || cleanType.includes('switch') || cleanType.includes('merge') || 
      cleanType.includes('split') || cleanType.includes('batch') || cleanType.includes('condition')) {
    return { color: '#FF6B35', bgColor: 'rgba(255, 107, 53, 0.1)', icon: GitBranch };
  }
  
  // Data manipulation
  if (cleanType.includes('set') || cleanType.includes('move') || cleanType.includes('code') || 
      cleanType.includes('function') || cleanType.includes('json') || cleanType.includes('xml')) {
    return { color: '#FFD23F', bgColor: 'rgba(255, 210, 63, 0.1)', icon: Code };
  }
  
  // External services
  if (cleanType.includes('gmail') || cleanType.includes('email')) {
    return { color: '#EA4335', bgColor: 'rgba(234, 67, 53, 0.1)', icon: Mail };
  }
  if (cleanType.includes('slack')) {
    return { color: '#4A154B', bgColor: 'rgba(74, 21, 75, 0.1)', icon: MessageSquare };
  }
  if (cleanType.includes('notion')) {
    return { color: '#000000', bgColor: 'rgba(0, 0, 0, 0.1)', icon: FileText };
  }
  if (cleanType.includes('airtable')) {
    return { color: '#FFB000', bgColor: 'rgba(255, 176, 0, 0.1)', icon: Database };
  }
  if (cleanType.includes('google')) {
    return { color: '#4285F4', bgColor: 'rgba(66, 133, 244, 0.1)', icon: Calendar };
  }
  if (cleanType.includes('stripe')) {
    return { color: '#635BFF', bgColor: 'rgba(99, 91, 255, 0.1)', icon: DollarSign };
  }
  if (cleanType.includes('hubspot')) {
    return { color: '#FF7A59', bgColor: 'rgba(255, 122, 89, 0.1)', icon: Settings };
  }
  if (cleanType.includes('openai') || cleanType.includes('ai')) {
    return { color: '#10A37F', bgColor: 'rgba(16, 163, 127, 0.1)', icon: Bot };
  }
  if (cleanType.includes('telegram') || cleanType.includes('twilio') || cleanType.includes('phone')) {
    return { color: '#0088CC', bgColor: 'rgba(0, 136, 204, 0.1)', icon: Phone };
  }
  if (cleanType.includes('supabase') || cleanType.includes('postgres') || cleanType.includes('mysql')) {
    return { color: '#3ECF8E', bgColor: 'rgba(62, 207, 142, 0.1)', icon: Database };
  }
  
  // Default/misc
  return { color: '#6B7280', bgColor: 'rgba(107, 116, 128, 0.1)', icon: Settings };
};

const N8nNodeComponent: React.FC<{ data: any; selected?: boolean }> = ({ data, selected }) => {
  const { name, type, hasCredentials, disabled, isStart } = data;
  const [isHovered, setIsHovered] = useState(false);
  
  const nodeInfo = getNodeTypeInfo(type);
  const Icon = nodeInfo.icon;
  
  // Clean up the type name for display
  const displayType = type.replace(/^.*\./, '').replace(/([A-Z])/g, ' $1').trim();
  
  return (
    <div 
      className={`
        relative bg-gray-900 border rounded-xl shadow-lg transition-all duration-200
        min-w-[160px] max-w-[200px] overflow-hidden
        ${selected ? 'ring-2 ring-blue-400' : ''}
        ${isHovered ? 'transform translate-y-[-2px] shadow-xl' : ''}
      `}
      style={{
        borderColor: nodeInfo.color + '40',
        backgroundColor: '#1a1a1a',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Node header with gradient */}
      <div 
        className="px-3 py-2 border-b border-gray-700/50"
        style={{
          backgroundColor: nodeInfo.bgColor,
          borderBottomColor: nodeInfo.color + '20',
        }}
      >
        <div className="flex items-center gap-2">
          <div 
            className="flex items-center justify-center w-6 h-6 rounded"
            style={{ backgroundColor: nodeInfo.color + '20' }}
          >
            <Icon 
              className="w-3.5 h-3.5" 
              style={{ color: nodeInfo.color }}
            />
            {isStart && (
              <Zap 
                className="w-2 h-2 absolute -top-1 -right-1 text-yellow-400" 
                fill="currentColor"
              />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div 
              className="font-medium text-sm truncate text-white"
              title={name}
            >
              {name}
            </div>
          </div>
          {disabled && (
            <div className="w-2 h-2 bg-red-500 rounded-full" title="Disabled" />
          )}
        </div>
      </div>
      
      {/* Node body */}
      <div className="px-3 py-2">
        <div className="text-xs text-gray-400 truncate mb-2" title={displayType}>
          {displayType}
        </div>
        
        {/* Badges */}
        <div className="flex gap-1 flex-wrap">
          {hasCredentials && (
            <Badge 
              variant="secondary" 
              className="text-xs px-1.5 py-0.5 bg-blue-500/20 text-blue-300 border-blue-500/30"
            >
              Creds
            </Badge>
          )}
        </div>
      </div>
      
      {/* Input/Output handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 border-2 border-gray-600 bg-gray-800 hover:border-blue-400 hover:bg-blue-400 transition-colors"
        style={{ left: -6 }}
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 border-2 border-gray-600 bg-gray-800 hover:border-blue-400 hover:bg-blue-400 transition-colors"
        style={{ right: -6 }}
      />
      
      {/* Hover glow effect */}
      {isHovered && (
        <div 
          className="absolute inset-0 rounded-xl pointer-events-none"
          style={{
            boxShadow: `0 0 20px ${nodeInfo.color}40`,
            border: `1px solid ${nodeInfo.color}60`,
          }}
        />
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
  dagreGraph.setGraph({ rankdir: 'LR', ranksep: 120, nodesep: 70 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 180, height: 90 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.position = {
      x: nodeWithPosition.x - 90,
      y: nodeWithPosition.y - 45,
    };
  });

  return { nodes, edges };
};

const N8nPreviewContent: React.FC<N8nPreviewProps> = ({ workflow, className, height = '600px' }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isAutoLayout, setIsAutoLayout] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const { fitView, zoomIn, zoomOut } = useReactFlow();

  // Ensure onEdgesChange is defined
  const handleEdgesChange = useCallback((changes: any) => {
    onEdgesChange(changes);
  }, [onEdgesChange]);

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

    // Detect start/trigger nodes
    const startNodeTypes = workflow.nodes.filter(node => 
      node.type.toLowerCase().includes('trigger') || 
      node.type.toLowerCase().includes('start') ||
      node.type.toLowerCase().includes('webhook')
    ).map(node => node.name);

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
          hasCredentials: !!(n8nNode.credentials && Object.keys(n8nNode.credentials).length > 0),
          disabled: !!n8nNode.disabled,
          isStart: startNodeTypes.includes(n8nNode.name),
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
              targets.forEach((target: any, targetIndex: number) => {
                if (target?.node) {
                  const edgeId = `${sourceNodeName}-${target.node}-${outputIndex}-${targetIndex}`;
                  const isNonDefaultOutput = outputIndex !== '0' || target.type !== 'main';
                  
                  flowEdges.push({
                    id: edgeId,
                    source: sourceNodeName,
                    target: target.node,
                    type: 'smoothstep',
                    animated: false,
                    label: isNonDefaultOutput ? `${outputIndex !== '0' ? outputIndex : target.type}` : undefined,
                    style: { 
                      stroke: '#6366f1',
                      strokeWidth: 2,
                      filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))'
                    },
                    markerEnd: {
                      type: 'arrowclosed',
                      color: '#6366f1',
                      width: 20,
                      height: 20,
                    },
                    labelStyle: {
                      fill: '#e5e7eb',
                      fontSize: 11,
                      fontWeight: 500,
                    },
                    labelBgStyle: {
                      fill: '#1f2937',
                      fillOpacity: 0.8,
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

  const handleThemeToggle = useCallback(() => {
    setIsDarkTheme(!isDarkTheme);
  }, [isDarkTheme]);

  const handleDoubleClick = useCallback(() => {
    fitView({ padding: 0.1 });
  }, [fitView]);

  if (!workflow?.nodes || workflow.nodes.length === 0) {
    return (
      <div className={`
        ${isDarkTheme ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} 
        border rounded-xl p-8 text-center ${className}
      `} style={{ height }}>
        <AlertCircle className={`mx-auto mb-4 w-12 h-12 ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`} />
        <p className={`mb-4 ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>No workflow nodes found</p>
        <div className={`text-sm ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`}>
          This workflow appears to be empty or invalid.
        </div>
      </div>
    );
  }

  return (
    <div className={`
      ${isDarkTheme ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} 
      border rounded-xl overflow-hidden ${className}
    `} style={{ height }}>
      {/* Enhanced Toolbar */}
      <div className={`
        flex items-center justify-between px-4 py-3 border-b
        ${isDarkTheme ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}
      `}>
        <div className={`text-sm font-medium ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}>
          Nodes: <span className="text-blue-400">{nodeCount}</span> | 
          Connections: <span className="text-blue-400">{edgeCount}</span>
        </div>
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleFitView}
            className={`
              h-8 w-8 p-0 
              ${isDarkTheme ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}
            `}
            title="Fit to view"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => zoomIn()}
            className={`
              h-8 w-8 p-0 
              ${isDarkTheme ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}
            `}
            title="Zoom in"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => zoomOut()}
            className={`
              h-8 w-8 p-0 
              ${isDarkTheme ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}
            `}
            title="Zoom out"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleReLayout}
            className={`
              h-8 w-8 p-0 
              ${isDarkTheme ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}
            `}
            title="Re-layout"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <div className="w-px h-6 bg-gray-300 mx-1" />
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleThemeToggle}
            className={`
              h-8 w-8 p-0 
              ${isDarkTheme ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}
            `}
            title={isDarkTheme ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            {isDarkTheme ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* React Flow Canvas with n8n styling */}
      <div style={{ height: 'calc(100% - 65px)' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={handleEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-left"
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={true}
          panOnDrag={true}
          zoomOnScroll={true}
          zoomOnPinch={true}
          className={`${isDarkTheme ? 'bg-gray-900' : 'bg-gray-50'}`}
          style={{
            background: isDarkTheme 
              ? 'radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.05) 0%, rgba(17, 24, 39, 0.8) 70%)'
              : 'radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.02) 0%, rgba(249, 250, 251, 0.8) 70%)'
          }}
        >
          <Background 
            gap={isDarkTheme ? 25 : 20}
            size={isDarkTheme ? 0.8 : 0.5}
            color={isDarkTheme ? 'rgba(107, 114, 128, 0.3)' : 'rgba(107, 114, 128, 0.2)'}
          />
          <MiniMap 
            nodeColor={(node: Node) => {
              const nodeData = node.data;
              if (nodeData && typeof nodeData.type === 'string') {
                const nodeInfo = getNodeTypeInfo(nodeData.type);
                return nodeInfo.color;
              }
              return '#6366f1';
            }}
            maskColor={isDarkTheme ? 'rgba(17, 24, 39, 0.8)' : 'rgba(255, 255, 255, 0.8)'}
            className={`
              !border-2 !rounded-lg !overflow-hidden
              ${isDarkTheme ? '!bg-gray-800 !border-gray-600' : '!bg-white !border-gray-300'}
            `}
            pannable
            zoomable
            position="bottom-right"
            style={{
              backgroundColor: isDarkTheme ? '#1f2937' : '#ffffff',
              border: isDarkTheme ? '2px solid #374151' : '2px solid #d1d5db',
            }}
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