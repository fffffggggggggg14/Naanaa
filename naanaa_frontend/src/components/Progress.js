import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../AuthContext';
import { History, TrendingUp, Calendar, Target } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Link } from 'react-router-dom';

const Progress = ({ isEmbedded = false }) => {
  const { token } = useContext(AuthContext);
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  // We find the last known target weight to draw the reference line
  // The API returns history chronologically (oldest to newest)
  const lastTargetWeight = historyData.length > 0 ? historyData[historyData.length - 1].target_weight : null;

  const formatShortDate = (dateStr) => {
    if(!dateStr) return '';
    const parts = dateStr.split('/');
    if(parts.length < 3) return dateStr;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const mIndex = parseInt(parts[1], 10) - 1;
    return `${parts[0]} ${months[mIndex] || parts[1]}`;
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-md p-4 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 flex flex-col items-center min-w-[120px] transition-all" dir="rtl">
          <p className="text-gray-400 text-xs font-semibold mb-2">{label}</p>
          <div className="flex items-baseline gap-1 mb-2">
            <span className="text-[#10B981] font-bold text-2xl tracking-tight">{payload[0].value}</span>
            <span className="text-gray-500 text-xs font-medium">كجم</span>
          </div>
          <div className="text-[11px] font-bold text-blue-600 bg-blue-50/80 px-2.5 py-1 rounded-full w-full text-center border border-blue-100">
            BMI: {payload[0].payload.bmi.toFixed(1)}
          </div>
        </div>
      );
    }
    return null;
  };

  useEffect(() => {
    if (token) {
      axios.get('http://localhost:8000/api/history/')
        .then(res => {
          setHistoryData(res.data);
        })
        .catch(err => console.error("Error fetching history", err))
        .finally(() => setLoading(false));
    }
  }, [token]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-softGreen-600"></div>
      </div>
    );
  }

  return (
    <div className={`w-full ${isEmbedded ? '' : 'max-w-5xl mx-auto mt-4'} animate-in fade-in slide-in-from-bottom-4 duration-500`} dir="rtl">
      
      {!isEmbedded && (
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <History className="w-8 h-8 text-softGreen-600" />
            تطورات الأداء والسجل الخاص بك
          </h2>
          <p className="text-gray-500 mt-2">تتبع تغييراتك الصحية بمرور الوقت وابقَ متحفزاً للوصول لهدفك!</p>
        </div>
      )}

      <div className={`bg-white rounded-3xl shadow-lg border border-gray-100 p-8 ${isEmbedded ? 'mt-8' : 'mb-8'}`}>
        {historyData.length > 0 ? (
          <>
            <div className="h-[400px] w-full mb-12" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historyData} margin={{ top: 20, right: 30, bottom: 20, left: 10 }}>
                  <defs>
                    <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4ade80" stopOpacity={0.5}/>
                      <stop offset="95%" stopColor="#4ade80" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" strokeOpacity={0.6} />
                  
                  <XAxis 
                    dataKey="date_formatted" 
                    tickFormatter={formatShortDate}
                    tick={{ fill: '#9CA3AF', fontSize: 12, fontWeight: 500 }} 
                    axisLine={{ stroke: '#E5E7EB', strokeWidth: 1 }} 
                    tickLine={false} 
                    dy={12} 
                  />
                  <YAxis 
                    domain={['dataMin - 5', 'dataMax + 5']} 
                    tick={{ fill: '#9CA3AF', fontSize: 12, fontWeight: 500 }} 
                    axisLine={false} 
                    tickLine={false} 
                    dx={-15} 
                  />
                  <Tooltip 
                    content={<CustomTooltip />}
                    cursor={{ stroke: '#10B981', strokeWidth: 1.5, strokeDasharray: '5 5', opacity: 0.4 }}
                  />
                  
                  {lastTargetWeight && lastTargetWeight > 0 && (
                    <ReferenceLine 
                      y={lastTargetWeight} 
                      label={{ position: 'insideTopLeft', value: 'هدفي 🎯', fill: '#F97316', fontSize: 14, fontWeight: '900', offset: 15 }} 
                      stroke="#F97316" 
                      strokeWidth={2}
                      strokeDasharray="6 6" 
                      strokeOpacity={0.8}
                    />
                  )}
                  
                  <Area 
                    type="monotone" 
                    dataKey="current_weight" 
                    name="الوزن الحالي" 
                    stroke="#10B981" 
                    strokeWidth={4} 
                    fillOpacity={1} 
                    fill="url(#colorWeight)"
                    activeDot={{ r: 8, strokeWidth: 3, stroke: '#10B981', fill: '#ffffff', style: { transition: 'r 0.2s ease-in-out' } }} 
                    dot={{ r: 5, fill: '#ffffff', strokeWidth: 3, stroke: '#10B981' }} 
                    animationDuration={1500}
                    animationEasing="ease-out"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            <h3 className="text-xl font-bold text-gray-800 mb-6 border-t border-gray-100 pt-8">سجل القراءات</h3>
            <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
              <table className="w-full text-sm text-right text-gray-600">
                <thead className="text-sm text-gray-700 bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th scope="col" className="px-6 py-4 font-bold">التاريخ</th>
                    <th scope="col" className="px-6 py-4 font-bold">الوزن الحالي</th>
                    <th scope="col" className="px-6 py-4 font-bold">الوزن المستهدف</th>
                    <th scope="col" className="px-6 py-4 font-bold">السعرات</th>
                    <th scope="col" className="px-6 py-4 font-bold">مؤشر الكتلة (BMI)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {/* Reverse to show newest on top in the table */}
                  {[...historyData].reverse().map((item, index) => (
                    <tr key={index} className="bg-white hover:bg-softGreen-50/50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-gray-900" dir="ltr">{item.date_formatted}</td>
                      <td className="px-6 py-4">
                        <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full font-medium border border-gray-200">
                          {item.current_weight} كجم
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-amber-600">{item.target_weight ? `${item.target_weight} كجم` : '-'}</td>
                      <td className="px-6 py-4 text-orange-500 font-medium">{Math.round(item.calories)}</td>
                      <td className="px-6 py-4 font-bold text-blue-600">{item.bmi.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="py-16 text-center animate-in fade-in zoom-in-95 duration-500">
            <div className="bg-softGreen-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <TrendingUp className="w-12 h-12 text-softGreen-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">لا يوجد سجل بيانات بعد!</h3>
            <p className="text-gray-500 text-lg mb-8 max-w-md mx-auto">
              ابدأ أول فحص لك الآن لتشاهد منحنى تطورك الجميل يرتسم هنا بمرور الوقت...
            </p>
            <Link 
              to="/calculate" 
              className="inline-flex items-center gap-2 px-8 py-4 bg-softGreen-600 text-white font-bold rounded-xl shadow-lg shadow-softGreen-200 hover:bg-softGreen-700 transition-all text-lg hover:-translate-y-1"
            >
              الذهاب لصفحة الحسابات
            </Link>
          </div>
        )}
      </div>

    </div>
  );
};

export default Progress;
