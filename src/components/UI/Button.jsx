import React from "react";
import { FaArrowRight } from "react-icons/fa6";


const Button = ({
    children,
    variant = "primary",
    disabled = false,
    icon = false,
    onClick,
}) => {
    const base =
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium text-base px-6 py-3 transition-all duration-300";

    const styles = {
        primary: `
      bg-gradient-to-b from-[#FF8C6E] to-[#E14219]
      text-white shadow-[0_4px_10px_rgba(225,66,25,0.3)]
      hover:from-[#C2410C] hover:to-[#C2410C] hover:shadow-[0_6px_14px_rgba(225,66,25,0.4)]
      active:scale-95
      disabled:bg-none disabled:bg-[#DFE1E5] disabled:text-[#3E424A] disabled:shadow-none disabled:cursor-not-allowed
    `,
        secondary: `
      border border-black text-black
      hover:bg-[#EA580C] hover:border-[#EA580C] hover:text-white
      active:scale-95
      disabled:bg-transparent disabled:border-[#C5C9D1] disabled:text-[#C5C9D1] disabled:cursor-not-allowed
    `,
    };

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`${base} ${styles[variant]} ${disabled ? "opacity-80" : ""
                }`}
        >
            {children}
            {icon && <FaArrowRight size={18} />}
        </button>
    );
};

export default Button;
