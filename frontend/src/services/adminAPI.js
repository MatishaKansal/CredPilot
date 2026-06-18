import api from "./api";

export const getAdminDashboard = async () => {
  const response = await api.get("/admin/dashboard");
  return response.data;
};

export const getEmployees = async () => {
  const response = await api.get("/admin/employees");
  return response.data.employees;
};

export const createEmployee = async (employee) => {
  const response = await api.post("/admin/employees", employee);
  return response.data.employee;
};

export const getEmployee = async (employeeId) => {
  const response = await api.get(`/admin/employees/${employeeId}`);
  return response.data.employee;
};

export const updateEmployee = async (employeeId, employee) => {
  const response = await api.patch(`/admin/employees/${employeeId}`, employee);
  return response.data.employee;
};

export const deleteEmployee = async (employeeId) => {
  const response = await api.delete(`/admin/employees/${employeeId}`);
  return response.data;
};

export const getCustomers = async () => {
  const response = await api.get("/admin/customers");
  return response.data.customers;
};

export const assignCustomer = async (customerId, employeeId) => {
  const response = await api.patch(`/admin/customers/${customerId}/assign`, {
    employeeId,
  });
  return response.data.customer;
};
