"""
Ascendify Community — Python backend (no external deps)

Runs a local web server that:
- Serves static files from the project folder (community.html, styles.css, etc.)
- Provides a small JSON API backed by SQLite at /api/*

Start:
  py server.py
Then open:
  http://localhost:5174/community.html
"""

from __future__ import annotations

import json
import os
import re
import sqlite3
import threading
from datetime import datetime, timezone
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlparse

ROOT = Path(__file__).resolve().parent
DATA_DIR = ROOT / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)
DB_FILE = Path(os.environ.get("DB_FILE", str(DATA_DIR / "community.db")))
PORT = int(os.environ.get("PORT", "5174"))


def now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


_db_lock = threading.Lock()


def db_connect() -> sqlite3.Connection:
    con = sqlite3.connect(DB_FILE)
    con.row_factory = sqlite3.Row
    return con


def db_init() -> None:
    with _db_lock:
        con = db_connect()
        try:
            # WAL can fail in some Windows environments (locks/AV/sandboxing).
            # The default journal mode is more compatible for simple demos.
            con.executescript(
                """
                CREATE TABLE IF NOT EXISTS posts (
                  id TEXT PRIMARY KEY,
                  title TEXT NOT NULL,
                  category TEXT NOT NULL,
                  body TEXT NOT NULL,
                  createdAt TEXT NOT NULL,
                  votes INTEGER NOT NULL DEFAULT 0
                );

                CREATE TABLE IF NOT EXISTS projects (
                  id TEXT PRIMARY KEY,
                  title TEXT NOT NULL,
                  description TEXT NOT NULL,
                  tech TEXT NOT NULL DEFAULT "",
                  github TEXT NOT NULL DEFAULT "",
                  demo TEXT NOT NULL DEFAULT "",
                  createdAt TEXT NOT NULL
                );

                CREATE TABLE IF NOT EXISTS roles (
                  id TEXT PRIMARY KEY,
                  role TEXT NOT NULL,
                  duration TEXT NOT NULL DEFAULT "",
                  project TEXT NOT NULL,
                  skills TEXT NOT NULL DEFAULT "",
                  contact TEXT NOT NULL,
                  notes TEXT NOT NULL DEFAULT "",
                  createdAt TEXT NOT NULL
                );
                """
            )
            con.commit()
        finally:
            con.close()


def as_str(v) -> str:
    return "" if v is None else str(v)


def require_non_empty(v, name: str) -> str:
    s = as_str(v).strip()
    if not s:
        raise ValueError(f"{name} is required")
    return s


def uid() -> str:
    # simple, good-enough ID for demo purposes
    return f"{int(datetime.now().timestamp() * 1000)}-{os.urandom(6).hex()}"


API_POSTS_RE = re.compile(r"^/api/posts/?$")
API_POST_BY_ID_RE = re.compile(r"^/api/posts/([^/]+)/?$")
API_POST_UPVOTE_RE = re.compile(r"^/api/posts/([^/]+)/upvote/?$")

API_PROJECTS_RE = re.compile(r"^/api/projects/?$")
API_PROJECT_BY_ID_RE = re.compile(r"^/api/projects/([^/]+)/?$")

API_ROLES_RE = re.compile(r"^/api/roles/?$")
API_ROLE_BY_ID_RE = re.compile(r"^/api/roles/([^/]+)/?$")


class Handler(BaseHTTPRequestHandler):
    server_version = "AscendifyCommunityPython/1.0"

    def _send_json(self, status: int, payload) -> None:
        data = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def _send_text(self, status: int, text: str) -> None:
        data = text.encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "text/plain; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def _read_json(self):
        length = int(self.headers.get("Content-Length", "0") or "0")
        if length <= 0:
            return {}
        raw = self.rfile.read(length)
        try:
            return json.loads(raw.decode("utf-8"))
        except Exception:
            raise ValueError("Invalid JSON body")

    def _serve_static(self) -> None:
        parsed = urlparse(self.path)
        req_path = unquote(parsed.path)
        if req_path == "/":
            req_path = "/community.html"

        # prevent path traversal
        candidate = (ROOT / req_path.lstrip("/")).resolve()
        if not str(candidate).startswith(str(ROOT)):
            self._send_text(HTTPStatus.FORBIDDEN, "Forbidden")
            return

        if not candidate.exists() or not candidate.is_file():
            self._send_text(HTTPStatus.NOT_FOUND, "Not found")
            return

        # basic content types
        ext = candidate.suffix.lower()
        ctype = "application/octet-stream"
        if ext in [".html"]:
            ctype = "text/html; charset=utf-8"
        elif ext in [".css"]:
            ctype = "text/css; charset=utf-8"
        elif ext in [".js"]:
            ctype = "application/javascript; charset=utf-8"
        elif ext in [".png"]:
            ctype = "image/png"
        elif ext in [".jpg", ".jpeg"]:
            ctype = "image/jpeg"
        elif ext in [".svg"]:
            ctype = "image/svg+xml"
        elif ext in [".webp"]:
            ctype = "image/webp"

        data = candidate.read_bytes()
        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def do_GET(self) -> None:
        p = urlparse(self.path).path

        if API_POSTS_RE.match(p):
            with _db_lock:
                con = db_connect()
                try:
                    rows = con.execute(
                        "SELECT id, title, category, body, createdAt, votes FROM posts ORDER BY createdAt DESC"
                    ).fetchall()
                    self._send_json(HTTPStatus.OK, [dict(r) for r in rows])
                finally:
                    con.close()
            return

        if API_PROJECTS_RE.match(p):
            with _db_lock:
                con = db_connect()
                try:
                    rows = con.execute(
                        "SELECT id, title, description, tech, github, demo, createdAt FROM projects ORDER BY createdAt DESC"
                    ).fetchall()
                    self._send_json(HTTPStatus.OK, [dict(r) for r in rows])
                finally:
                    con.close()
            return

        if API_ROLES_RE.match(p):
            with _db_lock:
                con = db_connect()
                try:
                    rows = con.execute(
                        "SELECT id, role, duration, project, skills, contact, notes, createdAt FROM roles ORDER BY createdAt DESC"
                    ).fetchall()
                    self._send_json(HTTPStatus.OK, [dict(r) for r in rows])
                finally:
                    con.close()
            return

        # not an API route -> static
        self._serve_static()

    def do_POST(self) -> None:
        p = urlparse(self.path).path

        try:
            body = self._read_json()
        except ValueError as e:
            self._send_text(HTTPStatus.BAD_REQUEST, str(e))
            return

        if API_POSTS_RE.match(p):
            try:
                title = require_non_empty(body.get("title"), "title")
                category = require_non_empty(body.get("category"), "category")
                post_body = require_non_empty(body.get("body"), "body")
                created_at = as_str(body.get("createdAt")).strip() or now_iso()
            except ValueError as e:
                self._send_text(HTTPStatus.BAD_REQUEST, str(e))
                return

            post_id = uid()
            with _db_lock:
                con = db_connect()
                try:
                    con.execute(
                        "INSERT INTO posts (id, title, category, body, createdAt, votes) VALUES (?, ?, ?, ?, ?, 0)",
                        (post_id, title, category, post_body, created_at),
                    )
                    con.commit()
                finally:
                    con.close()
            self._send_json(
                HTTPStatus.CREATED,
                {"id": post_id, "title": title, "category": category, "body": post_body, "createdAt": created_at, "votes": 0},
            )
            return

        m = API_POST_UPVOTE_RE.match(p)
        if m:
            post_id = m.group(1)
            with _db_lock:
                con = db_connect()
                try:
                    cur = con.execute("UPDATE posts SET votes = votes + 1 WHERE id = ?", (post_id,))
                    if cur.rowcount == 0:
                        self._send_text(HTTPStatus.NOT_FOUND, "Not found")
                        return
                    row = con.execute(
                        "SELECT id, title, category, body, createdAt, votes FROM posts WHERE id = ?",
                        (post_id,),
                    ).fetchone()
                    con.commit()
                finally:
                    con.close()
            self._send_json(HTTPStatus.OK, dict(row))
            return

        if API_PROJECTS_RE.match(p):
            try:
                title = require_non_empty(body.get("title"), "title")
                description = require_non_empty(body.get("description"), "description")
                tech = as_str(body.get("tech")).strip()
                github = as_str(body.get("github")).strip()
                demo = as_str(body.get("demo")).strip()
                created_at = as_str(body.get("createdAt")).strip() or now_iso()
            except ValueError as e:
                self._send_text(HTTPStatus.BAD_REQUEST, str(e))
                return

            project_id = uid()
            with _db_lock:
                con = db_connect()
                try:
                    con.execute(
                        "INSERT INTO projects (id, title, description, tech, github, demo, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)",
                        (project_id, title, description, tech, github, demo, created_at),
                    )
                    con.commit()
                finally:
                    con.close()
            self._send_json(
                HTTPStatus.CREATED,
                {
                    "id": project_id,
                    "title": title,
                    "description": description,
                    "tech": tech,
                    "github": github,
                    "demo": demo,
                    "createdAt": created_at,
                },
            )
            return

        if API_ROLES_RE.match(p):
            try:
                role = require_non_empty(body.get("role"), "role")
                project = require_non_empty(body.get("project"), "project")
                contact = require_non_empty(body.get("contact"), "contact")
                duration = as_str(body.get("duration")).strip()
                skills = as_str(body.get("skills")).strip()
                notes = as_str(body.get("notes")).strip()
                created_at = as_str(body.get("createdAt")).strip() or now_iso()
            except ValueError as e:
                self._send_text(HTTPStatus.BAD_REQUEST, str(e))
                return

            role_id = uid()
            with _db_lock:
                con = db_connect()
                try:
                    con.execute(
                        "INSERT INTO roles (id, role, duration, project, skills, contact, notes, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                        (role_id, role, duration, project, skills, contact, notes, created_at),
                    )
                    con.commit()
                finally:
                    con.close()
            self._send_json(
                HTTPStatus.CREATED,
                {
                    "id": role_id,
                    "role": role,
                    "duration": duration,
                    "project": project,
                    "skills": skills,
                    "contact": contact,
                    "notes": notes,
                    "createdAt": created_at,
                },
            )
            return

        self._send_text(HTTPStatus.NOT_FOUND, "Not found")

    def do_DELETE(self) -> None:
        p = urlparse(self.path).path

        m = API_POST_BY_ID_RE.match(p)
        if m:
            post_id = m.group(1)
            with _db_lock:
                con = db_connect()
                try:
                    cur = con.execute("DELETE FROM posts WHERE id = ?", (post_id,))
                    con.commit()
                    if cur.rowcount == 0:
                        self._send_text(HTTPStatus.NOT_FOUND, "Not found")
                        return
                finally:
                    con.close()
            self.send_response(HTTPStatus.NO_CONTENT)
            self.end_headers()
            return

        m = API_PROJECT_BY_ID_RE.match(p)
        if m:
            project_id = m.group(1)
            with _db_lock:
                con = db_connect()
                try:
                    cur = con.execute("DELETE FROM projects WHERE id = ?", (project_id,))
                    con.commit()
                    if cur.rowcount == 0:
                        self._send_text(HTTPStatus.NOT_FOUND, "Not found")
                        return
                finally:
                    con.close()
            self.send_response(HTTPStatus.NO_CONTENT)
            self.end_headers()
            return

        m = API_ROLE_BY_ID_RE.match(p)
        if m:
            role_id = m.group(1)
            with _db_lock:
                con = db_connect()
                try:
                    cur = con.execute("DELETE FROM roles WHERE id = ?", (role_id,))
                    con.commit()
                    if cur.rowcount == 0:
                        self._send_text(HTTPStatus.NOT_FOUND, "Not found")
                        return
                finally:
                    con.close()
            self.send_response(HTTPStatus.NO_CONTENT)
            self.end_headers()
            return

        self._send_text(HTTPStatus.NOT_FOUND, "Not found")

    def log_message(self, fmt: str, *args) -> None:
        # slightly cleaner logs
        print(f"[{self.log_date_time_string()}] {self.address_string()} {fmt % args}")


def main() -> None:
    db_init()
    httpd = ThreadingHTTPServer(("127.0.0.1", PORT), Handler)
    print(f"Server running: http://localhost:{PORT}", flush=True)
    print(f"Community page: http://localhost:{PORT}/community.html", flush=True)
    httpd.serve_forever()


if __name__ == "__main__":
    main()

