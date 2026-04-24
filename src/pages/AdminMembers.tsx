import React, { useState, useEffect } from 'react';
import { getUsers, updateUserProfile, getMembershipInquiries, updateMembershipInquiryStatus, deleteMembershipInquiry, deleteUser } from '../services/db';
import { UserProfile, UserRole, UserTitle, Ministry, UserStatus, MembershipStatus, MembershipInquiry } from '../types';
import { formatDate, cn } from '../lib/utils';
import { 
  Search, 
  Filter, 
  Shield, 
  User, 
  Check, 
  X, 
  Loader2, 
  UserCheck, 
  UserX, 
  ShieldCheck,
  Clock, 
  Info, 
  BookOpen,
  Mail,
  Phone,
  Calendar,
  Trash2,
  MessageSquare,
  PenTool,
  Users as UsersIcon
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ROLE_INFO } from '../constants';

const ROLES: UserRole[] = ['super_admin', 'church_admin', 'ministry_leader', 'member'];
const TITLES: UserTitle[] = ['Pastor', 'Elder', 'Deacon', 'Deaconess', 'Member', 'Guest'];
const STATUSES: UserStatus[] = ['pending', 'active', 'suspended'];
const MEMBERSHIP_STATUSES: MembershipStatus[] = ['visitor', 'applicant', 'official_member'];
const MINISTRIES: Ministry[] = [
  'Young at Hearts',
  'YAH (Young Adults Huddle)',
  'Ignite One Youth Fellowship',
  'The Exemplary Husband (Sherpas)',
  'Circle of Women',
  'Superbook Kids (SBK)',
  'Harkel (Music Team)',
  'Audio Video (AV)'
];

type Tab = 'members' | 'inquiries';

export default function AdminMembers() {
  const { isSuperAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('members');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [inquiries, setInquiries] = useState<MembershipInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [membershipFilter, setMembershipFilter] = useState<string>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === 'members') {
      fetchUsers();
    } else {
      fetchInquiries();
    }
  }, [activeTab]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const data = await getMembershipInquiries();
      setInquiries(data);
    } catch (error) {
      console.error('Error fetching inquiries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (userId: string, updates: Partial<UserProfile>) => {
    setUpdatingId(userId);
    try {
      await updateUserProfile(userId, updates);
      await fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user. Check permissions.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleUpdateInquiryStatus = async (id: string, status: MembershipInquiry['status']) => {
    setUpdatingId(id);
    try {
      await updateMembershipInquiryStatus(id, status);
      await fetchInquiries();
    } catch (error) {
      console.error('Error updating inquiry:', error);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteInquiry = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this inquiry?')) return;
    setUpdatingId(id);
    try {
      await deleteMembershipInquiry(id);
      await fetchInquiries();
    } catch (error) {
      console.error('Error deleting inquiry:', error);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteMember = async (userId: string) => {
    if (!isSuperAdmin) {
      alert('Only Super Admins can delete members.');
      return;
    }
    if (!window.confirm('Are you sure you want to PERMANENTLY DELETE this member? This action cannot be undone.')) return;
    
    setUpdatingId(userId);
    console.log('Attempting to delete user:', userId);
    try {
      await deleteUser(userId);
      await fetchUsers();
      alert('Member deleted successfully.');
    } catch (error: any) {
      console.error('Error deleting user:', error);
      const message = error.message || JSON.stringify(error);
      alert(`Failed to delete user. ${message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredUsers = users.filter(user => {
    const name = user.displayName || '';
    const email = user.email || '';
    const username = user.username || '';
    const matchesSearch = 
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    const matchesMembership = membershipFilter === 'all' || user.membershipStatus === membershipFilter;
    return matchesSearch && matchesRole && matchesStatus && matchesMembership;
  });

  const filteredInquiries = inquiries.filter(inquiry => {
    const matchesSearch = 
      inquiry.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const pendingCount = users.filter(u => u.status === 'pending').length;
  const newInquiriesCount = inquiries.filter(i => i.status === 'new').length;

  if (loading && users.length === 0 && inquiries.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-maroon" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Member Management</h1>
          <p className="text-slate-600">Manage members and track interest from prospective members.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {pendingCount > 0 && (
            <div className="bg-amber-50 border border-amber-100 px-4 py-2 rounded-xl flex items-center gap-3 flex-1 sm:flex-none">
              <Clock className="h-5 w-5 text-amber-600" />
              <span className="text-sm font-bold text-amber-900 whitespace-nowrap">{pendingCount} Pending Approvals</span>
            </div>
          )}
          {newInquiriesCount > 0 && (
            <div className="bg-purple-50 border border-purple-100 px-4 py-2 rounded-xl flex items-center gap-3 flex-1 sm:flex-none">
              <MessageSquare className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-bold text-purple-900 whitespace-nowrap">{newInquiriesCount} New Inquiries</span>
            </div>
          )}
        </div>
      </header>

      {/* Tabs */}
      <div className="flex overflow-x-auto pb-1 -mb-1 scrollbar-hide">
        <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit whitespace-nowrap">
          <button
            onClick={() => setActiveTab('members')}
            className={cn(
              "px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2",
              activeTab === 'members' 
                ? "bg-white text-maroon shadow-sm" 
                : "text-slate-500 hover:text-slate-700"
            )}
          >
            <UsersIcon className="h-4 w-4" />
            Members
          </button>
          <button
            onClick={() => setActiveTab('inquiries')}
            className={cn(
              "px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2",
              activeTab === 'inquiries' 
                ? "bg-white text-maroon shadow-sm" 
                : "text-slate-500 hover:text-slate-700"
            )}
          >
            <MessageSquare className="h-4 w-4" />
            Inquiries
            {newInquiriesCount > 0 && (
              <span className="bg-maroon text-white text-[10px] px-1.5 py-0.5 rounded-full">
                {newInquiriesCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder={activeTab === 'members' ? "Search members..." : "Search inquiries..."}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-maroon/20 focus:border-maroon outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {activeTab === 'members' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <select
                className="w-full pl-10 pr-8 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-maroon/20 focus:border-maroon outline-none appearance-none transition-all"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">All Roles</option>
                {ROLES.map(role => (
                  <option key={role} value={role}>{role.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <select
                className="w-full pl-10 pr-8 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-maroon/20 focus:border-maroon outline-none appearance-none transition-all"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                {STATUSES.map(status => (
                  <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                ))}
              </select>
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <select
                className="w-full pl-10 pr-8 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-maroon/20 focus:border-maroon outline-none appearance-none transition-all"
                value={membershipFilter}
                onChange={(e) => setMembershipFilter(e.target.value)}
              >
                <option value="all">All Membership</option>
                {MEMBERSHIP_STATUSES.map(m => (
                  <option key={m} value={m}>{m.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {activeTab === 'members' ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Member</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Account</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Title</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Membership</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Class Interest</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Role</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Ministry</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Council</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Min. Editor</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Blog Editor</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredUsers.map((user) => (
                  <tr key={user.uid} className={cn(
                    "hover:bg-slate-50/50 transition-colors",
                    user.status === 'pending' && "bg-amber-50/30"
                  )}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 overflow-hidden">
                          {user.photoURL && user.photoURL !== "" ? (
                            <img src={user.photoURL} alt={user.displayName} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            user.displayName.charAt(0)
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{user.displayName}</p>
                          <p className="text-xs text-slate-500">
                            {user.email?.endsWith('@bcc.family') ? `@${user.username}` : user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                        user.status === 'active' ? "bg-green-100 text-green-700" :
                        user.status === 'pending' ? "bg-amber-100 text-amber-700" :
                        "bg-red-100 text-red-700"
                      )}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-md px-2 py-1 outline-none focus:ring-2 focus:ring-maroon/20"
                        value={user.title || 'Member'}
                        disabled={updatingId === user.uid}
                        onChange={(e) => handleUpdateUser(user.uid, { title: e.target.value as UserTitle })}
                      >
                        {TITLES.map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <select
                          className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-md px-2 py-1 outline-none focus:ring-2 focus:ring-maroon/20"
                          value={user.membershipStatus}
                          disabled={updatingId === user.uid}
                          onChange={(e) => handleUpdateUser(user.uid, { membershipStatus: e.target.value as MembershipStatus })}
                        >
                          {MEMBERSHIP_STATUSES.map(m => (
                            <option key={m} value={m}>
                              {m.replace('_', ' ')}
                            </option>
                          ))}
                        </select>
                        <div className="group relative">
                          <Info className="h-3 w-3 text-slate-300 cursor-help" />
                          <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 w-48 p-2 bg-slate-900 text-white text-[10px] rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 shadow-xl">
                            {user.membershipStatus === 'official_member' ? 'Legally registered member (SEC).' :
                             user.membershipStatus === 'applicant' ? 'Applied for legal membership.' :
                             'Regular attendee (Visitor).'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {user.wantsMembershipClass ? (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-100 text-purple-700 rounded-full text-[10px] font-bold uppercase tracking-wider">
                          <BookOpen className="h-3 w-3" />
                          Interested
                        </div>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <select
                          className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-md px-2 py-1 outline-none focus:ring-2 focus:ring-maroon/20"
                          value={user.role}
                          disabled={updatingId === user.uid || (!isSuperAdmin && user.role === 'super_admin')}
                          onChange={(e) => handleUpdateUser(user.uid, { role: e.target.value as UserRole })}
                        >
                          {ROLES.map(role => (
                            <option key={role} value={role} disabled={role === 'super_admin' && !isSuperAdmin}>
                              {ROLE_INFO[role].label}
                            </option>
                          ))}
                        </select>
                        <div className="group relative">
                          <Info className="h-3 w-3 text-slate-300 cursor-help" />
                          <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 w-48 p-2 bg-slate-900 text-white text-[10px] rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 shadow-xl">
                            {ROLE_INFO[user.role].description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-md px-2 py-1 outline-none focus:ring-2 focus:ring-maroon/20"
                        value={user.ministry || ''}
                        disabled={updatingId === user.uid}
                        onChange={(e) => handleUpdateUser(user.uid, { ministry: e.target.value as Ministry })}
                      >
                        <option value="">None</option>
                        {MINISTRIES.map(m => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleUpdateUser(user.uid, { isCouncilMember: !user.isCouncilMember })}
                        disabled={updatingId === user.uid}
                        className={cn(
                          "p-1.5 rounded-md transition-colors",
                          user.isCouncilMember 
                            ? "bg-green-100 text-green-600 hover:bg-green-200" 
                            : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                        )}
                        title={user.isCouncilMember ? "Remove from Council" : "Add to Council"}
                      >
                        {user.isCouncilMember ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleUpdateUser(user.uid, { isMinistryEditor: !user.isMinistryEditor })}
                        disabled={updatingId === user.uid}
                        className={cn(
                          "p-1.5 rounded-md transition-colors",
                          user.isMinistryEditor 
                            ? "bg-blue-100 text-blue-600 hover:bg-blue-200" 
                            : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                        )}
                        title={user.isMinistryEditor ? "Remove Ministry Editor Access" : "Grant Ministry Editor Access"}
                      >
                        {user.isMinistryEditor ? <ShieldCheck className="h-4 w-4" /> : <X className="h-4 w-4" />}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleUpdateUser(user.uid, { isBlogEditor: !user.isBlogEditor })}
                        disabled={updatingId === user.uid}
                        className={cn(
                          "p-1.5 rounded-md transition-colors",
                          user.isBlogEditor 
                            ? "bg-maroon/10 text-maroon hover:bg-maroon/20" 
                            : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                        )}
                        title={user.isBlogEditor ? "Remove Blog Editor Access" : "Grant Blog Editor Access"}
                      >
                        {user.isBlogEditor ? <PenTool className="h-4 w-4" /> : <X className="h-4 w-4" />}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {updatingId === user.uid ? (
                          <Loader2 className="h-4 w-4 animate-spin text-maroon" />
                        ) : (
                          <>
                            {isSuperAdmin && (user.passwordChangeLocked || (user.passwordChangeCount || 0) > 0) && (
                              <button
                                onClick={() => handleUpdateUser(user.uid, { passwordChangeCount: 0, passwordChangeLocked: false })}
                                className="p-1.5 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 transition-colors"
                                title="Reset Password Tries"
                              >
                                <ShieldCheck className="h-4 w-4" />
                              </button>
                            )}
                            {user.status === 'pending' && (
                              <button
                                onClick={() => handleUpdateUser(user.uid, { status: 'active' })}
                                className="p-1.5 bg-maroon text-white rounded-md hover:bg-maroon/90 transition-colors"
                                title="Approve Member"
                              >
                                <UserCheck className="h-4 w-4" />
                              </button>
                            )}
                            {user.status === 'active' && (
                              <button
                                onClick={() => handleUpdateUser(user.uid, { status: 'suspended' })}
                                className="p-1.5 bg-slate-100 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                title="Suspend Member"
                              >
                                <UserX className="h-4 w-4" />
                              </button>
                            )}
                            {user.status === 'suspended' && (
                              <button
                                onClick={() => handleUpdateUser(user.uid, { status: 'active' })}
                                className="p-1.5 bg-green-100 text-green-600 hover:bg-green-200 rounded-md transition-colors"
                                title="Reactivate Member"
                              >
                                <UserCheck className="h-4 w-4" />
                              </button>
                            )}
                            {isSuperAdmin && (
                              <button
                                onClick={() => handleDeleteMember(user.uid)}
                                className="p-1.5 bg-red-100 text-red-600 hover:bg-red-200 rounded-md transition-colors"
                                title="Delete Member Permanently"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredUsers.length === 0 && (
            <div className="p-12 text-center text-slate-500">
              No members found matching your criteria.
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Prospective Member</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Contact</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Message</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Date</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredInquiries.map((inquiry) => (
                  <tr key={inquiry.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-900">{inquiry.fullName}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-slate-600">
                          <Mail className="h-3 w-3" />
                          {inquiry.email}
                        </div>
                        {inquiry.phone && (
                          <div className="flex items-center gap-2 text-xs text-slate-600">
                            <Phone className="h-3 w-3" />
                            {inquiry.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {inquiry.message ? (
                        <div className="group relative">
                          <p className="text-xs text-slate-600 line-clamp-1 max-w-[200px]">{inquiry.message}</p>
                          <div className="absolute left-0 top-full mt-2 w-64 p-3 bg-slate-900 text-white text-xs rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 shadow-xl">
                            {inquiry.message}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        className={cn(
                          "text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border-none outline-none focus:ring-2 focus:ring-maroon/20",
                          inquiry.status === 'new' ? "bg-purple-100 text-purple-700" :
                          inquiry.status === 'contacted' ? "bg-blue-100 text-blue-700" :
                          "bg-green-100 text-green-700"
                        )}
                        value={inquiry.status}
                        disabled={updatingId === inquiry.id}
                        onChange={(e) => handleUpdateInquiryStatus(inquiry.id, e.target.value as MembershipInquiry['status'])}
                      >
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="scheduled">Scheduled</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Calendar className="h-3 w-3" />
                        {formatDate(inquiry.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDeleteInquiry(inquiry.id)}
                        disabled={updatingId === inquiry.id}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredInquiries.length === 0 && (
            <div className="p-12 text-center text-slate-500">
              No inquiries found.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
