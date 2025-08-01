GEMSTask - Full-Stack Task Management System (I have made it on Mac but it does work well for Windows also)
A comprehensive, full-stack task management application built for the IEEE R10 GEMS Backend Task. This project features a secure RESTful API built with Node.js and Express, a MongoDB database, and a professional, responsive frontend created with vanilla JavaScript, HTML, and CSS.
The application demonstrates a wide range of backend and frontend development skills, including secure authentication, data modeling, and polyglot programming through the integration of a Python reporting script.

Core Features🙌
Secure User Authentication: Full registration and login flow using JWT (JSON Web Tokens) for secure, stateless authentication. Passwords are never stored in plain text and are hashed using bcrypt.

Complete Task Management (CRUD): Users can create, read, update, and delete tasks through a polished user interface.

Dynamic Frontend: A responsive, single-page application (SPA) experience built with vanilla JavaScript that provides a modern and intuitive user interface for managing tasks and users.

User & Role Management: The API supports fetching all users, which is displayed in a dedicated "User Management" section of the dashboard.

Python Script Integration: A backend endpoint is included that executes a Python script to generate a real-time report on task statuses, demonstrating polyglot backend capabilities.

Technology Stack:-
(I will tell in format, Area: What library is used)

Backend: Node.js, Express.js
Database: MongoDB (with Mongoose ODM)
Auth: JSON Web Tokens (JWT), bcrypt
Scripting: Python 3
Frontend: Vanilla JavaScript (ES6+), HTML5, CSS3
Dev Tools: nodemon, dotenv

API Endpoints Documentation
(It will be in format, Method:Endpoint:Description:Access)

User Authentication:-
POST: /api/users/register: Registers a new user.: Public
POST: /api/users/login: Authenticates a user and returns a token.: Public
GET: /api/users: Retrieves a list of all registered users.: Private

Task Management:-
POST: /api/tasks: Creates a new task.: Private
GET: /api/tasks: Retrieves a summary list of all tasks.: Private
GET: /api/tasks/{taskId}: Retrieves the full details of a single task.: Private
PUT: /api/tasks/{taskId}: Updates an existing task.: Private
DELETE: /api/tasks/{taskId}: Deletes a task.: Private
GET: /api/tasks/report/generate: Generates a task status report via Python.: Private

Setup and Installation Guide:-
Prerequisites:
Node.js (v14 or higher)
npm (Node Package Manager)
Python 3
A MongoDB Atlas account (or a local MongoDB instance).

Installation Steps:- 
1. Clone the Repository
"git clone <https://github.com/Sunshield90/GEMS-BACKEND-TASK-R10>
cd task-management-app"
2. Configure the Backend
"cd backend
npm install"
Create a .env file in the backend folder (Example is given as file name 'env.example').
Copy the contents of .env.example into your new .env file.
Fill in your MONGO_URI and create a JWT_SECRET.
3. Configure the Python Reporter
"cd ../python-reporter
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt"
Create a .env file in the python-reporter folder (Example is given as file name 'env.example p-r').
Add your MONGO_URI to this file.
4. Run the Application
Start the Backend Server: In the backend directory, run: "npm start"
Launch the Frontend: Open the frontend/index.html file in your web browser.
