import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  Ban,
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  LoaderCircle,
  Search,
  ShieldCheck,
  ShieldOff,
  UserRoundCheck,
  UserRoundMinus,
  Users,
  X,
} from 'lucide-react';
import AdminNav from '../components/AdminNav';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { superAdminApi } from '../services/api';

const PAGE_SIZE = 10;

const ACTION_DETAILS = {
  promoteUser: {
    label: 'Promote to admin',
    title: 'Promote this student?',
    description: 'This account will gain access to the regular admin dashboard and can manage events it creates.',
    icon: UserRoundCheck,
    tone: 'amber',
  },
  demoteUser: {
    label: 'Demote to student',
    title: 'Demote this admin?',
    description: 'Admin-only access will be revoked immediately. Existing events and registrations will be preserved.',
    icon: UserRoundMinus,
    tone: 'stone',
  },
  disableUser: {
    label: 'Disable account',
    title: 'Disable this account?',
    description: 'The account will be signed out and blocked from protected features until it is re-enabled.',
    icon: Ban,
    tone: 'red',
  },
  enableUser: {
    label: 'Re-enable account',
    title: 'Re-enable this account?',
    description: 'This account will be allowed to sign in and use the features available to its current role.',
    icon: Check,
    tone: 'green',
  },
};

const STAT_CARDS = [
  { key: 'totalUsers', label: 'Total users', color: 'text-[#171715]', icon: Users },
  { key: 'students', label: 'Students', color: 'text-[#296B87]', icon: UserRoundCheck },
  { key: 'admins', label: 'Admins', color: 'text-[#8F5F00]', icon: ShieldCheck },
  { key: 'activeUsers', label: 'Active', color: 'text-[#247A56]', icon: Check },
  { key: 'disabledUsers', label: 'Disabled', color: 'text-[#B9473D]', icon: Ban },
];

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short', day: 'numeric' }).format(date);
}

function roleLabel(user) {
  if (user.isSuperAdmin) return 'Seed Admin';
  return user.role === 'admin' ? 'Admin' : 'Student';
}

function UserModal({ user, onClose }) {
  if (!user) return null;
  const details = [
    ['Email', user.email],
    ['Role', roleLabel(user)],
    ['Status', user.isActive ? 'Active' : 'Disabled'],
    ['Registered', formatDate(user.createdAt)],
    ['USN', user.usn || '—'],
    ['Department', user.department || '—'],
    ['Branch', user.branchCode || '—'],
    ['Year / semester', [user.year, user.semester].filter(Boolean).join(' · ') || '—'],
    ['Section / batch', [user.section, user.batch].filter(Boolean).join(' · ') || '—'],
    ['Phone', user.phone || '—'],
  ];

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/55 p-4" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section role="dialog" aria-modal="true" aria-labelledby="user-details-title" className="w-full max-w-lg rounded-2xl border border-[#E5E0D6] bg-white p-5 shadow-2xl sm:p-7">
        <div className="flex items-start justify-between gap-4 border-b border-[#E5E0D6] pb-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8F5F00]">Account details</p>
            <h2 id="user-details-title" className="mt-1 text-xl font-bold text-[#171715]">{user.name}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close account details" className="rounded-lg p-2 text-stone-500 hover:bg-stone-100 hover:text-stone-900"><X className="h-4 w-4" /></button>
        </div>
        <dl className="mt-5 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
          {details.map(([label, value]) => (
            <div key={label} className="min-w-0">
              <dt className="text-[10px] font-semibold uppercase tracking-wider text-[#77736A]">{label}</dt>
              <dd className="mt-1 break-words text-sm text-[#292722]">{value}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}

function ConfirmModal({ action, user, busy, onCancel, onConfirm }) {
  if (!action || !user) return null;
  const config = ACTION_DETAILS[action];
  const Icon = config.icon;
  const buttonTone = {
    amber: 'bg-[#D99800] text-[#171715] hover:bg-[#C48700]',
    stone: 'bg-[#292722] text-white hover:bg-[#171715]',
    red: 'bg-[#B9473D] text-white hover:bg-[#9E352C]',
    green: 'bg-[#247A56] text-white hover:bg-[#1E6548]',
  }[config.tone];

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/55 p-4" onMouseDown={(event) => event.target === event.currentTarget && !busy && onCancel()}>
      <section role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" className="w-full max-w-md rounded-2xl border border-[#E5E0D6] bg-white p-6 shadow-2xl">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F5F2EA] text-[#57534E]"><Icon className="h-5 w-5" /></div>
        <h2 id="confirm-title" className="mt-4 text-xl font-bold text-[#171715]">{config.title}</h2>
        <p className="mt-2 text-sm leading-6 text-[#57534E]">{config.description}</p>
        <div className="mt-4 rounded-xl bg-[#FCFBF7] p-3 text-sm">
          <p className="font-semibold text-[#171715]">{user.name}</p>
          <p className="mt-0.5 text-[#77736A]">{user.email}</p>
        </div>
        <div className="mt-6 flex flex-col-reverse justify-end gap-2 sm:flex-row">
          <button type="button" disabled={busy} onClick={onCancel} className="rounded-xl border border-[#D8D2C6] px-4 py-2.5 text-sm font-semibold text-[#57534E] hover:bg-[#FCFBF7] disabled:opacity-60">Cancel</button>
          <button type="button" disabled={busy} onClick={onConfirm} className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold disabled:opacity-60 ${buttonTone}`}>
            {busy && <LoaderCircle className="h-4 w-4 animate-spin" />}
            {config.label}
          </button>
        </div>
      </section>
    </div>
  );
}

export default function SuperAdminUsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ totalUsers: 0, students: 0, admins: 0, activeUsers: 0, disabledUsers: 0 });
  const [pagination, setPagination] = useState({ page: 1, pages: 0, total: 0 });
  const [searchDraft, setSearchDraft] = useState('');
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [pendingAction, setPendingAction] = useState(null);
  const [actionBusy, setActionBusy] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailsLoadingId, setDetailsLoadingId] = useState('');

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await superAdminApi.listUsers({
        search: search || undefined,
        role: role || undefined,
        status: status || undefined,
        page,
        limit: PAGE_SIZE,
      });
      setUsers(result.users || []);
      setStats(result.stats || {});
      setPagination(result.pagination || { page, pages: 0, total: 0 });
    } catch (requestError) {
      setError(requestError.message || 'Unable to load user accounts.');
    } finally {
      setLoading(false);
    }
  }, [page, role, search, status]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const currentUserId = useMemo(() => String(currentUser?._id || currentUser?.id || ''), [currentUser]);

  const submitSearch = (event) => {
    event.preventDefault();
    setPage(1);
    setSearch(searchDraft.trim());
    setNotice('');
  };

  const showDetails = async (target) => {
    const id = String(target._id || target.id);
    setDetailsLoadingId(id);
    setError('');
    try {
      setSelectedUser(await superAdminApi.getUser(id));
    } catch (requestError) {
      setError(requestError.message || 'Unable to load account details.');
    } finally {
      setDetailsLoadingId('');
    }
  };

  const confirmAction = async () => {
    if (!pendingAction) return;
    setActionBusy(true);
    setError('');
    setNotice('');
    try {
      const response = await superAdminApi[pendingAction.action](pendingAction.id);
      setNotice(response.message || 'Account updated.');
      setPendingAction(null);
      await loadUsers();
    } catch (requestError) {
      setError(requestError.message || 'Unable to update this account.');
    } finally {
      setActionBusy(false);
    }
  };

  const clearFilters = () => {
    setSearchDraft('');
    setSearch('');
    setRole('');
    setStatus('');
    setPage(1);
    setNotice('');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F2EA] text-[#171715]">
      <AdminNav />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="mb-7 flex flex-col gap-4 border-b border-[#E5E0D6] pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link to="/admin" className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#77736A] transition hover:text-[#8F5F00]"><ArrowLeft className="h-3.5 w-3.5" /> Back to dashboard</Link>
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8F5F00]"><ShieldCheck className="h-4 w-4" /> Seed Admin controls</div>
            <h1 className="mt-2 font-serif text-3xl font-bold tracking-tight sm:text-4xl">User Management</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#57534E]">Search accounts, review access, and manage student and admin roles. Changes revoke the affected user’s current session.</p>
          </div>
          <div className="inline-flex items-center gap-2 self-start rounded-xl border border-[#D8C27E] bg-[#FFF8E3] px-3 py-2 text-xs font-semibold text-[#765000] sm:self-auto"><ShieldCheck className="h-4 w-4" /> Protected Seed Admin area</div>
        </div>

        {error && <div role="alert" className="mb-5 flex items-start gap-2 rounded-xl border border-[#B9473D]/30 bg-[#FDF0EE] px-4 py-3 text-sm text-[#9E352C]"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><span>{error}</span></div>}
        {notice && <div role="status" className="mb-5 flex items-center gap-2 rounded-xl border border-[#247A56]/25 bg-[#EAF4EE] px-4 py-3 text-sm text-[#1E6B4B]"><Check className="h-4 w-4 shrink-0" /><span>{notice}</span></div>}

        <section aria-label="User account statistics" className="mb-7 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {STAT_CARDS.map(({ key, label, color, icon: Icon }) => (
            <article key={key} className="rounded-2xl border border-[#E5E0D6] bg-white p-4 shadow-xs sm:p-5">
              <div className="flex items-center justify-between gap-2"><span className="text-xs font-medium text-[#77736A]">{label}</span><Icon className={`h-4 w-4 ${color}`} /></div>
              <div className={`mt-3 text-2xl font-bold tabular-nums ${color}`}>{(stats[key] ?? 0).toLocaleString()}</div>
            </article>
          ))}
        </section>

        <section className="overflow-hidden rounded-2xl border border-[#E5E0D6] bg-white shadow-editorial">
          <div className="border-b border-[#E5E0D6] p-4 sm:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="font-serif text-xl font-bold">Registered accounts</h2>
                <p className="mt-1 text-xs text-[#77736A]">{pagination.total ?? 0} account{pagination.total === 1 ? '' : 's'} found</p>
              </div>
              <form onSubmit={submitSearch} className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
                <label className="relative min-w-0 flex-1 sm:min-w-[230px]">
                  <span className="sr-only">Search by name or email</span>
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#99948A]" />
                  <input value={searchDraft} onChange={(event) => setSearchDraft(event.target.value)} maxLength={100} placeholder="Search name or email" className="h-10 w-full rounded-xl border border-[#D8D2C6] bg-white pl-9 pr-3 text-sm outline-none transition focus:border-[#B88A1A] focus:ring-2 focus:ring-[#F2A900]/15" />
                </label>
                <button type="submit" className="h-10 rounded-xl bg-[#292722] px-4 text-sm font-semibold text-white transition hover:bg-[#171715]">Search</button>
              </form>
            </div>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
              <label className="flex-1 sm:flex-none">
                <span className="sr-only">Filter by role</span>
                <select value={role} onChange={(event) => { setRole(event.target.value); setPage(1); }} className="h-10 w-full min-w-[155px] rounded-xl border border-[#D8D2C6] bg-white px-3 text-sm text-[#292722] outline-none focus:border-[#B88A1A]">
                  <option value="">All roles</option><option value="student">Students</option><option value="admin">Admins</option><option value="super_admin">Seed Admin</option>
                </select>
              </label>
              <label className="flex-1 sm:flex-none">
                <span className="sr-only">Filter by account status</span>
                <select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} className="h-10 w-full min-w-[155px] rounded-xl border border-[#D8D2C6] bg-white px-3 text-sm text-[#292722] outline-none focus:border-[#B88A1A]">
                  <option value="">All statuses</option><option value="active">Active</option><option value="disabled">Disabled</option>
                </select>
              </label>
              {(search || role || status) && <button type="button" onClick={clearFilters} className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl px-3 text-sm font-medium text-[#77736A] hover:bg-[#F5F2EA] hover:text-[#292722]"><X className="h-3.5 w-3.5" /> Clear filters</button>}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="border-b border-[#E5E0D6] bg-[#FCFBF7] text-[10px] uppercase tracking-wider text-[#77736A]">
                <tr><th className="px-5 py-3.5 font-semibold">User</th><th className="px-5 py-3.5 font-semibold">Role</th><th className="px-5 py-3.5 font-semibold">Status</th><th className="px-5 py-3.5 font-semibold">Registered</th><th className="px-5 py-3.5 text-right font-semibold">Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-[#E5E0D6]/70">
                {loading && <tr><td colSpan={5} className="px-5 py-12 text-center text-sm text-[#77736A]"><span className="inline-flex items-center gap-2"><LoaderCircle className="h-4 w-4 animate-spin" /> Loading accounts…</span></td></tr>}
                {!loading && users.length === 0 && <tr><td colSpan={5} className="px-5 py-12 text-center"><Users className="mx-auto h-6 w-6 text-[#AAA49A]" /><p className="mt-2 text-sm font-medium text-[#57534E]">No accounts match these filters.</p><p className="mt-1 text-xs text-[#77736A]">Adjust the search or clear the filters to see more users.</p></td></tr>}
                {!loading && users.map((target) => {
                  const id = String(target._id || target.id);
                  const isSelf = id === currentUserId;
                  const isProtected = target.isSuperAdmin === true;
                  const busyDetails = detailsLoadingId === id;
                  return (
                    <tr key={id} className="align-middle transition-colors hover:bg-[#FCFBF7]">
                      <td className="px-5 py-4">
                        <div className="font-semibold text-[#171715]">{target.name || 'Unnamed user'}{isSelf && <span className="ml-2 text-[10px] font-medium text-[#77736A]">You</span>}</div>
                        <div className="mt-0.5 text-xs text-[#77736A]">{target.email}</div>
                      </td>
                      <td className="px-5 py-4"><span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${isProtected ? 'bg-[#FFF3C8] text-[#765000]' : target.role === 'admin' ? 'bg-[#F2EBDD] text-[#725318]' : 'bg-[#EAF2F5] text-[#296B87]'}`}>{isProtected && <ShieldCheck className="h-3 w-3" />}{roleLabel(target)}</span></td>
                      <td className="px-5 py-4"><span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${target.isActive ? 'text-[#247A56]' : 'text-[#B9473D]'}`}><span className={`h-1.5 w-1.5 rounded-full ${target.isActive ? 'bg-[#247A56]' : 'bg-[#B9473D]'}`} />{target.isActive ? 'Active' : 'Disabled'}</span></td>
                      <td className="px-5 py-4 text-xs tabular-nums text-[#57534E]">{formatDate(target.createdAt)}</td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-1.5">
                          <button type="button" disabled={busyDetails} onClick={() => showDetails(target)} title="View account details" className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#D8D2C6] px-2.5 text-xs font-medium text-[#57534E] transition hover:bg-[#F5F2EA] disabled:opacity-60"><Eye className="h-3.5 w-3.5" /><span>Details</span></button>
                          {!isProtected && !isSelf && (target.role === 'student' ? (
                            <button type="button" onClick={() => setPendingAction({ id, action: 'promoteUser', user: target })} title="Promote student to admin" className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#D8C27E] bg-[#FFF8E3] px-2.5 text-xs font-semibold text-[#765000] transition hover:bg-[#FFF1C5]"><UserRoundCheck className="h-3.5 w-3.5" /><span>Promote</span></button>
                          ) : (
                            <button type="button" onClick={() => setPendingAction({ id, action: 'demoteUser', user: target })} title="Demote admin to student" className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#D8D2C6] px-2.5 text-xs font-semibold text-[#57534E] transition hover:bg-[#F5F2EA]"><UserRoundMinus className="h-3.5 w-3.5" /><span>Demote</span></button>
                          ))}
                          {!isProtected && !isSelf && (target.isActive ? (
                            <button type="button" onClick={() => setPendingAction({ id, action: 'disableUser', user: target })} title="Disable account" aria-label={`Disable ${target.name}`} className="inline-flex h-8 items-center justify-center rounded-lg border border-[#E5C5C1] px-2.5 text-xs font-semibold text-[#A13E35] transition hover:bg-[#FDF0EE]"><ShieldOff className="h-3.5 w-3.5" /></button>
                          ) : (
                            <button type="button" onClick={() => setPendingAction({ id, action: 'enableUser', user: target })} title="Re-enable account" aria-label={`Re-enable ${target.name}`} className="inline-flex h-8 items-center justify-center rounded-lg border border-[#B7D7C7] px-2.5 text-xs font-semibold text-[#1E6B4B] transition hover:bg-[#EAF4EE]"><Check className="h-3.5 w-3.5" /></button>
                          ))}
                          {(isProtected || isSelf) && <span className="px-2 py-1.5 text-[11px] font-medium text-[#99948A]">Protected</span>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 border-t border-[#E5E0D6] bg-[#FCFBF7] px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <p className="text-xs text-[#77736A]">Page {Math.max(1, pagination.page || page)} of {Math.max(1, pagination.pages || 0)}</p>
            <div className="flex items-center justify-end gap-2">
              <button type="button" disabled={loading || page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))} className="inline-flex h-9 items-center gap-1 rounded-lg border border-[#D8D2C6] px-3 text-xs font-semibold text-[#57534E] hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"><ChevronLeft className="h-4 w-4" /> Previous</button>
              <button type="button" disabled={loading || page >= (pagination.pages || 0)} onClick={() => setPage((current) => current + 1)} className="inline-flex h-9 items-center gap-1 rounded-lg border border-[#D8D2C6] px-3 text-xs font-semibold text-[#57534E] hover:bg-white disabled:cursor-not-allowed disabled:opacity-40">Next <ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <UserModal user={selectedUser} onClose={() => setSelectedUser(null)} />
      <ConfirmModal
        action={pendingAction?.action}
        user={pendingAction?.user}
        busy={actionBusy}
        onCancel={() => setPendingAction(null)}
        onConfirm={confirmAction}
      />
    </div>
  );
}
