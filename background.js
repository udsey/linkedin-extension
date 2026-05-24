browser.alarms.create("daily-apply-sync", { periodInMinutes: 1440 });
// use endpoint last-sync for trigger (>= 24 hours since last sync)
browser.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "daily-apply-sync") {
        browser.tabs.create({
            url: "https://www.linkedin.com/jobs-tracker/?stage=applied",
            active: false
        })
    }
})