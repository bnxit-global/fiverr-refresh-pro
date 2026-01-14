import { getNextDelay } from '../shared/utils.js';

const timers = {};
let activeTabId = null;

export function setActiveTab(tabId) {
  activeTabId = tabId;
}

export function start(tabId, baseInterval) {
  stop(tabId);

  chrome.tabs.get(tabId, (tab) => {
    if (!tab?.url?.includes("fiverr.com")) return;
    loop(tabId, baseInterval);
  });
}

export function loop(tabId, baseInterval) {
  const delay = getNextDelay(baseInterval);

  chrome.storage.local.set({
    [tabId]: {
      next: Date.now() + delay,
      baseInterval: baseInterval
    }
  });

  timers[tabId] = setTimeout(() => {
    if (tabId !== activeTabId) {
      loop(tabId, baseInterval); // paused but infinite
      return;
    }

    chrome.tabs.get(tabId, (tab) => {
      if (!tab || !tab.url.includes("fiverr.com")) {
        stop(tabId);
        return;
      }

      chrome.tabs.reload(tabId);
      loop(tabId, baseInterval);
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

