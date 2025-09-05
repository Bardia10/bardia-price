import React, { useState, useEffect, useContext, useRef, useCallback } from "react";
import { AppContext } from "../context/AppContext";
import { Header } from "../components/Header";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { MyProductCard } from "../components/MyProductCard";

import { Search, ChevronLeft, Package, Sparkles, AlertCircle, Eye, EyeOff, Settings, X, ExternalLink, Wrench, SlidersHorizontal, RotateCcw, BadgeCheck } from 'lucide-react';


const MyProducts = () => {
  const { navigate, setSelectedProduct, authorizedFetch, basalamToken, setGlobalLoading, setBasalamToken } = useContext(AppContext);
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
      const url = `https://bardia1234567far.app.n8n.cloud/webhook/my-products?${params}`;
      const res = await authorizedFetch(url);
      let data: any = null;
      try { data = await res.json(); } catch {}
      if (res.status === 401) {
        setApiError('باید دوباره لاگین کنید');
        setBasalamToken('');
        navigate('login');
        return;
      }
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
      <div className="flex justify-center mb-4 mt-6">
        <p className="text-lg text-emerald-700 leading-relaxed">
          روی محصول مورد نظر کلیک کنین تا با رقیب ها مقایسش کنین
        </p>
      </div>
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



export default MyProducts;

