async function getMatch(job) {
    const response = await fetch("http://localhost:8050/api/match-job", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(job)
    });
    const text = await response.text();
    console.log(`API raw response: ${text}`);

    if (response.status !== 200) {
        throw new Error(`API returned status ${response.status}: ${text}`);
    }

    return JSON.parse(text);
};


function showMatch() {
    const job = document.querySelector("#job-details").textContent.trim();
    const content = getMatch(job);
    // Show content: "job_summary", "relevance_score","matching_skills", "missing_requirements"
};