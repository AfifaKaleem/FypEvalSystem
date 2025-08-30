FYP Evaluation System 🎓

A web-based management system for handling Final Year Project (FYP) activities at universities. It supports role-based access for students, supervisors, evaluators, and the FYP Head, providing an automated way to manage project supervision, evaluation, and announcements.

🔗 Repository Link: FYP Evaluation System

🚀 Features

Authentication & Authorization

JWT-based secure login system

Role-based access for students, supervisors, evaluators, and FYP Head

Student Module

View supervisors list

Request supervisor approval

Check eligibility (must be enrolled with 91+ credit hours)

Supervisor Module

Accept/reject student requests (limit: 15 students)

Evaluator Module

Assigned up to 8 students for evaluations

Admin (FYP Head) Module

Manage supervisors and students (create, update, remove, view)

Post announcements visible to all users

Announcements

Includes date, time, content, author (FYP Head), and audience

🛠️ Tech Stack

Backend: Node.js, Express.js

Database: MongoDB (Mongoose ODM)

Authentication: JWT (JSON Web Token)

Other: RESTful APIs

📂 Project Structure
FypEvalSystem/
├── models/           # Mongoose schemas  
├── routes/           # API routes for each module  
├── controllers/      # Business logic for routes  
├── middleware/       # JWT auth & role verification  
├── config/           # Database connection setup  
├── server.js         # Entry point of the app  
└── README.md         # Project documentation  

⚡ Installation & Setup

Clone the repository:

git clone https://github.com/AfifaKaleem/FypEvalSystem.git
cd FypEvalSystem


Install dependencies:

npm install

Setup environment variables:
Create a .env file in the root directory and add:

PORT= port_number
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key


Run the server:

npm start


Server will run at:

http://localhost:5000

📖 API Endpoints
🔑 Auth

POST /api/auth/register – Register a new user

POST /api/auth/login – Login and get JWT

👨‍🎓 Student

GET /api/students/supervisors – View all supervisors

POST /api/students/request – Request supervisor

GET /api/students/status – Check request status

👨‍🏫 Supervisor

GET /api/supervisors/requests – View student requests

POST /api/supervisors/accept/:id – Accept request

POST /api/supervisors/reject/:id – Reject request

📝 FYP Head

POST /api/admin/supervisor – Add supervisor

PUT /api/admin/supervisor/:id – Update supervisor

DELETE /api/admin/supervisor/:id – Remove supervisor

POST /api/admin/announcement – Post announcement   

🤝 Contributing

Contributions are welcome! If you'd like to improve this project, fork the repo and create a pull request.

🤝 Contributing

Contributions are welcome! If you'd like to improve this project, fork the repo and create a pull request.
