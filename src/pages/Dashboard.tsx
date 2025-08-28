import { useContext } from "react";
import { AppContext } from "../App";
import { Package, AlertCircle } from "lucide-react";

const Dashboard = () => {
  const { navigate, setBasalamToken } = useContext(AppContext);

  return (
    <div className="p-4 max-w-md mx-auto h-screen flex flex-col justify-center">
      <div className="bg-emerald-100 p-6 rounded-2xl shadow-lg flex flex-col items-center text-center">
        <h2 className="text-2xl font-bold text-emerald-800 mb-6">
          به پنل Basalam خوش آمدید!
        </h2>
        <div className="space-y-4 w-full">
          <button
            onClick={() => navigate("my-products")}
            className="w-full flex items-center justify-center p-4 bg-emerald-600 text-white rounded-xl shadow-md hover:bg-emerald-700 transition duration-300 ease-in-out transform hover:scale-105"
          >
            <Package className="mr-3" />
            <span className="text-lg font-semibold">همه محصولات من</span>
          </button>
          <button
            onClick={() => navigate("not-best-price")}
            className="w-full flex items-center justify-center p-4 bg-yellow-500 text-white rounded-xl shadow-md hover:bg-yellow-600 transition duration-300 ease-in-out transform hover:scale-105"
          >
            <AlertCircle className="mr-3" />
            <span className="text-lg font-semibold">
              محصولات با قیمت غیر رقابتی
            </span>
          </button>
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
  );
};

export default Dashboard;
