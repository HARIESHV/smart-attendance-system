import { useEffect, useState, useMemo } from 'react';
import api from '../../api/axios';
import type { Notification } from '../../types';
import { format, formatDistanceToNow } from 'date-fns';
import {
  MessageSquare, Loader2, CheckCircle2, AlertCircle,
  Bell, BellOff, Search, Filter, Trash2, CheckCheck,
  RefreshCw, ChevronDown, Clock, Send, XCircle,
} from 'lucide-react';

// ── Status badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: Notification['status'] }) {
  const map = {
    sent:      { cls: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400', icon: <CheckCircle2 size={11} />, label: 'Sent' },
    delivered: { cls: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',           icon: <CheckCheck size={11} />,   label: 'Delivered' },
    failed:    { cls: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',               icon: <XCircle size={11} />,      label: 'Failed' },
    pending:   { cls: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',       icon: <Clock size={11} />,        label: 'Pending' },
  };
  const { cls, icon, label } = map[status] ?? map.pending;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${cls}`}>
      {icon} {label}
    </span>
  );
}

// ── Type icon ─────────────────────────────────────────────────────────────────
function TypeIcon({ type }: { type: Notification['type'] }) {
  const map: Record<string, { cls: string; icon: React.ReactNode }> = {
    attendance_alert: { cls: 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400',   icon: <Bell size={16} /> },
    low_attendance:   { cls: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',               icon: <AlertCircle size={16} /> },
  };
  const { cls, icon } = map[type] ?? map.attendance_alert;
  return (
    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${cls}`}>
      {icon}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
type FilterType = 'all' | Notification['type'];
type FilterStatus = 'all' | Notification['status'];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [read, setRead] = useState<Set<string>>(new Set());
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    setError(null);
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data?.data ?? res.data ?? []);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load notifications. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchNotifications(); }, []);

  // ── Derived / filtered list ─────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return notifications.filter(n => {
      const matchSearch = search === '' ||
        n.message.toLowerCase().includes(search.toLowerCase()) ||
        n.phone?.toLowerCase().includes(search.toLowerCase());
      const matchType   = filterType   === 'all' || n.type   === filterType;
      const matchStatus = filterStatus === 'all' || n.status === filterStatus;
      return matchSearch && matchType && matchStatus;
    });
  }, [notifications, search, filterType, filterStatus]);

  const unreadCount = notifications.filter(n => !read.has(n._id)).length;

  const markRead = (id: string) => setRead(prev => new Set([...prev, id]));
  const markAllRead = () => setRead(new Set(notifications.map(n => n._id)));

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n._id !== id));
    setRead(prev => { const s = new Set(prev); s.delete(id); return s; });
  };

  // ── Loading state ────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="page-header">
          <h1 className="page-title flex items-center gap-2"><Bell size={24} /> Notifications</h1>
          <p className="page-subtitle">Your alerts and system notifications</p>
        </div>
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 className="animate-spin text-primary-500" size={36} />
          <p className="text-gray-500 dark:text-gray-400 font-medium">Loading notifications…</p>
        </div>
      </div>
    );
  }

  // ── Error state ──────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="page-header">
          <h1 className="page-title flex items-center gap-2"><Bell size={24} /> Notifications</h1>
        </div>
        <div className="glass-card p-10 text-center">
          <AlertCircle size={48} className="mx-auto text-red-400 mb-3" />
          <h3 className="font-semibold text-lg text-gray-800 dark:text-white mb-1">Failed to Load</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">{error}</p>
          <button onClick={() => fetchNotifications(true)} className="btn-primary inline-flex items-center gap-2">
            <RefreshCw size={16} /> Retry
          </button>
        </div>
      </div>
    );
  }

  // ── Main UI ──────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-3xl mx-auto">

      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Bell size={22} className="text-primary-500" />
            Notifications
            {unreadCount > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-primary-600 text-white text-xs font-bold rounded-full">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="page-subtitle">Your recent alerts and system notifications</p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="btn-secondary text-sm flex items-center gap-1.5 py-2"
              title="Mark all as read"
            >
              <CheckCheck size={15} /> Mark All Read
            </button>
          )}
          <button
            onClick={() => fetchNotifications(true)}
            disabled={refreshing}
            className="p-2 rounded-xl bg-gray-100 dark:bg-dark-600 text-gray-500 hover:bg-gray-200 dark:hover:bg-dark-500 transition-colors"
            title="Refresh"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* ── Search & Filters ── */}
      <div className="glass-card p-4 mb-4 flex flex-wrap gap-3 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by message or phone…"
            className="input-field pl-9 py-2 text-sm"
          />
        </div>

        {/* Type filter */}
        <div className="relative">
          <Filter size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value as FilterType)}
            className="input-field pl-8 pr-8 py-2 text-sm appearance-none cursor-pointer"
          >
            <option value="all">All Types</option>
            <option value="attendance_alert">Attendance Alert</option>
            <option value="low_attendance">Low Attendance</option>
          </select>
          <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>

        {/* Status filter */}
        <div className="relative">
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value as FilterStatus)}
            className="input-field pr-8 py-2 text-sm appearance-none cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="sent">Sent</option>
            <option value="delivered">Delivered</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
          <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>

        {/* Clear filters */}
        {(search || filterType !== 'all' || filterStatus !== 'all') && (
          <button
            onClick={() => { setSearch(''); setFilterType('all'); setFilterStatus('all'); }}
            className="text-sm text-gray-400 hover:text-red-500 transition-colors font-medium"
          >
            Clear
          </button>
        )}
      </div>

      {/* ── Summary stats ── */}
      {notifications.length > 0 && (
        <div className="grid grid-cols-4 gap-3 mb-4">
          {(['sent', 'delivered', 'pending', 'failed'] as const).map(s => {
            const count = notifications.filter(n => n.status === s).length;
            return (
              <button
                key={s}
                onClick={() => setFilterStatus(filterStatus === s ? 'all' : s)}
                className={`glass-card p-3 text-center cursor-pointer transition-all hover:-translate-y-0.5 ${
                  filterStatus === s ? 'ring-2 ring-primary-500' : ''
                }`}
              >
                <p className="text-lg font-bold">{count}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{s}</p>
              </button>
            );
          })}
        </div>
      )}

      {/* ── Notification list ── */}
      <div className="space-y-3">
        {filtered.map(notif => {
          const isRead = read.has(notif._id);
          return (
            <div
              key={notif._id}
              className={`glass-card p-4 flex gap-4 transition-all duration-200 hover:-translate-y-0.5 group ${
                !isRead ? 'border-l-4 border-l-primary-500' : ''
              }`}
            >
              <TypeIcon type={notif.type} />

              <div className="flex-1 min-w-0">
                {/* Header row */}
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                      {notif.type === 'attendance_alert'
                        ? 'Attendance Alert'
                        : 'Low Attendance Warning'}
                    </h3>
                    {!isRead && (
                      <span className="w-2 h-2 rounded-full bg-primary-500 inline-block" />
                    )}
                    <StatusBadge status={notif.status} />
                  </div>
                  <span
                    className="text-xs text-gray-400 whitespace-nowrap shrink-0"
                    title={format(new Date(notif.createdAt), 'dd MMM yyyy, hh:mm a')}
                  >
                    {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                  </span>
                </div>

                {/* Message */}
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap mb-2">
                  {notif.message}
                </p>

                {/* Meta row */}
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <Send size={11} /> {notif.phone || '—'}
                  </span>
                  <span>
                    {format(new Date(notif.createdAt), 'dd MMM yyyy, hh:mm a')}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                {!isRead && (
                  <button
                    onClick={() => markRead(notif._id)}
                    className="p-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-gray-400 hover:text-emerald-600 transition-colors"
                    title="Mark as read"
                  >
                    <CheckCircle2 size={15} />
                  </button>
                )}
                <button
                  onClick={() => deleteNotification(notif._id)}
                  className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors"
                  title="Delete notification"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          );
        })}

        {/* ── Empty states ── */}
        {filtered.length === 0 && notifications.length > 0 && (
          <div className="glass-card p-12 text-center">
            <Search size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="font-semibold text-gray-700 dark:text-gray-300">No results found</p>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters</p>
            <button
              onClick={() => { setSearch(''); setFilterType('all'); setFilterStatus('all'); }}
              className="mt-4 text-sm text-primary-600 dark:text-primary-400 font-medium hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}

        {notifications.length === 0 && (
          <div className="glass-card p-16 text-center">
            <BellOff size={52} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="font-semibold text-lg text-gray-700 dark:text-gray-300 mb-1">
              No Notifications Yet
            </h3>
            <p className="text-sm text-gray-400">
              Notifications about your attendance will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
