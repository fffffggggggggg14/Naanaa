import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Search, Loader2 } from 'lucide-react';
import { DEFAULT_AVATAR, onImgError } from '../utils/avatar';

const SmartSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // Debouncing effect
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(() => {
      fetchResults(query);
    }, 400); // 400ms debounce

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchResults = async (searchQuery) => {
    setLoading(true);
    setShowDropdown(true);
    try {
      const { data } = await axios.get(`http://localhost:8000/api/search-users/?q=${encodeURIComponent(searchQuery)}`);
      setResults(data);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResultClick = (userId) => {
    setShowDropdown(false);
    setQuery('');
    navigate(`/profile/${userId}`);
  };

  return (
    <div className="relative w-full max-w-md" ref={dropdownRef} dir="rtl">
      <div className="relative flex items-center w-full">
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (query.trim().length > 0) setShowDropdown(true); }}
          placeholder="ابحث عن مستخدمين..." 
          className="bg-gray-100 border-none rounded-full py-2.5 pr-10 pl-4 text-sm w-full focus:ring-2 focus:ring-softGreen-500 focus:bg-white transition-all shadow-inner outline-none"
        />
        <Search className="absolute right-3 w-4 h-4 text-gray-400" />
      </div>

      {showDropdown && (query.trim().length > 0) && (
        <div className="absolute top-full right-0 mt-2 w-full bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
          {loading ? (
            <div className="p-4 flex justify-center text-softGreen-600">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          ) : results.length > 0 ? (
            <ul className="max-h-64 overflow-y-auto py-2">
              {results.map((user) => (
                <li 
                  key={user.user_id} 
                  onClick={() => handleResultClick(user.user_id)}
                  className="flex items-center gap-3 px-4 py-2 hover:bg-softGreen-50 cursor-pointer transition-colors"
                >
                  <img 
                    src={user.profile_picture || DEFAULT_AVATAR} 
                    alt={user.username} 
                    onError={onImgError}
                    className="w-8 h-8 rounded-full object-cover border border-gray-200"
                  />
                  <div>
                    <h4 className="font-bold text-gray-800 text-sm">
                      {user.first_name || user.last_name ? `${user.first_name} ${user.last_name}` : user.username}
                    </h4>
                    <p className="text-xs text-gray-400" style={{ direction: 'ltr', textAlign: 'right' }}>@{user.username}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-sm text-gray-500">
              لا توجد نتائج مطابقة
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SmartSearch;
