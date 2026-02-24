// This helper file injects the local bot script into any page.
// Use it during development when you want to test the popup quickly.
(function () {
  // Create a script tag that points to the local bot backend.
  var botScript = document.createElement("script");
  botScript.src = "http://localhost:3000/script.js";
  // Append it to <head> so the bot starts immediately.
  document.head.appendChild(botScript);
})();
