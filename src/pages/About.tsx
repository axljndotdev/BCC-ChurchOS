import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Heart, Users, Shield, Target, Quote, Loader2, Compass, Award, Sparkles, ArrowRight, BookOpen, CheckCircle } from 'lucide-react';
import { getLeaders, getSystemSettings } from '../services/db';
import { UserProfile, SystemSettings } from '../types';
import { useCMS } from '../hooks/useCMS';
import { cn } from '../lib/utils';
import VisualCMSBar from '../components/cms/VisualCMSBar';
import CMSText from '../components/cms/CMSText';
import CMSImage from '../components/cms/CMSImage';
import CMSButton from '../components/cms/CMSButton';

export default function About() {
  const { pageData, loading: cmsLoading } = useCMS('about');
  const [leaders, setLeaders] = useState<UserProfile[]>([]);
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [leadersData, sysSettings] = await Promise.all([
          getLeaders(),
          getSystemSettings()
        ]);
        setLeaders(leadersData);
        if (sysSettings) setSettings(sysSettings);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const storyImg = pageData?.hero?.imageUrl || settings?.aboutStoryImageUrl || "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&q=80&w=1920";

  // Dynamic sections from CMS
  const storySection = pageData?.sections?.find(s => s.id === 'about-mission-vision') || pageData?.sections?.[0];
  const valuesSection = pageData?.sections?.find(s => s.id === 'about-core-values') || pageData?.sections?.[1];

  const getIcon = (name?: string) => {
    switch (name) {
      case 'Target': return Target;
      case 'Users': return Users;
      case 'Shield': return Shield;
      case 'Heart': return Heart;
      case 'Compass': return Compass;
      case 'Award': return Award;
      default: return Sparkles;
    }
  };

  const defaultValues = [
    {
      num: '01',
      title: 'Gospel Centered',
      desc: 'The finished work of Jesus Christ on the cross is the heartbeat and foundation of our faith, doctrine, and daily life.'
    },
    {
      num: '02',
      title: 'Authentic Family',
      desc: 'We are more than a congregation—we are a spiritual family where every generation is welcomed, valued, and loved.'
    },
    {
      num: '03',
      title: 'Passionate Worship',
      desc: 'We lift up the name of Jesus through spirit-led praise, uncompromised biblical preaching, and heartfelt devotion.'
    },
    {
      num: '04',
      title: 'Generous Outreach',
      desc: 'Committed to serving our neighbors in Kabankalan City and beyond through tangible acts of Christ-like compassion.'
    }
  ];

  return (
    <div className="pb-24 sm:pb-32 relative bg-[#FAF7F2]">
      {/* Super Admin Visual CMS Toolbar */}
      <VisualCMSBar pageId="about" pageName="About BCC" />

      {/* Hero Section - Matching 📝 About .png */}
      {pageData?.hero?.visible !== false && (
        <section className="relative pt-16 sm:pt-24 pb-16 sm:pb-24 bg-gradient-to-b from-[#1A0B0E] via-[#2A0D13] to-[#1A0B0E] overflow-hidden border-b border-[#C99738]/30">
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <CMSImage 
              src={storyImg} 
              alt="About BCC Banner Photo" 
              className="w-full h-full object-cover"
              pageId="about"
              target={{ type: 'hero' }}
              title="Edit About Page Hero Banner"
            />
          </div>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <div className="mb-4 sm:mb-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-black/40 border border-[#C99738]/50 rounded-full text-[10px] sm:text-xs font-bold text-[#F0CA7D] uppercase tracking-[0.2em] shadow-xl">
                <span className="text-[#E5B869] font-display">✦</span>
                <CMSText
                  pageId="about"
                  target={{ type: 'hero', field: 'badge' }}
                  fallbackText="Our Story & Calling"
                  label="About Hero Badge"
                >
                  {pageData?.hero?.badge || 'Our Story & Calling'}
                </CMSText>
                <span className="text-[#E5B869] font-display">✦</span>
              </div>
            </div>

            <motion.h1 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-extrabold text-white mb-4 sm:mb-6 tracking-tight leading-tight"
            >
              <CMSText
                pageId="about"
                target={{ type: 'hero', field: 'title' }}
                fallbackText="About Bethesda"
                label="About Hero Title"
              >
                {pageData?.hero?.title || 'About Bethesda'}
              </CMSText>
            </motion.h1>

            <div className="mb-4">
              <CMSText
                pageId="about"
                target={{ type: 'hero', field: 'subtitle' }}
                fallbackText="A Sanctuary for the Soul, A Family for the Heart"
                label="About Hero Subtitle"
                className="text-base sm:text-xl text-[#E5B869] font-display italic"
              >
                {pageData?.hero?.subtitle || 'A Sanctuary for the Soul, A Family for the Heart'}
              </CMSText>
            </div>

            <div className="max-w-2xl mx-auto mb-8">
              <CMSText
                pageId="about"
                target={{ type: 'hero', field: 'description' }}
                fallbackText="Bethesda Community Church (BCC) is a Bible-believing, Christ-centered church family located in Kabankalan City, dedicated to sharing God's grace with every generation."
                label="About Hero Description"
                multiline={true}
                className="text-xs sm:text-base text-stone-200 font-light leading-relaxed block"
              >
                {pageData?.hero?.description || "Bethesda Community Church (BCC) is a Bible-believing, Christ-centered church family located in Kabankalan City, dedicated to sharing God's grace with every generation."}
              </CMSText>
            </div>

            {/* Hero CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <CMSButton
                pageId="about"
                target={{ type: 'hero', buttonKey: 'primaryButton' }}
                buttonConfig={pageData?.hero?.primaryButton}
                fallbackLabel="Our Leaders"
                fallbackUrl="#leaders"
                label="Primary About Button"
                showArrow={false}
                className="px-6 py-3 bg-[#7A121D] text-white border border-[#C99738] font-bold rounded-full text-xs uppercase tracking-wider hover:bg-[#5C0612] shadow-lg transition-all min-h-[44px] flex items-center justify-center"
              />

              <CMSButton
                pageId="about"
                target={{ type: 'hero', buttonKey: 'secondaryButton' }}
                buttonConfig={pageData?.hero?.secondaryButton}
                fallbackLabel="Plan Your Visit"
                fallbackUrl="/new-here"
                label="Secondary About Button"
                showArrow={false}
                className="px-6 py-3 bg-white/10 text-white font-bold rounded-full text-xs uppercase tracking-wider hover:bg-white/20 transition-all border border-[#E8D5B5]/40 backdrop-blur-sm min-h-[44px] flex items-center justify-center"
              />
            </div>
          </div>
        </section>
      )}

      {/* Mission & Story Split Section */}
      {storySection && storySection.visible !== false && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#7A121D]">
                <Quote className="h-4 w-4 text-[#C99738]" />
                <span>Our Heritage & Heart</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-slate-900 leading-tight">
                <CMSText
                  pageId="about"
                  target={{ type: 'section', sectionId: storySection.id, field: 'title' }}
                  fallbackText="A community where everyone is seen, known, and loved."
                  label="Mission Section Title"
                  multiline={true}
                >
                  {storySection.title || 'A community where everyone is seen, known, and loved.'}
                </CMSText>
              </h2>
              
              <div className="text-sm sm:text-base text-slate-600 leading-relaxed font-light">
                <CMSText
                  pageId="about"
                  target={{ type: 'section', sectionId: storySection.id, field: 'content' }}
                  fallbackText="At BCC, we exist to bring people into a life-transforming relationship with Jesus Christ and nurture genuine biblical community across Kabankalan City."
                  label="Mission Section Description"
                  multiline={true}
                >
                  {storySection.content || 'At BCC, we exist to bring people into a life-transforming relationship with Jesus Christ and nurture genuine biblical community across Kabankalan City.'}
                </CMSText>
              </div>
              
              {/* Mission, Vision & Goal Foundational Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {(storySection.cards && storySection.cards.length > 0 
                  ? storySection.cards 
                  : [
                      {
                        id: 'about-mission',
                        title: 'Our Mission',
                        description: 'Equipping disciples making disciples.',
                        iconName: 'Target'
                      },
                      {
                        id: 'about-goal',
                        title: 'Our Goal',
                        description: 'Raise up men and women who will love above all else the God who loves them above all else.',
                        iconName: 'Award'
                      },
                      {
                        id: 'about-vision',
                        title: 'Our Vision',
                        description: 'A dynamic, Spirit-filled Church, passionate about the lost; proactive and proficient in ministry skills numbering thousands upon thousands in kingdom building, impacting our city, nation and the world through leadership development, intentional discipleship, proclaiming and practicing the full importance and authenticity of the Word who are called to live in Christ, equipped to live like Christ, and sent to live for Christ.',
                        iconName: 'Compass'
                      }
                    ]
                ).map((card) => {
                  const IconComp = getIcon(card.iconName);
                  const isVision = card.id === 'about-vision' || card.title.toLowerCase().includes('vision');
                  return (
                    <div 
                      key={card.id} 
                      className={cn(
                        "p-5 bg-white rounded-2xl border border-[#E8D5B5] shadow-xs space-y-2 hover:border-[#C99738] transition-all",
                        isVision ? "sm:col-span-2 bg-gradient-to-br from-white to-[#FAF6EE]" : ""
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-[#FAF6EE] text-[#7A121D] rounded-xl border border-[#E8D5B5]">
                          <IconComp className="h-4 w-4 text-[#C99738]" />
                        </div>
                        <h3 className="text-base font-display font-bold text-slate-900">
                          {card.title}
                        </h3>
                      </div>
                      <p className="text-slate-600 font-light text-xs sm:text-sm leading-relaxed">
                        {card.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="lg:col-span-5 relative">
              <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-xl border-2 border-[#E8D5B5] bg-stone-100">
                <CMSImage 
                  src={storySection.imageUrl || "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=1200"} 
                  alt="Community at BCC" 
                  className="w-full h-full object-cover"
                  pageId="about"
                  target={{ type: 'section', sectionId: storySection.id }}
                  title="Edit Mission Section Photo"
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Core Values Section - Clean Numbered Cards Matching Reference */}
      <section className="bg-[#FAF6EE] py-16 sm:py-24 border-y border-[#E8D5B5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#7A121D] mb-2">
              <span className="text-[#C99738]">✦</span>
              <span>Our Foundations</span>
              <span className="text-[#C99738]">✦</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-slate-900 mb-3">
              What We Stand For
            </h2>

            <p className="text-slate-600 font-light text-sm sm:text-base leading-relaxed">
              These core biblical values guide everything we do as a church family, from Sunday morning worship to midweek discipleship groups.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {defaultValues.map((value, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="bg-white p-6 sm:p-7 rounded-3xl border border-[#E8D5B5] shadow-xs hover:border-[#C99738] hover:shadow-lg transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="text-2xl font-display font-extrabold text-[#7A121D]/30 group-hover:text-[#7A121D] transition-colors mb-4">
                    {value.num}
                  </div>
                  <h3 className="text-lg font-display font-bold text-slate-900 group-hover:text-[#7A121D] transition-colors mb-2">
                    {value.title}
                  </h3>
                  <p className="text-slate-600 font-light text-xs sm:text-sm leading-relaxed">
                    {value.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership Team */}
      {!loading && leaders.length > 0 && (
        <section id="leaders" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#7A121D] mb-2">
              <span className="text-[#C99738]">✦</span> Pastoral Oversight <span className="text-[#C99738]">✦</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-slate-900 mb-3">Our Leadership</h2>
            <p className="text-slate-600 font-light text-sm sm:text-base leading-relaxed">
              BCC is led by pastors, elders, and leaders who shepherd our church family with biblical fidelity, love, and servant hearts.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10">
            {leaders.map((leader) => (
              <div key={leader.uid} className="text-center group bg-white p-6 rounded-3xl border border-[#E8D5B5] shadow-xs">
                <div className="aspect-square rounded-full overflow-hidden mb-4 max-w-[140px] sm:max-w-[180px] mx-auto shadow-md border-3 border-[#E8D5B5] group-hover:border-[#C99738] transition-all">
                  <img 
                    src={leader.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(leader.displayName)}&background=7A121D&color=fff&size=400`} 
                    alt={leader.displayName} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    referrerPolicy="no-referrer"
                  />
                </div>
                <h3 className="text-lg sm:text-xl font-display font-bold text-slate-900 mb-1 group-hover:text-[#7A121D] transition-colors">{leader.displayName}</h3>
                <p className="text-[#9A6F1D] font-bold text-[10px] sm:text-xs uppercase tracking-widest">{leader.title || 'Ministry Leader'}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Plan a Visit CTA Card */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="bg-gradient-to-r from-[#5C0612] via-[#7A121D] to-[#3D040A] rounded-3xl p-8 sm:p-12 lg:p-16 text-center text-white relative overflow-hidden shadow-xl border-2 border-[#C99738]/50">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#F0CA7D] block">
              We'd Love to Welcome You
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold">
              Join Us This Sunday in Kabankalan
            </h2>
            <p className="text-stone-300 text-sm sm:text-base font-light leading-relaxed">
              Our Sunday worship service starts at <strong>8:45 AM</strong> (with 5-minute quiet countdown at <strong>8:40 AM</strong>). Come early for fellowship, enjoy great music, and hear God's Word.
            </p>
            <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/new-here"
                className="px-8 py-3.5 bg-gradient-to-r from-[#E5B869] to-[#C99738] text-[#3D040A] rounded-full font-bold uppercase tracking-wider text-xs hover:brightness-110 transition-all shadow-md flex items-center justify-center min-h-[44px]"
              >
                Plan Your Visit Guide &rarr;
              </Link>
              <Link
                to="/contact"
                className="px-8 py-3.5 bg-white/10 border border-white/30 text-white rounded-full font-bold uppercase tracking-wider text-xs hover:bg-white/20 transition-all min-h-[44px] flex items-center justify-center"
              >
                Get in Touch
              </Link>
            </div>
          </div>
        </div>
      </section>

      {(loading || cmsLoading) && (
        <div className="flex justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-[#7A121D]" />
        </div>
      )}
    </div>
  );
}
