import React, { useState, useEffect } from "react";
import classes from "./Consultancy.module.scss";
import axios from "axios";
import Loader from "../../assets/Loader/Loader";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Consultancy = () => {
  const [consultancies, setConsultancies] = useState([]);
  const [loading, setLoading] = useState(true);
  const today = new Date(); // Current date
  const previousDate = new Date(); // Create a copy of the current date

  // Subtract 30 days
  previousDate.setDate(today.getDate() - 30);

  // Format the date in dd-mm-yyyy
  useEffect(() => {
    axios
      .get("http://localhost:8080/api/v1/tuvan")
      .then((res) => {
        const data = res.data;
        console.log(res.data);
        data.sort((a, b) => {
          return new Date(b.ngaygui) - new Date(a.ngaygui);
        });
        setConsultancies(data);
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
      });
  }, []);

  const handleConfirm = (id) => {
    const isConfirmed = window.confirm("Bạn có chắc chắn muốn xác nhận hoàn thành tư vấn này?");
    if (!isConfirmed) return;
    axios
      .put(
        `http://localhost:8080/api/v1/tuvan/${id}`,
        {
          trangthai: "Hoàn thành",
        }
      )
      .then(() => {
        setConsultancies((prevConsultancies) =>
          prevConsultancies.map((consultancy) =>
            consultancy.matuvan === id
              ? { ...consultancy, trangthai: "Hoàn thành" }
              : consultancy
          )
        );
        toast.success("Đã hoàn thành trả lời tư vấn.");
      })
      .catch((error) => {
        console.log(error);
        toast.error("Có lỗi xảy ra khi xác nhận tư vấn.");
      });
  };

  if (loading) {
    return <Loader />;
  }

  const formatDate = (date) => {
    const newDate = new Date(date);
    const day = newDate.getDate();
    const month = newDate.getMonth() + 1;
    const year = newDate.getFullYear();
    return `${day}/${month}/${year}`;
  };
  return (
    <div className={classes.consultancy}>
        <ToastContainer />
      <h1>Danh sách đơn tư vấn</h1>
      <div className={classes.container}>
        <table>
          <thead>
            <tr>
              <th>Họ tên</th>
              <th>Số điện thoại</th>
              <th>Nghề nghiệp</th>
              <th>Câu hỏi</th>
              <th>Ngày gửi</th>
              <th>Trạng thái</th>
              <th>Chức năng</th>
            </tr>
          </thead>
          <tbody>
            {consultancies.map((consultancy) => {
              if (consultancy.trangthai !== "Hoàn thành") {
                return (
                  <tr key={consultancy.matuvan}>
                    <td>{consultancy.hoten}</td>
                    <td>{consultancy.sdt}</td>
                    <td>{consultancy.nghenghiep}</td>
                    <td>{consultancy.cauhoituvan}</td>
                    <td>{formatDate(consultancy.ngaygui)}</td>
                    <td
                      className={
                        consultancy.trangthai === "Hoàn thành"
                          ? classes.done
                          : classes.waiting
                      }
                    >
                      {consultancy.trangthai}
                    </td>
                    <td>
                      <button
                        disabled={consultancy.trangthai === "Hoàn thành"}
                        onClick={() => handleConfirm(consultancy.matuvan)}
                      >
                        Xác nhận
                      </button>
                    </td>
                  </tr>
                );
              }
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Consultancy;