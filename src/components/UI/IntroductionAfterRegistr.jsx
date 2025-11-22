import React from "react";

function UserMenuDropdown() {
  const menuItemsTop = [
    { label: "Менин курстарым", icon: "" },
    { label: "Билдирүүлөр", icon: "" },
    { label: "Корзина", icon: "" },
    { label: "Избранные", icon: "" },
    { label: "Настройка", icon: "" },
  ];

  const menuItemsBottom = [
    { label: "Курстар жөнүндө", active: true },
    { label: "Биз жөнүндө" },
    { label: "Байланышуу" },
  ];

  return (
    <div className="group/dropdown w-[30rem]">
      <div className="w-[25rem] bg-white rounded-[0.75rem] shadow-xl border border-gray-200">
        {/* PROFILE HEADER */}
        <div className="flex items-center justify-between px-[1.25rem] py-[1rem]">
          <div className="flex items-center gap-[0.75rem]">
            <img
              src=""
              alt="Profile"
              className="w-[2.8rem] h-[2.8rem] rounded-full"
            />
            <div>
              <h3 className="text-[1rem] font-semibold text-[#141619]">
                Аяна Табалдиева
              </h3>
              <p className="text-[0.85rem] text-gray-500">Идентифицированный</p>
            </div>
          </div>
          <img src="" alt="Arrow" className="w-[1.2rem] opacity-70" />
        </div>

        {/* LINE */}
        <div className="w-full h-[0.06rem] bg-gray-200 my-[0.4rem]" />

        {/* COMBINED MENU ITEMS */}
        <div className="mx-4">
          {/* COMBINED ITEMS COMPONENT */}
          <div className="w-[20rem] mx-auto flex flex-col items-center ml-[20px]">
            {/* TOP ITEMS WITH ICONS */}
            <div>
              {menuItemsTop.map((item, index) => (
                <div
                  key={index}
                  className="
                    h-[50px]
                    flex items-center gap-[0.8rem]
                    px-[1.25rem] py-[0.85rem]
                    cursor-pointer
                    text-[0.85rem]
                    text-gray-800
                    hover:bg-[#EA580C] hover:text-white
                    transition-colors
                    rounded-lg
                  "
                >
                  <img src={item.icon} alt="" className="w-[1.2rem]" />
                  <span className="whitespace-nowrap overflow-hidden text-ellipsis">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>

            {/* BOTTOM SECTION */}
            <div className="mt-[0.35rem]">
              {menuItemsBottom.map((item, index) => (
                <div
                  key={index}
                  className="
                    h-[50px] 
                    cursor-pointer 
                    text-[0.85rem] 
                    px-[1.25rem] 
                    py-[0.85rem] 
                    transition-colors 
                    rounded-lg
                    hover:bg-[#EA580C] 
                    hover:text-white
                    flex 
                    items-center 
                    justify-start
                  "
                >
                  {item.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserMenuDropdown;
