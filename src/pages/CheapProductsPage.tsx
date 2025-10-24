import { useContext, useEffect, useState, useCallback } from "react";
import { AppContext } from "../context/AppContext";
import {Header} from "../components/Header";
import {LoadingSpinner} from "../components/LoadingSpinner";
import {MyProductCard} from "../components/MyProductCard";
import {CheapFactorModal} from "../components/CheapFactorModal";
import {TutorialModal} from "../components/TutorialModal";
import * as productService from "../services/productService";
import { ApiError } from "../services/apiError";
import { Settings } from "lucide-react";

const CheapProductsPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cheapFactor, setCheapFactor] = useState<number | null>(null);
  const [factorError, setFactorError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  
  // Tutorial video embed code (iframe version - updated after publishing)
  const tutorialVideoEmbed = '<style>.h_iframe-aparat_embed_frame{position:relative;}.h_iframe-aparat_embed_frame .ratio{display:block;width:100%;height:auto;}.h_iframe-aparat_embed_frame iframe{position:absolute;top:0;left:0;width:100%;height:100%;}</style><div class="h_iframe-aparat_embed_frame"><span style="display: block;padding-top: 57%"></span><iframe src="https://www.aparat.com/video/video/embed/videohash/hgazw2t/vt/frame" allowFullScreen="true" webkitallowfullscreen="true" mozallowfullscreen="true"></iframe></div>';
  
  
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('CheapProductsPage must be used within AppContext.Provider');
  }
  const { 
    navigate, 
    authorizedFetch, 
    basalamToken, 
    setSelectedProduct, 
    setGlobalLoading, 
    setBasalamToken,
    cheapProductsState,
    setCheapProductsState,
    clearCheapProductsState
  } = context;
  
  // Use state from context
  const { products, scrollPosition, isInitialized } = cheapProductsState;

  // Debug: Log component mount/unmount
  useEffect(() => {
    console.log("[CheapProductsPage] Component mounted");
    return () => {
      console.log("[CheapProductsPage] Component unmounted");
    };
  }, []);

  // Map API product shape to internal Product type
  const mapCheapProduct = (p: any) => {
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

  // Fetch cheap factor
  const fetchCheapFactor = useCallback(async () => {
    if (!basalamToken) return;
    
    try {
      const data = await productService.getCheapFactor(authorizedFetch);
      setCheapFactor(data.cheapFactor);
      setFactorError(null);
      console.log("[CheapProductsPage] Fetched cheap factor:", data.cheapFactor);
    } catch (err: any) {
      console.error("[CheapProductsPage] Factor error:", err);
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
      const data = await productService.fetchCheapProducts(authorizedFetch);
      const mappedProducts = data.products.map(mapCheapProduct);
      
      setCheapProductsState({ 
        products: mappedProducts,
        isInitialized: true
      });
      
      console.log("[CheapProductsPage] Fetched products:", mappedProducts);
    } catch (err: any) {
      console.error("[CheapProductsPage] Error:", err);
      
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
  }, [basalamToken, authorizedFetch, setGlobalLoading, setBasalamToken, navigate]);

  // Initial fetch on page load or when coming from dashboard
  useEffect(() => {
    // Always fetch the cheap factor
    fetchCheapFactor();
    
    // Only fetch products if not initialized - this respects state preservation on back navigation
    if (!isInitialized) {
      console.log("[CheapProductsPage] Fetching products - isInitialized:", isInitialized);
      fetchProducts();
    } else {
      console.log("[CheapProductsPage] Skipping fetch - using cached data, isInitialized:", isInitialized);
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
      setCheapProductsState({ scrollPosition: window.scrollY });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []); // Empty dependency array since setCheapProductsState should be stable

  const handleProductClick = (product: any) => {
    setSelectedProduct(product);
    navigate('product-detail', { productId: product.id, from: 'cheap-products' });
  };

  const handleBasalamPageClick = (e: React.MouseEvent<HTMLButtonElement>, url: string) => {
    e.stopPropagation();
    window.open(url, '_blank');
  };

  const handleUpdateFactor = async (newFactor: number) => {
    try {
      await productService.updateCheapFactor(authorizedFetch, newFactor);
      setCheapFactor(newFactor);
      
      // Refetch products after successful update
      await fetchProducts();
    } catch (err: any) {
      console.error("[CheapProductsPage] Update factor error:", err);
      
      if (err instanceof ApiError && err.status === 401) {
        setBasalamToken("");
        navigate("login");
      }
      
      throw err; // Re-throw to let modal handle the error
    }
  };

  const getPercentText = (factor: number) => {
    const percent = Math.round((1 - factor) * 100);
    const absPercent = Math.abs(percent);
    
    if (percent === 0) {
      return {
        prefix: "محصولی بیش از حد ارزان حساب می‌شود اگر قیمت آن زیر",
        highlight: "ارزان‌ترین رقیب",
        suffix: "باشد."
      };
    } else if (percent > 0) {
      return {
        prefix: "محصولی بیش از حد ارزان حساب می‌شود اگر قیمت آن زیر",
        highlight: `${absPercent} درصد کمتر از ارزان‌ترین رقیب`,
        suffix: "باشد."
      };
    } else {
      return {
        prefix: "محصولی بیش از حد ارزان حساب می‌شود اگر قیمت آن زیر",
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
          clearCheapProductsState();
          navigate('dashboard');
        }}
        onHelp={() => setIsTutorialOpen(true)}
        onHome={() => {
          clearCheapProductsState();
          navigate('dashboard');
        }}
        onContact={() => navigate('contact-us')}
      />
      <div className="p-4 flex flex-col space-y-4">
        {/* Page Title */}
        <div className="text-center mb-2">
          <h1 className="text-2xl font-bold text-gray-800">محصولات با قیمت خیلی پایین</h1>
        </div>
        
        {/* Explanation Section */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="bg-green-500 p-2 rounded-lg flex-shrink-0">
              <Settings className="text-white" size={24} />
            </div>
            <div className="flex-1">
              {cheapFactor !== null && !factorError ? (
                <>
                  <p className="text-gray-800 text-base leading-relaxed mb-2" dir="rtl">
                    {getPercentText(cheapFactor).prefix}{" "}
                    <span className="font-bold text-green-700 bg-green-100 px-1 rounded">
                      "{getPercentText(cheapFactor).highlight}"
                    </span>{" "}
                    {getPercentText(cheapFactor).suffix}
                  </p>
                  <p className="text-xs text-gray-600 mb-3" dir="rtl">
                    <span className="font-semibold">مثال:</span> اگر ارزان‌ترین رقیب 100 هزار تومان باشد، آنگاه اگر محصول شما کمتر از{" "}
                    <span className="font-bold text-green-600">{getExamplePrice(cheapFactor)} هزار تومان</span> باشد، ارزان حساب می‌شود.
                  </p>
                  <p className="text-sm text-gray-600">
                    برای تغییر این فرمول،{" "}
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="text-green-600 font-semibold underline hover:text-green-700 transition"
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
          <p className="text-center text-gray-500 mt-8">محصول ارزان‌تری یافت نشد.</p>
        )}
      </div>

      {/* Cheap Factor Modal */}
      {cheapFactor !== null && (
        <CheapFactorModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          currentFactor={cheapFactor}
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

export default CheapProductsPage;
