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
  lowestCompetitor: Competitor | null;
  averageCompetitorPrice: number;
  lowestCompetitorPrice: number; // ✅ new - actual min price from backend
  competitorsCount: number; // ✅ new prop from hook
  lowestBadgeText: string;
  lowestBadgeClass: string;
  avgBadgeText: string;
  avgBadgeClass: string;
  onOpenModal: () => void;
  onRefresh?: () => void; // New prop for refresh functionality
}

const CompetitorOverview: React.FC<Props> = ({
  isLoadingConfirmedCompetitors,
  confirmedCompetitorsError,
  lowestCompetitor,
  averageCompetitorPrice,
  lowestCompetitorPrice, // ✅ new - actual min price from backend
  competitorsCount,
  lowestBadgeText,
  lowestBadgeClass,
  avgBadgeText,
  avgBadgeClass,
  onOpenModal,
  onRefresh,
}) => {
  useEffect(() => {
    console.log("[CompetitorOverview] Props:", {
      isLoadingConfirmedCompetitors,
      confirmedCompetitorsError,
      lowestCompetitor,
      averageCompetitorPrice,
      lowestCompetitorPrice,
      competitorsCount,
    });
  }, [
    isLoadingConfirmedCompetitors,
    confirmedCompetitorsError,
    lowestCompetitor,
    averageCompetitorPrice,
    lowestCompetitorPrice,
    competitorsCount,
  ]);

  return (
    <div className="bg-white p-4 rounded-xl shadow-md mb-4 flex flex-col items-center relative">
      {/* Refresh Button - Top Left Corner */}
      {onRefresh && (
        <button
          onClick={onRefresh}
          className="absolute top-3 left-3 flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-2 rounded-full shadow-sm transition-all duration-200"
          aria-label="تازه‌سازی اطلاعات"
          title="تازه‌سازی اطلاعات"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-blue-600 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          <span className="text-xs text-blue-600 font-semibold whitespace-nowrap">تازه‌سازی اطلاعات</span>
        </button>
      )}

      <h2 className="text-xl font-bold text-gray-800 mb-2 mt-12">بررسی رقیب ها</h2>
      <span className="text-lg text-gray-500 mb-6">
        {isLoadingConfirmedCompetitors
          ? "در حال بارگذاری..."
          : `${competitorsCount} رقیب`} {/* ✅ now uses backend count */}
      </span>

      {isLoadingConfirmedCompetitors ? (
        <LoadingSpinner />
      ) : confirmedCompetitorsError ? (
        <p className="text-red-600 text-sm">{confirmedCompetitorsError}</p>
      ) : competitorsCount > 0 ? (
        <>
          <div className="mb-3 space-y-3">
            {lowestBadgeText && lowestCompetitorPrice > 0 && (
              <div className="flex flex-wrap items-center gap-2 text-lg p-2 rounded-lg border border-gray-100 shadow-sm bg-gray-50/30">
                <span className="font-semibold text-gray-800">
                  کمترین قیمت رقیب ها:
                </span>
                <span className="text-emerald-600 font-bold">
                  {formatPrice(lowestCompetitorPrice)}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-md border ${lowestBadgeClass}`}
                >
                  {lowestBadgeText}
                </span>
              </div>
            )}

            {averageCompetitorPrice > 0 && (
              <div className="flex flex-wrap items-center gap-2 text-lg mt-1 p-2 rounded-lg border border-gray-100 shadow-sm bg-gray-50/30">
                <span className="font-semibold">میانگین قیمت رقیب ها:</span>{" "}
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
              مشاهده رقیب های انتخاب شده
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