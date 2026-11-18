(function () {
  var d = document, r = d.documentElement;
  var $ = function (s) { return Array.prototype.slice.call(d.querySelectorAll(s)); };
  var calm = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* الثيم: نهاري / ليلي */
  var th = $("#th")[0];
  if (th) th.addEventListener("click", function () {
    var t = r.dataset.theme === "dark" ? "light" : "dark";
    r.dataset.theme = t;
    try { localStorage.t = t; } catch (e) {}
  });

  /* النافبار يتحول لزجاج بعد شوية سكرول */
  var nav = $("nav")[0];
  function sc() { if (nav) nav.classList.toggle("s", scrollY > 40); }
  var bar = $(".bar")[0], st = $("#story")[0], sg = $("#stage")[0], K = [[255,217,160,255,179,107],[191,230,255,255,233,184],[255,154,90,107,58,122],[14,26,58,29,47,94]];
  function story() {
    var b = st.getBoundingClientRect(), p = Math.min(1, Math.max(0, -b.top / (b.height - innerHeight)));
    var f = p * 3, i = Math.min(2, Math.floor(f)), t = f - i;
    var v = K[i].map(function (x, j) { return Math.round(x + (K[i + 1][j] - x) * t); });
    sg.style.setProperty("--a", "rgb(" + v[0] + "," + v[1] + "," + v[2] + ")");
    sg.style.setProperty("--b", "rgb(" + v[3] + "," + v[4] + "," + v[5] + ")");
    sg.style.setProperty("--x", 8 + 84 * p + "%");
    sg.style.setProperty("--y", 62 - Math.sin(Math.PI * p) * 50 + "%");
    sg.style.setProperty("--st", Math.max(0, (p - 0.6) * 2.5).toFixed(2));
    sg.dataset.ch = Math.min(3, Math.floor(p * 4));
    sg.classList.toggle("night", p > 0.7);
  }
  function tick() {
    sc();
    if (bar) bar.style.setProperty("--sp", scrollY / Math.max(1, d.body.scrollHeight - innerHeight));
    if (st && sg && b2(st)) story();
  }
  function b2(e) { var b = e.getBoundingClientRect(); return b.bottom > -50 && b.top < innerHeight + 50; }
  tick(); addEventListener("scroll", tick, { passive: true });
  /* لوجو الهيرو بيميل مع الماوس + شرارات ورا المؤشر */
  var hero = $(".hero")[0];
  if (hero && !calm) addEventListener("pointermove", function (e) {
    hero.style.setProperty("--tx", (e.clientX / innerWidth - 0.5) * 2);
    hero.style.setProperty("--ty", (e.clientY / innerHeight - 0.5) * 2);
  }, { passive: true });
  if (!calm && matchMedia("(hover: hover)").matches) addEventListener("pointermove", function (e) {
    if (Math.random() > 0.3) return;
    var s = d.createElement("b");
    s.className = "sp"; s.style.left = e.clientX + "px"; s.style.top = e.clientY + "px";
    d.body.appendChild(s); setTimeout(function () { s.remove(); }, 700);
  }, { passive: true });

  /* ظهور الأقسام مع السكرول */
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.15 });
    $(".rv").forEach(function (e) { io.observe(e); });
  } else $(".rv").forEach(function (e) { e.classList.add("in"); });

  /* العيون بتتابع الماوس أو الصباع */
  var eyes = $(".eye"), raf = 0, idle = 0, px = 0, py = 0;
  function look(x, y) {
    eyes.forEach(function (e) {
      var b = e.getBoundingClientRect();
      if (b.bottom < 0 || b.top > innerHeight) return;
      var cx = b.left + b.width / 2, cy = b.top + b.height / 2;
      var a = Math.atan2(y - cy, x - cx), m = Math.min(b.width * 0.2, Math.hypot(x - cx, y - cy) / 12);
      e.firstElementChild.style.transform = "translate(" + Math.cos(a) * m + "px," + Math.sin(a) * m + "px)";
    });
  }
  function wander() {
    look(innerWidth * Math.random(), innerHeight * Math.random());
    idle = setTimeout(wander, 1500 + Math.random() * 2000);
  }
  if (eyes.length && !calm) {
    var mv = function (e) {
      px = e.clientX; py = e.clientY;
      if (!raf) raf = requestAnimationFrame(function () { raf = 0; look(px, py); });
      clearTimeout(idle); idle = setTimeout(wander, 3000);
    };
    addEventListener("pointermove", mv, { passive: true });
    addEventListener("pointerdown", mv, { passive: true });
    idle = setTimeout(wander, 1200);
  }

  /* اختيار الخدمات */
  var bar = $("#pick")[0];
  function upd() {
    var s = $(".cat[aria-pressed=true]").map(function (c) { return c.dataset.n; });
    bar.classList.toggle("on", s.length > 0);
    bar.firstElementChild.textContent = s.length ? "جاهز تدوّر على: " + s.join("، ") : "اضغط على اللي محتاجه";
  }
  $(".cat").forEach(function (c) {
    c.addEventListener("click", function () {
      c.setAttribute("aria-pressed", c.getAttribute("aria-pressed") !== "true");
      upd();
    });
  });

  /* بقعة ضوء تتبع الماوس على كروت المميزات */
  $(".f").forEach(function (f) {
    f.addEventListener("pointermove", function (e) {
      var b = f.getBoundingClientRect();
      f.style.setProperty("--x", e.clientX - b.left + "px");
      f.style.setProperty("--y", e.clientY - b.top + "px");
    });
  });

  /* أزرار «نزّل التطبيق» بتتتبع أحدث إصدار على GitHub تلقائيًا:
     بنجيب أحدث Release وبنوجّه الزرار لملف الـ APK بتاعه على طول.
     لو الجلب فشل (نت واقع/حد GitHub) الزرار يفضل على صفحة الإصدارات زي ما هو. */
  var REL_PAGE = "https://github.com/mgnegypt/baladeno-releases/releases/latest";
  fetch("https://api.github.com/repos/mgnegypt/baladeno-releases/releases/latest", {
    headers: { "Accept": "application/vnd.github+json" }
  })
    .then(function (r) { if (!r.ok) throw new Error("gh"); return r.json(); })
    .then(function (rel) {
      var apk = (rel.assets || []).filter(function (a) { return /\.apk$/i.test(a.name); })[0];
      if (!apk) return;
      $('a[href="' + REL_PAGE + '"]').forEach(function (a) {
        a.href = apk.browser_download_url;
        a.title = "بلدينو " + (rel.tag_name || "") + " — نزّل أحدث إصدار";
      });
    })
    .catch(function () { /* يفضل الرابط على صفحة أحدث إصدار */ });
})();
