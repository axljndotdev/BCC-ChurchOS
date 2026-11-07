import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, AlertCircle, User, ArrowRight, Loader2 } from 'lucide-react';
import Logo from '../components/Logo';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function Login() {
  const { signInWithGoogle, signInWithUsername, signUpWithUsername } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [idValue, setIdValue] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      setLoading(true);
      await signInWithGoogle();
      navigate('/member/dashboard');
    } catch (err: any) {
      if (err.code === 'auth/unauthorized-domain') {
        setError('Domain not authorized. Please check your Firebase settings.');
      } else {
        setError('Failed to sign in with Google');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idValue || !password) return;
    if (!isLogin && !displayName) {
      setError('Please enter your full name');
      return;
    }

    try {
      setError('');
      setLoading(true);
      
      if (isLogin) {
        await signInWithUsername(idValue, password);
      } else {
        // Basic frontend validation for registration
        if (idValue.length < 3) {
          throw new Error('Username/Identity must be at least 3 characters');
        }
        if (password.length < 6) {
          throw new Error('Secret key must be at least 6 characters');
        }
        await signUpWithUsername(idValue, password, displayName);
      }
      
      // Check if profile is active or pending
      navigate('/member/dashboard');
    } catch (err: any) {
      let message = err.message;
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        message = 'The Account ID or Secret Key you provided is incorrect. Please double-check your credentials.';
      } else if (err.code === 'auth/wrong-password') {
        message = 'Incorrect secret key. If you forgotten it, please contact the administrator.';
      } else if (err.code === 'auth/invalid-email') {
        message = 'The Account ID format is invalid. Please use a standard username or email.';
      } else if (err.code === 'auth/email-already-in-use') {
        message = 'This Account ID is already claimed. If it\'s yours, please sign in instead.';
      } else if (err.code === 'auth/weak-password') {
        message = 'Secret key is too weak. Please use at least 6 characters.';
      } else if (err.code === 'auth/too-many-requests') {
        message = 'Too many failed attempts. Your access is temporarily blocked for security. Please try again later.';
      } else if (err.message?.includes('Missing or insufficient permissions')) {
        message = 'Account created but profile initialization pending. Please sign in again or wait a moment.';
      }
      setError(message || 'Our authentication portal is currently experiencing high load. Please try again.');
      console.error('Auth Error Details:', { code: err.code, message: err.message, full: err });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 sm:py-24 bg-[#FAF7F2] relative overflow-hidden font-sans">
      {/* Immersive background with subtle depth */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-[#7A121D]/10 via-[#C99738]/10 to-transparent rounded-full blur-3xl" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-lg w-full relative z-10"
      >
        <div className="bg-white p-8 sm:p-12 rounded-3xl sm:rounded-[2.5rem] shadow-xl border border-[#E8D5B5] relative overflow-hidden">
          {/* Top accent bar in regal crimson and radiant gold */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#7A121D] via-[#C99738] to-[#7A121D]" />

          <div className="text-center mb-10">
            <div className="flex justify-center mb-6">
              <motion.div
                whileHover={{ rotate: -4, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-4 bg-[#FAF6EE] shadow-md rounded-2xl border border-[#E8D5B5] cursor-pointer"
                onClick={() => navigate('/')}
              >
                <Logo size="lg" />
              </motion.div>
            </div>
            <motion.h2 
              key={isLogin ? 'login-h' : 'signup-h'}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl sm:text-4xl font-display font-extrabold text-[#1A0B0E] tracking-tight mb-2"
            >
              {isLogin ? "Member & Staff Portal" : 'Create Church Account'}
            </motion.h2>
            <motion.p 
              key={isLogin ? 'login-p' : 'signup-p'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-slate-600 font-light text-sm sm:text-base leading-relaxed"
            >
              {isLogin 
                ? 'Welcome back to your Bethesda Community dashboard.' 
                : 'Join our active church community online.'}
            </motion.p>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="mb-6 bg-red-50 border border-red-200 p-4 rounded-2xl"
              >
                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-red-100 rounded-lg text-red-600 shrink-0">
                    <AlertCircle className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-red-800 uppercase tracking-widest mb-0.5">Authentication Note</p>
                    <p className="text-xs text-red-700 leading-snug">{error}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-6">
            <motion.button
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-5 py-3.5 bg-white border border-[#E8D5B5] rounded-xl text-slate-800 font-bold hover:bg-[#FAF6EE] shadow-xs transition-all text-xs uppercase tracking-wider disabled:opacity-50"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="" className="h-5 w-5" />
              <span>Continue with Google</span>
            </motion.button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#E8D5B5]/60" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 bg-white text-[9px] font-bold uppercase tracking-[0.25em] text-[#9A6F1D]">Or with Account ID</span>
              </div>
            </div>

            <form className="space-y-4" onSubmit={handleAuth}>
              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {!isLogin && (
                    <motion.div 
                      key="fullname-field"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="space-y-1.5"
                    >
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Full Name</label>
                      <div className="relative">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                          <User className="h-4 w-4" />
                        </div>
                        <input
                          type="text"
                          required={!isLogin}
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          className="block w-full pl-10 pr-4 py-3 bg-[#FDFBF7] border border-[#E8D5B5] rounded-xl focus:ring-2 focus:ring-[#7A121D]/20 focus:border-[#7A121D] text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400"
                          placeholder="Juan Dela Cruz"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Account ID / Email</label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                      <Mail className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={idValue}
                      onChange={(e) => setIdValue(e.target.value)}
                      className="block w-full pl-10 pr-4 py-3 bg-[#FDFBF7] border border-[#E8D5B5] rounded-xl focus:ring-2 focus:ring-[#7A121D]/20 focus:border-[#7A121D] text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400"
                      placeholder="Username or Email"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Password / Secret Key</label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-10 pr-4 py-3 bg-[#FDFBF7] border border-[#E8D5B5] rounded-xl focus:ring-2 focus:ring-[#7A121D]/20 focus:border-[#7A121D] text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="w-full mt-2 py-4 bg-[#7A121D] hover:bg-[#5C0612] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-[#E5B869]" />
                ) : (
                  <>
                    <span>{isLogin ? 'Sign In to Dashboard' : 'Complete Registration'}</span>
                    <ArrowRight className="h-4 w-4 text-[#E5B869]" />
                  </>
                )}
              </motion.button>
            </form>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                }}
                className="text-xs text-slate-600 hover:text-[#7A121D] font-medium"
              >
                <span>{isLogin ? "Need a church account? " : "Already have an account? "}</span>
                <span className="font-bold underline text-[#7A121D]">
                  {isLogin ? "Register now" : "Sign in here"}
                </span>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link to="/" className="text-xs text-slate-500 hover:text-slate-800 transition-colors">
            &larr; Return to Church Homepage
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
