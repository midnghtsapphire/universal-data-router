import { useEffect, useState } from 'react';
import {
  Files,
  Plug,
  HardDrive,
  Copy,
  GitBranch,
  Sparkles,
  Leaf,
  TrendingUp,
  Activity,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import type { DashboardStats } from '../types';
import api from '../services/api';

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function StatCard({
  icon: Icon,
  label,
  value,
  subtext,
  color,
}: {
  icon: any;
  label: string;
  value: string | number;
  subtext?: string;
  color: string;
}) {
  return (
    <div className="glass-card p-5 animate-slide-up" role="region" aria-label={label}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-charcoal-300 uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-bold mt-1 text-earth-100">{value}</p>
          {subtext && <p className="text-xs text-charcoal-400 mt-1">{subtext}</p>}
        </div>
        <div
          className="p-2.5 rounded-xl"
          style={{ background: `${color}20` }}
          aria-hidden="true"
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
      </div>
    </div>
  );
}

// Demo data for initial display
const demoStats: DashboardStats = {
  total_files: 1247,
  total_sources: 4,
  total_size_bytes: 8_547_321_856,
  total_duplicates: 23,
  total_categories: 12,
  active_rules: 8,
  storage_breakdown: [
    { source_type: 'google_drive', source_name: 'Google Drive', total_files: 523, total_size_bytes: 3_200_000_000, percentage: 37.4 },
    { source_type: 'github', source_name: 'GitHub Repos', total_files: 312, total_size_bytes: 1_800_000_000, percentage: 21.1 },
    { source_type: 'gmail', source_name: 'Gmail', total_files: 198, total_size_bytes: 1_547_321_856, percentage: 18.1 },
    { source_type: 'dropbox', source_name: 'Dropbox', total_files: 134, total_size_bytes: 1_200_000_000, percentage: 14.0 },
    { source_type: 'local', source_name: 'Local Files', total_files: 80, total_size_bytes: 800_000_000, percentage: 9.4 },
  ],
  category_breakdown: [
    { category_name: 'Documents', category_color: '#8B4513', file_count: 342, percentage: 27.4 },
    { category_name: 'Code', category_color: '#CD853F', file_count: 287, percentage: 23.0 },
    { category_name: 'Images', category_color: '#DAA520', file_count: 198, percentage: 15.9 },
    { category_name: 'Spreadsheets', category_color: '#2E8B57', file_count: 134, percentage: 10.7 },
    { category_name: 'Communication', category_color: '#A0522D', file_count: 112, percentage: 9.0 },
    { category_name: 'Other', category_color: '#808080', file_count: 174, percentage: 13.9 },
  ],
  recent_activity: [
    { id: '1', operation: 'scan', status: 'completed', message: 'Google Drive scan complete', files_processed: 523, created_at: new Date().toISOString() },
    { id: '2', operation: 'categorize', status: 'completed', message: 'AI categorized 45 new files', files_processed: 45, created_at: new Date(Date.now() - 3600000).toISOString() },
    { id: '3', operation: 'deduplicate', status: 'completed', message: 'Found 3 duplicate groups', files_processed: 1247, created_at: new Date(Date.now() - 7200000).toISOString() },
  ],
  carbon_metrics: {
    total_api_calls: 342,
    total_processing_seconds: 128.5,
    total_bytes_transferred_mb: 45.2,
    estimated_co2_grams: 0.0234,
    trees_equivalent_offset: 0.000001,
    last_reset: new Date().toISOString(),
  },
  subscription_tier: 'pro',
  ai_calls_remaining: 455,
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>(demoStats);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await api.getDashboardStats();
        setStats(data);
      } catch {
        // Use demo data on error
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const pieColors = stats.category_breakdown.map((c) => c.category_color);

  return (
    <div className="space-y-6 max-w-7xl mx-auto" role="region" aria-label="Dashboard overview">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-earth-100">Dashboard</h1>
          <p className="text-sm text-charcoal-300 mt-1">
            Your file organization overview — all sources at a glance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="badge-success" role="status">
            {stats.subscription_tier.toUpperCase()} Plan
          </span>
          <span className="badge-info" role="status" aria-label={`${stats.ai_calls_remaining} AI calls remaining`}>
            <Sparkles className="w-3 h-3 inline mr-1" aria-hidden="true" />
            {stats.ai_calls_remaining} AI calls left
          </span>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard icon={Files} label="Total Files" value={stats.total_files.toLocaleString()} color="#d4ad2e" />
        <StatCard icon={Plug} label="Sources" value={stats.total_sources} color="#2d7d2d" />
        <StatCard icon={HardDrive} label="Storage" value={formatBytes(stats.total_size_bytes)} color="#c49a52" />
        <StatCard icon={Copy} label="Duplicates" value={stats.total_duplicates} subtext="detected" color="#a83830" />
        <StatCard icon={GitBranch} label="Active Rules" value={stats.active_rules} color="#6fb36f" />
        <StatCard icon={TrendingUp} label="Categories" value={stats.total_categories} color="#e8c84d" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Storage by source */}
        <div className="glass-panel p-6" role="region" aria-label="Storage distribution by source">
          <h2 className="text-lg font-semibold text-earth-200 mb-4">Storage by Source</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.storage_breakdown} layout="vertical">
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="source_name"
                  width={120}
                  tick={{ fill: '#b8b0a3', fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(32,29,24,0.95)',
                    border: '1px solid rgba(184,176,163,0.15)',
                    borderRadius: '12px',
                    color: '#f5ead6',
                  }}
                  formatter={(value: number) => [formatBytes(value), 'Size']}
                />
                <Bar dataKey="total_size_bytes" fill="#d4ad2e" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* File categories */}
        <div className="glass-panel p-6" role="region" aria-label="File distribution by category">
          <h2 className="text-lg font-semibold text-earth-200 mb-4">File Categories</h2>
          <div className="flex items-center gap-6">
            <div className="h-52 w-52 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.category_breakdown}
                    dataKey="file_count"
                    nameKey="category_name"
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={2}
                  >
                    {stats.category_breakdown.map((entry, index) => (
                      <Cell key={entry.category_name} fill={pieColors[index]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(32,29,24,0.95)',
                      border: '1px solid rgba(184,176,163,0.15)',
                      borderRadius: '12px',
                      color: '#f5ead6',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 flex-1">
              {stats.category_breakdown.map((cat) => (
                <div key={cat.category_name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ background: cat.category_color }}
                    aria-hidden="true"
                  />
                  <span className="text-sm text-charcoal-200 flex-1">{cat.category_name}</span>
                  <span className="text-xs text-charcoal-400">{cat.file_count}</span>
                  <span className="text-xs text-charcoal-500">{cat.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent activity */}
        <div className="glass-panel p-6" role="region" aria-label="Recent activity log">
          <h2 className="text-lg font-semibold text-earth-200 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-gold-400" aria-hidden="true" />
            Recent Activity
          </h2>
          <div className="space-y-3" role="list" aria-label="Activity items">
            {stats.recent_activity.length === 0 ? (
              <p className="text-sm text-charcoal-400 text-center py-8">
                No recent activity. Connect a source to get started.
              </p>
            ) : (
              stats.recent_activity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-charcoal-900/30"
                  role="listitem"
                >
                  <div
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      activity.status === 'completed'
                        ? 'bg-forest-500'
                        : activity.status === 'running'
                        ? 'bg-gold-500 animate-pulse'
                        : 'bg-ember-500'
                    }`}
                    aria-label={`Status: ${activity.status}`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-earth-200 truncate">{activity.message}</p>
                    <p className="text-xs text-charcoal-400">
                      {activity.files_processed} files processed
                    </p>
                  </div>
                  <span className="text-xs text-charcoal-500 flex-shrink-0">
                    {new Date(activity.created_at).toLocaleTimeString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Carbon footprint */}
        <div className="glass-panel p-6" role="region" aria-label="Carbon footprint tracking">
          <h2 className="text-lg font-semibold text-earth-200 mb-4 flex items-center gap-2">
            <Leaf className="w-5 h-5 text-forest-500" aria-hidden="true" />
            Eco Tracker
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-xl bg-charcoal-900/30">
                <p className="text-xs text-charcoal-400">API Calls</p>
                <p className="text-lg font-bold text-earth-200">
                  {stats.carbon_metrics.total_api_calls}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-charcoal-900/30">
                <p className="text-xs text-charcoal-400">Processing Time</p>
                <p className="text-lg font-bold text-earth-200">
                  {stats.carbon_metrics.total_processing_seconds.toFixed(1)}s
                </p>
              </div>
              <div className="p-3 rounded-xl bg-charcoal-900/30">
                <p className="text-xs text-charcoal-400">Data Transferred</p>
                <p className="text-lg font-bold text-earth-200">
                  {stats.carbon_metrics.total_bytes_transferred_mb.toFixed(1)} MB
                </p>
              </div>
              <div className="p-3 rounded-xl bg-charcoal-900/30">
                <p className="text-xs text-charcoal-400">Est. CO2</p>
                <p className="text-lg font-bold text-forest-400">
                  {stats.carbon_metrics.estimated_co2_grams.toFixed(4)}g
                </p>
              </div>
            </div>
            <div className="p-4 rounded-xl border border-forest-800/30 bg-forest-950/20">
              <p className="text-sm text-forest-300">
                Your data routing is carbon-efficient. This session's footprint is equivalent to{' '}
                <strong>{stats.carbon_metrics.trees_equivalent_offset.toFixed(6)}</strong> trees
                needed to offset.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
