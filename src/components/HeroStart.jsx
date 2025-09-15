
import Logotip from "../assets/images/logotip-hero.png"
import Vektor from "../assets/images/vector.png"

import { Link } from 'react-router-dom'

const HeroStart = () => {
    return (
        <div>

            <section className="relative bg-[--edubot-darkgreen] text-white py-16 sm:py-24 lg:py-32 text-center lg:text-left"  >
                
                <div className="max-w-7xl mx-auto flex flex-col-reverse lg:flex-row items-center justify-between">
                    <div className="w-full lg:w-1/2 text-center lg:text-left px-4">
                        <h1 className="font-inter font-semibold text-[24px] sm:text-[32px] md:text-[40px] lg:text-[48px] leading-snug mb-6 animate-fade-in h-[]w-[350px] sm:w-[500px] lg:w-[835px]">
                            Окуңуз, өнүгөңүз жана ийгиликке жетишиңиз — мунун баарын Edubot Learning менен ишке ашырыңыз!
                        </h1>

                        <p className="text-base sm:text-lg md:text-xl max-w-full md:max-w-2xl mb-8">
                            Программалоо тилдерин жана код жазуу жөндөмдөрүн интерактивдүү сабактар аркылуу өздөштүрүңүз
                        </p>

                        <Link
                            to="/courses"
                            className="inline-block w-[160px] sm:w-[190px] h-[56px] sm:h-[72px] bg-[#F78B31] text-white font-inter text-[16px] sm:text-[20px] px-6 py-3 rounded-[16px] sm:rounded-[20px] shadow-lg hover:bg-[#e57a28] transition transform hover:scale-105 flex items-center justify-center mx-auto lg:mx-0"
                        >
                            Баштоо
                        </Link>
                    </div>
                    <div className="w-full lg:w-1/2 flex justify-center lg:justify-end mb-6 sm:mb-8 lg:mb-0 relative">

                        <img
                            src={Vektor}
                            alt="vector"
                            className="absolute w-[250px] sm:w-[400px] md:w-[520px] h-auto top-10 right-0 opacity-40 z-0"
                        />

                        <img
                            src={Logotip}
                            alt="Edubot Logo"
                            className="w-[285px] sm:w-[400px] lg:w-[500px] h-auto relative z-10"
                        />

                    </div>
                </div>

            </section>
        </div>
    )
}

export default HeroStart
