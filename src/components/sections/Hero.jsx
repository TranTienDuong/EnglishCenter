
import React from 'react';
import styles from './Hero.module.scss';

const Hero = () => {
  return (
    <section className={styles.heroSection} id="hero">
      <div className={styles.heroContent}>
        <h1 className={styles.heroTitle}>
          Nâng cao kỹ năng tiếng Anh cùng IELTS Center
        </h1>
        <p className={styles.heroDescription}>
          Khám phá các khóa học IELTS đa dạng với phương pháp học hiệu quả, giúp bạn tự tin chinh phục band điểm mơ ước và mở ra cánh cửa cơ hội toàn cầu.
        </p>
        <div className={styles.buttonGroup}>
          <a href="#courses" className={styles.primaryButton}>
            Xem các khóa học
          </a>
          <a href="#consultation" className={styles.secondaryButton}>
            Đăng ký tư vấn
          </a>
        </div>
        
        <div className={styles.stats}>
          <div className={styles.statItem}>
            <div className={styles.statNumber}>10k+</div>
            <div className={styles.statLabel}>Học viên thành công</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statNumber}>15+</div>
            <div className={styles.statLabel}>Năm kinh nghiệm</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statNumber}>50+</div>
            <div className={styles.statLabel}>Giáo viên chuyên môn</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statNumber}>100%</div>
            <div className={styles.statLabel}>Cam kết đầu ra</div>
          </div>
        </div>
      </div>
      <div className={styles.heroBackground}></div>
    </section>
  );
};

export default Hero;