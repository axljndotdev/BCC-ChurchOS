import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from 'lucide-react';
import Logo from './Logo';
import { getSystemSettings } from '../services/db';
import { SystemSettings } from '../types';

export default function Footer() {
  const [settings, setSettings] = useState<SystemSettings | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      const data = await getSystemSettings();
      if (data) setSettings(data);
    };
    fetchSettings();
  }, []);

  const churchName = settings?.churchName || "Bethesda Community Church (BCC)";
  const tagline = settings?.tagline || "Bethesda Community Church is a family of believers dedicated to sharing the love of Christ and serving our neighbors with grace and truth in Kabankalan City.";
  const phone = (settings?.phone && settings.phone.trim()) || "09399179611";
  const email = (settings?.email && settings.email.trim()) || "blgministries214@gmail.com";

  return (
    <footer className="bg-[#1A0B0E] text-stone-300 border-t-2 border-[#C99738]/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 pb-28 sm:pb-28 lg:pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12">
          {/* Church Identity */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center space-x-3 text-white group">
              <Logo size="md" />
              <div>
                <span className="text-2xl font-display font-bold text-white tracking-tight block">BCC</span>
                <span className="text-[10px] text-[#E5B869] tracking-widest uppercase font-semibold">Kabankalan City</span>
              </div>
            </Link>
            <p className="text-sm leading-relaxed text-stone-300 font-light">
              {tagline}
            </p>
            <div className="flex space-x-3">
              {settings?.facebookUrl && (
                <a href={settings.facebookUrl} target="_blank" rel="noopener noreferrer" className="h-9 w-9 rounded-full bg-white/5 border border-[#C99738]/30 flex items-center justify-center text-stone-300 hover:text-[#E5B869] hover:border-[#E5B869] hover:bg-white/10 transition-all">
                  <Facebook className="h-4 w-4" />
                </a>
              )}
              {settings?.instagramUrl && (
                <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" className="h-9 w-9 rounded-full bg-white/5 border border-[#C99738]/30 flex items-center justify-center text-stone-300 hover:text-[#E5B869] hover:border-[#E5B869] hover:bg-white/10 transition-all">
                  <Instagram className="h-4 w-4" />
                </a>
              )}
              {settings?.twitterUrl && (
                <a href={settings.twitterUrl} target="_blank" rel="noopener noreferrer" className="h-9 w-9 rounded-full bg-white/5 border border-[#C99738]/30 flex items-center justify-center text-stone-300 hover:text-[#E5B869] hover:border-[#E5B869] hover:bg-white/10 transition-all">
                  <Twitter className="h-4 w-4" />
                </a>
              )}
              {settings?.youtubeUrl && (
                <a href={settings.youtubeUrl} target="_blank" rel="noopener noreferrer" className="h-9 w-9 rounded-full bg-white/5 border border-[#C99738]/30 flex items-center justify-center text-stone-300 hover:text-[#E5B869] hover:border-[#E5B869] hover:bg-white/10 transition-all">
                  <Youtube className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-[#E5B869] font-display font-semibold mb-4 text-base tracking-wider flex items-center gap-2">
              <span className="text-xs">✦</span> Quick Links
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/new-here" className="text-[#F0CA7D] hover:underline font-bold transition-colors flex items-center gap-1.5"><span>New Here? Plan a Visit</span> <span className="text-[10px] text-[#C99738]">✦</span></Link></li>
              <li><Link to="/about" className="hover:text-[#E5B869] transition-colors">About Us</Link></li>
              <li><Link to="/project-ac" className="text-[#F0CA7D] hover:underline font-semibold transition-colors flex items-center gap-1.5"><span>Project AC Campaign</span> <span className="text-[10px] text-[#C99738]">★</span></Link></li>
              <li><Link to="/sermons" className="hover:text-[#E5B869] transition-colors">Sermons & Messages</Link></li>
              <li><Link to="/events" className="hover:text-[#E5B869] transition-colors">Upcoming Events</Link></li>
              <li><Link to="/ministries" className="hover:text-[#E5B869] transition-colors">Ministries & Groups</Link></li>
              <li><Link to="/gallery" className="hover:text-[#E5B869] transition-colors">Photo Gallery</Link></li>
              <li><Link to="/comments" className="hover:text-[#E5B869] transition-colors">Church Comments</Link></li>
              <li><Link to="/give" className="hover:text-[#E5B869] transition-colors">Give & Tithes</Link></li>
            </ul>
          </div>

          {/* Service Times */}
          <div>
            <h3 className="text-[#E5B869] font-display font-semibold mb-4 text-base tracking-wider flex items-center gap-2">
              <span className="text-xs">✦</span> Service Times
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="border-b border-white/5 pb-2">
                <span className="font-semibold text-white block">Sunday Worship Service</span>
                <span className="text-[#E5B869] text-xs font-semibold block">8:45 AM – 10:45 AM</span>
                <span className="text-stone-400 text-[11px] block mt-0.5">Quiet countdown starts at 8:40 AM</span>
              </li>
              <li className="border-b border-white/5 pb-2">
                <span className="font-semibold text-white block">Superbook Kids Worship</span>
                <span className="text-stone-300 text-xs">Sundays @ 8:45 AM (2nd Level)</span>
              </li>
              <li className="border-b border-white/5 pb-2">
                <span className="font-semibold text-white block">Toddler & Nursing Mothers</span>
                <span className="text-stone-300 text-xs">Dedicated Main Hall Back Lounge</span>
              </li>
              <li className="border-b border-white/5 pb-2">
                <span className="font-semibold text-white block">Mid-week Prayer Meeting</span>
                <span className="text-[#E5B869] text-xs font-semibold block">Wednesdays @ 6:00 PM</span>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-[#E5B869] font-display font-semibold mb-4 text-base tracking-wider flex items-center gap-2">
              <span className="text-xs">✦</span> Contact Us
            </h3>
            <ul className="space-y-3.5 text-sm">
              <li className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-[#C99738] shrink-0 mt-0.5" />
                <a 
                  href={settings?.googleMapsUrl || "https://maps.app.goo.gl/JLjCs4ZDo7nofP2o6"} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-[#E5B869] transition-colors"
                >
                  {settings?.address || "Kabankalan City, Negros Occidental"}
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-[#C99738] shrink-0" />
                <a 
                  href={`tel:${phone.replace(/\s+/g, '')}`} 
                  className="text-stone-300 hover:text-[#E5B869] transition-colors"
                >
                  {phone}
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-[#C99738] shrink-0" />
                <a 
                  href={`mailto:${email}`} 
                  className="text-stone-300 hover:text-[#E5B869] transition-colors"
                >
                  {email}
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-400 gap-4">
          <p>&copy; {new Date().getFullYear()} {churchName}. All rights reserved.</p>
          <div className="flex items-center gap-2 text-[#C99738] text-[11px]">
            <span>✦ Grace</span>
            <span>·</span>
            <span>Truth</span>
            <span>·</span>
            <span>Fellowship ✦</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
