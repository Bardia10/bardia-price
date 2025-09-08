import React from "react";

interface ProductImageGalleryProps {
  productTitle: string;
  mainPhoto: any;
  photos?: any[];
  lightboxSrc: string | null;
  setLightboxSrc: (src: string | null) => void;
  startHoldToZoom: (src: string, onClick?: (e: any) => void) => (e: any) => void;
  cancelHoldToZoom: () => void;
}

const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({
  productTitle,
  mainPhoto,
  photos,
  lightboxSrc,
  setLightboxSrc,
  startHoldToZoom,
  cancelHoldToZoom,
}) => {
  return (
    <>
      <div className="flex flex-nowrap overflow-x-auto gap-2 p-2 bg-white rounded-xl shadow-md mb-4 scrollbar-hide">
        {/* Show main photo first */}
        {mainPhoto && (
          <img
            key="main"
            src={mainPhoto.md || mainPhoto.original || mainPhoto.sm || mainPhoto.xs || ""}
            alt={`${productTitle} main`}
            className="flex-shrink-0 w-40 h-32 object-cover rounded-lg shadow-sm border border-gray-100 cursor-zoom-in select-none"
            onPointerDown={startHoldToZoom(
              mainPhoto.md || mainPhoto.original || mainPhoto.sm || mainPhoto.xs || ""
            )}
            onPointerUp={cancelHoldToZoom}
            onPointerLeave={cancelHoldToZoom}
            onError={(e: any) => {
              e.target.onerror = null;
              e.target.src =
                "https://placehold.co/150x100/cccccc/333333?text=No+Image";
            }}
          />
        )}

        {/* Additional photos */}
        {Array.isArray(photos) &&
          photos.map((photo, index) => (
            <img
              key={index}
              src={photo.md || photo.original || photo.sm || photo.xs || ""}
              alt={`${productTitle} image ${index + 1}`}
              className="flex-shrink-0 w-40 h-32 object-cover rounded-lg shadow-sm border border-gray-100 cursor-zoom-in select-none"
              onPointerDown={startHoldToZoom(
                photo.md || photo.original || photo.sm || photo.xs || ""
              )}
              onPointerUp={cancelHoldToZoom}
              onPointerLeave={cancelHoldToZoom}
              onError={(e: any) => {
                e.target.onerror = null;
                e.target.src =
                  "https://placehold.co/150x100/cccccc/333333?text=No+Image";
              }}
            />
          ))}
      </div>

      {/* Lightbox */}
      {lightboxSrc && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center"
          onClick={() => setLightboxSrc(null)}
        >
          <img
            src={lightboxSrc}
            alt="full"
            className="max-w-[95vw] max-h-[95vh] object-contain"
          />
        </div>
      )}
    </>
  );
};

export default ProductImageGallery;
