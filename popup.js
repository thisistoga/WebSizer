document.addEventListener("DOMContentLoaded", () => {
  displayCurrentViewport();

  document.querySelectorAll(".size-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const width = parseInt(btn.dataset.width, 10);
      const height = parseInt(btn.dataset.height, 10);
      resizeViewport(width, height);
    });
  });

  document.getElementById("applyCustom").addEventListener("click", () => {
    const width = parseInt(document.getElementById("customWidth").value, 10);
    const height = parseInt(document.getElementById("customHeight").value, 10);
    if (width && height && width >= 200 && height >= 200) {
      resizeViewport(width, height);
    }
  });
});

async function displayCurrentViewport() {
  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    const [result] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => ({
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
      }),
    });
    const { innerWidth, innerHeight } = result.result;
    document.getElementById(
      "currentSize"
    ).textContent = `Current viewport: ${innerWidth} \u00d7 ${innerHeight}`;
  } catch {
    document.getElementById("currentSize").textContent =
      "Cannot read viewport on this page";
  }
}

async function resizeViewport(targetWidth, targetHeight) {
  try {
    const currentWindow = await chrome.windows.getCurrent();
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    // Measure the current chrome (UI) offset by comparing outer vs inner dimensions
    const [result] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => ({
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
        outerWidth: window.outerWidth,
        outerHeight: window.outerHeight,
      }),
    });

    const dims = result.result;
    const chromeWidth = dims.outerWidth - dims.innerWidth;
    const chromeHeight = dims.outerHeight - dims.innerHeight;

    // Set the outer window size so that the viewport (inner) matches the target
    const newWidth = targetWidth + chromeWidth;
    const newHeight = targetHeight + chromeHeight;

    await chrome.windows.update(currentWindow.id, {
      width: newWidth,
      height: newHeight,
    });

    // Verify and correct if needed (device pixel ratio or rounding can cause drift)
    setTimeout(async () => {
      try {
        const [verify] = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => ({
            innerWidth: window.innerWidth,
            innerHeight: window.innerHeight,
            outerWidth: window.outerWidth,
            outerHeight: window.outerHeight,
          }),
        });

        const actual = verify.result;
        const widthDiff = targetWidth - actual.innerWidth;
        const heightDiff = targetHeight - actual.innerHeight;

        if (widthDiff !== 0 || heightDiff !== 0) {
          const correctedWindow = await chrome.windows.getCurrent();
          await chrome.windows.update(correctedWindow.id, {
            width: correctedWindow.width + widthDiff,
            height: correctedWindow.height + heightDiff,
          });
        }

        displayCurrentViewport();
      } catch {
        // Verification failed, still update display
        displayCurrentViewport();
      }
    }, 200);
  } catch {
    document.getElementById("currentSize").textContent =
      "Cannot resize on this page";
  }
}
