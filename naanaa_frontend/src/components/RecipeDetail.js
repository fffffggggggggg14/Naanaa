import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Clock, Flame, ChevronRight, Droplets, Wheat, Beef, Heart, Loader2, Send, MessageCircle, Edit2, Trash2, Bookmark } from 'lucide-react';
import { AuthContext } from '../AuthContext';
import { DEFAULT_AVATAR, onImgError } from '../utils/avatar';

const RecipeDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [recipe, setRecipe] = useState(null);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [submittingComment, setSubmittingComment] = useState(false);
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editingContent, setEditingContent]   = useState('');

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        const token = localStorage.getItem('token');
        if (!token) {
            alert('الرجاء تسجيل الدخول لإضافة تعليق');
            return;
        }

        setSubmittingComment(true);
        try {
            const response = await axios.post(
                `http://localhost:8000/api/recipes/${id}/comments/`,
                { content: newComment },
                { headers: { Authorization: `Token ${token}` } }
            );
            
            setRecipe(prev => ({
                ...prev,
                comments: [response.data, ...(prev.comments || [])]
            }));
            setNewComment('');
        } catch (error) {
            console.error('Error submitting comment', error);
            alert('حدث خطأ أثناء إضافة التعليق.');
        } finally {
            setSubmittingComment(false);
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm('هل تريد حذف هذا التعليق نهائياً؟')) return;
        const token = localStorage.getItem('token');
        try {
            await axios.delete(`http://localhost:8000/api/comments/${commentId}/`, {
                headers: { Authorization: `Token ${token}` }
            });
            setRecipe(prev => ({ ...prev, comments: prev.comments.filter(c => c.id !== commentId) }));
        } catch (e) { console.error(e); alert('حدث خطأ أثناء الحذف.'); }
    };

    const handleUpdateComment = async (commentId) => {
        if (!editingContent.trim()) return;
        const token = localStorage.getItem('token');
        try {
            const res = await axios.put(`http://localhost:8000/api/comments/${commentId}/`,
                { content: editingContent },
                { headers: { Authorization: `Token ${token}` } }
            );
            setRecipe(prev => ({
                ...prev,
                comments: prev.comments.map(c => c.id === commentId ? { ...c, content: res.data.content } : c)
            }));
            setEditingCommentId(null);
        } catch (e) { console.error(e); alert('حدث خطأ أثناء التعديل.'); }
    };

    useEffect(() => {
        const fetchRecipe = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`http://localhost:8000/api/recipes/${id}/`, {
                    headers: token ? { Authorization: `Token ${token}` } : {}
                });
                setRecipe(response.data);
            } catch (error) {
                console.error('Error fetching recipe', error);
            } finally {
                setLoading(false);
            }
        };
        fetchRecipe();
    }, [id]);

    const isOwner = user && recipe && user.id === recipe.chef_user_id;

    const handleDelete = async () => {
        if (!window.confirm('هل أنت متأكد من حذف هذه الوصفة نهائياً؟ لا يمكن التراجع عن هذا الإجراء.')) return;
        setDeleting(true);
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:8000/api/recipes/${id}/`, {
                headers: { Authorization: `Token ${token}` }
            });
            navigate('/chef-dashboard', { state: { toast: 'تم حذف الوصفة بنجاح' } });
        } catch (err) {
            console.error('Error deleting recipe', err);
            alert('حدث خطأ أثناء الحذف.');
            setDeleting(false);
        }
    };

    const handleEdit = () => {
        navigate('/chef-dashboard', { state: { editRecipe: recipe } });
    };

    const handleLike = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return alert('يرجى تسجيل الدخول للإعجاب');
            const response = await axios.post(`http://localhost:8000/api/recipes/${id}/like/`, {}, {
                headers: { Authorization: `Token ${token}` }
            });
            setRecipe(prev => ({ ...prev, is_liked_by_user: response.data.liked, likes_count: response.data.likes_count }));
        } catch (err) {
            console.error('Error toggling like', err);
        }
    };

    const handleSave = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return alert('يرجى تسجيل الدخول لحفظ الوصفة');
            const response = await axios.post(`http://localhost:8000/api/recipes/${id}/save/`, {}, {
                headers: { Authorization: `Token ${token}` }
            });
            setRecipe(prev => ({ ...prev, is_saved_by_user: response.data.is_saved, saved_count: response.data.saved_count }));
        } catch (err) {
            console.error('Error toggling save', err);
        }
    };

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-softGreen-600" /></div>;
    if (!recipe) return <div className="text-center py-20 text-gray-500 font-medium">الوصفة غير موجودة.</div>;

    const ingredientsList = recipe.ingredients.split('\n').filter(i => i.trim() !== '');
    const instructionsList = recipe.instructions.split('\n').filter(i => i.trim() !== '');

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8" dir="rtl">
            <Link to="/explore" className="inline-flex items-center gap-1 text-softGreen-600 hover:text-softGreen-700 font-bold mb-6 transition-colors bg-softGreen-50 px-4 py-2 rounded-xl">
                <ChevronRight className="w-5 h-5" /> عودة للاستكشاف
            </Link>

            <div className="bg-white rounded-3xl shadow-sm border border-softGreen-100 overflow-hidden">
                <div className="relative h-64 sm:h-96 w-full">
                    <img src={recipe.image || DEFAULT_AVATAR} alt={recipe.title} onError={onImgError} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 text-white">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="bg-softGreen-500 text-white px-3 py-1 rounded-full text-xs font-bold">{recipe.category === 'Breakfast' ? 'فطور' : recipe.category === 'Lunch' ? 'غداء' : recipe.category === 'Dinner' ? 'عشاء' : 'سناك'}</span>
                            <span className="bg-white/20 backdrop-blur text-white border border-white/20 px-3 py-1 rounded-full text-xs font-bold">{recipe.diet_type === 'Keto' ? 'كيتو' : recipe.diet_type === 'Regular' ? 'عادي' : recipe.diet_type}</span>
                        </div>
                        <h1 className="text-3xl sm:text-5xl font-bold mb-4 drop-shadow-md">{recipe.title}</h1>
                        <div className="flex items-center gap-6 text-sm font-medium">
                            <div className="flex items-center gap-2"><Clock className="w-5 h-5 text-softGreen-300" /> {recipe.cooking_time} دقيقة</div>
                            <div className="flex items-center gap-2"><Flame className="w-5 h-5 text-orange-400" /> {recipe.calories} kcal</div>
                            <button onClick={handleLike} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                                <Heart className={`w-5 h-5 ${recipe.is_liked_by_user ? 'text-red-500 fill-current' : 'text-red-300'}`} /> {recipe.likes_count}
                            </button>
                            <button onClick={handleSave} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                                <Bookmark className={`w-5 h-5 ${recipe.is_saved_by_user ? 'text-yellow-400 fill-current' : 'text-yellow-200'}`} /> {recipe.saved_count}
                            </button>
                        </div>
                    </div>
                    {/* Owner Controls */}
                    {isOwner && (
                        <div className="absolute top-4 left-4 flex gap-2">
                            <button
                                onClick={handleEdit}
                                className="flex items-center gap-2 bg-white/90 backdrop-blur-sm text-softGreen-700 hover:bg-softGreen-500 hover:text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg transition-all duration-200"
                            >
                                <Edit2 className="w-4 h-4" /> تعديل
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleting}
                                className="flex items-center gap-2 bg-white/90 backdrop-blur-sm text-red-600 hover:bg-red-500 hover:text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg transition-all duration-200 disabled:opacity-60"
                            >
                                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />} حذف
                            </button>
                        </div>
                    )}
                </div>

                <div className="p-6 sm:p-8">
                    <div className="flex items-center gap-4 mb-8 pb-8 border-b border-gray-100">
                        <Link
                          to={recipe.restaurant ? `/restaurant/${recipe.restaurant}` : `/chef/${recipe.chef}`}
                          className="group"
                        >
                            <img
                              src={recipe.chef_profile_picture || DEFAULT_AVATAR}
                              alt={recipe.chef_name}
                              onError={onImgError}
                              className="w-14 h-14 rounded-full object-cover shadow-sm border-2 border-softGreen-100 group-hover:border-softGreen-400 group-hover:scale-105 transition-all duration-200"
                            />
                        </Link>
                        <div>
                            <Link
                              to={recipe.restaurant ? `/restaurant/${recipe.restaurant}` : `/chef/${recipe.chef}`}
                              className="font-bold text-gray-800 text-lg hover:text-softGreen-600 transition-colors"
                            >
                              {recipe.chef_name}
                            </Link>
                            <p className="text-sm text-softGreen-600 font-medium">
                              {recipe.restaurant ? '🏪 حساب مطعم موثق' : '👨‍🍳 حساب شيف معتمد'}
                            </p>
                        </div>
                    </div>

                    <p className="text-gray-600 text-lg leading-relaxed mb-8">{recipe.description}</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-6">
                        <div className="col-span-1 md:col-span-2 space-y-10">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">المكونات</h2>
                                <ul className="space-y-4 bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                                    {ingredientsList.map((item, idx) => (
                                        <li key={idx} className="flex items-start gap-4 text-gray-700 text-lg">
                                            <div className="w-2 h-2 rounded-full bg-softGreen-500 mt-2.5 shrink-0 shadow-sm shadow-softGreen-200"></div>
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">طريقة التحضير</h2>
                                <div className="space-y-6">
                                    {instructionsList.map((step, idx) => (
                                        <div key={idx} className="flex gap-5 items-start">
                                            <div className="w-10 h-10 rounded-xl bg-softGreen-100 text-softGreen-700 font-bold flex items-center justify-center shrink-0 shadow-sm border border-softGreen-200">{idx + 1}</div>
                                            <p className="text-gray-700 mt-1.5 leading-relaxed text-lg">{step}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Comments Section */}
                            <div className="pt-8 border-t border-gray-100">
                                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                    <MessageCircle className="w-6 h-6 text-softGreen-500" /> التعليقات
                                </h2>
                                
                                {/* Comment Form */}
                                <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 mb-8 shadow-sm">
                                    <form onSubmit={handleCommentSubmit} className="flex gap-3 sm:gap-4 flex-col sm:flex-row">
                                        <input
                                            type="text"
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            placeholder="أضف تعليقاً..."
                                            className="flex-1 bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-xl focus:ring-softGreen-500 focus:border-softGreen-500 block w-full p-4 transition-colors"
                                            disabled={submittingComment}
                                        />
                                        <button
                                            type="submit"
                                            disabled={submittingComment || !newComment.trim()}
                                            className="bg-softGreen-500 hover:bg-softGreen-600 text-white font-bold py-3 px-6 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center min-w-[120px]"
                                        >
                                            {submittingComment ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-5 h-5 ml-2 rtl:mr-2 rtl:ml-0" /> إرسال</>}
                                        </button>
                                    </form>
                                </div>

                                {/* Comments List */}
                                <div className="space-y-6">
                                    {recipe.comments && recipe.comments.length > 0 ? (
                                        recipe.comments.map((comment) => (
                                            <div key={comment.id} className="flex gap-4 bg-gray-50/50 p-4 sm:p-5 rounded-2xl border border-gray-50">
                                                <img
                                                    src={comment.user_profile_picture || DEFAULT_AVATAR}
                                                    alt={comment.user_name}
                                                    onError={onImgError}
                                                    className="w-12 h-12 rounded-full object-cover shadow-sm border border-gray-200 shrink-0"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start mb-1 gap-2">
                                                        <div>
                                                            <h4 className="font-bold text-gray-800 text-sm">{comment.user_name}</h4>
                                                            <span className="text-xs text-gray-400 font-medium">
                                                                {new Date(comment.created_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        </div>
                                                        {/* Edit/Delete - only for comment owner */}
                                                        {user && comment.user === user.id && (
                                                            <div className="flex gap-1 shrink-0">
                                                                <button
                                                                    onClick={() => { setEditingCommentId(comment.id); setEditingContent(comment.content); }}
                                                                    className="p-1.5 text-gray-400 hover:text-softGreen-600 hover:bg-softGreen-50 rounded-lg transition-colors"
                                                                    title="تعديل">
                                                                    <Edit2 className="w-3.5 h-3.5" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteComment(comment.id)}
                                                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                                    title="حذف">
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                    {/* Inline edit form or text */}
                                                    {editingCommentId === comment.id ? (
                                                        <div className="flex gap-2 mt-2">
                                                            <input
                                                                value={editingContent}
                                                                onChange={e => setEditingContent(e.target.value)}
                                                                className="flex-1 text-sm border border-softGreen-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-softGreen-400"
                                                                autoFocus
                                                            />
                                                            <button onClick={() => handleUpdateComment(comment.id)}
                                                                className="bg-softGreen-500 hover:bg-softGreen-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition">
                                                                حفظ
                                                            </button>
                                                            <button onClick={() => setEditingCommentId(null)}
                                                                className="bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-bold px-3 py-1.5 rounded-xl transition">
                                                                إلغاء
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <p className="text-gray-700 leading-relaxed text-sm whitespace-pre-wrap">{comment.content}</p>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8 text-gray-400 font-medium bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                            لا توجد تعليقات حتى الآن. كن أول من يضيف تعليق!
                                        </div>
                                    )}
                                </div>
                            </div>
                            {/* End Comments Section */}
                        </div>

                        <div className="col-span-1">
                            <div className="bg-white border-2 text-center border-softGreen-50 rounded-2xl p-6 shadow-sm sticky top-24">
                                <h3 className="font-bold text-gray-800 mb-6 text-xl pb-4 border-b border-gray-50">القيم الغذائية</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100 hover:border-softGreen-200 transition-colors">
                                        <div className="flex items-center gap-2 text-gray-600 font-medium"><Heart className={`w-5 h-5 ${recipe.is_liked_by_user ? 'text-red-500 fill-current' : 'text-red-400'}`} /> الإعجابات</div>
                                        <span className="font-bold text-gray-800 text-lg">{recipe.likes_count}</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100 hover:border-softGreen-200 transition-colors">
                                        <div className="flex items-center gap-2 text-gray-600 font-medium"><Bookmark className={`w-5 h-5 ${recipe.is_saved_by_user ? 'text-yellow-500 fill-current' : 'text-yellow-500'}`} /> مرات الحفظ</div>
                                        <span className="font-bold text-gray-800 text-lg">{recipe.saved_count}</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100 hover:border-softGreen-200 transition-colors">
                                        <div className="flex items-center gap-2 text-gray-600 font-medium"><Flame className="w-5 h-5 text-orange-400" /> السعرات</div>
                                        <span className="font-bold text-gray-800 text-lg">{recipe.calories}</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100 hover:border-softGreen-200 transition-colors">
                                        <div className="flex items-center gap-2 text-gray-600 font-medium"><Beef className="w-5 h-5 text-red-400" /> البروتين</div>
                                        <span className="font-bold text-gray-800 text-lg">{recipe.protein} <span className="text-sm font-normal text-gray-500">g</span></span>
                                    </div>
                                    <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100 hover:border-softGreen-200 transition-colors">
                                        <div className="flex items-center gap-2 text-gray-600 font-medium"><Wheat className="w-5 h-5 text-yellow-500" /> الكربوهيدرات</div>
                                        <span className="font-bold text-gray-800 text-lg">{recipe.carbs} <span className="text-sm font-normal text-gray-500">g</span></span>
                                    </div>
                                    <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100 hover:border-softGreen-200 transition-colors">
                                        <div className="flex items-center gap-2 text-gray-600 font-medium"><Droplets className="w-5 h-5 text-yellow-500" /> الدهون</div>
                                        <span className="font-bold text-gray-800 text-lg">{recipe.fats} <span className="text-sm font-normal text-gray-500">g</span></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecipeDetail;
