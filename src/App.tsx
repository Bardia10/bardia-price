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
  
  // My Products state preservation
  const [myProductsState, setMyProductsStateInternal] = useState({
    products: [] as any[],
    currentPage: 1,
    searchTerm: '',
    hasMorePages: true,
    scrollPosition: 0,
    isInitialized: false,
  });
  
  const setMyProductsState = useCallback((updates: Partial<typeof myProductsState>) => {
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
  }), [navigate, selectedProduct, basalamToken, authorizedFetch, lastNavigation, tempToken, ssoFlow, myProductsState, setMyProductsState, clearMyProductsState]);

  return (
    <AppContext.Provider value={contextValue}>
      <div className="font-['Inter'] antialiased bg-gray-50 text-gray-900 min-h-screen">
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


