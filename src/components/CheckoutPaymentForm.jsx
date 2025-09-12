import React from "react";
import ChekoutVisa from "../assets/images/CheckoutVisaImg.png";
import Bankcard from "../assets/icons/mingcute_bank-card-fill.svg";

export default function CheckoutPaymentForm() {
  return (
    <div className="w-full max-w-md mx-auto pt-24 space-y-4">
      {/* Блок 1: Банковская карта */}
      <div className=" max-w-[535px]  flex items-center gap-3 bg-slate-200 rounded-xl px-4 py-3">
        <div className="w-8 h-8 bg-white rounded flex items-center justify-center shadow-sm">
          <img
            className="w-5 h-5 text-black"
            viewBox="0 0 24 24"
            fill="currentColor"
            src={Bankcard}
            alt=""
          />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">Банковская карта</p>
          <p className="text-sm text-gray-400">Visa</p>
        </div>
      </div>

      {/* Блок 2: Форма оплаты */}
      <div className="bg-white border rounded-xl p-6 space-y-4 shadow-sm">
        <p className="text-base font-bold text-gray-900">Оплата картой</p>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="radio"
              name="payment"
              className="form-radio text-blue-600"
            />
            Кредиттик/Дебеттик карталар
          </label>

          <div className="flex gap-1">
            <img src={ChekoutVisa} alt="Visa" className="h-7" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-#000000">Картанын номери</label>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={16}
            placeholder="Номер карты"
            className="w-full  border bg-gray-100 rounded-2xl px-4 py-4 text-sm placeholder-gray-400 focus:outline-none focus:ring focus:ring-blue-200"
            onInput={(e) => {
              e.target.value = e.target.value.replace(/\D/g, "");
            }}
          />
        </div>

        <div className="flex gap-4">
          <div className="w-1/2">
            <label className="text-sm text-#000000">MM/YY</label>
            <input
              type="text"
              placeholder="MM/YY"
              className="w-full border bg-gray-100 rounded-2xl px-4 py-4 text-sm placeholder-gray-400 focus:outline-none focus:ring focus:ring-blue-200"
            />
          </div>
          <div className="w-1/2">
            <label className="text-sm text-#000000">CVC/CVV</label>
            <div className="relative">
              <input
                type="text"
                placeholder="CVC/CVV"
                className="w-full border bg-gray-100 rounded-2xl px-4 py-4 text-sm placeholder-gray-400 focus:outline-none focus:ring focus:ring-blue-200 pr-8"
              />
              <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs">
                ?
              </span>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full h-[55px] bg-edubot-green #0EA78B hover:bg-green-700 text-white font-medium py-2 rounded-2xl text-sm transition"
        >
          Төлөө
        </button>
      </div>

      {/* Блок 3: Подпись */}
      <p className="text-[13px] text-center text-gray-500">
        «Төлөө» баскычын басуу менен сиз Жарлыкка, Жарнамалык сунушка
        макулдугуңузду билдиресиз жана жеке маалыматтарды иштетүүгө
        макулдугуңузду бересиз
      </p>
    </div>
  );
}
