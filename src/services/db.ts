import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs, 
  addDoc, 
  updateDoc, 
  setDoc,
  doc, 
  deleteDoc,
  serverTimestamp,
  getDoc,
  arrayUnion,
  increment
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import { db, storage } from '../firebase/config';
import { Sermon, ChurchEvent, Announcement, PrayerRequest, GalleryItem, GalleryAlbum, UserProfile, UserRole, Ministry, MembershipInquiry, MinistryDetail, MinistryEditDraft, MinistryEditorRequest, SystemSettings, BlogPost, PrayerRequest as PrayerRequestType, PrayerComment, BlogComment, SermonComment, WeeklyActivity, DirectMessage, ChatConversation } from '../types';

// System Settings
// ... (previous content)
// (I will use multi_edit or just add at the end)
// Adding at the end for simplicity in this turn
export const getSystemSettings = async () => {
  if (!db) return null;
  const docRef = doc(db, 'settings', 'general');
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as SystemSettings;
  }
  return null;
};

export const updateSystemSettings = async (updates: Partial<SystemSettings>) => {
  if (!db) return null;
  const docRef = doc(db, 'settings', 'general');
  return await setDoc(docRef, {
    ...updates,
    lastUpdated: serverTimestamp()
  }, { merge: true });
};

// Sermons
export const getSermons = async (limitCount = 10) => {
  if (!db) return [];
  const q = query(collection(db, 'sermons'), orderBy('date', 'desc'), limit(limitCount));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Sermon[];
};

export const addSermonComment = async (sermonId: string, comment: Omit<SermonComment, 'id' | 'createdAt'>) => {
  if (!db) return null;
  return await addDoc(collection(db, 'sermons', sermonId, 'comments'), {
    ...comment,
    createdAt: serverTimestamp()
  });
};

export const getSermonComments = async (sermonId: string) => {
  if (!db) return [];
  const q = query(collection(db, 'sermons', sermonId, 'comments'), orderBy('createdAt', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as SermonComment[];
};

export const addSermon = async (sermon: Omit<Sermon, 'id'>) => {
  if (!db) return null;
  return await addDoc(collection(db, 'sermons'), {
    ...sermon,
    createdAt: serverTimestamp()
  });
};

export const getSermon = async (id: string) => {
  if (!db) return null;
  const docRef = doc(db, 'sermons', id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Sermon;
  }
  return null;
};

// Events
export const getEvents = async () => {
  if (!db) return [];
  const q = query(collection(db, 'events'), orderBy('date', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ChurchEvent[];
};

export const getEvent = async (idOrSlug: string) => {
  if (!db) return null;
  // Try by ID first
  try {
    const docRef = doc(db, 'events', idOrSlug);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as ChurchEvent;
    }
  } catch (e) {
    // Proceed to slug check
  }

  // Try by slug
  const q = query(collection(db, 'events'), where('slug', '==', idOrSlug), limit(1));
  const snapshot = await getDocs(q);
  if (!snapshot.empty) {
    const d = snapshot.docs[0];
    return { id: d.id, ...d.data() } as ChurchEvent;
  }
  return null;
};

export const addEvent = async (event: Omit<ChurchEvent, 'id'>) => {
  if (!db) return null;
  return await addDoc(collection(db, 'events'), {
    ...event,
    createdAt: serverTimestamp()
  });
};

export const updateEvent = async (id: string, updates: Partial<ChurchEvent>) => {
  if (!db) return null;
  const docRef = doc(db, 'events', id);
  return await updateDoc(docRef, {
    ...updates,
    updatedAt: serverTimestamp()
  });
};

export const deleteEvent = async (id: string) => {
  if (!db) throw new Error('Firestore is not initialized');
  if (!id) throw new Error('No event ID provided');
  try {
    const docRef = doc(db, 'events', id);
    return await deleteDoc(docRef);
  } catch (error: any) {
    console.error('Error in deleteEvent service:', error);
    throw error;
  }
};

// Announcements
export const getAnnouncements = async (limitCount = 5) => {
  if (!db) return [];
  const q = query(collection(db, 'announcements'), orderBy('date', 'desc'), limit(limitCount));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Announcement[];
};

export const addAnnouncement = async (announcement: Omit<Announcement, 'id'>) => {
  if (!db) return null;
  return await addDoc(collection(db, 'announcements'), {
    ...announcement,
    date: serverTimestamp()
  });
};

export const updateAnnouncement = async (id: string, updates: Partial<Announcement>) => {
  if (!db) return null;
  const docRef = doc(db, 'announcements', id);
  return await updateDoc(docRef, updates);
};

export const deleteAnnouncement = async (id: string) => {
  if (!db) return null;
  const docRef = doc(db, 'announcements', id);
  return await deleteDoc(docRef);
};

// Prayer Requests
export const getPrayerRequests = async (status?: string, includePrivate = false) => {
  if (!db) return [];
  
  let q = query(collection(db, 'prayer_requests'), orderBy('date', 'desc'));
  
  if (status) {
    q = query(collection(db, 'prayer_requests'), where('status', '==', status), orderBy('date', 'desc'));
  }
  
  const snapshot = await getDocs(q);
  const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as PrayerRequest[];
  
  if (includePrivate) return data;
  
  // For non-private view, include anything that is NOT explicitly 'private'
  // (handles legacy data that doesn't have the visibility field)
  return data.filter(p => p.visibility !== 'private');
};

export const addPrayerRequest = async (request: Omit<PrayerRequest, 'id' | 'status' | 'date' | 'prayCount' | 'prayers'>) => {
  if (!db) return null;
  // Firestore doesn't allow undefined values, convert to null or remove
  const cleanRequest = Object.entries(request).reduce((acc: any, [key, value]) => {
    if (value !== undefined) acc[key] = value;
    return acc;
  }, {});

  return await addDoc(collection(db, 'prayer_requests'), {
    ...cleanRequest,
    status: 'pending',
    date: serverTimestamp(),
    prayCount: 0,
    prayers: []
  });
};

const handleFirestoreError = (error: unknown, operation: string, path: string) => {
  console.error(`Firestore Error [${operation}] on ${path}:`, error);
  throw error;
};

export const prayForRequest = async (requestId: string, userId: string) => {
  if (!db) return null;
  const requestRef = doc(db, 'prayer_requests', requestId);
  try {
    return await updateDoc(requestRef, {
      prayers: arrayUnion(userId),
      prayCount: increment(1)
    });
  } catch (error) {
    handleFirestoreError(error, 'UPDATE', `prayer_requests/${requestId}`);
  }
};

export const addPrayerComment = async (requestId: string, comment: Omit<PrayerComment, 'id' | 'createdAt'>) => {
  if (!db) return null;
  return await addDoc(collection(db, 'prayer_requests', requestId, 'comments'), {
    ...comment,
    createdAt: serverTimestamp()
  });
};

export const getPrayerComments = async (requestId: string) => {
  if (!db) return [];
  const q = query(collection(db, 'prayer_requests', requestId, 'comments'), orderBy('createdAt', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as PrayerComment[];
};

// Gallery
export const getGalleryAlbums = async () => {
  if (!db) return [];
  const q = query(collection(db, 'gallery_albums'), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as GalleryAlbum[];
};

export const addGalleryAlbum = async (album: Omit<GalleryAlbum, 'id' | 'createdAt' | 'updatedAt'>) => {
  if (!db) return null;
  return await addDoc(collection(db, 'gallery_albums'), {
    ...album,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
};

export const updateGalleryAlbum = async (id: string, updates: Partial<GalleryAlbum>) => {
  if (!db) return null;
  const docRef = doc(db, 'gallery_albums', id);
  return await updateDoc(docRef, {
    ...updates,
    updatedAt: serverTimestamp()
  });
};

export const deleteGalleryAlbum = async (id: string) => {
  if (!db) return null;
  const docRef = doc(db, 'gallery_albums', id);
  return await deleteDoc(docRef);
};

export const getGalleryItems = async (albumId?: string) => {
  if (!db) return [];
  let q = query(collection(db, 'gallery'), orderBy('createdAt', 'desc'));
  if (albumId) {
    q = query(collection(db, 'gallery'), where('albumId', '==', albumId), orderBy('createdAt', 'desc'));
  }
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as GalleryItem[];
};

export const addGalleryItem = async (item: Omit<GalleryItem, 'id' | 'createdAt'>) => {
  if (!db) return null;
  return await addDoc(collection(db, 'gallery'), {
    ...item,
    createdAt: serverTimestamp()
  });
};

export const deleteGalleryItem = async (id: string) => {
  if (!db) return null;
  const docRef = doc(db, 'gallery', id);
  return await deleteDoc(docRef);
};

// Media Upload
// Bypassing Firebase Storage and using Base64 in Firestore to avoid "Blaze Plan" requirements
export const uploadFile = async (file: File | Blob, path: string, onProgress?: (progress: number) => void) => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onloadstart = () => {
      if (onProgress) onProgress(10);
    };

    reader.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        const percent = Math.round((event.loaded / event.total) * 100);
        onProgress(percent);
      }
    };

    reader.onload = () => {
      if (onProgress) onProgress(100);
      resolve(reader.result as string);
    };

    reader.onerror = (error) => {
      console.error("FileReader error:", error);
      reject(new Error("Failed to read file for database storage."));
    };

    reader.readAsDataURL(file);
  });
};

// User Management
export const getUsers = async () => {
  if (!db) return [];
  const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() })) as UserProfile[];
};

export const getLeaders = async () => {
  if (!db) return [];
  // Fetch users with leadership titles
  const q = query(
    collection(db, 'users'), 
    where('title', 'in', ['Pastor', 'Elder', 'Deacon', 'Deaconess']),
    limit(20)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() })) as UserProfile[];
};

export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>) => {
  if (!db) return null;
  const userRef = doc(db, 'users', userId);
  return await updateDoc(userRef, updates);
};

export const deleteUser = async (userId: string) => {
  if (!db) throw new Error('Firestore is not initialized');
  if (!userId) throw new Error('No user ID provided');
  try {
    const userRef = doc(db, 'users', userId);
    return await deleteDoc(userRef);
  } catch (error: any) {
    console.error('Error in deleteUser service:', error);
    throw error;
  }
};

export const applyForMembership = async (userId: string) => {
  return await updateUserProfile(userId, { membershipStatus: 'applicant' });
};

// Membership Inquiries
export const getMembershipInquiries = async () => {
  if (!db) return [];
  const q = query(collection(db, 'membership_inquiries'), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as MembershipInquiry[];
};

export const updateMembershipInquiryStatus = async (inquiryId: string, status: MembershipInquiry['status']) => {
  if (!db) return null;
  const inquiryRef = doc(db, 'membership_inquiries', inquiryId);
  return await updateDoc(inquiryRef, { status });
};

export const deleteMembershipInquiry = async (inquiryId: string) => {
  if (!db) return null;
  const inquiryRef = doc(db, 'membership_inquiries', inquiryId);
  return await deleteDoc(inquiryRef);
};

// Legacy support for existing calls
export const updateUserRole = async (userId: string, role: UserRole, ministry?: Ministry, isCouncilMember?: boolean) => {
  const updates: any = { role };
  if (ministry !== undefined) updates.ministry = ministry;
  if (isCouncilMember !== undefined) updates.isCouncilMember = isCouncilMember;
  return await updateUserProfile(userId, updates);
};

// Ministry Management
export const getMinistryDetails = async (ministryId: string) => {
  if (!db) return null;
  const docRef = doc(db, 'ministry_details', ministryId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as MinistryDetail;
  }
  return null;
};

export const updateMinistryDetails = async (ministryId: string, updates: Partial<MinistryDetail>) => {
  if (!db) return null;
  const docRef = doc(db, 'ministry_details', ministryId);
  return await setDoc(docRef, {
    ...updates,
    lastUpdated: serverTimestamp()
  }, { merge: true });
};

export const submitMinistryEdit = async (draft: Omit<MinistryEditDraft, 'id' | 'status' | 'submittedAt'>) => {
  if (!db) return null;
  return await addDoc(collection(db, 'ministry_edits'), {
    ...draft,
    status: 'pending',
    submittedAt: serverTimestamp()
  });
};

export const getPendingMinistryEdits = async () => {
  if (!db) return [];
  const q = query(collection(db, 'ministry_edits'), where('status', '==', 'pending'), orderBy('submittedAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as MinistryEditDraft[];
};

export const approveMinistryEdit = async (editId: string, reviewerId: string) => {
  if (!db) return null;
  const editRef = doc(db, 'ministry_edits', editId);
  const editSnap = await getDoc(editRef);
  if (!editSnap.exists()) return null;
  
  const editData = editSnap.data() as MinistryEditDraft;
  
  // Update main details
  const detailRef = doc(db, 'ministry_details', editData.ministryId);
  await updateDoc(detailRef, {
    content: editData.content,
    description: editData.description,
    imageUrl: editData.imageUrl || null,
    meetingTime: editData.meetingTime || null,
    location: editData.location || null,
    lastUpdated: serverTimestamp(),
    updatedBy: editData.submittedByName
  });
  
  // Mark edit as approved
  return await updateDoc(editRef, {
    status: 'approved',
    reviewedBy: reviewerId,
    reviewedAt: serverTimestamp()
  });
};

export const rejectMinistryEdit = async (editId: string, reviewerId: string) => {
  if (!db) return null;
  const editRef = doc(db, 'ministry_edits', editId);
  return await updateDoc(editRef, {
    status: 'rejected',
    reviewedBy: reviewerId,
    reviewedAt: serverTimestamp()
  });
};

export const requestMinistryEditorAccess = async (userId: string, userName: string, userEmail: string, ministryId: string) => {
  if (!db) return null;
  return await addDoc(collection(db, 'ministry_editor_requests'), {
    userId,
    userName,
    userEmail,
    ministryId,
    status: 'pending',
    requestedAt: serverTimestamp()
  });
};

export const getMinistryEditorRequests = async () => {
  if (!db) return [];
  const q = query(collection(db, 'ministry_editor_requests'), where('status', '==', 'pending'), orderBy('requestedAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as MinistryEditorRequest[];
};

export const approveEditorRequest = async (requestId: string, userId: string) => {
  if (!db) return null;
  const requestRef = doc(db, 'ministry_editor_requests', requestId);
  
  // Update user profile
  await updateUserProfile(userId, { isMinistryEditor: true });
  
  // Mark request as approved
  return await updateDoc(requestRef, {
    status: 'approved'
  });
};

export const rejectEditorRequest = async (requestId: string) => {
  if (!db) return null;
  const requestRef = doc(db, 'ministry_editor_requests', requestId);
  return await updateDoc(requestRef, {
    status: 'rejected'
  });
};

// Dashboard Activity
export const getRecentActivity = async () => {
  if (!db) return [];
  
  const [users, sermons, prayers, inquiries] = await Promise.all([
    getDocs(query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(5))),
    getDocs(query(collection(db, 'sermons'), orderBy('date', 'desc'), limit(5))),
    getDocs(query(collection(db, 'prayer_requests'), orderBy('date', 'desc'), limit(5))),
    getDocs(query(collection(db, 'membership_inquiries'), orderBy('createdAt', 'desc'), limit(5)))
  ]);

  const activities = [
    ...users.docs.map(d => ({ type: 'member', id: d.id, text: `New member joined: ${d.data().displayName}`, date: d.data().createdAt })),
    ...sermons.docs.map(d => ({ type: 'sermon', id: d.id, text: `New sermon added: ${d.data().title}`, date: d.data().date })),
    ...prayers.docs.map(d => ({ type: 'prayer', id: d.id, text: `New prayer request from ${d.data().userName}`, date: d.data().date })),
    ...inquiries.docs.map(d => ({ type: 'inquiry', id: d.id, text: `New membership inquiry from ${d.data().fullName}`, date: d.data().createdAt }))
  ];

  return activities
    .filter(a => a.date)
    .sort((a, b) => b.date.toMillis() - a.date.toMillis())
    .slice(0, 10);
};

// Blogs
export const getBlogPosts = async (status?: BlogPost['status'], limitCount = 10) => {
  if (!db) return [];
  let q = query(collection(db, 'blogs'), orderBy('createdAt', 'desc'), limit(limitCount));
  if (status) {
    q = query(collection(db, 'blogs'), where('status', '==', status), orderBy('createdAt', 'desc'), limit(limitCount));
  }
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as BlogPost[];
};

export const getBlogPost = async (idOrSlug: string) => {
  if (!db) return null;
  // Try by ID first
  try {
    const docRef = doc(db, 'blogs', idOrSlug);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as BlogPost;
    }
  } catch (e) {
    // ID might not be valid format, proceed to slug check
  }
  
  // Try by slug
  const q = query(collection(db, 'blogs'), where('slug', '==', idOrSlug), limit(1));
  const snapshot = await getDocs(q);
  if (!snapshot.empty) {
    const d = snapshot.docs[0];
    return { id: d.id, ...d.data() } as BlogPost;
  }
  return null;
};

export const addBlogComment = async (postId: string, comment: Omit<BlogComment, 'id' | 'createdAt'>) => {
  if (!db) return null;
  return await addDoc(collection(db, 'blogs', postId, 'comments'), {
    ...comment,
    createdAt: serverTimestamp()
  });
};

export const getBlogComments = async (postId: string) => {
  if (!db) return [];
  const q = query(collection(db, 'blogs', postId, 'comments'), orderBy('createdAt', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as BlogComment[];
};

export const addBlogPost = async (post: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>) => {
  if (!db) return null;
  return await addDoc(collection(db, 'blogs'), {
    ...post,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
};

export const updateBlogPost = async (id: string, updates: Partial<BlogPost>) => {
  if (!db) return null;
  const docRef = doc(db, 'blogs', id);
  return await updateDoc(docRef, {
    ...updates,
    updatedAt: serverTimestamp()
  });
};

export const approveBlogPost = async (id: string) => {
  return await updateBlogPost(id, { 
    status: 'published', 
    publishedAt: serverTimestamp() 
  });
};

export const deleteBlogPost = async (id: string) => {
  if (!db) return null;
  const docRef = doc(db, 'blogs', id);
  return await deleteDoc(docRef);
};

// Weekly Activities
export const getWeeklyActivities = async () => {
  if (!db) return [];
  const q = query(collection(db, 'weekly_activities'), orderBy('order', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as WeeklyActivity[];
};

export const addWeeklyActivity = async (activity: Omit<WeeklyActivity, 'id'>) => {
  if (!db) return null;
  return await addDoc(collection(db, 'weekly_activities'), activity);
};

export const updateWeeklyActivity = async (id: string, updates: Partial<WeeklyActivity>) => {
  if (!db) return null;
  const docRef = doc(db, 'weekly_activities', id);
  return await updateDoc(docRef, updates);
};

export const deleteWeeklyActivity = async (id: string) => {
  if (!db) return null;
  const docRef = doc(db, 'weekly_activities', id);
  return await deleteDoc(docRef);
};

// Messaging System
export const sendDirectMessage = async (msg: Omit<DirectMessage, 'id' | 'createdAt' | 'isRead'>) => {
  if (!db) return null;

  // 1. Add message
  const msgDoc = await addDoc(collection(db, 'direct_messages'), {
    ...msg,
    createdAt: serverTimestamp(),
    isRead: false
  });

  // 2. Update/Create conversation index for faster listing
  const conversationId = [msg.senderId, msg.receiverId].sort().join('_');
  await setDoc(doc(db, 'conversations', conversationId), {
    participantIds: [msg.senderId, msg.receiverId],
    participantNames: [msg.senderName, msg.receiverName],
    lastMessage: msg.text,
    lastMessageAt: serverTimestamp(),
    lastSenderId: msg.senderId
  }, { merge: true });

  return msgDoc;
};

export const getConversations = async (userId: string) => {
  if (!db) return [];
  const q = query(
    collection(db, 'conversations'),
    where('participantIds', 'array-contains', userId),
    orderBy('lastMessageAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ChatConversation[];
};

export const getChatMessages = async (userId: string, otherUserId: string) => {
  if (!db) return [];
  const q = query(
    collection(db, 'direct_messages'),
    where('senderId', 'in', [userId, otherUserId]),
    orderBy('createdAt', 'asc')
  );
  
  const snapshot = await getDocs(q);
  // Manual filter for the specific pair (Firestore limitation for cross-user in/orderBy)
  return snapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .filter((m: any) => 
      (m.senderId === userId && m.receiverId === otherUserId) || 
      (m.senderId === otherUserId && m.receiverId === userId)
    ) as DirectMessage[];
};
