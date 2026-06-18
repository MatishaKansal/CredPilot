import { Navigate } from "react-router-dom";
import { getStoredAdminDetailsComplete } from "../../utils/adminDetails";

const AdminRequireDetails = ({ children }) => {
  if (!getStoredAdminDetailsComplete()) {
    return <Navigate to="/admin/details" replace />;
  }

  return children;
};

export default AdminRequireDetails;
