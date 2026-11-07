import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Home, ArrowLeft, Search, Compass, BookOpen, Calendar, Users, HeartHandshake } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 sm:py-24 bg-[#FAF7F2] relative overflow-hidden">
      {/* Decorative ambient elements */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-[#7A121D]/10 via-[#C99738]/10 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="max-w-2xl w-full mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FAF6EE] border border-[#E8D5B5] shadow-xs">
            <span className="text-[#C99738] text-xs">✦</span>
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#7A121D]">404 Not Found</span>
            <span className="text-[#C99738] text-xs">✦</span>
          </div>

          {/* Big Graphic 404 */}
          <h1 className="text-7xl sm:text-9xl font-display font-extrabold tracking-tight text-[#5C0612] leading-none select-none">
            404
          </h1>

          <div className="space-y-3">
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#1A0B0E]">
              We couldn't find that page
            </h2>
            <p className="text-slate-600 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
              The page you are looking for might have been moved, renamed, or is temporarily unavailable. Let us guide you back home.
            </p>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-[#E8D5B5] bg-white text-slate-700 text-sm font-semibold hover:bg-[#FAF6EE] transition-colors shadow-xs"
            >
              <ArrowLeft className="w-4 h-4 text-[#7A121D]" />
              Go Back
            </button>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#7A121D] hover:bg-[#5C0612] text-white text-sm font-semibold transition-all shadow-md hover:shadow-lg"
            >
              <Home className="w-4 h-4 text-[#E5B869]" />
              Return to Homepage
            </Link>
          </div>

          {/* Helpful Navigation Cards */}
          <div className="pt-8 border-t border-[#E8D5B5]/60 mt-8">
            <p className="text-xs font-bold uppercase tracking-wider text-[#9A6F1D] mb-4">
              Explore Popular Church Pages
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Link
                to="/sermons"
                className="p-3 bg-white hover:bg-[#FAF6EE] rounded-xl border border-[#E8D5B5] text-left transition-all group"
              >
                <BookOpen className="w-4 h-4 text-[#7A121D] mb-1.5 group-hover:scale-110 transition-transform" />
                <span className="block text-xs font-bold text-slate-800">Sermons</span>
                <span className="block text-[11px] text-slate-500">Watch & Listen</span>
              </Link>

              <Link
                to="/events"
                className="p-3 bg-white hover:bg-[#FAF6EE] rounded-xl border border-[#E8D5B5] text-left transition-all group"
              >
                <Calendar className="w-4 h-4 text-[#7A121D] mb-1.5 group-hover:scale-110 transition-transform" />
                <span className="block text-xs font-bold text-slate-800">Events</span>
                <span className="block text-[11px] text-slate-500">Gatherings</span>
              </Link>

              <Link
                to="/ministries"
                className="p-3 bg-white hover:bg-[#FAF6EE] rounded-xl border border-[#E8D5B5] text-left transition-all group"
              >
                <Users className="w-4 h-4 text-[#7A121D] mb-1.5 group-hover:scale-110 transition-transform" />
                <span className="block text-xs font-bold text-slate-800">Ministries</span>
                <span className="block text-[11px] text-slate-500">Find Community</span>
              </Link>

              <Link
                to="/prayer"
                className="p-3 bg-white hover:bg-[#FAF6EE] rounded-xl border border-[#E8D5B5] text-left transition-all group"
              >
                <HeartHandshake className="w-4 h-4 text-[#7A121D] mb-1.5 group-hover:scale-110 transition-transform" />
                <span className="block text-xs font-bold text-slate-800">Prayer Wall</span>
                <span className="block text-[11px] text-slate-500">Share Requests</span>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
