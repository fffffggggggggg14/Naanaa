import React, { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { AuthContext } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Camera, Save, Loader2, ChefHat, Store, Truck, Clock, Phone, X, MapPin, Briefcase, Award, Edit, Dumbbell, Globe, ExternalLink } from 'lucide-react';
import { DEFAULT_AVATAR, resolveMediaUrl, onImgError } from '../utils/avatar';


const getPlatformInfo = (url) => {
  if (!url) return { label: 'رابط', color: 'from-softGreen-600 to-emerald-500' };
  if (url.includes('instagram'))  return { label: 'إنستجرام', color: 'from-pink-500 to-purple-600', icon: 'at' };
  if (url.includes('facebook'))   return { label: 'فيسبوك',   color: 'from-blue-600 to-blue-500' };
  if (url.includes('twitter') || url.includes('x.com')) return { label: 'تويتر', color: 'from-sky-500 to-blue-400' };
  if (url.includes('youtube'))    return { label: 'يوتيوب',   color: 'from-red-600 to-red-500' };
  if (url.includes('tiktok'))     return { label: 'تيك توك',  color: 'from-gray-900 to-gray-700' };
  try {
    const domain = new URL(url).hostname.replace('www.', '');
    return { label: domain, color: 'from-softGreen-600 to-emerald-500' };
  } catch {
    return { label: 'رابط', color: 'from-softGreen-600 to-emerald-500' };
  }
};

const Settings = () => {
  const { profile, setProfile } = useContext(AuthContext);
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [bio, setBio] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewImage, setPreviewImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef(null);

  const [chefProfileData, setChefProfileData] = useState(null); 
  const [restProfileData, setRestProfileData] = useState(null);
  
  const [showProModal, setShowProModal] = useState(false);
  const [upgradeType, setUpgradeType] = useState('chef'); // 'chef' or 'restaurant'
  const [isEditMode, setIsEditMode] = useState(false);
  const [proLoading, setProLoading] = useState(false);

  const [chefData, setChefData] = useState({ brand_name: '', specialty: '', experience_years: 0, location: '', bio: '', social_links: '' });
  const [restData, setRestData] = useState({ restaurant_name: '', license_number: '', location_url: '', working_hours: '', cuisine_type: '', contact_number: '', delivery_available: false, social_links: '' });

  // ── Trainer state ──
  const [trainerProfileData, setTrainerProfileData] = useState(null);
  const [trainerData, setTrainerData] = useState({ specialization: 'general', experience_years: 0, bio: '', license_number: '', social_links: '' });
  const SPECIALIZATIONS = [
    { value: 'weight_loss',      label: 'خسارة الوزن' },
    { value: 'muscle_gain',      label: 'بناء العضلات' },
    { value: 'cardio',           label: 'كارديو واللياقة' },
    { value: 'yoga',             label: 'يوغا وتمدد' },
    { value: 'crossfit',         label: 'كروس فت' },
    { value: 'rehabilitation',   label: 'إعادة تأهيل' },
    { value: 'nutrition_fitness',label: 'تغذية ولياقة' },
    { value: 'general',          label: 'لياقة عامة' },
  ];

  useEffect(() => {
    const fetchProfProfiles = async () => {
       if (!profile) return;
       const token = localStorage.getItem('token');
       
       if (profile.is_chef) {
           try {
               const res = await axios.get('http://localhost:8000/api/chef/profile/', { headers: { Authorization: `Token ${token}` }});
               setChefProfileData(res.data);
               setChefData(res.data);
           } catch(e) {}
       } else {
           setChefProfileData(null);
       }
       
       if (profile.is_restaurant) {
           try {
               const res = await axios.get('http://localhost:8000/api/restaurant/profile/', { headers: { Authorization: `Token ${token}` }});
               setRestProfileData({ ...res.data, isRestaurant: true });
               setRestData(res.data);
           } catch(e) {}
       } else {
           setRestProfileData(null);
       }

       if (profile.is_trainer) {
           try {
               const res = await axios.get('http://localhost:8000/api/trainer/profile/', { headers: { Authorization: `Token ${token}` }});
               setTrainerProfileData(res.data);
               setTrainerData(res.data);
           } catch(e) {}
       } else {
           setTrainerProfileData(null);
       }
    };
    fetchProfProfiles();
  }, [profile]);

  const handleProSubmit = async (e) => {
    e.preventDefault();
    setProLoading(true);
    try {
      const token = localStorage.getItem('token');
      let url, method, data;

      if (upgradeType === 'trainer') {
        url = 'http://localhost:8000/api/trainer/profile/';
        method = 'post';
        data = trainerData;
      } else {
        url = upgradeType === 'chef' 
                   ? 'http://localhost:8000/api/chef/profile/' 
                   : 'http://localhost:8000/api/restaurant/profile/';
        method = isEditMode ? 'put' : 'post';
        data = upgradeType === 'chef' ? chefData : restData;
      }
      
      const response = await axios({ method, url, data, headers: { Authorization: `Token ${token}` } });
      
      if (upgradeType === 'trainer') {
         setTrainerProfileData(response.data);
         setProfile({...profile, is_trainer: true});
      } else if (upgradeType === 'restaurant') {
         setRestProfileData({ ...response.data, isRestaurant: true });
         setProfile({...profile, is_restaurant: true});
      } else {
         setChefProfileData(response.data);
         setProfile({...profile, is_chef: true});
      }
      setShowProModal(false);
      setIsEditMode(false);
    } catch (err) {
       console.error("Pro Save Error:", err.response?.data || err.message);
       alert("فشلت عملية الحفظ. يرجى التحقق من صحة البيانات.");
    } finally {
       setProLoading(false);
    }
  };

  const handleDeleteProProfile = async (type) => {
    if (!window.confirm(`هل أنت متأكد من تعطيل حساب ${type === 'chef' ? 'الشيف' : type === 'restaurant' ? 'المطعم' : 'المدرب'}؟ سيتم إخفاء الملف الوصفي وكافة المحتويات المنشورة عن المستخدمين.`)) return;
    try {
      const token = localStorage.getItem('token');
      const url = type === 'chef' 
                 ? 'http://localhost:8000/api/chef/profile/' 
                 : type === 'restaurant'
                 ? 'http://localhost:8000/api/restaurant/profile/'
                 : 'http://localhost:8000/api/trainer/profile/';
      await axios.delete(url, { headers: { Authorization: `Token ${token}` }});
      if (type === 'chef') {
         setChefProfileData(null);
         setProfile({...profile, is_chef: false});
      } else if (type === 'restaurant') {
         setRestProfileData(null);
         setProfile({...profile, is_restaurant: false});
      } else {
         setTrainerProfileData(null);
         setProfile({...profile, is_trainer: false});
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || '');
      setLastName(profile.last_name || '');
      setBio(profile.bio || '');

      setPreviewImage(resolveMediaUrl(profile.profile_picture));
    }
  }, [profile]);


  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
      setPreviewImage(URL.createObjectURL(file));
      setSuccess(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    
    const formData = new FormData();
    formData.append('first_name', firstName);
    formData.append('last_name', lastName);
    formData.append('bio', bio);
    if (profilePicture) {
      formData.append('profile_picture', profilePicture);
    }

    try {
      const response = await axios.put('http://localhost:8000/api/profile/update/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setProfile(response.data);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        navigate('/');
      }, 1000);
    } catch (error) {
      console.error('Error updating profile:', error.response?.data || error.message);
      alert("فشلت عملية حفظ الحساب الأساسي.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-softGreen-100 p-8" dir="rtl">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b border-gray-100 pb-4">إعدادات الحساب</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6 border-b border-gray-100 pb-6">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-50 flex items-center justify-center">
              <img src={previewImage || DEFAULT_AVATAR} alt="Preview" onError={onImgError} className="w-full h-full object-cover" />
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 bg-softGreen-600 p-2.5 rounded-full text-white shadow-lg hover:bg-softGreen-700 transition"
            >
              <Camera className="w-5 h-5" />
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageChange} 
              className="hidden" 
              accept="image/*" 
            />
          </div>
          <div className="flex-1 space-y-2 mt-4 sm:mt-0 text-center sm:text-right">
            <h3 className="font-bold text-gray-800">الصورة الشخصية</h3>
            <p className="text-sm text-gray-500">اختر صورة تعبر عنك لتعرض في صفحتك وفي القائمة العلوية.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">الاسم الأول</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-softGreen-500 transition-all"
              placeholder="الاسم الأول"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">الاسم الأخير</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-softGreen-500 transition-all"
              placeholder="الاسم الأخير"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">نبذة تعريفية (Bio)</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows="4"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-softGreen-500 transition-all resize-none"
            placeholder="اكتب نبذة قصيرة عنك..."
          ></textarea>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-softGreen-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-softGreen-700 transition flex items-center gap-2 disabled:bg-gray-400"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {loading ? 'جاري الحفظ...' : 'حفظ التعديلات'}
          </button>
        </div>

        {success && (
          <div className="bg-green-50 text-green-700 p-4 rounded-xl border border-green-200 text-center font-medium animate-in fade-in zoom-in-95">
            تم حفظ الإعدادات بنجاح!
          </div>
        )}
      </form>

      {/* Upgrade to Pro Section */}
      <div className="mt-12 pt-8 border-t border-gray-100 w-full">
         <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Briefcase className="text-softGreen-600 w-6 h-6" /> إدارة الحسابات المهنية
         </h3>
         
         <div className="flex flex-col gap-8 w-full">
            
            {/* --- Chef Section --- */}
            {!chefProfileData ? (
               <div onClick={() => { setUpgradeType('chef'); /* */ setIsEditMode(false); setShowProModal(true); }} className="bg-gray-50 border border-transparent hover:border-softGreen-200 rounded-2xl p-6 transition-all hover:shadow-lg cursor-pointer group flex items-start gap-6 relative overflow-hidden">
                   <div className="bg-white p-4 rounded-2xl shadow-sm relative z-10 group-hover:scale-110 transition-transform shrink-0">
                       <ChefHat className="w-8 h-8 text-orange-500" />
                   </div>
                   <div className="relative z-10 flex-1">
                       <h4 className="text-lg font-bold text-gray-800 mb-2">رخصة شيف محترف</h4>
                       <p className="text-gray-500 text-sm leading-relaxed mb-4">شارك إبداعك ووصفاتك الصحية مع مجتمع نعناعة. احصل على رخصتك وابدأ رحلتك لتكون الشيف المفضل للآلاف.</p>
                       <span className="inline-block px-5 py-2 bg-softGreen-50 text-softGreen-700 font-bold rounded-xl group-hover:bg-softGreen-600 group-hover:text-white transition-colors text-sm">ترقية إلى شيف</span>
                   </div>
               </div>
            ) : (
               <div className="relative bg-white border-2 border-softGreen-100 rounded-3xl overflow-hidden shadow-lg w-full">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-softGreen-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
                  <div className="relative p-6 sm:p-8">
                     <div className="flex justify-between items-start mb-6 w-full">
                        <div className={`text-white px-3 py-1 rounded-lg text-xs font-black tracking-widest flex items-center gap-1 shadow-sm ${chefProfileData.is_verified ? 'bg-softGreen-600' : 'bg-orange-400'}`}>
                           {chefProfileData.is_verified ? <Award className="w-3 h-3 text-yellow-300" /> : <Clock className="w-3 h-3 text-orange-100" />}
                           رخصة شيف {chefProfileData.is_verified ? 'معتمدة' : 'تحت المراجعة'}
                        </div>
                        <ChefHat className="w-7 h-7 text-softGreen-600 shrink-0" />
                     </div>
                     <div className="space-y-6">
                        <div>
                           <h4 className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">اسم الشيف / البراند</h4>
                           <div className="text-2xl font-black text-gray-800">{chefProfileData.brand_name}</div>
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                           <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                              <h4 className="text-[10px] text-gray-400 font-bold uppercase mb-1">التخصص</h4>
                              <div className="text-sm font-bold text-gray-700">{chefProfileData.specialty}</div>
                           </div>
                           <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                              <h4 className="text-[10px] text-gray-400 font-bold uppercase mb-1">الخبرة</h4>
                              <div className="text-sm font-bold text-gray-700">{chefProfileData.experience_years} سنوات</div>
                           </div>
                           <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 lg:col-span-2">
                              <h4 className="text-[10px] text-gray-400 font-bold uppercase mb-1">الموقع</h4>
                              <div className="text-sm font-bold text-gray-700">{chefProfileData.location}</div>
                           </div>
                        </div>
                        {chefProfileData.bio && (
                          <div className="pt-2 border-t border-dashed border-gray-200">
                             <p className="text-sm text-gray-600 italic">"{chefProfileData.bio}"</p>
                          </div>
                        )}
                        {chefProfileData.social_links && chefProfileData.social_links.trim() && (
                           <div className="pt-3 border-t border-dashed border-gray-200">
                             <h4 className="text-[10px] text-gray-400 font-bold uppercase mb-2">روابط التواصل</h4>
                             <div className="flex flex-wrap gap-2">
                               {chefProfileData.social_links.split('\n').filter(l => l.trim()).map((url, i) => {
                                 const { label, color } = getPlatformInfo(url.trim());
                                 return (
                                   <a key={i} href={url.trim()} target="_blank" rel="noopener noreferrer"
                                     className={`inline-flex items-center gap-1.5 bg-gradient-to-l ${color} text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200`}>
                                     <Globe className="w-3 h-3" />
                                     <span>{label}</span>
                                     <ExternalLink className="w-3 h-3 opacity-70" />
                                   </a>
                                 );
                               })}
                             </div>
                           </div>
                         )}
                        <div className="flex gap-3 mt-4">
                           <button onClick={() => { setUpgradeType('chef'); setIsEditMode(true); setShowProModal(true); }} className="flex-1 bg-softGreen-50 text-softGreen-700 hover:bg-softGreen-600 hover:text-white py-2.5 rounded-xl font-bold transition-colors flex justify-center items-center gap-2 text-sm">
                              <Edit className="w-4 h-4" /> تعديل بيانات الشيف
                           </button>
                           <button onClick={() => handleDeleteProProfile('chef')} className="px-4 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-colors shrink-0 outline-none flex justify-center items-center group relative overflow-visible" title="إلغاء حساب الشيف">
                              <X className="w-5 h-5 absolute z-10 bg-transparent group-hover:scale-110 group-hover:rotate-90 transition-transform duration-300" />
                              <div className="h-5 w-5 bg-transparent group-hover:bg-red-500 transition-colors rounded-full -z-0"></div>
                           </button>
                        </div>
                     </div>
                  </div>
                  <div className="bg-softGreen-600 h-1.5 w-full"></div>
               </div>
            )}

            {/* --- Restaurant Section --- */}
            {!restProfileData ? (
               <div onClick={() => { setUpgradeType('restaurant'); setIsEditMode(false); setShowProModal(true); }} className="bg-gray-50 border border-transparent hover:border-softGreen-200 rounded-2xl p-6 transition-all hover:shadow-lg cursor-pointer group flex items-start gap-6 relative overflow-hidden">
                   <div className="bg-white p-4 rounded-2xl shadow-sm relative z-10 group-hover:scale-110 transition-transform shrink-0">
                       <Store className="w-8 h-8 text-softGreen-600" />
                   </div>
                   <div className="relative z-10 flex-1">
                       <h4 className="text-lg font-bold text-gray-800 mb-2">رخصة مطعم معتمد</h4>
                       <p className="text-gray-500 text-sm leading-relaxed mb-4">اعرض قائمة طعامك الصحية ووصل لعملائك بسهولة. أدر منتجاتك واستقبل الطلبات بطريقة احترافية.</p>
                       <span className="inline-block px-5 py-2 bg-softGreen-50 text-softGreen-700 font-bold rounded-xl group-hover:bg-softGreen-600 group-hover:text-white transition-colors text-sm">ترقية إلى مطعم</span>
                   </div>
               </div>
            ) : (
               <div className="relative bg-white border-2 border-softGreen-100 rounded-3xl overflow-hidden shadow-lg w-full">
                  <div className="absolute top-0 left-0 w-32 h-32 bg-orange-50 rounded-full -ml-16 -mt-16 opacity-50"></div>
                  <div className="relative p-6 sm:p-8">
                     <div className="flex justify-between items-start mb-6 w-full">
                        <div className={`text-white px-3 py-1 rounded-lg text-xs font-black tracking-widest flex items-center gap-1 shadow-sm ${restProfileData.is_verified ? 'bg-softGreen-600' : 'bg-orange-400'}`}>
                           {restProfileData.is_verified ? <Award className="w-3 h-3 text-yellow-300" /> : <Clock className="w-3 h-3 text-orange-100" />}
                           رخصة مطعم {restProfileData.is_verified ? 'معتمدة' : 'تحت المراجعة'}
                        </div>
                        <Store className="w-7 h-7 text-softGreen-600 shrink-0" />
                     </div>
                     <div className="space-y-6">
                        <div>
                           <h4 className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">اسم المطعم / المنشأة</h4>
                           <div className="text-2xl font-black text-gray-800">{restProfileData.restaurant_name}</div>
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                           <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                              <h4 className="text-[10px] text-gray-400 font-bold uppercase mb-1">نوع المطبخ</h4>
                              <div className="text-sm font-bold text-gray-700">{restProfileData.cuisine_type}</div>
                           </div>
                           <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                              <h4 className="text-[10px] text-gray-400 font-bold uppercase mb-1">ساعات العمل</h4>
                              <div className="text-sm font-bold text-gray-700" dir="ltr">{restProfileData.working_hours}</div>
                           </div>
                           <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                              <h4 className="text-[10px] text-gray-400 font-bold uppercase mb-1">رقم الترخيص</h4>
                              <div className="text-sm font-bold text-gray-700">{restProfileData.license_number}</div>
                           </div>
                           <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                              <h4 className="text-[10px] text-gray-400 font-bold uppercase mb-1">التوصيل</h4>
                              <div className="text-sm font-bold text-gray-700">{restProfileData.delivery_available ? 'متاح' : 'غير متاح'}</div>
                           </div>
                        </div>
                        {(restProfileData.location_url && restProfileData.location_url.trim()) && (
                           <div className="pt-3 border-t border-dashed border-gray-200">
                             <h4 className="text-[10px] text-gray-400 font-bold uppercase mb-2">مواقع على الخريطة</h4>
                             <div className="flex flex-wrap gap-2">
                               {restProfileData.location_url.split('\n').filter(l => l.trim()).map((url, i) => (
                                 <a key={i} href={url.trim()} target="_blank" rel="noopener noreferrer"
                                   className="inline-flex items-center gap-1.5 bg-gradient-to-l from-orange-500 to-amber-400 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                                   <MapPin className="w-3 h-3" />
                                   <span>الموقع {i + 1}</span>
                                   <ExternalLink className="w-3 h-3 opacity-70" />
                                 </a>
                               ))}
                             </div>
                           </div>
                         )}
                        {(restProfileData.social_links && restProfileData.social_links.trim()) && (
                           <div className="pt-3 border-t border-dashed border-gray-200">
                             <h4 className="text-[10px] text-gray-400 font-bold uppercase mb-2">روابط التواصل</h4>
                             <div className="flex flex-wrap gap-2">
                               {restProfileData.social_links.split('\n').filter(l => l.trim()).map((url, i) => {
                                 const { label, color } = getPlatformInfo(url.trim());
                                 return (
                                   <a key={i} href={url.trim()} target="_blank" rel="noopener noreferrer"
                                     className={`inline-flex items-center gap-1.5 bg-gradient-to-l ${color} text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200`}>
                                     <Globe className="w-3 h-3" />
                                     <span>{label}</span>
                                     <ExternalLink className="w-3 h-3 opacity-70" />
                                   </a>
                                 );
                               })}
                             </div>
                           </div>
                         )}
                        <div className="flex gap-3 mt-4">
                           <button onClick={() => { setUpgradeType('restaurant'); setIsEditMode(true); setShowProModal(true); }} className="flex-1 bg-softGreen-50 text-softGreen-700 hover:bg-softGreen-600 hover:text-white py-2.5 rounded-xl font-bold transition-colors flex justify-center items-center gap-2 text-sm">
                              <Edit className="w-4 h-4" /> تعديل بيانات المطعم
                           </button>
                           <button onClick={() => handleDeleteProProfile('restaurant')} className="px-4 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-colors shrink-0 outline-none flex justify-center items-center group relative overflow-visible" title="إلغاء حساب المطعم">
                              <X className="w-5 h-5 absolute z-10 bg-transparent group-hover:scale-110 group-hover:rotate-90 transition-transform duration-300" />
                              <div className="h-5 w-5 bg-transparent group-hover:bg-red-500 transition-colors rounded-full -z-0"></div>
                           </button>
                        </div>
                     </div>
                  </div>
                  <div className="bg-softGreen-600 h-1.5 w-full"></div>
               </div>
            )}
            
         </div>

            {/* --- Trainer Section --- */}
            {!trainerProfileData ? (
               <div onClick={() => { setUpgradeType('trainer'); setIsEditMode(false); setShowProModal(true); }} className="bg-gray-50 border border-transparent hover:border-purple-200 rounded-2xl p-6 transition-all hover:shadow-lg cursor-pointer group flex items-start gap-6 relative overflow-hidden">
                   <div className="bg-white p-4 rounded-2xl shadow-sm relative z-10 group-hover:scale-110 transition-transform shrink-0">
                       <Dumbbell className="w-8 h-8 text-purple-600" />
                   </div>
                   <div className="relative z-10 flex-1">
                       <h4 className="text-lg font-bold text-gray-800 mb-2">رخصة مدرب رياضي معتمد</h4>
                       <p className="text-gray-500 text-sm leading-relaxed mb-4">شارك تمارينك ورفع فيديوهاتك الرياضية لتساعد الآلاف على تحقيق أهدافهم الصحية. احصل على رخصتك كمدرب معتمد في نعناعة.</p>
                       <span className="inline-block px-5 py-2 bg-purple-50 text-purple-700 font-bold rounded-xl group-hover:bg-purple-600 group-hover:text-white transition-colors text-sm">ترقية إلى مدرب</span>
                   </div>
               </div>
            ) : (
               <div className="relative bg-white border-2 border-purple-100 rounded-3xl overflow-hidden shadow-lg w-full">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
                  <div className="relative p-6 sm:p-8">
                     <div className="flex justify-between items-start mb-6 w-full">
                        <div className={`text-white px-3 py-1 rounded-lg text-xs font-black tracking-widest flex items-center gap-1 shadow-sm ${trainerProfileData.is_verified ? 'bg-purple-600' : 'bg-orange-400'}`}>
                           {trainerProfileData.is_verified ? <Award className="w-3 h-3 text-yellow-300" /> : <Clock className="w-3 h-3 text-orange-100" />}
                           رخصة مدرب {trainerProfileData.is_verified ? 'معتمدة' : 'تحت المراجعة'}
                        </div>
                        <Dumbbell className="w-7 h-7 text-purple-600 shrink-0" />
                     </div>
                     <div className="space-y-6">
                        <div>
                           <h4 className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">التخصص</h4>
                           <div className="text-2xl font-black text-gray-800">{trainerProfileData.specialization_display}</div>
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                           <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                              <h4 className="text-[10px] text-gray-400 font-bold uppercase mb-1">سنوات الخبرة</h4>
                              <div className="text-sm font-bold text-gray-700">{trainerProfileData.experience_years} سنوات</div>
                           </div>
                           <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                              <h4 className="text-[10px] text-gray-400 font-bold uppercase mb-1">رقم الاعتماد</h4>
                              <div className="text-sm font-bold text-gray-700">{trainerProfileData.license_number || '—'}</div>
                           </div>
                        </div>
                        {trainerProfileData.bio && (
                          <div className="pt-2 border-t border-dashed border-gray-200">
                             <p className="text-sm text-gray-600 italic">"{trainerProfileData.bio}"</p>
                          </div>
                        )}
                        {(trainerProfileData.social_links && trainerProfileData.social_links.trim()) && (
                           <div className="pt-3 border-t border-dashed border-purple-100">
                             <h4 className="text-[10px] text-gray-400 font-bold uppercase mb-2">تابعني على</h4>
                             <div className="flex flex-wrap gap-2">
                               {trainerProfileData.social_links.split('\n').filter(l => l.trim()).map((url, i) => {
                                 const { label, color } = getPlatformInfo(url.trim());
                                 return (
                                   <a key={i} href={url.trim()} target="_blank" rel="noopener noreferrer"
                                     className={`inline-flex items-center gap-1.5 bg-gradient-to-l ${color} text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200`}>
                                     <Globe className="w-3 h-3" />
                                     <span>{label}</span>
                                     <ExternalLink className="w-3 h-3 opacity-70" />
                                   </a>
                                 );
                               })}
                             </div>
                           </div>
                         )}
                        <div className="flex gap-3 mt-4">
                           <button onClick={() => { setUpgradeType('trainer'); setIsEditMode(true); setShowProModal(true); }} className="flex-1 bg-purple-50 text-purple-700 hover:bg-purple-600 hover:text-white py-2.5 rounded-xl font-bold transition-colors flex justify-center items-center gap-2 text-sm">
                              <Edit className="w-4 h-4" /> تعديل بيانات المدرب
                           </button>
                           <button onClick={() => handleDeleteProProfile('trainer')} className="px-4 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-colors shrink-0 outline-none flex justify-center items-center group relative overflow-visible" title="إلغاء حساب المدرب">
                              <X className="w-5 h-5 absolute z-10 bg-transparent group-hover:scale-110 group-hover:rotate-90 transition-transform duration-300" />
                              <div className="h-5 w-5 bg-transparent group-hover:bg-red-500 transition-colors rounded-full -z-0"></div>
                           </button>
                        </div>
                     </div>
                  </div>
                  <div className="bg-purple-600 h-1.5 w-full"></div>
               </div>
            )}
      </div>

      {/* Pro Upgrade Modal */}
      {showProModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 p-4" dir="rtl">
          <div className="bg-white p-6 rounded-2xl shadow-xl max-w-md w-full border border-gray-100 flex flex-col animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4 shrink-0">
               <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                   {upgradeType === 'chef' ? <ChefHat className="text-softGreen-600" /> : upgradeType === 'trainer' ? <Dumbbell className="text-purple-600" /> : <Store className="text-softGreen-600" />} 
                   {isEditMode ? 'تعديل بيانات الهوية' : `ترقية كـ ${upgradeType === 'chef' ? 'شيف' : upgradeType === 'trainer' ? 'مدرب رياضي' : 'مطعم'}`}
                </h3>
               <button onClick={() => setShowProModal(false)} className="text-gray-400 hover:text-red-500 transition border border-gray-100 hover:bg-gray-50 rounded-full p-1"><X className="w-5 h-5"/></button>
            </div>
            
            <form onSubmit={handleProSubmit} className="space-y-4">
               {upgradeType === 'chef' && (
                   <>
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">الاسم التجاري (أو اسمك الكامل)</label>
                           <input type="text" required value={chefData.brand_name} onChange={e => setChefData({...chefData, brand_name: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-softGreen-500" placeholder="مثال: مطبخ سارة لدايت" />
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">التخصص</label>
                           <input type="text" required value={chefData.specialty} onChange={e => setChefData({...chefData, specialty: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-softGreen-500" placeholder="مثال: مأكولات كيتو" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                               <label className="block text-sm font-medium text-gray-700 mb-1">سنوات الخبرة</label>
                               <input type="number" min="0" required value={chefData.experience_years} onChange={e => setChefData({...chefData, experience_years: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-softGreen-500" />
                            </div>
                            <div>
                               <label className="block text-sm font-medium text-gray-700 mb-1">المدينة / الموقع</label>
                               <input type="text" required value={chefData.location} onChange={e => setChefData({...chefData, location: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-softGreen-500" />
                            </div>
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-2">روابط مواقع التواصل (اختياري)</label>
                           <div className="space-y-2">
                             {(chefData.social_links ? chefData.social_links.split('\n') : ['']).map((link, idx, arr) => (
                               <div key={idx} className="flex items-center gap-2">
                                 <input
                                   type="url"
                                   value={link}
                                   onChange={e => {
                                     const updated = [...arr];
                                     updated[idx] = e.target.value;
                                     setChefData({ ...chefData, social_links: updated.join('\n') });
                                   }}
                                   className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-softGreen-500 text-sm"
                                   placeholder="https://www.instagram.com/..."
                                   dir="ltr"
                                 />
                                 {arr.length > 1 && (
                                   <button
                                     type="button"
                                     onClick={() => {
                                       const updated = arr.filter((_, i) => i !== idx);
                                       setChefData({ ...chefData, social_links: updated.join('\n') });
                                     }}
                                     className="shrink-0 w-8 h-8 flex items-center justify-center bg-red-50 hover:bg-red-500 text-red-400 hover:text-white rounded-lg transition-colors"
                                   >
                                     <X className="w-4 h-4" />
                                   </button>
                                 )}
                               </div>
                             ))}
                             <button
                               type="button"
                               onClick={() => {
                                 const current = chefData.social_links ? chefData.social_links.split('\n').filter(l => l.trim()) : [];
                                 setChefData({ ...chefData, social_links: [...current, ''].join('\n') });
                               }}
                               className="flex items-center gap-1.5 text-softGreen-600 hover:text-softGreen-700 text-sm font-bold mt-1 hover:underline"
                             >
                               <span className="text-lg leading-none">+</span> إضافة رابط آخر
                             </button>
                           </div>
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">نبذة عنك كشيف</label>
                           <textarea rows="2" value={chefData.bio} onChange={e => setChefData({...chefData, bio: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-softGreen-500 resize-none"></textarea>
                        </div>
                   </>
               )}

               {upgradeType === 'restaurant' && (
                   <>
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">اسم المطعم / المنشأة</label>
                           <input type="text" required value={restData.restaurant_name} onChange={e => setRestData({...restData, restaurant_name: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-softGreen-500" placeholder="مثال: مطعم نعناعة الصحي" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                               <label className="block text-sm font-medium text-gray-700 mb-1">نوع المطبخ المفضل</label>
                               <input type="text" required value={restData.cuisine_type} onChange={e => setRestData({...restData, cuisine_type: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-softGreen-500" placeholder="مثال: بحري، نباتي" />
                            </div>
                            <div>
                               <label className="block text-sm font-medium text-gray-700 mb-1">رقم السجل / الترخيص</label>
                               <input type="text" required value={restData.license_number} onChange={e => setRestData({...restData, license_number: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-softGreen-500" />
                            </div>
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-2">مواقع المطعم على الخريطة (اختياري)</label>
                           <div className="space-y-2">
                             {(restData.location_url ? restData.location_url.split('\n') : ['']).map((link, idx, arr) => (
                               <div key={idx} className="flex items-center gap-2">
                                 <input
                                   type="url"
                                   value={link}
                                   onChange={e => {
                                     const updated = [...arr];
                                     updated[idx] = e.target.value;
                                     setRestData({ ...restData, location_url: updated.join('\n') });
                                   }}
                                   className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-softGreen-500 text-sm"
                                   placeholder="https://maps.google.com/..."
                                   dir="ltr"
                                 />
                                 {arr.length > 1 && (
                                   <button type="button"
                                     onClick={() => {
                                       const updated = arr.filter((_, i) => i !== idx);
                                       setRestData({ ...restData, location_url: updated.join('\n') });
                                     }}
                                     className="shrink-0 w-8 h-8 flex items-center justify-center bg-red-50 hover:bg-red-500 text-red-400 hover:text-white rounded-lg transition-colors">
                                     <X className="w-4 h-4" />
                                   </button>
                                 )}
                               </div>
                             ))}
                             <button type="button"
                               onClick={() => {
                                 const current = restData.location_url ? restData.location_url.split('\n').filter(l => l.trim()) : [];
                                 setRestData({ ...restData, location_url: [...current, ''].join('\n') });
                               }}
                               className="flex items-center gap-1.5 text-softGreen-600 hover:text-softGreen-700 text-sm font-bold mt-1 hover:underline">
                               <span className="text-lg leading-none">+</span> إضافة موقع آخر
                             </button>
                           </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                               <label className="block text-sm font-medium text-gray-700 mb-1">رقم التواصل</label>
                               <input type="text" required value={restData.contact_number} onChange={e => setRestData({...restData, contact_number: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-softGreen-500" dir="ltr" />
                            </div>
                            <div>
                               <label className="block text-sm font-medium text-gray-700 mb-1">ساعات العمل</label>
                               <input type="text" required value={restData.working_hours} onChange={e => setRestData({...restData, working_hours: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-softGreen-500" placeholder="8 ص - 11 م" />
                            </div>
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-2">روابط التواصل الاجتماعي (اختياري)</label>
                           <div className="space-y-2">
                             {(restData.social_links ? restData.social_links.split('\n') : ['']).map((link, idx, arr) => (
                               <div key={idx} className="flex items-center gap-2">
                                 <input
                                   type="url"
                                   value={link}
                                   onChange={e => {
                                     const updated = [...arr];
                                     updated[idx] = e.target.value;
                                     setRestData({ ...restData, social_links: updated.join('\n') });
                                   }}
                                   className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-softGreen-500 text-sm"
                                   placeholder="https://www.instagram.com/..."
                                   dir="ltr"
                                 />
                                 {arr.length > 1 && (
                                   <button type="button"
                                     onClick={() => {
                                       const updated = arr.filter((_, i) => i !== idx);
                                       setRestData({ ...restData, social_links: updated.join('\n') });
                                     }}
                                     className="shrink-0 w-8 h-8 flex items-center justify-center bg-red-50 hover:bg-red-500 text-red-400 hover:text-white rounded-lg transition-colors">
                                     <X className="w-4 h-4" />
                                   </button>
                                 )}
                               </div>
                             ))}
                             <button type="button"
                               onClick={() => {
                                 const current = restData.social_links ? restData.social_links.split('\n').filter(l => l.trim()) : [];
                                 setRestData({ ...restData, social_links: [...current, ''].join('\n') });
                               }}
                               className="flex items-center gap-1.5 text-softGreen-600 hover:text-softGreen-700 text-sm font-bold mt-1 hover:underline">
                               <span className="text-lg leading-none">+</span> إضافة رابط آخر
                             </button>
                           </div>
                        </div>
                        <div className="flex items-center gap-3 pt-2">
                           <input type="checkbox" id="delivery_available" checked={restData.delivery_available} onChange={e => setRestData({...restData, delivery_available: e.target.checked})} className="w-5 h-5 text-softGreen-600 rounded bg-gray-50 border-gray-300 focus:ring-softGreen-500 focus:ring-2" />
                           <label htmlFor="delivery_available" className="text-sm font-bold text-gray-700 cursor-pointer flex items-center gap-2"><Truck className="w-4 h-4 text-softGreen-600" /> خدمة التوصيل متاحة للعملاء</label>
                        </div>
                   </>
               )}

               {/* Trainer Form */}
               {upgradeType === 'trainer' && (
                   <>
                       <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">التخصص الرياضي</label>
                          <select value={trainerData.specialization} onChange={e => setTrainerData({...trainerData, specialization: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400">
                             {SPECIALIZATIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                          </select>
                       </div>
                       <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">سنوات الخبرة</label>
                          <input type="number" min="0" required value={trainerData.experience_years} onChange={e => setTrainerData({...trainerData, experience_years: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400" />
                       </div>
                       <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">رقم الاعتماد / الرخصة</label>
                          <input type="text" value={trainerData.license_number} onChange={e => setTrainerData({...trainerData, license_number: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400" placeholder="مثال: FIT-12345" />
                       </div>
                       <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">نبذة عنك كمدرب</label>
                          <textarea rows="3" value={trainerData.bio} onChange={e => setTrainerData({...trainerData, bio: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none" placeholder="اشرح أسلوبك في التدريب وما يميزك..."></textarea>
                       </div>
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-2">روابط التواصل الاجتماعي (اختياري)</label>
                           <div className="space-y-2">
                             {(trainerData.social_links ? trainerData.social_links.split('\n') : ['']).map((link, idx, arr) => (
                               <div key={idx} className="flex items-center gap-2">
                                 <input
                                   type="url"
                                   value={link}
                                   onChange={e => {
                                     const updated = [...arr];
                                     updated[idx] = e.target.value;
                                     setTrainerData({ ...trainerData, social_links: updated.join('\n') });
                                   }}
                                   className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
                                   placeholder="https://www.instagram.com/..."
                                   dir="ltr"
                                 />
                                 {arr.length > 1 && (
                                   <button type="button"
                                     onClick={() => {
                                       const updated = arr.filter((_, i) => i !== idx);
                                       setTrainerData({ ...trainerData, social_links: updated.join('\n') });
                                     }}
                                     className="shrink-0 w-8 h-8 flex items-center justify-center bg-red-50 hover:bg-red-500 text-red-400 hover:text-white rounded-lg transition-colors">
                                     <X className="w-4 h-4" />
                                   </button>
                                 )}
                               </div>
                             ))}
                             <button type="button"
                               onClick={() => {
                                 const current = trainerData.social_links ? trainerData.social_links.split('\n').filter(l => l.trim()) : [];
                                 setTrainerData({ ...trainerData, social_links: [...current, ''].join('\n') });
                               }}
                               className="flex items-center gap-1.5 text-purple-600 hover:text-purple-700 text-sm font-bold mt-1 hover:underline">
                               <span className="text-lg leading-none">+</span> إضافة رابط آخر
                             </button>
                           </div>
                        </div>
                   </>
               )}
               
               <button type="submit" disabled={proLoading} className="w-full bg-softGreen-600 text-white py-3 rounded-xl font-bold hover:bg-softGreen-700 transition flex justify-center items-center gap-2 mt-4 shadow-md shadow-softGreen-200">
                  {proLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5"/>} حفظ واستمرار
               </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
