import React from "react";
import { X, FileText, Image as ImageIcon, Sparkles } from "lucide-react";

interface SearchMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMethod: (method: "text" | "image" | "combined") => void;
}

const SearchMethodModal: React.FC<SearchMethodModalProps> = ({
  isOpen,
  onClose,
  onSelectMethod,
}) => {
  if (!isOpen) return null;

  const methods = [
    {
      id: "combined" as const,
      icon: Sparkles,
      title: "جستجوی ترکیبی",
      description: "از هر دو روش متن و تصویر استفاده می‌کند. سریع‌ترین و بهترین روش جستجو",
      color: "emerald",
      disabled: false,
    },
    {
      id: "text" as const,
      icon: FileText,
      title: "جستجوی متنی",
      description: "جستجوی ساده بر اساس متن. در صورتی که جستجوی ترکیبی نتیجه مطلوب نداد، از این استفاده کنید",
      color: "blue",
      disabled: false,
    },
    {
      id: "image" as const,
      icon: ImageIcon,
      title: "جستجوی تصویری",
      description: "جستجو بر اساس تصویر. در صورتی که جستجوی ترکیبی نتیجه مطلوب نداد، از این استفاده کنید",
      color: "purple",
      disabled: true,
      comingSoon: true,
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between rounded-t-xl">
          <h2 className="text-xl font-bold text-gray-800">انتخاب روش جستجوی رقیب</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
            aria-label="بستن"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {methods.map((method) => {
            const Icon = method.icon;
            const allColorClasses = {
              emerald: {
                bg: "bg-emerald-50",
                border: "border-emerald-200",
                icon: "text-emerald-600",
                hover: "hover:bg-emerald-100",
                disabled: "bg-emerald-50/50 border-emerald-100",
              },
              blue: {
                bg: "bg-blue-50",
                border: "border-blue-200",
                icon: "text-blue-600",
                hover: "hover:bg-blue-100",
                disabled: "bg-blue-50/50 border-blue-100",
              },
              purple: {
                bg: "bg-purple-50",
                border: "border-purple-200",
                icon: "text-purple-600",
                hover: "hover:bg-purple-100",
                disabled: "bg-purple-50/50 border-purple-100",
              },
            };
            const colorClasses = allColorClasses[method.color as keyof typeof allColorClasses];

            return (
              <button
                key={method.id}
                onClick={() => !method.disabled && onSelectMethod(method.id)}
                disabled={method.disabled}
                className={`w-full p-4 rounded-xl border-2 transition-all duration-200 ${
                  method.disabled
                    ? `${colorClasses.disabled} cursor-not-allowed opacity-60`
                    : `${colorClasses.bg} ${colorClasses.border} ${colorClasses.hover} cursor-pointer hover:scale-[1.02] hover:shadow-md`
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Icon */}
                  <div
                    className={`flex-shrink-0 p-3 rounded-full ${
                      method.disabled ? "bg-gray-200" : colorClasses.bg
                    }`}
                  >
                    <Icon
                      size={28}
                      className={method.disabled ? "text-gray-400" : colorClasses.icon}
                    />
                  </div>

                  {/* Text content */}
                  <div className="flex-1 text-right">
                    <h3 className="text-lg font-bold text-gray-800 mb-1 flex items-center justify-between">
                      {method.title}
                      {method.comingSoon && (
                        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-normal">
                          به زودی...
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {method.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SearchMethodModal;
