import React, { useEffect, useState } from 'react';
import styles from './Question.module.scss';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import Pagination from '../../assets/Pagination/Pagination.jsx';

const TABS = {
  QUESTIONS: 'Danh sách câu hỏi',
  PASSAGES: 'Danh sách đoạn thi',
};

const SKILLS_QUESTION = ['Reading', 'Listening', 'Vocabulary', 'Grammar'];
const SKILLS_PASSAGE = ['Reading', 'Listening'];

const Question = () => {
  const [activeTab, setActiveTab] = useState(TABS.QUESTIONS);
  const [questions, setQuestions] = useState([]);
  const [passages, setPassages] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [form, setForm] = useState({});
  const [filterSkill, setFilterSkill] = useState('');
  const [search, setSearch] = useState('');
  const [edit, setEdit] = useState(false);
  const [add, setAdd] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPassage, setSelectedPassage] = useState('');
  const [filteredQuestions, setFilteredQuestions] = useState([]);

  const itemsPerPage = 10;

  useEffect(() => {
    fetchQuestions();
    fetchPassages();
  }, []);

  const fetchQuestionsByPassage = async (passageId) => {
  try {
    const res = await axios.get(`http://localhost:8080/api/v1/cauhoi/passage/${passageId}`);
    setFilteredQuestions(res.data); // Lưu vào state riêng
  } catch (error) {
    toast.error('Lỗi khi tải câu hỏi theo đoạn văn', error.message);
  }
};
  const fetchQuestions = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/v1/cauhoi');
      setQuestions(res.data);
    } catch (error) {
      toast.error('Lỗi khi tải danh sách câu hỏi', error.message);
    }
  };

  const fetchPassages = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/v1/doanthi');
      setPassages(res.data);
    } catch (error) {
      toast.error('Lỗi khi tải danh sách đoạn thi', error.message);
    }
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setForm(item);
    setEdit(true);
    setAdd(false);
  };

  const handleDelete = async (id, type) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa?')) return;
    try {
      await axios.delete(`http://localhost:8080/api/v1/${type}/${id}`);
      toast.success('Xóa thành công');
      if (type === 'cauhoi') fetchQuestions();
      else fetchPassages();
      setEdit(false);
    } catch (error) {
      toast.error('Xóa thất bại', error.message);
    }
  };

  const handleUpdate = async () => {
  const type = activeTab === TABS.QUESTIONS ? 'cauhoi' : 'doanthi';
  const id = type === 'cauhoi' ? form.macauhoi : form.madoan;

  try {
    if (id) {
      await axios.put(`http://localhost:8080/api/v1/${type}/${id}`, form);
      toast.success('Cập nhật thành công');
    }

    setForm({});
    setEdit(false);
    setAdd(false);
    type === 'cauhoi' ? fetchQuestions() : fetchPassages();
  } catch (error) {
    toast.error('Cập nhật thất bại', error.message);
  }
};

   const handleCreate = async () => {
    const type = activeTab === TABS.QUESTIONS ? 'cauhoi' : 'doanthi';
    try {    
        await axios.post(`http://localhost:8080/api/v1/${type}`, form);
        toast.success('Thêm mới thành công');
      setForm({});
      setEdit(false);
      setAdd(false);
      if (type === 'cauhoi') fetchQuestions();
      else fetchPassages();
    } catch (error) {
      toast.error('Thêm mới thất bại', error.message);
    }
  };

  const list = activeTab === TABS.QUESTIONS ? (selectedPassage ? filteredQuestions : questions) : passages;
  const type = activeTab === TABS.QUESTIONS ? 'cauhoi' : 'doanthi';
  const skillOptions = activeTab === TABS.QUESTIONS ? SKILLS_QUESTION : SKILLS_PASSAGE;

  const filteredList = list.filter(item => {
    if (!filterSkill && !search) return true;
    
    const matchesSkill = !filterSkill || 
      (activeTab === TABS.QUESTIONS 
        ? item.kynang === filterSkill 
        : item.loaidoan === filterSkill);
    
    const matchesSearch = !search || 
      (item.noidung?.toLowerCase().includes(search.toLowerCase()) || 
       item.tieude?.toLowerCase().includes(search.toLowerCase()));
    
    return matchesSkill && matchesSearch;
  });

  const paginatedList = filteredList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

 return (
  <div className={styles.container} onClick={() => {
    setEdit(false);
    setAdd(false);
  }}>
    <ToastContainer />
    <div className={styles.tabs}>
      {Object.values(TABS).map(tab => (
        <button
          key={tab}
          className={`${styles.tab} ${activeTab === tab ? styles.active : ''}`}
          onClick={() => {
            setActiveTab(tab);
            setForm({});
            setSelectedItem(null);
            setFilterSkill('');
            setEdit(false);
            setAdd(false);
          }}
        >
          {tab}
        </button>
      ))}
    </div>

    <div className={styles.actions}>
      <div className={styles.search}>
        <FontAwesomeIcon icon={faSearch} />
        <input
          type="text"
          placeholder={`Tìm kiếm ${activeTab === TABS.QUESTIONS ? 'câu hỏi' : 'đoạn thi'}`}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      
      <button 
        className={styles.addButton}
        onClick={(e) => {
          e.stopPropagation();
          setAdd(true);
          setEdit(false);
          setForm({});
        }}
      >
        + Thêm mới
      </button>
    </div>

    <div className={styles.filter}>
  <label>Chọn kỹ năng: </label>
  <select
    value={filterSkill}
    onChange={e => {
      setFilterSkill(e.target.value);
      setSelectedPassage(''); // Reset selected passage khi thay đổi kỹ năng
      if (!e.target.value) {
      fetchQuestions(); // Nếu chọn "Tất cả" thì fetch lại toàn bộ
    }
    }}
  >
    <option value="">Tất cả</option>
    {skillOptions.map(skill => (
      <option key={skill} value={skill}>{skill}</option>
    ))}
  </select>

  {['Reading', 'Listening'].includes(filterSkill) && (
    <>
      <label style={{marginLeft: '10px'}}>Chọn đoạn văn: </label>
      <select
        value={selectedPassage}
        onChange={e => {
          setSelectedPassage(e.target.value);
          if (e.target.value) {
            fetchQuestionsByPassage(e.target.value);
          } else {
            fetchQuestions(); // Load lại tất cả câu hỏi nếu chọn "Tất cả"
          }
        }}
      >
        <option value="">Tất cả</option>
        {passages
          .filter(p => p.loaidoan === filterSkill)
          .map(passage => (
            <option key={passage.madoan} value={passage.madoan}>
              {passage.tieude}
            </option>
          ))}
      </select>
    </>
  )}
</div>

    <div className={styles.tableContainer}>
      <table>
        <thead>
          <tr>
            <th>STT</th>
            {activeTab === TABS.QUESTIONS ? (
              <>
                <th>Nội dung</th>
                <th>Đáp án A</th>
                <th>Đáp án B</th>
                <th>Đáp án C</th>
                <th>Đáp án D</th>
                <th>Đáp án đúng</th>
                <th>Kỹ năng</th>
              </>
            ) : (
              <>
                <th>Tiêu đề</th>
                <th>Nội dung</th>
                <th>Loại</th>
                <th>Audio file</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {paginatedList.map((item, index) => (
            <tr 
              key={item.id} 
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(item);
              }}
            >
              <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
              {activeTab === TABS.QUESTIONS ? (
                <>
                  <td>{item.noidung}</td>
                  <td>{item.dapanA}</td>
                  <td>{item.dapanB}</td>
                  <td>{item.dapanC}</td>
                  <td>{item.dapanD}</td>
                  <td>{item.dapandung}</td>
                  <td>{item.kynang}</td>
                </>
              ) : (
                <>
                  <td>{item.tieude}</td>
                  <td>{item.noidung}</td>
                  <td>{item.loaidoan}</td>
                  <td>{item.audiofile}</td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {(edit || add) && (
      <div className={styles.editForm} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>
            {edit ? 'Chỉnh sửa' : 'Thêm mới'} 
            {activeTab === TABS.QUESTIONS ? ' câu hỏi' : ' đoạn thi'}
          </h2>
          <button onClick={() => {
            setEdit(false);
            setAdd(false);
          }}>X</button>
        </div>
        
        {activeTab === TABS.QUESTIONS ? (
          <div className={styles.twoColumnForm}>
            <div className={styles.formgroup}>
              <label>Nội dung câu hỏi</label>
              <textarea
                id="noidung"
                name="noidung"
                rows={2}
                placeholder="Nhập nội dung câu hỏi"
                required
                value={form.noidung || ''}
                onChange={e => setForm({ ...form, noidung: e.target.value })}
              />
            </div>
            <div className={styles.formgroup}>
              <label>Kỹ năng</label>
              <select
                value={form.kynang || ''}
                onChange={e => {
                  const skill = e.target.value;
                  setForm({ 
                    ...form, 
                    kynang: skill,
                    madoan: ['Reading', 'Listening'].includes(skill) ? form.madoan : null
                  });
                }}
              >
                <option value="">Chọn kỹ năng</option>
                {SKILLS_QUESTION.map(skill => (
                  <option key={skill} value={skill}>{skill}</option>
                ))}
              </select>
              </div>
            <div className={styles.formgroup}>
                  <label>Đoạn văn liên quan</label>
                  <select
                    value={form.madoan || ''}
                    disabled={!['Reading', 'Listening'].includes(form.kynang)}
                    onChange={e => setForm({ ...form, madoan: e.target.value })}
                  >
                    <option value="">Chọn đoạn văn</option>
                    {passages
                      .filter(p => p.loaidoan === form.kynang)
                      .map(passage => (
                        <option key={passage.id} value={passage.id}>
                          {passage.tieude}
                        </option>
                      ))}
                  </select>
              </div>
            <div className={styles.formgroup}>
              <label>Đáp án A</label>
              <input
                type="text"
                value={form.dapanA || ''}
                onChange={e => setForm({ ...form, dapanA: e.target.value })}
                placeholder="Nhập đáp án A"
              />
            </div>
            <div className={styles.formgroup}>
              <label>Đáp án B</label>
              <input
                type="text"
                value={form.dapanB || ''}
                onChange={e => setForm({ ...form, dapanB: e.target.value })}
                placeholder="Nhập đáp án B"
              />
            </div>
            
            <div className={styles.formgroup}>
              <label>Đáp án C</label>
              <input
                type="text"
                value={form.dapanC || ''}
                onChange={e => setForm({ ...form, dapanC: e.target.value })}
                placeholder="Nhập đáp án C"
              />
            </div>
            <div className={styles.formgroup}>  
              <label>Đáp án D</label>
              <input
                type="text"
                value={form.dapanD || ''}
                onChange={e => setForm({ ...form, dapanD: e.target.value })}
                placeholder="Nhập đáp án D"
              />
            </div>
            <div className={styles.formgroup}>
              <label>Đáp án đúng</label>
              <select
                value={form.dapandung || ''}
                onChange={e => setForm({ ...form, dapandung: e.target.value })}
              >
                <option value="">Chọn đáp án đúng</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
              </select>
            </div>
            <div className={styles.formgroup}>
              <label>Độ khó</label>
              <select
                value={form.dokho || ''}
                onChange={e => setForm({ ...form, dokho: e.target.value })}
              >
                <option value="">Chọn độ khó</option>
                <option value="1">Dễ</option>
                <option value="2">Trung bình</option>
                <option value="3">Khó</option>
              </select>
            </div>
          </div>
        ) : (
          <div className={styles.form}>
            <label>Tiêu đề</label>
            <input
              type="text"
              placeholder="Nhập tiêu đề đoạn thi"
              value={form.tieude || ''}
              onChange={e => setForm({ ...form, tieude: e.target.value })}
            />
            <label>Nội dung đoạn thi</label>
            <textarea
              id="noidung"
              name="noidung"
              rows={5}
              placeholder="Nhập nội dung đoạn thi"
              value={form.noidung || ''}
              onChange={e => setForm({ ...form, noidung: e.target.value })}
            />
            <label>Loại</label>
            <select
              value={form.loaidoan || ''}
              onChange={e => setForm({ ...form, loaidoan: e.target.value })}
            >
              <option value="">Chọn loại</option>
              {SKILLS_PASSAGE.map(skill => (
                <option key={skill} value={skill}>{skill}</option>
              ))}
            </select>
            <label>Độ khó</label>
              <select
                value={form.dokho || ''}
                onChange={e => setForm({ ...form, dokho: e.target.value })}
              >
                <option value="">Chọn độ khó</option>
                <option value="1">Dễ</option>
                <option value="2">Trung bình</option>
                <option value="3">Khó</option>
              </select>

            <label>Audio file</label>
            <input
              type="text"
              placeholder="Nhập tên audio file"
              disabled={!['Listening'].includes(form.loaidoan)}
              value={form.audiofile || ''}
              onChange={e => setForm({ ...form, audiofile: e.target.value })}
            />
          </div>
        )}
        
        <div className={styles.buttonGroup}>
          <button className={styles.saveButton} onClick={edit ? handleUpdate : handleCreate}>
            Lưu
          </button>

          {edit && (
            <button 
              className={styles.deleteButton} 
              onClick={() => handleDelete(activeTab === TABS.QUESTIONS ? form.macauhoi : form.madoan, type)}
            >
              Xóa
            </button>
          )}
        </div>
      </div>
    )}

    <Pagination
      data={filteredList}
      itemsPerPage={itemsPerPage}
      currentPage={currentPage}
      setCurrentPage={setCurrentPage}
    />
  </div>
);
};

export default Question;