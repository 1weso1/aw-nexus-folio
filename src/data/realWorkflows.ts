// DEPRECATED: This static data is replaced by Supabase-powered workflows
// Use src/lib/workflows.ts for all workflow data access

export interface RealWorkflow {
  id: string;
  name: string;
  description: string;
  category: string;
  complexity: 'Beginner' | 'Intermediate' | 'Advanced';
  integrations: string[];
  useCase: string;
  setupTime: string;
  tags: string[];
  folderName: string;
  downloadUrl: string;
  imageUrl?: string;
  nodeCount?: number;
  triggerType?: string;
}

// DEPRECATED: Use Supabase workflows instead
export const realWorkflowData: RealWorkflow[] = [];

// Category mappings from the repository
export const categoryMappings = {
  'CRM & Sales': ['Hubspot', 'Salesforce', 'Pipedrive', 'Affinity', 'Zoho'],
  'Marketing': ['Mailchimp', 'Activecampaign', 'Facebook', 'Googleads', 'Buffer'],
  'Social Media': ['Slack', 'Discord', 'Telegram', 'Twitter', 'Instagram', 'Linkedin'],
  'Business Operations': ['Airtable', 'Googlesheets', 'Asana', 'Trello', 'Shopify', 'Stripe', 'Googledrive', 'Awss3'],
  'AI-Powered': ['Openai', 'Chatgpt', 'Anthropic', 'Huggingface']
};

// Utility functions - DEPRECATED
export function getRealWorkflowsByCategory(category: string): RealWorkflow[] {
  return [];
}

export function getAllRealCategories(): string[] {
  return [];
}

export function getRealWorkflowById(id: string): RealWorkflow | undefined {
  return undefined;
}

export function searchRealWorkflows(query: string): RealWorkflow[] {
  return [];
}

// Statistics - DEPRECATED
export const realWorkflowStats = {
  totalWorkflows: 0,
  totalIntegrations: 0,
  categories: 0,
  averageSetupTime: 0
};