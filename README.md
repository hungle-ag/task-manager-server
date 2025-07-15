task-manager-server
├── index.js
├── package.json
├── README.md
├── src
│ ├── app.js
│ ├── config
│ │ ├── db.collections.js
│ │ ├── db.js
│ │ ├── mailer.js
│ │ └── socket.js
│ ├── constants
│ │ └── common.js
│ ├── middlewares
│ │ ├── checkAuth.js
│ │ └── upload.js
│ ├── modules
│ │ ├── auth
│ │ ├── employees
│ │ ├── messages
│ │ └── tasks
│ ├── socket
│ │ ├── chat.handler.js
│ │ └── joinRoom.js
│ └── utils
│ ├── convertTimestampsToISOString.js
│ ├── generateCode.js
│ ├── jwt.js
│ ├── optExpiry.js
│ ├── sendOtpMail.js
│ ├── sendSMS.js
│ ├── sendTaskAssignedEmail.js
│ └── sendWelcomeEmail.js
└── yarn.lock

# Task Manager (Coding Challenge)

## 1. Overview

This is a mini task management app built for Skipli’s coding challenge.  
It includes:

- Login with OTP (SMS/email)
- Realtime employee management
- Task assignment
- Chat messaging via socket.io

---

## 2. Tech Stack

- Frontend: React + Vite + Redux Toolkit / thunk middleware
- Backend: Express (JS)
- Database: Firebase Firestore
- Auth: OTP via Twilio (SMS) and Nodemailer (Email)
- Realtime: Socket.IO

---

## 3. Getting Started

### Prerequisites

- Node.js >= 18 // v22.17.0
- Firebase project
- Twilio account (optional for SMS)
- Nodemailer (optional for Mail)

### Setup

```bash
# https
git clone https://github.com/hungle-ag/task-manager-server.git
# SSH
git clone git@github.com:hungle-ag/task-manager-server.git

cd task-manager
```

```bash
cd task-manager-server
yarn install
yarn run dev
```

## 4. Environment Variables

### OTP & Auth

| Variable     | Description                                   |
| ------------ | --------------------------------------------- |
| `JWT_SECRET` | Secret key used to sign authentication tokens |

### SMS Providers

| Variable                       | Description                              |
| ------------------------------ | ---------------------------------------- |
| `TWILIO_ACCOUNT_SID`           | Twilio Account SID                       |
| `TWILIO_AUTH_TOKEN`            | Twilio Auth Token                        |
| `TWILIO_MESSAGING_SERVICE_SID` | Messaging service SID (used to send OTP) |
| `TWILIO_PHONE_NUMBER`          | Twilio sender phone number               |

### Email OTP

| Variable       | Description                                      |
| -------------- | ------------------------------------------------ |
| `EMAIL`        | Email address used to send OTP (via SMTP)        |
| `APP_PASSWORD` | App-specific password (e.g., Gmail app password) |

### Cloudinary (for media upload)

| Variable                | Description           |
| ----------------------- | --------------------- |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY`    | Cloudinary API key    |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |

### Firebase Admin SDK (FireStore, Auth)

#### Option 1: Using base64

You can either set individual keys or use the encoded base64 service account.

| Variable                          | Description                                   |
| --------------------------------- | --------------------------------------------- |
| `FIREBASE_SERVICE_ACCOUNT_BASE64` | Base64-encoded serviceAccountKey.json content |

#### Option 2: Using raw fields (if not using base64)

| Variable                        | Description                                             |
| ------------------------------- | ------------------------------------------------------- |
| `GOOGLE_PROJECT_ID`             | Firebase project ID                                     |
| `GOOGLE_PRIVATE_KEY_ID`         | Firebase private key ID                                 |
| `GOOGLE_PRIVATE_KEY`            | Firebase private key (watch out for newline characters) |
| `GOOGLE_CLIENT_EMAIL`           | Firebase client email                                   |
| `GOOGLE_CLIENT_ID`              | Firebase client ID                                      |
| `GOOGLE_AUTH_URI`               | Auth URI                                                |
| `GOOGLE_TOKEN_URI`              | Token URI                                               |
| `GOOGLE_AUTH_PROVIDER_CERT_URL` | Auth provider cert URL                                  |
| `GOOGLE_CLIENT_CERT_URL`        | Client cert URL                                         |
| `GOOGLE_UNIVERSE_DOMAIN`        | Firebase universe domain                                |

### Misc

| Variable   | Description                                                   |
| ---------- | ------------------------------------------------------------- |
| `NODE_ENV` | Should be set to `dev` in development to show OTP in response |
| `WEB_URL`  | Base URL of the frontend app (for email links, etc.)          |
