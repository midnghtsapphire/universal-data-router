// ── User Types ───────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

// ── Source Types ─────────────────────────────────────────────

export type SourceType = 'gmail' | 'google_drive' | 'github' | 'dropbox' | 'local';
export type SourceStatus = 'connected' | 'disconnected' | 'syncing' | 'error';

export interface Source {
  id: string;
  source_type: SourceType;
  display_name: string;
  status: SourceStatus;
  root_path: string | null;
  last_sync_at: string | null;
  total_files: string;
  total_size_bytes: string;
  is_active: boolean;
  created_at: string;
}

// ── File Types ──────────────────────────────────────────────

export interface FileItem {
  id: string;
  source_id: string;
  category_id: string | null;
  filename: string;
  file_path: string;
  file_extension: string | null;
  mime_type: string | null;
  size_bytes: number;
  checksum_sha256: string | null;
  ai_category: string | null;
  ai_confidence: number | null;
  ai_tags: string | null;
  ai_summary: string | null;
  external_url: string | null;
  is_duplicate: boolean;
  is_archived: boolean;
  file_created_at: string | null;
  file_modified_at: string | null;
  indexed_at: string | null;
  created_at: string;
}

export interface FileSearchQuery {
  query: string;
  source_ids?: string[];
  category_ids?: string[];
  file_types?: string[];
  date_from?: string;
  date_to?: string;
  min_size?: number;
  max_size?: number;
  include_duplicates?: boolean;
  page?: number;
  per_page?: number;
}

// ── Rule Types ──────────────────────────────────────────────

export interface RoutingRule {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  priority: number;
  conditions: string;
  actions: string;
  rule_type: string;
  times_triggered: number;
  last_triggered_at: string | null;
  created_at: string;
}

export interface RuleCondition {
  field: string;
  operator: string;
  value: string | string[];
}

export interface RuleAction {
  type: string;
  category?: string;
  category_id?: string;
  destination_source_id?: string;
  destination_path?: string;
  tags?: string[];
  target_format?: string;
}

// ── Dashboard Types ─────────────────────────────────────────

export interface StorageBreakdown {
  source_type: string;
  source_name: string;
  total_files: number;
  total_size_bytes: number;
  percentage: number;
}

export interface CategoryBreakdown {
  category_name: string;
  category_color: string;
  file_count: number;
  percentage: number;
}

export interface ActivityItem {
  id: string;
  operation: string;
  status: string;
  message: string | null;
  files_processed: number;
  created_at: string;
}

export interface CarbonMetrics {
  total_api_calls: number;
  total_processing_seconds: number;
  total_bytes_transferred_mb: number;
  estimated_co2_grams: number;
  trees_equivalent_offset: number;
  last_reset: string;
}

export interface DashboardStats {
  total_files: number;
  total_sources: number;
  total_size_bytes: number;
  total_duplicates: number;
  total_categories: number;
  active_rules: number;
  storage_breakdown: StorageBreakdown[];
  category_breakdown: CategoryBreakdown[];
  recent_activity: ActivityItem[];
  carbon_metrics: CarbonMetrics;
  subscription_tier: string;
  ai_calls_remaining: number;
}

// ── Subscription Types ──────────────────────────────────────

export interface Subscription {
  id: string;
  tier: 'free' | 'pro' | 'enterprise';
  status: string;
  max_sources: number;
  max_files: number;
  max_rules: number;
  ai_categorizations_remaining: number;
  crossover_memory_enabled: boolean;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
}
