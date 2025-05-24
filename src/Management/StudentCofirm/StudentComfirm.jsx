import React, { useState, useEffect } from "react";
import classes from "./StudentConfirm.module.scss";
import axios from "axios";
import {
  faChevronRight,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loader from "../../assets/Loader/Loader";

const StudentComfirm = () => {
  const [studentConfirm, setStudentConfirm] = useState([]);
  const [studentNotConfirm, setStudentNotConfirm] = useState([]);
  const [classInfo, setClassInfo] = useState([]);
  const [choosenClass, setChoosenClass] = useState([]);
  const [choosenConfirmInfo, setChoosenConfirmInfo] = useState(null);
  const [isShowingInfo, setIsShowingInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  let loadCounter = 0;

  useEffect(() => {
    const checkIfLoadingComplete = () => {
      loadCounter++;
      if (loadCounter === 2) {
        setIsLoading(false); // All calls completed
      }
    };

    axios
      .get(`http://localhost:8080/api/v1/xacnhan`)
      .then((res) => {
        setStudentConfirm(res.data);
        checkIfLoadingComplete();
      })
      .catch((err) => {
        console.log("Error fetching student confirm: ", err);
        checkIfLoadingComplete(); // Even on error, proceed
      });

    axios
      .get(`http://localhost:8080/api/v1/lophoc`)
      .then((res) => {
        setClassInfo(res.data);
        checkIfLoadingComplete();
      })
      .catch((err) => {
        console.log("Error fetching class info: ", err);
        checkIfLoadingComplete(); // Even on error, proceed
      });
  }, []);

  useEffect(() => {
    setStudentNotConfirm(
      studentConfirm.filter((data) => data.trangthai !== "Hoàn thành" && data.trangthai !== "Hoàn Thành")
    );
  }, [studentConfirm]);

  console.log("Hien ",studentNotConfirm);

  if (isLoading) {
    return <Loader />;
  }

  const handleConfirmDetail = (confirm) => {
    setIsShowingInfo((prev) =>
      prev === confirm.maxacnhan ? null : confirm.maxacnhan
    );
    setChoosenConfirmInfo(confirm);
    filterClass(confirm.tenkhoahoc);
  };

  const filterClass = (courseName) => {
  setChoosenClass(
    classInfo.filter((info) =>
      info.tenkhoahoc.toLowerCase().includes(courseName.toLowerCase())
    )
  );
};


  const handleConfirmStudent = async () => {
  try {
    if (choosenConfirmInfo.trangthai === "Học Tiếp") {

      const res = await axios.get("http://localhost:8080/api/v1/nguoidung");
      const danhSachNguoiDung = res.data;

      const nguoiDung = danhSachNguoiDung.find((nd) =>
        nd.hoten === choosenConfirmInfo.hoten &&
        nd.email === choosenConfirmInfo.email &&
        nd.ngaysinh?.slice(0, 10) === choosenConfirmInfo.ngaysinh?.slice(0, 10) &&
        nd.gioitinh === choosenConfirmInfo.gioitinh
      );

      if (!nguoiDung) {
        toast.error("Không tìm thấy mã người dùng để thêm lớp mới");
        return;
      }

      const maNguoiDung = nguoiDung.manguoidung;

      const selectedClass = choosenClass.find(
        (cls) => cls.tenlophoc === choosenConfirmInfo.tenlophoc
      );

      if (!selectedClass) {
        toast.error("Không tìm thấy mã lớp học tương ứng");
        return;
      }

      const maLop = selectedClass.malop;

      await axios.post(`http://localhost:8080/api/v1/nguoilophoc/${maNguoiDung}/${maLop}`);
    }
    await axios.put(
      `http://localhost:8080/api/v1/xacnhan/${choosenConfirmInfo.maxacnhan}`,
      {
        hoten: choosenConfirmInfo.hoten,
        ngaysinh: choosenConfirmInfo.ngaysinh,
        gioitinh: choosenConfirmInfo.gioitinh,
        sdt: choosenConfirmInfo.sdt,
        diachi: choosenConfirmInfo.diachi,
        email: choosenConfirmInfo.email,
        ngaygui: choosenConfirmInfo.ngaygui,
        tenlophoc: choosenConfirmInfo.tenlophoc,
        trangthai: "Hoàn Thành",
      }
    );

    setStudentConfirm((prev) =>
      prev.map((item) =>
        item.maxacnhan === choosenConfirmInfo.maxacnhan
          ? { ...item, trangthai: "Hoàn Thành" }
          : item
      )
    );
    setChoosenConfirmInfo(null);
    toast.success("Xác nhận thành công");

  } catch (error) {
    console.log(error);
    toast.error("Xảy ra lỗi khi xử lý đơn nhập học");
  }
};


  return (
    <div className={classes.container}>
      <h1>Xác nhận học viên</h1>
      <ToastContainer />
      <div className={classes.wrapper}>
        <h2>
          Đơn xác nhận đang chờ được xử lý:{" "}
          <span>{studentNotConfirm.length}</span>
        </h2>
        {studentNotConfirm.map((confirm, _) => (
          <>
            <div
              className={classes.individual_confirm}
              key={confirm.maxacnhan}
              onClick={() => {
                handleConfirmDetail(confirm);
                setChoosenConfirmInfo(confirm);
                filterClass(confirm.tenkhoahoc);
              }}
            >
              <div className={classes.confirm_text}>
                <p id={classes.hoten}>
                  {confirm.hoten} <span>[{confirm.trangthai}]</span>
                </p>
                <p>
                  {isShowingInfo === confirm.maxacnhan ? (
                    <FontAwesomeIcon icon={faChevronDown} />
                  ) : (
                    <FontAwesomeIcon icon={faChevronRight} />
                  )}
                </p>
              </div>

              <div
                className={`${classes.confirm_detail} ${
                  isShowingInfo === confirm.maxacnhan ? classes.show : ""
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                <p>
                  Mã đơn xác nhận: <span>{confirm.maxacnhan}</span>
                </p>
                <p>
                  Họ tên: <span>{confirm.hoten}</span>
                </p>
                <p>
                  Ngày sinh: <span>{confirm.ngaysinh}</span>
                </p>
                <p>
                  Giới tính: <span>{confirm.gioitinh}</span>
                </p>
                <p>
                  Điện thoại: <span>{confirm.sdt}</span>
                </p>
                <p>
                  Địa chỉ: <span>{confirm.diachi}</span>
                </p>
                <p>
                  Email: <span>{confirm.email}</span>
                </p>
                <p>
                  Ngày gửi: <span>{confirm.ngaygui}</span>
                </p>
                <p>
                  Khóa học đăng ký: <span>{confirm.tenkhoahoc}</span>
                </p>
                <select
                  name=""
                  id=""
                  onChange={(e) =>
                    setChoosenConfirmInfo((confirm) => ({
                      ...confirm,
                      tenlophoc: e.target.value,
                    }))
                  }
                >
                  {choosenClass && choosenClass.length > 0 ? (
                    <>
                      <option>Chọn lớp học</option>
                      {(() => {
                        let hasClassesInRange = false;

                        const options = choosenClass.map((choosenClass) => {
                          const startDate = new Date(
                            choosenClass.ngaykhaigiang
                          );
                          const currentDate = new Date();

                          const timeDiff = currentDate - startDate;
                          const diffInDay = timeDiff / (1000 * 60 * 60 * 24);

                          if (diffInDay < 15) {
                            hasClassesInRange = true;
                            return (
                              <option
                                key={choosenClass.malop}
                                value={choosenClass.tenlophoc}
                              >
                                {choosenClass.tenlophoc} / Thứ học:{" "}
                                {choosenClass.thuhoc} / Ca học:{" "}
                                {choosenClass.cahoc} / Phòng học:{" "}
                                {choosenClass.tenphonghoc}
                              </option>
                            );
                          } else {
                            return null;
                          }
                        });

                        if (!hasClassesInRange) {
                          return (
                            <option disabled={true}>
                              Chưa có lớp học khai giảng với khóa này!
                            </option>
                          );
                        }

                        return options;
                      })()}
                    </>
                  ) : (
                    <option>Chưa có dữ liệu lớp học cho khóa này</option>
                  )}
                </select>
                {choosenConfirmInfo?.tenlophoc && (
                  <button
                    onClick={handleConfirmStudent}
                    disabled={!choosenConfirmInfo.tenlophoc} // Safely checking if tenlophoc exists
                  >
                    Xác nhận
                  </button>
                )}
              </div>
            </div>
          </>
        ))}
      </div>
    </div>
  );
};

export default StudentComfirm;
