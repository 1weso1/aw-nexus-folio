export type WorkflowCategory = {
  id: "communication" | "marketing" | "crm" | "ai" | "dataOps";
  label: string;
  description: string;
  icon: string; // lucide icon name or emoji
  // match by tags first (lowercase, as stored in Supabase),
  // then by name keywords if tags are missing.
  tagFilters: string[];
  nameKeywords?: string[];
  // optional hero color token
  color?: string;
};

export const WORKFLOW_CATEGORIES: WorkflowCategory[] = [
  {
    id: "communication",
    label: "Communication & Messaging",
    description: "Multi-channel messaging, notifications, and support.",
    icon: "MessageSquare",
    tagFilters: ["slack", "telegram", "whatsapp", "gmail", "mailjet", "google"],
    nameKeywords: ["slack", "telegram", "whatsapp", "gmail", "mailjet", "discord", "sms"]
  },
  {
    id: "marketing",
    label: "Marketing Automation",
    description: "Email, social scheduling, lead nurturing, analytics.",
    icon: "Megaphone",
    tagFilters: ["gmail", "mailjet", "google", "sheets"],
    nameKeywords: ["campaign", "newsletter", "facebook", "linkedin", "twitter", "utm", "analytics"]
  },
  {
    id: "crm",
    label: "CRM & Sales Automation",
    description: "Leads, onboarding, deal tracking, pipeline ops.",
    icon: "TrendingUp",
    tagFilters: ["hubspot"],
    nameKeywords: ["hubspot", "salesforce", "pipedrive", "zoho", "close crm"]
  },
  {
    id: "ai",
    label: "AI-Powered Workflows",
    description: "OpenAI and LLM-driven automations.",
    icon: "Brain",
    tagFilters: ["openai"],
    nameKeywords: ["gpt", "openai", "ai", "llm"]
  },
  {
    id: "dataOps",
    label: "Data & Ops",
    description: "Sheets, Airtable, webhooks, Supabase, HTTP tasks.",
    icon: "Database",
    tagFilters: ["sheets", "airtable", "http", "webhook", "supabase", "google"],
    nameKeywords: ["sheet", "airtable", "http", "webhook", "supabase", "csv"]
  }
];

// Helper function to get category by ID
export function getCategoryById(id: string): WorkflowCategory | undefined {
  return WORKFLOW_CATEGORIES.find(cat => cat.id === id);
}

// Helper function to get all category IDs
export function getAllCategoryIds(): string[] {
  return WORKFLOW_CATEGORIES.map(cat => cat.id);
}