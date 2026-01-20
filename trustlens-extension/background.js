chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "trustlens-check",
    title: "Check with TrustLens",
    contexts: ["selection", "link"],
  });
});

chrome.contextMenus.onClicked.addListener((info) => {
  chrome.storage.local.set({
    selectedContent: info.linkUrl || info.selectionText || "",
  });

  chrome.windows.create({
    url: "popup.html",
    type: "popup",
    width: 400,
    height: 500,
  });
});
