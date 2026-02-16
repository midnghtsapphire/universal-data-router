/**
 * API service layer — handles all backend communication.
 * Universal Data Router by GlowStarLabs.
 */
import axios, { AxiosInstance } from 'axios';
import type {
  TokenResponse,
  Source,
  FileItem,
  FileSearchQuery,
  RoutingRule,
  DashboardStats,
  Subscription,
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE,
      headers: { 'Content-Type': 'application/json' },
    });

    // Attach auth token to every request
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Handle 401 — refresh token or redirect to login
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          const refreshToken = localStorage.getItem('refresh_token');
          if (refreshToken) {
            try {
              const { data } = await axios.post(`${API_BASE}/auth/refresh`, {
                refresh_token: refreshToken,
              });
              localStorage.setItem('access_token', data.access_token);
              localStorage.setItem('refresh_token', data.refresh_token);
              error.config.headers.Authorization = `Bearer ${data.access_token}`;
              return this.client(error.config);
            } catch {
              this.logout();
            }
          } else {
            this.logout();
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // ── Auth ────────────────────────────────────────────────────

  async register(email: string, password: string, displayName?: string): Promise<TokenResponse> {
    const { data } = await this.client.post('/auth/register', {
      email,
      password,
      display_name: displayName,
    });
    this.setTokens(data);
    return data;
  }

  async login(email: string, password: string): Promise<TokenResponse> {
    const { data } = await this.client.post('/auth/login', { email, password });
    this.setTokens(data);
    return data;
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    window.location.hash = '#/login';
    window.location.reload();
  }

  getGoogleAuthUrl(): string {
    return `${API_BASE}/auth/google`;
  }

  getGitHubAuthUrl(): string {
    return `${API_BASE}/auth/github`;
  }

  private setTokens(data: TokenResponse) {
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    localStorage.setItem('user', JSON.stringify(data.user));
  }

  // ── Sources ─────────────────────────────────────────────────

  async getSources(): Promise<Source[]> {
    const { data } = await this.client.get('/sources/');
    return data;
  }

  async createSource(source: { source_type: string; display_name: string; root_path?: string }): Promise<Source> {
    const { data } = await this.client.post('/sources/', source);
    return data;
  }

  async deleteSource(sourceId: string): Promise<void> {
    await this.client.delete(`/sources/${sourceId}`);
  }

  async scanSource(sourceId: string): Promise<{ task_id: string }> {
    const { data } = await this.client.post(`/sources/${sourceId}/scan`);
    return data;
  }

  async syncSource(sourceId: string): Promise<{ task_id: string }> {
    const { data } = await this.client.post(`/sources/${sourceId}/sync`);
    return data;
  }

  // ── Files ───────────────────────────────────────────────────

  async getFiles(params?: Record<string, string | number | boolean>): Promise<FileItem[]> {
    const { data } = await this.client.get('/files/', { params });
    return data;
  }

  async searchFiles(query: FileSearchQuery): Promise<FileItem[]> {
    const { data } = await this.client.post('/files/search', query);
    return data;
  }

  async categorizeFiles(fileIds: string[]): Promise<{ task_id: string }> {
    const { data } = await this.client.post('/files/categorize', { file_ids: fileIds });
    return data;
  }

  async runDeduplication(): Promise<{ task_id: string }> {
    const { data } = await this.client.post('/files/deduplicate');
    return data;
  }

  async getDuplicates(): Promise<{ duplicates: any[]; total_groups: number }> {
    const { data } = await this.client.get('/files/duplicates');
    return data;
  }

  async getConversions(): Promise<Record<string, string[]>> {
    const { data } = await this.client.get('/files/conversions');
    return data.conversions;
  }

  // ── Rules ───────────────────────────────────────────────────

  async getRules(): Promise<RoutingRule[]> {
    const { data } = await this.client.get('/rules/');
    return data;
  }

  async createRule(rule: Partial<RoutingRule>): Promise<RoutingRule> {
    const { data } = await this.client.post('/rules/', rule);
    return data;
  }

  async updateRule(ruleId: string, updates: Partial<RoutingRule>): Promise<RoutingRule> {
    const { data } = await this.client.patch(`/rules/${ruleId}`, updates);
    return data;
  }

  async deleteRule(ruleId: string): Promise<void> {
    await this.client.delete(`/rules/${ruleId}`);
  }

  async suggestRules(): Promise<any[]> {
    const { data } = await this.client.post('/rules/suggest');
    return data.suggestions;
  }

  // ── Dashboard ───────────────────────────────────────────────

  async getDashboardStats(): Promise<DashboardStats> {
    const { data } = await this.client.get('/dashboard/stats');
    return data;
  }

  async getCarbonMetrics(): Promise<any> {
    const { data } = await this.client.get('/dashboard/carbon');
    return data;
  }

  // ── Billing ─────────────────────────────────────────────────

  async getSubscription(): Promise<Subscription> {
    const { data } = await this.client.get('/billing/subscription');
    return data;
  }

  async createCheckout(tier: string): Promise<{ session_id: string; url: string }> {
    const { data } = await this.client.post(`/billing/checkout?tier=${tier}`);
    return data;
  }

  async createPortal(): Promise<{ url: string }> {
    const { data } = await this.client.post('/billing/portal');
    return data;
  }
}

export const api = new ApiService();
export default api;
