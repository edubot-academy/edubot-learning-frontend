    const TopCards = ({ img, title, description, star, ratingCount }) => {
    return (
        <div className="w-full max-w-[320px] h-[400px] bg-white text-black rounded-xl p-4 shadow-lg flex flex-col justify-between">
        {img && (
            <img
            src={img}
            alt={title}
            className="w-full h-40 object-cover rounded-lg mb-4"
            />
        )}

        <div>
            <h3 className="text-base font-semibold mb-2">{title}</h3>
            <p className="text-sm text-gray-700 mb-2">{description}</p>
            
            {/* Блок рейтинга */}
            <div className="flex items-center gap-2 mb-2">
            {star && (
                <img src={star} alt="звезда" className="w-8 h-8" />
            )}
            <span className="text-sm ">{ratingCount} рейтингов</span>
            </div>

            {/* Новый текст под рейтингом */}
            <p className="text-xs text-gray-500 mb-4">
            22 всего часа. 155 лекций. Новичок
            </p>
        </div>

        {/* Блок с ценой и кнопкой */}
        <div className="flex justify-between items-center ">
            <span className=" font-semibold text-lg">11000 сом</span>
            <button className="bg-orange-500 text-white text-sm px-4 py-2 rounded-[5px] hover:bg-orange-600 transition">
            Подробнее
            </button>
        </div>
        </div>
    )
    }

    export default TopCards
