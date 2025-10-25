import React, { useEffect, useState, useContext, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { exchangeCodeForToken } from '../services/ssoService';

const AuthCallback: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string>('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const hasProcessed = useRef(false);
  
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('AuthCallback must be used within AppContext.Provider');
  }
  
  const { setBasalamToken, setTempToken, ssoFlow, setSsoFlow } = context;

  useEffect(() => {
    // Prevent double execution in React StrictMode
    if (hasProcessed.current) return;
    hasProcessed.current = true;
    
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const oauthError = searchParams.get('error');

        console.log('[AuthCallback] Processing callback with:', { code: !!code, state: !!state, error: oauthError });

        if (oauthError) {
          throw new Error(`OAuth error: ${oauthError}`);
        }

        if (!code || !state) {
          throw new Error('Missing authorization code or state parameter');
        }

        console.log('[AuthCallback] Current SSO flow:', ssoFlow);
        
        // Exchange code for token
        const tokenResponse = await exchangeCodeForToken(code, state);
        console.log('[AuthCallback] Token exchange successful', tokenResponse);
        console.log('[AuthCallback] has-password value:', tokenResponse['has-password']);
        console.log('[AuthCallback] has-password type:', typeof tokenResponse['has-password']);

        // Ensure we have a valid token
        if (!tokenResponse || !tokenResponse.token) {
          throw new Error('Invalid token response from server');
        }

        // Check if user needs to set password based on API response (same for both login and signup)
        if (tokenResponse['has-password'] === false) {
          // User needs to set password: store as temp token
          console.log('[AuthCallback] User needs to set password - redirecting to set password page');
          setTempToken(tokenResponse.token);
          // Store JWT for later login after password set
          sessionStorage.setItem('pendingJwt', tokenResponse.token);
          setStatus('success');
          
          setTimeout(() => {
            navigate('/set-password', { replace: true });
          }, 1500);
          
        } else {
          // User has password: log them in directly
          console.log('[AuthCallback] User has password - logging in directly');
          setBasalamToken(tokenResponse.token);
          localStorage.setItem('authToken', tokenResponse.token);
          
          // Clear SSO flow and temp token
          setSsoFlow(null);
          setTempToken('');
          
          setStatus('success');
          
          setTimeout(() => {
            navigate('/', { replace: true });
          }, 1500);
        }      } catch (err) {
        console.error('[AuthCallback] Error during OAuth callback:', err);
        setError(err instanceof Error ? err.message : 'خطای نامشخص رخ داده است');
        setStatus('error');
        
        // Clear SSO flow and redirect based on original intent
        const targetPage = ssoFlow === 'signup' ? '/signup' : '/login';
        setSsoFlow(null);
        
        setTimeout(() => {
          navigate(targetPage, { replace: true });
        }, 3000);
      }
    };

    handleCallback();
  }, []); // Empty dependency array to run only once

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">در حال احراز هویت...</h2>
            <p className="text-gray-600">لطفاً صبر کنید، در حال پردازش اطلاعات شما هستیم.</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <div className="text-green-600 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              احراز هویت موفق!
            </h2>
            <p className="text-gray-600">
              در حال انتقال به داشبورد...
            </p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <div className="text-red-600 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">خطا در احراز هویت</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <p className="text-sm text-gray-500">
              در حال انتقال به صفحه {ssoFlow === 'signup' ? 'ثبت‌نام' : 'ورود'}...
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;