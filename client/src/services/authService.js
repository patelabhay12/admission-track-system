import API from "./API";

// REGISTER
export const register = async (data) => {
  try {
    const res = await API.post("/auth/register", data);
    return res.data;
  } catch (err) {
    console.error("Registration error:", err);
    return {
      success: false,
      message: "Registration failed. Please try again.",
    };
  }
};


// LOGIN
export const login = async (data) => {
  try {
    const res = await API.post("/auth/login", data);
    return res.data;
  } catch (err) {
    console.error("Login error:", err);
    return {
      success: false,
      message: "Login failed. Please check your credentials and try again.",
    };
  }
};
