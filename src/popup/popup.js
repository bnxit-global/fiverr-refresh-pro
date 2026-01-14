async function getTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

const startBtn = document.getElementById("start");
const stopBtn = document.getElementById("stop");
const intervalSelect = document.getElementById("interval");
const countdownEl = document.getElementById("countdown");
const statusTextEl = document.getElementById("status-text");

// Load saved interval if available
chrome.storage.local.get(['selectedInterval'], (data) => {
    if (data.selectedInterval) {
        intervalSelect.value = data.selectedInterval;
    }
});

startBtn.onclick = async () => {
    const tab = await getTab();
    if (tab && tab.url.includes("fiverr.com")) {
        const interval = parseInt(intervalSelect.value);
        chrome.storage.local.set({ selectedInterval: interval });
        chrome.runtime.sendMessage({
            type: "START",
            tabId: tab.id,
            baseInterval: interval
        });
        statusTextEl.innerText = "Active";
        statusTextEl.style.color = "#1dbf73";
    } else {
        statusTextEl.innerText = "Open Fiverr First";
        statusTextEl.style.color = "#ff4d4d";
    }
};

stopBtn.onclick = async () => {
    const tab = await getTab();
    if (tab) {
        chrome.runtime.sendMessage({ type: "STOP", tabId: tab.id });
        statusTextEl.innerText = "Stopped";
        statusTextEl.style.color = "#74767e";
    }
};

setInterval(async () => {
    const tab = await getTab();
    if (!tab) return;

    chrome.storage.local.get(String(tab.id), (data) => {
        const info = data[tab.id];
        if (!info) {
            countdownEl.innerText = "--";
            statusTextEl.innerText = tab.url.includes("fiverr.com") ? "Ready to Start" : "Open Fiverr First";
            return;
        }

        const remaining = Math.max(0, Math.ceil((info.next - Date.now()) / 1000));
        const minutes = Math.floor(remaining / 60);
        const seconds = remaining % 60;
        countdownEl.innerText = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        statusTextEl.innerText = "Refreshing...";
        statusTextEl.style.color = "#1dbf73";
    });
}, 1000);

