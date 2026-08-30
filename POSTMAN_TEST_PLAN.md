# Riviera Realty Postman Test Plan

## Setup

Create a Postman environment:

| Variable     | Value                   |
| ------------ | ----------------------- |
| `baseUrl`    | `http://localhost:5000` |
| `token`      | Empty initially         |
| `propertyId` | A valid property ID     |

Do not store real secrets, passwords, database URLs, or Cloudinary credentials in a shared collection. Use local Postman environments and mark sensitive values as secret.

For protected requests, add:

```text
Authorization: Bearer {{token}}
```

The API accepts JSON for auth/profile/property updates and multipart form data for property creation.

## Authentication

### 1. Register user

`POST {{baseUrl}}/auth/users`

Headers:

```text
Content-Type: application/json
```

Valid body:

```json
{
  "name": "Riviera Test User",
  "email": "riviera-test@example.com",
  "password": "strongpass123"
}
```

Expected: `201`, public user fields only: `id`, `name`, `email`.

Invalid examples:

```json
{
  "name": "A",
  "email": "not-an-email",
  "password": "123"
}
```

Expected: `400` validation response. Reusing an existing email should return `409` with a safe duplicate-email message.

### 2. Login

`POST {{baseUrl}}/auth/login`

Headers:

```text
Content-Type: application/json
```

Valid body:

```json
{
  "email": "riviera-test@example.com",
  "password": "strongpass123"
}
```

Expected: `200` with `token` and public `user` fields. Save the token manually to the `token` environment variable, or use this Postman Tests script:

```javascript
if (pm.response.code === 200) {
  pm.environment.set("token", pm.response.json().token);
}
```

Invalid body:

```json
{
  "email": "riviera-test@example.com",
  "password": "wrong-password"
}
```

Expected: `401` and the same safe invalid-credentials message used for an unknown email.

### 3. Current user

`GET {{baseUrl}}/auth/me`

Headers:

```text
Authorization: Bearer {{token}}
```

Expected: `200` with `user.id`, `user.name`, and `user.email`; never a password.

Invalid cases:

- No Authorization header: `401`
- `Authorization: Basic abc`: `401`
- `Authorization: Bearer invalid-token`: `401`
- Expired JWT: `401`

### 4. Update profile

`PATCH {{baseUrl}}/auth/me`

Headers:

```text
Content-Type: application/json
Authorization: Bearer {{token}}
```

Valid body:

```json
{
  "name": "Updated Riviera User",
  "email": "updated-riviera@example.com"
}
```

Expected: `200` with updated public user fields.

Invalid examples:

```json
{
  "name": "A",
  "email": "invalid"
}
```

Expected: `400`. Updating to another existing user's email should return `409` without disclosing unnecessary account details.

## Public Properties

### 5. List properties

`GET {{baseUrl}}/properties`

No required headers.

Valid examples:

```text
GET {{baseUrl}}/properties?page=1&limit=12
GET {{baseUrl}}/properties?search=villa&location=Erode
GET {{baseUrl}}/properties?propertyType=VILLA&listingType=BUY
GET {{baseUrl}}/properties?bedrooms=3&minPrice=1000000&maxPrice=10000000
GET {{baseUrl}}/properties?sortBy=price&order=asc
```

Supported query parameters:

- `search`
- `location`
- `propertyType`: `HOUSE`, `APARTMENT`, `VILLA`, `LAND`
- `listingType`: `BUY`, `RENT`
- `bedrooms`: non-negative integer
- `minPrice`, `maxPrice`: positive numbers
- `sortBy`: `price`, `bedrooms`, `area`, `createdAt`
- `order`: `asc`, `desc`
- `page`: positive integer
- `limit`: integer from 1 to 100

Expected: `200` with `page`, `limit`, `total`, and `properties`.

Invalid examples:

```text
GET {{baseUrl}}/properties?propertyType=CASTLE
GET {{baseUrl}}/properties?bedrooms=-1
GET {{baseUrl}}/properties?minPrice=9000000&maxPrice=1000000
GET {{baseUrl}}/properties?limit=101
```

Expected: `400` with validation errors.

### 6. Property details

`GET {{baseUrl}}/properties/{{propertyId}}`

No required headers.

Expected: `200` with the property fields. An unknown or invalid ID should return `404` or `400` respectively.

Invalid example:

`GET {{baseUrl}}/properties/not-a-number`

Expected: `400`.

## Protected Properties

### 7. My properties

`GET {{baseUrl}}/properties/my`

Headers:

```text
Authorization: Bearer {{token}}
```

Expected: `200` with only the authenticated user's properties.

Without a token or with an invalid token: `401`.

### 8. Create property

`POST {{baseUrl}}/properties`

Headers:

```text
Authorization: Bearer {{token}}
```

Do not manually set `Content-Type`; Postman creates the multipart boundary.

Body: `form-data`

| Key            | Type | Example                    |
| -------------- | ---- | -------------------------- |
| `title`        | Text | Modern 3BHK Villa          |
| `description`  | Text | Bright villa near the city |
| `price`        | Text | 8500000                    |
| `location`     | Text | Erode                      |
| `propertyType` | Text | VILLA                      |
| `listingType`  | Text | BUY                        |
| `bedrooms`     | Text | 3                          |
| `bathrooms`    | Text | 3                          |
| `area`         | Text | 2989                       |
| `image`        | File | A JPG/PNG image under 5 MB |

Expected: `201` with the created property. The backend uploads the optional image and stores its URL.

Invalid examples:

- Omit `title`, `location`, or required numeric fields: `400`
- `propertyType=CASTLE`: `400`
- `listingType=LEASE`: `400`
- `price=0`, `area=0`, or negative bedrooms: `400`
- Non-image file: upload middleware error
- Image larger than 5 MB: upload middleware error
- No token: `401`

### 9. Update property

`PUT {{baseUrl}}/properties/{{propertyId}}`

Headers:

```text
Content-Type: application/json
Authorization: Bearer {{token}}
```

Valid body:

```json
{
  "title": "Updated Modern 3BHK Villa",
  "description": "Updated description",
  "price": 9000000,
  "location": "Erode",
  "propertyType": "VILLA",
  "listingType": "BUY",
  "bedrooms": 3,
  "bathrooms": 3,
  "area": 3000,
  "imageUrl": "https://res.cloudinary.com/example/image/upload/property.jpg"
}
```

Expected: `200` with the updated property.

Invalid cases:

- Invalid ID: `400`
- Invalid fields or enum: `400`
- No/invalid token: `401`
- A different user's property: `403`
- Missing property: `404`

### 10. Delete property

`DELETE {{baseUrl}}/properties/{{propertyId}}`

Headers:

```text
Authorization: Bearer {{token}}
```

Expected: `200` with a success message.

Invalid cases:

- No/invalid token: `401`
- A different user's property: `403`
- Missing property: `404`
- Invalid ID: `400`

## Suggested Run Order

1. Register a new unique test user.
2. Login and save the token.
3. Call `/auth/me`.
4. Create a property using multipart form data.
5. Copy its ID into `propertyId`.
6. List properties and fetch its details.
7. Fetch `/properties/my`.
8. Update the property.
9. Delete it.
10. Repeat protected requests with no token, a malformed token, and a second user's token.

## Complete Backend Checklist

Record the actual status and response body for each case. Every response must be JSON and must never include a password, password hash, JWT secret, database URL, or Cloudinary secret.

| Area          | Test                       | Request setup                                                                           | Expected status and response                                                              |
| ------------- | -------------------------- | --------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Auth          | Register success           | Valid unique name, email, and password                                                  | `201`; `message` and public `user` only                                                   |
| Auth          | Duplicate email            | Repeat the same registration email                                                      | `409`; safe duplicate-email message; no password                                          |
| Auth          | Empty email                | Register/login with `email: ""`                                                         | `400`; validation error                                                                   |
| Auth          | Invalid email              | Use `email: "not-an-email"`                                                             | `400`; validation error                                                                   |
| Auth          | Empty password             | Use `password: ""`                                                                      | Register `400`; login `400`                                                               |
| Auth          | Short password             | Register with fewer than 6 characters                                                   | `400`; minimum-length validation error                                                    |
| Auth          | Login success              | Existing email and correct password                                                     | `200`; token plus public user                                                             |
| Auth          | Incorrect password         | Existing email and wrong password                                                       | `401`; generic `Invalid email or password`                                                |
| Auth          | Unknown email              | Unregistered email and any password                                                     | `401`; same generic login message as incorrect password                                   |
| Auth          | Missing JWT                | Call `/auth/me` or `/properties/my` without Authorization                               | `401`; `Invalid or expired token`                                                         |
| Auth          | Malformed JWT              | `Authorization: Bearer not.a.jwt`                                                       | `401`; generic token message                                                              |
| Auth          | Invalid Bearer format      | `Authorization: Basic abc`, `Bearer`, or `Bearer token extra`                           | `401`; generic token message                                                              |
| Auth          | Expired JWT                | Use a token whose `exp` is in the past                                                  | `401`; generic token message                                                              |
| Auth          | Logout                     | Frontend logout action                                                                  | Token and stored user are removed; redirect to `/`; later protected request returns `401` |
| Auth          | Refresh after login        | Refresh the browser after login                                                         | Session state is restored from the token; `/auth/me` still works until token expiry       |
| Auth          | Protected route logged out | Open `/dashboard`, `/profile`, `/dashboard/properties`, or add/edit routes after logout | Frontend redirects to `/login?redirect=...`; no protected data renders                    |
| Profile       | Get profile                | `GET /auth/me` with valid Bearer token                                                  | `200`; `user.id`, `name`, `email`; no password                                            |
| Profile       | Update profile             | `PATCH /auth/me` with valid name/email                                                  | `200`; updated public user                                                                |
| Profile       | Duplicate profile email    | Use another existing user's email                                                       | `409`; safe duplicate-email message                                                       |
| Properties    | List                       | `GET /properties`                                                                       | `200`; `page`, `limit`, `total`, `properties`                                             |
| Properties    | Search                     | `?search=villa`                                                                         | `200`; matching title/location/description results                                        |
| Properties    | Filter                     | `propertyType`, `listingType`, `bedrooms`, `minPrice`, `maxPrice`                       | `200`; all returned rows satisfy filters                                                  |
| Properties    | Sort                       | `sortBy=price&order=asc`                                                                | `200`; ascending price order                                                              |
| Properties    | Pagination                 | `page=1&limit=1`, then `page=2&limit=1`                                                 | `200`; correct page metadata and non-overlapping rows                                     |
| Properties    | Invalid query              | Unsupported enum, negative bedroom, limit over 100, or min greater than max             | `400`; validation errors                                                                  |
| Properties    | Details                    | `GET /properties/:id` with valid ID                                                     | `200`; property fields only                                                               |
| Properties    | Missing details            | Unknown positive ID                                                                     | `404`; `Property not found`                                                               |
| Properties    | Invalid details ID         | Non-numeric or non-positive ID                                                          | `400`; invalid ID message                                                                 |
| Properties    | My properties              | `GET /properties/my` with valid token                                                   | `200`; only the token user's properties                                                   |
| Properties    | Create                     | Valid multipart form-data and Bearer token                                              | `201`; created property; stored image URL when file succeeds                              |
| Properties    | Create without token       | Same request without Bearer token                                                       | `401`; no property created                                                                |
| Image         | Valid image                | `image` file with image MIME type and size at most 5 MB                                 | `201`; Cloudinary URL stored                                                              |
| Image         | Invalid file               | `image` file with non-image MIME type                                                   | `400`; `Only image files are allowed`                                                     |
| Image         | File over 5 MB             | Image larger than 5 MB                                                                  | `400`; `Image must be 5 MB or smaller`                                                    |
| Image         | Cloudinary failure         | Valid image with unavailable/invalid Cloudinary configuration                           | `500`; generic `Failed to create property`; no secret details                             |
| Authorization | User A updates User B      | User A token, User B property ID, valid PUT body                                        | `403`; ownership error; User B data unchanged                                             |
| Authorization | User A deletes User B      | User A token, User B property ID                                                        | `403`; ownership error; User B property remains                                           |
| Properties    | Update                     | Owner token and valid JSON PUT body                                                     | `200`; updated property                                                                   |
| Properties    | Update invalid body        | Invalid enum, missing field, negative numeric value, or invalid image URL               | `400`; validation errors                                                                  |
| Properties    | Update missing             | Valid token and unknown property ID                                                     | `404`; property-not-found message                                                         |
| Properties    | Delete                     | Owner token and existing property ID                                                    | `200`; success message; subsequent GET returns `404`                                      |
| Properties    | Delete missing/invalid     | Unknown ID or invalid ID                                                                | `404` or `400`; safe error message                                                        |

### Postman Assertions

Use these checks on protected responses:

```javascript
pm.test("response is JSON", () => {
  pm.response.to.have.header("Content-Type");
  pm.expect(pm.response.headers.get("Content-Type")).to.include(
    "application/json",
  );
});

pm.test("response does not expose password fields", () => {
  const body = pm.response.text();
  pm.expect(body).to.not.match(/"password"\s*:/i);
});
```

For the login success request, also assert:

```javascript
pm.test("login returns a token", () => {
  pm.expect(pm.response.json().token).to.be.a("string").and.not.empty;
});
```
