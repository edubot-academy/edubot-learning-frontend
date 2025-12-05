import whatsapp from '@assets/icons/whatsapp_icon.svg';

const StickyButton = () => {
    const phoneNumber = '+996501503452';
    const whatsappUrl = `https://wa.me/${phoneNumber}`;

    return (
        <div>
            <a
                href={whatsappUrl}
                className="fixed top-1/2 right-6 transform -translate-y-1/2 w-16 h-16 rounded-full flex items-center justify-center z-50 hover:scale-110 transition-transform duration-300"
                style={{
                    backgroundColor: '#FFC392',
                    animation: 'pulse-glow 2s infinite, rotate 4s linear infinite',
                    boxShadow: '0 4px 20px rgba(255, 195, 146, 0.3)',
                }}
                target="_blank"
                rel="noopener noreferrer"
            >
                <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: '#FFF7ED' }}
                >
                    <img src={whatsapp} alt="WhatsApp" className="w-6 h-6" />
                </div>
            </a>

            <style>
                {`
                    @keyframes pulse-glow {
                        0% { 
                            box-shadow: 0 0 0 0 rgba(255, 195, 146, 0.7); 
                        }
                        70% { 
                            box-shadow: 0 0 0 15px rgba(255, 195, 146, 0); 
                        }
                        100% { 
                            box-shadow: 0 0 0 0 rgba(255, 195, 146, 0); 
                        }
                    }
                    @keyframes rotate {
                        from { 
                            transform: rotate(0deg); 
                        }
                        to { 
                            transform: rotate(360deg); 
                        }
                    }
                `}
            </style>
        </div>
    );
};

export default StickyButton;
