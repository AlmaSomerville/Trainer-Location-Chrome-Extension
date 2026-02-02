function findZip() {
  const span = document.querySelector('span[class*="DealTicketEditableTitle"]');
  if (span) {
    const match = span.textContent.match(/\b\d{5}\b/);
    if (match) {
      const zip = match[0];
      if (!zip.startsWith('19') && !zip.startsWith('20') && zip !== '00000') {
        return zip;
      }
    }
  }

  // 2. Fallback
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const text = [];
  let node;
  while ((node = walker.nextNode())) {
    text.push(node.textContent);
  }
  const matches = text.join(' ').match(/\b\d{5}\b/g) || [];
  const valid = matches.filter(z => !z.startsWith('19') && !z.startsWith('20') && z !== '00000');
  return valid[0] || null;
}

// Send ZIP
let lastZip = null;
function sendZip() {
  const zip = findZip();
  if (zip && zip !== lastZip) {
    lastZip = zip;
    console.log('Dogwise: Sending ZIP →', zip);
    chrome.runtime.sendMessage({ type: 'ZIP_FOUND', zip });
  }
}

// Run on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', sendZip);
} else {
  sendZip();
}

// DOM UPDATES
const observer = new MutationObserver(sendZip);
observer.observe(document.body, { childList: true, subtree: true, characterData: true });

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'GET_ZIP') {
    const zip = findZip();
    console.log('Popup asked for ZIP →', zip);
    sendResponse({ zip });
    return true;
  }
});
