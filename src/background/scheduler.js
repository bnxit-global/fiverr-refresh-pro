import { CONFIG } from '../shared/config.js';
import { getNextDelay, random } from '../shared/utils.js';

const timers = {};
let activeTabId = null;

export function setActiveTab(tabId) {
  activeTabId = tabId;
}

export function start(tabId, baseInterval) {
  stop(tabId);

  chrome.tabs.get(tabId, (tab) => {
    if (!tab?.url?.includes("fiverr.com")) return;
    // Initialize lastInboxTime if not exists
    chrome.storage.local.get([String(tabId)], (data) => {
      const info = data[tabId] || {};
      const lastInboxTime = info.lastInboxTime || 0;
      loop(tabId, baseInterval, lastInboxTime);
    });
  });
}

export function loop(tabId, baseInterval, lastInboxTime) {
  const delay = getNextDelay(baseInterval);

  chrome.storage.local.set({
    [tabId]: {
      next: Date.now() + delay,
      baseInterval: baseInterval,
      lastInboxTime: lastInboxTime
    }
  });

  timers[tabId] = setTimeout(() => {
    if (tabId !== activeTabId) {
      loop(tabId, baseInterval, lastInboxTime); // paused but infinite
      return;
    }

    chrome.tabs.get(tabId, (tab) => {
      if (!tab || !tab.url.includes("fiverr.com")) {
        stop(tabId);
        return;
      }

      let targetUrl;
      let newLastInboxTime = lastInboxTime;

      // Priority check: Inbox every 2 minutes
      if (Date.now() - lastInboxTime >= CONFIG.INBOX_PRIORITY_INTERVAL_MS) {
        targetUrl = CONFIG.INBOX_URL;
        newLastInboxTime = Date.now();
      } else {
        // Pick random page from NAV_URLS
        const randomIndex = random(0, CONFIG.NAV_URLS.length - 1);
        targetUrl = CONFIG.NAV_URLS[randomIndex];

        // If we happened to pick inbox randomly, update the timer too
        if (targetUrl === CONFIG.INBOX_URL) {
          newLastInboxTime = Date.now();
        }
      }

      chrome.tabs.update(tabId, { url: targetUrl });
      loop(tabId, baseInterval, newLastInboxTime);
    });
  }, delay);
}

export function stop(tabId) {
  clearTimeout(timers[tabId]);
  delete timers[tabId];
  chrome.storage.local.remove(String(tabId));
}

export function initStorage() {
    chrome.storage.local.get(null, (data) => {
        Object.keys(data).forEach((tabId) => {
          const info = data[tabId];
          if (info && info.baseInterval) {
            start(Number(tabId), info.baseInterval);
          }
        });
    });
}
