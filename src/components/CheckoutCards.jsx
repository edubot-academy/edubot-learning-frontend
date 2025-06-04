import React from "react";
import CheckoutImg from "../assets/images/CheckoutImg.png";

export default function CheckoutCards() {
  return (
    <div className="w-full max-w-2xl mx-auto pt-7 space-y-4">
      {/* Навигация */}
      <nav className="text-sm text-gray-500 flex items-center mb-10 gap-1">
        <span>Башкы бет</span>
        <span>›</span>
        <span>себет</span>
        <span>›</span>
        <span className="text-green-600 font-medium">Буйрумтманы түзүү</span>
      </nav>

      {/* Заголовок */}
      <h2 className="text-xl font-semibold text-gray-900">
        Буйрумтманын чоо-жайы (2 курс)
      </h2>

      <hr className="border-t border-gray-300 w-full" />

      {/* Продукт */}
      <div className="flex items-center gap-4">
        <img
          src={CheckoutImg}
          alt="UX Design Course"
          className="w-32 h-20 object-cover rounded-md"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
          <p className="text-base font-medium text-gray-900">
            User Experience Design're киришүү
          </p>
          <p className="text-lg font-semibold text-black sm:text-right">
            11 000,00 С
          </p>
        </div>
      </div>
    </div>
  );
}
