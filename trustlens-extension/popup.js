const analyzeBtn = document.getElementById("analyzeBtn");
const resultDiv = document.getElementById("result");

analyzeBtn.addEventListener("click", () => {
  // 1️⃣ Get current active tab
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs || !tabs[0] || !tabs[0].url) {
      resultDiv.textContent = "❌ Unable to read current page URL";
      resultDiv.classList.remove("hidden");
      return;
    }

    const currentUrl = tabs[0].url;
    resultDiv.textContent = "🔍 Analyzing...";
    resultDiv.classList.remove("hidden");

    // 2️⃣ Send URL to backend
    fetch("https://trustlens-backend-lh2x.onrender.com/analyze-link", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ url: currentUrl })
    })
      .then(res => res.json())
      .then(data => {
        resultDiv.innerHTML = `
          <b>Trust Score:</b> ${data.trust_score}<br/>
          <b>Risk Level:</b> ${data.risk_level}
        `;
      })
      .catch(() => {
        resultDiv.textContent = "❌ Error contacting backend";
      });
  });
});
