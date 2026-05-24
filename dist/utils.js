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
  async function getLastSync() {
    const response = await fetch("http://localhost:8050/api/last-sync");
    const data = await response.json();
    return data.last_sync;
  }
  function makeMovable(el, handleId) {
    let isDragging = false, startX, startY, origX, origY;
    el.querySelector(`#${handleId}`).addEventListener("mousedown", (e) => {
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      origX = el.offsetLeft;
      origY = el.offsetTop;
      el.style.cursor = "grabbing";
    });
    document.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
      el.style.left = origX + (e.clientX - startX) + "px";
      el.style.top = origY + (e.clientY - startY) + "px";
      el.style.right = "auto";
    });
    document.addEventListener("mouseup", () => {
      isDragging = false;
      el.style.cursor = "default";
    });
  }
})();
