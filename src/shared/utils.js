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
  // Use 20-30% randomization that is always significant.
  // We pick a random percentage between 20% and 30% and randomly add or subtract it.
  // This ensures the delay is never exactly the base interval, making it look more human.
  const variationPercent = 0.20 + (Math.random() * 0.10); // 0.20 to 0.30
  const isAddition = Math.random() < 0.5;
  const variation = baseInterval * variationPercent;

  let finalDelay = isAddition ? (baseInterval + variation) : (baseInterval - variation);

  // Add a tiny extra jitter (±1s) for even more variety
  finalDelay += (Math.random() * 2000) - 1000;

  // If it's night, slow it down even more to be safe
  if (isNight()) {
    finalDelay *= 1.5;
  }

  return Math.max(5000, Math.floor(finalDelay));
}

