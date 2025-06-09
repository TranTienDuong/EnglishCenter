import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ExamResult.module.scss';

const ExamResult = ({ userInfo, questions, answers, timeUsed }) => {
  const [showReview, setShowReview] = useState(false);
  const [resultData, setResultData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

    useEffect(() => {
    const fetchResult = async () => {
      if (!userInfo?.email || !userInfo?.phone) {
        setError('Thiếu thông tin người dùng');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`http://localhost:8080/api/v1/ketquathithu/ketqua/${userInfo.email}/${userInfo.phone}`);
        if (!res.ok) throw new Error('Không thể lấy kết quả');
        const data = await res.json();
        setResultData(data);
      } catch (err) {
        setError(err.message || 'Đã xảy ra lỗi',error);
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [userInfo]);
  if (loading) return <div>Đang tải kết quả...</div>;
  if (!userInfo || !questions) return <div>Đang tải kết quả...</div>;
  if (!resultData) return null;  

  const correctAnswers = resultData.cautraloidung;
  //const totalQuestions = resultData.tongsocauhoi;
  const percentage = parseFloat(((correctAnswers * 100) / 60).toFixed(2));

  return (
    <div className={styles.resultContainer}>
      <h2>Kết quả bài thi</h2>

      <div className={styles.userInfo}>
        <p>Thông tin thí sinh</p>
        <p><strong>Họ tên:</strong> {resultData.fullname}</p>
        <p><strong>Email:</strong> {resultData.email}</p>
        <p><strong>SĐT:</strong> {resultData.phone}</p>
      </div>

      <div className={styles.scoreSection}>
        <h3>Kết quả</h3>
        <div className={styles.scoreCircle}>
          <div className={styles.scoreValue}>{percentage}%</div>
        </div>

        <div className={styles.scoreDetails}>
          <p><strong>Số câu đúng:</strong> {correctAnswers}/60</p>
            <p><strong>Điểm số:</strong> {resultData.diem}/9</p>
            <p><strong>Trình độ dự đoán:</strong> {resultData.trinhdodudoan}</p>
            <p><strong>Thời gian làm bài:</strong> {Math.floor(timeUsed / 60)} phút {timeUsed % 60} giây</p>
        </div>
      </div>

      <div className={styles.actions}>
        <button className={styles.actionButton} onClick={() => setShowReview(!showReview)}>
          {showReview ? 'Ẩn bài làm' : 'Xem lại bài làm'}
        </button>
        <button className={styles.actionButton} onClick={() => navigate('/')}>
          Quay lại trang chủ  
        </button> 
      </div>

      {showReview && (
        <div className={styles.reviewSection}>
          {questions.map((question, index) => {
            const userAnswer = answers[question.id] || '';
            const correctAnswer = question.correct;
            const isCorrect = userAnswer === correctAnswer;

            return (
              <div key={question.id} className={`${styles.questionItem} ${isCorrect ? styles.correct : styles.incorrect}`}>
                <p><strong>Câu {index + 1}:</strong> {question.text}</p>
                <ul className={styles.optionList}>
  {question.options.map((option) => {
    const isUserAnswer = userAnswer === option.id;
    const isCorrectAnswer = correctAnswer === option.id;

    let label = '';
    if (isUserAnswer && isCorrectAnswer) {
      label = ' ✅ Bạn chọn đúng';
    } else if (isUserAnswer && !isCorrectAnswer) {
      label = ' ❌ Bạn chọn sai';
    } else if (isCorrectAnswer) {
      label = ' ✅ Đáp án đúng';
    }

    return (
      <li key={option.id}>
        <strong>{option.id}. </strong>
        {option.text}
        {label}
      </li>
    );
  })}
</ul>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ExamResult;
