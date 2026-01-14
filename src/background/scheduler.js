import { CONFIG } from '../shared/config.js';
import { getNextDelay, random } from '../shared/utils.js';

export function start(tabId, baseInterval) {
  // Clear any existing alarms/timers for this tab
  stop(tabId);

  chrome.tabs.get(tabId, (tab) => {
    if (!tab?.url?.includes("fiverr.com")) return;

    // Initialize or resume state
    const key = String(tabId);
    chrome.storage.local.get([key], (data) => {
      const info = data[key] || {};
      // If we are starting fresh, mark lastInboxTime as now to start the 2-min timer
      const lastInboxTime = info.lastInboxTime || Date.now();
      scheduleNext(tabId, baseInterval, lastInboxTime);
    });
  });
}

export function scheduleNext(tabId, baseInterval, lastInboxTime) {
  const delayMs = getNextDelay(baseInterval);
  const nextTime = Date.now() + delayMs;

  const key = String(tabId);
  chrome.storage.local.set({
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
}

export async function handleAlarm(alarm) {
  if (!alarm.name.startsWith("refresh_")) return;
  const tabIdStr = alarm.name.split("_")[1];
  const tabId = parseInt(tabIdStr);

  chrome.storage.local.get([tabIdStr], async (data) => {
    const info = data[tabIdStr];
    if (!info || !info.baseInterval) return;

    try {
      // Check if tab still exists
      const tab = await chrome.tabs.get(tabId);
      if (!tab || !tab.url.includes("fiverr.com")) {
        stop(tabId);
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

      // Schedule next
      scheduleNext(tabId, info.baseInterval, newLastInboxTime);
    } catch (err) {
      stop(tabId);
    }
  });
}

export function stop(tabId) {
  const idStr = String(tabId);
  chrome.alarms.clear(`refresh_${idStr}`);
  chrome.alarms.clear(`refresh_${tabId}`); // Clear both just in case
  chrome.storage.local.remove(idStr);
}

export function initStorage() {
  chrome.storage.local.get(null, (data) => {
    Object.keys(data).forEach((key) => {
      const info = data[key];
      // Only resume if it's a tab-specific config
      if (info && info.baseInterval && !isNaN(parseInt(key))) {
        start(parseInt(key), info.baseInterval);
      }
    });
  });
}

// Clean up: simple active tab tracking not strictly needed for alarms
// but kept for interface consistency if we add focus-dependent features later.
export function setActiveTab(tabId) { }
