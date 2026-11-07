import React from 'react';
import { Video, ExternalLink, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';

interface LiveStreamProps {
  url: string;
  isLive: boolean;
  className?: string;
}

export default function LiveStream({ url, isLive, className }: LiveStreamProps) {
  if (!isLive || !url) {
    return (
      <div className={cn("bg-[#1A0B0E] rounded-2xl sm:rounded-3xl p-6 sm:p-12 text-center border border-[#C99738]/30 shadow-2xl text-white", className)}>
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 border border-[#C99738]/30">
          <Video className="h-8 w-8 sm:h-10 sm:w-10 text-[#E5B869]" />
        </div>
        <h3 className="text-xl sm:text-2xl font-display font-bold text-white mb-2">No Active Broadcast</h3>
        <p className="text-stone-300 font-light max-w-md mx-auto text-xs sm:text-sm">
          We're not live right now. Join us for our next service or watch our previous sermons below.
        </p>
      </div>
    );
  }

  // Encode URL for Facebook plugin
  const encodedUrl = encodeURIComponent(url);
  const embedUrl = `https://www.facebook.com/plugins/video.php?href=${encodedUrl}&show_text=0&width=560`;

  return (
    <div className={cn("space-y-4 sm:space-y-6", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75"></div>
            <div className="relative h-2.5 w-2.5 sm:h-3 sm:w-3 bg-red-500 rounded-full"></div>
          </div>
          <h2 className="text-base sm:text-xl font-display font-bold text-stone-900 uppercase tracking-widest">Live Now</h2>
        </div>
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-bold text-[#7A121D] hover:text-[#5C0612] uppercase tracking-widest transition-colors min-h-[36px]"
        >
          <span>Watch on FB</span> <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      <div className="relative aspect-video bg-black rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl border border-stone-800 group">
        <iframe 
          src={embedUrl}
          className="absolute inset-0 w-full h-full"
          style={{ border: 'none', overflow: 'hidden' }}
          scrolling="no"
          frameBorder="0"
          allowFullScreen={true}
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
        ></iframe>
      </div>

      <div className="bg-[#FAF6EE] p-3.5 sm:p-4 rounded-xl sm:rounded-2xl flex items-start gap-2.5 sm:gap-3 border border-[#E8D5B5]">
        <AlertCircle className="h-5 w-5 text-[#C99738] shrink-0 mt-0.5" />
        <p className="text-xs sm:text-sm text-stone-700 font-light leading-relaxed">
          If the video doesn't load on your mobile browser, you may need to allow third-party cookies or tap "Watch on FB" to open directly in the Facebook app.
        </p>
      </div>
    </div>
  );
}
