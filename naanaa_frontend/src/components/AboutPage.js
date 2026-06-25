import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, ArrowLeft, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import audioFile from '../assets/audio/Peaky Blinders Code.mpeg';

const teamMembers = [
  "Mohamed Essam Mohamed Ibrahim Aboudeeb",
  "Youssef Mostafa Mahmoud Abdelwahab",
  "Mohamed Alaa El Din Hassan",
  "Ziad Attia Attia",
  "Ahmed Sammy Mahmoud Aboubakr",
  "Mahmoud Mohamed Mohamed Ahmed",
  "Mohamed Ahmed Almaz Mohamed",
  "Aya Ahmed Mohamed Hussein",
  "Mark Mina Sedhom Farid",
  "Mohamed Saad Abbadi Hamed",
  "Malek Ossama Mohamed Mahmoud",
  "Mazen Hassan Ali Hassan Ahmed"
];

const AboutPage = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [showBackButton, setShowBackButton] = useState(false);
  const audioRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    audioRef.current = new Audio(audioFile);
    audioRef.current.loop = true;
    audioRef.current.volume = 0.6;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(e => console.error("Audio play failed:", e));
      }
      setIsPlaying(!isPlaying);
    }
  };

  const startCredits = () => {
    setHasStarted(true);
    if (audioRef.current) {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(e => {
        console.error("Audio play failed, user interaction needed:", e);
      });
    }
  };

  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-center p-6 relative overflow-hidden font-cinematic" dir="rtl">
        {/* Background dark gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-neutral-800 via-neutral-900 to-black opacity-80"></div>
        
        <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
            <h1 className="text-5xl md:text-7xl text-white font-bold mb-8 tracking-[0.1em] smoke-text uppercase" dir="ltr">
                Peaky Blinders Code
            </h1>
            <p className="text-gray-400 text-lg md:text-xl mb-12 max-w-xl leading-relaxed">
                لكل قصة عظيمة أبطال صنعوها في الخفاء، اكتشف من يقف خلف كواليس "نعناعة".
            </p>
            
            <button 
                onClick={startCredits}
                className="group relative px-8 py-4 bg-transparent border border-white/30 text-white hover:bg-white/10 transition-all duration-500 overflow-hidden flex items-center gap-3 backdrop-blur-sm rounded-none"
            >
                <div className="absolute inset-0 w-0 bg-white/10 transition-all duration-[500ms] ease-out group-hover:w-full"></div>
                <Play className="w-5 h-5 relative z-10" />
                <span className="relative z-10 text-xl font-bold tracking-widest">بدء العرض</span>
            </button>

            <button onClick={() => navigate('/')} className="mt-12 text-gray-600 hover:text-white transition-colors border-b border-transparent hover:border-white pb-1 text-sm tracking-widest uppercase">
                العودة للرئيسية
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black overflow-hidden relative font-cinematic" dir="rtl">
      {/* Cinematic Gradient Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-neutral-900/50 via-black to-black z-0 pointer-events-none"></div>

      {/* Controls */}
      <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-50 pointer-events-none">
        <button 
          onClick={() => navigate('/')}
          className="text-white/50 hover:text-white p-2 flex items-center gap-2 transition-colors group pointer-events-auto"
        >
          <ArrowLeft className="w-6 h-6 transform group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-bold tracking-widest uppercase font-sans">تخطي</span>
        </button>

        <button 
          onClick={toggleAudio}
          className="text-white/50 hover:text-white p-3 rounded-full border border-white/20 hover:bg-white/10 transition-all backdrop-blur-md pointer-events-auto"
        >
          {isPlaying ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
        </button>
      </div>

      {/* Scrolling Credits */}
      <div className="absolute inset-0 w-full z-10 pointer-events-none overflow-hidden">
        <div 
          className="w-full max-w-4xl mx-auto px-4 credits-scroll flex flex-col items-center pointer-events-auto h-max"
          onAnimationEnd={() => setShowBackButton(true)}
        >
            
            <div className="mb-40 text-center">
                <h1 className="text-6xl md:text-8xl text-white font-bold tracking-[0.15em] smoke-text mb-6 uppercase" dir="ltr">Peaky Blinders Code</h1>
                <h2 className="text-2xl md:text-3xl text-gray-500 italic font-serif">Presents</h2>
            </div>

            <div className="space-y-16 md:space-y-24 text-center w-full">
                <div className="mb-32">
                    <p className="text-sm md:text-base text-gray-600 uppercase tracking-[0.4em] mb-12 font-sans">Developed & Engineered By</p>
                    <div className="flex flex-col gap-10 md:gap-14 text-center" dir="ltr">
                        {teamMembers.map((name, index) => (
                            <h3 key={index} className="text-2xl md:text-4xl font-bold text-white/90 smoke-text transition-transform duration-700 cursor-default">
                                {name}
                            </h3>
                        ))}
                    </div>
                </div>

                <div className="my-40 text-center relative py-20">
                    <div className="absolute inset-0 bg-white/5 blur-[100px] rounded-full"></div>
                    <h3 className="text-sm md:text-base text-softGreen-500 uppercase tracking-[0.3em] mb-16 font-sans relative z-10">Special Thanks & Deep Appreciation To</h3>
                    <div className="flex flex-col gap-10 relative z-10">
                        <p className="text-4xl md:text-5xl text-white font-bold smoke-text hover:text-softGreen-100 transition-colors">د. غادة</p>
                        <p className="text-4xl md:text-5xl text-white font-bold smoke-text hover:text-softGreen-100 transition-colors">د. ياسر</p>
                        <p className="text-4xl md:text-5xl text-white font-bold smoke-text hover:text-softGreen-100 transition-colors">د. إسراء</p>
                        <p className="text-4xl md:text-5xl text-white font-bold smoke-text hover:text-softGreen-100 transition-colors">د. عبير</p>
                    </div>
                    <p className="mt-20 text-gray-400 text-xl italic max-w-2xl mx-auto leading-relaxed relative z-10 font-sans">
                        "شكراً لدعمكم وإيمانكم بنا.. بفضل توجيهاتكم أصبح هذا المشروع واقعاً نعتز به."
                    </p>
                </div>

                <div className="mt-64 flex flex-col items-center">
                    <img src="/Logo naanaa.png" alt="Naanaa Logo" className="w-40 h-auto mb-10 opacity-60 grayscale hover:grayscale-0 transition-all duration-1000" />
                    <p className="text-gray-600 tracking-[0.3em] uppercase text-xs font-sans">© 2026 NAANAA PLATFORM. ALL RIGHTS RESERVED.</p>
                </div>

                {/* Spacer to raise the content above the button when scrolling ends */}
                <div className="h-56 w-full"></div>
            </div>
        </div>
      </div>

      {/* Final Back Button */}
      <div className={`absolute bottom-12 left-0 w-full flex justify-center z-50 transition-opacity duration-1000 ${showBackButton ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <button 
          onClick={() => navigate('/')}
          className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/30 rounded-full font-sans tracking-widest uppercase transition-all backdrop-blur-md hover:scale-105"
        >
          العودة للمنصة
        </button>
      </div>

    </div>
  );
};

export default AboutPage;
