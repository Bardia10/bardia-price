import React from "react";
import { X } from "lucide-react";
import LoadingSpinner from "../LoadingSpinner";
import { formatPrice } from "../../lib/format";

interface CompetitorsModalProps {
  isOpen: boolean;
  onClose: () => void;
  confirmedCompetitorDetails: any[];
  selectedProductPrice: number;
  deletingCompetitorIds: Set<number>;
  handleDeleteCompetitor: (id: number) => void;
}

const CompetitorsModal: React.FC<CompetitorsModalProps> = ({
  isOpen,
  onClose,
  confirmedCompetitorDetails,
  selectedProductPrice,
  deletingCompetitorIds,
  handleDeleteCompetitor,
}) => {
  if (!isOpen) return null;

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
          {confirmedCompetitorDetails.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">هنوز رقیبی اضافه نشده است.</p>
              <p className="text-sm text-gray-400">
                برای افزودن رقیب، از بخش "جست و جوی هوشمند" استفاده کنید.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...confirmedCompetitorDetails]
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
        </div>
      </div>
    </div>
  );
};

export default CompetitorsModal;
