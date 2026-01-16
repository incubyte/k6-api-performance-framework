// Logging utilities for k6 performance tests
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

export function logError(message, errorData = null) {
  if (errorData) {
    console.error(`❌ ${message}`, errorData);
  } else {
    console.error(`❌ ${message}`);
  }
}

// Data helper utilities
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
