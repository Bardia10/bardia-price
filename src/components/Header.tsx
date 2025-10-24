import React from "react";
import { ChevronLeft, HelpCircle, Home, Mail, LogOut } from "lucide-react";

type HeaderProps = {
  onBack?: () => void;
  onHelp?: () => void;
  showLogout?: boolean;
  onLogout?: () => void;
  onHome?: () => void;
  onContact?: () => void;
  compact?: boolean;
};

export const Header: React.FC<HeaderProps> = ({ 
  onBack, 
  onHelp, 
  showLogout = false,
  onLogout,
  onHome,
  onContact,
  compact = false 
}) => (
  <div className={`w-full flex justify-center ${compact ? "p-2" : "p-3"} sticky top-0 z-50 pointer-events-none`}>
    <header className={`
      w-full max-w-4xl
      bg-white shadow-md rounded-full
      ${compact ? "px-3 py-2" : "px-4 py-3"}
      flex items-center justify-between
      pointer-events-auto
    `}>
      {/* Button 4 - Home */}
      <div className="flex items-center justify-center flex-1">
        {onHome ? (
          <button
            onClick={onHome}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-700 hover:text-emerald-700 hover:bg-emerald-50 rounded-full transition-all duration-200 whitespace-nowrap"
            title="خانه"
          >
            <Home size={18} />
            <span className="font-medium">خانه</span>
          </button>
        ) : (
          <div className="w-20"></div>
        )}
      </div>

      {/* Button 3 - Contact */}
      <div className="flex items-center justify-center flex-1">
        {onContact ? (
          <button
            onClick={onContact}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-full transition-all duration-200 whitespace-nowrap"
            title="تماس با ما"
          >
            <Mail size={18} />
            <span className="font-medium">تماس</span>
          </button>
        ) : (
          <div className="w-20"></div>
        )}
      </div>

      {/* Button 2 - Help */}
      <div className="flex items-center justify-center flex-1">
        {onHelp ? (
          <button
            onClick={onHelp}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-full transition-all duration-200 whitespace-nowrap"
            title="راهنمایی"
          >
            <HelpCircle size={18} />
            <span className="font-medium">راهنما</span>
          </button>
        ) : (
          <div className="w-20"></div>
        )}
      </div>
        
      {/* Button 1 - Back or Logout */}
      <div className="flex items-center justify-center flex-1">
        {showLogout ? (
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full transition-all duration-200 whitespace-nowrap"
            title="خروج"
          >
            <LogOut size={18} />
            <span className="font-medium">خروج</span>
          </button>
        ) : onBack ? (
          <button
            onClick={onBack}
            className="flex items-center gap-1 px-3 py-1.5 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-all duration-200 whitespace-nowrap"
            title="بازگشت"
          >
            <ChevronLeft size={20} />
            <span className="font-medium">بازگشت</span>
          </button>
        ) : (
          <div className="w-20"></div>
        )}
      </div>
    </header>
  </div>
);

export default Header;
