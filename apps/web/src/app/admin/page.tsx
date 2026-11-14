'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { API_BASE } from '@/lib/config/api';
import {
  Shield,
  BookOpen,
  AlertTriangle,
  FileText,
  Plus,
  CheckCircle2,
  Archive,
  RefreshCw,
  Search,
  Filter,
  Check,
  X,
  ExternalLink,
} from 'lucide-react';

interface PassageItem {
  id: string;
  locale: 'en' | 'km';
  title: string;
  content: string;
  difficulty: string;
  category: string;
  contentMode: string;
  sourceName?: string;
  licenseName?: string;
  status: string;
  createdAt: string;
}

interface UserReportItem {
  id: string;
  reporterUserId: string;
  reporterDisplayName: string;
  reportedUserId?: string;
  reportedDisplayName?: string;
  roomId?: string;
  category: string;
  details: string;
  status: string;
  createdAt: string;
}

interface AuditLogItem {
  id: string;
  actorUserId?: string;
  action: string;
  targetType: string;
  targetId?: string;
  metadata: string;
  createdAt: string;
}

export default function AdminPage() {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState<'passages' | 'reports' | 'audit'>('passages');

  // Passages State
  const [passages, setPassages] = useState<PassageItem[]>([]);
  const [passageStatusFilter, setPassageStatusFilter] = useState<string>('ALL');
  const [passageLocaleFilter, setPassageLocaleFilter] = useState<string>('ALL');
  const [isLoadingPassages, setIsLoadingPassages] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New Passage Form State
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newLocale, setNewLocale] = useState<'en' | 'km'>('km');
  const [newDifficulty, setNewDifficulty] = useState<string>('BEGINNER');
  const [newCategory, setNewCategory] = useState<string>('GENERAL');
  const [newContentMode, setNewContentMode] = useState<string>('PARAGRAPH');
  const [newStatus, setNewStatus] = useState<string>('PUBLISHED');
  const [isCreating, setIsCreating] = useState(false);

  // Reports State
  const [reports, setReports] = useState<UserReportItem[]>([]);
  const [reportFilter, setReportFilter] = useState<string>('OPEN');
  const [isLoadingReports, setIsLoadingReports] = useState(false);

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [isLoadingAudit, setIsLoadingAudit] = useState(false);

  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Fetch Passages
  const fetchPassages = useCallback(async () => {
    if (!token) return;
    setIsLoadingPassages(true);
    try {
      let url = `${API_BASE}/admin/passages?size=50`;
      if (passageStatusFilter !== 'ALL') url += `&status=${passageStatusFilter}`;
      if (passageLocaleFilter !== 'ALL') url += `&locale=${passageLocaleFilter}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPassages(data.content || []);
      }
    } catch {
      showNotification('Failed to fetch passages', 'error');
    } finally {
      setIsLoadingPassages(false);
    }
  }, [token, passageStatusFilter, passageLocaleFilter]);

  // Fetch Reports
  const fetchReports = useCallback(async () => {
    if (!token) return;
    setIsLoadingReports(true);
    try {
      const url = `${API_BASE}/admin/reports?status=${reportFilter}&size=50`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setReports(data.content || []);
      }
    } catch {
      showNotification('Failed to fetch reports', 'error');
    } finally {
      setIsLoadingReports(false);
    }
  }, [token, reportFilter]);

  // Fetch Audit Logs
  const fetchAuditLogs = useCallback(async () => {
    if (!token) return;
    setIsLoadingAudit(true);
    try {
      const res = await fetch(`${API_BASE}/admin/audit-logs?size=50`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAuditLogs(data.content || []);
      }
    } catch {
      showNotification('Failed to fetch audit trail', 'error');
    } finally {
      setIsLoadingAudit(false);
    }
  }, [token]);

  useEffect(() => {
    if (activeTab === 'passages') fetchPassages();
    else if (activeTab === 'reports') fetchReports();
    else if (activeTab === 'audit') fetchAuditLogs();
  }, [activeTab, fetchPassages, fetchReports, fetchAuditLogs]);

  // Handle Publish / Archive Passage
  const handlePassageAction = async (id: string, action: 'publish' | 'archive') => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/admin/passages/${id}/${action}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        showNotification(`Passage ${action === 'publish' ? 'published' : 'archived'} successfully`);
        fetchPassages();
      }
    } catch {
      showNotification('Action failed', 'error');
    }
  };

  // Handle Create Passage
  const handleCreatePassage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newTitle.trim() || !newContent.trim()) return;

    setIsCreating(true);
    try {
      const res = await fetch(`${API_BASE}/admin/passages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newTitle.trim(),
          content: newContent.trim(),
          locale: newLocale,
          difficulty: newDifficulty,
          category: newCategory,
          contentMode: newContentMode,
          status: newStatus,
        }),
      });

      if (res.ok) {
        showNotification('New passage added to catalog');
        setIsCreateModalOpen(false);
        setNewTitle('');
        setNewContent('');
        fetchPassages();
      } else {
        const err = await res.json().catch(() => ({}));
        showNotification(err.message || 'Error creating passage', 'error');
      }
    } catch {
      showNotification('Network error', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  // Handle Resolve / Dismiss Report
  const handleReportAction = async (reportId: string, status: 'RESOLVED' | 'DISMISSED') => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/admin/reports/${reportId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        showNotification(`Report marked as ${status}`);
        fetchReports();
      }
    } catch {
      showNotification('Failed to update report', 'error');
    }
  };

  // Check role authorization
  const isAuthorized = user && (user.role === 'ADMIN' || user.role === 'MODERATOR');

  if (!isAuthorized) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-surface border border-border rounded-2xl p-8 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Admin & Moderation Console</h1>
          <p className="text-sm text-muted">
            This administrative dashboard is restricted to TypeMaster system administrators and content moderators.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] py-8 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20 flex items-center gap-1">
                <Shield className="w-3.5 h-3.5" />
                {user.role} Console
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-foreground">Content & Safety Control</h1>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-1 bg-surface border border-border rounded-xl p-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('passages')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-colors ${
                activeTab === 'passages'
                  ? 'bg-primary text-background font-bold shadow-sm'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Passages</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('reports')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-colors ${
                activeTab === 'reports'
                  ? 'bg-primary text-background font-bold shadow-sm'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Reports</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('audit')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-colors ${
                activeTab === 'audit'
                  ? 'bg-primary text-background font-bold shadow-sm'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Audit Log</span>
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {notification && (
          <div
            className={`p-3.5 rounded-xl border text-xs font-semibold animate-in fade-in flex items-center gap-2 ${
              notification.type === 'success'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-error/10 text-error border-error/20'
            }`}
          >
            {notification.type === 'success' ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
            <span>{notification.message}</span>
          </div>
        )}

        {/* Tab 1: Passages Management */}
        {activeTab === 'passages' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Filters */}
              <div className="flex items-center gap-2 flex-wrap text-xs">
                <select
                  value={passageStatusFilter}
                  onChange={(e) => setPassageStatusFilter(e.target.value)}
                  className="bg-surface border border-border rounded-xl px-3 py-2 text-foreground outline-none"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="DRAFT">Draft</option>
                  <option value="ARCHIVED">Archived</option>
                </select>

                <select
                  value={passageLocaleFilter}
                  onChange={(e) => setPassageLocaleFilter(e.target.value)}
                  className="bg-surface border border-border rounded-xl px-3 py-2 text-foreground outline-none"
                >
                  <option value="ALL">All Languages</option>
                  <option value="en">English (en)</option>
                  <option value="km">ភាសាខ្មែរ (km)</option>
                </select>

                <button
                  type="button"
                  onClick={fetchPassages}
                  className="p-2 rounded-xl bg-surface border border-border text-muted hover:text-foreground"
                  title="Refresh catalog"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingPassages ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {/* Add New Passage Button */}
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-background font-bold text-xs hover:bg-primary-hover shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Passage</span>
              </button>
            </div>

            {/* Passages Table */}
            <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-elevated/60 text-muted uppercase font-semibold border-b border-border">
                    <tr>
                      <th className="py-3 px-4">Title & Excerpt</th>
                      <th className="py-3 px-4">Locale</th>
                      <th className="py-3 px-4">Difficulty</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {passages.map((p) => (
                      <tr key={p.id} className="hover:bg-elevated/40 transition-colors">
                        <td className="py-3 px-4 max-w-sm">
                          <div className="font-semibold text-foreground truncate">{p.title}</div>
                          <div
                            className={`text-muted truncate mt-0.5 ${
                              p.locale === 'km' ? 'font-khmer' : 'font-mono'
                            }`}
                          >
                            {p.content}
                          </div>
                        </td>
                        <td className="py-3 px-4 uppercase font-bold text-muted">{p.locale}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full bg-elevated border border-border text-[11px] font-medium text-foreground">
                            {p.difficulty}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-muted">{p.category}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              p.status === 'PUBLISHED'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : p.status === 'DRAFT'
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                : 'bg-elevated text-muted border-border'
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {p.status !== 'PUBLISHED' && (
                              <button
                                type="button"
                                onClick={() => handlePassageAction(p.id, 'publish')}
                                className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/30 text-[11px] font-semibold"
                              >
                                Publish
                              </button>
                            )}
                            {p.status !== 'ARCHIVED' && (
                              <button
                                type="button"
                                onClick={() => handlePassageAction(p.id, 'archive')}
                                className="px-2.5 py-1 rounded-lg bg-elevated text-muted hover:text-foreground border border-border text-[11px] font-semibold"
                              >
                                Archive
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: User Reports */}
        {activeTab === 'reports' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <select
                value={reportFilter}
                onChange={(e) => setReportFilter(e.target.value)}
                className="bg-surface border border-border rounded-xl px-3 py-2 text-xs text-foreground outline-none"
              >
                <option value="OPEN">Open Reports</option>
                <option value="REVIEWING">In Review</option>
                <option value="RESOLVED">Resolved</option>
                <option value="DISMISSED">Dismissed</option>
                <option value="ALL">All Reports</option>
              </select>

              <button
                type="button"
                onClick={fetchReports}
                className="p-2 rounded-xl bg-surface border border-border text-muted hover:text-foreground text-xs"
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingReports ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-elevated/60 text-muted uppercase font-semibold border-b border-border">
                    <tr>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Reporter</th>
                      <th className="py-3 px-4">Target Player / Room</th>
                      <th className="py-3 px-4">Details</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Moderation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {reports.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-muted">
                          No reports found matching status: {reportFilter}
                        </td>
                      </tr>
                    ) : (
                      reports.map((r) => (
                        <tr key={r.id} className="hover:bg-elevated/40 transition-colors">
                          <td className="py-3 px-4 font-bold text-foreground">{r.category}</td>
                          <td className="py-3 px-4 text-muted">{r.reporterDisplayName}</td>
                          <td className="py-3 px-4 text-foreground font-semibold">
                            {r.reportedDisplayName || (r.roomId ? `Room ${r.roomId.substring(0, 8)}` : 'System')}
                          </td>
                          <td className="py-3 px-4 text-muted max-w-xs truncate">{r.details}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                r.status === 'OPEN'
                                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                  : r.status === 'RESOLVED'
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                  : 'bg-elevated text-muted border-border'
                              }`}
                            >
                              {r.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            {r.status === 'OPEN' && (
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleReportAction(r.id, 'RESOLVED')}
                                  className="px-2 py-1 rounded bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/30 text-[11px] font-semibold"
                                >
                                  Resolve
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleReportAction(r.id, 'DISMISSED')}
                                  className="px-2 py-1 rounded bg-elevated text-muted hover:text-foreground border border-border text-[11px] font-semibold"
                                >
                                  Dismiss
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Audit Trail */}
        {activeTab === 'audit' && (
          <div className="space-y-4">
            <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-elevated/60 text-muted uppercase font-semibold border-b border-border">
                    <tr>
                      <th className="py-3 px-4">Timestamp (UTC)</th>
                      <th className="py-3 px-4">Action</th>
                      <th className="py-3 px-4">Target Type</th>
                      <th className="py-3 px-4">Target ID</th>
                      <th className="py-3 px-4">Metadata</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-elevated/40 transition-colors font-mono">
                        <td className="py-3 px-4 text-muted">
                          {new Date(log.createdAt).toISOString().replace('T', ' ').substring(0, 19)}
                        </td>
                        <td className="py-3 px-4 font-bold text-primary">{log.action}</td>
                        <td className="py-3 px-4 text-foreground">{log.targetType}</td>
                        <td className="py-3 px-4 text-muted truncate max-w-[120px]">{log.targetId || '-'}</td>
                        <td className="py-3 px-4 text-muted/80 max-w-md truncate">{log.metadata}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Create New Passage */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h2 className="text-lg font-bold text-foreground">Add New Bilingual Passage</h2>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-muted hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePassage} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted font-semibold mb-1 uppercase tracking-wider">
                    Language
                  </label>
                  <select
                    value={newLocale}
                    onChange={(e) => setNewLocale(e.target.value as 'en' | 'km')}
                    className="w-full bg-elevated border border-border rounded-xl px-3 py-2 text-foreground outline-none focus:border-primary"
                  >
                    <option value="km">ភាសាខ្មែរ (Khmer)</option>
                    <option value="en">English</option>
                  </select>
                </div>

                <div>
                  <label className="block text-muted font-semibold mb-1 uppercase tracking-wider">
                    Difficulty
                  </label>
                  <select
                    value={newDifficulty}
                    onChange={(e) => setNewDifficulty(e.target.value)}
                    className="w-full bg-elevated border border-border rounded-xl px-3 py-2 text-foreground outline-none focus:border-primary"
                  >
                    <option value="BEGINNER">Beginner</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="ADVANCED">Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-muted font-semibold mb-1 uppercase tracking-wider">
                  Passage Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. អច្ឆរិយវត្ថុនៃប្រាសាទអង្គរវត្ត"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-elevated border border-border rounded-xl px-3 py-2 text-foreground outline-none focus:border-primary"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-muted font-semibold uppercase tracking-wider">
                    Passage Content
                  </label>
                  <span className="text-[10px] text-muted">
                    {newContent.length} chars • {newContent.trim().split(/\s+/).filter(Boolean).length} words
                  </span>
                </div>
                <textarea
                  required
                  rows={4}
                  placeholder="Enter the full text passage here..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className={`w-full bg-elevated border border-border rounded-xl p-3 text-foreground outline-none focus:border-primary leading-relaxed ${
                    newLocale === 'km' ? 'font-khmer text-sm' : 'font-mono'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted font-semibold mb-1 uppercase tracking-wider">
                    Category
                  </label>
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value.toUpperCase())}
                    className="w-full bg-elevated border border-border rounded-xl px-3 py-2 text-foreground outline-none focus:border-primary uppercase"
                  />
                </div>

                <div>
                  <label className="block text-muted font-semibold mb-1 uppercase tracking-wider">
                    Initial Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full bg-elevated border border-border rounded-xl px-3 py-2 text-foreground outline-none focus:border-primary"
                  >
                    <option value="PUBLISHED">Published</option>
                    <option value="DRAFT">Draft</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-border text-muted hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-5 py-2 rounded-xl bg-primary text-background font-bold hover:bg-primary-hover shadow-sm"
                >
                  {isCreating ? 'Saving...' : 'Create Passage'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
