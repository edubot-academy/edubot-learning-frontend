import { useState } from "react";
import { addPayment } from "../payments/api"; // Импорт готового API
import Visa from "../../assets/icons/visa.svg"

function SuccessPaymentModal({ open, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl w-full max-w-[883px] p-8 md:p-12 relative">
        <button className="absolute top-6 right-6 text-2xl" onClick={onClose}>
          ×
        </button>
        
        <div className="text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white text-4xl mx-auto mb-6">
            ✓
          </div>
          
          <h2 className="text-2xl md:text-3xl font-bold mb-8">Успешная оплата</h2>
          
          <div className="text-gray-800 text-[16px] whitespace-pre-line max-w-[420px] mx-auto">
            ОсОО "EduBot"
            {"\n"}ИНН 030123456789
            {"\n"}Фискальный чек №123456
            {"\n"}Дата: {new Date().toLocaleDateString()} Время: {new Date().toLocaleTimeString()}
            {"\n"}Услуга: Онлайн-курс "Frontend Basics"
            {"\n"}Сумма: 15000 KGS
            {"\n"}Спасибо за оплату!
          </div>
          
          <button
            className="mt-10 bg-[#F25A3C] text-white rounded-xl px-10 py-3"
            onClick={onClose}
          >
            Готово
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PaymentCourse() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    cardNumber: "",
    fullName: "",
    expDate: "",
    cvc: ""
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePay = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Используем готовый API
      await addPayment({
        ...formData,
        amount: 15000,
        courseName: "Frontend Basics"
      });
      
      setIsSuccess(true);
      setFormData({ cardNumber: "", fullName: "", expDate: "", cvc: "" });
    } catch (error) {
      alert("Ошибка оплаты: " + (error.message || "Попробуйте снова"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="w-full max-w-[720px] mx-auto bg-white rounded-xl p-6 md:p-8 shadow-lg border mt-10 mb-20">
        <h2 className="text-2xl md:text-3xl font-semibold mb-6">Оплата картой</h2>

        <div className="flex items-center gap-5 mb-6">
          <label className="flex items-center gap-2 font-medium">
            <input type="radio" defaultChecked />
            Кредиттик / Дебеттик карталар
          </label>
          <img src={Visa} alt="cards" className="ml-auto w-24" />
        </div>

        <form className="flex flex-col gap-4" onSubmit={handlePay}>
          <input
            type="text"
            name="cardNumber"
            placeholder="Картанын номери"
            className="border rounded-lg p-3"
            required
            value={formData.cardNumber}
            onChange={handleChange}
            disabled={isLoading}
          />

          <input
            type="text"
            name="fullName"
            placeholder="ФИО"
            className="border rounded-lg p-3"
            required
            value={formData.fullName}
            onChange={handleChange}
            disabled={isLoading}
          />

          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              name="expDate"
              placeholder="MM/YY"
              className="border rounded-lg p-3"
              required
              value={formData.expDate}
              onChange={handleChange}
              disabled={isLoading}
            />
            <input
              type="password"
              name="cvc"
              placeholder="CVC/CVV"
              className="border rounded-lg p-3"
              required
              value={formData.cvc}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            className="mt-4 w-full py-3 bg-[#F25A3C] text-white rounded-xl font-medium"
            disabled={isLoading}
          >
            {isLoading ? "Обработка..." : "Сатып алуу →"}
          </button>

          <p className="text-xs text-gray-500 mt-4">
            &lt;Төлөө&gt; баскычын басуу менен сиз Жарлыкка,
            Жарнамалык сунушқа макулдугуңузду билдиресиз жана жеке 
            маалыматтарды иштетүүгө макулдугуңузду бересиз
          </p>
        </form>
      </div>

      <SuccessPaymentModal open={isSuccess} onClose={() => setIsSuccess(false)} />
    </>
  );
}