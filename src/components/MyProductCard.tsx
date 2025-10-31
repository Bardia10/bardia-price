import React from "react";
import { Eye } from "lucide-react";
import { formatPrice } from "../lib/format";

type ProductCardData = {
  id: string;
  title: string;
  price: number;
  photo_id: string;
  cheapestPrice?: number | null;
};

type MyProductCardProps = {
  product: ProductCardData;
  onClick?: () => void;
  onBasalamPageClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
};

export const MyProductCard: React.FC<MyProductCardProps> = ({ product, onClick, onBasalamPageClick }) => (
  <div className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer flex flex-col transition-all duration-300 ease-in-out hover:shadow-lg hover:border-emerald-500 border border-gray-200">
    <div className="relative w-full h-40 overflow-hidden" onClick={onClick}>
      <img
        src={product.photo_id}
        alt={product.title}
        className="w-full h-full object-cover transition-transform duration-300 ease-in-out hover:scale-105"
        onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
          const target = e.currentTarget;
          target.onerror = null;
          target.src = "https://placehold.co/200x200/cccccc/333333?text=No+Image";
        }}
      />
    </div>
    <div className="p-3 flex-grow flex flex-col" onClick={onClick}>
      <h3 className="text-sm font-semibold text-gray-800 mb-1 leading-tight line-clamp-2">
        {product.title}
      </h3>
      <div className="mt-auto">
        <p className="text-emerald-600 font-bold text-sm" dir="rtl">
          قیمت شما: {formatPrice(product.price)}
        </p>
        {product.cheapestPrice !== undefined && product.cheapestPrice !== null && (
          <p className="text-red-600 font-bold text-sm mt-1" dir="rtl">
            ارزان‌ترین رقیب: {formatPrice(product.cheapestPrice)}
          </p>
        )}
      </div>
    </div>
    <div className="p-3 border-t border-gray-100">
      <button
        onClick={onBasalamPageClick}
        className="w-full flex items-center justify-center py-2 px-3 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition duration-200 ease-in-out shadow-sm"
      >
        <Eye size={16} className="ml-2" />
        مشاهده در Basalam
      </button>
    </div>
  </div>
);

export default MyProductCard;
