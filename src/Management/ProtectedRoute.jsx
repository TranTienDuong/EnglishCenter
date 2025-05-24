import { Navigate } from "react-router-dom";
import Cookies from "js-cookie";

const ProtectedRoute = ({ children }) => {
  const isLoggedIn = sessionStorage.getItem("isLoggedIn") === "true";

  if (!isLoggedIn) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;