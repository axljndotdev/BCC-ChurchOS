import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Heart, Users, Shield, Target, Quote, Loader2 } from 'lucide-react';
import { getLeaders } from '../services/db';
import { UserProfile } from '../types';

export default function About() {
  const [leaders, setLeaders] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaders = async () => {
      try {
        const data = await getLeaders();
        setLeaders(data);
      } catch (error) {
        console.error('Error fetching leaders:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaders();
  }, []);

  const values = [
    {
      title: 'Christ-Centered',
      description: 'Jesus is the center of everything we do, from our worship to our community service.',
      icon: Target
    },
    {
      title: 'Community Focused',
      description: 'We believe in doing life together, supporting one another through every season.',
      icon: Users
    },
    {
      title: 'Biblical Truth',
      description: 'We are committed to the uncompromised teaching and living of God\'s Word.',
      icon: Shield
    },
    {
      title: 'Grace & Love',
      description: 'We strive to reflect the radical love and grace that Christ has shown us.',
      icon: Heart
    }
  ];

  return (
    <div className="pb-20">
      {/* Hero Section */}
      <section className="relative py-20 bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img 
            src="https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&q=80&w=1920" 
            alt="Church Background" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-slate-900/60" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-display font-bold text-white mb-6 tracking-tight"
          >
            Our Story & <span className="italic font-light">Vision</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-slate-300 max-w-2xl mx-auto font-light leading-relaxed"
          >
            Bethesda Community Church (BCC) was founded in 2017 with a simple mission: to be a sanctuary for the soul and a home for the <span className="italic">Bethesda Family</span> in Kabankalan City.
          </motion.p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="inline-flex p-3 rounded-2xl bg-maroon/5 text-maroon">
              <Quote className="h-8 w-8" />
            </div>
            <h2 className="text-4xl font-display text-slate-900 leading-tight">
              A community where everyone is <span className="italic">seen, known, and loved.</span>
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed font-light">
              At BCC, we believe that the church is not a building, but a people. We are a multi-generational community committed to following Jesus and making His love known in our city and beyond.
            </p>
            <div className="space-y-4">
              <div className="p-6 bg-white rounded-3xl shadow-sm border border-slate-100">
                <h3 className="text-xl font-bold text-slate-900 mb-2">Our Mission</h3>
                <p className="text-slate-600 font-light">Equipping disciples making disciples.</p>
              </div>
              <div className="p-6 bg-white rounded-3xl shadow-sm border border-slate-100">
                <h3 className="text-xl font-bold text-slate-900 mb-2">Our Vision</h3>
                <p className="text-slate-600 font-light">A dynamic, Spirit-filled Church, and passionate about the lost; proactive and proficient in ministry skills numbering thousands upon thousands in kingdom building, impacting our city, nation and the world through leadership development, intentional discipleship, proclaiming and practicing the full importance and authenticity of the Word who are called to live in Christ, equipped to live like Christ, and sent to live for Christ.</p>
              </div><div className="p-6 bg-white rounded-3xl shadow-sm border border-slate-100">
                <h3 className="text-xl font-bold text-slate-900 mb-2">Our Goal</h3>
                <p className="text-slate-600 font-light">Raise up men and women who will love above all else the God who loves them above all else.</p>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=1200" 
                alt="Community" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-maroon rounded-[3rem] -z-10 opacity-10" />
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="bg-slate-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl font-display text-slate-900 mb-6">What We Stand For</h2>
            <p className="text-slate-500 font-light leading-relaxed">
              These core values guide everything we do as a church family, from our Sunday worship to our midweek community groups.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-500 group"
              >
                <div className="w-14 h-14 rounded-2xl bg-maroon/5 text-maroon flex items-center justify-center mb-6 group-hover:bg-maroon group-hover:text-white transition-all duration-500">
                  <value.icon className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{value.title}</h3>
                <p className="text-slate-500 font-light text-sm leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership */}
      {!loading && leaders.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl font-display text-slate-900 mb-6">Our Leadership</h2>
            <p className="text-slate-500 font-light leading-relaxed">
              BCC is led by a dedicated team of elders and administrators who serve our community with prayer and humility.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
            {leaders.map((leader, i) => (
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

      {loading && (
        <div className="flex justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-maroon" />
        </div>
      )}
    </div>
  );
}
