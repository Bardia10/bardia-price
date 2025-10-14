import { useState, useCallback } from "react";
import { ApiError } from "../services/apiError";
import * as productService from "../services/productService";

export const useSimilars = (
  selectedProduct: any,
  basalamToken: string,
  authorizedFetch: any,
  mapSearchProduct: (p: any) => any,
  setGlobalLoading: (v: boolean) => void,
  setBasalamToken: (token: string) => void,
  navigate: (path: string) => void
) => {
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [isLoadingMoreSimilars, setIsLoadingMoreSimilars] = useState(false);
  const [similarPage, setSimilarPage] = useState(1);
  const [hasMoreSimilarPages, setHasMoreSimilarPages] = useState(true);
  const [hasFetchedSimilars, setHasFetchedSimilars] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchMode, setSearchMode] = useState<"combined" | "text">("combined");
  const [textSearchQuery, setTextSearchQuery] = useState("");

  const fetchSimilarProducts = useCallback(async () => {
    console.log('[useSimilars] fetchSimilarProducts called - mode: combined');
    if (!selectedProduct || !basalamToken || !selectedProduct.title || !selectedProduct.id) {
      setSearchResults([]);
      setSimilarPage(1);
      setHasMoreSimilarPages(true);
      return;
    }

    setIsLoadingSearch(true);
    setGlobalLoading(true);
    setSearchError(null);
    setSearchMode("combined");
    setTextSearchQuery(""); // Reset text query when using combined

    try {
      console.log('[useSimilars] Fetching combined search for:', selectedProduct.title);
      const { products, page } = await productService.searchSimilarProducts(
        authorizedFetch,
        selectedProduct.title,
        selectedProduct.id,
        1
      );

      const mapped = products.map(mapSearchProduct).filter((p: any) => p.id && p.title);
      console.log('[useSimilars] Combined search results:', mapped.length);
      setSearchResults(mapped);
      setSimilarPage(page + 1);
      setHasMoreSimilarPages(mapped.length > 0);
      setHasFetchedSimilars(true);
    } catch (err: any) {
      console.error('[useSimilars] Combined search error:', err);
      if (err instanceof ApiError && err.status === 401) {
        setBasalamToken("");
        navigate("login");
        setSearchError("باید دوباره لاگین کنید");
      } else {
        setSearchError(err?.message || "خطای نامشخص در جستجو");
      }
    } finally {
      setIsLoadingSearch(false);
      setGlobalLoading(false);
    }
  }, [selectedProduct, basalamToken, authorizedFetch, mapSearchProduct, setGlobalLoading, setBasalamToken, navigate]);

  const fetchTextSearch = useCallback(async (query: string) => {
    console.log('[useSimilars] fetchTextSearch called with query:', query);
    if (!basalamToken || !query.trim() || !selectedProduct?.id) {
      setSearchResults([]);
      setSimilarPage(1);
      setHasMoreSimilarPages(true);
      return;
    }

    setIsLoadingSearch(true);
    setGlobalLoading(true);
    setSearchError(null);
    setSearchMode("text");
    setTextSearchQuery(query.trim());

    try {
      console.log('[useSimilars] Fetching text search for:', query, 'with product_id:', selectedProduct.id);
      const { products, page } = await productService.searchByText(
        authorizedFetch,
        query.trim(),
        selectedProduct.id,
        1
      );

      const mapped = products.map(mapSearchProduct).filter((p: any) => p.id && p.title);
      console.log('[useSimilars] Text search results:', mapped.length);
      setSearchResults(mapped);
      setSimilarPage(page + 1);
      setHasMoreSimilarPages(mapped.length > 0);
      setHasFetchedSimilars(true);
    } catch (err: any) {
      console.error('[useSimilars] Text search error:', err);
      if (err instanceof ApiError && err.status === 401) {
        setBasalamToken("");
        navigate("login");
        setSearchError("باید دوباره لاگین کنید");
      } else {
        setSearchError(err?.message || "خطای نامشخص در جستجوی متنی");
      }
    } finally {
      setIsLoadingSearch(false);
      setGlobalLoading(false);
    }
  }, [basalamToken, selectedProduct, authorizedFetch, mapSearchProduct, setGlobalLoading, setBasalamToken, navigate]);

  const loadMoreSimilars = useCallback(async () => {
    console.log('[useSimilars] loadMoreSimilars called - mode:', searchMode, 'page:', similarPage);
    
    if (isLoadingMoreSimilars || !hasMoreSimilarPages || !basalamToken) return;

    // Check mode-specific requirements
    if (searchMode === "combined" && (!selectedProduct || !selectedProduct.title || !selectedProduct.id)) return;
    if (searchMode === "text" && !textSearchQuery.trim()) return;

    setIsLoadingMoreSimilars(true);
    setSearchError(null);

    try {
      let products, page;

      if (searchMode === "text") {
        console.log('[useSimilars] Loading more text search results for:', textSearchQuery, 'with product_id:', selectedProduct.id);
        const result = await productService.searchByText(
          authorizedFetch,
          textSearchQuery,
          selectedProduct.id,
          similarPage
        );
        products = result.products;
        page = result.page;
      } else {
        console.log('[useSimilars] Loading more combined search results');
        const result = await productService.searchSimilarProducts(
          authorizedFetch,
          selectedProduct.title,
          selectedProduct.id,
          similarPage
        );
        products = result.products;
        page = result.page;
      }

      const mapped = products.map(mapSearchProduct).filter((p: any) => p.id && p.title);
      console.log('[useSimilars] Load more results:', mapped.length);
      setSearchResults(prev => [...prev, ...mapped]);
      setSimilarPage(page + 1);
      setHasMoreSimilarPages(mapped.length > 0);
    } catch (err: any) {
      console.error('[useSimilars] Load more error:', err);
      if (err instanceof ApiError && err.status === 401) {
        setBasalamToken("");
        navigate("login");
        setSearchError("باید دوباره لاگین کنید");
      } else {
        setSearchError(err?.message || "خطای نامشخص در بارگذاری نتایج بیشتر");
      }
    } finally {
      setIsLoadingMoreSimilars(false);
    }
  }, [searchMode, textSearchQuery, selectedProduct, basalamToken, authorizedFetch, similarPage, isLoadingMoreSimilars, hasMoreSimilarPages, mapSearchProduct, setBasalamToken, navigate]);

  return {
    searchResults,
    isLoadingSearch,
    isLoadingMoreSimilars,
    similarPage,
    hasMoreSimilarPages,
    hasFetchedSimilars,
    searchError,
    fetchSimilarProducts,
    fetchTextSearch,
    loadMoreSimilars,
    setSearchResults,
    searchMode,
    textSearchQuery,
  };
};
