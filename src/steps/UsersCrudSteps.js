import { group, check } from "k6";
import { BaseSteps } from "./BaseSteps.js";

export class UsersCrudSteps extends BaseSteps {
  constructor(manager) {
    super(manager);
  }

  getUsersList() {
    return group("Get Users List", () => {
      const result = this.manager.getUsers();

      check(result, {
        "Users list retrieved successfully": (r) => r !== null && r.status === 200,
      });

      return result;
    });
  }

  createNewUser(userData) {
    return group("Create New User", () => {
      const result = this.manager.createUser(userData);

      check(result, {
        "User created successfully": (r) => r !== null && r.status === 201,
        "Response contains user ID": (r) => r.json().id !== undefined,
      });

      return result;
    });
  }

  updateExistingUser(userId, userData) {
    return group("Update User", () => {
      const result = this.manager.updateUser(userId, userData);

      check(result, {
        "User updated successfully": (r) => r !== null && r.status === 200,
        "Response contains updated data": (r) => {
          const json = r.json();
          return json.name === userData.name && json.job === userData.job;
        },
      });

      return result;
    });
  }

  deleteUser(userId) {
    return group("Delete User", () => {
      const result = this.manager.deleteUser(userId);

      check(result, {
        "User deleted successfully": (r) => r !== null && r.status === 204,
      });

      return result;
    });
  }

  performLogin(credentials) {
    return group("Login User", () => {
      const result = this.manager.login(credentials);

      check(result, {
        "Login successful": (r) => r !== null && r.status === 200,
        "Token received": (r) => r.json().token !== undefined,
      });

      return result;
    });
  }
}
