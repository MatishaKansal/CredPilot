import api from "./api";

export const getEmployeeDashboard = async (employeeId) => {
  const response = await api.get(`/employee/${employeeId}/dashboard`);
  return response.data;
};

export const getEmployeeReports = async (employeeId) => {
  const response = await api.get(`/employee/${employeeId}/reports`);
  return response.data;
};

export const getEmployeeCustomers = async (employeeId) => {
  const response = await api.get(`/employee/${employeeId}/customers`);
  return response.data.customers;
};

export const getEmployeeApplications = async (employeeId) => {
  const response = await api.get(`/employee/${employeeId}/applications`);
  return response.data.applications;
};

export const getEmployeeApplication = async (employeeId, applicationId) => {
  const response = await api.get(`/employee/${employeeId}/applications/${applicationId}`);
  return response.data.application;
};

export const reviewEmployeeApplication = async (employeeId, applicationId, payload) => {
  const response = await api.patch(
    `/employee/${employeeId}/applications/${applicationId}/review`,
    payload
  );
  return response.data.application;
};

export const updateEmployeeDetails = async (employeeId, details) => {
  const response = await api.patch(`/employee/${employeeId}/details`, details);
  return response.data.employee;
};
