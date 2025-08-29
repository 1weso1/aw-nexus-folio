export type WorkflowComplexity = "Easy" | "Medium" | "Advanced";

export interface WorkflowItem {
  id: string;
  name: string;
  path: string;
  rawUrl: string;
  size: number;
  updatedAt: string;
  category: string;
  tags: string[];
  nodeCount: number;
  hasCredentials: boolean;
  complexity: WorkflowComplexity;
  description?: string;
  folderName?: string;
}

export type WorkflowManifest = WorkflowItem[];

export interface N8nWorkflow {
  nodes: Array<{
    id: string;
    name: string;
    type: string;
    parameters?: Record<string, any>;
    credentials?: Record<string, any>;
    position: [number, number];
  }>;
  connections: Record<string, any>;
  active?: boolean;
  settings?: Record<string, any>;
  staticData?: Record<string, any>;
  meta?: Record<string, any>;
}

export interface WorkflowStats {
  totalWorkflows: number;
  totalCategories: number;
  totalIntegrations: number;
  averageSetupTime: number;
}