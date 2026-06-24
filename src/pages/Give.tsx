import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, CreditCard, Landmark, QrCode, Copy, Check, 
  ArrowRight, ShieldCheck, HelpCircle, Gift, DollarSign
} from 'lucide-react';

export default function Give() {
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [giveAmount, setGiveAmount] = useState<string>('500');
  const [customAmount, setCustomAmount] = useState<string>('');
  const [giveFund, setGiveFund] = useState<string>('Tithes');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  
  // Payment Form Fields
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVC, setCardCVC] = useState('');

  const bankAccounts = [
    {
      bankName: "Land Bank of the Philippines",
      accountName: "Bethesda Community Church Inc.",
      accountNumber: "1234-5678-90",
      branch: "Kabankalan Branch"
    },
    {
      bankName: "Bank of the Philippine Islands (BPI)",
      accountName: "Bethesda Community Church BCC",
      accountNumber: "9876-5432-10",
      branch: "Kabankalan City Branch"
    }
  ];

  const gcashDetails = {
    name: "Bethesda Community Church (BCC)",
    number: "0917-123-4567",
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const activeAmount = giveAmount === 'custom' ? customAmount : giveAmount;

  const handleOnlineGive = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAmount || Number(activeAmount) <= 0) {
      alert("Please specify a valid giving amount.");
      return;
    }
    
    setIsSubmitting(true);

    // Simulate standard payment gateway transition
    setTimeout(() => {
      setIsSubmitting(false);
      setShowReceipt(true);
    }, 2000);
  };

  const resetGiving = () => {
    setShowReceipt(false);
    setDonorName('');
    setDonorEmail('');
    setCardNumber('');
    setCardExpiry('');
    setCardCVC('');
    setCustomAmount('');
    setGiveAmount('500');
  };

  return (
    <div className="pb-24 bg-slate-50 min-h-screen">
      {/* Header */}
      <section className="relative py-20 bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 opacity-15">
          <img 
            src="https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&q=80&w=1920" 
            alt="Worship giving background" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-slate-900/60" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-maroon/20 border border-maroon/40 rounded-full text-[10px] font-bold text-white uppercase tracking-widest mb-6"
          >
            <Heart className="h-3.5 w-3.5 text-maroon" /> Worship Through Giving
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-display font-bold text-white mb-6 tracking-tight"
          >
            Supporting the <span className="italic font-light">Ministry</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-slate-300 max-w-2xl mx-auto font-light leading-relaxed"
          >
            Your generosity enables us to make a difference in Kabankalan City and beyond. Give your tithes, offerings, or mission support securely online.
          </motion.p>
        </div>
      </section>

      {/* Main Layout Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Left Column: Interactive giving calculator & form simulator */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 md:p-12">
            {!showReceipt ? (
              <form onSubmit={handleOnlineGive} className="space-y-8">
                <div className="space-y-4">
                  <h3 className="text-2xl font-display font-semibold text-slate-900">Secure Online Giving</h3>
                  <p className="text-slate-500 font-light text-sm leading-relaxed">
                    Choose your gift amount and designated fund. All mock transactions are processed through encrypted, industry-standard simulated gateways.
                  </p>
                </div>

                <div className="w-12 h-px bg-slate-200" />

                {/* Amount Selectors */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block ml-1">Select Amount (₱)</label>
                  <div className="grid grid-cols-4 gap-3">
                    {['200', '500', '1000', '5000'].map((amt) => (
                      <button
                        type="button"
                        key={amt}
                        onClick={() => {
                          setGiveAmount(amt);
                          setCustomAmount('');
                        }}
                        className={`py-4 rounded-2xl text-center font-bold text-sm transition-all border ${
                          giveAmount === amt 
                            ? 'bg-maroon text-white border-maroon shadow-lg shadow-maroon/15 scale-[1.03]' 
                            : 'bg-slate-50 text-slate-700 border-transparent hover:bg-slate-100'
                        }`}
                      >
                        ₱{amt}
                      </button>
                    ))}
                  </div>

                  {/* Custom Amount Option */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setGiveAmount('custom')}
                      className={`w-full py-4 rounded-2xl text-center font-bold text-sm transition-all border mb-3 ${
                        giveAmount === 'custom'
                          ? 'bg-slate-900 text-white border-slate-900 shadow-lg'
                          : 'bg-slate-50 text-slate-700 border-transparent hover:bg-slate-100'
                      }`}
                    >
                      Give Custom Amount
                    </button>
                    
                    <AnimatePresence>
                      {giveAmount === 'custom' && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="relative overflow-hidden"
                        >
                          <div className="relative">
                            <span className="absolute left-5 top-1/2 -translate-y-1/2 font-bold text-slate-400">₱</span>
                            <input
                              type="number"
                              required
                              placeholder="Enter custom amount..."
                              value={customAmount}
                              onChange={(e) => setCustomAmount(e.target.value)}
                              className="w-full pl-10 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 placeholder:font-light focus:outline-none focus:ring-2 focus:ring-maroon focus:bg-white transition-all"
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Fund Designation */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block ml-1">Designated Fund</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { key: 'Tithes', label: 'Tithe', desc: '10% biblical obedience' },
                      { key: 'Offerings', label: 'General Offering', desc: 'Operating ministries support' },
                      { key: 'Missions', label: 'Missions & Outreach', desc: 'Spreading God\'s Word globally' },
                      { key: 'Building', label: 'Building Fund', desc: 'Sanctuary improvement' }
                    ].map((fund) => (
                      <button
                        type="button"
                        key={fund.key}
                        onClick={() => setGiveFund(fund.key)}
                        className={`p-4 rounded-2xl text-left border transition-all ${
                          giveFund === fund.key 
                            ? 'bg-slate-900 text-white border-slate-900 shadow-md scale-[1.01]' 
                            : 'bg-slate-50 text-slate-700 border-transparent hover:bg-slate-100'
                        }`}
                      >
                        <p className="font-bold text-sm">{fund.label}</p>
                        <p className={`text-[10px] mt-0.5 font-light ${giveFund === fund.key ? 'text-white/70' : 'text-slate-400'}`}>{fund.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Donor Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Juan Dela Cruz"
                      value={donorName}
                      onChange={(e) => setDonorName(e.target.value)}
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-xl text-sm placeholder:font-light focus:outline-none focus:ring-2 focus:ring-maroon focus:bg-white transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="juan@email.com"
                      value={donorEmail}
                      onChange={(e) => setDonorEmail(e.target.value)}
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-xl text-sm placeholder:font-light focus:outline-none focus:ring-2 focus:ring-maroon focus:bg-white transition-all"
                    />
                  </div>
                </div>

                {/* Card Details */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <CreditCard className="h-4 w-4" /> Card Information
                  </h4>
                  <div className="space-y-3">
                    <input
                      type="text"
                      required
                      placeholder="4111 2222 3333 4444"
                      maxLength={19}
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-xl text-sm placeholder:font-light focus:outline-none focus:ring-2 focus:ring-maroon focus:bg-white transition-all"
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        required
                        placeholder="MM/YY"
                        maxLength={5}
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-xl text-sm placeholder:font-light focus:outline-none focus:ring-2 focus:ring-maroon focus:bg-white transition-all"
                      />
                      <input
                        type="password"
                        required
                        placeholder="CVC"
                        maxLength={3}
                        value={cardCVC}
                        onChange={(e) => setCardCVC(e.target.value)}
                        className="px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-xl text-sm placeholder:font-light focus:outline-none focus:ring-2 focus:ring-maroon focus:bg-white transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-maroon text-white font-bold rounded-full text-xs uppercase tracking-widest hover:bg-slate-900 disabled:bg-slate-300 transition-colors shadow-xl shadow-maroon/10 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white" />
                  ) : (
                    <>
                      <Gift className="h-4 w-4" /> Send Secure Gift of ₱{Number(activeAmount).toLocaleString()}
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* Giving Complete Receipt Screen */
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8 space-y-6"
              >
                <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
                  <Check className="h-10 w-10 stroke-[3px]" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-3xl font-display font-bold text-slate-900">Thank You!</h3>
                  <p className="text-slate-500 font-light max-w-md mx-auto text-sm leading-relaxed">
                    Your financial worship was processed successfully. A copy of this receipt has been prepared for you.
                  </p>
                </div>

                <div className="max-w-md mx-auto bg-slate-50 rounded-3xl p-8 border border-slate-100 text-left space-y-4 font-mono text-xs text-slate-600 shadow-inner">
                  <div className="text-center pb-4 border-b border-dashed border-slate-200">
                    <p className="font-bold text-slate-800 tracking-wider">BETHESDA COMMUNITY CHURCH</p>
                    <p className="text-[10px] text-slate-400 mt-1">KABANKALAN CITY, NEGROS OCCIDENTAL</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400">DONOR NAME:</span>
                      <span className="font-bold text-slate-800">{donorName || 'Juan Dela Cruz'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">EMAIL:</span>
                      <span className="font-bold text-slate-800">{donorEmail || 'juan@email.com'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">DESIGNATED FUND:</span>
                      <span className="font-bold text-slate-800 uppercase tracking-wide">{giveFund}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">REFERENCE:</span>
                      <span className="font-bold text-slate-800">BCC-{Math.floor(100000 + Math.random() * 900000)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">DATE:</span>
                      <span className="font-bold text-slate-800">{new Date().toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-dashed border-slate-200 flex justify-between items-center text-sm font-bold text-slate-900">
                    <span>GIFT AMOUNT:</span>
                    <span className="text-lg text-maroon">₱{Number(activeAmount).toLocaleString()}</span>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={resetGiving}
                    className="px-10 py-3.5 bg-slate-900 text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-maroon transition-all"
                  >
                    Done
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Right Column: Traditional/Offline and Bank Transfer details */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* Bank Transfer Card */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                <Landmark className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-slate-900">Bank Transfer</h3>
                <p className="text-xs text-slate-400">Support via direct bank deposit or transfer.</p>
              </div>
            </div>

            <div className="w-12 h-px bg-slate-200" />

            <div className="space-y-4">
              {bankAccounts.map((account, index) => (
                <div 
                  key={index} 
                  className="p-5 border border-slate-100 rounded-2xl hover:bg-slate-50/50 transition-colors relative group"
                >
                  <p className="font-bold text-slate-900 text-sm">{account.bankName}</p>
                  <p className="text-xs text-slate-500 font-light mt-1">Account Name: <strong className="font-medium text-slate-700">{account.accountName}</strong></p>
                  
                  <div className="flex items-center justify-between gap-3 mt-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="font-mono text-xs text-slate-600 font-bold tracking-wide">{account.accountNumber}</span>
                    <button
                      onClick={() => handleCopy(account.accountNumber)}
                      className="text-slate-400 hover:text-maroon transition-colors flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider"
                    >
                      {copiedText === account.accountNumber ? (
                        <>Copied <Check className="h-3 w-3 text-emerald-500" /></>
                      ) : (
                        <>Copy <Copy className="h-3 w-3" /></>
                      )}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 font-light mt-2 italic">Branch: {account.branch}</p>
                </div>
              ))}
            </div>
          </div>

          {/* GCash / Mobile Wallet Card */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <QrCode className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-slate-900">GCash Mobile Wallet</h3>
                <p className="text-xs text-slate-400">Quick giving using GCash mobile application.</p>
              </div>
            </div>

            <div className="w-12 h-px bg-slate-200" />

            <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50/50 rounded-2xl space-y-4">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">GCash Registered Name</p>
                <p className="font-bold text-slate-900 text-sm">{gcashDetails.name}</p>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">GCash Registered Number</p>
                <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-xl border border-blue-100">
                  <span className="font-mono text-xs text-slate-600 font-bold tracking-wide">{gcashDetails.number}</span>
                  <button
                    onClick={() => handleCopy(gcashDetails.number)}
                    className="text-slate-400 hover:text-maroon transition-colors flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider"
                  >
                    {copiedText === gcashDetails.number ? (
                      <>Copied <Check className="h-3 w-3 text-emerald-500" /></>
                    ) : (
                      <>Copy <Copy className="h-3 w-3" /></>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Security details card */}
          <div className="p-6 bg-slate-900 text-slate-400 rounded-[2rem] flex items-start gap-4">
            <ShieldCheck className="h-8 w-8 text-maroon shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-white text-xs font-bold uppercase tracking-widest">Secure Giving Promise</p>
              <p className="text-[10px] font-light leading-relaxed">
                Your generosity is sacred. All online transactions are processed through end-to-end sandbox systems and mapped securely to help advance our local and foreign church missions.
              </p>
            </div>
          </div>

        </div>

      </section>
    </div>
  );
}
