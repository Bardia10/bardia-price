import { useContext } from "react";
import { AppContext } from "../context/AppContext";
import { Package, AlertCircle } from "lucide-react";

const Dashboard = () => {
  const { navigate, setBasalamToken } = useContext(AppContext);

  return (
    <div className="p-4 max-w-md mx-auto h-screen flex flex-col justify-center">
  <div className="bg-emerald-100 p-6 rounded-2xl shadow-lg flex flex-col items-center text-center">
    <h2 className="text-3xl font-bold text-emerald-800 mb-6">
      به داشبورد قیمت یار خوش آمدید!
    </h2>
      <br/>
    <div className="space-y-6 w-full">

      {/* دکمه همه محصولات */}
      <div className="flex flex-col items-center space-y-2">
        <p className="text-lg text-emerald-700 leading-relaxed">
          این دکمه همه محصولات شما را نشان می‌دهد.  
          می‌توانید برای هر محصول رقیب اضافه کنید تا قیمت‌ها را با هم مقایسه کنید.
        </p>
        <button
          onClick={() => navigate("my-products")}
          className="w-full flex items-center justify-center p-4 bg-emerald-600 text-white rounded-xl shadow-md hover:bg-emerald-700 transition duration-300 ease-in-out transform hover:scale-105"
        >
          <Package className="mr-3" />
          <span className="text-xl font-semibold">مشاهده همه محصولات</span>
        </button>
      </div>
      <br/>
      <br/>
      {/* دکمه محصولات گران‌تر */}
      <div className="flex flex-col items-center space-y-2 ">
        <p className="text-lg text-yellow-700 leading-relaxed">
          این دکمه محصولاتی را نشان می‌دهد که قیمتشان از رقبا بالاتر است.  
          می‌توانید قیمت این محصولات را پایین‌تر بیاورید تا مشتری بیشتری جذب کنید.
        </p>
        <button
          onClick={() => navigate("not-best-price")}
          className="w-full flex items-center justify-center p-4 bg-yellow-500 text-white rounded-xl shadow-md hover:bg-yellow-600 transition duration-300 ease-in-out transform hover:scale-105"
        >
          <AlertCircle className="mr-3" />
          <span className="text-xl font-semibold">
            محصولات گران‌تر از رقبا
          </span>
        </button>
      </div>
      <br/>
      <br/>
      <br/>
      {/* دکمه خروج */}
      <div className="flex flex-col items-center space-y-2 mb-8">
        <p className="text-sm text-red-700 leading-relaxed">
          با این دکمه از حساب کاربری خود خارج می‌شوید.
        </p>
        <button
          onClick={() => {
            setBasalamToken("");
            navigate("login");
          }}
          className="w-full flex items-center justify-center p-3 bg-red-500 text-white rounded-xl shadow-md hover:bg-red-600 transition duration-300 ease-in-out"
        >
          خروج
        </button>
      </div>

    </div>
  </div>
</div>

  );
};

export default Dashboard;
