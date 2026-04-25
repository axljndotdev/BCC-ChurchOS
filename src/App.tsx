import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Navigate 
} from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import FirebaseSetupGuide from './components/FirebaseSetupGuide';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import MemberLayout from './layouts/MemberLayout';
import AdminLayout from './layouts/AdminLayout';

// Public Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Sermons from './pages/Sermons';
import Events from './pages/Events';
import Gallery from './pages/Gallery';
import Membership from './pages/Membership';
import About from './pages/About';
import Contact from './pages/Contact';
import Ministries from './pages/Ministries';
import MinistryDetail from './pages/MinistryDetail';
import SermonDetail from './pages/SermonDetail';
import EventDetail from './pages/EventDetail';
import WeeklyActivities from './pages/WeeklyActivities';
import AdminMinistries from './pages/AdminMinistries';
import AdminPrayers from './pages/AdminPrayers';
import Blogs from './pages/Blogs';
import BlogPost from './pages/BlogPost';
import AdminBlogs from './pages/AdminBlogs';
import AdminMedia from './pages/AdminMedia';
import MemberBlogEditor from './pages/MemberBlogEditor';
import AdminSettings from './pages/AdminSettings';
import Live from './pages/Live';

// Member Pages
import MemberDashboard from './pages/MemberDashboard';
import MemberProfile from './pages/MemberProfile';
import MemberMessages from './pages/MemberMessages';
import PrayerWall from './pages/PrayerWall';
import MemberDirectory from './pages/MemberDirectory';
import PendingApproval from './pages/PendingApproval';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import AdminMembers from './pages/AdminMembers';
import AdminSermons from './pages/AdminSermons';
import AdminEvents from './pages/AdminEvents';
import AdminAnnouncements from './pages/AdminAnnouncements';

function AppContent() {
  const { isConfigured, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-maroon"></div>
      </div>
    );
  }

  if (!isConfigured) {
    return <FirebaseSetupGuide />;
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/about" element={<About />} />
          <Route path="/live" element={<Live />} />
          <Route path="/sermons" element={<Sermons />} />
          <Route path="/sermons/:id" element={<SermonDetail />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/ministries" element={<Ministries />} />
          <Route path="/ministries/:id" element={<MinistryDetail />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/membership" element={<Membership />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/blogs" element={<Blogs />} />
          <Route path="/blogs/:slug" element={<BlogPost />} />
          <Route path="/activities" element={<WeeklyActivities />} />
          <Route path="/prayer" element={<PrayerWall />} />
          <Route path="/pending-approval" element={<PendingApproval />} />
        </Route>

        {/* Member Routes */}
        <Route path="/member" element={<ProtectedRoute allowedRoles={['member', 'ministry_leader', 'council', 'elder', 'super_admin']} />}>
          <Route element={<MemberLayout />}>
            <Route path="dashboard" element={<MemberDashboard />} />
            <Route path="profile" element={<MemberProfile />} />
            <Route path="messages" element={<MemberMessages />} />
            <Route path="blog/new" element={<MemberBlogEditor />} />
            <Route path="blog/edit/:id" element={<MemberBlogEditor />} />
            <Route path="events" element={<Events />} />
            <Route path="directory" element={<MemberDirectory />} />
            <Route path="resources" element={<div className="p-8">Resources coming soon.</div>} />
          </Route>
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute allowedRoles={['elder', 'super_admin', 'council']} />}>
          <Route element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="sermons" element={<AdminSermons />} />
            <Route path="events" element={<AdminEvents />} />
            <Route path="announcements" element={<AdminAnnouncements />} />
            <Route path="media" element={<AdminMedia />} />
            <Route path="members" element={<AdminMembers />} />
            <Route path="ministries" element={<AdminMinistries />} />
            <Route path="prayers" element={<AdminPrayers />} />
            <Route path="blogs" element={<AdminBlogs />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
