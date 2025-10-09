# Notes Application

Full-stack Notes Application developed during my internship at **Karayolları 3. Bölge Müdürlüğü – IT Chief Engineering Department**.
The project demonstrates the process of converting a simple single-user notes app into a secure, database-connected multi-user web application.

## Features

* User registration and login (bcrypt + JWT)
* Create, edit, delete, and view personal notes
* REST API with Express.js and MySQL
* Secure data storage and authentication

## Technologies

Node.js, Express.js, MySQL, HTML, CSS, JavaScript

## How to Run

1. Run `npm install` to install dependencies.
2. Create a `.env` file (not included) with your MySQL credentials and JWT secret.
3. Start the server with:

   ```
   node server.js
   ```
4. Open `http://localhost:3000` to use the app.

## Folder Overview

* **public/** → Frontend files (HTML, CSS, JS)
* **server.js** → Main Express server
* **mysql-database.js** → Database connection
