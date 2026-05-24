export function  parseRelativeTime(text) {
    const now = new Date();
    if (text.match("just now")) return now.toISOString().split("T")[0]; // YYYY-MM-DD
    const match = text.match(/(\d+)\s*(mo|yr|h|d|w|m)/);
    if (!match) return null;

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
        case "h": now.setHours(now.getHours() - value); break;
        case "d": now.setDate(now.getDate() - value); break;
        case "w": now.setDate(now.getDate() - value * 7); break;
        case "mo": now.setMonth(now.getMonth() - value); break;
        case "yr": now.setFullYear(now.getFullYear() - value); break;
    }
    return now.toISOString().split("T")[0]; // YYYY-MM-DD
}


export function postJobs(jobs) {
    response = await fetch("http://localhost:8050/api/sync-jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jobs)
    });
    const text = await response.text();
    console.log(`API raw response: ${text}`);

}