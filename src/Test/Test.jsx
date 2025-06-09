import React, { useState } from 'react';
import styles from './Test.module.scss';
import ExamInfoForm from '../components/Exam/ExamInfoForm';
import ExamQuestions from '../components/Exam/ExamQuestions';
import ExamResult from '../components/Exam/ExamResult';

const Test = () => {
  const [step, setStep] = useState('info'); // 'info', 'exam', 'result'
  const [userInfo, setUserInfo] = useState(null);
//  const [result, setResult] = useState(null);
  const [resultData, setResultData] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [timeUsed, setTimeUsed] = useState(0);

  const handleSubmitInfo = (formData) => {
    setUserInfo(formData);
    setStep('exam');
  };

//   const handleExamFinished = (examResult) => {
//     setResult(examResult);
//     setStep('result');
//   };
  const handleExamFinished = (data, timeUsed) => {
    setResultData(data.resultData);
    setAnswers(data.answers);
    setQuestions(data.questions);
    setTimeUsed(timeUsed); // <- lưu lại thời gian làm bài
    setStep('result');
  };

  return (
    <div className={styles.onlineTest}>
      {step === 'info' && <ExamInfoForm onSubmit={handleSubmitInfo} />}
      {step === 'exam' && (
        <ExamQuestions formData={userInfo} duration={60} onSubmit={handleExamFinished} />
      )}
      {/* {step === 'result' && <ExamResult userInfo={userInfo} resultData={result.resultData}
  questions={result.questions}
  answers={result.answers}
  timeUsed={result.timeUsed} />} */}
  {step === 'result' && (
        <ExamResult
        userInfo={userInfo}
          resultData={resultData}
          questions={questions}
          answers={answers}
          timeUsed={timeUsed} // <- truyền đúng timeUsed vào
        />
      )}
    </div>
  );
};

export default Test;
