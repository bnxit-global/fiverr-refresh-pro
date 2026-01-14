function isNight() {
  const h = new Date().getHours();
  return h >= 0 && h < 6;
}

function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function nextDelay() {
  if (isNight()) {
    return random(60000, 90000); // 60–90s
  }
  return 30000 + random(0, 15000); // 30–45s
}

const timers = {};
let activeTabId = null;

chrome.tabs.onActivated.addListener(({ tabId }) => {
  activeTabId = tabId;
});

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "START") start(msg.tabId);
  if (msg.type === "STOP") stop(msg.tabId);
});

function start(tabId) {
  stop(tabId);

  chrome.tabs.get(tabId, (tab) => {
    if (!tab?.url?.includes("fiverr.com")) return;
    loop(tabId);
  });
}

function loop(tabId) {
  const delay = nextDelay();

  chrome.storage.local.set({
    [tabId]: { next: Date.now() + delay }
  });

  timers[tabId] = setTimeout(() => {
    if (tabId !== activeTabId) {
      loop(tabId); // paused but infinite
      return;
    }

    chrome.tabs.get(tabId, (tab) => {
      if (!tab || !tab.url.includes("fiverr.com")) {
        stop(tabId);
        return;
      }

      chrome.tabs.reload(tabId);
      loop(tabId);
    });
  }, delay);
}

function stop(tabId) {
  clearTimeout(timers[tabId]);
  delete timers[tabId];
  chrome.storage.local.remove(String(tabId));
}

chrome.tabs.onRemoved.addListener(stop);

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.url && !changeInfo.url.includes("fiverr.com")) {
    stop(tabId);
  }
});

chrome.runtime.onStartup.addListener(() => {
  chrome.storage.local.get(null, (data) => {
    Object.keys(data).forEach((tabId) => {
      start(Number(tabId));
    });
  });
});
