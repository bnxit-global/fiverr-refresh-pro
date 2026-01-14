import { handleAlarm, initStorage, setActiveTab, start, stop } from './scheduler.js';

chrome.tabs.onActivated.addListener(({ tabId }) => {
  setActiveTab(tabId);
});

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "START") start(msg.tabId, msg.baseInterval);
  if (msg.type === "STOP") stop(msg.tabId);
});

chrome.tabs.onRemoved.addListener(stop);

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.url && !changeInfo.url.includes("fiverr.com")) {
    stop(tabId);
  }
});

chrome.runtime.onStartup.addListener(initStorage);
chrome.runtime.onInstalled.addListener(initStorage);

chrome.alarms.onAlarm.addListener((alarm) => {
  handleAlarm(alarm);
});

