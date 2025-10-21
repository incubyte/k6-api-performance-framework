import { group, check } from "k6";
import * as utils from "../lib/utils.js";

export class BaseSteps {
  constructor(manager) {
    this.manager = manager;
  }

  executeGetStep(stepName, managerMethod, sessionData, errorMessage, successMessage) {
    return group(`Get ${stepName}`, () => {
      const result = utils.runStep(
        `Get ${stepName}`,
        managerMethod.bind(this.manager),
        [sessionData],
        errorMessage || `Failed to get ${stepName.toLowerCase()}`,
        successMessage || `Successfully retrieved ${stepName.toLowerCase()}`,
      );

      check(result, {
        [`${stepName} form retrieved`]: (r) => r !== null,
        [`Session valid for ${stepName.toLowerCase()}`]: () => sessionData !== null,
      });

      return result;
    });
  }

  executeUpdateStep(stepName, managerMethod, response, errorMessage, successMessage) {
    return group(`Update ${stepName}`, () => {
      const result = utils.runStep(
        `Update ${stepName}`,
        managerMethod.bind(this.manager),
        [response],
        errorMessage || `Failed to update ${stepName.toLowerCase()}`,
        successMessage || `Successfully updated ${stepName.toLowerCase()}`,
      );

      check(result, {
        [`${stepName} updated`]: (r) => r !== null && r !== false,
        [`${stepName} response valid`]: () => response !== null,
      });

      return result;
    });
  }
}
