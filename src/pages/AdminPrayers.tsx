import { useState, useEffect } from 'react';
import { getPrayerRequests, deletePrayerRequest, updatePrayerRequestStatus } from '../services/db';
import { PrayerRequest } from '../types';
import { 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  Loader2, 
  Check, 
  Trash2, 
  Shield, 
  Globe,
  AlertTriangle,
  X
} from 'lucide-react';
import { formatDate, cn } from '../lib/utils';

export default function AdminPrayers() {
  const [prayers, setPrayers] = useState<PrayerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'answered'>('all');
  const [processing, setProcessing] = useState<string | null>(null);
  const [prayerToDelete, setPrayerToDelete] = useState<PrayerRequest | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchPrayers();
  }, [filter]);

  const fetchPrayers = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const data = await getPrayerRequests(filter === 'all' ? undefined : filter, true);
      setPrayers(data);
    } catch (error) {
      console.error('Error fetching prayers:', error);
      setErrorMessage('Failed to load prayer requests.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: PrayerRequest['status']) => {
    setProcessing(id);
    setErrorMessage(null);
    try {
      const success = await updatePrayerRequestStatus(id, status);
      if (success) {
        setPrayers(prev => prev.map(p => p.id === id ? { ...p, status } : p));
        setSuccessMessage(`Prayer marked as ${status}.`);
        setTimeout(() => setSuccessMessage(null), 3500);
      } else {
        setErrorMessage('Failed to update status.');
      }
    } catch (error) {
      console.error('Error updating prayer status:', error);
      setErrorMessage('Failed to update prayer status.');
    } finally {
      setProcessing(null);
    }
  };

  const executeDelete = async (prayer: PrayerRequest) => {
    setProcessing(prayer.id);
    setErrorMessage(null);
    try {
      const success = await deletePrayerRequest(prayer.id);
      if (success) {
        setPrayers(prev => prev.filter(p => p.id !== prayer.id));
        setPrayerToDelete(null);
        setSuccessMessage('Prayer request deleted successfully.');
        setTimeout(() => setSuccessMessage(null), 3500);
      } else {
        setErrorMessage('Failed to delete prayer request. Please check permissions.');
      }
    } catch (error) {
      console.error('Error deleting prayer:', error);
      setErrorMessage('Failed to delete prayer request.');
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="space-y-8 relative">
      {/* Toast Notifications */}
      {successMessage && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-sm font-semibold border border-emerald-700 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-300" />
          <span>{successMessage}</span>
        </div>
      )}
      {errorMessage && (
        <div className="fixed top-20 right-6 z-50 bg-rose-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-sm font-semibold border border-rose-700 animate-in fade-in slide-in-from-top-2">
          <AlertTriangle className="h-5 w-5 text-rose-300" />
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} className="ml-2 text-rose-300 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

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
                  {prayer.onBehalfOf ? prayer.onBehalfOf.charAt(0) : (prayer.userName || 'P').charAt(0)}
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
                    className="p-2.5 bg-green-50 text-green-700 rounded-xl hover:bg-green-100 transition-all disabled:opacity-50 flex items-center gap-1.5 text-xs font-semibold"
                    title="Approve"
                  >
                    <Check className="h-4 w-4" />
                    <span>Approve</span>
                  </button>
                )}
                {prayer.status === 'approved' && (
                  <button 
                    onClick={() => handleStatusUpdate(prayer.id, 'answered')}
                    disabled={!!processing}
                    className="p-2.5 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-all disabled:opacity-50 flex items-center gap-1.5 text-xs font-semibold"
                    title="Mark as Answered"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Mark Answered</span>
                  </button>
                )}
                <button 
                  onClick={() => setPrayerToDelete(prayer)}
                  disabled={processing === prayer.id}
                  className="p-2.5 bg-slate-50 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1"
                  title="Delete prayer request"
                  aria-label="Delete prayer request"
                >
                  {processing === prayer.id ? (
                    <Loader2 className="h-4 w-4 animate-spin text-red-600" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
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

      {/* Delete Confirmation Modal (In-App, non-blocking) */}
      {prayerToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-red-100 animate-in zoom-in-95">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <div className="p-3 bg-red-50 rounded-2xl">
                <Trash2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900 font-display">Delete Prayer Request?</h3>
                <p className="text-xs text-slate-500">This action cannot be undone.</p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-6 space-y-2">
              <p className="text-xs font-semibold text-slate-700">
                Author: <span className="font-bold text-slate-900">{prayerToDelete.onBehalfOf ? `Prayer for ${prayerToDelete.onBehalfOf}` : prayerToDelete.userName}</span>
              </p>
              <p className="text-xs text-slate-600 italic line-clamp-3">
                "{prayerToDelete.message}"
              </p>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setPrayerToDelete(null)}
                disabled={processing === prayerToDelete.id}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors uppercase tracking-wider disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => executeDelete(prayerToDelete)}
                disabled={processing === prayerToDelete.id}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-all uppercase tracking-wider shadow-md shadow-red-600/20 flex items-center gap-2 disabled:opacity-50"
              >
                {processing === prayerToDelete.id ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Yes, Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

