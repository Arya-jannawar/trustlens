require("dotenv").config();
const express = require("express");
const cors = require("cors");
const whois = require("whois-json");
const dns = require("dns").promises;
const tls = require("tls");

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

// ---------------- CONSTANTS ----------------
const TRUSTED_DOMAINS = [
  "linkedin.com",
  "naukri.com",
  "indeed.com",
  "glassdoor.com",
  "monster.com",
  "ziprecruiter.com",
];

const SUSPICIOUS_TLDS = ["xyz", "top", "site", "online", "buzz", "info"];

// ---------------- HELPERS ----------------

// Extract root domain
function extractRootDomain(url) {
  try {
    const host = new URL(url).hostname.toLowerCase().replace(/^www\./, "");
    const parts = host.split(".");
    return parts.length > 2 ? parts.slice(-2).join(".") : host;
  } catch {
    return null;
  }
}

// Domain age in days
function getDomainAge(date) {
  if (!date) return 0;
  return Math.floor((Date.now() - new Date(date)) / (1000 * 60 * 60 * 24));
}

// SSL check
function checkSSL(hostname) {
  return new Promise((resolve) => {
    const socket = tls.connect(
      443,
      hostname,
      { servername: hostname, timeout: 5000 },
      () => {
        resolve(!!socket.getPeerCertificate());
        socket.end();
      }
    );
    socket.on("error", () => resolve(false));
    socket.on("timeout", () => resolve(false));
  });
}

// Fake / random domain detection
function domainQualityPenalty(domain) {
  let penalty = 0;
  if (/\d/.test(domain)) penalty += 20;
  if (!/[aeiou]/i.test(domain)) penalty += 15;
  if (domain.length < 6) penalty += 15;
  if (/job|career|hiring/i.test(domain)) penalty += 10;
  return penalty;
}

// Brand impersonation check
function isBrandImpersonation(domain) {
  return TRUSTED_DOMAINS.some(
    trusted =>
      domain.includes(trusted.replace(".com", "")) && domain !== trusted
  );
}

// ---------------- HEALTH CHECK ----------------
app.get("/health", (req, res) => {
  res.json({ status: "Backend OK" });
});

// ---------------- LINK ANALYSIS ----------------
app.post("/analyze-link", async (req, res) => {
  try {
    const rawUrl = req.body.url;

    if (!rawUrl || !rawUrl.startsWith("http")) {
      return res.json({
        trust_score: 10,
        risk_level: "HIGH RISK",
        explanation: ["Invalid or malformed URL"],
      });
    }

    const hostname = new URL(rawUrl).hostname.replace(/^www\./, "");
    const rootDomain = extractRootDomain(rawUrl);

    let score = 50;
    const reasons = [];

    // WHOIS
    try {
      const whoisData = await whois(rootDomain);
      const created =
        whoisData.creationDate ||
        whoisData.created ||
        whoisData.registered;

      const age = getDomainAge(created);

      if (age > 365) {
        score += 25;
        reasons.push("Old trusted domain");
      } else if (age > 90) {
        score += 10;
        reasons.push("Moderately aged domain");
      } else {
        score -= 25;
        reasons.push("Recently registered domain");
      }
    } catch {
      score -= 15;
      reasons.push("WHOIS lookup failed");
    }

    // DNS
    try {
      await dns.lookup(hostname);
      score += 10;
    } catch {
      score -= 25;
      reasons.push("DNS lookup failed");
    }

    // SSL
    if (await checkSSL(hostname)) {
      score += 10;
    } else {
      score -= 15;
      reasons.push("SSL certificate missing");
    }

    // Domain quality
    const qualityPenalty = domainQualityPenalty(rootDomain);
    if (qualityPenalty > 0) {
      score -= qualityPenalty;
      reasons.push("Suspicious domain structure");
    }

    // Brand spoofing
    if (isBrandImpersonation(rootDomain)) {
      score -= 40;
      reasons.push("Brand impersonation detected");
    }

    // TLD check
    const tld = rootDomain.split(".").pop();
    if (SUSPICIOUS_TLDS.includes(tld)) {
      score -= 20;
      reasons.push("Suspicious top‑level domain");
    }

    // Trusted domain bonus
    if (TRUSTED_DOMAINS.includes(rootDomain)) {
      score += 15;
      reasons.push("Known trusted job platform");
    }

    score = Math.max(0, Math.min(score, 100));

    const risk =
      score >= 70 ? "LOW" :
      score >= 40 ? "SUSPICIOUS" :
      "HIGH RISK";

    res.json({
      trust_score: score,
      risk_level: risk,
      explanation: reasons.slice(0, 4),
    });

  } catch {
    res.json({
      trust_score: 25,
      risk_level: "HIGH RISK",
      explanation: ["Analysis failed"],
    });
  }
});

// ---------------- START SERVER ----------------
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ TrustLens backend running on port ${PORT}`);
});
