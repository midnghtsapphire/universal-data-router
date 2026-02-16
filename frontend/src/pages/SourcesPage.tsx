import { useState } from 'react';
import {
  Plug,
  Plus,
  RefreshCw,
  Trash2,
  Cloud,
  Github,
  Mail,
  HardDrive,
  FolderOpen,
  CheckCircle,
  AlertCircle,
  Loader,
  X,
} from 'lucide-react';
import type { Source, SourceType } from '../types';

const sourceConfig: Record<SourceType, { icon: any; label: string; description: string; color: string }> = {
  google_drive: { icon: Cloud, label: 'Google Drive', description: 'Connect your Google Drive files and folders', color: '#4a9a4a' },
  gmail: { icon: Mail, label: 'Gmail', description: 'Index email attachments from Gmail', color: '#c49a52' },
  github: { icon: Github, label: 'GitHub', description: 'Connect repositories and code files', color: '#8f8575' },
  dropbox: { icon: FolderOpen, label: 'Dropbox', description: 'Sync files from your Dropbox account', color: '#6fb36f' },
  local: { icon: HardDrive, label: 'Local Files', description: 'Monitor a local directory on your machine', color: '#d4b87a' },
};

const statusConfig = {
  connected: { icon: CheckCircle, label: 'Connected', className: 'badge-success' },
  disconnected: { icon: AlertCircle, label: 'Disconnected', className: 'badge-error' },
  syncing: { icon: Loader, label: 'Syncing', className: 'badge-warning' },
  error: { icon: AlertCircle, label: 'Error', className: 'badge-error' },
};

// Demo sources
const demoSources: Source[] = [
  { id: '1', source_type: 'google_drive', display_name: 'My Google Drive', status: 'connected', root_path: '/', last_sync_at: '2026-02-15T08:30:00Z', total_files: '523', total_size_bytes: '3200000000', is_active: true, created_at: '2026-01-01T00:00:00Z' },
  { id: '2', source_type: 'github', display_name: 'GitHub Repos', status: 'connected', root_path: null, last_sync_at: '2026-02-14T22:00:00Z', total_files: '312', total_size_bytes: '1800000000', is_active: true, created_at: '2026-01-05T00:00:00Z' },
  { id: '3', source_type: 'gmail', display_name: 'Work Gmail', status: 'syncing', root_path: null, last_sync_at: '2026-02-15T09:00:00Z', total_files: '198', total_size_bytes: '1547321856', is_active: true, created_at: '2026-01-10T00:00:00Z' },
];

function formatBytes(bytes: string | number): string {
  const b = typeof bytes === 'string' ? parseInt(bytes) : bytes;
  if (b === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(b) / Math.log(k));
  return parseFloat((b / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export default function SourcesPage() {
  const [sources] = useState<Source[]>(demoSources);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(0);
  const [selectedType, setSelectedType] = useState<SourceType | null>(null);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-earth-100 flex items-center gap-2">
            <Plug className="w-6 h-6 text-gold-400" aria-hidden="true" />
            Connected Sources
          </h1>
          <p className="text-sm text-charcoal-300 mt-1">
            Manage your data sources and sync settings
          </p>
        </div>
        <button
          onClick={() => { setWizardOpen(true); setWizardStep(0); setSelectedType(null); }}
          className="btn-primary flex items-center gap-2 text-sm"
          aria-label="Connect a new data source"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          Connect Source
        </button>
      </div>

      {/* Source cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sources.map((source) => {
          const config = sourceConfig[source.source_type];
          const status = statusConfig[source.status];
          const StatusIcon = status.icon;
          return (
            <div key={source.id} className="glass-panel p-5" role="region" aria-label={`${config.label} source`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="p-2.5 rounded-xl"
                    style={{ background: `${config.color}20` }}
                    aria-hidden="true"
                  >
                    <config.icon className="w-5 h-5" style={{ color: config.color }} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-earth-200">{source.display_name}</h3>
                    <p className="text-xs text-charcoal-400">{config.label}</p>
                  </div>
                </div>
                <span className={status.className} role="status">
                  <StatusIcon className={`w-3 h-3 inline mr-1 ${source.status === 'syncing' ? 'animate-spin' : ''}`} aria-hidden="true" />
                  {status.label}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="p-2.5 rounded-lg bg-charcoal-900/30">
                  <p className="text-xs text-charcoal-400">Files</p>
                  <p className="text-sm font-bold text-earth-200">{parseInt(source.total_files).toLocaleString()}</p>
                </div>
                <div className="p-2.5 rounded-lg bg-charcoal-900/30">
                  <p className="text-xs text-charcoal-400">Size</p>
                  <p className="text-sm font-bold text-earth-200">{formatBytes(source.total_size_bytes)}</p>
                </div>
              </div>

              {source.last_sync_at && (
                <p className="text-xs text-charcoal-500 mt-3">
                  Last synced: {new Date(source.last_sync_at).toLocaleString()}
                </p>
              )}

              <div className="mt-4 flex items-center gap-2">
                <button
                  className="btn-secondary flex items-center gap-1.5 text-xs flex-1"
                  aria-label={`Sync ${source.display_name}`}
                >
                  <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
                  Sync Now
                </button>
                <button
                  className="btn-danger flex items-center gap-1.5 text-xs"
                  aria-label={`Disconnect ${source.display_name}`}
                >
                  <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Connection Wizard Modal */}
      {wizardOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)' }}
          role="dialog"
          aria-modal="true"
          aria-label="Connect new data source wizard"
        >
          <div className="glass-panel w-full max-w-lg p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-earth-100">Connect a Source</h2>
                <p className="text-xs text-charcoal-400 mt-1">
                  Step {wizardStep + 1} of 3 — {wizardStep === 0 ? 'Choose source type' : wizardStep === 1 ? 'Configure' : 'Confirm'}
                </p>
              </div>
              <button
                onClick={() => setWizardOpen(false)}
                className="p-2 rounded-lg text-charcoal-400 hover:text-earth-200 hover:bg-charcoal-800/40"
                aria-label="Close wizard"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            {/* Progress indicator — neurodivergent-friendly */}
            <div className="flex items-center gap-2 mb-6" role="progressbar" aria-valuenow={wizardStep + 1} aria-valuemin={1} aria-valuemax={3} aria-label="Wizard progress">
              {[0, 1, 2].map((step) => (
                <div key={step} className="flex-1">
                  <div className={`h-1.5 rounded-full transition-all duration-300 ${
                    step <= wizardStep ? 'bg-gold-500' : 'bg-charcoal-700/40'
                  }`} />
                  <p className={`text-[10px] mt-1 ${step <= wizardStep ? 'text-gold-400' : 'text-charcoal-500'}`}>
                    {step === 0 ? 'Select' : step === 1 ? 'Configure' : 'Connect'}
                  </p>
                </div>
              ))}
            </div>

            {/* Step 0: Choose source */}
            {wizardStep === 0 && (
              <div className="space-y-3">
                {(Object.entries(sourceConfig) as [SourceType, typeof sourceConfig[SourceType]][]).map(([type, config]) => (
                  <button
                    key={type}
                    onClick={() => { setSelectedType(type); setWizardStep(1); }}
                    className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all text-left ${
                      selectedType === type
                        ? 'border-gold-500/50 bg-gold-500/10'
                        : 'border-charcoal-700/20 hover:bg-charcoal-800/30'
                    }`}
                    style={{ border: '1px solid' }}
                    aria-label={`Select ${config.label}: ${config.description}`}
                  >
                    <div className="p-2 rounded-lg" style={{ background: `${config.color}20` }} aria-hidden="true">
                      <config.icon className="w-5 h-5" style={{ color: config.color }} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-earth-200">{config.label}</p>
                      <p className="text-xs text-charcoal-400">{config.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Step 1: Configure */}
            {wizardStep === 1 && selectedType && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="source-name" className="block text-sm font-medium text-charcoal-200 mb-1">
                    Display Name
                  </label>
                  <input
                    id="source-name"
                    type="text"
                    className="input-field"
                    placeholder={`My ${sourceConfig[selectedType].label}`}
                    defaultValue={`My ${sourceConfig[selectedType].label}`}
                  />
                </div>
                {selectedType === 'local' && (
                  <div>
                    <label htmlFor="root-path" className="block text-sm font-medium text-charcoal-200 mb-1">
                      Root Directory Path
                    </label>
                    <input
                      id="root-path"
                      type="text"
                      className="input-field"
                      placeholder="/home/user/documents"
                    />
                  </div>
                )}
                {(selectedType === 'google_drive' || selectedType === 'gmail') && (
                  <div className="p-4 rounded-xl border border-gold-800/30 bg-gold-950/20">
                    <p className="text-sm text-gold-300">
                      You'll be redirected to Google to authorize access. We only request read permissions.
                    </p>
                  </div>
                )}
                {selectedType === 'github' && (
                  <div className="p-4 rounded-xl border border-forest-800/30 bg-forest-950/20">
                    <p className="text-sm text-forest-300">
                      You'll be redirected to GitHub to authorize repository access.
                    </p>
                  </div>
                )}
                <div className="flex items-center gap-3 pt-2">
                  <button onClick={() => setWizardStep(0)} className="btn-secondary flex-1">Back</button>
                  <button onClick={() => setWizardStep(2)} className="btn-primary flex-1">Next</button>
                </div>
              </div>
            )}

            {/* Step 2: Confirm */}
            {wizardStep === 2 && selectedType && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-charcoal-900/40 space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-forest-500" aria-hidden="true" />
                    <span className="text-sm text-earth-200">Source type: {sourceConfig[selectedType].label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-forest-500" aria-hidden="true" />
                    <span className="text-sm text-earth-200">Initial scan will run after connection</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-forest-500" aria-hidden="true" />
                    <span className="text-sm text-earth-200">AI categorization will process new files</span>
                  </div>
                </div>
                <p className="text-xs text-charcoal-400">
                  Next action: Click "Connect" to authorize and begin scanning your files.
                </p>
                <div className="flex items-center gap-3">
                  <button onClick={() => setWizardStep(1)} className="btn-secondary flex-1">Back</button>
                  <button
                    onClick={() => setWizardOpen(false)}
                    className="btn-primary flex-1"
                    aria-label="Connect and start scanning"
                  >
                    Connect
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
