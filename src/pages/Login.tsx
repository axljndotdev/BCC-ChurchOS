import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
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
        message = 'The ID or Secret Key you provided is incorrect.';
      } else if (err.code === 'auth/wrong-password') {
        message = 'Incorrect secret key.';
      } else if (err.code === 'auth/email-already-in-use') {
        message = 'This identity is already claimed. If it\'s yours, please sign in instead.';
      } else if (err.code === 'auth/weak-password') {
        message = 'Secret key is too weak. Please use at least 6 characters.';
      } else if (err.message?.includes('Missing or insufficient permissions')) {
        message = 'Account created but profile initialization pending. Please try signing in.';
      }
      setError(message || 'Our authentication portal is currently experiencing high load. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20 bg-[#f8fafc] relative overflow-hidden font-sans">
      {/* Immersive background with subtle depth */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] bg-maroon/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[100px]" />
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#800000 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }}></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-xl w-full relative z-10"
      >
        <div className="bg-white/80 backdrop-blur-xl p-8 sm:p-14 rounded-[3rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] border border-white relative overflow-hidden">
          {/* Top accent bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-maroon via-maroon/80 to-maroon/40" />

          <div className="text-center mb-12">
            <div className="flex justify-center mb-10">
              <motion.div
                whileHover={{ rotate: -5, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-5 bg-white shadow-xl shadow-maroon/5 rounded-[2rem] border border-slate-50 cursor-pointer"
                onClick={() => navigate('/')}
              >
                <Logo size="lg" />
              </motion.div>
            </div>
            <motion.h2 
              key={isLogin ? 'login-h' : 'signup-h'}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-display font-extrabold text-slate-900 tracking-tight mb-4"
            >
              {isLogin ? "Member's Login" : 'Create Account'}
            </motion.h2>
            <motion.p 
              key={isLogin ? 'login-p' : 'signup-p'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-slate-500 font-light text-base leading-relaxed"
            >
              {isLogin 
                ? 'Welcome back to your spiritual home dashboard.' 
                : 'Join our growing digital community today.'}
            </motion.p>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="mb-8 bg-red-50/50 backdrop-blur-sm border border-red-100 p-5 rounded-3xl group"
              >
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-red-100 rounded-xl text-red-600 group-hover:scale-110 transition-transform">
                    <AlertCircle className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-black text-red-800 uppercase tracking-widest mb-1.5">Notification</p>
                    <p className="text-sm text-red-600/90 font-medium leading-snug">{error}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-10">
            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-4 px-6 py-4.5 bg-white border border-slate-200 rounded-[1.5rem] text-slate-700 font-bold hover:bg-slate-50 active:bg-slate-100 shadow-sm transition-all duration-300 disabled:opacity-50"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="" className="h-6 w-6" />
              <span className="text-[13px] uppercase tracking-widest">Continue with Google</span>
            </motion.button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-5 bg-white text-[9px] font-black uppercase tracking-[0.4em] text-slate-300">Auth Portal</span>
              </div>
            </div>

            <form className="space-y-6" onSubmit={handleAuth}>
              <div className="space-y-5">
                <AnimatePresence mode="popLayout">
                  {!isLogin && (
                    <motion.div 
                      key="fullname-field"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="space-y-2.5"
                    >
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                      <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 flex items-center justify-center text-slate-300 group-focus-within:text-maroon transition-colors duration-300">
                          <User className="h-5 w-5" />
                        </div>
                        <input
                          type="text"
                          required={!isLogin}
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          className="block w-full pl-13 pr-5 py-4.5 bg-slate-50/50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-maroon/5 focus:border-maroon/20 focus:bg-white text-sm font-medium transition-all outline-none placeholder:text-slate-300"
                          placeholder="Your real name"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-2.5">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Account ID</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 flex items-center justify-center text-slate-300 group-focus-within:text-maroon transition-colors duration-300">
                      <Mail className="h-5 w-5" />
                    </div>
                    <input
                      type="text"
                      required
                      value={idValue}
                      onChange={(e) => setIdValue(e.target.value)}
                      className="block w-full pl-13 pr-5 py-4.5 bg-slate-50/50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-maroon/5 focus:border-maroon/20 focus:bg-white text-sm font-medium transition-all outline-none placeholder:text-slate-300"
                      placeholder="Username or Email"
                    />
                  </div>
                </div>

                <div className="space-y-2.5">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Secret Key</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 flex items-center justify-center text-slate-300 group-focus-within:text-maroon transition-colors duration-300">
                      <Lock className="h-5 w-5" />
                    </div>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-13 pr-5 py-4.5 bg-slate-50/50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-maroon/5 focus:border-maroon/20 focus:bg-white text-sm font-medium transition-all outline-none placeholder:text-slate-300"
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
                className="w-full relative group"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-maroon to-slate-900 rounded-[1.8rem] blur opacity-20 group-hover:opacity-40 transition duration-500" />
                <div className="relative flex items-center justify-center gap-4 py-5 bg-slate-900 text-white rounded-[1.5rem] text-[15px] font-extrabold hover:bg-slate-800 transition-all duration-300 disabled:opacity-50">
                  {loading ? (
                    <Loader2 className="h-6 w-6 animate-spin text-white/50" />
                  ) : (
                    <>
                      {isLogin ? 'Access Dashboard' : 'Finalize Registration'}
                      <div className="p-1.5 bg-white/10 rounded-lg group-hover:translate-x-1 transition-transform">
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </>
                  )}
                </div>
              </motion.button>
            </form>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                }}
                className="group inline-flex items-center gap-3 py-2 px-4 rounded-full hover:bg-slate-50 transition-colors"
              >
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{isLogin ? "Need an identity?" : "Have an identity?"}</span>
                <span className="text-[11px] font-black text-maroon uppercase tracking-widest underline decoration-maroon/30 underline-offset-4 group-hover:decoration-maroon transition-all">
                  {isLogin ? "Register now" : "Sign in here"}
                </span>
              </button>
            </div>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-14 text-center px-10"
        >
          <p className="text-[10px] text-slate-400 uppercase tracking-[0.4em] font-black leading-loose opacity-60">
            Bethesda Community Church <br />
            Digital Infrastructure • Kabankalan City • Est. 2017
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
