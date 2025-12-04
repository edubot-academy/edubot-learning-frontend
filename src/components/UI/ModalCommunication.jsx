import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { submitContactMessage } from "../../services/api";
import toast from "react-hot-toast";

const ModalCommunication = ({
  isOpen,
  onClose,
  title = "Байланышуу",
  size = "md",
  showCloseButton = true,
  showBackdrop = true,
  closeOnBackdropClick = true,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localIsOpen, setLocalIsOpen] = useState(isOpen);

  useEffect(() => {
    setLocalIsOpen(isOpen);
  }, [isOpen]);

  useEffect(() => {
    if (!localIsOpen) return;

    const handleEscape = (e) => {
      if (e.key === "Escape" && onClose && !isSubmitting) {
        onClose();
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener("keydown", handleEscape);
    };
  }, [localIsOpen, onClose, isSubmitting]);

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
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await submitContactMessage(formData);
      toast.success("Билдирүү ийгиликтүү жөнөтүлдү!");
      setFormData({ name: "", email: "", phone: "", message: "" });
      setErrors({});
      if (onClose) onClose();
    } catch {
      toast.error("Билдирүү жөнөтүлбөй калды. Кайра аракет кылыңыз.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (
      e.target === e.currentTarget &&
      closeOnBackdropClick &&
      onClose &&
      !isSubmitting
    ) {
      onClose();
    }
  };

  const handleCloseClick = () => {
    if (onClose && !isSubmitting) onClose();
  };

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-3xl",
    xl: "max-w-5xl",
    full: "max-w-full mx-4",
  };

  if (!localIsOpen) return null;

  return (
    <>
      <div className="fixed top-4 right-4 z-[100]"></div>

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {showBackdrop && (
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            aria-hidden="true"
            onClick={handleBackdropClick}
          />
        )}

        <div
          className={`
            relative w-full ${sizeClasses[size] || sizeClasses.md}
            max-h-[90vh] overflow-y-auto
            bg-white rounded-xl shadow-2xl
          `}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div className="p-6">
            {(title || showCloseButton) && (
              <div className="flex items-start justify-between gap-4 mb-6">
                {title && (
                  <h2
                    id="modal-title"
                    className="text-2xl font-bold text-gray-900"
                  >
                    {title}
                  </h2>
                )}

                {showCloseButton && (
                  <button
                    type="button"
                    onClick={handleCloseClick}
                    disabled={isSubmitting}
                    className="
                      text-gray-500 hover:text-black
                      font-bold text-2xl leading-none
                      transition-colors duration-200
                      focus:outline-none focus:ring-2 focus:ring-[#E14219]
                      rounded-full p-1
                      disabled:opacity-50 disabled:cursor-not-allowed
                    "
                    aria-label="Жабуу"
                  >
                    ×
                  </button>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {[
                { label: "Атыңыз", name: "name", type: "text" },
                { label: "Электронная почта", name: "email", type: "email" },
                { label: "Телефон номери", name: "phone", type: "tel" },
              ].map(({ label, name, type }) => (
                <div key={name}>
                  <label className="block font-medium mb-1 text-sm text-gray-700">
                    {label}
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type={type}
                    name={name}
                    value={formData[name]}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className={`
                      w-full border rounded-lg px-3 py-2 text-sm 
                      focus:outline-none focus:ring-2 focus:ring-[#E14219] 
                      transition-all duration-200
                      ${errors[name] ? "border-red-500" : "border-gray-300"}
                      ${isSubmitting ? "bg-gray-100 cursor-not-allowed" : ""}
                    `}
                  />
                  {errors[name] && (
                    <p className="text-red-500 text-xs mt-1">{errors[name]}</p>
                  )}
                </div>
              ))}

              <div>
                <label className="block font-medium mb-1 text-sm text-gray-700">
                  Билдирүү
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  disabled={isSubmitting}
                  className={`
                    w-full border rounded-lg px-3 py-2 text-sm 
                    focus:outline-none focus:ring-2 focus:ring-[#E14219]
                    transition-all duration-200
                    ${errors.message ? "border-red-500" : "border-gray-300"}
                    ${isSubmitting ? "bg-gray-100 cursor-not-allowed" : ""}
                  `}
                />
                {errors.message && (
                  <p className="text-red-500 text-xs mt-1">{errors.message}</p>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="
                    px-4 py-2 text-sm font-medium text-gray-700 
                    border border-gray-300 rounded-lg
                    hover:bg-gray-50 transition-colors duration-200
                    disabled:opacity-50 disabled:cursor-not-allowed
                  "
                >
                  Жокко чыгаруу
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`
                    px-6 py-2 text-sm font-medium text-white rounded-lg
                    transition-all duration-200
                    ${
                      isSubmitting
                        ? "bg-[#FF8C6E] cursor-not-allowed"
                        : "bg-[#E14219] hover:bg-[#d13916] shadow-md shadow-[#FF8C6E]/70"
                    }
                  `}
                >
                  {isSubmitting ? "Жөнөтүлүүдө..." : "Жөнөтүү"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

// PropTypes для документации
ModalCommunication.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
  title: PropTypes.string,
  size: PropTypes.oneOf(["sm", "md", "lg", "xl", "full"]),
  showCloseButton: PropTypes.bool,
  showBackdrop: PropTypes.bool,
  closeOnBackdropClick: PropTypes.bool,
};

ModalCommunication.defaultProps = {
  onClose: null,
  title: "Байланышуу",
  size: "md",
  showCloseButton: true,
  showBackdrop: true,
  closeOnBackdropClick: true,
};

// ====================================================
// КАК ИСПОЛЬЗОВАТЬ ЭТОТ КОМПОНЕНТ:
// ====================================================
//
// 1. Импортируйте компонент:
//    import ModalCommunication from './ModalCommunication';
//
// 2. Добавьте состояние в ваш компонент:
//    const [isModalOpen, setIsModalOpen] = useState(false);
//
// 3. Добавьте кнопку для открытия:
//    <button onClick={() => setIsModalOpen(true)}>
//      Открыть форму
//    </button>
//
// 4. Используйте компонент:
//    <ModalCommunication
//      isOpen={isModalOpen}
//      onClose={() => setIsModalOpen(false)}
//      title="Ваш заголовок"        // опционально
//      size="lg"                   // опционально: sm, md, lg, xl, full
//      showCloseButton={true}      // опционально
//      showBackdrop={true}         // опционально
//      closeOnBackdropClick={true} // опционально
//    />
//
// 5. Особенности:
//    - Модалка автоматически блокирует скролл страницы
//    - Закрывается по кнопке ×, клику вне или клавише ESC
//    - Показывает toast-уведомления об успехе/ошибке
//    - Валидирует поля формы
//    - Блокирует форму во время отправки
//
// ====================================================

export default ModalCommunication;
