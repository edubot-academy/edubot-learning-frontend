import React, { useState, useRef } from "react";
import DownArrow from "../../assets/icons/downArrow.svg";
import ReelsIcon from "../../assets/icons/reelsIcon.svg";
import ArticleIcon from "../../assets/icons/ArticleIcon.svg";
import TestIcon from "../../assets/icons/testIcon.svg";
import ChooseIcon from "../../assets/icons/chooseIcon.svg";
import { HiOutlineComputerDesktop } from "react-icons/hi2";

const IntroductionAfterRegistr = () => {
  const introductions = [
    {
      id: 1,
      title: "Введение",
      lectures: "6 lectures • 20min",
      items: [
        { topText: "1 Лекция", bottomIcon: ReelsIcon, bottomText: "3 min" },
        { topText: "Статья", bottomIcon: ArticleIcon, bottomText: "3 min" },
        { topText: "Тест", bottomIcon: TestIcon, bottomText: "3 min" },
        {
          topText: "Написать код",
          bottomIcon: <HiOutlineComputerDesktop className="w-5 h-5" />,
          bottomText: "",
        },
      ],
    },
    {
      id: 2,
      title: "Введение",
      lectures: "4 lectures • 15min",
      items: [
        { topText: "1 Лекция", bottomIcon: ReelsIcon, bottomText: "3 min" },
        { topText: "Статья", bottomIcon: ArticleIcon, bottomText: "3 min" },
        { topText: "Тест", bottomIcon: TestIcon, bottomText: "3 min" },
        {
          topText: "Написать код",
          bottomIcon: <HiOutlineComputerDesktop className="w-5 h-5" />,
          bottomText: "",
        },
      ],
    },
  ];

  const [openIds, setOpenIds] = useState([]);
  const contentRefs = useRef({});

  const toggleOpen = (id) => {
    if (openIds.includes(id)) {
      setOpenIds(openIds.filter((openId) => openId !== id));
    } else {
      setOpenIds([...openIds, id]);
    }
  };

  return (
    <div className="mx-auto rounded-sm w-full max-w-[613px] space-y-0">
      {introductions.map((intro) => (
        <div key={intro.id} className="border border-[#DFE1E5] bg-white ">
          <button
            onClick={() => toggleOpen(intro.id)}
            className="flex justify-between items-center w-full px-4 py-3 text-left transition hover:bg-gray-50"
          >
            <div className="flex items-center gap-2 text-[#EA580C] font-semibold">
              <img src={DownArrow} alt="" className="w-4 h-4" />
              {intro.title}
            </div>
            <span className="text-gray-500 text-sm">{intro.lectures}</span>
          </button>

          <div
            ref={(el) => (contentRefs.current[intro.id] = el)}
            style={{
              maxHeight: openIds.includes(intro.id)
                ? contentRefs.current[intro.id]?.scrollHeight
                : 0,
              transition: "max-height 0.3s ease",
              overflow: "hidden",
            }}
          >
            <div className="border-t !border-white bg-white px-4 py-2 w-full space-y-2">
              {intro.items.map((item, idx) => (
                <div key={idx} className="bg-white w-full flex flex-col">
                  <div className="flex items-start gap-4 py-2">
                    <img
                      src={ChooseIcon}
                      alt="choose"
                      className="w-5 h-5 mt-2"
                    />
                    <div className="flex flex-col w-full">
                      <p className="text-gray-700 text-sm font-semibold">
                        {item.topText}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {typeof item.bottomIcon === "string" ? (
                          <img
                            src={item.bottomIcon}
                            alt="icon"
                            className="w-4 h-4"
                          />
                        ) : (
                          <span className="w-5 h-5">{item.bottomIcon}</span>
                        )}
                        {item.bottomText && (
                          <span className="text-gray-500 text-xs">
                            {item.bottomText}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {idx !== intro.items.length - 1 && (
                    <div className="w-full border-t border-gray-200" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default IntroductionAfterRegistr;
