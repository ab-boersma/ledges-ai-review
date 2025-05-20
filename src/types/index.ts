
// Core data types for LEDES invoice processing application

export type LEDESFormat = '1998B' | '2.0' | '2.1';

export interface Invoice {
  id: string;
  vendor_id: string;
  client_matter_id: string;
  invoice_number: string;
  invoice_date: string;
  total_original: number;
  total_adjusted: number;
  status: 'pending' | 'reviewed' | 'approved' | 'rejected';
  created_at: string;
  format: LEDESFormat;
  line_items?: LineItem[];
}

export interface LineItem {
  id: string;
  invoice_id: string;
  ledes_row_num: number;
  task_code: string;
  activity_code: string;
  expense_code: string | null;
  hours: number;
  rate: number;
  amount: number;
  narrative: string;
  tax: number;
  status: 'pending' | 'approved' | 'adjusted' | 'rejected';
  ai_score: number | null;
  ai_action: 'approve' | 'adjust' | 'reject' | null;
  adjusted_hours: number | null;
  adjusted_rate: number | null;
  adjusted_amount: number | null;
  reviewer_comment: string | null;
  timekeeper_id: string;
  timekeeper_name: string;
  timekeeper_classification: string;
  service_date: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'reviewer' | 'viewer';
}

export interface PolicyRule {
  id: string;
  name: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  params: Record<string, any>;
  active: boolean;
}

export interface AuditTrailEntry {
  id: string;
  user_id: string;
  entity: 'invoice' | 'line_item';
  entity_id: string;
  field: string;
  old_value: string;
  new_value: string;
  timestamp: string;
}

export interface ComplianceIssue {
  rule_id: string;
  rule_name: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
}

export interface ComplianceResult {
  line_item_id: string;
  score: number;
  issues: ComplianceIssue[];
  recommended_action: 'approve' | 'adjust' | 'reject';
}

export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  key: string;
  direction: SortDirection;
}

export interface FilterConfig {
  key: string;
  value: string | number | boolean;
  operator: 'eq' | 'neq' | 'gt' | 'lt' | 'gte' | 'lte' | 'contains';
}

export interface PaginationConfig {
  page: number;
  pageSize: number;
  total: number;
}
