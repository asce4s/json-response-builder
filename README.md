# json-response-builder

[![NPM version](https://img.shields.io/npm/v/json-response-builder)](https://www.npmjs.com/package/json-response-builder)
[![NPM downloads](https://img.shields.io/npm/dt/json-response-builder)](https://www.npmjs.com/package/json-response-builder)
[![License](https://img.shields.io/npm/l/json-response-builder)](https://github.com/asce4s/json-response-builder/blob/master/LICENSE)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/asce4s/json-response-builder/actions)

This package helps to build JSON responses on the server-side, which is especially helpful in serverless environments.

## Installation

```bash
npm i json-response-builder
```

## Simple Usage

```javascript
import {res} from "json-response-builder"

// The `res.json()` call initiates the response builder
// with the provided JSON body.
return res.json({
          "key":"value" // Your JSON body here
       })

```
This would output a response as bellow
```
 {
  headers: { 'content-type': 'application/json' },
  statusCode: 400,
  isBase64Encoded: false,
  body: '{"key":"value"}'
 }
```

## API Reference (Available Methods)

The `json-response-builder` uses a fluent interface (chainable methods) to construct the response. All methods, except for `build()`, return the `ResponseBuilder` instance, allowing you to chain calls.

Here are the available methods:

### `.json(body)`
- **Purpose:** Sets the main body of the response and automatically sets the `Content-Type` header to `application/json`.
- **Parameters:**
    - `body` (Object): The JavaScript object to be serialized into a JSON string for the response body. It handles `BigInt` serialization by converting them to strings.
- **Returns:** The `ResponseBuilder` instance for chaining.

### `.headers(customHeaders)`
- **Purpose:** Adds or overrides headers for the response.
- **Parameters:**
    - `customHeaders` (Object): An object where keys are header names and values are header values. These are merged with any existing headers (e.g., `content-type` set by `.json()`).
- **Returns:** The `ResponseBuilder` instance for chaining.

### `.statusCode(code)`
- **Purpose:** Sets the HTTP status code for the response.
- **Parameters:**
    - `code` (Number): The HTTP status code (e.g., `200`, `404`, `500`).
- **Returns:** The `ResponseBuilder` instance for chaining.
- **Default:** If not called, the status code defaults to `200`.

### `.gzip()`
- **Purpose:** Enables gzip compression for the response body.
    - When `build()` is called, if `.gzip()` has been invoked:
        - The `Content-Encoding` header will be set to `gzip`.
        - The `accept-encoding` header will be set to `gzip,deflate`.
        - The response body will be gzipped and then base64 encoded.
        - The `isBase64Encoded` property in the final response object will be set to `true`.
- **Parameters:** None.
- **Returns:** The `ResponseBuilder` instance for chaining.

### `.base64Encoded(isEncoded)`
- **Purpose:** Explicitly sets the `isBase64Encoded` flag on the response. This is generally handled automatically by `.gzip()`, but can be controlled manually if needed for specific use cases where the body is already base64 encoded and gzip is not applied.
- **Parameters:**
    - `isEncoded` (Boolean): Set to `true` if the body is base64 encoded, `false` otherwise.
- **Returns:** The `ResponseBuilder` instance for chaining.

### `.build()`
- **Purpose:** Constructs and returns the final response object based on the chained method calls. If `.gzip()` was called, compression and base64 encoding of the body happen at this stage.
- **Parameters:** None.
- **Returns:** (Object) The final response object, structured as expected by platforms like AWS Lambda (or similar serverless environments), including `headers`, `statusCode`, `body`, and `isBase64Encoded` properties.

## Examples

The following examples demonstrate how to use the methods described in the API Reference.

### Simple Usage

You can add custom headers to your response using the `.headers()` method.

```javascript
import { res } from "json-response-builder";

// Example: Setting a custom X-Custom-Header
const response = res
  .json({ message: "Hello with custom headers!" })
  .headers({ "X-Custom-Header": "MyValue" })
  .build();

console.log(response);
```

This would output a response similar to this:

```json
{
  "headers": {
    "content-type": "application/json",
    "X-Custom-Header": "MyValue"
  },
  "statusCode": 200, // Default statusCode is 200 if not specified
  "isBase64Encoded": false,
  "body": "{\"message\":\"Hello with custom headers!\"}"
}
```

### Using gzip Compression

For large JSON payloads, you might want to enable gzip compression using the `.gzip()` method. This will automatically set the `Content-Encoding: gzip` header and base64 encode the body.

```javascript
import { res } from "json-response-builder";
import zlib from "zlib"; // Required to show expected gzipped body

// Example: Response with gzip compression
const originalBody = { data: "This is a compressible string, ".repeat(5) };
const response = res
  .json(originalBody)
  .gzip()
  .build();

console.log(response);

// To verify the gzipped output (for demonstration purposes):
// const gzippedBody = zlib.gzipSync(JSON.stringify(originalBody)).toString("base64");
// console.log("Expected gzipped body (base64):", gzippedBody);
```

This would output a response like the following (the gzipped body will vary but will be a base64 encoded string):

```json
{
  "headers": {
    "content-type": "application/json",
    "content-encoding": "gzip"
  },
  "statusCode": 200,
  "isBase64Encoded": true,
  "body": "H4sIAAAAAAAAE1PyTSxJLS5RSEksSQxJNVHSUXLyDAnPyMxL1FHwzEtPzEssSy1S0FDigSoGKYBShyQxUAAAAA==" // Example gzipped and base64 encoded body
}
```
*Note: The actual base64 encoded `body` will depend on the input and the gzip algorithm. The example above is illustrative. The `accept-encoding` header is also included by the `.gzip()` method.*

### Setting a Custom Status Code

You can set a custom HTTP status code using the `.statusCode()` method. The default is `200` if not otherwise specified. The "Simple Usage" example earlier demonstrates setting it to `400`. Here's another example using `201`:

```javascript
import { res } from "json-response-builder";

// Example: Setting a 201 Created status code
const response = res
  .json({ id: "123", status: "created" })
  .statusCode(201)
  .build();

console.log(response);
```

This would output:

```json
{
  "headers": { "content-type": "application/json" },
  "statusCode": 201,
  "isBase64Encoded": false,
  "body": "{\"id\":\"123\",\"status\":\"created\"}"
}
```

### Chaining Multiple Options

You can chain multiple options together to build a complex response.

```javascript
import { res } from "json-response-builder";

// Example: Chaining headers, specific status code, and preparing for gzip
const response = res
  .json({ message: "Item processed successfully", items: [1, 2, 3] })
  .headers({
    "X-Request-ID": "abcdef12345",
    "Cache-Control": "no-cache"
  })
  .statusCode(202) // Accepted
  .gzip() // Apply gzip compression
  .build();

console.log(response);
```

This would output (body is gzipped and base64 encoded):
```json
{
  "headers": {
    "content-type": "application/json",
    "X-Request-ID": "abcdef12345",
    "Cache-Control": "no-cache",
    "content-encoding": "gzip"
  },
  "statusCode": 202,
  "isBase64Encoded": true,
  "body": "H4sIAAAAAAAAE0vOyS9NSc7Py8xR0FHKSCxKzMxjYNDPz0vM0VDKSSxJzE3VDUgsSi0GALUq0ZUtAAAA" // Example gzipped and base64 encoded body
}
```

## Examples

The following examples demonstrate how to use the methods described in the API Reference.

### Simple Usage

```javascript
import {res} from "json-response-builder"

// The `res.json()` call initiates the response builder
// with the provided JSON body.
return res.json({
          "key":"value" // Your JSON body here
       })

```
This would output a response as bellow
```
 {
  headers: { 'content-type': 'application/json' },
  statusCode: 400, // Note: Simple Usage example uses 400, default is 200
  isBase64Encoded: false,
  body: '{"key":"value"}'
 }
```

### Setting Custom Headers

You can add custom headers to your response using the `.headers()` method.

```javascript
import { res } from "json-response-builder";

// Example: Setting a custom X-Custom-Header
const response = res
  .json({ message: "Hello with custom headers!" })
  .headers({ "X-Custom-Header": "MyValue" })
  .build();

console.log(response);
```

This would output a response similar to this:

```json
{
  "headers": {
    "content-type": "application/json",
    "X-Custom-Header": "MyValue"
  },
  "statusCode": 200, // Default statusCode is 200 if not specified
  "isBase64Encoded": false,
  "body": "{\"message\":\"Hello with custom headers!\"}"
}
```

### Using gzip Compression

For large JSON payloads, you might want to enable gzip compression using the `.gzip()` method. This will automatically set the `content-encoding: gzip` header and base64 encode the body.

```javascript
import { res } from "json-response-builder";
import zlib from "zlib"; // Required to show expected gzipped body

// Example: Response with gzip compression
const originalBody = { data: "This is a compressible string, ".repeat(5) };
const response = res
  .json(originalBody)
  .gzip()
  .build();

console.log(response);

// To verify the gzipped output (for demonstration purposes):
// const gzippedBody = zlib.gzipSync(JSON.stringify(originalBody)).toString("base64");
// console.log("Expected gzipped body (base64):", gzippedBody);
```

This would output a response like the following (the gzipped body will vary but will be a base64 encoded string):

```json
{
  "headers": {
    "content-type": "application/json",
    "content-encoding": "gzip",
    "accept-encoding": "gzip,deflate" // Added by gzip()
  },
  "statusCode": 200,
  "isBase64Encoded": true,
  "body": "H4sIAAAAAAAAE1PyTSxJLS5RSEksSQxJNVHSUXLyDAnPyMxL1FHwzEtPzEssSy1S0FDigSoGKYBShyQxUAAAAA==" // Example gzipped and base64 encoded body
}
```
*Note: The actual base64 encoded `body` will depend on the input and the gzip algorithm. The example above is illustrative.*

### Setting a Custom Status Code

You can set a custom HTTP status code using the `.statusCode()` method. The default is `200`.

```javascript
import { res } from "json-response-builder";

// Example: Setting a 201 Created status code
const response = res
  .json({ id: "123", status: "created" })
  .statusCode(201)
  .build();

console.log(response);
```

This would output:

```json
{
  "headers": { "content-type": "application/json" },
  "statusCode": 201,
  "isBase64Encoded": false,
  "body": "{\"id\":\"123\",\"status\":\"created\"}"
}
```

### Chaining Multiple Options

You can chain multiple options together to build a complex response.

```javascript
import { res } from "json-response-builder";

// Example: Chaining headers, specific status code, and preparing for gzip
const response = res
  .json({ message: "Item processed successfully", items: [1, 2, 3] })
  .headers({
    "X-Request-ID": "abcdef12345",
    "Cache-Control": "no-cache"
  })
  .statusCode(202) // Accepted
  .gzip() // Apply gzip compression
  .build();

console.log(response);
```

This would output (body is gzipped and base64 encoded):
```json
{
  "headers": {
    "content-type": "application/json",
    "X-Request-ID": "abcdef12345",
    "Cache-Control": "no-cache",
    "content-encoding": "gzip",
    "accept-encoding": "gzip,deflate" // Added by gzip()
  },
  "statusCode": 202,
  "isBase64Encoded": true,
  "body": "H4sIAAAAAAAAE0vOyS9NSc7Py8xR0FHKSCxKzMxjYNDPz0vM0VDKSSxJzE3VDUgsSi0GALUq0ZUtAAAA" // Example gzipped and base64 encoded body
}
```

## Contributing

We welcome contributions to `json-response-builder`! Whether it's reporting a bug, suggesting a new feature, or submitting code changes, your help is appreciated.

### Reporting Bugs or Requesting Features

- **Check Existing Issues:** Before submitting a new issue, please check if a similar one already exists.
- **Use GitHub Issues:** Report bugs or request features through GitHub Issues.
- **Be Detailed:** For bug reports, include steps to reproduce, expected behavior, and actual behavior. For feature requests, clearly describe the proposed functionality and its use case.

### Making Code Contributions

1.  **Fork the Repository:** Click the "Fork" button at the top right of the repository page.
2.  **Clone Your Fork:** Clone your forked repository to your local machine.
    ```bash
    git clone https://github.com/YOUR_USERNAME/json-response-builder.git
    cd json-response-builder
    ```
3.  **Create a Branch:** Create a new branch for your changes. Choose a descriptive name (e.g., `feature/add-xml-support`, `fix/gzip-encoding-issue`).
    ```bash
    git checkout -b feature/your-feature-name
    ```
4.  **Make Changes:** Implement your feature or bug fix.
5.  **Code Style:** While there isn't a strict linting setup enforced, please try to maintain a clean and consistent code style similar to the existing codebase.
6.  **Build:** This project uses TypeScript. Ensure your code compiles successfully using the build script:
    ```bash
    npm run build
    ```
    This will compile the TypeScript files to JavaScript in the `dist` directory.
7.  **Testing:** Please ensure your changes don't break existing functionality. If you're adding a new feature or fixing a bug, please add or update tests as appropriate. (Currently, the project does not have an automated test script in `package.json`, but contributions to improve testing are also welcome!)
8.  **Commit Changes:** Commit your changes with clear and concise commit messages.
    ```bash
    git commit -m "feat: Add support for XML responses"
    ```
9.  **Push to Your Fork:** Push your changes to your forked repository.
    ```bash
    git push origin feature/your-feature-name
    ```
10. **Open a Pull Request (PR):**
    - Go to the original `json-response-builder` repository on GitHub.
    - You should see a prompt to create a Pull Request from your new branch.
    - Provide a clear title and description for your PR, explaining the changes and referencing any related issues.

### Discussing Major Changes
For significant changes, like adding a major new feature or refactoring core functionality, please open an issue first to discuss your ideas before investing a lot of time in development. This helps ensure your contributions align with the project's goals.

Thank you for contributing!

## License
[MIT](https://choosealicense.com/licenses/mit/)
