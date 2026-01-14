import { group, check } from "k6";
import { logError } from "../lib/utils.js";
import { BaseSteps } from "./BaseSteps.js";

export default class PostsCrudSteps extends BaseSteps {
    constructor(manager) {
        super(manager);
    }

    getAllPosts() {
        return group("Get All Posts", () => {
            const response = this.manager.getAllPosts();
            if (response) {
                check(response, {
                    "Get all posts - status is 200": (r) => r.status === 200,
                    "Get all posts - response is array": (r) => Array.isArray(r.json()),
                    "Get all posts - has posts": (r) => r.json().length > 0,
                });
                return response;
            }
            logError("Failed to get all posts");
            return null;
        });
    }

    getPost(postId) {
        return group(`Get Post ${postId}`, () => {
            const response = this.manager.getPost(postId);
            if (response) {
                const post = response.json();
                check(response, {
                    "Get post - status is 200": (r) => r.status === 200,
                    "Get post - has id": (r) => r.json().id !== undefined,
                    "Get post - has title": (r) => r.json().title !== undefined,
                    "Get post - has body": (r) => r.json().body !== undefined,
                    "Get post - has userId": (r) => r.json().userId !== undefined,
                });
                return response;
            }
            logError(`Failed to get post ${postId}`);
            return null;
        });
    }

    createPost(payload) {
        return group("Create Post", () => {
            const response = this.manager.createPost(payload);
            if (response) {
                const post = response.json();
                check(response, {
                    "Create post - status is 201": (r) => r.status === 201,
                    "Create post - has id": (r) => r.json().id !== undefined,
                    "Create post - has title": (r) => r.json().title !== undefined,
                    "Create post - has body": (r) => r.json().body !== undefined,
                    "Create post - has userId": (r) => r.json().userId !== undefined,
                });
                return response;
            }
            logError("Failed to create post");
            return null;
        });
    }

    updatePost(postId, payload) {
        return group(`Update Post ${postId}`, () => {
            const response = this.manager.updatePost(postId, payload);
            if (response) {
                const post = response.json();
                check(response, {
                    "Update post - status is 200": (r) => r.status === 200,
                    "Update post - id matches": (r) => r.json().id === postId,
                    "Update post - has title": (r) => r.json().title !== undefined,
                    "Update post - has body": (r) => r.json().body !== undefined,
                });
                return response;
            }
            logError(`Failed to update post ${postId}`);
            return null;
        });
    }

    patchPost(postId, patchPayload) {
        return group(`Patch Post ${postId}`, () => {
            const response = this.manager.patchPost(postId, patchPayload);
            if (response) {
                const post = response.json();
                check(response, {
                    "Patch post - status is 200": (r) => r.status === 200,
                    "Patch post - id matches": (r) => r.json().id === postId,
                    "Patch post - title updated": (r) => {
                        return patchPayload.title ? r.json().title === patchPayload.title : true;
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
            const response = this.manager.deletePost(postId);
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
            const response = this.manager.getPostComments(postId);
            if (response) {
                check(response, {
                    "Get comments - status is 200": (r) => r.status === 200,
                    "Get comments - response is array": (r) => Array.isArray(r.json()),
                    "Get comments - has comments": (r) => r.json().length > 0,
                });
                return response;
            }
            logError(`Failed to get comments for post ${postId}`);
            return null;
        });
    }

    getPostsByUser(userId) {
        return group(`Get Posts by User ${userId}`, () => {
            const response = this.manager.getPostsByUser(userId);
            if (response) {
                check(response, {
                    "Get posts by user - status is 200": (r) => r.status === 200,
                    "Get posts by user - response is array": (r) => Array.isArray(r.json()),
                    "Get posts by user - all posts belong to user": (r) => {
                        const posts = r.json();
                        return posts.every((post) => post.userId === userId);
                    },
                });
                return response;
            }
            logError(`Failed to get posts for user ${userId}`);
            return null;
        });
    }
}
