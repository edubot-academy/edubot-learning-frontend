import React from 'react';
import CardIcon from '../assets/icons/cardvektor.svg'


const Card = ({ img, title, description, star, price, ratingCount }) => {
  return (
     <div className="w-[450px] text-black bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
     
      <div className='pt-[29px] pb-[29px] px-[24px]'>
        <img src={img} alt={title} className="w-full h-[300px] object-cover rounded-[4px]" />

     
      <div className="p-4 flex flex-col flex-grow">
       
        <h3 className="font-suisse font-normal text-[20px] ">{title}</h3>

        
        <p className="text-gray-500 text-sm mb-3 line-clamp-2">
          {description}
        </p>

     
        <div className="flex items-center gap-2 mb-3 mt-[20px]">
          <div className="flex text-yellow-400">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i}>★</span>
            ))}
          </div>
          <span className="text-gray-500 text-sm">({ratingCount} рейтингов)</span>
        </div>

        
        <div className="flex gap-2 mb-4">
          <div className='flex'>
           
            <span className="px-3 py-1 text-xs rounded-full border flex gap-1">  <img className='w-[17px]' src={CardIcon} alt="" />новичок</span>
          </div>
          <span className="px-3 py-1 text-xs rounded-full border">22 всего часа</span>
          <span className="px-3 py-1 text-xs rounded-full border">155 лекций</span>
        </div>

      
        <div className="mt-auto">
          
          <div className='flex items-end gap-6 mt-[50px]'>
         <div>   
          <p className="text-sm text-gray-500">Цена</p>
            <p className="text-32px color-[#333333]font-bold">{price} сом</p></div>
          <button className="w-[250px] py-3 bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-lg font-semibold shadow hover:opacity-90 transition">
            Себетке кошуу
          </button>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default Card;
