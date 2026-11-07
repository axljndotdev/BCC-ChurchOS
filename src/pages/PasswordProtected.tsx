import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Lock, Eye, EyeOff, ShieldCheck, ArrowRight, Home, KeyRound } from 'lucide-react';
import Logo from '../components/Logo';

export default function PasswordProtected() {
  const [passcode, setPasscode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) {
      setError('Please enter the access code.');
      return;
    }

    // For demo/access verification
    if (passcode.toLowerCase() === 'bethesda' || passcode.toLowerCase() === 'bcc2026' || passcode === 'faith') {
      setError('');
      setSuccess(true);
      setTimeout(() => {
        navigate('/member/dashboard');
      }, 900);
    } else {
      setError('Incorrect passcode. Please check with your ministry leader or church admin.');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-16 sm:py-24 bg-[#FAF7F2] relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-[#7A121D]/10 via-[#C99738]/15 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="max-w-md w-full mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-3xl p-8 sm:p-10 border border-[#E8D5B5] shadow-xl text-center space-y-6"
        >
          {/* Lock Icon Emblem */}
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#7A121D] to-[#5C0612] text-[#F0CA7D] flex items-center justify-center shadow-lg shadow-maroon/20">
            <Lock className="w-8 h-8 text-[#E5B869]" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C99738]">
              Restricted Access
            </span>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-[#1A0B0E]">
              Password Protected
            </h1>
            <p className="text-slate-600 text-sm leading-relaxed">
              This section is reserved for ministry leaders, council, and registered church members. Enter your passcode to continue.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleUnlock} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Enter Passcode
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passcode}
                  onChange={(e) => {
                    setPasscode(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="Enter passcode (e.g. bethesda)"
                  className="w-full px-4 py-3 pr-11 bg-[#FDFBF7] border border-[#E8D5B5] rounded-xl text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7A121D]/20 focus:border-[#7A121D] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {error && (
                <p className="text-xs text-red-600 font-medium mt-1.5 flex items-center gap-1">
                  <span>⚠</span> {error}
                </p>
              )}
              {success && (
                <p className="text-xs text-emerald-600 font-bold mt-1.5 flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4" /> Passcode accepted! Redirecting...
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={success}
              className="w-full py-3.5 px-6 rounded-xl bg-[#7A121D] hover:bg-[#5C0612] text-white font-bold text-sm tracking-wide transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              <span>Unlock Page</span>
              <ArrowRight className="w-4 h-4 text-[#E5B869] group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          {/* Member Login Alternative */}
          <div className="pt-4 border-t border-[#E8D5B5]/60 text-xs text-slate-500 space-y-2">
            <p>
              Are you an active BCC member or staff?
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link
                to="/login"
                className="font-bold text-[#7A121D] hover:text-[#5C0612] underline flex items-center gap-1"
              >
                <KeyRound className="w-3.5 h-3.5" />
                Sign In with Account
              </Link>
              <span>·</span>
              <Link
                to="/"
                className="text-slate-600 hover:text-slate-900"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
