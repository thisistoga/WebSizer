document.addEventListener("DOMContentLoaded", () => {
  displayCurrentViewport();

  document.querySelectorAll(".size-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const width = parseInt(btn.dataset.width, 10);
      const height = parseInt(btn.dataset.height, 10);
      chrome.runtime.sendMessage(
        { action: "resizeViewport", width, height },
        () => window.close()
      );
    });
  });

  const applyCustom = () => {
    const width = parseInt(document.getElementById("customWidth").value, 10);
    const height = parseInt(document.getElementById("customHeight").value, 10);
    if (width > 0 && height > 0) {
      chrome.runtime.sendMessage(
        { action: "resizeViewport", width, height },
        () => window.close()
      );
    }
  };

  document.getElementById("applyCustom").addEventListener("click", applyCustom);

  ["customWidth", "customHeight"].forEach((id) => {
    document.getElementById(id).addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        applyCustom();
      }
    });
  });
});

async function displayCurrentViewport() {
  chrome.runtime.sendMessage({ action: "getViewport" }, (response) => {
    if (response && response.success) {
      document.getElementById(
        "currentSize"
      ).textContent = `Current viewport: ${response.innerWidth} \u00d7 ${response.innerHeight}`;
    } else {
      document.getElementById("currentSize").textContent =
        "Cannot read viewport on this page";
    }
  });
}
