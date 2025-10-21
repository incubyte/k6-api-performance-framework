import { BaseManager } from "./BaseManager.js";
import { endpoints } from "../../endpoints.js";

export class UsersCrudManager extends BaseManager {
  constructor(payloads) {
    super(payloads);
  }

  getUsers() {
    return this.performApiGet(endpoints.users, "Get Users", 200);
  }

  createUser(payload) {
    return this.performApiPost(endpoints.users, payload, "Create User", 201);
  }

  updateUser(userId, payload) {
    return this.performApiPut(endpoints.user(userId), payload, "Update User", 200);
  }

  deleteUser(userId) {
    return this.performApiDelete(endpoints.user(userId), "Delete User", 204);
  }

  login(payload) {
    return this.performApiPost(endpoints.login, payload, "Login", 200);
  }
}
