import { useState } from 'react';
import {
  GitBranch,
  Plus,
  Sparkles,
  Play,
  Pause,
  Trash2,
  ChevronDown,
  ChevronUp,
  Zap,
  X,
} from 'lucide-react';
import type { RoutingRule } from '../types';

const demoRules: RoutingRule[] = [
  { id: '1', name: 'Sort PDFs to Documents', description: 'Automatically categorize all PDF files as Documents', is_active: true, priority: 10, conditions: '{"match_type":"all","rules":[{"field":"file_extension","operator":"eq","value":".pdf"}]}', actions: '{"actions":[{"type":"categorize","category":"Documents"}]}', rule_type: 'manual', times_triggered: 342, last_triggered_at: '2026-02-15T08:30:00Z', created_at: '2026-01-15T00:00:00Z' },
  { id: '2', name: 'Route Code to GitHub Backup', description: 'Copy all code files to GitHub backup repository', is_active: true, priority: 8, conditions: '{"match_type":"any","rules":[{"field":"file_extension","operator":"in","value":[".py",".js",".ts",".tsx"]}]}', actions: '{"actions":[{"type":"copy","destination_source_id":"github-backup"}]}', rule_type: 'manual', times_triggered: 156, last_triggered_at: '2026-02-14T22:00:00Z', created_at: '2026-01-20T00:00:00Z' },
  { id: '3', name: 'AI: Invoice Detection', description: 'AI-learned rule: detect invoices and tag for accounting', is_active: true, priority: 5, conditions: '{"match_type":"ai","rules":[{"field":"ai_category","operator":"eq","value":"Invoice"}]}', actions: '{"actions":[{"type":"categorize","category":"Finance"},{"type":"tag","tags":["invoice","accounting"]}]}', rule_type: 'ai_learned', times_triggered: 28, last_triggered_at: '2026-02-13T15:00:00Z', created_at: '2026-02-01T00:00:00Z' },
  { id: '4', name: 'Archive Old Files', description: 'Archive files not modified in 90 days', is_active: false, priority: 1, conditions: '{"match_type":"all","rules":[{"field":"file_modified_at","operator":"older_than","value":"90d"}]}', actions: '{"actions":[{"type":"archive"}]}', rule_type: 'manual', times_triggered: 0, last_triggered_at: null, created_at: '2026-02-10T00:00:00Z' },
];

const conditionFields = [
  { value: 'file_extension', label: 'File Extension' },
  { value: 'filename', label: 'Filename' },
  { value: 'file_path', label: 'File Path' },
  { value: 'mime_type', label: 'MIME Type' },
  { value: 'size_bytes', label: 'File Size' },
  { value: 'ai_category', label: 'AI Category' },
  { value: 'source_type', label: 'Source Type' },
  { value: 'file_modified_at', label: 'Modified Date' },
];

const operators = [
  { value: 'eq', label: 'equals' },
  { value: 'neq', label: 'not equals' },
  { value: 'contains', label: 'contains' },
  { value: 'starts_with', label: 'starts with' },
  { value: 'ends_with', label: 'ends with' },
  { value: 'in', label: 'is one of' },
  { value: 'gt', label: 'greater than' },
  { value: 'lt', label: 'less than' },
  { value: 'older_than', label: 'older than' },
];

const actionTypes = [
  { value: 'categorize', label: 'Categorize' },
  { value: 'tag', label: 'Add Tags' },
  { value: 'move', label: 'Move to' },
  { value: 'copy', label: 'Copy to' },
  { value: 'convert', label: 'Convert Format' },
  { value: 'archive', label: 'Archive' },
  { value: 'delete', label: 'Delete' },
];

export default function RulesPage() {
  const [rules] = useState<RoutingRule[]>(demoRules);
  const [expandedRule, setExpandedRule] = useState<string | null>(null);
  const [builderOpen, setBuilderOpen] = useState(false);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-earth-100 flex items-center gap-2">
            <GitBranch className="w-6 h-6 text-gold-400" aria-hidden="true" />
            Routing Rules
          </h1>
          <p className="text-sm text-charcoal-300 mt-1">
            Define how files are automatically organized and routed
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-secondary flex items-center gap-2 text-sm" aria-label="Get AI-suggested rules">
            <Sparkles className="w-4 h-4" aria-hidden="true" />
            AI Suggest
          </button>
          <button
            onClick={() => setBuilderOpen(true)}
            className="btn-primary flex items-center gap-2 text-sm"
            aria-label="Create a new routing rule"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            New Rule
          </button>
        </div>
      </div>

      {/* Rules list */}
      <div className="space-y-3">
        {rules.map((rule) => {
          const isExpanded = expandedRule === rule.id;
          return (
            <div key={rule.id} className="glass-panel overflow-hidden" role="region" aria-label={`Rule: ${rule.name}`}>
              <div
                className="p-4 flex items-center gap-4 cursor-pointer hover:bg-charcoal-800/20 transition-colors"
                onClick={() => setExpandedRule(isExpanded ? null : rule.id)}
                role="button"
                aria-expanded={isExpanded}
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setExpandedRule(isExpanded ? null : rule.id); }}}
              >
                {/* Priority indicator */}
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{
                    background: rule.priority >= 8 ? 'rgba(168,56,48,0.2)' : rule.priority >= 4 ? 'rgba(184,148,32,0.2)' : 'rgba(45,125,45,0.2)',
                    color: rule.priority >= 8 ? '#d4736a' : rule.priority >= 4 ? '#e8c84d' : '#6fb36f',
                  }}
                  aria-label={`Priority: ${rule.priority}`}
                >
                  {rule.priority}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-earth-200">{rule.name}</h3>
                    {rule.rule_type === 'ai_learned' && (
                      <span className="badge-warning flex items-center gap-1">
                        <Sparkles className="w-3 h-3" aria-hidden="true" />
                        AI
                      </span>
                    )}
                  </div>
                  {rule.description && (
                    <p className="text-xs text-charcoal-400 mt-0.5 truncate">{rule.description}</p>
                  )}
                </div>

                <div className="hidden sm:flex items-center gap-4 text-xs text-charcoal-400">
                  <span className="flex items-center gap-1">
                    <Zap className="w-3 h-3" aria-hidden="true" />
                    {rule.times_triggered} triggers
                  </span>
                </div>

                <button
                  onClick={(e) => { e.stopPropagation(); }}
                  className={`p-1.5 rounded-lg transition-colors ${
                    rule.is_active ? 'text-forest-400 hover:bg-forest-500/10' : 'text-charcoal-500 hover:bg-charcoal-800/40'
                  }`}
                  aria-label={rule.is_active ? `Pause rule: ${rule.name}` : `Activate rule: ${rule.name}`}
                >
                  {rule.is_active ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                </button>

                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-charcoal-400" aria-hidden="true" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-charcoal-400" aria-hidden="true" />
                )}
              </div>

              {isExpanded && (
                <div className="px-4 pb-4 border-t border-charcoal-800/30 pt-4 animate-slide-up">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-xs font-medium text-charcoal-400 uppercase tracking-wider mb-2">Conditions</h4>
                      <pre className="text-xs text-earth-300 bg-charcoal-900/40 p-3 rounded-lg overflow-x-auto font-mono">
                        {JSON.stringify(JSON.parse(rule.conditions), null, 2)}
                      </pre>
                    </div>
                    <div>
                      <h4 className="text-xs font-medium text-charcoal-400 uppercase tracking-wider mb-2">Actions</h4>
                      <pre className="text-xs text-earth-300 bg-charcoal-900/40 p-3 rounded-lg overflow-x-auto font-mono">
                        {JSON.stringify(JSON.parse(rule.actions), null, 2)}
                      </pre>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-charcoal-800/20">
                    <span className="text-xs text-charcoal-500">
                      Created: {new Date(rule.created_at).toLocaleDateString()}
                      {rule.last_triggered_at && ` · Last triggered: ${new Date(rule.last_triggered_at).toLocaleString()}`}
                    </span>
                    <button className="btn-danger flex items-center gap-1.5 text-xs" aria-label={`Delete rule: ${rule.name}`}>
                      <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Rule Builder Modal */}
      {builderOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)' }}
          role="dialog"
          aria-modal="true"
          aria-label="Create new routing rule"
        >
          <div className="glass-panel w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-earth-100">Create Routing Rule</h2>
              <button
                onClick={() => setBuilderOpen(false)}
                className="p-2 rounded-lg text-charcoal-400 hover:text-earth-200 hover:bg-charcoal-800/40"
                aria-label="Close rule builder"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <div className="space-y-5">
              {/* Name */}
              <div>
                <label htmlFor="rule-name" className="block text-sm font-medium text-charcoal-200 mb-1">Rule Name</label>
                <input id="rule-name" type="text" className="input-field" placeholder="e.g., Sort invoices to Finance" />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="rule-desc" className="block text-sm font-medium text-charcoal-200 mb-1">Description (optional)</label>
                <input id="rule-desc" type="text" className="input-field" placeholder="What this rule does" />
              </div>

              {/* Priority */}
              <div>
                <label htmlFor="rule-priority" className="block text-sm font-medium text-charcoal-200 mb-1">Priority (1-10, higher = runs first)</label>
                <input id="rule-priority" type="number" className="input-field" min={1} max={10} defaultValue={5} />
              </div>

              {/* Conditions */}
              <div>
                <h3 className="text-sm font-medium text-charcoal-200 mb-2">Conditions</h3>
                <div className="space-y-2 p-4 rounded-xl bg-charcoal-900/30">
                  <div className="flex items-center gap-2 flex-wrap">
                    <select className="input-field text-sm w-auto" aria-label="Condition field">
                      {conditionFields.map((f) => (
                        <option key={f.value} value={f.value}>{f.label}</option>
                      ))}
                    </select>
                    <select className="input-field text-sm w-auto" aria-label="Condition operator">
                      {operators.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                    <input type="text" className="input-field text-sm flex-1" placeholder="Value" aria-label="Condition value" />
                  </div>
                  <button className="text-xs text-gold-400 hover:text-gold-300 flex items-center gap-1" aria-label="Add another condition">
                    <Plus className="w-3 h-3" aria-hidden="true" /> Add condition
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div>
                <h3 className="text-sm font-medium text-charcoal-200 mb-2">Actions</h3>
                <div className="space-y-2 p-4 rounded-xl bg-charcoal-900/30">
                  <div className="flex items-center gap-2 flex-wrap">
                    <select className="input-field text-sm w-auto" aria-label="Action type">
                      {actionTypes.map((a) => (
                        <option key={a.value} value={a.value}>{a.label}</option>
                      ))}
                    </select>
                    <input type="text" className="input-field text-sm flex-1" placeholder="Target value" aria-label="Action target" />
                  </div>
                  <button className="text-xs text-gold-400 hover:text-gold-300 flex items-center gap-1" aria-label="Add another action">
                    <Plus className="w-3 h-3" aria-hidden="true" /> Add action
                  </button>
                </div>
              </div>

              {/* Clear next action — neurodivergent-friendly */}
              <div className="p-4 rounded-xl border border-gold-800/30 bg-gold-950/20">
                <p className="text-sm text-gold-300 font-medium">Next step:</p>
                <p className="text-xs text-gold-400 mt-1">
                  Review your conditions and actions above, then click "Create Rule" to save. The rule will immediately start processing new files.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button onClick={() => setBuilderOpen(false)} className="btn-secondary flex-1">Cancel</button>
                <button onClick={() => setBuilderOpen(false)} className="btn-primary flex-1">Create Rule</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
