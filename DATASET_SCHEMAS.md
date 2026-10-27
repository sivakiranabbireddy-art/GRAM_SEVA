# GramSeva — Complete Database Dataset Schemas & Formats

This document specifies the exact schema definitions, constraints, data types, indexes, and sample JSON payloads for all 7 MongoDB Atlas collections in the **GramSeva** platform.

---

## Architecture Overview

- **Database Engine**: MongoDB Atlas Cloud (`gramseva`)
- **Connection URI**: `mongodb+srv://...cluster0.4uo5v6e.mongodb.net/gramseva`
- **Object Data Modeling (ODM)**: Mongoose v9+
- **Security & Integrity**: 
  - Passwords hashed using `bcryptjs` with salt round 10.
  - Verification codes hashed with `bcryptjs` and protected by TTL indexes.
  - Unique indexes on user IDs, emails, and primary keys.

---

## Table of Collections

| # | Collection Name | Mongoose Model | Primary Key | Description |
|---|-----------------|----------------|-------------|-------------|
| 1 | **`users`** | `User` | `id` (String) | Unified credentials & profiles for Admins, Customers, and Workers |
| 2 | **`workers`** | `Worker` | `id` (String) | Professional trade attributes, skills, verification state & earnings |
| 3 | **`bookings`** | `Booking` | `id` (String) | Service booking lifecycle, assignments, and audit timeline |
| 4 | **`categories`** | `Category` | `id` (String) | Master catalog of rural home & trade services with base pricing |
| 5 | **`feedbacks`** | `Feedback` | `id` (String) | Post-service reviews, 1–5 star ratings, and quality tags |
| 6 | **`notifications`** | `Notification` | `id` (String) | Real-time alerts and activity updates across roles |
| 7 | **`otps`** | `Otp` | `email` (String) | Ephemeral hashed 6-digit OTP codes for verification & reset |

---

## 1. `users` Collection

Stores identity, contact info, role permissions, and credentials for all system participants.

- **Model Location**: `server/src/models/User.js`
- **MongoDB Collection**: `users`

### Schema Fields

| Field | Type | Required | Unique | Default | Description |
|:---|:---|:---:|:---:|:---|:---|
| `id` | String | **Yes** | **Yes** | — | Unique platform identifier (e.g. `usr_admin_01`, `usr_cust_01`) |
| `role` | String | **Yes** | No | — | Enum: `'ADMIN'`, `'CUSTOMER'`, `'WORKER'` |
| `name` | String | **Yes** | No | — | User's full name |
| `email` | String | **Yes** | **Yes** | — | Unique email address (lowercase, trimmed) |
| `phone` | String | **Yes** | No | — | Primary mobile phone number |
| `passwordHash` | String | **Yes** | No | — | Bcrypt-hashed password (excluded in API output) |
| `address` | String | No | No | `""` | Door / House number, street |
| `locality` | String | No | No | `""` | Village, Mandal, or Town name |
| `pincode` | String | No | No | `""` | 6-digit postal code |
| `isVerified` | Boolean | No | No | `false` | Verification state |
| `isActive` | Boolean | No | No | `true` | Account active toggle |
| `createdAt` | Date | Auto | No | Current timestamp | Timestamp of registration |
| `updatedAt` | Date | Auto | No | Current timestamp | Timestamp of last modification |

### Sample JSON Document

```json
{
  "_id": "6ad0387e030c14201af2c246",
  "id": "usr_admin_02",
  "role": "ADMIN",
  "name": "Teja Valluri",
  "email": "valluriteja5@gmail.com",
  "phone": "+91 98765 43210",
  "passwordHash": "$2a$10$abc123hashedPasswordStringHere",
  "address": "Admin Suite 101",
  "locality": "Central Administration",
  "pincode": "500001",
  "isVerified": true,
  "isActive": true,
  "createdAt": "2026-10-15T02:20:46.918Z",
  "updatedAt": "2026-10-15T02:25:00.000Z"
}
```

---

## 2. `workers` Collection

Stores professional trade qualifications, review aggregates, matching parameters, and administrative verification status. Linked 1-to-1 with a Worker user via matching `id`.

- **Model Location**: `server/src/models/Worker.js`
- **MongoDB Collection**: `workers`

### Schema Fields

| Field | Type | Required | Unique | Default | Description |
|:---|:---|:---:|:---:|:---|:---|
| `id` | String | **Yes** | **Yes** | — | Foreign key matching `users.id` |
| `skills` | [String] | No | No | `[]` | List of trade skills (e.g. `["Electrical Services", "House Wiring"]`) |
| `experienceYears` | Number | No | No | `0` | Years of trade experience |
| `serviceArea` | String | No | No | `""` | Primary operating village / locality |
| `pincode` | String | No | No | `""` | Primary operating 6-digit PIN code |
| `description` | String | No | No | `""` | Worker bio, credentials, and specialties |
| `isAvailable` | Boolean | No | No | `true` | Availability toggle for job matching dispatch |
| `status` | String | No | No | `'PENDING_APPROVAL'` | Enum: `'APPROVED'`, `'PENDING_APPROVAL'`, `'REJECTED'`, `'SUSPENDED'` |
| `averageRating` | Number | No | No | `5.0` | Calculated running average rating (1.0 to 5.0) |
| `totalRatings` | Number | No | No | `0` | Number of completed reviews |
| `totalCompletedBookings` | Number | No | No | `0` | Count of successfully completed jobs |
| `earningsTotal` | Number | No | No | `0` | Total earnings accumulated in INR (₹) |
| `createdAt` | Date | Auto | No | Current timestamp | Timestamp of registration |
| `updatedAt` | Date | Auto | No | Current timestamp | Timestamp of last profile update |

### Sample JSON Document

```json
{
  "_id": "6ad03490155cecc98d92847b",
  "id": "usr_work_01",
  "skills": [
    "Electrical Services",
    "House Wiring",
    "Ceiling Fan Repair",
    "Motor Starter Fixing"
  ],
  "experienceYears": 6,
  "serviceArea": "Shanti Nagar",
  "pincode": "500001",
  "description": "Certified residential electrician with fast response times across Shanti Nagar.",
  "isAvailable": true,
  "status": "APPROVED",
  "averageRating": 4.8,
  "totalRatings": 14,
  "totalCompletedBookings": 16,
  "earningsTotal": 5600,
  "createdAt": "2026-09-05T09:00:00.000Z",
  "updatedAt": "2026-10-14T18:30:00.000Z"
}
```

---

## 3. `bookings` Collection

Tracks the end-to-end lifecycle of service requests, including customer requests, algorithmic/manual worker assignments, worker accept/reject actions, completions, cancellations, and disputes.

- **Model Location**: `server/src/models/Booking.js`
- **MongoDB Collection**: `bookings`

### Schema Fields

| Field | Type | Required | Unique | Default | Description |
|:---|:---|:---:|:---:|:---|:---|
| `id` | String | **Yes** | **Yes** | — | Unique booking identifier (e.g. `bk_1729000101010`) |
| `customerId` | String | **Yes** | No | — | Foreign key to `users.id` |
| `customerName` | String | No | No | `""` | Name snapshot of the customer |
| `customerPhone` | String | No | No | `""` | Contact phone for service execution |
| `customerAddress` | String | No | No | `""` | Physical service destination address |
| `locality` | String | No | No | `""` | Village or locality name |
| `pincode` | String | No | No | `""` | Postal PIN code |
| `categoryId` | String | No | No | `'cat_general'` | Foreign key to `categories.id` |
| `categoryName` | String | No | No | `'General Service'` | Category name display |
| `description` | String | **Yes** | No | — | Detailed problem / task description |
| `preferredDate` | String | **Yes** | No | — | Desired service date (`YYYY-MM-DD`) |
| `preferredTimeSlot` | String | **Yes** | No | — | Time window (e.g. `'Morning (09:00 AM - 12:00 PM)'`) |
| `priceEstimate` | Number | No | No | `299` | Estimated service fee in INR (₹) |
| `status` | String | No | No | `'REQUESTED'` | State machine enum (see below) |
| `assignedWorkerId` | String | No | No | `null` | Assigned worker's `id` |
| `assignedWorkerName` | String | No | No | `null` | Assigned worker's name |
| `assignedWorkerPhone` | String | No | No | `null` | Assigned worker's phone |
| `cancelReason` | String | No | No | `null` | Reason if cancelled |
| `rejectionReason` | String | No | No | `null` | Reason if rejected by assigned worker |
| `lastRejectedWorkerId` | String | No | No | `null` | Tracks last worker who declined |
| `completionNote` | String | No | No | `null` | Worker's final job notes |
| `completionTime` | String | No | No | `null` | ISO timestamp of job completion |
| `disputeReason` | String | No | No | `null` | Dispute summary if flagged |
| `disputeCreatedAt` | String | No | No | `null` | Timestamp when dispute was raised |
| `disputeResolution` | String | No | No | `null` | Admin dispute resolution notes |
| `timeline` | [Object] | No | No | `[]` | Chronological audit trail (items defined below) |

#### Status Enum Values
- `'REQUESTED'` — New booking created, awaiting worker assignment
- `'WORKER_ASSIGNED'` — Matched worker assigned, awaiting worker acceptance
- `'ACCEPTED'` — Worker accepted the booking
- `'REJECTED_BY_WORKER'` — Worker declined, re-enters matching queue
- `'IN_PROGRESS'` — Worker has arrived and started the service
- `'AWAITING_CONFIRMATION'` — Worker finished, awaiting customer sign-off
- `'COMPLETED'` — Booking completed and payment confirmed
- `'CANCELLED'` — Cancelled by customer or admin
- `'DISPUTED'` — Flagged for administrative arbitration

#### Sub-Schema: `timeline` Item
```json
{
  "status": "REQUESTED",
  "timestamp": "2026-10-15T01:00:00.000Z",
  "note": "Service request submitted by customer",
  "by": "Ramesh Kumar"
}
```

### Sample JSON Document

```json
{
  "_id": "6ad03490155cecc98d928492",
  "id": "bk_1729000101010",
  "customerId": "usr_cust_01",
  "customerName": "Ramesh Kumar",
  "customerPhone": "9876543210",
  "customerAddress": "House No. 42, Near Panchayat Bhavan",
  "locality": "Shanti Nagar",
  "pincode": "500001",
  "categoryId": "cat_electrical",
  "categoryName": "Electrical Services",
  "description": "Main circuit breaker keeps tripping when motor pump is turned on.",
  "preferredDate": "2026-10-16",
  "preferredTimeSlot": "Morning (09:00 AM - 12:00 PM)",
  "contactNumber": "9876543210",
  "attachmentUrl": "",
  "priceEstimate": 299,
  "status": "WORKER_ASSIGNED",
  "assignedWorkerId": "usr_work_01",
  "assignedWorkerName": "Suresh Patil",
  "assignedWorkerPhone": "9876500001",
  "cancelReason": null,
  "rejectionReason": null,
  "lastRejectedWorkerId": null,
  "completionNote": null,
  "completionTime": null,
  "disputeReason": null,
  "timeline": [
    {
      "status": "REQUESTED",
      "timestamp": "2026-10-15T01:00:00.000Z",
      "note": "Booking submitted by customer",
      "by": "Customer"
    },
    {
      "status": "WORKER_ASSIGNED",
      "timestamp": "2026-10-15T01:02:00.000Z",
      "note": "Algorithmic matching dispatched to Suresh Patil (Score: 94%)",
      "by": "System Matching Engine"
    }
  ],
  "createdAt": "2026-10-15T01:00:00.000Z",
  "updatedAt": "2026-10-15T01:02:00.000Z"
}
```

---

## 4. `categories` Collection

Service trade catalog defining available home skills, visual iconography, and base pricing.

- **Model Location**: `server/src/models/Category.js`
- **MongoDB Collection**: `categories`

### Schema Fields

| Field | Type | Required | Unique | Default | Description |
|:---|:---|:---:|:---:|:---|:---|
| `id` | String | **Yes** | **Yes** | — | Unique key (e.g. `'cat_electrical'`, `'cat_plumbing'`) |
| `name` | String | **Yes** | No | — | Category display title |
| `icon` | String | No | No | `'Wrench'` | Lucide icon identifier |
| `description` | String | No | No | `""` | Scope of services covered |
| `basePriceEstimate` | Number | No | No | `299` | Starting baseline estimate in INR (₹) |
| `isActive` | Boolean | No | No | `true` | Catalog availability toggle |
| `createdAt` | Date | Auto | No | Current timestamp | Creation timestamp |
| `updatedAt` | Date | Auto | No | Current timestamp | Last update timestamp |

### Sample JSON Document

```json
{
  "_id": "6ad03490155cecc98d928460",
  "id": "cat_electrical",
  "name": "Electrical Services",
  "icon": "Zap",
  "description": "Home wiring, switchboards, lighting fixtures, circuit breakers, and short-circuit repair.",
  "basePriceEstimate": 299,
  "isActive": true,
  "createdAt": "2026-09-01T08:00:00.000Z",
  "updatedAt": "2026-09-01T08:00:00.000Z"
}
```

---

## 5. `feedbacks` Collection

Customer evaluations, star ratings, and tags submitted upon booking completion.

- **Model Location**: `server/src/models/Feedback.js`
- **MongoDB Collection**: `feedbacks`

### Schema Fields

| Field | Type | Required | Unique | Default | Description |
|:---|:---|:---:|:---:|:---|:---|
| `id` | String | **Yes** | **Yes** | — | Unique feedback ID (e.g. `fb_1729000505050`) |
| `bookingId` | String | **Yes** | No | — | Foreign key to `bookings.id` |
| `customerId` | String | **Yes** | No | — | Foreign key to customer `users.id` |
| `customerName` | String | No | No | `""` | Customer's full name |
| `workerId` | String | No | No | `null` | Foreign key to worker `users.id` |
| `workerName` | String | No | No | `""` | Worker's full name |
| `categoryName` | String | No | No | `""` | Service category name |
| `rating` | Number | **Yes** | No | — | Rating integer from `1` to `5` |
| `review` | String | No | No | `""` | Written customer comments |
| `tags` | [String] | No | No | `[]` | Quality tags (e.g. `["Punctual", "Clean Work", "Polite"]`) |
| `resolutionStatus` | String | No | No | `'RESOLVED'` | Administrative review status |
| `createdAt` | Date | Auto | No | Current timestamp | Submission timestamp |
| `updatedAt` | Date | Auto | No | Current timestamp | Last update timestamp |

### Sample JSON Document

```json
{
  "_id": "6ad03490155cecc98d928499",
  "id": "fb_1729000505050",
  "bookingId": "bk_1729000101010",
  "customerId": "usr_cust_01",
  "customerName": "Ramesh Kumar",
  "workerId": "usr_work_01",
  "workerName": "Suresh Patil",
  "categoryName": "Electrical Services",
  "rating": 5,
  "review": "Arrived promptly on time and fixed the short-circuit issue cleanly.",
  "tags": ["Punctual", "Expert", "Fair Price"],
  "resolutionStatus": "RESOLVED",
  "createdAt": "2026-10-15T04:00:00.000Z",
  "updatedAt": "2026-10-15T04:00:00.000Z"
}
```

---

## 6. `notifications` Collection

In-app alerts and notifications displayed in the bell notification menu.

- **Model Location**: `server/src/models/Notification.js`
- **MongoDB Collection**: `notifications`

### Schema Fields

| Field | Type | Required | Unique | Default | Description |
|:---|:---|:---:|:---:|:---|:---|
| `id` | String | **Yes** | **Yes** | — | Unique notification ID (e.g. `notif_1729000202020`) |
| `userId` | String | No | No | `null` | Target user ID (`null` if broadcast) |
| `role` | String | No | No | `'ALL'` | Target role: `'CUSTOMER'`, `'WORKER'`, `'ADMIN'`, `'ALL'` |
| `title` | String | **Yes** | No | — | Short alert heading |
| `message` | String | **Yes** | No | — | Descriptive body message |
| `link` | String | No | No | `""` | Client deep-link path (e.g. `'/customer/bookings'`) |
| `metadata` | Object | No | No | `{}` | Contextual data payload (e.g. `{ "bookingId": "bk_123" }`) |
| `isRead` | Boolean | No | No | `false` | Read / Unread status |
| `createdAt` | Date | Auto | No | Current timestamp | Dispatch timestamp |
| `updatedAt` | Date | Auto | No | Current timestamp | Last update timestamp |

### Sample JSON Document

```json
{
  "_id": "6ad03490155cecc98d9284a1",
  "id": "notif_1729000202020",
  "userId": "usr_cust_01",
  "role": "CUSTOMER",
  "title": "Worker Assigned ⚡",
  "message": "Suresh Patil has accepted your Electrical Services request.",
  "link": "/customer/bookings",
  "metadata": {
    "bookingId": "bk_1729000101010"
  },
  "isRead": false,
  "createdAt": "2026-10-15T01:05:00.000Z",
  "updatedAt": "2026-10-15T01:05:00.000Z"
}
```

---

## 7. `otps` Collection

Stores ephemeral verification codes with automatic TTL expiry for password resets and registrations.

- **Model Location**: `server/src/models/Otp.js`
- **MongoDB Collection**: `otps`
- **Special Index**: MongoDB TTL Index on `createdAt` with `expireAfterSeconds: 3600` (auto-deletes after 1 hour).

### Schema Fields

| Field | Type | Required | Unique | Default | Description |
|:---|:---|:---:|:---:|:---|:---|
| `email` | String | **Yes** | No (Indexed) | — | Recipient email address (lowercase, trimmed) |
| `otpHash` | String | **Yes** | No | — | Bcrypt hashed 6-digit code |
| `expiresAt` | Number | **Yes** | No | — | Epoch timestamp in milliseconds (10 mins lifespan) |
| `attempts` | Number | No | No | `0` | Failed verification attempts (max 5) |
| `createdAt` | Date | Auto | No | Current timestamp | Auto-deleted after 1 hour via TTL index |
| `updatedAt` | Date | Auto | No | Current timestamp | Last update timestamp |

### Sample JSON Document

```json
{
  "_id": "6ad038a8e10b24019a2b53f1",
  "email": "valluriteja5@gmail.com",
  "otpHash": "$2a$08$91Z8hW4Xf9d8s7g6h5j4k3l2m1n0p9q8r7s6t5u4v3w2x1y0z",
  "expiresAt": 1792031555302,
  "attempts": 0,
  "createdAt": "2026-10-15T02:22:35.000Z",
  "updatedAt": "2026-10-15T02:22:35.000Z"
}
```

---

## Entity Relationship Summary

```
                      +-------------------+
                      |      Category     |
                      | (cat_electrical)  |
                      +---------+---------+
                                |
                                | categoryId
                                v
+------------------+     +------+------------+     +------------------+
|   User (Customer)|<----+      Booking      +---->|   User (Worker)  |
|  (usr_cust_01)   |     | (bk_1729000101010)|     |  (usr_work_01)   |
+--------+---------+     +------+------------+     +--------+---------+
         |                      |                           |
         |                      v                           |
         |               +------+------------+              |
         +-------------->|     Feedback      |<-------------+
                         | (fb_1729000505050)|
                         +-------------------+

+------------------+     +-------------------+
|   Notification   |     |        Otp        |
| (notif_172900...) |     |  (TTL 10 min code)|
+------------------+     +-------------------+
```
