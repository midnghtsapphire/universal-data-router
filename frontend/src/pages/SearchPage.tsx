import { useState } from 'react';
import {
  Search,
  FileText,
  Image,
  Code,
  Music,
  Video,
  Table,
  Archive,
  SlidersHorizontal,
  X,
  Sparkles,
} from 'lucide-react';
import type { FileItem } from '../types';

function getFileIcon(extension: string | null) {
  const ext = (extension || '').toLowerCase().replace('.', '');
  const map: Record<string, any> = {
    pdf: FileText, doc: FileText, docx: FileText, txt: FileText, md: FileText,
    jpg: Image, jpeg: Image, png: Image, gif: Image, svg: Image,
    py: Code, js: Code, ts: Code, tsx: Code, html: Code, css: Code,
    mp3: Music, wav: Music, flac: Music,
    mp4: Video, avi: Video, mov: Video,
    zip: Archive, tar: Archive, gz: Archive,
    csv: Table, xlsx: Table, xls: Table,
  };
  return map[ext] || FileText;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

const demoResults: FileItem[] = [
  { id: '1', source_id: 's1', category_id: null, filename: 'Q4_Financial_Report.pdf', file_path: '/documents/reports/', file_extension: '.pdf', mime_type: 'application/pdf', size_bytes: 2457600, checksum_sha256: null, ai_category: 'Finance', ai_confidence: 0.94, ai_tags: '["finance","report","quarterly"]', ai_summary: 'Q4 2025 financial report with revenue analysis and projections for 2026', external_url: null, is_duplicate: false, is_archived: false, file_created_at: '2026-01-15T10:30:00Z', file_modified_at: '2026-02-01T14:22:00Z', indexed_at: '2026-02-10T08:00:00Z', created_at: '2026-02-10T08:00:00Z' },
  { id: '2', source_id: 's2', category_id: null, filename: 'budget_2026.xlsx', file_path: '/finance/', file_extension: '.xlsx', mime_type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', size_bytes: 1245000, checksum_sha256: null, ai_category: 'Finance', ai_confidence: 0.91, ai_tags: '["budget","finance","2026"]', ai_summary: 'Annual budget planning spreadsheet for fiscal year 2026', external_url: null, is_duplicate: false, is_archived: false, file_created_at: '2026-01-20T09:00:00Z', file_modified_at: '2026-02-10T16:00:00Z', indexed_at: '2026-02-11T08:00:00Z', created_at: '2026-02-11T08:00:00Z' },
];

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FileItem[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const handleSearch = () => {
    if (query.trim()) {
      setResults(demoResults);
      setHasSearched(true);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center pt-8">
        <h1 className="text-3xl font-bold text-gradient-gold">Smart Search</h1>
        <p className="text-sm text-charcoal-300 mt-2">
          Find any file across all your connected sources
        </p>
      </div>

      {/* Search bar */}
      <div className="glass-panel p-2">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-400" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
              className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-transparent text-earth-100 placeholder-charcoal-400 focus:outline-none text-lg"
              placeholder="Search files, content, tags..."
              aria-label="Search across all connected sources"
              autoFocus
            />
          </div>
          <button
            onClick={() => setAdvancedOpen(!advancedOpen)}
            className="p-3 rounded-xl text-charcoal-400 hover:text-earth-200 hover:bg-charcoal-800/40 transition-all"
            aria-label="Toggle advanced search options"
            aria-expanded={advancedOpen}
          >
            <SlidersHorizontal className="w-5 h-5" aria-hidden="true" />
          </button>
          <button
            onClick={handleSearch}
            className="btn-primary px-6 py-3"
            aria-label="Search"
          >
            Search
          </button>
        </div>

        {/* Advanced filters */}
        {advancedOpen && (
          <div className="mt-3 p-4 rounded-xl bg-charcoal-900/30 animate-slide-up" role="region" aria-label="Advanced search filters">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div>
                <label htmlFor="search-source" className="block text-xs font-medium text-charcoal-400 mb-1">Source</label>
                <select id="search-source" className="input-field text-sm">
                  <option value="">All Sources</option>
                  <option value="google_drive">Google Drive</option>
                  <option value="gmail">Gmail</option>
                  <option value="github">GitHub</option>
                  <option value="dropbox">Dropbox</option>
                  <option value="local">Local</option>
                </select>
              </div>
              <div>
                <label htmlFor="search-category" className="block text-xs font-medium text-charcoal-400 mb-1">Category</label>
                <select id="search-category" className="input-field text-sm">
                  <option value="">All Categories</option>
                  <option value="Documents">Documents</option>
                  <option value="Code">Code</option>
                  <option value="Finance">Finance</option>
                  <option value="Images">Images</option>
                </select>
              </div>
              <div>
                <label htmlFor="search-type" className="block text-xs font-medium text-charcoal-400 mb-1">File Type</label>
                <input id="search-type" type="text" className="input-field text-sm" placeholder=".pdf, .py, .xlsx" />
              </div>
              <div>
                <label htmlFor="search-from" className="block text-xs font-medium text-charcoal-400 mb-1">Date From</label>
                <input id="search-from" type="date" className="input-field text-sm" />
              </div>
              <div>
                <label htmlFor="search-to" className="block text-xs font-medium text-charcoal-400 mb-1">Date To</label>
                <input id="search-to" type="date" className="input-field text-sm" />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded border-charcoal-600" aria-label="Include duplicates in search results" />
                  <span className="text-sm text-charcoal-300">Include duplicates</span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Search results */}
      {hasSearched && (
        <div className="space-y-3" role="region" aria-label="Search results" aria-live="polite">
          <p className="text-sm text-charcoal-400">
            {results.length} result{results.length !== 1 ? 's' : ''} for "<strong className="text-earth-200">{query}</strong>"
          </p>

          {results.length === 0 ? (
            <div className="glass-panel p-12 text-center">
              <Search className="w-12 h-12 text-charcoal-600 mx-auto mb-4" aria-hidden="true" />
              <p className="text-charcoal-400">No files found matching your search.</p>
              <p className="text-xs text-charcoal-500 mt-2">Try different keywords or adjust your filters.</p>
            </div>
          ) : (
            results.map((file) => {
              const Icon = getFileIcon(file.file_extension);
              return (
                <div key={file.id} className="glass-card p-4 flex items-start gap-4">
                  <div className="p-2.5 rounded-xl bg-gold-500/10 flex-shrink-0" aria-hidden="true">
                    <Icon className="w-5 h-5 text-gold-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-earth-200">{file.filename}</h3>
                    <p className="text-xs text-charcoal-400 mt-0.5">{file.file_path}</p>
                    {file.ai_summary && (
                      <p className="text-xs text-charcoal-300 mt-2">{file.ai_summary}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      {file.ai_category && <span className="badge-info">{file.ai_category}</span>}
                      <span className="text-xs text-charcoal-500">{formatBytes(file.size_bytes)}</span>
                      {file.ai_confidence && (
                        <span className="text-xs text-charcoal-500 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" aria-hidden="true" />
                          {Math.round(file.ai_confidence * 100)}% match
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Empty state */}
      {!hasSearched && (
        <div className="text-center py-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-charcoal-800/30 text-xs text-charcoal-400">
            <Sparkles className="w-3.5 h-3.5 text-gold-500" aria-hidden="true" />
            AI-powered search across Gmail, Drive, GitHub, Dropbox, and local files
          </div>
        </div>
      )}
    </div>
  );
}
