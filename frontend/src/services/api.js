import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" }
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

// Auth APIs
export const registerUser = (data) => API.post("/auth/register", data);
export const loginUser = (data) => API.post("/auth/login", data);
export const forgotPassword = (data) => API.post("/auth/forgot-password", data);
export const resetPassword = (data) => API.post("/auth/reset-password", data);

// Carbon APIs
export const saveCarbonEntries = (entries) => API.post("/carbon", entries);
export const getCarbonEntries = () => API.get("/carbon");

// Goal APIs
export const createGoal = (data) => API.post("/goals", data);
export const getMyGoals = () => API.get("/goals");  // Uses token to get current user's goals
export const getUserGoals = (userId) => API.get(`/goals/user/${userId}`);  // Legacy
export const toggleGoal = (goalId) => API.put(`/goals/${goalId}/toggle`);
export const updateGoalProgress = (goalId, currentValue) => API.put(`/goals/${goalId}/progress`, { currentValue });
export const deleteGoal = (goalId) => API.delete(`/goals/${goalId}`);
export const getAchievements = () => API.get("/goals/achievements");



export const getTips = async () => {
  const token = localStorage.getItem("token");
  const res = await API.get("/tips", { headers: { Authorization: `Bearer ${token}` } });
  return res.data;
};

export const addTip = async (tipData) => {
  const token = localStorage.getItem("token");
  const res = await API.post("/tips", tipData, { headers: { Authorization: `Bearer ${token}` } });
  return res.data;
};

export const likeTip = async (tipId) => {
  const token = localStorage.getItem("token");
  const res = await API.post(`/tips/${tipId}/like`, {}, { headers: { Authorization: `Bearer ${token}` } });
  return res.data;
};

export const searchTips = async (query) => {
  const token = localStorage.getItem("token");
  const res = await API.get(`/tips/search?q=${query}`, { headers: { Authorization: `Bearer ${token}` } });
  return res.data;
};

export const getOrganizationTips = async () => {
  const token = localStorage.getItem("token");
  const res = await API.get("/tips/organization", { headers: { Authorization: `Bearer ${token}` } });
  return res.data;
};

export const getNotifications = () => API.get("/notifications");
export const saveNotificationSettings = (settings) => API.post("/notifications/settings", { settings });
export const markNotificationsAsRead = () => API.put("/notifications/read");
export const cleanupBrokenNotifications = () => API.delete("/notifications/cleanup");
export const deleteAllNotifications = () => API.delete("/notifications/all");

// Business Dashboard API
export const getBusinessEmployees = () => API.get("/business/employees");
export const getEmployeeDetails = (userId) => API.get(`/business/employee/${userId}`);
export const sendEmployeeAlert = (userId, message) => API.post(`/business/alert/${userId}`, { message });
export const getJoinCode = () => API.get("/business/join-code");
export const updateOrganizationName = (name) => API.put("/business/organization-name", { organizationName: name });
export const joinOrganization = (joinCode) => API.post("/business/join", { joinCode });


// Default export for backward compatibility
export default {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  saveCarbonEntries,
  getCarbonEntries
};


