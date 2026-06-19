import api from "./api";

export const getEmployeeDashboard = async (employeeId) => {
  const response = await api.get(`/employee/${employeeId}/dashboard`);
  return response.data;
};

export const getEmployeeCustomers = async (employeeId) => {
  const response = await api.get(`/employee/${employeeId}/customers`);
  return response.data.customers;
};

export const updateEmployeeDetails = async (employeeId, details) => {
  const response = await api.patch(`/employee/${employeeId}/details`, details);
  return response.data.employee;
};
