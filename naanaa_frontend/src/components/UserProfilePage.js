import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../AuthContext';
import { MapPin, UserPlus, UserCheck, MessageCircle, Loader2 } from 'lucide-react';
import { DEFAULT_AVATAR, onImgError } from '../utils/avatar';
import { PostCard } from './CommunityPage';

const UserProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:8000/api/profile/${id}/`, {
        headers: token ? { Authorization: `Token ${token}` } : {}
      });
      setProfile(res.data.profile);
      setPosts(res.data.posts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFollow = async () => {
    const token = localStorage.getItem('token');
    if (!token) return alert('يرجى تسجيل الدخول');
    
    try {
      const { data } = await axios.post(`http://localhost:8000/api/profile/${id}/follow/`, {}, {
        headers: { Authorization: `Token ${token}` }
      });
      setProfile({
        ...profile,
        is_following: data.is_following,
        followers_count: data.followers_count,
        following_count: data.following_count
      });
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.error) {
          alert(err.response.data.error);
      }
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا المنشور؟")) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8000/api/posts/${postId}/`, {
        headers: { Authorization: `Token ${token}` }
      });
      setPosts(posts.filter(p => p.id !== postId));
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء الحذف");
    }
  };

  const handleUpdatePost = async (postId, newText, newImageFile, removeImageFlag) => {
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('content', newText);
      if (newImageFile) {
        formData.append('image', newImageFile);
      }
      if (removeImageFlag) {
        formData.append('remove_image', 'true');
      }
      const { data } = await axios.put(`http://localhost:8000/api/posts/${postId}/`, formData, {
        headers: { Authorization: `Token ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      setPosts(posts.map(p => p.id === postId ? data : p));
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء التعديل");
    }
  };

  const toggleLike = async (postId) => {
    const token = localStorage.getItem('token');
    if (!token) return alert('يرجى تسجيل الدخول');
    
    // Optimistic update
    setPosts(prev => prev.map(p => p.id === postId ? {
      ...p, 
      is_liked: !p.is_liked, 
      likes_count: p.is_liked ? p.likes_count - 1 : p.likes_count + 1
    } : p));

    try {
      const { data } = await axios.post(`http://localhost:8000/api/posts/${postId}/like/`, {}, {
        headers: { Authorization: `Token ${token}` }
      });
      setPosts(prev => prev.map(p => p.id === postId ? {
        ...p, is_liked: data.liked, likes_count: data.likes_count
      } : p));
    } catch (err) {
      console.error(err);
      fetchProfile(); // Rollback on error
    }
  };

  const toggleSave = async (postId) => {
    const token = localStorage.getItem('token');
    if (!token) return alert('يرجى تسجيل الدخول');
    
    // Optimistic update
    setPosts(prev => prev.map(p => p.id === postId ? { 
        ...p, 
        is_saved: !p.is_saved,
        saves_count: p.is_saved ? p.saves_count - 1 : p.saves_count + 1 
    } : p));

    try {
      const { data } = await axios.post(`http://localhost:8000/api/posts/${postId}/save/`, {}, {
        headers: { Authorization: `Token ${token}` }
      });
      // Update with exact server response
      setPosts(prev => prev.map(p => p.id === postId ? {
        ...p, is_saved: data.saved, saves_count: data.saves_count
      } : p));
    } catch (err) {
      console.error(err);
      fetchProfile(); // Rollback on error
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="w-10 h-10 animate-spin text-softGreen-600" />
      </div>
    );
  }

  if (!profile) {
    return <div className="text-center py-20 font-bold text-gray-500">هذا الحساب غير موجود.</div>;
  }

  const isMyProfile = user && user.id === parseInt(id);

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6" dir="rtl">
      
      {/* Profile Header */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 mb-8 text-center sm:text-right flex flex-col sm:flex-row items-center gap-6 relative overflow-hidden">
        
        {/* Avatar */}
        <div className="relative z-10 shrink-0">
          <img 
            src={profile.profile_picture || DEFAULT_AVATAR} 
            alt={profile.username}
            onError={onImgError}
            className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-white shadow-lg"
          />
        </div>

        {/* Info */}
        <div className="flex-1 z-10">
          <h1 className="text-2xl font-black text-gray-800 mb-1">
            {profile.first_name || profile.last_name ? `${profile.first_name} ${profile.last_name}` : profile.username}
          </h1>
          <p className="text-gray-500 text-sm font-medium mb-3">@{profile.username}</p>
          
          {profile.bio && (
            <p className="text-gray-700 text-sm leading-relaxed max-w-lg mx-auto sm:mx-0 mb-4">
              {profile.bio}
            </p>
          )}

          <div className="flex items-center justify-center sm:justify-start gap-6 text-sm font-bold text-gray-800">
            <div className="flex flex-col items-center sm:items-start">
              <span className="text-lg">{profile.followers_count}</span>
              <span className="text-gray-500 text-xs">متابعون</span>
            </div>
            <div className="flex flex-col items-center sm:items-start">
              <span className="text-lg">{profile.following_count}</span>
              <span className="text-gray-500 text-xs">يتابع</span>
            </div>
            <div className="flex flex-col items-center sm:items-start">
              <span className="text-lg">{posts.length}</span>
              <span className="text-gray-500 text-xs">منشور</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="z-10 mt-4 sm:mt-0">
          {isMyProfile ? (
            <button 
              onClick={() => navigate('/settings')}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold px-6 py-2.5 rounded-xl transition-colors shadow-sm whitespace-nowrap"
            >
              تعديل الملف الشخصي
            </button>
          ) : (
            <button 
              onClick={handleToggleFollow}
              className={`font-bold px-6 py-2.5 rounded-xl transition-all shadow-sm whitespace-nowrap flex items-center gap-2 ${
                profile.is_following 
                  ? 'bg-gray-100 text-gray-800 hover:bg-red-50 hover:text-red-600' 
                  : 'bg-softGreen-600 text-white hover:bg-softGreen-700'
              }`}
            >
              {profile.is_following ? (
                <><UserCheck className="w-5 h-5" /> إلغاء المتابعة</>
              ) : (
                <><UserPlus className="w-5 h-5" /> متابعة</>
              )}
            </button>
          )}
        </div>
        
        {/* Background Decoration */}
        <div className="absolute top-0 right-0 w-full h-24 bg-gradient-to-b from-softGreen-50 to-white opacity-50 pointer-events-none" />
      </div>

      {/* Posts Section */}
      <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <MessageCircle className="w-5 h-5 text-softGreen-600" />
        منشورات {profile.first_name || profile.username}
      </h2>

      {posts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-200">
          <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-8 h-8 text-gray-300" />
          </div>
          <p className="text-gray-500 font-bold">لا توجد منشورات حتى الآن.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map(post => (
            <PostCard 
              key={post.id} 
              post={post} 
              user={user} 
              onDelete={handleDeletePost}
              onEdit={handleUpdatePost}
              onLike={toggleLike}
              onSave={toggleSave}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default UserProfilePage;
