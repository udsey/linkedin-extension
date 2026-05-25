import { makeMovable } from "./utils";

browser.runtime.onMessage.addListener((message) => {
  if (message.action === "autofill") {
    showDialog(message.selection);
  }
});

async function fetchSuggestion(query) {
  const response = await fetch("http://localhost:8050/api/suggest-fill", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: query })
  });
  const text = await response.text();
  console.log(`API raw response: ${text}`);
  const data = JSON.parse(text);
  return { status: response.status, suggestion: data.payload?.suggestion };
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
    margin-bottom: 8px;
  `;

  const target = document.createElement("div");
  target.style.cssText = `
    color: #adafae;
    font-size: 12px;
    margin-bottom: 8px;
  `;
  target.textContent = selection;

  const body = document.createElement("div");
  body.style.cssText = `
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-top: 20px;
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

  const result = document.createElement("div");
  result.id = "autofill-result";
  result.style.cssText = `
    height: 100px;
    background-color: #2b2b2b;
    border: 1px solid #9933cc;
    padding: 20px;
    color: #adafae;
    border-radius: 0.375rem;
    font-size: 14px;
    box-sizing: border-box;
    resize: vertical;
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

body.appendChild(target);
body.appendChild(result);


dialog.appendChild(header);
dialog.appendChild(body);


  makeMovable(dialog, "autofill-handle");
  document.body.appendChild(dialog);

  fetchSuggestion(selection).then(({ status, suggestion }) => {
  const result = document.getElementById("autofill-result");
  if (status === 200) {
    result.textContent = suggestion;
  } else {
    result.textContent = "Failed to get suggestion.";
    result.style.color = "#9933cc";
  }
});
}
