// Global API Configuration
const API_BASE_URL = "http://localhost:3001";

// Helper function to get auth token from localStorage
function getAuthToken() {
  return localStorage.getItem("token");
}

// Helper function to get user email from localStorage
function getUserEmail() {
  return localStorage.getItem("userEmail");
}

// Helper function to check if user is authenticated
function isAuthenticated() {
  return !!getAuthToken();
}

// Helper function to clear auth
function clearAuth() {
  localStorage.removeItem("token");
  localStorage.removeItem("userEmail");
}

// Helper function to make authenticated API calls
async function fetchWithAuth(url, options = {}) {
  const token = getAuthToken();
  
  const headers = {
    "Content-Type": "application/json",
    ...options.headers
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers
  };

  const response = await fetch(url, config);
  return response;
}
