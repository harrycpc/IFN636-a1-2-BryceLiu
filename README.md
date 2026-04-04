# Car Rental Booking System

## Project Overview

This project is a full-stack MERN-based Car Rental Booking System. It extends the starter project into a CRUD application with booking management features.

The system allows users to sign up and log in, browse available cars, view car details, create bookings, view their own bookings, update existing bookings, and cancel bookings. The project also includes GitHub version control, GitHub Actions for CI, and deployment preparation for AWS EC2.

## Public URL

The deployed application can be accessed at the following public URL:

http://13.239.239.57

## Tech Stack

- Frontend: React.js
- Backend: Node.js, Express.js
- Database: MongoDB Atlas
- Testing: Mocha, Chai, Sinon
- Version Control: GitHub
- CI/CD: GitHub Actions
- Deployment: AWS EC2
- Process Manager: pm2

## Features

### User Features
- User signup and login
- Browse available cars
- View car details
- Create a booking
- View personal bookings
- Update an existing booking
- Cancel a booking

### System Features
- MongoDB database integration
- Real car images displayed in the system
- Backend CRUD operations for booking management
- GitHub Actions workflow for backend testing
- Deployment support for AWS EC2

## Project Structure

```bash
.
├── backend
├── frontend
├── .github
│   └── workflows
│       └── ci.yml
├── package.json
└── README.md
```

## Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/bryceliu17/IFN636-a1-2-BryceLiu.git
cd IFN636-a1-2-BryceLiu
```

### 2. Install dependencies

```bash
npm run install-all
```

## Environment Variables

Create a `.env` file inside the `backend` folder and add:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5001
```

## Demo Login Account

To make testing easier, the following demo account can be used after the project is running:

- Email: `test@test.com`
- Password: `test123456`

This account is provided for demonstration and testing purposes only.


## How to Run Locally

To run the application in development mode:

```bash
npm run dev
```

To run the application in standard mode:

```bash
npm start
```

## How to Run Tests

To run backend tests:

```bash
cd backend
npm test
```

## Car Data and Images

The car data is stored in MongoDB Atlas. Vehicle images are displayed by storing image paths in the database and loading them from the frontend public folder.

Example image path:

```text
/images/Toyota.png
```

## GitHub Actions

This project includes a GitHub Actions workflow for backend testing. The workflow installs backend dependencies and runs the test suite automatically when code is pushed to the main branch or when a pull request is created.

Workflow file location:

```text
.github/workflows/ci.yml
```


