import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Heart, Users, Shield, Target, Quote, Loader2, Compass, Award, Sparkles } from 'lucide-react';
import { getLeaders, getSystemSettings } from '../services/db';
import { UserProfile, SystemSettings } from '../types';
import { useCMS } from '../hooks/useCMS';
import VisualCMSBar from '../components/cms/VisualCMSBar';

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

  return (
    <div className="pb-20 relative">
      {/* Super Admin Visual CMS Toolbar */}
      <VisualCMSBar pageId="about" pageName="About BCC" />

      {/* Hero Section */}
      {pageData?.hero?.visible !== false && (
        <section className="relative py-20 bg-slate-900 overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <img 
              src={storyImg} 
              alt="Church Background" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-slate-900/60" />
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
            {pageData?.hero?.badge && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 bg-maroon/20 border border-maroon/40 rounded-full text-[10px] font-bold text-white uppercase tracking-[0.2em] mb-6"
              >
                <Sparkles className="h-3.5 w-3.5 text-maroon" /> {pageData.hero.badge}
              </motion.div>
            )}
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-display font-bold text-white mb-6 tracking-tight"
            >
              {pageData?.hero?.title || 'Our Story & Vision'}
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-slate-300 max-w-2xl mx-auto font-light leading-relaxed"
            >
              {pageData?.hero?.description || 'Bethesda Community Church (BCC) was founded in 2017 with a simple mission: to be a sanctuary for the soul and a home for the Bethesda Family in Kabankalan City.'}
            </motion.p>

            {/* Hero CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
              {pageData?.hero?.primaryButton?.visible && (
                <a
                  href={pageData.hero.primaryButton.url || '#leaders'}
                  target={pageData.hero.primaryButton.openInNewTab ? '_blank' : undefined}
                  rel="noreferrer"
                  className="px-6 py-3 bg-maroon text-white font-bold rounded-full text-xs uppercase tracking-widest hover:bg-maroon/90 shadow-lg shadow-maroon/20 transition-all"
                >
                  {pageData.hero.primaryButton.label}
                </a>
              )}
              {pageData?.hero?.secondaryButton?.visible && (
                <Link
                  to={pageData.hero.secondaryButton.url || '/ministries'}
                  className="px-6 py-3 bg-slate-800 text-white font-bold rounded-full text-xs uppercase tracking-widest hover:bg-slate-700 transition-all border border-slate-700"
                >
                  {pageData.hero.secondaryButton.label}
                </Link>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Mission & Vision Section */}
      {storySection && storySection.visible !== false && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex p-3 rounded-2xl bg-maroon/5 text-maroon">
                <Quote className="h-8 w-8" />
              </div>
              <h2 className="text-4xl font-display text-slate-900 leading-tight">
                {storySection.title || 'A community where everyone is seen, known, and loved.'}
              </h2>
              {storySection.content && (
                <p className="text-lg text-slate-600 leading-relaxed font-light">
                  {storySection.content}
                </p>
              )}
              
              {/* Mission/Vision/Goal Cards */}
              <div className="space-y-4">
                {(storySection.cards || []).map((card) => {
                  const IconComp = getIcon(card.iconName);
                  return (
                    <div key={card.id} className="p-6 bg-white rounded-3xl shadow-sm border border-slate-100 space-y-2">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-maroon/10 text-maroon rounded-xl">
                          <IconComp className="h-4 w-4" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">{card.title}</h3>
                      </div>
                      <p className="text-slate-600 font-light leading-relaxed">{card.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="relative">
              <div className="aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl">
                <img 
                  src={storySection.imageUrl || "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=1200"} 
                  alt="Community" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-maroon rounded-[3rem] -z-10 opacity-10" />
            </div>
          </div>
        </section>
      )}

      {/* Core Values Section */}
      {valuesSection && valuesSection.visible !== false && (
        <section className="bg-slate-50 py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-20">
              {valuesSection.badge && (
                <span className="text-xs font-bold text-maroon uppercase tracking-widest block mb-2">
                  {valuesSection.badge}
                </span>
              )}
              <h2 className="text-4xl font-display text-slate-900 mb-6">
                {valuesSection.title || 'What We Stand For'}
              </h2>
              <p className="text-slate-500 font-light leading-relaxed">
                {valuesSection.content || 'These core values guide everything we do as a church family, from our Sunday worship to our midweek community groups.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {(valuesSection.cards || []).map((value, i) => {
                const IconComp = getIcon(value.iconName);
                return (
                  <motion.div 
                    key={value.id || i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-500 group"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-maroon/5 text-maroon flex items-center justify-center mb-6 group-hover:bg-maroon group-hover:text-white transition-all duration-500">
                      <IconComp className="h-7 w-7" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">{value.title}</h3>
                    <p className="text-slate-500 font-light text-sm leading-relaxed">{value.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Leadership */}
      {!loading && leaders.length > 0 && (
        <section id="leaders" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl font-display text-slate-900 mb-6">Our Leadership</h2>
            <p className="text-slate-500 font-light leading-relaxed">
              BCC is led by a dedicated team of elders and administrators who serve our community with prayer and humility.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
            {leaders.map((leader) => (
              <div key={leader.uid} className="text-center group">
                <div className="aspect-square rounded-full overflow-hidden mb-6 max-w-[240px] mx-auto shadow-lg group-hover:shadow-2xl transition-all duration-500 border-4 border-white bg-slate-100">
                  <img 
                    src={leader.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(leader.displayName)}&background=random&size=400`} 
                    alt={leader.displayName} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                    referrerPolicy="no-referrer"
                  />
                </div>
                <h3 className="text-2xl font-display text-slate-900 mb-1">{leader.displayName}</h3>
                <p className="text-maroon font-bold text-xs uppercase tracking-widest">{leader.title}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {(loading || cmsLoading) && (
        <div className="flex justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-maroon" />
        </div>
      )}
    </div>
  );
}
