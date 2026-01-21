import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  MdHome,
  MdMedicalServices,
  MdScience,
  MdLocalPharmacy,
  MdPerson,
} from "react-icons/md";
import { TbLogout } from "react-icons/tb";
import { useUserStore } from "@/store/userStore";
import { cn } from "@/utils/utils";
import { IoCloseCircleOutline } from "react-icons/io5";
import logo from "../assets/images/klinic_logo.jpeg";

type SidebarProps = {
  isShow?: boolean;
  onHide?: () => void;
};

const Sidebar = ({ isShow, onHide }: SidebarProps) => {
  const { setUser } = useUserStore();
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    {
      name: "index",
      path: "/dashboard",
      title: "Home",
      icon: MdHome,
      activePaths: ["/dashboard", "/home"],
    },
    {
      name: "doctors",
      path: "/doctors",
      title: "Doctors",
      icon: MdMedicalServices,
      activePaths: ["/doctors"],
    },
    {
      name: "laboratories",
      path: "/laboratories",
      title: "Laboratories",
      icon: MdScience,
      activePaths: ["/laboratories"],
    },
    {
      name: "medicines",
      path: "/medicines",
      title: "Medicines",
      icon: MdLocalPharmacy,
      activePaths: ["/medicines"],
    },
    {
      name: "profile",
      path: "/profile",
      title: "Profile",
      icon: MdPerson,
      activePaths: ["/profile", "/settings", "/account"],
    },
  ];

  const isActive = (tab: (typeof tabs)[0]) => {
    return (
      tab.activePaths.includes(location.pathname) ||
      location.pathname.startsWith(tab.path + "/")
    );
  };

  const handleLogout = async () => {
    localStorage.removeItem("token");
    sessionStorage.clear();
    setUser(null);
    navigate("/login");
  };

  return (
    <aside
      className={cn(
        "bg-white w-72 h-screen overflow-y-auto flex flex-col justify-between px-4 py-2 fixed top-0  z-999 lg:z-50 transition-transform duration-300 ease-in-out",
        isShow ? "translate-x-0" : "-translate-x-full",
        "lg:translate-x-0 ",
      )}
    >
      <button
        className="absolute right-3 top-4 text-blue-600 text-3xl cursor-pointer lg:hidden block "
        onClick={onHide}
      >
        <IoCloseCircleOutline />
      </button>
      <nav className="w-full my-4">
        <img src={logo} alt="logo" className="w-24 h-auto -mt-3" />

        <ul className="w-full space-y-2 mt-10">
          {tabs.map((tab) => {
            const active = isActive(tab);
            const Icon = tab.icon;

            return (
              <li key={tab.name} className="w-full">
                <Link
                  to={tab.path}
                  className={`relative flex-1 lg:text-lg text-base flex items-center gap-2 py-3 px-3 duration-300 transition-all font-medium  font-inter rounded-lg w-full ${
                    active
                      ? "text-white bg-[#5570F1]"
                      : "text-[#53545C] hover:bg-[#5570F1] hover:text-white bg-transparent"
                  }`}
                >
                  <Icon size={24} className="shrink-0" />
                  {tab.title}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <button
        onClick={handleLogout}
        className={`relative  mt-auto flex items-center gap-2 py-3 px-3 duration-300 transition-all font-medium lg:text-lg text-base font-inter rounded-lg w-full hover:bg-[#CC5F5F] active:bg-[#CC5F5F] cursor-pointer hover:text-white text-[#CC5F5F]`}
      >
        <TbLogout className="shrink-0" /> Logout
      </button>
    </aside>
  );
};

export default Sidebar;
