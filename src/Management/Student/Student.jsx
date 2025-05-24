import React, { useState, useEffect } from "react";
import classes from "./Student.module.scss";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/flatpickr.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ExcelExport from "../../assets/ExcelExport.jsx";
import Loader from "../../assets/Loader/Loader.jsx";
import Pagination from "../../assets/Pagination/Pagination.jsx";

const Student = () => {
  const [student, setStudent] = useState([]);
  const [classData, setClassData] = useState([]); // ? Class info to choose when adding new student.
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState(false);
  const [add, setAdd] = useState(false);
  const [currentStudent, setCurrentStudent] = useState({});
  const [newStudent, setNewStudent] = useState({
    hoten: "",
    gioitinh: "Nam",
    ngaysinh: new Date(),
    email: "",
    sdt: "",
    diachi: "",
    tendangnhap: "",
    matkhau: "",
    tenchucvu: "Học Viên",
  }); // ? For adding
  const [addToClass, setAddToClass] = useState(null); // ? For adding
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
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
    axios
      .get("http://localhost:8080/api/v1/nguoidung/getAllHocSinh")
      .then((res) => {
        setStudent(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    axios
      .get("http://localhost:8080/api/v1/lophoc")
      .then((res) => {
        const currentDate = new Date(); // Current date
        const filteredData = res.data.filter((item) => {
          const ngayKhaiGiang = new Date(item.ngaykhaigiang);
          const rangeEnd = new Date(ngayKhaiGiang);
          rangeEnd.setDate(rangeEnd.getDate() + 15);
          return (
            (currentDate >= ngayKhaiGiang && currentDate <= rangeEnd) ||
            currentDate <= ngayKhaiGiang
          );
        });

        const sortedData = filteredData.sort((a, b) =>
          b.tenlophoc.localeCompare(a.tenlophoc, "vi", { sensitivity: "base" })
        );

        setClassData(sortedData);
      })

      .catch((err) => {
        console.error(err);
      });
  }, [add]);

  if (loading) {
    return <Loader />;
  }

  const getDate = (d) => {
    const date = new Date(d);
    const formattedDate = date.toLocaleDateString("vi-VN");
    return formattedDate;
  };

  const handleEdit = (student) => {
    setEdit(true);
    setCurrentStudent(student);
  };
  const fetchStudents = () => {
    axios
      .get("http://localhost:8080/api/v1/nguoidung/getAllHocSinh")
      .then((res) => {
        setStudent(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleSave = async () => {
    try {
      await axios.put(
        `http://localhost:8080/api/v1/nguoidung/${currentStudent.manguoidung}`,
        currentStudent
      );
      setStudent((students) =>
        students.map((student) =>
          student.manguoidung === currentStudent.manguoidung
            ? currentStudent
            : student
        )
      );
      setEdit(false);
      toast.success("Cập nhật thành công");
      setCurrentStudent({});
    } catch (error) {
      toast.error("Cập nhật thất bại");
      console.error(error);
    }
  };

  const paginatedStudent = student
    .filter((student) => {
      if (search === "") return true; // Show all students if search is empty
      const searchLower = search.toLowerCase();
      return (
        student.hoten.toLowerCase().includes(searchLower) ||
        student.email.toLowerCase().includes(searchLower) ||
        student.sdt.toLowerCase().includes(searchLower)
      );
    })
    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleAddNewStudent = async () => {
  // Kiểm tra trùng lặp tên đăng nhập và mật khẩu
  const isDuplicate = student.some(
    (s) =>
      s.tendangnhap === newStudent.tendangnhap &&
      s.matkhau === newStudent.matkhau
  );

  if (!newStudent.hoten || !newStudent.email || !newStudent.sdt || !newStudent.tendangnhap || !newStudent.matkhau) {
    toast.error("Vui lòng điền đầy đủ thông tin.");
    return;
  }
  const nameRegex = /^[a-zA-Zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ\s]+$/;
  if (!newStudent.hoten || !nameRegex.test(newStudent.hoten)) {
    toast.error("Họ và tên không hợp lệ. Vui lòng chỉ nhập chữ và dấu tiếng Việt.");
    return;
  }
   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(newStudent.email)) {
    toast.error("Email không hợp lệ.");
    return;
  }

  const phoneRegex = /^[0-9]{10}$/;  // Regex kiểm tra số điện thoại 10 chữ số
  if (!phoneRegex.test(newStudent.sdt)) {
    toast.error("Số điện thoại phải có 10 chữ số.");
    return;
  }

  if (isDuplicate) {
    toast.error("Tên đăng nhập và mật khẩu đã tồn tại.");
    return;
  }

  try {
    const payload = {
      nguoiDungDTO: newStudent,
      malop: addToClass || null,
    };

    // Gửi yêu cầu thêm học viên
    await axios.post(
      `http://localhost:8080/api/v1/nguoidung/themhocsinh`,
      payload
    );

    // Hiển thị thông báo thành công
    toast.success("Thêm mới học viên thành công");

    // Reset lại các trường sau khi thêm học viên
    setNewStudent({
      hoten: "",
      gioitinh: "Nam",
      ngaysinh: new Date(),
      email: "",
      sdt: "",
      diachi: "",
      tendangnhap: "",
      matkhau: "",
      tenchucvu: "Học Viên",
    });
    setAddToClass(null);
    setAdd(false); // Đóng form sau khi thêm học viên thành công

    // Cập nhật danh sách học viên mới sau khi thêm
    fetchStudents();  // Lấy lại dữ liệu học viên mới từ API

  } catch (error) {
    console.error("Error adding student:", error.response?.data || error.message);
    toast.error("Lỗi khi thêm học viên");
  }
};

  const handleDeleteStudent = async () => {
  if (!currentStudent.manguoidung) {
    toast.error("Không tìm thấy ID học viên để xóa.");
    return;
  }

  const confirm = window.confirm("Bạn có chắc chắn muốn xóa học viên này?");
  if (!confirm) return;

  try {
    const studentId = currentStudent.manguoidung.toString(); // Ensure the ID is a string

    // Send a DELETE request to delete the student
    await axios.delete(`http://localhost:8080/api/v1/nguoidung/${studentId}`);
    toast.success("Xóa học viên thành công");

    // Refresh the list of students after deletion
    fetchStudents();
    setEdit(false); // Close the edit form
    setCurrentStudent({}); // Reset the current student data
  } catch (error) {
    console.error("Lỗi khi xóa học viên:", error.response?.data || error.message);
    toast.error("Lỗi khi xóa học viên");
  }
};




  return (
    <div className={classes.student} onClick={() => setEdit(false)}>
        <ToastContainer />
      {add ? (
        <>
          <div className={classes.header}>
            <h2>Thêm học viên mới</h2>
            <button onClick={() => setAdd(false)}>Quay lại</button>
          </div>
          <div className={classes.form}>
            <label htmlFor="hoten">Họ và tên</label>
            <input
              type="text"
              autoComplete="off"
              id="hoten"
              value={newStudent.hoten}
              required
              onChange={(e) =>
                setNewStudent({ ...newStudent, hoten: e.target.value })
              }
            />
            <label htmlFor="gioitinh">Giới tính</label>
            <select
              id="gioitinh"
              required
              value={newStudent.gioitinh}
              onChange={(e) =>
                setNewStudent({ ...newStudent, gioitinh: e.target.value })
              }
            >
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
            </select>
            <label htmlFor="ngaysinh">Ngày sinh</label>
            <Flatpickr
              value={new Date(newStudent.ngaysinh)}
              onChange={([date]) =>
                setNewStudent({ ...newStudent, ngaysinh: date })
              }
            />
            <label htmlFor="email">Email</label>
            <input
              type="text"
              required
              id="email"
              autoComplete="off"
              value={newStudent.email}
              onChange={(e) =>
                setNewStudent({ ...newStudent, email: e.target.value })
              }
            />
            <label htmlFor="sdt">Số điện thoại</label>
            <input
              type="text"
              required
              id="sdt"
              autoComplete="off"
              value={newStudent.sdt}
              onChange={(e) =>
                setNewStudent({ ...newStudent, sdt: e.target.value })
              }
            />
            <label htmlFor="diachi">Địa chỉ</label>
            <input
              type="text"
              required
              id="diachi"
              autoComplete="off"
              value={newStudent.diachi}
              onChange={(e) =>
                setNewStudent({ ...newStudent, diachi: e.target.value })
              }
            />
            <label htmlFor="tendangnhap">Tên đăng nhập</label>
            <input
              autoComplete="off"
              required
              type="text"
              id="tendangnhap"
              value={newStudent.tendangnhap}
              onChange={(e) =>
                setNewStudent({
                  ...newStudent,
                  tendangnhap: e.target.value,
                })
              }
            />
            <label htmlFor="matkhau">Mật khẩu</label>
            <input
              type="password"
              required
              id="matkhau"
              value={newStudent.matkhau}
              onChange={(e) =>
                setNewStudent({ ...newStudent, matkhau: e.target.value })
              }
            />

            <label htmlFor="lop">Chọn lớp học</label>
            <select
              name=""
              id=""
              onChange={(e) => setAddToClass(e.target.value || null)}
            >
              <option value="">Không cần chọn lớp học</option>
              {classData.map((classData) => (
                <option key={classData.malop} value={classData.malop}>
                  {classData.tenlophoc} / {classData.thuhoc} / {classData.cahoc}
                </option>
              ))}
            </select>
            <button onClick={handleAddNewStudent}>Thêm mới</button>
          </div>
        </>
      ) : (
        <>
          <h1>Danh sách học viên đang học tại trung tâm</h1>
          <div className={classes.search}>
            <FontAwesomeIcon icon={faSearch} />
            <input
              type="text"
              placeholder="Tìm kiếm học viên"
              onChange={(e) => setSearch(e.target.value)}
            />
            <ExcelExport
              columns={columns}
              data={student}
              fileName="student"
              title="Danh sách sinh viên đang học tại trung tâm"
            />
            <button id={classes.new_student_btn} onClick={() => setAdd(true)}>
              Thêm học viên mới
            </button>
          </div>
          <div className={classes.container}>
            <table>
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Họ và tên</th>
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
                {paginatedStudent.map((student, index) => (
                  <tr
                    key={student.manguoidung}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(student);
                    }}
                  >
                    <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                    <td>{student.hoten}</td>
                    <td>{student.gioitinh}</td>
                    <td>{getDate(student.ngaysinh)}</td>
                    <td>{student.email}</td>
                    <td>{student.sdt}</td>
                    <td>{student.diachi}</td>
                    <td>{student.tendangnhap}</td>
                    <td>{student.matkhau}</td>
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
                  <h1>Thông tin học viên</h1>
                  <button onClick={() => setEdit(false)}>X</button>
                </div>
                <label htmlFor="hoten">Họ và tên</label>
                <input
                  type="text"
                  id="hoten"
                  placeholder="Họ và tên"
                  value={currentStudent.hoten}
                  onChange={(e) =>
                    setCurrentStudent({
                      ...currentStudent,
                      hoten: e.target.value,
                    })
                  }
                />
                <label htmlFor="gioitinh">Giới tính</label>
                <select
                  id="gioitinh"
                  value={currentStudent.gioitinh}
                  onChange={(e) =>
                    setCurrentStudent({
                      ...currentStudent,
                      gioitinh: e.target.value,
                    })
                  }
                >
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                </select>
                <label htmlFor="ngaysinh">Ngày sinh</label>
                <Flatpickr
                  value={new Date(currentStudent.ngaysinh)} // Convert initial string to Date object
                  onChange={([date]) => {
                    const formattedDate = getDate(date); // Format the selected date
                    setCurrentCourse({
                      ...currentCourse,
                      ngaysinh: formattedDate,
                    });
                  }}
                />
                <label htmlFor="email">Email</label>
                <input
                  type="text"
                  id="email"
                  placeholder="Email"
                  value={currentStudent.email}
                  onChange={(e) =>
                    setCurrentStudent({
                      ...currentStudent,
                      email: e.target.value,
                    })
                  }
                />
                <label htmlFor="sdt">Số điện thoại</label>
                <input
                  type="text"
                  placeholder="Số điện thoại"
                  value={currentStudent.sdt}
                  onChange={(e) =>
                    setCurrentStudent({
                      ...currentStudent,
                      sdt: e.target.value,
                    })
                  }
                />
                <label htmlFor="diachi">Địa chỉ</label>
                <input
                  type="text"
                  id="diachi"
                  placeholder="Địa chỉ"
                  value={currentStudent.diachi}
                  onChange={(e) =>
                    setCurrentStudent({
                      ...currentStudent,
                      diachi: e.target.value,
                    })
                  }
                />
                <label htmlFor="tendangnhap">Tên đăng nhập</label>
                <input
                  type="text"
                  placeholder="Tên đăng nhập"
                  value={currentStudent.tendangnhap}
                  onChange={(e) =>
                    setCurrentStudent({
                      ...currentStudent,
                      tendangnhap: e.target.value,
                    })
                  }
                />
                <label htmlFor="matkhau">Mật khẩu</label>
                <input
                  type="text"
                  id="matkhau"
                  placeholder="Mật khẩu"
                  value={currentStudent.matkhau}
                  onChange={(e) =>
                    setCurrentStudent({
                      ...currentStudent,
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
                    onClick={handleDeleteStudent}
                  >
                    Xóa
                  </button>
                </div>
              </div>
            )}
          </div>
          <Pagination
            data={student}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          />
        </>
      )}
    </div>
  );
};

export default Student;
