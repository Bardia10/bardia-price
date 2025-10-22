import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface ExpensiveFactorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFactor: number;
  onUpdate: (newFactor: number) => Promise<void>;
}

export const ExpensiveFactorModal = ({ isOpen, onClose, currentFactor, onUpdate }: ExpensiveFactorModalProps) => {
  // Convert factor to percentage: (factor - 1) * 100
  // e.g., 0.9 → -10%, 1.1 → +10%
  const factorToPercent = (factor: number) => Math.round((factor - 1) * 100);
  const percentToFactor = (percent: number) => 1 + (percent / 100);

  const [sliderValue, setSliderValue] = useState(factorToPercent(currentFactor));
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSliderValue(factorToPercent(currentFactor));
      setUpdateSuccess(false);
      setError(null);
    }
  }, [isOpen, currentFactor]);

  const getPercentText = (percent: number) => {
    const absPercent = Math.abs(percent);
    if (percent === 0) {
      return "0";
    } else if (percent < 0) {
      return `${absPercent} درصد کمتر`;
    } else {
      return `${absPercent} درصد بیشتر`;
    }
  };

  const getExplanationParts = (percent: number) => {
    const absPercent = Math.abs(percent);
    if (percent === 0) {
      return {
        prefix: "با این تنظیمات، محصولی بیش از حد گران حساب می‌شود اگر قیمت آن بالاتر از",
        highlight: "ارزان‌ترین رقیب",
        suffix: "باشد."
      };
    } else if (percent < 0) {
      return {
        prefix: "با این تنظیمات، محصولی بیش از حد گران حساب می‌شود اگر قیمت آن بالاتر از",
        highlight: `${absPercent} درصد کمتر از ارزان‌ترین رقیب`,
        suffix: "باشد."
      };
    } else {
      return {
        prefix: "با این تنظیمات، محصولی بیش از حد گران حساب می‌شود اگر قیمت آن بالاتر از",
        highlight: `${absPercent} درصد بیشتر از ارزان‌ترین رقیب`,
        suffix: "باشد."
      };
    }
  };

  const getExamplePrice = (percent: number) => {
    // Base competitor price is 100 (thousand toman)
    const basePrice = 100;
    const factor = percentToFactor(percent);
    const threshold = Math.round(basePrice * factor);
    return threshold;
  };

  const handleApply = async () => {
    setIsUpdating(true);
    setError(null);
    
    try {
      const newFactor = percentToFactor(sliderValue);
      await onUpdate(newFactor);
      setUpdateSuccess(true);
      
      // Close modal after 1.5 seconds
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err?.message || "خطا در بروزرسانی. لطفاً دوباره تلاش کنید.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-xl font-bold text-gray-800">تنظیم ضریب گرانی</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition"
            disabled={isUpdating}
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Current Value Display */}
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600 mb-2">
              {getPercentText(sliderValue)}
            </div>
            <p className="text-sm text-gray-500">
              از قیمت ارزان‌ترین رقیب
            </p>
          </div>

          {/* Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>50% بیشتر</span>
              <span>0%</span>
              <span>50% کمتر</span>
            </div>
            <input
              type="range"
              min="-50"
              max="50"
              step="5"
              value={sliderValue}
              onChange={(e) => setSliderValue(parseInt(e.target.value))}
              disabled={isUpdating || updateSuccess}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-yellow-500 disabled:opacity-50"
              dir="ltr"
            />
            <p className="text-xs text-gray-400 text-center mt-2">
              اسلایدر را بکشید تا مقدار را تغییر دهید
            </p>
          </div>

          {/* Explanation */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <p className="text-sm text-gray-700 leading-relaxed mb-3" dir="rtl">
              {getExplanationParts(sliderValue).prefix}{" "}
              <span className="font-bold text-yellow-600 bg-yellow-100 px-1 rounded">
                "{getExplanationParts(sliderValue).highlight}"
              </span>{" "}
              {getExplanationParts(sliderValue).suffix}
            </p>
            <p className="text-xs text-gray-600 leading-relaxed" dir="rtl">
              <span className="font-semibold">مثال:</span> اگر ارزان‌ترین رقیب 100 هزار تومان باشد، آنگاه اگر محصول شما بیشتر از{" "}
              <span className="font-bold text-yellow-600">{getExamplePrice(sliderValue)} هزار تومان</span> باشد، گران حساب می‌شود.
            </p>
          </div>

          {/* Success Message */}
          {updateSuccess && (
            <div className="bg-green-100 border border-green-300 rounded-lg p-3 text-center">
              <p className="text-green-700 font-semibold">✓ با موفقیت بروزرسانی شد!</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border border-red-300 rounded-lg p-3 text-center">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t">
          <button
            onClick={onClose}
            disabled={isUpdating}
            className="flex-1 px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-700 font-semibold hover:bg-gray-50 transition disabled:opacity-50"
          >
            انصراف
          </button>
          <button
            onClick={handleApply}
            disabled={isUpdating || updateSuccess}
            className="flex-1 px-4 py-3 rounded-lg bg-yellow-600 text-white font-semibold hover:bg-yellow-700 transition disabled:opacity-50"
          >
            {isUpdating ? "در حال بروزرسانی..." : updateSuccess ? "✓ انجام شد" : "اعمال تغییرات"}
          </button>
        </div>
      </div>
    </div>
  );
};
