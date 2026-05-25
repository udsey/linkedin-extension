async function getLastSync() {
    const response = await fetch("http://localhost:8050/api/last-sync");
    const data = await response.json();
    return data.last_sync;
}

browser.alarms.create("daily-apply-sync", { periodInMinutes: 1440 });

browser.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name === "daily-apply-sync") {
        const lastSync = await getLastSync();
        const hoursSince = (new Date() - new Date(lastSync)) / 36e5;
        if (hoursSince < 24) return;
        browser.tabs.create({
            url: "https://www.linkedin.com/jobs-tracker/?stage=applied",
            active: false
        });
    }
});


browser.contextMenus.create({
  id: "autofill",
  title: "Suggest fill",
  contexts: ["selection"]
});


browser.contextMenus.create({
  id: "remember",
  title: "Remember this",
  contexts: ["selection"]
});


browser.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "autofill") {
    browser.tabs.sendMessage(tab.id, {
      action: "autofill",
      selection: info.selectionText
    });
  }
  if (info.menuItemId === "remember") {
    browser.tabs.sendMessage(tab.id, {
      action: "remember",
      selection: info.selectionText
    });
  }
});
