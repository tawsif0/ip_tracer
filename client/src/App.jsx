// App.js
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
// import Layout from "./components/Layout";
// import Dashboard from "./pages/Dashboard";
import Redirect from "./pages/Redirect";
// import { useAuth } from "./hooks/useAuth";
// import AuthForm from "./pages/Login";
// import ForgotPassword from "./pages/ForgotPassword";
// import ResetPassword from "./pages/ResetPassword";

function App() {
  // const { user, isLoading } = useAuth();

  // // Show loading spinner while checking authentication
  // if (isLoading) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center bg-white">
  //       <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
  //     </div>
  //   );
  // }

  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Routes>
        {/* Public routes - redirect to dashboard if already authenticated */}
        {/* <Route
          path="/login"
          element={user ? <Navigate to="/dashboard" replace /> : <AuthForm />}
        /> */}
        {/* <Route
          path="/forgot-password"
          element={
            user ? <Navigate to="/dashboard" replace /> : <ForgotPassword />
          }
        /> */}
        {/* <Route
          path="/reset-password/:token"
          element={
            user ? <Navigate to="/dashboard" replace /> : <ResetPassword />
          }
        /> */}

        {/* Redirect route - always accessible */}
        <Route path="/:shortCode" element={<Redirect />} />

        {/* Protected routes */}
        {/* <Route
          path="/*"
          element={user ? <Layout /> : <Navigate to="/login" replace />}
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
        </Route> */}
      </Routes>
    </Router>
  );
}

export default App;
