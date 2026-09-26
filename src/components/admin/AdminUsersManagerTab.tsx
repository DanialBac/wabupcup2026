import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Edit2,
  Trash2,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Search,
  Key,
  Mail,
  Phone,
  CheckCircle2,
  AlertTriangle,
  X,
  Eye,
  EyeOff,
  RefreshCw,
  UserCheck,
  Smartphone,
} from 'lucide-react';
import { useTournament } from '../../context/TournamentContext';
import { AdminRole, AdminUser } from '../../types';

const AVATAR_COLORS = [
  { label: 'Merah Merah', class: 'bg-red-600', border: 'border-red-500', hex: '#dc2626' },
  { label: 'Biru Samudera', class: 'bg-blue-600', border: 'border-blue-500', hex: '#2563eb' },
  { label: 'Hijau Zamrud', class: 'bg-emerald-600', border: 'border-emerald-500', hex: '#059669' },
  { label: 'Ungu Royal', class: 'bg-purple-600', border: 'border-purple-500', hex: '#9333ea' },
  { label: 'Amber Emas', class: 'bg-amber-600', border: 'border-amber-500', hex: '#d97706' },
  { label: 'Sian Es', class: 'bg-cyan-600', border: 'border-cyan-500', hex: '#0891b2' },
  { label: 'Mawar Pink', class: 'bg-rose-600', border: 'border-rose-500', hex: '#e11d48' },
  { label: 'Indigo Gelap', class: 'bg-indigo-600', border: 'border-indigo-500', hex: '#4f46e5' },
];

const ROLE_DEFINITIONS: Record<AdminRole, { label: string; desc: string; badgeClass: string; icon: React.ReactNode }> = {
  SUPERADMIN: {
    label: 'Super Admin',
    desc: 'Akses penuh ke seluruh modul, pengaturan turnamen, sistem database, dan kelola user.',
    badgeClass: 'bg-red-950/80 text-red-400 border-red-800',
    icon: <ShieldAlert className="w-3.5 h-3.5 text-red-400" />,
  },
  PANITIA_INTI: {
    label: 'Panitia Inti',
    desc: 'CRUD seluruh menu turnamen (Pendaftaran, Sistem Acak, Jadwal, Kategori, Sponsor, Pengaturan), kecuali Admin Users dan Database.',
    badgeClass: 'bg-indigo-950/80 text-indigo-400 border-indigo-800',
    icon: <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />,
  },
  PANITIA: {
    label: 'Panitia Inti (Legacy)',
    desc: 'CRUD seluruh menu turnamen (Pendaftaran, Sistem Acak, Jadwal, Kategori, Sponsor, Pengaturan), kecuali Admin Users dan Database.',
    badgeClass: 'bg-blue-950/80 text-blue-400 border-blue-800',
    icon: <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />,
  },
  PANITIA_UMUM: {
    label: 'Panitia Umum',
    desc: 'CRUD Pendaftaran Tim & Jadwal Pertandingan, serta melihat Ringkasan & Statistik.',
    badgeClass: 'bg-emerald-950/80 text-emerald-400 border-emerald-800',
    icon: <Users className="w-3.5 h-3.5 text-emerald-400" />,
  },
  WASIT: {
    label: 'Wasit & TD',
    desc: 'Update skor langsung, pencatatan pencetak gol & kartu, dan konfirmasi hasil pertandingan.',
    badgeClass: 'bg-amber-950/80 text-amber-400 border-amber-800',
    icon: <Shield className="w-3.5 h-3.5 text-amber-400" />,
  },
  OPERATOR: {
    label: 'Operator Live',
    desc: 'Pencatatan statistik pertandingan dan pembaruan menit laga real-time.',
    badgeClass: 'bg-cyan-950/80 text-cyan-400 border-cyan-800',
    icon: <UserCheck className="w-3.5 h-3.5 text-cyan-400" />,
  },
};

export const AdminUsersManagerTab: React.FC = () => {
  const { adminUsers, addAdminUser, updateAdminUser, deleteAdminUser, currentAdmin, isSyncingWithServer, refreshDataFromServer, dbStatus } = useTournament();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<'ALL' | AdminRole>('ALL');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [deletingUser, setDeletingUser] = useState<AdminUser | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields State
  const [formUsername, setFormUsername] = useState('');
  const [formFullName, setFormFullName] = useState('');
  const [formRole, setFormRole] = useState<AdminRole>('PANITIA_INTI');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formAvatarColor, setFormAvatarColor] = useState('bg-red-600');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const [successToast, setSuccessToast] = useState('');

  const triggerToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(''), 4000);
  };

  const openAddModal = () => {
    setFormUsername('');
    setFormFullName('');
    setFormRole('PANITIA_INTI');
    setFormEmail('');
    setFormPhone('');
    setFormPassword('');
    setFormAvatarColor('bg-indigo-600');
    setShowPassword(false);
    setFormError('');
    setIsAddModalOpen(true);
  };

  const openEditModal = (user: AdminUser) => {
    setEditingUser(user);
    setFormUsername(user.username);
    setFormFullName(user.fullName);
    setFormRole(user.role);
    setFormEmail(user.email || '');
    setFormPhone(user.phone || '');
    setFormPassword('');
    setFormAvatarColor(user.avatarColor || 'bg-red-600');
    setShowPassword(false);
    setFormError('');
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUsername = formUsername.trim().toLowerCase().replace(/[^a-z0-9_.]/g, '');
    if (!cleanUsername) {
      setFormError('Username wajib diisi dengan huruf, angka, atau titik.');
      return;
    }
    if (adminUsers.some(u => u.username.toLowerCase() === cleanUsername)) {
      setFormError(`Username @${cleanUsername} sudah terdaftar. Silakan pilih username lain.`);
      return;
    }
    if (!formFullName.trim()) {
      setFormError('Nama lengkap admin wajib diisi.');
      return;
    }
    if (!formPassword.trim()) {
      setFormError('Password wajib diisi.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await addAdminUser({
        username: cleanUsername,
        fullName: formFullName.trim(),
        role: formRole,
        email: formEmail.trim(),
        phone: formPhone.trim(),
        avatarColor: formAvatarColor,
        password: formPassword.trim(),
      });

      setIsAddModalOpen(false);
      if (res.savedToDatabase) {
        triggerToast(`Admin @${cleanUsername} berhasil ditambahkan dan disimpan langsung ke database online!`);
      } else {
        triggerToast(`Admin @${cleanUsername} berhasil ditambahkan!`);
      }
    } catch (err: any) {
      setFormError(err?.message || 'Gagal menambahkan admin');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    if (!formFullName.trim()) {
      setFormError('Nama lengkap wajib diisi.');
      return;
    }

    const cleanUsername = formUsername.trim().toLowerCase().replace(/[^a-z0-9_.]/g, '');
    if (!cleanUsername) {
      setFormError('Username wajib diisi.');
      return;
    }

    // Check duplicate username if changed
    if (
      cleanUsername !== editingUser.username.toLowerCase() &&
      adminUsers.some(u => u.id !== editingUser.id && u.username.toLowerCase() === cleanUsername)
    ) {
      setFormError(`Username @${cleanUsername} sudah digunakan.`);
      return;
    }

    const updated: AdminUser & { password?: string } = {
      ...editingUser,
      username: cleanUsername,
      fullName: formFullName.trim(),
      role: formRole,
      email: formEmail.trim(),
      phone: formPhone.trim(),
      avatarColor: formAvatarColor,
      ...(formPassword.trim() ? { password: formPassword.trim() } : {}),
    };

    setIsSubmitting(true);
    try {
      const res = await updateAdminUser(updated);
      setEditingUser(null);
      if (res.savedToDatabase) {
        triggerToast(`Data admin @${cleanUsername} berhasil diperbarui & disimpan langsung di database online!`);
      } else {
        triggerToast(`Data admin @${cleanUsername} berhasil diperbarui!`);
      }
    } catch (err: any) {
      setFormError(err?.message || 'Gagal memperbarui admin');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingUser) return;
    if (deletingUser.username.toLowerCase() === 'superadmin') {
      alert('Akun Super Admin utama tidak dapat dihapus demi keamanan!');
      setDeletingUser(null);
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await deleteAdminUser(deletingUser.id);
      if (res.savedToDatabase) {
        triggerToast(`Admin @${deletingUser.username} telah dihapus dari database online.`);
      } else {
        triggerToast(`Admin @${deletingUser.username} telah dihapus.`);
      }
    } catch (err: any) {
      alert(`Gagal menghapus admin: ${err?.message}`);
    } finally {
      setIsSubmitting(false);
      setDeletingUser(null);
    }
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$';
    let res = '';
    for (let i = 0; i < 8; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormPassword(res);
    setShowPassword(true);
  };

  // Filtered admins
  const filteredAdmins = adminUsers.filter(user => {
    const matchesSearch =
      user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (user.phone && user.phone.includes(searchQuery));

    const matchesRole =
      selectedRoleFilter === 'ALL' ||
      user.role === selectedRoleFilter ||
      (selectedRoleFilter === 'PANITIA_INTI' && user.role === 'PANITIA');
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6 animate-fadeIn pb-8">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-3 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl animate-bounce">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span className="text-xs font-bold">{successToast}</span>
        </div>
      )}

      {/* HEADER & ACTION BAR */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-red-600/20 border border-red-500/30 flex items-center justify-center flex-shrink-0 text-red-500">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl sm:text-2xl font-heading font-black uppercase text-white tracking-wide">
                  Manajemen Admin & Operator
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[11px] font-bold border border-slate-700">
                  {adminUsers.length} User
                </span>
                {dbStatus?.connected ? (
                  <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 text-[11px] font-bold border border-emerald-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>Database Online Terhubung</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-amber-950/80 text-amber-400 text-[11px] font-bold border border-amber-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                    <span>Mode Memori / Cache</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Kelola hak akses panitia, wasit, delegasi teknis, dan operator live score turnamen secara terpusat (tersinkronisasi langsung ke database).
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => refreshDataFromServer()}
              disabled={isSyncingWithServer}
              className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center space-x-1.5 transition border border-slate-700"
              title="Sinkronkan dengan Database"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingWithServer ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={openAddModal}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs font-bold flex items-center space-x-2 shadow-lg shadow-red-900/30 transition transform active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              <span>Tambah Admin Baru</span>
            </button>
          </div>
        </div>

        {/* ROLE STATS BADGES */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6 pt-5 border-t border-slate-800">
          {(['SUPERADMIN', 'PANITIA_INTI', 'PANITIA_UMUM', 'WASIT', 'OPERATOR'] as AdminRole[]).map(role => {
            const count = adminUsers.filter(a => a.role === role || (role === 'PANITIA_INTI' && a.role === 'PANITIA')).length;
            const def = ROLE_DEFINITIONS[role];
            return (
              <div
                key={role}
                onClick={() => setSelectedRoleFilter(prev => (prev === role ? 'ALL' : role))}
                className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                  selectedRoleFilter === role
                    ? 'bg-slate-800 border-red-500/50 shadow-md ring-1 ring-red-500/30'
                    : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                    {def.icon}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
                      {def.label}
                    </span>
                    <span className="text-sm font-black text-white">{count} Akun</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FILTER & SEARCH */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Cari berdasarkan nama, @username, email, atau no. hp..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-red-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* ROLE FILTER TABS */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedRoleFilter('ALL')}
            className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              selectedRoleFilter === 'ALL'
                ? 'bg-red-600 text-white'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Semua ({adminUsers.length})
          </button>
          {(['SUPERADMIN', 'PANITIA', 'WASIT', 'OPERATOR'] as AdminRole[]).map(role => (
            <button
              key={role}
              onClick={() => setSelectedRoleFilter(role)}
              className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                selectedRoleFilter === role
                  ? 'bg-red-600 text-white'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {ROLE_DEFINITIONS[role].label}
            </button>
          ))}
        </div>
      </div>

      {/* ADMIN USERS LIST TABLE */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-950 text-slate-400 font-bold uppercase border-b border-slate-800">
                <th className="py-4 px-5">Admin User</th>
                <th className="py-4 px-5">Role Akses</th>
                <th className="py-4 px-5">Kontak (Email & WA)</th>
                <th className="py-4 px-5">Tanggal Dibuat</th>
                <th className="py-4 px-5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredAdmins.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="font-medium text-xs">Tidak ada admin user yang cocok dengan filter pencarian.</p>
                  </td>
                </tr>
              ) : (
                filteredAdmins.map(adm => {
                  const roleDef = ROLE_DEFINITIONS[adm.role] || ROLE_DEFINITIONS.PANITIA;
                  const isCurrentLogged = currentAdmin?.id === adm.id || currentAdmin?.username === adm.username;
                  const isMasterSuperadmin = adm.username.toLowerCase() === 'superadmin';

                  return (
                    <tr key={adm.id} className="hover:bg-slate-800/50 transition">
                      <td className="py-4 px-5">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-9 h-9 rounded-xl ${
                              adm.avatarColor || 'bg-red-600'
                            } flex items-center justify-center text-white font-bold text-sm shadow-md flex-shrink-0`}
                          >
                            {adm.fullName ? adm.fullName.charAt(0).toUpperCase() : adm.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-white text-sm">{adm.fullName}</span>
                              {isCurrentLogged && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-emerald-950 text-emerald-400 border border-emerald-800">
                                  Anda
                                </span>
                              )}
                            </div>
                            <span className="font-mono text-red-400 text-xs">@{adm.username}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-5">
                        <span
                          className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold border ${roleDef.badgeClass}`}
                        >
                          {roleDef.icon}
                          <span>{roleDef.label}</span>
                        </span>
                      </td>

                      <td className="py-4 px-5">
                        <div className="space-y-1">
                          {adm.email ? (
                            <div className="flex items-center space-x-1.5 text-slate-300">
                              <Mail className="w-3.5 h-3.5 text-slate-500" />
                              <span>{adm.email}</span>
                            </div>
                          ) : (
                            <span className="text-slate-500 italic">- Tidak ada email -</span>
                          )}
                          {adm.phone ? (
                            <div className="flex items-center space-x-1.5 text-slate-400">
                              <Smartphone className="w-3.5 h-3.5 text-emerald-500" />
                              <span>{adm.phone}</span>
                            </div>
                          ) : null}
                        </div>
                      </td>

                      <td className="py-4 px-5 text-slate-400 font-mono text-[11px]">
                        {adm.createdAt || '2026-08-01'}
                      </td>

                      <td className="py-4 px-5 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => openEditModal(adm)}
                            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-400 hover:text-blue-300 transition border border-slate-700"
                            title="Edit Data Admin"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {!isMasterSuperadmin ? (
                            <button
                              onClick={() => setDeletingUser(adm)}
                              className="p-2 rounded-xl bg-slate-800 hover:bg-red-950/80 text-red-400 hover:text-red-300 transition border border-slate-700 hover:border-red-800"
                              title="Hapus Admin"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <span
                              className="p-2 rounded-xl bg-slate-950 text-slate-600 border border-slate-800 cursor-not-allowed opacity-50"
                              title="Akun Master Superadmin terlindungi"
                            >
                              <Shield className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: TAMBAH ADMIN BARU */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-950">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-red-600/20 text-red-500 flex items-center justify-center border border-red-500/30">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white uppercase tracking-wide">Tambah Admin Baru</h3>
                  <p className="text-[11px] text-slate-400">Buat akun akses baru untuk panitia atau operator turnamen.</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {formError && (
                <div className="p-3 rounded-xl bg-red-950/80 border border-red-800 text-red-300 text-xs flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Username */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1.5">
                    Username <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-xs">@</span>
                    <input
                      type="text"
                      required
                      value={formUsername}
                      onChange={e => setFormUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, ''))}
                      placeholder="contoh: panitia.futsal"
                      className="w-full pl-7 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-red-500"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">Hanya huruf kecil, angka, titik, atau underscore.</p>
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[11px] font-bold text-slate-300 uppercase">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={generateRandomPassword}
                      className="text-[10px] text-red-400 hover:text-red-300 font-bold"
                    >
                      Acak Password
                    </button>
                  </div>
                  <div className="relative">
                    <Key className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formPassword}
                      onChange={e => setFormPassword(e.target.value)}
                      placeholder="Password login..."
                      className="w-full pl-8 pr-9 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-red-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(prev => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1.5">
                  Nama Lengkap Admin / Petugas <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formFullName}
                  onChange={e => setFormFullName(e.target.value)}
                  placeholder="contoh: Muhammad Rizky (Sekretariat)"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-red-500"
                />
              </div>

              {/* Role Selector */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1.5">
                  Role Akses & Kewenangan
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(['SUPERADMIN', 'PANITIA_INTI', 'PANITIA_UMUM', 'WASIT', 'OPERATOR'] as AdminRole[]).map(role => {
                    const rDef = ROLE_DEFINITIONS[role];
                    const isSelected = formRole === role;
                    return (
                      <div
                        key={role}
                        onClick={() => setFormRole(role)}
                        className={`p-2.5 rounded-xl border cursor-pointer transition ${
                          isSelected
                            ? 'bg-slate-800 border-red-500 ring-1 ring-red-500/30'
                            : 'bg-slate-950 border-slate-800 hover:bg-slate-800/50'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name="role"
                            checked={isSelected}
                            onChange={() => setFormRole(role)}
                            className="text-red-600 focus:ring-0"
                          />
                          <span className="text-xs font-bold text-white">{rDef.label}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 pl-5 leading-tight">{rDef.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1.5">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={formEmail}
                      onChange={e => setFormEmail(e.target.value)}
                      placeholder="admin@email.com"
                      className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1.5">
                    Nomor WhatsApp / HP
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={formPhone}
                      onChange={e => setFormPhone(e.target.value)}
                      placeholder="081234567890"
                      className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>
              </div>

              {/* Avatar Color Picker */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1.5">
                  Warna Avatar Profil
                </label>
                <div className="flex items-center space-x-2 flex-wrap gap-y-2">
                  {AVATAR_COLORS.map(c => (
                    <button
                      key={c.class}
                      type="button"
                      onClick={() => setFormAvatarColor(c.class)}
                      className={`w-7 h-7 rounded-lg ${c.class} transition transform ${
                        formAvatarColor === c.class
                          ? 'ring-2 ring-white scale-110 shadow-lg'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-lg shadow-red-900/30"
                >
                  Simpan Admin Baru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDIT DATA ADMIN */}
      {/* ========================================================================= */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-950">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
                  <Edit2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white uppercase tracking-wide">
                    Edit Akun Admin: @{editingUser.username}
                  </h3>
                  <p className="text-[11px] text-slate-400">Perbarui profil atau reset password akses admin.</p>
                </div>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {formError && (
                <div className="p-3 rounded-xl bg-red-950/80 border border-red-800 text-red-300 text-xs flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Username */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1.5">
                    Username
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-xs">@</span>
                    <input
                      type="text"
                      required
                      disabled={editingUser.username.toLowerCase() === 'superadmin'}
                      value={formUsername}
                      onChange={e => setFormUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, ''))}
                      className="w-full pl-7 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Password (Optional for Edit) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[11px] font-bold text-slate-300 uppercase">
                      Reset Password
                    </label>
                    <button
                      type="button"
                      onClick={generateRandomPassword}
                      className="text-[10px] text-red-400 hover:text-red-300 font-bold"
                    >
                      Acak Baru
                    </button>
                  </div>
                  <div className="relative">
                    <Key className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formPassword}
                      onChange={e => setFormPassword(e.target.value)}
                      placeholder="Kosongkan jika tak diubah"
                      className="w-full pl-8 pr-9 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-red-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(prev => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1.5">
                  Nama Lengkap Admin / Petugas <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formFullName}
                  onChange={e => setFormFullName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-red-500"
                />
              </div>

              {/* Role Selector */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1.5">
                  Role Akses & Kewenangan
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(['SUPERADMIN', 'PANITIA_INTI', 'PANITIA_UMUM', 'WASIT', 'OPERATOR'] as AdminRole[]).map(role => {
                    const rDef = ROLE_DEFINITIONS[role];
                    const isSelected = formRole === role || (role === 'PANITIA_INTI' && formRole === 'PANITIA');
                    return (
                      <div
                        key={role}
                        onClick={() => setFormRole(role)}
                        className={`p-2.5 rounded-xl border cursor-pointer transition ${
                          isSelected
                            ? 'bg-slate-800 border-blue-500 ring-1 ring-blue-500/30'
                            : 'bg-slate-950 border-slate-800 hover:bg-slate-800/50'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name="role_edit"
                            checked={isSelected}
                            onChange={() => setFormRole(role)}
                            className="text-blue-600 focus:ring-0"
                          />
                          <span className="text-xs font-bold text-white">{rDef.label}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 pl-5 leading-tight">{rDef.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1.5">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={formEmail}
                      onChange={e => setFormEmail(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1.5">
                    Nomor WhatsApp / HP
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={formPhone}
                      onChange={e => setFormPhone(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>
              </div>

              {/* Avatar Color Picker */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1.5">
                  Warna Avatar Profil
                </label>
                <div className="flex items-center space-x-2 flex-wrap gap-y-2">
                  {AVATAR_COLORS.map(c => (
                    <button
                      key={c.class}
                      type="button"
                      onClick={() => setFormAvatarColor(c.class)}
                      className={`w-7 h-7 rounded-lg ${c.class} transition transform ${
                        formAvatarColor === c.class
                          ? 'ring-2 ring-white scale-110 shadow-lg'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-lg shadow-blue-900/30"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: KONFIRMASI HAPUS ADMIN */}
      {/* ========================================================================= */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-red-600/20 text-red-500 flex items-center justify-center border border-red-500/30 mx-auto">
              <Trash2 className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">Hapus Admin User?</h3>
              <p className="text-xs text-slate-400 mt-1">
                Apakah Anda yakin ingin menghapus akun admin{' '}
                <span className="text-white font-bold">{deletingUser.fullName}</span> (
                <span className="font-mono text-red-400">@{deletingUser.username}</span>)?
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-left text-xs text-slate-300 space-y-1">
              <div>
                <span className="text-slate-500">Role:</span>{' '}
                <span className="font-bold text-white">{ROLE_DEFINITIONS[deletingUser.role]?.label || deletingUser.role}</span>
              </div>
              {deletingUser.email && (
                <div>
                  <span className="text-slate-500">Email:</span> {deletingUser.email}
                </div>
              )}
            </div>

            <div className="flex items-center justify-center space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingUser(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition flex-1"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-lg shadow-red-900/30 flex-1"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
