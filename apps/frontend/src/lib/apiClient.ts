import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from "axios";

// Axios instance with default configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 seconds timeout to prevent hanging requests
});

// Request Interceptor: Automatically inject the JWT token into headers
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Check if we are running on the client side (browser) to avoid Next.js SSR crashes
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");

      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

// Response Interceptor: Handle global API errors (like expired tokens)
apiClient.interceptors.response.use(
  (response) => {
    // Any status code within the 2xx range triggers this function
    return response;
  },
  (error: AxiosError<{ message?: string; errors?: Array<{ field: string; message: string }> }>) => {
    // Check if the error is a 401 Unauthorized (invalid or expired token)
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        console.warn("Session expired or unauthorized. Clearing local storage...");
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        // Optional: Redirect to login page if not already there
        if (window.location.pathname !== "/login" && window.location.pathname !== "/register") {
          window.location.href = "/login";
        }
      }
    }

    // Extract a clean error message to display in frontend toasts or UI alerts
    const customMessage = error.response?.data?.message || error.message || "An unexpected network error occurred.";

    console.warn("API Error:", {
      url: error.config?.url,
      status: error.response?.status,
      message: customMessage,
      validationErrors: error.response?.data?.errors,
    });

    return Promise.reject(error);
  },
);

export default apiClient;
