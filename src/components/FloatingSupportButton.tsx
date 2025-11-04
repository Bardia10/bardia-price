import React, { useState } from "react";
import { MessageCircle, X, Send, Mail, Copy, Check } from "lucide-react";

const FloatingSupportButton: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = async (text: string, fieldId: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        setCopiedField(fieldId);
        setTimeout(() => setCopiedField(null), 2000);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
          const successful = document.execCommand('copy');
          if (successful) {
            setCopiedField(fieldId);
            setTimeout(() => setCopiedField(null), 2000);
          }
        } finally {
          document.body.removeChild(textArea);
        }
      }
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const contactMethods = [
    {
      id: 'telegram',
      icon: Send,
      title: 'تلگرام',
      description: 'آیدی تلگرام را کپی کنید',
      value: '@Ghazalbagheri2004',
      color: 'blue',
      type: 'copy' as const,
    },
    {
      id: 'basalam',
      icon: MessageCircle,
      title: 'پیام مستقیم در بسلام',
      description: 'مستقیماً در چت بسلام پیام بدهید',
      value: 'شروع گفتگو',
      link: 'https://basalam.com/account/chats/BoKXm2',
      color: 'emerald',
      type: 'button' as const,
    },
    {
      id: 'email',
      icon: Mail,
      title: 'ایمیل',
      description: 'آدرس ایمیل را کپی کنید',
      value: 'bardiafarser@gmail.com',
      color: 'red',
      type: 'copy' as const,
    },
  ];

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, any> = {
      blue: {
        bg: 'bg-blue-500',
        hover: 'hover:bg-blue-600',
        text: 'text-blue-800',
        lightBg: 'bg-blue-50',
        border: 'border-blue-200',
      },
      red: {
        bg: 'bg-red-500',
        hover: 'hover:bg-red-600',
        text: 'text-red-800',
        lightBg: 'bg-red-50',
        border: 'border-red-200',
      },
      emerald: {
        bg: 'bg-emerald-500',
        hover: 'hover:bg-emerald-600',
        text: 'text-emerald-800',
        lightBg: 'bg-emerald-50',
        border: 'border-emerald-200',
      },
    };
    return colorMap[color] || colorMap.emerald;
  };

  return (
    <>
      {/* Floating Button - Bottom Right */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
        style={{
          animation: 'bounce-slow 3s infinite'
        }}
        title="تماس با پشتیبانی"
      >
        <MessageCircle size={32} strokeWidth={2.5} className="transform scale-x-[-1]" />
      </button>

      <style>{`
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
      `}</style>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}>
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-4 rounded-t-2xl flex items-center justify-between">
              <h2 className="text-xl font-bold">تماس با پشتیبانی</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-white/20 rounded-full transition"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Welcome Message */}
              <div className="bg-emerald-50 rounded-xl p-4 border-2 border-emerald-200">
                <p className="text-gray-700 text-center leading-relaxed">
                  اگر سوال، مشکل یا پیشنهادی دارید، خوشحال می‌شویم که از شما بشنویم.
                </p>
              </div>

              {/* Contact Methods */}
              {contactMethods.map((method) => {
                const Icon = method.icon;
                const colors = getColorClasses(method.color);
                const isCopied = copiedField === method.id;

                return (
                  <div
                    key={method.id}
                    className={`bg-white rounded-xl shadow-md p-4 border-2 ${colors.border}`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div className={`rounded-full ${colors.bg} flex items-center justify-center flex-shrink-0 w-12 h-12`}>
                        <Icon className="text-white w-6 h-6" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h3 className={`text-lg font-bold ${colors.text} mb-1`}>
                          {method.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-3">
                          {method.description}
                        </p>

                        {/* Copy Button or Direct Link */}
                        {method.type === 'copy' ? (
                          <div className="flex flex-col sm:flex-row gap-2">
                            <div className={`${colors.lightBg} ${colors.text} px-3 py-2 rounded-lg text-sm font-medium border ${colors.border}`} dir="ltr">
                              {method.value}
                            </div>
                            <button
                              onClick={() => handleCopy(method.value, method.id)}
                              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg ${colors.bg} ${colors.hover} text-white font-medium text-sm transition shadow-sm hover:shadow-md`}
                            >
                              {isCopied ? (
                                <>
                                  <Check size={16} />
                                  کپی شد!
                                </>
                              ) : (
                                <>
                                  <Copy size={16} />
                                  کپی کردن
                                </>
                              )}
                            </button>
                          </div>
                        ) : (
                          <a
                            href={method.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg ${colors.bg} ${colors.hover} text-white font-medium text-sm transition shadow-sm hover:shadow-md`}
                          >
                            <Icon size={16} />
                            {method.value}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingSupportButton;
