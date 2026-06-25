import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowRight, Dumbbell, Clock, Flame, Award,
  Loader2, Play, ShieldCheck, BadgeCheck,
  ChevronDown, ChevronUp, Zap, Star, Globe, ExternalLink, Users
} from 'lucide-react';
import { DEFAULT_AVATAR, onImgError } from '../utils/avatar';

const API = 'http://localhost:8000/api';

const getPlatformInfo = (url) => {
  if (!url) return { label: 'رابط', color: 'from-purple-600 to-indigo-500' };
  if (url.includes('instagram'))  return { label: 'إنستجرام', color: 'from-pink-500 to-purple-600' };
  if (url.includes('facebook'))   return { label: 'فيسبوك',   color: 'from-blue-600 to-blue-500' };
  if (url.includes('twitter') || url.includes('x.com')) return { label: 'تويتر', color: 'from-sky-500 to-blue-400' };
  if (url.includes('youtube'))    return { label: 'يوتيوب',   color: 'from-red-600 to-red-500' };
  if (url.includes('tiktok'))     return { label: 'تيك توك',  color: 'from-gray-900 to-gray-700' };
  if (url.includes('snapchat'))   return { label: 'سناب شات', color: 'from-yellow-400 to-yellow-300' };
  try {
    const domain = new URL(url).hostname.replace('www.', '');
    return { label: domain, color: 'from-purple-600 to-indigo-500' };
  } catch {
    return { label: 'رابط', color: 'from-purple-600 to-indigo-500' };
  }
};

// ── Social Links ────────────────────────────────────────────────────────────────
const SocialLinks = ({ socialLinks }) => {
  if (!socialLinks || !socialLinks.trim()) return null;
  const urls = socialLinks.split('\n').filter(u => u.trim());
  if (urls.length === 0) return null;
  return (
    <div className="mt-4 bg-white border border-purple-100 rounded-2xl p-4 shadow-sm">
      <p className="text-xs text-gray-400 font-bold uppercase mb-3 flex items-center gap-1.5">
        <Globe className="w-3.5 h-3.5" /> تابعني على
      </p>
      <div className="flex flex-wrap gap-2">
        {urls.map((url, i) => {
          const { label, color } = getPlatformInfo(url.trim());
          return (
            <a key={i} href={url.trim()} target="_blank" rel="noopener noreferrer"
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

const DIFF_CONFIG = {
  beginner:     { label: 'مبتدئ',  color: 'bg-green-500',  text: 'text-green-700',  bg: 'bg-green-50'  },
  intermediate: { label: 'متوسط',  color: 'bg-yellow-500', text: 'text-yellow-700', bg: 'bg-yellow-50' },
  advanced:     { label: 'محترف',  color: 'bg-red-500',    text: 'text-red-700',    bg: 'bg-red-50'    },
};

const SPEC_MAP = {
  weight_loss:       { emoji: '🔥', label: 'إنقاص الوزن' },
  muscle_gain:       { emoji: '💪', label: 'بناء العضلات' },
  cardio:            { emoji: '🏃', label: 'كارديو' },
  yoga:              { emoji: '🧘', label: 'يوغا' },
  crossfit:          { emoji: '⚡', label: 'كروس فيت' },
  rehabilitation:    { emoji: '🩺', label: 'تأهيل رياضي' },
  nutrition_fitness: { emoji: '🥗', label: 'لياقة وتغذية' },
  general:           { emoji: '⭐', label: 'لياقة عامة' },
};

// ── Bio with Read More ────────────────────────────────────────────────────────
const BioSection = ({ bio }) => {
  const [expanded, setExpanded] = useState(false);
  const isLong = bio && bio.length > 200;
  if (!bio) return null;
  return (
    <div className="mt-5 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-5 border border-purple-100">
      <div className="flex items-center gap-2 mb-3">
        <Star className="w-4 h-4 text-purple-500" />
        <span className="text-sm font-black text-purple-700">أسلوب التدريب</span>
      </div>
      <p className="text-gray-700 text-sm leading-relaxed">
        {isLong && !expanded ? `${bio.slice(0, 200)}...` : bio}
      </p>
      {isLong && (
        <button onClick={() => setExpanded(v => !v)}
          className="mt-2 flex items-center gap-1 text-purple-600 text-xs font-bold hover:underline">
          {expanded ? <><ChevronUp className="w-3.5 h-3.5" /> عرض أقل</> : <><ChevronDown className="w-3.5 h-3.5" /> اقرأ المزيد</>}
        </button>
      )}
    </div>
  );
};

// ── Verified License Badge ────────────────────────────────────────────────────
const LicenseBadge = ({ number }) => {
  if (!number) return null;
  return (
    <div className="flex items-center gap-2.5 bg-white border-2 border-purple-200 rounded-2xl px-4 py-3 shadow-sm">
      <div className="bg-purple-600 rounded-xl p-1.5">
        <BadgeCheck className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-xs text-gray-400 font-medium">رقم الاعتماد / الرخصة</p>
        <p className="text-sm font-black text-purple-700 tracking-widest">{number}</p>
      </div>
      <div className="mr-auto bg-green-100 text-green-700 text-xs font-black px-2.5 py-1 rounded-full flex items-center gap-1">
        <ShieldCheck className="w-3 h-3" /> موثّق
      </div>
    </div>
  );
};

// ── Video Card ────────────────────────────────────────────────────────────────
const VideoCard = ({ video }) => {
  const navigate = useNavigate();
  const diff = DIFF_CONFIG[video.difficulty] || { label: video.difficulty, color: 'bg-gray-400', text: 'text-gray-700', bg: 'bg-gray-50' };

  return (
    <div onClick={() => navigate(`/workout/${video.id}`)}
      className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group">

      {/* Thumbnail */}
      <div className="aspect-video bg-gradient-to-br from-purple-900 via-indigo-800 to-purple-700 relative overflow-hidden">
        {video.video_url ? (
          <video src={video.video_url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" muted loop autoPlay playsInline />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="bg-white/10 rounded-full p-5 group-hover:scale-110 transition-transform">
              <Play className="w-10 h-10 text-white" />
            </div>
          </div>
        )}
        {/* Difficulty badge */}
        <div className={`absolute top-3 right-3 ${diff.color} text-white text-xs font-black px-2.5 py-1 rounded-lg shadow`}>
          {diff.label}
        </div>
        {/* Duration */}
        <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur text-white text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1">
          <Clock className="w-3 h-3" /> {video.duration} د
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-black text-gray-900 text-sm mb-3 line-clamp-2 leading-snug group-hover:text-purple-700 transition-colors">
          {video.title}
        </h3>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="flex items-center gap-1 text-xs text-orange-600 font-bold bg-orange-50 px-2.5 py-1 rounded-lg">
            <Flame className="w-3.5 h-3.5" /> {video.burned_calories} سعرة
          </span>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${diff.text} ${diff.bg}`}>
            {diff.label}
          </span>
        </div>
      </div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const TrainerPublicProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [trainer,      setTrainer]      = useState(null);
  const [videos,       setVideos]       = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true); setError(null);
      try {
        const headers = token ? { Authorization: `Token ${token}` } : {};
        const [tRes, vRes] = await Promise.all([
          axios.get(`${API}/trainers/${id}/`, { headers }),
          axios.get(`${API}/workouts/?trainer_id=${id}`, { headers }),
        ]);
        setTrainer(tRes.data);
        setVideos(Array.isArray(vRes.data) ? vRes.data : (vRes.data.results || []));
      } catch (e) { console.error(e); setError('تعذّر تحميل بيانات المدرب.'); }
      finally { setLoading(false); }
    })();
  }, [id]);

  const handleToggleFollow = async () => {
    if (!token) return alert('يرجى تسجيل الدخول لمتابعة المدرب');
    setFollowLoading(true);
    try {
      const res = await axios.post(`${API}/trainers/${id}/follow/`, {}, { headers: { Authorization: `Token ${token}` } });
      setTrainer(prev => ({
        ...prev,
        is_followed_by_user: res.data.is_followed,
        followers_count: res.data.followers_count
      }));
    } catch (e) { console.error(e); }
    finally { setFollowLoading(false); }
  };

  if (loading) return <div className="flex justify-center items-center min-h-[60vh]"><Loader2 className="w-12 h-12 animate-spin text-purple-600" /></div>;
  if (error)   return <div className="text-center py-20" dir="rtl"><p className="text-gray-500 mb-4">{error}</p><button onClick={() => navigate(-1)} className="text-purple-600 font-bold hover:underline">← العودة</button></div>;
  if (!trainer) return null;

  const spec    = SPEC_MAP[trainer.specialization] || { emoji: '⭐', label: trainer.specialization_display };
  const totalKcal = videos.reduce((s, v) => s + (v.burned_calories || 0), 0);
  const avgDur    = videos.length ? Math.round(videos.reduce((s, v) => s + (v.duration || 0), 0) / videos.length) : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6" dir="rtl">

      {/* Back */}
      <button onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-purple-600 font-bold mb-6 transition group">
        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /> عودة
      </button>

      {/* ── Hero ── */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-6">

        {/* Gradient banner */}
        <div className="h-36 bg-gradient-to-l from-purple-700 via-indigo-600 to-violet-700 relative">
          <div className="absolute inset-0 opacity-20"
            style={{backgroundImage:'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)', backgroundSize:'24px 24px'}} />
          {/* Specialization pill on banner */}
          <div className="absolute top-4 right-4 bg-white/20 backdrop-blur border border-white/30 text-white text-sm font-black px-4 py-2 rounded-full flex items-center gap-2">
            <span className="text-xl">{spec.emoji}</span> {spec.label}
          </div>
        </div>

        <div className="px-6 pb-6">
          {/* Avatar + name */}
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-5">
            <div className="relative shrink-0 -mt-14">
              <img src={trainer.profile_picture || DEFAULT_AVATAR} onError={onImgError}
                alt={trainer.trainer_name}
                className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-xl" />
              {trainer.is_verified && (
                <div className="absolute -bottom-2 -left-2 bg-purple-600 rounded-full p-1.5 shadow-md">
                  <ShieldCheck className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
            <div className="pb-1 flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl font-black text-gray-900">{trainer.trainer_name}</h1>
                {trainer.is_verified && (
                  <span className="bg-purple-100 text-purple-700 text-xs font-black px-2.5 py-1 rounded-full flex items-center gap-1">
                    <BadgeCheck className="w-3.5 h-3.5" /> مدرب معتمد
                  </span>
                )}
              </div>
              <p className="text-gray-500 font-medium">{spec.emoji} {spec.label}</p>
            </div>

            {/* Follow button */}
            <button onClick={handleToggleFollow} disabled={followLoading}
              className={`shrink-0 flex items-center gap-2 font-black px-5 py-3 rounded-xl transition shadow-lg ${
                trainer.is_followed_by_user
                  ? 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-500 shadow-gray-200'
                  : 'bg-white border-2 border-purple-600 text-purple-700 hover:bg-purple-600 hover:text-white shadow-purple-100'
              }`}>
              {followLoading
                ? <Loader2 className="w-5 h-5 animate-spin" />
                : <Users className="w-5 h-5" />
              }
              {trainer.is_followed_by_user ? 'متابع' : 'متابعة'}
            </button>
          </div>

          {/* License badge */}
          {trainer.license_number && (
            <div className="mb-5">
              <LicenseBadge number={trainer.license_number} />
            </div>
          )}

          {/* Quick stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            {[
              { label: 'فيديوهات', value: videos.length, icon: <Play className="w-5 h-5 text-purple-500" />, bg: 'bg-purple-50', val: 'text-purple-700' },
              { label: 'سنوات خبرة', value: trainer.experience_years, icon: <Award className="w-5 h-5 text-indigo-500" />, bg: 'bg-indigo-50', val: 'text-indigo-700' },
              { label: 'المتابعون', value: trainer.followers_count || 0, icon: <Users className="w-5 h-5 text-pink-500" />, bg: 'bg-pink-50', val: 'text-pink-700' },
              { label: 'إجمالي السعرات', value: `${totalKcal.toLocaleString()}`, icon: <Flame className="w-5 h-5 text-orange-500" />, bg: 'bg-orange-50', val: 'text-orange-700' },
              { label: 'متوسط المدة', value: avgDur ? `${avgDur} د` : '—', icon: <Clock className="w-5 h-5 text-blue-500" />, bg: 'bg-blue-50', val: 'text-blue-700' },
            ].map((s, i) => (
              <div key={i} className={`${s.bg} rounded-2xl p-3 text-center`}>
                <div className="flex justify-center mb-1">{s.icon}</div>
                <div className={`text-lg font-black ${s.val}`}>{s.value}</div>
                <div className="text-xs text-gray-500 font-medium">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Bio */}
          <BioSection bio={trainer.bio} />

          {/* Social Links */}
          <SocialLinks socialLinks={trainer.social_links} />
        </div>
      </div>

      {/* ── Videos Grid ── */}
      <h2 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
        <Dumbbell className="w-5 h-5 text-purple-600" /> فيديوهات التمرين
        {videos.length > 0 && (
          <span className="bg-purple-100 text-purple-700 text-sm font-bold px-2.5 py-0.5 rounded-full">{videos.length}</span>
        )}
      </h2>

      {videos.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
          <Dumbbell className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 font-medium">لا توجد فيديوهات منشورة بعد</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {videos.map(v => <VideoCard key={v.id} video={v} />)}
        </div>
      )}
    </div>
  );
};

export default TrainerPublicProfile;
