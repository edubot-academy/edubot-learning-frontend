import { Link } from "react-router-dom";
import qr from "../assets/icons/qr.svg"; 
import { FaInstagram } from "react-icons/fa";
import { FaTelegramPlane } from "react-icons/fa";
import { IoIosCall } from "react-icons/io";

const Footer = () => {
  return (
    <footer className="bg-white text-black py-12 border-t border-gray-300 p-5">
      <div className="max-w-6xl mx-auto flex flex-col items-start space-y-12">
        {/* Логотип - скрыт на мобилках */}
        <h2 className="hidden md:block text-5xl font-normal text-center tracking-wide w-full">
          <span className="font-extrabold text-[#EA580C]">EDUBOT </span>
          LEARNING
        </h2>

        {/* Основной блок */}
        <div className="w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-20">
          {/* Левая часть: тексты */}
          <div className="flex flex-col md:flex-row gap-16">
            {/* Навигация */}
            <div>
              <h3 className="font-bold text-base mb-3 text-black">НАВИГАЦИЯ</h3>
              <ul className="space-y-1 text-gray-700 text-sm">
                <li>
                  <Link to="/courses">Курстар жөнүндө</Link>
                </li>
                <li>
                  <Link to="/about">Биз жөнүндө</Link>
                </li>
                <li>
                  <Link to="/contact">Байланыш</Link>
                </li>
              </ul>
            </div>

            {/* Контакты */}
            <div>
              <h3 className="font-bold text-base mb-3 text-black">
                КОНТАКТНАЯ ИНФОРМАЦИЯ
              </h3>
              <ul className="space-y-1 text-gray-700 text-sm">
                <li className="flex items-center gap-1"><FaInstagram /> edubot_learning</li>
                <li className="flex items-center gap-1"><FaTelegramPlane /> edubot_learning</li>
                <li className="flex items-center gap-1"><IoIosCall /> +996 (555) 922 522</li>
              </ul>
            </div>

            {/* Адрес */}
            <div>
              <h3 className="font-bold text-base mb-3 text-black">НАШ АДРЕС</h3>
              <p className="text-sm text-gray-700">
                г.Бишкек, ул.Турусбекова 109/1
              </p>
            </div>
          </div>

          {/* Правая часть: QR-код */}
          <div>
            <img
              src={qr}
              alt="QR code"
              className="w-[120px] h-[120px] object-contain"
            />
          </div>
        </div>

        {/* Копирайт */}
        <p className="w-full text-center text-xs text-gray-600 mt-16">
          © 2025 Edubot Learning. Все права защищены.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
