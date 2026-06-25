import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../AuthContext';
import {
  RefreshCcw, Droplet, Flame, Activity, PieChart,
  Info, Beef, Wheat, Droplets, Calendar, Target, History, X,
  Lightbulb, Heart, Sparkles
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Link } from 'react-router-dom';

// ─── InfoModal ────────────────────────────────────────────────────────────────
const InfoModal = ({ card, data, onClose }) => {
  if (!card) return null;

  // Dynamic motivation message based on BMI or general goal
  const getMotivation = () => {
    if (!data) return 'أنت بطل، الرحلة مستمرة والالتزام هو السر 💪';
    if (card.id === 'bmi') {
      if (data.BMI > 30)  return 'أنت بطل، الرحلة مستمرة والالتزام هو السر. كل خطوة صغيرة تقربك من هدفك 💪';
      if (data.BMI < 18.5) return 'جسمك يحتاج مزيداً من الطاقة. ركز على وجبات غنية بالبروتين والكربوهيدرات الصحية 🌱';
      return 'ممتاز! أنت في النطاق المثالي — الحفاظ على هذا المستوى هو الإنجاز الحقيقي 🎯';
    }
    if (card.id === 'calories') {
      const diff = Math.abs((data.Final_Calories || 0) - (data.TDEE || 0));
      if (diff > 500) return 'هدفك جريء! تذكر: الاستمرارية أهم من السرعة. خطوة بخطوة 🏃';
      return 'هدفك ضمن النطاق الصحي. الالتزام اليومي هو مفتاح النجاح 🗝️';
    }
    return 'كل يوم تلتزم فيه بأرقامك هو يوم ربحت فيه صحتك 🌿';
  };

  return (
    // backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Modal box — stop click bubbling */}
      <div
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden
                   animate-in zoom-in-95 fade-in duration-200"
        dir="rtl"
      >
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-5 ${card.headerBg}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${card.iconBg}`}>
              {card.icon}
            </div>
            <h3 className="text-xl font-bold text-white">{card.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition p-1.5 hover:bg-white/20 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">

          {/* Why important */}
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Info className="w-3.5 h-3.5" /> لماذا هذا الرقم مهم؟
            </p>
            <p className="text-gray-700 leading-relaxed text-sm">{card.why}</p>
          </div>

          {/* Naanaa tip */}
          <div className={`rounded-2xl p-4 border ${card.tipBg}`}>
            <p className="text-xs font-bold mb-2 flex items-center gap-1 opacity-80">
              <Lightbulb className="w-3.5 h-3.5" /> نصيحة نعناعة لك 🌿
            </p>
            <p className="text-sm leading-relaxed">{card.tip}</p>
          </div>

          {/* Dynamic motivation */}
          <div className="bg-gradient-to-br from-softGreen-50 to-emerald-50 rounded-2xl p-4 border border-softGreen-100">
            <p className="text-xs font-bold text-softGreen-600 mb-1.5 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> رسالة نعناعة الخاصة لك
            </p>
            <p className="text-sm text-softGreen-800 font-medium leading-relaxed">{getMotivation()}</p>
          </div>

          {/* Guide link */}
          <div className="pt-1 border-t border-gray-100 text-center">
            <Link
              to="/explore"
              onClick={onClose}
              className="text-sm text-softGreen-600 hover:text-softGreen-700 font-bold underline underline-offset-2"
            >
              تعرف على المزيد في دليل نعناعة الصحي ←
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Card info definitions ─────────────────────────────────────────────────────
const getCardDefs = (data) => [
  {
    id: 'calories',
    title: 'السعرات الحرارية اليومية',
    icon: <Flame className="w-5 h-5 text-white" />,
    headerBg: 'bg-gradient-to-l from-orange-500 to-orange-400',
    iconBg: 'bg-white/20',
    tipBg: 'bg-orange-50 border-orange-100 text-orange-800',
    why: 'السعرات الحرارية هي وحدة الطاقة التي يحتاجها جسمك للعمل والتحرك والتنفس. الرقم النهائي (Final) هو هدفك اليومي المحسوب بناءً على جسمك وهدفك.',
    tip: `حاول ألا يتجاوز استهلاكك اليومي هدفك بمقدار ±100 سعرة. الالتزام الأسبوعي أهم من الالتزام اليومي المتشدد.`,
  },
  {
    id: 'bmi',
    title: 'مؤشر كتلة الجسم (BMI)',
    icon: <Activity className="w-5 h-5 text-white" />,
    headerBg: 'bg-gradient-to-l from-blue-500 to-blue-400',
    iconBg: 'bg-white/20',
    tipBg: 'bg-blue-50 border-blue-100 text-blue-800',
    why: 'مؤشر BMI هو مقياس عالمي لتقييم تناسب وزنك مع طولك. يُحسب بقسمة الوزن (كيلوجرام) على مربع الطول (متر).',
    tip: data?.BMI > 25
      ? 'مؤشرك فوق 25 — ركز على تقليل الكربوهيدرات المكررة وزيادة نشاطك اليومي.'
      : data?.BMI < 18.5
        ? 'مؤشرك تحت 18.5 — ركز على زيادة البروتين والدهون الصحية في وجباتك.'
        : 'مؤشرك في النطاق الصحي المثالي (18.5 – 24.9). حافظ على نمط حياتك الحالي.',
  },
  {
    id: 'macros',
    title: 'توزيع الماكروز (المغذيات)',
    icon: <PieChart className="w-5 h-5 text-white" />,
    headerBg: 'bg-gradient-to-l from-softGreen-600 to-softGreen-500',
    iconBg: 'bg-white/20',
    tipBg: 'bg-softGreen-50 border-softGreen-100 text-softGreen-800',
    why: 'الماكروز هي البناء الأساسي لطاقتك: البروتين لبناء العضلات والإصلاح، الكربوهيدرات للطاقة الفورية، والدهون لتنظيم الهرمونات والامتصاص.',
    tip: 'إذا كان هدفك بناء عضلات فاجعل البروتين أولويتك. إذا كان هدفك الطاقة فلا تقلّل الكربوهيدرات كثيراً. الدهون الصحية ضرورة لا رفاهية.',
  },
  {
    id: 'water',
    title: 'الاحتياج اليومي للماء',
    icon: <Droplet className="w-5 h-5 text-white" />,
    headerBg: 'bg-gradient-to-l from-cyan-500 to-blue-400',
    iconBg: 'bg-white/20',
    tipBg: 'bg-cyan-50 border-cyan-100 text-cyan-800',
    why: 'الماء ضروري لعملية التمثيل الغذائي، نضارة البشرة، تنظيم الحرارة، ونقل المغذيات. الجسم لا يستطيع حرق الدهون بكفاءة دون ترطيب كافٍ.',
    tip: 'حاول شرب كوب ماء كل ساعة طوال يومك لتصل للرقم المطلوب بسهولة. أضف شريحة ليمون أو نعناع لجعله أكثر إغراءً 🌿',
  },
];

// ─── Small InfoButton ──────────────────────────────────────────────────────────
const InfoBtn = ({ onClick, color = 'text-gray-400 hover:text-blue-500' }) => (
  <button
    onClick={onClick}
    className={`transition-all ${color} hover:scale-110 ml-1.5`}
    title="اعرف المزيد"
  >
    <Info className="w-4 h-4" />
  </button>
);

// ─── Main Dashboard ────────────────────────────────────────────────────────────
const Dashboard = ({ data, onReset, isHome = false }) => {
  const { token } = useContext(AuthContext);
  const [historyData, setHistoryData] = useState([]);
  const [activeModal, setActiveModal] = useState(null); // card id

  useEffect(() => {
    if (token) {
      axios.get('http://localhost:8000/api/history/')
        .then(res => setHistoryData(res.data))
        .catch(err => console.error('Error fetching history', err));
    }
  }, [token, data]);

  if (!data) return null;

  const cardDefs = getCardDefs(data);
  const openModal  = (id) => setActiveModal(cardDefs.find(c => c.id === id) || null);
  const closeModal = ()   => setActiveModal(null);

  return (
    <div className="w-full mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500" dir="rtl">

      {/* Modal */}
      <InfoModal card={activeModal} data={data} onClose={closeModal} />

      {/* Header row */}
      <div className="flex justify-between items-center mb-6 px-2">
        <h2 className="text-2xl font-bold text-gray-800">
          {isHome ? 'لوحة التحكم الشاملة' : 'نتائج الفحص الحالي'}
        </h2>
        {onReset && isHome && (
          <button
            onClick={onReset}
            className="flex items-center gap-2 text-softGreen-600 hover:text-softGreen-700 bg-softGreen-50 px-4 py-2 rounded-lg transition-colors border border-softGreen-100 font-medium"
          >
            <Target className="w-4 h-4" /> تحديث قياساتي
          </button>
        )}
      </div>

      {/* Journey Timeline */}
      {data.expected_weeks > 0 && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 flex flex-col justify-between mb-8">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="bg-softGreen-100 p-5 rounded-full shadow-sm flex-shrink-0 mb-4 md:mb-0">
              <Target className="w-10 h-10 text-softGreen-600" />
            </div>
            <div className="flex-1 w-full text-center md:text-right">
              <h3 className="text-gray-800 text-2xl font-bold mb-3 border-b border-gray-100 pb-3">رحلتك نحو الهدف</h3>
              <p className="text-lg font-medium text-gray-700 mt-4 leading-relaxed">
                ستصل لوزنك المثالي في{' '}
                <span className="font-bold text-softGreen-700 mx-1 inline-flex items-center gap-1" dir="ltr">
                  <Calendar className="w-5 h-5" /> {data.expected_date}
                </span>{' '}
                خلال <span className="font-bold text-softGreen-700 mx-1">{data.expected_weeks}</span> أسابيع.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Top 2 Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

        {/* Calories Card */}
        <div className="bg-white rounded-3xl shadow-md hover:shadow-xl border border-gray-100 p-8 flex items-center group transition-all duration-300 transform hover:-translate-y-1 relative">
          <div className="bg-orange-100 p-4 rounded-full mr-4 ml-6 shadow-sm flex-shrink-0">
            <Flame className="w-10 h-10 text-orange-500" />
          </div>
          <div className="flex-1">
            <p className="text-gray-500 text-sm font-semibold mb-1 flex items-center">
              السعرات الحرارية اليومية (Final)
              <InfoBtn onClick={() => openModal('calories')} color="text-orange-300 hover:text-orange-500" />
            </p>
            <h3 className="text-4xl font-bold text-gray-800 tracking-tight">
              {Math.round(data.Final_Calories)} <span className="text-lg text-gray-400 font-normal">سعرة</span>
            </h3>
            <p className="text-xs text-gray-400 mt-1">الـ BMR: {Math.round(data.BMR)} | TDEE: {Math.round(data.TDEE)}</p>
          </div>
        </div>

        {/* BMI Card */}
        <div className="bg-white rounded-3xl shadow-md hover:shadow-xl border border-gray-100 p-8 flex items-center group transition-all duration-300 transform hover:-translate-y-1">
          <div className="bg-blue-100 p-4 rounded-full mr-4 ml-6 shadow-sm flex-shrink-0">
            <Activity className="w-10 h-10 text-blue-500" />
          </div>
          <div className="flex-1">
            <p className="text-gray-500 text-sm font-semibold mb-1 flex items-center">
              مؤشر كتلة الجسم (BMI)
              <InfoBtn onClick={() => openModal('bmi')} color="text-blue-300 hover:text-blue-500" />
            </p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-4xl font-bold text-gray-800 tracking-tight">
                {typeof data.BMI === 'number' ? data.BMI.toFixed(1) : data.BMI}
              </h3>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                data.BMI_Status === 'مثالي'  ? 'bg-softGreen-100 text-softGreen-700' :
                data.BMI_Status === 'نحافة'  ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                {data.BMI_Status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Macros + Water ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

        {/* Macros */}
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-md hover:shadow-xl border border-gray-100 p-8 transition-all duration-300 transform hover:-translate-y-1">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-6">
            <PieChart className="w-5 h-5 text-softGreen-600" />
            توزيع الماكروز (المغذيات الكبرى)
            <InfoBtn onClick={() => openModal('macros')} color="text-softGreen-300 hover:text-softGreen-600" />
          </h3>

          <div className="space-y-6">
            {/* Protein */}
            <div>
              <div className="flex justify-between text-sm font-semibold text-gray-700 mb-2">
                <span className="flex items-center gap-1"><Beef className="w-4 h-4 text-red-400" /> بروتين (<span dir="ltr">30%</span>)</span>
                <span>{data.Macros?.Protein} جم</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3">
                <div className="bg-red-400 h-3 rounded-full transition-all duration-700" style={{ width: '30%' }}></div>
              </div>
            </div>
            {/* Carbs */}
            <div>
              <div className="flex justify-between text-sm font-semibold text-gray-700 mb-2">
                <span className="flex items-center gap-1"><Wheat className="w-4 h-4 text-yellow-500" /> كاربوهيدرات (<span dir="ltr">40%</span>)</span>
                <span>{data.Macros?.Carbs} جم</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3">
                <div className="bg-yellow-400 h-3 rounded-full transition-all duration-700" style={{ width: '40%' }}></div>
              </div>
            </div>
            {/* Fat */}
            <div>
              <div className="flex justify-between text-sm font-semibold text-gray-700 mb-2">
                <span className="flex items-center gap-1"><Droplets className="w-4 h-4 text-amber-500" /> دهون (<span dir="ltr">30%</span>)</span>
                <span>{data.Macros?.Fat} جم</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3">
                <div className="bg-amber-500 h-3 rounded-full transition-all duration-700" style={{ width: '30%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Water */}
        <div className="bg-white rounded-3xl shadow-md hover:shadow-xl border border-gray-100 p-8 flex flex-col justify-center items-center text-center relative overflow-hidden transition-all duration-300 transform hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-full h-full bg-blue-50 opacity-50 z-0"></div>
          <div className="relative z-10 w-full">
            {/* Info button top-right */}
            <div className="absolute -top-1 left-0">
              <InfoBtn onClick={() => openModal('water')} color="text-cyan-400 hover:text-cyan-600" />
            </div>
            <div className="bg-white p-4 rounded-full shadow-md border border-blue-100 inline-block mb-4">
              <Droplet className="w-12 h-12 text-blue-500 fill-blue-100" />
            </div>
            <h3 className="text-gray-500 font-semibold mb-1 flex items-center justify-center gap-1">
              الاحتياج اليومي للماء
            </h3>
            <p className="text-4xl font-bold text-gray-800 mb-2">{data.Water} <span className="text-xl text-gray-500 font-normal">لتر</span></p>
            <p className="text-xs text-gray-400 mt-2 flex items-center justify-center gap-1">
              <Info className="w-3 h-3" />
              يعادل حوالي {Math.round(data.Water * 4)} أكواب
            </p>
          </div>
        </div>
      </div>

      {/* Link to full dashboard */}
      {token && !isHome && (
        <div className="mt-8 mb-8 text-center animate-in fade-in slide-in-from-bottom-2">
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-softGreen-600 hover:bg-softGreen-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg shadow-softGreen-200 transition-all text-lg hover:-translate-y-1"
          >
            <History className="w-6 h-6" />
            انتقل للوحة التحكم لمتابعة تقدمك
          </Link>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
