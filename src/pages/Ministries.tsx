import React from 'react';
import { motion } from 'motion/react';
import { Users, Heart, BookOpen, Music, Video, Star, ArrowRight, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Ministries() {
  const ministries = [
    {
      id: 'superbook-kids-sbk',
      title: 'Superbook Kids (SBK)',
      description: 'Nurturing the youngest hearts in the love of Jesus through fun, biblically-grounded teaching and activities.',
      icon: Star,
      image: 'https://images.unsplash.com/photo-1489710437720-ebb67ec84dd2?auto=format&fit=crop&q=80&w=800'
    },
    {
      id: 'ignite-one-youth-fellowship',
      title: 'Ignite One Youth Fellowship',
      description: 'A vibrant space for students to find their identity in Christ, build authentic friendships, and grow in faith.',
      icon: Users,
      image: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&q=80&w=800'
    },
    {
      id: 'yah-young-adults-huddle',
      title: 'YAH (Young Adults Huddle)',
      description: 'Connecting young professionals and university students as they navigate life and faith together.',
      icon: Heart,
      image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=800'
    },
    {
      id: 'young-at-hearts',
      title: 'Young at Hearts',
      description: 'A community for our seniors to fellowship, share wisdom, and continue growing in their walk with God.',
      icon: Heart,
      image: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=800'
    },
    {
      id: 'the-exemplary-husband-sherpas',
      title: 'The Exemplary Husband (Sherpas)',
      description: 'Equipping men to lead their families with Christ-like love and integrity.',
      icon: ShieldCheck,
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800'
    },
    {
      id: 'circle-of-women',
      title: 'Circle of Women',
      description: 'Empowering women of all ages to grow in their spiritual journey and support one another.',
      icon: Heart,
      image: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=800'
    },
    {
      id: 'harkel-music-team',
      title: 'Harkel (Music Team)',
      description: 'Leading our community in worship through music, song, and creative expression.',
      icon: Music,
      image: 'https://images.unsplash.com/photo-1514525253344-f814d074358a?auto=format&fit=crop&q=80&w=800'
    },
    {
      id: 'audio-video-av',
      title: 'Audio Video (AV)',
      description: 'Supporting our services and online presence through technical excellence in sound and visuals.',
      icon: Video,
      image: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&q=80&w=800'
    }
  ];

  return (
    <div className="pb-20">
      {/* Hero Section */}
      <section className="relative py-20 bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img 
            src="https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=1920" 
            alt="Ministries Background" 
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
            Life Together in <span className="italic font-light">Ministry</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-slate-300 max-w-2xl mx-auto font-light leading-relaxed"
          >
            We believe faith is best lived out in community. Discover the many ways you can connect, grow, and serve at Bethesda Community Church.
          </motion.p>
        </div>
      </section>

      {/* Ministries Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {ministries.map((ministry, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-500 group"
            >
              <div className="aspect-video relative overflow-hidden">
                <img 
                  src={ministry.image} 
                  alt={ministry.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 left-4 w-10 h-10 rounded-xl bg-white/90 backdrop-blur-sm text-maroon flex items-center justify-center shadow-lg">
                  <ministry.icon className="h-5 w-5" />
                </div>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-display font-bold text-slate-900 mb-3">{ministry.title}</h3>
                <p className="text-slate-500 font-light text-sm leading-relaxed mb-6">
                  {ministry.description}
                </p>
                <Link to={`/ministries/${ministry.id}`} className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-maroon hover:text-slate-900 transition-colors">
                  Know More <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-maroon rounded-[4rem] p-12 md:p-20 text-center text-white relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]"></div>
          </div>
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-8 leading-tight">Ready to Serve?</h2>
            <p className="text-xl text-white/80 mb-10 font-light leading-relaxed">
              God has given each of us unique gifts to build up His church. We'd love to help you find the perfect place to serve.
            </p>
            <Link 
              to="/contact" 
              className="inline-flex items-center px-10 py-4 bg-white text-maroon rounded-full font-bold hover:bg-slate-100 transition-all shadow-xl"
            >
              Contact Ministry Leaders <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
