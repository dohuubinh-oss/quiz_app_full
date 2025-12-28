
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { IQuiz } from "@/models/Quiz";
import axios from "axios";

// ---------- API-calling functions ----------

const fetchQuizzes = async (page: number, pageSize: number, searchTerm: string) => {
  const { data } = await axios.get('/api/quizzes', {
    params: {
      page,
      pageSize,
      search: searchTerm,
    },
  });
  return data;
};

const createNewQuiz = async (quiz: Partial<IQuiz>) => {
  const { data } = await axios.post('/api/quizzes', quiz);
  // Ánh xạ _id sang id để client sử dụng thuận tiện hơn
  if (data && data._id) {
    data.id = data._id;
  }
  return data;
};

const updateExistingQuiz = async ({ id, updates }: { id: string; updates: Partial<IQuiz> }) => {
  const { data } = await axios.put(`/api/quizzes/${id}`, updates);
  return data;
};

const deleteExistingQuiz = async (id: string) => {
  const { data } = await axios.delete(`/api/quizzes/${id}`);
  return data;
};

const togglePublishStatus = async ({ id, isPublished }: { id: string; isPublished: boolean }) => {
  const { data } = await axios.put(`/api/quizzes/${id}`, { isPublished });
  return data;
};

// ---------- React Query Hooks ----------

export const useQuizzes = (
  page = 1,
  pageSize = 9,
  isPublic: boolean, // This was missing
  searchTerm: string
) => {
  return useQuery({
    queryKey: ["quizzes", page, pageSize, searchTerm, isPublic],
    queryFn: () => fetchQuizzes(page, pageSize, searchTerm),
  });
};

export const useCreateQuiz = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createNewQuiz,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
    },
  });
};

export const useUpdateQuiz = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateExistingQuiz,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
      if (data && data._id) {
        queryClient.invalidateQueries({ queryKey: ["quiz", data._id] });
      }
    },
  });
};

export const useDeleteQuiz = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteExistingQuiz,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
    },
  });
};

export const useTogglePublishQuiz = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: togglePublishStatus,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
       if (data && data._id) {
        queryClient.invalidateQueries({ queryKey: ["quiz", data._id] });
      }
    },
  });
};
