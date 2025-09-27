import React, { useState, useContext } from "react";
import { UserPlus } from "lucide-react";
import { AppContext } from "../context/AppContext";
import { getOAuthStartUrl } from "../services/ssoService";

const SignupPage: React.FC = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('SignupPage must be used within AppContext.Provider');
  }
  const { navigate, setGlobalLoading, setSsoFlow } = context;

  const [error, setError] = useState<string | null>(null);

  const handleSSOSignup = async () => {
    try {
      setGlobalLoading(true);
      console.log('[SignupPage] Starting SSO signup flow...');
      
      // Set SSO flow to signup
      setSsoFlow('signup');
      
      // Get OAuth URL from backend
      const oauthUrl = await getOAuthStartUrl();
      console.log('[SignupPage] Redirecting to OAuth URL:', oauthUrl);
      
      // Redirect to Basalam OAuth
      window.location.href = oauthUrl;
    } catch (error) {
      console.error('[SignupPage] SSO signup failed:', error);
      setError('خطا در اتصال به سرور. لطفاً دوباره تلاش کنید.');
      setSsoFlow(null);
    } finally {
      setGlobalLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-green-100">
            <UserPlus className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            ثبت‌نام در قیمت‌یار
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            برای ثبت‌نام از حساب باسلام خود استفاده کنید
          </p>
        </div>

        <div className="bg-white py-8 px-4 shadow rounded-lg sm:px-10">
          {/* SSO Signup Section */}
          <div className="space-y-4">
            <button
              onClick={handleSSOSignup}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150 ease-in-out"
            >
              ثبت‌نام با حساب باسلام
            </button>

            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}
          </div>
        </div>

        {/* Login Link at Bottom */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            قبلاً ثبت‌نام کرده‌اید؟{' '}
            <button
              onClick={() => navigate('login')}
              className="font-medium text-blue-600 hover:text-blue-500 transition duration-150 ease-in-out"
            >
              وارد حساب کاربری خود شوید
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;