import { apiRequest } from "@/lib/queryClient";

export const api = {
  // Essay endpoints
  submitEssay: (essayData) => apiRequest("POST", "/api/essays", essayData),
  getEssays: () => fetch("/api/essays").then(res => res.json()),
  getEssay: (id) => fetch(`/api/essays/${id}`).then(res => res.json()),
  
  // Quiz endpoints
  getQuizzes: () => fetch("/api/quizzes").then(res => res.json()),
  getQuiz: (id) => fetch(`/api/quizzes/${id}`).then(res => res.json()),
  submitQuizAttempt: (attemptData) => apiRequest("POST", "/api/quiz-attempts", attemptData),
  getQuizAttempts: () => fetch("/api/quiz-attempts").then(res => res.json()),
  
  // Progress endpoints
  getProgress: () => fetch("/api/progress").then(res => res.json()),
  
  // Teacher endpoints
  getTeacherEssays: () => fetch("/api/teacher/essays").then(res => res.json()),
  getClassStats: () => fetch("/api/teacher/stats").then(res => res.json()),
  
  // Initialize sample data
  initData: () => apiRequest("POST", "/api/init-data"),
};
