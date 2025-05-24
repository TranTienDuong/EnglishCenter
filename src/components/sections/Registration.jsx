import React, { useState } from "react";
import styles from "./Registration.module.scss";
import axios from "axios";

const Registration = () => {
  const defaultFormData = {
    hoten: "",
    ngaysinh: "",
    gioitinh: "",
    sdt: "",
    diachi: "",
    email: "",
    tenkhoahoc: "",
    ngaygui: new Date().toISOString(),
    trangthai: "Chờ Xét Duyệt",
  };

  const [formData, setFormData] = useState(defaultFormData);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { hoten, ngaysinh, gioitinh, sdt, diachi, email, tenkhoahoc } = formData;
    if (!hoten || !ngaysinh || !gioitinh || !sdt || !diachi || !email || !tenkhoahoc) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    try {
      await axios.post("http://localhost:8080/api/v1/formnhaphoc", formData);
      alert("Đăng ký thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất.");
      setFormData({
        ...defaultFormData,
        ngaygui: new Date().toISOString(), // cập nhật lại thời gian gửi
      });
    } catch (error) {
      console.error("Lỗi gửi form:", error);
      alert("Gửi đăng ký thất bại. Vui lòng thử lại sau.");
    }
  };

  return (
    <section id="registration" className={styles.registrationSection}>
      <div className={styles.formContainer}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Đăng Ký Học</h2>
          <p className={styles.sectionDescription}>
            Điền thông tin của bạn để đăng ký khóa học phù hợp nhất. Chúng tôi sẽ liên hệ lại với bạn trong vòng 24 giờ.
          </p>
        </div>

        <div className={styles.cardContent}>
          <form onSubmit={handleSubmit} className={styles.registrationForm}>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label htmlFor="hoten" className={styles.label}>Họ và tên</label>
                <input
                  type="text"
                  id="hoten"
                  name="hoten"
                  className={styles.input}
                  value={formData.hoten}
                  onChange={handleChange}
                  placeholder="Nhập họ và tên"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="ngaysinh" className={styles.label}>Ngày sinh</label>
                <input
                  type="date"
                  id="ngaysinh"
                  name="ngaysinh"
                  className={styles.input}
                  value={formData.ngaysinh}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="gioitinh" className={styles.label}>Giới tính</label>
                <select
                  id="gioitinh"
                  name="gioitinh"
                  className={styles.select}
                  value={formData.gioitinh}
                  onChange={handleChange}
                  required
                >
                  <option value="">Chọn giới tính</option>
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="sdt" className={styles.label}>Số điện thoại</label>
                <input
                  type="tel"
                  id="sdt"
                  name="sdt"
                  className={styles.input}
                  value={formData.sdt}
                  onChange={handleChange}
                  placeholder="Nhập số điện thoại"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="email" className={styles.label}>Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className={styles.input}
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Nhập email"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="tenkhoahoc" className={styles.label}>Khóa học quan tâm</label>
                <select
                  id="tenkhoahoc"
                  name="tenkhoahoc"
                  className={styles.select}
                  value={formData.tenkhoahoc}
                  onChange={handleChange}
                  required
                >
                  <option value="">Chọn khóa học</option>
                  <option value="Khóa IELTS mất gốc">Khóa IELTS mất gốc</option>
                  <option value="Khóa IELTS cấp tốc">Khóa IELTS cấp tốc</option>
                  <option value="Khóa IELTS 1 kèm 1">Khóa IELTS 1 kèm 1</option>
                  <option value="Khóa IELTS 5.0-5.5">Khóa IELTS 5.0-5.5</option>
                  <option value="Khóa IELTS 6.0-6.5">Khóa IELTS 6.0-6.5</option>
                  <option value="Khóa IELTS 7.0+">Khóa IELTS 7.0+</option>
                  
                  
                </select>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="diachi" className={styles.label}>Địa chỉ</label>
              <textarea
                id="diachi"
                name="diachi"
                className={styles.textarea}
                value={formData.diachi}
                onChange={handleChange}
                rows={3}
                placeholder="Nhập địa chỉ của bạn"
                required
              />
            </div>

            <button type="submit" className={styles.submitButton}>
              Đăng ký ngay
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Registration;
