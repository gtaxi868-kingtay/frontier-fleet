# Design Handoff — Frontier Fleet (S4)

Three things to give Claude Design, together, in one message. Each answers a
different question it needs before touching a single screen.

## 1. Who's who — [FRONTIER-FLEET-DESIGN-SPEC.md](./FRONTIER-FLEET-DESIGN-SPEC.md)

The full catalog: all 11 roles and their exact permissions (Section 1), every
page and what it's gated by (Section 2), the data model (Section 3), every
dialog/component (Section 4), and known gaps still to build (Section 5).
This is the source of truth — don't let Design guess at any of this.

## 2. Where things actually connect — the Screen Flow diagram

The published node-map (Stores → StoreDetail → module pages, sidebar
sections, the `?unit=` scoping) — hand over that artifact link alongside the
spec so Design builds toward the real navigation, not an invented one.

## 3. What changes on screen, per role — the cheat sheet below

This is the part that's easy to leave out and breaks everything: **the same
page looks different depending on who's logged in.** Not a different app —
the same screen, with buttons and data added or removed per role.

---

### Per-role cheat sheet

| Role | Sees | Can't see / do | Extra buttons only they get |
|---|---|---|---|
| **CO** | Everything, every unit | Doesn't edit inventory directly | Approve transactions, approve weapon transfers, revoke roles, final sign-off actions |
| **S4** | Everything, every unit | — | Bulk Upload, edit serviceability, manage roles, approve requests/transfers, manage explosives |
| **S4_ADMIN** | Everything, every unit | Can't approve weapon transfers, can't revoke roles | Bulk Upload, edit serviceability, approve transactions |
| **S1** | Everything, every unit (read-only) | No edit/approve actions anywhere | Analytics, reports |
| **RSM** | Everything, every unit (read-only) | No edit/approve actions anywhere | Analytics, reports, Audit Trail |
| **OC** | Only their own unit | No bulk upload, no direct inventory edit | Create requests, approve transactions/weapon transfers for their unit, daily oversight view |
| **SQMS** | Only their own unit | No weapon-transfer approval | Manage inventory, edit serviceability, escalate reports, create requests |
| **STOREMAN** | Only their own unit | No inventory creation, no requests | Issue Item, Return Item, edit serviceability |
| **Soldier** | Only items issued to *them personally* | No manage/issue/approve buttons anywhere; no bulk upload; no other soldiers' data | "My Kit" — their own gear, read-only |
| **MTO** | All units, but only MT/vehicle data | No weapons/explosives access | Manage MT inventory, issue/return vehicles & tools, MT analytics |
| **WKSP_WO** | All units, but only workshop/equipment data | No weapons/explosives access | Repair/maintenance requests, escalate reports |

**One field that behaves differently regardless of role:** the weapon serial
number. It's hidden for everyone by default — even CO and S4 — and only
reveals after a PIN/password re-entry that expires after 30 minutes. Design
this as a locked/masked state with an "unlock" action, not a field that's
just present or absent.

**The building block, so Design doesn't redraw this 30 times:** most pages
are one layout with a few things that toggle:
- A row of role-gated buttons above the list (Add / Bulk Upload / Issue /
  Return — each checks the viewer's role)
- A row-count that's either "everything" (command roles), "my unit only"
  (OC/SQMS/STOREMAN), or "just mine" (Soldier) — same table, different rows
- A detail dialog that's either editable or read-only depending on role

Design that ONE flexible page pattern, not a separate page per role.
