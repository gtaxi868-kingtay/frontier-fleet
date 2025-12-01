# QM Standard Assessment - Implementation Plan
## Fix Critical and High-Priority Gaps

**Date:** Current
**Status:** Planning Phase
**Priority:** CRITICAL - Must complete for full QM compliance

---

## 📋 OVERVIEW

This plan addresses the critical gaps identified in `QM_STANDARD_ASSESSMENT.md`:

1. **CRITICAL:** Clothing Scale Enforcement
2. **HIGH PRIORITY:** Receipt Printing
3. **HIGH PRIORITY:** Kit Inspections Workflow
4. **HIGH PRIORITY:** Monthly Exchanges Workflow

**Note:** Database tables already exist. This plan focuses on UI workflows, validation logic, and enforcement.

---

## 1. CRITICAL: Clothing Scale Enforcement

### Problem
- System allows issuing items beyond authorized quantities per rank
- No validation against `clothing_equipment_scale` table
- Compliance risk - violates Army regulations

### Solution
Add scale checking logic to `QuickIssueDialog` and create a dedicated clothing issue dialog with scale validation.

### Implementation Steps

#### 1.1 Create Scale Validation Hook
**File:** `src/hooks/useClothingScale.ts` (NEW)
- Function: `checkScaleAvailability(soldierId, itemName, quantity)`
- Query `clothing_equipment_scale` for soldier's rank
- Query `clothing_equipment_issues` for current holdings
- Return: `{ allowed: boolean, current: number, max: number, warning?: string }`

#### 1.2 Create Clothing Equipment Issue Dialog
**File:** `src/components/ClothingEquipmentIssueDialog.tsx` (NEW)
- Similar to `QuickIssueDialog` but with scale validation
- Step 1: Select soldier
- Step 2: Select item (filtered by scale availability)
- Step 3: Check scale before proceeding
- Step 4: Show warning if at max, block if exceeded
- Step 5: Confirm and issue

**Features:**
- Auto-check scale when soldier selected
- Show current holdings vs. authorized quantity
- Prevent issue if already at maximum
- Allow override with justification (for S4 only)
- Update `clothing_equipment_issues` table

#### 1.3 Enhance QuickIssueDialog for Clothing Items
**File:** `src/components/QuickIssueDialog.tsx` (MODIFY)
- Add scale check when `module === 'clothing_equipment_issues'`
- Import and use `useClothingScale` hook
- Show warning/block if scale exceeded
- Redirect to `ClothingEquipmentIssueDialog` for clothing items

#### 1.4 Add Scale Display to ClothingEquipment Page
**File:** `src/pages/ClothingEquipment.tsx` (MODIFY)
- Update "Issue Item" button to open `ClothingEquipmentIssueDialog`
- Show scale status on existing issues
- Display "At Scale" or "Below Scale" badges

#### 1.5 Create Database Function for Scale Check (Optional)
**File:** `supabase/migrations/[timestamp]_scale_validation_function.sql` (NEW)
- Create function: `check_clothing_scale(soldier_id, item_name, quantity)`
- Returns validation result
- Can be called from RLS policies if needed

### Files to Create/Modify
1. ✅ `src/hooks/useClothingScale.ts` (NEW)
2. ✅ `src/components/ClothingEquipmentIssueDialog.tsx` (NEW)
3. ✅ `src/components/QuickIssueDialog.tsx` (MODIFY)
4. ✅ `src/pages/ClothingEquipment.tsx` (MODIFY)

### Success Criteria
- ✅ Cannot issue item if soldier already has maximum authorized
- ✅ Warning shown if at 80%+ of scale
- ✅ Current holdings displayed before issue
- ✅ Override option for S4 only (with justification)

---

## 2. HIGH PRIORITY: Receipt Printing

### Problem
- No printable receipts when issuing items
- Physical records still needed for compliance
- QR labels exist but not issue receipts

### Solution
Create printable receipt components using existing `html2canvas` library.

### Implementation Steps

#### 2.1 Create Receipt Component
**File:** `src/components/IssueReceipt.tsx` (NEW)
- Print-optimized layout (A4 or letter size)
- Header: Unit name, receipt number, date/time
- Item details: Name, ID, serial number
- Soldier details: Rank, name, service number
- Issuing officer: Rank, name, signature line
- Receiving signature: Line for soldier signature
- Footer: Terms and conditions

**Features:**
- Print-optimized CSS (hide buttons, show only content)
- QR code for digital verification
- Receipt number auto-generated
- Save receipt to database (optional)

#### 2.2 Create Return Receipt Component
**File:** `src/components/ReturnReceipt.tsx` (NEW)
- Similar layout to IssueReceipt
- Show return date/time
- Show condition on return
- Receiving officer signature

#### 2.3 Add Receipt Generation to QuickIssueDialog
**File:** `src/components/QuickIssueDialog.tsx` (MODIFY)
- After successful issue, show "Print Receipt" button
- Open IssueReceipt dialog with issue details
- Use `html2canvas` to generate PDF/image (optional)

#### 2.4 Add Receipt Generation to QuickReturnDialog
**File:** `src/components/QuickReturnDialog.tsx` (MODIFY)
- After successful return, show "Print Receipt" button
- Open ReturnReceipt dialog with return details

#### 2.5 Create Receipt Storage (Optional)
**File:** `supabase/migrations/[timestamp]_receipts_table.sql` (NEW)
- Create `issue_receipts` table
- Store receipt number, issue_id, PDF URL, generated_at
- Link to transactions

### Files to Create/Modify
1. ✅ `src/components/IssueReceipt.tsx` (NEW)
2. ✅ `src/components/ReturnReceipt.tsx` (NEW)
3. ✅ `src/components/QuickIssueDialog.tsx` (MODIFY)
4. ✅ `src/components/QuickReturnDialog.tsx` (MODIFY)

### Success Criteria
- ✅ Receipt can be printed from issue/return dialogs
- ✅ Receipt includes all required information
- ✅ Print layout is clean and professional
- ✅ Receipt number is unique and traceable

---

## 3. HIGH PRIORITY: Kit Inspections Workflow

### Problem
- Tab exists but empty ("coming soon")
- Can't record monthly kit inspections
- Can't track inspection history

### Solution
Build complete workflow using existing `kit_inspections` table.

### Implementation Steps

#### 3.1 Create Kit Inspection Dialog
**File:** `src/components/KitInspectionDialog.tsx` (NEW)
- Multi-step wizard:
  - Step 1: Select soldier
  - Step 2: Select inspection date
  - Step 3: Inspector information (Coy 2IC or Platoon Commander)
  - Step 4: Item checklist (from soldier's holdings)
  - Step 5: Deficiencies and exchange requests
  - Step 6: Notes and follow-up
  - Step 7: Review and submit

**Features:**
- Auto-populate items from `clothing_equipment_issues` (non-returned)
- Check items against scale
- Mark items as "at scale", "below scale", "exceeding scale"
- Record deficiencies as array
- Record exchange requests
- Serviceability assessment notes
- Follow-up flag

#### 3.2 Create Kit Inspection List View
**File:** `src/components/KitInspectionList.tsx` (NEW)
- Table view of all inspections
- Filter by date range, soldier, unit
- Show inspection status (completed, follow-up required)
- Link to inspection detail

#### 3.3 Add Kit Inspections Tab to ClothingEquipment Page
**File:** `src/pages/ClothingEquipment.tsx` (MODIFY)
- Replace "coming soon" with actual content
- Add "New Inspection" button
- Display KitInspectionList
- Open KitInspectionDialog on button click

#### 3.4 Create Inspection Detail View
**File:** `src/components/KitInspectionDetail.tsx` (NEW)
- View full inspection details
- Show items checked
- Show deficiencies list
- Show exchange requests
- Mark follow-up as completed

#### 3.5 Create Inspection Reports
**File:** `src/pages/ClothingEquipment.tsx` (MODIFY)
- Add "Generate Inspection Report" button
- Export inspections to Excel
- Filter by date range, unit, inspector

### Files to Create/Modify
1. ✅ `src/components/KitInspectionDialog.tsx` (NEW)
2. ✅ `src/components/KitInspectionList.tsx` (NEW)
3. ✅ `src/components/KitInspectionDetail.tsx` (NEW)
4. ✅ `src/pages/ClothingEquipment.tsx` (MODIFY)

### Success Criteria
- ✅ Can create new kit inspection
- ✅ Can view inspection history
- ✅ Can track deficiencies and follow-ups
- ✅ Can generate inspection reports

---

## 4. HIGH PRIORITY: Monthly Exchanges Workflow

### Problem
- Tab exists but empty
- Can't record monthly clothing exchanges
- Can't track exchange history

### Solution
Build complete workflow using existing `clothing_exchanges` table.

### Implementation Steps

#### 4.1 Create Monthly Exchange Dialog
**File:** `src/components/MonthlyExchangeDialog.tsx` (NEW)
- Multi-step wizard:
  - Step 1: Select exchange month/date
  - Step 2: Select unit (if multi-unit view)
  - Step 3: Select item type for exchange
  - Step 4: Select items to exchange (from issues)
  - Step 5: Exchange reason (unserviceable, shrinkage, outgrown, etc.)
  - Step 6: QM review and approval
  - Step 7: Review and submit

**Features:**
- Filter items by exchange eligibility (age, condition, scale)
- Record items handed in (array of IDs)
- Record items issued (array of IDs)
- Exchange reason dropdown
- QM approval workflow
- Link to original issue records

#### 4.2 Create Exchange List View
**File:** `src/components/MonthlyExchangeList.tsx` (NEW)
- Table view of all exchanges
- Filter by month, unit, item type, status
- Show exchange status (pending, approved, rejected)
- Show QM decision

#### 4.3 Add Monthly Exchanges Tab to ClothingEquipment Page
**File:** `src/pages/ClothingEquipment.tsx` (MODIFY)
- Replace "coming soon" with actual content
- Add "New Exchange" button
- Display MonthlyExchangeList
- Open MonthlyExchangeDialog on button click

#### 4.4 Create Exchange Detail View
**File:** `src/components/MonthlyExchangeDetail.tsx` (NEW)
- View full exchange details
- Show items handed in
- Show items issued
- Show QM decision and notes
- Approve/reject buttons (for QM role)

#### 4.5 Create Exchange Reports
**File:** `src/pages/ClothingEquipment.tsx` (MODIFY)
- Add "Generate Exchange Report" button
- Export exchanges to Excel
- Filter by month, unit, status

#### 4.6 Link Exchanges to Issues
**File:** `src/components/ClothingEquipmentIssueDialog.tsx` (MODIFY)
- Show exchange history for items
- Link exchanges to original issues
- Update issue records when exchange approved

### Files to Create/Modify
1. ✅ `src/components/MonthlyExchangeDialog.tsx` (NEW)
2. ✅ `src/components/MonthlyExchangeList.tsx` (NEW)
3. ✅ `src/components/MonthlyExchangeDetail.tsx` (NEW)
4. ✅ `src/pages/ClothingEquipment.tsx` (MODIFY)

### Success Criteria
- ✅ Can create new monthly exchange
- ✅ Can view exchange history
- ✅ Can track QM approvals
- ✅ Can generate exchange reports
- ✅ Exchanges linked to original issues

---

## 📊 IMPLEMENTATION PRIORITY

### Phase 1: CRITICAL (Do First)
1. ✅ Clothing Scale Enforcement
   - **Estimated Time:** 4-6 hours
   - **Risk:** Compliance violation if not done
   - **Files:** 4 new/modified

### Phase 2: HIGH PRIORITY (Do Next)
2. ✅ Receipt Printing
   - **Estimated Time:** 3-4 hours
   - **Risk:** Missing physical records
   - **Files:** 4 new/modified

3. ✅ Kit Inspections
   - **Estimated Time:** 5-6 hours
   - **Risk:** Can't meet monthly requirement
   - **Files:** 4 new/modified

4. ✅ Monthly Exchanges
   - **Estimated Time:** 5-6 hours
   - **Risk:** Can't meet monthly requirement
   - **Files:** 4 new/modified

**Total Estimated Time:** 17-22 hours

---

## 🎯 SUCCESS METRICS

After implementation, the system should:

1. ✅ **Prevent over-issuing** - Scale enforcement blocks violations
2. ✅ **Generate receipts** - Physical records available
3. ✅ **Track inspections** - Monthly kit inspections recorded
4. ✅ **Track exchanges** - Monthly exchanges recorded

**Overall System Readiness:** 95% (up from 70%)

---

## 📝 NOTES

- All database tables already exist
- Focus on UI workflows and validation
- Use existing patterns (QuickIssueDialog, etc.)
- Maintain consistency with current design
- Test with real data before deployment

---

## 🚀 NEXT STEPS

1. Review this plan
2. Confirm priorities
3. Start with Phase 1 (Scale Enforcement)
4. Test thoroughly before moving to Phase 2
5. Update QM_STANDARD_ASSESSMENT.md when complete

---

**Ready to implement?** Start with Phase 1: Clothing Scale Enforcement.

