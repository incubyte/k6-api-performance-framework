import PostsOperations from "../operations/PostsOperations.js";
import {
    createPostPayload,
    updatePostPayload,
    patchPostPayload,
} from "../payloads/posts-payload.js";

export default function postsTest() {
    // Initialize operations
    const operations = new PostsOperations();

    // Get all posts
    const allPostsResponse = operations.getAllPosts();

    // Test with an existing post ID (JSONPlaceholder has posts 1-100)
    const existingPostId = 1;

    // Get an existing post
    operations.getPost(existingPostId);

    // Update an existing post
    operations.updatePost(existingPostId, updatePostPayload);

    // Patch an existing post with partial update
    operations.patchPost(existingPostId, patchPostPayload);

    // Get comments for the post
    operations.getPostComments(existingPostId);

    // Get posts by specific user
    operations.getPostsByUser(1);

    // Create a new post (simulated - won't persist)
    const createResponse = operations.createPost(createPostPayload);

    // Delete an existing post (simulated - won't persist)
    operations.deletePost(existingPostId);
}
