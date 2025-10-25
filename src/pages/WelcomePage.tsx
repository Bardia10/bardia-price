import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { PlayCircle } from 'lucide-react';

const WelcomePage: React.FC = () => {
  const navigate = useNavigate();
  
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('WelcomePage must be used within AppContext.Provider');
  }

  const { basalamToken } = context;

  // Redirect to login if no token (shouldn't happen but just in case)
  useEffect(() => {
    if (!basalamToken) {
      console.log('[WelcomePage] No token found, redirecting to login');
      navigate('/login', { replace: true });
    }
  }, [basalamToken, navigate]);

  // Tutorial video embed code
  const tutorialVideoEmbed = '<style>.h_iframe-aparat_embed_frame{position:relative;}.h_iframe-aparat_embed_frame .ratio{display:block;width:100%;height:auto;}.h_iframe-aparat_embed_frame iframe{position:absolute;top:0;left:0;width:100%;height:100%;}</style><div class="h_iframe-aparat_embed_frame"><span style="display: block;padding-top: 57%"></span><iframe src="https://www.aparat.com/video/video/embed/videohash/wmtg6ev/vt/frame"  allowFullScreen="true" webkitallowfullscreen="true" mozallowfullscreen="true"></iframe></div>';

  const handleContinue = () => {
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-8">
        {/* Welcome Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg mb-6">
            <PlayCircle className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
            خوش آمدید! 🎉
          </h1>
          <p className="text-xl text-gray-700 mb-2">
            ثبت‌نام شما با موفقیت انجام شد
          </p>
          <p className="text-lg text-gray-600">
            لطفاً ویدیوی آموزشی زیر را مشاهده کنید تا با امکانات سیستم آشنا شوید
          </p>
        </div>

        {/* Video Container */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">
              راهنمای سریع استفاده
            </h2>
            <p className="text-gray-600 text-center">
              این ویدیو شما را با ویژگی‌های اصلی سیستم آشنا می‌کند
            </p>
          </div>
          
          {/* Video Embed */}
          <div 
            className="w-full rounded-lg overflow-hidden shadow-lg mb-6"
            dangerouslySetInnerHTML={{ __html: tutorialVideoEmbed }}
          />

          {/* Continue Button */}
          <div className="flex justify-center">
            <button
              onClick={handleContinue}
              className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl shadow-lg hover:from-emerald-700 hover:to-teal-700 focus:outline-none focus:ring-4 focus:ring-emerald-300 transition-all duration-200 transform hover:scale-105"
            >
              <span>ویدیو را دیدم، ادامه می‌دهم</span>
              <svg 
                className="w-5 h-5 transform transition-transform group-hover:translate-x-1" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M14 5l7 7m0 0l-7 7m7-7H3" 
                />
              </svg>
            </button>
          </div>

          {/* Optional: Skip link for users who want to skip */}
          <div className="text-center mt-4">
            <button
              onClick={handleContinue}
              className="text-sm text-gray-500 hover:text-gray-700 underline transition-colors"
            >
              رد شدن و رفتن به داشبورد
            </button>
          </div>
        </div>

        {/* Help Text */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            در صورت نیاز به راهنمایی بیشتر، می‌توانید از دکمه «راهنما» در هر صفحه استفاده کنید
          </p>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;
