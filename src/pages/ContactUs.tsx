import React from "react";
import { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import { Header } from "../components/Header";
import { NoTutorialModal } from "../components/NoTutorialModal";
import { Mail, MessageCircle, Send, Copy, Check } from "lucide-react";

const ContactUs = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('ContactUs must be used within AppContext.Provider');
  }
  const { navigate } = context;

  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);

  const handleCopy = async (text: string, fieldId: string) => {
    try {
      // Try modern clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        setCopiedField(fieldId);
        setTimeout(() => setCopiedField(null), 2000);
      } else {
        // Fallback for older browsers or non-secure contexts
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
          } else {
            alert('کپی کردن انجام نشد. لطفاً به صورت دستی کپی کنید.');
          }
        } catch (err) {
          console.error('Fallback copy failed:', err);
          alert('کپی کردن انجام نشد. لطفاً به صورت دستی کپی کنید.');
        } finally {
          document.body.removeChild(textArea);
        }
      }
    } catch (err) {
      console.error('Failed to copy:', err);
      alert('کپی کردن انجام نشد. لطفاً به صورت دستی کپی کنید.');
    }
  };

  const contactMethods = [
    {
      id: 'telegram',
      icon: Send,
      title: 'تلگرام',
      description: 'آیدی تلگرام را کپی کنید و پیام خود را ارسال کنید',
      value: '@BardiaFar',
      color: 'blue',
      type: 'copy' as const,
    },
    {
      id: 'basalam',
      icon: MessageCircle,
      title: 'پیام مستقیم در بسلام',
      description: 'با کلیک روی دکمه زیر مستقیماً در چت بسلام با ما در ارتباط باشید',
      value: 'شروع گفتگو',
      link: 'https://basalam.com/account/chats/BoKXm2',
      color: 'emerald',
      type: 'button' as const,
    },
    {
      id: 'email',
      icon: Mail,
      title: 'ایمیل',
      description: 'آدرس ایمیل را کپی کنید و سوالات خود را ارسال کنید',
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
        icon: 'text-blue-600',
        border: 'border-blue-100',
        lightBg: 'bg-blue-50',
      },
      red: {
        bg: 'bg-red-500',
        hover: 'hover:bg-red-600',
        text: 'text-red-800',
        icon: 'text-red-600',
        border: 'border-red-100',
        lightBg: 'bg-red-50',
      },
      emerald: {
        bg: 'bg-emerald-500',
        hover: 'hover:bg-emerald-600',
        text: 'text-emerald-800',
        icon: 'text-emerald-600',
        border: 'border-emerald-100',
        lightBg: 'bg-emerald-50',
      },
    };

    return colorMap[color] || colorMap.emerald;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex flex-col" dir="rtl">
      <Header 
        onBack={() => navigate("dashboard")}
        onHelp={() => setIsTutorialOpen(true)}
        onHome={() => navigate("dashboard")}
        onContact={() => {}} // Show but do nothing (already on contact page)
      />

      <div className="flex-1 overflow-y-auto pb-6">
        <div className="max-w-4xl mx-auto p-4 sm:p-6">
          {/* Page Title */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">تماس با ما</h1>
          </div>

          {/* Welcome Message */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border-2 border-emerald-100">
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl font-bold text-emerald-800 mb-3">
                ما همیشه در کنار شما هستیم!
              </h2>
              <p className="text-gray-700 text-base sm:text-lg leading-relaxed">
                اگر سوال، مشکل یا پیشنهادی دارید، خوشحال می‌شویم که از شما بشنویم.
                <br />
                می‌توانید از هر یک از روش‌های زیر با ما در ارتباط باشید:
              </p>
            </div>
          </div>

          {/* Contact Methods */}
          <div className="space-y-4">
            {contactMethods.map((method) => {
              const Icon = method.icon;
              const colors = getColorClasses(method.color);
              const isCopied = copiedField === method.id;

              return (
                <div
                  key={method.id}
                  className={`
                    bg-white rounded-2xl shadow-lg p-6
                    border-2 ${colors.border}
                  `}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`
                      rounded-full ${colors.bg}
                      flex items-center justify-center flex-shrink-0
                      w-14 h-14 sm:w-16 sm:h-16
                    `}>
                      <Icon className="text-white w-7 h-7 sm:w-8 sm:h-8" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className={`
                        text-xl sm:text-2xl font-bold ${colors.text} mb-2
                      `}>
                        {method.title}
                      </h3>
                      <p className="text-gray-600 text-sm sm:text-base mb-4 leading-relaxed">
                        {method.description}
                      </p>

                      {/* Copy Button or Direct Link */}
                      {method.type === 'copy' ? (
                        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-start">
                          <div className={`
                            ${colors.lightBg} ${colors.text}
                            px-4 py-3 rounded-lg font-medium text-sm sm:text-base
                            border ${colors.border}
                            text-center sm:text-left
                            w-full sm:w-auto sm:min-w-0 sm:max-w-fit
                          `} dir="ltr">
                            {method.value}
                          </div>
                          <button
                            onClick={() => handleCopy(method.value, method.id)}
                            className={`
                              flex items-center justify-center gap-2 px-6 py-3 rounded-lg
                              font-bold text-sm sm:text-base
                              transition-all duration-200 flex-shrink-0
                              ${isCopied 
                                ? 'bg-green-500 hover:bg-green-600 text-white' 
                                : `${colors.bg} ${colors.hover} text-white`
                              }
                            `}
                          >
                            {isCopied ? (
                              <>
                                <Check className="w-5 h-5" />
                                <span>کپی شد!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-5 h-5" />
                                <span>کپی کردن</span>
                              </>
                            )}
                          </button>
                        </div>
                      ) : (
                        <a
                          href={method.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`
                            inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg
                            ${colors.bg} ${colors.hover} text-white
                            font-bold text-sm sm:text-base
                            transition-all duration-200
                            transform hover:scale-105
                          `}
                        >
                          <MessageCircle className="w-5 h-5" />
                          <span>{method.value}</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Additional Info */}
          <div className="mt-6 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-2xl shadow-md p-6 border-2 border-emerald-200">
            <div className="text-center">
              <p className="text-emerald-900 font-medium text-base sm:text-lg leading-relaxed">
                🕐 معمولاً در عرض چند ساعت پاسخ می‌دهیم
                <br />
                💚 نظرات و پیشنهادات شما برای ما ارزشمند است
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* No Tutorial Modal */}
      <NoTutorialModal
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
        onContactUs={() => {}} // Already on contact page
      />
    </div>
  );
};

export default ContactUs;
