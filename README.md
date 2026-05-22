# Car Rental Booking System

## Project Overview

This project is a full-stack MERN-based Car Rental Booking System. It extends the starter project into a CRUD application with booking management, admin fleet management, and car review/rating features.

The system allows users to sign up and log in, browse available cars, view car details, create bookings, view their own bookings, update existing bookings, cancel bookings, and review completed rentals. Admin users can manage cars, view all bookings, and update booking status. The project also includes GitHub version control, GitHub Actions for CI, and deployment preparation for AWS EC2.

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
- Create a booking only when the selected car is available
- View personal bookings
- Update an existing booking
- Cancel a booking
- Submit a 1-5 star rating and written review after a booking is marked as completed
- View car average ratings and customer reviews
- Delete their own reviews

### Admin Features
- Admin login with role-based access control
- Admin dashboard with total cars, active bookings, and total revenue
- Manage cars from the Browse Cars screen
- Add new cars
- Update car details, including availability, seats, transmission, and image
- Delete cars after confirmation
- View all customer bookings
- Update booking status to `pending`, `confirmed`, `cancelled`, or `completed`
- Mark bookings as `completed` so customers can submit reviews

### System Features
- MongoDB database integration
- Real car images displayed in the system
- Backend CRUD operations for booking management
- Review and rating API with automatic car average rating updates
- Role-based admin middleware for protected admin routes
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

## Demo Admin Account

The following admin account can be used to test the admin dashboard and fleet management workflow:

- Email: `admin@admin.com`
- Password: `admin123456`

Admin users are redirected to the Admin Dashboard after login. Admin users cannot create bookings or submit reviews.

## Review and Rating Workflow

Reviews are only available for normal users, not admin users. A customer can submit a review only after an admin changes the booking status to `completed`.

Typical workflow:

1. A user creates a booking for an available car.
2. An admin opens Manage Bookings and updates the booking status.
3. When the booking status becomes `completed`, the user can submit a star rating and comment from My Bookings.
4. The car detail page displays all reviews and the average rating.
5. A user can delete their own review.

## Admin Car Management Workflow

Admin users manage cars from the Browse Cars screen:

- `Manage Cars` on the Admin Dashboard opens the Browse Cars screen.
- `Add Car` opens a form for adding a new car.
- `View Details and Modify` opens the update form for the selected car.
- `Delete Car` asks for confirmation before deleting the car.
- Unavailable cars are shown with a red availability badge and cannot be booked by users.


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


