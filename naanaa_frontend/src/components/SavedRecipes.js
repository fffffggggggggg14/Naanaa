import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Bookmark, Heart, Clock, Flame, Loader2,
  ChefHat, Dumbbell, Store, UtensilsCrossed, ShoppingBag, MessageCircle
} from 'lucide-react';
import { DEFAULT_AVATAR, onImgError } from '../utils/avatar';

const API = 'http://localhost:8000/api';

const DIFF_LABEL = { beginner: 'مبتدئ', intermediate: 'متوسط', advanced: 'محترف' };
const DIFF_COLOR = { beginner: 'bg-green-500', intermediate: 'bg-yellow-500', advanced: 'bg-red-500' };
const DIET_AR = {
  Regular: 'عادي', Keto: 'كيتو', Vegan: 'نباتي',
  Vegetarian: 'نباتي+ألبان', GlutenFree: 'بلا جلوتين'
};

// ── Chef Recipe Card ──────────────────────────────────────────────────────────
const ChefRecipeCard = ({ recipe, onUnsave, navigate }) => (
  <div
    onClick={() => navigate(`/recipes/${recipe.id}`)}
    className="cursor-pointer group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-softGreen-200 hover:-translate-y-1"
  >
    <div className="relative h-48 overflow-hidden bg-gray-100">
      <img src={recipe.image || DEFAULT_AVATAR} alt={recipe.title}
        onError={onImgError} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />

      {/* Saved badge — always filled green */}
      <button onClick={e => { e.stopPropagation(); onUnsave(recipe.id); }}
        className="absolute top-3 left-3 p-2 bg-softGreen-500 rounded-full shadow-md hover:bg-red-500 transition-colors"
        title="إزالة من المحفوظات">
        <Bookmark className="w-4 h-4 text-white fill-white" />
      </button>

      <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-lg flex items-center gap-1 font-medium">
        <Flame className="w-3 h-3 text-orange-400" /> {recipe.calories} kcal
      </div>
      <div className="absolute bottom-3 left-3 bg-white/90 text-gray-800 text-xs px-2 py-1 rounded-lg flex items-center gap-1 font-bold shadow-sm">
        <Clock className="w-3 h-3 text-softGreen-600" /> {recipe.cooking_time} دقيقة
      </div>
    </div>

    <div className="p-5">
      <div onClick={e => { e.stopPropagation(); navigate(`/chef/${recipe.chef}`); }}
        className="flex items-center gap-2 mb-3 cursor-pointer hover:opacity-80 transition-opacity w-fit">
        <img src={recipe.chef_profile_picture || DEFAULT_AVATAR} alt={recipe.chef_name}
          onError={onImgError} className="w-6 h-6 rounded-full object-cover border border-gray-200" />
        <span className="text-sm font-bold text-gray-600 truncate hover:text-softGreen-600">{recipe.chef_name}</span>
      </div>
      <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-1 group-hover:text-softGreen-600 transition-colors">{recipe.title}</h3>
      <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-50">
        <div className="flex items-center gap-1 text-sm text-gray-500">
          <Heart className={`w-4 h-4 ${recipe.is_liked_by_user ? 'fill-red-500 text-red-500' : 'text-red-400'}`} /> {recipe.likes_count}
        </div>
        <span className="text-xs bg-softGreen-50 text-softGreen-700 px-2 py-1 rounded-md font-bold">
          {DIET_AR[recipe.diet_type] || recipe.diet_type}
        </span>
      </div>
    </div>
  </div>
);

// ── Restaurant Item Card ──────────────────────────────────────────────────────
const RestaurantItemCard = ({ recipe, onUnsave, navigate }) => {
  const avail = recipe.is_available !== false;
  return (
    <div
      onClick={() => navigate(`/recipes/${recipe.id}`)}
      className="cursor-pointer group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-orange-200 hover:-translate-y-1"
    >
      <div className="relative h-48 overflow-hidden bg-gray-100">
        <img src={recipe.image || DEFAULT_AVATAR} alt={recipe.title}
          onError={onImgError} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />

        {/* Saved badge — always filled orange */}
        <button onClick={e => { e.stopPropagation(); onUnsave(recipe.id); }}
          className="absolute top-3 left-3 p-2 bg-orange-500 rounded-full shadow-md hover:bg-red-500 transition-colors"
          title="إزالة من المحفوظات">
          <Bookmark className="w-4 h-4 text-white fill-white" />
        </button>

        {/* Availability badge */}
        <div className={`absolute top-12 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold text-white shadow-lg backdrop-blur-sm ${avail ? 'bg-green-500/90' : 'bg-red-500/90'}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${avail ? 'bg-white animate-pulse' : 'bg-white/60'}`} />
          {avail ? 'متوفر حالياً' : 'غير متوفر'}
        </div>

        <div className="absolute bottom-3 right-3 bg-orange-500 text-white font-black text-sm px-3 py-1 rounded-xl shadow-lg">
          {recipe.price} EGP
        </div>
        <div className="absolute bottom-3 left-3 bg-white/90 text-gray-800 text-xs px-2 py-1 rounded-lg flex items-center gap-1 font-bold shadow-sm">
          <Clock className="w-3 h-3 text-orange-500" /> {recipe.cooking_time} د
        </div>
      </div>

      <div className="p-4">
        <div onClick={e => { e.stopPropagation(); navigate(`/restaurant/${recipe.restaurant}`); }}
          className="flex items-center gap-2 mb-2 cursor-pointer hover:opacity-80 transition-opacity w-fit">
          <img src={recipe.chef_profile_picture || DEFAULT_AVATAR} alt={recipe.chef_name}
            onError={onImgError} className="w-6 h-6 rounded-full object-cover border border-orange-200" />
          <span className="text-sm font-bold text-gray-600 truncate hover:text-orange-500">{recipe.chef_name}</span>
          <Store className="w-3 h-3 text-orange-400 shrink-0" />
        </div>
        <h3 className="text-base font-bold text-gray-800 mb-2 line-clamp-1 group-hover:text-orange-500 transition-colors">{recipe.title}</h3>
        <div className="flex items-center justify-between pt-3 border-t border-gray-50">
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Heart className={`w-4 h-4 ${recipe.is_liked_by_user ? 'fill-red-500 text-red-500' : 'text-red-400'}`} /> {recipe.likes_count}
          </div>
          <button onClick={e => { e.stopPropagation(); navigate(`/recipes/${recipe.id}`); }}
            disabled={!avail}
            className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${avail ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>
            <ShoppingBag className="w-3.5 h-3.5" />
            {avail ? 'اطلب الآن' : 'غير متاح'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Workout Card ──────────────────────────────────────────────────────────────
const WorkoutCard = ({ video, onUnsave, navigate }) => (
  <div
    onClick={() => navigate(`/workout/${video.id}`)}
    className="cursor-pointer group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-purple-200 hover:-translate-y-1"
  >
    <div className="relative h-48 bg-gray-900 overflow-hidden">
      {video.video_url ? (
        <video src={video.video_url} className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500" muted loop autoPlay playsInline />
      ) : (
        <div className="w-full h-full flex items-center justify-center"><Dumbbell className="w-12 h-12 text-gray-500" /></div>
      )}
      {/* Saved badge — always filled purple */}
      <button onClick={e => { e.stopPropagation(); onUnsave(video.id); }}
        className="absolute top-3 left-3 p-2 bg-purple-500 rounded-full shadow-md hover:bg-red-500 transition-colors"
        title="إزالة من المحفوظات">
        <Bookmark className="w-4 h-4 text-white fill-white" />
      </button>
      <div className={`absolute top-3 right-3 ${DIFF_COLOR[video.difficulty] || 'bg-gray-400'} text-white text-xs font-bold px-2 py-1 rounded-lg`}>
        {DIFF_LABEL[video.difficulty] || video.difficulty}
      </div>
      <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-lg">
        <Flame className="w-3 h-3 text-orange-400" />{video.burned_calories} kcal
      </div>
      <div className="absolute bottom-3 left-3 bg-white/90 text-gray-800 text-xs px-2 py-1 rounded-lg flex items-center gap-1 font-bold shadow-sm">
        <Clock className="w-3 h-3 text-purple-600" />{video.duration} د
      </div>
    </div>
    <div className="p-4">
      <div className="flex items-center gap-2 mb-2">
        <img src={video.trainer_profile_picture || DEFAULT_AVATAR} onError={onImgError} alt={video.trainer_name}
          className="w-5 h-5 rounded-full object-cover border border-gray-200" />
        <span className="text-xs font-bold text-gray-500 truncate">{video.trainer_name}</span>
      </div>
      <h3 className="font-bold text-gray-800 line-clamp-1 group-hover:text-purple-600 transition-colors">{video.title}</h3>
    </div>
  </div>
);

// ── Saved Post Card ────────────────────────────────────────────────────────────
const SavedPostCard = ({ post, onUnsave, navigate }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 relative hover:shadow-md transition-all">
      <button onClick={e => { e.stopPropagation(); onUnsave(post.id); }}
        className="absolute top-3 left-3 p-2 bg-blue-500 rounded-full shadow-md hover:bg-red-500 transition-colors z-10"
        title="إزالة من المحفوظات">
        <Bookmark className="w-4 h-4 text-white fill-white" />
      </button>

      <div className="flex items-center gap-3 mb-3 cursor-pointer" onClick={() => navigate(`/profile/${post.user_id}`)}>
        <img src={post.user_profile_picture || DEFAULT_AVATAR} alt={post.user_name} onError={onImgError} className="w-10 h-10 rounded-full object-cover border border-gray-200" />
        <div>
          <h4 className="font-bold text-gray-800 text-sm hover:text-softGreen-600 transition-colors">{post.user_name}</h4>
        </div>
      </div>
      {post.content && <p className="text-gray-700 text-sm leading-relaxed mb-3 whitespace-pre-wrap">{post.content}</p>}
      {post.image && (
        <div className="mb-3 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 max-h-96 flex items-center justify-center">
          <img src={post.image} alt="Post content" className="max-w-full max-h-96 object-contain" />
        </div>
      )}
  </div>
);

// ── Empty State ───────────────────────────────────────────────────────────────
const EmptyState = ({ icon: Icon, color, text, linkTo, linkText }) => (
  <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
    <div className={`${color} w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5`}>
      <Icon className="w-10 h-10 opacity-60" />
    </div>
    <h2 className="text-xl font-bold text-gray-700 mb-2">{text}</h2>
    <p className="text-gray-400 mb-6">اضغط على أيقونة الحفظ في أي عنصر لتضيفه هنا</p>
    <Link to={linkTo}
      className="bg-softGreen-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-softGreen-700 transition shadow-md">
      {linkText}
    </Link>
  </div>
);

// ── Main Page ─────────────────────────────────────────────────────────────────
const SavedRecipes = () => {
  const [tab,       setTab]       = useState('chef');
  const [chefRec,   setChefRec]   = useState([]);
  const [restRec,   setRestRec]   = useState([]);
  const [workouts,  setWorkouts]  = useState([]);
  const [savedPosts,setSavedPosts]= useState([]);
  const [loading,   setLoading]   = useState(true);
  const navigate = useNavigate();

  // جلب كل المحفوظات مرة واحدة عند تحميل الصفحة
  useEffect(() => {
    const token = localStorage.getItem('token');
    const h = { Authorization: `Token ${token}` };
    setLoading(true);
    Promise.all([
      axios.get(`${API}/recipes/saved/`,             { headers: h }),
      axios.get(`${API}/recipes/saved/restaurants/`, { headers: h }),
      axios.get(`${API}/workouts/saved/`,            { headers: h }),
      axios.get(`${API}/posts/saved/`,               { headers: h }),
    ]).then(([cRes, rRes, wRes, pRes]) => {
      setChefRec(cRes.data);
      setRestRec(rRes.data);
      setWorkouts(Array.isArray(wRes.data) ? wRes.data : (wRes.data.results || []));
      setSavedPosts(pRes.data);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const unsaveChef = useCallback(async (id) => {
    const token = localStorage.getItem('token');
    await axios.post(`${API}/recipes/${id}/save/`, {}, { headers: { Authorization: `Token ${token}` } });
    setChefRec(p => p.filter(r => r.id !== id));
  }, []);

  const unsaveRest = useCallback(async (id) => {
    const token = localStorage.getItem('token');
    await axios.post(`${API}/recipes/${id}/save/`, {}, { headers: { Authorization: `Token ${token}` } });
    setRestRec(p => p.filter(r => r.id !== id));
  }, []);

  const unsaveWorkout = useCallback(async (id) => {
    const token = localStorage.getItem('token');
    await axios.post(`${API}/workouts/${id}/save/`, {}, { headers: { Authorization: `Token ${token}` } });
    setWorkouts(p => p.filter(w => w.id !== id));
  }, []);

  const unsavePost = useCallback(async (id) => {
    const token = localStorage.getItem('token');
    await axios.post(`${API}/posts/${id}/save/`, {}, { headers: { Authorization: `Token ${token}` } });
    setSavedPosts(p => p.filter(post => post.id !== id));
  }, []);

  const total = chefRec.length + restRec.length + workouts.length + savedPosts.length;

  // Tab config
  const TABS = [
    {
      key: 'chef',
      label: 'وصفات الشيفات',
      icon: ChefHat,
      count: chefRec.length,
      activeClass: 'bg-softGreen-50 text-softGreen-700 border-softGreen-500',
      badgeClass: 'bg-softGreen-100 text-softGreen-700',
    },
    {
      key: 'restaurant',
      label: 'مطاعم نعناعة',
      icon: Store,
      count: restRec.length,
      activeClass: 'bg-orange-50 text-orange-600 border-orange-500',
      badgeClass: 'bg-orange-100 text-orange-700',
    },
    {
      key: 'workout',
      label: 'تمارين رياضية',
      icon: Dumbbell,
      count: workouts.length,
      activeClass: 'bg-purple-50 text-purple-700 border-purple-500',
      badgeClass: 'bg-purple-100 text-purple-700',
    },
    {
      key: 'posts',
      label: 'منشورات المجتمع',
      icon: MessageCircle,
      count: savedPosts.length,
      activeClass: 'bg-blue-50 text-blue-700 border-blue-500',
      badgeClass: 'bg-blue-100 text-blue-700',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8" dir="rtl">

      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-softGreen-100 mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <div className="bg-softGreen-100 p-2 rounded-xl">
              <Bookmark className="w-7 h-7 text-softGreen-600 fill-softGreen-200" />
            </div>
            محفوظاتي
          </h1>
          <p className="text-gray-500 mt-1 font-medium">
            {loading ? '...' : `${total} عنصر محفوظ`}
          </p>
        </div>
        <Link to="/explore"
          className="bg-softGreen-50 text-softGreen-700 hover:bg-softGreen-100 px-5 py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center gap-2">
          <ChefHat className="w-4 h-4" /> استكشف المزيد
        </Link>
      </div>

      {/* ── Tabs (4 cols) ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
        <div className="grid grid-cols-2 md:grid-cols-4">
          {TABS.map(({ key, label, icon: Icon, count, activeClass, badgeClass }) => (
            <button key={key} onClick={() => setTab(key)}
              className={`flex items-center justify-center gap-2 py-5 font-bold text-base transition-all border-b-2 ${tab === key ? activeClass : 'text-gray-500 border-transparent hover:bg-gray-50'}`}>
              <Icon className="w-5 h-5" />
              <span className="hidden sm:inline">{label}</span>
              {!loading && count > 0 && (
                <span className={`text-xs font-black px-2 py-0.5 rounded-full ${tab === key ? badgeClass : 'bg-gray-100 text-gray-500'}`}>
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className={`w-10 h-10 animate-spin ${
            tab === 'workout' ? 'text-purple-600' :
            tab === 'restaurant' ? 'text-orange-500' :
            'text-softGreen-600'
          }`} />
        </div>
      ) : tab === 'posts' ? (
        savedPosts.length === 0 ? (
          <EmptyState icon={MessageCircle} color="bg-blue-50 text-blue-400"
            text="لا توجد منشورات محفوظة بعد"
            linkTo="/community" linkText="استكشف مجتمع نعناعة" />
        ) : (
          <div className="max-w-3xl mx-auto space-y-6">
            {savedPosts.map(p => <SavedPostCard key={p.id} post={p} onUnsave={unsavePost} navigate={navigate} />)}
          </div>
        )
      ) : tab === 'chef' ? (
        chefRec.length === 0 ? (
          <EmptyState icon={ChefHat} color="bg-softGreen-50 text-softGreen-400"
            text="لا توجد وصفات محفوظة بعد"
            linkTo="/explore" linkText="استكشف وصفات الشيفات" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {chefRec.map(r => <ChefRecipeCard key={r.id} recipe={r} onUnsave={unsaveChef} navigate={navigate} />)}
          </div>
        )
      ) : tab === 'restaurant' ? (
        restRec.length === 0 ? (
          <EmptyState icon={Store} color="bg-orange-50 text-orange-400"
            text="لا توجد أصناف مطاعم محفوظة بعد"
            linkTo="/explore" linkText="استكشف مطاعم نعناعة" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {restRec.map(r => <RestaurantItemCard key={r.id} recipe={r} onUnsave={unsaveRest} navigate={navigate} />)}
          </div>
        )
      ) : (
        workouts.length === 0 ? (
          <EmptyState icon={Dumbbell} color="bg-purple-50 text-purple-400"
            text="لا توجد تمارين محفوظة بعد"
            linkTo="/explore" linkText="استكشف التمارين الرياضية" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {workouts.map(v => <WorkoutCard key={v.id} video={v} onUnsave={unsaveWorkout} navigate={navigate} />)}
          </div>
        )
      )}
    </div>
  );
};

export default SavedRecipes;
