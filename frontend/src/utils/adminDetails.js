const REQUIRED_ADMIN_DETAIL_FIELDS = [
  "address",
  "city",
  "state",
];

export const isAdminDetailsComplete = (details) =>
  REQUIRED_ADMIN_DETAIL_FIELDS.every((field) => String(details?.[field] || "").trim());

export const getStoredAdminDetailsComplete = () =>
  localStorage.getItem("adminDetailsComplete") === "true";

export const setStoredAdminDetailsComplete = (complete) => {
  localStorage.setItem("adminDetailsComplete", complete ? "true" : "false");
};

export const requiredAdminDetailFields = REQUIRED_ADMIN_DETAIL_FIELDS;
