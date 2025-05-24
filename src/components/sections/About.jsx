
import React from 'react';
import { CheckCircle } from "lucide-react";
import styles from './About.module.scss';

const About = () => {
  const features = [
    "Đội ngũ giảng viên giàu kinh nghiệm",
    "Phương pháp giảng dạy hiệu quả",
    "Lộ trình học tập cá nhân hóa",
    "Môi trường học tập thân thiện",
    "Tài liệu học tập chất lượng cao",
    "Hỗ trợ học viên 24/7"
  ];

  return (
    <section id="about" className={styles.aboutSection}>
      <div className="container mx-auto px-4">
        <div className={styles.aboutGrid}>
          {/* Image */}
          <div className={styles.imageContainer}>
            <div className={styles.imageWrapper}>
              <img 
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1171&q=80" 
                alt="Students learning" 
                className={styles.image}
              />
            </div>
            <div className={styles.statsBadge}>
              <div className={styles.statsContent}>
                <p className={styles.statsNumber}>98%</p>
                <p className={styles.statsText}>Học viên hài lòng</p>
              </div>
            </div>
          </div>
          
          {/* Content */}
          <div className={styles.contentContainer}>
            <h2 className={styles.title}>Về IELTS Center</h2>
            <p className={styles.description}>
              IELTS Center là trung tâm đào tạo IELTS hàng đầu với phương pháp giảng dạy hiệu quả, 
              giúp học viên đạt được điểm số IELTS mong muốn trong thời gian ngắn nhất.
            </p>
            <p className={styles.description}>
              Chúng tôi tự hào với đội ngũ giáo viên giàu kinh nghiệm, tận tâm và 
              luôn cập nhật xu hướng mới nhất trong kỳ thi IELTS.
            </p>
            
            <div className={styles.featuresGrid}>
              {features.map((feature, index) => (
                <div key={index} className={styles.featureItem}>
                  <CheckCircle className={styles.featureIcon} />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;