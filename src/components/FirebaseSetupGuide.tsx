import { AlertTriangle, ExternalLink, Key } from 'lucide-react';
import Logo from './Logo';

export default function FirebaseSetupGuide() {
  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-[2rem] md:rounded-[3rem] shadow-xl border border-slate-100 overflow-hidden">
        <div className="bg-slate-50 p-6 md:p-10 border-b border-slate-100 flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6 text-center md:text-left">
          <Logo size="lg" className="shrink-0" />
          <div>
            <h1 className="text-2xl md:text-3xl font-display text-slate-900">Configuration Required</h1>
            <p className="text-slate-500 font-light">Bethesda Community Church platform needs setup.</p>
          </div>
        </div>

        <div className="p-6 md:p-10 space-y-8">
          <div className="space-y-6">
            <h2 className="text-xl font-display text-slate-900 flex items-center gap-3">
              <Key className="h-5 w-5 text-maroon" />
              Setup Instructions
            </h2>
            <ol className="space-y-6 text-slate-600 list-decimal list-inside font-light leading-relaxed">
              <li>
                Visit the <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-maroon font-medium hover:underline inline-flex items-center gap-1">Firebase Console <ExternalLink className="h-3 w-3" /></a> to create your project.
              </li>
              <li>
                Register a <strong>Web App</strong> and secure your <code>firebaseConfig</code>.
              </li>
              <li>
                Add these keys to your AI Studio <strong>Secrets</strong>:
                <div className="mt-4 grid grid-cols-1 gap-2 bg-slate-50 p-6 rounded-2xl font-mono text-[10px] border border-slate-100 tracking-wider text-slate-500">
                  <p>VITE_FIREBASE_API_KEY</p>
                  <p>VITE_FIREBASE_AUTH_DOMAIN</p>
                  <p>VITE_FIREBASE_PROJECT_ID</p>
                  <p>VITE_FIREBASE_STORAGE_BUCKET</p>
                  <p>VITE_FIREBASE_MESSAGING_SENDER_ID</p>
                  <p>VITE_FIREBASE_APP_ID</p>
                  <p>VITE_FIREBASE_MEASUREMENT_ID (Optional)</p>
                </div>
              </li>
              <li>
                <strong>CRITICAL:</strong> Add these domains to <strong>Authentication &gt; Settings &gt; Authorized Domains</strong> in Firebase Console:
                <div className="mt-4 space-y-2 bg-maroon/5 p-6 rounded-2xl font-mono text-[10px] border border-maroon/10 text-maroon select-all">
                  <p>ais-dev-vizbnjox5k5jadeg7pf3w3-315136067624.asia-southeast1.run.app</p>
                  <p>ais-pre-vizbnjox5k5jadeg7pf3w3-315136067624.asia-southeast1.run.app</p>
                </div>
              </li>
              <li>
                Enable <strong>Google Sign-In</strong> in the <strong>Authentication &gt; Sign-in method</strong> tab.
              </li>
              <li>
                Create a <strong>Cloud Firestore</strong> database in "Production mode" and select a location near you.
              </li>
              <li>
                Refresh this page to initialize the BCC platform.
              </li>
            </ol>
          </div>

          <div className="pt-8 border-t border-stone-50">
            <p className="text-xs text-stone-400 italic font-light">
              Security Note: Your API keys are stored securely and never exposed in the source code.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
