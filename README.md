🏥 QueueFlow – Smart Hospital Queue Management System
📖 Overview

QueueFlow is a modern AI-enhanced hospital queue management system that digitizes the traditional token system.
Patients can easily join queues, track their token status live, and get estimated wait times, while hospital staff can manage queues efficiently from an interactive dashboard.

🎯 Built using MERN Stack (MongoDB, Express, React, Node.js) — optimized for real-time queue updates and scalability.

✨ Key Features
👩‍⚕️ For Patients

🎟️ Generate a digital queue token instantly

⏱️ Get live estimated wait time

🔔 Automatic status updates (e.g., “Your turn!”)

📱 Clean, mobile-friendly interface

🧑‍💼 For Hospital Staff

📊 Interactive Admin Dashboard

👩‍⚕️ Switch between One-Stage / Two-Stage queue modes

🏠 Manage rooms (assign patients to consultation rooms)

🔄 Reset or call next patient with one click

🧮 Real-time analytics (active rooms, waiting patients, completed tokens)

🧱 Tech Stack
Layer	Technology
Frontend	⚛️ React + TypeScript + TailwindCSS + Framer Motion
Backend	🟢 Express.js + Node.js
Database	🍃 MongoDB (Mongoose ODM)
API Communication	Axios + REST APIs
State Management	Custom React Context + Hooks
Hosting	🌐 (Optional) Azure / Render / Vercel
Version Control	🐙 Git + GitHub
⚙️ Installation & Setup

Follow these steps to run the project locally 👇

1️⃣ Clone the repository
git clone https://github.com/Harsh-dubey-git/QueueFlow.git
cd QueueFlow

2️⃣ Backend Setup
cd Backend
npm install


Create a .env file inside the Backend folder and add:

MONGO_URI=mongodb+srv://<your_username>:<your_password>@queuecluster.mongodb.net/QueueFlow
PORT=5000


Run the server:

npm run dev


✅ Backend will start on http://localhost:5000

3️⃣ Frontend Setup
cd ../Frontend
npm install
npm run dev


✅ Frontend will start on http://localhost:5173 (Vite default)

4️⃣ Connect Frontend ↔ Backend

Make sure your Frontend/src/api/api.ts has the backend base URL:

export const API_BASE_URL = "http://localhost:5000/api";

🗂️ Folder Structure
QueueFlow/
│
├── Backend/
│   ├── index.js                # Entry point (Express server)
│   ├── models/Ticket.js        # MongoDB ticket schema
│   ├── routes/tickets.js       # Ticket-related routes
│   ├── .env                    # Environment variables (ignored in Git)
│   └── package.json
│
├── Frontend/
│   ├── src/
│   │   ├── components/         # All UI components
│   │   ├── hooks/              # Custom React hooks
│   │   ├── api/api.ts          # API integration layer
│   │   ├── App.tsx             # Main app file
│   │   └── types.ts            # TypeScript types
│   ├── vite.config.ts
│   └── package.json
│
└── README.md

📸 Screenshots (Add after running)
Landing Page	Staff Login	Admin Dashboard

	
	
🧩 Core Concepts
🔹 One-Stage Queue

All patients are in a single queue served sequentially by one staff member or counter.

🔹 Two-Stage Queue

Patients first enter a waiting room queue → then assigned to specific consultation rooms (e.g., Room 1, Room 2, etc.).

This system allows hospitals to scale queue handling across multiple rooms and doctors dynamically.

