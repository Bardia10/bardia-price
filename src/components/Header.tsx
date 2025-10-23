import React from "react";
import { ChevronLeft, HelpCircle } from "lucide-react";

type HeaderProps = {
  title: string;
  onBack?: () => void;
  compact?: boolean;
  onHelp?: () => void;
};

export const Header: React.FC<HeaderProps> = ({ title, onBack, compact = false, onHelp }) => (
  <header className={`sticky top-0 bg-white shadow-sm ${compact ? "p-2" : "p-4"} flex items-center justify-between relative z-40 rounded-b-xl`}>
    {/* Help button on the right (appears first in RTL) */}
    <div className="flex items-center gap-2">
      {onHelp && (
        <button
          onClick={onHelp}
          className="flex items-center gap-1 px-3 py-1.5 text-sm text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all duration-200"
          title="راهنمایی"
        >
          <HelpCircle size={20} />
          <span className="font-medium">راهنمایی</span>
        </button>
      )}
      {!onHelp && <div className="w-6"></div>}
    </div>
    
    {/* Title in the center */}
    <h1 className="absolute left-1/2 -translate-x-1/2 text-lg font-bold text-gray-800">{title}</h1>
    
    {/* Back button on the left */}
    <div className="flex items-center">
      {onBack && (
        <button
          onClick={onBack}
          className="text-gray-600 hover:text-emerald-600 transition-colors duration-200"
        >
          <ChevronLeft size={24} />
        </button>
      )}
      {!onBack && <div className="w-6"></div>}
    </div>
  </header>
);

export default Header;
