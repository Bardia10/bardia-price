import React from "react";
import { formatPrice } from "../../lib/format";

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
            <p className="text-emerald-600 font-bold text-sm md:text-md">{formatPrice(product.price)}</p>
          </div>
        </div>
        <span className="text-blue-600 text-sm md:text-base font-bold select-none">{expanded ? 'نمایش کمتر' : 'مشاهده کامل'}</span>
      </div>

      {expanded && (
        <div className="mt-3 flex gap-3">
          {/* Main Image - Larger and clickable */}
          <div className="flex-shrink-0">
            <img
              src={mainPhoto}
              alt={product.title}
              className="w-32 h-32 object-cover rounded-md border cursor-zoom-in"
              onClick={(e) => {
                e.stopPropagation();
                onOpenLightbox(mainPhoto);
              }}
            />
          </div>
          
          {/* Other Images */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {Array.isArray(product.photos) && product.photos.map((p: Photo, i: number) => {
              const src = p.md || p.original || p.sm || p.xs || '';
              return (
                <img
                  key={i}
                  src={src}
                  alt={String(i)}
                  className="w-24 h-20 object-cover rounded-md border cursor-zoom-in"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenLightbox(src);
                  }}
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
