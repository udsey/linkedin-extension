import { getLastSync } from "./utils";

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
