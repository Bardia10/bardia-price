import React from "react";

type Photo = {
  md?: string;
  original?: string;
  sm?: string;
  xs?: string;
};

type Product = {
  id: number | string;
  title: string;
  price: number;
  photo?: Photo;
  photos?: Photo[];
};

type Props = {
  product: Product;
  expanded: boolean;
  onOpenLightbox: (src: string) => void;
};

const FloatingProductCard: React.FC<Props> = ({ product, expanded, onOpenLightbox }) => {
  const mainPhoto = product.photo?.md || product.photo?.original || product.photo?.sm || product.photo?.xs || '';

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={mainPhoto}
            alt={product.title}
            className="w-16 h-16 object-cover rounded-md"
          />
          <div>
            <h3 className="font-semibold text-gray-800 text-sm md:text-base line-clamp-1">{product.title}</h3>
            <p className="text-emerald-600 font-bold text-sm md:text-md">{product.price.toLocaleString()} تومان</p>
          </div>
        </div>
        <span className="text-blue-600 text-xs select-none">{expanded ? 'نمایش کمتر' : 'مشاهده کامل'}</span>
      </div>

      {expanded && (
        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <div className="col-span-2">
            <p className="text-gray-700">شناسه محصول: {product.id}</p>
            <p className="text-gray-700">قیمت: {product.price.toLocaleString()} تومان</p>
          </div>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {Array.isArray(product.photos) && product.photos.map((p: Photo, i: number) => {
              const src = p.md || p.original || p.sm || p.xs || '';
              return (
                <img
                  key={i}
                  src={src}
                  alt={String(i)}
                  className="w-24 h-20 object-cover rounded-md border cursor-zoom-in"
                  onClick={() => onOpenLightbox(src)}
                />
              );
            })}
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingProductCard;
