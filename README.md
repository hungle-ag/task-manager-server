employee-task-be/
│
├── src/
│ ├── app.js
│ ├── server.js
│
│ ├── config/
│ │ ├── db.js
│ │ └── env.js
│
│ ├── routes/
│ │ ├── auth/
│ │ │ ├── manager.routes.js
│ │ │ └── employee.routes.js
│ │ ├── user.routes.js
│ │ ├── task.routes.js
│ │ └── profile.routes.js
│
│ ├── controllers/
│ │ ├── auth.controller.js
│ │ ├── user.controller.js
│ │ └── task.controller.js
│
│ ├── services/
│ │ ├── auth.service.js
│ │ ├── user.service.js
│ │ └── task.service.js
│
│ ├── middlewares/
│ │ ├── auth.middleware.js  
│ │ └── requireRole.middleware.js  
│
│ ├── utils/
│ │ ├── generateOtp.js
│ │ ├── sendSms.js  
│ │ └── sendEmail.js  
│
│ ├── constants/
│ │ └── role.js  
│
├── .env  
├── firebase.json  
├── package.json
├── .gitignore
└── README.md
