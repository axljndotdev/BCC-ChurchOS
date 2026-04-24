import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Lock, 
  Save, 
  Loader2, 
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Camera,
  Upload
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { uploadFile } from '../services/db';
import imageCompression from 'browser-image-compression';

export default function MemberProfile() {
  const { profile, updateProfileDetails, updateUserPassword } = useAuth();
  
  const [details, setDetails] = useState({
    displayName: profile?.displayName || '',
    contactNumber: profile?.contactNumber || '',
    address: profile?.address || '',
    gender: profile?.gender || 'Male' as const,
  });

  const [passwords, setPasswords] = useState({
    new: '',
    confirm: ''
  });

  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [passMessage, setPassMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [showConfirmSave, setShowConfirmSave] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [compressing, setCompressing] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    // instant local preview
    const objectUrl = URL.createObjectURL(file);
    setLocalPreview(objectUrl);

    // Check if file is too large (e.g. > 10MB as recommendation)
    if (file.size > 10 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'File is too large. Please select a photo under 10MB.' });
      setLocalPreview(null);
      URL.revokeObjectURL(objectUrl);
      return;
    }

    setUploading(true);
    setCompressing(true);
    setUploadProgress(0);
    setMessage(null);
    console.log("Starting photo upload for file:", file.name, file.size);
    
    try {
      let fileToUpload = file;

      // Only compress if the file is larger than 100KB
      if (file.size > 100 * 1024) {
        console.log("Compressing image...");
        const options = {
          maxSizeMB: 0.05, 
          maxWidthOrHeight: 400, 
          useWebWorker: false, // Sometimes workers can hang in restricted environments
          initialQuality: 0.4,
          maxIteration: 3
        };
        fileToUpload = await imageCompression(file, options);
        console.log("Compression complete. New size:", fileToUpload.size);
      } else {
        console.log("File is small enough, skipping compression.");
      }

      setCompressing(false);
      
      console.log("Uploading to Storage...");
      const photoURL = await uploadFile(fileToUpload, `profiles/${profile.uid}`, (progress) => {
        setUploadProgress(Math.round(progress));
      });
      
      if (photoURL) {
        console.log("Upload successful, updating profile...");
        await updateProfileDetails({ photoURL });
        setMessage({ type: 'success', text: 'Profile photo updated!' });
      } else {
        throw new Error("No URL returned from upload");
      }
    } catch (error: any) {
      console.error("Photo upload error stack:", error);
      setMessage({ type: 'error', text: 'Upload failed. Please try a different photo.' });
      setLocalPreview(null);
    } finally {
      console.log("Cleanup upload states");
      setUploading(false);
      setCompressing(false);
      setUploadProgress(0);
      URL.revokeObjectURL(objectUrl);
    }
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    setMessage(null);
    try {
      await updateProfileDetails(details);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setShowConfirmSave(false);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to update profile.' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      setPassMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }
    if (passwords.new.length < 6) {
      setPassMessage({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }

    setPasswordLoading(true);
    setPassMessage(null);
    try {
      await updateUserPassword(passwords.new);
      setPassMessage({ type: 'success', text: 'Password changed successfully!' });
      setPasswords({ new: '', confirm: '' });
    } catch (error: any) {
      setPassMessage({ type: 'error', text: error.message || 'Failed to change password.' });
    } finally {
      setPasswordLoading(false);
    }
  };

  const changeCount = profile?.passwordChangeCount || 0;
  const isLocked = profile?.passwordChangeLocked;

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20">
      <header>
        <h1 className="text-3xl font-display font-bold text-slate-900">Account Settings</h1>
        <p className="text-slate-500 font-light">Manage your personal information and security.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Profile Details */}
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <User className="h-5 w-5 text-maroon" />
              Personal Details
            </h2>

            {/* Photo Upload Section */}
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="relative group">
                <div className="h-28 w-28 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 overflow-hidden border-4 border-white shadow-xl">
                  {localPreview ? (
                    <img src={localPreview} alt="Preview" className="h-full w-full object-cover" />
                  ) : profile?.photoURL ? (
                    <img src={profile.photoURL} alt={profile.displayName} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <User className="h-12 w-12" />
                  )}
                  {uploading && (
                    <div className="absolute inset-0 bg-slate-900/60 flex flex-col items-center justify-center p-4">
                      <Loader2 className="h-8 w-8 text-white animate-spin mb-2" />
                      <span className="text-[10px] font-bold text-white uppercase tracking-widest text-center leading-tight">
                        {compressing ? 'Shrinking...' : `${uploadProgress}%`}
                      </span>
                      <div className="w-full h-1 bg-white/20 rounded-full mt-2 overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: compressing ? '20%' : `${uploadProgress}%` }}
                          className="h-full bg-white transition-all"
                        />
                      </div>
                    </div>
                  )}
                </div>
                <label className="absolute bottom-0 right-0 p-2 bg-maroon text-white rounded-full shadow-lg cursor-pointer hover:bg-maroon-dark transition-all hover:scale-110 active:scale-95">
                  <Camera className="h-4 w-4" />
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    disabled={uploading}
                  />
                </label>
              </div>
              <div className="text-center">
                <p className="text-xs font-bold text-slate-900 mb-1">Profile Photo</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest leading-relaxed">JPG or PNG. Max 5MB.</p>
              </div>
            </div>

            {message && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "p-4 rounded-2xl flex items-center gap-3 text-sm",
                  message.type === 'success' ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                )}
              >
                {message.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
                {message.text}
              </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                <input 
                  className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-maroon/20"
                  value={details.displayName}
                  onChange={e => setDetails({...details, displayName: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contact Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                  <input 
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-maroon/20"
                    placeholder="09xx xxx xxxx"
                    value={details.contactNumber}
                    onChange={e => setDetails({...details, contactNumber: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Address</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                  <input 
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-maroon/20"
                    placeholder="Barangay, City, Province"
                    value={details.address}
                    onChange={e => setDetails({...details, address: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Gender</label>
                <select 
                  className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-maroon/20"
                  value={details.gender}
                  onChange={e => setDetails({...details, gender: e.target.value as any})}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="pt-4">
              {!showConfirmSave ? (
                <button 
                  onClick={() => setShowConfirmSave(true)}
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-lg shadow-slate-900/10 hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Update Details
                </button>
              ) : (
                <div className="flex gap-2">
                  <button 
                    onClick={() => setShowConfirmSave(false)}
                    className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleUpdateProfile}
                    disabled={loading}
                    className="flex-[2] py-4 bg-maroon text-white rounded-2xl font-bold hover:bg-maroon-dark transition-all flex items-center justify-center gap-2 shadow-lg shadow-maroon/20"
                  >
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                    Confirm Save Changes
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* Social connections or other info can go here */}
        </div>

        {/* Security / Password */}
        <div className="space-y-8">
          <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Lock className="h-5 w-5 text-maroon" />
              Security
            </h2>

            {isLocked ? (
              <div className="p-4 bg-red-50 text-red-700 rounded-2xl border border-red-100 space-y-2">
                <div className="flex items-center gap-2 font-bold uppercase tracking-widest text-[10px]">
                  <ShieldAlert className="h-4 w-4" />
                  Security Locked
                </div>
                <p className="text-xs leading-relaxed">You have reached the limit of 5 password changes. Please contact the church office or a Super Admin to assist with further updates.</p>
              </div>
            ) : (
              <>
                {changeCount >= 3 && (
                  <div className="p-4 bg-amber-50 text-amber-700 rounded-2xl border border-amber-100 space-y-1">
                    <div className="flex items-center gap-2 font-bold uppercase tracking-widest text-[10px]">
                      <AlertTriangle className="h-4 w-4" />
                      Notice
                    </div>
                    <p className="text-xs">You have modified your password {changeCount}/5 times. Further changes will require admin intervention.</p>
                  </div>
                )}

                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  {passMessage && (
                    <div className={cn(
                      "p-3 rounded-xl text-xs",
                      passMessage.type === 'success' ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                    )}>
                      {passMessage.text}
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">New Password</label>
                    <input 
                      type="password"
                      required
                      className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-maroon/20"
                      value={passwords.new}
                      onChange={e => setPasswords({...passwords, new: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirm New Password</label>
                    <input 
                      type="password"
                      required
                      className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-maroon/20"
                      value={passwords.confirm}
                      onChange={e => setPasswords({...passwords, confirm: e.target.value})}
                    />
                  </div>
                  <button 
                    type="submit"
                    disabled={passwordLoading}
                    className="w-full py-4 bg-slate-100 text-slate-900 rounded-2xl font-bold hover:bg-slate-200 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {passwordLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Lock className="h-4 w-4" />}
                    Update Password
                  </button>
                </form>
              </>
            )}
          </section>

          <div className="p-8 bg-slate-900 text-white rounded-[2.5rem] shadow-xl">
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-maroon" />
              Why complete profile?
            </h3>
            <ul className="text-xs space-y-3 font-light text-slate-300">
              <li className="flex gap-2">
                <span className="text-maroon">•</span>
                Helps your church family reach out to you.
              </li>
              <li className="flex gap-2">
                <span className="text-maroon">•</span>
                Needed for official membership records.
              </li>
              <li className="flex gap-2">
                <span className="text-maroon">•</span>
                Safe and secure data storage.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
