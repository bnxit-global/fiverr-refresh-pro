import { CONFIG } from '../shared/config.js';
import { getNextDelay, random } from '../shared/utils.js';

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

export async function scheduleNext(tabId, baseInterval, lastInboxTime) {
  const delayMs = getNextDelay(baseInterval);
  const nextTime = Date.now() + delayMs;

  const key = String(tabId);
  await chrome.storage.local.set({
    [key]: {
      next: nextTime,
      baseInterval: baseInterval,
      lastInboxTime: lastInboxTime
    }
  });

  // Use alarms for MV3 background reliability
  chrome.alarms.create(`refresh_${tabId}`, {
    when: nextTime
  });

  console.log(`Scheduled next refresh for tab ${tabId} in ${Math.round(delayMs/1000)}s`);
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
    let newLastInboxTime = info.lastInboxTime || 0;

    // Smart Navigation Logic
    const timeSinceInbox = Date.now() - newLastInboxTime;
    if (timeSinceInbox >= CONFIG.INBOX_PRIORITY_INTERVAL_MS) {
      targetUrl = CONFIG.INBOX_URL;
      newLastInboxTime = Date.now();
    } else {
      const randomIndex = random(0, CONFIG.NAV_URLS.length - 1);
      targetUrl = CONFIG.NAV_URLS[randomIndex];
      // If random pick is inbox, update the timer
      if (targetUrl === CONFIG.INBOX_URL) {
        newLastInboxTime = Date.now();
      }
    }

    // Navigate
    await chrome.tabs.update(tabId, { url: targetUrl });

    // Schedule next (this ensures it's random EVERY time)
    await scheduleNext(tabId, info.baseInterval, newLastInboxTime);
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
