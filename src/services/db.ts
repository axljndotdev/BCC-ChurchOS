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
  increment,
  Timestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import { db, storage, auth } from '../firebase/config';
import { Sermon, ChurchEvent, Announcement, PrayerRequest, GalleryItem, GalleryAlbum, UserProfile, UserRole, Ministry, MembershipInquiry, MinistryDetail, MinistryEditDraft, MinistryEditorRequest, SystemSettings, BlogPost, PrayerRequest as PrayerRequestType, PrayerComment, BlogComment, SermonComment, WeeklyActivity, DirectMessage, ChatConversation, ResourceItem } from '../types';

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

export const getUpcomingEvents = async () => {
  if (!db) return [];
  const now = Timestamp.now();
  const q = query(
    collection(db, 'events'), 
    where('date', '>=', now),
    orderBy('date', 'asc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ChurchEvent[];
};

export const getEventsByYear = async (year: number) => {
  if (!db) return [];
  const startOfYear = Timestamp.fromDate(new Date(year, 0, 1));
  const endOfYear = Timestamp.fromDate(new Date(year, 11, 31, 23, 59, 59));
  
  const q = query(
    collection(db, 'events'),
    where('date', '>=', startOfYear),
    where('date', '<=', endOfYear),
    orderBy('date', 'asc')
  );
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

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

const handleFirestoreError = (error: unknown, operationType: OperationType | string, path: string | null) => {
  let opType: OperationType = OperationType.WRITE;
  const opStr = String(operationType).toLowerCase();
  if (opStr.includes('create') || opStr.includes('add')) opType = OperationType.CREATE;
  else if (opStr.includes('update') || opStr.includes('edit')) opType = OperationType.UPDATE;
  else if (opStr.includes('delete') || opStr.includes('remove')) opType = OperationType.DELETE;
  else if (opStr.includes('get') || opStr.includes('read')) opType = OperationType.GET;
  else if (opStr.includes('list') || opStr.includes('query')) opType = OperationType.LIST;

  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid || null,
      email: auth?.currentUser?.email || null,
      emailVerified: auth?.currentUser?.emailVerified || null,
      isAnonymous: auth?.currentUser?.isAnonymous || null,
      tenantId: auth?.currentUser?.tenantId || null,
      providerInfo: auth?.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType: opType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
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

export const getFeaturedAlbums = async () => {
  if (!db) return [];
  const q = query(
    collection(db, 'gallery_albums'), 
    where('isFeatured', '==', true),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  const albums = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as GalleryAlbum[];
  
  if (albums.length === 0) {
    const all = await getGalleryAlbums();
    const bcc = all.find(a => a.name.toLowerCase().includes('bcc building'));
    if (bcc) return [bcc];
  }
  
  return albums;
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

  const fallbacks: Record<string, any> = {
    'superbook-kids-sbk': {
      id: 'superbook-kids-sbk',
      name: 'Superbook Kids (SBK)',
      description: 'Nurturing the youngest hearts in the love of Jesus through fun, biblically-grounded teaching and activities.',
      content: `### Welcome to Superbook Kids (SBK)

At Bethesda Community Church, we believe that children are not just the future of the church—they are a vital part of the church today. Superbook Kids (SBK) is dedicated to partnering with parents to lay a strong spiritual foundation in the lives of children aged 2 to 12.

#### Our Mission & Vision
- **To Know God**: Introducing children to Jesus Christ in a personal, transformative way.
- **To Grow Together**: Fostering an atmosphere where kids can build healthy Christian friendships and memorize Scripture.
- **To Go Serve**: Teaching children how to share God's love with their friends, classmates, and family members.

#### What We Offer:
- **Interactive Bible Lessons**: Utilizing the exciting, state-of-the-art Superbook curriculum.
- **Praise & Worship**: High-energy, child-friendly music and dance.
- **Small Group Discussion**: Age-appropriate break-out groups for prayer, journaling, and memory verses.
- **Fun Activities**: Creative crafts, Bible games, and seasonal events.

*“Train up a child in the way he should go; even when he is old he will not depart from it.”* – Proverbs 22:6`,
      meetingTime: 'Sundays at 9:00 AM & 10:30 AM',
      location: 'Kids Sanctuary, BCC Campus',
      imageUrl: 'https://images.unsplash.com/photo-1489710437720-ebb67ec84dd2?auto=format&fit=crop&q=80&w=800',
      lastUpdated: null
    },
    'ignite-one-youth-fellowship': {
      id: 'ignite-one-youth-fellowship',
      name: 'Ignite One Youth Fellowship',
      description: 'A vibrant space for students to find their identity in Christ, build authentic friendships, and grow in faith.',
      content: `### Ignite One Youth Fellowship

Welcome to Ignite One, the youth ministry of Bethesda Community Church! We are a passionate, active community of high school and college students dedicated to living out our faith boldly.

#### Our Mission & Vision
- **Ignite Hearts**: Sparking a deep, authentic passion for Jesus Christ that drives everything we do.
- **Form One Body**: Breaking down barriers to form a supportive, unified brotherhood and sisterhood of young believers.
- **Go Unleashed**: Equipping the next generation to stand firm in their biblical worldview and transform their campuses.

#### Weekly Gatherings:
- **Youth Nights**: Inspiring messages, raw acoustic worship, and small-group discussions.
- **Campus Huddles**: Mid-week prayer and scripture huddles held directly in local schools and communities.
- **Adventures & Retreats**: Summer camps, team-building sports festivals, and annual youth conferences.

*“Don’t let anyone look down on you because you are young, but set an example for the believers in speech, in conduct, in love, in faith and in purity.”* – 1 Timothy 4:12`,
      meetingTime: 'Saturdays at 4:00 PM',
      location: 'Main Sanctuary / Youth Hall',
      imageUrl: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&q=80&w=800',
      lastUpdated: null
    },
    'yah-young-adults-huddle': {
      id: 'yah-young-adults-huddle',
      name: 'YAH (Young Adults Huddle)',
      description: 'Connecting young professionals and university students as they navigate life and faith together.',
      content: `### YAH: Young Adults Huddle

Navigating the transition from student life into the professional world can be challenging. The Young Adults Huddle (YAH) at BCC is a vibrant community of university students, single professionals, and young married couples (ages 18–35) seeking to navigate life's big questions in the light of God's Word.

#### Our Mission & Vision
- **Cultivate Purpose**: Aligning our career ambitions, relationships, and lifestyles with the sovereign calling of God.
- **Foster Community**: Sharing honest conversations, challenges, and encouragement in a safe, non-judgmental environment.
- **Impact Society**: Expressing the love of Jesus through high-impact professional ethics, local service, and marketplace evangelism.

#### What We Do:
- **Bi-Weekly Huddles**: Topic-focused discussions exploring faith, relationships, work ethic, and finances.
- **Social Hangouts**: Cafe runs, sports outings, hiking, and casual dinners to build long-lasting friendships.
- **Service Outlets**: Organizing disaster relief, community feeding programs, and campus outreaches.

*“Commit to the Lord whatever you do, and he will establish your plans.”* – Proverbs 16:3`,
      meetingTime: 'Fridays at 7:00 PM',
      location: 'Bethesda Cafe & Fellowship Room',
      imageUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=800',
      lastUpdated: null
    },
    'young-at-hearts': {
      id: 'young-at-hearts',
      name: 'Young at Hearts',
      description: 'A community for our seniors to fellowship, share wisdom, and continue growing in their walk with God.',
      content: `### Young at Hearts (Seniors Ministry)

Age is just a number! The Young at Hearts ministry is a warm, loving fellowship of seniors (aged 60 and above) at Bethesda Community Church. We celebrate the legacy of faith and are dedicated to continuing our walk with God with strength, joy, and purpose.

#### Our Mission & Vision
- **Abundant Fellowship**: Ensuring no senior feels isolated, but rather fully integrated, loved, and active.
- **Generational Wisdom**: Providing opportunities to mentor, pray for, and guide the younger generations of BCC.
- **Continuous Growth**: Studying God's Word deeply and growing in faith during our golden years.

#### Activities Include:
- **Monthly Fellowships**: Worship, classic hymns, health talks, scripture study, and a delicious shared lunch.
- **Prayer Ministry**: Interceding for our church family, leaders, and the nation.
- **Hospital & Visitation**: Visiting homebound or sick members to bring encouragement, communion, and prayer.

*“They will still bear fruit in old age, they will stay fresh and green...”* – Psalm 92:14`,
      meetingTime: 'First Thursday of each Month at 10:00 AM',
      location: 'Fellowship Hall, BCC Campus',
      imageUrl: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=800',
      lastUpdated: null
    },
    'the-exemplary-husband-sherpas': {
      id: 'the-exemplary-husband-sherpas',
      name: 'The Exemplary Husband (Sherpas)',
      description: 'Equipping men to lead their families with Christ-like love and integrity.',
      content: `### The Exemplary Husband (Sherpas Men's Ministry)

In a world of shifting values, God calls men to stand as pillars of spiritual strength, integrity, and servant-leadership. The Sherpas Men’s Ministry is dedicated to helping husbands, fathers, and single men climb to new spiritual heights in their personal walk, marriages, and families.

#### Our Mission & Vision
- **Spiritual Mentorship**: Walking together to cultivate self-discipline, purity, and solid biblical knowledge.
- **Healthy Marriages**: Modeling Christ-like love by loving, cherishing, and serving our wives selflessly.
- **Integrity in Leadership**: Being spiritual role models to our children and men of unquestionable integrity in our workplaces.

#### Our Gatherings:
- **Husbands study**: Going through "The Exemplary Husband" book and topical scripture studies.
- **Sherpas Breakfasts**: Monthly early-morning fellowships with hearty food, strong coffee, and challenging messages.
- **Outdoor Projects**: Using practical skills to build, maintain, and serve church properties or help families in need.

*“As iron sharpens iron, so one person sharpens another.”* – Proverbs 27:17`,
      meetingTime: 'Saturdays at 6:30 AM (Bi-weekly)',
      location: 'BCC Annex Room / Conference Room',
      imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800',
      lastUpdated: null
    },
    'circle-of-women': {
      id: 'circle-of-women',
      name: 'Circle of Women',
      description: 'Empowering women of all ages to grow in their spiritual journey and support one another.',
      content: `### Circle of Women

Welcome to the Circle of Women, a beautiful and safe sanctuary for women of all stages of life—single, married, mothers, and grandmothers—to unite under the banner of God's love and grace.

#### Our Mission & Vision
- **Spiritual Nourishment**: Diving deep into biblical study to discover our true identity, value, and calling in Christ.
- **Grace-Filled Support**: Holding one another up in prayer, celebrating milestones, and weeping together in times of trial.
- **Community Transformation**: Being conduits of God's healing love, hospitality, and compassion in our homes and local neighborhoods.

#### Our Gatherings:
- **Bible & Book Studies**: Studies designed specifically for the unique spiritual, emotional, and relational needs of women.
- **Creative Workshops**: Cooking, home management, and mental wellness seminars led by experienced professionals.
- **Devotional Huddles**: Small discipleship circles for intimate prayer and sharing.

*“She is clothed with strength and dignity; she can laugh at the days to come. She speaks with wisdom, and faithful instruction is on her tongue.”* – Proverbs 31:25-26`,
      meetingTime: 'Saturdays at 2:00 PM',
      location: 'Fellowship Hall / Online Room',
      imageUrl: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=800',
      lastUpdated: null
    },
    'harkel-music-team': {
      id: 'harkel-music-team',
      name: 'Harkel (Music Team)',
      description: 'Leading our community in worship through music, song, and creative expression.',
      content: `### Harkel: The Music Ministry

Worship is the overflow of a heart captivated by God. "Harkel", the music and worship team of Bethesda Community Church, is a team of passionate vocalists, musicians, and artists dedicated to leading our congregation into an authentic encounter with the living God.

#### Our Mission & Vision
- **Worship in Spirit & Truth**: Prioritizing a life of personal, daily worship over musical performance.
- **Musical Excellence**: Stewarding our musical gifts with diligence, practice, and professional mastery to glorify God.
- **Generational Sound**: Leading our congregation through a healthy, beautiful blend of modern worship anthems and deep, theological hymns.

#### How to Participate:
- **Auditions**: Annual or bi-annual vocal and instrumental evaluations for members who have completed the foundations class.
- **Worship nights**: Special extended praise, adoration, and intercession gatherings.
- **Weekly rehearsals**: Focused times of spiritual preparation, prayer, and technical rehearsals.

*“Sing to Him a new song; play skillfully, and shout for joy.”* – Psalm 33:3`,
      meetingTime: 'Fridays at 6:00 PM (Rehearsals) & Sundays',
      location: 'Main Sanctuary Stage',
      imageUrl: 'https://images.unsplash.com/photo-1514525253344-f814d074358a?auto=format&fit=crop&q=80&w=800',
      lastUpdated: null
    },
    'audio-video-av': {
      id: 'audio-video-av',
      name: 'Audio Video (AV)',
      description: 'Supporting our services and online presence through technical excellence in sound and visuals.',
      content: `### Audio Video (AV) & Tech Ministry

In a modern, digital age, the AV and Tech ministry plays a critical role in carrying the message of the Gospel beyond the physical walls of our church building. We operate behind the scenes with a heart of worship and technical precision.

#### Our Mission & Vision
- **Zero Distractions**: Striving for technical excellence in sound, lighting, and presentation so that nothing distracts from God's Word.
- **Global Ingress**: Broadcasting high-quality livestreams to reach homebound members and searchers around the world.
- **Creative Stewardship**: Producing beautiful graphics, lyric layouts, and video testimonies to inspire and engage.

#### Areas of Service:
- **FOH Sound Engineering**: Managing live audio, speaker mixes, and stage monitoring.
- **Visual Projection**: Laying out song lyrics, scripture readings, and video announcements.
- **Camera & Live Production**: Operating cameras and video switchers for streaming.
- **Lighting Design**: Setting the appropriate visual tone for our in-person assemblies.

*“Whatever you do, work at it with all your heart, as working for the Lord, not for human masters.”* – Colossians 3:23`,
      meetingTime: 'Rehearsals Friday 6:00 PM & Sundays',
      location: 'AV Control Booth, Main Sanctuary',
      imageUrl: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&q=80&w=800',
      lastUpdated: null
    },
    'discipleship-groups': {
      id: 'discipleship-groups',
      name: 'Life Groups',
      description: 'Small groups dedicated to studying God\'s Word, prayer, and mutual spiritual accountability for mature Christian living.',
      content: `### Welcome to Life Groups

Life Groups are the heartbeat of Bethesda Community Church. We believe that true spiritual transformation happens in the context of close, authentic relationships and intentional discipleship.

#### Why Join a Life Group?
- **Mutual Support**: Walk together with brothers and sisters in Christ through different seasons of life.
- **Deep Study**: Weekly discussions grounded in God's Word, study guides, and the Discipleship Journey Manual.
- **Spiritual Multiplication**: Learn how to follow Jesus and lead others to do the same.

#### What to Expect:
- **Weekly Meetings**: Usually 1 to 2 hours of catching up, discussing scriptures, and praying for one another.
- **Small size**: Usually 3 to 8 members of the same gender to encourage genuine trust, depth, and safety.

To join an existing group or explore how to start one, please reach out to our ministry leaders today!`,
      meetingTime: 'Various Days & Times',
      location: 'Homes & Online (Zoom/Meet)',
      imageUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=800',
      lastUpdated: null
    }
  };

  if (fallbacks[ministryId]) {
    return fallbacks[ministryId] as MinistryDetail;
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
  
  const fetchDocs = async (collName: string, dateField: string) => {
    try {
      const q = query(collection(db, collName), orderBy(dateField, 'desc'), limit(5));
      return await getDocs(q);
    } catch (error) {
      console.warn(`Could not fetch recent ${collName} for activity feed:`, error);
      return { docs: [] };
    }
  };

  const [users, sermons, prayers, inquiries] = await Promise.all([
    fetchDocs('users', 'createdAt'),
    fetchDocs('sermons', 'date'),
    fetchDocs('prayer_requests', 'date'),
    fetchDocs('membership_inquiries', 'createdAt')
  ]);

  const activities = [
    ...users.docs.map(d => ({ type: 'member', id: d.id, text: `New member joined: ${d.data().displayName}`, date: d.data().createdAt })),
    ...sermons.docs.map(d => ({ type: 'sermon', id: d.id, text: `New sermon added: ${d.data().title}`, date: d.data().date })),
    ...prayers.docs.map(d => ({ type: 'prayer', id: d.id, text: `New prayer request from ${d.data().userName}`, date: d.data().date })),
    ...inquiries.docs.map(d => ({ type: 'inquiry', id: d.id, text: `New membership inquiry from ${d.data().fullName}`, date: d.data().createdAt }))
  ];

  return activities
    .filter(a => a.date && typeof a.date.toMillis === 'function')
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

// Resources Management
export const getResources = async (isAuthenticated: boolean = !!auth?.currentUser) => {
  if (!db) return [];
  try {
    let q;
    if (isAuthenticated) {
      q = query(collection(db, 'resources'));
    } else {
      q = query(collection(db, 'resources'), where('category', '==', 'public'));
    }
    const snapshot = await getDocs(q);
    const items = snapshot.docs.map(doc => {
      const data = doc.data() as any;
      return { 
        id: doc.id, 
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : (data.createdAt ? new Date(data.createdAt) : new Date(0))
      };
    }) as ResourceItem[];
    
    // Sort in-memory to avoid requiring composite indexes
    return items.sort((a, b) => {
      const timeA = a.createdAt instanceof Date ? a.createdAt.getTime() : 0;
      const timeB = b.createdAt instanceof Date ? b.createdAt.getTime() : 0;
      return timeB - timeA;
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'resources');
    return [];
  }
};

export const addResource = async (resource: Omit<ResourceItem, 'id' | 'createdAt' | 'downloadCount'>) => {
  if (!db) return null;
  try {
    return await addDoc(collection(db, 'resources'), {
      ...resource,
      downloadCount: 0,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'resources');
  }
};

export const updateResource = async (id: string, updates: Partial<ResourceItem>) => {
  if (!db) return null;
  const docRef = doc(db, 'resources', id);
  try {
    return await updateDoc(docRef, {
      ...updates,
      lastUpdated: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `resources/${id}`);
  }
};

export const deleteResource = async (id: string) => {
  if (!db) return null;
  const docRef = doc(db, 'resources', id);
  try {
    return await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `resources/${id}`);
  }
};

export const incrementDownloadCount = async (id: string) => {
  if (!db) return null;
  const docRef = doc(db, 'resources', id);
  try {
    return await updateDoc(docRef, {
      downloadCount: increment(1)
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `resources/${id}`);
  }
};

