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
        await signUpWithUsername(idValue, password, displayName);
      }
      navigate('/member/dashboard');
    } catch (err: any) {
      let message = err.message;
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') message = 'Invalid username or password.';
      if (err.code === 'auth/wrong-password') message = 'Incorrect password.';
      if (err.code === 'auth/email-already-in-use') message = 'This username is already taken.';
      setError(message || 'Authentication failed');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20 bg-slate-50 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-maroon/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[100px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl w-full"
      >
        <div className="bg-white p-8 sm:p-12 rounded-[3.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 relative z-10">
          <div className="text-center mb-10">
            <div className="flex justify-center mb-8">
              <motion.div
                whileHover={{ rotate: 12, scale: 1.1 }}
                className="p-4 bg-slate-50 rounded-3xl"
              >
                <Logo size="lg" />
              </motion.div>
            </div>
            <h2 className="text-4xl font-display font-bold text-slate-900 tracking-tight">
              {isLogin ? "Member's Login" : 'Join the Family'}
            </h2>
            <p className="mt-4 text-slate-500 font-light max-w-sm mx-auto leading-relaxed">
              {isLogin 
                ? 'Sign in to access your member dashboard and stay connected.' 
                : 'Create your member account to participate in the BCC community.'}
            </p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-8 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-2xl overflow-hidden"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-black text-red-700 uppercase tracking-widest mb-1">Attention Required</p>
                  <p className="text-sm text-red-600 leading-tight">{error}</p>
                </div>
              </div>
            </motion.div>
          )}

          <div className="space-y-8">
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-4 px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-700 font-bold hover:bg-slate-100 active:scale-[0.98] transition-all duration-300 disabled:opacity-50"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="" className="h-6 w-6" />
              Continue with Google
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-[0.3em] font-black italic">
                <span className="px-6 bg-white text-slate-300">Or use Credentials</span>
              </div>
            </div>

            <form className="space-y-6" onSubmit={handleAuth}>
              <div className="grid grid-cols-1 gap-5">
                <AnimatePresence mode="wait">
                  {!isLogin && (
                    <motion.div 
                      key="fullname-field"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-2 overflow-hidden"
                    >
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                        <input
                          type="text"
                          required={!isLogin}
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          className="block w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-maroon/20 focus:bg-white text-sm transition-all outline-none"
                          placeholder="John Doe"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Username</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                    <input
                      type="text"
                      required
                      value={idValue}
                      onChange={(e) => setIdValue(e.target.value)}
                      className="block w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-maroon/20 focus:bg-white text-sm transition-all outline-none"
                      placeholder="Enter username"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-maroon/20 focus:bg-white text-sm transition-all outline-none"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full relative group"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-maroon to-slate-900 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
                <div className="relative flex items-center justify-center gap-3 py-4 bg-slate-900 text-white rounded-2xl text-sm font-bold hover:bg-slate-800 transition-all duration-300 disabled:opacity-50">
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      {isLogin ? 'Sign In to Dashboard' : 'Create My Account'}
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </div>
              </button>
            </form>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                }}
                className="text-slate-400 hover:text-maroon text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2 mx-auto"
              >
                {isLogin ? "New here? Create an account" : "Already have an account? Sign in"}
              </button>
            </div>
          </div>
        </div>

        <p className="mt-12 text-center text-[10px] text-slate-400 uppercase tracking-[0.3em] font-medium leading-relaxed">
          Bethesda Community Church <br />
          Kabankalan City • Est. 2017
        </p>
      </motion.div>
    </div>
  );
}
