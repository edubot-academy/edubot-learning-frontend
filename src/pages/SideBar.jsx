
import LogoSidebar from "../assets/icons/logo-sidebar.svg"
import SiderDashboardIcon from "../assets/icons/dashboard-icon-siderbar.svg"
import MyCources from "../assets/icons/my-cources.svg"
import Students from "../assets/icons/students-sidebar.svg"
import LiveWorkSops from "../assets/icons/likeworkshops.svg"
import Earnings from "../assets/icons/earning.svg"
import Notifications from "../assets/icons/notifications.svg"
import Settings from "../assets/icons/settings.svg"
import Support from "../assets/icons/support.svg"
import AvatarSidebar from "../assets/icons/avatar-sidebar.svg"
import Caret from "../assets/icons/caret-side.svg"
import Expand from "../assets/icons/expand-icon.svg"
import OpenExpand from "../assets/icons/expandicon.svg"
import { useState } from "react"
const SideBar = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    return (
        <aside className={`${isCollapsed ? 'w-[100px]' : 'w-[250px]'
            } transition-all duration-300  bg-edubot-dark text-white flex flex-col rounded-tr-[41px] rounded-br-[41px]`}
        >
            <div>
                <div className="flex relative  pt-[19px] pl-[24px]">
                    <img
                        src={LogoSidebar}
                        alt="Logo"
                        className={`${isCollapsed ? 'w-[66px] h-[54px] mx-auto mr-3 ' : 'w-[66px] h-[54px] '} transition-all duration-300`}
                    />
                    {!isCollapsed && (
                        <h1 className=" text-white ml-2 relative top-[12px] ">
                            <span className="text-orange-500 font-bold">EDUBOT</span> <br />
                            <span className="text-white text-sm font-Montserrat">LEARNING</span>
                        </h1>
                    )}
                    <div>
                        {!isCollapsed ? (
                            <img
                                src={Expand}
                                onClick={() => setIsCollapsed(true)}
                                alt="Collapse"
                                className="absolute -right-6 top-[77%] transform -translate-y-1/2 cursor-pointer"
                            />
                        ) : (
                            <img
                                src={OpenExpand}
                                onClick={() => setIsCollapsed(false)}
                                alt="Expand"
                                    className="absolute -right-3 top-[77%] transform -translate-y-1/2 w-6 h-6 cursor-pointer"
                            />
                        )}
                    </div>
                </div>
                <nav className="flex flex-col gap-2 text-sm font-medium p-6">
                    <button
                        className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'
                            } px-3 py-2 rounded-full transition hover:bg-white hover:text-[#0EA78B]`}
                    >
                        <img
                            src={SiderDashboardIcon}
                            alt="Dashboard"
                            className={`${isCollapsed ? 'w-5 h-5' : 'w-4 h-4'} transition-all`}
                        />
                        {!isCollapsed && <span>Dashboard</span>}
                    </button>

                    <button
                        className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'
                            } px-3 py-2 rounded-full transition hover:bg-white hover:text-[#0EA78B]`}
                    >
                        <img src={MyCources} alt="My Courses" className={`${isCollapsed ? 'w-5 h-5' : 'w-4 h-4'} transition-all`} />
                        {!isCollapsed && <p>My Courses</p>}
                    </button>

                    <button
                        className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'
                            } px-3 py-2 rounded-full transition hover:bg-white hover:text-[#0EA78B]`}
                    >
                        <img src={Students} alt="Students Progress" className={`${isCollapsed ? 'w-5 h-5' : 'w-4 h-4'} transition-all`} />
                        {!isCollapsed && <p>Students Progress</p>}
                    </button>

                    <button
                        className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'
                            } px-3 py-2 rounded-full transition hover:bg-white hover:text-[#0EA78B]`}
                    >
                        <img src={LiveWorkSops} alt="Live Workshops" className={`${isCollapsed ? 'w-5 h-5' : 'w-4 h-4'} transition-all`} />
                        {!isCollapsed && <p>Live Workshops</p>}
                    </button>

                    <button
                        className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'
                            } px-3 py-2 rounded-full transition hover:bg-white hover:text-[#0EA78B]`}
                    >
                        <img src={Earnings} alt="Earnings" className={`${isCollapsed ? 'w-5 h-5' : 'w-4 h-4'} transition-all`} />
                        {!isCollapsed && <p>Earnings</p>}
                    </button>
                </nav>

            </div>
            <div className="w-ful border-[1px] border-#E2E8F0 " />

            <div className='flex flex-col justify-between h-full '>
                <div className="flex flex-col gap-2 text-sm font-medium  p-6">
                    <button
                        className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'
                            } relative text-sm font-medium leading-[20px] hover:bg-white hover:text-[#0EA78B] transition px-3 py-2 rounded-full`}
                    >
                        <img
                            src={Notifications}
                            alt="Notifications"
                            className={`${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'
                                } transition-all duration-300`}
                        />
                        {!isCollapsed && <p>Notifications</p>}
                    </button>
                    <button
                        className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'
                            } text-sm font-medium leading-[20px] hover:bg-white hover:text-[#0EA78B] transition px-3 py-2 rounded-full`}
                    >
                        <img
                            src={Settings}
                            alt="Settings"
                            className={`${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'
                                } transition-all duration-300`}
                        />
                        {!isCollapsed && <p>Settings</p>}
                    </button>
                    <button
                        className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'
                            } text-sm font-medium leading-[20px] hover:bg-white hover:text-[#0EA78B] transition px-3 py-2 rounded-full`}
                    >
                        <img
                            src={Support}
                            alt="Support"
                            className={`${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'
                                } transition-all duration-300`}
                        />
                        {!isCollapsed && <p>Support</p>}
                    </button>
                </div>
                <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'
                    } pb-[60px] mt-4 border-t border-[#E2E8F0] cursor-pointer`}>
                    <div className={`flex items-center ${isCollapsed ? 'flex-col gap-1 p-2' : 'gap-3 p-6'
                        }`}>

                        <img
                            src={AvatarSidebar}
                            alt="Avatar"
                            className={`rounded-full transition-all duration-300 ${isCollapsed ? 'w-8 h-8' : 'w-10 h-10'
                                }`}
                        />
                        {!isCollapsed && (
                            <div className="flex flex-col">
                                <div className="text-[#64748B] font-medium text-[12px] leading-[20px] font-poppins">
                                    Welcome back 👋
                                </div>
                                <div className="font-medium text-[14px] leading-[20px] text-[#081021] font-poppins">
                                    Johnathan
                                </div>
                            </div>
                        )}
                    </div>
                    {!isCollapsed && (
                        <img
                            src={Caret}
                            alt="Caret"
                            className="w-6 h-10"
                        />
                    )}
                </div>
            </div>
        </aside>
    )
}

export default SideBar
