import React, { useState } from "react";
import { submitContactMessage } from "../../services/api";
import toast, { Toaster } from "react-hot-toast";

const ModalCommunication = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};

    if (formData.name.trim().length < 2) {
      newErrors.name = "Атыңыз кеминде 2 белгиден турушу керек.";
    }

    if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(formData.email)) {
      newErrors.email = "Туура электрондук почта киргизиңиз.";
    }

    if (!/^\d{9,13}$/.test(formData.phone)) {
      newErrors.phone = "Телефон номери 9–13 цифрадан турушу керек.";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Билдирүү бош болбошу керек.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone") {
      if (!/^\d*$/.test(value)) return;
      if (value.length > 13) return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await submitContactMessage(formData);
      toast.success("Билдирүү ийгиликтүү жөнөтүлдү!");
      setFormData({ name: "", email: "", phone: "", message: "" });
      setErrors({});
      onClose();
    } catch {
      toast.error("Билдирүү жөнөтүлбөй калды. Кайра аракет кылыңыз.");
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <Toaster position="top-center" />
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div
          className="
            bg-white rounded-xl p-5
            w-full max-w-[600px] min-w-[300px]
            h-auto max-h-[700px] min-h-[350px]
            sm:w-[90%] sm:h-auto
            overflow-auto relative
            shadow-lg
          "
        >
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-500 hover:text-black font-bold text-xl"
          >
            ×
          </button>

          <h2 className="text-2xl sm:text-3xl font-bold mb-5">Байланышуу</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { label: "Атыңыз", name: "name", type: "text" },
              { label: "Электронная почта", name: "email", type: "email" },
              { label: "Телефон номери", name: "phone", type: "tel" },
            ].map(({ label, name, type }) => (
              <div key={name}>
                {errors[name] && (
                  <p className="text-red-500 text-xs mb-1">{errors[name]}</p>
                )}
                <label className="block font-medium mb-1 text-sm">
                  {label}
                </label>
                <input
                  type={type}
                  name={name}
                  value={formData[name]}
                  onChange={handleChange}
                  required
                  className="w-full border border-black rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E14219] transition"
                />
              </div>
            ))}

            <div>
              {errors.message && (
                <p className="text-red-500 text-xs mb-1">{errors.message}</p>
              )}
              <label className="block font-medium mb-1 text-sm">Билдирүү</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={3}
                required
                className="w-full border border-black rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E14219] transition"
              ></textarea>
            </div>

            <button
              type="submit"
              className="bg-[#E14219] text-white font-medium rounded-md w-[140px] h-[48px] shadow-md shadow-[#FF8C6E]/70 transition text-sm"
            >
              Жөнөтүү
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default ModalCommunication;
