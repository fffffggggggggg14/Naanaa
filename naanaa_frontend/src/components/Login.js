import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Lock, User } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:8000/api/login/', formData);
      login(response.data.user, response.data.token);
      navigate('/');
    } catch (err) {
      setError('اسم المستخدم أو كلمة المرور غير صحيحة.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl overflow-hidden mt-12 border border-gray-100 fade-in animate-in slide-in-from-bottom-4 duration-500">
      <div className="bg-softGreen-500 p-6 text-white text-center">
        <h2 className="text-3xl font-bold mb-2">تسجيل الدخول</h2>
        <p className="text-softGreen-50 opacity-90">مرحباً بعودتك إلى نعناعة</p>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-6" dir="rtl">
        {error && (
          <div className="bg-red-50 text-red-500 p-4 rounded-lg text-sm border border-red-100">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="flex items-center text-gray-700 font-medium">
              <User className="w-4 h-4 ml-2 text-softGreen-600" />
              اسم المستخدم
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-softGreen-400 outline-none"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center text-gray-700 font-medium">
              <Lock className="w-4 h-4 ml-2 text-softGreen-600" />
              كلمة المرور
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-softGreen-400 outline-none"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 mt-6 bg-softGreen-600 hover:bg-softGreen-700 text-white rounded-xl font-bold text-lg transition-all flex justify-center items-center gap-2 shadow-lg shadow-softGreen-200"
        >
          {loading ? 'جاري الدخول...' : 'تسجيل الدخول'}
          {!loading && <ArrowRight className="w-5 h-5" />}
        </button>

        <p className="text-center text-gray-500 mt-4 text-sm">
          ليس لديك حساب؟{' '}
          <Link to="/register" className="text-softGreen-600 font-bold hover:underline">
            سجل الآن
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
