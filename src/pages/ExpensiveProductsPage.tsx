import { useContext, useEffect, useState } from "react";
import { AppContext } from "../App";
import {Header} from "../App";
import {LoadingSpinner} from "../App";
import {MyProductCard} from "../App";

const ExpensiveProductsPage = () => {
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

  useEffect(() => {
    if (!basalamToken) return;
    setIsLoading(true);
    setGlobalLoading(true);
    setApiError(null);
    authorizedFetch('https://bardia123456far.app.n8n.cloud/webhook/expensives')
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

export default ExpensiveProductsPage;
