import React, { useEffect, useState } from "react";
import classes from "./Course.module.scss";
import axios from "axios";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/flatpickr.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loader from "../../assets/Loader/Loader";

const Course = () => {
  const [courses, setCourses] = useState([]);
  const [currentCourse, setCurrentCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState(false);

  useEffect(() => {
    axios
      .get("http://localhost:8080/api/v1/khoahoc")
      .then((res) => {
        setCourses(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <Loader />;
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("sv-SE");
  };

  const handleEdit = (course) => {
    setCurrentCourse(course);
    setEdit(true);
  };

  const handleSave = () => {
    console.log(currentCourse);
    axios.put(
      `http://localhost:8080/api/v1/khoahoc/${currentCourse.makhoahoc}`,
      currentCourse
    );
    toast.success("Cập nhật thành công");
    setEdit(false);
    // Update the courses state after successful update
    const updatedCourses = courses.map((course) =>
      course.makhoahoc === currentCourse.makhoahoc ? currentCourse : course
    );
    setCourses(updatedCourses);
  };

//   const handleAdd = () => {
//     //
//   };

  return (
    <div className={classes.course} onClick={() => setEdit(false)}>
      <h1>Các khóa học hiện có</h1>
      <ToastContainer />

      <div className={classes.course_list}>
        <table>
          <thead>
            <tr>
              <th scope="col">STT</th>
              <th scope="col">Tên khóa học</th>
              <th scope="col">Học phí</th>
              <th scope="col">Ưu đãi</th>
              <th scope="col">Thời gian ưu đãi</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => (
              <tr
                key={course.makhoahoc}
                className={classes.course_item}
                scope="row"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(course);
                }}
              >
                <td>{course.makhoahoc}</td>
                <td>{course.tenkhoahoc}</td>
                <td>{formatCurrency(course.hocphi)}</td>
                <td>{course.uudai ? `${course.uudai}%` : "Chưa có"}</td>
                <td>
                  {course.thoigianuudai ? `${course.thoigianuudai}` : "Chưa có"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {edit && (
          <div className={classes.edit} onClick={(e) => e.stopPropagation()}>
            <div className={classes.header}>
              <h1>Thông tin khóa học</h1>
              <button onClick={() => setEdit(false)}>X</button>
            </div>
            <div className={classes.edit_form}>
              <label htmlFor="tenkhoahoc">Tên khóa học</label>
              <input
                type="text"
                id="tenkhoahoc"
                value={currentCourse.tenkhoahoc}
                onChange={(e) =>
                  setCurrentCourse({
                    ...currentCourse,
                    tenkhoahoc: e.target.value,
                  })
                }
              />
              <label htmlFor="hocphi">Học phí</label>
              <input
                type="number"
                id="hocphi"
                value={currentCourse.hocphi}
                className={classes.no_spin}
                onChange={(e) =>
                  setCurrentCourse({ ...currentCourse, hocphi: e.target.value })
                }
              />
              <label htmlFor="uudai">Ưu đãi</label>
              <input
                type="number"
                id="uudai"
                value={currentCourse.uudai}
                className={classes.no_spin}
                onChange={(e) =>
                  setCurrentCourse({ ...currentCourse, uudai: e.target.value })
                }
              />
              <label htmlFor="thoigianuudai">Thời gian ưu đãi</label>
              <Flatpickr
                value={new Date(currentCourse.thoigianuudai)} // Convert initial string to Date object
                onChange={([date]) => {
                  const formattedDate = formatDate(date); // Format the selected date
                  setCurrentCourse({
                    ...currentCourse,
                    thoigianuudai: formattedDate,
                  });
                }}
              />
            </div>

            <button onClick={handleSave}>Lưu</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Course;