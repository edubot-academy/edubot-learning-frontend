import React, { useState } from "react";
import { IoCheckmark } from "react-icons/io5";

const CourseHeader = ({ course, progress, enrolled }) => {
    const [numberButten, setNumberButten] = useState(1);
    
    return (
        <div className="w-full text-white min-h-[380px] py-12 px-6 md:px-12">
            <div className="mx-auto w-[1280px]">
                <div className="flex justify-between items-start max-w-[1280px] text-[--edubot-dark]">
                    <div className="">
                        <h1 className="font-bold mb-[12px] text-[40px]">{course?.title || "Курс"}</h1>
                        <p className="leading-relaxed whitespace-pre-line max-w-[681px] font-normal text-[16px]">
                            {course?.description || "Курстун сүрөттөмөсү"}
                        </p>
                    </div>

                    {course?.instructor && (
                        <div className="flex items-center gap-4">
                            <div>
                                <p className="font-semibold text-[24px] text-[--edubot-green]">
                                    {course.instructor.fullName || "Инструктор"}
                                </p>
                                <p className="font-medium text-[14px]">
                                    {course.instructor.bio || "UX/UI Designer"}
                                </p>
                            </div>
                            {course.instructor.avatar ? (
                                <img
                                    src={course.instructor.avatar}
                                    alt={course.instructor.fullName}
                                    className="w-12 h-12 rounded-full"
                                />
                            ) : (
                                <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-xl font-bold text-white">
                                    {course.instructor.fullName?.charAt(0) || "I"}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {enrolled && (
                    <div className="max-w-6xl mx-auto my-6">
                        <div className="w-full bg-gray-300 h-4 rounded-full overflow-hidden">
                            <div
                                className="bg-green-500 h-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                        <p className="text-sm text-white mt-1 text-right">{progress}% бүттү</p>
                    </div>
                )}

                <div className="flex mt-[52px] mb-[36px] gap-[39px] items-center justify-center">
                    <button
                        onClick={() => setNumberButten(1)}
                        className={`text-[--edubot-dark] w-[233px] h-[60px] rounded-lg border ${numberButten === 1 ? 'border-[--edubot-green]' : 'border'
                            }`}
                    >
                        Cүрөттөмө
                    </button>
                    <button
                        onClick={() => setNumberButten(2)}
                        className={`text-[--edubot-dark] w-[233px] h-[60px] rounded-lg border ${numberButten === 2 ? 'border-[--edubot-green]' : 'border'
                            }`}
                    >
                        Инструктор
                    </button>
                    <button
                        onClick={() => setNumberButten(3)}
                        className={`text-[--edubot-dark] w-[233px] h-[60px] rounded-lg border ${numberButten === 3 ? 'border-[--edubot-green]' : 'border'
                            }`}
                    >
                        Окуу планы
                    </button>
                    <button
                        onClick={() => setNumberButten(4)}
                        className={`text-[--edubot-dark] w-[233px] h-[60px] rounded-lg border ${numberButten === 4 ? 'border-[--edubot-green]' : 'border'
                            }`}
                    >
                        Сын-пикирлер
                    </button>
                </div>

                <hr />

                <div className="my-[39px]">
                    <p className="font-semibold text-[24px] text-[--edubot-green]">Курстан сиз эмнелерди үйрөнөсүз</p>
                    <div className="flex h-[283px] text-black mt-[24px] gap-[48px]" >
                        <div className="">
                            <div className="flex mb-[14px]">
                                <IoCheckmark className="text-[--edubot-orange] mr-[10px] w-[32px] h-[32px] " />
                                <p className="w-[440px] font-normal text-[20px] flex-wrap">Figma аркылуу UX-дизайнер болуп иштөөнү кантип баштоо керек</p>
                            </div>
                            <div className="flex mb-[14px]">
                                <IoCheckmark className="text-[--edubot-orange] mr-[10px] w-[32px] h-[32px] " />
                                <p className="w-[440px] font-normal text-[20px] flex-wrap">Жөнөкөй каркастарды (вайрфреймдерди) кантип түзсө болот</p>
                            </div>
                            <div className="flex mb-[14px]">
                                <IoCheckmark className="text-[--edubot-orange] mr-[10px] w-[32px] h-[32px] " />
                                <p className="w-[440px] font-normal text-[20px] flex-wrap">Жөнөкөй каркастарды (вайрфреймдерди) кантип түзсө болот</p>
                            </div>
                            <div className="flex mb-[14px]">
                                <IoCheckmark className="text-[--edubot-orange] mr-[10px] w-[32px] h-[32px] " />
                                <p className="w-[440px] font-normal text-[20px] flex-wrap">Жөнөкөй каркастарды (вайрфреймдерди) кантип түзсө болот</p>
                            </div>
                        </div>
                        <div className="">
                            <div className="flex mb-[14px]">
                                <IoCheckmark className="text-[--edubot-orange] mr-[10px] w-[32px] h-[32px] " />
                                <p className="w-[440px] font-normal text-[20px] flex-wrap">Жөнөкөй каркастарды (вайрфреймдерди) кантип түзсө болот</p>
                            </div>
                            <div className="flex mb-[14px]">
                                <IoCheckmark className="text-[--edubot-orange] mr-[10px] w-[32px] h-[32px] " />
                                <p className="w-[440px] font-normal text-[20px] flex-wrap">Жөнөкөй каркастарды (вайрфреймдерди) кантип түзсө болот</p>
                            </div>
                            <div className="flex mb-[14px]">
                                <IoCheckmark className="text-[--edubot-orange] mr-[10px] w-[32px] h-[32px] " />
                                <p className="w-[440px] font-normal text-[20px] flex-wrap">Жөнөкөй каркастарды (вайрфреймдерди) кантип түзсө болот</p>
                            </div>
                            <div className="flex mb-[14px]">
                                <IoCheckmark className="text-[--edubot-orange] mr-[10px] w-[32px] h-[32px] " />
                                <p className="w-[440px] font-normal text-[20px] flex-wrap">Жөнөкөй каркастарды (вайрфреймдерди) кантип түзсө болот</p>
                            </div>
                        </div>
                    </div>
                </div>

                <hr />
            </div>
        </div>
    );
};

export default CourseHeader;