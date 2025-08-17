import React, { useState, useEffect, useContext, createContext, useRef, useCallback, useMemo } from 'react';
import { Search, ChevronLeft, Package, Sparkles, AlertCircle, Eye, EyeOff, Settings, X, ExternalLink, Wrench, SlidersHorizontal, RotateCcw, BadgeCheck } from 'lucide-react';



// Loosely typed app context for speed; can be refined later
const AppContext = createContext<any>(null);



const formatPrice = (price: number) => `${Math.round(price / 10).toLocaleString()} تومان`;

const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-4">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
  </div>
);

const GlobalLoadingOverlay = ({ isLoading }: { isLoading: boolean }) => {
  if (!isLoading) return null;
  
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-30">
      <div className="bg-white rounded-xl shadow-xl p-8 flex flex-col items-center gap-4 border border-gray-200">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
        <p className="text-gray-700 font-medium">در حال بارگذاری...</p>
      </div>
    </div>
  );
};

const Modal = ({ isOpen, onClose, title, message, children }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex justify-center items-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-emerald-500 text-white">
          <h3 className="text-lg font-bold">{title}</h3>
          <button onClick={onClose} className="text-white hover:text-gray-200">
            <X size={24} />
          </button>
        </div>
        <div className="p-4 text-gray-700">
          {message && <p className="mb-4">{message}</p>}
          {children}
        </div>
        <div className="p-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition duration-150 ease-in-out"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
};



const Header = ({ title, onBack, compact = false }: any) => (
  <header className={`sticky top-0 bg-white shadow-sm ${compact ? 'p-2' : 'p-4'} flex items-center relative z-40 rounded-b-xl`}>
    {onBack && (
      <button onClick={onBack} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-emerald-600 transition-colors duration-200">
        <ChevronLeft size={24} />
      </button>
    )}
    <h1 className="w-full text-lg font-bold text-gray-800 text-center">{title}</h1>
    <div className="w-6"></div>
  </header>
);

const MyProductCard = ({ product, onClick, onBasalamPageClick }: any) => (
  <div className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer flex flex-col transition-all duration-300 ease-in-out hover:shadow-lg hover:border-emerald-500 border border-gray-200">
    <div className="relative w-full h-40 overflow-hidden" onClick={onClick}>
      <img
        src={product.photo_id}
        alt={product.title}
        className="w-full h-full object-cover transition-transform duration-300 ease-in-out hover:scale-105"
        onError={(e: any) => {
          e.target.onerror = null;
          e.target.src = 'https://placehold.co/200x200/cccccc/333333?text=No+Image';
        }}
      />
    </div>
    <div className="p-3 flex-grow flex flex-col" onClick={onClick}>
      <h3 className="text-sm font-semibold text-gray-800 mb-1 leading-tight line-clamp-2">{product.title}</h3>
      <p className="text-emerald-600 font-bold text-base mt-auto">{formatPrice(product.price)}</p>
    </div>
    <div className="p-3 border-t border-gray-100">
      <button onClick={onBasalamPageClick} className="w-full flex items-center justify-center py-2 px-3 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition duration-200 ease-in-out shadow-sm">
        <Eye size={16} className="ml-2" />
        مشاهده در Basalam
      </button>
    </div>
  </div>
);

const MyProducts = () => {
  const { navigate, setSelectedProduct, authorizedFetch, basalamToken, setGlobalLoading } = useContext(AppContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMorePages, setHasMorePages] = useState(true);
  const [isLoadingApi, setIsLoadingApi] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [myProducts, setMyProducts] = useState<any[]>([]);

  // Map API product shape to internal Product type
  const mapApiProduct = (p: any) => {
    const id = String(p?.id ?? '');
    const title = String(p?.name ?? '');
    const price = Number(p?.price ?? 0);
    const primaryPhoto = p?.photo?.MEDIUM || p?.photo?.SMALL || p?.photo?.LARGE || p?.photo?.EXTRA_SMALL || p?.photo || p?.photos?.MEDIUM || p?.photos?.SMALL || p?.photos?.LARGE || 'https://placehold.co/200x200/cccccc/333333?text=No+Image';
    const photos: string[] = [];
    if (primaryPhoto) photos.push(primaryPhoto);
    // Add different photo sizes if available
    if (p?.photo?.LARGE && !photos.includes(p.photo.LARGE)) photos.push(p.photo.LARGE);
    if (p?.photo?.MEDIUM && !photos.includes(p.photo.MEDIUM)) photos.push(p.photo.MEDIUM);
    if (p?.photo?.SMALL && !photos.includes(p.photo.SMALL)) photos.push(p.photo.SMALL);
    if (p?.photos?.MEDIUM && !photos.includes(p.photos.MEDIUM)) photos.push(p.photos.MEDIUM);
    if (p?.photos?.SMALL && !photos.includes(p.photos.SMALL)) photos.push(p.photos.SMALL);
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
      photos,
      description,
      basalamUrl,
      createdAt: new Date().toISOString(),
    } as any;
  };

  // Fetch products function
  const fetchProducts = useCallback(async (page: number, query: string, isLoadMore: boolean = false) => {
    if (!basalamToken) return;
    
    if (isLoadMore) {
      setIsLoadingMore(true);
    } else {
      setIsLoadingApi(true);
      setGlobalLoading(true);
    }
    setApiError(null);
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        q: query
      });
      const url = `https://bardia1234far.app.n8n.cloud/webhook/my-products?${params}`;
      const res = await authorizedFetch(url);
      let data: any = null;
      try { data = await res.json(); } catch {}
      if (!res.ok) {
        const message = (data && (data.message || data.error)) || 'خطا در دریافت محصولات';
        throw new Error(message);
      }
      const products = Array.isArray(data?.products) ? data.products.map(mapApiProduct) : [];
      
      if (isLoadMore) {
        // Append to existing products
        setMyProducts(prev => [...prev, ...products]);
      } else {
        // Replace products (new search or first load)
        setMyProducts(products);
      }
      
      // Check if there are more pages (assuming if we get less than 50 products, no more pages)
      setHasMorePages(products.length === 24);
      
    } catch (e: any) {
      setApiError(e?.message || 'خطای نامشخص');
    } finally {
      if (isLoadMore) {
        setIsLoadingMore(false);
      } else {
        setIsLoadingApi(false);
        setGlobalLoading(false);
      }
    }
  }, [authorizedFetch, basalamToken, setGlobalLoading, mapApiProduct]);

  // Initial fetch on page load
  const fetchedOnceRef = useRef(false);
  useEffect(() => {
    if (!fetchedOnceRef.current) {
      fetchedOnceRef.current = true;
      fetchProducts(1, '');
      setCurrentPage(1);
    }
  }, [fetchProducts]);

  // Search function - only called when search button is clicked
  const handleSearch = useCallback(() => {
    setCurrentPage(1);
    fetchProducts(1, searchTerm);
  }, [searchTerm, fetchProducts]);

  // Clear search and show all products
  const handleClearSearch = useCallback(() => {
    setSearchTerm('');
    setCurrentPage(1);
    fetchProducts(1, '');
  }, [fetchProducts]);

  // Load more function
  const loadMoreProducts = useCallback(() => {
    if (!isLoadingMore && hasMorePages) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchProducts(nextPage, searchTerm, true);
    }
  }, [currentPage, searchTerm, fetchProducts, isLoadingMore, hasMorePages]);

  const handleProductClick = (product: any) => {
    setSelectedProduct(product);
    navigate('product-detail', { from: 'my-products' });
  };

  const handleBasalamPageClick = (e: React.MouseEvent<HTMLButtonElement>, url: string) => {
    e.stopPropagation();
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header title="محصولات من" onBack={() => navigate('dashboard')} />
      <div className="p-4 flex flex-col space-y-4">
        {isLoadingApi && <LoadingSpinner />}
        {apiError && <div className="text-red-600 text-sm text-right">{apiError}</div>}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder=" جستجوی محصولات..."
              className="w-full p-3 pl-10 pr-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          <button
            onClick={handleSearch}
            disabled={isLoadingApi}
            className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            جستجو
          </button>
          {searchTerm && (
            <button
              onClick={handleClearSearch}
              disabled={isLoadingApi}
              className="px-4 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              پاک کردن
            </button>
          )}
        </div>



        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-4">
          {myProducts.map((product: any) => (
            <MyProductCard
              key={product.id}
              product={product}
              onClick={() => handleProductClick(product)}
              onBasalamPageClick={(e: any) => handleBasalamPageClick(e, product.basalamUrl)}
            />
          ))}
        </div>
        
        {/* Load More Button */}
        {hasMorePages && (
          <div className="flex justify-center py-4">
            <button
              onClick={loadMoreProducts}
              disabled={isLoadingMore}
              className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoadingMore ? 'در حال بارگذاری...' : 'نمایش محصولات بیشتر'}
            </button>
          </div>
        )}
        
        {myProducts.length === 0 && !isLoadingApi && (
          <p className="text-center text-gray-500 mt-8">محصولی یافت نشد.</p>
        )}
      </div>
    </div>
  );
};

const ProductDetail = () => {
  // Local search for similar products
  const [similarSearchTerm, setSimilarSearchTerm] = useState('');
  // State for deleting competitor IDs
  const [deletingCompetitorIds, setDeletingCompetitorIds] = useState<Set<number>>(new Set());

  const { navigate, selectedProduct, authorizedFetch, basalamToken, setGlobalLoading, lastNavigation } = useContext(AppContext);
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

  // --- New: Product details state ---
  const [productDetail, setProductDetail] = useState<any>(null);
  const [isLoadingProductDetail, setIsLoadingProductDetail] = useState(false);
  const [productDetailError, setProductDetailError] = useState<string | null>(null);

  // Fetch product details from API
  useEffect(() => {
    if (!selectedProduct?.id || !basalamToken) {
      setProductDetail(null);
      return;
    }
    let cancelled = false;
    const fetchDetail = async () => {
      setIsLoadingProductDetail(true);
      setProductDetailError(null);
      try {
        const url = `https://n8nstudent.dotavvab.com/webhook/product?id=${selectedProduct.id}`;
        const res = await authorizedFetch(url, {
          headers: {
            Authorization: `Bearer ${basalamToken}`,
          },
        });
        let data = null;
        try { data = await res.json(); } catch {}
        if (!res.ok) throw new Error((data && (data.message || data.error)) || 'خطا در دریافت اطلاعات محصول');
        if (!cancelled) setProductDetail(data);
      } catch (e: any) {
        if (!cancelled) setProductDetailError(e?.message || 'خطای نامشخص');
      } finally {
        if (!cancelled) setIsLoadingProductDetail(false);
      }
    };
    fetchDetail();
    return () => { cancelled = true; };
  }, [selectedProduct?.id, basalamToken, authorizedFetch]);

  // --- Existing states ---
  const [showOriginalProductFloating, setShowOriginalProductFloating] = useState(false);
  const [isFloatingExpanded, setIsFloatingExpanded] = useState(false);
  const [showSimilars, setShowSimilars] = useState(false);
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
  const [similarPage, setSimilarPage] = useState(1);
  const [hasMoreSimilarPages, setHasMoreSimilarPages] = useState(true);
  const holdTimerRef = useRef<number | null>(null);
  const similarsContainerRef = useRef<HTMLDivElement | null>(null);

  // New confirmed competitors (fetched from webhook + Basalam core details)
  type ConfirmedCompetitorDetail = { id: number; title: string; price: number; photo: string; vendorIdentifier: string; productUrl: string };
  const [confirmedCompetitorDetails, setConfirmedCompetitorDetails] = useState<ConfirmedCompetitorDetail[]>([]);
  const [isLoadingConfirmedCompetitors, setIsLoadingConfirmedCompetitors] = useState(false);
  const [confirmedCompetitorsError, setConfirmedCompetitorsError] = useState<string | null>(null);
  const competitorDetailCacheRef = useRef<Map<number, ConfirmedCompetitorDetail>>(new Map());
  // Track loading state for adding competitors
  const [addingCompetitorIds, setAddingCompetitorIds] = useState<Set<string>>(new Set());
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
      await authorizedFetch(
        `https://bardia1234far.app.n8n.cloud/webhook/competitors?product_id=${selectedProduct.id}&op_product=${competitorId}`,
        { method: 'DELETE' }
      );
      setRefreshTrigger((v) => v + 1);
    } catch (e) {
      alert('خطا در حذف رقیب.');
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

  // Similar products from real API search
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [isLoadingMoreSimilars, setIsLoadingMoreSimilars] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

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
  useEffect(() => {
    if (!selectedProduct || !basalamToken || !selectedProduct.title || !selectedProduct.id) {
      setSearchResults([]);
      setSimilarPage(1);
      setHasMoreSimilarPages(true);
      return;
    }
    let cancelled = false;
    const fetchSimilarProducts = async () => {
      setIsLoadingSearch(true);
      setGlobalLoading(true);
      setSearchError(null);
      try {
        const encodedTitle = encodeURIComponent(selectedProduct.title.trim());
        const productId = encodeURIComponent(String(selectedProduct.id));
        const url = `https://bardia1234far.app.n8n.cloud/webhook/mlt-search?title=${encodedTitle}&product_id=${productId}&page=1`;
        const res = await authorizedFetch(url);
        let data: any = null;
        try { data = await res.json(); } catch {}
        if (!res.ok) {
          const message = (data && (data.message || data.error)) || 'خطا در جستجوی محصولات مشابه';
          throw new Error(message);
        }
        // New API response: { products: [...], page: number }
        const products = Array.isArray(data?.products) ? data.products.map(mapSearchProduct).filter((p: any) => p.id && p.title) : [];
        const realPage = typeof data?.page === 'number' ? data.page : 1;
        if (!cancelled) {
          setSearchResults(products);
          setSimilarPage(realPage + 1); // Next page to request
          setHasMoreSimilarPages(products.length > 0);
        }
      } catch (e: any) {
        if (!cancelled) setSearchError(e?.message || 'خطای نامشخص در جستجو');
      } finally {
        if (!cancelled) {
          setIsLoadingSearch(false);
          setGlobalLoading(false);
        }
      }
    };
    // Add a small delay to avoid too many requests on rapid navigation
    const timer = setTimeout(fetchSimilarProducts, 300);
    return () => { 
      cancelled = true;
      clearTimeout(timer);
    };
  }, [selectedProduct, basalamToken, authorizedFetch, setGlobalLoading]);

  // Load more similar products
  const loadMoreSimilars = useCallback(async () => {
    if (!selectedProduct || !basalamToken || !selectedProduct.title || !selectedProduct.id || isLoadingMoreSimilars || !hasMoreSimilarPages) return;
    setIsLoadingMoreSimilars(true);
    setSearchError(null);
    try {
      const encodedTitle = encodeURIComponent(selectedProduct.title.trim());
      const productId = encodeURIComponent(String(selectedProduct.id));
      const url = `https://bardia1234far.app.n8n.cloud/webhook/mlt-search?title=${encodedTitle}&product_id=${productId}&page=${similarPage}`;
      const res = await authorizedFetch(url);
      let data: any = null;
      try { data = await res.json(); } catch {}
      if (!res.ok) {
        const message = (data && (data.message || data.error)) || 'خطا در جستجوی محصولات مشابه';
        throw new Error(message);
      }
      // New API response: { products: [...], page: number }
      const products = Array.isArray(data?.products) ? data.products.map(mapSearchProduct).filter((p: any) => p.id && p.title) : [];
      const realPage = typeof data?.page === 'number' ? data.page : similarPage;
  setSearchResults(prev => [...prev, ...products]);
  setSimilarPage(realPage + 1); // Next page to request
  setHasMoreSimilarPages(products.length > 0);
    } catch (e: any) {
      setSearchError(e?.message || 'خطای نامشخص در جستجو');
    } finally {
      setIsLoadingMoreSimilars(false);
    }
  }, [selectedProduct, basalamToken, authorizedFetch, similarPage, isLoadingMoreSimilars, hasMoreSimilarPages]);

  // Fresh, simplified competitor fetch: rely solely on webhook + Basalam core; ignore dummy data
  useEffect(() => {
    const productId = selectedProduct?.id ? String(selectedProduct.id) : '';
    const isNumericId = /^\d+$/.test(productId);
    if (!basalamToken || !selectedProduct || !isNumericId) {
      setConfirmedCompetitorDetails([]);
      setConfirmedCompetitorsError(null);
      return;
    }
    let cancelled = false;
    const parseCoreDetail = (data: any): ConfirmedCompetitorDetail => {
      const id = Number(data?.id ?? data?.product?.id) || 0;
      const title = (data?.title ?? data?.product?.title) || '';
      const price = Number(
        data?.price ??
        data?.variants?.[0]?.price ??
        data?.product?.price ??
        data?.product?.variants?.[0]?.price ??
        0
      ) || 0;
      const photoObj = data?.photo || data?.product?.photo || null;
      const photo = (typeof photoObj === 'string') ? photoObj : (photoObj?.md || photoObj?.original || photoObj?.sm || photoObj?.xs || '');
      // vendor identifier comes from competitors API; fill later when mapping
      return { id, title, price, photo, vendorIdentifier: '', productUrl: '' };
    };

    const run = async () => {
      setIsLoadingConfirmedCompetitors(true);
      setConfirmedCompetitorsError(null);
      try {
        const url = `https://bardia1234far.app.n8n.cloud/webhook/competitors?product_id=${productId}`;
        const res = await authorizedFetch(url);
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error((data && (data.message || data.error)) || 'خطا در دریافت رقبا');
        const list = Array.isArray(data) ? (data[0]?.competitors || []) : (data?.competitors || []);
        const items = (Array.isArray(list) ? list : [])
          .filter((c: any) => c && c.op_product)
          .map((c: any) => ({ op_product: Number(c.op_product), op_vendor: String(c.op_vendor || '') }));
        // Fetch details with caching
        const details: ConfirmedCompetitorDetail[] = [];
        const toFetch = items.filter(i => !competitorDetailCacheRef.current.has(i.op_product));
        // Limit concurrency
        let idx = 0; const concurrency = 3;
        const worker = async () => {
          while (idx < toFetch.length && !cancelled) {
            const current = toFetch[idx++];
            try {
              const r = await fetch(`https://bardia1234far.app.n8n.cloud/webhook/product?id=${current.op_product}`);
              const d = await r.json().catch(() => ({}));
              const parsed = parseCoreDetail(d);
              parsed.vendorIdentifier = current.op_vendor;
              parsed.productUrl = `https://basalam.com/${encodeURIComponent(current.op_vendor)}/product/${encodeURIComponent(current.op_product)}`;
              competitorDetailCacheRef.current.set(current.op_product, parsed);
            } catch {}
          }
        };
        await Promise.all(new Array(concurrency).fill(0).map(worker));
        for (const it of items) {
          const detail = competitorDetailCacheRef.current.get(it.op_product);
          if (detail) details.push(detail);
        }
        if (!cancelled) setConfirmedCompetitorDetails(details);
      } catch (e: any) {
        if (!cancelled) setConfirmedCompetitorsError(e?.message || 'خطای نامشخص');
      } finally {
        if (!cancelled) setIsLoadingConfirmedCompetitors(false);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [authorizedFetch, basalamToken, selectedProduct, refreshTrigger]);

  // (competitor preview chips removed)

  const handleScroll = useCallback(() => {
    const scrollPosition = window.scrollY;
    setShowOriginalProductFloating(scrollPosition > 200);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // ...existing code...

  const addAsCompetitor = async (similarProduct: any) => {
    if (!selectedProduct?.id || !similarProduct?.id || !similarProduct?.vendorIdentifier) {
      setToast({ message: 'اطلاعات محصول ناقص است', type: 'error' });
      setTimeout(() => setToast(null), 2000);
      return;
    }

    const productId = similarProduct.id;
    
    // Check if already adding this competitor
    if (addingCompetitorIds.has(productId)) {
      return;
    }

    try {
      // Add to loading set
      setAddingCompetitorIds(prev => new Set([...prev, productId]));

      const requestBody = {
        self_product: Number(selectedProduct.id),
        op_product: Number(similarProduct.id),
        op_vendor: similarProduct.vendorIdentifier
      };

      const response = await authorizedFetch('https://bardia1234far.app.n8n.cloud/webhook/competitors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      let data: any = null;
      try { 
        data = await response.json(); 
      } catch {}

      if (!response.ok) {
        const message = (data && (data.message || data.error)) || 'خطا در افزودن رقیب';
        throw new Error(message);
      }

      // Update the visual state to show it's been added
      setSearchResults((prevResults) => 
        prevResults.map((s: any) =>
          s.id === similarProduct.id ? { ...s, isCompetitor: true } : s
        )
      );

      setToast({ message: `"${similarProduct.title}" به عنوان رقیب اضافه شد`, type: 'success' });
      setTimeout(() => setToast(null), 3000);

      // Refresh confirmed competitors list after a short delay
      setTimeout(() => {
        // Trigger a re-fetch by updating the refresh trigger
        setRefreshTrigger(prev => prev + 1);
      }, 1000);

    } catch (error: any) {
      setToast({ message: error?.message || 'خطا در افزودن رقیب', type: 'error' });
      setTimeout(() => setToast(null), 3000);
    } finally {
      // Remove from loading set
      setAddingCompetitorIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  // Filter similar products by local search term, keep API order
  const sortedSimilars = searchResults
    .filter((p: any) => {
      if (!similarSearchTerm.trim()) return true;
      const term = similarSearchTerm.trim().toLowerCase();
      return (
        p.title?.toLowerCase().includes(term) ||
        p.description?.toLowerCase().includes(term)
      );
    });

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
          onClick={() => setIsFloatingExpanded((v) => !v)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={productDetail.photo?.md || productDetail.photo?.original || productDetail.photo?.sm || productDetail.photo?.xs || ''}
                alt={productDetail.title}
                className="w-16 h-16 object-cover rounded-md"
              />
              <div>
                <h3 className="font-semibold text-gray-800 text-sm md:text-base line-clamp-1">{productDetail.title}</h3>
                <p className="text-emerald-600 font-bold text-sm md:text-md">{formatPrice(productDetail.price)}</p>
              </div>
            </div>
            <span className="text-blue-600 text-xs select-none">{isFloatingExpanded ? 'نمایش کمتر' : 'مشاهده کامل'}</span>
          </div>
          {isFloatingExpanded && (
            <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              <div className="col-span-2">
                <p className="text-gray-700">شناسه محصول: {productDetail.id}</p>
                <p className="text-gray-700">قیمت: {formatPrice(productDetail.price)}</p>
              </div>
              <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                {/* Show all photos from productDetail.photos */}
                {Array.isArray(productDetail.photos) && productDetail.photos.map((p: any, i: number) => (
                  <img
                    key={i}
                    src={p.md || p.original || p.sm || p.xs || ''}
                    alt={String(i)}
                    className="w-24 h-20 object-cover rounded-md border cursor-zoom-in"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLightboxSrc(p.md || p.original || p.sm || p.xs || '');
                    }}
                  />
                ))}
              </div>
            </div>
          )}
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
        <div className="flex flex-nowrap overflow-x-auto gap-2 p-2 bg-white rounded-xl shadow-md mb-4 scrollbar-hide">
          {/* Show main photo first, then all secondary photos */}
          {productDetail.photo && (
            <img
              key="main"
              src={productDetail.photo.md || productDetail.photo.original || productDetail.photo.sm || productDetail.photo.xs || ''}
              alt={`${productDetail.title} main`}
              className="flex-shrink-0 w-40 h-32 object-cover rounded-lg shadow-sm border border-gray-100 cursor-zoom-in select-none"
              onPointerDown={startHoldToZoom(productDetail.photo.md || productDetail.photo.original || productDetail.photo.sm || productDetail.photo.xs || '')}
              onPointerUp={cancelHoldToZoom}
              onPointerLeave={cancelHoldToZoom}
              onError={(e: any) => {
                e.target.onerror = null;
                e.target.src = 'https://placehold.co/150x100/cccccc/333333?text=No+Image';
              }}
            />
          )}
          {Array.isArray(productDetail.photos) && productDetail.photos.map((photo: any, index: number) => (
            <img
              key={index}
              src={photo.md || photo.original || photo.sm || photo.xs || ''}
              alt={`${productDetail.title} image ${index + 1}`}
              className="flex-shrink-0 w-40 h-32 object-cover rounded-lg shadow-sm border border-gray-100 cursor-zoom-in select-none"
              onPointerDown={startHoldToZoom(photo.md || photo.original || photo.sm || photo.xs || '')}
              onPointerUp={cancelHoldToZoom}
              onPointerLeave={cancelHoldToZoom}
              onError={(e: any) => {
                e.target.onerror = null;
                e.target.src = 'https://placehold.co/150x100/cccccc/333333?text=No+Image';
              }}
            />
          ))}
        </div>

        {/* Lightbox for images */}
        {lightboxSrc && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center" onClick={() => setLightboxSrc(null)}>
            <img src={lightboxSrc} alt="full" className="max-w-[95vw] max-h-[95vh] object-contain" />
          </div>
        )}

        <div className="bg-white p-4 rounded-xl shadow-md mb-4">
          <h2 className="text-xl font-bold text-gray-800 mb-2">{productDetail.title}</h2>
          <p className="text-emerald-600 text-2xl font-bold mb-3">{formatPrice(productDetail.price)}</p>

          {/* Fresh competitors section - from live APIs only */}
          <div className="border-t border-gray-200 pt-3 mt-3">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-gray-800 text-md">رقبای فعلی شما</h4>
              <span className="text-sm text-gray-500">
                {isLoadingConfirmedCompetitors ? 'در حال بارگذاری...' : `${confirmedCompetitorDetails.length} رقیب`}
              </span>
            </div>
            
            {isLoadingConfirmedCompetitors ? (
              <LoadingSpinner />
            ) : confirmedCompetitorsError ? (
              <p className="text-red-600 text-sm">{confirmedCompetitorsError}</p>
            ) : confirmedCompetitorDetails.length > 0 ? (
              <>
                {(() => {
                  const priced = confirmedCompetitorDetails.filter(c => typeof c.price === 'number' && c.price > 0);
                  const lowest = priced.length > 0 ? priced.reduce((min, c) => (c.price < min.price ? c : min), priced[0]) : null;
                  const average = priced.length > 0 ? Math.round(priced.reduce((sum, c) => sum + c.price, 0) / priced.length) : 0;
                  const diff = lowest ? (selectedProduct.price - lowest.price) : 0;

                    // Lowest competitor comparison (corrected logic)
                    let lowestBadgeText = '';
                    let lowestBadgeClass = '';
                    if (lowest) {
                      if (lowest.price < selectedProduct.price) {
                        // Competitor is cheaper
                        lowestBadgeText = `-${Math.round((selectedProduct.price - lowest.price) / lowest.price * 100)}% ارزان‌تر`;
                        lowestBadgeClass = 'bg-red-50 text-red-700 border-red-200';
                      } else if (lowest.price > selectedProduct.price) {
                        // Competitor is more expensive
                        lowestBadgeText = `+${Math.round((lowest.price - selectedProduct.price) / selectedProduct.price * 100)}% گران‌تر`;
                        lowestBadgeClass = 'bg-green-50 text-green-700 border-green-200';
                      } else {
                        lowestBadgeText = '=';
                        lowestBadgeClass = 'bg-blue-50 text-blue-700 border-blue-200';
                      }
                    }

                    // Average competitor comparison (corrected logic)
                    let avgBadgeText = '';
                    let avgBadgeClass = '';
                    if (average > 0) {
                      if (average < selectedProduct.price) {
                        // Competitors are cheaper on average
                        avgBadgeText = `-${Math.round((selectedProduct.price - average) / average * 100)}% ارزان‌تر   `;
                        avgBadgeClass = 'bg-red-50 text-red-700 border-red-200';
                      } else if (average > selectedProduct.price) {
                        // Competitors are more expensive on average
                        avgBadgeText = `+${Math.round((average - selectedProduct.price) / selectedProduct.price * 100)}% گران‌تر   `;
                        avgBadgeClass = 'bg-green-50 text-green-700 border-green-200';
                      } else {
                        avgBadgeText = '=';
                        avgBadgeClass = 'bg-blue-50 text-blue-700 border-blue-200';
                      }
                    }

                    return (
                      <div className="mb-3 space-y-1">
                        {lowest && (
                          <div className="flex flex-wrap items-center gap-2 text-sm">
                            <span className="font-semibold text-gray-800">کمترین قیمت رقیب:</span>
                            <a
                              href={lowest.productUrl || `https://basalam.com/product/${lowest.id}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-600 hover:underline font-semibold"
                            >
                              {formatPrice(lowest.price)}
                            </a>
                            <span className={`px-2 py-0.5 rounded text-xs border ${lowestBadgeClass}`}>
                              {lowestBadgeText}
                            </span>
                            <span className="text-gray-600 ml-1">(شما: {formatPrice(selectedProduct.price)})</span>
                          </div>
                        )}
                        {average > 0 && (
                          <div className="flex flex-wrap items-center gap-2 text-sm mt-1">
                            <span className="font-semibold">میانگین قیمت رقبا:</span> {formatPrice(average)}
                            <span className={`px-2 py-0.5 rounded text-xs border ${avgBadgeClass}`}>
                              {avgBadgeText}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                {/* Edit Now Button */}
                <div className="mt-4 mb-3">
                  <button
                    onClick={() => window.open(`https://vendor.basalam.com/edit-product/${selectedProduct.id}`, '_blank')}
                    className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-200 ease-in-out shadow-sm flex items-center justify-center gap-2"
                  >
                    <Wrench size={18} />
                    ویرایش محصول
                  </button>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700">مشاهده جزئیات رقبا:</span>
                  <button
                    onClick={() => setIsCompetitorsModalOpen(true)}
                    className="py-2 px-4 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 transition duration-200 ease-in-out shadow-sm flex items-center gap-2"
                  >
                    <Eye size={16} />
                    مشاهده کامل
                  </button>
                </div>
              </>
            ) : (
              <p className="text-gray-500 text-sm">هنوز رقیبی اضافه نشده است.</p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 mb-6">
          <button onClick={() => setShowSimilars((v) => !v)} className="flex-1 flex items-center justify-center p-4 bg-emerald-600 text-white rounded-xl shadow-md hover:bg-emerald-700 transition duration-300 ease-in-out">
            <Sparkles className="ml-3" />
            <span className="text-lg font-semibold">{showSimilars ? 'پنهان کردن نتایج' : 'جست و جوی هوشمند'}</span>
          </button>
          {/* Empty to keep layout; tools moved to sticky corner */}
          <div />
        </div>

        {/* Similar products can be toggled; competitors modal is independent */}
        {showSimilars && (
          <div ref={similarsContainerRef} className="bg-white p-4 rounded-xl shadow-md mb-4">
            <h3 className="text-lg font-bold text-gray-800 mb-3">محصولات مشابه (از جستجوی زنده Basalam)</h3>
            {/* Local search box for similar products */}
            <div className="mb-4 flex items-center gap-2">
              <input
                type="text"
                className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
                placeholder="جستجو در نتایج..."
                value={similarSearchTerm}
                onChange={e => setSimilarSearchTerm(e.target.value)}
              />
              {similarSearchTerm && (
                <button
                  className="px-3 py-2 bg-gray-500 text-white rounded-xl hover:bg-gray-600"
                  onClick={() => setSimilarSearchTerm('')}
                >
                  پاک کردن
                </button>
              )}
            </div>
            {isLoadingSearch ? (
              <LoadingSpinner />
            ) : searchError ? (
              <p className="text-red-600 text-sm text-center py-4">{searchError}</p>
            ) : sortedSimilars.length > 0 ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  {sortedSimilars.map((similar: any, idx: number) => {
                    const isLoading = addingCompetitorIds.has(similar.id);
                    const isAdded = similar.isCompetitor;
                    return (
                      <div
                        key={similar.id}
                        onClick={() => !isLoading && !isAdded && addAsCompetitor(similar)}
                        className={`relative bg-gray-100 rounded-xl overflow-hidden flex flex-col items-center justify-between p-3 transition-all duration-300 ease-in-out ${
                          isLoading ? 'cursor-wait opacity-70' : isAdded ? 'cursor-default' : 'cursor-pointer'
                        } border ${
                          isAdded ? 'border-2 border-green-500 shadow-[0_0_0_2px_rgba(34,197,94,0.2),0_10px_25px_-5px_rgba(34,197,94,0.5)]' : 
                          isLoading ? 'border-2 border-blue-500 shadow-[0_0_0_2px_rgba(59,130,246,0.2),0_10px_25px_-5px_rgba(59,130,246,0.5)]' :
                          'border-gray-200 hover:shadow-md hover:scale-[1.02]'
                        }`}
                      >
                        <img
                          src={similar.photo_id}
                          alt={similar.title}
                          className="w-28 h-28 object-cover rounded-lg mb-2 border border-gray-200 cursor-zoom-in select-none"
                          onPointerDown={startHoldToZoom(similar.photo_id, (e) => e.stopPropagation())}
                          onPointerUp={cancelHoldToZoom}
                          onPointerLeave={cancelHoldToZoom}
                          onError={(e: any) => {
                            e.target.onerror = null;
                            e.target.src = 'https://placehold.co/120x120/cccccc/333333?text=Sim+Image';
                          }}
                        />
                        <button
                          className="absolute top-2 left-2 p-1 rounded-full bg-white/90 border hover:bg-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(similar.basalamUrl, '_blank');
                          }}
                          title="مشاهده در باسلام"
                        >
                          <ExternalLink size={14} />
                        </button>
                        <h4 className="text-center text-sm font-semibold text-gray-800 mb-1 line-clamp-2">{similar.title}</h4>
                        {/* Vendor name below title, lighter color, smaller/thinner font */}
                        {similar.vendor && similar.vendor.name && (
                          <div className="text-center text-xs font-normal text-gray-400 mb-1">
                            {similar.vendor.name}
                          </div>
                        )}
                        <p className="text-emerald-600 font-bold text-base">{formatPrice(similar.price)}</p>
                        {/* Loading or status overlay */}
                        {isLoading && (
                          <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                            <div className="flex flex-col items-center gap-2">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                              <span className="text-xs text-blue-600 font-medium">در حال افزودن...</span>
                            </div>
                          </div>
                        )}
                        {isAdded && (
                          <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                            ✓ اضافه شد
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                {hasMoreSimilarPages && (
                  <div className="flex justify-center py-4">
                    <button
                      onClick={loadMoreSimilars}
                      disabled={isLoadingMoreSimilars}
                      className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isLoadingMoreSimilars ? 'در حال بارگذاری...' : 'نمایش نتایج بیشتر'}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <p className="text-gray-500 text-center py-4">هیچ محصول مشابهی یافت نشد.</p>
            )}
          </div>
        )}

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
        {isCompetitorsModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4" onClick={() => setIsCompetitorsModalOpen(false)}>
            <div className="bg-white rounded-xl shadow-xl border border-gray-200 w-full max-w-4xl max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="p-4 border-b bg-orange-500 text-white flex items-center justify-between">
                <h3 className="font-bold text-lg">رقبای فعلی شما</h3>
                <button onClick={() => setIsCompetitorsModalOpen(false)} className="text-white hover:text-gray-200">
                  <X size={24} />
                </button>
              </div>
              <div className="p-4 overflow-y-auto max-h-[calc(90vh-120px)]">
                {isLoadingConfirmedCompetitors ? (
                  <LoadingSpinner />
                ) : confirmedCompetitorsError ? (
                  <p className="text-red-600 text-sm text-center py-4">{confirmedCompetitorsError}</p>
                ) : confirmedCompetitorDetails.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      
                      {confirmedCompetitorDetails.map((comp) => {
                        const cheaper = typeof comp.price === 'number' && comp.price > 0 && comp.price < selectedProduct.price;
                        const equal = comp.price === selectedProduct.price;
                        const isDeleting = deletingCompetitorIds.has(comp.id);
                        return (
                          <div key={comp.id} className={`relative bg-gray-50 rounded-lg border p-3 flex flex-col items-center text-center ${cheaper ? 'border-green-300' : !equal && comp.price ? 'border-red-200' : ''}`}>
                            {/* Delete button */}
                            <button
                              className="absolute top-2 left-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition text-xs z-10"
                              title="حذف رقیب"
                              onClick={() => handleDeleteCompetitor(comp.id)}
                              disabled={isDeleting}
                              style={{ opacity: isDeleting ? 0.5 : 1 }}
                            >
                              <X size={14} />
                            </button>
                            <img
                              src={comp.photo || 'https://placehold.co/120x120/cccccc/333333?text=Comp'}
                              alt={comp.title}
                              className="w-24 h-24 object-cover rounded-md border mb-2"
                              onError={(e: any) => {
                                e.target.onerror = null;
                                e.target.src = 'https://placehold.co/120x120/cccccc/333333?text=Comp';
                              }}
                            />
                            <p className="text-sm font-semibold text-gray-800 line-clamp-2 mb-2">{comp.title || `محصول ${comp.id}`}</p>
                            {comp.price ? (
                              <p className={`font-bold mb-2 ${cheaper ? 'text-green-600' : equal ? 'text-blue-600' : 'text-red-600'}`}>{formatPrice(comp.price)}</p>
                            ) : null}
                            <button
                              className="w-full py-2 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-200"
                              onClick={() => window.open(comp.productUrl || `https://basalam.com/product/${comp.id}`, '_blank')}
                            >
                              مشاهده در باسلام
                            </button>
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">هنوز رقیبی اضافه نشده است.</p>
                    <p className="text-sm text-gray-400">برای افزودن رقیب، از بخش "جست و جوی هوشمند" استفاده کنید.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Expensive Products Page (moved above App)
const ExpensiveProductsPage = () => {
  const { navigate, authorizedFetch, basalamToken, setSelectedProduct, setGlobalLoading } = useContext(AppContext);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    if (!basalamToken) return;
    setIsLoading(true);
    setGlobalLoading(true);
    setApiError(null);
    authorizedFetch('https://bardia1234far.app.n8n.cloud/webhook/expensives')
      .then(async (res: Response) => {
        let data: any = null;
        try { data = await res.json(); } catch {}
        if (!res.ok) {
          const message = (data && (data.message || data.error)) || 'خطا در دریافت محصولات غیر رقابتی';
          throw new Error(message);
        }
        const arr = Array.isArray(data?.products) ? data.products : [];
        setProducts(arr.map(mapExpensiveProduct));
      })
      .catch((e: any) => {
        setApiError(e?.message || 'خطای نامشخص');
      })
      .finally(() => {
        setIsLoading(false);
        setGlobalLoading(false);
      });
  }, [basalamToken, authorizedFetch, setGlobalLoading]);

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

  const handleProductClick = (product: any) => {
    setSelectedProduct(product);
    navigate('product-detail', { from: 'not-best-price' });
  };

  const handleBasalamPageClick = (e: React.MouseEvent<HTMLButtonElement>, url: string) => {
    e.stopPropagation();
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header title="محصولات با قیمت غیر رقابتی" onBack={() => navigate('dashboard')} />
      <div className="p-4 flex flex-col space-y-4">
        {isLoading && <LoadingSpinner />}
        {apiError && <div className="text-red-600 text-sm text-right">{apiError}</div>}
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

const Dashboard = () => {
  const { navigate, setBasalamToken } = useContext(AppContext);
  return (
    <div className="p-4 max-w-md mx-auto h-screen flex flex-col justify-center">
      <div className="bg-emerald-100 p-6 rounded-2xl shadow-lg flex flex-col items-center text-center">
        <h2 className="text-2xl font-bold text-emerald-800 mb-6">به پنل Basalam خوش آمدید!</h2>
        <div className="space-y-4 w-full">
          <button
            onClick={() => navigate('my-products')}
            className="w-full flex items-center justify-center p-4 bg-emerald-600 text-white rounded-xl shadow-md hover:bg-emerald-700 transition duration-300 ease-in-out transform hover:scale-105"
          >
            <Package className="mr-3" />
            <span className="text-lg font-semibold">همه محصولات من</span>
          </button>
          <button
            onClick={() => navigate('not-best-price')}
            className="w-full flex items-center justify-center p-4 bg-yellow-500 text-white rounded-xl shadow-md hover:bg-yellow-600 transition duration-300 ease-in-out transform hover:scale-105"
          >
            <AlertCircle className="mr-3" />
            <span className="text-lg font-semibold">محصولات با قیمت غیر رقابتی</span>
          </button>
          <button
            onClick={() => { setBasalamToken(''); navigate('login'); }}
            className="w-full flex items-center justify-center p-3 bg-red-500 text-white rounded-xl shadow-md hover:bg-red-600 transition duration-300 ease-in-out"
          >
            خروج
          </button>
        </div>
      </div>
    </div>
  );
};

const LoginPage = () => {
  const { setBasalamToken, navigate, setGlobalLoading } = useContext(AppContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setGlobalLoading(true);
    try {
      const response = await fetch('https://bardia1234far.app.n8n.cloud/webhook/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      let data: any = null;
      try { data = await response.json(); } catch {}
      const statusCode = (data && typeof data.status === 'number') ? data.status : (response.ok ? 200 : response.status || 500);
      if (statusCode !== 200) {
        const message = (data && (data.message || data.error)) || 'ورود ناموفق بود';
        throw new Error(message);
      }
      const token: string | undefined = data?.token;
      if (!token) throw new Error('توکن دریافتی معتبر نیست');
      setBasalamToken(token);
      navigate('dashboard');
    } catch (err: any) {
      setError(err?.message || 'خطای ناشناخته رخ داد');
    } finally {
      setLoading(false);
      setGlobalLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6">
        <h1 className="text-2xl font-bold text-center text-emerald-700 mb-6">ورود</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">نام کاربری</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">کلمه عبور</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className="w-full border border-gray-300 rounded-xl px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                onClick={() => setShowPassword((v) => !v)}
                aria-label="toggle password"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition disabled:opacity-60"
          >
            {loading ? 'در حال ورود...' : 'ورود'}
          </button>
        </form>
        
        {/* Registration section */}
        <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <p className="text-sm text-blue-800 text-center mb-2">
            برای ثبت نام به ایمیل زیر پیام بفرستید:
          </p>
          <p className="text-sm font-medium text-blue-900 text-center">
            farokhsereshtibardia@gmail.com
          </p>
        </div>
      </div>
    </div>
  );
};

export default App;


