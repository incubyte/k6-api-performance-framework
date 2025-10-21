import { baseUrl } from "./config.js";

export const endpoints = {
  users: `${baseUrl}/users`,
  user: (id) => `${baseUrl}/users/${id}`,
  login: `${baseUrl}/login`,
};
