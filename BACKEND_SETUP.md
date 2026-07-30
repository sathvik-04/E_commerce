# 🚀 How to Run the Backend — SalesBasket

> Follow this guide step by step. If you get stuck, check the **Troubleshooting** section at the bottom.

---

## ✅ Prerequisites

Before running the backend, make sure you have these installed:

| Tool | Version | Check Command | Download |
|------|---------|---------------|----------|
| **Java (JDK)** | 17 or higher | `java -version` | [adoptium.net](https://adoptium.net/) |
| **Maven** | 3.8 or higher | `mvn -version` | [maven.apache.org](https://maven.apache.org/download.cgi) |
| **MySQL** | 8.0 or higher | — | [mysql.com](https://dev.mysql.com/downloads/installer/) |

---

## 📥 Step 1 — Clone the Repository

```bash
git clone https://github.com/sathvik-04/E_commerce.git
cd E_commerce
```

---

## 🐬 Step 2 — Set Up MySQL Database

Open **MySQL Command Line** or **MySQL Workbench** and run:

```sql
CREATE DATABASE IF NOT EXISTS commerce;
```

> The database is named `commerce`. If yours is different, update `application.properties` (see Step 3).

---

## ⚙️ Step 3 — Configure the Application

Open the file:
```
backend/src/main/resources/application.properties
```

Update these two lines with your MySQL credentials:

```properties
spring.datasource.username=root
spring.datasource.password=YOUR_MYSQL_PASSWORD
```

> ⚠️ **Do NOT commit your password to GitHub.** Only change it locally.

---

## ▶️ Step 4 — Run the Backend

### On Windows (PowerShell):

First, add Maven to PATH for this session (if `mvn` is not recognized):
```powershell
$env:Path += ";C:\Program Files\apache-maven-3.9.16\bin"
```
> Adjust the path if Maven is installed elsewhere.

Then navigate to the backend folder and run:
```bash
cd backend
mvn clean spring-boot:run
```

### On Mac / Linux:
```bash
cd backend
mvn clean spring-boot:run
```

---

## 🟢 Step 5 — Verify It's Running

Wait for this line in the terminal:
```
Started SalesBasketApplication in X.XXX seconds
```

Then open your browser and visit:
```
http://localhost:8080/api/categories
http://localhost:8080/api/products
```

You should see JSON data — the backend is working! ✅

---

## 🌐 Backend Runs At

```
http://localhost:8080
```

The frontend (Vite/React) should point to this URL via:
```
VITE_API_BASE_URL=http://localhost:8080/api
```

---

## 🔑 Test Authentication (Optional)

You can test register and login using **Postman** or **curl**:

### Register a new user:
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"john","email":"john@example.com","password":"Pass@123","role":"CUSTOMER"}'
```

### Login:
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"Pass@123"}'
```

---

## 🔧 Troubleshooting

### ❌ `mvn` is not recognized
Maven is not in your PATH. Run this in PowerShell:
```powershell
$env:Path += ";C:\Program Files\apache-maven-3.9.16\bin"
```
Or install Maven from: https://maven.apache.org/download.cgi

---

### ❌ `java` is not recognized
Java is not installed. Download JDK 17+ from: https://adoptium.net/

---

### ❌ `Access denied for user 'root'`
Wrong MySQL password in `application.properties`. Update it with your correct password.

---

### ❌ `Unknown database 'commerce'`
Run this in MySQL:
```sql
CREATE DATABASE commerce;
```

---

### ❌ `Communications link failure`
MySQL is not running. Start it:
- **Windows:** Search for `services.msc` → find **MySQL80** → click **Start**
- **Mac:** `brew services start mysql`
- **Linux:** `sudo systemctl start mysql`

---

### ❌ Port 8080 already in use
Another process is using port 8080. Either stop it or change the port in `application.properties`:
```properties
server.port=8081
```

---

## 📁 Project Structure (Backend)

```
backend/
├── pom.xml                          ← Maven dependencies
└── src/
    └── main/
        ├── java/com/salesbasket/
        │   ├── controller/          ← REST API endpoints
        │   ├── service/             ← Business logic
        │   ├── entity/              ← Database models
        │   ├── repository/          ← Database queries
        │   ├── security/            ← JWT authentication
        │   └── config/              ← App configuration
        └── resources/
            └── application.properties  ← ⚠️ Update DB credentials here
```

---

## 📌 Quick Reference

| Command | Description |
|---------|-------------|
| `mvn clean spring-boot:run` | Clean build + run |
| `mvn spring-boot:run` | Run without clean |
| `mvn clean package` | Build JAR file |
| `Ctrl + C` | Stop the server |

---

> 💬 **Need help?** Contact the project maintainer or raise a GitHub issue.
