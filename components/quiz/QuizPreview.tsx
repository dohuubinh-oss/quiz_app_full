
"use client";

import type React from "react";
import { useState } from "react";
import { Card, Typography, Radio, Input, Button, Progress, Result } from "antd";
// The IQuiz and IQuestion types should now reflect the camelCase properties
import type { IQuiz, IQuestion } from "@/models/Quiz"; 
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  TrophyOutlined,
  MehOutlined,
  SmileOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";

const { Title, Paragraph, Text } = Typography;

interface QuizPreviewProps {
  quiz: IQuiz;
  questions: IQuestion[];
  readOnly?: boolean;
}

// FINAL VERSION: This component is clean, uses camelCase, and correctly displays options.
const QuizPreview: React.FC<QuizPreviewProps> = ({
  quiz,
  questions,
  readOnly = false,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const handleAnswer = (value: string) => {
    setAnswers({
      ...answers,
      [currentQuestion.id]: value,
    });
  };

  const handleNext = () => {
    if (isLastQuestion) {
      setIsSubmitting(true);
      setTimeout(() => {
        setShowResults(true);
        setIsSubmitting(false);
      }, 1000);
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentQuestionIndex(currentQuestionIndex - 1);
  };

  const calculateScore = () => {
    let correctAnswers = 0;
    questions.forEach((question) => {
      if (answers[question.id] === question.correctAnswer) {
        correctAnswers++;
      }
    });
    return {
      score: correctAnswers,
      total: questions.length,
      percentage: Math.round((correctAnswers / questions.length) * 100),
    };
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setAnswers({});
    setShowResults(false);
  };

  const getResultIcon = (percentage: number) => {
    if (percentage >= 80) return <TrophyOutlined className="text-6xl text-yellow-500" />;
    if (percentage >= 60) return <SmileOutlined className="text-6xl text-green-500" />;
    return <MehOutlined className="text-6xl text-orange-500" />;
  };

  const getResultMessage = (percentage: number) => {
    if (percentage >= 80) return { title: "Outstanding! 🎉", subtitle: "You're a quiz master!", color: "text-yellow-600" };
    if (percentage >= 60) return { title: "Great Job! 😊", subtitle: "Well done, keep it up!", color: "text-green-600" };
    return { title: "Keep Practicing! 💪", subtitle: "You'll get better with practice!", color: "text-orange-600" };
  };

  if (questions.length === 0) {
    return <Result status="warning" title="No Questions" subTitle="This quiz doesn't have any questions yet." />;
  }

  if (showResults) {
    const { score, total, percentage } = calculateScore();
    const resultMessage = getResultMessage(percentage);

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Card className="mb-8 shadow-2xl border-0 rounded-3xl overflow-hidden bg-white">
            <div className="text-center py-12">
              <div className="animate-bounce mb-6">{getResultIcon(percentage)}</div>
              <Title level={1} className={`mb-4 ${resultMessage.color}`}>{resultMessage.title}</Title>
              <Paragraph className="text-xl text-gray-600 mb-8">{resultMessage.subtitle}</Paragraph>
              <div className="flex justify-center items-center space-x-8 mb-8">
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-2">{score}</div>
                  <div className="text-gray-500">Correct</div>
                </div>
                <div className="text-6xl text-gray-300">/</div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-600 mb-2">{total}</div>
                  <div className="text-gray-500">Total</div>
                </div>
              </div>
              <div className="flex justify-center mb-8">
                <div className="relative w-32 h-32">
                  <Progress type="circle" percent={percentage} size={128} strokeColor={{"0%": "#3b82f6", "100%": "#8b5cf6"}} strokeWidth={8} className="animate-pulse" />
                </div>
              </div>
              <Button type="primary" onClick={resetQuiz} size="large" className="h-12 px-8 bg-gradient-to-r from-blue-500 to-purple-600 border-0 rounded-xl font-medium shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
                🔄 Try Again
              </Button>
            </div>
          </Card>

          <Card className="shadow-xl border-0 rounded-3xl overflow-hidden bg-white">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 border-b border-gray-100">
              <Title level={3} className="mb-2 text-gray-800">📋 Question Review</Title>
              <Paragraph className="text-gray-600 mb-0">See how you performed on each question</Paragraph>
            </div>
            <div className="p-6 space-y-6">
              {questions.map((question, index) => {
                const isCorrect = answers[question.id] === question.correctAnswer;
                return (
                  <Card key={question.id} className={`border-2 rounded-2xl transition-all duration-300 ${isCorrect ? "border-green-200 bg-green-50 shadow-green-100" : "border-red-200 bg-red-50 shadow-red-100"} shadow-lg hover:shadow-xl`}>
                    <div className="flex items-start space-x-4">
                      <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg ${isCorrect ? "bg-gradient-to-r from-green-400 to-green-600" : "bg-gradient-to-r from-red-400 to-red-600"}`}>
                        {isCorrect ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                      </div>
                      <div className="flex-grow">
                        <div className="flex items-center space-x-3 mb-3">
                          <Title level={5} className="mb-0">Question {index + 1}</Title>
                          <div className={`px-3 py-1 rounded-full text-sm font-medium ${isCorrect ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"}`}>
                            {isCorrect ? "✓ Correct" : "✗ Incorrect"}
                          </div>
                        </div>
                        <Paragraph className="text-gray-700 mb-4 text-lg">{question.questionText}</Paragraph>

                        {(question.questionType === "two_choices" || question.questionType === "four_choices") && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {question.options.map((option, optionIndex) => {
                                const optionLetter = String.fromCharCode(65 + optionIndex);
                                return (
                                  <div key={option.id + optionIndex} className={`p-4 rounded-xl border-2 transition-all duration-300 ${option.id === question.correctAnswer ? "border-green-300 bg-green-100" : (answers[question.id] && answers[question.id] === option.id) ? "border-red-300 bg-red-100" : "border-gray-200 bg-gray-50"}`}>
                                    <div className="flex items-center space-x-3">
                                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${option.id === question.correctAnswer ? "bg-green-500 text-white" : (answers[question.id] && answers[question.id] === option.id) ? "bg-red-500 text-white" : "bg-gray-300 text-gray-600"}`}>
                                        {optionLetter}
                                      </div>
                                      <span className="flex-1 font-medium">{option.text}</span>
                                      {option.id === question.correctAnswer && <CheckCircleOutlined className="text-green-500 text-xl" />}
                                      {answers[question.id] && answers[question.id] === option.id && option.id !== question.correctAnswer && <CloseCircleOutlined className="text-red-500 text-xl" />}
                                    </div>
                                  </div>
                                );
                            })}
                          </div>
                        )}

                        {question.questionType === "input" && (
                          <div className="space-y-3">
                            <div className="p-4 bg-gray-100 rounded-xl">
                              <Text strong className="text-gray-700">Your answer:{" "}</Text>
                              <Text className={`font-bold ${isCorrect ? "text-green-600" : "text-red-600"}`}>{answers[question.id] || "No answer provided"}</Text>
                            </div>
                            {!isCorrect && (
                              <div className="p-4 bg-green-100 rounded-xl">
                                <Text strong className="text-green-700">Correct answer:{" "}</Text>
                                <Text className="text-green-800 font-bold">{question.correctAnswer}</Text>
                              </div>
                            )}
                          </div>
                        )}

                        {question.explanation && (
                          <div className="mt-8">
                            <div className="flex items-center space-x-3 mb-2">
                              <InfoCircleOutlined className="text-blue-500 text-lg" />
                              <Text className="text-sm font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">Giải Thích</Text>
                            </div>
                            <div className="p-4 bg-green-100 border-2 border-blue-500 rounded-xl">
                               <Paragraph className="text-green-900 mb-0 font-bold">{question.explanation}</Paragraph>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card className="mb-8 shadow-xl border-0 rounded-2xl overflow-hidden bg-white/90 backdrop-blur-sm">
            <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg animate-pulse">
                            <span className="text-white font-bold text-2xl">{currentQuestionIndex + 1}</span>
                        </div>
                        <div>
                            <Text className="text-gray-600 text-sm font-medium">Question Progress</Text>
                            <div className="text-2xl font-bold text-gray-800">{currentQuestionIndex + 1} of {questions.length}</div>
                        </div>
                    </div>
                    <div className="text-right">
                        <Text className="text-gray-600 text-sm font-medium">Completion</Text>
                        <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}%</div>
                    </div>
                </div>
                <Progress percent={Math.round(((currentQuestionIndex + 1) / questions.length) * 100)} showInfo={false} status="active" strokeColor={{"0%": "#3b82f6", "100%": "#8b5cf6"}} railColor="#f1f5f9" size={12} className="mb-0"/>
            </div>
        </Card>
        
        <Card className="shadow-2xl border-0 rounded-3xl overflow-hidden bg-white animate-fade-in-up">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-8 text-white">
            <h1 className="text-white mb-4 leading-tight animate-slide-in">{currentQuestion.questionText}</h1>
            <div className="flex items-center space-x-4 opacity-90">
              <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
                {currentQuestion.questionType === "two_choices" && "🔄 Binary Choice"}
                {currentQuestion.questionType === "four_choices" && "📝 Multiple Choice"}
                {currentQuestion.questionType === "input" && "✍️ Text Answer"}
              </span>
              <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">Question {currentQuestionIndex + 1}</span>
            </div>
          </div>
          <div className="p-8">
            {(currentQuestion.questionType === "two_choices" || currentQuestion.questionType === "four_choices") && (
              <Radio.Group onChange={(e) => handleAnswer(e.target.value)} value={answers[currentQuestion.id]} className="w-full" disabled={readOnly}>
                <div className="space-y-4">
                  {currentQuestion.options.map((option, index) => (
                    <div key={currentQuestion.id + option.id + index} className="group animate-slide-in" style={{ animationDelay: `${index * 100}ms` }}>
                      <Radio value={option.id} className="w-full p-0 m-0">
                        <div className={`w-full p-6 border-2 rounded-2xl transition-all duration-300 cursor-pointer transform hover:scale-[1.02] ${answers[currentQuestion.id] === option.id ? "border-blue-500 bg-blue-50 shadow-lg shadow-blue-100" : "border-gray-200 hover:border-blue-300 hover:bg-blue-25 hover:shadow-md"} ${readOnly && option.id === currentQuestion.correctAnswer ? "border-green-500 bg-green-50" : ""}`}>
                          <div className="flex items-center space-x-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 ${answers[currentQuestion.id] === option.id ? "bg-blue-500 text-white shadow-lg" : "bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600"} ${readOnly && option.id === currentQuestion.correctAnswer ? "bg-green-500 text-white" : ""}`}>
                              {String.fromCharCode(65 + index)}
                            </div>
                            <span className="text-lg text-gray-800 flex-1 font-medium">{option.text}</span>
                            {readOnly && option.id === currentQuestion.correctAnswer && <CheckCircleOutlined className="text-green-500 text-2xl animate-bounce" />}
                          </div>
                        </div>
                      </Radio>
                    </div>
                  ))}
                </div>
              </Radio.Group>
            )}

            {currentQuestion.questionType === "input" && (
              <div className="space-y-4 animate-fade-in">
                <Input placeholder="Type your answer here..." value={answers[currentQuestion.id] || ""} onChange={(e) => handleAnswer(e.target.value)} disabled={readOnly} className="h-16 text-lg border-2 border-gray-200 rounded-2xl hover:border-blue-400 focus:border-blue-500 transition-all duration-300 shadow-sm focus:shadow-lg" size="large" />
                {readOnly && (
                  <div className="p-4 bg-green-50 border-2 border-green-200 rounded-2xl animate-slide-in">
                    <Text className="text-green-700 font-medium text-lg">✅ Correct answer: {currentQuestion.correctAnswer}</Text>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="px-8 pb-8">
            <div className="flex justify-between items-center">
              <Button onClick={handlePrevious} disabled={currentQuestionIndex === 0} size="large" className="h-14 px-8 border-2 border-gray-300 hover:border-gray-400 transition-all duration-300 rounded-xl font-medium disabled:opacity-50">
                <span className="flex items-center space-x-2"><span>←</span><span>Previous</span></span>
              </Button>
              <Button type="primary" onClick={handleNext} disabled={!readOnly && !answers[currentQuestion.id]} loading={isSubmitting} size="large" className="h-14 px-8 bg-gradient-to-r from-blue-500 to-purple-600 border-0 hover:shadow-xl hover:scale-105 transition-all duration-300 rounded-xl font-medium">
                <span className="flex items-center space-x-2">
                  <span>{isLastQuestion ? "Finish Quiz" : "Next"}</span>
                  <span>{isLastQuestion ? "🎯" : "→"}</span>
                </span>
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default QuizPreview;
