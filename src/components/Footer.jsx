import { FaFacebook, FaInstagram, FaTwitter } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useState } from "react";
import edubot from '../../public/edubot.png'


const FAQItem = ({ question, answer, isOpen, onClick }) => {
  return (
    <div className="border-b border-gray-700 pb-2">
      <button
        onClick={onClick}
        className="w-full flex justify-between items-center text-left focus:outline-none"
      >
        <span>{question}</span>
        <span className="text-xl">{isOpen ? "−" : "+"}</span>
      </button>

      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
          isOpen ? "max-h-40 opacity-100 mt-2" : "max-h-0 opacity-0"
        }`}
      >
        <p className="text-gray-400 text-sm leading-relaxed">{answer}</p>
      </div>
    </div>
  );
};

const FAQ = () => {
  const faqData = [
    {
      q: "Как зарегистрироваться на курсы?",
      a: "Чтобы зарегистрироваться, создайте аккаунт, выберите курс и нажмите «Записаться».",
    },
    {
      q: "Какие курсы предлагает Edubot?",
      a: "У нас есть курсы по IT, дизайну, маркетингу, языкам и другим направлениям.",
    },
    {
      q: "Как получить сертификат после завершения курса?",
      a: "После успешного завершения курса и сдачи теста, вы получите сертификат в личном кабинете.",
    },
    {
      q: "Как связаться с поддержкой, если возникнут вопросы?",
      a: "Вы можете написать нам на email: edubot@gmail.com или позвонить по телефону +996 (500) 000 000.",
    },
  ];

  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div className="sm:col-span-2 lg:col-start-2 lg:col-span-2 pt-8 space-y-4">
      <h3 className="text-xl font-semibold text-center md:text-left">FAQ</h3>
      <div className="space-y-4 text-sm text-gray-300">
        {faqData.map((item, index) => (
          <FAQItem
            key={index}
            question={item.q}
            answer={item.a}
            isOpen={openIndex === index}
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
          />
        ))}
      </div>
    </div>
  );
};

const Footer = () => {
  return (
    <footer className="bg-[#0b1f3a] text-white py-12 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

        <div className="mb-4">
          <div className="flex items-center space-x-4">
            <img
              src={edubot}
              alt="Edubot Logo"
              className="w-[150px] h-[100px] object-contain"
            />
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
            <li>
              <Link to="/">Главная</Link>
            </li>
            <li>
              <Link to="/about">О нас</Link>
            </li>
            <li>
              <Link to="/courses">Курсы</Link>
            </li>
            <li>
              <Link to="/contact">Контакты</Link>
            </li>
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

        <FAQ />
      </div>

      <div className="w-full h-px bg-gray-600 mt-12 mb-6"></div>
      <p className="text-center text-sm text-white mt-10">
        © 2025 Edubot Learning. Все права защищены.
      </p>
    </footer>
  );
};

export default Footer;
