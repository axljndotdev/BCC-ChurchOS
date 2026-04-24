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
      <div className={cn("bg-slate-900 rounded-[2.5rem] p-12 text-center border border-white/5 shadow-2xl", className)}>
        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
          <Video className="h-10 w-10 text-slate-500" />
        </div>
        <h3 className="text-2xl font-display font-bold text-white mb-2">No Active Broadcast</h3>
        <p className="text-slate-400 font-light max-w-md mx-auto">
          We're not live right now. Join us for our next service or watch our previous sermons below.
        </p>
      </div>
    );
  }

  // Encode URL for Facebook plugin
  const encodedUrl = encodeURIComponent(url);
  const embedUrl = `https://www.facebook.com/plugins/video.php?href=${encodedUrl}&show_text=0&width=560`;

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75"></div>
            <div className="relative h-3 w-3 bg-red-500 rounded-full"></div>
          </div>
          <h2 className="text-xl font-display font-bold text-slate-900 uppercase tracking-widest">Live Now</h2>
        </div>
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-700 uppercase tracking-widest transition-colors"
        >
          Watch on Facebook <ExternalLink className="h-4 w-4" />
        </a>
      </div>

      <div className="relative aspect-video bg-black rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-100 group">
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

      <div className="bg-blue-50 p-4 rounded-2xl flex items-start gap-3 border border-blue-100">
        <AlertCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
        <p className="text-sm text-blue-800 font-light">
          If the video doesn't load, you may need to allow third-party cookies or click the link above to watch directly on Facebook.
        </p>
      </div>
    </div>
  );
}
