import { useContext } from "react";
import { AppContext } from "../context/AppContext";
import { Package, AlertCircle, TrendingDown, MessageSquare, LogOut, Mail } from "lucide-react";

const Dashboard = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('Dashboard must be used within AppContext.Provider');
  }
  const { navigate, setBasalamToken, clearMyProductsState, clearExpensiveProductsState, clearCheapProductsState } = context;

  const handleLogout = () => {
    setBasalamToken("");
    navigate("login");
  };

  // Define tiles data
  const tiles = [
    {
      id: 'all-products',
      icon: Package,
      title: 'همه محصولات',
      description: 'مشاهده محصولات و افزودن رقیب برای مقایسه قیمت',
      color: 'emerald',
      onClick: () => {
        clearMyProductsState();
        navigate("my-products");
      },
      disabled: false,
    },
    {
      id: 'expensive-products',
      icon: AlertCircle,
      title: 'محصولات گران‌تر از رقبا',
      description: 'محصولاتی که قیمتشان بالاتر از رقبا است و نیاز به کاهش قیمت دارند',
      color: 'yellow',
      onClick: () => {
        clearExpensiveProductsState();
        navigate("not-best-price");
      },
      disabled: false,
    },
    {
      id: 'cheap-products',
      icon: TrendingDown,
      title: 'محصولات ارزان‌تر از رقبا',
      description: 'محصولاتی که خیلی ارزان‌تر از رقبا هستند و می‌توانید قیمت آنها را افزایش دهید',
      color: 'green',
      onClick: () => {
        clearCheapProductsState();
        navigate("cheap-products");
      },
      disabled: false,
    },
    {
      id: 'telegram-bot',
      icon: MessageSquare,
      title: 'اتصال به تلگرام',
      description: 'دریافت اعلان‌ها و گزارش‌ها از طریق ربات تلگرام',
      color: 'blue',
      onClick: () => {},
      disabled: true,
      comingSoon: true,
    },
    {
      id: 'contact-us',
      icon: Mail,
      title: 'تماس با ما',
      description: 'سوالات، مشکلات یا پیشنهادات خود را با ما در میان بگذارید',
      color: 'purple',
      onClick: () => {
        navigate("contact-us");
      },
      disabled: false,
    },
  ];

  const getColorClasses = (color: string, disabled: boolean) => {
    if (disabled) {
      return {
        bg: 'bg-gray-300',
        hover: '',
        text: 'text-gray-500',
        icon: 'text-gray-400',
      };
    }

    const colorMap: Record<string, any> = {
      emerald: {
        bg: 'bg-emerald-500',
        hover: 'hover:bg-emerald-600',
        text: 'text-emerald-800',
        icon: 'text-emerald-600',
      },
      yellow: {
        bg: 'bg-yellow-500',
        hover: 'hover:bg-yellow-600',
        text: 'text-yellow-800',
        icon: 'text-yellow-600',
      },
      green: {
        bg: 'bg-green-500',
        hover: 'hover:bg-green-600',
        text: 'text-green-800',
        icon: 'text-green-600',
      },
      blue: {
        bg: 'bg-blue-500',
        hover: 'hover:bg-blue-600',
        text: 'text-blue-800',
        icon: 'text-blue-600',
      },
      purple: {
        bg: 'bg-purple-500',
        hover: 'hover:bg-purple-600',
        text: 'text-purple-800',
        icon: 'text-purple-600',
      },
    };

    return colorMap[color] || colorMap.emerald;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm p-4 flex items-center justify-between sticky top-0 z-10">
        <h1 className="text-xl font-bold text-emerald-800">داشبورد قیمت یار</h1>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-200"
        >
          <LogOut size={20} />
          <span>خروج</span>
        </button>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-2 sm:p-6">
          {/* Welcome Message */}
          <div className="text-center mb-4 sm:mb-8">
            <h2 className="text-3xl font-bold text-emerald-800 mb-2">
              به داشبورد خوش آمدید!
            </h2>
            <p className="text-gray-600">
              برای شروع، یکی از گزینه‌های زیر را انتخاب کنید
            </p>
          </div>

          {/* Tiles Grid */}
          <div className="grid grid-cols-2 gap-2 xs:gap-3 sm:gap-6 max-w-sm sm:max-w-lg mx-auto">
            {tiles.map((tile) => {
              const Icon = tile.icon;
              const colors = getColorClasses(tile.color, tile.disabled);

              return (
                <div
                  key={tile.id}
                  className="relative w-full aspect-[1/1.3] sm:aspect-square"
                >
                  <button
                    onClick={tile.onClick}
                    disabled={tile.disabled}
                    className={`
                      w-full h-full p-3 xs:p-4 sm:p-5 rounded-xl sm:rounded-2xl shadow-lg
                      flex flex-col items-center text-center
                      transition duration-300 ease-in-out
                      ${tile.disabled 
                        ? 'cursor-not-allowed opacity-70' 
                        : 'transform hover:scale-105 hover:shadow-xl cursor-pointer'
                      }
                      bg-white border-2 border-gray-100 overflow-y-auto
                    `}
                  >
                    {/* Icon Container - Properly sized for each breakpoint */}
                    <div className={`
                      rounded-full ${colors.bg} ${colors.hover}
                      transition duration-200 flex-shrink-0
                      flex items-center justify-center
                      w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16
                      mb-3 xs:mb-3 sm:mb-4
                    `}>
                      {/* Icon - properly proportioned */}
                      <Icon className="text-white w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8" />
                    </div>

                    {/* Title - readable at all sizes */}
                    <h3 className={`
                      font-bold ${colors.text} leading-tight w-full
                      text-xs xs:text-sm sm:text-base
                      mb-1.5 xs:mb-2 sm:mb-3
                    `}>
                      {tile.title}
                    </h3>

                    {/* Description - properly sized */}
                    <p className={`
                      text-gray-600 leading-relaxed w-full
                      text-[0.65rem] xs:text-xs sm:text-sm
                    `}>
                      {tile.description}
                    </p>

                    {/* Coming Soon Badge - properly positioned */}
                    {tile.comingSoon && (
                      <span className={`
                        absolute top-2 right-2 xs:top-3 xs:right-3 sm:top-4 sm:right-4
                        bg-orange-500 text-white font-bold rounded-full
                        text-[0.65rem] xs:text-[0.7rem] sm:text-xs
                        px-2 py-0.5 xs:px-2.5 xs:py-1 sm:px-3 sm:py-1
                      `}>
                        به زودی
                      </span>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
