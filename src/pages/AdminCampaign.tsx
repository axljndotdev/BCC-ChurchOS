import { useState, useEffect } from 'react';
import { 
  Wind, 
  TrendingUp, 
  Heart, 
  Plus, 
  DollarSign, 
  Save, 
  Loader2, 
  CheckCircle2, 
  AlertTriangle, 
  Trash2, 
  ExternalLink,
  Sparkles,
  Calendar,
  Layers,
  ArrowRight,
  X
} from 'lucide-react';
import { 
  getCampaignData, 
  saveCampaignData, 
  getCampaignPrayers, 
  deleteCampaignPrayer, 
  DEFAULT_AC_CAMPAIGN 
} from '../services/db';
import { CampaignData, CampaignPrayer } from '../types';
import { formatDate, cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

export default function AdminCampaign() {
  const { isSuperAdmin, isAdmin } = useAuth();
  const [campaign, setCampaign] = useState<CampaignData>(DEFAULT_AC_CAMPAIGN);
  const [prayers, setPrayers] = useState<CampaignPrayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Edit Form state
  const [title, setTitle] = useState(DEFAULT_AC_CAMPAIGN.title);
  const [description, setDescription] = useState(DEFAULT_AC_CAMPAIGN.description || '');
  const [targetAmount, setTargetAmount] = useState(DEFAULT_AC_CAMPAIGN.targetAmount);
  const [currentAmount, setCurrentAmount] = useState(DEFAULT_AC_CAMPAIGN.currentAmount);
  const [targetDate, setTargetDate] = useState(DEFAULT_AC_CAMPAIGN.targetDate || 'December 2026');
  const [mission, setMission] = useState(DEFAULT_AC_CAMPAIGN.mission || '');

  // Quick Donation Log increment
  const [prayerToDelete, setPrayerToDelete] = useState<CampaignPrayer | null>(null);
  const [deletingPrayerId, setDeletingPrayerId] = useState<string | null>(null);

  // Toasts
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchCampaignData();
  }, []);

  const fetchCampaignData = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const [campData, campPrayers] = await Promise.all([
        getCampaignData('project-ac'),
        getCampaignPrayers('project-ac')
      ]);

      const activeCamp = campData || DEFAULT_AC_CAMPAIGN;
      setCampaign(activeCamp);
      setTitle(activeCamp.title);
      setDescription(activeCamp.description || '');
      setTargetAmount(activeCamp.targetAmount);
      setCurrentAmount(activeCamp.currentAmount);
      setTargetDate(activeCamp.targetDate || 'December 2026');
      setMission(activeCamp.mission || DEFAULT_AC_CAMPAIGN.mission);
      setPrayers(campPrayers);
    } catch (error) {
      console.error('Error loading campaign data:', error);
      setErrorMessage('Failed to load campaign information.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage(null);
    try {
      await saveCampaignData('project-ac', {
        title,
        description,
        targetAmount: Number(targetAmount),
        currentAmount: Number(currentAmount),
        targetDate,
        mission
      });
      setSuccessMessage('Campaign settings updated successfully!');
      setTimeout(() => setSuccessMessage(null), 3500);
      await fetchCampaignData();
    } catch (error) {
      console.error('Error saving campaign:', error);
      setErrorMessage('Failed to save campaign settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleApplyQuickAdd = async (amountToAdd: number) => {
    const newAmount = Number(currentAmount) + amountToAdd;
    setCurrentAmount(newAmount);

    setSaving(true);
    try {
      await saveCampaignData('project-ac', {
        currentAmount: newAmount
      });
      setSuccessMessage(`Logged +₱${amountToAdd.toLocaleString()} offline gift!`);
      setTimeout(() => setSuccessMessage(null), 3500);
    } catch (error) {
      console.error('Error logging donation:', error);
      setErrorMessage('Failed to update amount.');
    } finally {
      setSaving(false);
    }
  };

  const executeDeletePrayer = async (p: CampaignPrayer) => {
    setDeletingPrayerId(p.id);
    try {
      await deleteCampaignPrayer('project-ac', p.id);
      setPrayers(prev => prev.filter(item => item.id !== p.id));
      setPrayerToDelete(null);
      setSuccessMessage('Campaign prayer removed.');
      setTimeout(() => setSuccessMessage(null), 3500);
    } catch (error) {
      console.error('Error deleting prayer:', error);
      setErrorMessage('Failed to remove prayer.');
    } finally {
      setDeletingPrayerId(null);
    }
  };

  const percentProgress = targetAmount > 0 ? Math.min(100, Math.round((currentAmount / targetAmount) * 100)) : 0;

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

      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100/70 border border-amber-300/60 rounded-full text-[10px] font-bold text-amber-900 uppercase tracking-widest mb-3">
            <Wind className="h-3 w-3 text-amber-600" />
            <span>Fundraising & Building Projects</span>
          </div>
          <h1 className="text-3xl font-display font-bold text-slate-900">Campaign Manager</h1>
          <p className="text-slate-500 font-light mt-1">
            Oversee active building campaigns, log offline donor gifts, and moderate campaign prayers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/project-ac"
            target="_blank"
            className="px-4 py-2.5 bg-white border border-[#E8D5B5] text-slate-700 rounded-xl text-xs font-bold uppercase tracking-wider hover:text-maroon hover:border-maroon transition-all flex items-center gap-2 shadow-xs min-h-[42px]"
          >
            <span>Live Campaign Page</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      </header>

      {/* Campaign Progress Card */}
      <div className="bg-gradient-to-r from-[#5C0612] via-[#7A121D] to-[#4A0810] rounded-3xl p-6 sm:p-8 text-white border-2 border-[#C99738]/50 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-6">
          <div>
            <span className="text-xs font-bold text-[#E5B869] uppercase tracking-widest">Active Focus</span>
            <h2 className="text-2xl sm:text-3xl font-display font-bold mt-1">{title}</h2>
            <p className="text-stone-300 text-xs sm:text-sm mt-1 max-w-xl">{description}</p>
          </div>

          <div className="text-left md:text-right">
            <p className="text-xs text-[#E5B869] uppercase tracking-widest font-semibold">Total Progress</p>
            <p className="text-3xl sm:text-4xl font-display font-bold text-white">
              ₱{Number(currentAmount).toLocaleString()}
              <span className="text-xs font-normal text-stone-300 ml-2">/ ₱{Number(targetAmount).toLocaleString()}</span>
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-[#F0CA7D]">
            <span>{percentProgress}% Completed</span>
            <span>₱{(Number(targetAmount) - Number(currentAmount) > 0 ? Number(targetAmount) - Number(currentAmount) : 0).toLocaleString()} Remaining</span>
          </div>
          <div className="h-4 bg-black/40 rounded-full overflow-hidden p-0.5 border border-white/20">
            <div 
              className="h-full bg-gradient-to-r from-[#E5B869] to-[#C99738] rounded-full transition-all duration-700 shadow-sm"
              style={{ width: `${percentProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Quick Offline Gift Logger */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Plus className="h-4 w-4 text-emerald-600" />
              <span>Quick Offline Donation Logger</span>
            </h3>
            <p className="text-xs text-slate-500 font-light mt-0.5">
              Instantly increment the raised amount when receiving cash or bank transfer gifts during service.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-2">
          {[1000, 5000, 10000, 20000, 50000, 100000].map((amt) => (
            <button
              key={amt}
              onClick={() => handleApplyQuickAdd(amt)}
              disabled={saving}
              className="px-4 py-2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-all cursor-pointer disabled:opacity-50"
            >
              + ₱{amt.toLocaleString()}
            </button>
          ))}
        </div>
      </div>

      {/* Campaign Settings Form */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-xs">
        <h3 className="text-xl font-bold text-slate-900 font-display mb-6">
          Campaign Target & Information
        </h3>

        <form onSubmit={handleSaveCampaign} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Campaign Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-maroon focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Target Date / Timeline
              </label>
              <input
                type="text"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                placeholder="e.g. December 2026"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-maroon focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Target Amount (PHP ₱)
              </label>
              <input
                type="number"
                required
                min={0}
                value={targetAmount}
                onChange={(e) => setTargetAmount(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-maroon focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Raised So Far (PHP ₱)
              </label>
              <input
                type="number"
                required
                min={0}
                value={currentAmount}
                onChange={(e) => setCurrentAmount(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-maroon focus:ring-2 focus:ring-maroon focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Mission Statement & Project Purpose
            </label>
            <textarea
              rows={4}
              value={mission}
              onChange={(e) => setMission(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-maroon focus:outline-none"
            />
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-[#7A121D] hover:bg-[#5C0612] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-maroon/20 flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving Campaign...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Campaign Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Campaign Prayer Wall Moderation */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-xs space-y-6">
        <div>
          <h3 className="text-xl font-bold text-slate-900 font-display">
            Campaign Prayer Wall ({prayers.length})
          </h3>
          <p className="text-xs text-slate-500 font-light mt-1">
            Review prayer notes submitted by members supporting this campaign.
          </p>
        </div>

        {prayers.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No prayers submitted for this campaign yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {prayers.map((prayer) => (
              <div
                key={prayer.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start justify-between gap-3"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900">{prayer.authorName}</span>
                    <span className="text-[10px] text-slate-400">{formatDate(prayer.createdAt)}</span>
                  </div>
                  <p className="text-xs text-slate-600 italic">"{prayer.message}"</p>
                </div>
                <button
                  onClick={() => setPrayerToDelete(prayer)}
                  className="p-2 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                  title="Remove prayer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Prayer Confirmation Modal */}
      {prayerToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-red-100 animate-in zoom-in-95">
            <h3 className="font-bold text-lg text-slate-900 font-display mb-2">Delete Campaign Prayer?</h3>
            <p className="text-xs text-slate-500 mb-4">Are you sure you want to remove this prayer note from the campaign wall?</p>
            <div className="bg-slate-50 p-3 rounded-xl mb-6">
              <p className="text-xs font-bold text-slate-800">{prayerToDelete.authorName}</p>
              <p className="text-xs text-slate-600 italic mt-1">"{prayerToDelete.message}"</p>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setPrayerToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 uppercase"
              >
                Cancel
              </button>
              <button
                onClick={() => executeDeletePrayer(prayerToDelete)}
                disabled={deletingPrayerId === prayerToDelete.id}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 uppercase"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
