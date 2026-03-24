import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// استایل‌ها
import "bootstrap/dist/css/bootstrap.rtl.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./styles/fonts.css";

// کامپوننت‌ها
import Landing from "./components/Landing/Landing";
import Login from "./components/Login/Login";
import SignUp from "./components/SignUp/SignUp";
import ForgotPassword from "./components/ForgotPassword/ForgotPassword";
import Dashboard from "./components/Dashboard/Dashboard";
import AdminPanel from "./components/AdminPanel/AdminPanel";

// سرویس احراز هویت
import { userService } from "./services/userService";

// کامپوننت محافظت از مسیرها
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const isAuthenticated = userService.isAuthenticated();

  // اگر لاگین نکرده باشه
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // اگر نیاز به دسترسی ادمین داریم
  if (requireAdmin) {
    const userData = localStorage.getItem("spa_user");
    if (userData) {
      try {
        const user = JSON.parse(userData);
        if (user.role !== "admin") {
          // اگر کاربر ادمین نیست، به داشبورد عادی هدایتش کن
          return <Navigate to="/dashboard" replace />;
        }
      } catch (e) {
        return <Navigate to="/login" replace />;
      }
    } else {
      return <Navigate to="/login" replace />;
    }
  }

  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* مسیرهای عمومی */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* مسیرهای محافظت شده */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* مسیر پنل ادمین (فقط کاربران ادمین) */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminPanel />
            </ProtectedRoute>
          }
        />

        {/* اگر کاربر مسیر نامعتبر رو وارد کرد */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
