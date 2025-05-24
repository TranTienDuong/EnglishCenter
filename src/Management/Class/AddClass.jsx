import React, { useState, useEffect } from "react";
import classes from "./AddClass.module.scss";
import axios from "axios";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/flatpickr.css";

export const AddClass = ({ setIsAddingClass, refreshClasses }) => {
  const [courseData, setCourseData] = useState([]);
  const [roomData, setRoomData] = useState([]);
  const [teacherData, setTeacherData] = useState([]);
  const [addInfo, setAddInfo] = useState({
    cahoc: "",
    giaovien: "",
    phonghoc: "",
    tenlophoc: "",
    ngaykhaigiang: null,
    thoigianhoc: "",
    thuhoc: [],
    tenkhoahoc: "",
  });

  const weekday = {
    2: "Thứ 2",
    3: "Thứ 3",
    4: "Thứ 4",
    5: "Thứ 5",
    6: "Thứ 6",
    7: "Thứ 7",
  };

  const shift = ["Sáng", "Chiều", "Tối"];

  useEffect(() => {
    axios
      .get(
        "http://localhost:8080/api/v1/khoahoc"
      )
      .then((res) => {
        setCourseData(res.data);
      })
      .catch((error) => {
        console.log("Error fetching course: ", error);
      });
  }, []);

  const convertDate = (date) => {
    const newDate = new Date(date);

    // Extract day, month, and year
    const day = String(newDate.getDate()).padStart(2, "0"); // Ensures two digits
    const month = String(newDate.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const year = newDate.getFullYear();

    // Format in dd-mm-yyyy
    return `${day}/${month}/${year}`;
  };


  const handleAddClass = () => {
    const thuhocString = addInfo.thuhoc.join(",");

    const payload = {
      ...addInfo,
      thuhoc: thuhocString,
      ngaykhaigiang: convertDate(addInfo.ngaykhaigiang),
    };
    console.log("Payload:", payload);

    axios
      .post(
        `http://localhost:8080/api/v1/lophoc`,
        {
          cahoc: payload.cahoc,
          giaovien: payload.giaovien,
          phonghoc: payload.phonghoc,
          tenlophoc: payload.tenlophoc,
          ngaykhaigiang: payload.ngaykhaigiang,
          thoigianhoc: payload.thoigianhoc,
          thuhoc: payload.thuhoc,
          tenkhoahoc: payload.tenkhoahoc,
        }
      )
      .then(() => {
        refreshClasses();
        setIsAddingClass(false); 
        alert("Tạo lớp học mới thành công");
      })
      .catch((error) => {
        if (error.response) {
          console.error("Error response data:", error.response.data); // Log the detailed error
        } else {
          console.error("Error:", error.message);
        }
      });
  };

  useEffect(() => {
    setRoomData([]);
    if (addInfo.thuhoc.length > 0 && addInfo.cahoc !== "") {
      axios
        .get(
          `http://localhost:8080/api/v1/thoikhoabieu/phonghoctuongung`,
          {
            params: {
              thuHoc: addInfo.thuhoc.toString(),
              caHoc: addInfo.cahoc,
            },
          }
        )
        .then((res) => {
          setRoomData(res.data);
        })
        .catch((error) => {
          console.error("Error fetching rooms:", error);
        });
    }
  }, [addInfo.thuhoc, addInfo.cahoc]);

  useEffect(() => {
  setTeacherData([]); // Xóa dữ liệu giáo viên trước khi gọi API
  if (addInfo.tenkhoahoc && addInfo.thuhoc.length > 0 && addInfo.cahoc && addInfo.ngaykhaigiang) {
    // Kiểm tra nếu tất cả các trường đều có giá trị hợp lệ
    const ngayFormatted = new Date(addInfo.ngaykhaigiang)
      .toISOString()
      .split("T")[0];
    axios
      .get(
        `http://localhost:8080/api/v1/nguoidung/giaovientronglich`,
        {
          params: {
            tenKhoaHoc: addInfo.tenkhoahoc,
            thuHoc: addInfo.thuhoc.join(","), // Đảm bảo là chuỗi khi gửi
            caHoc: addInfo.cahoc,
            ngayKhaiGiang: ngayFormatted, // Chuyển đổi ngày về định dạng dd-mm-yyyy
          },
        }
      )
      .then((res) => {
        setTeacherData(res.data);
      })
      .catch((error) => {
        console.error("Error fetching teacher", error);
      });
  }
}, [addInfo.tenkhoahoc, addInfo.thuhoc, addInfo.cahoc, addInfo.ngaykhaigiang]);

  return (
    <div className={classes.container}>
      <div className={classes.header}>
        <h1>Thêm khóa học</h1>
        <button onClick={() => setIsAddingClass(false)}>Back</button>
      </div>

      <div className={classes.input_wrapper}>
        <label htmlFor="">Tên lớp học</label>
        <input
          type="text"
          name="tenlophoc"
          id="tenlophoc"
          autoComplete="off"
          onChange={(e) =>
            setAddInfo((info) => ({ ...info, tenlophoc: e.target.value }))
          }
        />

        <label htmlFor="">Khóa học</label>
        <select
          name=""
          id=""
          onChange={(e) => {
            setAddInfo((info) => ({ ...info, tenkhoahoc: e.target.value }));
          }}
        >
          <option value="">Chọn khóa học</option>
          {courseData.map((course) => (
            <option key={course.makhoahoc} value={course.tenkhoahoc}>
              {course.tenkhoahoc}
            </option>
          ))}
        </select>

        <label htmlFor="">Thứ học</label>
        <div className={classes.weekday}>
          {Object.entries(weekday).map(([key, value]) => (
            <div id={classes.day} key={key}>
              <label htmlFor="key">{value}</label>
              <input
                type="checkbox"
                id={key}
                value={key}
                name={key}
                onChange={(e) =>
                  setAddInfo((prev) => ({
                    ...prev,
                    thuhoc: e.target.checked
                      ? [...prev.thuhoc, e.target.value] // Add value to array if checkbox is checked
                      : prev.thuhoc.filter((day) => day !== e.target.value), // Remove value if checkbox is unchecked
                  }))
                }
              />
            </div>
          ))}
        </div>

        <label htmlFor="">Ca học</label>
        <select
          name=""
          id=""
          onChange={(e) =>
            setAddInfo((prev) => ({ ...prev, cahoc: e.target.value }))
          }
        >
          <option value="">Chọn ca học</option>
          {shift.map((shift, index) => (
            <option key={index} value={shift}>
              {shift}
            </option>
          ))}
        </select>

        {roomData && (
          <>
            <label htmlFor="">Phòng</label>
            <select
              name="phonghoc"
              id="phonghoc"
              onChange={(e) =>
                setAddInfo((info) => ({ ...info, phonghoc: e.target.value }))
              }
            >
              <option value="">Chọn phòng học</option>
              {roomData.map((data, index) => (
                <option key={index}>{data}</option>
              ))}
            </select>
          </>
        )}
        <label htmlFor="">Ngày khai giảng</label>
        <Flatpickr
          onChange={([date]) =>
            setAddInfo((info) => ({
              ...info,
              ngaykhaigiang: date,
            }))
          }
        />

        {teacherData && (
          <>
            <label htmlFor="">Giáo viên</label>
            <select
              name="giaovien"
              id="giaovien"
              onChange={(e) =>
                setAddInfo((info) => ({ ...info, giaovien: e.target.value }))
              }
            >
              <option value="">Chọn giáo viên</option>
              {teacherData.map((data, index) => (
                <option key={index} disabled={data.includes("Trùng")}>
                  {data}
                </option>
              ))}
            </select>
          </>
        )}

        <label htmlFor="">Thời gian học</label>
        <select
           name="thoigianhoc"
  id="thoigianhoc"
  value={addInfo.thoigianhoc}
          onChange={(e) =>
            setAddInfo((info) => ({ ...info, thoigianhoc: e.target.value }))
          }
        >
          <option value="">Chọn thời gian học</option>
          <option value="24 buổi">24 buổi</option>
          <option value="36 buổi">36 buổi</option>
        </select>

        <button onClick={handleAddClass}>Thêm</button>
      </div>
    </div>
  );
};