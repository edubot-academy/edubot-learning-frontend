import { FaFacebook, FaInstagram, FaTwitter } from "react-icons/fa";
import { Link } from "react-router-dom";
import edubot from '../assets/images/edubot-logo.png';

const Footer = () => {
    return (
        <footer className="bg-[#0b1f3a] text-white py-12 px-4">
            <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

                <div className="mb-4">
                    <div className="flex items-center space-x-4">
                        <img src={edubot} alt="Edubot Logo" className="w-[150px] h-[100px] object-contain" />
                        <div className="leading-tight">
                            <h2 className="text-2xl font-bold text-orange-500">EDUBOT</h2>
                            <h3 className="text-xl font-semibold text-white">LEARNING</h3>
                        </div>
                    </div>
                    <p className="mt-14 text-base text-gray-300 leading-relaxed break-words">
                        Edubot - <br className="block sm:hidden" />
                        Образовательная <br className="block sm:hidden" />
                        платформа с актуальными <br className="block sm:hidden" />
                        курсами для начинающих <br className="block sm:hidden" />
                        и продвинутых.
                    </p>
                </div>
                <div className="mt-4">
                    <h3 className="text-lg font-semibold mb-4">НАВИГАЦИЯ</h3>
                    <ul className="space-y-2 text-gray-300 text-sm">
                        <li><Link to="/">Главная</Link></li>
                        <li><Link to="/about">О нас</Link></li>
                        <li><Link to="/courses">Курсы</Link></li>
                        <li><Link to="/contact">Контакты</Link></li>
                    </ul>
                </div>
                <div className="mt-4">
                    <h3 className="text-lg font-semibold mb-4">КОНТАКТЫ</h3>
                    <ul className="text-sm text-gray-300 space-y-2">
                        <li>edubot@gmail.com</li>
                        <li>+996 (500) 000 000</li>
                        <li>
                            <a
                                href="https://maps.google.com?q=г.Бишкек, ул.Турусбекова 109/1"
                                className="text-white no-underline hover:underline hover:decoration-purple-400"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                г.Бишкек, ул.Турусбекова 109/1
                            </a>
                        </li>
                    </ul>
                </div>
                <div className="mt-4">
                    <h3 className="text-lg font-semibold mb-2">МЫ В СЕТИ</h3>
                    <div className="flex space-x-4 text-2xl">
                        <FaTwitter className="hover:text-blue-400 cursor-pointer" />
                        <FaInstagram className="hover:text-pink-400 cursor-pointer" />
                        <FaFacebook className="hover:text-blue-600 cursor-pointer" />
                    </div>
                </div>
                <div className="sm:col-span-2 lg:col-start-2 lg:col-span-2 pt-8 space-y-4">
                    <h3 className="text-xl font-semibold text-center md:text-left">FAQ</h3>
                    <div className="space-y-4 text-sm text-gray-300">
                        <details className="border-b border-gray-700 pb-2">
                            <summary className="cursor-pointer flex justify-between items-center">
                                Как зарегистрироваться на курсе? <span>+</span>
                            </summary>
                        </details>
                        <details className="border-b border-gray-700 pb-2">
                            <summary className="cursor-pointer flex justify-between items-center">
                                Какие курсы предлагает Edubot? <span>+</span>
                            </summary>
                        </details>
                        <details className="border-b border-gray-700 pb-2">
                            <summary className="cursor-pointer flex justify-between items-center">
                                Как получить сертификат после завершения курса? <span>+</span>
                            </summary>
                        </details>
                        <details className="border-b border-gray-700 pb-2">
                            <summary className="cursor-pointer flex justify-between items-center">
                                Как связаться с поддержкой, если возникнут вопросы? <span>+</span>
                            </summary>
                        </details>
                    </div>
                </div>
            </div>
            <div className="w-full h-px bg-gray-600 mt-12 mb-6"></div>
            <p className="text-center text-sm text-white mt-10">
                © 2025 Edubot Learning. Все права защищены.
            </p>
        </footer>
    );
};

export default Footer;
