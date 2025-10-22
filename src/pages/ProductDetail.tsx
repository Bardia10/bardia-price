import React, {
  useState,
  useEffect,
  useContext,
  useRef,
  useCallback
} from "react";
import { useParams } from 'react-router-dom';
import { AppContext } from "../context/AppContext";

// components
import { Header } from "../components/Header";
import { LoadingSpinner } from "../components/LoadingSpinner";

// utils
import { formatPrice } from "../lib/format";
//icons
import { Search, ChevronLeft, Package, Sparkles, AlertCircle, Eye, EyeOff, Settings, X, ExternalLink, Wrench, SlidersHorizontal, RotateCcw, BadgeCheck } from 'lucide-react';

import * as productService from "../services/productService";
import { ApiError } from "../services/apiError";

import { useProductDetail } from "../hooks/useProductDetail"; 
import { useSimilars } from "../hooks/useSimilars"; 
import { useExpensiveManagement } from "../hooks/useExpensiveManagement"; 
import { useCompetitorsOverview } from "../hooks/useCompetitorsOverview"; 
import { useCompetitorsV2 } from "../hooks/useCompetitorsV2"; 

import FloatingProductCard from '../components/ProductDetail/FloatingProductCard';
import CompetitorOverview from '../components/ProductDetail/CompetitorOverview';
import ProductImageGallery from "../components/ProductDetail/ProductImageGallery";
import SimilarProducts from "../components/ProductDetail/SimilarProducts";
import CompetitorsModal from "../components/ProductDetail/CompetitorsModal";






const ProductDetail = () => {
  // Get product ID from URL parameters
  const { id: productId } = useParams<{ id: string }>();
  
  console.log('[ProductDetail] Component loaded with productId from URL:', productId);
  
  // Local search for similar products
  const [similarSearchTerm, setSimilarSearchTerm] = useState('');
  // Refresh key to trigger re-fetch
  const [refreshKey, setRefreshKey] = useState(0);
  // State for deleting competitor IDs
  const [deletingCompetitorIds, setDeletingCompetitorIds] = useState<Set<number>>(new Set());
  // State for locally removed competitor IDs to handle optimistic UI updates
  const [locallyRemovedCompetitorIds, setLocallyRemovedCompetitorIds] = useState<Set<number>>(new Set());

  const context = useContext(AppContext);
  if (!context) {
    throw new Error('ProductDetail must be used within AppContext.Provider');
  }
  const { navigate, selectedProduct, authorizedFetch, basalamToken, setGlobalLoading, lastNavigation, setBasalamToken } = context;
  
  console.log('[ProductDetail] Context values:', {
    hasSelectedProduct: !!selectedProduct,
    selectedProductId: selectedProduct?.id,
    basalamToken: !!basalamToken,
    productIdFromUrl: productId
  });
  // Track where user came from (sessionStorage fallback)
  const [fromSection, setFromSection] = useState<string | null>(null);
  useEffect(() => {
    if (lastNavigation && lastNavigation.from) {
      setFromSection(lastNavigation.from);
      sessionStorage.setItem('productDetailFrom', lastNavigation.from);
    } else {
      const stored = sessionStorage.getItem('productDetailFrom');
      if (stored) setFromSection(stored);
    }
  }, [lastNavigation]);


  // Get the actual product ID to use (from URL parameter or selectedProduct fallback)
  const actualProductId = productId !== 'current' ? productId : selectedProduct?.id;
  
  console.log('[ProductDetail] Product ID resolution:', {
    urlProductId: productId,
    selectedProductId: selectedProduct?.id,
    actualProductId,
    willFetch: !!actualProductId && !!basalamToken
  });

  // inside ProductDetail component:
  const { productDetail, isLoadingProductDetail, productDetailError } = useProductDetail(
    actualProductId,
    basalamToken,
    authorizedFetch,
    setBasalamToken,
    navigate,
    refreshKey
  );
  
  console.log('[ProductDetail] useProductDetail results:', {
    hasProductDetail: !!productDetail,
    isLoading: isLoadingProductDetail,
    hasError: !!productDetailError,
    errorMessage: productDetailError,
    productDetailId: productDetail?.id
  });

  console.log('[ProductDetail] About to call other hooks with productDetail:', !!productDetail);



  // --- Existing states ---
  const [showOriginalProductFloating, setShowOriginalProductFloating] = useState(false);
  const [isFloatingExpanded, setIsFloatingExpanded] = useState(false);
  const [showSimilars, setShowSimilars] = useState(true)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  // Pagination for similar products
  const holdTimerRef = useRef<number | null>(null);
  const similarsContainerRef = useRef<HTMLDivElement | null>(null);

  // New confirmed competitors (fetched from webhook + Basalam core details)
  type ConfirmedCompetitorDetail = { id: number; title: string; price: number; photo: string; vendorIdentifier: string; productUrl: string };
  const competitorDetailCacheRef = useRef<Map<number, ConfirmedCompetitorDetail>>(new Map());
  // Track loading state for adding competitors
  const [addingCompetitorIds, setAddingCompetitorIds] = useState<Set<number>>(new Set());
  // Refresh trigger for confirmed competitors
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  // Modal state for competitors
  const [isCompetitorsModalOpen, setIsCompetitorsModalOpen] = useState(false);
  const competitorsV2Ref = useRef<any>(null);

  const {
    competitors: competitorsV2,
    isLoading: isLoadingCompetitorsV2,
    error: competitorsV2Error,
    hasMore: hasMoreCompetitors,
    isLoadingMore: isLoadingMoreCompetitors,
    loadMore: loadMoreCompetitors,
    load: loadCompetitorsV2,
  } = useCompetitorsV2(
    authorizedFetch,
    productDetail?.id,
    setBasalamToken,
    navigate,
    refreshTrigger,
    false // autoFetch: do not fetch on mount
  );

  // When modal opens, fetch page 1 of competitors
  useEffect(() => {
    if (isCompetitorsModalOpen && productDetail?.id) {
      loadCompetitorsV2(1);
    }
  }, [isCompetitorsModalOpen, productDetail?.id]);


  // Hook to get competitor overview data
  const { 
    refresh: refreshCompetitorsOverview,
    ...competitorsOverviewData 
  } = useCompetitorsOverview(
    authorizedFetch, 
    actualProductId, 
    productDetail?.price || 0,
    setBasalamToken,
    navigate,
    refreshKey
  );

  // Handler for deleting competitor
  const handleDeleteCompetitor = async (competitorId: number) => {
    if (deletingCompetitorIds.has(competitorId)) return;
    setDeletingCompetitorIds(prev => new Set(prev).add(competitorId));

    try {
      await productService.deleteCompetitor(authorizedFetch, productDetail.id, competitorId);

      setSearchResults(prevResults =>
        prevResults.map((s: any) =>
          s.id === competitorId ? { ...s, isCompetitor: false } : s
        )
      );

      setLocallyRemovedCompetitorIds(prev => new Set(prev).add(competitorId));

      refreshCompetitorsOverview('light'); // Light refresh
    } catch (err: any) {
      if (err instanceof ApiError && err.status === 401) {
        setBasalamToken("");
        navigate("login");
        alert("باید دوباره لاگین کنید");
      } else {
        alert(err?.message || "خطا در حذف رقیب.");
      }
    } finally {
      setDeletingCompetitorIds(prev => {
        const next = new Set(prev);
        next.delete(competitorId);
        return next;
      });
    }
  };

  const handleDeleteCompetitorClick = async (competitorId: number) => {
  if (deletingCompetitorIds.has(competitorId)) return;

  setDeletingCompetitorIds(prev => new Set(prev).add(competitorId));

  try {
    await productService.deleteCompetitor(authorizedFetch, productDetail.id, competitorId);

    setSearchResults(prevResults =>
      prevResults.map((s: any) =>
        s.id === competitorId ? { ...s, isCompetitor: false } : s
      )
    );

    setLocallyRemovedCompetitorIds(prev => new Set(prev).add(competitorId));

    setToast({ message: `رقیب حذف شد`, type: 'success' });
    setTimeout(() => setToast(null), 2000);

    refreshCompetitorsOverview('light'); // Light refresh
  } catch (e: any) {
    setToast({ message: e?.message || 'خطا در حذف رقیب', type: 'error' });
    setTimeout(() => setToast(null), 2000);
  } finally {
    setDeletingCompetitorIds(prev => {
      const next = new Set(prev);
      next.delete(competitorId);
      return next;
    });
  }
};

  useEffect(() => {
    // If there's no product ID from URL and no selectedProduct fallback, navigate to my-products
    if (!actualProductId) {
      navigate('my-products');
    }
  }, [actualProductId, navigate]);


  // Map search API response to internal format
  const mapSearchProduct = (p: any) => {
    const id = String(p?.id ?? '');
    const title = String(p?.name ?? '');
    const price = Number(p?.price ?? 0);
    const primaryPhoto = p?.photo?.MEDIUM || p?.photo?.SMALL || p?.photo?.LARGE || p?.photo?.EXTRA_SMALL || 'https://placehold.co/200x200/cccccc/333333?text=No+Image';
    const vendorIdentifier = p?.vendor?.identifier || 'shop';
    const basalamUrl = `https://basalam.com/${vendorIdentifier}/product/${id}`;
    const ratingAvg = p?.rating?.average;
    const ratingCount = p?.rating?.count;
    const categoryTitle = p?.categoryTitle;
    const descriptionParts: string[] = [];
    if (categoryTitle) descriptionParts.push(String(categoryTitle));
    if (ratingAvg != null && ratingCount != null) descriptionParts.push(`امتیاز ${ratingAvg} (${ratingCount})`);
    const description = descriptionParts.join(' • ') || 'بدون توضیحات';
    return {
      id,
      title,
      price,
      photo_id: primaryPhoto,
      description,
      basalamUrl,
      vendorIdentifier, // Include vendor identifier for API calls
      vendor: p?.vendor || {}, // Pass full vendor object for display
      isCompetitor: false, // Default to false, can be toggled
      createdAt: new Date().toISOString(),
    } as any;
  };

  // Fetch similar products from search API (with pagination)
  const {
  searchResults,
  isLoadingSearch,
  isLoadingMoreSimilars,
  hasMoreSimilarPages,
  hasFetchedSimilars,
  searchError,
  fetchSimilarProducts,
  fetchTextSearch,
  loadMoreSimilars,
  setSearchResults,
  searchMode,
  textSearchQuery,
} = useSimilars(
  productDetail, // Use productDetail instead of selectedProduct
  basalamToken,
  authorizedFetch,
  mapSearchProduct,
  setGlobalLoading,
  setBasalamToken,
  navigate
);



const {
  isLoadingConfirmedCompetitors,
  confirmedCompetitorsError,
  lowestCompetitor,
  averageCompetitorPrice,
  lowestCompetitorPrice, // ✅ new - actual min price from backend
  competitorsCount, // ✅ added backend count
  lowestBadgeText,
  lowestBadgeClass,
  avgBadgeText,
  avgBadgeClass,
} = competitorsOverviewData;





   // Auto-manage product in expensives based on price comparison with competitors
useExpensiveManagement({
  selectedProduct: productDetail, // Use productDetail as the product data
  productDetail,
  confirmedCompetitorDetails: competitorsV2,
  authorizedFetch,
  basalamToken,
  setBasalamToken,
  navigate
});


  const handleScroll = useCallback(() => {
    const scrollPosition = window.scrollY;
    setShowOriginalProductFloating(scrollPosition > 200);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // ...existing code...


  // --- Sequential Add Competitor Queue ---
  const addCompetitorQueueRef = useRef<(() => Promise<void>)[]>([]);
  const isProcessingQueueRef = useRef(false);

  const processAddCompetitorQueue = async () => {
    if (isProcessingQueueRef.current) return;
    isProcessingQueueRef.current = true;
    while (addCompetitorQueueRef.current.length > 0) {
      const fn = addCompetitorQueueRef.current.shift();
      if (fn) await fn();
    }
    isProcessingQueueRef.current = false;
  };

  type SearchProduct = any;

  const addAsCompetitor = (similarProduct: SearchProduct) => {
    if (!productDetail?.id || !similarProduct?.id || !similarProduct?.vendorIdentifier) {
      setToast({ message: 'اطلاعات محصول ناقص است', type: 'error' });
      setTimeout(() => setToast(null), 2000);
      return;
    }

    const productId = Number(similarProduct.id); // ✅ ensure number type

    if (addingCompetitorIds.has(productId)) return;

    // immediately mark as loading
    setAddingCompetitorIds(prev => new Set(prev).add(productId));

    addCompetitorQueueRef.current.push(async () => {
      try {
        await productService.addCompetitor(
          authorizedFetch,
          productDetail.id,
          productId,
          similarProduct.vendorIdentifier
        );

        setSearchResults(prevResults =>
          prevResults.map((s: SearchProduct) =>
            Number(s.id) === productId ? { ...s, isCompetitor: true } : s
          )
        );

        setToast({ message: `"${similarProduct.title}" به عنوان رقیب اضافه شد`, type: 'success' });
        setTimeout(() => setToast(null), 3000);

        refreshCompetitorsOverview('light'); // Light refresh
      } catch (error: any) {
        setToast({ message: error?.message || 'خطا در افزودن رقیب', type: 'error' });
        setTimeout(() => setToast(null), 3000);
      } finally {
        // remove loading state
        setAddingCompetitorIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(productId);
          return newSet;
        });
      }
    });

    processAddCompetitorQueue();
  };


 // Normalize competitor IDs
  const competitorIds = new Set(
    competitorsV2.map((c: any) => Number(c.id))
  );

  const sortedSimilars = searchResults
    .filter((p: any) => {
      if (!similarSearchTerm.trim()) return true;
      const term = similarSearchTerm.trim().toLowerCase();
      return (
        p.title?.toLowerCase().includes(term) ||
        p.description?.toLowerCase().includes(term)
      );
    })
    .map((p: any) => ({
      ...p,
      isCompetitor: (p.isCompetitor || competitorIds.has(Number(p.id))) && !locallyRemovedCompetitorIds.has(Number(p.id)),
    }));


      
  // Press-and-hold to open lightbox
  const startHoldToZoom = (src: string, stopProp?: (e: any) => void) => (e: any) => {
    if (stopProp) stopProp(e);
    if (holdTimerRef.current) {
      window.clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    holdTimerRef.current = window.setTimeout(() => {
      setLightboxSrc(src);
      holdTimerRef.current = null;
    }, 450);
  };
  const cancelHoldToZoom = () => {
    if (holdTimerRef.current) {
      window.clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  };




  console.log('[ProductDetail] Render conditions:', {
    hasActualProductId: !!actualProductId,
    isLoadingProductDetail,
    hasProductDetail: !!productDetail,
    hasProductDetailError: !!productDetailError
  });

  // Show loading if we're still fetching the product detail
  if (isLoadingProductDetail) {
    console.log('[ProductDetail] Showing loading because isLoadingProductDetail is true');
    return <LoadingSpinner />;
  }
  
  // Show error if there was an error fetching product detail
  if (productDetailError) {
    console.log('[ProductDetail] Showing error:', productDetailError);
    return <div className="min-h-screen flex items-center justify-center text-red-600">{productDetailError}</div>;
  }
  
  // Show loading if we don't have product detail yet (but are not in error state)
  if (!productDetail && actualProductId && basalamToken) {
    console.log('[ProductDetail] Showing loading because productDetail is not available yet');
    return <LoadingSpinner />;
  }
  
  // If no productDetail and no loading/error, it means no valid product ID
  if (!productDetail) {
    console.log('[ProductDetail] No productDetail available, redirecting...');
    return <LoadingSpinner />;
  }

  // Removed old dummy competitor metrics

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header title="جزئیات محصول" compact />
      {/* Refresh Button */}
      <button
        onClick={() => setRefreshKey((k) => k + 1)}
        className="fixed top-2 right-2 z-40 bg-white/90 border border-gray-200 p-2 rounded-full shadow hover:bg-white flex items-center justify-center gap-1 overflow-visible"
        aria-label="تازه‌سازی اطلاعات"
        title="تازه‌سازی اطلاعات"
      >
        <div className="flex items-center justify-center h-5 w-5">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-full w-full text-blue-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h5M20 20v-5h-5M5 19a9 9 0 1113-13"
            />
          </svg>
        </div>
        <span className="text-xs text-blue-600 font-semibold">تازه‌سازی</span>
      </button>

      <button
        onClick={() => {
          if (fromSection === 'not-best-price') {
            navigate('not-best-price');
          } else if (fromSection === 'cheap-products') {
            navigate('cheap-products');
          } else {
            navigate('my-products');
          }
        }}
        className="fixed top-2 left-2 z-40 bg-white/90 border border-gray-200 p-2 rounded-full shadow hover:bg-white"
        aria-label="بازگشت"
      >
        <ChevronLeft size={20} className="text-gray-700" />
      </button>

      {showOriginalProductFloating && (
          <div
            className="fixed top-14 left-4 right-4 md:left-8 md:right-8 z-30 bg-white shadow-lg border border-gray-200 p-3 rounded-xl"
            onClick={() => setIsFloatingExpanded(v => !v)}
          >
            <FloatingProductCard
              product={productDetail}
              expanded={isFloatingExpanded}
              onOpenLightbox={setLightboxSrc}
            />
          </div>
        )}

      <div className="p-4 pt-0 md:p-6 pb-24 relative">
        {/* Toast */}
        {toast && (
          <div className={`fixed top-4 right-4 z-40 px-4 py-2 rounded-md shadow-md border ${
            toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : toast.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-blue-50 border-blue-200 text-blue-700'
          }`}>
            {toast.message}
          </div>
        )}
        
        <ProductImageGallery
          productTitle={productDetail.title}
          mainPhoto={productDetail.photo}
          photos={productDetail.photos}
          lightboxSrc={lightboxSrc}
          setLightboxSrc={setLightboxSrc}
          startHoldToZoom={startHoldToZoom}
          cancelHoldToZoom={cancelHoldToZoom}
        />

        <div className="bg-white p-4 rounded-xl shadow-md mb-4 flex flex-col items-center">
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            {productDetail.title}
          </h2>
          <p className="text-emerald-600 text-2xl font-bold mb-3">
            {formatPrice(productDetail.price)}
          </p>
        </div>

        <CompetitorOverview
          isLoadingConfirmedCompetitors={isLoadingConfirmedCompetitors}
          confirmedCompetitorsError={confirmedCompetitorsError}
          lowestCompetitor={lowestCompetitor}
          averageCompetitorPrice={averageCompetitorPrice}
          lowestCompetitorPrice={lowestCompetitorPrice} // ✅ pass min price from backend
          competitorsCount={competitorsCount} // ✅ pass backend count from hook
          lowestBadgeText={lowestBadgeText}
          lowestBadgeClass={lowestBadgeClass}
          avgBadgeText={avgBadgeText}
          avgBadgeClass={avgBadgeClass}
          onOpenModal={() => setIsCompetitorsModalOpen(true)}
        />


        {/* Edit Now Button */}
                <div className="flex flex-col items-center m-12">
                  <div className="m-3">
                    <p className="text-lg text-emerald-700 leading-relaxed text-center">
                      میتونی قیمت محصولت رو ویرایش کنی
                    </p>
                  </div>
                  <button
                    onClick={() => window.open(`https://vendor.basalam.com/edit-product/${productDetail.id}`, '_blank')}
                    className="py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-200 ease-in-out shadow-sm flex items-center justify-center gap-2"
                  >
                    <Wrench size={18} />
                    ویرایش محصول
                  </button>
                </div>

        {/* Similar products can be toggled; competitors modal is independent */}
        <SimilarProducts
          showSimilars={showSimilars}
          similarsContainerRef={similarsContainerRef}
          hasFetchedSimilars={hasFetchedSimilars}
          similarSearchTerm={similarSearchTerm}
          setSimilarSearchTerm={setSimilarSearchTerm}
          isLoadingSearch={isLoadingSearch}
          searchError={searchError}
          sortedSimilars={sortedSimilars}
          addingCompetitorIds={addingCompetitorIds}
          deletingCompetitorIds={deletingCompetitorIds}
          addAsCompetitor={addAsCompetitor}
          handleDeleteCompetitorClick={handleDeleteCompetitorClick}
          startHoldToZoom={startHoldToZoom}
          cancelHoldToZoom={cancelHoldToZoom}
          hasMoreSimilarPages={hasMoreSimilarPages}
          loadMoreSimilars={loadMoreSimilars}
          isLoadingMoreSimilars={isLoadingMoreSimilars}
          fetchSimilarProducts={fetchSimilarProducts}
          fetchTextSearch={fetchTextSearch}
          searchMode={searchMode}
          textSearchQuery={textSearchQuery}
          productTitle={productDetail.title}
        />

        {/* Competitors Modal */}
        <CompetitorsModal
          isOpen={isCompetitorsModalOpen}
          onClose={() => setIsCompetitorsModalOpen(false)}
          competitors={competitorsV2}
          isLoading={isLoadingCompetitorsV2}
          error={competitorsV2Error}
          hasMore={hasMoreCompetitors}
          isLoadingMore={isLoadingMoreCompetitors}
          onLoadMore={loadMoreCompetitors}
          selectedProductPrice={productDetail.price}
          deletingCompetitorIds={deletingCompetitorIds}
          locallyRemovedCompetitorIds={locallyRemovedCompetitorIds}
          handleDeleteCompetitor={handleDeleteCompetitor}
        />

      </div>
    </div>
  );
};


export default ProductDetail;
