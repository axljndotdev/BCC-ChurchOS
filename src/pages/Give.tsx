import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Heart, MapPin, Clock, ArrowRight, 
  Sparkles, Church, Info, ShieldCheck, BookOpen
} from 'lucide-react';
import { useCMS } from '../hooks/useCMS';
import VisualCMSBar from '../components/cms/VisualCMSBar';
import CMSImage from '../components/cms/CMSImage';
import CMSText from '../components/cms/CMSText';
import CMSButton from '../components/cms/CMSButton';

export default function Give() {
  const { pageData } = useCMS('give');

  const bannerImg = pageData?.hero?.imageUrl || "https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&q=80&w=1920";
  const noticeSection = pageData?.sections?.find(s => s.id === 'give-notice-box') || pageData?.sections?.[0];
  const serviceTimesSection = pageData?.sections?.find(s => s.id === 'give-service-times') || pageData?.sections?.[1];
  const biblicalCardsSection = pageData?.sections?.find(s => s.id === 'give-biblical-cards') || pageData?.sections?.[2];

  return (
    <div className="pb-24 bg-[#FAF7F2] min-h-screen relative">
      {/* Super Admin Visual CMS Toolbar */}
      <VisualCMSBar pageId="give" pageName="Giving & Stewardship" />

      {/* Header */}
      {pageData?.hero?.visible !== false && (
        <section className="relative py-14 sm:py-20 md:py-24 bg-[#1A0B0E] overflow-hidden border-b border-[#C99738]/30">
          <div className="absolute inset-0 opacity-25">
            <CMSImage 
              src={bannerImg} 
              alt="Worship and Giving at BCC" 
              className="w-full h-full object-cover"
              pageId="give"
              target={{ type: 'hero' }}
              title="Edit Giving Page Banner Photo"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1A0B0E] via-[#3D060D]/80 to-[#1A0B0E] pointer-events-none" />
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
            <div className="mb-4 sm:mb-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-black/40 border border-[#C99738]/50 rounded-full text-[10px] font-bold text-[#F0CA7D] uppercase tracking-[0.2em]">
                <span className="text-[#E5B869] font-serif">✦</span>
                <CMSText
                  pageId="give"
                  target={{ type: 'hero', field: 'badge' }}
                  fallbackText="Generosity & Faith"
                  label="Giving Hero Badge"
                >
                  {pageData?.hero?.badge || 'Generosity & Faith'}
                </CMSText>
                <span className="text-[#E5B869] font-serif">✦</span>
              </div>
            </div>

            <motion.h1 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl sm:text-5xl md:text-6xl font-serif font-bold text-white mb-4 sm:mb-6 tracking-tight leading-tight"
            >
              <CMSText
                pageId="give"
                target={{ type: 'hero', field: 'title' }}
                fallbackText="Giving & Stewardship"
                label="Giving Hero Title"
              >
                {pageData?.hero?.title || 'Giving & Stewardship'}
              </CMSText>
            </motion.h1>

            <div className="mb-3 sm:mb-4">
              <CMSText
                pageId="give"
                target={{ type: 'hero', field: 'subtitle' }}
                fallbackText="Supporting the Ministry and Mission of BCC"
                label="Giving Hero Subtitle"
                className="text-base sm:text-lg text-[#E5B869] font-serif italic"
              >
                {pageData?.hero?.subtitle}
              </CMSText>
            </div>

            <div className="max-w-2xl mx-auto mb-6 sm:mb-8">
              <CMSText
                pageId="give"
                target={{ type: 'hero', field: 'description' }}
                fallbackText='"Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver."'
                label="Giving Hero Scripture / Description"
                multiline={true}
                className="text-sm sm:text-base md:text-lg text-stone-200 font-light leading-relaxed block px-2"
              >
                {pageData?.hero?.description}
              </CMSText>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 mt-6 sm:mt-8 w-full max-w-sm sm:max-w-none mx-auto">
              <CMSButton
                pageId="give"
                target={{ type: 'hero', buttonKey: 'primaryButton' }}
                buttonConfig={pageData?.hero?.primaryButton}
                fallbackLabel="Sunday Service Times"
                fallbackUrl="#service-times"
                label="Primary Giving Button"
                showArrow={false}
                className="w-full sm:w-auto px-6 py-3.5 bg-[#7A121D] text-white border border-[#C99738] font-bold rounded-full text-xs uppercase tracking-widest hover:bg-[#5C0612] shadow-lg transition-all min-h-[44px] flex items-center justify-center touch-manipulation"
              />

              <CMSButton
                pageId="give"
                target={{ type: 'hero', buttonKey: 'secondaryButton' }}
                buttonConfig={pageData?.hero?.secondaryButton}
                fallbackLabel="Contact Pastors"
                fallbackUrl="/contact"
                label="Secondary Giving Button"
                showArrow={false}
                className="w-full sm:w-auto px-6 py-3.5 bg-white/10 text-white font-bold rounded-full text-xs uppercase tracking-widest hover:bg-white/20 transition-all border border-[#E8D5B5]/40 backdrop-blur-sm min-h-[44px] flex items-center justify-center touch-manipulation"
              />
            </div>
          </div>
        </section>
      )}

      {/* Main Content Area */}
      <section className="max-w-4xl mx-auto px-3.5 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-6 sm:space-y-10">
        
        {/* Notice Card: In Person Giving */}
        {noticeSection && noticeSection.visible !== false && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#FAF6EE] rounded-2xl sm:rounded-3xl lg:rounded-[2.5rem] border border-[#E8D5B5] shadow-xs p-5 sm:p-8 lg:p-12 relative overflow-hidden"
          >
            <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
              <div className="p-3 sm:p-4 bg-white text-[#7A121D] rounded-xl sm:rounded-2xl shrink-0 border border-[#E8D5B5] shadow-xs">
                <Info className="h-6 w-6 sm:h-7 sm:w-7" />
              </div>
              <div className="space-y-3 sm:space-y-4 flex-1">
                <div className="mb-1">
                  <span className="text-[10px] font-bold text-[#7A121D] uppercase tracking-widest flex items-center gap-1">
                    <span className="text-[#C99738]">✦</span> In-Person Giving
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl lg:text-3xl font-serif font-bold text-stone-900 leading-snug">
                  <CMSText
                    pageId="give"
                    target={{ type: 'section', sectionId: noticeSection.id, field: 'title' }}
                    fallbackText="Join Us in Person to Give Your Offering"
                    label="Notice Title"
                  >
                    {noticeSection.title || 'Join Us in Person to Give Your Offering'}
                  </CMSText>
                </h2>

                <div className="text-stone-700 font-light text-sm sm:text-base leading-relaxed">
                  <CMSText
                    pageId="give"
                    target={{ type: 'section', sectionId: noticeSection.id, field: 'content' }}
                    fallbackText="Online donations and electronic transfers are currently unavailable. We warmly encourage church members, visitors, and friends to give their tithes, offerings, and gifts in person when you visit Bethesda Community Church for our Sunday Worship Services."
                    label="Notice Description"
                    multiline={true}
                  >
                    {noticeSection.content}
                  </CMSText>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* How to Give on Sunday Card */}
        {serviceTimesSection && serviceTimesSection.visible !== false && (
          <div id="service-times" className="bg-[#FAF6EE] rounded-2xl sm:rounded-3xl lg:rounded-[2.5rem] border border-[#E8D5B5] shadow-xs p-5 sm:p-8 lg:p-12 space-y-6 sm:space-y-8">
            <div className="flex items-center gap-3">
              <div className="p-2.5 sm:p-3 bg-white text-[#7A121D] rounded-xl sm:rounded-2xl border border-[#E8D5B5]">
                <Church className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div>
                <CMSText
                  pageId="give"
                  target={{ type: 'section', sectionId: serviceTimesSection.id, field: 'badge' }}
                  fallbackText="In-Person Worship"
                  label="Service Times Badge"
                  className="text-xs font-bold text-[#7A121D] uppercase tracking-widest block"
                >
                  {serviceTimesSection.badge || 'In-Person Worship'}
                </CMSText>
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
                  <CMSText
                    pageId="give"
                    target={{ type: 'section', sectionId: serviceTimesSection.id, field: 'title' }}
                    fallbackText="Sunday Service Times"
                    label="Service Times Title"
                  >
                    {serviceTimesSection.title || 'Sunday Service Times'}
                  </CMSText>
                </h3>
              </div>
            </div>

            <div className="p-5 sm:p-6 rounded-xl sm:rounded-2xl bg-white border border-[#E8D5B5] space-y-2 sm:space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#7A121D] uppercase tracking-widest flex items-center gap-1">
                  <span className="text-[#C99738]">✦</span> Sunday Morning Service
                </span>
                <Clock className="h-4 w-4 text-[#C99738]" />
              </div>
              <p className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">8:45 AM</p>
              <p className="text-xs text-stone-500 font-light">5-Minute Quiet Countdown starts at 8:40 AM &bull; Concludes ~10:45 AM</p>
            </div>

            <div className="p-5 sm:p-6 rounded-xl sm:rounded-2xl bg-[#5C0612] text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 border border-[#C99738]/40 shadow-lg">
              <div className="space-y-1">
                <p className="text-xs font-bold text-[#E5B869] uppercase tracking-widest flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" /> Sanctuary Location
                </p>
                <p className="text-base font-serif font-semibold">Bethesda Community Church (BCC)</p>
                <p className="text-xs text-stone-300 font-light">Kabankalan City, Negros Occidental</p>
              </div>

              <CMSButton
                pageId="give"
                target={{ type: 'section', sectionId: serviceTimesSection.id }}
                buttonConfig={serviceTimesSection.primaryButton}
                fallbackLabel="Get Directions"
                fallbackUrl="/contact"
                label="Directions Button"
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-[#E5B869] to-[#C99738] text-[#3D040A] font-bold rounded-full text-xs uppercase tracking-widest hover:brightness-105 transition-all duration-300 flex items-center justify-center gap-2 shrink-0 shadow-lg min-h-[44px] touch-manipulation"
              />
            </div>
          </div>
        )}

        {/* Biblical Giving Cards */}
        {biblicalCardsSection && biblicalCardsSection.visible !== false && (
          <div className="bg-[#FAF6EE] rounded-[2.5rem] border border-[#E8D5B5] shadow-xs p-8 sm:p-12 space-y-6">
            <div>
              <div className="mb-1">
                <span className="text-xs font-bold text-[#7A121D] uppercase tracking-widest flex items-center gap-1">
                  <span className="text-[#C99738]">✦</span> Scriptural Principles
                </span>
              </div>

              <h3 className="text-2xl font-display font-bold text-stone-900">
                <CMSText
                  pageId="give"
                  target={{ type: 'section', sectionId: biblicalCardsSection.id, field: 'title' }}
                  fallbackText="The Heart of Biblical Giving"
                  label="Biblical Giving Title"
                >
                  {biblicalCardsSection.title || 'The Heart of Biblical Giving'}
                </CMSText>
              </h3>

              <div className="text-stone-600 font-light text-sm mt-1">
                <CMSText
                  pageId="give"
                  target={{ type: 'section', sectionId: biblicalCardsSection.id, field: 'content' }}
                  fallbackText="Scripture teaches that giving is an act of joyful worship and trust in God's faithful provision."
                  label="Biblical Giving Subtitle"
                  multiline={true}
                >
                  {biblicalCardsSection.content}
                </CMSText>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              {(biblicalCardsSection.cards || []).map((card) => (
                <div key={card.id} className="p-6 rounded-2xl bg-white border border-[#E8D5B5] space-y-3 shadow-xs">
                  <div className="p-2.5 bg-[#FAF6EE] text-[#7A121D] rounded-xl w-fit border border-[#E8D5B5]">
                    <Sparkles className="h-5 w-5 text-[#C99738]" />
                  </div>
                  <h4 className="font-display font-bold text-stone-900 text-base">
                    <CMSText
                      pageId="give"
                      target={{ type: 'card', sectionId: biblicalCardsSection.id, cardId: card.id, field: 'title' }}
                      fallbackText={card.title}
                      label={`Card Title: ${card.title}`}
                    >
                      {card.title}
                    </CMSText>
                  </h4>
                  <div className="text-stone-600 font-light text-xs leading-relaxed">
                    <CMSText
                      pageId="give"
                      target={{ type: 'card', sectionId: biblicalCardsSection.id, cardId: card.id, field: 'description' }}
                      fallbackText={card.description}
                      label={`Card Description: ${card.title}`}
                      multiline={true}
                    >
                      {card.description}
                    </CMSText>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Giving Guidelines / What to Expect */}
        <div className="bg-white rounded-[2rem] border border-[#E8D5B5] p-8 sm:p-10 space-y-4 shadow-xs">
          <div className="p-3 bg-[#FAF6EE] text-[#7A121D] rounded-xl w-fit border border-[#E8D5B5]">
            <Sparkles className="h-5 w-5 text-[#C99738]" />
          </div>
          <h4 className="text-xl font-display font-bold text-stone-900">Offering Envelopes</h4>
          <p className="text-stone-700 font-light text-base leading-relaxed">
            Designated envelopes for Tithes, General Offerings, Missions, and Building Fund / Project AC are readily available at the entrance foyer. You can place your offering in the dedicated drop boxes during Sunday service.
          </p>
        </div>

        {/* Support & Contact note */}
        <div className="text-center pt-4">
          <p className="text-xs text-stone-500 font-light">
            Have questions about stewardship or visiting for the first time?{' '}
            <Link to="/contact" className="text-[#7A121D] font-semibold underline hover:text-[#5C0612] transition-colors">
              Contact our pastoral team
            </Link>
          </p>
        </div>

      </section>
    </div>
  );
}
