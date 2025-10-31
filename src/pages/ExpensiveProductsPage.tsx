import { useContext, useEffect, useState, useRef, useCallback } from "react";
import { AppContext } from "../context/AppContext";
import {Header} from "../components/Header";
import {LoadingSpinner} from "../components/LoadingSpinner";
import {MyProductCard} from "../components/MyProductCard";
import {ExpensiveFactorModal} from "../components/ExpensiveFactorModal";
import {TutorialModal} from "../components/TutorialModal";
import * as productService from "../services/productService";
import { ApiError } from "../services/apiError";
import { Settings } from "lucide-react";

const ExpensiveProductsPage = () => {
  const [isReevaluateModalOpen, setIsReevaluateModalOpen] = useState(false);
  const [pendingReevaluation, setPendingReevaluation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expensiveFactor, setExpensiveFactor] = useState<number | null>(null);
  const [factorError, setFactorError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  
  // Tutorial video embed code (iframe version)
  const tutorialVideoEmbed = '<style>.h_iframe-aparat_embed_frame{position:relative;}.h_iframe-aparat_embed_frame .ratio{display:block;width:100%;height:auto;}.h_iframe-aparat_embed_frame iframe{position:absolute;top:0;left:0;width:100%;height:100%;}</style><div class="h_iframe-aparat_embed_frame"><span style="display: block;padding-top: 57%"></span><iframe src="https://www.aparat.com/video/video/embed/videohash/xtd3cph/vt/frame" allowFullScreen="true" webkitallowfullscreen="true" mozallowfullscreen="true"></iframe></div>';
  
  
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

  // Fetch expensive factor
  const fetchExpensiveFactor = useCallback(async () => {
    if (!basalamToken) return;
    
    try {
      const data = await productService.getExpensiveFactor(authorizedFetch);
      setExpensiveFactor(data.expensiveFactor);
      setFactorError(null);
      console.log("[ExpensiveProductsPage] Fetched expensive factor:", data.expensiveFactor);
    } catch (err: any) {
      console.error("[ExpensiveProductsPage] Factor error:", err);
      setFactorError("دریافت اطلاعات با خطا مواجه شد. بعداً تلاش کنید.");
      
      if (err instanceof ApiError && err.status === 401) {
        setBasalamToken("");
        navigate("login");
      }
    }
  }, [basalamToken, authorizedFetch, setBasalamToken, navigate]);

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
    // Always fetch the expensive factor
    fetchExpensiveFactor();
    
    // Only fetch if not initialized - this respects state preservation on back navigation
    if (!isInitialized) {
      console.log("[ExpensiveProductsPage] Fetching products - isInitialized:", isInitialized);
      fetchProducts();
    } else {
      console.log("[ExpensiveProductsPage] Skipping fetch - using cached data, isInitialized:", isInitialized);
    }
  }, []); // Empty dependency array - only run on mount

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

  const handleUpdateFactor = async (newFactor: number) => {
    try {
      await productService.updateExpensiveFactor(authorizedFetch, newFactor);
      setExpensiveFactor(newFactor);
      
      // Refetch products after successful update
      await fetchProducts();
    } catch (err: any) {
      console.error("[ExpensiveProductsPage] Update factor error:", err);
      
      if (err instanceof ApiError && err.status === 401) {
        setBasalamToken("");
        navigate("login");
      }
      
      throw err; // Re-throw to let modal handle the error
    }
  };

  const getPercentText = (factor: number) => {
    const percent = Math.round((factor - 1) * 100);
    const absPercent = Math.abs(percent);
    
    if (percent === 0) {
      return {
        prefix: "محصولی بیش از حد گران حساب می‌شود اگر قیمت آن بالاتر از",
        highlight: "ارزان‌ترین رقیب",
        suffix: "باشد."
      };
    } else if (percent < 0) {
      return {
        prefix: "محصولی بیش از حد گران حساب می‌شود اگر قیمت آن بالاتر از",
        highlight: `${absPercent} درصد کمتر از ارزان‌ترین رقیب`,
        suffix: "باشد."
      };
    } else {
      return {
        prefix: "محصولی بیش از حد گران حساب می‌شود اگر قیمت آن بالاتر از",
        highlight: `${absPercent} درصد بیشتر از ارزان‌ترین رقیب`,
        suffix: "باشد."
      };
    }
  };

  const getExamplePrice = (factor: number) => {
    const basePrice = 100;
    const threshold = Math.round(basePrice * factor);
    return threshold;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header 
        onBack={() => {
          // Clear state when going back to dashboard
          clearExpensiveProductsState();
          navigate('dashboard');
        }}
        onHelp={() => setIsTutorialOpen(true)}
        onHome={() => {
          clearExpensiveProductsState();
          navigate('dashboard');
        }}
        onContact={() => navigate('contact-us')}
      />
      <div className="p-4 flex flex-col space-y-4">
        {/* Page Title */}
        <div className="text-center mb-2">
          <h1 className="text-2xl font-bold text-gray-800">محصولات با قیمت خیلی بالا</h1>
        </div>
        
        {/* Explanation Section */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="bg-yellow-500 p-2 rounded-lg flex-shrink-0">
              <Settings className="text-white" size={24} />
            </div>
            <div className="flex-1">
              {expensiveFactor !== null && !factorError ? (
                <>
                  <p className="text-gray-800 text-base leading-relaxed mb-2" dir="rtl">
                    {getPercentText(expensiveFactor).prefix}{" "}
                    <span className="font-bold text-yellow-700 bg-yellow-100 px-1 rounded">
                      "{getPercentText(expensiveFactor).highlight}"
                    </span>{" "}
                    {getPercentText(expensiveFactor).suffix}
                  </p>
                  <p className="text-xs text-gray-600 mb-3" dir="rtl">
                    <span className="font-semibold">مثال:</span> اگر ارزان‌ترین رقیب 100 هزار تومان باشد، آنگاه اگر محصول شما بیشتر از{" "}
                    <span className="font-bold text-yellow-600">{getExamplePrice(expensiveFactor)} هزار تومان</span> باشد، گران حساب می‌شود.
                  </p>
                  <p className="text-sm text-gray-600">
                    برای تغییر این فرمول،{" "}
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="text-yellow-600 font-semibold underline hover:text-yellow-700 transition"
                    >
                      اینجا کلیک کنید
                    </button>
                  </p>
                </>
              ) : factorError ? (
                <div className="text-red-600 text-sm">
                  <p className="font-semibold mb-1">خطا در دریافت اطلاعات</p>
                  <p>{factorError}</p>
                </div>
              ) : (
                <div className="text-gray-500 text-sm">در حال بارگذاری اطلاعات...</div>
              )}
            </div>
          </div>
        </div>

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
          <div className="text-center mt-8 space-y-4">
            <p className="text-gray-500">محصول غیر رقابتی‌ای یافت نشد.</p>
            <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4 max-w-2xl mx-auto">
              <p className="text-gray-800 font-bold text-lg" dir="rtl">
                ⚠️ شاید هنوز رقیب اضافه نکرده‌اید!
              </p>
              <p className="text-gray-700 mt-2" dir="rtl">
                به بخش <span className="font-semibold">"همه محصولات"</span> بروید، روی محصولات خود کلیک کنید و رقیب‌ها را به آن‌ها اضافه کنید.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Expensive Factor Modal */}
      {expensiveFactor !== null && (
        <ExpensiveFactorModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          currentFactor={expensiveFactor}
          onUpdate={handleUpdateFactor}
        />
      )}

      {/* Tutorial Modal */}
      <TutorialModal
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
        videoEmbedCode={tutorialVideoEmbed}
      />
    </div>
  );
};

export default ExpensiveProductsPage;
