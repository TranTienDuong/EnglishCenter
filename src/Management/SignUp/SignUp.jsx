import React, { useState, useEffect } from "react";
import classes from "./SignUp.module.scss";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faSort,
  faCheck,
  faX,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loader from "../../assets/Loader/Loader";

const SignUp = () => {
  const [signup, setSignup] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState(false);
  const [animationTrigger, setAnimationTrigger] = useState(false);

  useEffect(() => {
    axios
      .get("http://localhost:8080/api/v1/formnhaphoc")
      .then((res) => {
        const data = res.data;
        data.sort((a, b) => new Date(b.ngaygui) - new Date(a.ngaygui));
        setSignup(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  }, []);

  const getDate = (d) => {
    const date = new Date(d);
    const formattedDate = date.toLocaleDateString("vi-VN");
    return formattedDate;
  };

  if (loading) {
    return <Loader />;
  }

  const handleConfirm = (signup) => {
    setConfirm(signup);

    setAnimationTrigger(false); // Remove the class
    setTimeout(() => {
      setAnimationTrigger(true); // Re-add the class after a short delay
    }, 10); // 10ms delay is enough to force the browser to reapply the animation
  };

  const handleSave = () => {
    axios
      .put(`http://localhost:8080/api/v1/formnhaphoc/${confirm.maform}`, {
        hoten: confirm.hoten,
        ngaysinh: confirm.ngaysinh,
        tenkhoahoc: confirm.tenkhoahoc,
        gioitinh: confirm.gioitinh,
        sdt: confirm.sdt,
        diachi: confirm.diachi,
        email: confirm.email,
        ngaygui: confirm.ngaygui,
        trangthai: "Hoàn Thành",
      })
      .then(() => {
        setSignup((prevSignup) =>
          prevSignup.map((item) =>
            item.maform === confirm.maform
              ? { ...item, trangthai: "Hoàn thành" }
              : item
          )
        );
        setConfirm(null);
        toast.success("Xử lý đơn nhập học thành công");
      })
      .catch((error) => {
        console.log(error);
        toast.error("Xảy ra lỗi khi xử lý đơn nhập học");
      });
  };

  const handleSort = () => {
    const sortedData = [...signup].sort((a, b) =>
      a.tenkhoahoc.localeCompare(b.tenkhoahoc)
    );
    setSignup(sortedData);
    console.log("sorted by tenkhoahoc");
  };

  const handleDelete = () => {
    if (!confirm) return;

    const isConfirmed = window.confirm(
      `Bạn có chắc chắn muốn xoá đơn đăng ký học của "${confirm.hoten}" không?`
    );

    if (!isConfirmed) return;

    axios
      .delete(`http://localhost:8080/api/v1/formnhaphoc/${confirm.maform}`)
      .then(() => {
        setSignup((prevSignup) =>
          prevSignup.filter((item) => item.maform !== confirm.maform)
        );
        toast.success("Đã xóa đơn đăng ký học");
        setConfirm(null);
      })
      .catch((err) => {
        console.error(err);
        toast.error("Xảy ra lỗi khi xóa đơn đăng ký");
      });
  };

  return (
    <>
      <div className={classes.signup} onClick={() => setEdit(false)}>
        <h1>Danh sách đơn đăng ký học</h1>
        <ToastContainer />
        <div className={classes.search}>
          <FontAwesomeIcon icon={faSearch} />
          <input
            type="text"
            placeholder="Tìm kiếm"
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className={classes.container}>
          <table>
            <thead>
              <tr>
                <th>STT</th>
                <th onClick={handleSort}>
                  Khóa học{" "}
                  <span>
                    <FontAwesomeIcon icon={faSort} />
                  </span>
                </th>
                <th>Họ và tên</th>
                <th>Ngày sinh</th>
                <th>Email</th>
                <th>Số điện thoại</th>
                <th>Địa chỉ</th>
                <th>Ngày gửi</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {signup
                .filter((signup) => {
                  if (search === "") return true; // Show all students if search is empty
                  const searchLower = search.toLowerCase();
                  return (
                    signup.tenkhoahoc.toLowerCase().includes(searchLower) ||
                    signup.hoten.toLowerCase().includes(searchLower) ||
                    signup.trangthai.toLowerCase().includes(searchLower) ||
                    signup.ngaysinh.toLowerCase().includes(searchLower) ||
                    signup.email.toLowerCase().includes(searchLower) ||
                    signup.sdt.toLowerCase().includes(searchLower) ||
                    signup.diachi.toLowerCase().includes(searchLower) ||
                    signup.ngaygui.toLowerCase().includes(searchLower)
                  );
                })
                .map((signup, index) => {
                  if (
                    signup.trangthai !== "Hoàn thành" &&
                    signup.trangthai !== "Hoàn Thành"
                  ) {
                    return (
                      <tr
                        key={signup.maform}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleConfirm(signup);
                        }}
                      >
                        <td>{index}</td>
                        <td>{signup.tenkhoahoc}</td>
                        <td>{signup.hoten}</td>
                        <td>{getDate(signup.ngaysinh)}</td>
                        <td>{signup.email}</td>
                        <td>{signup.sdt}</td>
                        <td>{signup.diachi}</td>
                        <td>{getDate(signup.ngaygui)}</td>
                        <td>{signup.trangthai}</td>
                      </tr>
                    );
                  }
                })}
            </tbody>
          </table>
        </div>
      </div>
      {confirm && (
        <div className={classes.overlay}>
          <div
            className={`${classes.wrapper} ${
              animationTrigger ? classes.show : ""
            }`}
          >
            <h1>Xác nhận form nhập học cho</h1>
            <h2>{confirm.hoten}</h2>
            <div className={classes.function_btn}>
              <button id={classes.check} onClick={handleSave}>
                <FontAwesomeIcon icon={faCheck} />
              </button>
              <button id={classes.delete} onClick={handleDelete}>
                <FontAwesomeIcon icon={faTrash} />
              </button>
              <button id={classes.x} onClick={() => setConfirm(null)}>
                <FontAwesomeIcon icon={faX} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SignUp;
