# 📡 SalesBasket — API Endpoints Reference

> Base URL: `http://localhost:8080/api`

---

## 🔑 Authentication — `/api/auth`

### `POST /api/auth/register`
Register a new user account.

- **Auth Required:** ❌
- **Request Body:**
```json
{
  "username": "john",
  "email": "john@example.com",
  "password": "Pass@123",
  "role": "CUSTOMER"
}
```
> `role` accepts: `CUSTOMER` or `ADMIN` (defaults to `CUSTOMER` if omitted)

- **Response `201 Created`:**
```json
{
  "message": "User registered successfully"
}
```
- **Error Responses:**

| Status | Reason |
|--------|--------|
| `400` | Validation failure (missing fields, weak password, bad email) |
| `400` | Email already in use |
| `400` | Username already taken |

---

### `POST /api/auth/login`
Login and receive a JWT token.

- **Auth Required:** ❌
- **Request Body:**
```json
{
  "email": "john@example.com",
  "password": "Pass@123"
}
```
- **Response `200 OK`:**
```json
{
  "token": "eyJhbGci...",
  "username": "john",
  "role": "CUSTOMER"
}
```
- **Error Responses:**

| Status | Reason |
|--------|--------|
| `400` | Missing or invalid fields |
| `401` | Invalid email or password |

---

### `POST /api/auth/logout`
Invalidate the current JWT token (token blacklisting).

- **Auth Required:** ✅ Bearer Token
- **Headers:**
```
Authorization: Bearer <token>
```
- **Response `200 OK`:**
```json
{
  "message": "Logged out successfully"
}
```
- **Error Responses:**

| Status | Reason |
|--------|--------|
| `400` | Missing or malformed Authorization header |
| `400` | Token is invalid or already expired |

---

## 📦 Products — `/api/products`

### `GET /api/products`
Get a paginated list of all products. Supports filtering and sorting.

- **Auth Required:** ❌
- **Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | `int` | `0` | Page number (0-indexed) |
| `size` | `int` | `12` | Items per page |
| `categoryId` | `Long` | — | Filter by category ID |
| `search` | `String` | — | Search by product name (case-insensitive) |
| `sortBy` | `String` | `productId` | Field to sort by |
| `direction` | `String` | `asc` | Sort direction: `asc` or `desc` |

- **Example Request:**
```
GET /api/products?categoryId=1&search=iphone&page=0&size=12&sortBy=price&direction=asc
```

- **Response `200 OK`:**
```json
{
  "content": [
    {
      "productId": 1,
      "name": "iPhone 15 Pro",
      "description": "Apple iPhone 15 Pro with A17 Pro chip...",
      "price": 999.99,
      "stock": 50,
      "category": {
        "categoryId": 1,
        "categoryName": "Smartphones"
      },
      "images": [
        { "imageUrl": "/uploads/iphone15pro.jpg" }
      ]
    }
  ],
  "totalElements": 48,
  "totalPages": 4,
  "number": 0,
  "size": 12
}
```

---

### `GET /api/products/{id}`
Get details of a single product by its ID.

- **Auth Required:** ❌
- **Path Parameter:** `id` — Product ID

- **Example Request:**
```
GET /api/products/1
```

- **Response `200 OK`:**
```json
{
  "productId": 1,
  "name": "iPhone 15 Pro",
  "description": "Apple iPhone 15 Pro with A17 Pro chip...",
  "price": 999.99,
  "stock": 50,
  "category": {
    "categoryId": 1,
    "categoryName": "Smartphones"
  },
  "images": [
    { "imageUrl": "/uploads/iphone15pro.jpg" }
  ]
}
```
- **Error Responses:**

| Status | Reason |
|--------|--------|
| `404` | Product not found with given ID |

---

## 🗂️ Categories — `/api/categories`

### `GET /api/categories`
Get a list of all available product categories.

- **Auth Required:** ❌

- **Response `200 OK`:**
```json
[
  { "categoryId": 1, "categoryName": "Smartphones" },
  { "categoryId": 2, "categoryName": "Smartwatches" },
  { "categoryId": 3, "categoryName": "Headphones" },
  { "categoryId": 4, "categoryName": "Laptops" }
]
```

---

### `GET /api/categories/{id}`
Get a single category by its ID.

- **Auth Required:** ❌
- **Path Parameter:** `id` — Category ID

- **Example Request:**
```
GET /api/categories/1
```

- **Response `200 OK`:**
```json
{
  "categoryId": 1,
  "categoryName": "Smartphones"
}
```
- **Error Responses:**

| Status | Reason |
|--------|--------|
| `404` | Category not found with given ID |

---

## 🖼️ Static Files — `/uploads`

Uploaded product images are served as static resources.

```
GET /uploads/{filename}
```
**Example:** `http://localhost:8080/uploads/iphone15pro.jpg`

- **Auth Required:** ❌

---

## 🚦 Quick Reference Table

| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| `POST` | `/api/auth/register` | ❌ | Register new user |
| `POST` | `/api/auth/login` | ❌ | Login — returns JWT |
| `POST` | `/api/auth/logout` | ✅ | Logout — invalidates token |
| `GET` | `/api/products` | ❌ | List all products (paginated) |
| `GET` | `/api/products/{id}` | ❌ | Get single product |
| `GET` | `/api/categories` | ❌ | List all categories |
| `GET` | `/api/categories/{id}` | ❌ | Get single category |
| `GET` | `/uploads/{filename}` | ❌ | Serve product image |

---

## 🔐 How to Use JWT

After logging in, include the token in the `Authorization` header for all protected endpoints:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

Tokens expire after **24 hours** (`86400000ms`). After expiry or logout, a new login is required.

---

## ⚙️ Environment

| Setting | Value |
|---------|-------|
| Server Port | `8080` |
| Base URL | `http://localhost:8080` |
| Token Expiry | `86400000 ms` (24 hours) |
| Max Upload Size | `10 MB` |
