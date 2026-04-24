import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Users, 
  Heart, 
  BookOpen, 
  CheckCircle2, 
  ArrowRight,
  Loader2,
  MessageSquare,
  Mail,
  Phone,
  User as UserIcon
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { cn } from '../lib/utils';

export default function Membership() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, 'membership_inquiries'), {
        ...formData,
        status: 'new',
        createdAt: serverTimestamp()
      });
      setSuccess(true);
      setFormData({ fullName: '', email: '', phone: '', message: '' });
    } catch (error) {
      console.error('Error submitting membership inquiry:', error);
      alert('Failed to submit. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    {
      title: 'Attend a Service',
      description: 'Join us for our Sunday worship or midweek gatherings to experience our community.',
      icon: Users
    },
    {
      title: 'Membership Class',
      description: 'Attend our BCC Discovery Class to learn about our vision, values, and beliefs.',
      icon: BookOpen
    },
    {
      title: 'Governing Body Review',
      description: 'Our Elders and Admin review all membership applications with prayerful consideration.',
      icon: Heart
    },
    {
      title: 'Official Welcome',
      description: 'Be officially welcomed into the Bethesda Community Church family.',
      icon: CheckCircle2
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative py-12 md:py-20 bg-maroon overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center md:text-left">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Join the Bethesda Family
            </h1>
            <p className="text-lg md:text-xl text-white/80 leading-relaxed mb-8 max-w-2xl mx-auto md:mx-0">
              Membership at BCC is more than just a name on a list. It's a commitment to a spiritual family where we grow, serve, and worship together.
            </p>

          </div>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          {/* Left: Process */}
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-8">The Path to Membership</h2>
            <div className="space-y-8">
              {steps.map((step, i) => (
                <div key={i} className="flex gap-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center">
                    <step.icon className="h-6 w-6 text-maroon" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">{step.title}</h3>
                    <p className="text-slate-600 leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Call to Action */}
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-slate-100">
            <div className="text-center mb-8">
              <div className="inline-flex p-3 rounded-2xl bg-maroon/5 text-maroon mb-4">
                <MessageSquare className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">Express Your Interest</h3>
              <p className="text-slate-600 mt-2">
                Ready to take the next step? Fill out this simple form and our governing body will contact you about the next Membership Class.
              </p>
            </div>

            {success ? (
              <div className="p-8 bg-green-50 border border-green-100 rounded-3xl text-center animate-in fade-in zoom-in duration-500">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h4 className="text-xl font-bold text-green-900 mb-2">Interest Recorded!</h4>
                <p className="text-green-700 leading-relaxed">
                  Thank you for reaching out. Our Church Admin or Elders will contact you soon regarding the next scheduled Membership Class.
                </p>
                <button 
                  onClick={() => setSuccess(false)}
                  className="mt-8 text-sm font-bold text-green-600 hover:underline"
                >
                  Submit another inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Full Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      required
                      type="text"
                      placeholder="John Doe"
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-maroon/20 focus:border-maroon outline-none transition-all"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      required
                      type="email"
                      placeholder="john@example.com"
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-maroon/20 focus:border-maroon outline-none transition-all"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Phone Number (Optional)</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="tel"
                      placeholder="+63 900 000 0000"
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-maroon/20 focus:border-maroon outline-none transition-all"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Message (Optional)</label>
                  <textarea
                    placeholder="Tell us a bit about yourself or ask a question..."
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-maroon/20 focus:border-maroon outline-none transition-all resize-none"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-maroon text-white rounded-xl font-bold hover:bg-maroon-dark transition-all shadow-lg shadow-maroon/10 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>Submit Interest <ArrowRight className="h-5 w-5" /></>
                  )}
                </button>
                <p className="text-[10px] text-center text-slate-400 uppercase tracking-widest">
                  No registration required to submit
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
