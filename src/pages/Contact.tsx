import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Clock, Send, MessageSquare } from 'lucide-react';
import { getSystemSettings } from '../services/db';
import { SystemSettings } from '../types';

export default function Contact() {
  const [settings, setSettings] = useState<SystemSettings | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      const data = await getSystemSettings();
      if (data) setSettings(data);
    };
    fetchSettings();
  }, []);

  const contactInfo = [
    {
      title: 'Email Us',
      value: settings?.email || 'info@bethesdachurch.org',
      description: 'Our team will respond within 24 hours.',
      icon: Mail
    },
    {
      title: 'Call Us',
      value: settings?.phone || '+63 900 000 0000',
      description: 'Available Mon-Fri, 9am - 5pm.',
      icon: Phone
    },
    {
      title: 'Visit Us',
      value: settings?.address || 'Kabankalan City, Negros Occidental',
      description: 'Join us for our Sunday services.',
      icon: MapPin,
      link: settings?.googleMapsUrl || 'https://maps.app.goo.gl/JLjCs4ZDo7nofP2o6'
    }
  ];

  return (
    <div className="pb-20">
      {/* Hero Section */}
      <section className="relative py-20 bg-maroon overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-display font-bold text-white mb-6 tracking-tight"
          >
            Get in <span className="italic font-light">Touch</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-white/80 max-w-2xl mx-auto font-light leading-relaxed"
          >
            Have a question, need prayer, or want to learn more about our community? We'd love to hear from you.
          </motion.p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Info Cards */}
          <div className="lg:col-span-1 space-y-6">
            {contactInfo.map((info, i) => {
              const Content = (
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300 h-full">
                  <div className="w-12 h-12 rounded-2xl bg-maroon/5 text-maroon flex items-center justify-center mb-6">
                    <info.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">{info.title}</h3>
                  <p className="text-maroon font-bold text-sm mb-2">{info.value}</p>
                  <p className="text-slate-500 text-xs font-light">{info.description}</p>
                </div>
              );

              return (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  {info.link ? (
                    <a href={info.link} target="_blank" rel="noopener noreferrer" className="block h-full">
                      {Content}
                    </a>
                  ) : Content}
                </motion.div>
              );
            })}

            {/* Service Times Card */}
            <div className="bg-slate-900 p-8 rounded-3xl text-white shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <Clock className="h-6 w-6 text-maroon-light" />
                <h3 className="text-lg font-bold">Service Times</h3>
              </div>
              <div className="space-y-4">
                {settings?.serviceTimes ? settings.serviceTimes.map((st, i) => (
                  <div key={i}>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{st.day}</p>
                    <p className="text-sm">{st.time}</p>
                  </div>
                )) : (
                  <>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Sunday Morning</p>
                      <p className="text-sm">9:00 AM & 11:00 AM</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Wednesday Night</p>
                      <p className="text-sm">7:00 PM (Mid-week Prayer Meeting)</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2 bg-white rounded-[3rem] p-8 md:p-12 shadow-xl border border-slate-100">
            <div className="flex items-center gap-4 mb-10">
              <div className="p-3 rounded-2xl bg-maroon/5 text-maroon">
                <MessageSquare className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-3xl font-display font-bold text-slate-900">Send a Message</h2>
                <p className="text-slate-500 font-light">Fill out the form below and we'll get back to you shortly.</p>
              </div>
            </div>

            <form className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">First Name</label>
                <input 
                  type="text" 
                  placeholder="John"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-maroon focus:border-transparent outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Last Name</label>
                <input 
                  type="text" 
                  placeholder="Doe"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-maroon focus:border-transparent outline-none transition-all"
                />
              </div>
              <div className="sm:col-span-2 space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                <input 
                  type="email" 
                  placeholder="john@example.com"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-maroon focus:border-transparent outline-none transition-all"
                />
              </div>
              <div className="sm:col-span-2 space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Subject</label>
                <select className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-maroon focus:border-transparent outline-none transition-all appearance-none">
                  <option>General Inquiry</option>
                  <option>Prayer Request</option>
                  <option>Membership Question</option>
                  <option>Ministry Information</option>
                </select>
              </div>
              <div className="sm:col-span-2 space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Your Message</label>
                <textarea 
                  rows={5}
                  placeholder="How can we help you?"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-maroon focus:border-transparent outline-none transition-all resize-none"
                />
              </div>
              <div className="sm:col-span-2 pt-4">
                <button 
                  type="button"
                  className="w-full py-5 bg-maroon text-white rounded-2xl font-bold hover:bg-maroon-dark transition-all shadow-lg shadow-maroon/10 flex items-center justify-center gap-3"
                >
                  Send Message <Send className="h-5 w-5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-[450px] bg-slate-200 rounded-[3rem] overflow-hidden relative shadow-inner border border-slate-100">
          <iframe 
            src={`https://www.google.com/maps?q=${encodeURIComponent(settings?.address || "Bethesda Community Church BCC Kabankalan City")}&output=embed`}
            width="100%" 
            height="100%" 
            style={{ border: 0 }} 
            allowFullScreen 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
            title="Church Location"
          ></iframe>
          <div className="absolute bottom-6 right-6">
            <a 
              href={settings?.googleMapsUrl || "https://maps.app.goo.gl/JLjCs4ZDo7nofP2o6"} 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-6 py-3 bg-white text-slate-900 rounded-2xl font-bold shadow-2xl hover:bg-slate-50 transition-all flex items-center gap-2 border border-slate-100"
            >
              <MapPin className="h-5 w-5 text-maroon" />
              Open in Google Maps
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
