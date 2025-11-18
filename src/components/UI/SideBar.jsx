import { Link, useLocation } from 'react-router-dom';
import Button from './Button';
import { FaTimes } from 'react-icons/fa';
import Test from '../../assets/icons/grayPerson.svg';
import BlackHeart from '../../assets/icons/baseHeart.svg';
import BlubIcon from '../../assets/icons/blub.svg';
import BellIcon from '../../assets/icons/bell.svg';
import BasketIcon from '../../assets/icons/baseBasket.svg';
import SettingIcon from '../../assets/icons/setting.svg';
import { useState } from 'react';

const SideBar = ({ menuOpen, setMenuOpen }) => {
	const [isUser, setisUser] = useState(false);

	const location = useLocation();
	const active = (path) =>
		location.pathname === path ? 'text-orange-500' : '';

	const linkClass =
		'relative hover:text-white hover:bg-[#f17e22]  m-0 pt-4 pb-4 pl-3 sm:text-lg md:text-xl rounded-md flex justify-start gap-[10px] w-full items-center ';

	return (
		<>
			{' '}
			<div
				className={`  fixed inset-0 z-50 w-full flex flex-row-reverse      ${
					menuOpen ? 'pointer-events-auto' : 'pointer-events-none'
				}
				`}
			>
				<div
					className={`
      flex-1 bg-black/50 transition-opacity duration-300  
      ${menuOpen ? 'opacity-100' : 'opacity-0'}
    `}
					onClick={() => setMenuOpen(false)}
				></div>

				<div
					className={`
      w-2/3 md:max-w-[393px] bg-white  h-full p-4 shadow-lg fixed  left-0
      transition-transform duration-300  overflow-y-auto
      ${menuOpen ? 'translate-x-0' : '-translate-x-full'}
    `}
				>
					<div className='flex justify-end mt-5 mr-2 '>
						<button
							onClick={() => setMenuOpen(false)}
							className='  text-gray-600 dark:text-gray-300'
						>
							<FaTimes className='text-2xl' />
						</button>
					</div>

					<div className='mt-8'>
						<div className='flex justify-between gap-1 pb-6 border-b border-gray-300 '>
							<div className='flex '>
								<img src={Test} alt='test' />
							</div>
							<button
								onClick={() => {
									setisUser(!isUser);
								}}
								className='border-2 bg-gray-400'
							>
								user
							</button>
							<div className='w-full flex items-center justify-center'>
								<Button variant='primary'>
									<Link
										to='/register'
										className='block w-full text-left text-gray-700 dark:text-gray-200 rounded-md    transition-colors'
									>
										Катталуу
									</Link>
								</Button>
							</div>
						</div>
						{isUser ? (
							<div className=''>
								<ul className='flex flex-col justify-between items-start'>
									<Link
										to='/mycourses'
										className={`${active('/mycourses')} ${linkClass}`}
									>
										<img src={BlubIcon} alt='' className='max-w-6 pb-1' />
										Менин курстарым
									</Link>
									<Link to='/b' className={`${active('/b')} ${linkClass}`}>
										<img src={BellIcon} alt='' className='max-w-6 pb-1' />
										Билдирүүлөр
									</Link>
									<Link
										to='/basket'
										className={`${active('/basket')} ${linkClass}`}
									>
										<img src={BasketIcon} alt='' className='max-w-6 pb-1' />
										Корзина
									</Link>
									<Link
										to='/favorite'
										className={`${active('/favorite')} ${linkClass}`}
									>
										<img src={BlackHeart} alt='' className='max-w-6 pb-1' />
										Избранные
									</Link>
									<Link
										to='/settings'
										className={`${active('/settings')} ${linkClass}`}
									>
										<img src={SettingIcon} alt='' className='max-w-6 pb-1' />
										Настройка
									</Link>
								</ul>
							</div>
						) : null}
						<div className={`${'flex flex-col  '} ${isUser ? 'mt-0' : 'mt-4'}`}>
							<Link
								to='/courses'
								className={`${active('/courses')} ${linkClass}`}
							>
								Курстар
							</Link>
							<Link to='/about' className={`${active('/about')} ${linkClass}`}>
								Биз жөнүндө
							</Link>
							<Link
								to='/contact'
								className={`${active('/contact')}  ${linkClass}`}
							>
								Байланышуу
							</Link>
							{isUser ? null : (
								<Link
									to='/register'
									className={`${active('/register')} ${linkClass}`}
								>
									Катталуу
								</Link>
							)}
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default SideBar;
