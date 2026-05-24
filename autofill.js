browser.runtime.onMessage.addListener((message) => {
  if (message.action === "autofill") {
    showDialog(message.selection);
  }
});


function makeMovable(el) {
  let isDragging = false, startX, startY, origX, origY;

  el.querySelector("#autofill-handle").addEventListener("mousedown", (e) => {
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


function showDialog(selection) {
  // remove existing dialog if any
  document.getElementById("autofill-dialog")?.remove();

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
    padding: 16px;
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
  margin-bottom: 8px;
`;

const handle = document.createElement("div");
handle.id = "autofill-handle";
handle.textContent = "Suggest fill ⠿";
handle.style.cssText = `
  cursor: grab;
  font-weight: bold;
  user-select: none;
  color: #ffffff;
  flex: 1;
`;


  const target = document.createElement("div");
  target.style.cssText = `
    margin-bottom: 8px;
    color: #adafae;
    font-size: 12px;
  `;
  target.textContent = selection;

  const result = document.createElement("div");
  result.id = "autofill-result";
  result.style.cssText = `
    min-height: 40px;
    background-color: #2b2b2b;
    border: 1px solid #9933cc;
    padding: 2px;
    color: #adafae;
    border-radius: 0.375rem;
    font-size: 14px;
  `;
  result.textContent = "Loading...";

  const button = document.createElement("button");
button.id = "autofill-close";
button.textContent = "✕";
button.style.cssText = `
  cursor: pointer;
  border: none;
  background: transparent;
  color: #ffffff;
  font-size: 16px;
  padding: 0;
  line-height: 1;
`;
button.addEventListener("click", () => dialog.remove());


header.appendChild(handle);
header.appendChild(button);

dialog.appendChild(header);
dialog.appendChild(target);
dialog.appendChild(result);


  makeMovable(dialog);
  document.body.appendChild(dialog);
}
