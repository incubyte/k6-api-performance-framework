import { group, check } from "k6";
import { endpoints } from "../../endpoints.js";
import * as requestUtils from "../lib/request-utils.js";
import { logError } from "../lib/utils.js";
import BaseOperations from "./BaseOperations.js";

/**
 * PostsOperations - Orchestrates Posts API operations
 *
 * This class demonstrates the standard pattern for implementing API operations.
 * Use this as a reference when adding new resources (Users, Comments, etc.).
 *
 * Extends BaseOperations to inherit shared configuration (baseHeaders, etc.)
 *
 * @extends BaseOperations
 * @see BaseOperations.js for extension documentation
 */
export default class PostsOperations extends BaseOperations {
    constructor() {
        super();
        // Add any Posts-specific configuration here
        // Example: this.postsConfig = { ... };
    }

    getAllPosts() {
        return group("Get All Posts", () => {
            // Build and execute request
            const url = endpoints.posts;
            const headers = requestUtils.buildHeaders({ base: this.baseHeaders });
            const response = requestUtils.performGet(
                url,
                headers,
                {},
                "Successfully retrieved Get All Posts",
                "Get All Posts"
            );

            // Validate response
            if (response) {
                const data = response.json();
                check(response, {
                    "Get all posts - status is 200": (r) => r.status === 200,
                    "Get all posts - response is array": () => Array.isArray(data),
                    "Get all posts - has posts": () => data.length > 0,
                });
                return response;
            }
            logError("Failed to get all posts");
            return null;
        });
    }

    getPost(postId) {
        return group(`Get Post ${postId}`, () => {
            // Build and execute request
            const url = endpoints.post(postId);
            const headers = requestUtils.buildHeaders({ base: this.baseHeaders });
            const response = requestUtils.performGet(
                url,
                headers,
                {},
                `Successfully retrieved Get Post ${postId}`,
                `Get Post ${postId}`
            );

            // Validate response
            if (response) {
                const data = response.json();
                check(response, {
                    "Get post - status is 200": (r) => r.status === 200,
                    "Get post - has id": () => data.id !== undefined,
                    "Get post - has title": () => data.title !== undefined,
                    "Get post - has body": () => data.body !== undefined,
                    "Get post - has userId": () => data.userId !== undefined,
                });
                return response;
            }
            logError(`Failed to get post ${postId}`);
            return null;
        });
    }

    createPost(payload) {
        return group("Create Post", () => {
            // Build and execute request
            const url = endpoints.posts;
            const headers = requestUtils.buildHeaders({ base: this.baseHeaders });
            const response = requestUtils.performPost(
                url,
                payload,
                headers,
                {},
                "Successfully submitted Create Post",
                "Create Post"
            );

            // Validate response
            if (response) {
                const data = response.json();
                check(response, {
                    "Create post - status is 201": (r) => r.status === 201,
                    "Create post - has id": () => data.id !== undefined,
                    "Create post - has title": () => data.title !== undefined,
                    "Create post - has body": () => data.body !== undefined,
                    "Create post - has userId": () => data.userId !== undefined,
                });
                return response;
            }
            logError("Failed to create post");
            return null;
        });
    }

    updatePost(postId, payload) {
        return group(`Update Post ${postId}`, () => {
            // Build and execute request
            const url = endpoints.post(postId);
            const headers = requestUtils.buildHeaders({ base: this.baseHeaders });
            const response = requestUtils.performPut(
                url,
                payload,
                headers,
                {},
                `Successfully updated Update Post ${postId}`,
                `Update Post ${postId}`
            );

            // Validate response
            if (response) {
                const data = response.json();
                check(response, {
                    "Update post - status is 200": (r) => r.status === 200,
                    "Update post - id matches": () => data.id === postId,
                    "Update post - has title": () => data.title !== undefined,
                    "Update post - has body": () => data.body !== undefined,
                });
                return response;
            }
            logError(`Failed to update post ${postId}`);
            return null;
        });
    }

    patchPost(postId, patchPayload) {
        return group(`Patch Post ${postId}`, () => {
            // Build and execute request
            const url = endpoints.post(postId);
            const headers = requestUtils.buildHeaders({ base: this.baseHeaders });
            const response = requestUtils.performPut(
                url,
                patchPayload,
                headers,
                {},
                `Successfully updated Patch Post ${postId}`,
                `Patch Post ${postId}`
            );

            // Validate response
            if (response) {
                const data = response.json();
                check(response, {
                    "Patch post - status is 200": (r) => r.status === 200,
                    "Patch post - id matches": () => data.id === postId,
                    "Patch post - title updated": () => {
                        return patchPayload.title ? data.title === patchPayload.title : true;
                    },
                });
                return response;
            }
            logError(`Failed to patch post ${postId}`);
            return null;
        });
    }

    deletePost(postId) {
        return group(`Delete Post ${postId}`, () => {
            // Build and execute request
            const url = endpoints.post(postId);
            const headers = requestUtils.buildHeaders({ base: this.baseHeaders });
            const response = requestUtils.performDelete(
                url,
                headers,
                {},
                `Successfully deleted Delete Post ${postId}`,
                `Delete Post ${postId}`
            );

            // Validate response
            if (response) {
                check(response, {
                    "Delete post - status is 200": (r) => r.status === 200,
                });
                return response;
            }
            logError(`Failed to delete post ${postId}`);
            return null;
        });
    }

    getPostComments(postId) {
        return group(`Get Comments for Post ${postId}`, () => {
            // Build and execute request
            const url = endpoints.postComments(postId);
            const headers = requestUtils.buildHeaders({ base: this.baseHeaders });
            const response = requestUtils.performGet(
                url,
                headers,
                {},
                `Successfully retrieved Get Comments for Post ${postId}`,
                `Get Comments for Post ${postId}`
            );

            // Validate response
            if (response) {
                const data = response.json();
                check(response, {
                    "Get comments - status is 200": (r) => r.status === 200,
                    "Get comments - response is array": () => Array.isArray(data),
                    "Get comments - has comments": () => data.length > 0,
                });
                return response;
            }
            logError(`Failed to get comments for post ${postId}`);
            return null;
        });
    }

    getPostsByUser(userId) {
        return group(`Get Posts by User ${userId}`, () => {
            // Build and execute request
            const url = endpoints.postsFilter(userId);
            const headers = requestUtils.buildHeaders({ base: this.baseHeaders });
            const response = requestUtils.performGet(
                url,
                headers,
                {},
                `Successfully retrieved Get Posts by User ${userId}`,
                `Get Posts by User ${userId}`
            );

            // Validate response
            if (response) {
                const data = response.json();
                check(response, {
                    "Get posts by user - status is 200": (r) => r.status === 200,
                    "Get posts by user - response is array": () => Array.isArray(data),
                    "Get posts by user - all posts belong to user": () => {
                        return data.every((post) => post.userId === userId);
                    },
                });
                return response;
            }
            logError(`Failed to get posts for user ${userId}`);
            return null;
        });
    }
}
