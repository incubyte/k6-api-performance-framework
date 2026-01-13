import { sleep } from "k6";
import { endpoints } from "../../endpoints.js";
import { buildHeaders } from "../lib/request-utils.js";
import { BaseManager } from "./BaseManager.js";

export default class PostsCrudManager extends BaseManager {
    constructor(payload) {
        super(payload);
        this.payload = payload;
    }

    getAllPosts() {
        const url = endpoints.posts;
        const label = "Get All Posts";
        return this.performApiGet(url, label, 200);
    }

    getPost(id) {
        const url = endpoints.post(id);
        const label = `Get Post ${id}`;
        return this.performApiGet(url, label, 200);
    }

    createPost() {
        const url = endpoints.posts;
        const label = "Create Post";
        return this.performApiPost(url, this.payload, label, 201);
    }

    updatePost(id) {
        const url = endpoints.post(id);
        const label = `Update Post ${id}`;
        return this.performApiPut(url, this.payload, label, 200);
    }

    patchPost(id, patchPayload) {
        const url = endpoints.post(id);
        const label = `Patch Post ${id}`;
        return this.performApiPut(url, patchPayload, label, 200);
    }

    deletePost(id) {
        const url = endpoints.post(id);
        const label = `Delete Post ${id}`;
        return this.performApiDelete(url, label, 200);
    }

    getPostComments(id) {
        const url = endpoints.postComments(id);
        const label = `Get Comments for Post ${id}`;
        return this.performApiGet(url, label, 200);
    }

    getPostsByUser(userId) {
        const url = endpoints.postsFilter(userId);
        const label = `Get Posts by User ${userId}`;
        return this.performApiGet(url, label, 200);
    }
}
