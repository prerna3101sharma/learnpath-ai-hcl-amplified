import {
  LayoutDashboard,
  User,
  Target,
  Route,
  MessageCircle,
  GraduationCap,
  LogOut,
} from "lucide-react";

import {
  NavLink,
  useNavigate,
} from "react-router-dom";

import { useUser } from "../context/UserContext";


function Sidebar() {
  const { user, logout } = useUser();

  const navigate = useNavigate();


  const handleLogout = () => {
    // Clear currently logged-in learner
    logout();

    // Redirect to login page
    navigate("/login", {
      replace: true,
    });
  };


  const menuItems = [
    {
      name: "Dashboard",
      path: "/",
      icon: LayoutDashboard,
    },

    {
      name: "My Profile",
      path: "/profile",
      icon: User,
    },

    {
      name: "Skill Gaps",
      path: "/skills",
      icon: Target,
    },

    {
      name: "Learning Path",
      path: "/learning-path",
      icon: Route,
    },

    {
      name: "AI Assistant",
      path: "/assistant",
      icon: MessageCircle,
    },
  ];


  return (
    <aside className="sidebar">

      {/* LOGO */}
      <div className="logo">

        <div className="logo-icon">
          <GraduationCap size={24} />
        </div>

        <div>
          <h2>LearnPath</h2>
          <span>AI</span>
        </div>

      </div>


      {/* NAVIGATION */}
      <nav>

        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `nav-item ${
                  isActive ? "active" : ""
                }`
              }
            >
              <Icon size={20} />

              <span>
                {item.name}
              </span>
            </NavLink>
          );
        })}

      </nav>


      {/* LOGOUT */}
      <button
        type="button"
        className="logout-button"
        onClick={handleLogout}
      >
        <LogOut size={18} />

        <span>
          Logout
        </span>
      </button>


      {/* FOOTER */}
      <div className="sidebar-footer">

        <p>
          AI-Powered
        </p>

        <span>
          Personalized Learning
        </span>

      </div>

    </aside>
  );
}


export default Sidebar;