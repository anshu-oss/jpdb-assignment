# Student Enrollment Management System

A highly responsive and professional web application designed for enrolling and managing student details. This application utilizes **Bootstrap 5** for a modern, glassmorphic layout and **JsonPowerDB (JPDB)** by Login2Xplore as a lightweight, real-time serverless database.

## Project Overview

The **Student Enrollment Management System** allows developers and administrators to manage student records dynamically. The system handles standard Index Manipulation (IML) and Index Retrieval (IRL) commands directly from the client side without needing a server-side backend. 

### Key Features
1. **Roll Number as Primary Key:** Auto-checks existence in the database on field change (`blur`) or pressing `Enter`.
2. **Dynamic UI States:**
   - **New Roll Number:** Form fields enable. Save and Reset buttons become active. Update button is disabled. Enrollment Date auto-fills with the current date.
   - **Existing Roll Number:** Form fields auto-populate with database records. Update and Reset buttons enable. Save button is disabled. Roll Number is locked to prevent mismatches.
3. **Real-time Live Preview Panel:** A visual student profile card updates character-by-character as you type in the form.
4. **Professional Form Validations:**
   - Real-time CSS border triggers (green/red) and invalid messages for user feedback.
   - Email format validation, Phone number validation (10 digits), and Birth Date validation (in the past and at least 3 years of age).
   - Address character counter (max 200 characters) with real-time length tracking.
5. **Interactive JPDB Settings Panel:** Built-in settings modal to change Connection Token, DB name, and Relation name on the fly from the UI without modifying source code.
6. **Polished Feedback UI:** Custom full-screen loading spinner/overlay block user inputs during API calls. Floating toast notifications indicate success, warning, info, and error messages.

---

## Technology Stack

* **Frontend Framework:** Bootstrap 5 (Responsive Layout, Modals, Forms, Alerts, Toasts)
* **Icons:** Bootstrap Icons
* **Core Logic:** Vanilla JavaScript (ES6+) & jQuery (3.7.1)
* **Database Driver:** `jpdb-commons.js` (Login2Xplore Database Interface)
* **Backend Database:** JsonPowerDB (JPDB) - High Performance Document Store

---

## Configuration Settings

By default, the application is pre-loaded with developer testing credentials. To connect your own JPDB instance:
1. Click the **JPDB Settings** button in the navigation bar.
2. In the modal, fill in your details:
   - **Connection Token:** Your JPDB authorization token.
   - **Database Name:** E.g., `SCHOOL-DB`
   - **Relation Name:** E.g., `STUDENT-TABLE`
   - **JPDB Base URL:** `http://api.login2explore.com:5577` (Default API Endpoint)
3. Click **Save Config** to instantly sync. Settings are saved in your browser's local storage.

---

## Project Structure

```
student-enrollment-jpdb/
├── index.html     # Responsive layout, modals, preview cards & CDN inclusions
├── style.css      # Custom styling, animations, loader overlays & custom variables
├── script.js     # Form event handling, validations & JPDB IML/IRL API logic
└── README.md      # Setup guide & documentation (this file)
```

---

## GitHub Repository Setup Instructions

### Prerequisites
- Active Internet connection (to load CDNs for jQuery, Bootstrap, and JPDB).
- A valid JPDB Connection Token from [Login2Xplore](https://login2explore.com/jpdb/docs.html).

### Steps to Run Locally
1. Clone the repository to your local system:
   ```bash
   git clone https://github.com/anashkhan-dev/student-enrollment-jpdb.git
   cd student-enrollment-jpdb
   ```
2. Double-click the `index.html` file to open it in any web browser.
3. Configure your Connection Token using the **JPDB Settings** panel in the navbar.
4. Input a Roll Number (e.g. `1`), hit Tab, and start using the system!

---

## Developer Details

* **Developed by:** Anash Khan
* **Email:** [anashkhan.dev@gmail.com](mailto:anashkhan.dev@gmail.com)
* **Status:** Login2Xplore JPDB Micro Project Submission
* **Licensed under:** MIT License
* Made with ❤️ using HTML, CSS, JavaScript, Bootstrap 5 and JsonPowerDB.
