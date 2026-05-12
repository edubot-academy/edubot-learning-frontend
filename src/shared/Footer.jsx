import { Link } from 'react-router-dom';
import { FaInstagram } from 'react-icons/fa';
import { FaTelegramPlane } from 'react-icons/fa';
import { IoIosCall } from 'react-icons/io';

const Footer = () => {
    return (
        <footer className="bg-white text-black dark:bg-[#141619] dark:text-[#E8ECF3] py-12 px-4 sm:px-6 lg:px-12 border-t border-gray-300 dark:border-[#2A2E35] p-5">
            <div className="mx-auto flex max-w-7xl flex-col items-start space-y-12">
                <h2 className="hidden md:block text-5xl font-normal text-center tracking-wide w-full">
                    <span className="font-extrabold text-[#EA580C]">EDUBOT </span>
                    LEARNING
                </h2>

                <div className="w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-20">
                    <div className="flex flex-col md:flex-row gap-16">
                        <div>
                            <h3 className="font-bold text-base mb-3 text-black dark:text-[#E8ECF3]">
                                НАВИГАЦИЯ
                            </h3>
                            <ul className="space-y-1 text-gray-700 dark:text-[#a6adba] text-sm">
                                <li>
                                    <Link to="/courses">Курстар</Link>
                                </li>
                                <li>
                                    <Link to="/about">Биз жөнүндө</Link>
                                </li>
                                <li>
                                    <Link to="/contact">Байланыш</Link>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-bold text-base mb-3 text-black dark:text-[#E8ECF3]">
                                БАЙЛАНЫШ ҮЧҮН
                            </h3>
                            <ul className="space-y-1 text-gray-700 dark:text-[#a6adba] text-sm">
                                <li>
                                    <a
                                        className="flex items-center gap-1"
                                        href="https://www.instagram.com/edubot.company/"
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        {' '}
                                        <FaInstagram /> edubot.company
                                    </a>
                                </li>
                                <li>
                                    <a
                                        className="flex items-center gap-1"
                                        href="https://t.me/edubot_learning"
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        <FaTelegramPlane /> edubot_learning
                                    </a>
                                </li>
                                <li>
                                    <a
                                        className="flex items-center gap-1"
                                        href="https://wa.me/996221004976"
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        <IoIosCall /> +996 (221) 004 976
                                    </a>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-bold text-base mb-3 text-black dark:text-[#E8ECF3]">
                                БИЗДИН ДАРЕК
                            </h3>
                            <p className="text-sm text-gray-700 dark:text-[#a6adba]">
                                Бишкек ш., Ахунбаева 129B
                            </p>
                        </div>
                    </div>

                    <div>
                        <a
                            href="https://learning.edubot.it.com"
                            target="_blank"
                            rel="noreferrer"
                            className="block rounded-xl border border-gray-200 bg-white p-2 transition hover:border-[#EA580C] focus:outline-none focus:ring-2 focus:ring-[#EA580C] dark:border-gray-700"
                            aria-label="EduBot Learning сайтын ачуу"
                        >
                            <img
                                src="/edubot-learning-qr.png"
                                alt="EduBot Learning сайты үчүн QR"
                                className="h-[120px] w-[120px] object-contain"
                            />
                        </a>
                    </div>
                </div>

                <p className="w-full text-center text-xs text-gray-600 dark:text-[#a6adba] mt-16">
                    © 2025 EduBot Learning. Бардык укуктар сакталган.
                </p>
            </div>
        </footer>
    );
};

export default Footer;
