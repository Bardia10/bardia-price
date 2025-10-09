import { useContext, useEffect, useState, useRef, useCallback } from "react";
import { AppContext } from "../context/AppContext";
import {Header} from "../components/Header";
import {LoadingSpinner} from "../components/LoadingSpinner";
import {MyProductCard} from "../components/MyProductCard";
import * as productService from "../services/productService";
import { ApiError } from "../services/apiError";

const ExpensiveProductsPage = () => {
  const [isReevaluateModalOpen, setIsReevaluateModalOpen] = useState(false);
  const [pendingReevaluation, setPendingReevaluation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchedOnceRef = useRef(false);
  
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('ExpensiveProductsPage must be used within AppContext.Provider');
  }
  const { 
    navigate, 
    authorizedFetch, 
    basalamToken, 
    setSelectedProduct, 
    setGlobalLoading, 
    setBasalamToken,
    expensiveProductsState,
    setExpensiveProductsState,
    clearExpensiveProductsState
  } = context;
  
  // Use state from context
  const { products, scrollPosition, isInitialized } = expensiveProductsState;

  // Debug: Log component mount/unmount
  useEffect(() => {
    console.log("[ExpensiveProductsPage] Component mounted");
    return () => {
      console.log("[ExpensiveProductsPage] Component unmounted");
    };
  }, []);

  // Map API product shape to internal Product type
  const mapExpensiveProduct = (p: any) => {
    const id = String(p?.id ?? '');
    const title = String(p?.title ?? '');
    const price = Number(p?.price ?? 0);
    const photoObj = p?.photo || {};
    const primaryPhoto = photoObj.md || photoObj.sm || photoObj.lg || photoObj.xs || photoObj.original || 'https://placehold.co/200x200/cccccc/333333?text=No+Image';
    const photos: string[] = [];
    if (primaryPhoto) photos.push(primaryPhoto);
    if (photoObj.lg && !photos.includes(photoObj.lg)) photos.push(photoObj.lg);
    if (photoObj.md && !photos.includes(photoObj.md)) photos.push(photoObj.md);
    if (photoObj.sm && !photos.includes(photoObj.sm)) photos.push(photoObj.sm);
    if (photoObj.xs && !photos.includes(photoObj.xs)) photos.push(photoObj.xs);
    if (photoObj.original && !photos.includes(photoObj.original)) photos.push(photoObj.original);
    const vendorIdentifier = p?.vendor?.identifier || 'shop';
    const basalamUrl = `https://basalam.com/${vendorIdentifier}/product/${id}`;
    const description = p?.description || 'بدون توضیحات';
    return {
      id,
      title,
      price,
      photo_id: primaryPhoto,
      photos,
      description,
      basalamUrl,
      createdAt: new Date().toISOString(),
    };
  };

  // Fetch products function
  const fetchProducts = useCallback(async () => {
    if (!basalamToken) return;
    
    setIsLoading(true);
    setGlobalLoading(true);
    setError(null);
    
    try {
      const data = await productService.fetchExpensiveProducts(authorizedFetch);
      const mappedProducts = data.products.map(mapExpensiveProduct);
      
      setExpensiveProductsState({ 
        products: mappedProducts,
        isInitialized: true
      });
      
      console.log("[ExpensiveProductsPage] Fetched products:", mappedProducts);
    } catch (err: any) {
      console.error("[ExpensiveProductsPage] Error:", err);
      
      // Handle 401 errors consistently
      if (err instanceof ApiError && err.status === 401) {
        setBasalamToken("");
        navigate("login");
        setError("باید دوباره لاگین کنید");
      } else {
        setError(err?.message || "خطای نامشخص در دریافت محصولات");
      }
    } finally {
      setIsLoading(false);
      setGlobalLoading(false);
    }
  }, [basalamToken, authorizedFetch, setGlobalLoading, setBasalamToken, navigate]); // Removed setExpensiveProductsState from dependencies

  // Initial fetch on page load or when coming from dashboard
  useEffect(() => {
    // Only fetch if not initialized or coming from dashboard
    if (!isInitialized && !fetchedOnceRef.current) {
      console.log("[ExpensiveProductsPage] Fetching products - isInitialized:", isInitialized, "fetchedOnce:", fetchedOnceRef.current);
      fetchedOnceRef.current = true;
      fetchProducts();
    } else {
      console.log("[ExpensiveProductsPage] Skipping fetch - isInitialized:", isInitialized, "fetchedOnce:", fetchedOnceRef.current);
    }
  }, [fetchProducts, isInitialized]);

  // Restore scroll position when coming back to the page
  useEffect(() => {
    if (isInitialized && scrollPosition > 0) {
      // Use setTimeout to ensure the DOM is ready and products are rendered
      const timer = setTimeout(() => {
        window.scrollTo(0, scrollPosition);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isInitialized, scrollPosition, products.length]);

  // Save scroll position when user scrolls
  useEffect(() => {
    const handleScroll = () => {
      setExpensiveProductsState({ scrollPosition: window.scrollY });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []); // Empty dependency array since setExpensiveProductsState should be stable

  const handleProductClick = (product: any) => {
    setSelectedProduct(product);
    navigate('product-detail', { productId: product.id, from: 'not-best-price' });
  };

  const handleBasalamPageClick = (e: React.MouseEvent<HTMLButtonElement>, url: string) => {
    e.stopPropagation();
    window.open(url, '_blank');
  };

  // Handle reevaluation with proper error handling
  const handleReevaluation = async () => {
    setPendingReevaluation(true);
    setIsReevaluateModalOpen(false);
    
    try {
      await productService.triggerExpensiveReevaluation(authorizedFetch);
      // Refresh the products by fetching again
      setTimeout(() => {
        fetchProducts();
        setPendingReevaluation(false);
      }, 1000); // Small delay to ensure the reevaluation is processed
    } catch (err: any) {
      console.error("[ExpensiveProductsPage] Reevaluation error:", err);
      
      // Handle 401 errors consistently
      if (err instanceof ApiError && err.status === 401) {
        setBasalamToken("");
        navigate("login");
      }
      
      setPendingReevaluation(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header title="محصولات با قیمت نامناسب" onBack={() => {
        // Clear state when going back to dashboard
        clearExpensiveProductsState();
        navigate('dashboard');
      }} />
      <div className="p-4 flex flex-col space-y-4">
        {/* Reevaluate Button */}
        {/* <button
          className="mb-4 px-4 py-2 bg-orange-600 text-white rounded-lg font-semibold shadow hover:bg-orange-700 transition w-fit self-end"
          onClick={() => setIsReevaluateModalOpen(true)}
          disabled={isReevaluating}
        >
          ارزیابی دوباره
        </button> */}

        {/* Modal for confirmation */}
        {isReevaluateModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4" onClick={() => setIsReevaluateModalOpen(false)}>
            <div className="bg-white rounded-xl shadow-xl border border-gray-200 w-full max-w-sm" onClick={e => e.stopPropagation()}>
              <div className="p-4 border-b">
                <h3 className="font-bold text-gray-800 text-lg">ارزیابی دوباره محصولات غیر رقابتی</h3>
              </div>
              <div className="p-4">
                <p className="text-sm text-gray-700 mb-4">انجام این عملیات چند دقیقه زمان می‌برد. آیا مطمئن هستید که می‌خواهید منتظر بمانید؟</p>
                <div className="flex justify-end gap-2">
                  <button
                    className="px-4 py-2 rounded-md border bg-gray-100 text-gray-700 hover:bg-gray-200"
                    onClick={() => setIsReevaluateModalOpen(false)}
                    disabled={pendingReevaluation}
                  >
                    انصراف
                  </button>
                  <button
                    className="px-4 py-2 rounded-md bg-orange-600 text-white font-semibold hover:bg-orange-700"
                    disabled={pendingReevaluation}
                    onClick={handleReevaluation}
                  >
                    تایید
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {isLoading && <LoadingSpinner />}
        {error && <div className="text-red-600 text-sm text-right">{error}</div>}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-4">
          {products.map((product: any) => (
            <MyProductCard
              key={product.id}
              product={product}
              onClick={() => handleProductClick(product)}
              onBasalamPageClick={(e: any) => handleBasalamPageClick(e, product.basalamUrl)}
            />
          ))}
        </div>
        {products.length === 0 && !isLoading && (
          <p className="text-center text-gray-500 mt-8">محصول غیر رقابتی‌ای یافت نشد.</p>
        )}
      </div>
    </div>
  );
};

export default ExpensiveProductsPage;
