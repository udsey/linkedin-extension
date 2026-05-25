(() => {
  // utils.js
  function parseRelativeTime(text) {
    const now = /* @__PURE__ */ new Date();
    if (text.match("just now")) return now.toISOString().split("T")[0];
    const match = text.match(/(\d+)\s*(mo|yr|h|d|w|m)/);
    if (!match) return null;
    const value = parseInt(match[1]);
    const unit = match[2];
    switch (unit) {
      case "h":
        now.setHours(now.getHours() - value);
        break;
      case "d":
        now.setDate(now.getDate() - value);
        break;
      case "w":
        now.setDate(now.getDate() - value * 7);
        break;
      case "mo":
        now.setMonth(now.getMonth() - value);
        break;
      case "yr":
        now.setFullYear(now.getFullYear() - value);
        break;
    }
    return now.toISOString().split("T")[0];
  }
  async function postJobs(jobs) {
    const response = await fetch("http://localhost:8050/api/sync-jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(jobs)
    });
    const text = await response.text();
    console.log(`API raw response: ${text}`);
  }
  async function getLastSync() {
    const response = await fetch("http://localhost:8050/api/last-sync");
    const data = await response.json();
    return data.payload.last_sync;
  }

  // sync_applied.js
  function parseJobInfo(text) {
    const match = text.match(/(.+?) · (.+?) \((.+?)\)/);
    if (!match) return null;
    return { company: match[1].trim(), location: match[2].trim() };
  }
  async function goToNextPage() {
    const next = document.querySelector(
      "[data-testid='pagination-controls-next-button-visible']"
    );
    if (!next) return false;
    next.click();
    await new Promise((r) => setTimeout(r, 2e3));
    return true;
  }
  function extractJobs() {
    const containers = [...document.querySelectorAll("*")].filter(
      (el) => el.children.length === 2
    );
    const listContainer = containers.find((el) => {
      const headers = el.children[0];
      return [...headers.children].some((el2) => el2.querySelector("p")?.textContent.trim() === "Jobs");
    });
    if (!listContainer) return [];
    console.log("listContainer found:", listContainer);
    const jobList = listContainer.children[0].children[1].children[1];
    const jobs = [];
    console.log("jobList found:", jobList);
    for (const jobEl of jobList.children) {
      if (jobEl.children.length < 2) continue;
      const target = jobEl.children[1];
      const link = target.querySelector("a");
      if (!link) continue;
      const href = link.href;
      const parts = href.split("/").filter(Boolean);
      const job_id = parts[parts.length - 1];
      const paragraphs = [...link.querySelectorAll("p")];
      const job_title = paragraphs[0]?.textContent.trim();
      const companyLocation = paragraphs[1]?.textContent.trim();
      const { company, location: location2 } = parseJobInfo(companyLocation) ?? {};
      const applied_at = parseRelativeTime(paragraphs[2]?.textContent);
      const posted_time = parseRelativeTime(paragraphs[3]?.textContent);
      const created_at = (/* @__PURE__ */ new Date()).toISOString();
      jobs.push({ job_id, job_title, company, job_url: href, created_at, applied_at, posted_time });
    }
    return jobs;
  }
  async function syncAllJobs() {
    const jobs = [];
    const maxPages = 15;
    let currentPage = 0;
    while (true) {
      const newJobs = extractJobs();
      jobs.push(...newJobs);
      if (newJobs.length === 0) break;
      currentPage++;
      if (currentPage >= maxPages) break;
      const hasNext = await goToNextPage();
      if (!hasNext) break;
    }
    return jobs;
  }
  (async () => {
    console.log("sync_applied.js loaded");
    try {
      const lastSync = await getLastSync();
      console.log("Last sync:", lastSync);
    } catch (e) {
      console.error("getLastSync failed:", e);
    }
    await new Promise((r) => setTimeout(r, 3e3));
    const jobs = await syncAllJobs();
    if (jobs.length) postJobs(jobs);
  })();
})();
