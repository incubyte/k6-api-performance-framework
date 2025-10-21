import { parseHTML } from "k6/html";
import { group, check } from "k6";

export function logInfo(message, data = null) {
  if (data) {
    console.log(`INFO: ${message}`, data);
  } else {
    console.log(`INFO: ${message}`);
  }
}

export function logSuccess(message) {
  console.log(`✅ ${message}`);
}

export function logError(message, error = null) {
  if (error) {
    console.error(`❌ ${message}`, error);
  } else {
    console.error(`❌ ${message}`);
  }
}

export function extractTokenFromHtml(html, selector, attribute, fallbackPattern, tokenType) {
  try {
    const doc = parseHTML(html);
    const elements = doc.find(selector);

    if (elements.size() > 0) {
      return elements.attr(attribute);
    }

    if (fallbackPattern) {
      const match = html.match(fallbackPattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return null;
  } catch (error) {
    logError(`Error extracting ${tokenType} token: ${error.message}`);
    return null;
  }
}

export function extractCsrfToken(html) {
  return extractTokenFromHtml(html, 'meta[name="csrf-token"]', "content", /"csrf-token"[^>]+content="([^"]+)"/, "CSRF");
}

export function extractSessionCookieFromHeaders(headers, cookieName = "_patient-check-in_session") {
  const cookies = headers["Set-Cookie"] || headers["set-cookie"];
  if (!cookies) return null;

  const cookiesArray = Array.isArray(cookies) ? cookies : [cookies];

  for (const cookie of cookiesArray) {
    if (cookie.includes(cookieName)) {
      const cookieValue = cookie.split(";")[0].split("=")[1];
      return cookieValue;
    }
  }

  return null;
}

export function buildUrl(baseUrl, params) {
  const queryString = Object.entries(params)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");

  return `${baseUrl}?${queryString}`;
}

export function extractTokenFromUrl(url) {
  const tokenMatch = url.match(/token=([^&]+)/);
  return tokenMatch ? tokenMatch[1] : null;
}

export function debugApiResponse(response, context = "API Response") {
  logInfo(`${context} Status: ${response.status}`);
  logInfo(`${context} Time: ${response.timings.duration}ms`);

  const importantHeaders = ["Location", "Set-Cookie", "Content-Type"];
  const headerInfo = {};

  for (const key of importantHeaders) {
    if (response.headers[key] || response.headers[key.toLowerCase()]) {
      headerInfo[key] = response.headers[key] || response.headers[key.toLowerCase()];
    }
  }

  if (Object.keys(headerInfo).length > 0) {
    logInfo(`${context} Headers:`, headerInfo);
  }

  if (response.body) {
    const bodySample = response.body.substring(0, 150);
    logInfo(`${context} Body Sample: ${bodySample}${bodySample.length < response.body.length ? "..." : ""}`);
  }
}

export function extractAuthenticityToken(html) {
  return extractTokenFromHtml(html, 'input[name="authenticity_token"]', "value", null, "authenticity");
}

export function runStep(stepTitle, stepAction, stepParams, errorMessage, successMessage) {
  let result = null;
  group(stepTitle, () => {
    try {
      result = stepAction(...stepParams);

      const stepSuccess = check(result, {
        [`${stepTitle} - executed successfully`]: (r) => r !== null && r !== undefined,
        [`${stepTitle} - returned valid data`]: (r) => r !== false,
      });

      if (!result) {
        logError(errorMessage);
        return;
      }

      if (stepSuccess) {
        logSuccess(successMessage);
      }
    } catch (error) {
      check(null, {
        [`${stepTitle} - no errors thrown`]: () => false,
      });
      logError(`Error during step "${stepTitle}": ${error.message}`, error);
    }
  });
  return result;
}

export function handleMissing(value, errorMsg) {
  if (value === null || value === undefined) {
    logError(errorMsg);
    return true;
  }
  return false;
}

export function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

export function getRandomItems(array, count) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}

export function generateStepMethods(stepClass, manager, stepDefinitions) {
  stepDefinitions.forEach(({ name, label, getMethod, updateMethod }) => {
    const capitalizedName = capitalizeFirst(name);
    const finalLabel = label || capitalizedName;
    const finalGetMethod = getMethod || `get${capitalizedName}`;
    const finalUpdateMethod = updateMethod || `update${capitalizedName}`;

    stepClass[`runGet${capitalizedName}`] = (sessionData) =>
      stepClass.executeGetStep(finalLabel, manager[finalGetMethod], sessionData);

    stepClass[`runUpdate${capitalizedName}`] = (response) =>
      stepClass.executeUpdateStep(finalLabel, manager[finalUpdateMethod], response);
  });
}

export function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
