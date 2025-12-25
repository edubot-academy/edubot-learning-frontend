import React, { useState } from "react";
import PropTypes from "prop-types";
import toast from "react-hot-toast";
import Modal from "@shared/ui/Modal";

const ContactCourseModal = ({ isOpen, onClose, course, lessonCount }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (formData.name.trim().length < 2) {
      newErrors.name = "Атыңыз кеминде 2 белгиден турушу керек.";
    }
    if (!/^[\w.-]+@([\w-]+\.)+[\w-]{2,4}$/.test(formData.email)) {
      newErrors.email = "Туура электрондук почта киргизиңиз.";
    }
    if (!/^\\d{9,13}$/.test(formData.phone)) {
      newErrors.phone = "Телефон номери 9–13 цифрадан турушу керек.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "phone") {
      if (!/^\\d*$/.test(value)) return;
      if (value.length > 13) return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      // TODO: wire to backend when available
      toast.success("Сурам ийгиликтүү жөнөтүлдү");
      onClose?.();
      setFormData({ name: "", email: "", phone: "", message: "" });
    } catch (error) {
      console.error("Ошибка отправки:", error);
      toast.error("Жөнөтүүдө ката кетти");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Байланышуу" size="md">
      <div className="p-1">
        <div className="mb-6 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-100">
          <h3 className="font-bold text-lg mb-2 text-[#EA580C]">Курс: {course?.title}</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-600">Баасы:</span>
              <span className="font-bold text-gray-800 ml-2">${course?.price}</span>
            </div>
            <div>
              <span className="text-gray-600">Урок саны:</span>
              <span className="font-bold text-gray-800 ml-2">{lessonCount}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-2 font-medium text-gray-700 text-sm">
              Аты-жөнүңүз *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={isSubmitting}
              className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#EA580C] transition-all duration-200 ${
                errors.name ? "border-red-500" : "border-gray-300"
              } ${isSubmitting ? "bg-gray-100 cursor-not-allowed" : ""}`}
              placeholder="Сиздин толук атыңыз"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block mb-2 font-medium text-gray-700 text-sm">
              Телефон номериңиз *
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              disabled={isSubmitting}
              className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#EA580C] transition-all duration-200 ${
                errors.phone ? "border-red-500" : "border-gray-300"
              } ${isSubmitting ? "bg-gray-100 cursor-not-allowed" : ""}`}
              placeholder="+996 _ _ _"
            />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
          </div>

          <div>
            <label className="block mb-2 font-medium text-gray-700 text-sm">
              Электрондук почтаңыз *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={isSubmitting}
              className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#EA580C] transition-all duration-200 ${
                errors.email ? "border-red-500" : "border-gray-300"
              } ${isSubmitting ? "bg-gray-100 cursor-not-allowed" : ""}`}
              placeholder="example@mail.com"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block mb-2 font-medium text-gray-700 text-sm">
              Суроо же сунушуңуз
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows="3"
              disabled={isSubmitting}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#EA580C] focus:border-transparent transition resize-none"
              placeholder="Бул курс боюнча суроолоруңуз..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Жокко чыгаруу
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-2.5 text-sm font-medium text-white rounded-lg transition-all duration-200 ${
                isSubmitting
                  ? "bg-[#FF8C6E] cursor-not-allowed"
                  : "bg-gradient-to-r from-[#EA580C] to-[#E14219] hover:from-[#d64d0b] hover:to-[#c13613]"
              }`}
            >
              {isSubmitting ? "Жөнөтүлүүдө..." : "Жөнөтүү"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

ContactCourseModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  course: PropTypes.shape({
    title: PropTypes.string,
    price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }),
  lessonCount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

export default ContactCourseModal;
