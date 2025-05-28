
import Logotip from "../assets/images/logotip.png"
import { Link } from 'react-router-dom'

const HeroStart = () => {
    return (
        <div>
            <section className="relative bg-[#003A45] text-white py-32 text-center"  >
                <div className="max-w-7xl mx-auto flex flex-col-reverse lg:flex-row items-center justify-between">

                    <div className="w-full lg:w-1/2 text-center lg:text-left">
                        <h1 className="font-inter font-semibold text-[48px] mb-6 animate-fade-in w-[835px] h-[232px]" >
                            Окуңуз, өнүгөңүз жана ийгиликке жетишиңиз — мунун баарын Edubot Learning менен ишке ашырыңыз!
                        </h1>

                        <p className="text-lg md:text-xl max-w-2xl mb-10">
                            Программалоо тилдерин жана код жазуу жөндөмдөрүн интерактивдүү сабактар аркылуу өздөштүрүңүз
                        </p>
                        <Link
                            to="/courses"
                            className=" absolute  w-[190px] h-[72px] bg-[#F78B31] text-white   font-inter px-8 py-3 rounded-full shadow-lg hover:bg-[#e57a28] transition transform hover:scale-105 flex items-center justify-center"
                        >
                            Баштоо
                        </Link>
                    </div>
                    <div className="w-full lg:w-1/2 flex justify-center lg:justify-end mb-10 lg:mb-0">
                        <img src={Logotip} alt="Edubot Logo" className="w-[500px] h-[450px]" />
                    </div>
                </div>

            </section>
        </div>
    )
}

export default HeroStart
