import React, { useState } from 'react';
import { 
  Users, Heart, BookOpen, CheckCircle2, 
  ArrowRight, Loader2, MessageSquare, Mail, Phone, User as UserIcon, Shield, Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useCMS } from '../hooks/useCMS';
import VisualCMSBar from '../components/cms/VisualCMSBar';

export default function Membership() {
  const { pageData } = useCMS('membership');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, 'membership_inquiries'), {
        ...formData,
        status: 'new',
        createdAt: serverTimestamp()
      });
      setSuccess(true);
      setFormData({ fullName: '', email: '', phone: '', message: '' });
    } catch (error) {
      console.error('Error submitting membership inquiry:', error);
      alert('Failed to submit. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const heroImg = pageData?.hero?.imageUrl || "https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&q=80&w=1920";
  const covenantSection = pageData?.sections?.find(s => s.id === 'membership-covenant') || pageData?.sections?.[0];
  const stepsSection = pageData?.sections?.find(s => s.id === 'membership-steps') || pageData?.sections?.[1];

  const getIcon = (name?: string) => {
    switch (name) {
      case 'Shield': return Shield;
      case 'Users': return Users;
      case 'Heart': return Heart;
      case 'BookOpen': return BookOpen;
      default: return Sparkles;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 relative pb-20">
      {/* Super Admin Visual CMS Toolbar */}
      <VisualCMSBar pageId="membership" pageName="Membership & Covenant" />

      {/* Hero Section */}
      {pageData?.hero?.visible !== false && (
        <section className="relative py-16 md:py-24 bg-slate-900 overflow-hidden">
          <div className="absolute inset-0 opacity-25">
            <img 
              src={heroImg} 
              alt="Bethesda Community" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-slate-900/60" />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
            {pageData?.hero?.badge && (
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-maroon/30 border border-maroon/40 rounded-full text-[10px] font-bold text-white uppercase tracking-[0.2em] mb-6">
                <Sparkles className="h-3.5 w-3.5 text-maroon" /> {pageData.hero.badge}
              </div>
            )}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white mb-6 leading-tight">
              {pageData?.hero?.title || 'Becoming a Part of BCC'}
            </h1>
            {pageData?.hero?.subtitle && (
              <p className="text-lg text-amber-400 font-medium mb-4">
                {pageData.hero.subtitle}
              </p>
            )}
            <p className="text-lg md:text-xl text-slate-300 leading-relaxed mb-8 max-w-2xl mx-auto font-light">
              {pageData?.hero?.description || 'Membership at Bethesda Community Church is not a club membership—it is a biblical commitment to love, serve, grow, and walk in unity with a local body of believers.'}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              {pageData?.hero?.primaryButton?.visible && (
                <a
                  href={pageData.hero.primaryButton.url || '#inquiry-form'}
                  target={pageData.hero.primaryButton.openInNewTab ? '_blank' : undefined}
                  rel="noreferrer"
                  className="px-6 py-3 bg-maroon text-white font-bold rounded-full text-xs uppercase tracking-widest hover:bg-maroon/90 shadow-lg shadow-maroon/20 transition-all"
                >
                  {pageData.hero.primaryButton.label}
                </a>
              )}
              {pageData?.hero?.secondaryButton?.visible && (
                <a
                  href={pageData.hero.secondaryButton.url || '#process'}
                  className="px-6 py-3 bg-slate-800 text-white font-bold rounded-full text-xs uppercase tracking-widest hover:bg-slate-700 transition-all border border-slate-700"
                >
                  {pageData.hero.secondaryButton.label}
                </a>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Covenant Highlights */}
      {covenantSection && covenantSection.visible !== false && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center max-w-3xl mx-auto mb-12">
            {covenantSection.badge && (
              <span className="text-xs font-bold text-maroon uppercase tracking-widest block mb-2">
                {covenantSection.badge}
              </span>
            )}
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-slate-900">
              {covenantSection.title || 'Our Covenant of Fellowship'}
            </h2>
            {covenantSection.content && (
              <p className="text-slate-600 font-light text-base mt-2 leading-relaxed">
                {covenantSection.content}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {(covenantSection.cards || []).map((card) => {
              const IconComp = getIcon(card.iconName);
              return (
                <div key={card.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-3">
                  <div className="p-3 bg-maroon/10 text-maroon rounded-2xl w-fit">
                    <IconComp className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{card.title}</h3>
                  <p className="text-slate-600 font-light text-xs leading-relaxed">{card.description}</p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Content: Pathway & Inquiry Form */}
      <div id="process" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          {/* Left: Process */}
          <div>
            <div className="mb-8">
              {stepsSection?.badge && (
                <span className="text-xs font-bold text-maroon uppercase tracking-widest block mb-1">
                  {stepsSection.badge}
                </span>
              )}
              <h2 className="text-3xl font-display font-bold text-slate-900">
                {stepsSection?.title || 'The Path to Membership'}
              </h2>
              {stepsSection?.content && (
                <p className="text-slate-600 font-light text-sm mt-1">
                  {stepsSection.content}
                </p>
              )}
            </div>

            <div className="space-y-6">
              {(stepsSection?.cards || []).map((step, i) => (
                <div key={step.id || i} className="flex gap-5 p-5 bg-white rounded-3xl border border-slate-100 shadow-sm">
                  <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-maroon/10 text-maroon font-display font-bold text-lg flex items-center justify-center">
                    {step.badge || `0${i + 1}`}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 mb-1">{step.title}</h3>
                    {step.subtitle && <p className="text-xs text-maroon font-semibold mb-1">{step.subtitle}</p>}
                    <p className="text-slate-600 font-light text-xs leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Call to Action Form */}
          <div id="inquiry-form" className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-slate-100">
            <div className="text-center mb-8">
              <div className="inline-flex p-3 rounded-2xl bg-maroon/5 text-maroon mb-4">
                <MessageSquare className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-display font-bold text-slate-900">Express Your Interest</h3>
              <p className="text-slate-600 mt-2 text-sm font-light leading-relaxed">
                Ready to take the next step? Fill out this simple form and our church leadership will contact you regarding the next Membership Class.
              </p>
            </div>

            {success ? (
              <div className="p-8 bg-green-50 border border-green-100 rounded-3xl text-center animate-in fade-in zoom-in duration-500">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h4 className="text-xl font-bold text-green-900 mb-2">Interest Recorded!</h4>
                <p className="text-green-700 leading-relaxed text-sm">
                  Thank you for reaching out. Our Church Admin or Elders will contact you soon regarding the next scheduled Membership Class.
                </p>
                <button 
                  onClick={() => setSuccess(false)}
                  className="mt-8 text-xs font-bold text-green-600 hover:underline uppercase tracking-wider"
                >
                  Submit another inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Full Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      required
                      type="text"
                      placeholder="Juan Dela Cruz"
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-maroon/20 focus:border-maroon outline-none transition-all text-sm"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      required
                      type="email"
                      placeholder="juan@example.com"
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-maroon/20 focus:border-maroon outline-none transition-all text-sm"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Phone Number (Optional)</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="tel"
                      placeholder="+63 900 000 0000"
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-maroon/20 focus:border-maroon outline-none transition-all text-sm"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Message (Optional)</label>
                  <textarea
                    placeholder="Tell us a bit about your spiritual journey or questions..."
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-maroon/20 focus:border-maroon outline-none transition-all resize-none text-sm"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-maroon text-white rounded-xl font-bold hover:bg-maroon/90 transition-all shadow-lg shadow-maroon/20 flex items-center justify-center gap-2 disabled:opacity-50 text-xs uppercase tracking-wider"
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>Submit Interest <ArrowRight className="h-4 w-4" /></>
                  )}
                </button>
                <p className="text-[10px] text-center text-slate-400 uppercase tracking-widest">
                  No account registration required to inquire
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
