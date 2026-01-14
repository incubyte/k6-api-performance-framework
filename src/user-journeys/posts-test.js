import PostsCrudManager from "../handlers/PostsCrudManager.js";
import PostsCrudSteps from "../steps/PostsCrudSteps.js";
import {
    createPostPayload,
    updatePostPayload,
    patchPostPayload,
} from "../payloads/posts-payload.js";

export default function postsTest() {
    // Initialize manager
    const manager = new PostsCrudManager();
    const steps = new PostsCrudSteps(manager);

    // Get all posts
    const allPostsResponse = steps.getAllPosts();

    // Test with an existing post ID (JSONPlaceholder has posts 1-100)
    const existingPostId = 1;

    // Get an existing post
    steps.getPost(existingPostId);

    // Update an existing post
    steps.updatePost(existingPostId, updatePostPayload);

    // Patch an existing post with partial update
    steps.patchPost(existingPostId, patchPostPayload);

    // Get comments for the post
    steps.getPostComments(existingPostId);

    // Get posts by specific user
    steps.getPostsByUser(1);

    // Create a new post (simulated - won't persist)
    const createResponse = steps.createPost(createPostPayload);

    // Delete an existing post (simulated - won't persist)
    steps.deletePost(existingPostId);
}
