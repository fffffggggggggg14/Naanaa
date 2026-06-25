import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Activity, ArrowRight, Target, User, Weight, Ruler } from 'lucide-react';
import { AuthContext } from '../AuthContext';

const HealthForm = ({ onResultsLoaded }) => {
  const { token } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    gender: 'Male',
    weight: '',
    target_weight: '',
    height: '',
    age: '',
    activity_level: 1.2,
    goal: 'Maintain',
  });
  
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(token ? true : false);
  const [error, setError] = useState('');

  // Smart Prefilling Logic
  useEffect(() => {
    if (token) {
      axios.get('http://localhost:8000/api/history/')
        .then(res => {
          if (res.data && res.data.length > 0) {
            const latest = res.data[res.data.length - 1];
            setFormData(prev => ({
              ...prev,
              height: latest.height || prev.height,
              age: latest.age || prev.age,
              gender: latest.gender || prev.gender,
              activity_level: latest.activity_level ? latest.activity_level.toString() : prev.activity_level,
              goal: latest.goal || prev.goal,
            }));
          }
        })
        .catch(err => console.error("Error fetching defaults", err))
        .finally(() => setDataLoading(false));
    }
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Basic validation
    if (!formData.weight || formData.weight <= 0) return setError('الرجاء إدخال وزن صحيح');
    if (!formData.height || formData.height <= 0) return setError('الرجاء إدخال طول صحيح');
    if (!formData.age || formData.age <= 0) return setError('الرجاء إدخال عمر صحيح');

    const currentWeight = parseFloat(formData.weight);
    let targetWeight = formData.target_weight ? parseFloat(formData.target_weight) : null;

    if (formData.goal === 'Maintain') {
      targetWeight = currentWeight;
    } else {
      if (!targetWeight || targetWeight <= 0) return setError('الرجاء إدخال وزن مستهدف صحيح');
      
      if (formData.goal === 'Lose' && targetWeight >= currentWeight) {
        return setError('لخسارة الوزن، يجب أن يكون الوزن المستهدف أقل من الوزن الحالي');
      }
      if (formData.goal === 'Gain' && targetWeight <= currentWeight) {
        return setError('لزيادة الوزن، يجب أن يكون الوزن المستهدف أكبر من الوزن الحالي');
      }
    }

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:8000/api/health-profile/', {
        ...formData,
        weight: currentWeight,
        target_weight: targetWeight,
        height: parseFloat(formData.height),
        age: parseInt(formData.age),
        activity_level: parseFloat(formData.activity_level)
      });
      
      const calculatedData = response.data;

      // Auto-save logic if user is authenticated
      if (token) {
        try {
          await axios.post('http://localhost:8000/api/save-check/', {
            current_weight: currentWeight,
            target_weight: targetWeight,
            calories: calculatedData.Final_Calories,
            bmi: calculatedData.BMI,
            height: parseFloat(formData.height),
            age: parseInt(formData.age),
            gender: formData.gender,
            activity_level: parseFloat(formData.activity_level),
            goal: formData.goal
          });
        } catch (saveErr) {
          console.error("لم يتم حفظ الفحص:", saveErr);
        }
      }

      // Pass the response to parent Component
      onResultsLoaded(calculatedData);
    } catch (err) {
      console.error(err);
      setError('حدث خطأ في الاتصال بالخادم. تأكد من تشغيل الباك إند.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden mt-8 border border-gray-100">
      <div className="bg-softGreen-500 p-6 text-white text-center">
        <h2 className="text-3xl font-bold mb-2">نظام نعناعة الصحي</h2>
        <p className="text-softGreen-50 opacity-90">ادخل بياناتك وسنتكفل بحساب احتياجاتك اليومية</p>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-6" dir="rtl">
        {dataLoading && (
          <div className="bg-blue-50 text-blue-700 p-4 rounded-lg text-sm border border-blue-100 flex items-center gap-2 mb-4 animate-in fade-in">
            <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700"></span>
            جاري استرجاع بياناتك المحفوظة لتوفير وقتك...
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Gender */}
          <div className="space-y-2">
            <label className="flex items-center text-gray-700 font-medium">
              <User className="w-4 h-4 ml-2 text-softGreen-600" />
              الجنس
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-softGreen-400 outline-none"
            >
              <option value="Male">ذكر</option>
              <option value="Female">أنثى</option>
            </select>
          </div>

          {/* Age */}
          <div className="space-y-2">
            <label className="flex items-center text-gray-700 font-medium">
              <User className="w-4 h-4 ml-2 text-softGreen-600" />
              العمر
            </label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              placeholder="مثال: 25"
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-softGreen-400 outline-none"
              required
            />
          </div>

          {/* Weight */}
          <div className="space-y-2">
            <label className="flex items-center text-gray-700 font-medium">
              <Weight className="w-4 h-4 ml-2 text-softGreen-600" />
              الوزن الحالي (كجم)
            </label>
            <input
              type="number"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              placeholder="مثال: 75"
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-softGreen-400 outline-none"
              required
            />
          </div>

          {/* Height */}
          <div className="space-y-2">
            <label className="flex items-center text-gray-700 font-medium">
              <Ruler className="w-4 h-4 ml-2 text-softGreen-600" />
              الطول (سم)
            </label>
            <input
              type="number"
              name="height"
              value={formData.height}
              onChange={handleChange}
              placeholder="مثال: 175"
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-softGreen-400 outline-none"
              required
            />
          </div>

          {/* Activity */}
          <div className="space-y-2">
            <label className="flex items-center text-gray-700 font-medium">
              <Activity className="w-4 h-4 ml-2 text-softGreen-600" />
              مستوى النشاط
            </label>
            <select
              name="activity_level"
              value={formData.activity_level}
              onChange={handleChange}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-softGreen-400 outline-none"
            >
              <option value="1.2">خامل (قليل أو بدون نشاط)</option>
              <option value="1.4">نشاط خفيف (تمرين 1-3 أيام/أسبوع)</option>
              <option value="1.6">نشاط متوسط (تمرين 3-5 أيام/أسبوع)</option>
            </select>
          </div>

          {/* Goal */}
          <div className="space-y-2">
            <label className="flex items-center text-gray-700 font-medium">
              <Target className="w-4 h-4 ml-2 text-softGreen-600" />
              الهدف
            </label>
            <select
              name="goal"
              value={formData.goal}
              onChange={handleChange}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-softGreen-400 outline-none"
            >
              <option value="Lose">خسارة الوزن</option>
              <option value="Maintain">تثبيت الوزن</option>
              <option value="Gain">زيادة الوزن</option>
            </select>
          </div>
        </div>

        {/* Dynamic Full-Width Target Weight */}
        <div 
          className={`overflow-hidden transition-all duration-500 ease-in-out ${
            formData.goal !== 'Maintain' ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="space-y-2">
            <label className="flex items-center text-gray-700 font-medium">
              <Target className="w-4 h-4 ml-2 text-softGreen-600" />
              الوزن المستهدف النهائي (كجم)
            </label>
            <input
              type="number"
              name="target_weight"
              value={formData.target_weight}
              onChange={handleChange}
              placeholder="مثال: 65"
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-softGreen-400 outline-none"
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 p-4 rounded-lg text-sm border border-red-100 animate-in fade-in slide-in-from-top-2">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 mt-6 bg-softGreen-600 hover:bg-softGreen-700 text-white rounded-xl font-bold text-lg transition-all flex justify-center items-center gap-2 shadow-lg shadow-softGreen-200"
        >
          {loading ? (
            <span className="animate-pulse">جاري الحساب...</span>
          ) : (
            <>
              احسب احتياجاتي
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default HealthForm;
