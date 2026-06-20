import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/Login/Login";
import LandingPage from "./pages/LandingPage/LandingPage";
import Register from "./pages/Register/Register";
import UserLayout from "./pages/User/UserLayout";
import UserDashboard from "./pages/User/UserDashboard";
import UserProfile from "./pages/User/UserProfile";
import UserApplicationForm from "./pages/User/UserApplicationForm";
import UserApplications from "./pages/User/UserApplications";
import UserPlaceholder from "./pages/User/UserPlaceholder";
import AdminLayout from "./pages/Admin/AdminLayout";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminDetails from "./pages/Admin/AdminDetails";
import AdminEmployees from "./pages/Admin/AdminEmployees";
import AdminCustomers from "./pages/Admin/AdminCustomers";
import AdminApplications from "./pages/Admin/AdminApplications";
import AdminPlaceholder from "./pages/Admin/AdminPlaceholder";
import AdminRequireDetails from "./pages/Admin/AdminRequireDetails";
import EmployeeLayout from "./pages/Employee/EmployeeLayout";
import EmployeeDashboard from "./pages/Employee/EmployeeDashboard";
import EmployeeDetails from "./pages/Employee/EmployeeDetails";
import EmployeeCustomers from "./pages/Employee/EmployeeCustomers";
import EmployeeApplications from "./pages/Employee/EmployeeApplications";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/landing" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/user" element={<UserLayout />}>
            <Route index element={<Navigate to="/user/dashboard" />} />
            <Route path="dashboard" element={<UserDashboard />} />
            <Route path="profile" element={<UserProfile />} />
            <Route path="applications" element={<UserApplications />} />
            <Route path="documents" element={<UserPlaceholder title="Documents" />} />
            <Route path="eligibility" element={<UserPlaceholder title="Eligibility" />} />
            <Route path="support" element={<UserPlaceholder title="Support" />} />
            <Route path="apply-loan" element={<UserApplicationForm />} />
            <Route path="*" element={<Navigate to="/user/dashboard" />} />
          </Route>

          {/* Admin */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="details" element={<AdminDetails />} />
            <Route path="applications" element={<AdminRequireDetails><AdminApplications /></AdminRequireDetails>} />
            <Route path="employees" element={<AdminRequireDetails><AdminEmployees /></AdminRequireDetails>} />
            <Route path="customers" element={<AdminRequireDetails><AdminCustomers /></AdminRequireDetails>} />
            <Route path="reports" element={<AdminRequireDetails><AdminPlaceholder title="Reports" /></AdminRequireDetails>} />
            <Route path="risk" element={<AdminRequireDetails><AdminPlaceholder title="Risk Engine" /></AdminRequireDetails>} />
            <Route path="*" element={<Navigate to="/admin/dashboard" />} />
          </Route>

          {/* Employee */}
          <Route path="/employee" element={<EmployeeLayout />}>
            <Route index element={<Navigate to="/employee/dashboard" />} />
            <Route path="dashboard" element={<EmployeeDashboard />} />
            <Route path="details" element={<EmployeeDetails />} />
            <Route path="customers" element={<EmployeeCustomers />} />
            <Route path="applications" element={<EmployeeApplications />} />
            <Route path="reviews" element={<AdminPlaceholder title="Reviews" />} />
            <Route path="reports" element={<AdminPlaceholder title="Reports" />} />
            <Route path="*" element={<Navigate to="/employee/dashboard" />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
