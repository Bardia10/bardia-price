import React, { useState, useEffect, useContext, createContext, useRef, useCallback, useMemo } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom';
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import ExpensiveProductsPage from "./pages/ExpensiveProductsPage";
import MyProducts from "./pages/MyProducts";
import ProductDetail from "./pages/ProductDetail";
import SignupPage from "./pages/SignupPage";
import SetPassword from "./pages/SetPassword";
import AuthCallback from "./pages/AuthCallback";


// components
import { LoadingSpinner } from "./components/LoadingSpinner";
import { GlobalLoadingOverlay } from "./components/GlobalLoadingOverlay";
import { Modal } from "./components/Modal";
import { Header } from "./components/Header";
import { MyProductCard } from "./components/MyProductCard";

// utils
import { formatPrice } from "./lib/format";

//context
import { AppContext, AppContextType } from "./context/AppContext";


// ProtectedRoute component for authentication
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const basalamToken = localStorage.getItem('authToken');
  return basalamToken ? <>{children}</> : <Navigate to="/login" replace />;
};

// App Content component that uses React Router hooks
const AppContent: React.FC = () => {
  const [basalamToken, setBasalamToken] = useState<string>(() => localStorage.getItem('authToken') || '');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [globalLoading, setGlobalLoading] = useState<boolean>(false);
  const [lastNavigation, setLastNavigation] = useState<any>(null);
  const [tempToken, setTempToken] = useState<string>(() => localStorage.getItem('tempToken') || '');
  const [ssoFlow, setSsoFlow] = useState<'login' | 'signup' | null>(() => {
    const stored = sessionStorage.getItem('ssoFlow');
    return stored as 'login' | 'signup' | null;
  });

  // Version checking state
  const [updateAvailable, setUpdateAvailable] = useState<boolean>(false);
  const [currentVersion, setCurrentVersion] = useState<string | null>(null);
  
  // My Products state preservation
  const [myProductsState, setMyProductsStateInternal] = useState({
    products: [] as any[],
    currentPage: 1,
    searchTerm: '',
    hasMorePages: true,
    scrollPosition: 0,
    isInitialized: false,
  });
  
  const setMyProductsState = useCallback((updates: Partial<{
    products: any[];
    currentPage: number;
    searchTerm: string;
    hasMorePages: boolean;
    scrollPosition: number;
    isInitialized: boolean;
  }>) => {
    setMyProductsStateInternal(prev => ({ ...prev, ...updates }));
  }, []);
  
  const clearMyProductsState = useCallback(() => {
    setMyProductsStateInternal({
      products: [] as any[],
      currentPage: 1,
      searchTerm: '',
      hasMorePages: true,
      scrollPosition: 0,
      isInitialized: false,
    });
  }, []);

  // Expensive Products state preservation
  const [expensiveProductsState, setExpensiveProductsStateInternal] = useState({
    products: [] as any[],
    scrollPosition: 0,
    isInitialized: false,
  });
  
  const setExpensiveProductsState = useCallback((updates: Partial<{
    products: any[];
    scrollPosition: number;
    isInitialized: boolean;
  }>) => {
    setExpensiveProductsStateInternal(prev => ({ ...prev, ...updates }));
  }, []);
  
  const clearExpensiveProductsState = useCallback(() => {
    setExpensiveProductsStateInternal({
      products: [] as any[],
      scrollPosition: 0,
      isInitialized: false,
    });
  }, []);
  
  const reactRouterNavigate = useNavigate();

  useEffect(() => {
    if (basalamToken) {
      localStorage.setItem('authToken', basalamToken);
    } else {
      localStorage.removeItem('authToken');
    }
  }, [basalamToken]);

  useEffect(() => {
    if (tempToken) {
      localStorage.setItem('tempToken', tempToken);
    } else {
      localStorage.removeItem('tempToken');
    }
  }, [tempToken]);

  useEffect(() => {
    if (ssoFlow) {
      sessionStorage.setItem('ssoFlow', ssoFlow);
    } else {
      sessionStorage.removeItem('ssoFlow');
    }
  }, [ssoFlow]);

  // Version checking - checks for new deployments every 5 minutes
  useEffect(() => {
    async function checkVersion() {
      try {
        console.log('🔍 Checking for new version...');
        const res = await fetch("/version.json?cacheBust=" + Date.now());
        const data = await res.json();
        const { version } = data;

        console.log('📦 Fetched version:', version);
        console.log('💾 Stored version:', currentVersion);

        if (!currentVersion) {
          // First load - store the current version
          console.log('✅ First load - storing version:', version);
          setCurrentVersion(version);
        } else if (version !== currentVersion) {
          // New version detected
          console.log('🚀 NEW VERSION DETECTED! Showing banner...');
          console.log('   Old:', currentVersion);
          console.log('   New:', version);
          setUpdateAvailable(true);
        } else {
          console.log('✓ Version unchanged');
        }
      } catch (err) {
        console.warn("❌ Version check failed:", err);
      }
    }

    // Check immediately on mount
    checkVersion();
    
    // Then check every 5 minutes
    const interval = setInterval(checkVersion, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [currentVersion]);

  const handleUpdate = useCallback(() => {
    // Force a hard reload to get the latest version
    window.location.reload();
  }, []);

  // Custom navigate function that maps old page names to new paths
  const navigate = useCallback((path: string, options?: { productId?: string; from?: string }) => {
    const pathMap: Record<string, string> = {
      'login': '/login',
      'signup': '/signup',
      'set-password': '/set-password',
      'auth-callback': '/auth/callback',
      'dashboard': '/',
      'my-products': '/my-products',
      'product-detail': options?.productId ? `/product/${options.productId}` : '/product/current',
      'not-best-price': '/expensive-products'
    };

    const routePath = pathMap[path] || path;
    setLastNavigation(options || null);
    reactRouterNavigate(routePath);
  }, [reactRouterNavigate]);

  // Redirect to dashboard if logged in and on auth pages
  useEffect(() => {
    const authPages = ['/login', '/signup', '/set-password', '/auth/callback'];
    if (basalamToken && authPages.includes(window.location.pathname)) {
      reactRouterNavigate('/');
    }
  }, [basalamToken, reactRouterNavigate]);

  const authorizedFetch = useCallback((input: RequestInfo | URL, init: RequestInit = {}) => {
    const headers = new Headers(init.headers || {});
    if (basalamToken) headers.set('Authorization', `Bearer ${basalamToken}`);
    return fetch(input, { ...init, headers });
  }, [basalamToken]);

  const contextValue: AppContextType = useMemo(() => ({
    navigate,
    selectedProduct,
    setSelectedProduct,
    basalamToken,
    setBasalamToken,
    authorizedFetch,
    setGlobalLoading,
    lastNavigation,
    tempToken,
    setTempToken,
    ssoFlow,
    setSsoFlow,
    myProductsState,
    setMyProductsState,
    clearMyProductsState,
    expensiveProductsState,
    setExpensiveProductsState,
    clearExpensiveProductsState,
  }), [navigate, selectedProduct, basalamToken, authorizedFetch, lastNavigation, tempToken, ssoFlow, myProductsState, setMyProductsState, clearMyProductsState, expensiveProductsState, setExpensiveProductsState, clearExpensiveProductsState]);

  return (
    <AppContext.Provider value={contextValue}>
      <div className="font-['Inter'] antialiased bg-gray-50 text-gray-900 min-h-screen">
        {/* Update notification banner */}
        {updateAvailable && (
          <div className="fixed top-0 left-0 right-0 z-[9999] bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 px-4 shadow-2xl border-b-4 border-green-700 animate-pulse">
            <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3" dir="rtl">
                <svg 
                  className="w-8 h-8 flex-shrink-0 animate-bounce" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2.5} 
                    d="M13 10V3L4 14h7v7l9-11h-7z" 
                  />
                </svg>
                <span className="font-bold text-lg" style={{ fontFamily: 'Inter, Tahoma, sans-serif' }}>
                  نسخه جدید منتشر شد! لطفاً برای دریافت آخرین بروزرسانی‌ها صفحه را تازه کنید.
                </span>
              </div>
              <button
                onClick={handleUpdate}
                className="bg-white text-green-700 px-6 py-3 rounded-lg font-bold text-lg hover:bg-green-50 transition-all shadow-lg hover:shadow-xl hover:scale-105 border-2 border-green-700 animate-pulse"
                style={{ fontFamily: 'Inter, Tahoma, sans-serif' }}
              >
                🔄 تازه‌سازی صفحه
              </button>
            </div>
          </div>
        )}
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/set-password" element={<SetPassword />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/my-products" element={
            <ProtectedRoute>
              <MyProducts />
            </ProtectedRoute>
          } />
          <Route path="/product/:id" element={
            <ProtectedRoute>
              <ProductDetail />
            </ProtectedRoute>
          } />
          <Route path="/expensive-products" element={
            <ProtectedRoute>
              <ExpensiveProductsPage />
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <GlobalLoadingOverlay isLoading={globalLoading} />
      </div>
    </AppContext.Provider>
  );
};


// Loosely typed app context for speed; can be refined later
// export const AppContext = createContext<any>(null);



const App = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};


export default App;


