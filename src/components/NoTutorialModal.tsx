import React from "react";
import { X, MessageCircle } from "lucide-react";

type NoTutorialModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onContactUs: () => void;
};

export const NoTutorialModal: React.FC<NoTutorialModalProps> = ({ 
  isOpen, 
  onClose,
  onContactUs
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex justify-center items-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-emerald-500 text-white">
          <h3 className="text-lg font-bold">راهنمای آموزشی</h3>
          <button onClick={onClose} className="text-white hover:text-gray-200">
            <X size={24} />
          </button>
        </div>
        <div className="p-6 text-center">
          <div className="mb-4 flex justify-center">
            <div className="bg-gray-100 p-4 rounded-full">
              <MessageCircle size={48} className="text-gray-400" />
            </div>
          </div>
          <p className="text-gray-700 text-base mb-6">
            در حال حاضر راهنمای آموزشی برای این صفحه موجود نیست.
            <br />
            در صورت داشتن سوال، با ما تماس بگیرید.
          </p>
          <button
            onClick={() => {
              onClose();
              onContactUs();
            }}
            className="w-full px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition duration-150 ease-in-out font-medium"
          >
            تماس با ما
          </button>
        </div>
        <div className="p-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoTutorialModal;
