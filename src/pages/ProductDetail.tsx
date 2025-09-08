import React, {
  useState,
  useEffect,
  useContext,
  useRef,
  useCallback
} from "react";
import { AppContext } from "../context/AppContext";

// components
import { Header } from "../components/Header";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { Modal } from "../components/Modal";

// utils
import { formatPrice } from "../lib/format";
//icons
import { Search, ChevronLeft, Package, Sparkles, AlertCircle, Eye, EyeOff, Settings, X, ExternalLink, Wrench, SlidersHorizontal, RotateCcw, BadgeCheck } from 'lucide-react';

import * as productService from "../services/productService";
import { ApiError } from "../services/apiError";

import { useProductDetail } from "../hooks/useProductDetail"; 
import { useSimilars } from "../hooks/useSimilars"; 
import { useCompetitors } from "../hooks/useCompetitors"; 
import { useExpensiveManagement } from "../hooks/useExpensiveManagement"; 

import FloatingProductCard from '../components/ProductDetail/FloatingProductCard';
import CompetitorOverview from '../components/ProductDetail/CompetitorOverview';
import ProductImageGallery from "../components/ProductDetail/ProductImageGallery";
import SimilarProducts from "../components/ProductDetail/SimilarProducts";
import CompetitorsModal from "../components/ProductDetail/CompetitorsModal";






const ProductDetail = () => {
  // Local search for similar products
  const [similarSearchTerm, setSimilarSearchTerm] = useState('');
  // Refresh key to trigger re-fetch
  const [refreshKey, setRefreshKey] = useState(0);
  // State for deleting competitor IDs
  const [deletingCompetitorIds, setDeletingCompetitorIds] = useState<Set<number>>(new Set());

  const { navigate, selectedProduct, authorizedFetch, basalamToken, setGlobalLoading, lastNavigation, setBasalamToken } = useContext(AppContext);
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


  // inside ProductDetail component:
  const { productDetail, isLoadingProductDetail, productDetailError } = useProductDetail(
    selectedProduct,
    basalamToken,
    authorizedFetch,
    setBasalamToken,
    navigate,
    refreshKey
  );



  // --- Existing states ---
  const [showOriginalProductFloating, setShowOriginalProductFloating] = useState(false);
  const [isFloatingExpanded, setIsFloatingExpanded] = useState(false);
  const [showSimilars, setShowSimilars] = useState(true)
  const [filterOnlyCheaper, setFilterOnlyCheaper] = useState(false);
  const [percentOverAllowance, setPercentOverAllowance] = useState(0); // 0..50
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [isChangePriceOpen, setIsChangePriceOpen] = useState(false);
  const [priceInput, setPriceInput] = useState<string>('');
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [tempPercent, setTempPercent] = useState<number>(percentOverAllowance);
  const [isToolsOpen, setIsToolsOpen] = useState(false);

  // Pagination for similar products
  // const [similarPage, setSimilarPage] = useState(1);
  // const [hasMoreSimilarPages, setHasMoreSimilarPages] = useState(true);
  const holdTimerRef = useRef<number | null>(null);
  const similarsContainerRef = useRef<HTMLDivElement | null>(null);

  // New confirmed competitors (fetched from webhook + Basalam core details)
  type ConfirmedCompetitorDetail = { id: number; title: string; price: number; photo: string; vendorIdentifier: string; productUrl: string };
  // const [confirmedCompetitorDetails, setConfirmedCompetitorDetails] = useState<ConfirmedCompetitorDetail[]>([]);
  // const [isLoadingConfirmedCompetitors, setIsLoadingConfirmedCompetitors] = useState(false);
  // const [confirmedCompetitorsError, setConfirmedCompetitorsError] = useState<string | null>(null);
  const competitorDetailCacheRef = useRef<Map<number, ConfirmedCompetitorDetail>>(new Map());
  // Track loading state for adding competitors
  const [addingCompetitorIds, setAddingCompetitorIds] = useState<Set<number>>(new Set());
  // Refresh trigger for confirmed competitors
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  // Modal state for competitors
  const [isCompetitorsModalOpen, setIsCompetitorsModalOpen] = useState(false);
  // ...existing code...

  // Handler for deleting competitor
  const handleDeleteCompetitor = async (competitorId: number) => {
    if (deletingCompetitorIds.has(competitorId)) return;
    setDeletingCompetitorIds(prev => new Set(prev).add(competitorId));

    try {
      await productService.deleteCompetitor(authorizedFetch, selectedProduct.id, competitorId);
      setRefreshTrigger(v => v + 1);
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
    await productService.deleteCompetitor(authorizedFetch, selectedProduct.id, competitorId);

    setSearchResults(prevResults =>
      prevResults.map((s: any) =>
        s.id === competitorId ? { ...s, isCompetitor: false } : s
      )
    );

    setToast({ message: `رقیب حذف شد`, type: 'success' });
    setTimeout(() => setToast(null), 2000);

    setRefreshTrigger(v => v + 1);
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
    if (!selectedProduct) {
      navigate('my-products');
    }
  }, [selectedProduct, navigate]);


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
  loadMoreSimilars,
  setSearchResults
} = useSimilars(
  selectedProduct,
  basalamToken,
  authorizedFetch,
  mapSearchProduct,
  setGlobalLoading,
  setBasalamToken,
  navigate
);


const {
  confirmedCompetitorDetails,
  isLoadingConfirmedCompetitors,
  confirmedCompetitorsError
} = useCompetitors(selectedProduct, authorizedFetch, basalamToken, setBasalamToken, navigate, refreshTrigger);



   // Auto-manage product in expensives based on price comparison with competitors
useExpensiveManagement({
  selectedProduct,
  productDetail,
  confirmedCompetitorDetails,
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
    if (!selectedProduct?.id || !similarProduct?.id || !similarProduct?.vendorIdentifier) {
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
          selectedProduct.id,
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

        setTimeout(() => setRefreshTrigger(prev => prev + 1), 1000);
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
    confirmedCompetitorDetails.map((c: any) => Number(c.id))
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
      isCompetitor: competitorIds.has(Number(p.id)),
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

  // Show loading spinner if product detail is loading or not available
  // --- Competitor price comparison logic ---
  let lowestCompetitor = null;
  let averageCompetitorPrice = 0;
  let lowestBadgeText = '';
  let lowestBadgeClass = '';
  let avgBadgeText = '';
  let avgBadgeClass = '';
  if (confirmedCompetitorDetails && confirmedCompetitorDetails.length > 0 && productDetail) {
    const pricedCompetitors = confirmedCompetitorDetails.filter(c => typeof c.price === 'number' && c.price > 0);
    lowestCompetitor = pricedCompetitors.length > 0 ? pricedCompetitors.reduce((min, c) => (c.price < min.price ? c : min), pricedCompetitors[0]) : null;
    averageCompetitorPrice = pricedCompetitors.length > 0 ? Math.round(pricedCompetitors.reduce((sum, c) => sum + c.price, 0) / pricedCompetitors.length) : 0;
    if (lowestCompetitor) {
      if (lowestCompetitor.price < productDetail.price) {
        lowestBadgeText = `-${Math.round((productDetail.price - lowestCompetitor.price) / lowestCompetitor.price * 100)}% ارزان‌تر از شما`;
        lowestBadgeClass = 'bg-red-50 text-red-700 border-red-200';
      } else if (lowestCompetitor.price > productDetail.price) {
        lowestBadgeText = `+${Math.round((lowestCompetitor.price - productDetail.price) / productDetail.price * 100)}% گران‌تر از شما`;
        lowestBadgeClass = 'bg-green-50 text-green-700 border-green-200';
      } else {
        lowestBadgeText = '=';
        lowestBadgeClass = 'bg-blue-50 text-blue-700 border-blue-200';
      }
    }
    if (averageCompetitorPrice > 0) {
      if (averageCompetitorPrice < productDetail.price) {
        avgBadgeText = `-${Math.round((productDetail.price - averageCompetitorPrice) / averageCompetitorPrice * 100)}% ارزان‌تر از شما   `;
        avgBadgeClass = 'bg-red-50 text-red-700 border-red-200';
      } else if (averageCompetitorPrice > productDetail.price) {
        avgBadgeText = `+${Math.round((averageCompetitorPrice - productDetail.price) / productDetail.price * 100)}% گران‌تر از شما   `;
        avgBadgeClass = 'bg-green-50 text-green-700 border-green-200';
      } else {
        avgBadgeText = '=';
        avgBadgeClass = 'bg-blue-50 text-blue-700 border-blue-200';
      }
    }
  }
  if (!selectedProduct || isLoadingProductDetail) {
    return <LoadingSpinner />;
  }
  if (productDetailError) {
    return <div className="min-h-screen flex items-center justify-center text-red-600">{productDetailError}</div>;
  }
  if (!productDetail) {
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


        <CompetitorOverview
          isLoadingConfirmedCompetitors={isLoadingConfirmedCompetitors}
          confirmedCompetitorsError={confirmedCompetitorsError}
          confirmedCompetitorDetails={confirmedCompetitorDetails}
          lowestCompetitor={lowestCompetitor}
          averageCompetitorPrice={averageCompetitorPrice}
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
                    onClick={() => window.open(`https://vendor.basalam.com/edit-product/${selectedProduct.id}`, '_blank')}
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
        />


  {/* Removed advanced visibility tools and eye modal */}

        {/* Old competitors modal removed in favor of the live section above */}

        {/* Filter Modal */}
        {isFilterModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4" onClick={() => setIsFilterModalOpen(false)}>
            <div className="bg-white rounded-xl shadow-xl border border-gray-200 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
              <div className="p-4 border-b">
                <h3 className="font-bold text-gray-800">فیلتر قیمت</h3>
              </div>
              <div className="p-4 space-y-3">
                <p className="text-sm text-gray-600">حداکثر درصد بالاتر از قیمت شما که نمایش داده شود:</p>
                <div className="flex items-center gap-3">
                  <input type="range" min={0} max={50} step={1} value={tempPercent} onChange={(e) => setTempPercent(Number(e.target.value))} />
                  <span className="w-10 text-right">{tempPercent}%</span>
                </div>
                <div className="text-xs text-gray-500">حالت فعال: {filterOnlyCheaper ? `ارزان‌تر از ${percentOverAllowance}% +` : 'غیرفعال'}</div>
              </div>
              <div className="p-4 border-t flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {filterOnlyCheaper && (
                    <div className="flex items-center gap-2 text-xs bg-red-50 border border-red-200 text-red-700 px-2 py-1 rounded">
                      <span>Cheaper than {percentOverAllowance}% +</span>
                      <button
                        className="hover:underline"
                        onClick={() => {
                          setFilterOnlyCheaper(false);
                          setPercentOverAllowance(0);
                        }}
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <button className="px-3 py-2 text-sm rounded-md border" onClick={() => setIsFilterModalOpen(false)}>انصراف</button>
                  <button
                    className="px-3 py-2 text-sm rounded-md bg-emerald-600 text-white hover:bg-emerald-700"
                    onClick={() => {
                      setPercentOverAllowance(tempPercent);
                      setFilterOnlyCheaper(true);
                      setIsFilterModalOpen(false);
                    }}
                  >
                    اعمال
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}


        {/* Change Price Modal */}
        {isChangePriceOpen && (
          <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4" onClick={() => setIsChangePriceOpen(false)}>
            <div className="bg-white rounded-xl shadow-xl border border-gray-200 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
              <div className="p-4 border-b">
                <h3 className="font-bold text-gray-800">تغییر قیمت</h3>
              </div>
              <div className="p-4 space-y-3">
                <label className="text-sm text-gray-600">قیمت جدید (تومان)</label>
                <input
                  type="number"
                  className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  value={priceInput}
                  onChange={(e) => setPriceInput(e.target.value)}
                  min={0}
                />
                <p className="text-xs text-gray-500">برای اعمال قیمت جدید روی دکمه تایید کلیک کنید.</p>
              </div>
              <div className="p-4 border-t flex items-center justify-end gap-2">
                <button className="px-3 py-2 text-sm rounded-md border" onClick={() => setIsChangePriceOpen(false)}>انصراف</button>
                <button
                  className="px-3 py-2 text-sm rounded-md bg-emerald-600 text-white hover:bg-emerald-700"
                  onClick={() => {
                    const next = Number(priceInput);
                    if (!isNaN(next) && next > 0) {
                      // Price change functionality removed - use external Basalam editing
                      setToast({ message: 'قیمت با موفقیت به‌روزرسانی شد', type: 'success' });
                      setTimeout(() => setToast(null), 2000);
                      setIsChangePriceOpen(false);
                    }
                  }}
                >
                  تایید
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Competitors Modal */}
        <CompetitorsModal
          isOpen={isCompetitorsModalOpen}
          onClose={() => setIsCompetitorsModalOpen(false)}
          confirmedCompetitorDetails={confirmedCompetitorDetails}
          selectedProductPrice={selectedProduct.price}
          deletingCompetitorIds={deletingCompetitorIds}
          handleDeleteCompetitor={handleDeleteCompetitor}
        />

      </div>
    </div>
  );
};





export default ProductDetail;
