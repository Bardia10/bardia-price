import React from "react";
import { ExternalLink, X } from "lucide-react";
import LoadingSpinner from "../LoadingSpinner";
import { formatPrice } from "../../lib/format";

interface SimilarProductsProps {
  showSimilars: boolean;
  similarsContainerRef: React.RefObject<HTMLDivElement>;
  hasFetchedSimilars: boolean;
  similarSearchTerm: string;
  setSimilarSearchTerm: (value: string) => void;
  isLoadingSearch: boolean;
  searchError: string | null;
  sortedSimilars: any[];
  addingCompetitorIds: Set<number>;
  deletingCompetitorIds: Set<number>;
  addAsCompetitor: (similar: any) => void;
  handleDeleteCompetitorClick: (id: number) => void;
  startHoldToZoom: (
    src: string,
    onClick?: (e: any) => void
  ) => (e: any) => void;
  cancelHoldToZoom: () => void;
  hasMoreSimilarPages: boolean;
  loadMoreSimilars: () => void;
  isLoadingMoreSimilars: boolean;
  fetchSimilarProducts: () => void;
}

const SimilarProducts: React.FC<SimilarProductsProps> = ({
  showSimilars,
  similarsContainerRef,
  hasFetchedSimilars,
  similarSearchTerm,
  setSimilarSearchTerm,
  isLoadingSearch,
  searchError,
  sortedSimilars,
  addingCompetitorIds,
  deletingCompetitorIds,
  addAsCompetitor,
  handleDeleteCompetitorClick,
  startHoldToZoom,
  cancelHoldToZoom,
  hasMoreSimilarPages,
  loadMoreSimilars,
  isLoadingMoreSimilars,
  fetchSimilarProducts,
}) => {
  if (!showSimilars) return null;

  return (
    <div
      ref={similarsContainerRef}
      className="bg-white p-4 rounded-xl shadow-md mb-4 flex flex-col items-center"
    >
      <h3 className="text-xl font-bold text-gray-800 mb-3">
        اضافه کردن رقیب های جدید:
      </h3>

      {hasFetchedSimilars ? (
        <>
          {/* Instructions */}
          <div className="flex justify-center mb-4 mt-4">
            <p className="text-lg text-emerald-700 leading-relaxed">
              روی محصول مورد نظر کلیک کنین تا به رقیب ها اضافه بشه
            </p>
          </div>

          {/* Search input */}
          <div className="mb-4 flex items-center gap-2">
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
              placeholder="جستجو در نتایج..."
              value={similarSearchTerm}
              onChange={(e) => setSimilarSearchTerm(e.target.value)}
            />
            {similarSearchTerm && (
              <button
                className="px-3 py-2 bg-gray-500 text-white rounded-xl hover:bg-gray-600 whitespace-nowrap"
                onClick={() => setSimilarSearchTerm("")}
              >
                پاک کردن
              </button>
            )}
          </div>

          {/* Results */}
          {isLoadingSearch ? (
            <LoadingSpinner />
          ) : searchError ? (
            <p className="text-red-600 text-sm text-center py-4">
              {searchError}
            </p>
          ) : sortedSimilars.length > 0 ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                {sortedSimilars.map((similar: any) => {
                    const id = Number(similar.id);
                    const isLoading = addingCompetitorIds.has(id);
                    const isAdded = similar.isCompetitor;
                    const isDeleting = deletingCompetitorIds.has(id);

                  return (
                    <div
                      key={similar.id}
                      className={`relative bg-gray-100 rounded-xl overflow-hidden flex flex-col items-center justify-between p-3 transition-all duration-300 ease-in-out ${
                        isLoading
                          ? "cursor-wait opacity-70"
                          : isAdded
                          ? "cursor-default"
                          : "cursor-pointer"
                      } border ${
                        isAdded
                          ? "border-2 border-green-500 shadow-[0_0_0_2px_rgba(34,197,94,0.2),0_10px_25px_-5px_rgba(34,197,94,0.5)]"
                          : isLoading
                          ? "border-2 border-blue-500 shadow-[0_0_0_2px_rgba(59,130,246,0.2),0_10px_25px_-5px_rgba(59,130,246,0.5)]"
                          : "border-gray-200 hover:shadow-md hover:scale-[1.02]"
                      }`}
                      onClick={() =>
                        !isLoading && !isAdded && addAsCompetitor(similar)
                      }
                    >
                      {/* Image */}
                      <img
                        src={similar.photo_id}
                        alt={similar.title}
                        className="w-28 h-28 object-cover rounded-lg mb-2 border border-gray-200 cursor-zoom-in select-none"
                        onPointerDown={startHoldToZoom(similar.photo_id, (e) =>
                          e.stopPropagation()
                        )}
                        onPointerUp={cancelHoldToZoom}
                        onPointerLeave={cancelHoldToZoom}
                        onError={(e: any) => {
                          e.target.onerror = null;
                          e.target.src =
                            "https://placehold.co/120x120/cccccc/333333?text=Sim+Image";
                        }}
                      />

                      {/* External link */}
                      <button
                        className="absolute top-2 left-2 p-1 rounded-full bg-white/90 border hover:bg-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(similar.basalamUrl, "_blank");
                        }}
                        title="مشاهده در باسلام"
                      >
                        <ExternalLink size={14} />
                      </button>

                      {/* Title */}
                      <h4 className="text-center text-sm font-semibold text-gray-800 mb-1 line-clamp-2">
                        {similar.title}
                      </h4>

                      {/* Vendor */}
                      {similar.vendor?.name && (
                        <div className="text-center text-xs font-normal text-gray-400 mb-1">
                          {similar.vendor.name}
                        </div>
                      )}

                      {/* Price */}
                      <p className="text-emerald-600 font-bold text-base">
                        {formatPrice(similar.price)}
                      </p>

                      {/* States */}
                      {isLoading && (
                        <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                          <div className="flex flex-col items-center gap-2">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                            <span className="text-xs text-blue-600 font-medium">
                              در حال افزودن...
                            </span>
                          </div>
                        </div>
                      )}

                      {isAdded && !isDeleting && (
                        <button
                          className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center hover:bg-red-600"
                          title="حذف از رقبا"
                          disabled={isDeleting}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCompetitorClick(Number(similar.id));
                          }}
                        >
                          <X size={14} />
                        </button>
                      )}

                      {isAdded && isDeleting && (
                        <div className="absolute top-2 right-2 bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs font-medium flex items-center">
                          <span>در حال حذف...</span>
                        </div>
                      )}

                      {isAdded && !isDeleting && (
                        <div className="absolute top-8 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                          ✓ اضافه شد
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Load more */}
              {hasMoreSimilarPages && (
                <div className="flex justify-center py-4">
                  <button
                    onClick={loadMoreSimilars}
                    disabled={isLoadingMoreSimilars}
                    className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isLoadingMoreSimilars
                      ? "در حال بارگذاری..."
                      : "نمایش نتایج بیشتر"}
                  </button>
                </div>
              )}
            </>
          ) : (
            <p className="text-gray-500 text-center py-4">
              هیچ محصول مشابهی یافت نشد.
            </p>
          )}
        </>
      ) : (
        <div className="flex justify-center py-4">
          <button
            onClick={fetchSimilarProducts}
            disabled={isLoadingSearch}
            className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoadingSearch ? "در حال بارگذاری..." : "جست و جوی هوشمند"}
          </button>
        </div>
      )}
    </div>
  );
};

export default SimilarProducts;
