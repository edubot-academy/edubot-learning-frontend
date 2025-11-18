import { Link, useLocation } from 'react-router-dom';
import Button from './Button';
import { FaTimes } from 'react-icons/fa';
import Person from '../../assets/icons/grayPerson.svg';
import BlackHeart from '../../assets/icons/baseHeart.svg';
import BlubIcon from '../../assets/icons/blub.svg';
import BellIcon from '../../assets/icons/bell.svg';
import BasketIcon from '../../assets/icons/baseBasket.svg';
import SettingIcon from '../../assets/icons/setting.svg';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

const SideBar = ({ setMenuOpen, setPosition }) => {
	const { user } = useContext(AuthContext);

	const location = useLocation();
	const active = (path) =>
		location.pathname === path ? 'text-orange-500' : '';

	const linkClass =
		'relative hover:text-white hover:bg-[#f17e22]  m-0 pt-4 pb-4 pl-3 sm:text-lg md:text-xl rounded-md flex justify-start gap-[10px] w-full items-center ';

	return (
		<>
			<>
				<div className='flex justify-end mt-5 mr-2 '>
					<button
						onClick={() => {
							setMenuOpen(false);
							setPosition(false);
						}}
						className='  text-gray-600 dark:text-gray-300'
					>
						<FaTimes className='text-2xl' />
					</button>
				</div>

				<div className='mt-8'>
					<div className='flex justify-between gap-1 pb-6 border-b border-gray-300 '>
						<div className='flex '>
							<img src={Person} alt='Person' />
						</div>

						{user !== null ? (
							<div className='w-full flex items-center justify-between ml-5'>
								<div className='flex flex-col items-start'>
									<h2 className='text-xl font-semibold'>{user.fullName}</h2>
									<span className='text-[#208D28]'>Идентифицированный</span>
								</div>
							</div>
						) : (
							<div className='w-full flex  items-center justify-center'>
								<Button variant='primary'>
									<Link
										to='/register'
										className='block w-full px-5 text-left text-gray-700 dark:text-gray-200 rounded-md    transition-colors'
									>
										Катталуу
									</Link>
								</Button>
							</div>
						)}
					</div>
					{user !== null ? (
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
					<div
						className={`${'flex flex-col  '} ${
							user !== null ? 'mt-0' : 'mt-4'
						}`}
					>
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
						{user !== null ? null : (
							<Link
								to='/register'
								className={`${active('/register')} ${linkClass}`}
							>
								Катталуу
							</Link>
						)}
					</div>
				</div>
			</>
		</>
	);
};

export default SideBar;
