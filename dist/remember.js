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
  function showRememberDialog(selection) {
    document.getElementById("remember-dialog")?.remove();
    const dialog = document.createElement("div");
    dialog.id = "remember-dialog";
    dialog.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    width: 300px;
    background: #060606;
    border: 1px solid #9933cc;
    color: #adafae;
    border-radius: 8px;
    padding: 16px;
    z-index: 99999;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
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
    saveBtn.addEventListener("click", () => {
      if (!category.value.trim()) {
        flashBorder(category);
        return;
      }
      if (!textarea.value.trim()) {
        flashBorder(textarea);
        return;
      }
      const payload = {
        category: category.value.trim(),
        content: textarea.value.trim()
      };
      console.log("remember payload:", payload);
      dialog.remove();
    });
    dialog.appendChild(header);
    dialog.appendChild(category);
    dialog.appendChild(textarea);
    dialog.appendChild(saveBtn);
    document.body.appendChild(dialog);
    makeMovable(dialog, "remember-handle");
  }
})();
