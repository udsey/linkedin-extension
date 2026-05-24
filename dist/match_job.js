(() => {
  // utils.js
  function waitForElement(selector, timeout = 1e4) {
    return new Promise((resolve, reject) => {
      const el = document.querySelector(selector);
      if (el) return resolve(el);
      const observer = new MutationObserver(() => {
        const el2 = document.querySelector(selector);
        if (el2) {
          observer.disconnect();
          resolve(el2);
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
      setTimeout(() => {
        observer.disconnect();
        reject(new Error(`Timeout waiting for ${selector}`));
      }, timeout);
    });
  }
  function onUrlChange(callback) {
    let lastUrl = location.href;
    window.addEventListener("popstate", callback);
    setInterval(() => {
      if (location.href != lastUrl) {
        lastUrl = location.href;
        callback();
      }
    }, 500);
  }

  // match_job.js
  async function getMatch(description) {
    const response = await fetch("http://localhost:8050/api/match-job", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(description)
    });
    const text = await response.text();
    if (response.status !== 200) {
      throw new Error(`API returned status ${response.status}: ${text}`);
    }
    return JSON.parse(text);
  }
  function renderPanel(content) {
    const existing = document.querySelector("#job-match-panel");
    if (existing) existing.remove();
    const panel = document.createElement("div");
    panel.id = "job-match-panel";
    panel.style.cssText = `
        border:1px solid  #0a66c2;
        border-radius:0.9rem;
        padding:16px 24px;
        margin:16px 0;`;
    if (content.error) {
      panel.innerHTML = `<p>\u{1F6AB} Error: ${content.error}</p>`;
      document.querySelector("#job-details").prepend(panel);
      return;
    }
    panel.innerHTML = `
        <h3 style="margin-bottom:0.8rem">Match Score: ${content.relevance_score}%</h3>
        <p style="margin-bottom:0.8rem">\u{1F4CB} ${content.job_summary}</p>
        <p style="margin-bottom:0.8rem">\u2705 <b>Matching:</b> ${content.matching_skills.join(", ")}</p>
        <p style="margin-bottom:0.8rem">\u{1F6AB} <b>Missing:</b> ${content.missing_requirements.join(", ")}</p>
    `;
    document.querySelector("#job-details").prepend(panel);
  }
  async function init() {
    const existing = document.querySelector("#job-match-panel");
    if (existing) existing.remove();
    const existingBtn = document.querySelector("#job-match-btn");
    if (existingBtn) existingBtn.remove();
    const btn = await waitForElement("#jobs-apply-button-id");
    const matchBtn = document.createElement("button");
    matchBtn.id = "job-match-btn";
    matchBtn.textContent = "Check Match";
    matchBtn.style.cssText = `
        font-weight:600;
        border:1px solid #0a66c2;
        background:transparent;
        height: 4rem;
        border-radius:99.9rem;
        margin-left: 5px;
        margin-right: 0;
        padding:6px 16px;
        cursor:pointer;
        color:#0a66c2;
        font-size:1.6rem;`;
    async function showMatch() {
      matchBtn.disabled = true;
      matchBtn.textContent = "Checking...";
      try {
        const description = document.querySelector("#job-details").textContent.trim();
        const content = await getMatch(description);
        renderPanel(content);
      } catch (e) {
        renderPanel({ error: e.message });
      } finally {
        matchBtn.disabled = false;
        matchBtn.textContent = "Check Match";
      }
    }
    matchBtn.addEventListener("click", showMatch);
    btn.parentElement.appendChild(matchBtn);
  }
  onUrlChange(init);
  init();
})();
