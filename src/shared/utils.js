import { CONFIG } from './config.js';

export function isNight() {
  const h = new Date().getHours();
  return h >= CONFIG.TIMING.NIGHT_START && h < CONFIG.TIMING.NIGHT_END;
}

export function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Calculates the next delay with "human-like" randomization.
 * @param {number} baseInterval - The base interval in milliseconds.
 * @returns {number} The randomized delay in milliseconds.
 */
export function getNextDelay(baseInterval = CONFIG.TIMING.BASE_DELAY_MS) {
  // Add ±15% randomization to make it look human
  const variation = baseInterval * 0.15;
  const min = baseInterval - variation;
  const max = baseInterval + variation;

  let finalDelay = random(min, max);

  // If it's night, slow it down even more to be safe
  if (isNight()) {
    finalDelay *= 1.5;
  }

  return Math.floor(finalDelay);
}

