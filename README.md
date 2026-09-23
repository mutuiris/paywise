# Paywise

## Vendor Payment and Approval Management System

Paywise is a payment management system designed for **ImaraWorks Ltd.**, a medium-sized Kenyan construction company managing projects across the country.

The system replaces an informal payment process based on WhatsApp messages, spreadsheets, emails, invoices, and payment confirmations with a structured and traceable workflow for vendor payments.

## Problem

As ImaraWorks has grown, its payment process has become increasingly difficult to manage.

Payment requests can be lost, approvals can become bottlenecks, duplicate payments are possible, reconciliation is largely manual, and employees have limited visibility into the status of their requests.

It can also be difficult to determine who requested, approved, processed, or rejected a payment and when those actions occurred.

## Solution

Paywise provides a centralised workflow for managing vendor payment requests from submission through approval and payment tracking.

The system supports:

- Payment request management
- Vendor and project management
- Role-based access
- Approval workflows
- Payment processing through a mock provider
- Duplicate-payment protection
- Audit history
- Search and filtering
- Basic payment reporting

## Payment Workflow

```mermaid
flowchart LR
    Draft --> Submitted
    Submitted --> Pending["Pending Approval"]
    Pending --> Approved
    Pending --> Rejected
    Approved --> Processing
    Processing --> Paid
    Processing --> Failed
````

Payment approvals follow the initial business rules:

* KES 50,000 or less requires manager approval
* Above KES 50,000 requires manager and finance approval
* Users cannot approve requests they created
* Rejected requests require a reason

## Architecture

Paywise uses a modular backend architecture with a separate frontend, PostgreSQL database, application services, and a mock payment provider.

```mermaid
flowchart TB
    User[User] --> Frontend[Frontend]
    Frontend --> Backend[Backend API]
    Backend --> Database[(PostgreSQL)]
    Backend --> Provider[Mock Payment Provider]
```

## Technology

### Backend

* Python
* Django
* PostgreSQL
* Psycopg
* uv
* Docker

### Frontend

A dedicated frontend application for interacting with the Paywise backend.

## Scope

The system focuses on the core vendor payment and approval workflow.

Real M-Pesa, banking, accounting, SMS, email, payroll, tax, and vendor KYC integrations are outside the initial scope and are mocked where necessary.