import React, { useState, useEffect } from "react";
import classes from "./ClassDetail.module.scss";
import Cookies from "js-cookie";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ExcelExport from "../../assets/ExcelExport.jsx";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/flatpickr.css";
import { format } from 'date-fns';

export const ClassDetail = ({
  detail,
  setIsClassDetail,
  refreshClasses,
  currentUserId,
}) => {
  const [detailState, setDetailState] = useState(detail);
  const [isMarking, setIsMarking] = useState(false);
  const [edit, setEdit] = useState(false);
  const [changeMark, setChangeMark] = useState(null);
  const [dqt, setDqt] = useState(null);
  const [dck, setDck] = useState(null);

  const [transferStudent, setTransferStudent] = useState(null); // học viên muốn chuyển
  const [selectedClass, setSelectedClass] = useState(""); // lớp muốn chuyển đến
  const [allClasses, setAllClasses] = useState([]); // danh sách lớp khác
  const [classEnded, setClassEnded] = useState(false);

  const [editState, setEditState] = useState({
  tenkhoahoc: '',
  tenlophoc: '',
  thoigianhoc: '',
  ngaykhaigiang: '',
  magiaovien: '',
});
  const [courseData, setCourseData] = useState([]);
  const [teacherData, setTeacherData] = useState([]);

  const role = sessionStorage.getItem("role");
  const columns = [
    { header: "Họ và tên", accessor: "hoten" },
    { header: "Điểm quá trình", accessor: "diemkiemtra" },
    { header: "Điểm cuối kì", accessor: "diemdiemcuoiki" },
    { header: "Điểm tổng kết", accessor: "diemtongket" },
    { header: "Trạng thái", accessor: "trangThai" },
  ];
useEffect(() => {
  if (detail) {
    setDetailState({
      ...detail,
      ngaykhaigiang: new Date(detail.ngaykhaigiang),
      magiaovien: detailState.giangVien[0].manguoidung.toString(),
    });
  }
  setTeacherData(detailState.giangVien);
  setEditState(detail);
}, [detail,detailState.giangVien]);

  useEffect(() => {
    if (changeMark) {
      setDqt(
        changeMark.diemkiemtra !== null && changeMark.diemkiemtra !== undefined
          ? changeMark.diemkiemtra.toString()
          : ""
      );
      setDck(
        changeMark.diemdiemcuoiki !== null &&
          changeMark.diemdiemcuoiki !== undefined
          ? changeMark.diemdiemcuoiki.toString()
          : ""
      );
    }
    fetchClassDetail();
  }, [changeMark]);

  useEffect(() => {
    axios
      .get("http://localhost:8080/api/v1/khoahoc")
      .then((res) => {
        setCourseData(res.data);
      })
      .catch((error) => {
        console.log("Error fetching course: ", error);
      });
  }, []);

  useEffect(() => {
  if (
    editState.tenkhoahoc &&
    detailState.thuhoc &&
    detailState.cahoc &&
    editState.ngaykhaigiang
  ) {
    if (editState.ngaykhaigiang !== detail.ngaykhaigiang) {
      axios
        .get(`http://localhost:8080/api/v1/nguoidung/giaovientronglich`, {
          params: {
            tenKhoaHoc: editState.tenkhoahoc,
            thuHoc: detailState.thuhoc,
            caHoc: detailState.cahoc,
            ngayKhaiGiang: editState.ngaykhaigiang,
          },
        })
        .then((res) => {
          console.log("Danh sách giáo viên trống lịch:", res.data);
          setTeacherData(res.data || []);
        })
        .catch((err) => {
          console.error("Lỗi khi lấy danh sách giáo viên", err);
        });
    } else {
      // Ngày không thay đổi → giữ nguyên giáo viên cũ
      setTeacherData(detail?.giangVien || []);
    }
  }
}, [ editState.tenkhoahoc, detailState.thuhoc, detailState.cahoc, editState.ngaykhaigiang,
]);



  const fetchClassDetail = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8080/api/v1/lophoc/thongtinlopkemdanhsanhhocsinhvagiangvien/${detailState.malop}`
      );
      setDetailState(res.data);
    } catch (error) {
      console.error("Lỗi khi load lại chi tiết lớp:", error);
    }
  };

  const convertDate = (date) => {
    if (!date) return "";
    const newDate = new Date(date);
    const day = String(newDate.getDate()).padStart(2, "0");
    const month = String(newDate.getMonth() + 1).padStart(2, "0");
    const year = newDate.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const handleUpdateMark = async () => {
    const finalDqt = dqt !== null ? parseFloat(dqt) : null;
    const finalDck = dck !== null ? parseFloat(dck) : null;

    // Kiểm tra điểm được nhập có hợp lệ không
    if (
      (finalDqt !== null && (finalDqt < 0 || finalDqt > 10)) ||
      (finalDck !== null && (finalDck < 0 || finalDck > 10))
    ) {
      toast.error("Điểm phải nằm trong khoảng từ 0 đến 10.");
      return;
    }

    const tenKhoa = detailState.tenkhoahoc ?? "";
    console.log("Tên khóa học:", tenKhoa);
    let diemDatToiThieu = 4; // mặc định

    if (tenKhoa.includes("7.0+")) {
      diemDatToiThieu = 7;
    } else if (tenKhoa.includes("6.0-6.5")) {
      diemDatToiThieu = 6;
    } else if (tenKhoa.includes("5.0-5.5")) {
      diemDatToiThieu = 5;
    }

    // Lấy điểm để tính trạng thái: nếu null thì lấy từ dữ liệu cũ
    const dqtForAvg = finalDqt !== null ? finalDqt : changeMark.diemkiemtra;
    const dckForAvg = finalDck !== null ? finalDck : changeMark.diemdiemcuoiki;

    let trangthai = changeMark.trangthai;
    if (!isNaN(dqtForAvg) && !isNaN(dckForAvg)) {
      const avg = (dqtForAvg + dckForAvg) / 2;
      trangthai = avg >= diemDatToiThieu ? "Đạt" : "Không đạt";
    } else {
      trangthai = "Đang Học";
    }

    try {
      const da = await axios.put(
        `http://localhost:8080/api/v1/nguoilophoc/${changeMark.manguoidung}/${detailState.malop}`,
        {
          diemKiemTra: finalDqt,
          diemCuoiki: finalDck,
          trangThai: trangthai,
        }
      );
      console.log("Response PUT:", da.data);
      console.log("Payload gửi lên:", {
        diemKiemTra: finalDqt,
        diemCuoiki: finalDck,
        trangThai: trangthai,
      });

      const res = await axios.get(
        `http://localhost:8080/api/v1/lophoc/thongtinlopkemdanhsanhhocsinhvagiangvien/${detailState.malop}`
      );

      setDetailState(res.data);

      toast.success("Cập nhật thành công");
      setChangeMark(null);
      setDqt(null);
      setDck(null);
    } catch (error) {
      console.error("Lỗi khi cập nhật:", error);
      alert("Có lỗi xảy ra khi cập nhật điểm và trạng thái.");
    }
  };

  const handleFilter = (choice) => {
    setDetailState((prev) => {
      const hocvienCopy = [...prev.hocvien];
      hocvienCopy.sort((a, b) => {
        const avgA =
          (parseFloat(a.diemkiemtra) || 0) +
          (parseFloat(a.diemdiemcuoiki) || 0);
        const avgB =
          (parseFloat(b.diemkiemtra) || 0) +
          (parseFloat(b.diemdiemcuoiki) || 0);
        if (choice === "asc") {
          return avgA - avgB;
        } else {
          return avgB - avgA;
        }
      });
      return { ...prev, hocvien: hocvienCopy };
    });
  };

  const getTrangThaiHocVien = (hv, tenKhoa) => {
    if (hv.trangThai === "Chuyển Lớp") return "Chuyển Lớp";

    // Parse điểm
    const dqt = parseFloat(hv.diemkiemtra);
    const dck = parseFloat(hv.diemdiemcuoiki);

    // Xác định mức điểm đạt tối thiểu theo tên khóa
    let diemDatToiThieu = 4; // mặc định thấp nhất

    if (tenKhoa?.includes("7.0+")) {
      diemDatToiThieu = 7;
    } else if (tenKhoa?.includes("6.0-6.5")) {
      diemDatToiThieu = 6;
    } else if (tenKhoa?.includes("5.0-5.5")) {
      diemDatToiThieu = 5;
    }

    // Tính trạng thái
    if (!isNaN(dqt) && !isNaN(dck)) {
      const avg = (dqt + dck) / 2;
      return avg >= diemDatToiThieu ? "Đạt" : "Không Đạt";
    }
    return "Đang Học";
  };

  const handleDeleteStudent = async () => {
    if (!transferStudent) return;
    if (
      !window.confirm(`Bạn có chắc muốn xóa học viên ${transferStudent.hoten}?`)
    )
      return;

    try {
      await axios.delete(
        `http://localhost:8080/api/v1/nguoilophoc/${transferStudent.manguoidung}/${detailState.malop}`
      );
      setDetailState((prev) => ({
        ...prev,
        hocvien: prev.hocvien.filter(
          (hv) => hv.manguoidung !== transferStudent.manguoidung
        ),
      }));
      toast.success("Xóa học viên thành công");
      setTransferStudent(null);
      setSelectedClass("");
    } catch (error) {
      console.error(error);
      toast.error("Xóa học viên thất bại");
    }
  };

  const handleTransferClass = async () => {
    if (!transferStudent || !selectedClass) return;

    try {
      // Gọi API chuyển lớp
      await axios.post(
        `http://localhost:8080/api/v1/nguoilophoc/chuyenlop/${transferStudent.manguoidung}/${detailState.malop}/${selectedClass}`
      );

      await fetchClassDetail();

      toast.success("Chuyển lớp thành công");
      setTransferStudent(null);
      setSelectedClass("");
    } catch (error) {
      console.error(error);
      toast.error("Chuyển lớp thất bại");
    }
  };

  const handleClickStudent = async (hv) => {
    setTransferStudent(hv);
    setClassEnded(false);

    try {
      // 1. Lấy thông tin lớp hiện tại
      const resCurrentClass = await axios.get(
        `http://localhost:8080/api/v1/lophoc/thongtinlopkemdanhsanhhocsinhvagiangvien/${detailState.malop}`
      );

      const lopHienTai = resCurrentClass.data;

      const startDate = new Date(lopHienTai.ngaykhaigiang);
      const duration = parseInt(lopHienTai.thoigianhoc.slice(0, 2), 10); // VD: "36 buổi"
      const endDate = new Date(startDate);
      if (duration === 36) {
        endDate.setMonth(endDate.getMonth() + 3);
      } else if (duration === 24) {
        endDate.setMonth(endDate.getMonth() + 2);
      }

      const today = new Date();

      if (endDate < today) {
        console.log("Lớp đã kết thúc");
        setClassEnded(true);
        setAllClasses([]); // Không hiện danh sách lớp
        return; // Dừng xử lý
      }

      // 2. Nếu lớp chưa kết thúc, lấy danh sách các lớp khác còn học
      const res = await axios.get(
        `http://localhost:8080/api/v1/lophoc/dslopcungkhoa/${detailState.malop}`
      );

      const danhSachLop = res.data.filter((lop) => {
        if (lop.malop === detailState.malop) return false; // loại trừ lớp hiện tại

        const start = new Date(lop.ngaykhaigiang);
        const dur = parseInt(lop.thoigianhoc.slice(0, 2), 10);

        const end = new Date(start);
        if (dur === 36) {
          end.setMonth(end.getMonth() + 3);
        } else if (dur === 24) {
          end.setMonth(end.getMonth() + 2);
        }

        return end >= today; // chỉ lấy lớp còn đang học
      });

      setAllClasses(danhSachLop);
    } catch (error) {
      console.error("Lỗi khi lấy thông tin lớp hoặc danh sách lớp:", error);
    }
  };
  function getNextKhoaHoc(tenKhoaHoc) {
    const nextMap = {
      "Khóa IELTS mất gốc": "Khóa IELTS 5.0-5.5",
      "Khóa IELTS cấp tốc": "Khóa IELTS 5.0-5.5",
      "Khóa IELTS 5.0-5.5": "Khóa IELTS 6.0-6.5",
      "Khóa IELTS 6.0-6.5": "Khóa IELTS 7.0+",
      "Khóa IELTS 7.0+": "Khóa IELTS 7.0+", // không lên thêm nữa
    };

    return nextMap[tenKhoaHoc] || tenKhoaHoc;
  }

  const handleDangKyHocTiep = async (
    manguoidung,
    currentKhoaHoc,
    trangThai
  ) => {
    try {
      // 1. Lấy thông tin người dùng
      const resNguoiDung = await fetch(
        `http://localhost:8080/api/v1/nguoidung/${manguoidung}`
      );
      if (!resNguoiDung.ok) throw new Error("Không lấy được người dùng");
      const nguoiDung = await resNguoiDung.json();

      // 2. Lấy danh sách xác nhận
      const resXacNhan = await fetch("http://localhost:8080/api/v1/xacnhan");
      if (!resXacNhan.ok) throw new Error("Không lấy được danh sách xác nhận");
      const danhSachXacNhan = await resXacNhan.json();

      const resForm = await fetch("http://localhost:8080/api/v1/formnhaphoc");
      if (!resXacNhan.ok) throw new Error("Không lấy được danh sách xác nhận");
      const danhSachForm = await resForm.json();

      // 3. So sánh tìm xác nhận trùng
      const matched = danhSachXacNhan.find(
        (xn) =>
          xn.hoten === nguoiDung.hoten &&
          xn.email === nguoiDung.email &&
          xn.ngaysinh?.slice(0, 10) === nguoiDung.ngaysinh?.slice(0, 10) &&
          xn.gioitinh === nguoiDung.gioitinh
      );
      const matched2 = danhSachForm.find(
        (f) =>
          f.hoten === nguoiDung.hoten &&
          f.email === nguoiDung.email &&
          f.ngaysinh?.slice(0, 10) === nguoiDung.ngaysinh?.slice(0, 10) &&
          f.gioitinh === nguoiDung.gioitinh
      );

      if (!matched && !matched2) {
        alert("Không tìm thấy bản ghi xác nhận phù hợp");
        return;
      }
      console.log("Matched:", matched);
      // 4. Chuẩn bị dữ liệu cập nhật
      const today = new Date().toISOString().split("T")[0]; // yyyy-mm-dd
      const khoaHocMoi =
        trangThai === "Đạt" ? getNextKhoaHoc(currentKhoaHoc) : currentKhoaHoc;

      const bodyUpdate = {
        ...matched,
        ngaygui: today,
        trangthai: "Học Tiếp",
        tenlophoc: null,
      };
      const nextUpdate = {
        hoten: matched2.hoten,
        ngaysinh: matched2.ngaysinh,
        gioitinh: matched2.gioitinh,
        sdt: matched2.sdt,
        diachi: matched2.diachi,
        email: matched2.email,
        ngaygui: today,
        trangthai: "Hoàn Thành",
        tenkhoahoc: khoaHocMoi,
      };

      // 5. Gửi PUT cập nhật
      const resUpdate = await fetch(
        `http://localhost:8080/api/v1/xacnhan/${matched.maxacnhan}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bodyUpdate),
        }
      );

      const resNextUpdate = await fetch(
        `http://localhost:8080/api/v1/formnhaphoc/${matched2.maform}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(nextUpdate),
        }
      );
      console.log("Response PUT:", resUpdate);
      console.log("Response PUT:", resNextUpdate);

      if (!resUpdate.ok && !resNextUpdate.ok)
        throw new Error("Cập nhật thất bại");

      alert("Đăng ký học tiếp thành công!");
    } catch (err) {
      console.error(err);
      alert("Đã xảy ra lỗi: " + err.message);
    }
  };

  function DeleteClasses() {
    if (!detailState) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const ngayKhaiGiang = new Date(detailState.ngaykhaigiang);
    ngayKhaiGiang.setHours(0, 0, 0, 0);

    const ngayKhaiGiangPlus2 = new Date(ngayKhaiGiang);
    ngayKhaiGiangPlus2.setDate(ngayKhaiGiangPlus2.getDate() + 2);
    ngayKhaiGiangPlus2.setHours(0, 0, 0, 0);

    const ngayKhaiGiangPlus1 = new Date(ngayKhaiGiang);
    ngayKhaiGiangPlus1.setDate(ngayKhaiGiangPlus1.getDate() - 2);
    ngayKhaiGiangPlus1.setHours(0, 0, 0, 0);
    const soHocVienDangHoc = detailState.hocvien.filter(
      (hv) => hv.trangThai === "Đang Học"
    ).length;
    console.log("Số học viên đang học:", soHocVienDangHoc);
    // Hiển thị cảnh báo nếu trong 2 ngày đầu và số học viên < 10
    if (
      (today >= ngayKhaiGiang &&
        today <= ngayKhaiGiangPlus2 &&
        soHocVienDangHoc < 10) ||
      (today >= ngayKhaiGiangPlus1 && soHocVienDangHoc < 10)
    ) {
      return (
        <div style={{ color: "red", marginBottom: "15px" }}>
          Cảnh báo: Lớp chỉ có {soHocVienDangHoc} học viên, không đủ điều kiện
          để học. Lớp sẽ tự xóa sau ngày {convertDate(ngayKhaiGiangPlus2)}
        </div>
      );
    }
    if (ngayKhaiGiangPlus2 < today) {
      return;
    }
    // Tự động xóa lớp nếu quá 2 ngày và học viên < 10
    // if (today > ngayKhaiGiangPlus2 && soHocVienDangHoc < 10) {
    //   axios.delete(`http://localhost:8080/api/v1/lophoc/${detailState.malop}`)
    //     .then((response) => {
    //       if (response.status === 200) {
    //         alert("Xóa lớp thành công!");
    //         if (fetchClassDetail) fetchClassDetail();
    //       } else {
    //         alert("Xóa lớp thất bại!");
    //       }
    //     })
    //     .catch((error) => {
    //       alert("Lỗi khi gọi API xóa lớp: " + error.message);
    //     });
    // }
  }
  const exportData = detailState.hocvien.map((hv) => {
    const dqtFloat = parseFloat(hv.diemkiemtra);
    const dckFloat = parseFloat(hv.diemdiemcuoiki);
    const diemtongket =
      !isNaN(dqtFloat) && !isNaN(dckFloat)
        ? ((dqtFloat + dckFloat) / 2).toFixed(1)
        : "Chưa có điểm";

    return {
      hoten: hv.hoten,
      diemkiemtra: !isNaN(dqtFloat) ? dqtFloat : "Chưa có điểm",
      diemdiemcuoiki: !isNaN(dckFloat) ? dckFloat : "Chưa có điểm",
      diemtongket: diemtongket,
      trangThai: getTrangThaiHocVien(hv, detailState.tenkhoahoc),
    };
  });
  const formatDate = (dateStr) => {
  return dateStr.replace(/-/g, "/");
  };
  const handleEditClass = async () => {
   try {
    // 1. Cập nhật thông tin lớp học
    const updateData = {
      tenlophoc: editState.tenlophoc,
      ngaykhaigiang:formatDate(format(editState.ngaykhaigiang, 'dd-MM-yyyy')),
  
      thoigianhoc: editState.thoigianhoc,
      tenkhoahoc: editState.tenkhoahoc,
    };
    console.log("Dữ liệu gửi lên:", updateData);
    await axios.put(
      `http://localhost:8080/api/v1/lophoc/${detail.malop}`, updateData
    );
    if (editState.ngaykhaigiang !== detail.ngaykhaigiang) {
    const oldGvId = detail.giangVien?.[0]?.manguoidung;
    if(!editState.magiaovien) {
      alert("Vui lòng chọn giáo viên trước khi cập nhật lớp học.");
      return;
    }
    console.log("Giáo viên được chọn:", editState.magiaovien);
    const hotenOnly = editState.magiaovien.split(" - ")[0].trim();
    console.log("Họ tên giáo viên:", hotenOnly);

    const res = await axios.get("http://localhost:8080/api/v1/nguoidung/getAllGiaoVien");
    const allGiaoVien = res.data;

    const matchedGv = allGiaoVien.find(gv => gv.hoten === hotenOnly);
    const magiaovien = matchedGv.manguoidung;
    console.log("Mã giáo viên:", magiaovien);
    if (!magiaovien) {
      alert("Không tìm thấy giáo viên phù hợp.");
      return;
    }
    if (magiaovien !== oldGvId) {
      for (const gv of detail.giangVien) {
        await axios.delete(
          `http://localhost:8080/api/v1/nguoilophoc/${gv.manguoidung}/${detailState.malop}`
        );
      }
      // Thêm giáo viên mới vào lớp
      await axios.post(
        `http://localhost:8080/api/v1/nguoilophoc/${magiaovien}/${detailState.malop}`
      );
    } 
    }

    alert("Cập nhật lớp học thành công!");
    setEdit(false);
    refreshClasses();
    setIsClassDetail(false);
  } catch (error) {
    console.error("Lỗi khi cập nhật lớp học:", error);
    alert("Đã xảy ra lỗi khi cập nhật lớp học.");
  }
};

const handleOpenEdit = () => {
  if (detailState) {
    setEdit(true);
  }
};
const handleDeleteClass = async () => {
  if (!window.confirm("Bạn có chắc chắn muốn xóa lớp học này không?")) return;

  try {
    await axios.delete(`http://localhost:8080/api/v1/lophoc/${detailState.malop}`);
    alert("Xóa lớp học thành công!");
    refreshClasses();
    setIsClassDetail(false); 
  } catch (error) {
    console.error("Lỗi khi xóa lớp học:", error);
    alert("Đã xảy ra lỗi khi xóa lớp học.");
  }
}

  return (
    <div className={classes.container}>
      <ToastContainer />
      {isMarking ? (
        <>
          {changeMark && (
            <div
              className={classes.overlay}
              onClick={() => {
                setChangeMark(null);
                setDck(null);
                setDqt(null);
              }}
            >
              <div
                className={classes.wrapper}
                onClick={(e) => e.stopPropagation()}
              >
                <div className={classes.header}>
                  <h1>Học viên: {changeMark.hoten}</h1>
                </div>
                <div className={classes.mark}>
                  <label htmlFor="dqt">Điểm quá trình</label>
                  <input
                    type="number"
                    step="0.1"
                    value={dqt}
                    id="dqt"
                    onChange={(e) => setDqt(e.target.value)}
                  />
                  <label htmlFor="dck">Điểm cuối kì</label>
                  <input
                    type="number"
                    step="0.1"
                    value={dck}
                    id="dck"
                    max="10"
                    min="0"
                    onChange={(e) => setDck(e.target.value)}
                  />
                </div>
                <div className={classes.function}>
                  <button onClick={handleUpdateMark}>Lưu</button>
                </div>
              </div>
            </div>
          )}
          <div className={classes.header}>
            <h1>Bảng điểm của lớp</h1>
            <button onClick={() => setIsMarking(false)}>Quay lại</button>
          </div>
          <div className={classes.filter}>
            <h1>Sắp xếp: </h1>
            <button id={classes.asc} onClick={() => handleFilter("asc")}>
              Tăng dần
            </button>
            <button id={classes.des} onClick={() => handleFilter("des")}>
              Giảm dần
            </button>
            <ExcelExport
              columns={columns}
              data={exportData}
              fileName={`DiemLop_${detailState.tenlophoc}`}
              title="Danh sách sinh viên đang học tại trung tâm"
            />
          </div>
          <table className={classes.bangdiem}>
            <thead>
              <tr>
                <th>STT</th>
                <th>Tên</th>
                <th>Điểm quá trình</th>
                <th>Điểm cuối kì</th>
                <th>Điểm tổng kết</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {detailState.hocvien.map((hv, index) => {
                const dqtFloat = parseFloat(hv.diemkiemtra);
                const dckFloat = parseFloat(hv.diemdiemcuoiki);

                return (
                  <tr
                    key={hv.manguoidung}
                    className={
                      hv.trangThai === "Chuyển Lớp" ? classes.inactiveRow : ""
                    }
                    onClick={(e) => {
                      if (hv.trangThai !== "Chuyển Lớp") {
                        e.stopPropagation();
                        setChangeMark(hv);
                      }
                    }}
                  >
                    <td>{index + 1}</td>
                    <td>{hv.hoten}</td>
                    <td>{!isNaN(dqtFloat) ? dqtFloat : "Chưa có điểm"}</td>
                    <td>{!isNaN(dckFloat) ? dckFloat : "Chưa có điểm"}</td>
                    <td>
                      {!isNaN(dqtFloat) && !isNaN(dckFloat)
                        ? ((dqtFloat + dckFloat) / 2).toFixed(1)
                        : "Chưa có điểm"}
                    </td>
                    <td>{getTrangThaiHocVien(hv, detailState.tenkhoahoc)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </>
      ) : (
        <>
          <div className={classes.header}>
            <h1>{detailState.tenlophoc}</h1>
            <button
              onClick={() => {
                setIsMarking(false);
                refreshClasses();
                setIsClassDetail(false);
              }}
            >
              Quay lại
            </button>
          </div>
          <h2>
            <span>Khóa</span> {detailState.tenkhoahoc}
          </h2>
          <h2>
            <span>Phòng học: </span> {detailState.tenphonghoc}
          </h2>
          <h2>
            <span>Ca: </span> {detailState.cahoc}
          </h2>
          <h2>
            <span>Số buổi: </span> {detailState.thoigianhoc}
          </h2>
          <h2>
            <span>Ngày khai giảng: </span>{" "}
            {convertDate(detailState.ngaykhaigiang)}
          </h2>
          <h2>
            <span>Giáo viên</span>:{" "}
            {detailState.giangVien && detailState.giangVien.length > 0
              ? `${detailState.giangVien[0].hoten} / ${detailState.giangVien[0].sdt} / ${detailState.giangVien[0].email}`
              : "Chưa có giáo viên"}
          </h2>
          {role !== "Học Viên" && (
            <>
              <DeleteClasses />
              <button
                id={classes.xemdiem_btn}
                onClick={() => setIsMarking(true)}
              >
                Quản lý điểm
              </button>
              {role === "admin" && (
                <button id={classes.sua_btn} onClick={handleOpenEdit}>
                  Sửa thông tin lớp
                </button>
              )}

              <table>
                <thead>
                  <tr>
                    <th>STT</th>
                    <th>Họ và tên</th>
                    <th>Giới tính</th>
                    <th>Email</th>
                    <th>Số điện thoại</th>
                    <th>Địa chỉ</th>
                  </tr>
                </thead>
                <tbody>
                  {detailState.hocvien.map((hv, index) => (
                    <tr
                      key={hv.manguoidung}
                      className={
                        hv.trangThai === "Chuyển Lớp" ? classes.inactiveRow : ""
                      }
                      onClick={(e) => {
                        if (hv.trangThai !== "Chuyển Lớp") {
                          e.stopPropagation();
                          handleClickStudent(hv);
                        }
                      }}
                    >
                      <td>{index + 1}</td>
                      <td>{hv.hoten}</td>
                      <td>{hv.gioitinh}</td>
                      <td>{hv.email}</td>
                      <td>{hv.sdt}</td>
                      <td>{hv.diachi}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
          {role === "Học Viên" && (
            <>
              <table className={classes.bangdiem}>
                <thead>
                  <tr>
                    <th>STT</th>
                    <th>Tên</th>
                    <th>Điểm quá trình</th>
                    <th>Điểm cuối kì</th>
                    <th>Điểm tổng kết</th>
                    <th>Trạng thái</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(detailState?.hocvien) &&
                    detailState.hocvien
                      .filter(
                        (hv) => String(hv.manguoidung) === String(currentUserId)
                      )
                      .map((hv, index) => {
                        const dqtFloat = parseFloat(hv.diemkiemtra);
                        const dckFloat = parseFloat(hv.diemdiemcuoiki);
                        const trangThai = getTrangThaiHocVien(
                          hv,
                          detailState.tenkhoahoc
                        );
                        return (
                          <tr key={hv.manguoidung}>
                            <td>{index + 1}</td>
                            <td>{hv.hoten}</td>
                            <td>
                              {!isNaN(dqtFloat) ? dqtFloat : "Chưa có điểm"}
                            </td>
                            <td>
                              {!isNaN(dckFloat) ? dckFloat : "Chưa có điểm"}
                            </td>
                            <td>
                              {!isNaN(dqtFloat) && !isNaN(dckFloat)
                                ? ((dqtFloat + dckFloat) / 2).toFixed(1)
                                : "Chưa có điểm"}
                            </td>
                            <td>{trangThai}</td>
                            <td>
                              {(trangThai === "Đạt" ||
                                trangThai === "Không Đạt") && (
                                <button
                                  onClick={() =>
                                    handleDangKyHocTiep(
                                      hv.manguoidung,
                                      detailState.tenkhoahoc,
                                      trangThai
                                    )
                                  }
                                  className={classes.dangkyButton}
                                >
                                  Học Tiếp
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                </tbody>
              </table>
            </>
          )}
          {edit && (
            <div className={classes.edit} onClick={(e) => e.stopPropagation()}>
              <div className={classes.header}>
                <h1>Thông tin lớp học</h1>
                <button onClick={() => setEdit(false)}>X</button>
              </div>
              <label htmlFor="tenkhoahoc">Khóa học</label>
              <select
                id="tenkhoahoc"
                value={editState.tenkhoahoc}
                onChange={(e) =>
                  setEditState({
                    ...editState,
                    tenkhoahoc: e.target.value,
                  })
                }
              >
                {courseData.map((course) => (
                  <option key={course.makhoahoc} value={course.tenkhoahoc}>
                    {course.tenkhoahoc}
                  </option>
                ))}
              </select>
              <label htmlFor="tenlophoc">Tên lớp</label>
              <input
                type="text"
                id="tenlophoc"
                placeholder="Tên lớp"
                value={editState.tenlophoc || ""}
                onChange={(e) =>
                  setEditState({
                    ...editState,
                    tenlophoc: e.target.value,
                  })
                }
              />
              <label htmlFor="thoigianhoc">Thời gian học</label>
              <select
                id="thoigianhoc"
                value={editState.thoigianhoc}
                onChange={(e) =>
                  setEditState({
                    ...editState,
                    thoigianhoc: e.target.value,
                  })
                }
              >
                <option value="24 buổi">24 buổi</option>
                <option value="36 buổi">36 buổi</option>
              </select>
              <label htmlFor="ngaykhaigiang">Ngày khai giảng</label>
              <Flatpickr
                value={editState.ngaykhaigiang} // Convert initial string to Date object
                onChange={([date]) => {
                  setEditState({
                    ...editState,
                    ngaykhaigiang: format(date, 'yyyy-MM-dd'), // Convert to YYYY-MM-DD
                  });
                }}
              />
              {teacherData.length > 1 && (
                <>
                  <label>Giảng viên</label>
                  <select
                    value={editState.magiaovien || ""}
                    onChange={(e) =>
                      setEditState({
                        ...editState,
                        magiaovien: e.target.value,
                      })
                    }
                  >
                {teacherData.map((data, index) => (
                <option key={index} disabled={data.includes("Trùng")}>
                  {data}
                </option>
              ))}
                </select>
                </>
              )
              }
              {teacherData.length === 1 && (
                <>
                  <label>Giảng viên</label>
                  <select
                    value={editState.magiaovien || ""}
                    onChange={(e) =>
                      setEditState({
                        ...editState,
                        magiaovien: e.target.value,
                      })
                    }
                  >
                {teacherData.map((gv) => (
                <option key={gv.manguoidung} value={gv.manguoidung}>
                  {gv.hoten}
                </option>
              ))}
                </select>
                </>
              )
              }
              <div className={classes["button-group"]}>
                <button className={classes["save-btn"]} onClick={handleEditClass}>
                  Lưu
                </button>
                <button
                  className={classes["delete-btn"]}
                  onClick={handleDeleteClass}
                >
                  Xóa
                </button>
              </div>
            </div>
          )}
        </>
      )}
      {role === "admin" && transferStudent && (
        <div
          className={classes.overlay2}
          onClick={() => {
            setTransferStudent(null);
            setSelectedClass("");
          }}
        >
          <div
            className={classes.wrapper2}
            onClick={(e) => e.stopPropagation()}
          >
            <h1>
              Học viên: <strong>{transferStudent.hoten}</strong>
            </h1>
            {classEnded ? (
              <h2>Lớp đã kết thúc</h2>
            ) : (
              <>
                <label htmlFor="classSelect">Chọn lớp muốn chuyển:</label>
                <select
                  id="classSelect"
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                >
                  <option value="">Chọn lớp</option>
                  {allClasses.length > 0 ? (
                    allClasses.map((lop) => (
                      <option key={lop.malop} value={lop.malop}>
                        {lop.tenlophoc}
                      </option>
                    ))
                  ) : (
                    <option disabled>Không có lớp để chuyển</option>
                  )}
                </select>
              </>
            )}

            <div className={classes["button-group"]}>
              <button
                className={classes["delete-btn"]}
                onClick={handleDeleteStudent}
              >
                Xóa học viên
              </button>

              <button
                className={classes["save-btn"]}
                onClick={handleTransferClass}
                disabled={!selectedClass}
              >
                Chuyển lớp
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
