import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import axios from "axios";
import styles from "./Login.module.scss";

const Login = () => {
  const [username, setUsername] = useState(""); // Dùng username thay vì email
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      const res = await axios.post(
        "http://localhost:8080/api/v1/nguoidung/login",
        {
          tendangnhap: username,
          matkhau: password,
        }
      );

      if (
        !res.data.manguoidung ||
        !res.data.tennguoidung ||
        !res.data.tenloaichucvu
      ) {
        throw new Error("Invalid response from server");
      }

      // Set cookies
      // Cookies.set("isLoggedIn", true);
      // Cookies.set("userId", res.data.manguoidung);
      // Cookies.set("name", res.data.tennguoidung);
      // Cookies.set("role", res.data.tenloaichucvu);

      sessionStorage.setItem("isLoggedIn", "true");
sessionStorage.setItem("userId", res.data.manguoidung);
sessionStorage.setItem("name", res.data.tennguoidung);
sessionStorage.setItem("role", res.data.tenloaichucvu);

      navigate("/dashboard");
    } catch (error) {
      const serverMessage =
        error.response && error.response.data && error.response.data.message
          ? error.response.data.message
          : "";

      setErrorMessage(serverMessage || "Sai tên đăng nhập hoặc mật khẩu");
      setUsername("");
      setPassword("");
    } finally {
      setLoading(false);
    }
  };
  const handleRegister = () => {
    navigate("/"); // Điều hướng về trang chủ
    // Delay cho đến khi trang render xong
    setTimeout(() => {
      const registrationSection = document.getElementById("registration");
      if (registrationSection) {
        window.scrollTo({
          top: registrationSection.offsetTop,
          behavior: "smooth",
        });
      }
    }, 800); // Thời gian delay để đảm bảo việc cuộn trang sau khi chuyển trang
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginCard}>
        <div className={styles.cardHeader}>
          <Link to="/" className={styles.logoLink}>
            <h2 className={styles.logo}>IELTS Center</h2>
          </Link>
          <h1 className={styles.title}>Đăng nhập</h1>
          <p className={styles.subtitle}>Nhập thông tin đăng nhập của bạn</p>
        </div>

        <div className={styles.cardContent}>
          <form onSubmit={handleLogin} className={styles.loginForm}>
            <div className={styles.formGroup}>
              <label htmlFor="username" className={styles.formLabel}>
                Tên đăng nhập
              </label>
              <input
                id="username"
                type="text"
                placeholder="Tên đăng nhập..."
                className={styles.input}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="off"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password" className={styles.formLabel}>
                Mật khẩu
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                className={styles.input}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className={styles.rememberForgot}>
              <div className={styles.rememberMe}>
                <input
                  type="checkbox"
                  id="remember"
                  className={styles.checkbox}
                />
                <label htmlFor="remember" className={styles.checkboxLabel}>
                  Ghi nhớ đăng nhập
                </label>
              </div>
              <a href="#" className={styles.forgotLink}>
                Quên mật khẩu?
              </a>
            </div>

            {errorMessage && (
              <p
                style={{ color: "red", marginTop: "1rem", fontWeight: "bold" }}
              >
                {errorMessage}
              </p>
            )}

            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading}
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </form>
        </div>

        <div className={styles.cardFooter}>
          <p className={styles.registerText}>
            Chưa có tài khoản?{" "}
            <button onClick={handleRegister} className={styles.registerLink}>
              Đăng ký
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
