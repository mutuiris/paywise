# PayWise Frontend — Vendor Payment & Approval Management System

> **Client:** ImaraWorks Ltd. (Kenyan Construction & Infrastructure Engineering)  
> **Framework:** Next.js (App Router), TypeScript, Tailwind CSS v4, Lucide Icons  
> **Backend Integration:** Django REST API (`/api/accounts/`, `/api/vendors/`, `/api/payments/`, `/api/approvals/`, `/api/audit/`, `/api/reporting/`)  
> **Currency:** Kenyan Shillings (KES)

---

## 1. System Overview & Role Matrix

PayWise centralises vendor payment requisitions, multi-tier approvals, disbursement simulations, and compliance audits for ImaraWorks Ltd.

| Role | Demo Persona | Key Responsibilities & Capabilities |
|---|---|---|
| **Site Employee** | Alice Mwangi (`alice.mwangi@imaraworks.co.ke`) | Requisition submission, active vendor lookup, invoice upload, status tracking. |
| **Project Manager** | Carol Wanjiku (`carol.wanjiku@imaraworks.co.ke`) | Site expense review, approval decisions (<=50k single sign-off), self-approval prohibition. |
| **Finance Officer** | Faith Njeri (`faith.njeri@imaraworks.co.ke`) | Secondary approvals (>50k dual clearance), disbursement execution, ambiguous reconciliation. |
| **Administrator** | Grace Kamau (`grace.kamau@imaraworks.co.ke`) | User access governance, immutable audit trail inspection, system oversight. |

---

## 2. Business Rules Enforced in UI

1. **Controlled Lifecycle:** `DRAFT → SUBMITTED → PENDING_APPROVAL → APPROVED → PROCESSING → PAID` with rejection and failure branches.
2. **Approval Thresholds:**
   * Requests **<= KES 50,000** require **Manager approval only**.
   * Requests **> KES 50,000** require **Dual Approval** (Manager sign-off followed by Finance Officer authorization).
3. **Self-Approval Prohibition:** A manager who creates a payment request cannot approve their own request.
4. **Mandatory Rejection Reason:** Any rejection across manager or finance tiers requires an explanatory reason.
5. **Anti-Duplicate Payout Safeguards:** Failed attempts vs. Ambiguous/Unconfirmed provider states are strictly separated. Unconfirmed attempts require manual reconciliation before retry.
6. **Mock Provider Simulation:** Disbursements communicate mock gateway simulation (M-Pesa B2C / Bank RTGS) without claiming real fiat settlement.

---

## 3. Local Environment & Setup

### Prerequisites
* Node.js 18+ (tested with modern LTS)
* npm 9+

### Environment Configuration
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

| Variable | Description | Default |
|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | Origin of the Django backend server | `http://localhost:8000` |

### Scripts
```bash
npm run dev     # Start development server on port 3000
npm run lint    # Run ESLint validation
npm run build   # Run production TypeScript compilation & build
npm run start   # Run production server
```

---

## 4. API Client & Architecture (`src/lib/api/`)

The application integrates via a typed centralized layer:
* `src/lib/api/client.ts`: Unified `fetch` wrapper with credentials inclusion, automatic `X-CSRFToken` cookie resolution, and normalized `ApiClientError` handling.
* `src/lib/api/types.ts`: Exhaustive TypeScript contracts matching backend models.
* `src/lib/api/services.ts`: Domain service calls for `authService`, `vendorService`, `paymentService`, `approvalService`, and `auditService`.

---

## 5. Collaboration & Git Workflow

* All Git operations (commits, branch switches, merges) are performed manually by the repository owner.
* The frontend agent never executes Git commands directly.
