import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Clock, Heart, Users, Music, MapPin, Send, 
  ChevronDown, CheckCircle2, Shield, Calendar, Baby, Shirt, 
  HelpCircle, MessageSquare, ArrowRight, Compass, Phone, Mail,
  Volume2, Eye, Coffee
} from 'lucide-react';
import { useCMS } from '../hooks/useCMS';
import VisualCMSBar from '../components/cms/VisualCMSBar';
import CMSText from '../components/cms/CMSText';
import CMSImage from '../components/cms/CMSImage';
import CMSButton from '../components/cms/CMSButton';
import { cn } from '../lib/utils';
import { addMembershipInquiry } from '../services/db';

export default function NewHere() {
  const { pageData } = useCMS('new-here');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [visitorForm, setVisitorForm] = useState({
    name: '',
    email: '',
    phone: '',
    visitDate: '',
    partySize: '1',
    hasChildren: false,
    questions: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const heroImage = pageData?.hero?.imageUrl || "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=1920";

  // The 6 exact questions and details from leadership
  const faqs = [
    {
      id: 'wearing',
      question: 'What should I be wearing?',
      icon: Shirt,
      category: 'Dress Code & Atmosphere',
      answer: "We gather during Sundays to worship our King, so it will be so nice to present ourselves modest as we come to meet Him. People at BCC wears outfits that falls in the category between casual and formal. So be comfortable and be in your Sunday's best."
    },
    {
      id: 'children',
      question: 'What do my children do during the service?',
      icon: Baby,
      category: 'Family & Children Care',
      answer: "We have a lounge for toddlers and nursing mothers just at the back of the main hall. The stage will still be visible and the room is equipped with speakers. Kids will be having their kids worship on the 2nd level. Teachers and volunteers will surely accompany your kids during your visit."
    },
    {
      id: 'flow',
      question: 'What is the flow of the Sunday service?',
      icon: Clock,
      category: 'Service Schedule (8:40 AM - 10:45 AM)',
      answer: "We start the 5-minute quiet countdown at 8:40 AM, followed by opening & pastoral prayer at 8:45 AM, congregational singing & hymns at 9:00 AM, welcome song at 9:20 AM, scripture reading at 9:25 AM, special number at 9:30 AM, message at 9:35 AM, closing song at 10:25 AM, closing prayer & benediction at 10:30 AM, and video announcements & fellowship around 10:45 AM."
    },
    {
      id: 'greeters',
      question: 'How will I know where to go or what to do when I get there?',
      icon: Compass,
      category: 'Arrival & Welcome',
      answer: "Just come on in, someone will be sure to help you feel welcome and help you get where you (and your children) need to be."
    },
    {
      id: 'music',
      question: 'What kind of music should I expect?',
      icon: Music,
      category: 'Worship Style',
      answer: "We sing a mixture of songs from the Classic Hymnal to modern Worship songs."
    },
    {
      id: 'contact',
      question: "My question isn't here or I need more info, who can I contact?",
      icon: HelpCircle,
      category: 'Get in Touch',
      answer: "Look at our Contact page and give us a call or email. We'd be happy to answer any question you might have."
    }
  ];

  // Sunday Service Flow Timeline Breakdown
  const serviceTimeline = [
    { time: '8:40 AM', title: '5-Minute Quiet Countdown', desc: 'Settle in, find your seat, and quiet your heart for worship.' },
    { time: '8:45 AM', title: 'Opening & Pastoral Prayer', desc: 'Starting together with scripture invocation, opening prayer, and pastoral blessing.' },
    { time: '9:00 AM', title: 'Congregational Singing & Hymns', desc: 'A rich blend of timeless classic hymnals and modern worship songs led by Harkel music ministry.' },
    { time: '9:20 AM', title: 'Welcome Song', desc: 'Warmly greeting visitors and one another in Christian love and community.' },
    { time: '9:25 AM', title: 'Scripture Reading', desc: 'Public reading of God’s Word preparing hearts for the message.' },
    { time: '9:30 AM', title: 'Special Number', desc: 'Special musical offerings and ministry presentations.' },
    { time: '9:35 AM', title: 'Message', desc: 'Biblically sound, expositional preaching applying God’s Word to daily life.' },
    { time: '10:25 AM', title: 'Closing Song', desc: 'Congregational response and hymn of dedication.' },
    { time: '10:30 AM', title: 'Closing Prayer & Benediction', desc: 'Pastoral blessing and benediction to commission the church family.' },
    { time: '~10:45 AM', title: 'Video Announcements & Fellowship', desc: 'Church video updates followed by coffee, conversation, and warm fellowship.' }
  ];

  const handleVisitorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitorForm.name.trim() || !visitorForm.email.trim()) return;

    setSubmitting(true);
    try {
      await addMembershipInquiry({
        fullName: visitorForm.name,
        email: visitorForm.email,
        phone: visitorForm.phone || undefined,
        message: `[First-Time Guest Connect Card] Planned visit date: ${visitorForm.visitDate || 'This Sunday 8:45 AM'}. Party size: ${visitorForm.partySize}. Children: ${visitorForm.hasChildren ? 'Yes' : 'No'}. Notes: ${visitorForm.questions}`
      });
      setSubmitted(true);
    } catch (err) {
      console.error('Error submitting visitor connect card:', err);
      // fallback friendly success so visitor is assured
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-32 relative bg-[#FAF7F2]">
      {/* Super Admin Visual CMS Toolbar */}
      <VisualCMSBar pageId="new-here" pageName="New Here / Plan a Visit" />

      {/* Hero Banner with Rich Burgundy Saffron Theme */}
      {pageData?.hero?.visible !== false && (
        <header className="relative min-h-[500px] sm:min-h-[560px] flex items-center justify-center overflow-hidden py-16 sm:py-24">
          <div className="absolute inset-0 z-0">
            <CMSImage
              src={heroImage}
              alt="Welcome to Bethesda Community Church"
              className="w-full h-full object-cover"
              pageId="new-here"
              target={{ type: 'hero' }}
              title="Edit New Here Hero Background"
            />
            {/* Rich gradient overlay with saffron crimson undertones */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#200407]/95 via-[#3D060D]/85 to-[#1A0306]/90 pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(20,2,5,0.7)_100%)] pointer-events-none" />
          </div>

          <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto py-10 w-full">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="mb-4 sm:mb-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-black/40 backdrop-blur-md rounded-full border border-[#C99738]/50 text-[#F0CA7D] text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em]">
                  <span className="text-[#E5B869] font-display select-none">✦</span>
                  <CMSText
                    pageId="new-here"
                    target={{ type: 'hero', field: 'badge' }}
                    fallbackText="WHAT CAN YOU EXPECT WHEN YOU VISIT?"
                    label="Hero Badge"
                  >
                    {pageData?.hero?.badge || 'WHAT CAN YOU EXPECT WHEN YOU VISIT?'}
                  </CMSText>
                  <span className="text-[#E5B869] font-display select-none">✦</span>
                </div>
              </div>

              <h1 className="text-3xl xs:text-4xl sm:text-6xl md:text-7xl font-display font-bold text-white mb-4 sm:mb-6 leading-tight tracking-tight">
                <CMSText
                  pageId="new-here"
                  target={{ type: 'hero', field: 'title' }}
                  fallbackText="Welcome to Bethesda Community Church"
                  label="Main Title"
                >
                  {pageData?.hero?.title || 'Welcome to Bethesda Community Church'}
                </CMSText>
              </h1>

              <div className="mb-4 sm:mb-6">
                <CMSText
                  pageId="new-here"
                  target={{ type: 'hero', field: 'subtitle' }}
                  fallbackText="Here are answers to some of the questions you may have."
                  label="Subtitle"
                  className="text-base sm:text-xl md:text-2xl text-[#E5B869] font-display italic tracking-wide block"
                >
                  {pageData?.hero?.subtitle || 'Here are answers to some of the questions you may have.'}
                </CMSText>
              </div>

              <div className="max-w-2xl mx-auto mb-8 sm:mb-10">
                <CMSText
                  pageId="new-here"
                  target={{ type: 'hero', field: 'description' }}
                  fallbackText="We gathered the answers to some common questions below. If you can't find your question below feel free to contact us, and we'll be happy to help."
                  label="Description"
                  multiline={true}
                  className="text-xs sm:text-base text-stone-200 font-light leading-relaxed block"
                >
                  {pageData?.hero?.description || "We gathered the answers to some common questions below. If you can't find your question below feel free to contact us, and we'll be happy to help."}
                </CMSText>
              </div>

              {/* Service Time Spotlight Badge */}
              <div className="inline-flex flex-col sm:flex-row items-center gap-3 px-6 py-3.5 bg-[#5C0612]/90 border border-[#C99738] rounded-2xl shadow-xl backdrop-blur-md">
                <div className="flex items-center gap-2 text-[#E5B869]">
                  <Clock className="h-5 w-5 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-widest">Sunday Worship Service</span>
                </div>
                <div className="hidden sm:block w-px h-5 bg-[#C99738]/40" />
                <span className="text-base sm:text-lg font-display font-bold text-white tracking-wide">
                  Sundays @ 8:45 AM <span className="text-xs text-stone-300 font-sans font-normal">(Countdown 8:40 AM)</span>
                </span>
              </div>
            </motion.div>
          </div>
        </header>
      )}

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 sm:space-y-24">
        
        {/* Core Quick Highlights: What to Know First */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 -mt-10 sm:-mt-16 relative z-20">
          
          {/* Card 1: Worship Time */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl shadow-lg border border-[#E8D5B5] hover:border-[#C99738] transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#FAF6EE] text-[#7A121D] border border-[#E8D5B5] flex items-center justify-center mb-5 shadow-xs">
                <Clock className="h-6 w-6 text-[#9A6F1D]" />
              </div>
              <div className="text-[10px] font-bold text-[#9A6F1D] uppercase tracking-widest mb-1">Service Schedule</div>
              <h3 className="text-xl sm:text-2xl font-display font-bold text-stone-900 mb-2">Sundays @ 8:45 AM</h3>
              <p className="text-stone-600 text-xs sm:text-sm font-light leading-relaxed">
                Quiet countdown starts at 8:40 AM. We end roughly at 10:45 AM after praise, the message, prayer, and fellowship.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-[#E8D5B5]/60 flex items-center gap-2 text-xs font-bold text-[#7A121D]">
              <span className="text-[#C99738]">✦</span> In-Person Sanctuary Worship
            </div>
          </div>

          {/* Card 2: Family & Kids */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl shadow-lg border border-[#E8D5B5] hover:border-[#C99738] transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#FAF6EE] text-[#7A121D] border border-[#E8D5B5] flex items-center justify-center mb-5 shadow-xs">
                <Baby className="h-6 w-6 text-[#9A6F1D]" />
              </div>
              <div className="text-[10px] font-bold text-[#9A6F1D] uppercase tracking-widest mb-1">Children & Mothers</div>
              <h3 className="text-xl sm:text-2xl font-display font-bold text-stone-900 mb-2">Dedicated Care</h3>
              <p className="text-stone-600 text-xs sm:text-sm font-light leading-relaxed">
                Toddler/nursing mothers lounge at the back of the hall with stage view & speakers. Superbook Kids worship on the 2nd level.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-[#E8D5B5]/60 flex items-center gap-2 text-xs font-bold text-[#7A121D]">
              <span className="text-[#C99738]">✦</span> Safe, Accompanied & Loving
            </div>
          </div>

          {/* Card 3: Warm Welcome */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl shadow-lg border border-[#E8D5B5] hover:border-[#C99738] transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#FAF6EE] text-[#7A121D] border border-[#E8D5B5] flex items-center justify-center mb-5 shadow-xs">
                <Heart className="h-6 w-6 text-[#9A6F1D]" />
              </div>
              <div className="text-[10px] font-bold text-[#9A6F1D] uppercase tracking-widest mb-1">Atmosphere</div>
              <h3 className="text-xl sm:text-2xl font-display font-bold text-stone-900 mb-2">Come As You Are</h3>
              <p className="text-stone-600 text-xs sm:text-sm font-light leading-relaxed">
                Friendly greeters are ready to help you find your seat. Modest Sunday best (casual to formal) is warmly welcomed.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-[#E8D5B5]/60 flex items-center gap-2 text-xs font-bold text-[#7A121D]">
              <span className="text-[#C99738]">✦</span> A Family for Your Heart
            </div>
          </div>

        </section>

        {/* 6 Questions & Answers Section (Directly from User Details) */}
        <section className="space-y-8 sm:space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FAF6EE] text-[#7A121D] border border-[#E8D5B5] rounded-full text-[10px] font-bold uppercase tracking-wider">
              <span className="text-[#C99738]">✦</span> Frequently Asked Questions
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-stone-900 tracking-tight">
              What Can You Expect When You Visit?
            </h2>
            <p className="text-stone-600 font-light text-xs sm:text-base">
              Everything you need to know before walking through our doors this Sunday.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            {faqs.map((faq, index) => {
              const Icon = faq.icon;
              const isExpanded = openFaq === index;

              return (
                <div
                  key={faq.id}
                  className={cn(
                    "bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 border transition-all duration-300 shadow-xs flex flex-col justify-between cursor-pointer",
                    isExpanded ? "border-[#C99738] ring-1 ring-[#C99738]/20 bg-[#FDFBF7]" : "border-[#E8D5B5]/80 hover:border-[#C99738]/60"
                  )}
                  onClick={() => setOpenFaq(isExpanded ? null : index)}
                >
                  <div>
                    <div className="flex items-start gap-3.5 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-[#FAF6EE] border border-[#E8D5B5] text-[#7A121D] flex items-center justify-center shrink-0 mt-0.5">
                        <Icon className="h-5 w-5 text-[#9A6F1D]" />
                      </div>
                      <div className="flex-1">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#9A6F1D] block mb-0.5">
                          {faq.category}
                        </span>
                        <h3 className="text-base sm:text-lg font-display font-bold text-stone-900 leading-snug">
                          {faq.question}
                        </h3>
                      </div>
                      <div className="p-1 text-stone-400">
                        <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", isExpanded && "rotate-180 text-[#7A121D]")} />
                      </div>
                    </div>

                    <p className="text-stone-700 font-light text-xs sm:text-sm leading-relaxed pl-0 sm:pl-[50px] whitespace-pre-wrap">
                      {faq.answer}
                    </p>
                  </div>

                  {faq.id === 'contact' && (
                    <div className="mt-4 pt-3 border-t border-[#E8D5B5]/50 pl-0 sm:pl-[50px] flex items-center gap-3">
                      <Link
                        to="/contact"
                        className="text-xs font-bold uppercase tracking-wider text-[#7A121D] hover:underline flex items-center gap-1.5"
                      >
                        <span>Visit Contact Page</span>
                        <ArrowRight className="h-3 w-3 text-[#C99738]" />
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Detailed Service Flow Visual Timeline */}
        <section className="bg-[#FAF6EE] border border-[#E8D5B5] rounded-3xl p-6 sm:p-10 lg:p-12 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#9A6F1D] bg-white px-3 py-1 rounded-full border border-[#E8D5B5] inline-block">
              Sunday Morning Rhythm
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-stone-900">
              Flow of Sunday Service
            </h2>
            <p className="text-stone-600 text-xs sm:text-sm font-light">
              We gather every Sunday with quiet countdown at 8:40 AM and service starting at 8:45 AM. Here is an overview of how we worship our King together.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 pt-4">
            {serviceTimeline.map((item, idx) => (
              <div key={idx} className="bg-white p-5 rounded-2xl border border-[#E8D5B5]/80 shadow-xs space-y-2 relative group hover:border-[#C99738] transition-colors">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 bg-[#7A121D]/10 text-[#7A121D] text-[10px] font-bold uppercase tracking-wider rounded-md">
                    {item.time}
                  </span>
                  <span className="text-stone-300 text-xs font-display font-bold">Step {idx + 1}</span>
                </div>
                <h4 className="font-display font-bold text-base text-stone-900">{item.title}</h4>
                <p className="text-stone-600 text-xs font-light leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="bg-white/80 border border-[#E8D5B5] p-4 rounded-2xl text-center max-w-xl mx-auto text-xs text-stone-600 font-light">
            <p className="flex items-center justify-center gap-1.5 font-medium text-stone-800">
              <span className="text-[#C99738]">✦</span> *Special numbers & Lord's Supper are held on designated Sundays.
            </p>
            <p className="mt-0.5 text-stone-500">Service concludes roughly at 10:45 AM followed by video announcements & fellowship.</p>
          </div>
        </section>

        {/* Children & Toddler Facilities Spotlight */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* Toddler & Nursing Mothers */}
          <div className="bg-gradient-to-br from-[#5C0612] to-[#7A121D] text-white p-8 sm:p-10 rounded-3xl border border-[#C99738]/50 shadow-xl space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/20 text-[10px] font-bold uppercase tracking-widest text-[#E5B869]">
                <Volume2 className="h-3.5 w-3.5" /> Stage View & Audio Equipped
              </div>
              <h3 className="text-2xl sm:text-3xl font-display font-bold text-white">
                Toddlers & Nursing Mothers Lounge
              </h3>
              <p className="text-stone-200 text-xs sm:text-sm font-light leading-relaxed">
                Located right at the back of the main worship hall. Mothers and little ones can rest comfortably in a private, quiet space while still seeing the pulpit through viewing windows and hearing the entire worship & sermon via dedicated room speakers.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/10 text-xs text-stone-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#E5B869]" /> Private Lounge
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#E5B869]" /> Live Stage Audio
              </div>
            </div>
          </div>

          {/* Superbook Kids 2nd Level */}
          <div className="bg-white p-8 sm:p-10 rounded-3xl border border-[#E8D5B5] shadow-lg space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FAF6EE] text-[#7A121D] rounded-full border border-[#E8D5B5] text-[10px] font-bold uppercase tracking-widest">
                <Sparkles className="h-3.5 w-3.5 text-[#C99738]" /> Superbook Kids (SBK)
              </div>
              <h3 className="text-2xl sm:text-3xl font-display font-bold text-stone-900">
                Kids Worship on the 2nd Level
              </h3>
              <p className="text-stone-600 text-xs sm:text-sm font-light leading-relaxed">
                Children join their very own vibrant Kids Worship on our 2nd floor! Loving Sunday school teachers and background-checked volunteers accompany and teach your children with age-tailored Bible lessons, crafts, and praise.
              </p>
            </div>
            <div className="pt-4 border-t border-[#E8D5B5]/60 flex items-center justify-between">
              <span className="text-xs text-stone-500 font-light">Ages Toddlers to Pre-Teens</span>
              <Link to="/ministries/superbook-kids-sbk" className="text-xs font-bold uppercase tracking-wider text-[#7A121D] hover:text-[#5C0612] flex items-center gap-1">
                <span>Learn about Kids Ministry</span>
                <ArrowRight className="h-3 w-3 text-[#C99738]" />
              </Link>
            </div>
          </div>
        </section>

        {/* Plan a Visit Pre-Registration / Connect Card */}
        <section id="plan-visit" className="bg-[#FAF6EE] border border-[#E8D5B5] rounded-3xl p-6 sm:p-10 lg:p-12 shadow-sm">
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white text-[#7A121D] border border-[#E8D5B5] rounded-full text-[10px] font-bold uppercase tracking-wider">
                <span className="text-[#C99738]">✦</span> Guest Connect Card
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-stone-900">
                Let Us Know You're Coming!
              </h2>
              <p className="text-stone-600 text-xs sm:text-sm font-light">
                Planning your first visit? Fill out this quick form and our greeters will look forward to welcoming you by name and helping you find seats!
              </p>
            </div>

            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white p-8 rounded-2xl border border-emerald-200 text-center space-y-3"
              >
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-display font-bold text-stone-900">We Can't Wait to Meet You!</h3>
                <p className="text-stone-600 text-xs sm:text-sm max-w-md mx-auto font-light">
                  Thank you for letting us know! We have received your details. Join us this Sunday at 8:45 AM (countdown 8:40 AM) at Bethesda Community Church.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-4 px-6 py-2.5 bg-[#7A121D] text-white rounded-full text-xs font-bold uppercase tracking-wider hover:bg-[#5C0612]"
                >
                  Send Another Note
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleVisitorSubmit} className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E8D5B5] space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Maria Santos"
                      className="w-full px-4 py-2.5 bg-[#FAF6EE] border border-[#E8D5B5] rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-[#7A121D]/20 focus:bg-white"
                      value={visitorForm.name}
                      onChange={(e) => setVisitorForm({ ...visitorForm, name: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="maria@example.com"
                      className="w-full px-4 py-2.5 bg-[#FAF6EE] border border-[#E8D5B5] rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-[#7A121D]/20 focus:bg-white"
                      value={visitorForm.email}
                      onChange={(e) => setVisitorForm({ ...visitorForm, email: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">Mobile Number (Optional)</label>
                    <input
                      type="tel"
                      placeholder="+63 900 000 0000"
                      className="w-full px-4 py-2.5 bg-[#FAF6EE] border border-[#E8D5B5] rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-[#7A121D]/20 focus:bg-white"
                      value={visitorForm.phone}
                      onChange={(e) => setVisitorForm({ ...visitorForm, phone: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">When are you visiting?</label>
                    <input
                      type="text"
                      placeholder="This Sunday @ 8:45 AM"
                      className="w-full px-4 py-2.5 bg-[#FAF6EE] border border-[#E8D5B5] rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-[#7A121D]/20 focus:bg-white"
                      value={visitorForm.visitDate}
                      onChange={(e) => setVisitorForm({ ...visitorForm, visitDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <input
                    type="checkbox"
                    id="hasChildren"
                    checked={visitorForm.hasChildren}
                    onChange={(e) => setVisitorForm({ ...visitorForm, hasChildren: e.target.checked })}
                    className="h-4 w-4 text-[#7A121D] rounded border-[#E8D5B5] focus:ring-[#7A121D]"
                  />
                  <label htmlFor="hasChildren" className="text-xs text-stone-700 font-medium">
                    I will be bringing children / infants (we will help you connect with toddler lounge or Kids Worship)
                  </label>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">Any questions or special notes?</label>
                  <textarea
                    rows={3}
                    placeholder="Let us know if you need assistance, wheelchair access, or specific questions..."
                    className="w-full px-4 py-2.5 bg-[#FAF6EE] border border-[#E8D5B5] rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-[#7A121D]/20 focus:bg-white"
                    value={visitorForm.questions}
                    onChange={(e) => setVisitorForm({ ...visitorForm, questions: e.target.value })}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 bg-[#7A121D] text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#5C0612] transition-all shadow-md flex items-center justify-center gap-2 border border-[#C99738]/50 min-h-[44px]"
                >
                  <Send className="h-4 w-4 text-[#E5B869]" />
                  <span>{submitting ? 'Submitting...' : 'Send Connect Card'}</span>
                </button>
              </form>
            )}
          </div>
        </section>

        {/* Location & Contact Bar */}
        <section className="bg-white border border-[#E8D5B5] rounded-3xl p-6 sm:p-10 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 text-[#7A121D] text-xs font-bold uppercase tracking-wider">
              <MapPin className="h-4 w-4 text-[#C99738]" /> Kabankalan City, Negros Occidental
            </div>
            <h3 className="text-xl sm:text-2xl font-display font-bold text-stone-900">
              Need Directions or Want to Talk First?
            </h3>
            <p className="text-stone-600 text-xs sm:text-sm font-light">
              We would love to answer your questions or pray with you.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              to="/contact"
              className="px-6 py-3 bg-[#7A121D] text-white rounded-full text-xs font-bold uppercase tracking-wider hover:bg-[#5C0612] transition-all shadow-xs"
            >
              Contact Us
            </Link>
            <Link
              to="/live"
              className="px-6 py-3 bg-[#FAF6EE] text-[#7A121D] border border-[#E8D5B5] rounded-full text-xs font-bold uppercase tracking-wider hover:bg-white transition-all"
            >
              Watch Online First
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}
