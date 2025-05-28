# Restful Booker Automation Framework (Version 2)

## Introduction

This repository contains the **Restful Booker Automation Framework** for testing **Booking API Version 2**. Built with **Playwright**, **TypeScript**, and **Axios**, the framework emphasizes **scalability**, **security**, and **maintainability**, making it ideal for robust **API testing**.

## Stack

* [Playwright](https://playwright.dev/) – For browser automation and testing
* [TypeScript](https://www.typescriptlang.org/) – For static typing and cleaner code structure
* [Axios](https://axios-http.com/) – For handling HTTP requests

---

## Getting Started

Ensure **Node.js** is installed on your system. Then, install the required dependencies:

```bash
npm install
```

---

## Environment Setup

Before running tests, set up your environment variables and encryption settings.

### 1. Configure Environment Variables

Navigate to the `envs/` directory and copy the example file:

```bash
cp envs/.env.uat.example envs/.env.uat
```

Edit the `.env.uat` file with your credentials:

```env
TOKEN_USERNAME=your.username
TOKEN_PASSWORD=your.password
```

> ℹ️ The root `.env` file is managed automatically. Do not edit it manually.

---

## Encryption

Sensitive credentials are secured using **AES-GCM encryption** along with **Argon2 hashing** to ensure tamper-resistant storage and transmission.

### Command-Line Utilities

#### Generate a Secret Key

Run the following command to generate a unique encryption key:

```bash
npx cross-env PLAYWRIGHT_GREP=@generate-key npm run test:encryption:uat
```

#### Encrypt Credentials

Once the key is generated, run the encryption command:

```bash
npx cross-env PLAYWRIGHT_GREP=@encrypt npm run test:encryption:uat
```

#### Run Both: Generate Key & Encrypt

To perform both operations in a single command:

```bash
npx cross-env PLAYWRIGHT_GREP=@encryption npm run test:encryption:uat
```

> 💡 Replace `uat` with `dev`, `prod`, or any custom environment. Ensure a corresponding `.env.<env>` file exists in the `envs/` directory.

**Example:**

```bash
npx cross-env PLAYWRIGHT_GREP=@encryption npm run test:encryption:dev
```

> ⚠️ **Important:** Always generate a new secret key **before** encrypting credentials, especially when rotating secrets or updating environment data.

---

## Build and Test

### Running Tests

Use the following commands to run tests in specific environments:

| Command                       | Description                      |
| ----------------------------- | -------------------------------- |
| `npm run test:encryption:uat` | Run only encryption tests in UAT |
| `npm run test:api:uat`        | Run API tests in UAT             |
| `npm run test:failed:uat`     | Rerun only failed tests          |

> 💡 Replace `uat` with `dev`, `prod`, or another target environment.

---

## Additional Commands

Enhance productivity and code quality with these utilities:

| Command          | Description                        |
| ---------------- | ---------------------------------- |
| `npm run ui`     | Launch Playwright Test Runner UI   |
| `npm run record` | Open Playwright Code Generator     |
| `npm run report` | View HTML report from the last run |
| `npm run format` | Format code using Prettier         |

---

## Running Tests by Tag

Use the `PLAYWRIGHT_GREP` environment variable to filter tests.

### Local Examples

| Command                                                         | Description                         |
| --------------------------------------------------------------- | ----------------------------------- |
| `npx cross-env PLAYWRIGHT_GREP=sanity npm run test:api:uat`     | Run all **sanity** tests in UAT     |
| `npx cross-env PLAYWRIGHT_GREP=regression npm run test:api:uat` | Run all **regression** tests in UAT |

---

## Logger

The framework uses the **Winston** logger with environment-specific log levels:

* **`debug`** → `dev`
* **`info`** → `uat`
* **`error`** → `prod`

---

## Centralized Error Handling

A robust system for logging, categorizing, and reporting errors.

### Key Features

1. **Unified Categorization** via `ErrorCategory` enum:

   * Includes API, DB, UI, auth, I/O, service, network, and more.

2. **Security & Sanitization**:

   * Removes stack traces, sensitive paths, and headers.

3. **API Error Response Builder**:

   * Converts internal errors into REST-compliant responses.

4. **ErrorProcessor Utility**:

   * Deduplicates, cleans, categorizes, and logs errors.

### Usage Examples

```ts
ErrorHandler.captureError(error, 'methodName', 'context');
throw error;
```

In API-specific contexts:

```ts
ApiErrorResponseBuilder.captureApiError(error, 'methodName', 'context');
throw error;
```

---

## Sanitization

### `SanitizationConfig`

Utility to mask sensitive data in logs and API responses.

#### Default Masked Keys:

```ts
['password', 'apiKey', 'secret', 'authorization', 'token', 'accessToken', 'refreshToken', 'cookie']
```

#### Features:

* Object and header masking
* Path-based and key-value pair masking
* URL truncation
* Integrated with Winston logger

#### Example Usage:

```ts
const sanitized = SanitizationConfig.sanitizeData(userData);
```

---

## AsyncFileManager

A secure, modern, promise-based utility for file operations.

### Features

* Safe asynchronous read/write
* Directory handling
* Path validation
* Built-in logging

#### Example:

```ts
const config = await AsyncFileManager.readFile('config.json');
await AsyncFileManager.writeFile('out.txt', 'Hello');
```

---

## Reporting

View the latest Playwright HTML test report:

```bash
npm run report
```

---

## Restful Booker API Documentation

Access the official documentation here:
🔗 [https://restful-booker.herokuapp.com/apidoc/index.html](https://restful-booker.herokuapp.com/apidoc/index.html)

It provides detailed info on endpoints, request/response formats, and authentication.

---

## Dependency Installation (for new projects)

```bash
npm install --save-dev cspell eslint eslint-config-prettier eslint-plugin-prettier ortoni-report prettier --save-exact
npm install argon2 axios cross-env dotenv moment-timezone playwright-trx-reporter typescript typescript-eslint winston
```

---

## Notes

* ❌ **Never commit `.env` files** to version control.
* 🔐 Always regenerate encryption keys after changing credentials.
* 📦 Run `npm install` after switching branches or pulling updates.
* ⚡ Reuse authentication state to speed up tests and reduce flakiness.
* ✅ The framework is CI-ready and built for long-term growth.

---