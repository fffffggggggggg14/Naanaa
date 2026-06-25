import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Loader2, MapPin, Clock, Flame, Heart, Phone,
  Truck, ShieldCheck, ArrowRight, UtensilsCrossed,
  Coffee, Store, BadgeCheck, ChevronDown, ChevronUp,
  ExternalLink, ShoppingBag, Globe, Users
} from 'lucide-react';
import { DEFAULT_AVATAR, onImgError } from '../utils/avatar';

const API = 'http://localhost:8000/api';

const DIET_AR = { Regular: 'عادي', Keto: 'كيتو', Vegan: 'نباتي', Vegetarian: 'نباتي+ألبان', GlutenFree: 'بلا جلوتين' };

const getPlatformInfo = (url) => {
  if (!url) return { label: 'رابط', color: 'from-orange-500 to-amber-400' };
  if (url.includes('instagram'))  return { label: 'إنستجرام', color: 'from-pink-500 to-purple-600' };
  if (url.includes('facebook'))   return { label: 'فيسبوك',   color: 'from-blue-600 to-blue-500' };
  if (url.includes('twitter') || url.includes('x.com')) return { label: 'تويتر', color: 'from-sky-500 to-blue-400' };
  if (url.includes('youtube'))    return { label: 'يوتيوب',   color: 'from-red-600 to-red-500' };
  if (url.includes('tiktok'))     return { label: 'تيك توك',  color: 'from-gray-900 to-gray-700' };
  try {
    const domain = new URL(url).hostname.replace('www.', '');
    return { label: domain, color: 'from-orange-500 to-amber-400' };
  } catch {
    return { label: 'رابط', color: 'from-orange-500 to-amber-400' };
  }
};

// ── Open/Closed status from working_hours string ──────────────────────────────
const getOpenStatus = (workingHours) => {
  if (!workingHours) return null;
  try {
    // Try to parse "8 ص - 11 م" style
    const now   = new Date();
    const hour  = now.getHours();
    const match = workingHours.match(/(\d+)\s*ص\s*[–\-]\s*(\d+)\s*م/);
    if (match) {
      const open  = parseInt(match[1]);         // e.g. 8
      const close = parseInt(match[2]) + 12;    // e.g. 11 م → 23
      return hour >= open && hour < close;
    }
  } catch { /* ignore */ }
  return null;
};

// ── Recipe Card ───────────────────────────────────────────────────────────────
const RecipeCard = ({ recipe }) => {
  const avail = recipe.is_available !== false;
  const isDrink = recipe.item_type === 'drink';
  return (
    <Link to={`/recipes/${recipe.id}`}
      className="block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group hover:-translate-y-1">
      <div className="relative h-48 overflow-hidden bg-gray-100">
        <img src={recipe.image || DEFAULT_AVATAR} alt={recipe.title} onError={onImgError}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {/* Availability bar */}
        <div className={`absolute top-0 left-0 right-0 py-1 text-center text-xs font-bold ${avail ? 'bg-green-500/80' : 'bg-red-500/80'} text-white backdrop-blur-sm`}>
          {avail ? '✅ متوفر حالياً' : '❌ غير متوفر'}
        </div>

        {/* Price */}
        <div className="absolute bottom-3 right-3 bg-orange-500 text-white font-black text-sm px-3 py-1 rounded-xl shadow-lg">
          {recipe.price} EGP
        </div>

        {/* Type badge */}
        <div className={`absolute bottom-3 left-3 flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${isDrink ? 'bg-blue-500 text-white' : 'bg-white/90 text-gray-800 shadow-sm'}`}>
          {isDrink ? <Coffee className="w-3 h-3" /> : <UtensilsCrossed className="w-3 h-3" />}
          {isDrink ? 'مشروب' : 'طعام'}
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-black text-gray-900 text-sm mb-1 line-clamp-2 break-words leading-tight group-hover:text-orange-500 transition-colors">{recipe.title}</h3>
        {recipe.description && <p className="text-gray-400 text-xs line-clamp-2 mb-3 leading-relaxed flex-1">{recipe.description}</p>}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-50 mt-auto">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className="flex items-center gap-0.5"><Heart className="w-3.5 h-3.5 text-red-400" /> {recipe.likes_count}</span>
            <span className="flex items-center gap-0.5"><Clock className="w-3.5 h-3.5 text-orange-400" /> {recipe.cooking_time} د</span>
          </div>
          <span className="text-xs bg-orange-50 text-orange-700 font-bold px-2 py-0.5 rounded-full">
            {DIET_AR[recipe.diet_type] || recipe.diet_type}
          </span>
        </div>
      </div>
    </Link>
  );
};

// ── Location buttons (multi-URL support) ────────────────────────────────────
const LocationSection = ({ locationUrl }) => {
  if (!locationUrl || !locationUrl.trim()) return null;
  const urls = locationUrl.split('\n').filter(u => u.trim());
  if (urls.length === 0) return null;
  return (
    <div className="mt-4">
      <p className="text-xs text-gray-400 font-bold uppercase mb-2">مواقعنا على الخريطة</p>
      <div className="flex flex-wrap gap-2">
        {urls.map((url, i) => (
          <a key={i} href={url.trim()} target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-2 bg-gradient-to-l from-orange-500 to-amber-400 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
            <MapPin className="w-4 h-4" />
            <span>الموقع {urls.length > 1 ? i + 1 : ''}</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-80" />
          </a>
        ))}
      </div>
    </div>
  );
};

// ── Social Links buttons ──────────────────────────────────────────────────────
const SocialLinks = ({ socialLinks }) => {
  if (!socialLinks || !socialLinks.trim()) return null;
  const urls = socialLinks.split('\n').filter(u => u.trim());
  if (urls.length === 0) return null;
  return (
    <div className="mt-4">
      <p className="text-xs text-gray-400 font-bold uppercase mb-2">تابعنا على</p>
      <div className="flex flex-wrap gap-2">
        {urls.map((url, i) => {
          const { label, color } = getPlatformInfo(url.trim());
          return (
            <a key={i} href={url.trim()} target="_blank" rel="noreferrer"
              className={`inline-flex items-center gap-2 bg-gradient-to-l ${color} text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200`}>
              <Globe className="w-4 h-4" />
              <span>{label}</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </a>
          );
        })}
      </div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const RestaurantPublicProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [data,        setData]        = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true); setError(null);
      try {
        const headers = token ? { Authorization: `Token ${token}` } : {};
        const res = await axios.get(`${API}/restaurant/${id}/`, { headers });
        setData(res.data);
      } catch (e) { console.error(e); setError('تعذّر تحميل بيانات المطعم.'); }
      finally { setLoading(false); }
    })();
  }, [id]);

  const handleToggleFollow = async () => {
    if (!token) return alert('يرجى تسجيل الدخول لمتابعة المطعم');
    setFollowLoading(true);
    try {
      const res = await axios.post(`${API}/restaurant/${id}/follow/`, {}, { headers: { Authorization: `Token ${token}` } });
      setData(prev => ({
        ...prev,
        restaurant: {
          ...prev.restaurant,
          is_followed_by_user: res.data.is_followed,
          followers_count: res.data.followers_count
        }
      }));
    } catch (e) { console.error(e); }
    finally { setFollowLoading(false); }
  };

  if (loading) return <div className="flex justify-center items-center min-h-[60vh]"><Loader2 className="w-12 h-12 animate-spin text-orange-500" /></div>;
  if (error)   return <div className="text-center py-20" dir="rtl"><p className="text-gray-500 mb-4">{error}</p><button onClick={() => navigate(-1)} className="text-orange-500 font-bold hover:underline">← العودة</button></div>;
  if (!data?.restaurant) return null;

  const { restaurant, recipes = [] } = data;
  const isOpen = getOpenStatus(restaurant.working_hours);
  const foodItems  = recipes.filter(r => (r.item_type || 'food') !== 'drink');
  const drinkItems = recipes.filter(r => r.item_type === 'drink');
  const totalLikes = recipes.reduce((s, r) => s + (r.likes_count || 0), 0);

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8" dir="rtl">

      {/* Back */}
      <button onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-orange-500 font-bold mb-6 transition group">
        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /> عودة
      </button>

      {/* ── Hero Card ── */}
      <div className="bg-white rounded-3xl shadow-sm border border-orange-100 overflow-hidden mb-8">

        {/* Banner */}
        <div className="h-36 bg-gradient-to-l from-orange-500 via-amber-500 to-yellow-500 relative">
          <div className="absolute inset-0 opacity-10"
            style={{backgroundImage:'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)', backgroundSize:'24px 24px'}} />
          {/* Open/Closed badge on banner */}
          {isOpen !== null && (
            <div className={`absolute top-4 left-4 text-white text-sm font-black px-4 py-2 rounded-full flex items-center gap-2 ${isOpen ? 'bg-green-500/90' : 'bg-red-500/90'}`}>
              <span className={`w-2 h-2 rounded-full ${isOpen ? 'bg-white animate-pulse' : 'bg-white/60'}`} />
              {isOpen ? 'مفتوح الآن' : 'مغلق الآن'}
            </div>
          )}
          {restaurant.cuisine_type && (
            <div className="absolute top-4 right-4 bg-white/20 backdrop-blur border border-white/30 text-white text-sm font-black px-4 py-2 rounded-full flex items-center gap-2">
              <UtensilsCrossed className="w-4 h-4" /> {restaurant.cuisine_type}
            </div>
          )}
        </div>

        <div className="px-6 sm:px-8 pb-8">
          {/* Avatar & Action */}
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-5 pt-4 sm:pt-0">
            <div className="relative shrink-0 -mt-16 sm:-mt-20 z-10">
              <img src={restaurant.profile_picture || DEFAULT_AVATAR} alt={restaurant.restaurant_name} onError={onImgError}
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl object-cover border-4 border-white shadow-xl bg-white" />
              {restaurant.is_verified && (
                <div className="absolute -bottom-2 -left-2 bg-orange-500 rounded-full p-1.5 shadow-md">
                  <ShieldCheck className="w-4 h-4 text-white" />
                </div>
              )}
            </div>

            <div className="flex-1 pb-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-3xl font-black text-gray-900">{restaurant.restaurant_name}</h1>
                {restaurant.is_verified && (
                  <span className="bg-orange-100 text-orange-700 text-xs font-black px-2.5 py-1 rounded-full flex items-center gap-1">
                    <BadgeCheck className="w-3.5 h-3.5" /> مطعم موثّق
                  </span>
                )}
              </div>
              {restaurant.cuisine_type && <p className="text-orange-600 font-medium">{restaurant.cuisine_type}</p>}
            </div>

            {/* Phone + Follow */}
            <div className="shrink-0 flex flex-col sm:flex-row items-center gap-2">
              {restaurant.contact_number && (
                <div
                  className="flex items-center gap-2 bg-gradient-to-l from-orange-500 to-amber-400 text-white px-4 py-2.5 rounded-2xl shadow-lg shadow-orange-200 group"
                  onClick={e => e.preventDefault()}
                >
                  {/* Pulsing ring */}
                  <div className="relative shrink-0">
                    <div className="absolute inset-0 rounded-full bg-white/30 animate-ping" />
                    <div className="relative bg-white/20 rounded-full p-1.5">
                      <Phone className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex flex-col leading-tight select-all" style={{userSelect:'text'}}>
                    <span className="text-[10px] font-bold text-white/70 uppercase tracking-wide">تواصل معنا</span>
                    <span
                      className="text-sm font-black tracking-widest"
                      dir="ltr"
                      style={{pointerEvents:'none'}}
                    >
                      {restaurant.contact_number}
                    </span>
                  </div>
                </div>
              )}
              <button onClick={handleToggleFollow} disabled={followLoading}
                className={`flex items-center gap-2 font-black px-5 py-3 rounded-xl transition shadow-lg ${
                  restaurant.is_followed_by_user
                    ? 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-500 shadow-gray-200'
                    : 'bg-white border-2 border-orange-500 text-orange-600 hover:bg-orange-500 hover:text-white shadow-orange-100'
                }`}>
                {followLoading
                  ? <Loader2 className="w-5 h-5 animate-spin" />
                  : <Users className="w-5 h-5" />
                }
                {restaurant.is_followed_by_user ? 'متابع' : 'متابعة'}
              </button>
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            {[
              { label: 'الأصناف', value: recipes.length, icon: <UtensilsCrossed className="w-5 h-5 text-orange-500" />, bg: 'bg-orange-50', val: 'text-orange-700' },
              { label: 'الإعجابات', value: totalLikes, icon: <Heart className="w-5 h-5 text-red-400" />, bg: 'bg-red-50', val: 'text-red-600' },
              { label: 'المتابعون', value: restaurant.followers_count || 0, icon: <Users className="w-5 h-5 text-purple-500" />, bg: 'bg-purple-50', val: 'text-purple-700' },
              { label: 'التوصيل', value: restaurant.delivery_available ? '🛵 متاح' : '❌ لا', icon: <Truck className="w-5 h-5 text-green-500" />, bg: restaurant.delivery_available ? 'bg-green-50' : 'bg-gray-50', val: restaurant.delivery_available ? 'text-green-700' : 'text-gray-400' },
              { label: 'ساعات العمل', value: restaurant.working_hours || '—', icon: <Clock className="w-5 h-5 text-blue-500" />, bg: 'bg-blue-50', val: 'text-blue-700' },
            ].map((s, i) => (
              <div key={i} className={`${s.bg} rounded-2xl p-3 text-center`}>
                <div className="flex justify-center mb-1">{s.icon}</div>
                <div className={`text-sm font-black ${s.val} leading-tight`}>{s.value}</div>
                <div className="text-xs text-gray-500 font-medium mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Location & Social Links */}
          <LocationSection locationUrl={restaurant.location_url} />
          <SocialLinks socialLinks={restaurant.social_links} />
        </div>
      </div>

      {/* ── Menu ── */}
      <h2 className="text-2xl font-black text-gray-900 mb-5 flex items-center gap-2">
        <UtensilsCrossed className="w-6 h-6 text-orange-500" /> قائمة الطعام
        {recipes.length > 0 && (
          <span className="bg-orange-100 text-orange-700 text-sm font-bold px-2.5 py-0.5 rounded-full">{recipes.length}</span>
        )}
      </h2>

      {recipes.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
          <UtensilsCrossed className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 font-medium">لا توجد أصناف منشورة بعد</p>
        </div>
      ) : (
        <>
          {/* Food */}
          {foodItems.length > 0 && (
            <>
              {drinkItems.length > 0 && (
                <h3 className="text-base font-black text-gray-700 mb-3 flex items-center gap-2">
                  <UtensilsCrossed className="w-4 h-4 text-orange-500" /> الوجبات الرئيسية ({foodItems.length})
                </h3>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-8">
                {foodItems.map(r => <RecipeCard key={r.id} recipe={r} />)}
              </div>
            </>
          )}

          {/* Drinks */}
          {drinkItems.length > 0 && (
            <>
              <h3 className="text-base font-black text-gray-700 mb-3 flex items-center gap-2">
                <Coffee className="w-4 h-4 text-blue-500" /> المشروبات ({drinkItems.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {drinkItems.map(r => <RecipeCard key={r.id} recipe={r} />)}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default RestaurantPublicProfile;
