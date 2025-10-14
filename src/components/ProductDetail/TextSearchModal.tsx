import React, { useState, useEffect } from "react";
import { X, Search } from "lucide-react";

interface TextSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (text: string) => void;
  initialText?: string;
}

const TextSearchModal: React.FC<TextSearchModalProps> = ({
  isOpen,
  onClose,
  onSearch,
  initialText = "",
}) => {
  const [searchText, setSearchText] = useState(initialText);

  useEffect(() => {
    if (isOpen) {
      setSearchText(initialText);
    }
  }, [isOpen, initialText]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchText.trim()) {
      console.log('[TextSearchModal] Searching with text:', searchText.trim());
      onSearch(searchText.trim());
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
        {/* Header */}
        <div className="border-b border-gray-200 p-4 flex items-center justify-between rounded-t-xl">
          <h2 className="text-xl font-bold text-gray-800">جستجوی متنی</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
            aria-label="بستن"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <label
              htmlFor="search-text"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              متن جستجو:
            </label>
            <input
              id="search-text"
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="عنوان محصول را وارد کنید..."
              className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              autoFocus
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={!searchText.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Search size={18} />
              جستجو
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TextSearchModal;
