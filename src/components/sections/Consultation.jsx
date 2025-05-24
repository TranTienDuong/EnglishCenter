import React, { useState } from 'react';
import { Mail } from "lucide-react";
import styles from './Consultation.module.scss';
import axios from 'axios';

const Consultation = () => {
  const [formData, setFormData] = useState({
    hoten: '',
    sdt: '',
    nghenghiep: '',
    cauhoituvan: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { hoten, sdt, nghenghiep, cauhoituvan } = formData;
    if (!hoten || !sdt || !nghenghiep || !cauhoituvan) {
      alert("Vui lòng điền đầy đủ thông tin!");
      setLoading(false);
      return;
    }

    try {
      await axios.post("http://localhost:8080/api/v1/tuvan", {
        hoten,
        sdt,
        nghenghiep,
        cauhoituvan,
        ngaygui: new Date().toISOString(),
        trangthai: "Chờ tư vấn",
      });
      alert("Yêu cầu tư vấn đã được gửi thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất.");
      setFormData({ hoten: '', sdt: '', nghenghiep: '', cauhoituvan: '' });
    } catch (error) {
      console.error("Lỗi gửi yêu cầu:", error);
      alert("Có lỗi xảy ra khi gửi yêu cầu. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="consultation" className={styles.consultationSection}>
      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Nhận Tư Vấn Miễn Phí</h2>
          <p className={styles.sectionDescription}>
            Không chắc chắn về khóa học phù hợp với bạn? Hãy để lại thông tin, chúng tôi sẽ liên hệ và tư vấn chi tiết.
          </p>
        </div>

        <div className={styles.consultationCard}>
          <div className={styles.card}>
            <div className={styles.cardContent}>
              <div className={styles.cardGrid}>
                <div>
                  <div className={styles.cardHeader}>
                    <div className={styles.iconContainer}>
                      <Mail className={styles.mailIcon} />
                    </div>
                    <h3 className={styles.cardTitle}>Gửi yêu cầu tư vấn</h3>
                  </div>

                  <p className={styles.cardDescription}>
                    Điền thông tin của bạn dưới đây, đội ngũ tư vấn viên của chúng tôi sẽ liên hệ với bạn trong vòng 24 giờ.
                  </p>
                </div>

                <div>
                  <form onSubmit={handleSubmit} className={styles.consultationForm}>
                    <div className={styles.formGroup}>
                      <label className={styles.label} htmlFor="hoten">Họ và tên</label>
                      <input
                        className={styles.input}
                        id="hoten"
                        name="hoten"
                        value={formData.hoten}
                        onChange={handleChange}
                        placeholder="Nhập họ và tên"
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label} htmlFor="sdt">Số điện thoại</label>
                      <input
                        className={styles.input}
                        id="sdt"
                        name="sdt"
                        value={formData.sdt}
                        onChange={handleChange}
                        placeholder="Nhập số điện thoại"
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label} htmlFor="nghenghiep">Nghề nghiệp</label>
                      <select
                        className={styles.select}
                        id="nghenghiep"
                        name="nghenghiep"
                        value={formData.nghenghiep}
                        onChange={handleChange}
                      >
                        <option value="">Chọn nghề nghiệp</option>
                        <option value="Học sinh">Học sinh</option>
                        <option value="Sinh viên">Sinh viên</option>
                        <option value="Nhân viên văn phòng">Nhân viên văn phòng</option>
                        <option value="Khác">Khác</option>
                      </select>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label} htmlFor="cauhoituvan">Câu hỏi tư vấn</label>
                      <textarea
                        className={styles.textarea}
                        id="cauhoituvan"
                        name="cauhoituvan"
                        value={formData.cauhoituvan}
                        onChange={handleChange}
                        rows={4}
                        placeholder="Mô tả nhu cầu học hoặc câu hỏi cần tư vấn"
                      />
                    </div>

                    <button type="submit" className={styles.submitButton} disabled={loading}>
                      {loading ? "Đang gửi..." : "Gửi yêu cầu tư vấn"}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Consultation;
