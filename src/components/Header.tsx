import React from "react";
import { ChevronLeft } from "lucide-react";

type HeaderProps = {
  title: string;
  onBack?: () => void;
  compact?: boolean;
};

export const Header: React.FC<HeaderProps> = ({ title, onBack, compact = false }) => (
  <header className={`sticky top-0 bg-white shadow-sm ${compact ? "p-2" : "p-4"} flex items-center relative z-40 rounded-b-xl`}>
    {onBack && (
      <button
        onClick={onBack}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-emerald-600 transition-colors duration-200"
      >
        <ChevronLeft size={24} />
      </button>
    )}
    <h1 className="w-full text-lg font-bold text-gray-800 text-center">{title}</h1>
    <div className="w-6"></div>
  </header>
);

export default Header;
