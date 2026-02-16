import { useState } from 'react';
import {
  FolderOpen,
  FileText,
  Image,
  Code,
  Music,
  Video,
  Archive,
  Table,
  Filter,
  Grid,
  List,
  Sparkles,
  Copy,
  MoreVertical,
} from 'lucide-react';
import type { FileItem } from '../types';

function getFileIcon(extension: string | null) {
  const ext = (extension || '').toLowerCase().replace('.', '');
  const iconMap: Record<string, any> = {
    pdf: FileText, doc: FileText, docx: FileText, txt: FileText, md: FileText,
    jpg: Image, jpeg: Image, png: Image, gif: Image, svg: Image, webp: Image,
    py: Code, js: Code, ts: Code, tsx: Code, jsx: Code, html: Code, css: Code,
    mp3: Music, wav: Music, flac: Music, aac: Music,
    mp4: Video, avi: Video, mov: Video, mkv: Video,
    zip: Archive, tar: Archive, gz: Archive, rar: Archive,
    csv: Table, xlsx: Table, xls: Table,
  };
  return iconMap[ext] || FileText;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// Demo files
const demoFiles: FileItem[] = [
  { id: '1', source_id: 's1', category_id: null, filename: 'Q4_Financial_Report.pdf', file_path: '/documents/reports/', file_extension: '.pdf', mime_type: 'application/pdf', size_bytes: 2457600, checksum_sha256: null, ai_category: 'Finance', ai_confidence: 0.94, ai_tags: '["finance","report","quarterly"]', ai_summary: 'Q4 2025 financial report with revenue analysis', external_url: null, is_duplicate: false, is_archived: false, file_created_at: '2026-01-15T10:30:00Z', file_modified_at: '2026-02-01T14:22:00Z', indexed_at: '2026-02-10T08:00:00Z', created_at: '2026-02-10T08:00:00Z' },
  { id: '2', source_id: 's2', category_id: null, filename: 'project_architecture.png', file_path: '/design/diagrams/', file_extension: '.png', mime_type: 'image/png', size_bytes: 845000, checksum_sha256: null, ai_category: 'Design', ai_confidence: 0.88, ai_tags: '["architecture","diagram","design"]', ai_summary: 'System architecture diagram for main project', external_url: null, is_duplicate: false, is_archived: false, file_created_at: '2026-01-20T09:15:00Z', file_modified_at: '2026-01-25T16:45:00Z', indexed_at: '2026-02-10T08:00:00Z', created_at: '2026-02-10T08:00:00Z' },
  { id: '3', source_id: 's1', category_id: null, filename: 'main_app.py', file_path: '/code/backend/', file_extension: '.py', mime_type: 'text/x-python', size_bytes: 15200, checksum_sha256: null, ai_category: 'Code', ai_confidence: 0.97, ai_tags: '["python","backend","fastapi"]', ai_summary: 'Main FastAPI application entry point', external_url: null, is_duplicate: false, is_archived: false, file_created_at: '2026-02-05T11:00:00Z', file_modified_at: '2026-02-14T09:30:00Z', indexed_at: '2026-02-10T08:00:00Z', created_at: '2026-02-10T08:00:00Z' },
  { id: '4', source_id: 's3', category_id: null, filename: 'client_data_2026.xlsx', file_path: '/data/', file_extension: '.xlsx', mime_type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', size_bytes: 3456000, checksum_sha256: null, ai_category: 'Spreadsheets', ai_confidence: 0.91, ai_tags: '["data","clients","spreadsheet"]', ai_summary: 'Client database export for 2026', external_url: null, is_duplicate: false, is_archived: false, file_created_at: '2026-02-01T08:00:00Z', file_modified_at: '2026-02-12T15:00:00Z', indexed_at: '2026-02-10T08:00:00Z', created_at: '2026-02-10T08:00:00Z' },
  { id: '5', source_id: 's2', category_id: null, filename: 'meeting_recording.mp4', file_path: '/recordings/', file_extension: '.mp4', mime_type: 'video/mp4', size_bytes: 125000000, checksum_sha256: null, ai_category: 'Videos', ai_confidence: 0.85, ai_tags: '["meeting","recording","video"]', ai_summary: 'Team standup meeting recording', external_url: null, is_duplicate: false, is_archived: false, file_created_at: '2026-02-13T10:00:00Z', file_modified_at: '2026-02-13T11:00:00Z', indexed_at: '2026-02-14T08:00:00Z', created_at: '2026-02-14T08:00:00Z' },
  { id: '6', source_id: 's1', category_id: null, filename: 'contract_draft_v2.docx', file_path: '/legal/', file_extension: '.docx', mime_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', size_bytes: 98500, checksum_sha256: 'abc123', ai_category: 'Legal', ai_confidence: 0.92, ai_tags: '["contract","legal","draft"]', ai_summary: 'Service agreement draft version 2', external_url: null, is_duplicate: true, is_archived: false, file_created_at: '2026-02-10T14:00:00Z', file_modified_at: '2026-02-11T09:00:00Z', indexed_at: '2026-02-12T08:00:00Z', created_at: '2026-02-12T08:00:00Z' },
];

export default function FileBrowserPage() {
  const [files] = useState<FileItem[]>(demoFiles);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [filterOpen, setFilterOpen] = useState(false);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-earth-100 flex items-center gap-2">
            <FolderOpen className="w-6 h-6 text-gold-400" aria-hidden="true" />
            File Browser
          </h1>
          <p className="text-sm text-charcoal-300 mt-1">
            Browse and manage files across all connected sources
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className="btn-secondary flex items-center gap-2 text-sm"
            aria-label="Toggle filters"
            aria-expanded={filterOpen}
          >
            <Filter className="w-4 h-4" aria-hidden="true" />
            Filters
          </button>
          <button
            className="btn-primary flex items-center gap-2 text-sm"
            aria-label="Run AI categorization on all files"
          >
            <Sparkles className="w-4 h-4" aria-hidden="true" />
            AI Categorize
          </button>
          <div className="flex items-center border border-charcoal-700/30 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-charcoal-700/40 text-gold-400' : 'text-charcoal-400'}`}
              aria-label="List view"
              aria-pressed={viewMode === 'list'}
            >
              <List className="w-4 h-4" aria-hidden="true" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-charcoal-700/40 text-gold-400' : 'text-charcoal-400'}`}
              aria-label="Grid view"
              aria-pressed={viewMode === 'grid'}
            >
              <Grid className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter panel */}
      {filterOpen && (
        <div className="glass-panel p-4 animate-slide-up" role="region" aria-label="File filters">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label htmlFor="filter-source" className="block text-xs font-medium text-charcoal-300 mb-1">Source</label>
              <select id="filter-source" className="input-field text-sm" aria-label="Filter by source">
                <option value="">All Sources</option>
                <option value="google_drive">Google Drive</option>
                <option value="gmail">Gmail</option>
                <option value="github">GitHub</option>
                <option value="dropbox">Dropbox</option>
                <option value="local">Local</option>
              </select>
            </div>
            <div>
              <label htmlFor="filter-category" className="block text-xs font-medium text-charcoal-300 mb-1">Category</label>
              <select id="filter-category" className="input-field text-sm" aria-label="Filter by category">
                <option value="">All Categories</option>
                <option value="Documents">Documents</option>
                <option value="Code">Code</option>
                <option value="Images">Images</option>
                <option value="Finance">Finance</option>
                <option value="Legal">Legal</option>
              </select>
            </div>
            <div>
              <label htmlFor="filter-type" className="block text-xs font-medium text-charcoal-300 mb-1">File Type</label>
              <input id="filter-type" type="text" placeholder="e.g., .pdf, .py" className="input-field text-sm" aria-label="Filter by file type" />
            </div>
            <div>
              <label htmlFor="filter-duplicates" className="block text-xs font-medium text-charcoal-300 mb-1">Duplicates</label>
              <select id="filter-duplicates" className="input-field text-sm" aria-label="Filter duplicates">
                <option value="hide">Hide Duplicates</option>
                <option value="show">Show All</option>
                <option value="only">Only Duplicates</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* File list */}
      {viewMode === 'list' ? (
        <div className="glass-panel overflow-hidden" role="table" aria-label="File list">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-charcoal-800/50">
                  <th className="text-left px-4 py-3 text-xs font-medium text-charcoal-400 uppercase tracking-wider" scope="col">File</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-charcoal-400 uppercase tracking-wider hidden md:table-cell" scope="col">Category</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-charcoal-400 uppercase tracking-wider hidden lg:table-cell" scope="col">AI Confidence</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-charcoal-400 uppercase tracking-wider" scope="col">Size</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-charcoal-400 uppercase tracking-wider hidden sm:table-cell" scope="col">Modified</th>
                  <th className="px-4 py-3 w-10" scope="col"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {files.map((file) => {
                  const Icon = getFileIcon(file.file_extension);
                  return (
                    <tr
                      key={file.id}
                      className="border-b border-charcoal-800/20 hover:bg-charcoal-800/20 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Icon className="w-5 h-5 text-gold-500 flex-shrink-0" aria-hidden="true" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-earth-200 truncate flex items-center gap-2">
                              {file.filename}
                              {file.is_duplicate && (
                                <span className="badge-warning flex items-center gap-1" title="Duplicate detected">
                                  <Copy className="w-3 h-3" aria-hidden="true" />
                                  Dup
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-charcoal-400 truncate">{file.file_path}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="badge-info">{file.ai_category || 'Uncategorized'}</span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        {file.ai_confidence ? (
                          <div className="flex items-center gap-2">
                            <div className="progress-bar w-16">
                              <div
                                className="progress-bar-fill"
                                style={{ width: `${file.ai_confidence * 100}%` }}
                                role="progressbar"
                                aria-valuenow={Math.round(file.ai_confidence * 100)}
                                aria-valuemin={0}
                                aria-valuemax={100}
                                aria-label={`AI confidence: ${Math.round(file.ai_confidence * 100)}%`}
                              />
                            </div>
                            <span className="text-xs text-charcoal-300">
                              {Math.round(file.ai_confidence * 100)}%
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-charcoal-500">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-charcoal-300">
                        {formatBytes(file.size_bytes)}
                      </td>
                      <td className="px-4 py-3 text-right text-xs text-charcoal-400 hidden sm:table-cell">
                        {file.file_modified_at
                          ? new Date(file.file_modified_at).toLocaleDateString()
                          : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          className="p-1 rounded-lg text-charcoal-400 hover:text-earth-200 hover:bg-charcoal-800/40"
                          aria-label={`Actions for ${file.filename}`}
                        >
                          <MoreVertical className="w-4 h-4" aria-hidden="true" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" role="list" aria-label="File grid">
          {files.map((file) => {
            const Icon = getFileIcon(file.file_extension);
            return (
              <div key={file.id} className="glass-card p-4" role="listitem">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-gold-500/10 flex-shrink-0" aria-hidden="true">
                    <Icon className="w-5 h-5 text-gold-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-earth-200 truncate">{file.filename}</p>
                    <p className="text-xs text-charcoal-400 mt-0.5">{formatBytes(file.size_bytes)}</p>
                    {file.ai_category && (
                      <span className="badge-info mt-2 inline-block">{file.ai_category}</span>
                    )}
                  </div>
                </div>
                {file.ai_summary && (
                  <p className="text-xs text-charcoal-300 mt-3 line-clamp-2">{file.ai_summary}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
