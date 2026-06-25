import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Activity, Flame, ArrowRight, TrendingUp } from 'lucide-react';
import Dashboard from './Dashboard';

const Home = () => {
  const { user, token, profile } = useContext(AuthContext);
  const [latestCheck, setLatestCheck] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      axios.get('http://localhost:8000/api/history/')
        .then(res => {
          if (res.data && res.data.length > 0) {
            // The API returns history chronologically (oldest first).
            // So the latest check is the last element in the array.
            setLatestCheck(res.data[res.data.length - 1]);
          }
        })
        .catch(err => console.error("Error fetching history for home", err))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-softGreen-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="fade-in animate-in slide-in-from-bottom-4 duration-500 text-center py-12" dir="rtl">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">بداية رحلتك نحو حياة صحية</h2>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          انضم إلينا الآن للوصول إلى تحليلات صحية ذكية، ومعرفة السعرات المطلوبة لبلوغ أهدافك، مع ميزة التتبع المستمر لوزنك.
        </p>
        <div className="flex justify-center gap-4">
          <Link to="/register" className="px-8 py-4 bg-softGreen-600 text-white font-bold rounded-xl shadow-lg hover:bg-softGreen-700 transition-all text-lg hover:-translate-y-1">
            ابدأ رحلتك مجاناً
          </Link>
          <Link to="/login" className="px-8 py-4 bg-white text-softGreen-600 font-bold rounded-xl shadow-sm border border-softGreen-200 hover:bg-softGreen-50 transition-all text-lg">
            تسجيل الدخول
          </Link>
        </div>
      </div>
    );
  }

  // Member Dashboard Dashboard
  return (
    <div className="fade-in animate-in slide-in-from-bottom-4 duration-500 w-[95%] max-w-[1400px] mx-auto" dir="rtl">
      
      {/* Top Welcome & Summary Section - Matching Screenshot Exactly */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          أهلاً، {(profile?.first_name && profile?.last_name) ? `${profile.first_name} ${profile.last_name}` : (profile?.first_name || user.username)}! 👋
        </h2>
        <p className="text-gray-500 mb-8">إليك ملخص سريع لحالتك الصحية بناءً على آخر فحص متوفر لدينا.</p>

        {latestCheck ? (
          <div className="mt-4">
            <Dashboard data={latestCheck} onReset={() => navigate('/calculate')} isHome={true} />
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 mb-8 text-center text-gray-800">
            <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-700 mb-2">لم تقم بأي فحص بعد</h3>
            <p className="text-gray-500 mb-8">سجل قياساتك الأولى لتبدأ بمتابعة تطورك معنا!</p>
            <div className="flex justify-center">
              <Link 
                to="/calculate" 
                className="flex items-center gap-3 px-8 py-4 bg-softGreen-600 text-white font-bold rounded-xl shadow-lg shadow-softGreen-200 hover:bg-softGreen-700 transition-all text-lg hover:-translate-y-1"
              >
                تحديث قياساتي الآن
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
