import React, { useState, useEffect, useContext, createContext, useRef, useCallback, useMemo } from 'react';
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import ExpensiveProductsPage from "./pages/ExpensiveProductsPage";
import MyProducts from "./pages/MyProducts";
import ProductDetail from "./pages/ProductDetail";


// components
import { LoadingSpinner } from "./components/LoadingSpinner";
import { GlobalLoadingOverlay } from "./components/GlobalLoadingOverlay";
import { Modal } from "./components/Modal";
import { Header } from "./components/Header";
import { MyProductCard } from "./components/MyProductCard";

// utils
import { formatPrice } from "./lib/format";

//context
import { AppContext } from "./context/AppContext";




// Loosely typed app context for speed; can be refined later
// export const AppContext = createContext<any>(null);



const App = () => {
  const [basalamToken, setBasalamToken] = useState<string>(() => localStorage.getItem('authToken') || '');
  const [currentPage, setCurrentPage] = useState<'login' | 'dashboard' | 'my-products' | 'product-detail' | 'not-best-price'>(
    () => (localStorage.getItem('authToken') ? 'dashboard' : 'login')
  );
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [globalLoading, setGlobalLoading] = useState<boolean>(false);
  const [lastNavigation, setLastNavigation] = useState<any>(null);


  useEffect(() => {
    if (basalamToken) {
      localStorage.setItem('authToken', basalamToken);
    } else {
      localStorage.removeItem('authToken');
    }
  }, [basalamToken]);

  const navigate = useCallback((page: typeof currentPage, state?: any) => {
    setCurrentPage(page);
    setLastNavigation(state || null);
    if (page === 'my-products') {
      setSelectedProduct(null);
    }
  }, []);

  useEffect(() => {
    if (!basalamToken && currentPage !== 'login') {
      setCurrentPage('login');
    }
  }, [basalamToken, currentPage]);

  // After a successful login (token set), move away from login page automatically
  useEffect(() => {
    if (basalamToken && currentPage === 'login') {
      setCurrentPage('dashboard');
    }
  }, [basalamToken, currentPage]);

  const renderPage = () => {
    switch (currentPage) {
      case 'login':
        return <LoginPage />;
      case 'dashboard':
        return <Dashboard />;
      case 'my-products':
        return <MyProducts />;
      case 'product-detail':
        return <ProductDetail />;
      case 'not-best-price':
  return <ExpensiveProductsPage />;
      default:
        return <Dashboard />;
    }
  };

  const authorizedFetch = useCallback((input: RequestInfo | URL, init: RequestInit = {}) => {
    const headers = new Headers(init.headers || {});
    if (basalamToken) headers.set('Authorization', `Bearer ${basalamToken}`);
    return fetch(input, { ...init, headers });
  }, [basalamToken]);

  const contextValue = useMemo(() => ({
    navigate,
    selectedProduct,
    setSelectedProduct,
    basalamToken,
    setBasalamToken,
    authorizedFetch,
    setGlobalLoading,
    lastNavigation,
  }), [navigate, selectedProduct, basalamToken, authorizedFetch, lastNavigation]);

  return (
    <AppContext.Provider value={contextValue}>
      <div className="font-['Inter'] antialiased bg-gray-50 text-gray-900 min-h-screen">
        {renderPage()}
        <GlobalLoadingOverlay isLoading={globalLoading} />
      </div>
    </AppContext.Provider>
  );
};


export default App;


