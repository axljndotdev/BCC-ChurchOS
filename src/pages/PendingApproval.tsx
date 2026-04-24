import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Clock, LogOut, Mail } from 'lucide-react';
import Logo from '../components/Logo';

export default function PendingApproval() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  if (profile?.status === 'active') {
    return <div className="flex items-center justify-center min-h-screen">Redirecting...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-brand-bg">
      <div className="max-w-md w-full space-y-8 bg-white p-12 rounded-[3rem] shadow-xl border border-slate-100 text-center">
        <div className="flex justify-center mb-6">
          <Logo size="lg" />
        </div>
        
        <div className="bg-amber-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8">
          <Clock className="h-10 w-10 text-amber-600" />
        </div>

        <h2 className="text-3xl font-display text-slate-900 tracking-tight mb-4">Account Pending Approval</h2>
        
        <p className="text-slate-600 font-light leading-relaxed mb-8">
          Welcome to the Bethesda Community Church family! Your account has been created successfully, but it requires a one-time confirmation from our Super Admin before you can access the member portal.
        </p>

        <div className="bg-slate-50 p-6 rounded-2xl mb-8 text-left space-y-4">
          <div className="flex items-start gap-4">
            <Mail className="h-5 w-5 text-slate-400 mt-1" />
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Your Email</p>
              <p className="text-sm text-slate-700 font-medium">{profile?.email}</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <Clock className="h-5 w-5 text-slate-400 mt-1" />
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Status</p>
              <p className="text-sm text-amber-600 font-bold uppercase tracking-wider">Awaiting Confirmation</p>
            </div>
          </div>
        </div>

        <p className="text-sm text-slate-500 mb-10">
          This usually takes less than 24 hours. You will be able to log in once your account is active.
        </p>

        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10"
        >
          <LogOut className="h-5 w-5" />
          Sign Out
        </button>

        <p className="mt-8 text-[10px] text-slate-400 uppercase tracking-widest">
          Kabankalan City • Est. 2017
        </p>
      </div>
    </div>
  );
}
