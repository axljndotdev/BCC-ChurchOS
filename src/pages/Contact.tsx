import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Clock, Send, MessageSquare, Sparkles, CheckCircle2 } from 'lucide-react';
import { getSystemSettings } from '../services/db';
import { SystemSettings } from '../types';
import { useCMS } from '../hooks/useCMS';
import VisualCMSBar from '../components/cms/VisualCMSBar';
import CMSText from '../components/cms/CMSText';

export default function Contact() {
  const { pageData } = useCMS('contact');
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    subject: 'General Inquiry',
    message: ''
  });

  useEffect(() => {
    const fetchSettings = async () => {
      const data = await getSystemSettings();
      if (data) setSettings(data);
    };
    fetchSettings();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.message) return;
    setSubmitted(true);
  };

  const contactCards = [
    {
      title: 'Church Location',
      value: settings?.address || 'Kabankalan City, Negros Occidental',
      description: 'Main sanctuary and office location in Kabankalan City.',
      icon: MapPin,
      link: settings?.googleMapsUrl || 'https://maps.app.goo.gl/JLjCs4ZDo7nofP2o6',
      linkText: 'Get Directions'
    },
    {
      title: 'Email Us',
      value: settings?.email || 'blgministries214@gmail.com',
      description: 'Send us your questions or pastoral prayer needs.',
      icon: Mail,
      link: `mailto:${settings?.email || 'blgministries214@gmail.com'}`,
      linkText: 'Send Email'
    },
    {
      title: 'Call Pastoral Office',
      value: settings?.phone || '09399179611',
      description: 'Available Tuesday to Saturday, 9:00 AM – 5:00 PM.',
      icon: Phone,
      link: `tel:${(settings?.phone || '09399179611').replace(/\s+/g, '')}`,
      linkText: 'Call Now'
    }
  ];

  return (
    <div className="pb-24 sm:pb-32 bg-[#FAF7F2] min-h-screen relative">
      {/* Super Admin Visual CMS Toolbar */}
      <VisualCMSBar pageId="contact" pageName="Contact Us" />

      {/* Hero Header - Matching 📩 Contact V3.png */}
      {pageData?.hero?.visible !== false && (
        <section className="relative pt-16 sm:pt-24 pb-16 sm:pb-20 overflow-hidden bg-gradient-to-b from-[#1A0B0E] via-[#2A0D13] to-[#1A0B0E] border-b border-[#C99738]/30">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-black/40 border border-[#C99738]/50 rounded-full text-[#F0CA7D] text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] mb-4 sm:mb-6 shadow-2xl">
                <span className="text-[#E5B869] font-display">✦</span>
                <CMSText
                  pageId="contact"
                  target={{ type: 'hero', field: 'badge' }}
                  fallbackText="We are here for you"
                  label="Contact Badge"
                >
                  {pageData?.hero?.badge || 'We are here for you'}
                </CMSText>
                <span className="text-[#E5B869] font-display">✦</span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-extrabold text-white mb-4 sm:mb-6 tracking-tight">
                <CMSText
                  pageId="contact"
                  target={{ type: 'hero', field: 'title' }}
                  fallbackText="Get in Touch"
                  label="Contact Hero Title"
                >
                  {pageData?.hero?.title || 'Get in Touch'}
                </CMSText>
              </h1>

              {pageData?.hero?.subtitle && (
                <p className="text-base sm:text-xl text-[#E5B869] font-display italic mb-3">
                  <CMSText
                    pageId="contact"
                    target={{ type: 'hero', field: 'subtitle' }}
                    fallbackText="Reach out with questions, prayer requests, or plan your visit"
                    label="Contact Subtitle"
                  >
                    {pageData?.hero?.subtitle || 'Reach out with questions, prayer requests, or plan your visit'}
                  </CMSText>
                </p>
              )}

              <p className="text-xs sm:text-base text-stone-300 max-w-2xl mx-auto font-light leading-relaxed">
                <CMSText
                  pageId="contact"
                  target={{ type: 'hero', field: 'description' }}
                  fallbackText="Have a question, need prayer, or want to learn more about our fellowship? We would love to hear from you."
                  label="Contact Description"
                  multiline={true}
                >
                  {pageData?.hero?.description || "Have a question, need prayer, or want to learn more about our fellowship? We would love to hear from you."}
                </CMSText>
              </p>
            </motion.div>
          </div>
        </section>
      )}

      {/* Main 2-Column Content Layout (Matching 📩 Contact V3.png) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Contact Cards & Service Times */}
          <div className="lg:col-span-5 space-y-6">
            {contactCards.map((info, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-6 sm:p-7 rounded-3xl border border-[#E8D5B5] shadow-xs hover:shadow-md transition-all flex items-start gap-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#FAF6EE] text-[#7A121D] border border-[#E8D5B5] flex items-center justify-center shrink-0">
                  <info.icon className="h-5 w-5 text-[#C99738]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-display font-bold text-slate-900 mb-0.5">{info.title}</h3>
                  <p className="text-sm font-semibold text-[#7A121D] mb-1">{info.value}</p>
                  <p className="text-xs text-slate-500 font-light mb-2">{info.description}</p>
                  {info.link && (
                    <a 
                      href={info.link} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-xs font-bold uppercase tracking-wider text-[#9A6F1D] hover:text-[#7A121D] underline"
                    >
                      {info.linkText} &rarr;
                    </a>
                  )}
                </div>
              </motion.div>
            ))}

            {/* Service Times Box */}
            <div className="bg-gradient-to-br from-[#5C0612] to-[#3D040A] p-6 sm:p-8 rounded-3xl text-white shadow-xl border border-[#C99738]/40 space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-white/10">
                <Clock className="h-5 w-5 text-[#E5B869]" />
                <h3 className="text-lg font-display font-bold">Sunday Gatherings</h3>
              </div>
              <div className="space-y-3 text-xs sm:text-sm">
                <div>
                  <span className="text-[#F0CA7D] font-bold block uppercase tracking-wider text-[11px]">Worship Service</span>
                  <p className="font-semibold text-white">8:45 AM – 10:45 AM</p>
                  <p className="text-stone-300 text-xs mt-0.5">5-minute quiet countdown at 8:40 AM</p>
                </div>
                <div className="pt-2 border-t border-white/10">
                  <span className="text-[#F0CA7D] font-bold block uppercase tracking-wider text-[11px]">Kids & Toddlers</span>
                  <p className="text-white">Superbook Kids (2nd Level) & Mother's Lounge</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-10 lg:p-12 shadow-sm border border-[#E8D5B5]">
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#7A121D] mb-2">
                <MessageSquare className="w-3.5 h-3.5 text-[#C99738]" />
                <span>Send a Message</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-slate-900">
                How Can We Serve You?
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-light mt-1">
                Fill out the message form below and our pastoral leadership will respond promptly.
              </p>
            </div>

            {submitted ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-12 text-center space-y-4 bg-[#FAF6EE] rounded-2xl border border-[#E8D5B5] p-6"
              >
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h3 className="text-2xl font-display font-bold text-slate-900">Message Received!</h3>
                <p className="text-sm text-slate-600 max-w-md mx-auto">
                  Thank you for reaching out to Bethesda Community Church. One of our pastoral team members will review your message and connect with you soon.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ firstName: '', lastName: '', email: '', phone: '', subject: 'General Inquiry', message: '' });
                  }}
                  className="px-6 py-2.5 bg-[#7A121D] text-white rounded-full text-xs font-bold uppercase tracking-wider hover:bg-[#5C0612] transition-colors"
                >
                  Send Another Message
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">First Name</label>
                  <input 
                    type="text" 
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder="Juan"
                    className="w-full px-4 py-3 bg-[#FDFBF7] border border-[#E8D5B5] rounded-xl focus:ring-2 focus:ring-[#7A121D]/20 focus:border-[#7A121D] outline-none transition-all text-sm text-slate-900 placeholder:text-slate-400"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Last Name</label>
                  <input 
                    type="text" 
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder="Dela Cruz"
                    className="w-full px-4 py-3 bg-[#FDFBF7] border border-[#E8D5B5] rounded-xl focus:ring-2 focus:ring-[#7A121D]/20 focus:border-[#7A121D] outline-none transition-all text-sm text-slate-900 placeholder:text-slate-400"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Email Address</label>
                  <input 
                    type="email" 
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="juan@example.com"
                    className="w-full px-4 py-3 bg-[#FDFBF7] border border-[#E8D5B5] rounded-xl focus:ring-2 focus:ring-[#7A121D]/20 focus:border-[#7A121D] outline-none transition-all text-sm text-slate-900 placeholder:text-slate-400"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Phone (Optional)</label>
                  <input 
                    type="tel" 
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+63 900 000 0000"
                    className="w-full px-4 py-3 bg-[#FDFBF7] border border-[#E8D5B5] rounded-xl focus:ring-2 focus:ring-[#7A121D]/20 focus:border-[#7A121D] outline-none transition-all text-sm text-slate-900 placeholder:text-slate-400"
                  />
                </div>
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Purpose / Subject</label>
                  <select 
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-3 bg-[#FDFBF7] border border-[#E8D5B5] rounded-xl focus:ring-2 focus:ring-[#7A121D]/20 focus:border-[#7A121D] outline-none transition-all text-sm text-slate-900"
                  >
                    <option>General Inquiry</option>
                    <option>Prayer Request</option>
                    <option>Plan a Visit / First Time Question</option>
                    <option>Pastoral Counseling</option>
                    <option>Ministry Information</option>
                    <option>Project AC Campaign</option>
                  </select>
                </div>
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Your Message</label>
                  <textarea 
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="How can our church family pray for or assist you?"
                    className="w-full px-4 py-3 bg-[#FDFBF7] border border-[#E8D5B5] rounded-xl focus:ring-2 focus:ring-[#7A121D]/20 focus:border-[#7A121D] outline-none transition-all resize-none text-sm text-slate-900 placeholder:text-slate-400"
                  />
                </div>
                <div className="sm:col-span-2 pt-2">
                  <button 
                    type="submit"
                    className="w-full py-3.5 bg-[#7A121D] text-white rounded-xl font-bold hover:bg-[#5C0612] transition-all shadow-md flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
                  >
                    <span>Submit Message</span>
                    <Send className="h-3.5 w-3.5 text-[#E5B869]" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Map Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-[400px] sm:h-[450px] bg-stone-100 rounded-3xl overflow-hidden relative shadow-inner border border-[#E8D5B5]">
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
          <div className="absolute bottom-5 right-5">
            <a 
              href={settings?.googleMapsUrl || "https://maps.app.goo.gl/JLjCs4ZDo7nofP2o6"} 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-5 py-2.5 bg-white text-slate-900 rounded-xl font-bold shadow-xl hover:bg-[#FAF6EE] transition-all flex items-center gap-2 border border-[#E8D5B5] text-xs uppercase tracking-wider"
            >
              <MapPin className="h-4 w-4 text-[#7A121D]" />
              Open in Google Maps
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
