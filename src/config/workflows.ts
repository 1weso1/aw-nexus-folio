export const WORKFLOWS_REPO = process.env.NEXT_PUBLIC_WORKFLOWS_REPO ?? "Zie619/n8n-workflows";
export const WORKFLOWS_BRANCH = process.env.NEXT_PUBLIC_WORKFLOWS_BRANCH ?? "main";
export const WORKFLOWS_ROOT = process.env.NEXT_PUBLIC_WORKFLOWS_ROOT ?? ""; 
export const MANIFEST_URL = "/workflows/manifest.json";
export const PAGE_SIZE = 50;

export const GITHUB_API_BASE = "https://api.github.com";
export const GITHUB_RAW_BASE = "https://raw.githubusercontent.com";

// GitHub token for rate limiting (optional)
export const GITHUB_TOKEN = process.env.GITHUB_TOKEN || process.env.NEXT_PUBLIC_GH_TOKEN;