import React, { useState, useEffect } from "react";
import classes from "./Teacher.module.scss";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/flatpickr.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loader from "../../assets/Loader/Loader";
import ExcelExport from "../../assets/ExcelExport";
import Pagination from "../../assets/Pagination/Pagination";

const Teacher = () => {
  const [teacher, setTeacher] = useState([]);
  const [chucvu, setChucvu] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState(false);
  const [isAdd, setIsAdd] = useState(false);
  const [currentTeacher, setCurrentTeacher] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [newTeacher, setNewTeacher] = useState({
    hoten: "",
    gioitinh: "Nam",
    ngaysinh: new Date(),
    email: "",
    sdt: "",
    diachi: "",
    tendangnhap: "",
    matkhau: "",
    tenchucvu: "",
  });
  const columns = [
    { header: "Họ và tên", accessor: "hoten" },
    { header: "Giới tính", accessor: "gioitinh" },
    { header: "Ngày sinh", accessor: "ngaysinh" },
    { header: "Email", accessor: "email" },
    { header: "Số điện thoại", accessor: "sdt" },
    { header: "Địa chỉ", accessor: "diachi" },
    { header: "Tên đăng nhập", accessor: "tendangnhap" },
    { header: "Mật khẩu", accessor: "matkhau" },
  ];

  useEffect(() => {
    const fetchTeacherAndChucVu = async () => {
      try {
        setLoading(true); // Start loading before fetching

        const [teacherRes, chucvuRes] = await Promise.all([
          axios.get("http://localhost:8080/api/v1/nguoidung/getAllGiaoVien"),
          axios.get("http://localhost:8080/api/v1/chucvu"),
        ]);

        setTeacher(teacherRes.data); // Set teacher data
        setChucvu(chucvuRes.data); // Set chucvu data
      } catch (error) {
        console.error("Error fetching data: ", error); // Log errors if any
      } finally {
        setLoading(false); // Stop loading after fetching is done
      }
    }
    fetchTeacherAndChucVu(); // Correctly call the function here, not inside itself
  }, []);

  const fetchTeacherAndChucVu = async () => {
      try { 
        const [teacherRes, chucvuRes] = await Promise.all([
          axios.get("http://localhost:8080/api/v1/nguoidung/getAllGiaoVien"),
          axios.get("http://localhost:8080/api/v1/chucvu"),
        ]);

        setTeacher(teacherRes.data); // Set teacher data
        setChucvu(chucvuRes.data); // Set chucvu data
      } catch (error) {
        console.error("Error fetching data: ", error); // Log errors if any
      } finally {
        setLoading(false); // Stop loading after fetching is done
      }
    };

  const getDate = (d) => {
    const date = new Date(d);
    const formattedDate = date.toLocaleDateString("vi-VN");
    return formattedDate;
  };

  if (loading) {
    return <Loader />;
  }

  const handleSave = () => {
    axios.put(
      `http://localhost:8080/api/v1/nguoidung/${currentTeacher.manguoidung}`,
      currentTeacher
    );

    setEdit(false);
    toast.success("Cập nhật thành công");
    setTeacher(
      teacher.map((t) =>
        t.manguoidung === currentTeacher.manguoidung ? currentTeacher : t
      )
    );
    setCurrentTeacher({});
  };

  const handleDelete = async () => {
  if (!currentTeacher.manguoidung) {
    toast.error("Không tìm thấy ID giáo viên để xóa.");
    return;
  }

  const confirm = window.confirm("Bạn có chắc chắn muốn xóa giáo viên này?");
  if (!confirm) return;

  try {
    const teacherId = currentTeacher.manguoidung.toString(); // Ensure the ID is a string

    // Send a DELETE request to delete the student
    await axios.delete(`http://localhost:8080/api/v1/nguoidung/${teacherId}`);
    toast.success("Xóa giáo viên thành công");

    setEdit(false);
    setCurrentTeacher({});
    fetchTeacherAndChucVu(); // Refresh the list after deletion

  } catch (error) {
    console.error("Lỗi khi xóa học viên:", error.response?.data || error.message);
    toast.error("Lỗi khi xóa học viên");
  }
};

  const handleAddTeacher = async () => {
    // Kiểm tra trùng tên đăng nhập và mật khẩu
    const isDuplicate = teacher.some(
      (t) =>
        t.tendangnhap === newTeacher.tendangnhap &&
        t.matkhau === newTeacher.matkhau
    );

    // Kiểm tra các trường bắt buộc
    if (
      !newTeacher.hoten ||
      !newTeacher.email ||
      !newTeacher.sdt ||
      !newTeacher.tendangnhap ||
      !newTeacher.matkhau ||
      !newTeacher.tenchucvu
    ) {
      toast.error("Vui lòng điền đầy đủ thông tin.");
      return;
    }

    // Kiểm tra định dạng họ tên
    const nameRegex =
      /^[a-zA-Zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ\s]+$/;
    if (!nameRegex.test(newTeacher.hoten)) {
      toast.error(
        "Họ và tên không hợp lệ. Vui lòng chỉ nhập chữ và dấu tiếng Việt."
      );
      return;
    }

    // Kiểm tra định dạng email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newTeacher.email)) {
      toast.error("Email không hợp lệ.");
      return;
    }

    // Kiểm tra định dạng số điện thoại
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(newTeacher.sdt)) {
      toast.error("Số điện thoại phải có 10 chữ số.");
      return;
    }

    if (isDuplicate) {
      toast.error("Tên đăng nhập và mật khẩu đã tồn tại.");
      return;
    }

    try {
      // Gửi yêu cầu thêm giáo viên
      const res = await axios.post(
        "http://localhost:8080/api/v1/nguoidung",
        newTeacher
      );

      // Cập nhật danh sách
      setTeacher([...teacher, res.data]);
      toast.success("Thêm giáo viên mới thành công");

      // Reset form
      setIsAdd(false);
      setNewTeacher({
        hoten: "",
        gioitinh: "Nam",
        ngaysinh: new Date(),
        email: "",
        sdt: "",
        diachi: "",
        tendangnhap: "",
        matkhau: "",
        tenchucvu: "",
      });

      fetchTeacherAndChucVu();
    } catch (error) {
      console.error(
        "Error adding teacher:",
        error.response?.data || error.message
      );
      toast.error("Có lỗi xảy ra khi thêm giáo viên");
    }
  };

  const paginatedTeachers = teacher
    .filter((teacher) => {
      if (search === "") return true; // Show all teachers if search is empty
      const searchLower = search.toLowerCase();
      return (
        teacher.hoten.toLowerCase().includes(searchLower) ||
        teacher.email.toLowerCase().includes(searchLower) ||
        teacher.sdt.toLowerCase().includes(searchLower)
      );
    })
    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <>
      <ToastContainer />
      {isAdd ? (
        <div className={classes.overlay}>
          <div className={classes.wrapper}>
            <div className={classes.header}>
              <h2>Thêm giáo viên mới</h2>
              <button onClick={() => setIsAdd(false)}>Quay lại</button>
            </div>
            <div className={classes.form}>
              <label htmlFor="hoten">Họ và tên</label>
              <input
                type="text"
                id="hoten"
                value={newTeacher.hoten}
                onChange={(e) =>
                  setNewTeacher({ ...newTeacher, hoten: e.target.value })
                }
              />
              <label htmlFor="chucvu">Chức vụ</label>
              <select
                id="tenchucvu"
                value={newTeacher.tenchucvu}
                onChange={(e) =>
                  setNewTeacher({ ...newTeacher, tenchucvu: e.target.value })
                }
              >
                <option value="">Chọn chức vụ</option>
                {chucvu
                  .filter((cv) =>
                    cv.maloaichucvu ==2
                  )
                  .map((cv) => (
                    <option key={cv.tenchucvu} value={cv.tenchucvu}>
                      {cv.tenchucvu}
                    </option>
                  ))}
              </select>
              <label htmlFor="gioitinh">Giới tính</label>
              <select
                id="gioitinh"
                value={newTeacher.gioitinh}
                onChange={(e) =>
                  setNewTeacher({ ...newTeacher, gioitinh: e.target.value })
                }
              >
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
              </select>
              <label htmlFor="ngaysinh">Ngày sinh</label>
              <Flatpickr
                value={new Date(newTeacher.ngaysinh)}
                onChange={([date]) =>
                  setNewTeacher({ ...newTeacher, ngaysinh: date })
                }
              />
              <label htmlFor="email">Email</label>
              <input
                type="text"
                id="email"
                value={newTeacher.email}
                onChange={(e) =>
                  setNewTeacher({ ...newTeacher, email: e.target.value })
                }
              />
              <label htmlFor="sdt">Số điện thoại</label>
              <input
                type="text"
                id="sdt"
                value={newTeacher.sdt}
                onChange={(e) =>
                  setNewTeacher({ ...newTeacher, sdt: e.target.value })
                }
              />
              <label htmlFor="diachi">Địa chỉ</label>
              <input
                type="text"
                id="diachi"
                value={newTeacher.diachi}
                onChange={(e) =>
                  setNewTeacher({ ...newTeacher, diachi: e.target.value })
                }
              />
              <label htmlFor="tendangnhap">Tên đăng nhập</label>
              <input
                type="text"
                id="tendangnhap"
                value={newTeacher.tendangnhap}
                onChange={(e) =>
                  setNewTeacher({
                    ...newTeacher,
                    tendangnhap: e.target.value,
                  })
                }
              />
              <label htmlFor="matkhau">Mật khẩu</label>
              <input
                type="password"
                id="matkhau"
                value={newTeacher.matkhau}
                onChange={(e) =>
                  setNewTeacher({ ...newTeacher, matkhau: e.target.value })
                }
              />
              <button onClick={handleAddTeacher}>Lưu</button>
            </div>
          </div>
        </div>
      ) : (
        <div className={classes.teacher}>
          <h1>Danh sách giáo viên đang giảng dạy tại trung tâm</h1>
          <div className={classes.search}>
            <FontAwesomeIcon icon={faSearch} />
            <input
              type="text"
              placeholder="Tìm kiếm giáo viên"
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
            <ExcelExport
              columns={columns}
              data={teacher}
              fileName="teacher"
              title="Danh sách giáo viên đang giảng dạy tại trung tâm"
            />
            <button id={classes.new_teacher_btn} onClick={() => setIsAdd(true)}>
              Thêm giáo viên mới
            </button>
          </div>
          <div className={classes.container}>
            <table>
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Họ và tên</th>
                  <th>Chức vụ</th>
                  <th>Giới tính</th>
                  <th>Ngày sinh</th>
                  <th>Email</th>
                  <th>Số điện thoại</th>
                  <th>Địa chỉ</th>
                  <th>Tên đăng nhập</th>
                  <th>Mật khẩu</th>
                </tr>
              </thead>
              <tbody>
                {paginatedTeachers.map((teacher, index) => (
                  <tr
                    key={teacher.manguoidung}
                    onClick={() => {
                      setEdit(true);
                      setCurrentTeacher(teacher);
                    }}
                  >
                    <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                    <td>{teacher.hoten}</td>
                    <td>{teacher.tenchucvu}</td>
                    <td>{teacher.gioitinh}</td>
                    <td>{getDate(teacher.ngaysinh)}</td>
                    <td>{teacher.email}</td>
                    <td>{teacher.sdt}</td>
                    <td>{teacher.diachi}</td>
                    <td>{teacher.tendangnhap}</td>
                    <td>{teacher.matkhau}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {edit && (
              <div
                className={classes.edit}
                onClick={(e) => e.stopPropagation()}
              >
                <div className={classes.header}>
                  <h1>Thông tin giáo viên</h1>
                  <button onClick={() => setEdit(false)}>X</button>
                </div>
                <label htmlFor="hoten">Họ và tên</label>
                <input
                  type="text"
                  id="hoten"
                  placeholder="Họ và tên"
                  value={currentTeacher.hoten}
                  onChange={(e) =>
                    setCurrentTeacher({
                      ...currentTeacher,
                      hoten: e.target.value,
                    })
                  }
                />
                <label htmlFor="gioitinh">Giới tính</label>
                <select
                  id="gioitinh"
                  value={currentTeacher.gioitinh}
                  onChange={(e) =>
                    setCurrentTeacher({
                      ...currentTeacher,
                      gioitinh: e.target.value,
                    })
                  }
                >
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                </select>
                <label htmlFor="tenchucvu">Chức vụ</label>
                <select
                  id="tenchucvu"
                  value={currentTeacher.tenchucvu}
                  onChange={(e) =>
                    setCurrentTeacher({
                      ...currentTeacher,
                      tenchucvu: e.target.value,
                    })
                  }
                >
                  {chucvu.map((chucvu) => (
                    <option key={chucvu.machucvu} value={chucvu.tenchucvu}>
                      {chucvu.tenchucvu}
                    </option>
                  ))}
                </select>
                <label htmlFor="ngaysinh">Ngày sinh</label>
                <Flatpickr
                  value={new Date(currentTeacher.ngaysinh)} // Convert initial string to Date object
                  onChange={([date]) => {
                    const formattedDate = getDate(date); // Format the selected date
                    setCurrentTeacher({
                      ...currentTeacher,
                      ngaysinh: formattedDate,
                    });
                  }}
                />
                <label htmlFor="email">Email</label>
                <input
                  type="text"
                  id="email"
                  placeholder="Email"
                  value={currentTeacher.email}
                  onChange={(e) =>
                    setCurrentTeacher({
                      ...currentTeacher,
                      email: e.target.value,
                    })
                  }
                />
                <label htmlFor="sdt">Số điện thoại</label>
                <input
                  type="text"
                  placeholder="Số điện thoại"
                  value={currentTeacher.sdt}
                  onChange={(e) =>
                    setCurrentTeacher({
                      ...currentTeacher,
                      sdt: e.target.value,
                    })
                  }
                />
                <label htmlFor="diachi">Địa chỉ</label>
                <input
                  type="text"
                  id="diachi"
                  placeholder="Địa chỉ"
                  value={currentTeacher.diachi}
                  onChange={(e) =>
                    setCurrentTeacher({
                      ...currentTeacher,
                      diachi: e.target.value,
                    })
                  }
                />
                <label htmlFor="tendangnhap">Tên đăng nhập</label>
                <input
                  type="text"
                  placeholder="Tên đăng nhập"
                  value={currentTeacher.tendangnhap}
                  onChange={(e) =>
                    setCurrentTeacher({
                      ...currentTeacher,
                      tendangnhap: e.target.value,
                    })
                  }
                />
                <label htmlFor="matkhau">Mật khẩu</label>
                <input
                  type="text"
                  id="matkhau"
                  placeholder="Mật khẩu"
                  value={currentTeacher.matkhau}
                  onChange={(e) =>
                    setCurrentTeacher({
                      ...currentTeacher,
                      matkhau: e.target.value,
                    })
                  }
                />
                <div className={classes["button-group"]}>
                  <button className={classes["save-btn"]} onClick={handleSave}>
                    Lưu
                  </button>
                  <button
                    className={classes["delete-btn"]}
                    onClick={handleDelete}
                  >
                    Xóa
                  </button>
                </div>
              </div>
            )}
          </div>
          <Pagination
            data={teacher}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          />
        </div>
      )}
    </>
  );
};

export default Teacher;
