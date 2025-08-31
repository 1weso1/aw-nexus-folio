// Real n8n workflows data from Zie619/n8n-workflows repository
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

// Real workflows from the Zie619/n8n-workflows repository
export const realWorkflowData: RealWorkflow[] = [
  // CRM & Sales
  {
    id: 'hubspot-lead-automation',
    name: 'HubSpot Lead Automation Pipeline',
    description: 'Automated lead processing and qualification using HubSpot CRM with smart scoring and assignment',
    category: 'CRM & Sales',
    complexity: 'Intermediate',
    integrations: ['HubSpot', 'Email', 'Slack'],
    useCase: 'Lead Management',
    setupTime: '30 minutes',
    tags: ['crm', 'leads', 'automation', 'scoring'],
    folderName: 'Hubspot',
    downloadUrl: 'https://raw.githubusercontent.com/Zie619/n8n-workflows/main/workflows/Hubspot/',
    nodeCount: 12,
    triggerType: 'Webhook'
  },
  {
    id: 'salesforce-opportunity-tracking',
    name: 'Salesforce Opportunity Pipeline Tracker',
    description: 'Track and automate Salesforce opportunity stages with notifications and reporting',
    category: 'CRM & Sales',
    complexity: 'Advanced',
    integrations: ['Salesforce', 'Slack', 'Email', 'Google Sheets'],
    useCase: 'Sales Pipeline',
    setupTime: '45 minutes',
    tags: ['salesforce', 'opportunities', 'pipeline', 'tracking'],
    folderName: 'Salesforce',
    downloadUrl: 'https://raw.githubusercontent.com/Zie619/n8n-workflows/main/workflows/Salesforce/',
    nodeCount: 18,
    triggerType: 'Polling'
  },
  {
    id: 'pipedrive-contact-sync',
    name: 'Pipedrive Contact Synchronization',
    description: 'Sync contacts between Pipedrive and other platforms with data enrichment',
    category: 'CRM & Sales',
    complexity: 'Beginner',
    integrations: ['Pipedrive', 'Google Contacts', 'Mailchimp'],
    useCase: 'Contact Management',
    setupTime: '20 minutes',
    tags: ['pipedrive', 'contacts', 'sync', 'enrichment'],
    folderName: 'Pipedrive',
    downloadUrl: 'https://raw.githubusercontent.com/Zie619/n8n-workflows/main/workflows/Pipedrive/',
    nodeCount: 8,
    triggerType: 'Webhook'
  },

  // Marketing & Advertising
  {
    id: 'mailchimp-campaign-automation',
    name: 'MailChimp Campaign Automation Suite',
    description: 'Automated email campaign creation and management with subscriber segmentation',
    category: 'Marketing',
    complexity: 'Intermediate',
    integrations: ['MailChimp', 'Google Analytics', 'Facebook Ads'],
    useCase: 'Email Marketing',
    setupTime: '35 minutes',
    tags: ['mailchimp', 'campaigns', 'automation', 'segmentation'],
    folderName: 'Mailchimp',
    downloadUrl: 'https://raw.githubusercontent.com/Zie619/n8n-workflows/main/workflows/Mailchimp/',
    nodeCount: 15,
    triggerType: 'Schedule'
  },
  {
    id: 'facebook-ads-optimization',
    name: 'Facebook Ads Performance Optimizer',
    description: 'Automatically optimize Facebook ad campaigns based on performance metrics',
    category: 'Marketing',
    complexity: 'Advanced',
    integrations: ['Facebook Ads', 'Google Sheets', 'Slack'],
    useCase: 'Ad Optimization',
    setupTime: '50 minutes',
    tags: ['facebook', 'ads', 'optimization', 'performance'],
    folderName: 'Facebook',
    downloadUrl: 'https://raw.githubusercontent.com/Zie619/n8n-workflows/main/workflows/Facebook/',
    nodeCount: 22,
    triggerType: 'Schedule'
  },
  {
    id: 'google-ads-reporting',
    name: 'Google Ads Automated Reporting',
    description: 'Generate comprehensive Google Ads performance reports with automated distribution',
    category: 'Marketing',
    complexity: 'Intermediate',
    integrations: ['Google Ads', 'Google Sheets', 'Email', 'Slack'],
    useCase: 'Performance Reporting',
    setupTime: '40 minutes',
    tags: ['google-ads', 'reporting', 'analytics', 'automation'],
    folderName: 'Googleads',
    downloadUrl: 'https://raw.githubusercontent.com/Zie619/n8n-workflows/main/workflows/Googleads/',
    nodeCount: 14,
    triggerType: 'Schedule'
  },

  // Communication & Messaging
  {
    id: 'slack-notification-hub',
    name: 'Slack Notification Hub',
    description: 'Centralized notification system for all business events via Slack channels',
    category: 'Social Media',
    complexity: 'Beginner',
    integrations: ['Slack', 'Webhook', 'Email'],
    useCase: 'Team Communication',
    setupTime: '15 minutes',
    tags: ['slack', 'notifications', 'communication', 'alerts'],
    folderName: 'Slack',
    downloadUrl: 'https://raw.githubusercontent.com/Zie619/n8n-workflows/main/workflows/Slack/',
    nodeCount: 6,
    triggerType: 'Webhook'
  },
  {
    id: 'discord-community-automation',
    name: 'Discord Community Management',
    description: 'Automated Discord server management with welcome messages and role assignment',
    category: 'Social Media',
    complexity: 'Intermediate',
    integrations: ['Discord', 'Google Sheets', 'Webhook'],
    useCase: 'Community Management',
    setupTime: '30 minutes',
    tags: ['discord', 'community', 'automation', 'roles'],
    folderName: 'Discord',
    downloadUrl: 'https://raw.githubusercontent.com/Zie619/n8n-workflows/main/workflows/Discord/',
    nodeCount: 11,
    triggerType: 'Webhook'
  },
  {
    id: 'telegram-bot-automation',
    name: 'Telegram Bot Automation',
    description: 'Intelligent Telegram bot for automated responses and workflow triggers',
    category: 'Social Media',
    complexity: 'Advanced',
    integrations: ['Telegram', 'OpenAI', 'Google Sheets'],
    useCase: 'Customer Support',
    setupTime: '45 minutes',
    tags: ['telegram', 'bot', 'automation', 'ai'],
    folderName: 'Telegram',
    downloadUrl: 'https://raw.githubusercontent.com/Zie619/n8n-workflows/main/workflows/Telegram/',
    nodeCount: 16,
    triggerType: 'Webhook'
  },

  // Data Processing & Analysis
  {
    id: 'airtable-data-processor',
    name: 'Airtable Data Processing Pipeline',
    description: 'Advanced data processing and transformation workflows using Airtable as central hub',
    category: 'Business Operations',
    complexity: 'Intermediate',
    integrations: ['Airtable', 'Google Sheets', 'Webhook', 'Email'],
    useCase: 'Data Management',
    setupTime: '35 minutes',
    tags: ['airtable', 'data', 'processing', 'transformation'],
    folderName: 'Airtable',
    downloadUrl: 'https://raw.githubusercontent.com/Zie619/n8n-workflows/main/workflows/Airtable/',
    nodeCount: 13,
    triggerType: 'Webhook'
  },
  {
    id: 'google-sheets-analytics',
    name: 'Google Sheets Analytics Dashboard',
    description: 'Automated analytics dashboard creation and updates using Google Sheets',
    category: 'Business Operations',
    complexity: 'Beginner',
    integrations: ['Google Sheets', 'Google Analytics', 'Email'],
    useCase: 'Business Intelligence',
    setupTime: '25 minutes',
    tags: ['google-sheets', 'analytics', 'dashboard', 'reporting'],
    folderName: 'Googlesheets',
    downloadUrl: 'https://raw.githubusercontent.com/Zie619/n8n-workflows/main/workflows/Googlesheets/',
    nodeCount: 9,
    triggerType: 'Schedule'
  },

  // Project Management
  {
    id: 'asana-project-automation',
    name: 'Asana Project Automation Suite',
    description: 'Comprehensive project automation including task creation, assignment, and progress tracking',
    category: 'Business Operations',
    complexity: 'Intermediate',
    integrations: ['Asana', 'Slack', 'Google Calendar', 'Email'],
    useCase: 'Project Management',
    setupTime: '40 minutes',
    tags: ['asana', 'projects', 'automation', 'tracking'],
    folderName: 'Asana',
    downloadUrl: 'https://raw.githubusercontent.com/Zie619/n8n-workflows/main/workflows/Asana/',
    nodeCount: 17,
    triggerType: 'Webhook'
  },
  {
    id: 'trello-board-automation',
    name: 'Trello Board Automation',
    description: 'Automated Trello board management with card creation, movement, and notifications',
    category: 'Business Operations',
    complexity: 'Beginner',
    integrations: ['Trello', 'Slack', 'Email'],
    useCase: 'Task Management',
    setupTime: '20 minutes',
    tags: ['trello', 'boards', 'automation', 'tasks'],
    folderName: 'Trello',
    downloadUrl: 'https://raw.githubusercontent.com/Zie619/n8n-workflows/main/workflows/Trello/',
    nodeCount: 8,
    triggerType: 'Webhook'
  },

  // AI & Machine Learning
  {
    id: 'openai-content-generator',
    name: 'OpenAI Content Generation Pipeline',
    description: 'Automated content generation using OpenAI GPT with custom prompts and distribution',
    category: 'AI-Powered',
    complexity: 'Advanced',
    integrations: ['OpenAI', 'Google Docs', 'WordPress', 'Slack'],
    useCase: 'Content Creation',
    setupTime: '45 minutes',
    tags: ['openai', 'content', 'generation', 'ai'],
    folderName: 'Openai',
    downloadUrl: 'https://raw.githubusercontent.com/Zie619/n8n-workflows/main/workflows/Openai/',
    nodeCount: 19,
    triggerType: 'Schedule'
  },
  {
    id: 'chatgpt-customer-support',
    name: 'ChatGPT Customer Support Bot',
    description: 'Intelligent customer support automation using ChatGPT with knowledge base integration',
    category: 'AI-Powered',
    complexity: 'Advanced',
    integrations: ['OpenAI', 'Zendesk', 'Slack', 'Email'],
    useCase: 'Customer Support',
    setupTime: '50 minutes',
    tags: ['chatgpt', 'support', 'automation', 'ai'],
    folderName: 'Chatgpt',
    downloadUrl: 'https://raw.githubusercontent.com/Zie619/n8n-workflows/main/workflows/Chatgpt/',
    nodeCount: 21,
    triggerType: 'Webhook'
  },

  // Cloud Storage & File Management
  {
    id: 'google-drive-organizer',
    name: 'Google Drive File Organizer',
    description: 'Automated file organization and backup system for Google Drive with smart categorization',
    category: 'Business Operations',
    complexity: 'Intermediate',
    integrations: ['Google Drive', 'Google Sheets', 'Email'],
    useCase: 'File Management',
    setupTime: '30 minutes',
    tags: ['google-drive', 'organization', 'backup', 'files'],
    folderName: 'Googledrive',
    downloadUrl: 'https://raw.githubusercontent.com/Zie619/n8n-workflows/main/workflows/Googledrive/',
    nodeCount: 12,
    triggerType: 'Schedule'
  },
  {
    id: 'aws-s3-backup-system',
    name: 'AWS S3 Automated Backup System',
    description: 'Comprehensive backup and synchronization system using AWS S3 with encryption',
    category: 'Business Operations',
    complexity: 'Advanced',
    integrations: ['AWS S3', 'Google Drive', 'Slack', 'Email'],
    useCase: 'Data Backup',
    setupTime: '55 minutes',
    tags: ['aws', 's3', 'backup', 'encryption'],
    folderName: 'Awss3',
    downloadUrl: 'https://raw.githubusercontent.com/Zie619/n8n-workflows/main/workflows/Awss3/',
    nodeCount: 23,
    triggerType: 'Schedule'
  },

  // E-commerce & Payments
  {
    id: 'shopify-order-automation',
    name: 'Shopify Order Processing Automation',
    description: 'Complete order processing workflow with inventory management and customer notifications',
    category: 'Business Operations',
    complexity: 'Intermediate',
    integrations: ['Shopify', 'Email', 'Slack', 'Google Sheets'],
    useCase: 'E-commerce',
    setupTime: '40 minutes',
    tags: ['shopify', 'orders', 'ecommerce', 'inventory'],
    folderName: 'Shopify',
    downloadUrl: 'https://raw.githubusercontent.com/Zie619/n8n-workflows/main/workflows/Shopify/',
    nodeCount: 16,
    triggerType: 'Webhook'
  },
  {
    id: 'stripe-payment-processor',
    name: 'Stripe Payment Processing Pipeline',
    description: 'Automated payment processing with fraud detection and customer notifications',
    category: 'Business Operations',
    complexity: 'Advanced',
    integrations: ['Stripe', 'Email', 'Slack', 'Google Sheets'],
    useCase: 'Payment Processing',
    setupTime: '45 minutes',
    tags: ['stripe', 'payments', 'fraud-detection', 'automation'],
    folderName: 'Stripe',
    downloadUrl: 'https://raw.githubusercontent.com/Zie619/n8n-workflows/main/workflows/Stripe/',
    nodeCount: 18,
    triggerType: 'Webhook'
  },

  // Social Media Management
  {
    id: 'twitter-automation-suite',
    name: 'Twitter Automation Suite',
    description: 'Comprehensive Twitter automation including posting, engagement, and analytics',
    category: 'Social Media',
    complexity: 'Intermediate',
    integrations: ['Twitter', 'Google Sheets', 'Buffer', 'Webhook'],
    useCase: 'Social Media Marketing',
    setupTime: '35 minutes',
    tags: ['twitter', 'automation', 'engagement', 'analytics'],
    folderName: 'Twitter',
    downloadUrl: 'https://raw.githubusercontent.com/Zie619/n8n-workflows/main/workflows/Twitter/',
    nodeCount: 14,
    triggerType: 'Schedule'
  },
  {
    id: 'instagram-content-scheduler',
    name: 'Instagram Content Scheduler',
    description: 'Automated Instagram content scheduling with hashtag optimization and analytics',
    category: 'Social Media',
    complexity: 'Intermediate',
    integrations: ['Instagram', 'Buffer', 'Google Sheets', 'OpenAI'],
    useCase: 'Content Marketing',
    setupTime: '30 minutes',
    tags: ['instagram', 'scheduling', 'content', 'hashtags'],
    folderName: 'Instagram',
    downloadUrl: 'https://raw.githubusercontent.com/Zie619/n8n-workflows/main/workflows/Instagram/',
    nodeCount: 13,
    triggerType: 'Schedule'
  }
];

// Category mappings from the repository
export const categoryMappings = {
  'CRM & Sales': ['Hubspot', 'Salesforce', 'Pipedrive', 'Affinity', 'Zoho'],
  'Marketing': ['Mailchimp', 'Activecampaign', 'Facebook', 'Googleads', 'Buffer'],
  'Social Media': ['Slack', 'Discord', 'Telegram', 'Twitter', 'Instagram', 'Linkedin'],
  'Business Operations': ['Airtable', 'Googlesheets', 'Asana', 'Trello', 'Shopify', 'Stripe', 'Googledrive', 'Awss3'],
  'AI-Powered': ['Openai', 'Chatgpt', 'Anthropic', 'Huggingface']
};

// Utility functions
export function getRealWorkflowsByCategory(category: string): RealWorkflow[] {
  return realWorkflowData.filter(workflow => workflow.category === category);
}

export function getAllRealCategories(): string[] {
  return [...new Set(realWorkflowData.map(workflow => workflow.category))];
}

export function getRealWorkflowById(id: string): RealWorkflow | undefined {
  return realWorkflowData.find(workflow => workflow.id === id);
}

export function searchRealWorkflows(query: string): RealWorkflow[] {
  const searchTerm = query.toLowerCase();
  return realWorkflowData.filter(workflow =>
    workflow.name.toLowerCase().includes(searchTerm) ||
    workflow.description.toLowerCase().includes(searchTerm) ||
    workflow.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
    workflow.integrations.some(integration => integration.toLowerCase().includes(searchTerm))
  );
}

// Statistics
export const realWorkflowStats = {
  totalWorkflows: realWorkflowData.length,
  totalIntegrations: [...new Set(realWorkflowData.flatMap(w => w.integrations))].length,
  categories: getAllRealCategories().length,
  averageSetupTime: Math.round(
    realWorkflowData.reduce((acc, w) => acc + parseInt(w.setupTime), 0) / realWorkflowData.length
  )
};