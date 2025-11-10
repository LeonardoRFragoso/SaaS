export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  avatar?: string;
  organization?: Organization;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  language: string;
  timezone: string;
  email_verified: boolean;
  two_factor_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  email?: string;
  phone?: string;
  website?: string;
  industry: string;
  company_size?: string;
  plan: 'trial' | 'starter' | 'pro' | 'enterprise';
  trial_ends_at?: string;
  subscription_active: boolean;
  max_users: number;
  max_dashboards: number;
  max_datasources: number;
  max_ai_queries: number;
  user_count?: number;
  dashboard_count?: number;
  datasource_count?: number;
  created_at: string;
  updated_at: string;
}

export interface DataSource {
  id: string;
  name: string;
  source_type: 'google_sheets' | 'excel_online' | 'csv_upload' | 'xlsx_upload' | 'database' | 'api';
  connection_config: Record<string, any>;
  auto_sync: boolean;
  sync_frequency: 'manual' | 'hourly' | '6hours' | 'daily';
  last_synced_at?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Dashboard {
  id: string;
  name: string;
  description?: string;
  template: 'sales' | 'financial' | 'performance' | 'custom';
  config: Record<string, any>;
  datasources: DataSource[];
  is_public: boolean;
  created_at: string;
  updated_at: string;
  created_by?: User;
}

export interface Insight {
  id: string;
  insight_type: 'anomaly' | 'trend' | 'recommendation' | 'alert';
  title: string;
  description: string;
  ai_analysis?: string;
  data_context: Record<string, any>;
  is_read: boolean;
  is_important: boolean;
  created_at: string;
}

export interface Report {
  id: string;
  name: string;
  description?: string;
  dashboard: Dashboard;
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
  delivery_method: 'email' | 'whatsapp' | 'both';
  recipients: string[];
  is_active: boolean;
  last_sent_at?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  password_confirm: string;
  full_name: string;
  phone?: string;
  organization_name?: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}
