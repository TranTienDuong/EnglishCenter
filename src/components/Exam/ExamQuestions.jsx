import React, { useState, useEffect } from 'react';
import styles from './ExamQuestions.module.scss';

const ExamQuestions = ({ duration, onSubmit, formData }) => {
  const [questions, setQuestions] = useState([]);
  const [passageMap, setPassageMap] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(duration * 60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8080/api/v1/test/generate')
      .then(res => res.json())
      .then(data => {
        const allPassages = [
          ...(data.listening_passages || []),
          ...(data.reading_passages || []),
          ...(data.listening_passage ? [data.listening_passage] : []),
          ...(data.reading_passage ? [data.reading_passage] : [])
        ];

        const map = {};
        allPassages.forEach(p => {
          map[p.madoan] = p;
        });
        setPassageMap(map);

        const allQuestions = [
          ...(data.listening_questions || []),
          ...(data.reading_questions || []),
          ...(data.grammar_vocab_questions || [])
        ];

        const formatted = allQuestions.map(q => ({
          id: q.macauhoi,
          text: q.noidung,
          options: [
            { id: 'A', text: q.dapanA },
            { id: 'B', text: q.dapanB },
            { id: 'C', text: q.dapanC },
            { id: 'D', text: q.dapanD }
          ],
          correct: q.dapandung,
          skill: q.kynang,
          level: q.dokho,
          madoan: q.madoan || null
        }));

        setQuestions(formatted);
        setLoading(false);
      })
      .catch(err => {
        console.error('Lỗi khi lấy dữ liệu:', err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (loading || questions.length === 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, questions]);

  const handleAnswerSelect = (questionId, answerId) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerId
    }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmitConfirmed = async () => {
    if (isSubmitting) return;
    if (!formData.email || !formData.phone) {
    alert('Thông tin người dùng chưa đầy đủ!');
    return;
  }
    setIsSubmitting(true);
    const timeUsed = duration * 60 - timeLeft;
    
    const formattedAnswers = questions.map(q => ({
      macauhoi: q.id,  // backend cần Question object có macauhoi
      dapanchon: answers[q.id] || ''
    }));
    const payload = {
      fullname: formData.name,
      email: formData.email,
      phone: formData.phone,
      cautraloi: formattedAnswers
    };
    try {
      const res = await fetch('http://localhost:8080/api/v1/ketquathithu/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Lỗi khi nộp bài');
      }

      const result = await res.json();
      onSubmit({
      resultData: result,
      questions,
      answers
    }, timeUsed); // callback lên cha xử lý kết quả
    } catch (error) {
      console.error('Submit error:', error);
      alert('Nộp bài thất bại: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = () => {
  const confirm = window.confirm('Bạn có chắc chắn muốn nộp bài không?');
  if (confirm) {
    handleSubmitConfirmed();
  }
};

  const formatTime = seconds => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) return <div className={styles.loading}>Đang tải câu hỏi...</div>;

  const question = questions[currentQuestion];
  const passage = question.madoan ? passageMap[question.madoan] : null;

  const showPassage = question.skill === 'Listening' || question.skill === 'Reading';

  return (
    <div className={styles.examContainer}>
      {/* Header với timer và nút nộp bài */}
      <div className={styles.header}>
        <div className={styles.timer}>
          Thời gian còn lại: {formatTime(timeLeft)}
        </div>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`${styles.submitButton} ${styles.submitTopButton}`}
          title="Nộp bài"
        >
          Nộp bài
        </button>
      </div>

      {/* Danh sách số câu hỏi để bấm chọn nhanh */}
      <div className={styles.questionList}>
        {questions.map((q, idx) => {
          const answered = answers[q.id] !== undefined;
          return (
            <button
              key={q.id}
              className={`${styles.questionNumber} ${
                idx === currentQuestion ? styles.currentQuestion : ''
              } ${answered ? styles.answeredQuestion : ''}`}
              onClick={() => setCurrentQuestion(idx)}
              title={`Câu ${idx + 1} ${answered ? '(Đã trả lời)' : ''}`}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>

     {showPassage && passage && (
  <div className={styles.passageBlock}>
    {passage.tieude && <h4>{passage.tieude}</h4>}

    {/* Hiện nội dung nếu là Reading */}
    {passage.loaidoan === 'Reading' && passage.noidung && (
      <p>{passage.noidung}</p>
    )}

    {/* Hiện file audio nếu là Listening */}
    {passage.loaidoan === 'Listening' && passage.audiofile && (
      <audio controls>
        <source src={`/audios/test.mp3`} type="audio/mpeg" />
        Trình duyệt không hỗ trợ phát âm thanh.
      </audio>
    )}
  </div>
)}


      {/* Phần câu hỏi */}
      {/* <div className={styles.questionContainer}>
        <h3 className={styles.questionText}>{question.text}</h3>

        <div className={styles.options}>
          {question.options.map(option => (
            <div
              key={option.id}
              className={`${styles.option} ${
                answers[question.id] === option.id ? styles.selected : ''
              }`}
              onClick={() => handleAnswerSelect(question.id, option.id)}
            >
              <span className={styles.optionId}>{option.id.toUpperCase()}</span>
              <span className={styles.optionText}>{option.text}</span>
            </div>
          ))}
        </div>
      </div> */}
      <div className={styles.questionContainer}>
  <h3 className={styles.questionText}>
    Câu {currentQuestion + 1}: {questions[currentQuestion].text}
  </h3>

  <div className={styles.options}>
    {questions[currentQuestion].options.map(option => (
      <div
        key={option.id}
        className={`${styles.option} ${
          answers[questions[currentQuestion].id] === option.id ? styles.selected : ''
        }`}
        onClick={() => handleAnswerSelect(questions[currentQuestion].id, option.id)}
      >
        <span className={styles.optionId}>{option.id.toUpperCase()}</span>
        <span className={styles.optionText}>{option.text}</span>
      </div>
    ))}
  </div>
</div>


      {/* Nút điều hướng câu hỏi */}
      <div className={styles.navigation}>
        <button
          onClick={handlePrev}
          disabled={currentQuestion === 0}
          className={styles.navButton}
        >
          Câu trước
        </button>

        {currentQuestion < questions.length - 1 ? (
          <button onClick={handleNext} className={styles.navButton}>
            Câu tiếp
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`${styles.navButton} ${styles.submitButton}`}
          >
            Nộp bài
          </button>
        )}
      </div>
    </div>
  );
};

export default ExamQuestions;
