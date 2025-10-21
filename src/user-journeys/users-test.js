import { UsersCrudManager } from "../handlers/UsersCrudManager.js";
import { UsersCrudSteps } from "../steps/UsersCrudSteps.js";
import { createUserPayload, updateUserPayload, loginPayload } from "../payloads/users-payload.js";

export default function userJourney() {
  const manager = new UsersCrudManager({
    createUser: createUserPayload,
    updateUser: updateUserPayload,
    login: loginPayload,
  });
  const steps = new UsersCrudSteps(manager);

  steps.getUsersList();
  const newUser = steps.createNewUser(createUserPayload);
  const userId = newUser.json().id;

  steps.updateExistingUser(userId, updateUserPayload);
  steps.deleteUser(userId);
  steps.performLogin(loginPayload);
}
