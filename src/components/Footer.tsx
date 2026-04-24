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
  const tagline = settings?.tagline || "Bethesda Community Church is a family of believers dedicated to sharing the love of Christ and serving our neighbors with grace and truth.";

  return (
    <footer className="bg-stone-900 text-stone-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-6">
            <Link to="/" className="flex items-center space-x-3 text-white">
              <Logo size="md" />
              <span className="text-2xl font-serif font-semibold tracking-tight">BCC</span>
            </Link>
            <p className="text-sm leading-relaxed font-light">
              {tagline}
            </p>
            <div className="flex space-x-4">
              {settings?.facebookUrl && (
                <a href={settings.facebookUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  <Facebook className="h-5 w-5" />
                </a>
              )}
              {settings?.instagramUrl && (
                <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  <Instagram className="h-5 w-5" />
                </a>
              )}
              {settings?.twitterUrl && (
                <a href={settings.twitterUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  <Twitter className="h-5 w-5" />
                </a>
              )}
              {settings?.youtubeUrl && (
                <a href={settings.youtubeUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  <Youtube className="h-5 w-5" />
                </a>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/sermons" className="hover:text-white transition-colors">Sermons</Link></li>
              <li><Link to="/events" className="hover:text-white transition-colors">Events</Link></li>
              <li><Link to="/ministries" className="hover:text-white transition-colors">Ministries</Link></li>
              <li><Link to="/gallery" className="hover:text-white transition-colors">Gallery</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Service Times</h3>
            <ul className="space-y-2 text-sm">
              {settings?.serviceTimes ? settings.serviceTimes.map((st, i) => (
                <li key={i}><span className="font-medium">{st.day}:</span> {st.time}</li>
              )) : (
                <>
                  <li><span className="font-medium">Sunday Morning:</span> 9:00 AM & 11:00 AM</li>
                  <li><span className="font-medium">Wednesday Night:</span> 7:00 PM</li>
                </>
              )}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-indigo-400 shrink-0" />
                <a 
                  href={settings?.googleMapsUrl || "https://maps.app.goo.gl/JLjCs4ZDo7nofP2o6"} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  {settings?.address || "Kabankalan City, Negros Occidental"}
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-indigo-400 shrink-0" />
                <span>{settings?.phone || "(555) 123-4567"}</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-indigo-400 shrink-0" />
                <span>{settings?.email || "info@churchos.com"}</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-16 pt-8 border-t border-stone-800 text-center text-xs tracking-widest uppercase opacity-50">
          <p>&copy; {new Date().getFullYear()} {churchName}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
