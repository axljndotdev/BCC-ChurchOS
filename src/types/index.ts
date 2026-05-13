export type UserRole = 'super_admin' | 'church_admin' | 'ministry_leader' | 'media' | 'member';
export type UserTitle = 'Pastor' | 'Elder' | 'Deacon' | 'Deaconess' | 'Member' | 'Guest';
export type UserStatus = 'pending' | 'active' | 'suspended';
export type MembershipStatus = 'visitor' | 'applicant' | 'official_member';

export type Ministry = 
  | 'Young at Hearts' 
  | 'YAH (Young Adults Huddle)' 
  | 'Ignite One Youth Fellowship' 
  | 'The Exemplary Husband (Sherpas)' 
  | 'Circle of Women' 
  | 'Superbook Kids (SBK)' 
  | 'Harkel (Music Team)' 
  | 'Audio Video (AV)';

export interface UserProfile {
  uid: string;
  email?: string;
  phoneNumber?: string;
  username?: string;
  displayName: string;
  photoURL?: string;
  role: UserRole[];
  title: UserTitle;
  status: UserStatus;
  membershipStatus: MembershipStatus;
  ministry?: Ministry;
  isCouncilMember: boolean;
  isMinistryEditor?: boolean;
  isBlogEditor?: boolean;
  wantsMembershipClass?: boolean;
  
  // Detailed info
  address?: string;
  contactNumber?: string;
  birthDate?: any;
  gender?: 'Male' | 'Female';
  
  // Security tracking
  passwordChangeCount?: number;
  passwordChangeLocked?: boolean;
  
  createdAt: any;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  authorId: string;
  authorName: string;
  coverImage?: string;
  status: 'draft' | 'pending' | 'published' | 'rejected';
  createdAt: any;
  updatedAt: any;
  publishedAt?: any;
  category?: string;
  tags?: string[];
}

export interface SystemSettings {
  id: string;
  churchName?: string;
  tagline?: string;
  address?: string;
  phone?: string;
  email?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  youtubeUrl?: string;
  twitterUrl?: string;
  googleMapsUrl?: string;
  facebookLiveUrl?: string;
  isLive?: boolean;
  welcomeTitle?: string;
  welcomeSubtitle?: string;
  heroImageUrl?: string;
  serviceTimes?: { day: string; time: string }[];
  lastUpdated: any;
  updatedBy: string;
}

export interface MinistryDetail {
  id: string; // slugified ministry name
  name: Ministry;
  description: string;
  content: string;
  imageUrl?: string;
  meetingTime?: string;
  location?: string;
  leader?: string;
  lastUpdated: any;
  updatedBy: string;
}

export interface MinistryEditDraft {
  id: string;
  ministryId: string;
  content: string;
  description: string;
  imageUrl?: string;
  meetingTime?: string;
  location?: string;
  submittedBy: string;
  submittedByName: string;
  submittedAt: any;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: any;
}

export interface MinistryEditorRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  ministryId: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: any;
}

export interface Sermon {
  id: string;
  title: string;
  speaker: string;
  date: any;
  videoUrl: string;
  notes: string;
  scripture: string;
  thumbnail?: string;
}

export interface EventMedia {
  type: 'photo' | 'video';
  url: string;
  thumbnail?: string;
  caption?: string;
}

export interface ChurchEvent {
  id: string;
  title: string;
  slug: string;
  description: string;
  content?: string;
  date: any;
  endDate?: any; // Added for date selection range
  location: string;
  imageUrl: string;
  media?: EventMedia[];
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: any;
  category?: string;
  imageUrl?: string;
}

export interface WeeklyActivity {
  id: string;
  day: string;
  time: string;
  title: string;
  description: string;
  location: string;
  category: 'Spiritual' | 'Fellowship' | 'Service' | 'Other';
  order: number;
  ministryId?: string; // Optional link to a specific ministry
}

export interface PrayerComment {
  id: string;
  userId: string;
  userName: string;
  message: string;
  createdAt: any;
}

export interface PrayerRequest {
  id: string;
  userId: string; // Required - only members can post
  userName: string;
  onBehalfOf?: string; // Optional - if posting for someone else
  targetType?: 'myself' | 'others';
  message: string;
  status: 'pending' | 'approved' | 'denied' | 'answered';
  date: any;
  prayCount?: number;
  prayers?: string[]; // array of user IDs
  isAnonymous: boolean;
  sensitivityNote?: string;
  visibility: 'public' | 'private';
}

export interface BlogComment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: any;
}

export interface SermonComment {
  id: string;
  userId: string;
  userName: string;
  message: string;
  createdAt: any;
}

export interface GalleryAlbum {
  id: string;
  name: string;
  description: string;
  coverImageUrl?: string;
  isFeatured?: boolean;
  createdAt: any;
  updatedAt: any;
}

export interface GalleryItem {
  id: string;
  album: string; // This remains as name or ID, but I'll treat it as ID now if possible
  albumId?: string;
  imageUrl: string;
  uploadedBy: string;
  createdAt: any;
}

export interface MembershipInquiry {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  message?: string;
  status: 'new' | 'contacted' | 'scheduled';
  createdAt: any;
}

export interface DirectMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderPhoto?: string;
  receiverId: string;
  receiverName: string;
  text: string;
  createdAt: any;
  isRead: boolean;
}

export interface ChatConversation {
  id: string;
  participantIds: string[];
  participantNames: string[];
  lastMessage: string;
  lastMessageAt: any;
  lastSenderId: string;
}
