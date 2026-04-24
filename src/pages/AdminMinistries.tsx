import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  BookOpen, 
  ExternalLink,
  Eye,
  Check,
  X,
  AlertCircle
} from 'lucide-react';
import { 
  getPendingMinistryEdits, 
  approveMinistryEdit, 
  rejectMinistryEdit,
  getMinistryEditorRequests,
  approveEditorRequest,
  rejectEditorRequest
} from '../services/db';
import { MinistryEditDraft, MinistryEditorRequest } from '../types';
import { format } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import ReactMarkdown from 'react-markdown';
import { cn } from '../lib/utils';

export default function AdminMinistries() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'edits' | 'requests'>('edits');
  const [edits, setEdits] = useState<MinistryEditDraft[]>([]);
  const [requests, setRequests] = useState<MinistryEditorRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEdit, setSelectedEdit] = useState<MinistryEditDraft | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [editsData, requestsData] = await Promise.all([
        getPendingMinistryEdits(),
        getMinistryEditorRequests()
      ]);
      setEdits(editsData);
      setRequests(requestsData);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveEdit = async (editId: string) => {
    if (!user) return;
    setProcessing(editId);
    try {
      await approveMinistryEdit(editId, user.uid);
      setEdits(edits.filter(e => e.id !== editId));
      setSelectedEdit(null);
    } catch (error) {
      console.error('Error approving edit:', error);
    } finally {
      setProcessing(null);
    }
  };

  const handleRejectEdit = async (editId: string) => {
    if (!user) return;
    setProcessing(editId);
    try {
      await rejectMinistryEdit(editId, user.uid);
      setEdits(edits.filter(e => e.id !== editId));
      setSelectedEdit(null);
    } catch (error) {
      console.error('Error rejecting edit:', error);
    } finally {
      setProcessing(null);
    }
  };

  const handleApproveRequest = async (requestId: string, userId: string) => {
    setProcessing(requestId);
    try {
      await approveEditorRequest(requestId, userId);
      setRequests(requests.filter(r => r.id !== requestId));
    } catch (error) {
      console.error('Error approving request:', error);
    } finally {
      setProcessing(null);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    setProcessing(requestId);
    try {
      await rejectEditorRequest(requestId);
      setRequests(requests.filter(r => r.id !== requestId));
    } catch (error) {
      console.error('Error rejecting request:', error);
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900">Ministry Management</h1>
          <p className="text-slate-500 font-light">Review pending edits and editor access requests.</p>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-2xl">
          <button 
            onClick={() => setActiveTab('edits')}
            className={cn(
              "px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2",
              activeTab === 'edits' ? "bg-white text-maroon shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            <BookOpen className="h-4 w-4" /> Pending Edits
            {edits.length > 0 && <span className="bg-maroon text-white text-[10px] px-1.5 py-0.5 rounded-full">{edits.length}</span>}
          </button>
          <button 
            onClick={() => setActiveTab('requests')}
            className={cn(
              "px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2",
              activeTab === 'requests' ? "bg-white text-maroon shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            <Shield className="h-4 w-4" /> Editor Requests
            {requests.length > 0 && <span className="bg-maroon text-white text-[10px] px-1.5 py-0.5 rounded-full">{requests.length}</span>}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-maroon"></div>
        </div>
      ) : activeTab === 'edits' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* List of Edits */}
          <div className="space-y-4">
            {edits.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-100">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4 opacity-20" />
                <p className="text-slate-500">No pending edits to review.</p>
              </div>
            ) : (
              edits.map((edit) => (
                <div 
                  key={edit.id}
                  onClick={() => setSelectedEdit(edit)}
                  className={cn(
                    "bg-white p-6 rounded-3xl border transition-all cursor-pointer hover:shadow-md",
                    selectedEdit?.id === edit.id ? "border-maroon ring-1 ring-maroon" : "border-slate-100"
                  )}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-slate-900">{edit.ministryId.replace(/-/g, ' ').toUpperCase()}</h3>
                      <p className="text-xs text-slate-500">Submitted by {edit.submittedByName}</p>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <Clock className="h-3 w-3" />
                      {format(edit.submittedAt?.toDate() || new Date(), 'MMM d, h:mm a')}
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 line-clamp-2 font-light">{edit.description}</p>
                </div>
              ))
            )}
          </div>

          {/* Preview Panel */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col h-[700px]">
            {selectedEdit ? (
              <>
                <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-display font-bold text-slate-900">Review Edit</h2>
                    <p className="text-sm text-slate-500">For {selectedEdit.ministryId.replace(/-/g, ' ').toUpperCase()}</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleRejectEdit(selectedEdit.id)}
                      disabled={!!processing}
                      className="p-3 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-all disabled:opacity-50"
                      title="Reject Edit"
                    >
                      <X className="h-5 w-5" />
                    </button>
                    <button 
                      onClick={() => handleApproveEdit(selectedEdit.id)}
                      disabled={!!processing}
                      className="p-3 rounded-xl bg-green-50 text-green-600 hover:bg-green-100 transition-all disabled:opacity-50"
                      title="Approve & Publish"
                    >
                      <Check className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-8 prose prose-slate max-w-none">
                  <div className="mb-8 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">New Description</h4>
                    <p className="text-slate-700 font-light italic">{selectedEdit.description}</p>
                  </div>
                  <ReactMarkdown>{selectedEdit.content}</ReactMarkdown>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-12 text-center">
                <Eye className="h-16 w-16 mb-6 opacity-10" />
                <p className="text-lg font-light">Select an edit from the list to preview and review.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requests.length === 0 ? (
            <div className="col-span-full bg-white rounded-3xl p-20 text-center border border-slate-100">
              <Shield className="h-16 w-16 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-500">No pending editor requests.</p>
            </div>
          ) : (
            requests.map((request) => (
              <motion.div 
                key={request.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-maroon/5 text-maroon flex items-center justify-center">
                    <User className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{request.userName}</h3>
                    <p className="text-xs text-slate-500">{request.userEmail}</p>
                  </div>
                </div>
                
                <div className="mb-8">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Requested Access For</p>
                  <div className="inline-flex px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
                    {request.ministryId.replace(/-/g, ' ').toUpperCase()}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => handleRejectRequest(request.id)}
                    disabled={!!processing}
                    className="flex-1 py-3 rounded-2xl bg-slate-50 text-slate-600 font-bold hover:bg-slate-100 transition-all disabled:opacity-50"
                  >
                    Reject
                  </button>
                  <button 
                    onClick={() => handleApproveRequest(request.id, request.userId)}
                    disabled={!!processing}
                    className="flex-1 py-3 rounded-2xl bg-maroon text-white font-bold hover:bg-maroon-dark transition-all shadow-lg shadow-maroon/10 disabled:opacity-50"
                  >
                    Approve
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
