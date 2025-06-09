import React, { useState } from "react";
import Cookies from "js-cookie";
import classes from "./Dashboard.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";
import {
//  faHouse,
  faBars,
  faQuestion,
  faCircle,
  faSignOutAlt,
  faCalendar,
  faUser,
  faBook,
  faHeadset,
  faFileSignature,
  faEnvelope,
  faChartSimple,
  faDoorClosed,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
 import { Home } from "lucide-react";
 import Schedule from "../Schedule/Schedule";
 import Student from "../Student/Student";
 import Teacher from "../Teacher/Teacher";
 import SignUp from "../SignUp/SignUp";
 import StudentConfirm from "../StudentCofirm/StudentComfirm";
 import Consultancy from "../Consultancy/Consultancy";
 import Course from "../Course/Course";
 import Class from "../Class/Class";
 import Statistic from "../Statistic/Statistic";
 import Question  from "../Question/Question";

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [view, setView] = useState("dashboard");
  const navigate = useNavigate();

  const name = sessionStorage.getItem("name");
  const role = sessionStorage.getItem("role");

  if (!name || !role) {
    navigate("/login");
    return null;
  }

  const clearCookies = () => {
    // Cookies.remove("isLoggedIn");
    // Cookies.remove("userId");
    // Cookies.remove("name");
    // Cookies.remove("role");
    sessionStorage.clear();
  };
  const handleLogout = () => {
    clearCookies(); // Call the function to clear cookies
    navigate("/"); // Redirect to login page after logout
  };

  const handleSwitchView = (view) => {
    switch (view) {
      //   case "dashboard":
      // return <div>Chào mừng đến với trang quản trị!</div>;
        case "class":
      return <Class />;
        case "student":
      return <Student />;
        case "signup":
      return <SignUp />;
        case "teacher":
      return <Teacher />;
        case "course":
      return <Course />;
        case "consultant":
      return <Consultancy />;
        case "schedule":
      return <Schedule />;
        case "studentconfirm":
      return <StudentConfirm />;
        case "question":
      return <Question />;
        case "statistic":
      return <Statistic />;
    default:
      return <Schedule />;
    }
  };

  const menuItems = [
    { view: "signup", icon: faFileSignature, text: "Đăng ký học", role: ["admin"], },
    { view: "studentconfirm", icon: faCheck, text: "Xác nhận học viên", role: ["admin"], },
//    { view: "dashboard", icon:  faHouse, text: "Dashboard" },
    { view: "schedule", icon: faCalendar, text: "Thời khóa biểu", role: ["admin", "Giáo Viên", "Học Viên"], },
    { view: "class", icon: faDoorClosed, text: "Lớp học", role: ["admin", "Giáo Viên", "Học Viên"],},
    { view: "student", icon: faUser, text: "Học viên", role: ["admin"], },
    { view: "teacher", icon: faUser, text: "Giáo viên", role: ["admin"], },
    { view: "consultant", icon: faHeadset, text: "Tư vấn", role: ["admin"], },
    { view: "course", icon: faBook, text: "Khóa học", role: ["admin"], },
    { view: "question", icon: faQuestion, text: "Câu hỏi", role: ["admin"], },
    { view: "statistic", icon: faChartSimple, text: "Báo cáo thống kê", role: ["admin"], },
  ];

  const filteredMenuItems = menuItems.filter((item) => item.role.includes(role));

  return (
    <div className={classes.container}>
      <div
        className={classes.left}
        style={{
          width: isSidebarOpen ? "20%" : "0",
        }}
      >
        <div
          className={`${classes.sidebar} ${
            isSidebarOpen ? classes.open : classes.close
          }`}
        >
          <div className={classes.profile}>
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTs_Z8NkJTKQmhsyBuGnRsAgd7TiOPuaf7Raw&s"
              alt="profile"
            />
            <div>
              <h1>{name}</h1>
              <FontAwesomeIcon icon={faCircle} id={classes.online} /> {role}
            </div>
            <button onClick={() => handleLogout()}>
              <FontAwesomeIcon icon={faSignOutAlt} />
            </button>
          </div>
          <div className={classes.menu}>
            {filteredMenuItems.map(({ view: viewName, icon, text }) => (
              <button
                key={viewName}
                className={view === viewName ? classes.active : ""}
                onClick={() => setView(viewName)}
              >
                <FontAwesomeIcon icon={icon} />
                <span>{text}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={classes.right}>
        <div className={classes.header}>
          <FontAwesomeIcon
            icon={faBars}
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          />

          <div className={classes.notification}>
            <FontAwesomeIcon icon={faEnvelope} />
            <span>Hello, {name}</span>
          </div>
        </div>
        <div className={classes.content}>{handleSwitchView(view)}</div>
      </div>
    </div>
  );
};

export default Dashboard;