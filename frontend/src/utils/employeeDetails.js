const REQUIRED_EMPLOYEE_DETAIL_FIELDS = [
  "address",
  "city",
  "state",
];

export const isEmployeeDetailsComplete = (details) =>
  REQUIRED_EMPLOYEE_DETAIL_FIELDS.every((field) => String(details?.[field] || "").trim());

export const getStoredEmployeeDetailsComplete = () =>
  localStorage.getItem("employeeDetailsComplete") === "true";

export const setStoredEmployeeDetailsComplete = (complete) => {
  localStorage.setItem("employeeDetailsComplete", complete ? "true" : "false");
};

export const requiredEmployeeDetailFields = REQUIRED_EMPLOYEE_DETAIL_FIELDS;
