# 💸 MoneyFlow

A secure backend API for managing financial transactions with a strong focus on **security, reliability, and production-grade practices**.

---

## 🚀 Features

* 🔐 JWT Authentication
* ♻️ Idempotent transaction handling
* 🚫 Token Blacklisting (secure logout)
* 📧 Email notifications using Nodemailer
* ⏳ TTL-based data expiration 
* 📊 Transaction management APIs

---

## 🧠 Core Concepts Implemented

### 1. ♻️ Idempotency

Idempotency ensures that **multiple identical requests produce the same result**.

#### ✅ Why it matters

* Prevents duplicate transactions
* Ensures safe retries (important in financial systems)

#### 🔧 Implementation

* Each request includes an **Idempotency Key**
* Server stores processed keys 
* If duplicate request comes:

  * Return previous response
  * Do NOT re-process transaction


### 2. 🚫 Token Blacklisting

Used to **invalidate JWT tokens after logout**.

#### ✅ Why it matters

* JWT is stateless → cannot be destroyed by default
* Blacklisting adds control over active sessions

#### 🔧 Implementation

* On logout:

  * Token is stored in blacklist 
* On each request:

  * Check if token exists in blacklist
  * If yes → reject request

#### 📌 Flow

```
Login → Get Token
Logout → Add token to blacklist
Request → Check blacklist → Reject if found
```

---

### 3. 📧 Nodemailer Integration

Used for sending  emails.

#### ✅ Use cases

* Account verification
* Password reset
* Transaction alerts

#### 🔧 Implementation

* Configured using SMTP (Gmail)
* Supports:

  * OAuth2 

#### 📌 Example



### 4. ⏳ TTL (Time-To-Live)

TTL is used to **automatically expire data after a certain time**.

#### ✅ Use cases

* Expiring OTPs
* Token blacklist cleanup
* Temporary session data

#### 🔧 Implementation

* MongoDB TTL index

#### 📌 Example (Mongo TTL)

---

## 🛠️ Tech Stack

* Node.js
* Express.js
* MongoDB
* Nodemailer
* JWT

---


## ⚙️ Environment Variables

```
MONGO_URI=your_mongo_uri
JWT_SECRET=your_secret
EMAIL=your_email
CLIENT_ID=your_client_id
CLIENT_SECRET=your_client_secret
REFRESH_TOKEN=your_refresh_token
```

## 🔐 Security Highlights

* Idempotent APIs prevent duplicate financial operations
* Token blacklisting ensures secure logout
* TTL ensures automatic cleanup of sensitive data
* Secure email handling via Nodemailer

---


