import React, { useState, useEffect } from "react";
import classes from "./Class.module.scss";
import axios from "axios";
import Loader from "../../assets/Loader/Loader";
import Cookies from "js-cookie";
import { ClassDetail } from "./ClassDetail";
import { AddClass } from "./AddClass";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

const Class = () => {
  const name = sessionStorage.getItem("name");
  const role = sessionStorage.getItem("role");
  const userId = sessionStorage.getItem("userId");

  const [loading, setLoading] = useState(true);

  const [classData, setClassData] = useState([]);
  const [outdatedClasses, setOutdatedClasses] = useState([]);

  const [classCondition, setClassCondition] = useState("current");
  const [classDataForUser, setClassDataForUser] = useState([]);

  const [courses, setCourses] = useState({
    ieltsmatgoc: {
      name: "Khóa IELTS mất gốc",
      class: [],
    },
    ieltscaptoc: {
      name: "Khóa IELTS cấp tốc",
      class: [],
    },
    ielts1kem1: {
      name: "Khóa IELTS 1 kèm 1",
      class: [],
    },
    ielts55: {
      name: "Khóa IELTS 5.0-5.5",
      class: [],
    },
    ielts65: {
      name: "Khóa IELTS 6.0-6.5",
      class: [],
    },
    ielts75: {
      name: "Khóa IELTS 7.0+",
      class: [],
    },
  });
  const [isShowingClassInfo, setIsShowingClassInfo] = useState(null);
  const [isAddingClass, setIsAddingClass] = useState(false);
  const [isClassDetail, setIsClassDetail] = useState(null);

  // Fetch class data from API
  useEffect(() => {
    axios
      .get("http://localhost:8080/api/v1/lophoc")
      .then((res) => {
        const today = new Date();

        const nonMatchingClasses = res.data.filter((classItem) => {
          const startDate = new Date(classItem.ngaykhaigiang);
          const duration = parseInt(classItem.thoigianhoc.slice(0, 2), 10);

          const endDate = new Date(startDate);
          if (duration === 36) {
            endDate.setMonth(endDate.getMonth() + 3);
          } else if (duration === 24) {
            endDate.setMonth(endDate.getMonth() + 2);
          }

          return endDate < today;
        });

        const matchingClasses = res.data.filter((classItem) => {
          const startDate = new Date(classItem.ngaykhaigiang);
          const duration = parseInt(classItem.thoigianhoc.slice(0, 2), 10);

          const endDate = new Date(startDate);
          if (duration === 36) {
            endDate.setMonth(endDate.getMonth() + 3);
          } else if (duration === 24) {
            endDate.setMonth(endDate.getMonth() + 2);
          }

          return endDate >= today;
        });

        setClassData(matchingClasses);
        setLoading(false);

        setOutdatedClasses(nonMatchingClasses);

        nonMatchingClasses.forEach(async (classItem) => {
          try {
            const res = await axios.get(
              `http://localhost:8080/api/v1/lophoc/${classItem.malop}/thoikhoabieu`
            );

            if (res.data && res.data.length > 0) {
              await axios.put(
                `http://localhost:8080/api/v1/thoikhoabieu/${classItem.malop}`
              );
              console.log(
                `Đã xoá malop cho lớp ${classItem.malop} khỏi thời khoá biểu.`
              );

              const lopHocDetail = await axios.get(
                `http://localhost:8080/api/v1/lophoc/thongtinlopkemdanhsanhhocsinhvagiangvien/${classItem.malop}`
              );

              const danhSachGiangVien = lopHocDetail.data.giangVien;

              // 3. Cập nhật trạng thái giáo viên thành "Hoàn Thành"
              for (const gv of danhSachGiangVien) {
                if (gv.trangThai === "Đang Học") {
                  await axios.put(
                    `http://localhost:8080/api/v1/nguoilophoc/${gv.manguoidung}/${classItem.malop}`,
                    {
                      trangThai: "Hoàn Thành",
                    }
                  );
                  console.log(
                    `Cập nhật trạng thái giáo viên ${gv.hoten} thành "Hoàn Thành".`
                  );
                }
              }
            }
          } catch (error) {
            if (error.response && error.response.status === 404) {
              // Không làm gì cả nếu lỗi là 404
            } else {
              // Hiện lỗi chỉ nếu KHÔNG phải lỗi 404
              console.error(`Lỗi khi kiểm tra lớp ${classItem.malop}:`, error);
            }
          }
        });
      })
      .catch((error) => {
        console.log("Error fetching data", error);
        setLoading(false);
      });
  }, []);

  // Update courses based on classData
  useEffect(() => {
    if (role === "admin") {
      if (classData.length > 0) {
        const updatedCourses = {
          ieltsmatgoc: { ...courses.ieltsmatgoc, class: [] },
          ieltscaptoc: { ...courses.ieltscaptoc, class: [] },
          ielts1kem1: { ...courses.ielts1kem1, class: [] },
          ielts55: { ...courses.ielts55, class: [] },
          ielts65: { ...courses.ielts65, class: [] },
          ielts75: { ...courses.ielts75, class: [] },
        };

        const source =
          classCondition === "current" ? classData : outdatedClasses;

        source.forEach((classItem) => {
          const { tenkhoahoc } = classItem;
          if (tenkhoahoc === "Khóa IELTS mất gốc")
            updatedCourses.ieltsmatgoc.class.push(classItem);
          else if (tenkhoahoc === "Khóa IELTS cấp tốc")
            updatedCourses.ieltscaptoc.class.push(classItem);
          else if (tenkhoahoc === "Khóa IELTS 1 kèm 1")
            updatedCourses.ielts1kem1.class.push(classItem);
          else if (tenkhoahoc === "Khóa IELTS 5.0-5.5")
            updatedCourses.ielts55.class.push(classItem);
          else if (tenkhoahoc === "Khóa IELTS 6.0-6.5")
            updatedCourses.ielts65.class.push(classItem);
          else if (tenkhoahoc === "Khóa IELTS 7.0+")
            updatedCourses.ielts75.class.push(classItem);
        });

        setCourses(updatedCourses);
      }
    } else if (role === "Giáo Viên") {
      const userClasses = classData.filter(
        (classItem) => classItem.giangVien[0].hoten === name
      );
      setClassDataForUser(userClasses);
    } else if (role === "Học Viên") {
      const userClasses = classData
        .filter((classItem) =>
          classItem.hocvien.some((hv) => hv.hoten === name && hv.trangThai !== "Chuyển Lớp")
        )
        .map((item) => {
          const clone = { ...item };
          delete clone.hocvien;
          return clone;
        });
      setClassDataForUser(userClasses);
    }
  }, [classData, classCondition, role, name, outdatedClasses]);

  const coursesArray = Object.values(courses);
  const classUserArray = Object.values(classDataForUser);
  const fetchClasses = () => {
    setLoading(true);
    axios
      .get("http://localhost:8080/api/v1/lophoc")
      .then((res) => {
        const today = new Date();

        const nonMatchingClasses = res.data.filter((classItem) => {
          const startDate = new Date(classItem.ngaykhaigiang);
          const duration = parseInt(classItem.thoigianhoc.slice(0, 2), 10);

          const endDate = new Date(startDate);
          if (duration === 36) {
            endDate.setMonth(endDate.getMonth() + 3);
          } else if (duration === 24) {
            endDate.setMonth(endDate.getMonth() + 2);
          }

          return endDate < today;
        });

        const matchingClasses = res.data.filter((classItem) => {
          const startDate = new Date(classItem.ngaykhaigiang);
          const duration = parseInt(classItem.thoigianhoc.slice(0, 2), 10);

          const endDate = new Date(startDate);
          if (duration === 36) {
            endDate.setMonth(endDate.getMonth() + 3);
          } else if (duration === 24) {
            endDate.setMonth(endDate.getMonth() + 2);
          }

          return endDate >= today;
        });

        setClassData(matchingClasses);
        setOutdatedClasses(nonMatchingClasses);
        setLoading(false);
      })
      .catch((error) => {
        console.log("Error fetching data", error);
        setLoading(false);
      });
  };

  if (loading) {
    return <Loader />;
  }

  if (isAddingClass) {
    return (
      <AddClass
        setIsAddingClass={setIsAddingClass}
        courses={courses}
        refreshClasses={fetchClasses}
      />
    );
  }

  if (isClassDetail) {
    return (
      <ClassDetail
        detail={isClassDetail}
        setIsClassDetail={setIsClassDetail}
        refreshClasses={fetchClasses}
        currentUserId={userId}
      />
    );
  }

  const handleClassColor = (startDate, duration) => {
    const ngaykhaigiang = new Date(startDate);
    const thoigianhoc = parseInt(duration.slice(0, 2), 10);
    const ngayketthuc = new Date(ngaykhaigiang);

    const today = new Date();

    if (thoigianhoc == 36) {
      ngayketthuc.setMonth(ngayketthuc.getMonth() + 3);
    } else if (thoigianhoc == 24) {
      ngayketthuc.setMonth(ngayketthuc.getMonth() + 2);
    }

    if (today < ngaykhaigiang) {
      return `${classes.cholop}`;
    } else if (today >= ngaykhaigiang && today <= ngayketthuc) {
      return `${classes.danghoc}`;
    } else {
      return `${classes.ketthuc}`;
    }
  };
const handleClickClass = async (classItem) => {
  try {
    const res = await axios.get(`http://localhost:8080/api/v1/lophoc/thongtinlopkemdanhsanhhocsinhvagiangvien/${classItem.malop}`);
    setIsClassDetail(res.data); // detailState sẽ có .hocvien
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết lớp:", error);
  }
};
  return (
    <div className={classes.container}>
      <h1>
        {classCondition === "current"
          ? "Danh sách các lớp học"
          : "Danh sách các lớp học đã kết thúc"}
      </h1>
      {role === "admin" ? (
        <>
          {classCondition === "current" && (
            <button
              id={classes.add_class_btn}
              onClick={() => setIsAddingClass(true)}
            >
              <span>
                <FontAwesomeIcon icon={faPlus} />
              </span>
              Thêm lớp học mới
            </button>
          )}

          <button
            id={classes.outdated_class_btn}
            onClick={() =>
              setClassCondition(
                classCondition === "current" ? "old" : "current"
              )
            }
          >
            {classCondition === "current"
              ? "Các lớp học đã kết thúc"
              : "Trở lại"}
          </button>

          {coursesArray.map((item, index) => (
            <div key={index} className={classes.individual_course}>
              <h2>
                <span id={classes.course_span}>{item.class.length}</span>
                {item.name}
              </h2>
              <div className={classes.wrapper}>
                {item.class.map((classItem) => (
                  <div
                    key={classItem.malop}
                    className={classes.individual_class}
                    onMouseEnter={() => setIsShowingClassInfo(classItem.malop)}
                    onMouseLeave={() => setIsShowingClassInfo(null)}
                    onClick={() => setIsClassDetail(classItem)}
                  >
                    <button
                      className={handleClassColor(
                        classItem.ngaykhaigiang,
                        classItem.thoigianhoc
                      )}
                    >
                      {classItem.tenlophoc}
                    </button>
                    <div
                      className={`${classes.class_info} ${
                        isShowingClassInfo === classItem.malop
                          ? classes.show
                          : ""
                      }`}
                    >
                      <p>
                        Ca học: <span>{classItem.cahoc}</span>
                      </p>
                      <p>
                        Thứ học: <span>{classItem.thuhoc}</span>
                      </p>
                      <p>
                        Phòng học: <span>{classItem.tenphonghoc}</span>
                      </p>
                      <p>
                        Học viên: <span>{classItem.hocvien.length}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </>
      ) : (
        <div className={classes.classUser}>
          {classUserArray.map((classUser) => (
            <button
              onClick={() =>  handleClickClass(classUser)}
              key={classUser.malop}
            >
              {classUser.tenlophoc}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Class;
