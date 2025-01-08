// console.log('Background script started');

// chrome.webRequest.onBeforeRequest.addListener(
//   function(details) {
//     console.log('Capturing url:', details.url);
//     // 发送消息给 content.js
//     sendMessage(details.url);

//     if (details.url.includes('https://sk.gdwater.gov.cn:8000/api/magic/composite/pressure-list')) {
//       const url = new URL(details.url);
//       const queryParams = new URLSearchParams(url.search);
//       const capturedParams = queryParams.toString();
//       console.log('Captured query parameters:', capturedParams);

//       // 发送消息给 content.js
//       sendMessage(capturedParams);
//     }
//   },
//   { urls: ["https://sk.gdwater.gov.cn:8000/api/*", "<all_urls>"] }
// );

// function sendMessage(params) {
//   chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
//     if (chrome.runtime.lastError) {
//       console.error(chrome.runtime.lastError);
//       return;
//     }
//     chrome.tabs.sendMessage(tabs[0].id, { params }, function(response) {
//       if (chrome.runtime.lastError) {
//         console.error(chrome.runtime.lastError);
//       } else {
//         console.log('Message sent successfully:', response);
//       }
//     });
//   });
// }