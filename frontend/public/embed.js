(function () {
  // Calex Embeddable Widget — inject on any website
  // Usage: paste into browser console, or load as bookmarklet
  // Configure: set CALEX_SLUG to your company slug

  var CALEX_SLUG = window.CALEX_SLUG || "browser-use";
  var CALEX_HOST = window.CALEX_HOST || "http://localhost:3000";

  // Don't inject twice
  if (document.getElementById("calex-widget-root")) return;

  // Create floating button
  var btn = document.createElement("div");
  btn.id = "calex-widget-btn";
  btn.innerHTML =
    '<svg width="24" height="24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
  btn.style.cssText =
    "position:fixed;bottom:24px;right:24px;z-index:999999;width:56px;height:56px;" +
    "border-radius:16px;cursor:pointer;display:flex;align-items:center;justify-content:center;" +
    "background:linear-gradient(135deg,#7c3aed,#9333ea);box-shadow:0 8px 32px rgba(124,58,237,0.4);" +
    "transition:transform 0.2s,box-shadow 0.2s;";
  btn.onmouseenter = function () {
    btn.style.transform = "scale(1.08)";
    btn.style.boxShadow = "0 12px 40px rgba(124,58,237,0.5)";
  };
  btn.onmouseleave = function () {
    btn.style.transform = "scale(1)";
    btn.style.boxShadow = "0 8px 32px rgba(124,58,237,0.4)";
  };

  // Create iframe container
  var root = document.createElement("div");
  root.id = "calex-widget-root";
  root.style.cssText =
    "position:fixed;bottom:92px;right:24px;z-index:999998;width:400px;height:600px;" +
    "border-radius:20px;overflow:hidden;display:none;" +
    "box-shadow:0 20px 60px rgba(0,0,0,0.5),0 0 0 1px rgba(255,255,255,0.08);" +
    "transition:opacity 0.25s,transform 0.25s;opacity:0;transform:translateY(12px) scale(0.96);";

  var iframe = document.createElement("iframe");
  iframe.src = CALEX_HOST + "/widget/" + CALEX_SLUG;
  iframe.style.cssText = "width:100%;height:100%;border:none;border-radius:20px;";
  iframe.allow = "microphone";
  root.appendChild(iframe);

  // Badge label
  var badge = document.createElement("div");
  badge.textContent = "Ask Calex AI";
  badge.style.cssText =
    "position:fixed;bottom:86px;right:32px;z-index:999997;background:#1a1a2e;" +
    "color:#a78bfa;font-size:11px;font-weight:600;padding:4px 10px;border-radius:8px;" +
    "box-shadow:0 4px 12px rgba(0,0,0,0.4);border:1px solid rgba(124,58,237,0.2);" +
    "pointer-events:none;opacity:0;transition:opacity 0.2s;font-family:system-ui,sans-serif;";
  btn.onmouseenter = function () {
    btn.style.transform = "scale(1.08)";
    badge.style.opacity = "1";
  };
  btn.onmouseleave = function () {
    btn.style.transform = "scale(1)";
    badge.style.opacity = "0";
  };

  var isOpen = false;
  btn.onclick = function () {
    isOpen = !isOpen;
    if (isOpen) {
      root.style.display = "block";
      setTimeout(function () {
        root.style.opacity = "1";
        root.style.transform = "translateY(0) scale(1)";
      }, 10);
      btn.innerHTML =
        '<svg width="20" height="20" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg>';
    } else {
      root.style.opacity = "0";
      root.style.transform = "translateY(12px) scale(0.96)";
      setTimeout(function () {
        root.style.display = "none";
      }, 250);
      btn.innerHTML =
        '<svg width="24" height="24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
    }
  };

  // ── Listen for navigation commands from the widget iframe ──
  window.addEventListener("message", function (event) {
    if (!event.data || event.data.source !== "calex-widget") return;

    if (event.data.type === "navigate") {
      var url = event.data.url;
      console.log(
        "%c🧭 Calex navigating to: " + url,
        "color:#a78bfa;font-weight:bold;"
      );

      // Show navigation overlay
      var overlay = document.getElementById("calex-nav-overlay");
      if (!overlay) {
        overlay = document.createElement("div");
        overlay.id = "calex-nav-overlay";
        overlay.style.cssText =
          "position:fixed;top:0;left:0;right:0;z-index:999990;padding:12px 24px;" +
          "background:linear-gradient(135deg,#7c3aed,#9333ea);" +
          "color:white;font-family:system-ui,sans-serif;font-size:13px;font-weight:600;" +
          "display:flex;align-items:center;gap:10px;" +
          "box-shadow:0 4px 20px rgba(124,58,237,0.4);transition:opacity 0.3s;";
        document.body.appendChild(overlay);
      }
      overlay.innerHTML =
        '<div style="width:8px;height:8px;border-radius:50%;background:#4ade80;animation:pulse 1s infinite"></div>' +
        '<span>Calex AI is navigating...</span>' +
        '<span style="opacity:0.7;font-weight:400;margin-left:auto;font-size:11px">' + url + '</span>';
      overlay.style.opacity = "1";

      // Navigate after a short delay so user sees the overlay
      setTimeout(function () {
        window.location.href = url;
      }, 800);
    }

    if (event.data.type === "highlight") {
      // Scroll to and highlight a section on the current page
      var selector = event.data.selector;
      var el = document.querySelector(selector);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.style.outline = "3px solid #7c3aed";
        el.style.outlineOffset = "4px";
        el.style.borderRadius = "8px";
        el.style.transition = "outline 0.3s, outline-offset 0.3s";
        setTimeout(function () {
          el.style.outline = "none";
        }, 4000);
      }
    }

    if (event.data.type === "scroll_to_text") {
      // Find and highlight text on the page
      var searchText = event.data.text;
      var walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        null,
        false
      );
      while (walker.nextNode()) {
        if (walker.currentNode.textContent.toLowerCase().includes(searchText.toLowerCase())) {
          var parent = walker.currentNode.parentElement;
          parent.scrollIntoView({ behavior: "smooth", block: "center" });
          var origBg = parent.style.backgroundColor;
          parent.style.backgroundColor = "rgba(124,58,237,0.2)";
          parent.style.borderRadius = "4px";
          parent.style.transition = "background-color 0.3s";
          setTimeout(function () {
            parent.style.backgroundColor = origBg;
          }, 4000);
          break;
        }
      }
    }
  });

  // Add pulse animation for the nav overlay
  var style = document.createElement("style");
  style.textContent = "@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}";
  document.head.appendChild(style);

  document.body.appendChild(root);
  document.body.appendChild(badge);
  document.body.appendChild(btn);

  console.log(
    "%c✨ Calex AI widget injected! Click the purple button to chat.",
    "color:#a78bfa;font-weight:bold;font-size:14px;"
  );
})();
