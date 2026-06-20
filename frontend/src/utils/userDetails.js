const REQUIRED_USER_DETAIL_FIELDS = [
  "address",
  "city",
  "state",
];

export const isUserDetailsComplete = (details) =>
  REQUIRED_USER_DETAIL_FIELDS.every((field) => String(details?.[field] || "").trim());

export const getStoredUserDetailsComplete = () =>
  localStorage.getItem("userDetailsComplete") === "true";

export const setStoredUserDetailsComplete = (complete) => {
  localStorage.setItem("userDetailsComplete", complete ? "true" : "false");
};

export const requiredUserDetailFields = REQUIRED_USER_DETAIL_FIELDS;
