# Frontier Fleet — Design Handoff Spec

This document catalogs everything the app currently has — every role, every page,
every dialog, every underlying table — so a design pass can complete the remaining
UI/UX without missing anything. It is source-verified against the live codebase and
the live Supabase schema (project `esrsftgjzvbpsrvkjezf`), not written from memory.

Jump to: [Roles](#1-roles) · [Pages](#2-pages) · [Data Model](#3-data-model) ·
[Dialogs](#4-dialogscomponents) · [Gaps to Build](#5-gaps--what-design-still-needs-to-build) ·
[Shared Patterns](#6-shared-patterns-already-established)

---

## 1. Roles

11 roles exist (`app_role` enum). Each is defined by a permission array in
`src/hooks/usePermissions.ts` (`rolePermissions`), a `viewScope`, and a data-scope
list in `src/hooks/useUnitFilter.ts` (`canSeeAllUnits`). Route access is enforced by
`ProtectedRoute allowedRoles` in `src/App.tsx`; many pages add their own stricter
`canManage`-style checks on top.

### CO — Commanding Officer
- **Permissions:** `view_all, revoke_roles, view_analytics, generate_reports, approve_transactions, approve_weapon_transfers, manage_explosives, approve_requests, final_authority`
- **Scope:** all units. `canEditInventory: false` — CO approves/oversees, doesn't directly edit records.
- **Reaches:** every guarded route (Inventory Requests, Transactions, Analytics, Reports, Role Management, Audit Trail, Change Notices, MTO/Workshop/POL dashboards) plus all unguarded module pages.
- **Distinct powers:** final approval authority, weapon-transfer approval, explosives management, revoking roles, self-approve is unlocked for the first S4 (`/self-approve`) but that's an S4 bootstrap, not CO.

### S1 — Adjutant
- **Permissions:** `view_all, view_analytics, generate_reports`
- **Scope:** all units, read-only. No edit/issue/approve permissions.
- **Reaches:** Inventory Requests, Transactions, Audit Trail, Change Notices, POL/Fuel. **Not** Analytics, Reports, Role Management, MTO/Workshop dashboards, POL Management.

### S4 — Logistics Officer
- **Permissions:** `view_all, manage_inventory, revoke_roles, view_analytics, generate_reports, approve_transactions, approve_weapon_transfers, manage_explosives, bulk_upload, edit_serviceability, approve_requests`
- **Scope:** all units, full edit rights.
- **Reaches:** effectively every route, including Role Management, all three department dashboards, POL Management.
- **Distinct powers:** the only role gated into every page's **bulk-upload button** at the UI level (even though `S4_ADMIN` also holds the `bulk_upload` permission — see [Gaps](#5-gaps--what-design-still-needs-to-build)); approves documents (`Documents.tsx`); creates/edits change notices.

### S4_ADMIN
- **Permissions:** `view_all, manage_inventory, view_analytics, generate_reports, approve_transactions, bulk_upload, edit_serviceability`
- **Scope:** all units, full edit rights. No weapon-transfer approval, no role management.
- **Reaches:** Inventory Requests, Transactions, Audit Trail, MTO/Workshop dashboards, POL Management, POL/Fuel. **Not** Role Management, Change Notices, Analytics, Reports.
- **Note:** appears in nearly every page's `canManage` check alongside S4, but is UI-blocked from bulk-upload despite having the permission (see Gaps).

### OC — Officer Commanding (sub-unit)
- **Permissions:** `view_own_unit, view_analytics, generate_reports, create_requests, approve_transactions, approve_weapon_transfers, daily_oversight`
- **Scope:** own unit only.
- **Reaches:** Inventory Requests (can create requests — `InventoryRequests.tsx` scopes their view to their own submitted requests), Transactions, Analytics, Reports, Workshop Dashboard (**view-only** per `useDepartmentAccess.ts`). **Not** MTO Dashboard, POL pages, Role Management, Audit Trail.
- **Distinct powers:** approves weapon transfers and transactions for their own unit; cannot edit inventory directly (`canEditInventory: false`).

### SQMS — Squadron/Unit Quartermaster Sergeant
- **Permissions:** `view_own_unit, manage_inventory, create_requests, escalate_reports, edit_serviceability`
- **Scope:** own unit only.
- **Reaches:** Inventory Requests (own-scoped), Transactions.
- **Distinct powers:** the most common `canManage` role across module pages (Inventory, Weapons, Tools, Uniforms, PPE, Plant & Machinery, Engineer Equipment, Motor Transport, Works Materials, Room Inventory, Clothing Equipment, Company Stores, Barracks Stores); can execute monthly clothing exchanges (`MonthlyExchangeDetail.tsx`). Cannot bulk-upload, cannot approve weapon transfers.

### STOREMAN
- **Permissions:** `view_own_unit, issue_items, return_items, edit_serviceability, escalate_reports`
- **Scope:** own unit only.
- **Reaches:** Transactions only among guarded routes.
- **Distinct powers:** the core issue/return operator — appears in `canManage` for Weapons, Motor Transport, Engineer Equipment, Uniforms, Plant & Machinery, PPE. Cannot create requests, cannot bulk-upload, cannot approve anything.

### Soldier
- **Permissions:** `view_own_items` — nothing else.
- **Scope:** `own_issued_items` — the most restrictive scope in the system; RLS's `can_view_scoped_row()` only lets a Soldier see a row where they're the `issued_to`/`operator_assigned` person, so tables with no per-person column (`general_inventory`, `vehicles`, `facilities`, `room_inventory`, `works_materials`) return **zero rows** for a Soldier regardless of route access.
- **Reaches:** no `allowedRoles` list or `canManage` check anywhere in the codebase names Soldier. They can technically navigate to unguarded module pages (no manage buttons render) and their own Profile, but there is **no dedicated page for them** (see Gaps).

### MTO — Motor Transport Officer
- **Permissions:** `view_all, manage_inventory, view_analytics, generate_reports, edit_serviceability, issue_items, return_items`
- **Scope:** all units (MT operates independently, needs battalion-wide vehicle visibility).
- **Reaches:** MTO Dashboard, POL Management, POL/Fuel (`canWrite` there too). Not in the generic Motor Transport page's `canManage` — MTO manages vehicles through the dedicated MTO Dashboard's dialogs instead.

### WKSP_WO — Workshop Warrant Officer
- **Permissions:** `view_all, manage_inventory, view_analytics, generate_reports, edit_serviceability, create_requests, escalate_reports`
- **Scope:** all units (Workshop services every unit's equipment).
- **Reaches:** Workshop Dashboard only among guarded routes. No issue/return permission (unlike MTO), no weapon/explosives/role access.

### RSM — Regimental Sergeant Major
- **Permissions:** `view_all, view_analytics, generate_reports` — identical shape to S1.
- **Scope:** all units.
- **Reaches:** nothing role-gated directly names RSM in a route guard **except** the sidebar's Audit Trail visibility check — which is a bug, see [Gaps](#5-gaps--what-design-still-needs-to-build).

---

## 2. Pages

Every route in `App.tsx`, grouped the way the sidebar groups them.

### Overview
| Page | Route | Purpose | Key dialogs | Tables |
|---|---|---|---|---|
| Dashboard | `/` | Battalion-wide readiness stats, module summary cards, action-required feed | — | reads across every module for aggregate counts |
| Stores | `/stores` | Store hierarchy — S4 master store + each squadron's sub-store with category item-counts | — | `units`, counts against `weapons/tools/uniforms/general_inventory/plant_machinery` |
| Store Detail | `/stores/:unitId` | Drill-down into one store's category breakdown, links into each module | — | `units` + counts across 9 category tables |
| Scan Item | `/scan` | Universal QR lookup — scan any item's label, see its record regardless of module | `QRScannerDialog` | delegates to `useItemLookup` (module-dynamic) |

### Asset Modules
Weapons, Tools, Engineer Equipment, Plant & Machinery, Motor Transport, PPE,
Uniforms, Explosives, Facilities, Works Materials, Inventory (general), Room
Inventory, Barracks Stores, Clothing & Equipment, Company Stores, Equipment Kits,
Physical Check — all at `/weapons`, `/tools`, etc., **none role-gated at the route
level**; each enforces its own `canManage` (usually S4/S4_ADMIN/SQMS/STOREMAN, see
role tables above) to show/hide Add/Edit/Issue/Bulk-upload controls. Representative
detail (fully reviewed): **Weapons** — issue/return via `QuickIssueDialog`/
`QuickReturnDialog`, serial numbers gated behind `SensitiveField`/
`get_weapon_serials()` RPC requiring a fresh unlock, `WeaponStatusEditDialog` for
serviceability, `ItemDetailDialog` for read view. **Explosives** — whole-page
`SensitiveGate`, CO-only pending-change-request approval card, writes go through
`submit_explosives_change`/`resolve_explosives_change` RPCs rather than direct
table writes. **Physical Check** is rank-gated (Staff Sergeant through 2Lt via
`isEligibleForOrderlyOfficer`), not role-gated — an armoury muster workflow using
`start_physical_check`/`check_off_weapon`/`complete_physical_check` RPCs.

### Personnel
| Page | Route | Purpose | Role gate |
|---|---|---|---|
| Inventory Requests | `/inventory-requests` | Submit/track/approve item requests | `CO, S1, S4, S4_ADMIN, OC, SQMS` |

### Reporting
| Page | Route | Purpose | Role gate |
|---|---|---|---|
| Print Labels | `/print-labels` | Bulk QR label printing for any module's items | none |
| Documents | `/documents` | Photo-capture + OCR pipeline for paperwork, S4 review/approve | none (page-level: capture = S4/S4_ADMIN, approve = S4) |
| Transactions | `/transactions` | Generic issue/return/transfer recorder across all modules | `CO, S1, S4, S4_ADMIN, OC, SQMS, STOREMAN` |
| Analytics | `/analytics` | Requests/transactions/serviceability/alerts KPI dashboard | `CO, S4, OC` |
| Reports | `/reports` | One-click Excel generation (Arms State, Equipment Holding, Inspection, Loss/Damage, Ammo Expenditure, Accommodation) | `CO, S4, OC` |

### Departments
| Page | Route | Purpose | Role gate |
|---|---|---|---|
| MTO Dashboard | `/mto-dashboard` | Vehicle pool, driver permits, work tickets, inspections, accidents, POL summary | `MTO, S4, CO, S4_ADMIN` |
| Workshop Dashboard | `/workshop-dashboard` | Equipment inspections and repair tracking for the EME workshop | `WKSP_WO, S4, CO, S4_ADMIN, OC` (OC view-only) |
| POL / Fuel | `/pol-fuel` | Real-time tank ledger — issue, resupply, dip-test, offline-queue support | `MTO, S4, S4_ADMIN, CO, S1` |
| POL Management | `/pol-management` | Form 1A monthly POL accounting + jerrican inventory + PDF form export | `MTO, S4, CO, S4_ADMIN` |

### Administration
| Page | Route | Purpose | Role gate |
|---|---|---|---|
| Role Management | `/role-management` | Approve/reject pending role requests | `CO, S4` |
| Audit Trail | `/audit-trail` | Full change log (insert/update/delete) with before/after diffs | `CO, S1, S4, S4_ADMIN` (sidebar also shows RSM — mismatch, see Gaps) |
| Change Notices | `/notices` | Inbox of cross-role change alerts requiring acknowledgement | `CO, S1, S4` |

### Unguarded utility/other
Profile (`/profile`, reached via header avatar menu, not sidebar), Self-Approve
(`/self-approve`, first-S4 bootstrap outside the main app shell), NotFound (`*`).

---

## 3. Data Model

63 tables, all RLS-enabled, grouped by domain. Full column lists live in the
research transcript; this section gives purpose + key relationships so design knows
what connects to what.

**Personnel & Roles:** `user_roles` (role request + approval status), `units`
(top-level org scoping — nearly everything FKs here), `profiles` (soldier master
record, FK target for almost every "issued_to/inspector/approved_by" column across
the whole schema), `departments` + `department_assignments` (sub-org structure),
`sensitive_unlock_log` (audit of who unlocked serial-number views and when).

**Weapons & Arms:** `weapons`, `weapon_physical_checks` + `weapon_physical_check_items`
(muster workflow), `explosives`, `explosives_change_requests` (approval-gated edits).

**General Inventory & Equipment:** `general_inventory`, `tools`, `mechanics_tools`,
`engineer_equipment`, `plant_machinery`, `works_materials`, `barracks_stores` +
`barracks_stores_distribution`, `equipment_kits` + `equipment_kit_items`,
`room_inventory`, `facilities`, `document_captures`. Legacy pair: `inventory_items`
+ `transactions` (generic, older model — see Gaps).

**Clothing, Kit & Personal Effects:** `uniforms`, `uniform_sets`,
`clothing_equipment_scale` (authorized-quantity reference), `clothing_equipment_issues`,
`clothing_exchanges` (QM-reviewed batch exchange), `ppe`, and the identically-shaped
**book family**: `bedding_book`, `boot_book`, `laundry_book`, `tailor_book`,
`repair_book`, plus `kit_inspections`.

**Motor Transport:** `vehicles` (with a registration-approval workflow —
`registration_status`/`approved_by`), `mt_work_tickets`, `mt_driver_permits`,
`mt_driver_tests`, `mt_vehicle_allocations`, `mt_accidents`, `vehicle_inspections`,
`mt_detail_sheets`, `mt_facilities`, `workshop_inspections`, `workshop_repairs`,
`workshop_reports`.

**POL / Fuel:** legacy pair `pol_storage` + `pol_transactions`; newer, richer pair
`fuel_tanks` + `fuel_transactions` + `tank_dips` (with discrepancy/variance
detection — see Gaps for which is live).

**Workflow / Requests:** `inventory_requests`, `approvals_queue` (multi-level
approval chain), `transactions_detailed` (the real cross-domain audit-style ledger
most pages actually write to, keyed by `item_table`/`item_id` rather than a real FK).

**Audit & Notifications:** `audit_logs`, `reports` (generated file records),
`alerts` (role-routed in-app notifications).

**Views (6):** `tank_current_levels`, `tank_days_remaining`, `daily_consumption`,
`consumption_7day_avg`, `consumption_summary`, `consumption_variance` — all fuel
analytics layered on `fuel_tanks`/`fuel_transactions`/`tank_dips`.

**Functions (43), grouped:** fuel/POL operations (`pol_issue_fuel`,
`pol_resupply_fuel`, `pol_adjust_fuel`, `record_dip_test`, `confirm_dip_test`,
`align_books_from_dip`, `detect_dip_gaps`, `get_dashboard_tanks`); weapons
(`start_physical_check`, `check_off_weapon`, `complete_physical_check`,
`get_weapon_serials`); explosives (`submit_explosives_change`,
`resolve_explosives_change`); vehicles (`approve_vehicle`, `reject_vehicle`,
`get_pending_vehicles`); clothing (`execute_clothing_exchange`); access control
(`has_role`, `get_user_unit_id`, `user_has_unit_access`, `can_view_scoped_row`,
`get_email_by_service_number`, `get_public_login_stats`, `rank_ordinal`); and a set
of trigger functions that fire automatically (`audit_trigger_func`, per-role
per-unit limit checks like `check_co_limit`/`check_sqms_per_unit`,
`enforce_no_eme_weapons`, `notify_low_stock`, `notify_new_document_capture`,
`notify_new_inventory_request`, `notify_s4_change`, `handle_new_user`,
`update_updated_at_column`).

---

## 4. Dialogs/Components

44 `*Dialog.tsx` components in `src/components/`.

**Add/Create (13, all wrap `BaseAddItemDialog` with a fixed `tableName`):**
`AddEngineerEquipmentDialog`, `AddExplosiveDialog`, `AddFacilityDialog`,
`AddGeneralInventoryDialog`, `AddMTFacilityDialog`, `AddMechanicsToolDialog`,
`AddPPEDialog`, `AddPlantMachineryDialog`, `AddRoomInventoryDialog`,
`AddToolDialog`, `AddUniformDialog`, `AddVehicleDialog`, `AddWorksMaterialDialog`.
Plus `CreateRequestDialog` (writes `inventory_requests`).

**Issue/Return:** `QuickIssueDialog`, `QuickReturnDialog`, `RecordTransactionDialog`
(all write `transactions_detailed`); `ClothingEquipmentIssueDialog` (scale-checked,
S4/CO can override); `ExchangeItemIssueDialog`; `MonthlyExchangeDialog`;
`BarracksDistributionDialog`; `AssignOperatorDialog`/`UnassignOperatorDialog`
(plant-machinery operator assignment).

**Approval:** `ApproveRequestDialog` (inventory requests).

**Detail/View:** `ItemDetailDialog` (generic, used on 14 pages),
`WeaponStatusEditDialog`, `SetReorderLevelDialog`, `ConfirmDialog` (generic
confirm/cancel, reused widely), `SetPinDialog` (Profile only), `QRScannerDialog`
(camera scan, used on 5 pages).

**MT operational (all on MTO Dashboard):** `MTAccidentDialog`,
`MTDriverPermitDialog`, `MTVehicleAllocationDialog`, `MTWorkTicketDialog`,
`WorkTicketReturnDialog`, `VehicleInspectionDialog`.

**Workshop:** `WorkshopInspectionDialog`.

**Company Stores "book" dialogs (all on CompanyStores.tsx):**
`BeddingBookDialog`, `BootBookDialog`, `LaundryBookDialog`, `RepairBookDialog`,
`TailorBookDialog`, `KitInspectionDialog`.

**Bulk operations:** `BulkUploadDialog` — one generic component taking
`module`/`moduleName` props, rendered (gated `role === 'S4'` only) across 13 pages.

**POL/Fuel:** `RoutingSlipDialog` (write target unconfirmed — flagged below).

---

## 5. Gaps — what design still needs to build

1. **Unimplemented placeholder tabs.** `WorkshopDashboard.tsx`: Overview, Repairs,
   Reports to MTO, and Equipment Status tabs all show literal "coming soon" text.
   `MTODashboard.tsx`: Overview tab is a placeholder; "Generate MT Detail",
   "Schedule Inspection" (Workshop), "View Equipment", "Generate Report" (Workshop)
   Quick Action buttons are no-ops. Backing tables already exist for all of these
   (`workshop_repairs`, `workshop_reports`, `mt_detail_sheets`) — this is pure UI
   work, no schema needed.

2. ~~No Soldier-facing page~~ — **resolved**: added `MyKit.tsx` at `/my-kit`
   (sidebar entry under Overview, visible to every role since anyone can have
   issued kit, not only Soldiers). Queries every issuable module (weapons, tools,
   engineer equipment, uniforms, PPE, plant & machinery, vehicles) filtered to
   rows issued/assigned to the current user, and reuses `ItemDetailDialog` for
   the read-only detail view. Weapons' `serial_number` is deliberately excluded
   from this view's fetch, same as the gated pattern elsewhere — a soldier's own
   weapon still goes through the sensitive-reveal flow, not a shortcut here.
   Live-verified with a real test weapon (empty state, populated state, and
   detail dialog all confirmed correct), test data cleaned up after.

3. ~~RSM sidebar/route mismatch~~ — **resolved**: added RSM to `/audit-trail`'s
   `allowedRoles` in `App.tsx` (RSM's permission shape already matches S1, which
   was already allowed; the sidebar link was correct, the route guard was missing it).

4. ~~Bulk-upload permission mismatch~~ — **resolved**: all 13 pages' bulk-upload
   gates changed from `role === 'S4'` to `(role === 'S4' || role === 'S4_ADMIN')`,
   matching the `bulk_upload` permission both roles actually hold in
   `usePermissions.ts`.

5. **Two live generations of the same subsystem.** Legacy `inventory_items`/
   `transactions` vs. the richer per-domain tables (`weapons`, `tools`, etc. +
   `transactions_detailed`) — the per-domain tables are what every current page
   actually reads/writes; the legacy pair appears unused by any reviewed page.
   Same pattern in fuel: `pol_storage`+`pol_transactions` (older) vs.
   `fuel_tanks`+`fuel_transactions`+`tank_dips` (newer, used by `PolFuel.tsx` and
   the 6 analytics views). Design should build against the newer table in both
   cases; the older pair is a candidate for removal, not extension.

6. ~~`RoutingSlipDialog.tsx`~~ — **resolved**: confirmed it writes to no table at
   all. It's a pure client-side PDF generator (`generateRoutingSlip`/`downloadPdf`
   from `lib/pdfForms`) — no DB flow to design around.

7. **Stores drill-down — how it actually works, and the one real gap in it.**
   The 3-level click-down (`Stores.tsx` → `StoreDetail.tsx` → a module page,
   e.g. `/inventory`) is fully wired end-to-end and was live-verified this
   session with a real tagged test row (inserted, clicked through all 3 levels,
   confirmed correctly scoped, then deleted). Design can build more UI on top
   of this without touching the plumbing:
   - `Stores.tsx` shows one **S4 Stores** master card plus one card per row in
     `units` (currently Construction, EME, Field, Support Squadron).
   - Every count on both `Stores.tsx` and `StoreDetail.tsx` is a
     `{count:"exact",head:true}` query per category table, filtered by
     `squadron_id`. **Master = `squadron_id IS NULL`** (unassigned reserve
     stock), **a squadron card = `squadron_id = <that unit's id>`.** These two
     counts are disjoint by design — the same item is never counted in both,
     so Master's total plus all squadron totals always equals the table's
     full row count. (This was a real bug fixed this session: master used to
     run the same query with no filter at all, i.e. "count everything,"
     which double-counted every squadron-tagged item on top of its own
     squadron's card. Fixed in both `Stores.tsx`'s `fetchCountsForUnit` and
     `StoreDetail.tsx`'s per-category count query.)
   - Clicking a category tile on `StoreDetail.tsx` navigates to
     `<module route>?unit=<squadronId>` (e.g. `/inventory?unit=<id>`) for a
     squadron card, or the bare module route for the Master card. That `unit`
     query param is read by `useUnitFilter.ts`, which every module page
     consumes — either directly (`Inventory.tsx`, `Facilities.tsx`,
     `ClothingEquipment.tsx`, `Explosives.tsx`, `BarracksStores.tsx`) or via
     `useInventoryData.ts` (`Weapons.tsx`, `Tools.tsx`,
     `EngineerEquipment.tsx`, `PlantMachinery.tsx`, `Uniforms.tsx`, `PPE.tsx`),
     which calls `applyUnitFilter` internally. **Command roles** (CO/S1/S4/
     S4_ADMIN/RSM/MTO/WKSP_WO) honor the `?unit=` override; **unit-scoped
     roles** (OC/SQMS/STOREMAN/Soldier) always see only their own unit
     regardless of the URL — the override is ignored for them by design, so a
     Soldier can't be sent a link that shows another squadron's stock.
   - **The actual gap, and the reason per-squadron breakdown still looks
     empty**: this is a *data* gap, not a wiring gap. Every table's
     `squadron_id` column exists and is correctly plumbed through the whole
     UI — but every row in the database currently has `squadron_id = NULL`
     (192 `general_inventory` rows, confirmed via SQL) or the table is
     entirely empty (weapons, tools, engineer_equipment, plant_machinery,
     uniforms, ppe, explosives, facilities — zero rows in all of them).
     Design does not need to build anything new to make the per-squadron
     breakdown populate — it needs real squadron assignments entered against
     existing items (or new items created with a squadron already set) via
     each module's own "Add Item" / "Edit" dialog, which already has a
     squadron/unit field. No fabricated data should be entered against real
     inventory — this needs the actual quartermaster's assignments.

---

## 6. Shared patterns already established

Extend these rather than inventing new ones:

- **`BaseAddItemDialog`** — one generic add-item form driving 13 of the Add
  dialogs off a single `tableName` prop. Any new "Add X" page should use this,
  not a bespoke form.
- **`ItemDetailDialog`** — generic read-only detail modal, already used on 14
  pages. Default choice for any new "view item" need.
- **The `*_book` family** (`bedding_book`, `boot_book`, `laundry_book`,
  `tailor_book`, `repair_book`) — identical shape (soldier_id, inspector_id,
  squadron_id, condition fields) but five near-duplicate dialog/list component
  pairs. Good candidate to consolidate into one shared pattern rather than
  building a sixth near-duplicate.
- **Dark glass-panel visual system** — established this session in `src/index.css`
  (`.glass-panel`, neutral near-black tokens, Command Gold as the sole warm
  accent), `StatCard.tsx`, and `ModuleCard.tsx`. Any new page or component should
  match this, not the older heavier gold-glow-on-every-card style still present
  on pages not yet retouched.
