import { Link } from 'react-router-dom';
import { FaInstagram } from 'react-icons/fa';
import { FaTelegramPlane } from 'react-icons/fa';
import { IoIosCall } from 'react-icons/io';
import { getWhatsAppUrl, SUPPORT_CONTACT } from '@shared/config/support';

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
                                        href={SUPPORT_CONTACT.instagramUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        <FaInstagram /> {SUPPORT_CONTACT.instagramHandle.replace('@', '')}
                                    </a>
                                </li>
                                <li>
                                    <a
                                        className="flex items-center gap-1"
                                        href={SUPPORT_CONTACT.telegramUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        <FaTelegramPlane /> {SUPPORT_CONTACT.telegramHandle.replace('@', '')}
                                    </a>
                                </li>
                                <li>
                                    <a
                                        className="flex items-center gap-1"
                                        href={getWhatsAppUrl()}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        <IoIosCall /> {SUPPORT_CONTACT.phoneDisplay}
                                    </a>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-bold text-base mb-3 text-black dark:text-[#E8ECF3]">
                                БИЗДИН ДАРЕК
                            </h3>
                            <p className="text-sm text-gray-700 dark:text-[#a6adba]">
                                {SUPPORT_CONTACT.addressShort}
                            </p>
                        </div>
                    </div>

                    <div>
                        <a
                            href={SUPPORT_CONTACT.websiteUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="block rounded-xl border border-gray-200 bg-white p-2 transition hover:border-[#EA580C] focus:outline-none focus:ring-2 focus:ring-[#EA580C] dark:border-gray-700"
                            aria-label={`${SUPPORT_CONTACT.brandName} сайтын ачуу`}
                        >
                            <img
                                src={SUPPORT_CONTACT.qrImageSrc}
                                alt={`${SUPPORT_CONTACT.brandName} сайты үчүн QR`}
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
