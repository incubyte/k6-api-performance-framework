import { baseUrl } from "./config.js";

export const endpoints = {
  posts: `${baseUrl}/posts`,
  post: (id) => `${baseUrl}/posts/${id}`,
  postComments: (id) => `${baseUrl}/posts/${id}/comments`,
  postsFilter: (userId) => `${baseUrl}/posts?userId=${userId}`,
};
