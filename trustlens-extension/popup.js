const analyzeBtn = document.getElementById("analyzeBtn");
const resultDiv = document.getElementById("result");

const BACKEND_URL =
  "https://cuddly-robot-v65565p774qg2x695-5000.app.github.dev";

analyzeBtn.addEventListener("click", async () => {
  resultDiv.innerHTML = "⏳ Analyzing current page...";

  try {
    // Get active tab
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (!tab?.url || !tab.url.startsWith("http")) {
      resultDiv.innerHTML = "❌ This page cannot be analyzed";
      return;
    }

    const res = await fetch(`${BACKEND_URL}/analyze-link`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: tab.url }),
    });

    if (!res.ok) {
      throw new Error("Backend error");
    }

    const data = await res.json();

    const color =
      data.risk_level === "LOW"
        ? "green"
        : data.risk_level === "SUSPICIOUS"
        ? "orange"
        : "red";

    resultDiv.innerHTML = `
      <div style="font-size:14px">
        <b>Trust Score:</b> ${data.trust_score}/100
        <div style="height:8px;background:#eee;border-radius:6px;margin:6px 0">
          <div style="width:${data.trust_score}%;
                      background:${color};
                      height:100%;
                      border-radius:6px"></div>
        </div>
        <b>Risk Level:</b>
        <span style="color:${color};font-weight:bold">
          ${data.risk_level}
        </span>
      </div>
    `;
  } catch (err) {
    console.error(err);
    resultDiv.innerHTML = "❌ Backend not reachable";
  }
});
