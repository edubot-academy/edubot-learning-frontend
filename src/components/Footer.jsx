import React from "react";
import { Link } from "react-router-dom";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";

const Footer = () => {
    return (
        <footer className="bg-gray-800 text-white py-8">
            <div className="max-w-6xl mx-auto px-6 text-center">
                <div className="flex justify-center space-x-6 mb-4">
                    <FaFacebook className="text-xl hover:text-blue-400 cursor-pointer" />
                    <FaTwitter className="text-xl hover:text-blue-300 cursor-pointer" />
                    <FaInstagram className="text-xl hover:text-pink-400 cursor-pointer" />
                    <FaLinkedin className="text-xl hover:text-blue-500 cursor-pointer" />
                </div>
                <div className="mb-4">
                    <Link to="/about" className="text-gray-400 hover:text-white mx-3">About</Link>
                    <Link to="/privacy" className="text-gray-400 hover:text-white mx-3">Privacy Policy</Link>
                    <Link to="/faq" className="text-gray-400 hover:text-white mx-3">FAQs</Link>
                </div>
                <p className="text-gray-400">&copy; {new Date().getFullYear()} Edubot Learning. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;
