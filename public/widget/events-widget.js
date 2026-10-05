/**
 * Portovenere Experiences — Events widget (embeddable, vanilla JS).
 *
 * Usage on a WordPress page/post (HTML block):
 *
 *   <div data-portovenere-events data-limit="10"></div>
 *   <script src="https://experiences.portovenere.com/widget/events-widget.js" defer></script>
 *
 * Optional attributes on the container div:
 *   data-api    — override the feed URL (default: same origin as this script, /api/events/feed)
 *   data-limit  — max number of events to show (default: 20, capped at 50 server-side)
 *
 * Read-only: fetches /api/events/feed (CORS-open, no auth) and renders
 * a carousel — 3 cards visible at a time on desktop (2 on tablet, ~1
 * on mobile), with left/right arrow buttons that page through the
 * rest. Native touch/trackpad swipe still works (scroll-snap), the
 * arrows are just an explicit, discoverable alternative — a desktop
 * visitor with a plain mouse has no obvious way to swipe. Each card
 * links out (no booking flow, no cross-site API calls beyond this one
 * GET). Self-contained styles (scoped via the pv-events- prefix) so
 * it doesn't depend on — or clash with — the host site's theme CSS.
 */
(function () {

  var SCRIPT_SRC = (function () {
    var current = document.currentScript;
    return current ? current.src : "";
  })();

  var DEFAULT_API_ORIGIN = (function () {
    try {
      return new URL(SCRIPT_SRC).origin;
    } catch (e) {
      return "https://experiences.portovenere.com";
    }
  })();

  var STYLE_ID = "pv-events-widget-style";

  function injectStyles() {

    if (document.getElementById(STYLE_ID)) return;

    var style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = [
      ".pv-events-widget{position:relative;}",
      ".pv-events-viewport{overflow-x:auto;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;scrollbar-width:none;-ms-overflow-style:none;}",
      ".pv-events-viewport::-webkit-scrollbar{display:none;}",
      ".pv-events-row{display:flex;gap:16px;padding:4px 2px 4px;}",
      ".pv-events-card{flex:0 0 calc((100% - 32px)/3);min-width:0;scroll-snap-align:start;border-radius:20px;overflow:hidden;background:#0a0a0a;color:#fff;text-decoration:none;display:block;box-shadow:0 2px 12px rgba(0,0,0,0.15);transition:transform .3s ease;}",
      "@media (max-width:900px){.pv-events-card{flex-basis:calc((100% - 16px)/2);}}",
      "@media (max-width:560px){.pv-events-card{flex-basis:88%;}}",
      ".pv-events-card:hover{transform:translateY(-4px);}",
      ".pv-events-card-image{width:100%;height:150px;object-fit:cover;display:block;background:#1a1a1a;}",
      ".pv-events-card-body{padding:16px;}",
      // color qui e' esplicito con !important: il tema WordPress che
      // ospita il widget definisce spesso le sue regole per h3/p
      // dentro al contenuto (es. .entry-content h3{color:...}) con
      // specificita' piu' alta del solo nome-classe — senza
      // !important il titolo puo' finire scuro su scuro e sparire,
      // esattamente il bug osservato in produzione.
      ".pv-events-card-date{font-size:11px;letter-spacing:.15em;text-transform:uppercase;color:#b8a888!important;margin:0 0 8px;}",
      ".pv-events-card-title{font-size:17px;font-weight:500;margin:0 0 6px;line-height:1.25;color:#fff!important;}",
      ".pv-events-card-desc{font-size:13px;color:rgba(255,255,255,0.6)!important;margin:0 0 14px;line-height:1.4;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}",
      ".pv-events-card-cta{font-size:11px;letter-spacing:.15em;text-transform:uppercase;color:#fff!important;opacity:.85;}",
      ".pv-events-empty{color:#888;font-size:14px;padding:8px 2px;}",
      ".pv-events-arrow{position:absolute;top:calc(50% - 20px);width:36px;height:36px;border-radius:50%;background:rgba(0,0,0,0.65);border:1px solid rgba(255,255,255,0.25);color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:18px;line-height:1;z-index:2;transition:opacity .2s,background .2s;padding:0;}",
      ".pv-events-arrow:hover{background:rgba(0,0,0,0.9);}",
      ".pv-events-arrow:disabled{opacity:0;pointer-events:none;}",
      ".pv-events-arrow-prev{left:4px;}",
      ".pv-events-arrow-next{right:4px;}"
    ].join("");

    document.head.appendChild(style);
  }

  function formatDate(iso) {
    try {
      var d = new Date(iso + "T00:00:00");
      return d.toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
    } catch (e) {
      return iso;
    }
  }

  function renderCard(event) {

    var a = document.createElement("a");
    a.className = "pv-events-card";
    a.href = event.link;
    a.target = "_blank";
    a.rel = "noopener noreferrer";

    var html = "";

    if (event.image_url) {
      html += '<img class="pv-events-card-image" src="' + escapeHtml(event.image_url) + '" alt="" loading="lazy">';
    }

    html += '<div class="pv-events-card-body">';
    html += '<p class="pv-events-card-date">' + escapeHtml(formatDate(event.date)) + '</p>';
    html += '<h3 class="pv-events-card-title">' + escapeHtml(event.title) + '</h3>';

    if (event.description) {
      html += '<p class="pv-events-card-desc">' + escapeHtml(event.description) + '</p>';
    }

    html += '<span class="pv-events-card-cta">Details &rarr;</span>';

    html += '</div>';

    a.innerHTML = html;

    return a;
  }

  function escapeHtml(str) {
    var div = document.createElement("div");
    div.textContent = String(str == null ? "" : str);
    return div.innerHTML;
  }

  function createArrow(direction) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "pv-events-arrow pv-events-arrow-" + direction;
    btn.setAttribute("aria-label", direction === "prev" ? "Previous events" : "Next events");
    btn.textContent = direction === "prev" ? "‹" : "›";
    return btn;
  }

  function mount(container) {

    var apiBase = container.getAttribute("data-api") || (DEFAULT_API_ORIGIN + "/api/events/feed");
    var limit = container.getAttribute("data-limit") || "20";

    var url = apiBase + (apiBase.indexOf("?") === -1 ? "?" : "&") + "limit=" + encodeURIComponent(limit);

    fetch(url)
      .then(function (res) { return res.json(); })
      .then(function (data) {

        if (!data || !data.success || !Array.isArray(data.events) || data.events.length === 0) {
          container.innerHTML = '<p class="pv-events-empty">No upcoming events right now.</p>';
          return;
        }

        var widget = document.createElement("div");
        widget.className = "pv-events-widget";

        var viewport = document.createElement("div");
        viewport.className = "pv-events-viewport";

        var row = document.createElement("div");
        row.className = "pv-events-row";

        data.events.forEach(function (event) {
          row.appendChild(renderCard(event));
        });

        viewport.appendChild(row);

        var prevBtn = createArrow("prev");
        var nextBtn = createArrow("next");

        widget.appendChild(viewport);
        widget.appendChild(prevBtn);
        widget.appendChild(nextBtn);

        container.innerHTML = "";
        container.appendChild(widget);

        function scrollByPage(direction) {
          viewport.scrollBy({ left: direction * viewport.clientWidth, behavior: "smooth" });
        }

        function updateArrows() {
          var maxScroll = viewport.scrollWidth - viewport.clientWidth;
          prevBtn.disabled = viewport.scrollLeft <= 4;
          nextBtn.disabled = maxScroll <= 4 || viewport.scrollLeft >= maxScroll - 4;
        }

        prevBtn.addEventListener("click", function () { scrollByPage(-1); });
        nextBtn.addEventListener("click", function () { scrollByPage(1); });

        viewport.addEventListener("scroll", updateArrows);
        window.addEventListener("resize", updateArrows);

        updateArrows();
      })
      .catch(function () {
        // Fallisce in silenzio sul sito esterno — un widget rotto non
        // deve mai far sembrare rotta l'intera pagina WordPress che lo
        // ospita.
        container.innerHTML = "";
      });
  }

  function init() {

    injectStyles();

    var containers = document.querySelectorAll("[data-portovenere-events]");

    for (var i = 0; i < containers.length; i++) {
      mount(containers[i]);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();
