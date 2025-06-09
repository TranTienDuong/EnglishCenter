import React, { useState, useEffect } from "react";
import classes from "./Schedule.module.scss";
import axios from "axios";
import Loader from "../../assets/Loader/Loader";
import Calendar from "react-calendar";
import Cookies from "js-cookie";
import "react-calendar/dist/Calendar.css";
import { useNavigate } from "react-router-dom";

const Schedule = () => {
  const navigate = useNavigate();
  const [classData, setClassData] = useState([]);
  const [scheduleData, setScheduleData] = useState([]);
  const [schedule, setSchedule] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const userId = sessionStorage.getItem("userId");
  const role = sessionStorage.getItem("role");

  const [giaoVienOptions, setGiaoVienOptions] = useState([]);
  const [luuclasses, setLuuClasses] = useState([]);
  const [luurooms, setLuuRooms] = useState([]);

  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("");

  const classColors = [
    "#641e16",
    "#512e5f",
    "#154360",
    "#145a32",
    "#7e5109",
    "#626567",
    "#17202a",
    "#424949",
    "#784212",
  ];

  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const shiftTypes = ["morning", "afternoon", "night"];

  useEffect(() => {
    if (!userId || !role) navigate("/login");
  }, [userId, role, navigate]);

  const getClassColor = (className) => {
    let index = Array.from(className).reduce(
      (sum, char) => sum + char.charCodeAt(0),
      0
    );
    return classColors[index % classColors.length];
  };

  const getDayName = (thuhoc) => daysOfWeek[thuhoc - 2];
  const getTimeSlot = (tgbatdau) => {
    const hour = parseInt(tgbatdau.split(":")[0], 10);
    if (hour >= 6 && hour < 12) return "morning";
    if (hour >= 12 && hour < 18) return "afternoon";
    return "night";
  };

  const converShift = (shift) =>
    shift === "morning" ? "Sáng" : shift === "afternoon" ? "Chiều" : "Tối";

  const getMonday = (date) => {
    const d = new Date(date);
    const day = d.getDay() || 7;
    d.setDate(d.getDate() - day + 1);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const getCurrentDate = (dayOffset) => {
    const monday = getMonday(selectedDate);
    const result = new Date(monday);
    result.setDate(monday.getDate() + dayOffset);
    return result.toLocaleDateString("vi-VN");
  };

  const initializeScheduleTemplate = () =>
    daysOfWeek.reduce((acc, day) => {
      acc[day] = { morning: [], afternoon: [], night: [] };
      return acc;
    }, {});

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        if (role === "admin") {
          const classRes = await axios.get(
            "http://localhost:8080/api/v1/lophoc"
          );
          setClassData(classRes.data);

          const schedulePromises = classRes.data.map((cls) =>
            axios
              .get(
                `http://localhost:8080/api/v1/lophoc/${cls.malop}/thoikhoabieu`
              )
              .then((res) =>
                res.data.map((item) => ({
                  ...item,
                  tenlophoc: cls.tenlophoc,
                  ngaykhaigiang: cls.ngaykhaigiang,
                  thoigianhoc: cls.thoigianhoc,
                  giangVien: cls.giangVien,
                }))
              )
              .catch((err) => {
                if (err.response?.status === 404) return [];
                console.error(`Error fetching schedule for ${cls.malop}:`, err);
                return [];
              })
          );

          const scheduleResults = (await Promise.all(schedulePromises)).flat();
          setScheduleData(scheduleResults);
        } else {
          const res = await axios.get(
            `http://localhost:8080/api/v1/nguoidung/personalSchedule/${userId}`
          );
          const filtered = res.data.filter(
            (item) => item.trangThai !== "Chuyển Lớp"
          );
          setScheduleData(filtered);
        }
      } catch (err) {
        console.error("Error fetching schedule:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [role, userId]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [classRes, roomRes] = await Promise.all([
          axios.get("http://localhost:8080/api/v1/lophoc"),
          axios.get("http://localhost:8080/api/phonghoc"),
        ]);

        const today = new Date();

        // Lọc những lớp chưa kết thúc (đang học hoặc sắp học)
        const filteredClasses = classRes.data.filter((classItem) => {
          const startDate = new Date(classItem.ngaykhaigiang);
          const duration = parseInt(classItem.thoigianhoc.slice(0, 2), 10); // ví dụ: "36 buổi"

          const endDate = new Date(startDate);
          if (duration === 36) {
            endDate.setMonth(endDate.getMonth() + 3);
          } else if (duration === 24) {
            endDate.setMonth(endDate.getMonth() + 2);
          } else {
            endDate.setMonth(endDate.getMonth() + 2); // default fallback
          }

          return endDate >= today;
        });
        const giaoVienMap = new Map();

        filteredClasses.forEach((cls) => {
          const giangViens = cls.giangVien; // đây là mảng
          if (Array.isArray(giangViens)) {
            giangViens.forEach((gv) => {
              if (gv && !giaoVienMap.has(gv.manguoidung)) {
                giaoVienMap.set(gv.manguoidung, {
                  manguoidung: gv.manguoidung,
                  hoten: gv.hoten,
                });
              }
            });
          }
        });

        setGiaoVienOptions(Array.from(giaoVienMap.values()));

        //setLuuTeachers(teacherRes.data);
        setLuuClasses(filteredClasses); // chỉ set những lớp còn hiệu lực
        setLuuRooms(roomRes.data);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
      }
    };

    fetchData();
  }, []);

function getLessonDaysPerWeek(tenlop, scheduleData) {
  const classData = scheduleData.find(
    (item) => item.tenlop === tenlop || item.tenlophoc === tenlop
  );

  if (!classData) {
    console.warn(`Không tìm thấy lớp ${tenlop} trong dữ liệu lịch học.`);
    return 0;
  }

  let thuhocStr = "";

  // Xử lý thuhoc có thể là string, number, hoặc array
  if (typeof classData.thuhoc === "string") {
    thuhocStr = classData.thuhoc;
  } else if (Array.isArray(classData.thuhoc)) {
    thuhocStr = classData.thuhoc.join(",");
  } else if (typeof classData.thuhoc === "number") {
    thuhocStr = String(classData.thuhoc);
  } else {
    console.warn("Định dạng thuhoc không hợp lệ:", classData.thuhoc);
    return 0;
  }

  // Tách các ngày học ra mảng số nguyên
  const daysArray = thuhocStr
    .split(",")
    .map((d) => parseInt(d.trim()))
    .filter((d) => !isNaN(d));

  return daysArray.length; // trả về số buổi học trong tuần
}

  useEffect(() => {
    const newSchedule = initializeScheduleTemplate();
    const filteredData = scheduleData.filter((data) => {
      const teacherMatch =
        !selectedTeacher ||
        (Array.isArray(data.giangVien) &&
          data.giangVien.some(
            (gv) => gv.manguoidung === parseInt(selectedTeacher)
          ));
      const classMatch =
        !selectedClass ||
        data.tenlophoc === selectedClass ||
        data.tenlop === selectedClass;
      const roomMatch = !selectedRoom || data.tenphonghoc === selectedRoom;

      return teacherMatch && classMatch && roomMatch;
    });

    filteredData.forEach((data) => {
      const day = getDayName(data.thuhoc);
      const timeSlot = getTimeSlot(data.tgbatdau);
      const startDate = new Date(data.ngaykhaigiang);
           
      const totalLessons = parseInt(String(data.thoigianhoc).match(/\d+/)?.[0]); // "36 buổi" => 36
      const lessonDaysPerWeek = getLessonDaysPerWeek(data.tenlophoc || data.tenlophoc, scheduleData);
      const totalWeeks = Math.ceil(totalLessons / lessonDaysPerWeek);
      const durationDays = totalWeeks * 7;

      const endDate = new Date(startDate.getTime() + durationDays* 24 * 60 * 60 * 1000 - 1 * 24 * 60 * 60 * 1000); 

      // let durationMs = 0;
      // if (data.thoigianhoc === "36 buổi")
      //   durationMs = 12 * 7 * 24 * 60 * 60 * 1000;
      // else if (data.thoigianhoc === "24 buổi")
      //   durationMs = 8 * 7 * 24 * 60 * 60 * 1000;

      // const endDate = new Date(
      //   startDate.getTime() + durationMs - 1 * 24 * 60 * 60 * 1000
      // );

      const entry = {
        room: data.tenphonghoc,
        className: role === "admin" ? data.tenlophoc : data.tenlop,
        startTime: data.tgbatdau.slice(0, 5),
        endTime: data.tgketthuc.slice(0, 5),
        ngaykhaigiang: data.ngaykhaigiang,
        ketthuckhoahoc: endDate.toISOString(),
      };

      newSchedule[day][timeSlot].push(entry);
    });

    setSchedule(newSchedule);
  }, [scheduleData, role, selectedTeacher, selectedClass, selectedRoom]);

  if (loading) return <Loader />;

  function getStartOfWeek(date) {
    const day = date.getDay(); // 0 Chủ nhật, 1 Thứ 2, ...
    const diff = day === 0 ? -6 : 1 - day; // nếu Chủ nhật, trừ 6, nếu thứ 2 thì 0, ...
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() + diff);
    startOfWeek.setHours(0, 0, 0, 0);
    return startOfWeek;
  }
  // Hàm tính ngày Thứ 2 của tuần chứa selectedDate
  const startOfWeek = getStartOfWeek(selectedDate);

  return (
    <div className={classes.container}>
      <h1>
        {role === "Học Viên" && "Lịch học:"}
        {role === "Giáo Viên" && "Lịch dạy học:"}
        {role === "admin" && "Lịch học của toàn bộ các lớp trong trung tâm:"}
      </h1>
      {role === "admin" && (
  <div className={classes.filters}>
    <div className={classes.filterItem}>
      <label htmlFor="teacher-select">Giáo viên:</label>
      <select
        id="teacher-select"
        value={selectedTeacher}
        onChange={(e) => setSelectedTeacher(e.target.value)}
      >
        <option value="">Tất cả</option>
        {giaoVienOptions.map((gv) => (
          <option key={gv.manguoidung} value={gv.manguoidung}>
            {gv.hoten}
          </option>
        ))}
      </select>
    </div>

    <div className={classes.filterItem}>
      <label htmlFor="class-select">Lớp:</label>
      <select
        id="class-select"
        value={selectedClass}
        onChange={(e) => setSelectedClass(e.target.value)}
      >
        <option value="">Tất cả</option>
        {luuclasses.map((cls) => (
          <option key={cls.malop} value={cls.tenlophoc}>
            {cls.tenlophoc}
          </option>
        ))}
      </select>
    </div>

    <div className={classes.filterItem}>
      <label htmlFor="room-select">Phòng học:</label>
      <select
        id="room-select"
        value={selectedRoom}
        onChange={(e) => setSelectedRoom(e.target.value)}
      >
        <option value="">Tất cả</option>
        {luurooms.map((room) => (
          <option key={room.maphong} value={room.tenphong}>
            {room.tenphong}
          </option>
        ))}
      </select>
    </div>
  </div>
)}


      <Calendar
        onChange={setSelectedDate}
        value={selectedDate}
        locale="vi-VN"
      />

      <h2>
        {selectedDate.toLocaleDateString("vi-VN", {
          weekday: "long",
          year: "numeric",
          month: "numeric",
          day: "numeric",
        })}
      </h2>

      <table>
        <thead>
          <tr id={classes.day}>
            <th>Ca học</th>
            {daysOfWeek.map((day, index) => (
              <th key={day}>
                Thứ {index + 2} ({getCurrentDate(index)})
              </th>
            ))}
          </tr>
        </thead>
        {shiftTypes.map((shift) => (
          <tr key={shift}>
            <td>{converShift(shift)}</td>
            {daysOfWeek.map((dayName, i) => {
              const lessons = schedule[dayName]?.[shift] || [];

              const dayDate = new Date(startOfWeek);
              dayDate.setDate(startOfWeek.getDate() + i);
              dayDate.setHours(0, 0, 0, 0);

              return (
                <td key={i}>
                  {lessons
                    .filter((data) => {
                      const start = new Date(data.ngaykhaigiang);
                      const end = new Date(data.ketthuckhoahoc);
                      start.setHours(0, 0, 0, 0);
                      end.setHours(0, 0, 0, 0);

                      return dayDate >= start && dayDate <= end;
                    })
                    .map((data, index) => (
                      <p
                        key={index}
                        style={{
                          backgroundColor: getClassColor(data.className),
                          borderRadius: "4px",
                        }}
                      >
                        {`${data.className || "N/A"}`}
                        <span>
                          {data.startTime} - {data.endTime}
                        </span>
                        <span>Phòng học: {data.room}</span>
                      </p>
                    ))}
                </td>
              );
            })}
          </tr>
        ))}
      </table>
    </div>
  );
};

export default Schedule;
