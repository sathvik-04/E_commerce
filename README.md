# SalesBasket

Full-stack e-commerce app — React.js + Spring Boot + MySQL + JWT.

---

## ▶️ Run the App

### Backend
```bash
cd backend
mvn spring-boot:run
```
Runs at: `http://localhost:8080`

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Runs at: `http://localhost:5173`

---

## 🔑 Auth Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/auth/register` | Register new user | ❌ |
| `POST` | `/api/auth/login` | Login — returns JWT | ❌ |
| `POST` | `/api/auth/logout` | Logout — invalidates token | ✅ |

### POST `/api/auth/register`
```json
// Request
{ "username": "john", "email": "john@example.com", "password": "Pass@123", "role": "CUSTOMER" }

// Response 201
{ "message": "User registered successfully" }
```

### POST `/api/auth/login`
```json
// Request
{ "email": "john@example.com", "password": "Pass@123" }

// Response 200
{ "token": "eyJhbGci...", "username": "john", "role": "CUSTOMER" }
```

### POST `/api/auth/logout`
```
Header: Authorization: Bearer <token>

Response 200: { "message": "Logged out successfully" }
```

---

## 📦 Product Endpoints (Show)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/products` | List all products | ❌ |
| `GET` | `/api/products/{id}` | Get product details | ❌ |
| `GET` | `/api/categories` | List all categories | ❌ |

### GET `/api/products`
```json
// Response 200
{
  "content": [
    { "productId": 1, "name": "iPhone 15 Pro", "price": 999.99, "stock": 50,
      "category": { "categoryId": 1, "categoryName": "Smartphones" },
      "images": [{ "imageUrl": "/uploads/iphone15pro.jpg" }] }
  ],
  "totalElements": 48, "totalPages": 4
}
```

### GET `/api/categories`
```json
// Response 200
[
  { "categoryId": 1, "categoryName": "Smartphones" },
  { "categoryId": 2, "categoryName": "Smartwatches" },
  { "categoryId": 3, "categoryName": "Headphones" },
  { "categoryId": 4, "categoryName": "Laptops" }
]
```

---

## 🌐 Frontend Pages

| Route | Page | Auth Required |
|-------|------|:---:|
| `/` | Home — product grid | ❌ |
| `/login` | Login form | ❌ |
| `/register` | Register form | ❌ |
| `/products/:id` | Product detail | ❌ |

---

## ⚙️ Environment

**`backend/src/main/resources/application.properties`**
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/commerce
spring.datasource.username=root
spring.datasource.password=your_password
jwt.secret=your_secret_key
jwt.expiration=86400000
```

**`frontend/.env`**
```env
VITE_API_BASE_URL=http://localhost:8080/api
```
