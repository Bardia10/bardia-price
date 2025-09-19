import { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import {Header} from "../components/Header";
import {LoadingSpinner} from "../components/LoadingSpinner";
import {MyProductCard} from "../components/MyProductCard";
import { useExpensiveProducts } from "../hooks/useExpensiveProducts";
import * as productService from "../services/productService";
import { ApiError } from "../services/apiError";

const ExpensiveProductsPage = () => {
  const [isReevaluateModalOpen, setIsReevaluateModalOpen] = useState(false);
  const [pendingReevaluation, setPendingReevaluation] = useState(false);
  const { navigate, authorizedFetch, basalamToken, setSelectedProduct, setGlobalLoading, setBasalamToken } = useContext(AppContext);
  
  // Use the custom hook for fetching expensive products
  const { products, isLoading, error } = useExpensiveProducts(
    authorizedFetch,
    basalamToken,
    setBasalamToken,
    navigate,
    setGlobalLoading,
    pendingReevaluation ? 0 : 1 // Refresh when reevaluation is complete
  );

  const handleProductClick = (product: any) => {
    setSelectedProduct(product);
    navigate('product-detail', { from: 'not-best-price' });
  };

  const handleBasalamPageClick = (e: React.MouseEvent<HTMLButtonElement>, url: string) => {
    e.stopPropagation();
    window.open(url, '_blank');
  };

  // Handle reevaluation with proper error handling
  const handleReevaluation = async () => {
    setPendingReevaluation(true);
    setIsReevaluateModalOpen(false);
    setGlobalLoading(true);
    
    try {
      await productService.triggerExpensiveReevaluation(authorizedFetch);
      // Trigger a refresh by toggling the pendingReevaluation state
      setTimeout(() => {
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
    } finally {
      setGlobalLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header title="محصولات با قیمت نامناسب" onBack={() => navigate('dashboard')} />
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
