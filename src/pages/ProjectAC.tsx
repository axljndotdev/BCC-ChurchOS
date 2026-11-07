import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, Sparkles, Share2, Check, Copy, Edit3, 
  Send, Church, Shield, Info, CheckCircle2, 
  ArrowRight, MessageSquare, Clock, Calendar, 
  Flame, Wind, DollarSign, Users, ChevronRight, X,
  Mail, ExternalLink
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { 
  getCampaignData, 
  saveCampaignData, 
  incrementCampaignPrayer, 
  addCampaignPrayer, 
  getCampaignPrayers,
  DEFAULT_AC_CAMPAIGN 
} from '../services/db';
import { CampaignData, CampaignPrayer } from '../types';
import ThermometerVisual from '../components/ThermometerVisual';
import { formatDate } from '../lib/utils';

export default function ProjectAC() {
  const { user, profile, isSuperAdmin } = useAuth();
  const canEdit = Boolean(isSuperAdmin);

  const [campaign, setCampaign] = useState<CampaignData>(DEFAULT_AC_CAMPAIGN);
  const [prayers, setPrayers] = useState<CampaignPrayer[]>([]);
  const [loading, setLoading] = useState(true);

  // Prayer interactive button state
  const [hasPrayedSession, setHasPrayedSession] = useState(false);
  const [prayingLoading, setPrayingLoading] = useState(false);
  const [showPrayerThankYou, setShowPrayerThankYou] = useState(false);

  // New Prayer comment form
  const [authorName, setAuthorName] = useState('');
  const [prayerMessage, setPrayerMessage] = useState('');
  const [verse, setVerse] = useState('');
  const [submittingPrayer, setSubmittingPrayer] = useState(false);
  const [prayerSuccess, setPrayerSuccess] = useState(false);

  // Admin Edit Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editGoal, setEditGoal] = useState(800000);
  const [editRaised, setEditRaised] = useState(150000);
  const [editTargetDate, setEditTargetDate] = useState('December 2026');
  const [editMission, setEditMission] = useState('');
  const [savingCampaign, setSavingCampaign] = useState(false);

  // Share link copied toast
  const [copiedLink, setCopiedLink] = useState(false);

  // Set browser tab title for Project AC
  useEffect(() => {
    document.title = "Project AC Campaign | Bethesda Community Church";
    return () => {
      document.title = "Bethesda Community Church (BCC)";
    };
  }, []);

  // Compute canonical share URL
  const getShareUrl = () => {
    if (typeof window !== 'undefined' && window.location) {
      return `${window.location.origin}/project-ac`;
    }
    return 'https://ais-pre-vizbnjox5k5jadeg7pf3w3-315136067624.asia-southeast1.run.app/project-ac';
  };

  // Robust link copy with fallback for iframe / security restricted environments
  const handleCopyLink = async () => {
    const url = getShareUrl();
    let copied = false;

    if (navigator?.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(url);
        copied = true;
      } catch (err) {
        console.warn('Clipboard writeText failed, using DOM fallback:', err);
      }
    }

    if (!copied) {
      try {
        const el = document.createElement('textarea');
        el.value = url;
        el.setAttribute('readonly', '');
        el.style.position = 'absolute';
        el.style.left = '-9999px';
        document.body.appendChild(el);
        el.select();
        copied = document.execCommand('copy');
        document.body.removeChild(el);
      } catch (e) {
        console.error('DOM copy fallback failed:', e);
      }
    }

    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  // Native share sheet on mobile devices, or fallback to copy
  const handleShareClick = async () => {
    const url = getShareUrl();
    const shareData = {
      title: 'Bethesda Community Church - Project AC',
      text: 'Support our Sanctuary Air Conditioning Campaign! Together by God’s grace.',
      url: url,
    };

    if (navigator?.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err: any) {
        if (err?.name === 'AbortError') return;
      }
    }

    handleCopyLink();
  };

  const handleShareFacebook = () => {
    const url = encodeURIComponent(getShareUrl());
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank', 'noopener,noreferrer');
  };

  const handleShareWhatsApp = () => {
    const url = encodeURIComponent(getShareUrl());
    const text = encodeURIComponent('Support Bethesda Community Church - Project AC Campaign: ');
    window.open(`https://api.whatsapp.com/send?text=${text}${url}`, '_blank', 'noopener,noreferrer');
  };

  const handleShareEmail = () => {
    const subject = encodeURIComponent('Bethesda Community Church - Project AC Campaign');
    const body = encodeURIComponent(`Hello,\n\nPlease check out and support Bethesda Community Church's Project AC Campaign (Sanctuary Air Conditioning):\n\n${getShareUrl()}\n\nTogether by God's grace!`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  // Load campaign & prayers
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const data = await getCampaignData('project-ac');
        if (isMounted) {
          setCampaign(data);
          setEditGoal(data.targetAmount);
          setEditRaised(data.currentAmount);
          setEditTargetDate(data.targetDate);
          setEditMission(data.mission);
        }

        const prayerList = await getCampaignPrayers('project-ac');
        if (isMounted) {
          setPrayers(prayerList);
        }
      } catch (err) {
        console.error('Failed to load project AC data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Sync profile name to prayer form if signed in
  useEffect(() => {
    if (profile?.displayName && !authorName) {
      setAuthorName(profile.displayName);
    }
  }, [profile, authorName]);

  // Handle "I Prayed for Project AC" click
  const handlePrayClick = async () => {
    if (prayingLoading) return;
    try {
      setPrayingLoading(true);
      const newCount = await incrementCampaignPrayer('project-ac');
      setCampaign(prev => ({ ...prev, prayerCount: newCount }));
      setHasPrayedSession(true);
      setShowPrayerThankYou(true);
      setTimeout(() => setShowPrayerThankYou(false), 5000);
    } catch (err) {
      console.error('Error recording prayer:', err);
    } finally {
      setPrayingLoading(false);
    }
  };

  // Submit prayer message
  const handlePrayerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prayerMessage.trim()) return;

    try {
      setSubmittingPrayer(true);
      const newPrayer = await addCampaignPrayer('project-ac', {
        authorName: authorName.trim() || (profile?.displayName || 'Fellow Believer'),
        message: prayerMessage.trim(),
        verse: verse.trim() || undefined,
        userId: user?.uid
      });

      setPrayers(prev => [newPrayer, ...prev]);
      setPrayerMessage('');
      setVerse('');
      setPrayerSuccess(true);
      setTimeout(() => setPrayerSuccess(false), 4000);
    } catch (err) {
      console.error('Error submitting prayer:', err);
    } finally {
      setSubmittingPrayer(false);
    }
  };

  // Save campaign edits
  const handleSaveCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingCampaign(true);
      const updated = await saveCampaignData('project-ac', {
        targetAmount: Number(editGoal),
        currentAmount: Number(editRaised),
        targetDate: editTargetDate.trim(),
        mission: editMission.trim()
      }, {
        displayName: profile?.displayName || user?.email || 'Council Admin',
        email: user?.email || undefined
      });

      setCampaign(updated);
      setIsEditModalOpen(false);
    } catch (err) {
      console.error('Error updating campaign figures:', err);
      alert('Failed to save changes. Please check permissions.');
    } finally {
      setSavingCampaign(false);
    }
  };

  const remainingAmount = Math.max(0, campaign.targetAmount - campaign.currentAmount);
  const percentComplete = Math.min(100, Math.max(0, (campaign.currentAmount / campaign.targetAmount) * 100));

  return (
    <div className="min-h-screen bg-[#FAF7F2] pb-24 font-sans text-stone-800">
      
      {/* Top Banner Notice / Breadcrumb */}
      <div className="bg-[#5C0612] text-white py-3 border-b border-[#C99738]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black/30 border border-[#C99738]/50 text-[#F0CA7D] font-bold uppercase tracking-wider text-[10px]">
              <span className="text-[#E5B869] font-display">✦</span> Special Faith Initiative
            </span>
            <span className="text-stone-200 font-medium">Bethesda Community Church (BCC) &bull; Project AC</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleShareClick}
              className="inline-flex items-center gap-1.5 text-stone-200 hover:text-[#E5B869] transition-colors"
              title="Share Project AC Campaign"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-[#E5B869]" />}
              <span>{copiedLink ? 'Link Copied!' : 'Share Campaign'}</span>
            </button>

            {canEdit && (
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#C99738]/20 text-[#E5B869] border border-[#C99738]/40 hover:bg-[#C99738]/30 transition-all font-semibold"
              >
                <Edit3 className="w-3 h-3" />
                <span>Update Figures</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Campaign Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 space-y-12">

        {/* ============================================================== */}
        {/* HERO POSTER CARD - MOBILE FIRST SAFFRON & GOLD                 */}
        {/* ============================================================== */}
        <section 
          id="poster-card" 
          className="relative bg-gradient-to-b from-[#FAF6EE] via-[#FDFBF7] to-[#FAF6EE] rounded-2xl sm:rounded-3xl lg:rounded-[2.5rem] p-4 sm:p-8 lg:p-12 border border-[#E8D5B5] shadow-xl overflow-hidden"
        >
          {/* Subtle warm decorative glow */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-[#E5B869]/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#7A121D]/5 rounded-full blur-3xl -ml-24 -mb-24 pointer-events-none" />

          {/* Inner Content Grid */}
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Column: Mission, Target, Big Goal, Stats */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-6 sm:space-y-8">
              
              {/* Goal Header */}
              <div className="space-y-1.5 sm:space-y-2">
                <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.2em] sm:tracking-[0.25em] text-[#7A121D] flex items-center gap-1.5">
                  <span className="text-[#C99738]">✦</span> OUR FUNDRAISING GOAL:
                </p>
                <div className="flex items-baseline gap-2 sm:gap-3 flex-wrap">
                  <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold tracking-tight text-[#7A121D] drop-shadow-sm leading-tight">
                    ₱{campaign.targetAmount.toLocaleString()}
                  </h1>
                </div>
                <p className="text-[11px] sm:text-xs text-stone-500 font-semibold tracking-wide uppercase">
                  Church Sanctuary Air Conditioning Initiative
                </p>
              </div>

              {/* Mission Statement */}
              <div className="space-y-1.5 sm:space-y-2.5 max-w-xl">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900 flex items-center gap-1.5">
                  <span className="text-[#C99738]">✦</span> OUR MISSION:
                </h3>
                <p className="text-sm sm:text-base md:text-lg text-stone-700 font-light leading-relaxed">
                  {campaign.mission}
                </p>
              </div>

              {/* Numerical Status Dashboard Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 max-w-md w-full">
                
                {/* Current Raised */}
                <div className="bg-white p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-[#E8D5B5] shadow-xs">
                  <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block mb-0.5">
                    Current Offering
                  </span>
                  <p className="text-lg sm:text-2xl font-display font-bold text-[#5C0612]">
                    ₱{campaign.currentAmount.toLocaleString()}
                  </p>
                  <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1 mt-1">
                    <CheckCircle2 className="w-3 h-3" /> {percentComplete.toFixed(1)}% Achieved
                  </span>
                </div>

                {/* Remaining Need */}
                <div className="bg-white p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-[#E8D5B5] shadow-xs">
                  <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block mb-0.5">
                    Balance Needed
                  </span>
                  <p className="text-lg sm:text-2xl font-display font-bold text-[#7A121D]">
                    ₱{remainingAmount.toLocaleString()}
                  </p>
                  <span className="text-[10px] text-[#9A6F1D] font-medium mt-1 block">
                    By God's Faithful Grace
                  </span>
                </div>

              </div>

              {/* Action Buttons: Pray Now & Give / Support (Mobile full-width, desktop inline) */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2 w-full">
                <button
                  onClick={handlePrayClick}
                  disabled={prayingLoading}
                  className={`w-full sm:w-auto px-6 py-3.5 rounded-full font-bold text-xs uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 shadow-lg min-h-[44px] ${
                    hasPrayedSession
                      ? 'bg-emerald-600 text-white shadow-emerald-600/20'
                      : 'bg-[#7A121D] hover:bg-[#5C0612] text-white border border-[#C99738] shadow-md hover:scale-[1.02]'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${hasPrayedSession ? 'fill-white' : 'text-[#E5B869]'}`} />
                  <span>{hasPrayedSession ? 'You Stood in Prayer! (Amen)' : 'I Prayed for Project AC'}</span>
                </button>

                <a
                  href="#how-to-give"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-full font-bold text-xs uppercase tracking-widest bg-gradient-to-r from-[#E5B869] to-[#C99738] text-[#3D040A] hover:brightness-105 transition-all duration-300 flex items-center justify-center gap-2 shadow-md min-h-[44px]"
                >
                  <DollarSign className="w-4 h-4 text-[#3D040A]" />
                  <span>Give / Support</span>
                </a>

                {canEdit && (
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="w-full sm:w-auto px-4 py-3 rounded-full font-bold text-xs uppercase tracking-widest bg-white text-stone-700 border border-[#E8D5B5] hover:bg-[#FAF6EE] transition-all flex items-center justify-center gap-1.5 shadow-xs min-h-[44px]"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-stone-500" />
                    <span>Edit Numbers</span>
                  </button>
                )}
              </div>

              {/* Interactive Prayer Thank You Toast */}
              <AnimatePresence>
                {showPrayerThankYou && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Amen! Thank you for lifting our church sanctuary AC project before the throne of grace!</span>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>

            {/* Right Column: Exact Thermometer Visual Graphic */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center pt-4 lg:pt-0">
              <div className="bg-white/60 p-3 sm:p-6 rounded-2xl sm:rounded-3xl border border-[#E8D5B5] shadow-xs w-full flex flex-col items-center">
                <ThermometerVisual
                  currentAmount={campaign.currentAmount}
                  targetAmount={campaign.targetAmount}
                  className="py-1 sm:py-2"
                />
                
                <p className="text-center text-[10px] sm:text-[11px] font-semibold text-stone-500 mt-2 uppercase tracking-wider">
                  Live Mercury Progress &bull; Milestone Tracker
                </p>
              </div>
            </div>

          </div>
        </section>


        {/* ============================================================== */}
        {/* SPECIFIC PRAYER REQUEST PETITION & SCRIPTURE                   */}
        {/* ============================================================== */}
        <section className="bg-[#FAF6EE] rounded-2xl sm:rounded-3xl lg:rounded-[2rem] border border-[#E8D5B5] shadow-xs p-5 sm:p-8 md:p-12 space-y-6 sm:space-y-8">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8D5B5]/60 pb-5 sm:pb-6">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#7A121D] flex items-center gap-1.5">
                <span className="text-[#C99738]">✦</span> Specific Prayer Request
              </span>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-display font-bold text-stone-900">
                Lifting Project AC to the Lord
              </h2>
            </div>
            
            <div className="px-3.5 py-1.5 sm:px-4 sm:py-2 bg-white text-[#7A121D] rounded-xl sm:rounded-2xl border border-[#E8D5B5] text-xs font-semibold flex items-center gap-2 shadow-xs self-start sm:self-auto">
              <Heart className="w-4 h-4 fill-[#7A121D] text-[#7A121D]" />
              <span>{campaign.prayerCount} believers praying</span>
            </div>
          </div>

          {/* Scripture Callout */}
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border-l-4 border-[#7A121D] border-y border-r border-[#E8D5B5] space-y-2">
            <p className="text-sm sm:text-base md:text-lg text-stone-800 font-display italic leading-relaxed">
              "And my God will meet all your needs according to the riches of his glory in Christ Jesus."
            </p>
            <p className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#9A6F1D]">
              — Philippians 4:19 (NIV)
            </p>
          </div>

          {/* 4 Specific Prayer Points */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-xs font-bold text-stone-900 uppercase tracking-widest flex items-center gap-1.5">
              <span className="text-[#C99738]">✦</span> Please Join Us in Praying For:
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              
              {/* Prayer Point 1 */}
              <div className="p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-white border border-[#E8D5B5] space-y-1.5 sm:space-y-2 shadow-xs">
                <div className="flex items-center gap-2 text-[#7A121D] font-display font-bold text-sm">
                  <span className="text-[#C99738]">✦</span>
                  <span>1. Complete Financial Provision (₱800,000)</span>
                </div>
                <p className="text-xs sm:text-sm text-stone-600 font-light leading-relaxed">
                  Pray that the Lord will touch hearts within our congregation, families, alumni, and generous ministry partners to joyfully provide every single peso needed.
                </p>
              </div>

              {/* Prayer Point 2 */}
              <div className="p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-white border border-[#E8D5B5] space-y-1.5 sm:space-y-2 shadow-xs">
                <div className="flex items-center gap-2 text-[#9A6F1D] font-display font-bold text-sm">
                  <span className="text-[#C99738]">✦</span>
                  <span>2. Wisdom for Church Council & Contractors</span>
                </div>
                <p className="text-xs sm:text-sm text-stone-600 font-light leading-relaxed">
                  Pray for wisdom and discernment for our pastors and Church Council as they select dependable HVAC suppliers, quality energy-efficient inverter units, and fair electrical installations.
                </p>
              </div>

              {/* Prayer Point 3 */}
              <div className="p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-white border border-[#E8D5B5] space-y-1.5 sm:space-y-2 shadow-xs">
                <div className="flex items-center gap-2 text-[#7A121D] font-display font-bold text-sm">
                  <span className="text-[#C99738]">✦</span>
                  <span>3. Sacrificial & Cheerful Hearts</span>
                </div>
                <p className="text-xs sm:text-sm text-stone-600 font-light leading-relaxed">
                  "For God loves a cheerful giver." Pray that giving towards this project will be done in joy, love, and unity, strengthening our church fellowship.
                </p>
              </div>

              {/* Prayer Point 4 */}
              <div className="p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-white border border-[#E8D5B5] space-y-1.5 sm:space-y-2 shadow-xs">
                <div className="flex items-center gap-2 text-emerald-800 font-display font-bold text-sm">
                  <span className="text-[#C99738]">✦</span>
                  <span>4. Comfort for Worship & Greater Harvest</span>
                </div>
                <p className="text-xs sm:text-sm text-stone-600 font-light leading-relaxed">
                  A cooler sanctuary will remove distractions for our senior citizens, youth, and visitors, allowing everyone to listen attentively to God's Word and encounter Jesus.
                </p>
              </div>

            </div>
          </div>

          {/* Quick "I Prayed" Bar */}
          <div className="pt-2 sm:pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-[#5C0612] text-white border border-[#C99738]/40 shadow-lg">
            <div className="space-y-1 text-center sm:text-left">
              <h4 className="text-sm sm:text-base font-display font-bold">Have you paused to pray for Project AC today?</h4>
              <p className="text-xs text-stone-300 font-light">Every prayer counts in the spiritual realm. Stand in faith with Bethesda Community Church.</p>
            </div>
            
            <button
              onClick={handlePrayClick}
              disabled={prayingLoading}
              className={`w-full sm:w-auto px-6 py-3 rounded-full font-bold text-xs uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 shrink-0 shadow-lg min-h-[44px] ${
                hasPrayedSession
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gradient-to-r from-[#E5B869] to-[#C99738] text-[#3D040A] hover:brightness-105'
              }`}
            >
              <Heart className={`w-4 h-4 ${hasPrayedSession ? 'fill-white' : ''}`} />
              <span>{hasPrayedSession ? 'Amen! Prayer Counted' : 'I Prayed for this Need'}</span>
            </button>
          </div>

        </section>


        {/* ============================================================== */}
        {/* HOW TO GIVE / PLEDGE TOWARDS PROJECT AC                        */}
        {/* ============================================================== */}
        <section id="how-to-give" className="bg-[#FAF6EE] rounded-2xl sm:rounded-3xl lg:rounded-[2rem] border border-[#E8D5B5] shadow-xs p-5 sm:p-8 md:p-12 space-y-6 sm:space-y-8">
          
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#7A121D] flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-[#C99738]" /> Giving & Stewardship
            </span>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-display font-bold text-stone-900">
              How to Give Towards Project AC
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 font-light max-w-2xl">
              All gifts given for Project AC are strictly allocated and safeguarded for the sanctuary air conditioning units and electrical line installations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            
            {/* Option 1: In Person on Sunday */}
            <div className="p-5 sm:p-6 rounded-xl sm:rounded-2xl bg-white border border-[#E8D5B5] space-y-4 flex flex-col justify-between shadow-xs">
              <div className="space-y-3">
                <div className="p-3 bg-[#FAF6EE] text-[#7A121D] rounded-xl w-fit border border-[#E8D5B5]">
                  <Church className="w-6 h-6 text-[#7A121D]" />
                </div>
                <h3 className="text-base sm:text-lg font-display font-bold text-stone-900">Sunday In-Person Offering</h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-light">
                  When you attend Sunday morning worship (8:45 AM, countdown 8:40 AM) at Bethesda Community Church, designated <strong>Project AC / Building Fund</strong> envelopes are available at the entrance foyer.
                </p>
                <div className="p-3.5 bg-[#FAF6EE] rounded-xl border border-[#E8D5B5] text-xs space-y-1">
                  <p className="font-semibold text-stone-800">Instructions:</p>
                  <p className="text-stone-600">1. Mark the envelope: <span className="font-bold text-[#7A121D]">"PROJECT AC"</span></p>
                  <p className="text-stone-600">2. Drop in the offering box during or after service</p>
                </div>
              </div>

              <Link
                to="/give"
                className="text-xs font-bold text-[#7A121D] hover:text-[#5C0612] flex items-center gap-1 pt-2 min-h-[36px]"
              >
                <span>View Full Giving Guide</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Option 2: Direct Church Council Coordination / Bank */}
            <div className="p-5 sm:p-6 rounded-xl sm:rounded-2xl bg-white border border-[#E8D5B5] space-y-4 flex flex-col justify-between shadow-xs">
              <div className="space-y-3">
                <div className="p-3 bg-[#FAF6EE] text-[#7A121D] rounded-xl w-fit border border-[#E8D5B5]">
                  <Shield className="w-6 h-6 text-[#C99738]" />
                </div>
                <h3 className="text-base sm:text-lg font-display font-bold text-stone-900">Pledges & Direct Coordination</h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-light">
                  For bank transfer details, family pledges, or overseas members wanting to contribute directly to the building project fund, please reach out to our church treasurer or pastoral office.
                </p>
                <div className="p-3.5 bg-[#FAF6EE] rounded-xl border border-[#E8D5B5] text-xs space-y-2">
                  <div className="flex justify-between items-center text-stone-700">
                    <span className="font-medium">Sanctuary Location:</span>
                    <span className="font-semibold text-stone-900">Kabankalan City</span>
                  </div>
                  <div className="flex justify-between items-center text-stone-700">
                    <span className="font-medium">Designation:</span>
                    <span className="font-bold text-[#7A121D]">Sanctuary AC Fund</span>
                  </div>
                  <div className="flex justify-between items-center text-stone-700">
                    <span className="font-medium">Audited & Reported:</span>
                    <span className="text-emerald-700 font-semibold">Council Financial Reports</span>
                  </div>
                </div>
              </div>

              <Link
                to="/contact"
                className="text-xs font-bold text-[#7A121D] hover:text-[#5C0612] flex items-center gap-1 pt-2 min-h-[36px]"
              >
                <span>Contact Pastoral Office</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

          </div>

        </section>


        {/* ============================================================== */}
        {/* SHARE THIS CAMPAIGN & MOBILIZE THE BODY OF CHRIST             */}
        {/* ============================================================== */}
        <section className="bg-gradient-to-br from-[#1A0B0E] via-[#2A0D13] to-[#1A0B0E] rounded-2xl sm:rounded-3xl lg:rounded-[2rem] border border-[#C99738]/40 shadow-xl p-5 sm:p-8 md:p-10 text-white space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#E5B869] text-[10px] font-bold uppercase tracking-wider border border-[#C99738]/40">
                <Share2 className="w-3.5 h-3.5" />
                <span>Spread the Word</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-display font-bold text-white tracking-tight">
                Share Project AC with Family & Friends
              </h3>
              <p className="text-xs sm:text-sm text-stone-300 font-light leading-relaxed">
                Help us reach church members, overseas relatives, and kingdom partners. Every prayer offered and every gift given brings us closer to a fully air-conditioned sanctuary!
              </p>
            </div>

            {/* Quick Share Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
              <button
                onClick={handleShareClick}
                className="px-5 py-3 rounded-full bg-[#7A121D] hover:bg-[#5C0612] border border-[#C99738] text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg min-h-[44px]"
              >
                <Share2 className="w-4 h-4 text-[#E5B869]" />
                <span>Share Campaign</span>
              </button>

              <button
                onClick={handleShareFacebook}
                className="px-4 py-3 rounded-full bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow min-h-[44px]"
                title="Share on Facebook"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Facebook</span>
              </button>

              <button
                onClick={handleShareWhatsApp}
                className="px-4 py-3 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow min-h-[44px]"
                title="Share on WhatsApp"
              >
                <Send className="w-4 h-4" />
                <span>WhatsApp</span>
              </button>

              <button
                onClick={handleShareEmail}
                className="px-4 py-3 rounded-full bg-white/10 hover:bg-white/20 text-stone-200 border border-white/20 font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow min-h-[44px]"
                title="Share via Email"
              >
                <Mail className="w-4 h-4" />
                <span>Email</span>
              </button>
            </div>
          </div>

          {/* Copyable Link Bar */}
          <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row items-center gap-3">
            <div className="w-full bg-black/40 border border-[#C99738]/30 rounded-xl px-4 py-2.5 text-xs text-stone-300 font-mono select-all truncate">
              {getShareUrl()}
            </div>
            <button
              onClick={handleCopyLink}
              className={`w-full sm:w-auto px-6 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shrink-0 min-h-[40px] ${
                copiedLink
                  ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                  : 'bg-gradient-to-r from-[#E5B869] to-[#C99738] text-[#3D040A] hover:brightness-105'
              }`}
            >
              {copiedLink ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4 text-[#3D040A]" />}
              <span>{copiedLink ? 'Copied to Clipboard!' : 'Copy Direct Link'}</span>
            </button>
          </div>
        </section>


        {/* ============================================================== */}
        {/* PROJECT AC PRAYER WALL & ENCOURAGEMENT FEED                    */}
        {/* ============================================================== */}
        <section className="bg-[#FAF6EE] rounded-2xl sm:rounded-3xl lg:rounded-[2rem] border border-[#E8D5B5] shadow-xs p-5 sm:p-8 md:p-12 space-y-6 sm:space-y-8">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8D5B5]/60 pb-5 sm:pb-6">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#7A121D] flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-[#C99738]" /> Wall of Faith & Prayers
              </span>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-display font-bold text-stone-900">
                Prayers & Blessings for Project AC
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 font-light">
                Leave your prayer of faith, word of encouragement, or Bible verse for our church family.
              </p>
            </div>
          </div>

          {/* Prayer submission form */}
          <form onSubmit={handlePrayerSubmit} className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-[#E8D5B5] space-y-4 shadow-xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900 flex items-center gap-1.5">
              <span className="text-[#C99738]">✦</span> Post a Prayer of Blessing:
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1">Your Name / Family</label>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder={profile?.displayName || "e.g. John Doe / Brother in Christ"}
                  className="w-full px-4 py-2.5 bg-[#FAF6EE] border border-[#E8D5B5] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#7A121D] focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1">Optional Bible Verse</label>
                <input
                  type="text"
                  value={verse}
                  onChange={(e) => setVerse(e.target.value)}
                  placeholder="e.g. 2 Corinthians 9:7"
                  className="w-full px-4 py-2.5 bg-[#FAF6EE] border border-[#E8D5B5] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#7A121D] focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1">Your Prayer / Words of Hope</label>
              <textarea
                rows={3}
                required
                value={prayerMessage}
                onChange={(e) => setPrayerMessage(e.target.value)}
                placeholder="Write your prayer for our church, givers, and the completion of our sanctuary AC..."
                className="w-full px-4 py-2.5 bg-[#FAF6EE] border border-[#E8D5B5] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#7A121D] focus:bg-white transition-all"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
              <span className="text-[11px] text-stone-500 font-medium">Your prayer will be visible to all church members.</span>
              
              <button
                type="submit"
                disabled={submittingPrayer || !prayerMessage.trim()}
                className="w-full sm:w-auto px-6 py-3 bg-[#7A121D] text-white border border-[#C99738] rounded-full font-bold text-xs uppercase tracking-wider hover:bg-[#5C0612] transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50 min-h-[44px]"
              >
                <Send className="w-3.5 h-3.5 text-[#E5B869]" />
                <span>{submittingPrayer ? 'Posting...' : 'Share Prayer'}</span>
              </button>
            </div>

            {prayerSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Thank you! Your prayer has been added to the Project AC wall.</span>
              </div>
            )}
          </form>

          {/* Prayers Feed */}
          <div className="space-y-3 sm:space-y-4 pt-2">
            {prayers.length === 0 ? (
              <div className="text-center py-10 text-stone-400 text-sm">
                No prayers posted yet. Be the first to lift Project AC in prayer!
              </div>
            ) : (
              prayers.map((item) => (
                <div 
                  key={item.id} 
                  className="p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-white border border-[#E8D5B5] hover:border-[#C99738]/60 transition-all space-y-2 relative shadow-xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#7A121D] text-[#E5B869] flex items-center justify-center font-bold text-xs border border-[#C99738]/40">
                        {item.authorName.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-xs font-bold text-stone-900">{item.authorName}</span>
                      {item.verse && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FAF6EE] text-[#7A121D] border border-[#E8D5B5]">
                          {item.verse}
                        </span>
                      )}
                    </div>

                    <span className="text-[10px] text-stone-400 font-medium uppercase tracking-wider">
                      {formatDate(item.createdAt)}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-stone-600 font-light leading-relaxed pl-9">
                    "{item.message}"
                  </p>
                </div>
              ))
            )}
          </div>

        </section>

      </div>


      {/* ============================================================== */}
      {/* COUNCIL / ADMIN EDIT MODAL FOR UPDATING NUMBERS               */}
      {/* ============================================================== */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#FDFBF7] rounded-2xl sm:rounded-3xl p-5 sm:p-8 max-w-lg w-full shadow-2xl border border-[#E8D5B5] space-y-6 max-h-[88svh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-[#E8D5B5] pb-4">
                <div className="space-y-1">
                  <h3 className="text-base sm:text-lg font-bold text-stone-900">Update Campaign Figures</h3>
                  <p className="text-xs text-stone-500 font-medium">Authorized Superadmin only: update the live thermometer and budget figures as donations arrive.</p>
                </div>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full text-stone-400 hover:text-stone-700"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveCampaign} className="space-y-4 text-xs">
                
                {/* Target Amount */}
                <div>
                  <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Fundraising Goal / Budget
                  </label>
                  <input
                    type="number"
                    min="1000"
                    step="1000"
                    required
                    value={editGoal}
                    onChange={(e) => setEditGoal(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-white border border-[#E8D5B5] rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#7A121D]"
                  />
                  <p className="text-[10px] text-stone-400 mt-1">Currently: ₱{Number(editGoal).toLocaleString()}</p>
                </div>

                {/* Raised Amount */}
                <div>
                  <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Current Amount Raised to Date
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    required
                    value={editRaised}
                    onChange={(e) => setEditRaised(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-white border border-[#E8D5B5] rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#7A121D]"
                  />
                  <p className="text-[10px] text-stone-400 mt-1">Currently: ₱{Number(editRaised).toLocaleString()} ({((editRaised / (editGoal || 1)) * 100).toFixed(1)}%)</p>
                </div>

                {/* Mission Text */}
                <div>
                  <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Mission Statement
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={editMission}
                    onChange={(e) => setEditMission(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-[#E8D5B5] rounded-xl text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#7A121D]"
                  />
                </div>

                <div className="pt-3 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-5 py-2.5 rounded-full text-stone-500 font-bold uppercase tracking-wider hover:bg-stone-200/50 min-h-[44px]"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={savingCampaign}
                    className="px-6 py-2.5 rounded-full bg-[#7A121D] text-white border border-[#C99738] font-bold uppercase tracking-wider hover:bg-[#5C0612] transition-all shadow-md disabled:opacity-50 min-h-[44px]"
                  >
                    {savingCampaign ? 'Saving...' : 'Save & Update Live'}
                  </button>
                </div>

              </form>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
