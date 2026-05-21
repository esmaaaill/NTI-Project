# QuickStay - Spring Boot Authentication Portfolio Project

## Project Title & High-Level Description
QuickStay is a Java 21 and Spring Boot 3 backend application that powers authentication for a travel-booking themed frontend. The project demonstrates production-minded backend engineering fundamentals for junior Java roles: clean layered architecture, SOLID-oriented service boundaries, secure password handling, JWT-based stateless authentication, structured exception handling, and automated tests.

## Tech Stack
- **Language:** Java 21
- **Framework:** Spring Boot 3.3
- **Security:** Spring Security, BCrypt, JWT (jjwt)
- **Validation:** Jakarta Bean Validation
- **Persistence (Demo):** File-based JSON repository (`data/users.json`)
- **Testing:** JUnit 5, Mockito, Spring MockMvc
- **Build Tool:** Maven

## Architecture Overview
The backend follows a layered architecture:
- **Controller Layer (`controller`)**: exposes REST endpoints and HTTP contract.
- **Service Layer (`service`)**: business logic and orchestration.
- **Repository Layer (`repository`)**: persistence abstraction (`UserRepository`) with file-backed implementation.
- **Security Layer (`security`, `config`)**: JWT generation/parsing and security configuration.
- **Exception Layer (`exception`)**: centralized API error mapping.

Design principles used:
- **Single Responsibility** via focused classes.
- **Dependency Inversion** via interfaces and constructor injection.
- **Open/Closed** through replaceable repository implementations.
- **Immutability-first DTO/model style** with Java records.

## Setup & Installation
### Prerequisites
- JDK 21+
- Maven 3.9+

### Run locally
1. Clone repository.
2. Ensure `data/users.json` exists (or let app create it automatically).
3. Run:
   ```bash
   mvn spring-boot:run
   ```
4. Open frontend: `http://localhost:3000/index.html`

### Environment Variables
- `PORT` (default: `3000`)
- `JWT_SECRET` (required for real deployments; defaults only for local demo)
- `USERS_FILE` (default: `data/users.json`)

## API Endpoints
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/api/auth/signup` | Register a new user | No |
| POST | `/api/auth/login` | Authenticate existing user | No |
| GET | `/api/auth/me` | Validate token and return user claims | Yes (Bearer token) |

## Testing & QA Assets
- Unit and web layer tests are under `src/test/java`.
- Postman collection is available at `postman/QuickStay-Auth-API.postman_collection.json`.
- Run tests with:
  ```bash
  mvn test
  ```
