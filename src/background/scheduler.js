import { CONFIG } from '../shared/config.js';
import { getNextDelay } from '../shared/utils.js';

export async function start(tabId, baseInterval) {
  // Clear any existing alarms/timers for this tab
  await stop(tabId);

  try {
    const tab = await chrome.tabs.get(tabId);
    if (!tab?.url?.includes("fiverr.com")) return;

    // Initialize or resume state
    const key = String(tabId);
    const data = await chrome.storage.local.get([key]);
    const info = data[key] || {};

    // If we are starting fresh, mark lastInboxTime as now
    const lastInboxTime = info.lastInboxTime || Date.now();
    await scheduleNext(tabId, baseInterval, lastInboxTime);
  } catch (err) {
    console.error("Error in start:", err);
  }
}

export async function scheduleNext(tabId, baseInterval, lastInboxTime, urlIndex = 0) {
  const delayMs = getNextDelay(baseInterval);
  const nextTime = Date.now() + delayMs;

  const key = String(tabId);
  await chrome.storage.local.set({
    [key]: {
      next: nextTime,
      baseInterval: baseInterval,
      lastInboxTime: lastInboxTime,
      urlIndex: urlIndex,
      cycleCount: 0
    }
  });

  // Use alarms for MV3 background reliability
  chrome.alarms.create(`refresh_${tabId}`, {
    when: nextTime
  });

  console.log(`Scheduled next refresh for tab ${tabId} in ${Math.round(delayMs/1000)}s`);
}

// Updated to include cycleCount
export async function scheduleNextWithIndex(tabId, baseInterval, urlIndex, cycleCount) {
  const delayMs = getNextDelay(baseInterval);
  const nextTime = Date.now() + delayMs;

  const key = String(tabId);
  await chrome.storage.local.set({
    [key]: {
      next: nextTime,
      baseInterval: baseInterval,
      urlIndex: urlIndex,
      cycleCount: cycleCount
    }
  });

  chrome.alarms.create(`refresh_${tabId}`, {
    when: nextTime
  });

  console.log(`Scheduled next refresh for tab ${tabId} in ${Math.round(delayMs/1000)}s (cycle: ${cycleCount})`);
}

export async function handleAlarm(alarm) {
  if (!alarm.name.startsWith("refresh_")) return;
  const tabIdStr = alarm.name.split("_")[1];
  const tabId = parseInt(tabIdStr);

  try {
    const data = await chrome.storage.local.get([tabIdStr]);
    const info = data[tabIdStr];
    if (!info || !info.baseInterval) return;

    // Check if tab still exists
    const tab = await chrome.tabs.get(tabId).catch(() => null);
    if (!tab || !tab.url.includes("fiverr.com")) {
      await stop(tabId);
      return;
    }

    let targetUrl;

    // Get current URL index for rotation (default to 0)
    let urlIndex = info.urlIndex || 0;

    // Get cycle count for inbox priority (default to 0)
    let cycleCount = (info.cycleCount || 0) + 1;

    // Every 5 cycles, force inbox visit
    if (cycleCount >= 5) {
      targetUrl = CONFIG.INBOX_URL;
      cycleCount = 0; // Reset counter
    } else {
      // Rotate through URLs sequentially
      targetUrl = CONFIG.NAV_URLS[urlIndex];
      // Increment URL index for next rotation (wrap around)
      urlIndex = (urlIndex + 1) % CONFIG.NAV_URLS.length;
    }

    // Navigate
    await chrome.tabs.update(tabId, { url: targetUrl });

    // Schedule next with updated urlIndex and cycleCount
    await scheduleNextWithIndex(tabId, info.baseInterval, urlIndex, cycleCount);
  } catch (err) {
    console.error("Error in handleAlarm:", err);
    await stop(tabId);
  }
}

export async function stop(tabId) {
  const idStr = String(tabId);
  await chrome.alarms.clear(`refresh_${tabId}`);
  await chrome.alarms.clear(`refresh_${idStr}`);
  await chrome.storage.local.remove(idStr);
}

export async function initStorage() {
  const data = await chrome.storage.local.get(null);
  for (const key of Object.keys(data)) {
    const info = data[key];
    // Only resume if it's a tab-specific config
    if (info && info.baseInterval && !isNaN(parseInt(key))) {
      await start(parseInt(key), info.baseInterval);
    }
  }
}

// Clean up: simple active tab tracking not strictly needed for alarms
// but kept for interface consistency if we add focus-dependent features later.
export function setActiveTab(tabId) { }
