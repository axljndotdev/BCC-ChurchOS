import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ShieldAlert, LogOut, Play, Clock, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const INACTIVITY_TIMEOUT_MS = 2 * 60 * 1000; // 2 minutes (120,000ms)
const AUTO_LOGOUT_GRACE_MS = 60 * 1000; // 60 seconds countdown after locked before full logout

export default function InactivityTimeoutGuard({ children }: { children: React.ReactNode }) {
  const { user, profile, isSuperAdmin, isAdmin, signOut } = useAuth();
  const [isLocked, setIsLocked] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(60);

  const lastActivityRef = useRef<number>(Date.now());
  const timerRef = useRef<any>(null);
  const countdownIntervalRef = useRef<any>(null);

  // Reset inactivity timer on any user movement or interaction
  const recordActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    // If not locked, ensure we remain unlocked
    if (!isLocked) {
      // Activity detected
    }
  }, [isLocked]);

  // Main inactivity checker
  useEffect(() => {
    if (!user) {
      setIsLocked(false);
      return;
    }

    const checkInactivity = () => {
      const elapsed = Date.now() - lastActivityRef.current;
      if (elapsed >= INACTIVITY_TIMEOUT_MS && !isLocked) {
        setIsLocked(true);
        setRemainingSeconds(60);
      }
    };

    // Check every 1 second
    timerRef.current = setInterval(checkInactivity, 1000);

    // Event listeners to detect ANY user action/movement
    const events = [
      'mousemove',
      'mousedown',
      'keydown',
      'touchstart',
      'scroll',
      'click',
      'wheel',
      'pointermove'
    ];

    let lastThrottle = 0;
    const handleUserInteraction = () => {
      const now = Date.now();
      if (now - lastThrottle > 400) { // Throttle to prevent excessive calls
        lastThrottle = now;
        if (!isLocked) {
          recordActivity();
        }
      }
    };

    events.forEach(eventName => {
      window.addEventListener(eventName, handleUserInteraction, { passive: true });
    });

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      events.forEach(eventName => {
        window.removeEventListener(eventName, handleUserInteraction);
      });
    };
  }, [user, isLocked, recordActivity]);

  // Grace countdown interval when locked
  useEffect(() => {
    if (isLocked && user) {
      countdownIntervalRef.current = setInterval(() => {
        setRemainingSeconds(prev => {
          if (prev <= 1) {
            clearInterval(countdownIntervalRef.current);
            signOut();
            setIsLocked(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    }

    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, [isLocked, user, signOut]);

  const handleResume = () => {
    lastActivityRef.current = Date.now();
    setIsLocked(false);
  };

  const handleSignOutNow = async () => {
    setIsLocked(false);
    await signOut();
  };

  return (
    <>
      {children}

      {/* Inactivity Lock Modal */}
      <AnimatePresence>
        {isLocked && user && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 max-w-lg w-full p-8 sm:p-10 text-center relative overflow-hidden"
            >
              {/* Background Accent */}
              <div className="absolute -top-16 -right-16 w-36 h-36 bg-amber-50 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-maroon/5 rounded-full blur-2xl pointer-events-none" />

              <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 border border-amber-200/80 mx-auto flex items-center justify-center mb-6 shadow-inner">
                <Lock className="h-8 w-8" />
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100/70 border border-amber-200 rounded-full text-[10px] font-bold text-amber-800 uppercase tracking-widest mb-4">
                <Clock className="h-3 w-3 text-amber-600" /> Inactivity Security Timeout (2 Minutes)
              </div>

              <h3 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 mb-3">
                Session Paused
              </h3>

              <p className="text-slate-600 font-light text-sm leading-relaxed mb-6">
                No mouse movement or user action was detected for <strong>2 minutes</strong>. To protect church data, your session has been secured.
              </p>

              {/* Countdown Warning */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-500 mb-8 flex items-center justify-between">
                <span className="flex items-center gap-2 font-medium text-slate-700">
                  <ShieldAlert className="h-4 w-4 text-amber-600" /> Auto-logout in:
                </span>
                <span className="font-mono font-bold text-sm text-maroon">
                  00:{remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  onClick={handleResume}
                  className="w-full py-3.5 px-6 bg-slate-900 hover:bg-slate-800 text-white rounded-full font-bold text-xs uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  <Play className="h-3.5 w-3.5" /> Continue Session
                </button>
                <button
                  type="button"
                  onClick={handleSignOutNow}
                  className="w-full py-3.5 px-6 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-700 rounded-full font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 border border-slate-200"
                >
                  <LogOut className="h-3.5 w-3.5" /> Sign Out
                </button>
              </div>

              <p className="text-[11px] text-slate-400 font-light mt-6">
                Logged in as: <span className="font-medium text-slate-700">{profile?.displayName || user.email}</span> ({isSuperAdmin ? 'Super Admin' : isAdmin ? 'Admin' : 'Member'})
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
