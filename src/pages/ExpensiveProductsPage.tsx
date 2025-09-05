import { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import {Header} from "../components/Header";
import {LoadingSpinner} from "../components/LoadingSpinner";
import {MyProductCard} from "../components/MyProductCard";

const ExpensiveProductsPage = () => {
  const [isReevaluateModalOpen, setIsReevaluateModalOpen] = useState(false);
  const [isReevaluating, setIsReevaluating] = useState(false);
  const { navigate, authorizedFetch, basalamToken, setSelectedProduct, setGlobalLoading } = useContext(AppContext);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

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

  // Track when reevaluation POST is in progress
  const [pendingReevaluation, setPendingReevaluation] = useState(false);

  // Fetch expensive products
  const fetchExpensiveProducts = async () => {
    setIsLoading(true);
    setGlobalLoading(true);
    setApiError(null);
    try {
      const res = await authorizedFetch('https://bardia1234567far.app.n8n.cloud/webhook/expensives');
      let data: any = null;
      try { data = await res.json(); } catch {}
      if (!res.ok) {
        const message = (data && (data.message || data.error)) || 'خطا در دریافت محصولات غیر رقابتی';
        throw new Error(message);
      }
      const arr = Array.isArray(data?.products) ? data.products : [];
      setProducts(arr.map(mapExpensiveProduct));
    } catch (e: any) {
      setApiError(e?.message || 'خطای نامشخص');
    } finally {
      setIsLoading(false);
      setGlobalLoading(false);
    }
  };

  useEffect(() => {
    if (!basalamToken) return;
    // If reevaluation is pending, don't fetch until it's done
    if (pendingReevaluation) return;
    fetchExpensiveProducts();
  }, [basalamToken, authorizedFetch, setGlobalLoading, pendingReevaluation]);

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
      <Header title="محصولات با قیمت نامناسب" onBack={() => navigate('dashboard')} />
      <div className="p-4 flex flex-col space-y-4">
        {/* Reevaluate Button */}
        <button
          className="mb-4 px-4 py-2 bg-orange-600 text-white rounded-lg font-semibold shadow hover:bg-orange-700 transition w-fit self-end"
          onClick={() => setIsReevaluateModalOpen(true)}
          disabled={isReevaluating}
        >
          ارزیابی دوباره
        </button>

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
                    onClick={async () => {
                      setPendingReevaluation(true);
                      setIsReevaluateModalOpen(false);
                      setIsLoading(true);
                      setGlobalLoading(true);
                      try {
                        await authorizedFetch('https://bardia1234567far.app.n8n.cloud/webhook/expensives', {
                          method: 'POST',
                          headers: {
                            'Authorization': `Bearer ${basalamToken}`,
                            'Content-Type': 'application/json',
                          },
                        });
                      } catch {}
                      setPendingReevaluation(false);
                    }}
                  >
                    تایید
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

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

export default ExpensiveProductsPage;
