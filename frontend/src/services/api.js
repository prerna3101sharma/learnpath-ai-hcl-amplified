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


// ---------------------------------------------------------
// Learner Profile
// ---------------------------------------------------------

export const getProfile = async (userId) => {
  const response = await api.get(
    `/api/profile/${userId}`
  );

  return response.data;
};


// ---------------------------------------------------------
// Skill Gap
// ---------------------------------------------------------

export const getSkillGaps = async (userId) => {
  const response = await api.get(
    `/api/skill-gap/${userId}`
  );

  return response.data;
};


// ---------------------------------------------------------
// Recommendations
// ---------------------------------------------------------

export const getRecommendations = async (userId) => {
  const response = await api.get(
    `/api/recommendations/${userId}`
  );

  return response.data;
};


// ---------------------------------------------------------
// Learning Path
// ---------------------------------------------------------

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


// ---------------------------------------------------------
// AI Chat
// ---------------------------------------------------------

export const sendChatMessage = async (
  userId,
  message,
  history = []
) => {

  const response = await api.post(
    `/api/chat`,
    {
      user_id: userId,
      message,
      history,
    }
  );

  return response.data;
};
export const updateProgress = async (
  userId,
  courseId,
  progressPercentage
) => {

  const response =
    await api.post(
      "/api/progress",
      {
        user_id: userId,
        course_id: courseId,
        progress_percentage:
          progressPercentage
      }
    );

  return response.data;
};


export const submitFeedback = async (
  userId,
  courseId,
  feedbackType,
  comment = ""
) => {

  const response =
    await api.post(
      "/api/feedback",
      {
        user_id: userId,
        course_id: courseId,
        feedback_type:
          feedbackType,
        comment
      }
    );

  return response.data;
};