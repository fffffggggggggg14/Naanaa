import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import {
  Dumbbell, Clock, Flame, Upload, Loader2, Trash2,
  Video, CheckCircle, AlertCircle, Play, Plus, X, Edit2
} from 'lucide-react';

const API = 'http://localhost:8000/api';
const DIFF = {
  beginner:     { label: 'مبتدئ', color: 'bg-green-100 text-green-700 border-green-200' },
  intermediate: { label: 'متوسط', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  advanced:     { label: 'محترف', color: 'bg-red-100 text-red-700 border-red-200' },
};

// ── Toast ────────────────────────────────────────────────────────────────────
const Toast = ({ message, type, onClose }) => {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl text-sm font-bold animate-in slide-in-from-top-4 duration-300 ${type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
      {type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
      {message}
    </div>
  );
};

// ── Confirm Delete Modal ──────────────────────────────────────────────────────
const ConfirmModal = ({ title, onConfirm, onCancel, loading }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" dir="rtl">
    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 text-center animate-in zoom-in-95 duration-200">
      <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <Trash2 className="w-8 h-8 text-red-500" />
      </div>
      <h3 className="text-xl font-black text-gray-800 mb-2">تأكيد الحذف</h3>
      <p className="text-gray-500 text-sm mb-6">هل أنت متأكد من حذف <span className="font-bold text-gray-700">"{title}"</span>؟<br/>لا يمكن التراجع عن هذا الإجراء.</p>
      <div className="flex gap-3">
        <button onClick={onCancel} disabled={loading} className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition">إلغاء</button>
        <button onClick={onConfirm} disabled={loading} className="flex-1 py-3 rounded-2xl bg-red-500 text-white font-bold hover:bg-red-600 transition flex items-center justify-center gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />} حذف نهائياً
        </button>
      </div>
    </div>
  </div>
);

// ── Video Card ────────────────────────────────────────────────────────────────
const VideoCard = ({ video, onEdit, onDelete }) => {
  const d = DIFF[video.difficulty] || { label: video.difficulty, color: 'bg-gray-100 text-gray-700' };
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div className="relative h-48 bg-gray-900 overflow-hidden">
        {video.video_url
          ? <video src={video.video_url} className="w-full h-full object-cover opacity-90" muted loop autoPlay playsInline />
          : <div className="w-full h-full flex items-center justify-center"><Video className="w-12 h-12 text-gray-500" /></div>}
        <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-lg">
          <Flame className="w-3 h-3 text-orange-400" />{video.burned_calories} kcal
        </div>
        <div className="absolute bottom-3 left-3 bg-white/90 text-gray-800 text-xs px-2 py-1 rounded-lg flex items-center gap-1 font-bold">
          <Clock className="w-3 h-3 text-purple-600" />{video.duration} د
        </div>
        {/* Actions overlay */}
        <div className="absolute top-3 left-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(video)} className="p-2 bg-white/90 backdrop-blur rounded-full text-purple-600 hover:bg-purple-600 hover:text-white transition shadow-sm" title="تعديل">
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => onDelete(video)} className="p-2 bg-white/90 backdrop-blur rounded-full text-red-500 hover:bg-red-500 hover:text-white transition shadow-sm" title="حذف">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-gray-800 line-clamp-1 mb-2">{video.title}</h3>
        {video.description && <p className="text-gray-400 text-xs line-clamp-2 flex-1 mb-2">{video.description}</p>}
        <div className="flex items-center justify-between pt-2 border-t border-gray-50">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${d.color}`}>{d.label}</span>
          <span className="text-xs text-gray-400 flex items-center gap-1"><Dumbbell className="w-3 h-3 text-purple-500" />{video.burned_calories} كالوري</span>
        </div>
      </div>
    </div>
  );
};

// ── Video Form Modal (Upload & Edit) ──────────────────────────────────────────
const VideoFormModal = ({ editVideo, onClose, onSuccess }) => {
  const isEdit = !!editVideo;
  const [title, setTitle]       = useState(editVideo?.title || '');
  const [calories, setCalories] = useState(editVideo?.burned_calories || '');
  const [duration, setDuration] = useState(editVideo?.duration || '');
  const [difficulty, setDiff]   = useState(editVideo?.difficulty || 'beginner');
  const [desc, setDesc]         = useState(editVideo?.description || '');
  const [file, setFile]         = useState(null);
  const [preview, setPreview]   = useState('');
  const [loading, setLoading]   = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError]       = useState('');
  const fileRef = useRef(null);

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isEdit && !file) { setError('يرجى اختيار ملف فيديو.'); return; }
    setLoading(true); setError('');

    const fd = new FormData();
    fd.append('title', title);
    fd.append('burned_calories', calories);
    fd.append('duration', duration);
    fd.append('difficulty', difficulty);
    fd.append('description', desc);
    if (file) fd.append('video_file', file);

    try {
      const token    = localStorage.getItem('token');
      // PATCH للتعديل يذهب لـ /trainer/videos/<id>/delete/ (نفس الـ view)
      // POST للإضافة يذهب لـ /trainer/videos/
      const endpoint = isEdit
        ? `${API}/trainer/videos/${editVideo.id}/delete/`
        : `${API}/trainer/videos/`;
      const method   = isEdit ? 'patch' : 'post';

      const res = await axios[method](endpoint, fd, {
        headers: { Authorization: `Token ${token}` },
        onUploadProgress: (pe) => setProgress(Math.round((pe.loaded * 100) / pe.total)),
      });
      onSuccess(res.data, isEdit);
    } catch (err) {
      setError(err.response?.data?.detail || JSON.stringify(err.response?.data) || 'حدث خطأ أثناء العملية.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" dir="rtl">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isEdit ? <Edit2 className="w-5 h-5" /> : <Upload className="w-5 h-5" />}
            <h2 className="text-lg font-black">{isEdit ? 'تعديل بيانات الفيديو' : 'رفع فيديو تمرين جديد'}</h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/20 rounded-full transition"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 max-h-[75vh] overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* File picker */}
            <div onClick={() => !loading && fileRef.current?.click()}
              className="border-2 border-dashed border-purple-200 rounded-2xl p-4 cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition text-center group">
              {preview
                ? <video src={preview} className="w-full h-36 object-cover rounded-xl" muted />
                : editVideo?.video_url
                  ? <video src={editVideo.video_url} className="w-full h-36 object-cover rounded-xl opacity-60" muted />
                  : <div className="py-5"><Video className="w-10 h-10 text-purple-300 mx-auto mb-2" /><p className="text-sm font-bold text-gray-600">انقر لاختيار فيديو</p><p className="text-xs text-gray-400">MP4, MOV</p></div>}
              {isEdit && !preview && <p className="text-xs text-purple-500 font-bold mt-2">اضغط لاستبدال الفيديو الحالي (اختياري)</p>}
              <input ref={fileRef} type="file" accept="video/mp4,video/quicktime,.mp4,.mov" onChange={handleFile} className="hidden" disabled={loading} />
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">عنوان التمرين *</label>
              <input type="text" required value={title} onChange={e => setTitle(e.target.value)} disabled={loading}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
                placeholder="مثال: تمرين حرق الدهون - 20 دقيقة" />
            </div>

            {/* Calories + Duration */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1 flex items-center gap-1"><Flame className="w-3.5 h-3.5 text-orange-500" />السعرات *</label>
                <input type="number" required min="1" value={calories} onChange={e => setCalories(e.target.value)} disabled={loading}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm" placeholder="300" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1 flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-blue-500" />المدة (دقيقة) *</label>
                <input type="number" required min="1" value={duration} onChange={e => setDuration(e.target.value)} disabled={loading}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm" placeholder="20" />
              </div>
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">مستوى الصعوبة *</label>
              <div className="grid grid-cols-3 gap-2">
                {[['beginner','مبتدئ','bg-green-500'],['intermediate','متوسط','bg-yellow-500'],['advanced','محترف','bg-red-500']].map(([v,l,c]) => (
                  <button key={v} type="button" disabled={loading} onClick={() => setDiff(v)}
                    className={`py-2 rounded-xl text-sm font-bold border-2 transition-all ${difficulty===v ? `${c} text-white border-transparent shadow-md` : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">وصف التمرين (اختياري)</label>
              <textarea rows="2" value={desc} onChange={e => setDesc(e.target.value)} disabled={loading}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm resize-none"
                placeholder="اشرح التمرين بإيجاز..." />
            </div>

            {/* Progress */}
            {loading && progress > 0 && (
              <div>
                <div className="flex justify-between text-xs font-bold text-gray-600 mb-1"><span>جاري الرفع...</span><span>{progress}%</span></div>
                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-300" style={{width:`${progress}%`}} />
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm font-bold">
                <AlertCircle className="w-4 h-4" />{error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black py-3.5 rounded-2xl hover:from-purple-700 hover:to-pink-700 transition flex items-center justify-center gap-2 shadow-lg shadow-purple-200 disabled:opacity-60">
              {loading
                ? <><Loader2 className="w-5 h-5 animate-spin" /> {isEdit ? 'جاري الحفظ...' : `جاري الرفع... ${progress}%`}</>
                : isEdit ? <><Edit2 className="w-5 h-5" /> حفظ التغييرات</> : <><Upload className="w-5 h-5" /> رفع الفيديو</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

// ── Main Dashboard ────────────────────────────────────────────────────────────
const TrainerDashboard = () => {
  const [trainerProfile, setTrainerProfile] = useState(null);
  const [videos, setVideos]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showForm, setShowForm]     = useState(false);
  const [editVideo, setEditVideo]   = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting]     = useState(false);
  const [toast, setToast]           = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
  }, []);

  useEffect(() => {
    (async () => {
      const token = localStorage.getItem('token');
      setLoading(true);
      try {
        const [pRes, vRes] = await Promise.all([
          axios.get(`${API}/trainer/profile/`, { headers: { Authorization: `Token ${token}` } }),
          axios.get(`${API}/trainer/videos/`,  { headers: { Authorization: `Token ${token}` } }),
        ]);
        setTrainerProfile(pRes.data);
        setVideos(vRes.data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  const handleFormSuccess = (savedVideo, isEdit) => {
    if (isEdit) {
      setVideos(prev => prev.map(v => v.id === savedVideo.id ? savedVideo : v));
      showToast('تم تحديث الفيديو بنجاح ✏️');
    } else {
      setVideos(prev => [savedVideo, ...prev]);
      showToast('تم رفع الفيديو بنجاح 🎉');
    }
    setShowForm(false);
    setEditVideo(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API}/trainer/videos/${deleteTarget.id}/delete/`, {
        headers: { Authorization: `Token ${token}` }
      });
      setVideos(prev => prev.filter(v => v.id !== deleteTarget.id));
      showToast(`تم حذف "${deleteTarget.title}" بنجاح 🗑️`);
    } catch {
      showToast('فشل حذف الفيديو. حاول مرة أخرى.', 'error');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  if (loading) return (
    <div className="flex justify-center py-24">
      <Loader2 className="w-12 h-12 animate-spin text-purple-600" />
    </div>
  );

  if (!trainerProfile) return (
    <div className="max-w-lg mx-auto text-center py-20" dir="rtl">
      <div className="bg-purple-50 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
        <Dumbbell className="w-12 h-12 text-purple-500" />
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">لست مدرباً بعد!</h2>
      <p className="text-gray-500 mb-6">سجّل كمدرب معتمد من خلال صفحة الإعدادات.</p>
      <a href="/settings" className="inline-flex items-center gap-2 bg-purple-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-purple-700 transition">
        <Dumbbell className="w-5 h-5" /> اذهب إلى الإعدادات
      </a>
    </div>
  );

  const avgCal = videos.length ? Math.round(videos.reduce((a,v) => a + v.burned_calories, 0) / videos.length) : 0;
  const avgDur = videos.length ? Math.round(videos.reduce((a,v) => a + v.duration, 0) / videos.length) : 0;

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8" dir="rtl">

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="relative bg-gradient-to-br from-purple-700 via-purple-600 to-pink-600 rounded-3xl p-8 mb-8 overflow-hidden text-white shadow-2xl shadow-purple-200">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-pink-500/20 rounded-full -ml-24 -mb-24" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 backdrop-blur p-4 rounded-2xl">
              <Dumbbell className="w-10 h-10 text-white" />
            </div>
            <div>
              <p className="text-purple-200 text-sm font-bold mb-1">لوحة تحكم المدرب الرياضي</p>
              <h1 className="text-3xl font-black">{trainerProfile.trainer_name}</h1>
              <p className="text-purple-200 text-sm mt-1">{trainerProfile.specialization_display} · {trainerProfile.experience_years} سنوات خبرة</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center bg-white/15 backdrop-blur rounded-2xl px-5 py-3">
              <div className="text-2xl font-black">{videos.length}</div>
              <div className="text-xs text-purple-200 font-bold">فيديو مرفوع</div>
            </div>
            <button onClick={() => { setEditVideo(null); setShowForm(true); }}
              className="flex items-center gap-2 bg-white text-purple-700 font-black px-5 py-3 rounded-2xl hover:bg-purple-50 transition shadow-lg">
              <Plus className="w-5 h-5" /> رفع فيديو جديد
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'إجمالي الفيديوهات', value: videos.length, icon: <Video className="w-5 h-5 text-purple-600" />, bg: 'bg-purple-50' },
          { label: 'متوسط السعرات المحروقة', value: videos.length ? `${avgCal} kcal` : '—', icon: <Flame className="w-5 h-5 text-orange-500" />, bg: 'bg-orange-50' },
          { label: 'متوسط مدة التمرين', value: videos.length ? `${avgDur} د` : '—', icon: <Clock className="w-5 h-5 text-blue-500" />, bg: 'bg-blue-50' },
        ].map((s, i) => (
          <div key={i} className={`${s.bg} rounded-2xl p-4 border border-white shadow-sm text-center`}>
            <div className="flex justify-center mb-2">{s.icon}</div>
            <div className="text-xl font-black text-gray-800">{s.value}</div>
            <div className="text-xs text-gray-500 font-medium mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Grid */}
      {videos.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
          <Dumbbell className="w-16 h-16 mx-auto mb-4 text-gray-200" />
          <p className="text-xl font-bold text-gray-500 mb-2">لم ترفع أي فيديوهات بعد</p>
          <p className="text-gray-400 text-sm mb-6">ابدأ بمشاركة تمارينك مع مجتمع نعناعة!</p>
          <button onClick={() => { setEditVideo(null); setShowForm(true); }}
            className="inline-flex items-center gap-2 bg-purple-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-purple-700 transition">
            <Upload className="w-5 h-5" /> ارفع أول فيديو
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {videos.map(v => (
            <VideoCard key={v.id} video={v}
              onEdit={(vid) => { setEditVideo(vid); setShowForm(true); }}
              onDelete={(vid) => setDeleteTarget(vid)} />
          ))}
        </div>
      )}

      {/* Upload / Edit Modal */}
      {showForm && (
        <VideoFormModal
          editVideo={editVideo}
          onClose={() => { setShowForm(false); setEditVideo(null); }}
          onSuccess={handleFormSuccess}
        />
      )}

      {/* Confirm Delete Modal */}
      {deleteTarget && (
        <ConfirmModal
          title={deleteTarget.title}
          loading={deleting}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};

export default TrainerDashboard;
