import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
  Heart, Bookmark, MessageCircle, ArrowRight, Flame, Clock,
  Dumbbell, Send, Loader2, CheckCircle, AlertCircle, User, Edit2, Trash2
} from 'lucide-react';
import { DEFAULT_AVATAR, onImgError } from '../utils/avatar';

const API = 'http://localhost:8000/api';

const DIFF_COLOR = {
  beginner:     'bg-green-500',
  intermediate: 'bg-yellow-500',
  advanced:     'bg-red-500',
};
const DIFF_LABEL = { beginner: 'مبتدئ', intermediate: 'متوسط', advanced: 'محترف' };

// ── Comment Item ────────────────────────────────────────────────────────────
const CommentItem = ({ comment, currentUserId, onDelete, onEdit, editingId, editingContent, setEditingContent, onSave, onCancelEdit }) => (
  <div className="flex gap-3 py-4 border-b border-gray-50 last:border-0">
    <img
      src={comment.user_picture || DEFAULT_AVATAR}
      onError={onImgError}
      alt={comment.user_name}
      className="w-9 h-9 rounded-full object-cover shrink-0 border-2 border-gray-100"
    />
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between gap-2 mb-1">
        <div className="flex items-center gap-2">
          <span className="font-bold text-gray-800 text-sm">{comment.user_name}</span>
          <span className="text-gray-400 text-xs">
            {new Date(comment.created_at).toLocaleDateString('ar-EG', { year:'numeric', month:'short', day:'numeric' })}
          </span>
        </div>
        {currentUserId && comment.user_id === currentUserId && (
          <div className="flex gap-1 shrink-0">
            <button onClick={() => onEdit(comment)}
              className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors" title="تعديل">
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => onDelete(comment.id)}
              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="حذف">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
      {editingId === comment.id ? (
        <div className="flex gap-2 mt-1">
          <input value={editingContent} onChange={e => setEditingContent(e.target.value)}
            className="flex-1 text-sm border border-purple-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
            autoFocus />
          <button onClick={() => onSave(comment.id)}
            className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition">حفظ</button>
          <button onClick={onCancelEdit}
            className="bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-bold px-3 py-1.5 rounded-xl transition">إلغاء</button>
        </div>
      ) : (
        <p className="text-gray-600 text-sm leading-relaxed">{comment.text}</p>
      )}
    </div>
  </div>
);

// ── Main Page ─────────────────────────────────────────────────────────────────
const WorkoutVideoDetail = () => {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const videoRef  = useRef(null);

  const [video,    setVideo]    = useState(null);
  const [comments, setComments] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [liked,    setLiked]    = useState(false);
  const [saved,    setSaved]    = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [submitting,  setSubmitting]  = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [toast, setToast] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingContent,   setEditingContent]   = useState('');

  const token = localStorage.getItem('token');
  // Get current user ID from JWT payload
  const getCurrentUserId = () => {
    if (!token) return null;
    try { return JSON.parse(atob(token.split('.')[1])).user_id; } catch { return null; }
  };
  const currentUserId = getCurrentUserId();

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [vRes, cRes] = await Promise.all([
          axios.get(`${API}/workouts/${id}/`, { headers: token ? { Authorization: `Token ${token}` } : {} }),
          axios.get(`${API}/workouts/${id}/comments/`, { headers: token ? { Authorization: `Token ${token}` } : {} }),
        ]);
        setVideo(vRes.data);
        setLiked(vRes.data.is_liked);
        setSaved(vRes.data.is_saved);
        setLikesCount(vRes.data.likes_count);
        setComments(cRes.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleLike = async () => {
    if (!token) { showToast('يجب تسجيل الدخول أولاً', 'error'); return; }
    try {
      const res = await axios.post(`${API}/workouts/${id}/like/`, {}, { headers: { Authorization: `Token ${token}` } });
      setLiked(res.data.liked);
      setLikesCount(res.data.likes_count);
    } catch { showToast('حدث خطأ', 'error'); }
  };

  const handleSave = async () => {
    if (!token) { showToast('يجب تسجيل الدخول أولاً', 'error'); return; }
    try {
      const res = await axios.post(`${API}/workouts/${id}/save/`, {}, { headers: { Authorization: `Token ${token}` } });
      setSaved(res.data.saved);
      showToast(res.data.saved ? 'تم حفظ التمرين ✅' : 'تم إلغاء الحفظ');
    } catch { showToast('حدث خطأ', 'error'); }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!token) { showToast('يجب تسجيل الدخول أولاً', 'error'); return; }
    if (!commentText.trim()) return;
    setSubmitting(true);
    try {
      const res = await axios.post(`${API}/workouts/${id}/comments/`, { text: commentText }, {
        headers: { Authorization: `Token ${token}` }
      });
      setComments(prev => [res.data, ...prev]);
      setCommentText('');
      showToast('تم إضافة تعليقك ✅');
    } catch { showToast('فشل إرسال التعليق', 'error'); }
    finally { setSubmitting(false); }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('هل تريد حذف هذا التعليق نهائياً؟')) return;
    try {
      await axios.delete(`${API}/workout-comments/${commentId}/`, { headers: { Authorization: `Token ${token}` } });
      setComments(prev => prev.filter(c => c.id !== commentId));
      showToast('تم حذف التعليق ✅');
    } catch { showToast('حدث خطأ أثناء الحذف', 'error'); }
  };

  const handleUpdateComment = async (commentId) => {
    if (!editingContent.trim()) return;
    try {
      const res = await axios.put(`${API}/workout-comments/${commentId}/`,
        { text: editingContent },
        { headers: { Authorization: `Token ${token}` } }
      );
      setComments(prev => prev.map(c => c.id === commentId ? { ...c, text: res.data.text } : c));
      setEditingCommentId(null);
      showToast('تم تعديل التعليق ✅');
    } catch { showToast('حدث خطأ أثناء التعديل', 'error'); }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <Loader2 className="w-12 h-12 animate-spin text-purple-600" />
    </div>
  );

  if (!video) return (
    <div className="text-center py-20">
      <p className="text-gray-500 text-lg">الفيديو غير موجود أو تم حذفه.</p>
      <button onClick={() => navigate('/explore')} className="mt-4 text-purple-600 font-bold hover:underline">← العودة للاستكشاف</button>
    </div>
  );

  const diffColor = DIFF_COLOR[video.difficulty] || 'bg-gray-400';
  const diffLabel = DIFF_LABEL[video.difficulty] || video.difficulty;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6" dir="rtl">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-2xl shadow-xl text-sm font-bold text-white animate-in slide-in-from-top-4 duration-300 ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
          {toast.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {/* Back */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-purple-600 font-bold mb-5 transition group">
        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        عودة
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ── Left: Video + Interaction ── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Video Player */}
          <div className="rounded-3xl overflow-hidden bg-black shadow-2xl shadow-purple-100 aspect-video relative">
            {video.video_url ? (
              <video
                ref={videoRef}
                src={video.video_url}
                controls
                className="w-full h-full object-contain"
                poster=""
                playsInline
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-900">
                <Dumbbell className="w-16 h-16 text-gray-600" />
              </div>
            )}
            {/* Difficulty badge */}
            <div className={`absolute top-4 right-4 ${diffColor} text-white text-xs font-black px-3 py-1.5 rounded-xl shadow-lg`}>
              {diffLabel}
            </div>
          </div>

          {/* Title + Stats */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h1 className="text-2xl font-black text-gray-900 mb-3">{video.title}</h1>
            <div className="flex flex-wrap gap-4 mb-4">
              <div className="flex items-center gap-2 bg-orange-50 px-3 py-2 rounded-xl">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-bold text-orange-700">{video.burned_calories} سعرة</span>
              </div>
              <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-xl">
                <Clock className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-bold text-blue-700">{video.duration} دقيقة</span>
              </div>
              <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${diffColor} bg-opacity-10`}>
                <Dumbbell className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-bold text-gray-700">{diffLabel}</span>
              </div>
            </div>
            {video.description && (
              <p className="text-gray-600 leading-relaxed text-sm">{video.description}</p>
            )}
          </div>

          {/* Interaction Bar */}
          <div className="bg-white rounded-2xl px-5 py-4 shadow-sm border border-gray-100 flex items-center gap-4">
            {/* Like */}
            <button onClick={handleLike}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${liked ? 'bg-red-50 text-red-500 border-2 border-red-200' : 'bg-gray-50 text-gray-500 border-2 border-gray-100 hover:border-red-200 hover:text-red-400'}`}>
              <Heart className={`w-5 h-5 transition-all ${liked ? 'fill-red-500 text-red-500 scale-110' : ''}`} />
              {likesCount > 0 && <span>{likesCount}</span>}
              {liked ? 'أعجبني' : 'إعجاب'}
            </button>

            {/* Save */}
            <button onClick={handleSave}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${saved ? 'bg-purple-50 text-purple-600 border-2 border-purple-200' : 'bg-gray-50 text-gray-500 border-2 border-gray-100 hover:border-purple-200 hover:text-purple-500'}`}>
              <Bookmark className={`w-5 h-5 ${saved ? 'fill-purple-600 text-purple-600' : ''}`} />
              {saved ? 'محفوظ' : 'حفظ'}
            </button>

            {/* Comments toggle */}
            <button onClick={() => setShowComments(v => !v)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm bg-gray-50 text-gray-500 border-2 border-gray-100 hover:border-purple-200 hover:text-purple-500 transition-all">
              <MessageCircle className="w-5 h-5" />
              {comments.length > 0 && <span>{comments.length}</span>}
              تعليق
            </button>
          </div>

          {/* Comments Section */}
          {showComments && (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-black text-gray-800 mb-4 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-purple-600" />
                التعليقات {comments.length > 0 && <span className="bg-purple-100 text-purple-600 text-xs px-2 py-0.5 rounded-full font-bold">{comments.length}</span>}
              </h3>

              {/* Comment form */}
              <form onSubmit={handleComment} className="flex gap-3 mb-5">
                <div className="w-9 h-9 bg-purple-100 rounded-full flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-purple-600" />
                </div>
                <div className="flex-1 flex gap-2">
                  <input
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    placeholder="اكتب تعليقك..."
                    className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
                    disabled={submitting}
                  />
                  <button type="submit" disabled={submitting || !commentText.trim()}
                    className="px-4 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition disabled:opacity-50 flex items-center gap-1.5 font-bold text-sm">
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    إرسال
                  </button>
                </div>
              </form>

              {/* Comments list */}
              {comments.length === 0 ? (
                <div className="text-center py-6">
                  <MessageCircle className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">كن أول من يعلّق!</p>
                </div>
              ) : (
                <div>{comments.map(c => (
                  <CommentItem key={c.id} comment={c}
                    currentUserId={currentUserId}
                    onDelete={handleDeleteComment}
                    onEdit={(c) => { setEditingCommentId(c.id); setEditingContent(c.text); }}
                    editingId={editingCommentId}
                    editingContent={editingContent}
                    setEditingContent={setEditingContent}
                    onSave={handleUpdateComment}
                    onCancelEdit={() => setEditingCommentId(null)}
                  />
                ))}</div>
              )}
            </div>
          )}
        </div>

        {/* ── Right: Trainer Card ── */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 sticky top-6">
            <h3 className="font-black text-gray-700 text-sm mb-4 uppercase tracking-wider">المدرب الرياضي</h3>
            <Link
              to={`/trainer/profile/${video.trainer_id}`}
              className="flex items-center gap-3 mb-4 group cursor-pointer"
              title="عرض بروفايل المدرب"
            >
              <div className="relative">
                <img
                  src={video.trainer_profile_picture || DEFAULT_AVATAR}
                  onError={onImgError}
                  alt={video.trainer_name}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-purple-100 group-hover:border-purple-400 group-hover:scale-105 transition-all duration-200 shadow-sm"
                />
                <div className="absolute inset-0 rounded-2xl bg-purple-600 opacity-0 group-hover:opacity-10 transition-opacity duration-200" />
              </div>
              <div>
                <h4 className="font-black text-gray-900 group-hover:text-purple-600 transition-colors duration-200">
                  {video.trainer_name}
                </h4>
                <span className={`text-xs font-bold text-white px-2 py-0.5 rounded-full mt-1 inline-block ${diffColor}`}>
                  {DIFF_LABEL[video.difficulty] || ''}
                </span>
                <p className="text-xs text-purple-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 font-medium">
                  عرض البروفايل ←
                </p>
              </div>
            </Link>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-orange-50 rounded-xl p-3 text-center">
                <div className="text-lg font-black text-orange-600">{video.burned_calories}</div>
                <div className="text-xs text-gray-500 font-medium">سعرة محروقة</div>
              </div>
              <div className="bg-blue-50 rounded-xl p-3 text-center">
                <div className="text-lg font-black text-blue-600">{video.duration}</div>
                <div className="text-xs text-gray-500 font-medium">دقيقة</div>
              </div>
              <div className="bg-red-50 rounded-xl p-3 text-center col-span-1">
                <div className="text-lg font-black text-red-500">{likesCount}</div>
                <div className="text-xs text-gray-500 font-medium">إعجاب</div>
              </div>
              <div className="bg-purple-50 rounded-xl p-3 text-center col-span-1">
                <div className="text-lg font-black text-purple-600">{comments.length}</div>
                <div className="text-xs text-gray-500 font-medium">تعليق</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkoutVideoDetail;
