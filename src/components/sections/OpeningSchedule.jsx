import React, { useEffect, useState } from "react";
import styles from "./OpeningSchedule.module.scss";
import axios from "axios";
import Loader from "../../assets/Loader/Loader";

const OpeningSchedule = () => {
  const [loading, setLoading] = useState(true);
  const [classList, setClassList] = useState([]);

  useEffect(() => {
    fetchClassData();
  }, []);

  const fetchClassData = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/v1/lophoc");
      const today = new Date();

      // Lọc lớp chưa khai giảng
      const upcomingClasses = response.data.filter((cls) => {
        const startDate = new Date(cls.ngaykhaigiang);
        return startDate > today;
      });

      setClassList(upcomingClasses);
    } catch (error) {
      console.error("Error loading class list:", error);
    } finally {
      setLoading(false);
    }
  };

  // Chuyển đổi ca học thành khung giờ
  const getTimeSlot = (ca) => {
    switch (ca) {
      case "Sáng":
        return "7:00 - 10:00";
      case "Chiều":
        return "13:00 - 16:00";
      case "Tối":
        return "18:00 - 21:00";
      default:
        return ca;
    }
  };

  // Nhóm lớp theo khóa học
  const groupedByCourse = classList.reduce((groups, cls) => {
    const course = cls.tenkhoahoc || "Chưa có khóa học";
    if (!groups[course]) groups[course] = [];
    groups[course].push(cls);
    return groups;
  }, {});

  if (loading) return <Loader />;

  return (
    <section id="openingSchedule" className={styles.openingScheduleSection}>
        <div className={styles.wrapper}>
      <h2 className={styles.title}>Lịch khai giảng các lớp IELTS</h2>
      <table className={styles.classTable}>
        <thead>
          <tr>
            <th>Khóa học</th>
            <th>Tên lớp</th>
            <th>Ngày khai giảng</th>
            <th>Thứ học</th>
            <th>Ca học</th>
            <th>Giáo viên</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(groupedByCourse).map(([courseName, classes]) =>
            classes.map((cls, index) => (
              <tr key={cls.malop}>
                {index === 0 && (
                  <td rowSpan={classes.length} className={styles.courseName}>
                    {courseName}
                  </td>
                )}
                <td>{cls.tenlophoc}</td>
                <td>{new Date(cls.ngaykhaigiang).toLocaleDateString()}</td>
                <td>Thứ {cls.thuhoc}</td>
                <td>{getTimeSlot(cls.cahoc)}</td>
                <td>
                  {cls.giangVien && cls.giangVien.length > 0
  ? cls.giangVien
      .map((gv) => `${gv.gioitinh === "Nam" ? "Mr." : "Mrs."} ${gv.hoten}`)
      .join(", ")
  : "Chưa có giáo viên"}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
    </section>
  );
};

export default OpeningSchedule;
