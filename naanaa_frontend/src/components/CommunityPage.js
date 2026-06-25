import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../AuthContext';
import { Heart, Bookmark, MessageCircle, Image as ImageIcon, Send, Trash2, Edit2, MoreVertical, X, Loader2 } from 'lucide-react';
import { DEFAULT_AVATAR, onImgError } from '../utils/avatar';

const CommunityPage = () => {
  const { user } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPostText, setNewPostText] = useState('');
  const [newPostImage, setNewPostImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isPosting, setIsPosting] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:8000/api/posts/`, {
        headers: token ? { Authorization: `Token ${token}` } : {}
      });
      setPosts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewPostImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setNewPostImage(null);
    setImagePreview(null);
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPostText.trim() && !newPostImage) return;

    setIsPosting(true);
    const token = localStorage.getItem('token');
    if (!token) {
      alert("يجب تسجيل الدخول لنشر مشاركة");
      setIsPosting(false);
      return;
    }

    const formData = new FormData();
    formData.append('content', newPostText);
    if (newPostImage) {
      formData.append('image', newPostImage);
    }

    try {
      const { data } = await axios.post('http://localhost:8000/api/posts/', formData, {
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'multipart/form-data',
        }
      });
      setNewPostText('');
      removeImage();
      setPosts([data, ...posts]);
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء النشر");
    } finally {
      setIsPosting(false);
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
      fetchPosts(); // Rollback on error
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
      fetchPosts(); // Rollback on error
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4" dir="rtl">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <MessageCircle className="w-6 h-6 text-softGreen-600" />
          مجتمع نعناعة
        </h1>
      </div>

      {/* Create Post */}
      {user && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
          <form onSubmit={handleCreatePost}>
            <textarea
              placeholder="بم تفكر؟ شارك يومياتك الصحية..."
              value={newPostText}
              onChange={(e) => setNewPostText(e.target.value)}
              className="w-full bg-gray-50 text-gray-800 border border-gray-200 rounded-xl p-3 mb-3 focus:outline-none focus:ring-2 focus:ring-softGreen-500 resize-none"
              rows="3"
            />
            
            {imagePreview && (
              <div className="relative mb-3 inline-block">
                <img src={imagePreview} alt="Preview" className="h-32 rounded-lg object-cover" />
                <button 
                  type="button" 
                  onClick={removeImage}
                  className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full hover:bg-red-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="flex items-center justify-between border-t border-gray-100 pt-3">
              <label className="cursor-pointer flex items-center gap-2 text-gray-500 hover:text-softGreen-600 font-bold text-sm transition-colors">
                <ImageIcon className="w-5 h-5" />
                إضافة صورة
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleImageChange}
                />
              </label>
              <button 
                type="submit" 
                disabled={isPosting || (!newPostText.trim() && !newPostImage)}
                className="bg-softGreen-600 hover:bg-softGreen-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-2 px-6 rounded-xl flex items-center gap-2 transition-colors"
              >
                {isPosting ? 'جاري النشر...' : (
                  <>
                    نشر <Send className="w-4 h-4 rtl:rotate-180" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Posts List */}
      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-10 flex justify-center">
             <Loader2 className="w-10 h-10 animate-spin text-softGreen-600" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-2xl border border-gray-100 text-gray-500">
            <MessageCircle className="w-12 h-12 mx-auto text-gray-300 mb-2" />
            <p className="font-bold">لا توجد منشورات حتى الآن.</p>
          </div>
        ) : (
          posts.map(post => (
            <PostCard 
              key={post.id} 
              post={post} 
              user={user} 
              onDelete={handleDeletePost}
              onEdit={handleUpdatePost}
              onLike={toggleLike}
              onSave={toggleSave}
            />
          ))
        )}
      </div>

    </div>
  );
};

export const PostCard = ({ post, user, onDelete, onEdit, onLike, onSave }) => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content || '');
  const [editImageFile, setEditImageFile] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState(post.image);
  const [removeImageFlag, setRemoveImageFlag] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const isOwner = user && user.id === post.user_id;

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('ar-EG', options);
  };

  const startEditing = () => {
      setEditContent(post.content || '');
      setEditImagePreview(post.image);
      setEditImageFile(null);
      setRemoveImageFlag(false);
      setIsEditing(true);
      setShowMenu(false);
  };

  const handleEditImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditImageFile(file);
      setRemoveImageFlag(false);
      const reader = new FileReader();
      reader.onloadend = () => setEditImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveEditImage = () => {
    setEditImageFile(null);
    setEditImagePreview(null);
    setRemoveImageFlag(true);
  };

  const saveEdit = () => {
    if (editContent.trim() || editImagePreview) {
        onEdit(post.id, editContent, editImageFile, removeImageFlag);
        setIsEditing(false);
    } else {
        alert("لا يمكن أن يكون المنشور فارغاً");
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(`/profile/${post.user_id}`)} className="shrink-0 group">
            <img 
              src={post.user_profile_picture || DEFAULT_AVATAR} 
              alt={post.user_name} 
              onError={onImgError}
              className="w-10 h-10 rounded-full object-cover border-2 border-transparent group-hover:border-softGreen-500 group-hover:scale-110 transition-all duration-300 shadow-sm"
            />
          </button>
          <div>
            <button onClick={() => navigate(`/profile/${post.user_id}`)} className="hover:text-softGreen-600 transition-colors">
              <h4 className="font-bold text-gray-800 text-sm text-right">{post.user_name}</h4>
            </button>
            <p className="text-xs text-gray-400 text-right">{formatDate(post.created_at)}</p>
          </div>
        </div>

        {isOwner && (
          <div className="relative">
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-50"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
            {showMenu && (
              <div className="absolute left-0 mt-1 w-32 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-10">
                <button 
                  onClick={startEditing}
                  className="w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <Edit2 className="w-4 h-4 text-blue-500" /> تعديل
                </button>
                <button 
                  onClick={() => { setShowMenu(false); onDelete(post.id); }}
                  className="w-full text-right px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" /> حذف
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      {isEditing ? (
        <div className="mb-3">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full bg-gray-50 text-gray-800 border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-softGreen-500 resize-none"
              rows="3"
            />
            {editImagePreview && (
              <div className="relative mb-3 mt-2 inline-block">
                <img src={editImagePreview} alt="Preview" className="h-32 rounded-lg object-cover" />
                <button 
                  type="button" 
                  onClick={handleRemoveEditImage}
                  className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full hover:bg-red-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            <div className="flex items-center justify-between mt-2">
                <label className="cursor-pointer flex items-center gap-2 text-gray-500 hover:text-softGreen-600 font-bold text-sm transition-colors">
                  <ImageIcon className="w-5 h-5" />
                  تغيير الصورة
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleEditImageChange}
                  />
                </label>
                <div className="flex gap-2">
                    <button onClick={() => setIsEditing(false)} className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200">إلغاء</button>
                    <button onClick={saveEdit} className="px-3 py-1 text-sm bg-softGreen-600 text-white rounded-lg hover:bg-softGreen-700">حفظ التعديل</button>
                </div>
            </div>
        </div>
      ) : (
        post.content && (
            <p className="text-gray-700 text-sm leading-relaxed mb-3 whitespace-pre-wrap">
            {post.content}
            </p>
        )
      )}

      {/* Image */}
      {!isEditing && post.image && (
        <div className="mb-3 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 max-h-96 flex items-center justify-center">
          <img 
            src={post.image} 
            alt="Post content" 
            className="max-w-full max-h-96 object-contain"
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex gap-4">
            <button 
            onClick={() => onLike(post.id)}
            className={`flex items-center gap-1.5 text-sm font-bold transition-colors ${post.is_liked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
            >
            <Heart className={`w-5 h-5 ${post.is_liked ? 'fill-current' : ''}`} />
            {post.likes_count}
            </button>
            <button 
            onClick={() => setShowComments(!showComments)}
            className={`flex items-center gap-1.5 text-sm font-bold transition-colors ${showComments ? 'text-blue-500' : 'text-gray-500 hover:text-blue-500'}`}
            >
            <MessageCircle className={`w-5 h-5 ${showComments ? 'fill-current' : ''}`} />
            {post.comments_count}
            </button>
        </div>
        <button 
          onClick={() => onSave(post.id)}
          className={`flex items-center gap-1.5 text-sm font-bold transition-colors ${post.is_saved ? 'text-softGreen-600' : 'text-gray-500 hover:text-softGreen-600'}`}
        >
          <Bookmark className={`w-5 h-5 ${post.is_saved ? 'fill-current' : ''}`} />
          {post.saves_count}
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
          <PostComments postId={post.id} user={user} />
      )}
    </div>
  );
};

export const PostComments = ({ postId, user }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editText, setEditText] = useState('');

    useEffect(() => {
        fetchComments();
    }, []);

    const fetchComments = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`http://localhost:8000/api/posts/${postId}/comments/`, {
                headers: token ? { Authorization: `Token ${token}` } : {}
            });
            setComments(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        
        const token = localStorage.getItem('token');
        if (!token) return alert('يرجى تسجيل الدخول للتعليق');

        try {
            const { data } = await axios.post(`http://localhost:8000/api/posts/${postId}/comments/`, 
                { text: newComment },
                { headers: { Authorization: `Token ${token}` } }
            );
            setComments([data, ...comments]);
            setNewComment('');
        } catch (err) {
            console.error(err);
            alert('حدث خطأ');
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm("حذف التعليق؟")) return;
        const token = localStorage.getItem('token');
        try {
            await axios.delete(`http://localhost:8000/api/post-comments/${commentId}/`, {
                headers: { Authorization: `Token ${token}` }
            });
            setComments(comments.filter(c => c.id !== commentId));
        } catch (err) {
            console.error(err);
        }
    };

    const handleEditSubmit = async (commentId) => {
        if (!editText.trim()) return;
        const token = localStorage.getItem('token');
        try {
            const { data } = await axios.put(`http://localhost:8000/api/post-comments/${commentId}/`, 
                { text: editText },
                { headers: { Authorization: `Token ${token}` } }
            );
            setComments(comments.map(c => c.id === commentId ? data : c));
            setEditingCommentId(null);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="mt-4 pt-4 border-t border-gray-100">
            {user ? (
                <form onSubmit={handleAddComment} className="flex gap-2 mb-4">
                    <input 
                        type="text" 
                        value={newComment} 
                        onChange={e => setNewComment(e.target.value)}
                        placeholder="أضف تعليقاً..."
                        className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-softGreen-500"
                    />
                    <button type="submit" disabled={!newComment.trim()} className="bg-softGreen-600 text-white rounded-full p-2 disabled:opacity-50">
                        <Send className="w-4 h-4 rtl:rotate-180" />
                    </button>
                </form>
            ) : (
                <p className="text-sm text-gray-500 text-center mb-4">قم بتسجيل الدخول لتتمكن من التعليق</p>
            )}

            {loading ? (
                <div className="flex justify-center p-2"><Loader2 className="w-5 h-5 animate-spin text-gray-400" /></div>
            ) : comments.length === 0 ? (
                <p className="text-center text-xs text-gray-400">لا توجد تعليقات بعد</p>
            ) : (
                <div className="space-y-3">
                    {comments.map(c => (
                        <div key={c.id} className="flex gap-2 items-start">
                            <img src={c.user_picture || DEFAULT_AVATAR} alt={c.user_name} onError={onImgError} className="w-8 h-8 rounded-full border border-gray-200" />
                            <div className="flex-1 bg-gray-50 rounded-2xl p-3 relative group">
                                <h5 className="text-xs font-bold text-gray-800 mb-1">{c.user_name}</h5>
                                
                                {editingCommentId === c.id ? (
                                    <div className="flex gap-2 mt-1">
                                        <input 
                                            type="text" 
                                            value={editText} 
                                            onChange={e => setEditText(e.target.value)}
                                            className="flex-1 bg-white border border-gray-200 rounded px-2 py-1 text-sm"
                                        />
                                        <button onClick={() => handleEditSubmit(c.id)} className="text-xs text-softGreen-600 font-bold">حفظ</button>
                                        <button onClick={() => setEditingCommentId(null)} className="text-xs text-gray-500">إلغاء</button>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-700">{c.text}</p>
                                )}

                                {user && user.id === c.user_id && editingCommentId !== c.id && (
                                    <div className="absolute top-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => { setEditingCommentId(c.id); setEditText(c.text); }} className="p-1 text-blue-500 hover:bg-blue-50 rounded"><Edit2 className="w-3 h-3" /></button>
                                        <button onClick={() => handleDeleteComment(c.id)} className="p-1 text-red-500 hover:bg-red-50 rounded"><Trash2 className="w-3 h-3" /></button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CommunityPage;
