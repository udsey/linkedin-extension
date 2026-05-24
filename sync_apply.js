import { parseRelativeTime, postJobs, waitForElement, onUrlChange } from "./utils";

function parseJob() {
    var job = {};
    var current_url = window.location.href;
    job["job_id"] = current_url.match(/currentJobId=(\d+)/)[1];
    job["job_url"] = `https://www.linkedin.com/jobs/view/${job["job_id"]}/`;
    job["company"] = document.querySelector(".job-details-jobs-unified-top-card__company-name").textContent.trim();
    job["job_title"] = document.querySelector(".job-details-jobs-unified-top-card__job-title").textContent.trim();
    var locationTime = document.querySelector(".job-details-jobs-unified-top-card__primary-description-container").textContent.trim().split(" · ");
    job["location"] = locationTime[0];
    job["posted_time"] = parseRelativeTime(locationTime[1]);
    job["description"] = document.querySelector("#job-details").textContent.trim();

    return job;
}


function isJobPage() {
    return new URLSearchParams(location.search).has("currentJobId");
}


(async () => {
    async function attachListener() {
        if (!isJobPage()) return;

        try {
            const btn = await waitForElement("#jobs-apply-button-id");
            const job = parseJob();
            btn.addEventListener("click", () => {
                job.created_at = job.applied_at = new Date().toISOString();
                postJobs(job);
            });
        } catch (e) {
            console.warn("Apply button not found", e.message);
        }
    }
    onUrlChange(attachListener);
    await attachListener();
}) ();