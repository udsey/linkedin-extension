(() => {
  // utils.js
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

  // remember.js
  browser.runtime.onMessage.addListener((message) => {
    if (message.action === "remember") {
      showRememberDialog(message.selection);
    }
  });
  async function postRemember(category, content) {
    const response = await fetch("http://localhost:8050/api/remember", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category, content })
    });
    const text = await response.text();
    console.log(`API raw response: ${text}`);
    return response.status;
  }
  function showRememberDialog(selection) {
    document.getElementById("remember-dialog")?.remove();
    const dialog = document.createElement("div");
    dialog.id = "autofill-dialog";
    dialog.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      width: 300px;
      background: #2b2b2b;
      border: 1px solid #9933cc;
      color: #adafae;
      border-radius: 8px;
      padding: 16px 16px 20px 16px;
      z-index: 99999;
      box-shadow: 0 4px 12px  #9933cc;
      font-family: sans-serif;
      font-size: 14px;
    `;
    const header = document.createElement("div");
    header.style.cssText = `
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  `;
    const handle = document.createElement("div");
    handle.id = "remember-handle";
    handle.textContent = "Remember this \u283F";
    handle.style.cssText = `
    cursor: grab;
    font-weight: bold;
    user-select: none;
    color: #ffffff;
    flex: 1;
  `;
    const closeBtn = document.createElement("button");
    closeBtn.textContent = "\u2715";
    closeBtn.style.cssText = `
    cursor: pointer;
    border: none;
    background: transparent;
    color: #adafae;
    font-size: 16px;
    padding: 0;
    line-height: 1;
  `;
    closeBtn.addEventListener("click", () => dialog.remove());
    header.appendChild(handle);
    header.appendChild(closeBtn);
    const category = document.createElement("input");
    category.placeholder = "Category (e.g. skills, bio, experience)";
    category.style.cssText = `
    width: 100%;
    margin-bottom: 8px;
    padding: 6px 8px;
    background: #2b2b2b;
    border: 1px solid #9933cc;
    outline: none;
    border-radius: 6px;
    color: #adafae;
    font-size: 13px;
    box-sizing: border-box;
  `;
    const textarea = document.createElement("textarea");
    textarea.value = selection;
    textarea.style.cssText = `
    width: 100%;
    height: 100px;
    padding: 6px 8px;
    background: #2b2b2b;
    border: 1px solid #9933cc;
    outline: none;
    border-radius: 6px;
    color: #adafae;
    font-size: 13px;
    box-sizing: border-box;
    resize: vertical;
  `;
    const saveBtn = document.createElement("button");
    saveBtn.textContent = "Save";
    saveBtn.style.cssText = `
    margin-top: 10px;
    cursor: pointer;
    padding: 6px 16px;
    border: none;
    border-radius: 6px;
    background: #4d1a66;
    color: #ffffff;
    font-size: 14px;
  `;
    function flashBorder(el) {
      el.style.border = "1px solid red";
      setTimeout(() => {
        el.style.border = "1px solid #9933cc";
      }, 2e3);
    }
    saveBtn.addEventListener("click", async () => {
      if (!category.value.trim()) {
        flashBorder(category);
        return;
      }
      if (!textarea.value.trim()) {
        flashBorder(textarea);
        return;
      }
      const status = await postRemember(category.value.trim(), textarea.value.trim());
      if (status === 200) {
        saveBtn.textContent = "Saved \u2713";
        saveBtn.style.background = "#1a6632";
        setTimeout(() => dialog.remove(), 1e3);
      } else {
        saveBtn.textContent = "Failed \u2717";
        saveBtn.style.background = "#661a1a";
        setTimeout(() => {
          saveBtn.textContent = "Save";
          saveBtn.style.background = "#4d1a66";
        }, 2e3);
      }
    });
    dialog.appendChild(header);
    dialog.appendChild(category);
    dialog.appendChild(textarea);
    dialog.appendChild(saveBtn);
    document.body.appendChild(dialog);
    makeMovable(dialog, "remember-handle");
  }
})();
