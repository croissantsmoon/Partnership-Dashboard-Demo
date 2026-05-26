# Partnership Dashboard

A responsive web dashboard for managing a university or organization's partnership portfolio — **MoU**, **MoA**, and **IA** agreements across domestic and international institutions.

Built as a single-page application using **Vanilla JavaScript · Tailwind CSS · Chart.js · Lucide Icons**, backed by **Supabase** (PostgreSQL, Auth, Realtime), with `localStorage` for auth state and notifications.

> The architecture described here also serves as a blueprint for lifting the app into a **Next.js + Supabase/PostgreSQL** production stack.

---

## At a Glance

| | |
|---|---|
| Dataset | **2,289** agreements · **1,201** institutions · **38** departments · **1,130** new partners |
| Agreement types | MoU · MoA · IA |
| Coverage | 1,584 domestic · 705 international |
| Scope tags | Learning · Research · Student Affairs · Community Service |
| Institution types | Education · Industry · Organization · Government · Foundation |
| Stack | Vanilla JS · Tailwind (CDN) · Chart.js · Lucide · `@supabase/supabase-js` v2 |
| Auth | **Supabase Auth** (email + password, magic-link, sign-up) |
| Storage | Supabase PostgreSQL (agreements · institutions · departments) · `localStorage` (auth state, logs, notifications) |
| Realtime | Supabase Realtime subscription on `agreements` — live INSERT/UPDATE/DELETE |
| Snapshot date | 2026-05-21 |

---

## Features

### Guest / Public View
- Executive landing dashboard with KPIs
- Status distribution pie chart
- Agreements by department bar chart
- Monthly activity (created vs. signed) line chart
- Expiration timeline chart
- Partner country distribution chart
- Recent activity feed and recently-signed list
- Public **Archive Library** (signed/completed/active agreements) with full search & filter
- Public **Analytics** page

### Admin (Authenticated)
- **Supabase Auth** sign-in — email/password + magic-link, with sign-up from the login page
- Role-based access (Admin / Manager / Staff / Viewer) — Supabase session is matched to a local user record by email
- **Dashboard** with KPI cards, charts, expiring agreements, "My Agreements"
- **Agreement List** with multi-column filter (status, type, department), full-text search, sortable, paginated
- **Agreement Detail** with workflow visualization, document attachments, status history timeline, activity log
- **Add / Edit Agreement Form** with validation
- **Workflow Engine** — Drafting → Internal Review → Legal Review → Partner Review → Waiting Signature → Signed → Completed → Archived
- **Lifecycle Statuses** — Active, Auto-renewed, Open-ended, Pending Approval, Renewal In Progress, Ended, Expired, Unknown (mapped from the source dataset)
- **Auto-Archive** — when status reaches a terminal/signed state the record automatically appears in the Library
- **Document upload** (simulated; production-ready hook point for Supabase Storage / S3)
- **Realtime sync** — Supabase Realtime pushes `agreements` INSERT/UPDATE/DELETE events to all connected browsers without polling
- **Archive Library** with advanced search
- **Analytics & Reports** with multiple chart types
- **User Management** (Admin only) — create, enable/disable, delete users
- **Notification Center** with expiration alerts and unread badge
- **Settings** — profile, theme, data export (JSON + CSV), reset to source data
- **Export to CSV** from list / archive / settings
- Print-to-PDF friendly stylesheet
- **Dark / light mode** with persistence
- **Toasts**, **confirmation modals**, **empty states**, **loading states**

---

## Run Locally

This is a static SPA that **must be served over HTTP** — `fetch()` is blocked on `file://`, so opening `index.html` directly will not work. The app displays a clear error screen if you try.

```bash
# Install the Node.js Supabase client (one-time)
npm install

# From the project root, run any static server. Examples:

# Python (built-in)
python3 -m http.server 8080

# Node (one-off)
npx serve -l 8080 .

# Then visit http://localhost:8080
```

### Supabase Setup

Sign-in requires a Supabase project. The guest dashboard, Library, and Analytics pages work without it (they fall back to the bundled `/data` JSON).

1. Create a project at [supabase.com](https://supabase.com) → **Project Settings → API**.
2. Copy the **Project URL** and **anon public key**.
3. Open `js/supabase-client.js` and fill in:

   ```js
   const SUPABASE_URL = 'https://<your-project-ref>.supabase.co';
   const SUPABASE_ANON_KEY = '<your-anon-public-key>';
   ```

4. Apply the database migration in the Supabase SQL editor (or via the CLI):

   ```bash
   # Using the Supabase CLI
   supabase db push
   # or paste the contents of supabase/migrations/0001_partnership_schema.sql
   # directly into your project's SQL editor.
   ```

5. Seed the database from the bundled JSON files:

   ```bash
   SUPABASE_URL=https://<ref>.supabase.co \
   SUPABASE_SERVICE_KEY=<service-role-key> \
   node scripts/import_to_supabase.mjs
   ```

   Use the **service role** key (not the anon key) so the import bypasses Row Level Security.

6. (Optional) In **Authentication → Providers**, enable **Email** with password and/or magic-link. If "Confirm email" is on, new sign-ups must verify before logging in.

If the keys are missing, the login screen shows a "Supabase isn't configured" banner. All guest-facing pages (dashboard, library, analytics) continue to work against the bundled `/data` JSON.

> **Realtime**: `js/agreements-repo.js` subscribes to the `agreements` table via Supabase Realtime after sign-in. All INSERT/UPDATE/DELETE events are streamed to connected clients and trigger an automatic re-render of the current view.

### Admin Account

| Role  | Email                      |
|-------|----------------------------|
| Admin | admin@demo.local |

Create this account (or any account via sign-up from the login page) in your Supabase project — the app matches Supabase Auth sessions to local user records by email and assigns the `Admin` role to the seeded account. Any signed-in user whose email doesn't match a seeded record defaults to **Viewer**. Additional users can be added via **User Management** once signed in.

App state persists in `localStorage` (key `unicollab_state_v2`). To reset local edits and reload from `/data`: go to **Settings → Reset to demo data**, or run `localStorage.removeItem('unicollab_state_v2')` in DevTools and refresh.

---

## Screenshots

> **Live demo:** _deploy to Vercel (or any static host) and add the URL here._

Add screenshots under `docs/screenshots/` and reference them below.

| | |
|---|---|
| ![Guest dashboard](docs/screenshots/guest-dashboard.png) | ![Admin agreements list](docs/screenshots/admin-list.png) |
| **Guest landing** — KPIs, status mix, country map | **Agreement list** — filter / search / sort / paginate |
| ![Agreement detail](docs/screenshots/agreement-detail.png) | ![Analytics](docs/screenshots/analytics.png) |
| **Agreement detail** — workflow, files, activity log | **Analytics** — trend, expirations, breakdowns |

---

## Project Structure

```
Dashboard Partnership/
├── index.html              # SPA shell, CDN imports, Tailwind config
├── package.json            # Node.js manifest — @supabase/supabase-js dependency
├── css/
│   └── style.css           # Custom styles, animations, themed pills
├── js/
│   ├── main.js             # Full SPA: router, store, auth, views, charts
│   ├── supabase-client.js  # Supabase URL + anon key bootstrap (window.supabaseClient)
│   └── agreements-repo.js  # Supabase CRUD + Realtime for agreements / institutions / departments
├── data/
│   ├── partnerships_1.json        # Raw source database (input)
│   ├── partnerships.source.json   # Original source snapshot (archive copy)
│   ├── institutions.json          # Deduped institutions w/ institution_type tags (generated)
│   ├── departments.json           # Departments / faculties / units (generated)
│   ├── agreements.json            # Normalized agreements w/ units, scope_tags, flags (generated)
│   └── meta.json                  # Totals + status/type/kind/scope/institution_type breakdowns (generated)
├── scripts/
│   ├── convert_partnerships.py    # Source → normalized JSON converter
│   ├── import_to_supabase.mjs     # Seeds institutions / departments / agreements into Supabase
│   └── make-demo-data.mjs         # Generates a smaller demo dataset for development
└── supabase/
    └── migrations/
        └── 0001_partnership_schema.sql  # DDL: tables, indexes, RLS, Realtime publication
```

### `main.js` modules (logical, single-file)

| Module | Responsibility |
|--------|----------------|
| `Store` | Load source JSON, normalize, persist to `localStorage`, reset |
| `Auth` | Supabase Auth wrapper — login, sign-up, magic-link, logout; maps Supabase session → local user by email |
| `Theme` | Dark/light mode with persistence |
| `Router` | Hash-based SPA router with `requireAuth` guard |
| `Toast` | Animated stackable notifications |
| `Modal` | Generic + confirm modal with backdrop |
| `Charts` | Chart.js wrappers (pie, bar, line, timeline) |
| `UI` | Atomic helpers — KPI card, card, pill, progress bar, empty state |
| `Views` | Page renderers — Guest, Admin, Agreement, Library, Users, etc. |

**`js/agreements-repo.js`** (separate file, loaded before `main.js`) exposes `window.AgreementsRepo`:

| Export | Responsibility |
|--------|----------------|
| `loadAll()` | Parallel-fetches `institutions`, `departments`, `agreements` from Supabase and returns them in camelCase |
| `insertAgreement(a)` | Inserts a new agreement row; returns the mapped object |
| `updateAgreement(id, patch)` | Updates a row by ID; returns the updated object |
| `deleteAgreement(id)` | Deletes a row by ID |
| `subscribe({ onChange })` | Opens a Supabase Realtime channel on `agreements` — calls `onChange` with `{ type, agreement }` on INSERT/UPDATE/DELETE |
| `unsubscribe()` | Tears down the Realtime channel |
| `deriveStatus(stored, endDate)` | Client-side: flips `Active`/`Auto-renewed` to `Expired` when `end_date` has passed, avoiding a SQL cron |

---

## Data Pipeline

The dashboard reads from Supabase PostgreSQL (live) with `/data` JSON files as the source-of-truth seed. The full pipeline:

```
partnerships_1.json   (international[] + domestic[])
        │
        │   python3 scripts/convert_partnerships.py
        ▼
institutions.json  +  departments.json  +  agreements.json  +  meta.json
        │
        │   node scripts/import_to_supabase.mjs   (one-time seed, service role key)
        ▼
  Supabase PostgreSQL  ──Realtime──▶  AgreementsRepo  ──▶  Store.state
        │
        │   fetch() on app boot (AgreementsRepo.loadAll)
        ▼
   Store.state  ──persist──▶  localStorage  (auth state, logs, notifications)
```

Re-run the converter whenever the source changes, then re-seed:

```bash
python3 scripts/convert_partnerships.py
SUPABASE_URL=... SUPABASE_SERVICE_KEY=... node scripts/import_to_supabase.mjs
```

The script:
- Repairs mojibake (Latin-1 → UTF-8 round-trip) in names and addresses
- Dedupes institutions by canonical key (trims trailing country/city suffixes) and aggregates `institution_type` tags across all of an institution's agreements to pick a dominant display type
- Derives departments from the per-agreement `units` array — the first unit becomes the primary department, the rest are still registered so they appear in filters
- Normalizes the new `scope` array (`learning` / `research` / `student_affairs` / `community_service`) into `scope_tags` plus a human label
- Classifies `end_date` strings into `date` / `auto_renewed` / `no_limit` / `na` / `unknown`, parses Indonesian note patterns (`belum pengusulan`, `proses pembaruan`, `end`, …) and maps each agreement to a lifecycle status relative to `TODAY` (2026-05-21)
- Preserves `new_partner`, `agenda`, `degree_program`, `non_degree_program`, `renewal_info`, and `realization` from the source row
- Writes `meta.json` with totals plus breakdowns by status, type, kind, institution_type, and scope

After regenerating, hard-refresh the browser **and** reset local data (Settings → Reset) so the cached `localStorage` snapshot is rebuilt.

---

## Database Schema

The live schema is in `supabase/migrations/0001_partnership_schema.sql` and is applied to the Supabase project. Key design decisions:

- PKs are `text` (matching the string IDs in the source JSON), not UUID
- `"Expired"` status is **not stored** — `deriveStatus()` in `agreements-repo.js` derives it client-side from `end_date`, so no cron is needed
- Row Level Security is enabled: reads are public, writes require `authenticated` role
- `agreements`, `institutions`, and `departments` are added to the `supabase_realtime` publication so changes stream to all connected browsers
- `updated_at` is auto-bumped by the `agreements_touch` trigger on every UPDATE

### ERD

```
┌───────────────────┐         ┌──────────────────────────┐
│ departments       │         │ institutions             │
│───────────────────│         │──────────────────────────│
│ id  (text PK)     │◄──┐  ┌─►│ id  (text PK)            │
│ name              │   │  │  │ name                     │
│ short             │   │  │  │ canonical_name           │
│ is_faculty        │   │  │  │ type · kind              │
│ created_at        │   │  │  │ country · city · address │
└───────────────────┘   │  │  │ institution_types text[] │
                        │  │  │ created_at               │
                        │  │  └──────────────────────────┘
                        │  │
         ┌──────────────────────────────────────────┐
         │ agreements                               │
         │──────────────────────────────────────────│
         │ id (text PK)                             │
         │ code · source_no · kind                  │
         │ title · type · status                    │
         │ institution_id  (FK → institutions)      │─┘
         │ department_id   (FK → departments)       │─┘
         │ pic_user_id     (uuid, auth.users ref)   │
         │ implementing_unit · units text[]         │
         │ scope · scope_tags text[]                │
         │ institution_type text[]                  │
         │ start_date · end_date · renewal_date     │
         │ end_date_kind · end_date_raw             │
         │ renewal_info_raw · realization           │
         │ degree_program jsonb                     │
         │ non_degree_program jsonb                 │
         │ description · notes                      │
         │ tags text[] · new_partner                │
         │ created_at · updated_at  (auto-touched)  │
         └──────────────────────────────────────────┘
```

> `activity_logs`, `notifications`, `uploaded_files`, and `users` are managed in `localStorage` / Supabase Auth for now and are not in the Postgres schema. See **Production Migration Path** for extending the schema.

### SQL DDL

The full DDL is in `supabase/migrations/0001_partnership_schema.sql`. Abbreviated summary:

```sql
-- departments
create table public.departments (
  id          text primary key,
  short       text not null,
  name        text not null,
  is_faculty  boolean not null default false,
  created_at  timestamptz not null default now()
);

-- institutions
create table public.institutions (
  id                 text primary key,
  name               text not null,
  canonical_name     text,
  type               text,
  kind               text,
  country            text,
  city               text,
  address            text,
  institution_types  text[] default '{}',
  created_at         timestamptz not null default now()
);

-- agreements
create table public.agreements (
  id                   text primary key,
  code                 text,
  source_no            integer,
  kind                 text,
  title                text not null,
  type                 text not null default 'MoU',
  status               text not null default 'Drafting',
  institution_id       text references public.institutions(id) on delete set null,
  department_id        text references public.departments(id)  on delete set null,
  pic_user_id          uuid,
  implementing_unit    text,
  units                text[] default '{}',
  unit_department_ids  text[] default '{}',
  scope                text,
  scope_tags           text[] default '{}',
  institution_type     text[] default '{}',
  start_date           date,
  end_date             date,
  end_date_kind        text,
  end_date_raw         text,
  renewal_date         date,
  renewal_info_raw     text,
  realization          text,
  degree_program       jsonb,
  non_degree_program   jsonb,
  description          text,
  notes                text,
  tags                 text[] default '{}',
  new_partner          boolean not null default false,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

-- Indexes
create index agreements_status_idx        on public.agreements (status);
create index agreements_end_date_idx      on public.agreements (end_date);
create index agreements_institution_idx   on public.agreements (institution_id);
create index agreements_department_idx    on public.agreements (department_id);
create index agreements_type_idx          on public.agreements (type);

-- Auto-bump updated_at
create trigger agreements_touch
  before update on public.agreements
  for each row execute function public.touch_updated_at();

-- RLS: reads are public, writes require authenticated
alter table public.institutions enable row level security;
alter table public.departments  enable row level security;
alter table public.agreements   enable row level security;

create policy "read agreements"   on public.agreements  for select using (true);
create policy "write agreements"  on public.agreements
  for all to authenticated using (true) with check (true);
-- (similar policies on institutions and departments)

-- Realtime: stream changes to subscribed browsers
alter publication supabase_realtime add table public.agreements;
alter publication supabase_realtime add table public.institutions;
alter publication supabase_realtime add table public.departments;
```

---

## Suggested API Routes (Next.js / Express)

| Method | Path                                  | Description                          | Auth   |
|--------|---------------------------------------|--------------------------------------|--------|
| POST   | `/api/auth/login`                     | Login (returns JWT)                  | —      |
| POST   | `/api/auth/logout`                    | Logout                               | ✓      |
| GET    | `/api/agreements`                     | List + filter + paginate             | ✓      |
| POST   | `/api/agreements`                     | Create                               | ✓      |
| GET    | `/api/agreements/:id`                 | Detail                               | ✓      |
| PUT    | `/api/agreements/:id`                 | Update                               | ✓      |
| DELETE | `/api/agreements/:id`                 | Delete                               | ✓      |
| POST   | `/api/agreements/:id/advance`         | Move to next workflow stage          | ✓      |
| POST   | `/api/agreements/:id/files`           | Upload PDF (multipart)               | ✓      |
| GET    | `/api/agreements/:id/files`           | List attachments                     | ✓      |
| GET    | `/api/agreements/:id/logs`            | Activity & status history            | ✓      |
| GET    | `/api/library`                        | Public archive (signed/active)       | —      |
| GET    | `/api/analytics/kpis`                 | KPI summary                          | —      |
| GET    | `/api/analytics/charts`               | Chart datasets                       | —      |
| GET    | `/api/institutions`                   | CRUD                                 | ✓      |
| GET    | `/api/departments`                    | CRUD                                 | ✓      |
| GET    | `/api/users`                          | List users                           | Admin  |
| POST   | `/api/users`                          | Create user                          | Admin  |
| GET    | `/api/notifications`                  | Current user notifications           | ✓      |
| PATCH  | `/api/notifications/:id`              | Mark read/unread                     | ✓      |

---

## Production Migration Path

Core infrastructure (Supabase Auth, PostgreSQL, Realtime, RLS) is already wired. Remaining steps to reach a fully deployable enterprise stack:

1. ✅ **Database** — Schema applied (`supabase/migrations/0001_partnership_schema.sql`), RLS enabled, Realtime publication set up.
2. ✅ **Auth** — Supabase Auth (email/password + magic-link) integrated via `js/supabase-client.js`.
3. ✅ **Realtime** — `js/agreements-repo.js` subscribes to INSERT/UPDATE/DELETE on `agreements`.
4. **User profiles** — Add a `profiles` table linked to `auth.users.id` to store role, department, and display name instead of the current localStorage user records.
5. **File storage** — Create an `agreement-files` bucket on Supabase Storage; replace the simulated upload in `main.js` with `supabase.storage.from('agreement-files').upload(...)`.
6. **Activity logs & notifications** — Migrate from localStorage to Supabase tables for multi-user persistence and cross-device consistency.
7. **Email / expiration alerts** — Add a Supabase scheduled function (pg_cron or Edge Function) → SendGrid / Resend for upcoming-expiration notifications.
8. **Next.js upgrade** (optional):
   - `npx create-next-app@latest petra-partnership --typescript --tailwind --app`
   - Install: `@supabase/supabase-js`, `recharts`, `shadcn/ui`, `react-hook-form`, `zod`, `lucide-react`
   - Swap Chart.js (CDN) for Recharts components; replace `Store.*` calls with Supabase SDK calls.
9. **Deploy** — Vercel (frontend) + Supabase (DB + storage + auth + cron).

---

## Development & Contributing

### Prerequisites
- Modern browser (Chrome, Firefox, Edge, Safari)
- **Node.js 18+** — for `import_to_supabase.mjs` and `make-demo-data.mjs`
- **Python 3.9+** — only if you want to regenerate the normalized JSON from `partnerships_1.json`
- Any static file server (Python, Node, `caddy file-server`, `live-server`, etc.)

### Workflow

```bash
# 1. Install Node.js dependencies (one-time)
npm install

# 2. Start a dev server from the project root
python3 -m http.server 8080

# 3. (Optional) regenerate /data after editing the source dataset
python3 scripts/convert_partnerships.py

# 4. Re-seed Supabase after regenerating data
SUPABASE_URL=... SUPABASE_SERVICE_KEY=... node scripts/import_to_supabase.mjs

# 5. After re-seeding, reset local state in the app
#    Settings → "Reset to demo data"   (or clear localStorage in DevTools)
```

There is no build step. Tailwind is loaded from CDN and `main.js` is a plain script — edits to `js/main.js` or `css/style.css` are reflected immediately on refresh.

### Code conventions
- **Single-file SPA + thin repo layer** — keep new functionality in `js/main.js` under the appropriate module. Supabase CRUD belongs in `js/agreements-repo.js` (`AgreementsRepo`). Don't introduce a bundler or split files further unless migrating to the Next.js path.
- **No frameworks** — render via template strings + `innerHTML`, then re-bind events. Escape user-controlled strings with `escapeHtml()`.
- **Tailwind utility classes only** — avoid adding to `css/style.css` unless an effect can't be expressed with utilities (animations, print styles, themed pills).
- **Status handling** — when adding a status, update `WORKFLOW_STAGES` / `LIFECYCLE_STATUSES` / `ARCHIVE_STATUSES` consistently and check `stageProgress()` covers it.
- **Persisted state** — anything written via `Store.save()` lands in `localStorage`. Bump `STORAGE_KEY` when making breaking shape changes so existing users get a clean reload.

### Contributing
1. Fork & create a feature branch (`feat/...`, `fix/...`, `docs/...`).
2. Test the change locally against the **full** dataset (2,289 agreements) — pagination, filtering, and chart rendering all change behavior at scale.
3. Verify both **guest** and **admin** views, and both **light** and **dark** modes.
4. Open a PR describing the change and any data-shape implications.

### Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| Boot error: "fetch blocked on file://" | Opened `index.html` directly | Serve over HTTP (see [Run Locally](#run-locally)) |
| `data/*.json → HTTP 404` | Server not started from project root | `cd` into the project root before running the server |
| Login banner: "Supabase isn't configured" | `SUPABASE_URL` / `SUPABASE_ANON_KEY` blank | Fill them in `js/supabase-client.js` (see [Supabase Setup](#supabase-setup)) |
| Sign-up succeeds but login fails | Supabase "Confirm email" is enabled | Verify the confirmation email, or disable confirmation in **Authentication → Providers** |
| Signed-in user lands as Viewer | Email doesn't match a seeded local user | Sign in with the seeded Admin email, or add the user via **User Management** |
| Stale data after `convert_partnerships.py` | `localStorage` snapshot is older | Re-run `import_to_supabase.mjs`, then Settings → Reset |
| Realtime events not arriving | Channel not subscribed / RLS blocking | Confirm `supabase_realtime` publication includes the table; check browser network tab for WebSocket |
| `QuotaExceeded` on save | Browser localStorage limit (~5 MB) | Use Settings → Export, then reset; or switch to a backend |
| Charts blank in dark mode | Chart instance cached with old theme | Toggle theme once, or refresh |

---

## Sample Data

The bundled demo dataset includes:

- **38 departments / faculties / units** (Engineering, Business, Communication, Informatics, Civil & Planning, etc.)
- **1,201 institutions** across domestic and international partners
- **2,289 agreements** spanning every workflow stage and lifecycle status
- **1,130 flagged as new partners** in the source dataset
- **1 seeded Admin user** (added on top of the dataset — the source has no user records)
- **Activity logs** for every status transition
- **Notifications** auto-generated for upcoming expirations

Breakdown by status (from `data/meta.json`):

| Status | Count |
|---|---|
| Expired | 1,101 |
| Active | 423 |
| Auto-renewed | 314 |
| Unknown | 169 |
| Pending Approval | 157 |
| Ended | 74 |
| Renewal In Progress | 51 |

Breakdown by type:

| Type | Count |
|---|---|
| MoU | 1,055 |
| MoA | 1,046 |
| IA | 126 |
| Unknown | 62 |

Breakdown by kind:

| Kind | Count |
|---|---|
| Domestic | 1,584 |
| International | 705 |

Breakdown by institution type (an agreement can carry multiple tags):

| Institution type | Count |
|---|---|
| Education | 1,201 |
| Industry | 671 |
| Organization | 296 |
| Government | 102 |
| Foundation | 12 |

Breakdown by scope (an agreement can carry multiple tags):

| Scope | Count |
|---|---|
| Learning | 684 |
| Research | 542 |
| Student Affairs | 469 |
| Community Service | 459 |

---

## Keyboard / UX Niceties
- `/` global search shortcut (top bar, focusable via tab)
- Enter on global search jumps to filtered Agreement List
- All destructive actions go through a confirmation modal
- Toasts auto-dismiss; click X to dismiss earlier
- Theme preference persists across reloads

---

## License

MIT — Use freely for educational and institutional purposes.

---

_Dataset snapshot: 2026-05-21 · Repo: [github.com/zefanyakharisma-cell/Dashboard-Partnership](https://github.com/zefanyakharisma-cell/Dashboard-Partnership)_
