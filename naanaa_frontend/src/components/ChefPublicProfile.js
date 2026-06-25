import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Loader2, MapPin, Users, Heart, Clock, Flame,
  UserPlus, UserMinus, ChefHat, Star, Award,
  BookOpen, ChevronDown, ChevronUp, ExternalLink,
  AtSign, Globe, BadgeCheck
} from 'lucide-react';
import { DEFAULT_AVATAR, onImgError } from '../utils/avatar';

const DIET_AR = {
  Regular: 'عادي', Keto: 'كيتو', Vegan: 'نباتي',
  Vegetarian: 'نباتي+ألبان', GlutenFree: 'بلا جلوتين'
};
const DIET_COLOR = {
  Keto: 'bg-yellow-100 text-yellow-700', Vegan: 'bg-green-100 text-green-700',
  Vegetarian: 'bg-emerald-100 text-emerald-700', GlutenFree: 'bg-purple-100 text-purple-700',
};

// ── Chef's Story (Bio with Read More) ────────────────────────────────────────
const ChefStory = ({ bio }) => {
  const [expanded, setExpanded] = useState(false);
  if (!bio) return null;
  const isLong = bio.length > 220;
  return (
    <div className="mt-6 pt-6 border-t border-gray-100">
      <h3 className="flex items-center gap-2 text-base font-black text-gray-800 mb-3">
        <BookOpen className="w-4 h-4 text-softGreen-600" /> قصة الشيف
      </h3>
      <p className="text-gray-600 leading-relaxed text-sm">
        {isLong && !expanded ? `${bio.slice(0, 220)}...` : bio}
      </p>
      {isLong && (
        <button onClick={() => setExpanded(v => !v)}
          className="mt-2 flex items-center gap-1 text-softGreen-600 text-xs font-bold hover:underline">
          {expanded ? <><ChevronUp className="w-3.5 h-3.5" /> عرض أقل</> : <><ChevronDown className="w-3.5 h-3.5" /> اقرأ المزيد</>}
        </button>
      )}
    </div>
  );
};

// ── Experience Badge ──────────────────────────────────────────────────────────
const ExperienceBadge = ({ years }) => (
  <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-2.5 w-fit">
    <Award className="w-5 h-5 text-amber-500" />
    <div>
      <span className="text-2xl font-black text-amber-600">{years}</span>
      <span className="text-amber-700 text-sm font-bold ml-1">سنة خبرة</span>
    </div>
  </div>
);

// ── Social Links ─────────────────────────────────────────────────────────────
const getPlatformInfo = (url) => {
  if (url.includes('instagram'))  return { label: 'إنستجرام', color: 'from-pink-500 to-purple-600', icon: <AtSign className="w-4 h-4" /> };
  if (url.includes('facebook'))   return { label: 'فيسبوك',   color: 'from-blue-600 to-blue-500',   icon: <Globe className="w-4 h-4" /> };
  if (url.includes('twitter') || url.includes('x.com')) return { label: 'تويتر', color: 'from-sky-500 to-blue-400', icon: <AtSign className="w-4 h-4" /> };
  if (url.includes('youtube'))    return { label: 'يوتيوب',   color: 'from-red-600 to-red-500',     icon: <Globe className="w-4 h-4" /> };
  if (url.includes('tiktok'))     return { label: 'تيك توك',  color: 'from-gray-900 to-gray-700',   icon: <Globe className="w-4 h-4" /> };
  try {
    const domain = new URL(url).hostname.replace('www.', '');
    return { label: domain, color: 'from-softGreen-600 to-emerald-500', icon: <Globe className="w-4 h-4" /> };
  } catch {
    return { label: 'رابط', color: 'from-softGreen-600 to-emerald-500', icon: <Globe className="w-4 h-4" /> };
  }
};

const SocialLinks = ({ links }) => {
  if (!links || !links.trim()) return null;
  const items = links.split('\n').map(l => l.trim()).filter(Boolean);
  if (!items.length) return null;
  return (
    <div className="flex flex-wrap gap-3 mt-4">
      {items.map((url, i) => {
        const { label, color, icon } = getPlatformInfo(url);
        return (
          <a key={i} href={url} target="_blank" rel="noreferrer"
            className={`group inline-flex items-center gap-2 bg-gradient-to-l ${color} text-white px-4 py-2.5 rounded-2xl font-bold text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200`}>
            {icon}
            <span>{label}</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 transition-opacity" />
          </a>
        );
      })}
    </div>
  );
};

// ── Recipe Card ───────────────────────────────────────────────────────────────
const RecipeCard = ({ recipe }) => (
  <Link to={`/recipe/${recipe.id}`}
    className="block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group hover:-translate-y-1">
    <div className="relative h-48 overflow-hidden bg-gray-100">
      <img src={recipe.image || DEFAULT_AVATAR} alt={recipe.title} onError={onImgError}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

      {/* Calories & time overlay */}
      <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/60 backdrop-blur text-white text-xs font-bold px-2 py-1 rounded-lg">
        <Flame className="w-3 h-3 text-orange-400" /> {recipe.calories} kcal
      </div>
      <div className="absolute bottom-3 left-3 bg-white/90 text-gray-800 text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1">
        <Clock className="w-3 h-3 text-softGreen-600" /> {recipe.cooking_time} د
      </div>
    </div>

    <div className="p-4 flex flex-col flex-1">
      <h3 className="font-black text-gray-900 text-sm mb-1 line-clamp-2 break-words leading-tight group-hover:text-softGreen-600 transition-colors">{recipe.title}</h3>
      <p className="text-gray-400 text-xs line-clamp-2 mb-3 leading-relaxed flex-1">{recipe.description}</p>
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-50 mt-auto">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span className="flex items-center gap-0.5"><Heart className="w-3.5 h-3.5 text-red-400" /> {recipe.likes_count}</span>
          <span className="flex items-center gap-0.5"><Clock className="w-3.5 h-3.5 text-softGreen-500" /> {recipe.cooking_time} د</span>
        </div>
        <span className="text-xs bg-softGreen-50 text-softGreen-700 font-bold px-2 py-0.5 rounded-full">
          {recipe.calories} kcal
        </span>
      </div>
    </div>
  </Link>
);

// ── Main Page ─────────────────────────────────────────────────────────────────
const ChefPublicProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`http://localhost:8000/api/chef/${id}/`, {
          headers: token ? { Authorization: `Token ${token}` } : {}
        });
        setProfileData(res.data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, [id]);

  const handleToggleFollow = async () => {
    const token = localStorage.getItem('token');
    if (!token) { alert('يرجى تسجيل الدخول لمتابعة هذا الشيف.'); return; }
    setFollowLoading(true);
    try {
      const res = await axios.post(`http://localhost:8000/api/chef/${id}/follow/`, {}, {
        headers: { Authorization: `Token ${token}` }
      });
      setProfileData(prev => ({
        ...prev,
        chef: {
          ...prev.chef,
          is_followed_by_user: res.data.is_followed,
          followers_count: res.data.followers_count
        }
      }));
    } catch (e) {
      console.error(e);
      if (e.response?.data?.detail) alert(e.response.data.detail);
    } finally { setFollowLoading(false); }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-softGreen-600" /></div>;
  if (!profileData?.chef) return <div className="text-center py-20 text-gray-500 font-medium" dir="rtl">الشيف غير موجود.</div>;

  const { chef, recipes } = profileData;
  const totalLikes  = recipes.reduce((s, r) => s + (r.likes_count || 0), 0);
  const avgCal      = recipes.length ? Math.round(recipes.reduce((s, r) => s + (r.calories || 0), 0) / recipes.length) : 0;

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8" dir="rtl">

      {/* ── Hero Card ── */}
      <div className="bg-white rounded-3xl shadow-sm border border-softGreen-100 mb-8 overflow-hidden">

        {/* Banner */}
        <div className="h-36 bg-gradient-to-l from-softGreen-600 via-emerald-500 to-teal-600 relative">
          <div className="absolute inset-0 opacity-10"
            style={{backgroundImage:'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)', backgroundSize:'24px 24px'}} />
          {/* Specialty pill */}
          {chef.specialty && (
            <div className="absolute top-4 right-4 bg-white/20 backdrop-blur border border-white/30 text-white text-sm font-black px-4 py-2 rounded-full flex items-center gap-2">
              <ChefHat className="w-4 h-4" /> {chef.specialty}
            </div>
          )}
        </div>

        <div className="px-6 sm:px-8 pb-8">
          {/* Avatar + Follow */}
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-5 pt-4 sm:pt-0">
            <div className="relative shrink-0 -mt-16 sm:-mt-20 z-10">
              <img src={chef.profile_picture || DEFAULT_AVATAR} alt={chef.brand_name} onError={onImgError}
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl object-cover border-4 border-white shadow-xl bg-white" />
              {chef.is_verified && (
                <div className="absolute -bottom-2 -left-2 bg-softGreen-600 rounded-full p-1.5 shadow-md">
                  <BadgeCheck className="w-4 h-4 text-white" />
                </div>
              )}
            </div>

            <div className="flex-1 pb-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-3xl font-black text-gray-900">{chef.brand_name}</h1>
                {chef.is_verified && (
                  <span className="bg-softGreen-100 text-softGreen-700 text-xs font-black px-2.5 py-1 rounded-full flex items-center gap-1">
                    <BadgeCheck className="w-3.5 h-3.5" /> شيف معتمد
                  </span>
                )}
              </div>
              {chef.specialty && <p className="text-softGreen-600 font-medium">{chef.specialty}</p>}
            </div>

            {/* Follow button */}
            <button onClick={handleToggleFollow} disabled={followLoading}
              className={`shrink-0 px-6 py-3 rounded-xl font-black flex items-center gap-2 transition-all min-w-[150px] justify-center ${
                chef.is_followed_by_user
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                  : 'bg-softGreen-500 text-white hover:bg-softGreen-600 shadow-lg shadow-softGreen-200'
              }`}>
              {followLoading ? <Loader2 className="w-5 h-5 animate-spin" /> :
                chef.is_followed_by_user
                  ? <><UserMinus className="w-5 h-5" /> إلغاء المتابعة</>
                  : <><UserPlus className="w-5 h-5" /> متابعة الشيف</>}
            </button>
          </div>

          {/* Experience badge + location */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            {chef.experience_years && <ExperienceBadge years={chef.experience_years} />}
            {chef.location && (
              <div className="flex items-center gap-1.5 text-gray-500 text-sm font-medium bg-gray-50 px-3 py-2 rounded-xl border border-gray-100">
                <MapPin className="w-4 h-4 text-gray-400" /> {chef.location}
              </div>
            )}
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {[
              { label: 'المتابعون', value: chef.followers_count, icon: <Users className="w-5 h-5 text-softGreen-500" />, bg: 'bg-softGreen-50', val: 'text-softGreen-700' },
              { label: 'الوصفات',  value: recipes.length, icon: <ChefHat className="w-5 h-5 text-indigo-500" />, bg: 'bg-indigo-50', val: 'text-indigo-700' },
              { label: 'إجمالي الإعجابات', value: totalLikes, icon: <Heart className="w-5 h-5 text-red-400" />, bg: 'bg-red-50', val: 'text-red-600' },
              { label: 'متوسط السعرات', value: avgCal ? `${avgCal}` : '—', icon: <Flame className="w-5 h-5 text-orange-400" />, bg: 'bg-orange-50', val: 'text-orange-600' },
            ].map((s, i) => (
              <div key={i} className={`${s.bg} rounded-2xl p-3 text-center`}>
                <div className="flex justify-center mb-1">{s.icon}</div>
                <div className={`text-xl font-black ${s.val}`}>{s.value}</div>
                <div className="text-xs text-gray-500 font-medium">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Social links */}
          <SocialLinks links={chef.social_links} />

          {/* Chef's Story */}
          <ChefStory bio={chef.bio} />
        </div>
      </div>

      {/* ── Recipes Grid ── */}
      <h2 className="text-2xl font-black text-gray-900 mb-5 flex items-center gap-2">
        <ChefHat className="w-6 h-6 text-softGreen-600" /> وصفات الشيف
        {recipes.length > 0 && (
          <span className="bg-softGreen-100 text-softGreen-700 text-sm font-bold px-2.5 py-0.5 rounded-full">{recipes.length}</span>
        )}
      </h2>

      {recipes.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-200">
          <ChefHat className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-xl font-medium text-gray-400">لم يقم هذا الشيف بنشر أي وصفات بعد.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {recipes.map(r => <RecipeCard key={r.id} recipe={r} />)}
        </div>
      )}
    </div>
  );
};

export default ChefPublicProfile;
