import React, { useEffect } from "react";
import { Eye } from "lucide-react";
import LoadingSpinner from "../LoadingSpinner";
import { formatPrice } from "../../lib/format";

type Competitor = {
  id: number;
  title: string;
  price: number;
  photo: string;
  vendorIdentifier: string;
  vendorTitle: string; // Add vendorTitle field
  productUrl: string;
};

interface Props {
  isLoadingConfirmedCompetitors: boolean;
  confirmedCompetitorsError: string | null;
  confirmedCompetitorDetails: Competitor[];
  lowestCompetitor: Competitor | null;
  averageCompetitorPrice: number;
  competitorsCount: number; // ✅ new prop from hook
  lowestBadgeText: string;
  lowestBadgeClass: string;
  avgBadgeText: string;
  avgBadgeClass: string;
  onOpenModal: () => void;
}

const CompetitorOverview: React.FC<Props> = ({
  isLoadingConfirmedCompetitors,
  confirmedCompetitorsError,
  confirmedCompetitorDetails,
  lowestCompetitor,
  averageCompetitorPrice,
  competitorsCount,
  lowestBadgeText,
  lowestBadgeClass,
  avgBadgeText,
  avgBadgeClass,
  onOpenModal,
}) => {
  useEffect(() => {
    console.log("[CompetitorOverview] Props:", {
      isLoadingConfirmedCompetitors,
      confirmedCompetitorsError,
      confirmedCompetitorDetails,
      lowestCompetitor,
      averageCompetitorPrice,
      competitorsCount,
    });
  }, [
    isLoadingConfirmedCompetitors,
    confirmedCompetitorsError,
    confirmedCompetitorDetails,
    lowestCompetitor,
    averageCompetitorPrice,
    competitorsCount,
  ]);

  return (
    <div className="bg-white p-4 rounded-xl shadow-md mb-4 flex flex-col items-center">
      <h2 className="text-xl font-bold text-gray-800 mb-2">بررسی رقیب ها</h2>
      <span className="text-lg text-gray-500 mb-6">
        {isLoadingConfirmedCompetitors
          ? "در حال بارگذاری..."
          : `${competitorsCount} رقیب`} {/* ✅ now uses backend count */}
      </span>

      {isLoadingConfirmedCompetitors ? (
        <LoadingSpinner />
      ) : confirmedCompetitorsError ? (
        <p className="text-red-600 text-sm">{confirmedCompetitorsError}</p>
      ) : confirmedCompetitorDetails.length > 0 ? (
        <>
          <div className="mb-3 space-y-3">
            {lowestCompetitor && (
              <div className="flex flex-wrap items-center gap-2 text-lg p-2 rounded-lg border border-gray-100 shadow-sm bg-gray-50/30">
                <span className="font-semibold text-gray-800">
                  کمترین قیمت رقیب:
                </span>
                <span>{formatPrice(lowestCompetitor.price)}</span>
                <span
                  className={`px-2 py-0.5 rounded text-md border ${lowestBadgeClass}`}
                >
                  {lowestBadgeText}
                </span>
              </div>
            )}

            {averageCompetitorPrice > 0 && (
              <div className="flex flex-wrap items-center gap-2 text-lg mt-1 p-2 rounded-lg border border-gray-100 shadow-sm bg-gray-50/30">
                <span className="font-semibold">میانگین قیمت رقبا:</span>{" "}
                {formatPrice(averageCompetitorPrice)}
                <span
                  className={`px-2 py-0.5 rounded text-md border ${avgBadgeClass}`}
                >
                  {avgBadgeText}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-center mb-3">
            <button
              onClick={onOpenModal}
              className="py-2 px-4 bg-orange-500 text-white text-lg font-medium rounded-lg hover:bg-orange-600 transition duration-200 ease-in-out shadow-sm flex items-center gap-2"
            >
              <Eye size={16} />
              مشاهده همه رقیب های انتخاب شده
            </button>
          </div>
        </>
      ) : (
        <p className="text-gray-500 text-sm">هنوز رقیبی اضافه نشده است.</p>
      )}
    </div>
  );
};

export default CompetitorOverview;