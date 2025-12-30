"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { IQuestion } from "@/models/Quiz";

// Định nghĩa kiểu dữ liệu cho việc tạo mới một câu hỏi.
// Cấu trúc này khớp với những gì API route mong đợi.
interface CreateQuestionInput {
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  explanation?: string;
}

// Hook để tạo một câu hỏi mới
export const useCreateQuestion = (quizId: string) => {
  const queryClient = useQueryClient();
  // Cập nhật mutation để sử dụng kiểu dữ liệu đầu vào mới
  return useMutation<IQuestion, Error, CreateQuestionInput>({
    mutationFn: (newQuestionData) => 
      axios.post(`/api/quizzes/${quizId}/questions`, newQuestionData).then(res => res.data.question),
    onSuccess: () => {
      // Làm mới lại query của quiz để nạp lại dữ liệu, bao gồm cả câu hỏi mới
      queryClient.invalidateQueries({ queryKey: ["quiz", quizId] });
    },
  });
};

// Hook để cập nhật một câu hỏi
export const useUpdateQuestion = (quizId: string) => {
  const queryClient = useQueryClient();
  return useMutation<IQuestion, Error, { questionId: string; updates: Partial<IQuestion> }>({ 
    mutationFn: ({ questionId, updates }) =>
      axios.put(`/api/quizzes/${quizId}/questions/${questionId}`, updates).then(res => res.data.question),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quiz", quizId] });
    },
  });
};

// Hook để xóa một câu hỏi
export const useDeleteQuestion = (quizId: string) => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({ // string ở đây là questionId
    mutationFn: (questionId) => 
      axios.delete(`/api/quizzes/${quizId}/questions/${questionId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quiz", quizId] });
    },
  });
};

// Hook để sắp xếp lại các câu hỏi
export const useReorderQuestions = (quizId: string) => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, { questionIds: string[] }>({ 
    mutationFn: ({ questionIds }) => 
      axios.put(`/api/quizzes/${quizId}/questions`, { questionIds }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quiz", quizId] });
    },
  });
};
