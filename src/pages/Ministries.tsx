import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Users, Heart, Star, ArrowRight, ShieldCheck, Music, Video, Sparkles, Filter, Calendar, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCMS } from '../hooks/useCMS';
import VisualCMSBar from '../components/cms/VisualCMSBar';
import CMSImage from '../components/cms/CMSImage';
import CMSText from '../components/cms/CMSText';
import CMSButton from '../components/cms/CMSButton';

const ICON_MAP: Record<string, any> = {
  Users,
  Heart,
  Star,
  ShieldCheck,
  Music,
  Video
};

const CATEGORIES = [
  'All',
  'Kids & Youth',
  'Adults & Family',
  'Worship & Creative',
  'Discipleship'
];

export default function Ministries() {
  const { pageData } = useCMS('ministries');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const defaultMinistries = [
    {
      id: 'superbook-kids-sbk',
      title: 'Superbook Kids (SBK)',
      category: 'Kids & Youth',
      meetingTime: 'Sundays @ 8:45 AM (2nd Level)',
      description: 'Nurturing the youngest hearts in the love of Jesus through fun, biblically-grounded teaching and activities.',
      icon: Star,
      image: 'https://images.unsplash.com/photo-1489710437720-ebb67ec84dd2?auto=format&fit=crop&q=80&w=800'
    },
    {
      id: 'ignite-one-youth-fellowship',
      title: 'Ignite One Youth Fellowship',
      category: 'Kids & Youth',
      meetingTime: 'Saturdays @ 3:00 PM',
      description: 'A vibrant space for students to find their identity in Christ, build authentic friendships, and grow in faith.',
      icon: Users,
      image: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&q=80&w=800'
    },
    {
      id: 'yah-young-adults-huddle',
      title: 'YAH (Young Adults Huddle)',
      category: 'Adults & Family',
      meetingTime: 'Fridays @ 7:00 PM',
      description: 'Connecting young professionals and university students as they navigate life, career, and faith together.',
      icon: Heart,
      image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=800'
    },
    {
      id: 'the-exemplary-husband-sherpas',
      title: 'The Exemplary Husband (Sherpas)',
      category: 'Adults & Family',
      meetingTime: 'Bi-weekly Saturdays',
      description: 'Equipping men to lead their families with Christ-like love, spiritual strength, and enduring integrity.',
      icon: ShieldCheck,
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800'
    },
    {
      id: 'circle-of-women',
      title: 'Circle of Women',
      category: 'Adults & Family',
      meetingTime: 'Monthly Gatherings',
      description: 'Empowering women of all ages to grow in their spiritual journey and uplift one another in prayer.',
      icon: Heart,
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800'
    },
    {
      id: 'young-at-hearts',
      title: 'Young at Hearts',
      category: 'Adults & Family',
      meetingTime: 'Midweek Fellowship',
      description: 'A loving community for our seniors to fellowship, share wisdom, and celebrate the goodness of God.',
      icon: Heart,
      image: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=800'
    },
    {
      id: 'harkel-music-team',
      title: 'Harkel (Music Team)',
      category: 'Worship & Creative',
      meetingTime: 'Thursdays Practice & Sundays',
      description: 'Leading our community in authentic worship through music, praise instruments, and vocal excellence.',
      icon: Music,
      image: 'https://images.unsplash.com/photo-1514525253344-f814d074358a?auto=format&fit=crop&q=80&w=800'
    },
    {
      id: 'audio-video-av',
      title: 'Audio Video (AV Team)',
      category: 'Worship & Creative',
      meetingTime: 'Sunday Production Team',
      description: 'Supporting our services, sound fidelity, lighting, and live stream with technical excellence.',
      icon: Video,
      image: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&q=80&w=800'
    },
    {
      id: 'discipleship-groups',
      title: 'Discipleship Groups',
      category: 'Discipleship',
      meetingTime: 'Various Weekly Times',
      description: "Small groups dedicated to studying God's Word, prayer accountability, and mutual encouragement.",
      icon: Users,
      image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=800'
    }
  ];

  // Merge CMS cards if present
  const ministriesSection = pageData?.sections?.find(s => s.id === 'ministries-list');
  const rawList = ministriesSection?.cards?.length 
    ? ministriesSection.cards.map(c => {
        const fallback = defaultMinistries.find(d => d.id === c.id) || defaultMinistries[0];
        const IconComponent = c.iconName && ICON_MAP[c.iconName] ? ICON_MAP[c.iconName] : fallback.icon;
        return {
          id: c.id,
          title: c.title,
          category: fallback.category,
          meetingTime: fallback.meetingTime,
          description: c.description,
          image: c.imageUrl || fallback.image,
          icon: IconComponent,
          link: c.buttonUrl || `/ministries/${c.id}`
        };
      })
    : defaultMinistries.map(m => ({
        ...m,
        link: `/ministries/${m.id}`
      }));

  const filteredMinistries = useMemo(() => {
    if (selectedCategory === 'All') return rawList;
    return rawList.filter(m => m.category === selectedCategory);
  }, [rawList, selectedCategory]);

  const heroImage = pageData?.hero?.imageUrl || "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=1920";
  const ctaSection = pageData?.sections?.find(s => s.id === 'ministries-cta') || pageData?.sections?.[0];

  return (
    <div className="pb-24 sm:pb-32 bg-[#FAF7F2] min-h-screen relative">
      {/* Super Admin Visual CMS Toolbar */}
      <VisualCMSBar pageId="ministries" pageName="Ministries Page" />

      {/* Hero Header - Matching 💼 Ministries.png */}
      {pageData?.hero?.visible !== false && (
        <section className="relative pt-16 sm:pt-24 pb-16 sm:pb-20 overflow-hidden bg-gradient-to-b from-[#1A0B0E] via-[#2A0D13] to-[#1A0B0E] border-b border-[#C99738]/30">
          <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
            <CMSImage 
              src={heroImage} 
              alt="Ministries Background" 
              className="w-full h-full object-cover"
              pageId="ministries"
              target={{ type: 'hero' }}
              title="Edit Ministries Hero Banner Photo"
            />
          </div>
          <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-black/40 border border-[#C99738]/50 rounded-full text-[#F0CA7D] text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] mb-4 sm:mb-6 shadow-2xl">
                <span className="text-[#E5B869] font-display">✦</span>
                <CMSText
                  pageId="ministries"
                  target={{ type: 'hero', field: 'badge' }}
                  fallbackText="Connect & Serve"
                  label="Ministries Hero Badge"
                >
                  {pageData?.hero?.badge || 'Connect & Serve'}
                </CMSText>
                <span className="text-[#E5B869] font-display">✦</span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-extrabold text-white mb-4 sm:mb-6 tracking-tight">
                <CMSText
                  pageId="ministries"
                  target={{ type: 'hero', field: 'title' }}
                  fallbackText="Our Ministries"
                  label="Ministries Hero Title"
                >
                  {pageData?.hero?.title || 'Our Ministries'}
                </CMSText>
              </h1>

              {pageData?.hero?.subtitle && (
                <p className="text-base sm:text-xl text-[#E5B869] font-display italic mb-3">
                  <CMSText
                    pageId="ministries"
                    target={{ type: 'hero', field: 'subtitle' }}
                    fallbackText="A place for everyone to belong, grow, and serve"
                    label="Ministries Hero Subtitle"
                  >
                    {pageData?.hero?.subtitle || 'A place for everyone to belong, grow, and serve'}
                  </CMSText>
                </p>
              )}

              <p className="text-xs sm:text-base text-stone-300 max-w-2xl mx-auto font-light leading-relaxed">
                <CMSText
                  pageId="ministries"
                  target={{ type: 'hero', field: 'description' }}
                  fallbackText="From kids and youth to families, seniors, and worship teams, find the community where God is moving in your life."
                  label="Ministries Hero Description"
                  multiline={true}
                >
                  {pageData?.hero?.description || 'From kids and youth to families, seniors, and worship teams, find the community where God is moving in your life.'}
                </CMSText>
              </p>
            </motion.div>
          </div>
        </section>
      )}

      {/* Main Grid Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        {/* Category Filter Tabs */}
        <div className="flex items-center justify-start sm:justify-center overflow-x-auto gap-2 pb-4 mb-10 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                selectedCategory === cat
                  ? 'bg-[#7A121D] text-white shadow-sm'
                  : 'bg-white hover:bg-[#FAF6EE] text-slate-700 border border-[#E8D5B5]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Ministries 3-Column Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
          {filteredMinistries.map((ministry, i) => (
            <motion.div 
              key={ministry.id || i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-3xl overflow-hidden border border-[#E8D5B5] shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="aspect-[16/10] relative overflow-hidden bg-stone-100 border-b border-[#E8D5B5]/60">
                  <CMSImage 
                    src={ministry.image} 
                    alt={ministry.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    pageId="ministries"
                    target={{
                      type: 'card',
                      sectionId: 'ministries-list',
                      cardId: ministry.id
                    }}
                    title={`Edit ${ministry.title} Photo`}
                  />
                  <div className="absolute top-4 left-4 w-9 h-9 rounded-xl bg-white/95 backdrop-blur-sm text-[#7A121D] flex items-center justify-center shadow-md pointer-events-none border border-[#E8D5B5]">
                    <ministry.icon className="h-4 w-4" />
                  </div>
                </div>

                <div className="p-6 sm:p-7">
                  {/* Category and meeting time unboxed text */}
                  <div className="flex items-center gap-2 text-[11px] font-bold text-[#7A121D] uppercase tracking-wider mb-2">
                    <span>{ministry.category || 'Ministry'}</span>
                    {ministry.meetingTime && (
                      <>
                        <span className="text-slate-300">·</span>
                        <span className="text-slate-500 font-normal">{ministry.meetingTime}</span>
                      </>
                    )}
                  </div>

                  <h3 className="text-xl sm:text-2xl font-display font-bold text-slate-900 group-hover:text-[#7A121D] transition-colors mb-3 leading-snug">
                    <CMSText
                      pageId="ministries"
                      target={{ type: 'card', sectionId: 'ministries-list', cardId: ministry.id, field: 'title' }}
                      fallbackText={ministry.title}
                      label={`Ministry: ${ministry.title}`}
                    >
                      {ministry.title}
                    </CMSText>
                  </h3>

                  <div className="text-slate-600 font-light text-xs sm:text-sm leading-relaxed line-clamp-3">
                    <CMSText
                      pageId="ministries"
                      target={{ type: 'card', sectionId: 'ministries-list', cardId: ministry.id, field: 'description' }}
                      fallbackText={ministry.description}
                      label={`Description: ${ministry.title}`}
                      multiline={true}
                    >
                      {ministry.description}
                    </CMSText>
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-7 pt-0 border-t border-[#E8D5B5]/60 mt-4 flex items-center justify-between">
                <Link 
                  to={ministry.link} 
                  className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#7A121D] hover:text-[#5C0612] transition-colors py-2"
                >
                  <span>Learn More</span>
                  <ArrowRight className="h-3.5 w-3.5 text-[#C99738] group-hover:translate-x-1 transition-transform" />
                </Link>
                <span className="text-[11px] text-slate-400 font-medium">BCC Family</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA Card Matching Reference */}
        {ctaSection?.visible !== false && (
          <div className="mt-16 sm:mt-24">
            <div className="bg-gradient-to-r from-[#5C0612] via-[#7A121D] to-[#3D040A] rounded-3xl p-8 sm:p-12 lg:p-16 text-center text-white relative overflow-hidden shadow-xl border-2 border-[#C99738]/50">
              <div className="relative z-10 max-w-2xl mx-auto space-y-4">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest text-[#F0CA7D] border border-white/20">
                  <Sparkles className="w-3.5 h-3.5 text-[#E5B869]" />
                  <span>Get Involved</span>
                </div>

                <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold leading-tight">
                  <CMSText
                    pageId="ministries"
                    target={{ type: 'section', sectionId: ctaSection?.id || 'ministries-cta', field: 'title' }}
                    fallbackText="Ready to Serve or Join a Group?"
                    label="CTA Title"
                  >
                    {ctaSection?.title || 'Ready to Serve or Join a Group?'}
                  </CMSText>
                </h2>

                <p className="text-sm sm:text-base text-stone-200 font-light leading-relaxed">
                  <CMSText
                    pageId="ministries"
                    target={{ type: 'section', sectionId: ctaSection?.id || 'ministries-cta', field: 'content' }}
                    fallbackText="God has given each of us unique gifts to build up His church. We would love to help you find the right place to connect."
                    label="CTA Description"
                    multiline={true}
                  >
                    {ctaSection?.content || "God has given each of us unique gifts to build up His church. We would love to help you find the right place to connect."}
                  </CMSText>
                </p>

                <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
                  <CMSButton
                    pageId="ministries"
                    target={{ type: 'section', sectionId: ctaSection?.id || 'ministries-cta' }}
                    buttonConfig={ctaSection?.primaryButton}
                    fallbackLabel="Contact Pastoral Team"
                    fallbackUrl="/contact"
                    label="CTA Action Button"
                    className="px-8 py-3.5 bg-gradient-to-r from-[#E5B869] to-[#C99738] text-[#3D040A] rounded-full font-bold uppercase tracking-wider text-xs hover:brightness-110 transition-all shadow-md flex items-center justify-center min-h-[44px]"
                  />
                  <Link
                    to="/new-here"
                    className="px-8 py-3.5 bg-white/10 border border-white/30 text-white rounded-full font-bold uppercase tracking-wider text-xs hover:bg-white/20 transition-all min-h-[44px] flex items-center justify-center"
                  >
                    New Here? Plan a Visit
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
