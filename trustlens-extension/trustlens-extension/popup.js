const analyzeBtn = document.getElementById("analyzeBtn");
const resultDiv = document.getElementById("result");

const BACKEND =
  "https://cuddly-robot-v65565p774qg2x695-5000.app.github.dev";

analyzeBtn.addEventListener("click", async () => {
  resultDiv.className = "";
  resultDiv.innerText = "Analyzing...";

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab?.url) {
    resultDiv.innerText = "Invalid page";
    return;
  }

  const res = await fetch(`${BACKEND}/analyze-link`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: tab.url }),
  });

  const data = await res.json();

  let cls =
    data.risk_level === "LOW"
      ? "low"
      : data.risk_level === "SUSPICIOUS"
      ? "suspicious"
      : "high";

  resultDiv.className = cls;
  resultDiv.innerHTML = `
    <b>Trust Score:</b> ${data.trust_score}/100<br/>
    <b>Risk:</b> ${data.risk_level}<br/><br/>
    ${data.explanation?.slice(0,3).map(r => "• " + r).join("<br/>")}
  `;
});
