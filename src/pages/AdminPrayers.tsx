import { useState, useEffect } from 'react';
import { getPrayerRequests, updateUserProfile } from '../services/db';
import { PrayerRequest } from '../types';
import { 
  MessageSquare, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search,
  Filter,
  Loader2,
  Check,
  X,
  Trash2,
  Shield,
  Globe
} from 'lucide-react';
import { formatDate, cn } from '../lib/utils';
import { db } from '../firebase/config';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';

export default function AdminPrayers() {
  const [prayers, setPrayers] = useState<PrayerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'answered'>('all');
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    fetchPrayers();
  }, [filter]);

  const fetchPrayers = async () => {
    setLoading(true);
    try {
      const data = await getPrayerRequests(filter === 'all' ? undefined : filter, true);
      setPrayers(data);
    } catch (error) {
      console.error('Error fetching prayers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: PrayerRequest['status']) => {
    if (!db) return;
    setProcessing(id);
    try {
      const docRef = doc(db, 'prayer_requests', id);
      await updateDoc(docRef, { status });
      setPrayers(prayers.map(p => p.id === id ? { ...p, status } : p));
    } catch (error) {
      console.error('Error updating prayer status:', error);
    } finally {
      setProcessing(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!db || !window.confirm('Are you sure you want to delete this prayer request?')) return;
    setProcessing(id);
    try {
      const docRef = doc(db, 'prayer_requests', id);
      await deleteDoc(docRef);
      setPrayers(prayers.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting prayer:', error);
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900">Prayer Management</h1>
          <p className="text-slate-500 font-light">Review and moderate prayer requests from the community.</p>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-xl">
          {(['all', 'pending', 'approved', 'answered'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={cn(
                "px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all",
                filter === s ? "bg-white text-maroon shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </header>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 text-maroon animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {prayers.map((prayer) => (
            <div 
              key={prayer.id} 
              className={cn(
                "bg-white p-6 rounded-3xl border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6",
                prayer.status === 'pending' ? "border-amber-100 bg-amber-50/10" : "border-slate-100"
              )}
            >
              <div className="flex gap-4 flex-1">
                <div className={cn(
                  "h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 font-display font-bold text-lg",
                  prayer.onBehalfOf ? "bg-amber-100 text-amber-600" :
                  prayer.status === 'pending' ? "bg-amber-100 text-amber-600" :
                  prayer.status === 'approved' ? "bg-green-100 text-green-600" :
                  "bg-blue-100 text-blue-600"
                )}>
                  {prayer.onBehalfOf ? prayer.onBehalfOf.charAt(0) : prayer.userName.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-bold text-slate-900">
                      {prayer.onBehalfOf ? `Prayer for ${prayer.onBehalfOf}` : prayer.userName}
                    </h3>
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest",
                      prayer.status === 'pending' ? "bg-amber-100 text-amber-700" :
                      prayer.status === 'approved' ? "bg-green-100 text-green-700" :
                      "bg-blue-100 text-blue-700"
                    )}>
                      {prayer.status}
                    </span>
                  </div>
                  {prayer.onBehalfOf && (
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">
                      Submitted by {prayer.userName}
                    </p>
                  )}
                  <p className="text-slate-600 font-light italic mb-2">"{prayer.message}"</p>
                  
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest border",
                      prayer.onBehalfOf ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-slate-50 text-slate-600 border-slate-200"
                    )}>
                      {prayer.onBehalfOf ? 'For Someone Else' : 'For Myself'}
                    </span>
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest border font-display flex items-center gap-1",
                      prayer.visibility === 'private' ? "bg-amber-600 text-white border-amber-700 shadow-sm" : "bg-slate-900 text-white border-slate-900 shadow-sm"
                    )}>
                      {prayer.visibility === 'private' ? (
                        <>
                          <Shield className="h-2 w-2" />
                          PRIVATE: Leadership Only
                        </>
                      ) : (
                        <>
                          <Globe className="h-2 w-2" />
                          Public Wall
                        </>
                      )}
                    </span>
                    {prayer.isAnonymous && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest bg-slate-900 text-white border border-slate-900">
                        Anonymous
                      </span>
                    )}
                  </div>

                  {prayer.sensitivityNote && (
                    <div className="mt-3 p-3 bg-red-50/50 rounded-xl border border-red-100">
                      <p className="text-[9px] font-bold text-red-400 uppercase tracking-widest mb-1">Sensitivity Note / Instructions:</p>
                      <p className="text-xs text-slate-700 font-medium">{prayer.sensitivityNote}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-3">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {formatDate(prayer.date)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                {prayer.status === 'pending' && (
                  <button 
                    onClick={() => handleStatusUpdate(prayer.id, 'approved')}
                    disabled={!!processing}
                    className="p-2 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-all disabled:opacity-50"
                    title="Approve"
                  >
                    <Check className="h-5 w-5" />
                  </button>
                )}
                {prayer.status === 'approved' && (
                  <button 
                    onClick={() => handleStatusUpdate(prayer.id, 'answered')}
                    disabled={!!processing}
                    className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all disabled:opacity-50"
                    title="Mark as Answered"
                  >
                    <CheckCircle2 className="h-5 w-5" />
                  </button>
                )}
                <button 
                  onClick={() => handleDelete(prayer.id)}
                  disabled={!!processing}
                  className="p-2 bg-slate-50 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all disabled:opacity-50"
                  title="Delete"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}

          {prayers.length === 0 && (
            <div className="bg-white rounded-3xl p-20 text-center border border-slate-100">
              <MessageSquare className="h-16 w-16 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-500 font-light">No prayer requests found in this category.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
