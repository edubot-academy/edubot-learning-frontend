import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";

const Modal = ({
  isOpen,
  onClose,
  title,
  size = "md",
  showCloseButton = true,
  showBackdrop = true,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  initialFocus = true,
  children,
}) => {
  const [localIsOpen, setLocalIsOpen] = useState(isOpen);
  const modalRef = useRef(null);

  useEffect(() => {
    setLocalIsOpen(isOpen);
  }, [isOpen]);

  useEffect(() => {
    if (!localIsOpen || !closeOnEscape) return;

    const handleEscape = (e) => {
      if (e.key === "Escape" && onClose) {
        onClose();
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleEscape);

    if (initialFocus && modalRef.current) {
      modalRef.current.focus();
    }

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener("keydown", handleEscape);
    };
  }, [localIsOpen, onClose, closeOnEscape, initialFocus]);

  const handleBackdropClick = (e) => {
    if (
      e.target === e.currentTarget &&
      closeOnBackdropClick &&
      onClose
    ) {
      onClose();
    }
  };

  const handleCloseClick = () => {
    if (onClose) onClose();
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
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      {showBackdrop && (
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          aria-hidden="true"
        />
      )}

      <div
        ref={modalRef}
        className={`
          relative w-full ${sizeClasses[size] || sizeClasses.md}
          max-h-[90vh] overflow-y-auto
          bg-white rounded-xl shadow-2xl
          focus:outline-none
        `}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
        tabIndex={-1}
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
                  className="
                    text-gray-500 hover:text-black
                    font-bold text-2xl leading-none
                    transition-colors duration-200
                    focus:outline-none focus:ring-2 focus:ring-blue-500
                    rounded-full p-1
                    hover:bg-gray-100
                  "
                  aria-label="Закрыть"
                >
                  ×
                </button>
              )}
            </div>
          )}

          <div className="modal-content">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
  title: PropTypes.string,
  size: PropTypes.oneOf(["sm", "md", "lg", "xl", "full"]),
  showCloseButton: PropTypes.bool,
  showBackdrop: PropTypes.bool,
  closeOnBackdropClick: PropTypes.bool,
  closeOnEscape: PropTypes.bool,
  initialFocus: PropTypes.bool,
  children: PropTypes.node,
};

export default Modal;