import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Heart, Clock, Loader2, Flame, ChefHat, Bookmark,
  Coffee, UtensilsCrossed, Store, Star, ShoppingBag, Leaf,
  SlidersHorizontal, X, Zap, Droplets, Dumbbell, Sparkles
} from 'lucide-react';
import { DEFAULT_AVATAR, onImgError } from '../utils/avatar';

const WORKOUT_DIFFICULTY_CONFIG = {
  beginner:     { label: 'مبتدئ',  color: 'bg-green-500' },
  intermediate: { label: 'متوسط',  color: 'bg-yellow-500' },
  advanced:     { label: 'محترف',  color: 'bg-red-500' },
};

// ─────────────────────────────────────────────────────────────────────────────
// WorkoutVideoCard
// ─────────────────────────────────────────────────────────────────────────────
const WorkoutVideoCard = ({ video, onLike, onSave }) => {
  const navigate = useNavigate();
  const diff = WORKOUT_DIFFICULTY_CONFIG[video.difficulty] || { label: video.difficulty, color: 'bg-gray-400' };
  return (
    <div
      onClick={() => navigate(`/workout/${video.id}`)}
      className="cursor-pointer bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col group hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
    >
      <div className="relative h-48 bg-gray-900 overflow-hidden">
        {video.video_url ? (
          <video
            src={video.video_url}
            className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500"
            muted loop autoPlay playsInline
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-800">
            <Dumbbell className="w-12 h-12 text-gray-500" />
          </div>
        )}

        {/* Like button */}
        <button onClick={e => { e.stopPropagation(); onLike(video.id); }}
          className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur rounded-full hover:bg-white transition shadow-sm z-10">
          <Heart className={`w-4 h-4 transition-colors ${video.is_liked ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-500'}`} />
        </button>

        {/* Save button */}
        <button onClick={e => { e.stopPropagation(); onSave(video.id); }}
          title={video.is_saved ? 'إلغاء الحفظ' : 'حفظ التمرين'}
          className="absolute top-3 left-3 p-2 bg-white/80 backdrop-blur rounded-full hover:bg-white transition shadow-sm z-10">
          <Bookmark className={`w-4 h-4 transition-colors ${video.is_saved ? 'fill-purple-600 text-purple-600' : 'text-gray-400 hover:text-purple-600'}`} />
        </button>

        {/* kcal label */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-lg">
          <Flame className="w-3 h-3 text-orange-400" />
          {video.burned_calories} kcal
        </div>

        {/* mins label */}
        <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm text-gray-800 text-xs px-2 py-1 rounded-lg flex items-center gap-1 font-bold shadow-sm">
          <Clock className="w-3 h-3 text-purple-600" />
          {video.duration} د
        </div>

        {/* Difficulty badge */}
        <div className={`absolute top-3 right-3 ${diff.color} text-white text-xs font-bold px-2 py-1 rounded-lg shadow opacity-0`}>
          {diff.label}
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        {/* Trainer */}
        <div className="flex items-center gap-2 mb-2">
          <img
            src={video.trainer_profile_picture || DEFAULT_AVATAR}
            alt={video.trainer_name} onError={onImgError}
            className="w-5 h-5 rounded-full object-cover border border-gray-200"
          />
          <span className="text-xs font-bold text-gray-500 truncate">{video.trainer_name}</span>
          <Dumbbell className="w-3 h-3 text-purple-500 shrink-0" />
        </div>

        <h3 className="font-bold text-gray-800 line-clamp-1 mb-1 group-hover:text-purple-600 transition-colors">{video.title}</h3>
        {video.description && (
          <p className="text-gray-400 text-xs line-clamp-2 flex-1 leading-relaxed mb-2">{video.description}</p>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-gray-50 mt-auto">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className="flex items-center gap-0.5"><Heart className="w-3 h-3 text-red-400" />{video.likes_count}</span>
          </div>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full text-white ${diff.color}`}>
            {diff.label}
          </span>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
//  Utility helpers
// ─────────────────────────────────────────────────────────────────────────────

const dietLabel = (d) =>
  ({ Regular: 'عادي', Keto: 'كيتو', Vegan: 'نباتي', Vegetarian: 'نباتي', GlutenFree: 'بلا جلوتين' })[d] || d;

const dietColor = (d) =>
  ({ Keto: 'bg-yellow-50 text-yellow-700', Vegan: 'bg-green-50 text-green-700',
     Vegetarian: 'bg-emerald-50 text-emerald-700', GlutenFree: 'bg-purple-50 text-purple-700' })[d]
  || 'bg-softGreen-50 text-softGreen-700';

const DiffBadge = ({ level }) => {
  if (!level) return null;
  const cfg = { Easy: ['سهل','bg-green-500'], Medium: ['متوسط','bg-yellow-500'], Hard: ['محترف','bg-red-500'] };
  const [label, cls] = cfg[level] || ['','bg-gray-400'];
  return <span className={`text-white text-xs font-bold px-2 py-0.5 rounded-full ${cls}`}>{label}</span>;
};

// ─────────────────────────────────────────────────────────────────────────────
//  Reusable Chip button
// ─────────────────────────────────────────────────────────────────────────────
const Chip = ({ active, onClick, children, activeClass = 'bg-softGreen-500 text-white border-softGreen-500 shadow-md shadow-softGreen-100' }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 rounded-full border text-xs font-bold transition-all duration-200 shrink-0
      ${active ? activeClass : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}
  >
    {children}
  </button>
);

// ─────────────────────────────────────────────────────────────────────────────
//  Context-Aware Filters Panel
// ─────────────────────────────────────────────────────────────────────────────
const FiltersPanel = ({ mainTab, itemTypeFilter, filters, setFilters }) => {
  const toggle = (key, val) =>
    setFilters(prev => {
      const arr = prev[key] || [];
      return { ...prev, [key]: arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val] };
    });
  const set = (key, val) =>
    setFilters(prev => ({ ...prev, [key]: prev[key] === val ? '' : val }));

  // ── Chef + Food ──────────────────────────────────────────────────────────
  if (mainTab === 'chef' && itemTypeFilter !== 'drink') return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {/* Difficulty */}
      <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
        <p className="text-xs font-bold text-gray-600 mb-2 flex items-center gap-1.5">
          <Star className="w-3.5 h-3.5 text-yellow-500" /> مستوى الصعوبة
        </p>
        <div className="flex flex-wrap gap-1.5">
          {[['Easy','سهل 🟢','bg-green-500 text-white border-green-500'],
            ['Medium','متوسط 🟡','bg-yellow-500 text-white border-yellow-500'],
            ['Hard','محترف 🔴','bg-red-500 text-white border-red-500']].map(([val,label,cls]) => (
            <Chip key={val} active={(filters.difficulty||[]).includes(val)}
              onClick={() => toggle('difficulty', val)} activeClass={cls}>{label}</Chip>
          ))}
        </div>
      </div>

      {/* Cooking Time */}
      <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
        <p className="text-xs font-bold text-gray-600 mb-2 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-softGreen-600" /> وقت التحضير
        </p>
        <div className="flex flex-wrap gap-1.5">
          {[['15','⚡ أقل من 15 د'],['30','🕐 أقل من 30 د'],['60','🕑 أقل من ساعة']].map(([val,label]) => (
            <Chip key={val} active={filters.cooking_time === val} onClick={() => set('cooking_time', val)}>{label}</Chip>
          ))}
        </div>
      </div>

      {/* Diet */}
      <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
        <p className="text-xs font-bold text-gray-600 mb-2 flex items-center gap-1.5">
          <Leaf className="w-3.5 h-3.5 text-green-500" /> نوع الحمية
        </p>
        <div className="flex flex-wrap gap-1.5">
          {[['Keto','كيتو'],['Vegan','نباتي'],['Vegetarian','نباتي+ألبان'],['GlutenFree','بلا جلوتين']].map(([val,label]) => (
            <Chip key={val} active={(filters.diet_types||[]).includes(val)} onClick={() => toggle('diet_types', val)}>{label}</Chip>
          ))}
        </div>
      </div>

      {/* Calories slider */}
      <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
        <p className="text-xs font-bold text-gray-600 mb-3 flex items-center gap-1.5">
          <Flame className="w-3.5 h-3.5 text-orange-400" /> أقصى سعرات
        </p>
        <input type="range" min="50" max="1500" step="50"
          value={filters.max_calories || 1500}
          onChange={e => setFilters(prev => ({ ...prev, max_calories: e.target.value }))}
          className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-softGreen-500" />
        <p className="text-center text-xs font-bold text-softGreen-700 mt-2 bg-softGreen-50 rounded-lg py-1">
          {filters.max_calories || 1500} kcal
        </p>
      </div>
    </div>
  );

  // ── Chef + Drink ─────────────────────────────────────────────────────────
  if (mainTab === 'chef' && itemTypeFilter === 'drink') return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Health Goal */}
      <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
        <p className="text-xs font-bold text-blue-700 mb-3 flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5" /> الهدف الصحي للمشروب
        </p>
        <div className="flex flex-wrap gap-2">
          {[['energy','⚡ طاقة وتركيز','bg-yellow-500 text-white border-yellow-500'],
            ['detox','🌿 ديتوكس وتنقية','bg-green-500 text-white border-green-500'],
            ['fat_burn','🔥 حرق دهون','bg-red-500 text-white border-red-500'],
            ['immunity','🛡️ تعزيز مناعة','bg-purple-500 text-white border-purple-500']].map(([val,label,cls]) => (
            <Chip key={val} active={(filters.health_goal||[]).includes(val)}
              onClick={() => toggle('health_goal', val)} activeClass={cls}>{label}</Chip>
          ))}
        </div>
      </div>

      {/* Sweetener */}
      <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
        <p className="text-xs font-bold text-blue-700 mb-3 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" /> نوع التحلية
        </p>
        <div className="flex flex-wrap gap-2">
          {[['honey','🍯 بالعسل الطبيعي'],
            ['no_sugar','🚫 بدون سكر'],
            ['stevia','🌱 ستيفيا'],
            ['dates','🌴 بالتمر']].map(([val,label]) => (
            <Chip key={val} active={(filters.sweetener||[]).includes(val)}
              onClick={() => toggle('sweetener', val)}
              activeClass="bg-blue-500 text-white border-blue-500 shadow-md shadow-blue-100">{label}</Chip>
          ))}
        </div>
      </div>
    </div>
  );

  // ── Restaurant + Food ────────────────────────────────────────────────────
  if (mainTab === 'restaurant' && itemTypeFilter !== 'drink') return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {/* Price range */}
      <div className="bg-orange-50 p-3 rounded-xl border border-orange-100">
        <p className="text-xs font-bold text-orange-700 mb-2 flex items-center gap-1.5">
          💰 نطاق السعر (EGP)
        </p>
        <div className="flex flex-wrap gap-1.5">
          {[['0-50','أقل من 50 ج'],['50-100','50 – 100 ج'],['100-200','100 – 200 ج'],['200+','أكثر من 200 ج']].map(([val,label]) => (
            <Chip key={val} active={filters.price_range === val}
              onClick={() => set('price_range', val)}
              activeClass="bg-orange-500 text-white border-orange-500">{label}</Chip>
          ))}
        </div>
      </div>

      {/* Prep time */}
      <div className="bg-orange-50 p-3 rounded-xl border border-orange-100">
        <p className="text-xs font-bold text-orange-700 mb-2 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" /> وقت التجهيز المتوقع
        </p>
        <div className="flex flex-wrap gap-1.5">
          {[['15','⚡ أقل من 15 د'],['30','🕐 أقل من 30 د']].map(([val,label]) => (
            <Chip key={val} active={filters.cooking_time === val}
              onClick={() => set('cooking_time', val)}
              activeClass="bg-orange-500 text-white border-orange-500">{label}</Chip>
          ))}
        </div>
      </div>

      {/* Availability */}
      <div className="bg-orange-50 p-3 rounded-xl border border-orange-100">
        <p className="text-xs font-bold text-orange-700 mb-2 flex items-center gap-1.5">
          📦 الحالة
        </p>
        <div className="flex flex-wrap gap-1.5">
          <Chip active={filters.available_only === true}
            onClick={() => setFilters(prev => ({ ...prev, available_only: prev.available_only ? null : true }))}
            activeClass="bg-green-500 text-white border-green-500">✅ متوفر الآن فقط</Chip>
          <Chip active={filters.top_rated === true}
            onClick={() => setFilters(prev => ({ ...prev, top_rated: prev.top_rated ? null : true }))}
            activeClass="bg-yellow-500 text-white border-yellow-500">⭐ الأعلى إعجاباً</Chip>
        </div>
      </div>

      {/* Category */}
      <div className="bg-orange-50 p-3 rounded-xl border border-orange-100">
        <p className="text-xs font-bold text-orange-700 mb-2 flex items-center gap-1.5">
          <UtensilsCrossed className="w-3.5 h-3.5" /> تصنيف الوجبة
        </p>
        <div className="flex flex-wrap gap-1.5">
          {[['Breakfast','فطور'],['Lunch','غداء'],['Dinner','عشاء'],['Snack','سناك']].map(([val,label]) => (
            <Chip key={val} active={filters.category === val}
              onClick={() => set('category', val)}
              activeClass="bg-orange-500 text-white border-orange-500">{label}</Chip>
          ))}
        </div>
      </div>
    </div>
  );

  // ── Restaurant + Drink ───────────────────────────────────────────────────
  if (mainTab === 'restaurant' && itemTypeFilter === 'drink') return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Size */}
      <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
        <p className="text-xs font-bold text-orange-700 mb-3 flex items-center gap-1.5">
          <Droplets className="w-3.5 h-3.5" /> الحجم
        </p>
        <div className="flex gap-2">
          {[['small','☕ صغير'],['medium','🥤 وسط'],['large','🧊 كبير']].map(([val,label]) => (
            <Chip key={val} active={(filters.size||[]).includes(val)}
              onClick={() => toggle('size', val)}
              activeClass="bg-orange-500 text-white border-orange-500">{label}</Chip>
          ))}
        </div>
      </div>

      {/* Price range */}
      <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
        <p className="text-xs font-bold text-orange-700 mb-3">💰 نطاق السعر (EGP)</p>
        <div className="flex flex-wrap gap-2">
          {[['0-30','أقل من 30'],['30-70','30 – 70'],['70+','أكثر من 70']].map(([val,label]) => (
            <Chip key={val} active={filters.price_range === val}
              onClick={() => set('price_range', val)}
              activeClass="bg-orange-500 text-white border-orange-500">{label}</Chip>
          ))}
        </div>
      </div>

      {/* Temperature */}
      <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
        <p className="text-xs font-bold text-orange-700 mb-3">🌡️ درجة الحرارة</p>
        <div className="flex gap-2">
          {[['cold','🧊 بارد'],['hot','☕ ساخن']].map(([val,label]) => (
            <Chip key={val} active={filters.temperature === val}
              onClick={() => set('temperature', val)}
              activeClass="bg-blue-500 text-white border-blue-500">{label}</Chip>
          ))}
        </div>
      </div>
    </div>
  );

  return null;
};

// ─────────────────────────────────────────────────────────────────────────────
//  ChefCard
// ─────────────────────────────────────────────────────────────────────────────
const ChefCard = ({ recipe, onLike, onSave, onClick, onChefClick }) => {
  const isDrink = recipe.item_type === 'drink';
  return (
    <div onClick={onClick}
      className="cursor-pointer bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div className="relative h-48 overflow-hidden bg-gray-100">
        <img src={recipe.image || DEFAULT_AVATAR}
          alt={recipe.title} onError={onImgError} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />

        <button onClick={e => { e.stopPropagation(); onLike(recipe.id); }}
          className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur rounded-full hover:bg-white transition shadow-sm">
          <Heart className={`w-4 h-4 ${recipe.is_liked_by_user ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-500'}`} />
        </button>

        <button onClick={e => { e.stopPropagation(); onSave(recipe.id); }}
          title={recipe.is_saved_by_user ? 'إلغاء الحفظ' : 'حفظ الوصفة'}
          className="absolute top-3 left-3 p-2 bg-white/80 backdrop-blur rounded-full hover:bg-white transition shadow-sm">
          <Bookmark className={`w-4 h-4 ${recipe.is_saved_by_user ? 'fill-softGreen-600 text-softGreen-600' : 'text-gray-400 hover:text-softGreen-600'} transition-colors`} />
        </button>

        <div className={`absolute bottom-3 right-3 flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${isDrink ? 'bg-blue-500 text-white' : 'bg-black/55 text-white backdrop-blur-sm'}`}>
          {isDrink ? <Coffee className="w-3 h-3" /> : <Flame className="w-3 h-3 text-orange-400" />}
          {isDrink ? 'مشروب' : `${recipe.calories} kcal`}
        </div>
        <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm text-gray-800 text-xs px-2 py-1 rounded-lg flex items-center gap-1 font-bold shadow-sm">
          <Clock className="w-3 h-3 text-softGreen-600" /> {recipe.cooking_time} د
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <button onClick={e => { e.stopPropagation(); onChefClick(recipe.chef_user_id); }}
          className="flex items-center gap-2 mb-2 hover:opacity-80 w-fit group/chef">
          <img src={recipe.chef_profile_picture || DEFAULT_AVATAR}
            alt={recipe.chef_name} onError={onImgError} className="w-5 h-5 rounded-full object-cover border border-gray-200" />
          <span className="text-xs font-bold text-gray-500 group-hover/chef:text-softGreen-600 group-hover/chef:underline truncate">{recipe.chef_name}</span>
        </button>

        <h3 className="font-bold text-gray-800 line-clamp-2 break-words leading-tight mb-1 group-hover:text-softGreen-600 transition-colors">{recipe.title}</h3>
        <p className="text-gray-400 text-xs line-clamp-2 flex-1 leading-relaxed mb-2">{recipe.description}</p>

        {recipe.chef_tip && !isDrink && (
          <div className="text-xs text-softGreen-700 bg-softGreen-50 border border-softGreen-100 rounded-lg px-2 py-1.5 mb-2 flex items-center gap-1.5 line-clamp-1">
            <Star className="w-3 h-3 shrink-0" /> {recipe.chef_tip}
          </div>
        )}
        {isDrink && recipe.benefits && (
          <div className="text-xs text-blue-700 bg-blue-50 border border-blue-100 rounded-lg px-2 py-1.5 mb-2 flex items-center gap-1.5 line-clamp-1">
            <Leaf className="w-3 h-3 shrink-0" /> {recipe.benefits}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-50 mt-auto">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className="flex items-center gap-0.5"><Heart className="w-3 h-3 text-red-400" />{recipe.likes_count}</span>
            <span className="flex items-center gap-0.5"><Bookmark className={`w-3 h-3 ${recipe.is_saved_by_user ? 'text-softGreen-600 fill-softGreen-600' : 'text-gray-400'}`} />{recipe.saved_count}</span>
          </div>
          <div className="flex items-center gap-1">
            <DiffBadge level={recipe.difficulty_level} />
            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${dietColor(recipe.diet_type)}`}>{dietLabel(recipe.diet_type)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
//  RestaurantCard
// ─────────────────────────────────────────────────────────────────────────────
const RestaurantCard = ({ recipe, onClick, onRestClick, onLike, onSave }) => {
  const isDrink = recipe.item_type === 'drink';
  const avail   = recipe.is_available !== false;
  return (
    <div onClick={onClick}
      className="cursor-pointer bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div className="relative h-48 overflow-hidden bg-gray-100">
        <img src={recipe.image || DEFAULT_AVATAR}
          alt={recipe.title} onError={onImgError} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />

        {/* Like button */}
        <button onClick={e => { e.stopPropagation(); onLike(recipe.id); }}
          className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur rounded-full hover:bg-white transition shadow-sm z-10">
          <Heart className={`w-4 h-4 transition-colors ${recipe.is_liked_by_user ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-500'}`} />
        </button>

        {/* Save button */}
        <button onClick={e => { e.stopPropagation(); onSave(recipe.id); }}
          title={recipe.is_saved_by_user ? 'إلغاء الحفظ' : 'حفظ الصنف'}
          className="absolute top-3 left-3 p-2 bg-white/80 backdrop-blur rounded-full hover:bg-white transition shadow-sm z-10">
          <Bookmark className={`w-4 h-4 transition-colors ${recipe.is_saved_by_user ? 'fill-orange-500 text-orange-500' : 'text-gray-400 hover:text-orange-500'}`} />
        </button>

        {/* Availability badge */}
        <div className={`absolute top-12 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold text-white shadow-lg backdrop-blur-sm ${avail ? 'bg-green-500/90' : 'bg-red-500/90'}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${avail ? 'bg-white animate-pulse' : 'bg-white/60'}`} />
          {avail ? 'متوفر حالياً' : 'غير متوفر'}
        </div>

        <div className="absolute bottom-3 right-3 bg-orange-500 text-white font-black text-sm px-3 py-1 rounded-xl shadow-lg">
          {recipe.price} EGP
        </div>

        <div className="absolute bottom-3 left-3 flex items-center gap-1">
          <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${isDrink ? 'bg-blue-500 text-white' : 'bg-white/90 text-gray-800 shadow-sm'}`}>
            {isDrink ? <Coffee className="w-3 h-3" /> : <UtensilsCrossed className="w-3 h-3" />}
            {isDrink ? 'مشروب' : 'طعام'}
          </div>
          {recipe.size && (
            <span className="text-xs bg-white/90 text-gray-700 font-bold px-2 py-1 rounded-lg shadow-sm">
              {recipe.size === 'small' ? 'ص' : recipe.size === 'medium' ? 'و' : 'ك'}
            </span>
          )}
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <button onClick={e => { e.stopPropagation(); onRestClick(recipe.restaurant); }}
          className="flex items-center gap-2 mb-2 hover:opacity-80 w-fit group/rest">
          <img src={recipe.chef_profile_picture || DEFAULT_AVATAR}
            alt={recipe.chef_name} onError={onImgError} className="w-5 h-5 rounded-full object-cover border border-orange-200" />
          <span className="text-xs font-bold text-gray-500 group-hover/rest:text-orange-500 group-hover/rest:underline truncate">{recipe.chef_name}</span>
          <Store className="w-3 h-3 text-orange-400 shrink-0" />
        </button>

        <h3 className="font-bold text-gray-800 line-clamp-2 break-words leading-tight mb-1 group-hover:text-orange-500 transition-colors">{recipe.title}</h3>
        <p className="text-gray-400 text-xs line-clamp-2 flex-1 leading-relaxed mb-3">{recipe.description}</p>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-50 mt-auto">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className="flex items-center gap-0.5"><Heart className="w-3 h-3 text-red-400" />{recipe.likes_count}</span>
            <span className="flex items-center gap-0.5"><Clock className="w-3 h-3 text-orange-400" />{recipe.cooking_time} د</span>
          </div>
          <button onClick={e => { e.stopPropagation(); onClick(); }} disabled={!avail}
            className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${avail ? 'bg-orange-500 hover:bg-orange-600 text-white shadow shadow-orange-200' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>
            <ShoppingBag className="w-3.5 h-3.5" />
            {avail ? 'اطلب الآن' : 'غير متاح'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
//  Keyword helpers for chef-drink filters (frontend keyword matching)
// ─────────────────────────────────────────────────────────────────────────────
const HEALTH_GOAL_KEYWORDS = {
  energy:    ['طاقة', 'تركيز', 'نشاط', 'energy', 'caffeine', 'كافيين'],
  detox:     ['ديتوكس', 'تنقية', 'كلوروفيل', 'detox', 'cleanse', 'تطهير'],
  fat_burn:  ['حرق', 'دهون', 'fat', 'burn', 'وزن', 'كيتو'],
  immunity:  ['مناعة', 'immunity', 'فيتامين', 'زنك', 'zinc'],
};
const SWEETENER_KEYWORDS = {
  honey:    ['عسل', 'honey'],
  no_sugar: ['بدون سكر', 'no sugar', 'sugar-free', 'sugar free', 'خالي من السكر'],
  stevia:   ['ستيفيا', 'stevia'],
  dates:    ['تمر', 'dates', 'بلح'],
};
const TEMP_KEYWORDS = {
  cold: ['بارد', 'ثلج', 'مثلج', 'cold', 'ice', 'مبرد'],
  hot:  ['ساخن', 'hot', 'دافئ', 'warm'],
};

const matchesKeywords = (recipe, keywordMap, selectedVals) => {
  if (!selectedVals || selectedVals.length === 0) return true;
  const haystack = `${recipe.title} ${recipe.description} ${recipe.benefits || ''} ${recipe.ingredients || ''}`.toLowerCase();
  return selectedVals.every(val => {
    const kws = keywordMap[val] || [];
    return kws.some(kw => haystack.includes(kw.toLowerCase()));
  });
};

const priceInRange = (price, range) => {
  if (!range) return true;
  const p = Number(price);
  if (range === '0-50')    return p < 50;
  if (range === '50-100')  return p >= 50 && p <= 100;
  if (range === '100-200') return p >= 100 && p <= 200;
  if (range === '200+')    return p > 200;
  if (range === '0-30')    return p < 30;
  if (range === '30-70')   return p >= 30 && p <= 70;
  if (range === '70+')     return p > 70;
  return true;
};

// ─────────────────────────────────────────────────────────────────────────────
//  Empty filters sentinel
// ─────────────────────────────────────────────────────────────────────────────
const EMPTY_FILTERS = {
  difficulty: [], diet_types: [], cooking_time: '', max_calories: '',
  price_range: '', available_only: null, top_rated: null, category: '',
  health_goal: [], sweetener: [], size: [], temperature: '',
};

const hasActiveFilters = (f) =>
  f.difficulty?.length || f.diet_types?.length || f.cooking_time || f.max_calories ||
  f.price_range || f.available_only || f.top_rated || f.category ||
  f.health_goal?.length || f.sweetener?.length || f.size?.length || f.temperature;

// ─────────────────────────────────────────────────────────────────────────────
//  Main Explore Component
// ─────────────────────────────────────────────────────────────────────────────
const Explore = () => {
  const navigate = useNavigate();
  const [allRecipes, setAllRecipes] = useState([]);
  const [workoutVideos, setWorkoutVideos] = useState([]);
  const [workoutsLoading, setWorkoutsLoading] = useState(false);
  const [workoutDiffFilter, setWorkoutDiffFilter] = useState('');
  const [loading, setLoading]       = useState(true);
  const [mainTab, setMainTab]       = useState('chef');
  const [itemTypeFilter, setItemTypeFilter] = useState('all');
  const [filters, setFilters]       = useState({ ...EMPTY_FILTERS });
  const [filtersVisible, setFiltersVisible] = useState(true);

  // ── Fetch recipes once ─────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:8000/api/recipes/', {
          headers: token ? { Authorization: `Token ${token}` } : {}
        });
        setAllRecipes(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ── Fetch workouts when tab is 'workout' ──────────────────────────────────
  useEffect(() => {
    if (mainTab !== 'workout') return;
    (async () => {
      setWorkoutsLoading(true);
      try {
        const token = localStorage.getItem('token');
        const params = workoutDiffFilter ? `?difficulty=${workoutDiffFilter}` : '';
        const res = await axios.get(`http://localhost:8000/api/workouts/${params}`, {
          headers: token ? { Authorization: `Token ${token}` } : {}
        });
        setWorkoutVideos(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setWorkoutsLoading(false);
      }
    })();
  }, [mainTab, workoutDiffFilter]);

  // Reset sub-filters when tab or item-type changes
  useEffect(() => { setFilters({ ...EMPTY_FILTERS }); }, [mainTab, itemTypeFilter]);

  // ── Interactions ──────────────────────────────────────────────────────
  const toggleLike = async (id) => {
    const token = localStorage.getItem('token');
    if (!token) return alert('يرجى تسجيل الدخول للإعجاب');
    try {
      const { data } = await axios.post(`http://localhost:8000/api/recipes/${id}/like/`, {}, { headers: { Authorization: `Token ${token}` } });
      setAllRecipes(p => p.map(r => r.id === id ? { ...r, is_liked_by_user: data.liked, likes_count: data.likes_count } : r));
    } catch (e) { console.error(e); }
  };

  const toggleSave = async (id) => {
    const token = localStorage.getItem('token');
    if (!token) return alert('يرجى تسجيل الدخول للحفظ');
    try {
      const { data } = await axios.post(`http://localhost:8000/api/recipes/${id}/save/`, {}, { headers: { Authorization: `Token ${token}` } });
      setAllRecipes(p => p.map(r => r.id === id ? { ...r, is_saved_by_user: data.is_saved, saved_count: data.saved_count } : r));
    } catch (e) { console.error(e); }
  };

  // ── Workout interactions (Optimistic UI) ──────────────────────────────────
  const toggleWorkoutLike = async (id) => {
    const token = localStorage.getItem('token');
    if (!token) return alert('يرجى تسجيل الدخول للإعجاب');
    // Optimistic update
    setWorkoutVideos(p => p.map(v => v.id === id
      ? { ...v, is_liked: !v.is_liked, likes_count: v.is_liked ? v.likes_count - 1 : v.likes_count + 1 }
      : v));
    try {
      const { data } = await axios.post(
        `http://localhost:8000/api/workouts/${id}/like/`, {},
        { headers: { Authorization: `Token ${token}` } }
      );
      // Confirm with server response
      setWorkoutVideos(p => p.map(v => v.id === id
        ? { ...v, is_liked: data.liked, likes_count: data.likes_count }
        : v));
    } catch (e) {
      // Rollback on error
      setWorkoutVideos(p => p.map(v => v.id === id
        ? { ...v, is_liked: !v.is_liked, likes_count: v.is_liked ? v.likes_count - 1 : v.likes_count + 1 }
        : v));
      console.error(e);
    }
  };

  const toggleWorkoutSave = async (id) => {
    const token = localStorage.getItem('token');
    if (!token) return alert('يرجى تسجيل الدخول للحفظ');
    // Optimistic update
    setWorkoutVideos(p => p.map(v => v.id === id ? { ...v, is_saved: !v.is_saved } : v));
    try {
      await axios.post(
        `http://localhost:8000/api/workouts/${id}/save/`, {},
        { headers: { Authorization: `Token ${token}` } }
      );
    } catch (e) {
      // Rollback
      setWorkoutVideos(p => p.map(v => v.id === id ? { ...v, is_saved: !v.is_saved } : v));
      console.error(e);
    }
  };

  // ── Frontend filtering (memoised) ────────────────────────────────────
  const displayed = useMemo(() => {
    let list = allRecipes;

    // ── Split by tab ──
    if (mainTab === 'chef') {
      list = list.filter(r => !r.price && r.price !== 0);
    } else {
      list = list.filter(r => r.price !== null && r.price !== undefined && r.price !== '');
    }

    // ── item type sub-filter ──
    if (itemTypeFilter !== 'all') {
      list = list.filter(r => (r.item_type || 'food') === itemTypeFilter);
    }

    // ── Context-aware filters ──
    if (mainTab === 'chef' && itemTypeFilter !== 'drink') {
      // Chef food filters — never touch price
      if (filters.difficulty?.length)
        list = list.filter(r => filters.difficulty.includes(r.difficulty_level));
      if (filters.diet_types?.length)
        list = list.filter(r => filters.diet_types.includes(r.diet_type));
      if (filters.cooking_time)
        list = list.filter(r => Number(r.cooking_time) <= Number(filters.cooking_time));
      if (filters.max_calories)
        list = list.filter(r => Number(r.calories) <= Number(filters.max_calories));
    }

    if (mainTab === 'chef' && itemTypeFilter === 'drink') {
      // Chef drink filters — never touch difficulty_level
      if (filters.health_goal?.length)
        list = list.filter(r => matchesKeywords(r, HEALTH_GOAL_KEYWORDS, filters.health_goal));
      if (filters.sweetener?.length)
        list = list.filter(r => matchesKeywords(r, SWEETENER_KEYWORDS, filters.sweetener));
    }

    if (mainTab === 'restaurant' && itemTypeFilter !== 'drink') {
      // Restaurant food filters — never touch difficulty_level
      if (filters.price_range)
        list = list.filter(r => priceInRange(r.price, filters.price_range));
      if (filters.cooking_time)
        list = list.filter(r => Number(r.cooking_time) <= Number(filters.cooking_time));
      if (filters.available_only)
        list = list.filter(r => r.is_available !== false);
      if (filters.top_rated)
        list = [...list].sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0));
      if (filters.category)
        list = list.filter(r => r.category === filters.category);
    }

    if (mainTab === 'restaurant' && itemTypeFilter === 'drink') {
      // Restaurant drink filters — never touch difficulty_level
      if (filters.size?.length)
        list = list.filter(r => filters.size.includes(r.size));
      if (filters.price_range)
        list = list.filter(r => priceInRange(r.price, filters.price_range));
      if (filters.temperature)
        list = list.filter(r => matchesKeywords(r, TEMP_KEYWORDS, [filters.temperature]));
    }

    return list;
  }, [allRecipes, mainTab, itemTypeFilter, filters]);

  const isRestaurant = mainTab === 'restaurant';
  const isWorkout    = mainTab === 'workout';
  const activeCount  = hasActiveFilters(filters) ? 1 : 0;

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8" dir="rtl">

      {/* ── Main Tabs ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
        <div className="grid grid-cols-3">
          {[
            ['chef',       <><ChefHat className="w-5 h-5" /> وصفات الشيفات</>,       'bg-softGreen-50 text-softGreen-700 border-softGreen-500'],
            ['restaurant', <><Store   className="w-5 h-5" /> مطاعم نعناعة</>,        'bg-orange-50 text-orange-600 border-orange-500'],
            ['workout',    <><Dumbbell className="w-5 h-5" /> تمارين رياضية</>,      'bg-purple-50 text-purple-700 border-purple-500'],
          ].map(([val, label, activeCls]) => (
            <button key={val}
              onClick={() => { setMainTab(val); setItemTypeFilter('all'); }}
              className={`flex items-center justify-center gap-2 py-5 font-bold text-base transition-all border-b-2 ${mainTab === val ? activeCls : 'text-gray-500 border-transparent hover:bg-gray-50'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Workout Tab Content ── */}
      {isWorkout ? (
        <>
          {/* Workout Filters */}
          <div className="bg-white rounded-2xl shadow-sm border border-purple-100 mb-8 p-6">
            <p className="text-sm font-bold text-gray-600 mb-3 flex items-center gap-1.5">
              <Dumbbell className="w-4 h-4 text-purple-600" /> تصفية حسب المستوى
            </p>
            <div className="flex flex-wrap gap-2">
              {[['', 'الكل 💪'], ['beginner', 'مبتدئ 🟢'], ['intermediate', 'متوسط 🟡'], ['advanced', 'محترف 🔴']].map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => setWorkoutDiffFilter(val)}
                  className={`px-4 py-2 rounded-full border text-xs font-bold transition-all duration-200 ${
                    workoutDiffFilter === val
                      ? 'bg-purple-600 text-white border-purple-600 shadow-md'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Results header */}
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold flex items-center gap-2 text-purple-700">
              <Dumbbell className="w-5 h-5" /> تمارين رياضية
            </h2>
            {!workoutsLoading && (
              <span className="text-sm font-bold px-3 py-1 rounded-full bg-purple-50 text-purple-600">
                {workoutVideos.length} فيديو
              </span>
            )}
          </div>

          {/* Grid */}
          {workoutsLoading ? (
            <div className="flex justify-center py-24">
              <Loader2 className="w-12 h-12 animate-spin text-purple-600" />
            </div>
          ) : workoutVideos.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
              <Dumbbell className="w-16 h-16 mx-auto mb-4 text-gray-200" />
              <p className="text-xl font-bold text-gray-500 mb-2">لا توجد تمارين بهذا المستوى بعد</p>
              <p className="text-gray-400 text-sm">جرّب اختيار مستوى آخر أو تحقق لاحقاً.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {workoutVideos.map(v => (
                <WorkoutVideoCard key={v.id} video={v}
                  onLike={toggleWorkoutLike}
                  onSave={toggleWorkoutSave} />
              ))}
            </div>
          )}
        </>
      ) : (
        <>
      {/* ── Filter Panel ── */}
      <div className={`bg-white rounded-2xl shadow-sm border mb-8 overflow-hidden transition-all duration-300 ${isRestaurant ? 'border-orange-100' : 'border-softGreen-100'}`}>

        {/* Panel header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
          {/* Item type chips */}
          <div className="flex items-center gap-2 flex-wrap">
            <SlidersHorizontal className={`w-4 h-4 shrink-0 ${isRestaurant ? 'text-orange-500' : 'text-softGreen-600'}`} />
            {[
              ['all',   'الكل',    isRestaurant ? 'bg-orange-500 text-white border-orange-500' : 'bg-softGreen-600 text-white border-softGreen-600'],
              ['food',  'طعام 🍽️', isRestaurant ? 'bg-orange-500 text-white border-orange-500' : 'bg-softGreen-600 text-white border-softGreen-600'],
              ['drink', 'مشروب 🥤','bg-blue-500 text-white border-blue-500'],
            ].map(([val, label, cls]) => (
              <Chip key={val} active={itemTypeFilter === val} onClick={() => setItemTypeFilter(val)} activeClass={cls}>
                {label}
              </Chip>
            ))}
          </div>

          {/* Right side: clear + toggle */}
          <div className="flex items-center gap-3">
            {activeCount > 0 && (
              <button onClick={() => setFilters({ ...EMPTY_FILTERS })}
                className="flex items-center gap-1.5 text-xs font-bold text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-all border border-red-200">
                <X className="w-3.5 h-3.5" /> مسح الفلاتر
              </button>
            )}
            <button onClick={() => setFiltersVisible(v => !v)}
              className="text-xs text-gray-500 hover:text-gray-700 font-medium transition-colors px-2 py-1.5 hover:bg-gray-50 rounded-lg">
              {filtersVisible ? 'إخفاء الفلاتر ▲' : 'إظهار الفلاتر ▼'}
            </button>
          </div>
        </div>

        {/* Animated filter body */}
        <div className={`transition-all duration-300 ease-in-out overflow-hidden ${filtersVisible ? 'max-h-96 opacity-100 p-6' : 'max-h-0 opacity-0'}`}>
          <FiltersPanel
            mainTab={mainTab}
            itemTypeFilter={itemTypeFilter}
            filters={filters}
            setFilters={setFilters}
          />
        </div>
      </div>

      {/* ── Results Header ── */}
      <div className="flex items-center justify-between mb-5">
        <h2 className={`text-xl font-bold flex items-center gap-2 ${isRestaurant ? 'text-orange-600' : 'text-softGreen-700'}`}>
          {isRestaurant ? <><Store className="w-5 h-5" /> مطاعم نعناعة</> : <><ChefHat className="w-5 h-5" /> وصفات الشيفات</>}
        </h2>
        {!loading && (
          <span className={`text-sm font-bold px-3 py-1 rounded-full ${isRestaurant ? 'bg-orange-50 text-orange-600' : 'bg-softGreen-50 text-softGreen-700'}`}>
            {displayed.length} {isRestaurant ? 'صنف' : 'وصفة'}
          </span>
        )}
      </div>

      {/* ── Grid ── */}
      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2 className={`w-12 h-12 animate-spin ${isRestaurant ? 'text-orange-500' : 'text-softGreen-600'}`} />
        </div>
      ) : displayed.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
          {isRestaurant ? <Store className="w-16 h-16 mx-auto mb-4 text-gray-200" /> : <ChefHat className="w-16 h-16 mx-auto mb-4 text-gray-200" />}
          <p className="text-xl font-bold text-gray-500 mb-2">نعتذر، لا يوجد محتوى يطابق هذه الفلاتر حالياً</p>
          <p className="text-gray-400 text-sm mb-5">جرّب تعديل الفلاتر أو مسحها للحصول على المزيد من النتائج.</p>
          {activeCount > 0 && (
            <button onClick={() => setFilters({ ...EMPTY_FILTERS })}
              className="inline-flex items-center gap-2 text-sm font-bold text-red-500 border border-red-200 px-4 py-2 rounded-xl hover:bg-red-50 transition">
              <X className="w-4 h-4" /> مسح كل الفلاتر
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isRestaurant
            ? displayed.map(r => (
                <RestaurantCard key={r.id} recipe={r}
                  onClick={() => navigate(`/recipes/${r.id}`)}
                  onRestClick={(rid) => navigate(`/restaurant/${rid}`)}
                  onLike={toggleLike}
                  onSave={toggleSave} />
              ))
            : displayed.map(r => (
                <ChefCard key={r.id} recipe={r}
                  onLike={toggleLike} onSave={toggleSave}
                  onClick={() => navigate(`/recipes/${r.id}`)}
                  onChefClick={(uid) => navigate(`/chef/${uid}`)} />
              ))
          }
        </div>
      )}
      </>
      )}

    </div>
  );
};

export default Explore;
