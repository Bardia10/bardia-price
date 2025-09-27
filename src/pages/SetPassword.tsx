import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import { setPassword } from '../services/ssoService';

const SetPassword: React.FC = () => {
  const [password, setPasswordValue] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const context = useContext(AppContext);
  if (!context) {
    throw new Error('SetPassword must be used within AppContext.Provider');
  }

  const { tempToken, setTempToken, setSsoFlow } = context;

  // Redirect if no temp token (user shouldn't be here)
  useEffect(() => {
    if (!tempToken) {
      console.log('[SetPassword] No temp token found, redirecting to signup');
      navigate('/signup', { replace: true });
    }
  }, [tempToken, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('رمز عبور و تکرار آن یکسان نیستند');
      return;
    }

    if (password.length < 6) {
      setError('رمز عبور باید حداقل ۶ کاراکتر باشد');
      return;
    }

    if (!tempToken) {
      setError('توکن موقت یافت نشد. لطفاً دوباره ثبت‌نام کنید.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('[SetPassword] Setting password...');
      const response = await setPassword(tempToken, password);
      console.log('[SetPassword] Password set successfully:', response);

      // Store credentials in session for auto-fill
      sessionStorage.setItem('pendingCredentials', JSON.stringify({
        username: response.username,
        password: response.password
      }));

      // Clear temp token and SSO flow
      setTempToken('');
      setSsoFlow(null);


        // Show success and log in with JWT from sessionStorage
        alert(`ثبت‌نام موفقیت‌آمیز! نام کاربری شما: ${response.username}`);
        const pendingJwt = sessionStorage.getItem('pendingJwt');
        if (pendingJwt) {
          // Log in and redirect to dashboard
          context.setBasalamToken(pendingJwt);
          localStorage.setItem('authToken', pendingJwt);
          sessionStorage.removeItem('pendingJwt');
          navigate('/', { replace: true });
        } else {
          // Fallback: redirect to login
          navigate('/login', { replace: true });
        }

    } catch (err) {
      console.error('[SetPassword] Error setting password:', err);
      setError(err instanceof Error ? err.message : 'خطا در تنظیم رمز عبور');
    } finally {
      setLoading(false);
    }
  };

  if (!tempToken) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-green-100">
            <Lock className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            تنظیم رمز عبور
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            لطفاً رمز عبور خود را برای تکمیل ثبت‌نام انتخاب کنید
          </p>
        </div>

        <div className="bg-white py-8 px-4 shadow rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                رمز عبور
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPasswordValue(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  placeholder="رمز عبور خود را وارد کنید"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                تکرار رمز عبور
              </label>
              <div className="mt-1 relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  placeholder="رمز عبور را دوباره وارد کنید"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "در حال تنظیم..." : "تنظیم رمز عبور"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SetPassword;