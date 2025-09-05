import React from "react";

type GlobalLoadingOverlayProps = {
  isLoading: boolean;
};

export const GlobalLoadingOverlay: React.FC<GlobalLoadingOverlayProps> = ({ isLoading }) => {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-30">
      <div className="bg-white rounded-xl shadow-xl p-8 flex flex-col items-center gap-4 border border-gray-200">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
        <p className="text-gray-700 font-medium">در حال بارگذاری...</p>
      </div>
    </div>
  );
};

export default GlobalLoadingOverlay;
