/* Ascendify Community — full-stack (API-backed) */

const API_BASE = ""; // same-origin

function nowIso() {
  return new Date().toISOString();
}

function fmtDate(iso) {
  try {
    return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return iso;
  }
}

function safeUrl(url) {
  if (!url) return "";
  const trimmed = url.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return "";
}

function toast(message) {
  const el = document.getElementById("toast");
  if (!el) return;
  el.textContent = message;
  el.classList.add("is-open");
  window.clearTimeout(toast._t);
  toast._t = window.setTimeout(() => el.classList.remove("is-open"), 2200);
}

function $(sel, root = document) {
  return root.querySelector(sel);
}
function $all(sel, root = document) {
  return Array.from(root.querySelectorAll(sel));
}

function escapeHtml(str) {
  return (str ?? "")
    .toString()
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function api(path, opts = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...(opts.headers || {}) },
    ...opts,
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${txt || res.statusText}`);
  }
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return res.json();
  return res.text();
}

// Routing

function setRoute(route) {
  $all(".route").forEach((r) => r.classList.toggle("is-active", r.dataset.route === route));
  if (location.hash !== `#${route}`) history.replaceState(null, "", `#${route}`);
  renderAll();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function getRouteFromHash() {
  const h = (location.hash || "").replace("#", "").trim();
  const routes = new Set(["home", "forums", "showcase", "recruitment", "guidelines"]);
  return routes.has(h) ? h : "home";
}

function wireRouting() {
  $all("[data-route-link]").forEach((btn) =>
    btn.addEventListener("click", () => setRoute(btn.dataset.routeLink))
  );
  window.addEventListener("hashchange", () => setRoute(getRouteFromHash()));
}

// Modals

function openModal(name) {
  const backdrop = document.querySelector(`.modal-backdrop[data-modal="${name}"]`);
  if (!backdrop) return;
  backdrop.classList.add("is-open");
  backdrop.setAttribute("aria-hidden", "false");
  const first = backdrop.querySelector("input, textarea, select, button");
  if (first) first.focus();
}

function closeModal(backdrop) {
  backdrop.classList.remove("is-open");
  backdrop.setAttribute("aria-hidden", "true");
}

function closeAllModals() {
  $all(".modal-backdrop.is-open").forEach((b) => closeModal(b));
}

function wireModals() {
  $all("[data-open]").forEach((btn) => btn.addEventListener("click", () => openModal(btn.dataset.open)));
  $all(".modal-backdrop").forEach((backdrop) => {
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) closeModal(backdrop);
    });
    $all("[data-close]", backdrop).forEach((btn) => btn.addEventListener("click", () => closeModal(backdrop)));
  });
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    const open = document.querySelector(".modal-backdrop.is-open");
    if (open) closeModal(open);
  });
}

// Filters/Search

function normalize(str) {
  return (str || "").toString().toLowerCase();
}
function includesQuery(haystack, q) {
  if (!q) return true;
  return normalize(haystack).includes(normalize(q));
}
function setEmptyState(containerId, emptyId, hasItems) {
  const empty = document.getElementById(emptyId);
  if (!empty) return;
  empty.style.display = hasItems ? "none" : "block";
}

function wireSearches() {
  const rerender = () => renderAll();
  ["forumsCategory", "forumsSearch", "projectsSearch", "rolesSearch"].forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("input", rerender);
    el.addEventListener("change", rerender);
  });
}

function wireHeroFilters() {
  const q = document.getElementById("q");
  const area = document.getElementById("area");
  const category = document.getElementById("category");
  const clear = document.getElementById("clearFilters");
  const view = document.getElementById("viewResults");

  clear?.addEventListener("click", () => {
    if (q) q.value = "";
    if (area) area.value = "all";
    if (category) category.value = "all";
    toast("Cleared filters");
  });

  view?.addEventListener("click", () => {
    const a = (area?.value || "all").trim();
    const text = (q?.value || "").trim();
    const cat = (category?.value || "all").trim();

    if (a === "forums") {
      setRoute("forums");
      const fCat = document.getElementById("forumsCategory");
      const fQ = document.getElementById("forumsSearch");
      if (fCat && cat !== "all") fCat.value = cat;
      if (fQ) fQ.value = text;
      renderForums();
      return;
    }

    if (a === "showcase") {
      setRoute("showcase");
      const pQ = document.getElementById("projectsSearch");
      if (pQ) pQ.value = text;
      renderProjects();
      return;
    }

    if (a === "recruitment") {
      setRoute("recruitment");
      const rQ = document.getElementById("rolesSearch");
      if (rQ) rQ.value = text;
      renderRoles();
      return;
    }

    setRoute("forums");
    const fCat = document.getElementById("forumsCategory");
    const fQ = document.getElementById("forumsSearch");
    if (fCat && cat !== "all") fCat.value = cat;
    if (fQ) fQ.value = text;
    renderForums();
  });
}

// Data + Rendering

let cache = { posts: [], projects: [], roles: [] };

async function refreshAll() {
  const [posts, projects, roles] = await Promise.all([
    api("/api/posts"),
    api("/api/projects"),
    api("/api/roles"),
  ]);
  cache = { posts, projects, roles };
}

function renderStats() {
  const posts = document.querySelector('[data-stat="posts"]');
  const projects = document.querySelector('[data-stat="projects"]');
  const roles = document.querySelector('[data-stat="roles"]');
  if (posts) posts.textContent = String(cache.posts.length);
  if (projects) posts && (projects.textContent = String(cache.projects.length));
  if (roles) roles.textContent = String(cache.roles.length);
}

function renderForums() {
  const list = document.getElementById("forumsList");
  if (!list) return;

  const category = ($("#forumsCategory")?.value || "all").trim();
  const q = ($("#forumsSearch")?.value || "").trim();

  const items = [...cache.posts]
    .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""))
    .filter((p) => (category === "all" ? true : p.category === category))
    .filter((p) => includesQuery(`${p.title}\n${p.body}\n${p.category}`, q));

  list.innerHTML = items
    .map((p) => {
      const v = p.votes ?? 0;
      return `
        <article class="post" data-id="${p.id}">
          <div class="post-head">
            <div>
              <h3 class="post-title">${escapeHtml(p.title)}</h3>
              <div class="post-meta">
                <span class="badge">${escapeHtml(p.category)}</span>
                <span>•</span>
                <span>${fmtDate(p.createdAt)}</span>
              </div>
            </div>
            <div class="badge">▲ ${v}</div>
          </div>
          <p class="post-body">${escapeHtml(p.body)}</p>
          <div class="post-actions">
            <button class="pill" type="button" data-action="upvote">Upvote</button>
            <button class="pill" type="button" data-action="copy">Copy link</button>
            <button class="pill" type="button" data-action="delete">Delete</button>
          </div>
        </article>
      `;
    })
    .join("");

  setEmptyState("forumsList", "forumsEmpty", items.length > 0);
}

function renderProjects() {
  const list = document.getElementById("projectsList");
  if (!list) return;
  const q = ($("#projectsSearch")?.value || "").trim();

  const items = [...cache.projects]
    .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""))
    .filter((p) => includesQuery(`${p.title}\n${p.description}\n${p.tech}`, q));

  list.innerHTML = items
    .map((p) => {
      const github = safeUrl(p.github);
      const demo = safeUrl(p.demo);
      return `
        <article class="card" data-id="${p.id}">
          <div>
            <h3 class="card-title">${escapeHtml(p.title)}</h3>
            <div class="card-meta">
              <span>${fmtDate(p.createdAt)}</span>
              ${p.tech ? `<span>•</span><span>${escapeHtml(p.tech)}</span>` : ""}
            </div>
          </div>
          <p class="card-desc">${escapeHtml(p.description)}</p>
          <div class="card-links">
            ${github ? `<a class="link-pill" href="${github}" target="_blank" rel="noreferrer">GitHub</a>` : ""}
            ${demo ? `<a class="link-pill" href="${demo}" target="_blank" rel="noreferrer">Live demo</a>` : ""}
            <button class="link-pill" type="button" data-action="delete">Delete</button>
          </div>
        </article>
      `;
    })
    .join("");

  setEmptyState("projectsList", "projectsEmpty", items.length > 0);
}

function renderRoles() {
  const list = document.getElementById("rolesList");
  if (!list) return;
  const q = ($("#rolesSearch")?.value || "").trim();

  const items = [...cache.roles]
    .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""))
    .filter((r) => includesQuery(`${r.role}\n${r.project}\n${r.skills}\n${r.duration}\n${r.contact}\n${r.notes}`, q));

  list.innerHTML = items
    .map((r) => {
      return `
        <article class="card" data-id="${r.id}">
          <div>
            <h3 class="card-title">${escapeHtml(r.role)}</h3>
            <div class="card-meta">
              <span>${escapeHtml(r.project)}</span>
              ${r.duration ? `<span>•</span><span>${escapeHtml(r.duration)}</span>` : ""}
            </div>
          </div>
          <p class="card-desc">${escapeHtml(r.skills || "")}</p>
          ${r.notes ? `<div class="muted" style="font-size:13px">${escapeHtml(r.notes)}</div>` : ""}
          <div class="card-links">
            <button class="link-pill" type="button" data-action="copyContact">Copy contact</button>
            <button class="link-pill" type="button" data-action="delete">Delete</button>
          </div>
          <div class="card-meta" style="margin-top:4px">
            <span>Posted ${fmtDate(r.createdAt)}</span>
          </div>
          <div class="muted" style="font-size:12px; margin-top:-4px">Contact: ${escapeHtml(r.contact)}</div>
        </article>
      `;
    })
    .join("");

  setEmptyState("rolesList", "rolesEmpty", items.length > 0);
}

async function renderAll() {
  try {
    await refreshAll();
  } catch (e) {
    console.error(e);
    toast("Backend not running. Start the server to load data.");
    cache = { posts: [], projects: [], roles: [] };
  }

  renderStats();
  const route = getRouteFromHash();
  if (route === "forums") renderForums();
  if (route === "showcase") renderProjects();
  if (route === "recruitment") renderRoles();
}

// Forms + Actions

function wireForms() {
  const postForm = document.getElementById("createPostForm");
  const projForm = document.getElementById("addProjectForm");
  const roleForm = document.getElementById("postRoleForm");

  postForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = new FormData(postForm);
    const title = (data.get("title") || "").toString().trim();
    const category = (data.get("category") || "").toString().trim();
    const body = (data.get("body") || "").toString().trim();
    if (!title || !category || !body) return;

    await api("/api/posts", {
      method: "POST",
      body: JSON.stringify({ title, category, body, createdAt: nowIso() }),
    });

    postForm.reset();
    closeAllModals();
    toast("Post published");
    setRoute("forums");
  });

  projForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = new FormData(projForm);
    const title = (data.get("title") || "").toString().trim();
    const description = (data.get("description") || "").toString().trim();
    const tech = (data.get("tech") || "").toString().trim();
    const github = (data.get("github") || "").toString().trim();
    const demo = (data.get("demo") || "").toString().trim();
    if (!title || !description) return;

    await api("/api/projects", {
      method: "POST",
      body: JSON.stringify({ title, description, tech, github, demo, createdAt: nowIso() }),
    });

    projForm.reset();
    closeAllModals();
    toast("Project added");
    setRoute("showcase");
  });

  roleForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = new FormData(roleForm);
    const role = (data.get("role") || "").toString().trim();
    const duration = (data.get("duration") || "").toString().trim();
    const project = (data.get("project") || "").toString().trim();
    const skills = (data.get("skills") || "").toString().trim();
    const contact = (data.get("contact") || "").toString().trim();
    const notes = (data.get("notes") || "").toString().trim();
    if (!role || !project || !contact) return;

    await api("/api/roles", {
      method: "POST",
      body: JSON.stringify({ role, duration, project, skills, contact, notes, createdAt: nowIso() }),
    });

    roleForm.reset();
    closeAllModals();
    toast("Role posted");
    setRoute("recruitment");
  });
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
  }
}

function wireListActions() {
  document.addEventListener("click", async (e) => {
    const btn = e.target.closest("[data-action]");
    if (!btn) return;
    const action = btn.dataset.action;

    const post = btn.closest(".post");
    const card = btn.closest(".card");

    if (post) {
      const id = post.dataset.id;
      if (!id) return;

      if (action === "upvote") {
        await api(`/api/posts/${encodeURIComponent(id)}/upvote`, { method: "POST" });
        await renderAll();
        toast("Upvoted");
        return;
      }

      if (action === "copy") {
        const link = `${location.origin}${location.pathname}#forums`;
        await copyText(`${link} (post id: ${id})`);
        toast("Copied link");
        return;
      }

      if (action === "delete") {
        await api(`/api/posts/${encodeURIComponent(id)}`, { method: "DELETE" });
        await renderAll();
        toast("Deleted post");
        return;
      }
    }

    if (card) {
      const id = card.dataset.id;
      if (!id) return;
      const route = getRouteFromHash();

      if (action === "delete") {
        if (route === "showcase") await api(`/api/projects/${encodeURIComponent(id)}`, { method: "DELETE" });
        if (route === "recruitment") await api(`/api/roles/${encodeURIComponent(id)}`, { method: "DELETE" });
        await renderAll();
        toast("Deleted");
        return;
      }

      if (action === "copyContact") {
        const role = cache.roles.find((r) => r.id === id);
        if (!role) return;
        await copyText(role.contact);
        toast("Copied contact");
      }
    }
  });
}

function init() {
  document.getElementById("year").textContent = String(new Date().getFullYear());

  wireRouting();
  wireModals();
  wireForms();
  wireSearches();
  wireListActions();
  wireHeroFilters();

  setRoute(getRouteFromHash());
  renderAll();
}

document.addEventListener("DOMContentLoaded", init);

