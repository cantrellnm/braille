"use strict";

function translateTab() {
  chrome.storage.local.set({brailleTranslate: true}).then(() => {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      chrome.tabs.reload(tabs[0].id);
    });
  })
}

document.getElementById('translate').addEventListener('click', translateTab);

chrome.storage.sync.get(['brailleOriginal', 'brailleContractedSingle', 'brailleContractedMultiple'], (res) => {
  document.querySelector(`input[name="original"][value="${res.brailleOriginal || 'none'}"]`).checked = true;
  document.getElementById('contractedSingle').checked = res.brailleContractedSingle;
  document.getElementById('contractedMultiple').checked = res.brailleContractedMultiple;
  
  [...document.querySelectorAll('input[name="original"]')].forEach(input => {
    input.addEventListener('change', (e) => {
      chrome.storage.sync.set({brailleOriginal: e.target.value});
    });
  });
  document.getElementById('contractedSingle').addEventListener('change', (e) => {
    chrome.storage.sync.set({brailleContractedSingle: e.target.checked});
  });
  document.getElementById('contractedMultiple').addEventListener('change', (e) => {
    chrome.storage.sync.set({brailleContractedMultiple: e.target.checked});
  });
});