import React, { useState, useEffect } from "react";
import classes from "./Schedule.module.scss";
import axios from "axios";
import Loader from "../../assets/Loader/Loader";
import Calendar from "react-calendar";
import Cookies from "js-cookie";
import "react-calendar/dist/Calendar.css";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";

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

  const [teacherAttendance, setTeacherAttendance] = useState([]);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [currentAttendance, setCurrentAttendance] = useState(null);
  const [attendanceStatus, setAttendanceStatus] = useState("");
  const [attendanceNote, setAttendanceNote] = useState("");

  const classColors = [
        "#784212",
    "#641e16",
    "#512e5f",
        "#17202a",
    "#424949",
     "#154360",
    "#145a32",
    "#7e5109",
    "#626567",
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

  const fetchTeacherAttendance = async () => {
  if (role !== "Giáo Viên") return;

  try {
    // 1. Lấy danh sách điểm danh
    const today = new Date().toLocaleDateString('sv-SE');

    console.log("Fetching attendance for date:", today);
    const attendanceRes = await axios.get(
      //`http://localhost:8080/api/v1/diemdanh/${userId}?ngayHoc=2025-06-13`
       `http://localhost:8080/api/v1/diemdanh/${userId}?ngayHoc=${today}`
    );
    console.log(userId, today)
    console.log(attendanceRes.data)
    // Kiểm tra nếu không có dữ liệu
    if (!attendanceRes.data || attendanceRes.data.length === 0) {
      setTeacherAttendance([]);
      return;
    }


    const updatedAttendance = await Promise.all(
      attendanceRes.data.map(async (item) => {
        console.log('Checking attendance:', {
      id: item.maDiemDanh,
      currentTime: new Date(),
      startTime: `${item.ngayHoc} ${item.thoiGianBatDau}`,
      endTime: `${item.ngayHoc} ${item.thoiGianKetThuc}`,
      currentStatus: item.trangThai
    });
        const status = determineAttendanceStatus(item);
        console.log(`Attendance ID ${item.maDiemDanh} status: ${status}`);
        
        // Nếu quá giờ và chưa điểm danh, thực hiện cập nhật
        if (status === "Vắng mặt" && item.trangThai === "Chưa điểm danh") {
          try {
            await axios.put(
              `http://localhost:8080/api/v1/diemdanh/${item.maDiemDanh}`,
              {
                trangThai: "Vắng mặt",
                ghiChu: "Tự động điểm danh vắng mặt do quá giờ"
              }
            );
            return { ...item, trangThai: "Vắng mặt" };
          } catch (error) {
            console.error(`Lỗi khi cập nhật điểm danh ${item.maDiemDanh}:`, error);
            return item; // Trả về item gốc nếu có lỗi
          }
        }
        return item;
      })
    );

    // 3. Lấy thông tin chi tiết các lớp
    const classPromises = updatedAttendance.map(
      (item) =>
        axios
          .get(
            `http://localhost:8080/api/v1/lophoc/thongtinlopkemdanhsanhhocsinhvagiangvien/${item.maLop}`
          )
          .catch(() => null) // Bắt lỗi nếu không tìm thấy lớp
    );

    const classResponses = await Promise.all(classPromises);

    // 4. Kết hợp dữ liệu cuối cùng
    const combinedData = updatedAttendance.map((item, index) => {
      const classInfo = classResponses[index]?.data;

      return {
        ...item,
        lopHoc: classInfo
          ? {
              tenlophoc: classInfo.tenlophoc,
              tenphonghoc: classInfo.tenphonghoc,
            }
          : {
              tenlophoc: `Lớp ${item.maLop}`,
              tenphonghoc: item.tenphonghoc || "Chưa xác định",
            },
      };
    });

    setTeacherAttendance(combinedData);
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu điểm danh:", error);
    setTeacherAttendance([]);
  }
};
  const getClassName = (attendance) => {
    if (!attendance) return "Không có thông tin lớp";
    return attendance.lopHoc?.tenlophoc || `Lớp ${attendance.maLop}`;
  };

  const getClassRoom = (attendance) => {
    if (!attendance) return "Chưa xác định";
    return (
      attendance.lopHoc?.tenphonghoc ||
      attendance.tenphonghoc ||
      "Chưa xác định"
    );
  };

  // Hàm kiểm tra có thể điểm danh không
  const canTakeAttendance = (attendance) => {
  if (!attendance || attendance.trangThai !== "Chưa điểm danh") {
    return false;
  }

  const now = new Date();
  
  // Chỉ lấy giờ phút hiện tại
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();
  
  // Chuyển đổi thời gian buổi học thành phút tính từ 0:00
  const [startHour, startMinute] = attendance.thoiGianBatDau.split(':').map(Number);
  const [endHour, endMinute] = attendance.thoiGianKetThuc.split(':').map(Number);
  
  const startInMinutes = startHour * 60 + startMinute;
  const endInMinutes = endHour * 60 + endMinute;
  const currentInMinutes = currentHours * 60 + currentMinutes;


  // Có thể điểm danh từ 1h trước khi bắt đầu đến khi kết thúc
  const oneHourBefore = startInMinutes - 60;
  const canTake = currentInMinutes >= oneHourBefore && currentInMinutes <= endInMinutes;
  
  return canTake;
};
  const getStatusClass = (status) => {
    switch (status) {
      case "Có mặt":
        return classes["status-present"];
      case "Đi muộn":
        return classes["status-late"];
      case "Vắng mặt":
        return classes["status-absent"];
      default:
        return classes["status-pending"];
    }
  };
  const determineAttendanceStatus = (attendance) => {
  const now = new Date();
  
  // Chỉ lấy giờ phút hiện tại
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();
  
  // Chuyển đổi thời gian buổi học thành phút tính từ 0:00
  const [startHour, startMinute] = attendance.thoiGianBatDau.split(':').map(Number);
  const [endHour, endMinute] = attendance.thoiGianKetThuc.split(':').map(Number);
  
  const startInMinutes = startHour * 60 + startMinute;
  const endInMinutes = endHour * 60 + endMinute;
  const currentInMinutes = currentHours * 60 + currentMinutes;

  // Tính các mốc thời gian quan trọng (tính bằng phút)
  const oneHourBefore = startInMinutes - 60;
  const fifteenMinutesAfter = startInMinutes + 15;

  // Xác định trạng thái chỉ dựa trên giờ
  if (currentInMinutes < oneHourBefore) {
    return null;
  }
  if (currentInMinutes <= startInMinutes) {
    return "Có mặt";
  }
  if (currentInMinutes <= fifteenMinutesAfter) {
    return "Có mặt";
  }
  if (currentInMinutes <= endInMinutes) {
    return "Đi muộn";
  }
  return "Vắng mặt";
};
  // Hàm mở modal điểm danh
  const handleOpenAttendance = (attendance) => {
    const status = determineAttendanceStatus(attendance);

    if (status === null) {
      alert("Chỉ được điểm danh trước giờ học 1 tiếng");
      return;
    }

    setCurrentAttendance(attendance);
    setAttendanceStatus(status);
    setShowAttendanceModal(true);
  };

  // Hàm gửi điểm danh
  const handleSubmitAttendance = async () => {
    try {
      await axios.put(
        `http://localhost:8080/api/v1/diemdanh/${currentAttendance.maDiemDanh}`,
        {
          trangThai: attendanceStatus,
          ghiChu: attendanceNote,
        }
      );
      setShowAttendanceModal(false);
      fetchTeacherAttendance(); // Refresh data
      toast.success("Điểm danh thành công!");
    } catch (error) {
      console.error("Lỗi khi điểm danh:", error);
      alert(
        "Điểm danh thất bại: " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  const CustomModal = ({ show, onHide, children }) => {
    if (!show) return null;

    return (
      <div className={classes.modalOverlay}>
        <div className={classes.modalContent}>{children}</div>
      </div>
    );
  };

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
    fetchTeacherAttendance();
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
    // Lọc tất cả các bản ghi thuộc lớp này
    const classRecords = scheduleData.filter(
      (item) => item.tenlophoc === tenlop || item.tenlop === tenlop
    );

    if (classRecords.length === 0) {
      console.warn(`Không tìm thấy lớp ${tenlop} trong dữ liệu lịch học.`);
      return 0;
    }

    // Tạo Set để lưu các thứ học duy nhất
    const uniqueDays = new Set();

    classRecords.forEach((record) => {
      // Chuyển đổi thứ học sang number dù đầu vào là string hay number
      const thuHoc =
        typeof record.thuhoc === "string"
          ? parseInt(record.thuhoc.trim())
          : record.thuhoc;

      // Chỉ thêm nếu là số hợp lệ (2-8)
      if (!isNaN(thuHoc) && thuHoc >= 2 && thuHoc <= 8) {
        uniqueDays.add(thuHoc);
      }
    });

    return uniqueDays.size;
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

      const totalLessons = parseInt(
        String(data.thoigianhoc).match(/\d+/)?.[0] || 0
      ); // "36 buổi" => 36
      const lessonDaysPerWeek = getLessonDaysPerWeek(
        data.tenlophoc || data.tenlop,
        scheduleData
      );
      console.log(
        `Lớp: ${data.tenlophoc || data.tenlop}, Tổng buổi: ${totalLessons}, Ngày học trong tuần: ${lessonDaysPerWeek}`
      );
      const totalWeeks = Math.ceil(totalLessons / lessonDaysPerWeek);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + totalWeeks * 7 - 1);

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
      <ToastContainer></ToastContainer>
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

      {/* Phần điểm danh cho giáo viên */}
      {role === "Giáo Viên" && (
  teacherAttendance.length === 0 ? (
    <div className={classes.noClassesMessage}>
      <p>Không có buổi học nào cần điểm danh hôm nay</p>
    </div>
  ) : (
        <div className={classes.attendanceSection}>
          <h3>Điểm danh hôm nay</h3>
          <div className={classes.attendanceList}>
            {teacherAttendance.map((attendance) => (
              <div
                key={attendance.maDiemDanh}
                className={classes.attendanceItem}
              >
                <div>
                  <strong>{getClassName(attendance)}</strong>
                  <p>Phòng: {getClassRoom(attendance)}</p>
                  <p>
                    {attendance.ngayHoc} | {attendance.thoiGianBatDau} -{" "}
                    {attendance.thoiGianKetThuc}
                  </p>
                  <p className={classes.attendanceStatus}>
                    Trạng thái:{" "}
                    <span className={getStatusClass(attendance.trangThai)}>
                      {attendance.trangThai}
                    </span>
                  </p>

                  {/* Hiển thị thông tin giáo viên */}
                  {attendance.lopHoc?.giangVien?.length > 0 && (
                    <p>
                      Giáo viên:{" "}
                      {attendance.lopHoc.giangVien
                        .map((gv) => gv.hoten)
                        .join(", ")}
                    </p>
                  )}
                </div>
                {canTakeAttendance(attendance) ? (
                  <button
                    onClick={() => handleOpenAttendance(attendance)}
                    className={classes.attendanceButton}
                  >
                    Điểm danh
                  </button>
                ) : (
                  <button
                    className={`${classes.attendanceButton} ${classes.disabledButton}`}
                    disabled
                    title={
                      attendance.trangThai !== "Chưa điểm danh"
                        ? "Đã điểm danh"
                        : "Chưa đến giờ điểm danh"
                    }
                  >
                    {attendance.trangThai !== "Chưa điểm danh"
                      ? "Đã điểm danh"
                      : "Chưa đến giờ"}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )
)}

      <CustomModal
        show={showAttendanceModal}
        onHide={() => setShowAttendanceModal(false)}
      >
        <div className={classes.modalHeader}>
          <h3>Điểm danh lớp {getClassName(currentAttendance)}</h3>
          <button onClick={() => setShowAttendanceModal(false)}>X</button>
        </div>
        <div className={classes.modalBody}>
          <div className={classes.attendanceInfo}>
            <p>
              <strong>Trạng thái:</strong> {attendanceStatus}
            </p>
            <p>
              <strong>Thời gian:</strong> {currentAttendance?.thoiGianBatDau} -{" "}
              {currentAttendance?.thoiGianKetThuc}
            </p>
          </div>
          <div className={classes.attendanceForm}>
            <div className={classes.formGroup}>
              <label>Ghi chú (nếu có):</label>
              <textarea
                value={attendanceNote}
                onChange={(e) => setAttendanceNote(e.target.value)}
                placeholder="Nhập ghi chú..."
                rows={3}
              />
            </div>
          </div>
        </div>
        <div className={classes.modalFooter}>
          <button onClick={handleSubmitAttendance}>Xác nhận điểm danh</button>
        </div>
      </CustomModal>
    </div>
  );
};

export default Schedule;

