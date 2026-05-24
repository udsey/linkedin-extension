import { parseRelativeTime, postJobs, getLastSync } from "./utils";


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
  await new Promise(r => setTimeout(r, 3000));
  const jobs = await syncAllJobs();
  if (jobs.length) postJobs(jobs)
})();
