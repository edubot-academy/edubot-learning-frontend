import React, { useState } from "react";
import { submitContactMessage } from "../services/api";
import toast, { Toaster } from "react-hot-toast";
import LeftLittleMan from "../assets/images/LeftLittleMan.png";
import InstagramIcon from "../assets/icons/instagram.svg";
import Telegram from "../assets/icons/telegram.svg";
import MailIcon from "../assets/icons/mailIcon.svg";
import MapPinIcon from "../assets/icons/mapPinIcon.svg";
import ClockIcon from "../assets/icons/clockIcon.svg";

const ContactPage = () => {
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
    } catch {
      toast.error("Билдирүү жөнөтүлбөй калды. Кайра аракет кылыңыз.");
    }
  };

  return (
    <div className="bg-white min-h-screen px-4 py-12 md:px-16 text-gray-800">
      <Toaster position="top-center" />
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 items-center gap-10 md:gap-16">
        <div>
          <div className="mb-6 mt-10">
            <h1 className="text-5xl md:text-6xl font-bold text-black">
              Байланышуу
            </h1>
          </div>

          <p className="mb-10 text-lg text-gray-700">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Quaerat
            commodi perferendis velit amet placeat! Alias voluptatem quos neque
            tempore rem!
          </p>

          <form onSubmit={handleSubmit} className="space-y-5 max-w-xl">
            {[
              { label: "Атыңыз", name: "name", type: "text" },
              { label: "Электронная почта", name: "email", type: "email" },
              { label: "Телефон номери", name: "phone", type: "tel" },
            ].map(({ label, name, type }) => (
              <div key={name}>
                {errors[name] && (
                  <p className="text-red-500 text-sm mb-1">{errors[name]}</p>
                )}
                <label className="block font-medium mb-1">{label}</label>
                <input
                  type={type}
                  name={name}
                  value={formData[name]}
                  onChange={handleChange}
                  required
                  className="w-full border border-black rounded-[10px] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E14219] transition"
                />
              </div>
            ))}

            <div>
              {errors.message && (
                <p className="text-red-500 text-sm mb-1">{errors.message}</p>
              )}
              <label className="block font-medium mb-1">Билдирүү</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={4}
                required
                className="w-full border border-black rounded-[10px] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E14219] transition"
              ></textarea>
            </div>

            <button
              type="submit"
              className="bg-[#E14219] text-white font-medium rounded-[8px] w-[156px] h-[56px] shadow-lg shadow-[#FF8C6E]/90 transition"
            >
              Жөнөтүү
            </button>
          </form>
        </div>

        <div className="hidden md:flex justify-center items-center">
          <img
            src={LeftLittleMan}
            alt="Contact Illustration"
            className="max-w-full h-auto"
          />
        </div>
      </div>

      <div className="w-full max-w-[1739px] mx-auto px-4 md:px-10 mt-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-base mb-12">
          <div className="space-y-4 flex flex-col items-start">
            <div>
              <div className="font-inter text-[#EA580C] flex items-center gap-2">
                <img src={InstagramIcon} alt="instagram" className="w-5 h-5" />
                Instagram
              </div>
              <a
                href="https://www.instagram.com/edubot.company/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-black block mt-1 font-normal text-sm font-suisse Intl"
              >
                @edubot.company
              </a>
            </div>

            <div>
              <div className="font-inter text-[#EA580C] flex items-center gap-2">
                <img src={Telegram} alt="telegram" className="w-5 h-5" />
                Telegram
              </div>
              <a
                href="https://t.me/edubot_learning"
                target="_blank"
                rel="noopener noreferrer"
                className="text-black block mt-1 font-normal text-sm font-suisse Intl"
              >
                @edubot_learning
              </a>
            </div>
          </div>

          <div className="flex flex-col items-center space-y-4">
            <div className="text-center">
              <div className="font-inter text-[#EA580C] flex items-center justify-start gap-2">
                <img src={MailIcon} alt="mail" className="w-5 h-5" />
                Электрондук почта
              </div>
              <a
                href="mailto:jardam.edubot_learning@outlook.com"
                className="text-black block mt-1 font-normal text-sm font-suisse Intl"
              >
                jardam.edubot_learning@outlook.com
              </a>
            </div>
          </div>

          <div className="space-y-4 flex flex-col items-start text-right">
            <div>
              <div className="font-inter text-[#EA580C] flex items-center justify-start gap-2">
                <img src={ClockIcon} alt="clock" className="w-5 h-5" />
                Иштөө убактысы
              </div>
              <p className="text-black block mt-1 font-normal text-sm font-suisse Intl">
                Дүйшөмбү — Жума, 9:00 — 21:00 (Бишкек убактысы)
              </p>
            </div>
            <div>
              <div className="font-inter text-[#EA580C] flex items-center justify-start gap-2">
                <img src={MapPinIcon} alt="address" className="w-5 h-5" />
                Дарек
              </div>
              <p className="text-black block mt-1 font-normal text-sm font-suisse Intl">
                Ахунбаева 129B, Бишкек, Кыргызстан
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-full">
          <iframe
            src="https://www.google.com/maps?q=Ahunbaeva+129B,+Bishkek,+Kyrgyzstan&output=embed"
            width="100%"
            height="400"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="EduBot Location"
            className="rounded-xl w-full"
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
