<<<<<<< HEAD:src/components/CardFeedback.jsx
import { Rating } from '@chepchik/react-rating';
import { Wicon } from '../assets/icons/Wicon';
import { Yicon } from '../assets/icons/Yicon';
import grayPerson from '../assets/icons/grayPerson.svg';

const CardFeedback = ({ comment, user }) => {
	return (
		<div>
			<div
				key={''}
				className='bg-white p-6 rounded-xl border shadow-sm text-left flex flex-col h-96'
			>
				<div className='flex gap-3 text-yellow-400'>
					<div className=''>
						<Rating
							value={3}
							placeholderValue={2}
							readonly={false}
							className=' [&>span]:!mx-0.5'
							emptySymbol={
								<span className='' style={{ color: '#ffcc00' }}>
									<Wicon />
								</span>
							}
							fullSymbol={
								<span style={{ color: '#ffcc00' }}>
									<Yicon />
								</span>
							}
						/>
					</div>
				</div>
				<div className='flex justify-start items-start w-full mt-4'>
					<p className='text-gray-700 leading-relaxed text-sm line-clamp-5'>
						{comment}
					</p>
				</div>
=======
import React from 'react';
import { IoStarSharp } from 'react-icons/io5';

const CardFeedback = ({ index, text, image, name, role }) => {
    return (
        <div>
            <div
                key={index}
                className="bg-white p-6 rounded-xl border shadow-sm text-left flex flex-col h-96"
            >
                <div className="flex gap-3 text-yellow-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div className="border border-gray rounded-full px-2.5 py-1" key={i}>
                            <span className="text-xl md:text-3xl">★</span>
                        </div>
                    ))}
                </div>
>>>>>>> dev2:src/features/marketing/components/CardFeedback.jsx

				<div className='flex items-center gap-3 mt-auto'>
					<img
						src={user.avatar ? user.avatar : grayPerson}
						alt={'profile'}
						className='w-16 h-16 rounded-full object-cover'
					/>
					<div>
						<h4 className='font-medium text-lg text-[#141619] leading-[32px]'>
							{user.fullName}
						</h4>
					</div>
				</div>
			</div>
		</div>
	);
};

<<<<<<< HEAD:src/components/CardFeedback.jsx
=======
                <p className="text-gray-700 leading-relaxed text-sm line-clamp-5">{text}</p>
                <div className="flex items-center gap-3 mt-auto">
                    <img src={image} alt={name} className="w-16 h-16 rounded-full object-cover" />
                    <div>
                        <h4 className="font-medium text-lg text-[#141619] leading-[32px]">
                            {name}
                        </h4>
                        <p className="font-normal font-[Suisse Intl] text-sm text-[#3E424A]">
                            {role}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

>>>>>>> dev2:src/features/marketing/components/CardFeedback.jsx
export default CardFeedback;
