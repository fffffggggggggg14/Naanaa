import React, { useState, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, NavLink, useNavigate } from 'react-router-dom';
import Settings from './components/Settings';
import { AuthProvider, AuthContext } from './AuthContext';
import Home from './components/Home';
import Calculate from './components/Calculate';
import Progress from './components/Progress';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login';
import Register from './components/Register';
import Explore from './components/Explore';
import ChefDashboard from './components/ChefDashboard';
import RecipeDetail from './components/RecipeDetail';
import ChefPublicProfile from './components/ChefPublicProfile';
import RestaurantPublicProfile from './components/RestaurantPublicProfile';
import SavedRecipes from './components/SavedRecipes';
import TrainerDashboard from './components/TrainerDashboard';
import TrainerPublicProfile from './components/TrainerPublicProfile';
import WorkoutVideoDetail from './components/WorkoutVideoDetail';
import CommunityPage from './components/CommunityPage';
import UserProfilePage from './components/UserProfilePage';
import SmartSearch from './components/SmartSearch';
import AboutPage from './components/AboutPage';
import { LogOut, User as UserIcon, Settings as SettingsIcon } from 'lucide-react';
import { DEFAULT_AVATAR, resolveMediaUrl, onImgError } from './utils/avatar';

const MainLayout = () => {
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const { user, profile, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const confirmLogout = () => {
    logout();
    setIsLogoutModalOpen(false);
    navigate('/');
  };

  const navLinkStyle = ({ isActive }) => 
    isActive 
      ? "text-softGreen-600 font-bold border-b-2 border-softGreen-600 pb-1" 
      : "hover:text-softGreen-600 transition-colors text-gray-500";

  const getProfileImage = () => resolveMediaUrl(profile?.profile_picture);

  return (
    <div className="min-h-screen bg-lightGray font-sans flex flex-col">
      <header className="bg-white shadow-sm border-b border-softGreen-100 py-4 px-6 fixed top-0 w-full z-50 transition-all">
        <div className="w-[95%] max-w-[1400px] mx-auto flex items-center justify-between gap-4" dir="rtl">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <img src="/Logo naanaa.png" alt="شعار نعناعة" className="h-16 w-auto object-contain" />
          </Link>

          <div className="flex-1 flex justify-center">
            <SmartSearch />
          </div>
          
          <div className="flex items-center gap-6 font-medium shrink-0">
            <nav className="hidden md:flex gap-6">
              {user ? (
                <>
                  <NavLink to="/" className={navLinkStyle} end>لوحة التحكم</NavLink>
                  <NavLink to="/explore" className={navLinkStyle}>استكشف</NavLink>
                  <NavLink to="/community" className={navLinkStyle}>المجتمع</NavLink>
                  <NavLink to="/saved" className={navLinkStyle}>محفوظاتي</NavLink>
                  <NavLink to="/chef-dashboard" className={navLinkStyle}>لوحة الشيف</NavLink>
                  <NavLink to="/trainer-dashboard" className={navLinkStyle}>لوحة المدرب</NavLink>
                  <NavLink to="/calculate" className={navLinkStyle}>قياساتي</NavLink>
                  <NavLink to="/progress" className={navLinkStyle}>تطوري</NavLink>
                </>
              ) : (
                <NavLink to="/" className={navLinkStyle} end>الرئيسية</NavLink>
              )}
            </nav>

            <div className="flex items-center gap-4 border-r border-gray-200 pr-4">
              {user ? (
                <div className="flex items-center gap-4">
                  <Link to="/settings" className="flex items-center gap-2 text-softGreen-700 font-bold bg-softGreen-50 hover:bg-softGreen-100 transition-colors px-3 py-1.5 rounded-full">
                    <img src={getProfileImage()} alt="Profile" onError={onImgError} className="w-6 h-6 rounded-full object-cover border border-softGreen-200" />
                    <span className="max-w-[100px] truncate">
                      {profile && profile.first_name ? profile.first_name : user.username}
                    </span>
                  </Link>
                  <Link to="/settings" className="text-gray-400 hover:text-softGreen-600 transition-colors" title="الإعدادات">
                    <SettingsIcon className="w-5 h-5" />
                  </Link>
                  <button onClick={() => setIsLogoutModalOpen(true)} className="flex items-center gap-1 text-gray-400 hover:text-red-500 transition-colors" title="تسجيل الخروج">
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Link to="/login" className="px-4 py-2 text-softGreen-600 font-bold hover:bg-softGreen-50 rounded-lg transition-colors">دخول</Link>
                  <Link to="/register" className="px-4 py-2 bg-softGreen-600 text-white font-bold rounded-lg shadow hover:bg-softGreen-700 transition-all">حساب جديد</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-12 px-4 w-[95%] max-w-[1400px] mx-auto flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route 
            path="/calculate" 
            element={
              <ProtectedRoute>
                <Calculate />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/progress" 
            element={
              <ProtectedRoute>
                <Progress />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/explore" 
            element={
              <ProtectedRoute>
                <Explore />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/community" 
            element={
              <ProtectedRoute>
                <CommunityPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile/:id" 
            element={
              <ProtectedRoute>
                <UserProfilePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/chef-dashboard" 
            element={
              <ProtectedRoute>
                <ChefDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/recipes/:id" 
            element={
              <ProtectedRoute>
                <RecipeDetail />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/chef/:id" 
            element={
              <ProtectedRoute>
                <ChefPublicProfile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/restaurant/:id" 
            element={
              <ProtectedRoute>
                <RestaurantPublicProfile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/saved" 
            element={
              <ProtectedRoute>
                <SavedRecipes />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/trainer-dashboard" 
            element={
              <ProtectedRoute>
                <TrainerDashboard />
              </ProtectedRoute>
            } 
          />
          <Route path="/workout/:id" element={<WorkoutVideoDetail />} />
          <Route path="/trainer/profile/:id" element={<TrainerPublicProfile />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-8 mt-auto">
        <div className="max-w-6xl mx-auto px-4 text-center text-gray-400 text-sm">
          &copy; {new Date().getFullYear()} مشروع نعناعة. جميع الحقوق محفوظة. 
          <span className="mx-2">|</span>
          <Link to="/about" className="hover:text-softGreen-600 transition-colors underline underline-offset-4 font-cinematic italic">Peaky Blinders Code</Link>
        </div>
      </footer>

      {/* Logout Confirmation Modal */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" dir="rtl">
          <div className="bg-white p-8 rounded-xl shadow-2xl max-w-sm w-full mx-4 border border-gray-100 flex flex-col items-center text-center animate-in zoom-in-95 duration-200 text-gray-800">
            <div className="bg-red-50 p-4 rounded-full mb-4">
              <LogOut className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">تأكيد الخروج</h3>
            <p className="text-gray-500 mb-8 text-sm leading-relaxed">
              هل أنت متأكد أنك تريد تسجيل الخروج من حسابك في نعناعة؟
            </p>
            <div className="flex gap-4 w-full">
              <button 
                onClick={confirmLogout}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-md shadow-red-200"
              >
                خروج
              </button>
              <button 
                onClick={() => setIsLogoutModalOpen(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 px-4 rounded-lg transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <MainLayout />
      </Router>
    </AuthProvider>
  );
}

export default App;
