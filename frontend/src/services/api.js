import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:8000";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});


// =========================================================
// LEARNER PROFILE
// =========================================================

export const getProfile = async (userId) => {
  const response = await api.get(
    `/api/profile/${userId}`
  );

  return response.data;
};


// =========================================================
// SKILL GAP
// =========================================================

export const getSkillGaps = async (userId) => {
  const response = await api.get(
    `/api/skill-gap/${userId}`
  );

  return response.data;
};


// =========================================================
// RECOMMENDATIONS
// =========================================================

export const getRecommendations = async (userId) => {
  const response = await api.get(
    `/api/recommendations/${userId}`
  );

  return response.data;
};


// =========================================================
// LEARNING PATH
// =========================================================

export const getLearningPath = async (
  userId,
  weeklyHours = 10,
  maxCourses = 10
) => {
  const response = await api.get(
    `/api/learning-path/${userId}`,
    {
      params: {
        weekly_hours: weeklyHours,
        max_courses: maxCourses,
      },
    }
  );

  return response.data;
};


// =========================================================
// USERS / LEARNERS
// =========================================================

export const getUsers = async () => {
  const response = await api.get(
    "/api/users/"
  );

  return response.data;
};


// =========================================================
// GET SINGLE USER
// =========================================================

export const getUser = async (userId) => {
  const response = await api.get(
    `/api/users/${userId}`
  );

  return response.data;
};


// =========================================================
// CREATE NEW LEARNER
// =========================================================

export const createUser = async (userData) => {
  const response = await api.post(
    "/api/users/",
    userData
  );

  return response.data;
};


// =========================================================
// UPDATE PROGRESS
// =========================================================

export const updateProgress = async (
  userId,
  courseId,
  progressPercentage
) => {
  const response = await api.post(
    "/api/progress",
    {
      user_id: Number(userId),

      course_id: Number(courseId),

      progress_percentage:
        Number(progressPercentage),
    }
  );

  return response.data;
};


// =========================================================
// GET USER PROGRESS
// =========================================================

export const getUserProgress = async (
  userId
) => {
  const response = await api.get(
    `/api/progress/${userId}`
  );

  return response.data;
};


// =========================================================
// SUBMIT FEEDBACK
// =========================================================

export const submitFeedback = async (
  userId,
  courseId,
  feedbackType,
  comment = ""
) => {
  const response = await api.post(
    "/api/feedback",
    {
      user_id: Number(userId),

      course_id: Number(courseId),

      feedback_type:
        feedbackType,

      comment,
    }
  );

  return response.data;
};


// =========================================================
// GET USER FEEDBACK
// =========================================================

export const getUserFeedback = async (
  userId
) => {
  const response = await api.get(
    `/api/feedback/${userId}`
  );

  return response.data;
};


// =========================================================
// ADAPTIVE RECOMMENDATIONS
// =========================================================

export const getAdaptiveRecommendations =
  async (userId) => {

    const response = await api.get(
      `/api/adaptive/${userId}`
    );

    return response.data;
  };


// =========================================================
// AI ASSISTANT
// =========================================================

export const sendChatMessage = async (
  userId,
  message,
  history = []
) => {

  const response = await api.post(
    "/api/chat",
    {
      user_id: Number(userId),
      message: message,
      history: history,
    }
  );

  return response.data;
};


// =========================================================
// DEFAULT AXIOS INSTANCE
// =========================================================

export default api;