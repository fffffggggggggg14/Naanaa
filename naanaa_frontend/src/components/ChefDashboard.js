import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Camera, Save, Loader2, Image as ImageIcon, Plus, Trash2, RefreshCcw, Edit2, Clock, Flame, ShieldAlert, Coffee, UtensilsCrossed } from 'lucide-react';
import { DEFAULT_AVATAR, onImgError } from '../utils/avatar';

const ChefDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [proStatus, setProStatus] = useState(null);
  const [activeTab, setActiveTab] = useState('chef');
  const [userProfile, setUserProfile] = useState(null);

  const emptyForm = {
    title: '',
    description: '',
    ingredients: [''],
    instructions: [''],
    cooking_time: 15,
    price: '',
    is_available: true,
    difficulty_level: '',
    chef_tip: '',
    calories: '',
    protein: '',
    carbs: '',
    fats: '',
    category: 'Lunch',
    diet_type: 'Regular',
    item_type: 'food',   // ← 'food' | 'drink'
    size: '',
    benefits: '',
  };

  const [formData, setFormData] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [myRecipes, setMyRecipes] = useState([]);
  const [editingRecipeId, setEditingRecipeId] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [fetchingRecipes, setFetchingRecipes] = useState(true);

  // ─── Bootstrap ───────────────────────────────────────────────────────────
  useEffect(() => {
    const bootstrap = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const res = await axios.get('http://localhost:8000/api/profile/', {
          headers: { Authorization: `Token ${token}` },
        });
        const profile = res.data;
        setUserProfile(profile);
        const isChef = profile.is_chef;
        const isRest  = profile.is_restaurant;
        if (isChef && isRest)  { setProStatus('dual');       setActiveTab('chef'); }
        else if (isChef)        { setProStatus('chef');        setActiveTab('chef'); }
        else if (isRest)        { setProStatus('restaurant');  setActiveTab('restaurant'); }
        else                    { setProStatus('none'); }
      } catch (err) {
        console.error('Profile fetch error', err);
        setProStatus('none');
      }
    };
    bootstrap();
  }, []);

  useEffect(() => {
    if (proStatus !== null && proStatus !== 'none') fetchMyRecipes(activeTab);
  }, [activeTab, proStatus]); // eslint-disable-line

  useEffect(() => {
    if (location.state?.editRecipe) {
      const r = location.state.editRecipe;
      setEditingRecipeId(r.id);
      setFormData({
        title: r.title,
        description: r.description,
        ingredients: r.ingredients ? r.ingredients.split('\n').filter(Boolean) : [''],
        instructions: r.instructions ? r.instructions.split('\n').filter(Boolean) : [''],
        cooking_time: r.cooking_time,
        price: r.price ?? '',
        is_available: r.is_available ?? true,
        difficulty_level: r.difficulty_level ?? '',
        chef_tip: r.chef_tip ?? '',
        calories: r.calories,
        protein: r.protein,
        carbs: r.carbs,
        fats: r.fats,
        category: r.category,
        diet_type: r.diet_type,
        item_type: r.item_type ?? 'food',
        size: r.size ?? '',
        benefits: r.benefits ?? '',
      });
      setPreviewImage(r.image || null);
      setImageFile(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    if (location.state?.toast) showToast(location.state.toast, 'success');
    window.history.replaceState({}, document.title);
  }, []); // eslint-disable-line

  useEffect(() => {
    if (toast.show) {
      const t = setTimeout(() => setToast({ show: false, message: '', type: '' }), 2500);
      return () => clearTimeout(t);
    }
  }, [toast]);

  // ─── Data ─────────────────────────────────────────────────────────────────
  const fetchMyRecipes = async (tab) => {
    setFetchingRecipes(true);
    try {
      const token = localStorage.getItem('token');
      const resolvedTab = tab || activeTab;
      let url;
      if (resolvedTab === 'restaurant') {
        const profileRes = await axios.get('http://localhost:8000/api/restaurant/profile/', {
          headers: { Authorization: `Token ${token}` },
        });
        url = `http://localhost:8000/api/recipes/?restaurant_id=${profileRes.data.id}`;
      } else {
        const profileRes = await axios.get('http://localhost:8000/api/chef/profile/', {
          headers: { Authorization: `Token ${token}` },
        });
        url = `http://localhost:8000/api/recipes/?chef_id=${profileRes.data.id}`;
      }
      const recipesRes = await axios.get(url);
      setMyRecipes(recipesRes.data);
    } catch (err) {
      console.error('Error fetching recipes', err);
    } finally {
      setFetchingRecipes(false);
    }
  };

  // ─── Helpers ──────────────────────────────────────────────────────────────
  const showToast = (msg, type) => setToast({ show: true, message: msg, type });
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  const handleArrayChange = (field, index, value) => {
    const arr = [...formData[field]];
    arr[index] = value;
    setFormData(prev => ({ ...prev, [field]: arr }));
  };
  const addArrayItem = (field) =>
    setFormData(prev => ({ ...prev, [field]: [...prev[field], ''] }));
  const removeArrayItem = (field, index) =>
    setFormData(prev => {
      const arr = prev[field].filter((_, i) => i !== index);
      return { ...prev, [field]: arr.length ? arr : [''] };
    });
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) { setImageFile(file); setPreviewImage(URL.createObjectURL(file)); }
  };
  const handleClearForm = () => {
    if (editingRecipeId || window.confirm('هل أنت متأكد من تفريغ كافة الحقول؟')) {
      setFormData(emptyForm);
      setImageFile(null);
      setPreviewImage(null);
      setMessage({ type: '', text: '' });
      setEditingRecipeId(null);
    }
  };
  const handleEdit = (recipe) => {
    setEditingRecipeId(recipe.id);
    setFormData({
      title: recipe.title,
      description: recipe.description,
      ingredients: recipe.ingredients ? recipe.ingredients.split('\n').filter(Boolean) : [''],
      instructions: recipe.instructions ? recipe.instructions.split('\n').filter(Boolean) : [''],
      cooking_time: recipe.cooking_time,
      price: recipe.price ?? '',
      is_available: recipe.is_available ?? true,
      difficulty_level: recipe.difficulty_level ?? '',
      chef_tip: recipe.chef_tip ?? '',
      calories: recipe.calories,
      protein: recipe.protein,
      carbs: recipe.carbs,
      fats: recipe.fats,
      category: recipe.category,
      diet_type: recipe.diet_type,
      item_type: recipe.item_type ?? 'food',
      size: recipe.size ?? '',
      benefits: recipe.benefits ?? '',
    });
    setPreviewImage(recipe.image || null);
    setImageFile(null);
    setMessage({ type: '', text: '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const handleDelete = async (recipeId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا العنصر نهائياً؟')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8000/api/recipes/${recipeId}/`, {
        headers: { Authorization: `Token ${token}` },
      });
      setMyRecipes(prev => prev.filter(r => r.id !== recipeId));
      showToast('تم الحذف بنجاح', 'success');
      if (editingRecipeId === recipeId) handleClearForm();
    } catch (err) {
      console.error(err);
      showToast('حدث خطأ أثناء الحذف', 'error');
    }
  };

  // ─── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (key === 'ingredients' || key === 'instructions') {
        data.append(key, formData[key].filter(i => i.trim() !== '').join('\n'));
      } else {
        data.append(key, formData[key]);
      }
    });
    data.append('owner_type', activeTab);
    if (imageFile) data.append('image', imageFile);

    try {
      const token = localStorage.getItem('token');
      if (editingRecipeId) {
        await axios.put(`http://localhost:8000/api/recipes/${editingRecipeId}/`, data, {
          headers: { Authorization: `Token ${token}`, 'Content-Type': 'multipart/form-data' },
        });
        const msg = 'تم تحديث العنصر بنجاح! ✏️';
        setMessage({ type: 'success', text: msg });
        showToast(msg, 'success');
        setEditingRecipeId(null);
        setFormData(emptyForm);
        setImageFile(null);
        setPreviewImage(null);
      } else {
        await axios.post('http://localhost:8000/api/recipes/add/', data, {
          headers: { Authorization: `Token ${token}`, 'Content-Type': 'multipart/form-data' },
        });
        const isDrink = formData.item_type === 'drink';
        const msg = activeTab === 'restaurant'
          ? (isDrink ? 'تم إضافة المشروب للقائمة! 🥤' : 'تم إضافة الصنف للقائمة! 🍽️')
          : (isDrink ? 'تم نشر المشروب الصحي! 🍵'   : 'تم نشر الوصفة! 📤');
        setMessage({ type: 'success', text: msg });
        showToast(msg, 'success');
      }
      fetchMyRecipes(activeTab);
    } catch (error) {
      console.error(error?.response?.data || error);
      if (error.response?.status === 403) {
        setMessage({ type: 'error', text: 'ليس لديك صلاحية. يرجى ترقية حسابك من الإعدادات.' });
      } else {
        setMessage({ type: 'error', text: 'حدث خطأ أثناء العملية.' });
      }
    } finally {
      setLoading(false);
    }
  };

  // ─── Guards ───────────────────────────────────────────────────────────────
  if (proStatus === null) {
    return (
      <div className="flex justify-center items-center h-[60vh] w-full">
        <Loader2 className="w-12 h-12 animate-spin text-softGreen-600" />
      </div>
    );
  }
  if (proStatus === 'none') {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-6 text-center px-4" dir="rtl">
        <ShieldAlert className="w-16 h-16 text-gray-300" />
        <h2 className="text-2xl font-bold text-gray-700">هل تود مشاركة محتواك الصحي مع مجتمع نعناعة؟</h2>
        <p className="text-gray-500 max-w-md">سجّل كشيف أو مطعم لتبدأ في نشر وصفاتك أو قائمة طعامك.</p>
        <button onClick={() => navigate('/settings')}
          className="bg-softGreen-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-softGreen-700 transition shadow-md">
          سجّل كشيف أو مطعم الآن
        </button>
      </div>
    );
  }

  // ─── Derived UI ───────────────────────────────────────────────────────────
  const isRestaurant = activeTab === 'restaurant';
  const isDrink      = formData.item_type === 'drink';
  const btnColor     = isRestaurant
    ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-200'
    : 'bg-softGreen-600 hover:bg-softGreen-700 shadow-softGreen-200';

  // Filter: restaurant sees items with price, chef sees items without price
  const displayedRecipes = myRecipes.filter(r =>
    isRestaurant
      ? (r.price !== null && r.price !== undefined && r.price !== '')
      : (r.price === null || r.price === undefined || r.price === '')
  );

  // Item-type label helpers
  const itemLabel   = isDrink ? 'مشروب' : (isRestaurant ? 'صنف' : 'وصفة');
  const itemEmoji   = isDrink ? '🥤' : (isRestaurant ? '🍽️' : '📤');

  return (
    <div className="max-w-4xl flex-1 mx-auto w-full" dir="rtl">

      {/* ── Dual-Role Tabs ── */}
      {userProfile?.is_chef && userProfile?.is_restaurant && (
        <div className={`flex p-1.5 rounded-2xl mb-8 border max-w-xs mx-auto shadow-sm transition-colors duration-300 ${isRestaurant ? 'bg-orange-50 border-orange-100' : 'bg-gray-50 border-gray-100'}`}>
          <button onClick={() => { handleClearForm(); setActiveTab('chef'); }}
            className={`flex-1 py-3 flex items-center justify-center gap-2 font-bold text-sm rounded-xl transition-all ${activeTab === 'chef' ? 'bg-white shadow border border-gray-100 text-softGreen-600' : 'text-gray-500 hover:bg-white/60'}`}>
            🧑‍🍳 لوحة الشيف
          </button>
          <button onClick={() => { handleClearForm(); setActiveTab('restaurant'); }}
            className={`flex-1 py-3 flex items-center justify-center gap-2 font-bold text-sm rounded-xl transition-all ${activeTab === 'restaurant' ? 'bg-white shadow border border-orange-100 text-orange-500' : 'text-gray-500 hover:bg-white/60'}`}>
            🏠 لوحة المطعم
          </button>
        </div>
      )}

      {/* ── Editor Form ── */}
      <div className={`bg-white rounded-2xl shadow-sm border p-8 mb-12 relative overflow-hidden transition-all duration-300 ${isRestaurant ? 'border-orange-100' : 'border-softGreen-100'}`}>
        {editingRecipeId && (
          <div className="absolute top-0 right-0 left-0 bg-orange-100 text-orange-600 font-bold text-center py-1 text-sm border-b border-orange-200 shadow-sm">
            وضع التعديل قيد التفعيل
          </div>
        )}

        <h2 className={`text-2xl font-bold mb-6 border-b pb-4 ${editingRecipeId ? 'mt-4 text-orange-600 border-orange-100' : isRestaurant ? 'text-orange-600 border-orange-100' : 'text-gray-800 border-gray-100'}`}>
          {editingRecipeId
            ? `تعديل ${itemLabel}`
            : isRestaurant ? `🏠 لوحة المطعم – إضافة ${itemLabel}` : `🧑‍🍳 لوحة الشيف – إضافة ${itemLabel}`}
        </h2>

        {message.text && (
          <div className={`p-4 rounded-xl mb-6 font-medium text-center ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200 animate-pulse' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* ── Item Type Switch (Food / Drink) ── */}
          <div className="flex items-center justify-center gap-2 bg-gray-50 border border-gray-200 rounded-2xl p-1.5 max-w-xs mx-auto">
            <button type="button"
              onClick={() => setFormData(prev => ({ ...prev, item_type: 'food' }))}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all ${!isDrink ? (isRestaurant ? 'bg-orange-500 text-white shadow' : 'bg-softGreen-600 text-white shadow') : 'text-gray-500 hover:bg-gray-100'}`}>
              <UtensilsCrossed className="w-4 h-4" /> طعام
            </button>
            <button type="button"
              onClick={() => setFormData(prev => ({ ...prev, item_type: 'drink' }))}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all ${isDrink ? 'bg-blue-500 text-white shadow' : 'text-gray-500 hover:bg-gray-100'}`}>
              <Coffee className="w-4 h-4" /> مشروب
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Image Upload */}
            <div className="col-span-1 border-2 border-dashed border-gray-200 rounded-2xl p-4 flex flex-col items-center justify-center relative bg-gray-50 hover:bg-gray-100 transition min-h-[300px]">
              {previewImage ? (
                <div className="absolute inset-0 w-full h-full p-2">
                  <img src={previewImage} alt="Preview" className="w-full h-full object-cover rounded-xl shadow-sm" />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-xl">
                    <span className="text-white font-bold text-sm bg-black/50 px-3 py-1 rounded-full">تغيير الصورة</span>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-400">
                  {isDrink ? <Coffee className="w-12 h-12 mx-auto mb-2 opacity-40" /> : <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />}
                  <p className="font-medium text-sm">اضغط لرفع صورة {isDrink ? 'المشروب' : itemLabel}</p>
                </div>
              )}
              <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" required={!previewImage} />
            </div>

            {/* Form Fields */}
            <div className="col-span-2 space-y-4">
              {/* Title + Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {isDrink ? 'اسم المشروب' : `اسم ${isRestaurant ? 'الصنف' : 'الأكلة'}`}
                  </label>
                  <input type="text" name="title" value={formData.title} onChange={handleChange} required
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-softGreen-500 transition-shadow"
                    placeholder={isDrink ? (isRestaurant ? 'مثال: عصير برتقال طازج' : 'مثال: عصير الديتوكس الأخضر') : (isRestaurant ? 'مثال: وجبة دجاج صحي' : 'مثال: سلطة الكينوا')} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {isRestaurant ? 'وقت التجهيز المتوقع (بالدقائق)' : 'وقت التحضير (بالدقائق)'}
                  </label>
                  <input type="number" min="1" name="cooking_time" value={formData.cooking_time} onChange={handleChange} required
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-softGreen-500 transition-shadow" />
                </div>
              </div>

              {/* ── Chef-only fields ── */}
              {!isRestaurant && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-softGreen-50 rounded-xl border border-softGreen-100">
                  {/* Difficulty — food only */}
                  {!isDrink && (
                    <div>
                      <label className="block text-sm font-bold text-softGreen-700 mb-1">🎯 مستوى الصعوبة</label>
                      <select name="difficulty_level" value={formData.difficulty_level} onChange={handleChange}
                        className="w-full px-4 py-2 bg-white border border-softGreen-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-softGreen-500">
                        <option value="">-- اختر المستوى --</option>
                        <option value="Easy">سهل 🟢</option>
                        <option value="Medium">متوسط 🟡</option>
                        <option value="Hard">محترف 🔴</option>
                      </select>
                    </div>
                  )}
                  {/* Benefits — drink only for chef */}
                  {isDrink && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-softGreen-700 mb-1">🌿 الفوائد الصحية للمشروب</label>
                      <textarea name="benefits" value={formData.benefits} onChange={handleChange} rows="2"
                        className="w-full px-4 py-2 bg-white border border-softGreen-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-softGreen-500 resize-none text-sm"
                        placeholder="مثال: يساعد على تعزيز المناعة ويحتوي على مضادات الأكسدة..."></textarea>
                    </div>
                  )}
                  {/* Chef tip — always for chef */}
                  <div className={isDrink ? 'hidden' : ''}>
                    <label className="block text-sm font-bold text-softGreen-700 mb-1">✨ نصيحة الشيف / سر الخلطة</label>
                    <textarea name="chef_tip" value={formData.chef_tip} onChange={handleChange} rows="2"
                      className="w-full px-4 py-2 bg-white border border-softGreen-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-softGreen-500 resize-none text-sm"
                      placeholder="مثال: يُفضّل نقع الكينوا قبل الطهي بساعة..."></textarea>
                  </div>
                </div>
              )}

              {/* ── Restaurant-only fields ── */}
              {isRestaurant && (
                <div className={`grid gap-4 p-4 bg-orange-50 rounded-xl border border-orange-100 ${isDrink ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-2'}`}>
                  {/* Price — always required for restaurant */}
                  <div>
                    <label className="block text-sm font-bold text-orange-600 mb-1">💰 السعر (EGP)</label>
                    <input type="number" step="0.01" min="0" name="price" value={formData.price} onChange={handleChange} required
                      className="w-full px-4 py-2 bg-white border border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 transition-shadow"
                      placeholder="0.00" />
                  </div>
                  {/* Size — drink only */}
                  {isDrink && (
                    <div>
                      <label className="block text-sm font-bold text-orange-600 mb-1">📏 الحجم</label>
                      <select name="size" value={formData.size} onChange={handleChange}
                        className="w-full px-4 py-2 bg-white border border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400">
                        <option value="">-- اختر الحجم --</option>
                        <option value="small">صغير ☕</option>
                        <option value="medium">وسط 🥤</option>
                        <option value="large">كبير 🧊</option>
                      </select>
                    </div>
                  )}
                  {/* Availability toggle */}
                  <div className="flex flex-col justify-center">
                    <label className="block text-sm font-bold text-orange-600 mb-2">📦 حالة التوفر</label>
                    <label className="flex items-center gap-3 cursor-pointer select-none">
                      <div className="relative">
                        <input type="checkbox" checked={formData.is_available}
                          onChange={e => setFormData(prev => ({ ...prev, is_available: e.target.checked }))}
                          className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-300 peer-checked:bg-orange-500 rounded-full transition-colors duration-200"></div>
                        <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow peer-checked:translate-x-5 transition-transform duration-200"></div>
                      </div>
                      <span className={`text-sm font-bold ${formData.is_available ? 'text-orange-600' : 'text-gray-400'}`}>
                        {formData.is_available ? 'متوفر حالياً ✅' : 'غير متوفر ❌'}
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {/* Macros */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[['calories','السعرات الحرارية','kcal'],['protein','البروتين (g)',''],['carbs','الكربوهيدرات (g)',''],['fats','الدهون (g)','']].map(([name,label,ph]) => (
                  <div key={name}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                    <input type="number" step="0.01" name={name} value={formData[name]} onChange={handleChange} required
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-softGreen-500 transition-shadow"
                      placeholder={ph} />
                  </div>
                ))}
              </div>

              {/* Category + Diet */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">التصنيف</label>
                  <select name="category" value={formData.category} onChange={handleChange}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-softGreen-500">
                    <option value="Breakfast">فطور</option>
                    <option value="Lunch">غداء</option>
                    <option value="Dinner">عشاء</option>
                    <option value="Snack">سناك</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">نوع الدايت</label>
                  <select name="diet_type" value={formData.diet_type} onChange={handleChange}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-softGreen-500">
                    <option value="Regular">عادي</option>
                    <option value="Keto">كيتو</option>
                    <option value="Vegan">نباتي</option>
                    <option value="Vegetarian">نباتي (ألبان/بيض)</option>
                    <option value="GlutenFree">خالي من الجلوتين</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الوصف</label>
                <textarea name="description" value={formData.description} onChange={handleChange} required rows="2"
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-softGreen-500 transition-shadow"></textarea>
              </div>

              {/* Ingredients + Instructions */}
              <div className={`grid gap-6 ${isRestaurant || isDrink ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
                <div className="flex flex-col">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {isDrink ? 'المكونات (مشروبك يحتوي على)' : 'المكونات'}
                    {isRestaurant && !isDrink && <span className="text-xs text-orange-500 mr-1">(مهمة للحساسية الغذائية)</span>}
                  </label>
                  <div className="space-y-3">
                    {formData.ingredients.map((ingredient, index) => (
                      <div key={`ing-${index}`} className="flex gap-2 items-start">
                        <input type="text" value={ingredient} onChange={e => handleArrayChange('ingredients', index, e.target.value)}
                          className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-softGreen-500 text-sm"
                          placeholder={`مكون ${index + 1}`} required={index === 0} />
                        {formData.ingredients.length > 1 && (
                          <button type="button" onClick={() => removeArrayItem('ingredients', index)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg shrink-0">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button type="button" onClick={() => addArrayItem('ingredients')}
                    className="mt-3 text-softGreen-600 font-bold text-sm flex items-center gap-1 bg-softGreen-50 hover:bg-softGreen-100 px-3 py-2 rounded-lg self-start shadow-sm">
                    <Plus className="w-4 h-4" /> إضافة مكون
                  </button>
                </div>

                {/* Instructions — chef food only */}
                {!isRestaurant && !isDrink && (
                  <div className="flex flex-col">
                    <label className="block text-sm font-medium text-gray-700 mb-2">طريقة التحضير</label>
                    <div className="space-y-3">
                      {formData.instructions.map((instruction, index) => (
                        <div key={`inst-${index}`} className="flex gap-2 items-start">
                          <span className="mt-2 text-sm font-bold text-gray-400 w-5 text-center shrink-0">{index + 1}.</span>
                          <textarea value={instruction} onChange={e => handleArrayChange('instructions', index, e.target.value)}
                            className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-softGreen-500 text-sm"
                            placeholder={`خطوة ${index + 1}`} rows="2" required={index === 0} />
                          {formData.instructions.length > 1 && (
                            <button type="button" onClick={() => removeArrayItem('instructions', index)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg shrink-0 mt-1">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    <button type="button" onClick={() => addArrayItem('instructions')}
                      className="mt-3 text-softGreen-600 font-bold text-sm flex items-center gap-1 bg-softGreen-50 hover:bg-softGreen-100 px-3 py-2 rounded-lg self-start shadow-sm">
                      <Plus className="w-4 h-4" /> إضافة خطوة
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-6 mt-4 flex items-center justify-between border-t border-gray-100">
            <button type="button" onClick={handleClearForm}
              className={`px-4 py-2 rounded-xl transition flex items-center gap-2 font-medium ${editingRecipeId ? 'text-gray-600 bg-gray-100 hover:bg-gray-200' : 'text-gray-500 hover:text-red-500 hover:bg-red-50'}`}>
              <RefreshCcw className="w-5 h-5" />
              {editingRecipeId ? 'إلغاء التعديل ورجوع' : 'تفريغ الحقول'}
            </button>
            <button type="submit" disabled={loading}
              className={`text-white px-8 py-3 rounded-xl font-bold transition flex items-center gap-2 disabled:bg-gray-400 shadow-md ${isDrink ? 'bg-blue-500 hover:bg-blue-600 shadow-blue-200' : editingRecipeId ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-200' : btnColor}`}>
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {loading
                ? (editingRecipeId ? 'جاري الحفظ...' : 'جاري النشر...')
                : editingRecipeId
                  ? 'حفظ التعديلات'
                  : `${itemEmoji} إضافة ${itemLabel}`}
            </button>
          </div>
        </form>
      </div>

      {/* ── My Items Section ── */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Camera className={`w-6 h-6 ${isRestaurant ? 'text-orange-500' : 'text-softGreen-600'}`} />
            {isRestaurant ? 'قائمة الطعام والمشروبات' : 'وصفاتي ومشروباتي'}
          </h3>
          <span className={`font-bold px-3 py-1 rounded-full text-sm ${isRestaurant ? 'bg-orange-50 text-orange-600' : 'bg-softGreen-50 text-softGreen-700'}`}>
            {displayedRecipes.length} عنصر
          </span>
        </div>

        {fetchingRecipes ? (
          <div className="flex justify-center py-10">
            <Loader2 className={`w-8 h-8 animate-spin ${isRestaurant ? 'text-orange-500' : 'text-softGreen-600'}`} />
          </div>
        ) : displayedRecipes.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
            <ImageIcon className="w-12 h-12 text-gray-300 mb-3 mx-auto" />
            <p className="text-gray-500 font-medium text-lg">لم تضف أي عنصر بعد.</p>
            <p className="text-gray-400 text-sm mt-1">عناصرك ستظهر هنا بمجرد إضافتها.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {displayedRecipes.map(recipe => {
              const recipeIsDrink = recipe.item_type === 'drink';
              return (
                <Link to={`/recipes/${recipe.id}`} key={recipe.id}
                  className="block bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm flex flex-col group relative transition-all duration-300 hover:shadow-xl hover:border-softGreen-200 hover:-translate-y-1">
                  <div className="h-44 overflow-hidden relative bg-gray-50">
                    <img src={recipe.image || DEFAULT_AVATAR}
                      alt={recipe.title} onError={onImgError} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />

                    {/* Edit/Delete */}
                    <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                      <button onClick={ev => { ev.preventDefault(); ev.stopPropagation(); handleEdit(recipe); }}
                        className="p-2.5 bg-white backdrop-blur text-softGreen-600 hover:text-white rounded-xl shadow-lg hover:bg-softGreen-500 transition-all">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={ev => { ev.preventDefault(); ev.stopPropagation(); handleDelete(recipe.id); }}
                        className="p-2.5 bg-white backdrop-blur text-red-500 hover:text-white rounded-xl shadow-lg hover:bg-red-500 transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Food / Drink icon badge */}
                    <div className={`absolute top-3 right-3 flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${recipeIsDrink ? 'bg-blue-500 text-white' : 'bg-white/90 text-gray-700 border border-gray-200'}`}>
                      {recipeIsDrink ? <Coffee className="w-3 h-3" /> : <UtensilsCrossed className="w-3 h-3" />}
                      {recipeIsDrink ? 'مشروب' : 'طعام'}
                    </div>

                    {/* Availability badge for restaurant */}
                    {isRestaurant && (
                      <span className={`absolute bottom-3 right-3 text-xs font-bold px-2 py-1 rounded-full ${recipe.is_available !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                        {recipe.is_available !== false ? 'متوفر ✅' : 'غير متوفر ❌'}
                      </span>
                    )}

                    {/* Size badge for drinks */}
                    {recipeIsDrink && recipe.size && (
                      <span className="absolute bottom-3 left-3 bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full">
                        {recipe.size === 'small' ? 'صغير' : recipe.size === 'medium' ? 'وسط' : 'كبير'}
                      </span>
                    )}
                  </div>

                  <div className="p-5 flex-1 flex flex-col">
                    <h4 className="font-bold text-gray-800 line-clamp-1 mb-2 text-lg group-hover:text-softGreen-600 transition-colors">{recipe.title}</h4>
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2 leading-relaxed flex-1">{recipe.description}</p>
                    <div className="mt-auto flex justify-between items-center text-xs text-gray-500 font-medium pt-4 border-t border-gray-50">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-softGreen-500" /> {recipe.cooking_time} دقيقة
                      </span>
                      {isRestaurant && recipe.price ? (
                        <span className="flex items-center gap-1.5 bg-orange-50 text-orange-600 px-2 py-1 rounded-md font-bold">
                          💰 {recipe.price} EGP
                        </span>
                      ) : recipeIsDrink ? (
                        <span className="flex items-center gap-1.5 bg-blue-50 text-blue-600 px-2 py-1 rounded-md">
                          <Coffee className="w-3.5 h-3.5" /> {recipe.calories} kcal
                        </span>
                      ) : recipe.difficulty_level ? (
                        <span className={`px-2 py-1 rounded-md font-bold text-white ${recipe.difficulty_level === 'Easy' ? 'bg-green-500' : recipe.difficulty_level === 'Medium' ? 'bg-yellow-500' : 'bg-red-500'}`}>
                          {recipe.difficulty_level === 'Easy' ? 'سهل' : recipe.difficulty_level === 'Medium' ? 'متوسط' : 'محترف'}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 bg-orange-50 text-orange-600 px-2 py-1 rounded-md">
                          <Flame className="w-4 h-4" /> {recipe.calories} kcal
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Toast */}
      {toast.show && (
        <div className={`fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-full text-white font-bold shadow-xl transition-all animate-in slide-in-from-bottom-5 duration-300 ${toast.type === 'success' ? 'bg-green-500 shadow-green-200' : 'bg-red-500 shadow-red-200'}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default ChefDashboard;
