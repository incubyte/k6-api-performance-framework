import { config } from "./config.js";

/**
 * API Endpoints Configuration
 *
 * All endpoint URLs are dynamically constructed using the base URL from config.
 * This allows easy switching between environments (dev/staging/prod) using environment variables.
 *
 * Usage:
 * import { endpoints } from "../../endpoints.js";
 * const url = endpoints.posts; // https://jsonplaceholder.typicode.com/posts
 * const userPostUrl = endpoints.post(1); // https://jsonplaceholder.typicode.com/posts/1
 */

const BASE_URL = config.baseUrl;

export const endpoints = {
    // Posts endpoints
    posts: `${BASE_URL}/posts`,
    post: (id) => `${BASE_URL}/posts/${id}`,
    postComments: (id) => `${BASE_URL}/posts/${id}/comments`,
    postsFilter: (userId) => `${BASE_URL}/posts?userId=${userId}`,

    // Example: Add more resource endpoints as needed
    // users: `${BASE_URL}/users`,
    // user: (id) => `${BASE_URL}/users/${id}`,
    // comments: `${BASE_URL}/comments`,
    // comment: (id) => `${BASE_URL}/comments/${id}`,
};
