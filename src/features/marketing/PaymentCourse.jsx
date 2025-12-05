import { useState } from "react";

function SuccessPaymentModal({ open, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl w-full max-w-[883px] max-h-[896px] p-8 md:p-12 overflow-y-auto relative animate-modalIn">
        {/* Close button */}
        <button
          className="absolute top-6 right-6 text-gray-600 text-2xl hover:text-black transition-colors"
          onClick={onClose}
        >
          ×
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white text-4xl">
            ✓
          </div>
        </div>

        <h2 className="text-center text-2xl md:text-3xl font-bold mb-8">
          Успешная оплата
        </h2>

        {/* Чек */}
        <div className="text-gray-800 text-[16px] leading-[26px] whitespace-pre-line text-center md:text-left max-w-[420px] mx-auto">
          ОсОО "EduBot"
          {"\n"}ИНН 030123456789
          {"\n"}Фискальный чек №123456
          {"\n"}Дата: 15.10.2025   Время: 12:34
          {"\n"}Услуга: Онлайн-курс "Frontend Basics"
          {"\n"}Сумма: 15000 KGS
          {"\n"}Оплата: Картой VISA ****1234
          {"\n"}Спасибо за оплату!
        </div>

        {/* Icons */}
        <div className="flex items-center justify-center gap-8 mt-10 mb-10">
          <button className="text-xl hover:scale-110 transition-transform duration-200">
            ⬇
          </button>
          <button className="text-xl hover:scale-110 transition-transform duration-200">
            ✉
          </button>
        </div>

        {/* Send button */}
        <button
          className="block mx-auto bg-[#F25A3C] hover:bg-[#e14f32] text-white rounded-xl px-10 py-3 text-[16px] font-medium transition-all duration-200 shadow-md hover:shadow-lg"
          onClick={onClose}
        >
          Отправить
        </button>
      </div>
    </div>
  );
}

export default function PaymentCourse() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [fullName, setFullName] = useState("");
  const [expDate, setExpDate] = useState("");
  const [cvc, setCvc] = useState("");

  // 👉 Тут будет API: вызов оплаты
  const handlePay = async (e) => {
    e.preventDefault();

    // ====== ТЫ ДОБАВИШЬ СВОЙ API ======
    /*
      const response = await payApi({
        cardNumber,
        fullName,
        expDate,
        cvc,
      });

      if (response.status === 200) setIsSuccess(true);
    */
    setIsSuccess(true);
  };

  return (
    <>
      <div className="w-full max-w-[720px] mx-auto bg-white rounded-xl p-6 md:p-8 shadow-lg border mt-10 mb-20">
        <h2 className="text-2xl md:text-3xl font-semibold mb-6">
          Оплата картой
        </h2>

        {/* Tabs */}
        <div className="flex items-center gap-5 mb-6">
          <label className="flex items-center gap-2 font-medium">
            <input type="radio" defaultChecked />
            Кредиттик / Дебеттик карталар
          </label>

          <label className="flex items-center gap-2 text-gray-500">
            <input type="radio" disabled />
            QR code
          </label>

          <img
            src="/visa-mastercard.png"
            alt="cards"
            className="ml-auto w-16 opacity-80"
          />
        </div>

        <form className="flex flex-col gap-4" onSubmit={handlePay}>
          <input
            type="text"
            placeholder="Картанын номери"
            className="border rounded-lg p-3 text-[15px] focus:ring-2 focus:ring-[#F25A3C]/50 focus:border-[#F25A3C] outline-none transition-all"
            required
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
          />

          <input
            type="text"
            placeholder="ФИО"
            className="border rounded-lg p-3 text-[15px] focus:ring-2 focus:ring-[#F25A3C]/50 focus:border-[#F25A3C] outline-none transition-all"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="MM/YY"
              className="border rounded-lg p-3 text-[15px] focus:ring-2 focus:ring-[#F25A3C]/50 focus:border-[#F25A3C] outline-none transition-all"
              required
              value={expDate}
              onChange={(e) => setExpDate(e.target.value)}
            />
            <input
              type="password"
              placeholder="CVC/CVV"
              className="border rounded-lg p-3 text-[15px] focus:ring-2 focus:ring-[#F25A3C]/50 focus:border-[#F25A3C] outline-none transition-all"
              required
              value={cvc}
              onChange={(e) => setCvc(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="mt-4 w-full py-3 bg-[#F25A3C] hover:bg-[#e14f32] text-white rounded-xl text-[16px] font-medium transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Сатып алуу →
          </button>

          <p className="text-xs text-gray-500 mt-4">
            &lt;Төлөө&gt; баскычын басуу менен сиз Жарлыкка,
            Жарнамалык сунушқа макулдугуңузду билдиресиз жана жеке 
            маалыматтарды иштетүүгө макулдугуңузду бересиз
          </p>
        </form>
      </div>

      {/* ===== МОДАЛКА УСПЕШНОЙ ОПЛАТЫ ===== */}
      <SuccessPaymentModal open={isSuccess} onClose={() => setIsSuccess(false)} />
    </>
  );
}