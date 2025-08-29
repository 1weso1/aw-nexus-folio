// Real n8n workflow data structure
export interface Workflow {
  id: string;
  name: string;
  description: string;
  category: string;
  complexity: 'Beginner' | 'Intermediate' | 'Advanced';
  integrations: string[];
  useCase: string;
  setupTime: string;
  tags: string[];
  jsonUrl?: string;
  imageUrl?: string;
}

export const workflowData: Workflow[] = [
  // CRM & Sales Workflows
  {
    id: 'hubspot-lead-sync',
    name: 'HubSpot Lead Sync & Qualification',
    description: 'Automatically sync leads between multiple sources and qualify them based on custom criteria',
    category: 'CRM & Sales',
    complexity: 'Intermediate',
    integrations: ['HubSpot', 'Google Sheets', 'Email'],
    useCase: 'Lead Management',
    setupTime: '30 minutes',
    tags: ['crm', 'lead-qualification', 'automation'],
  },
  {
    id: 'pipeline-automation',
    name: 'Sales Pipeline Automation',
    description: 'Move deals through pipeline stages automatically based on prospect actions and engagement',
    category: 'CRM & Sales',
    complexity: 'Advanced',
    integrations: ['HubSpot', 'Salesforce', 'Slack'],
    useCase: 'Pipeline Management',
    setupTime: '45 minutes',
    tags: ['sales', 'pipeline', 'automation'],
  },
  
  // Lead Generation Workflows
  {
    id: 'linkedin-prospecting',
    name: 'LinkedIn Prospecting Automation',
    description: 'Extract LinkedIn prospects and automatically add them to CRM with enriched data',
    category: 'Lead Generation',
    complexity: 'Intermediate',
    integrations: ['LinkedIn', 'HubSpot', 'Apollo'],
    useCase: 'Prospecting',
    setupTime: '25 minutes',
    tags: ['linkedin', 'prospecting', 'lead-gen'],
  },
  {
    id: 'web-scraping-leads',
    name: 'Website Visitor to Lead Converter',
    description: 'Convert website visitors into qualified leads using behavioral tracking and automated outreach',
    category: 'Lead Generation',
    complexity: 'Advanced',
    integrations: ['Google Analytics', 'HubSpot', 'Email'],
    useCase: 'Visitor Conversion',
    setupTime: '60 minutes',
    tags: ['web-scraping', 'visitor-tracking', 'conversion'],
  },

  // Marketing Workflows
  {
    id: 'email-campaign-automation',
    name: 'Multi-Channel Email Campaigns',
    description: 'Create personalized email campaigns across multiple channels with A/B testing',
    category: 'Marketing',
    complexity: 'Intermediate',
    integrations: ['Mailchimp', 'HubSpot', 'Google Ads'],
    useCase: 'Email Marketing',
    setupTime: '40 minutes',
    tags: ['email', 'campaigns', 'marketing'],
  },
  {
    id: 'content-distribution',
    name: 'Automated Content Distribution',
    description: 'Distribute blog content across social media platforms with optimal timing',
    category: 'Marketing',
    complexity: 'Beginner',
    integrations: ['WordPress', 'Twitter', 'LinkedIn', 'Facebook'],
    useCase: 'Content Marketing',
    setupTime: '20 minutes',
    tags: ['content', 'social-media', 'distribution'],
  },

  // Social Media Workflows
  {
    id: 'social-media-scheduler',
    name: 'AI-Powered Social Media Scheduler',
    description: 'Schedule and optimize social media posts across platforms using AI insights',
    category: 'Social Media',
    complexity: 'Intermediate',
    integrations: ['Buffer', 'Hootsuite', 'OpenAI', 'Analytics'],
    useCase: 'Social Media Management',
    setupTime: '35 minutes',
    tags: ['social-media', 'ai', 'scheduling'],
  },
  {
    id: 'engagement-tracker',
    name: 'Social Media Engagement Tracker',
    description: 'Track and respond to social media mentions and engagement automatically',
    category: 'Social Media',
    complexity: 'Advanced',
    integrations: ['Twitter API', 'Facebook API', 'Slack', 'Email'],
    useCase: 'Engagement Management',
    setupTime: '50 minutes',
    tags: ['engagement', 'monitoring', 'response'],
  },

  // AI-Powered Workflows
  {
    id: 'ai-content-generator',
    name: 'AI Content Generation Pipeline',
    description: 'Generate blog posts, social media content, and marketing copy using AI',
    category: 'AI-Powered',
    complexity: 'Advanced',
    integrations: ['OpenAI', 'Claude', 'WordPress', 'Buffer'],
    useCase: 'Content Creation',
    setupTime: '45 minutes',
    tags: ['ai', 'content-generation', 'automation'],
  },
  {
    id: 'ai-lead-scoring',
    name: 'AI Lead Scoring System',
    description: 'Score and prioritize leads using AI-based behavioral analysis',
    category: 'AI-Powered',
    complexity: 'Advanced',
    integrations: ['OpenAI', 'HubSpot', 'Google Analytics'],
    useCase: 'Lead Qualification',
    setupTime: '60 minutes',
    tags: ['ai', 'lead-scoring', 'qualification'],
  },

  // Business Operations
  {
    id: 'invoice-automation',
    name: 'Automated Invoice Processing',
    description: 'Process invoices automatically from receipt to payment tracking',
    category: 'Business Operations',
    complexity: 'Intermediate',
    integrations: ['QuickBooks', 'Stripe', 'Email', 'Google Drive'],
    useCase: 'Financial Operations',
    setupTime: '40 minutes',
    tags: ['invoicing', 'payments', 'automation'],
  },
  {
    id: 'reporting-dashboard',
    name: 'Executive Reporting Dashboard',
    description: 'Generate comprehensive business reports and dashboards automatically',
    category: 'Business Operations',
    complexity: 'Advanced',
    integrations: ['Google Sheets', 'HubSpot', 'Salesforce', 'Email'],
    useCase: 'Business Intelligence',
    setupTime: '55 minutes',
    tags: ['reporting', 'dashboard', 'analytics'],
  },
];

// Category statistics
export const categoryStats = {
  'CRM & Sales': { count: 233, description: 'Lead management, customer onboarding, pipeline automation' },
  'Lead Generation': { count: 340, description: 'Prospecting, qualification, outreach sequences' },
  'Marketing': { count: 1371, description: 'Email campaigns, social media, content automation' },
  'Social Media': { count: 325, description: 'Content publishing, engagement tracking, analytics' },
  'Lead Nurturing': { count: 136, description: 'Drip campaigns, follow-up sequences, scoring' },
  'Business Operations': { count: 400, description: 'Data processing, reporting, integrations' },
  'AI-Powered': { count: 500, description: 'Intelligent content generation, analysis' },
  'Integration Templates': { count: 200, description: 'HubSpot, Salesforce, Google Workspace' },
};

export const getWorkflowsByCategory = (category: string) => {
  return workflowData.filter(workflow => workflow.category === category);
};

export const getAllCategories = () => {
  return Object.keys(categoryStats);
};