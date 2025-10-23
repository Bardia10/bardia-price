import React from "react";
import { X } from "lucide-react";

type TutorialModalProps = {
  isOpen: boolean;
  onClose: () => void;
  videoEmbedCode: string;
};

export const TutorialModal: React.FC<TutorialModalProps> = ({ 
  isOpen, 
  onClose, 
  videoEmbedCode 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex justify-center items-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-emerald-500 text-white">
          <h3 className="text-lg font-bold">راهنمای آموزشی</h3>
          <button onClick={onClose} className="text-white hover:text-gray-200">
            <X size={24} />
          </button>
        </div>
        <div className="p-6 text-gray-700">
          <p className="mb-4 text-center text-base font-medium">
            ویدیوی آموزشی زیر را مشاهده کنید:
          </p>
          <div 
            className="w-full"
            dangerouslySetInnerHTML={{ __html: videoEmbedCode }}
          />
        </div>
        <div className="p-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition duration-150 ease-in-out"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
};

export default TutorialModal;
