// import axios from "axios";

// const API_URL = "http://localhost:3000/api"; // آدرس API واقعی

// const authService = {
//   login: async (email, password) => {
//     try {
//       const response = await axios.post(`${API_URL}/auth/login`, {
//         email,
//         password,
//       });

//       if (response.data.token) {
//         localStorage.setItem("user", JSON.stringify(response.data));
//       }

//       return response.data;
//     } catch (error) {
//       throw error.response?.data || { message: "خطا در ارتباط با سرور" };
//     }
//   },

//   register: async (userData) => {
//     try {
//       const response = await axios.post(`${API_URL}/auth/register`, userData);
//       return response.data;
//     } catch (error) {
//       throw error.response?.data || { message: "خطا در ارتباط با سرور" };
//     }
//   },

//   logout: () => {
//     localStorage.removeItem("user");
//   },

//   getCurrentUser: () => {
//     return JSON.parse(localStorage.getItem("user"));
//   },
// };

// export default authService;
