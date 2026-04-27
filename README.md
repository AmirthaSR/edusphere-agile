# EduSphere 🎓
### A cloud-native Learning Management System built on Microsoft Azure

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20EduSphere-blue?style=for-the-badge&logo=microsoftazure)](https://gentle-cliff-0c2130400.4.azurestaticapps.net)
[![Azure Functions](https://img.shields.io/badge/Azure%20Functions-Node.js-orange?style=for-the-badge&logo=azurefunctions)](https://azure.microsoft.com/en-us/products/functions)
[![Azure SQL](https://img.shields.io/badge/Azure%20SQL-Database-red?style=for-the-badge&logo=microsoftsqlserver)](https://azure.microsoft.com/en-us/products/azure-sql)
[![GitHub Actions](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-black?style=for-the-badge&logo=githubactions)](https://github.com/AmirthaSR/edusphere-agile/actions)

---

## What is EduSphere?

EduSphere is a full-stack Learning Management System that allows students to register, enroll in courses, track lesson-level progress, and earn completion stats — while admins manage users, courses, and roles from a dedicated dashboard.

Built as a real team project with actual cloud deployment, CI/CD automation, and production debugging experience.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        GitHub (main branch)                  │
│                              │                               │
│                    GitHub Actions CI/CD                      │
│                    ┌─────────┴──────────┐                   │
│                    ▼                    ▼                    │
│     Azure Static Web Apps       Azure Function App           │
│     (Frontend)                  (Backend - Node.js)          │
│     HTML / CSS / JS             12 Serverless Functions      │
│            │                          │                      │
│            └──────────────────────────┘                      │
│                         │                                    │
│                   Azure SQL Database                         │
│              (edusphere-db-server.database.windows.net)      │
└─────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML, CSS, JavaScript |
| Backend | Node.js, Azure Functions (Serverless) |
| Database | Azure SQL (mssql npm package) |
| Hosting | Azure Static Web Apps |
| CI/CD | GitHub Actions |
| Auth | bcryptjs (password hashing) |

---

## Backend — 12 Azure Functions

Each function is an independent serverless endpoint. Every push to `main` deploys all functions automatically via GitHub Actions.

### Authentication
| Function | Method | Description |
|---|---|---|
| `registerUser` | POST | Hashes password with bcryptjs, stores user in SQL |
| `loginUser` | POST | Verifies bcrypt hash, returns user session data |

### Courses
| Function | Method | Description |
|---|---|---|
| `getCourses` | GET | Returns all available courses *(Ashmitha)* |
| `getCourseDetails` | GET | Returns single course with lessons |
| `addCourse` | POST | Admin — create a new course |
| `deleteCourse` | DELETE | Admin — remove a course |

### Enrollment
| Function | Method | Description |
|---|---|---|
| `enrollCourse` | POST | Links a user to a course |
| `getEnrolledCourses` | GET | Returns all courses a user is enrolled in |

### Progress & Admin
| Function | Method | Description |
|---|---|---|
| `updateProgress` | POST | Marks a lesson complete for a user |
| `getUserStats` | GET | Returns overall completion stats per user |
| `getAllUsers` | GET | Admin — returns all registered users *(Ashmitha)* |
| `updateRole` | POST | Admin — change user role (student / admin) |

---

## My Role

This was a 3-person team project. I was the **Backend Developer and DevOps Lead.**

- Designed and built all 12 Azure Functions from scratch
- Set up Azure infrastructure — Function App, SQL Database, Static Web Apps
- Configured GitHub Actions CI/CD pipeline (auto-deploy on push to main)
- Managed Git workflow — branching strategy, rebasing, merge conflict resolution
- Debugged all production issues end to end

---

## Production Challenges I Solved

### The UTF-8 Encoding Crash
`getCourses` was returning HTTP 500 with no useful error — crashing in under 1ms before any request was processed. After inspecting the deployed file via Azure's Kudu console, I found emoji characters in the source file were encoded as Latin-1 during deployment instead of UTF-8, causing Node.js to crash silently at load time. Fixed by re-encoding the file as UTF-8 and redeploying. Function went from 500 → 200 instantly.

**Lesson:** Deployment environments don't always preserve local file encoding. Always verify what Azure actually has deployed, not just what's in your repo.

### CORS Configuration
Frontend at `azurestaticapps.net` and backend at `azurewebsites.net` are different domains. The browser was blocking all API calls by default. Fixed by explicitly adding the frontend URL to the Function App's CORS allowed origins.

### Azure SQL Firewall Block
Azure SQL blocks all incoming connections by default — including from other Azure services. Functions were timing out trying to reach the database. Fixed by adding an allow rule in the SQL firewall settings. In production this would be restricted to the Function App's specific outbound IPs.

### Merge Conflict Management
Two developers pushing to the same branch simultaneously caused constant fast-forward errors. Switched the team to `git pull --rebase` workflow, established communication rules about shared files, and manually resolved conflict markers when both changes were needed. Kept the branch history clean throughout.

---

## CI/CD Pipeline

```
Push to main branch
        │
        ▼
GitHub Actions triggered
        │
   ┌────┴────┐
   ▼         ▼
Deploy      Deploy
Backend     Frontend
to Azure    to Azure
Functions   Static Web Apps
```

Secrets (Azure publish profiles, API tokens) are stored in GitHub repository secrets — never in the codebase.

---

## Local Setup

```bash
# Clone the repo
git clone https://github.com/AmirthaSR/edusphere-agile.git
cd edusphere-agile

# Install backend dependencies
cd backend.function
npm install

# Set environment variables
DB_SERVER=your_azure_sql_server
DB_NAME=your_database_name
DB_USER=your_username
DB_PASSWORD=your_password

# Run locally with Azure Functions Core Tools
func start
```

---

## What I'd Do Differently

- **JWT authentication** instead of passing user data through the frontend — more secure and stateless
- **Prisma ORM** instead of raw mssql queries — safer against SQL injection, easier schema management
- **Environment-specific configs** — separate dev, staging, and production instead of one credential set
- **Pre-deployment validation** using a network detector CLI to catch dead functions before they reach the pipeline

---

## Team

| Name | Role |
|---|---|
| Amirtha S R | Backend Developer, DevOps Lead |
| Akshaya | Frontend Developer |
| Ashmitha | Backend Developer |

---

> Built and deployed on Microsoft Azure · 134 commits · 4 branches · CI/CD automated
