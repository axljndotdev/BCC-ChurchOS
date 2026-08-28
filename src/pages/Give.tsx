import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Heart, MapPin, Clock, ArrowRight, 
  Sparkles, Church, Info, ShieldCheck, BookOpen
} from 'lucide-react';
import { useCMS } from '../hooks/useCMS';
import VisualCMSBar from '../components/cms/VisualCMSBar';

export default function Give() {
  const { pageData } = useCMS('give');

  const bannerImg = pageData?.hero?.imageUrl || "https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&q=80&w=1920";
  const noticeSection = pageData?.sections?.find(s => s.id === 'give-notice-box') || pageData?.sections?.[0];
  const serviceTimesSection = pageData?.sections?.find(s => s.id === 'give-service-times') || pageData?.sections?.[1];
  const biblicalCardsSection = pageData?.sections?.find(s => s.id === 'give-biblical-cards') || pageData?.sections?.[2];

  return (
    <div className="pb-24 bg-slate-50 min-h-screen relative">
      {/* Super Admin Visual CMS Toolbar */}
      <VisualCMSBar pageId="give" pageName="Giving & Stewardship" />

      {/* Header */}
      {pageData?.hero?.visible !== false && (
        <section className="relative py-20 bg-slate-900 overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <img 
              src={bannerImg} 
              alt="Worship and Giving at BCC" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-slate-900/70" />
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
            {pageData?.hero?.badge && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 bg-maroon/20 border border-maroon/40 rounded-full text-[10px] font-bold text-white uppercase tracking-[0.2em] mb-6"
              >
                <Heart className="h-3.5 w-3.5 text-maroon" /> {pageData.hero.badge}
              </motion.div>
            )}
            <motion.h1 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-display font-bold text-white mb-6 tracking-tight"
            >
              {pageData?.hero?.title || 'Giving & Stewardship'}
            </motion.h1>
            {pageData?.hero?.subtitle && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-lg text-amber-400 font-medium mb-3"
              >
                {pageData.hero.subtitle}
              </motion.p>
            )}
            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-light leading-relaxed"
            >
              {pageData?.hero?.description || '"Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver."'}
            </motion.p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
              {pageData?.hero?.primaryButton?.visible && (
                <a
                  href={pageData.hero.primaryButton.url || '#service-times'}
                  target={pageData.hero.primaryButton.openInNewTab ? '_blank' : undefined}
                  rel="noreferrer"
                  className="px-6 py-3 bg-maroon text-white font-bold rounded-full text-xs uppercase tracking-widest hover:bg-maroon/90 shadow-lg shadow-maroon/20 transition-all"
                >
                  {pageData.hero.primaryButton.label}
                </a>
              )}
              {pageData?.hero?.secondaryButton?.visible && (
                <Link
                  to={pageData.hero.secondaryButton.url || '/contact'}
                  className="px-6 py-3 bg-slate-800 text-white font-bold rounded-full text-xs uppercase tracking-widest hover:bg-slate-700 transition-all border border-slate-700"
                >
                  {pageData.hero.secondaryButton.label}
                </Link>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Main Content Area */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">
        
        {/* Notice Card: In Person Giving */}
        {noticeSection && noticeSection.visible !== false && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[2.5rem] border border-amber-200/80 shadow-sm p-8 sm:p-12 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
            
            <div className="flex flex-col sm:flex-row items-start gap-6">
              <div className="p-4 bg-amber-50 text-amber-700 rounded-2xl shrink-0 border border-amber-200">
                <Info className="h-7 w-7" />
              </div>
              <div className="space-y-4">
                <div className="inline-block px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-[10px] font-bold uppercase tracking-widest">
                  {noticeSection.badge || 'In-Person Giving'}
                </div>
                <h2 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 leading-snug">
                  {noticeSection.title || 'Join Us in Person to Give Your Offering'}
                </h2>
                <p className="text-slate-600 font-light text-base leading-relaxed">
                  {noticeSection.content || 'Online donations and electronic transfers are currently unavailable. We warmly encourage church members, visitors, and friends to give their tithes, offerings, and gifts in person when you visit Bethesda Community Church for our Sunday Worship Services.'}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* How to Give on Sunday Card */}
        {serviceTimesSection && serviceTimesSection.visible !== false && (
          <div id="service-times" className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 sm:p-12 space-y-8">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-maroon/10 text-maroon rounded-2xl">
                <Church className="h-6 w-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-maroon uppercase tracking-widest">
                  {serviceTimesSection.badge || 'In-Person Worship'}
                </span>
                <h3 className="text-2xl font-display font-bold text-slate-900">
                  {serviceTimesSection.title || 'Sunday Service Times'}
                </h3>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-maroon uppercase tracking-widest">Sunday Morning Service</span>
                <Clock className="h-4 w-4 text-slate-400" />
              </div>
              <p className="text-3xl font-display font-bold text-slate-900">9:00 AM</p>
              <p className="text-xs text-slate-500 font-light">Sunday Morning Worship & Preaching</p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="space-y-1">
                <p className="text-xs font-bold text-maroon uppercase tracking-widest flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" /> Sanctuary Location
                </p>
                <p className="text-base font-display">Bethesda Community Church (BCC)</p>
                <p className="text-xs text-slate-400 font-light">Kabankalan City, Negros Occidental</p>
              </div>
              {serviceTimesSection.primaryButton?.visible !== false && (
                <Link 
                  to={serviceTimesSection.primaryButton?.url || "/contact"} 
                  className="px-6 py-3 bg-white text-slate-900 font-bold rounded-full text-xs uppercase tracking-widest hover:bg-maroon hover:text-white transition-all duration-300 flex items-center gap-2 shrink-0 shadow-lg"
                >
                  {serviceTimesSection.primaryButton?.label || 'Get Directions'} <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Biblical Giving Cards */}
        {biblicalCardsSection && biblicalCardsSection.visible !== false && (
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 sm:p-12 space-y-6">
            <div>
              {biblicalCardsSection.badge && (
                <span className="text-xs font-bold text-maroon uppercase tracking-widest block mb-1">
                  {biblicalCardsSection.badge}
                </span>
              )}
              <h3 className="text-2xl font-display font-bold text-slate-900">
                {biblicalCardsSection.title || 'The Heart of Biblical Giving'}
              </h3>
              {biblicalCardsSection.content && (
                <p className="text-slate-500 font-light text-sm mt-1">
                  {biblicalCardsSection.content}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              {(biblicalCardsSection.cards || []).map((card) => (
                <div key={card.id} className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                  <div className="p-2.5 bg-maroon/10 text-maroon rounded-xl w-fit">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-base">{card.title}</h4>
                  <p className="text-slate-600 font-light text-xs leading-relaxed">{card.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Giving Guidelines / What to Expect */}
        <div className="bg-white rounded-[2rem] border border-slate-100 p-8 sm:p-10 space-y-4">
          <div className="p-3 bg-slate-100 text-slate-800 rounded-xl w-fit">
            <Sparkles className="h-5 w-5" />
          </div>
          <h4 className="text-xl font-display font-bold text-slate-900">Offering Envelopes</h4>
          <p className="text-slate-600 font-light text-base leading-relaxed">
            Designated envelopes for Tithes, General Offerings, Missions, and Building Fund are readily available at the entrance foyer. You can drop your envelope into the offering box there.
          </p>
        </div>

        {/* Support & Contact note */}
        <div className="text-center pt-4">
          <p className="text-xs text-slate-400 font-light">
            Have questions about stewardship or visiting for the first time?{' '}
            <Link to="/contact" className="text-maroon font-semibold underline hover:text-slate-900 transition-colors">
              Contact our pastoral team
            </Link>
          </p>
        </div>

      </section>
    </div>
  );
}
