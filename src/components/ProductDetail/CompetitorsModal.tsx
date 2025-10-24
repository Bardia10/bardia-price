import React from "react";
import { X, Plus } from "lucide-react";
import LoadingSpinner from "../LoadingSpinner";
import { formatPrice } from "../../lib/format";
import { CompetitorV2 } from "../../hooks/useCompetitorsV2";

interface CompetitorsModalProps {
  isOpen: boolean;
  onClose: () => void;
  competitors: CompetitorV2[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
  selectedProductPrice: number;
  deletingCompetitorIds: Set<number>;
  locallyRemovedCompetitorIds: Set<number>; // ✅ new prop for optimistic updates
  handleDeleteCompetitor: (id: number) => void;
  totalCompetitorsCount: number; // ✅ total count from backend
}

const CompetitorsModal: React.FC<CompetitorsModalProps> = ({
  isOpen,
  onClose,
  competitors,
  isLoading,
  error,
  hasMore,
  isLoadingMore,
  onLoadMore,
  selectedProductPrice,
  deletingCompetitorIds,
  locallyRemovedCompetitorIds, // ✅ new prop for optimistic updates
  handleDeleteCompetitor,
  totalCompetitorsCount, // ✅ total count from backend
}) => {
  if (!isOpen) return null;

  // Filter out locally removed competitors
  const visibleCompetitors = competitors.filter(comp => !locallyRemovedCompetitorIds.has(comp.id));
  
  // Determine if we should show "no competitors" message
  // Only show it if the backend says there are actually 0 competitors
  const showNoCompetitorsMessage = totalCompetitorsCount === 0;
  
  // Show the "show more" button if:
  // 1. hasMore is true (there are more pages), OR
  // 2. The visible list is empty but totalCompetitorsCount > 0 (user removed all visible items but more exist)
  const showLoadMoreButton = hasMore || (visibleCompetitors.length === 0 && totalCompetitorsCount > 0);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl border border-gray-200 w-full max-w-4xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b bg-orange-500 text-white flex items-center justify-between">
          <h3 className="font-bold text-lg">رقبای فعلی شما</h3>
          <button onClick={onClose} className="text-white hover:text-gray-200">
            <X size={24} />
          </button>
        </div>
        <div className="p-4 overflow-y-auto max-h-[calc(90vh-120px)]">
          {isLoading && competitors.length === 0 ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500 mb-4">{error}</p>
            </div>
          ) : showNoCompetitorsMessage ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">هنوز رقیبی اضافه نشده است.</p>
              <p className="text-sm text-gray-400">
                برای افزودن رقیب، از بخش "جست و جوی هوشمند" استفاده کنید.
              </p>
            </div>
          ) : (
            <>
              {visibleCompetitors.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">
                    همه رقبای این صفحه حذف شدند.
                  </p>
                  <p className="text-sm text-gray-400">
                    برای مشاهده رقبای بیشتر، دکمه "نمایش بیشتر" را کلیک کنید.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {[...visibleCompetitors]
                    .sort((a, b) => {
                    if (typeof a.price === "number" && typeof b.price === "number")
                      return a.price - b.price;
                    if (typeof a.price === "number") return -1;
                    if (typeof b.price === "number") return 1;
                    return a.id - b.id;
                  })
                  .map((comp) => {
                  const cheaper =
                    typeof comp.price === "number" &&
                    comp.price > 0 &&
                    comp.price < selectedProductPrice;
                  const equal = comp.price === selectedProductPrice;
                  const isDeleting = deletingCompetitorIds.has(comp.id);

                  return (
                    <div
                      key={comp.id}
                      className={`relative bg-gray-50 rounded-lg border p-3 flex flex-col items-center text-center ${
                        cheaper
                          ? "border-green-300"
                          : !equal && comp.price
                          ? "border-red-200"
                          : ""
                      }`}
                    >
                      {/* Delete button */}
                      <button
                        className="absolute top-2 left-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition text-xs z-10"
                        title="حذف رقیب"
                        onClick={() => handleDeleteCompetitor(comp.id)}
                        disabled={isDeleting}
                        style={{ opacity: isDeleting ? 0.5 : 1 }}
                      >
                        <X size={14} />
                      </button>

                      <img
                        src={
                          comp.photo ||
                          "https://placehold.co/120x120/cccccc/333333?text=Comp"
                        }
                        alt={comp.title}
                        className="w-24 h-24 object-cover rounded-md border mb-2"
                        onError={(e: any) => {
                          e.target.onerror = null;
                          e.target.src =
                            "https://placehold.co/120x120/cccccc/333333?text=Comp";
                        }}
                      />
                      <p className="text-sm font-semibold text-gray-800 line-clamp-2 mb-1">
                        {comp.title || `محصول ${comp.id}`}
                      </p>

                      {comp.vendorTitle && (
                          <div className="text-center text-xs font-normal text-gray-400 mb-1">
                            {comp.vendorTitle}
                          </div>
                        )}


                      {comp.price && (
                        <p
                          className={`font-bold mb-2 ${
                            cheaper
                              ? "text-green-600"
                              : equal
                              ? "text-blue-600"
                              : "text-red-600"
                          }`}
                        >
                          {formatPrice(comp.price)}
                        </p>
                      )}
                      <button
                        className="w-full py-2 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-200"
                        onClick={() =>
                          window.open(
                            comp.productUrl ||
                              `https://basalam.com/${comp.vendorIdentifier}/product/${comp.id}`,
                            "_blank"
                          )
                        }
                      >
                        مشاهده در باسلام
                      </button>
                    </div>
                  );
                })}
                </div>
              )}
              
              {/* Show More Button */}
              {showLoadMoreButton && (
                <div className="flex justify-center mt-6">
                  <button
                    onClick={onLoadMore}
                    disabled={isLoadingMore}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
                  >
                    {isLoadingMore ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        در حال بارگذاری...
                      </>
                    ) : (
                      <>
                        <Plus size={16} />
                        نمایش بیشتر
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompetitorsModal;
