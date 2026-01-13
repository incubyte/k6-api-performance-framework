export const createPostPayload = JSON.stringify({
    title: "Test Post Title",
    body: "This is a test post body content for performance testing",
    userId: 1,
});

export const updatePostPayload = JSON.stringify({
    id: 1,
    title: "Updated Post Title",
    body: "This is an updated post body content",
    userId: 1,
});

export const patchPostPayload = JSON.stringify({
    title: "Patched Post Title",
});
