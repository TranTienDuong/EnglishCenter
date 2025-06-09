import React, { useEffect, useState } from "react";
import styles from "./Courses.module.scss";

const Courses = () => {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [countdowns, setCountdowns] = useState({});

  const courses = [
    {
      id: 1,
      title: "Khóa IELTS mất gốc",
      description:
        "Khóa học dành cho người mới bắt đầu hoặc còn yếu nền tảng tiếng Anh.",
      duration: "",
      lessons: "24-36 buổi",
      students: "10-15 học viên",
      price: 2000000,
      priceDisplay: "2.000.000đ",
      image:
        "https://w.ladicdn.com/s600x500/5b57f38472976020da8e5611/mat-goc-3-20211223081418.jpg",
      type: "beginner",
      badge: "Phổ biến",
      idApi: 1,
    },
    {
      id: 2,
      title: "Khóa IELTS cấp tốc",
      description:
        "Khóa học giúp nâng band điểm nhanh chóng trong thời gian ngắn.",
      duration: "2 tháng",
      lessons: "24-36 buổi",
      students: "10-15 học viên",
      price: 2500000,
      priceDisplay: "2.500.000đ",
      image:
        "https://w.ladicdn.com/s550x500/5b57f38472976020da8e5611/manh-tuong-ielts-fighter-20201127075355.jpg",
      type: "quick",
      idApi: 2,
    },
    {
      id: 3,
      title: "Khóa IELTS 1 kèm 1",
      description: "Khóa học cá nhân hóa với giảng viên chuyên môn cao.",
      duration: "Linh hoạt",
      lessons: "Theo nhu cầu",
      students: "1 học viên",
      price: 3000000,
      priceDisplay: "3.000.000đ",
      image:
        "https://w.ladicdn.com/s550x550/5b57f38472976020da8e5611/lan-phuong-lop-hoc-5-20201005153705.jpg",
      type: "private",
      badge: "Cao cấp",
      idApi: 3,
    },
    {
      id: 4,
      title: "Khóa IELTS 5.0-5.5",
      description: "Khóa học cơ bản giúp đạt band điểm 5.0-5.5.",
      duration: "3 tháng",
      lessons: "36 buổi",
      students: "10-15 học viên",
      price: 3500000,
      priceDisplay: "3.500.000đ",
      image:
        "https://w.ladicdn.com/s650x600/5b57f38472976020da8e5611/lop-hoc-ielts-25-20201005153013.jpg",
      type: "band5",
      idApi: 4,
    },
    {
      id: 5,
      title: "Khóa IELTS 6.0-6.5",
      description:
        "Khóa học giúp đạt band điểm 6.0-6.5 phù hợp nhu cầu du học.",
      duration: "3 tháng",
      lessons: "24-36 buổi",
      students: "10-15 học viên",
      price: 4000000,
      priceDisplay: "4.000.000đ",
      image:
        "https://w.ladicdn.com/s700x600/5b57f38472976020da8e5611/65-nen70-20211223084706.jpg",
      type: "band6",
      idApi: 5,
    },
    {
      id: 6,
      title: "Khóa IELTS 7.0+",
      description: "Khóa học chuyên sâu giúp đạt điểm IELTS từ 7.0 trở lên.",
      duration: "4 tháng",
      lessons: "24-36 buổi",
      students: "10-15 học viên",
      price: 4500000,
      priceDisplay: "4.500.000đ",
      image:
        "https://w.ladicdn.com/s700x600/5b57f38472976020da8e5611/hoc-ielts-o-dau-quan-8-trung-tam-luyen-thi-ielts-fighter-quan-8-4-20230515080230-hltkd.jpg",
      type: "band7",
      idApi: 6,
    },
  ];

  useEffect(() => {
    fetch("http://localhost:8080/api/v1/khoahoc")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch discounts");
        return res.json();
      })
      .then((data) => {
        console.log("Ưu đãi fetched:", data);
        setDiscounts(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Hàm tính học phí sau khi trừ ưu đãi
  const getPriceAfterDiscount = (courseId, originalPrice) => {
    const discount = discounts.find((d) => d.makhoahoc === courseId);
    if (discount) {
      const discountPercent = parseFloat(discount.uudai);
      return originalPrice * (1 - discountPercent / 100);
    }
    return originalPrice;
  };

  // Hàm tính thời gian đếm ngược còn lại
  const getTimeRemaining = (endDate) => {
    const total = Date.parse(endDate) - Date.now();
    if (total <= 0) return null; // Ưu đãi hết hạn hoặc ngày đã qua

    const seconds = Math.floor((total / 1000) % 60);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
    const days = Math.floor(total / (1000 * 60 * 60 * 24));

    return { days, hours, minutes, seconds };
  };

  // Cập nhật countdown mỗi giây
  useEffect(() => {
    const timer = setInterval(() => {
      const newCountdowns = {};
      discounts.forEach((discount) => {
        const remaining = getTimeRemaining(discount.thoigianuudai);
        newCountdowns[discount.makhoahoc] = remaining;
      });
      setCountdowns(newCountdowns);
    }, 1000);

    return () => clearInterval(timer);
  }, [discounts]);

  if (loading) {
    return <p>Đang tải ưu đãi...</p>;
  }
  if (error) {
    return <p>Lỗi: {error}</p>;
  }

  return (
    <section id="courses" className={styles.coursesSection}>
      <div className={styles.sectionContainer}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Các khóa học IELTS</h2>
          <p className={styles.sectionDescription}>
            Đa dạng khóa học phù hợp với mọi trình độ và mục tiêu, giúp học viên
            tiến bộ nhanh chóng và đạt điểm cao.
          </p>
        </div>

        <div className={styles.courseGrid}>
  {courses.map((course) => {
    const discount = discounts.find(
      (d) => String(d.makhoahoc) === String(course.idApi)
    );

    const now = new Date();
    const endDate = discount?.thoigianuudai
      ? new Date(discount.thoigianuudai)
      : null;

    const isInPromotionPeriod = endDate && now <= endDate;

    const showDiscount = discount && isInPromotionPeriod;

    const discountedPrice = showDiscount
      ? getPriceAfterDiscount(course.idApi, course.price)
      : course.price;

    const countdown =
      showDiscount && countdowns[String(discount.makhoahoc)]
        ? countdowns[String(discount.makhoahoc)]
        : null;

    return (
      <div key={course.id} className={styles.card}>
        <div className={styles.cardImageWrapper}>
          <img
            src={course.image}
            alt={course.title}
            className={styles.cardImage}
          />
          {course.badge && (
            <span className={styles.badge}>{course.badge}</span>
          )}
          {showDiscount && countdown && (
            <span
              className={styles.badge}
              style={{
                backgroundColor: "#ff6347",
                zIndex: 20,
                position: "absolute",
                top: 10,
                right: 10,
              }}
            >
              Giảm {discount.uudai}%
            </span>
          )}
        </div>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>{course.title}</h3>
        </div>
        <div className={styles.cardContent}>
          <p className={styles.cardDescription}>{course.description}</p>
          <div className={styles.courseInfoGrid}>
            <div>
              <p className={styles.infoLabel}>Thời gian ưu đãi</p>
              <p className={styles.infoValue}>
      {discount?.thoigianuudai &&
      new Date(discount.thoigianuudai) > new Date()
        ? `${discount.thoigianuudai}`
        : "Chưa có"}
    </p>
            </div>
            <div>
              <p className={styles.infoLabel}>Số buổi học</p>
              <p className={styles.infoValue}>{course.lessons}</p>
            </div>
            <div>
              <p className={styles.infoLabel}>Sĩ số</p>
              <p className={styles.infoValue}>{course.students}</p>
            </div>
            <div>
              <p className={styles.infoLabel}>Học phí</p>
              <p
                className={`${styles.infoValue} ${styles.textPrimary}`}
              >
                {showDiscount ? (
                  <>
                    <span
                      style={{
                        textDecoration: "line-through",
                        marginRight: 8,
                      }}
                    >
                      {course.priceDisplay}
                    </span>
                    <span>
                      {discountedPrice.toLocaleString("vi-VN")}đ
                    </span>
                  </>
                ) : (
                  course.priceDisplay
                )}
              </p>
            </div>
          </div>
        </div>

        <div className={styles.cardFooter}>
          {showDiscount && countdown && (
            <div className={styles.countdownWrapper}>
              <h1 className={styles.countdownTitle}>
                Cơ hội chỉ còn :
              </h1>
              <div className={styles.time}>
                <div className={styles.timeBox}>
                  <h4>{countdown.days}</h4>
                  <h5>Ngày</h5>
                </div>
                <div className={styles.timeBox}>
                  <h4>{countdown.hours}</h4>
                  <h5>Giờ</h5>
                </div>
                <div className={styles.timeBox}>
                  <h4>{countdown.minutes}</h4>
                  <h5>Phút</h5>
                </div>
                <div className={styles.timeBox}>
                  <h4>{countdown.seconds}</h4>
                  <h5>Giây</h5>
                </div>
              </div>
            </div>
          )}
          <a href="#registration" className={styles.button}>
            Đăng ký ngay
          </a>
        </div>
      </div>
    );
  })}
</div>
      </div>
    </section>
  );
}

export default Courses;
