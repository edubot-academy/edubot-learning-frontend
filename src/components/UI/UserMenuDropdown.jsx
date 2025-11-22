import React from "react";
import { Link } from "react-router-dom";
import Lamp from "../../assets/icons/lamp.svg";
import Bell from "../../assets/icons/call.svg";
import Basket from "../../assets/icons/basket.svg";
import Heart from "../../assets/icons/heart.svg";
import Setting from "../../assets/icons/seting.svg";
import Profile from "../../assets/icons/profile.svg";
import ArrowRight from "../../assets/icons/arrowRight.svg";

function UserMenuDropdown({ user, onClose }) {
  const getDashboardPath = () => {
    if (!user) return "/dashboard";

    switch (user.role) {
      case "student":
        return "/student";
      case "instructor":
        return "/instructor";
      case "admin":
        return "/admin";
      case "assistant":
        return "/assistant";
      default:
        return "/dashboard";
    }
  };

  const dashboardPath = getDashboardPath();

  const menuItemsTop = [
    { label: "Менин курстарым", icon: Lamp },
    { label: "Билдирүүлөр", icon: Bell },
    { label: "Корзина", icon: Basket },
    { label: "Избранные", icon: Heart },
    { label: "Настройка", icon: Setting },
  ];

  const menuItemsBottom = [
    { label: "Курстар жөнүндө", path: "/courses" },
    { label: "Биз жөнүндө", path: "/about" },
    { label: "Байланышуу", path: "/contact" },
  ];

  const handleItemClick = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="group/dropdown">
      <div className="w-[17rem] sm:w-[15rem] bg-white mt-[30px] ml-[20px] rounded-[0.50rem] shadow-xl border border-gray-200 transition-all duration-300 ease-in-out">
        <Link to={dashboardPath} onClick={handleItemClick} className="block">
          <div className="flex items-center justify-between px-[1.25rem] py-[1rem] hover:bg-gray-50 transition-colors cursor-pointer">
            <div className="flex items-center gap-[0.75rem]">
              <img
                src={Profile}
                alt="Profile"
                className="w-[2.9rem] h-[2.9rem] sm:w-[2.5rem] sm:h-[2.5rem] rounded-full"
              />
              <div>
                <h3 className="text-[1rem] sm:text-[0.9rem] font-semibold text-[#141619]">
                  {user.fullName}
                </h3>
                <p className="text-[0.80rem] sm:text-[0.75rem] text-[#208D28]">
                  Идентифицированный
                </p>
                {user?.role && (
                  <p className="text-[0.70rem] text-gray-500 capitalize">
                    {user.role}
                  </p>
                )}
              </div>
            </div>
            <img
              src={ArrowRight}
              alt="Arrow"
              className="w-[1.6rem] sm:w-[1.4rem] mr-[-10px]"
            />
          </div>
        </Link>

        <div className="w-full h-[0.06rem] bg-gray-200 my-[0.4rem]" />

        <div className="w-[18rem] sm:w-[16rem] items-center ml-[30px] mb-6">
          <div>
            {menuItemsTop.map((item, index) => (
              <div
                key={index}
                className="
          w-[200px] sm:w-[180px]
          h-[50px] sm:h-[45px]
          flex items-center gap-[0.8rem]
          px-[1.25rem] sm:px-[1rem] py-[0.85rem] sm:py-[0.7rem]
          cursor-pointer
          text-[0.85rem] sm:text-[0.8rem]
          text-gray-800
          hover:bg-[#EA580C] hover:text-white
          transition-colors duration-200
          rounded-lg
        "
              >
                <img
                  src={item.icon}
                  alt=""
                  className="w-[1.2rem] sm:w-[1.1rem]"
                />
                <span className="whitespace-nowrap overflow-hidden text-ellipsis">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-[0.35rem]">
            {menuItemsBottom.map((item, index) => (
              <div
                key={index}
                className="
          h-[50px] sm:h-[45px]
          w-[200px] sm:w-[180px]
          cursor-pointer 
          text-[0.85rem] sm:text-[0.8rem]
          px-[1.25rem] sm:px-[1rem] 
          py-[0.85rem] sm:py-[0.7rem]
          transition-colors duration-200
          rounded-lg
          hover:bg-[#EA580C] 
          hover:text-white
          flex 
          items-center 
          justify-start
          pl-[1.25rem] sm:pl-[1rem]
        "
              >
                {item.label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserMenuDropdown;
