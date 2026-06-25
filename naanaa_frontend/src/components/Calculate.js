import React from 'react';
import { useNavigate } from 'react-router-dom';
import HealthForm from './HealthForm';

const Calculate = () => {
  const navigate = useNavigate();

  const handleResultsLoaded = (data) => {
    navigate('/progress');
  };

  return (
    <div className="w-full">
      <div className="fade-in animate-in slide-in-from-bottom-4 duration-500">
        <HealthForm onResultsLoaded={handleResultsLoaded} />
      </div>
    </div>
  );
};

export default Calculate;
