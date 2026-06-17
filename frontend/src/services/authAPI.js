import api from "./api";

export const registerUser = async (
  fullName,
  email,
  phone,
  password
) => {

  const response = await api.post(
    "/register",
    {
      fullName,
      email,
      phone,
      password,
    }
  );

  return response.data;
};

export const loginUser = async (
  email,
  password,
  role
) => {

  const response = await api.post(
    "/login",
    {
      email,
      password,
      role,
    }
  );

  return response.data;
};