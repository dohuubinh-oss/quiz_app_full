"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import type { IQuiz } from "@/models/Quiz";

// API function to fetch a single quiz by its ID
const fetchQuizById = async (id: string): Promise<IQuiz> => {
  const { data } = await axios.get(`/api/quizzes/${id}`);
  // The API route directly returns the quiz object, so we return data itself.
  return data;
};

// React Query hook to fetch a single quiz by its ID
export const useQuiz = (id: string) => {
  return useQuery({
    queryKey: ["quiz", id],
    // Use the corrected API calling function
    queryFn: () => fetchQuizById(id),
    // The query will only execute if the 'id' exists.
    // Authentication and authorization are handled by the API route.
    enabled: !!id,
  });
};
