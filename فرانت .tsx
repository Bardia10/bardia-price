import React, { useState, useEffect, useContext, createContext, useRef, useCallback } from 'react';
import { Search, ChevronLeft, Package, Sparkles, AlertCircle, Eye, Settings, X } from 'lucide-react';

// Context for managing application-wide state
const AppContext = createContext();

// Dummy Data
const generateDummyData = () => {
  const products = [];
  const otherProducts = [];
  const similars = {};

  const titles = [
    "شامپو گیاهی تقویت کننده", "کرم ضد آفتاب با SPF50", "صابون طبیعی دست ساز",
    "روغن آرگان خالص", "ماسک موی ترمیم کننده", "ژل شستشوی صورت",
    "لوسیون بدن آبرسان", "عطر گل محمدی", "سرم ویتامین C",
    "کرم پودر مات کننده", "خط چشم ضد آب", "ریمل حجم دهنده",
    "رژ لب مایع ماندگار", "پالت سایه چشم", "برس آرایشی",
    "شانه چوبی ضد موخوره", "کش موی ساتن", "ناخن گیر استیل",
    "سوهان ناخن شیشه ای", "گوش پاک کن پنبه ای"
  ];

  const prices = [50000, 75000, 30000, 120000, 90000, 45000, 60000, 150000, 110000, 80000];

  for (let i = 1; i <= 30; i++) {
    const isMyProduct = i <= 15;
    const basePrice = prices[Math.floor(Math.random() * prices.length)];
    const price = basePrice - (isMyProduct ? (Math.random() * 20000) : 0); // My products slightly cheaper or similar
    const createdAt = new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);

    const product = {
      id: `prod-${i}`,
      title: titles[Math.floor(Math.random() * titles.length)] + ` (محصول ${i})`,
      price: Math.round(price / 1000) * 1000, // Round to nearest thousand
      photo_id: `https://placehold.co/200x200/A7F3D0/10B981?text=Prod${i}`,
      photos: [
        `https://placehold.co/300x200/A7F3D0/10B981?text=Image${i}-1`,
        `https://placehold.co/300x200/FEE2E2/EF4444?text=Image${i}-2`,
        `https://placehold.co/300x200/DBEAFE/3B82F6?text=Image${i}-3`
      ],
      description: `این محصول ${titles[Math.floor(Math.random() * titles.length)]} با کیفیت بالا و ویژگی‌های منحصر به فرد است. مناسب برای تمامی نیازها.`,
      basalamUrl: `https://basalam.com/product/${i}`,
      createdAt: createdAt.toISOString(), // ISO string for consistent sorting
    };

    if (isMyProduct) {
      products.push(product);
      similars[product.id] = []; // Initialize empty array for competitors
      // Add some initial dummy competitors for some products
      if (i % 3 === 0) {
        for (let j = 0; j < Math.floor(Math.random() * 3) + 1; j++) {
          const competitorPrice = product.price + (Math.random() > 0.5 ? Math.random() * 10000 : -Math.random() * 5000);
          similars[product.id].push({
            id: `comp-${product.id}-${j}`,
            title: `رقبای ${product.title} ${j + 1}`,
            price: Math.round(competitorPrice / 1000) * 1000,
            photo_id: `https://placehold.co/150x150/CBD5E1/4B5563?text=Comp${i}-${j}`,
            isCompetitor: true, // Marked as already checked
          });
        }
      }
    } else {
      otherProducts.push(product);
    }
  }

  // Add more "similar" products that are not yet competitors
  products.forEach(myProduct => {
    for (let j = 0; j < Math.floor(Math.random() * 5) + 2; j++) {
      const isHigher = Math.random() > 0.4; // 60% chance to be higher
      const competitorPrice = isHigher
        ? myProduct.price + (Math.random() * myProduct.price * 0.2) // Up to 20% higher
        : myProduct.price - (Math.random() * myProduct.price * 0.1); // Up to 10% lower

      similars[myProduct.id].push({
        id: `similar-${myProduct.id}-${j}`,
        title: `مشابه ${myProduct.title} ${j + 1}`,
        price: Math.round(competitorPrice / 1000) * 1000,
        photo_id: `https://placehold.co/150x150/D1FAE5/065F46?text=Sim${myProduct.id}-${j}`,
        isCompetitor: false,
      });
    }
  });


  return {
    my_products: products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)), // Default sort by creation date (newest first)
    other_products: otherProducts,
    similars: similars,
  };
};


const dummyData = generateDummyData();

// Helper to format currency
const formatPrice = (price) => `${price.toLocaleString()} تومان`;

// Loading spinner component
const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-4">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
  </div>
);

// Custom Modal for alerts/confirmations
const Modal = ({ isOpen, onClose, title, message, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex justify-center items-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-emerald-500 text-white">
          <h3 className="text-lg font-bold">{title}</h3>
          <button onClick={onClose} className="text-white hover:text-gray-200">
            <X size={24} />
          </button>
        </div>
        <div className="p-4 text-gray-700">
          {message && <p className="mb-4">{message}</p>}
          {children}
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

// Component for Developer Tools
const DevTools = () => {
  const { dummyShopData, setDummyShopData } = useContext(AppContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [jsonText, setJsonText] = useState(JSON.stringify(dummyShopData, null, 2));
  const [error, setError] = useState('');

  useEffect(() => {
    setJsonText(JSON.stringify(dummyShopData, null, 2));
  }, [dummyShopData]);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonText)
      .then(() => alert('JSON copied to clipboard!'))
      .catch(err => alert('Failed to copy JSON:', err));
  };

  const handleModify = () => {
    try {
      const parsed = JSON.parse(jsonText);
      setDummyShopData(parsed);
      setError('');
      setIsModalOpen(false);
      alert('Dummy data updated successfully!');
    } catch (e) {
      setError('Invalid JSON format: ' + e.message);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-4 right-4 bg-emerald-200 p-2 rounded-full shadow-lg opacity-20 hover:opacity-100 transition-opacity duration-200 z-50"
        title="Developer Tools"
      >
        <Settings size={20} className="text-emerald-800" />
      </button>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Developer Tools"
      >
        <div className="flex flex-col space-y-4">
          <p className="text-sm text-gray-600">View and modify the dummy JSON data.</p>
          <textarea
            className="w-full h-80 p-2 border border-gray-300 rounded-md font-mono text-sm resize-y"
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex justify-end space-x-2">
            <button
              onClick={handleCopy}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-150 ease-in-out"
            >
              کپی JSON
            </button>
            <button
              onClick={handleModify}
              className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition duration-150 ease-in-out"
            >
              به روز رسانی JSON
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

// Header component with back button and title
const Header = ({ title, onBack }) => (
  <header className="sticky top-0 bg-white shadow-sm p-4 flex items-center justify-between z-40 rounded-b-xl">
    <div className="flex items-center flex-1">
      {onBack && (
        <button onClick={onBack} className="text-gray-600 hover:text-emerald-600 transition-colors duration-200 mr-2">
          <ChevronLeft size={24} />
        </button>
      )}
      <h1 className="text-lg font-bold text-gray-800 mx-auto">{title}</h1>
    </div>
    <div className="w-6"></div> {/* Placeholder for alignment */}
  </header>
);

// Dashboard Page Component
const Dashboard = () => {
  const { navigate } = useContext(AppContext);
  return (
    <div className="p-4 max-w-md mx-auto h-screen flex flex-col justify-center">
      <div className="bg-emerald-100 p-6 rounded-2xl shadow-lg flex flex-col items-center text-center">
        <h2 className="text-2xl font-bold text-emerald-800 mb-6">به پنل Basalam خوش آمدید!</h2>
        <div className="space-y-4 w-full">
          <button
            onClick={() => navigate('my-products')}
            className="w-full flex items-center justify-center p-4 bg-emerald-600 text-white rounded-xl shadow-md hover:bg-emerald-700 transition duration-300 ease-in-out transform hover:scale-105"
          >
            <Package className="mr-3" />
            <span className="text-lg font-semibold">همه محصولات من</span>
          </button>
          <button
            onClick={() => navigate('not-best-price')} // Placeholder for future feature
            className="w-full flex items-center justify-center p-4 bg-yellow-500 text-white rounded-xl shadow-md hover:bg-yellow-600 transition duration-300 ease-in-out transform hover:scale-105"
          >
            <AlertCircle className="mr-3" />
            <span className="text-lg font-semibold">محصولات با قیمت غیر رقابتی</span>
          </button>
        </div>
        <p className="mt-6 text-sm text-gray-600">
          برای اتصال به Basalam، توکن خود را در قسمت تنظیمات وارد کنید.
        </p>
      </div>
    </div>
  );
};

// Product Card Component for My Products Page
const MyProductCard = ({ product, onClick, onBasalamPageClick }) => (
  <div
    className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer flex flex-col transition-all duration-300 ease-in-out hover:shadow-lg hover:border-emerald-500 border border-gray-200"
  >
    <div className="relative w-full h-40 overflow-hidden" onClick={onClick}>
      <img
        src={product.photo_id}
        alt={product.title}
        className="w-full h-full object-cover transition-transform duration-300 ease-in-out hover:scale-105"
        onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/200x200/cccccc/333333?text=No+Image"; }}
      />
    </div>
    <div className="p-3 flex-grow flex flex-col" onClick={onClick}>
      <h3 className="text-sm font-semibold text-gray-800 mb-1 leading-tight line-clamp-2">{product.title}</h3>
      <p className="text-emerald-600 font-bold text-base mt-auto">{formatPrice(product.price)}</p>
    </div>
    <div className="p-3 border-t border-gray-100">
      <button
        onClick={onBasalamPageClick}
        className="w-full flex items-center justify-center py-2 px-3 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition duration-200 ease-in-out shadow-sm"
      >
        <Eye size={16} className="ml-2" />
        مشاهده در Basalam
      </button>
    </div>
  </div>
);


// My Products Page Component
const MyProducts = () => {
  const { navigate, setSelectedProduct, dummyShopData } = useContext(AppContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest' or 'oldest'
  const [displayCount, setDisplayCount] = useState(6); // Initially show 3 rows (6 products)
  const productsRef = useRef(null);

  const filteredAndSortedProducts = dummyShopData.my_products
    .filter(product =>
      product.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

  const displayedProducts = filteredAndSortedProducts.slice(0, displayCount);

  const loadMoreProducts = useCallback(() => {
    // Simulate lazy loading delay
    setTimeout(() => {
      setDisplayCount(prevCount => Math.min(prevCount + 6, filteredAndSortedProducts.length));
    }, 300);
  }, [filteredAndSortedProducts.length]);

  // Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && displayCount < filteredAndSortedProducts.length) {
          loadMoreProducts();
        }
      },
      { threshold: 0.1 }
    );

    if (productsRef.current) {
      observer.observe(productsRef.current);
    }

    return () => {
      if (productsRef.current) {
        observer.unobserve(productsRef.current);
      }
    };
  }, [displayCount, filteredAndSortedProducts.length, loadMoreProducts]);

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    navigate('product-detail');
  };

  const handleBasalamPageClick = (e, url) => {
    e.stopPropagation(); // Prevent card click from navigating to detail page
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header title="محصولات من" onBack={() => navigate('dashboard')} />
      <div className="p-4 flex flex-col space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="جستجوی محصول..."
            className="w-full p-3 pl-10 pr-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>

        {/* Sorting Options */}
        <div className="flex items-center space-x-2 text-sm text-gray-700 justify-end">
          <span className="font-medium ml-2">مرتب سازی:</span>
          <button
            onClick={() => setSortOrder('newest')}
            className={`px-3 py-1 rounded-full transition-colors duration-200 ${
              sortOrder === 'newest' ? 'bg-emerald-600 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            جدیدترین
          </button>
          <button
            onClick={() => setSortOrder('oldest')}
            className={`px-3 py-1 rounded-full transition-colors duration-200 ${
              sortOrder === 'oldest' ? 'bg-emerald-600 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            قدیمی ترین
          </button>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-16">
          {displayedProducts.map(product => (
            <MyProductCard
              key={product.id}
              product={product}
              onClick={() => handleProductClick(product)}
              onBasalamPageClick={(e) => handleBasalamPageClick(e, product.basalamUrl)}
            />
          ))}
          {displayCount < filteredAndSortedProducts.length && (
            <div ref={productsRef} className="col-span-full">
              <LoadingSpinner />
            </div>
          )}
        </div>
        {displayedProducts.length === 0 && (
          <p className="text-center text-gray-500 mt-8">محصولی یافت نشد.</p>
        )}
      </div>
    </div>
  );
};


// Product Detail Page Component
const ProductDetail = () => {
  const { navigate, selectedProduct, dummyShopData, setDummyShopData } = useContext(AppContext);
  const [showOriginalProductFloating, setShowOriginalProductFloating] = useState(false);
  const [showSimilars, setShowSimilars] = useState(false);

  // Guard: if no product selected, go back to my-products
  useEffect(() => {
    if (!selectedProduct) {
      navigate('my-products');
    }
  }, [selectedProduct, navigate]);

  const productSimilars = selectedProduct ? dummyShopData.similars[selectedProduct.id] || [] : [];

  const handleScroll = useCallback(() => {
    const scrollPosition = window.scrollY;
    // Show floating button after scrolling down a bit (e.g., 200px)
    setShowOriginalProductFloating(scrollPosition > 200);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const addAsCompetitor = (similarProduct) => {
    setDummyShopData(prevData => {
      const newSimilars = { ...prevData.similars };
      if (newSimilars[selectedProduct.id]) {
        newSimilars[selectedProduct.id] = newSimilars[selectedProduct.id].map(s =>
          s.id === similarProduct.id ? { ...s, isCompetitor: true } : s
        );
      }
      return { ...prevData, similars: newSimilars };
    });
    // Optional: show a confirmation message
    alert(`محصول "${similarProduct.title}" به عنوان رقیب اضافه شد.`);
  };

  // Filter and sort similar products: first by price (lowest first), then by whether they are already competitors
  const sortedSimilars = productSimilars
    .sort((a, b) => {
      // Primary sort: by price (lowest first)
      if (a.price !== b.price) {
        return a.price - b.price;
      }
      // Secondary sort: competitors last
      return (a.isCompetitor === b.isCompetitor) ? 0 : (a.isCompetitor ? 1 : -1);
    });

  if (!selectedProduct) {
    return <LoadingSpinner />;
  }

  // Calculate competitor statistics
  const currentCompetitors = productSimilars.filter(s => s.isCompetitor);
  const lowestPriceCompetitor = currentCompetitors.reduce((min, p) => (p.price < min.price ? p : min), { price: Infinity, title: 'N/A' });
  const averageCompetitorPrice = currentCompetitors.length > 0
    ? currentCompetitors.reduce((sum, p) => sum + p.price, 0) / currentCompetitors.length
    : 0;
  const priceDifference = lowestPriceCompetitor.price !== Infinity && selectedProduct
    ? selectedProduct.price - lowestPriceCompetitor.price
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header title="جزئیات محصول" onBack={() => navigate('my-products')} />

      {/* Floating Original Product Info */}
      {showOriginalProductFloating && (
        <div className="fixed top-16 left-0 right-0 z-30 bg-white shadow-lg border-b border-gray-200 p-3 flex items-center justify-between rounded-b-xl">
          <img
            src={selectedProduct.photo_id}
            alt={selectedProduct.title}
            className="w-16 h-16 object-cover rounded-md flex-shrink-0 ml-3"
          />
          <div className="flex-grow">
            <h3 className="font-semibold text-gray-800 text-sm line-clamp-1">{selectedProduct.title}</h3>
            <p className="text-emerald-600 font-bold text-md">{formatPrice(selectedProduct.price)}</p>
          </div>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="text-blue-500 hover:underline text-sm mr-2"
          >
            مشاهده کامل
          </button>
        </div>
      )}


      <div className="p-4 pt-0 md:p-6 pb-24 relative">
        {/* Product Images */}
        <div className="flex flex-nowrap overflow-x-auto gap-2 p-2 bg-white rounded-xl shadow-md mb-4 scrollbar-hide">
          {selectedProduct.photos.map((photo, index) => (
            <img
              key={index}
              src={photo}
              alt={`${selectedProduct.title} image ${index + 1}`}
              className="flex-shrink-0 w-40 h-32 object-cover rounded-lg shadow-sm border border-gray-100"
              onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/150x100/cccccc/333333?text=No+Image"; }}
            />
          ))}
        </div>

        {/* Product Details */}
        <div className="bg-white p-4 rounded-xl shadow-md mb-4">
          <h2 className="text-xl font-bold text-gray-800 mb-2">{selectedProduct.title}</h2>
          <p className="text-emerald-600 text-2xl font-bold mb-3">{formatPrice(selectedProduct.price)}</p>
          <p className="text-gray-700 text-sm leading-relaxed mb-4">{selectedProduct.description}</p>

          {/* Moved Competitor Statistics Here */}
          <div className="border-t border-gray-200 pt-3">
            <h4 className="font-bold text-gray-800 text-md mb-2">اطلاعات قیمت رقبا:</h4>
            {currentCompetitors.length > 0 ? (
              <>
                <p className="text-sm text-gray-700 mb-1">
                  <span className="font-semibold">پایین ترین قیمت رقیب:</span> {formatPrice(lowestPriceCompetitor.price)} ({lowestPriceCompetitor.title !== 'N/A' ? lowestPriceCompetitor.title : 'نا مشخص'})
                </p>
                {selectedProduct.price < lowestPriceCompetitor.price && lowestPriceCompetitor.price !== Infinity ? (
                  <p className="text-sm text-green-600 mb-1">
                    <span className="font-semibold">تفاوت با پایین ترین:</span> {formatPrice(Math.abs(priceDifference))} پایین تر از شما! 🎉
                  </p>
                ) : selectedProduct.price > lowestPriceCompetitor.price && lowestPriceCompetitor.price !== Infinity ? (
                  <p className="text-sm text-red-600 mb-1">
                    <span className="font-semibold">تفاوت با پایین ترین:</span> {formatPrice(priceDifference)} بالاتر از شما 😞
                  </p>
                ) : (
                  <p className="text-sm text-blue-600 mb-1">
                    <span className="font-semibold">وضعیت قیمت شما:</span> این محصول هم‌قیمت یا پایین‌تر از رقبا است! ✅
                  </p>
                )}
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">میانگین قیمت رقبا:</span> {formatPrice(averageCompetitorPrice)}
                </p>
              </>
            ) : (
              <p className="text-gray-500 text-center py-2 text-sm">هنوز رقیبی اضافه نشده است. برای مقایسه، ابتدا رقبا را اضافه کنید.</p>
            )}
          </div>
        </div>

        {/* Find Competitors Button - text updated */}
        <button
          onClick={() => setShowSimilars(!showSimilars)}
          className="w-full flex items-center justify-center p-4 bg-emerald-600 text-white rounded-xl shadow-md hover:bg-emerald-700 transition duration-300 ease-in-out transform hover:scale-105 mb-6"
        >
          <Sparkles className="ml-3" />
          <span className="text-lg font-semibold">{showSimilars ? 'پنهان کردن رقبا' : 'مشاهده رقبا'}</span>
        </button>

        {showSimilars && (
          <>
            {/* Similar Products Grid - now sorted by price */}
            <div className="bg-white p-4 rounded-xl shadow-md mb-4">
              <h3 className="text-lg font-bold text-gray-800 mb-3">محصولات مشابه (از جستجو Basalam)</h3>
              {sortedSimilars.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {sortedSimilars.map(similar => (
                    <div
                      key={similar.id}
                      className="bg-gray-100 rounded-xl shadow-sm overflow-hidden flex flex-col items-center justify-between p-3 transition-all duration-300 ease-in-out hover:shadow-md hover:scale-[1.02]"
                    >
                      <img
                        src={similar.photo_id}
                        alt={similar.title}
                        className="w-28 h-28 object-cover rounded-lg mb-2 border border-gray-200"
                        onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/120x120/cccccc/333333?text=Sim+Image"; }}
                      />
                      <h4 className="text-center text-sm font-semibold text-gray-800 mb-1 line-clamp-2">{similar.title}</h4>
                      <p className="text-emerald-600 font-bold text-base">{formatPrice(similar.price)}</p>
                      {!similar.isCompetitor && (
                        <button
                          onClick={() => addAsCompetitor(similar)}
                          className="mt-3 w-full py-2 px-3 bg-indigo-500 text-white text-xs rounded-lg hover:bg-indigo-600 transition duration-200 ease-in-out shadow-sm"
                        >
                          اضافه کردن به رقبا
                        </button>
                      )}
                      {similar.isCompetitor && (
                        <span className="mt-3 w-full py-2 px-3 text-center text-xs bg-gray-300 text-gray-700 rounded-lg">
                          اضافه شده
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">هیچ محصول مشابهی یافت نشد.</p>
              )}
            </div>

            {/* Competitors Section */}
            <div className="bg-white p-4 rounded-xl shadow-md mb-4">
              <h3 className="text-lg font-bold text-gray-800 mb-3">رقبای فعلی شما</h3>
              {currentCompetitors.length > 0 ? (
                <ul className="space-y-3">
                  {currentCompetitors.map(comp => (
                    <li key={comp.id} className="flex items-center bg-gray-50 p-3 rounded-lg shadow-sm border border-gray-100">
                      <img
                        src={comp.photo_id}
                        alt={comp.title}
                        className="w-12 h-12 object-cover rounded-md ml-3"
                        onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/50x50/cccccc/333333?text=N/A"; }}
                      />
                      <div className="flex-grow">
                        <p className="font-semibold text-sm text-gray-700 line-clamp-1">{comp.title}</p>
                        <p className="text-red-500 font-bold text-base">{formatPrice(comp.price)}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-center py-4">هنوز رقیبی اضافه نشده است.</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const App = () => {
  const [currentPage, setCurrentPage] = useState('dashboard'); // 'dashboard', 'my-products', 'product-detail'
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [basalamToken, setBasalamToken] = useState('');
  const [dummyShopData, setDummyShopData] = useState(dummyData); // Use dummyData as initial state

  const navigate = (page) => {
    setCurrentPage(page);
    if (page === 'my-products') {
      setSelectedProduct(null); // Clear selected product when navigating to list
    }
  };

  // Main render logic based on currentPage
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'my-products':
        return <MyProducts />;
      case 'product-detail':
        return <ProductDetail />;
      case 'not-best-price':
        // Placeholder for "not best price" page
        return (
          <div className="p-4 text-center min-h-screen bg-gray-50 flex flex-col">
            <Header title="محصولات با قیمت غیر رقابتی" onBack={() => navigate('dashboard')} />
            <p className="text-gray-600 mt-8">این صفحه هنوز در حال توسعه است. به زودی ویژگی‌های بیشتری اضافه خواهد شد!</p>
            <AlertCircle size={48} className="text-yellow-500 mx-auto mt-8" />
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <AppContext.Provider value={{
      navigate,
      selectedProduct,
      setSelectedProduct,
      basalamToken,
      setBasalamToken,
      dummyShopData,
      setDummyShopData // Provide setter for dummy data
    }}>
      <div className="font-['Inter'] antialiased bg-gray-50 text-gray-900 min-h-screen">
        {renderPage()}
        <DevTools /> {/* Always render DevTools for easy access */}
      </div>
    </AppContext.Provider>
  );
};

export default App;
