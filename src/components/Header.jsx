import { useState, useContext, useEffect, useRef } from 'react';
import { FaBars } from 'react-icons/fa';
import { IoSearch } from 'react-icons/io5';
import { GrLanguage } from 'react-icons/gr';
import { BsChevronDown } from 'react-icons/bs';
import { Link, useLocation } from 'react-router-dom';

import Logo from '../assets/images/logoEduBot.png';

import { AuthContext } from '../context/AuthContext';
import { searchCourses } from '../services/api';

import { CiSearch } from 'react-icons/ci';
import SideBar from './UI/SideBar.jsx';
import SidebarOverlay from './UI/SidebarOverlay.jsx';

const NavLinks = ({ isMobile, user }) => {
	const location = useLocation();
	const active = (path) =>
		location.pathname === path ? 'text-orange-500' : '';

	const linkClass =
		"relative hover:text-black after:content-[''] after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-full after:bg-black after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300";

	return (
		<div
			className={
				isMobile
					? 'flex flex-col space-y-4 mt-4'
					: 'flex space-x-6 items-center'
			}
		>
			<Link to='/courses' className={`${active('/courses')} ${linkClass}`}>
				Курстар
			</Link>
			<Link to='/about' className={`${active('/about')} ${linkClass}`}>
				Биз жөнүндө
			</Link>
			<Link to='/contact' className={`${active('/contact')} ${linkClass}`}>
				Байланыш
			</Link>
			{user?.role === 'instructor' && (
				<Link
					to='/instructor'
					className={`${active('/instructor')} ${linkClass}`}
				>
					Инструктор
				</Link>
			)}
			{user?.role === 'admin' && (
				<Link to='/admin' className={`${active('/admin')} ${linkClass}`}>
					Админ
				</Link>
			)}
		</div>
	);
};

const Header = () => {
	const { user } = useContext(AuthContext);

	const location = useLocation();

	const [menuOpen, setMenuOpen] = useState(false);
	const [positionBar, setPositionBar] = useState(false);
	const [search, setSearch] = useState('');
	const [langOpen, setLangOpen] = useState(false);
	const [lang, setLang] = useState('Кыргызча');
	const [dark, setDark] = useState(false);

	const langRef = useRef(null);

	const [results, setResults] = useState([]);
	const [showDropdown, setShowDropdown] = useState(false);
	const searchContainerRef = useRef(null);

	// close dropdown on outside click
	useEffect(() => {
		const handleClickOutside = (e) => {
			if (
				searchContainerRef.current &&
				!searchContainerRef.current.contains(e.target)
			) {
				setShowDropdown(false);
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	useEffect(() => {
		setMenuOpen(false);
	}, [location.pathname]);

	useEffect(() => {
		document.body.classList.toggle('dark', dark);
	}, [dark]);

	useEffect(() => {
		const handleClickOutside = (e) => {
			if (langRef.current && !langRef.current.contains(e.target)) {
				setLangOpen(false);
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	const handleSearchSubmit = (e) => {
		e.preventDefault();
		const q = search.trim();
		if (!q) return;
		navigate(`/search?q=${encodeURIComponent(q)}`);
		// optionally keep the text; if you want to clear: setSearch("");
		setMenuOpen(false);
	};

	const handleSearch = async (value) => {
		setSearch(value);

		if (value.length < 3) {
			setResults([]);
			setShowDropdown(false);
			return;
		}

		try {
			const data = await searchCourses(value);
			setResults(data);
			setShowDropdown(true);
		} catch {
			setResults([]);
			setShowDropdown(false);
		}
	};

	return (
		<header className='sticky top-0 w-full bg-white dark:bg-slate-500 shadow z-50'>
			<div className='px-4 md:px-10 py-3 flex flex-col items-center'>
				<div className=' lg:flex items-center justify-between w-full'>
					<div className='flex items-center  flex-1 gap-3 mt-5 lg:mt-0  justify-between  lg:justify-start w-full'>
						<div className=' lg:hidden flex   items-center'>
							<button
								onClick={() => {
									setMenuOpen((p) => !p);
									setPositionBar(false);
								}}
								className='text-gray-700 dark:text-gray-200 text-2xl'
							>
								<FaBars />
							</button>
						</div>

						<Link to='/' className='flex items-center whitespace-nowrap mr-7'>
							<img src={Logo} alt='logo' className='h-14 w-auto mr-3' />
							<div className='flex flex-col mt-1  items-center '>
								<span className='text-2xl sm:text-3xl font-bold text-orange-500'>
									EDUBOT
								</span>
								<span className='-mt-2 text-lg  md:text-xl text-gray-700 dark:text-gray-200 tracking-[0.14em]'>
									LEARNING
								</span>
							</div>
						</Link>

						<div
							ref={searchContainerRef}
							className='relative hidden md:flex items-center flex-col flex-1 max-w-[200px] ml-6'
						>
							<div className='flex items-center w-full border border-black rounded overflow-hidden'>
								<IoSearch className='w-5 h-5 ml-2 text-gray-700 dark:text-gray-200' />
								<input
									type='text'
									placeholder='Издөө'
									value={search}
									onChange={(e) => handleSearch(e.target.value)}
									className='px-3 py-2 focus:outline-none bg-transparent w-full'
								/>
							</div>

							{/* 🔍 Search dropdown */}
							{showDropdown && results.length > 0 && (
								<div className='absolute top-full left-0 right-0 bg-white shadow-lg border rounded mt-1 max-h-64 overflow-y-auto z-50'>
									{results.map((course) => (
										<button
											key={course.id}
											onClick={() => {
												navigate(`/courses/${course.id}`);
												setShowDropdown(false);
											}}
											className='w-full text-left px-4 py-2 hover:bg-gray-100'
										>
											<div className='font-semibold text-sm'>
												{course.title}
											</div>
											<div className='text-xs text-gray-500 line-clamp-1'>
												{course.description}
											</div>
										</button>
									))}
								</div>
							)}

							{/* If no results */}
							{showDropdown && results.length === 0 && (
								<div className='absolute top-full left-0 right-0 bg-white shadow-lg border rounded mt-1 p-3 text-sm text-gray-500'>
									Натыйжа жок
								</div>
							)}
						</div>
						<div className=' md:hidden flex   items-center'>
							<button className='text-gray-700 dark:text-gray-200 text-2xl'>
								<CiSearch />
							</button>
						</div>

						<div className='hidden lg:flex items-center ml-6'>
							<NavLinks isMobile={false} user={user} />
						</div>
					</div>

					<div className='hidden lg:flex items-center space-x-4 ml-auto'>
						<div className='relative' ref={langRef}>
							<button
								onClick={() => setLangOpen((p) => !p)}
								className='flex items-center space-x-1 p-2'
							>
								<GrLanguage className='text-gray-700 dark:text-gray-200 w-5 h-5 sm:w-6 sm:h-6' />
								<BsChevronDown
									className={`w-4 h-4 text-gray-700 dark:text-gray-200 transform transition-transform duration-300 ${
										langOpen ? 'rotate-180' : ''
									}`}
								/>
							</button>
							{langOpen && (
								<div className='absolute right-0 mt-2 bg-white dark:bg-gray-800 shadow rounded z-50'>
									{['Русский', 'English'].map((l) => (
										<button
											key={l}
											onClick={() => {
												setLang(l);
												setLangOpen(false);
											}}
											className='block px-4 py-2 w-full text-left hover:bg-gray-100 dark:hover:bg-gray-700'
										>
											{l}
										</button>
									))}
								</div>
							)}
						</div>

						<button
							onClick={() => setDark((p) => !p)}
							className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${
								dark ? 'bg-gray-700' : 'bg-blue-300'
							}`}
						>
							<span
								className={`absolute top-[2px] w-5 h-5 rounded-full bg-white transition-all duration-300 ${
									dark ? 'right-[2px]' : 'left-[2px]'
								}`}
							></span>
						</button>

						<Link
							to='/register'
							className='bg-orange-500 hover:bg-orange-500 text-white rounded-md px-4 py-2 md:text-base font-semibold shadow-[0_0_5px_2px_rgba(255,165,0,0.8)]'
						>
							Катталуу
						</Link>
					</div>
				</div>

				{/* Mobile */}

				<div className='md:hidden'>
					<div className='flex w-full justify-center items-center px-4 gap-x-2'>
						<div
							onSubmit={handleSearchSubmit}
							className='flex items-center border border-black rounded overflow-hidden w-[calc(100%-50px)] max-w-[280px]'
						>
							<IoSearch className='w-5 h-5 ml-2 text-gray-700 dark:text-gray-200' />
							<input
								type='text'
								placeholder='Издөө'
								value={search}
								onChange={(e) => handleSearch(e.target.value)}
								className='px-3 py-2 focus:outline-none bg-transparent w-full truncate text-sm sm:text-base'
							/>

							{/* 🔍 Search dropdown */}
							{showDropdown && results.length > 0 && (
								<div className='absolute top-full left-0 right-0 bg-white shadow-lg border rounded mt-1 max-h-64 overflow-y-auto z-50'>
									{results.map((course) => (
										<button
											key={course.id}
											onClick={() => {
												navigate(`/courses/${course.id}`);
												setShowDropdown(false);
											}}
											className='w-full text-left px-4 py-2 hover:bg-gray-100'
										>
											<div className='font-semibold text-sm'>
												{course.title}
											</div>
											<div className='text-xs text-gray-500 line-clamp-1'>
												{course.description}
											</div>
										</button>
									))}
								</div>
							)}

							{/* If no results */}
							{showDropdown && results.length === 0 && (
								<div className='absolute top-full left-0 right-0 bg-white shadow-lg border rounded mt-1 p-3 text-sm text-gray-500'>
									Натыйжа жок
								</div>
							)}
						</div>
						<button type='submit' className='hidden'>
							Search
						</button>
					</div>
				</div>
			</div>
			{/* Mobile menu modal */}
			<SidebarOverlay
				isOpen={menuOpen}
				onClose={() => setMenuOpen(false)}
				position='left'
			>
				<SideBar setMenuOpen={setMenuOpen} setPosition={setPositionBar} />
			</SidebarOverlay>
			<SidebarOverlay
				isOpen={positionBar}
				onClose={() => setPositionBar(false)}
				position='right'
			>
				<SideBar setMenuOpen={setMenuOpen} setPosition={setPositionBar} />
			</SidebarOverlay>
		</header>
	);
};

export default Header;
