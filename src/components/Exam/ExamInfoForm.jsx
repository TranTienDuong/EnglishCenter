import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './ExamInfoForm.module.scss';
import axios from 'axios';

const ExamInfoForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    email: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const verifyCandidate = async () => {
  const response = await axios.get('http://localhost:8080/api/v1/test/verify', {
    params: {
      email: formData.email,
      phone: formData.phone
    }
  });
  return response.data;
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Kiểm tra định dạng email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Email không hợp lệ');
      setLoading(false);
      return;
    }
    
    // Kiểm tra số điện thoại
    const phoneRegex = /^\d{10,11}$/;
    if (!phoneRegex.test(formData.phone)) {
      setError('Số điện thoại phải có 10-11 chữ số');
      setLoading(false);
      return;
    }
    
    try {
      // Gọi API kiểm tra thông tin thí sinh
      const verification = await verifyCandidate();
      
      if (verification === true) {
        onSubmit(formData);
      } else {
        setError(verification.message || 'Thông tin không hợp lệ hoặc chưa đăng ký');
      }
    } catch (err) {
      console.error('Lỗi khi xác thực thông tin:', err);
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi xác thực thông tin');
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
    <div className={styles.examInfoPage}>
      <div className={styles.examInfoCard}>
        <div className={styles.cardHeader}>
          <Link to="/" className={styles.logoLink}>
            <h2 className={styles.logo}>IELTS Center</h2>
          </Link>
          <h1 className={styles.title}>Thông tin thí sinh</h1>
          <p className={styles.subtitle}>Vui lòng nhập thông tin cá nhân để bắt đầu bài thi</p>
        </div>

        <div className={styles.cardContent}>
          <form onSubmit={handleSubmit} className={styles.examInfoForm}>

            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.formLabel}>
                Email
              </label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="Nhập email..."
                className={styles.input}
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="phone" className={styles.formLabel}>
                Số điện thoại
              </label>
              <input
                id="phone"
                type="tel"
                name="phone"
                placeholder="Nhập số điện thoại..."
                className={styles.input}
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>

            {error && (
              <div className={styles.errorMessage}>
                {error}
              </div>
            )}

            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading}
            >
              {loading ? "Đang xác thực..." : "Bắt đầu thi"}
            </button>
          </form>
        </div>

        <div className={styles.cardFooter}>
          <p className={styles.registerText}>
            Chưa có tài khoản?{' '}
            <Link onClick={handleRegister} className={styles.registerLink}>
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ExamInfoForm;