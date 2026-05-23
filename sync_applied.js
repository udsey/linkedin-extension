function  parseRelativeTime(text) {
    const now = new Date();
    if (text.match("just now")) return now.toISOString().split("T")[0]; // YYYY-MM-DD
    const match = text.match(/(\d+)\s*(m|h|d|mo|w|yr)/);
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

function parseJobInfo(text) {
    const match = text.match(/(.+?) · (.+?) \((.+?)\)/);
    if (!match) return null;

    return { company: match[1].trim(), location: match[2].trim() };
}

async function goToNextPage() {
    console.log("next");
  const next = document.querySelector(
    "[data-testid='pagination-controls-next-button-visible']"
  );
  if (!next) return false;
  next.click();
  await new Promise(r => setTimeout(r, 2000)); // wait for page load
  return true;
}



function extractJobs() {
    const containers = [...document.querySelectorAll("*")].filter(
        el => el.children.length === 2
    );

    const listContainer = containers.find(el => {
        const headers = el.children[0];
        return [...headers.children]
            .some(el => el.querySelector("p")?.textContent.trim() === "Jobs");
    });

    if (!listContainer) return [];
    console.log("listContainer found:", listContainer);

    const jobList = listContainer.children[0].children[1].children[1];
    const jobs = [];
    console.log("jobList found:", jobList);

    for (const jobEl of jobList.children) {
        if (jobEl.children.length < 2) continue;

        const target = jobEl.children[1];
        const link = target.querySelector("a")
        if (!link) continue;

        console.log("job found:", jobEl.children[1]);

        const href = link.href;
        const parts = href.split("/").filter(Boolean)
        const job_id = parts[parts.length - 1];
        const paragraphs = [...link.querySelectorAll("p")];
        const job_title = paragraphs[0]?.textContent.trim();
        const companyLocation = paragraphs[1]?.textContent.trim();
        const { company, location } = parseJobInfo(companyLocation) ?? {};
        const applied_at = parseRelativeTime(paragraphs[2]?.textContent);
        const posted_time = parseRelativeTime(paragraphs[3]?.textContent);
        const created_at = new Date().toISOString()
        jobs.push({job_id, job_title, company, job_url: href, created_at, applied_at, posted_time});
    }
    return jobs;
}


async function syncAllJobs() {
  const jobs = [];
  while (true) {
    const newJobs = extractJobs();
    jobs.push(...newJobs);
    if (newJobs.length === 0) break;
    const hasNext = await goToNextPage();
    if (!hasNext) break;
  }
  return jobs;
}

async function getLastSync() {
  const response = await fetch("http://localhost:8050/api/last-sync");
  const data = await response.json();
  return data.last_sync; // expects {"last_sync": "2026-05-22"}
}

(async () => {
  console.log("sync_applied.js loaded");
  try {
    const lastSync = await getLastSync();
    console.log("Last sync:", lastSync);
  } catch (e) {
    console.error("getLastSync failed:", e);
  }
  await new Promise(r => setTimeout(r, 3000));
  const jobs = await syncAllJobs();
  if (jobs.length) {
    console.log("sending jobs to API:", jobs.length);
    const response = await fetch("http://localhost:8050/api/sync-jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(jobs)
    });
    const text = await response.text();
    console.log("API raw response:", text);
  }
})();