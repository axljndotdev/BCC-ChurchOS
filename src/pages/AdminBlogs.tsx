import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  getBlogPosts, 
  approveBlogPost, 
  deleteBlogPost, 
  getUsers, 
  updateUserProfile,
  updateBlogPost 
} from '../services/db';
import { BlogPost, UserProfile } from '../types';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Eye, 
  Trash2, 
  UserPlus, 
  Users,
  Search,
  Loader2,
  AlertCircle,
  FileText
} from 'lucide-react';
import { formatDate, cn } from '../lib/utils';
import { Link } from 'react-router-dom';

export default function AdminBlogs() {
  const { isSuperAdmin, isCouncil } = useAuth();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'pending' | 'published' | 'editors'>('pending');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pendingPosts, publishedPosts, allUsers] = await Promise.all([
        getBlogPosts('pending', 50),
        getBlogPosts('published', 50),
        getUsers()
      ]);
      setPosts([...pendingPosts, ...publishedPosts]);
      setUsers(allUsers);
    } catch (error) {
      console.error('Error fetching admin blogs data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await approveBlogPost(id);
      fetchData();
    } catch (error) {
      console.error('Error approving blog:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await deleteBlogPost(id);
      fetchData();
    } catch (error) {
      console.error('Error deleting blog:', error);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await updateBlogPost(id, { status: 'rejected' });
      fetchData();
    } catch (error) {
      console.error('Error rejecting blog:', error);
    }
  };

  const toggleBlogEditor = async (userId: string, currentStatus: boolean) => {
    try {
      await updateUserProfile(userId, { isBlogEditor: !currentStatus });
      fetchData();
    } catch (error) {
      console.error('Error updating blog editor status:', error);
    }
  };

  const filteredPosts = posts.filter(p => 
    p.status === activeTab && 
    (p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
     p.authorName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const blogEditors = users.filter(u => u.isBlogEditor);
  const potentialEditors = users.filter(u => 
    !u.isBlogEditor && 
    (u.displayName.toLowerCase().includes(searchTerm.toLowerCase()) || 
     u.email?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 text-maroon animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900">Content Management</h1>
          <p className="text-slate-500 font-light">Review blogs and manage contributing editors.</p>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex p-1 bg-slate-100 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('pending')}
          className={cn(
            "px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
            activeTab === 'pending' ? "bg-white text-maroon shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}
        >
          Pending Review ({posts.filter(p => p.status === 'pending').length})
        </button>
        <button
          onClick={() => setActiveTab('published')}
          className={cn(
            "px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
            activeTab === 'published' ? "bg-white text-maroon shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}
        >
          Published
        </button>
        <button
          onClick={() => setActiveTab('editors')}
          className={cn(
            "px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
            activeTab === 'editors' ? "bg-white text-maroon shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}
        >
          Blog Editors
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder={activeTab === 'editors' ? "Search users..." : "Search posts..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-maroon/20 focus:border-maroon outline-none transition-all"
          />
        </div>
      </div>

      {activeTab === 'editors' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Current Editors */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between">
              <h2 className="font-display font-bold text-slate-900 flex items-center gap-2">
                <Users className="h-5 w-5 text-maroon" />
                Active Editors
              </h2>
            </div>
            <div className="divide-y divide-slate-50">
              {blogEditors.map(user => (
                <div key={user.uid} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold">
                      {user.displayName[0]}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{user.displayName}</p>
                      <p className="text-xs text-slate-500">{user.email || user.username}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleBlogEditor(user.uid, true)}
                    className="px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg transition-all"
                  >
                    Remove
                  </button>
                </div>
              ))}
              {blogEditors.length === 0 && (
                <div className="p-12 text-center text-slate-400 text-sm font-light">
                  No blog editors assigned.
                </div>
              )}
            </div>
          </div>

          {/* User List to Add Editors */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between">
              <h2 className="font-display font-bold text-slate-900 flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-blue-600" />
                Add New Editor
              </h2>
            </div>
            <div className="divide-y divide-slate-50 max-h-[400px] overflow-y-auto">
              {potentialEditors.map(user => (
                <div key={user.uid} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold">
                      {user.displayName[0]}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{user.displayName}</p>
                      <p className="text-xs text-slate-500">{user.email || user.username}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleBlogEditor(user.uid, false)}
                    className="px-4 py-2 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                  >
                    Grant Access
                  </button>
                </div>
              ))}
              {potentialEditors.length === 0 && searchTerm && (
                <div className="p-12 text-center text-slate-400 text-sm font-light">
                  No users found matching "{searchTerm}"
                </div>
              )}
              {!searchTerm && potentialEditors.length > 0 && (
                <div className="p-4 text-center text-[10px] text-slate-400 uppercase tracking-widest bg-slate-50">
                  Search to find more users
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredPosts.map(post => (
            <div key={post.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 group hover:shadow-md transition-all">
              <div className="flex items-start gap-4">
                <div className="h-16 w-24 rounded-2xl overflow-hidden bg-slate-100 shrink-0">
                  <img 
                    src={post.coverImage || `https://picsum.photos/seed/${post.id}/200/200`} 
                    alt="" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="space-y-1">
                  <h3 className="font-display font-bold text-slate-900 line-clamp-1">{post.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDate(post.createdAt)}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-slate-200" />
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {post.authorName}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link 
                  to={`/blogs/${post.slug || post.id}`}
                  className="p-3 text-slate-400 hover:text-maroon hover:bg-slate-50 rounded-xl transition-all"
                  title="Preview"
                >
                  <Eye className="h-5 w-5" />
                </Link>
                
                {post.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleApprove(post.id)}
                      className="p-3 text-emerald-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                      title="Approve & Publish"
                    >
                      <CheckCircle2 className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleReject(post.id)}
                      className="p-3 text-amber-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all"
                      title="Reject"
                    >
                      <XCircle className="h-5 w-5" />
                    </button>
                  </>
                )}

                <button
                  onClick={() => handleDelete(post.id)}
                  className="p-3 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                  title="Delete"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
          {filteredPosts.length === 0 && (
            <div className="py-20 text-center bg-white rounded-[3rem] border border-slate-50">
              <FileText className="h-12 w-12 text-slate-100 mx-auto mb-4" />
              <p className="text-slate-400 font-light">No posts found in this section.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
