# Car Rental Booking System

## Project Overview

This project is a full-stack MERN-based Car Rental Booking System. It extends the starter project into a CRUD application with booking management, admin fleet management, car review/rating, and a configurable pricing engine.

The system allows users to sign up and log in, browse available cars, view car details and live price breakdowns, create bookings, view their own bookings, update existing bookings, cancel bookings, and review completed rentals. Admin users can manage cars, view all bookings, update booking status, and configure long-stay discount rules and the weekend surcharge from a dedicated Pricing Settings page. The project also includes GitHub version control, GitHub Actions for CI, and rolling deployment to AWS EC2 behind an Application Load Balancer.

## Public URL

The deployed application can be accessed at the following public URL:

http://13.239.239.57

## Tech Stack

- Frontend: React.js (Create React App), token-based design system
- Backend: Node.js, Express.js
- Database: MongoDB Atlas
- Testing: Mocha, Chai, Sinon
- Version Control: GitHub
- CI/CD: GitHub Actions (self-hosted runners, rolling deploy)
- Deployment: AWS EC2 behind an Application Load Balancer, fronted by Nginx
- Process Manager: pm2

## Features

### User Features
- User signup and login
- Browse available cars with live filters
- View car details, average rating, and customer reviews
- See the active long-stay discount rules and weekend surcharge on the car page
- Create a booking only when the selected car is available, with an itemised price breakdown (base price, long-stay discount, weekend surcharge, total)
- View personal bookings
- Update an existing booking and see the price recalculated live
- Cancel a booking
- Submit a 1–5 star rating and written review after a booking is marked as completed
- Delete their own reviews

### Admin Features
- Admin login with role-based access control
- Admin dashboard with total cars, active bookings, and total revenue
- Manage cars: add, update (including availability, seats, transmission, image), and delete
- Manage all customer bookings with status filters
- Update booking status to `pending`, `confirmed`, `cancelled`, or `completed`
- Mark bookings as `completed` so customers can submit reviews
- **Pricing Settings page**: configure any number of long-stay discount rules (e.g. 5% off bookings of 7+ days) and set the weekend surcharge percentage, with a live sample-booking preview

### System Features
- MongoDB Atlas database integration via a singleton connection class
- Configurable pricing engine using a decorator pattern (long-stay discount + weekend surcharge stacked over a base price calculator)
- Centralised request-body validation middleware for cars, bookings, reviews, and auth
- Booking workflow encapsulated in a service facade (availability check → price calculation → booking creation → car-availability toggle)
- Adapter for mapping a third-party car-feed schema to the internal `Car` schema
- Role-based admin middleware for protected admin routes
- Review and rating API with automatic per-car average rating and review count updates
- GitHub Actions workflow: backend tests on every push and PR, rolling deploy to two EC2s on every merge to `main`

## Design Patterns

The backend deliberately uses four classic design patterns to satisfy the coursework constraint:

- **Singleton** — `backend/config/db.js`. `DatabaseConnection.getInstance()` returns a single Mongoose connection instance, called once from `server.js` and reused everywhere.
- **Adapter** — `backend/adapters/externalCarAdapter.js`. Maps a third-party car-feed schema (`vehicle_name`, `daily_rate`, …) to the internal `Car` schema so external feeds can plug in without changing controllers or models.
- **Facade** — `backend/facades/bookingServiceFacade.js`. Owns the multi-step booking workflow (availability check, price calculation, booking creation, `Car.availability` toggling). `bookingController.js` is a thin pass-through.
- **Decorator** — `backend/decorators/`. `LongStayDiscountDecorator` and `WeekendSurchargeDecorator` wrap a base `priceCalculator` so each pricing rule is independently composable. The booking flow stacks the decorators in order to produce the final total.

## Project Structure

```bash
.
├── backend
│   ├── adapters          # External car-feed adapter
│   ├── config            # DatabaseConnection singleton
│   ├── controllers       # Thin HTTP handlers
│   ├── decorators        # Pricing decorators (long-stay, weekend)
│   ├── facades           # Booking service facade
│   ├── middleware        # auth, admin role gate, validation
│   ├── models            # Mongoose schemas
│   ├── pricing           # Base price calculator
│   ├── routes            # Express route definitions
│   ├── test              # Mocha test suites
│   └── server.js
├── frontend
│   ├── public            # SVG favicon, manifest, index.html
│   └── src
│       ├── api           # Axios-based API clients
│       ├── components    # Navbar, AdminShell, CarCard, Rating, …
│       ├── context       # AuthContext (JWT + user persistence)
│       ├── pages         # 12 routed pages (customer + admin)
│       ├── utils         # format helpers, shared constants
│       └── index.css     # Token-based design system
├── .github
│   └── workflows
│       └── ci.yml        # Tests + rolling deploy to EC2-A then EC2-B
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

This installs root, `backend/`, and `frontend/` dependencies in one command.

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

The following admin account can be used to test the admin dashboard, fleet management, and pricing workflows:

- Email: `admin@admin.com`
- Password: `admin123456`

Admin users are redirected to the Admin Dashboard after login. Admin users cannot create bookings or submit reviews.

## Pricing Workflow

Pricing is computed on the backend from configurable rules:

1. **Base price** = `days × dailyRate`.
2. **Long-stay discount** — admins define rules in Pricing Settings (e.g. 5% off 3+ days, 10% off 7+ days). The rule with the largest `minDays` ≤ trip length is applied.
3. **Weekend surcharge** — a single percentage applied to Friday, Saturday, and Sunday days within the booking window. Set to 0 to disable.

The breakdown is shown on:
- The Car Details page (active rules + sample preview)
- The Create Booking page (live total as dates change)
- The Edit Booking page (recalculated breakdown)
- The Pricing Settings page (live preview for a 10-day, $120/day sample booking)

## Review and Rating Workflow

Reviews are only available for normal users, not admin users. A customer can submit a review only after an admin changes the booking status to `completed`.

Typical workflow:

1. A user creates a booking for an available car.
2. An admin opens Manage Bookings and updates the booking status.
3. When the booking status becomes `completed`, the user can submit a star rating and comment from My Bookings.
4. The car detail page displays all reviews and the average rating.
5. A user can delete their own review.

## Admin Car Management Workflow

Admin users manage cars from the Admin Dashboard:

- `Manage Cars` opens the fleet table with inline edit and delete actions.
- `Add Car` opens a form for adding a new car.
- `View Details and Modify` opens the update form for the selected car.
- `Delete Car` asks for confirmation before deleting the car.
- Unavailable cars are shown with a red availability badge and cannot be booked by users.

## How to Run Locally

To run the application in development mode (backend with `nodemon`, frontend with CRA dev server, both concurrently):

```bash
npm run dev
```

To run the application in standard mode:

```bash
npm start
```

The frontend dev server proxies API calls to the backend on port 5001 (configured via the `"proxy"` field in `frontend/package.json`), so axios uses a relative base URL and works in both local dev and production behind Nginx without configuration changes.

## How to Run Tests

To run the full backend test suite:

```bash
cd backend
npm test
```

Tests are split across four files in `backend/test/`:

- `Auth.test.js` — signup, login, JWT issuance
- `Booking.test.js` — booking facade, availability rules, status transitions
- `Car.test.js` — car CRUD, adapter mapping
- `Review.test.js` — review creation guards, rating aggregation

Tests stub Mongoose models and the booking facade, so no live MongoDB connection is required.

## Car Data and Images

The car data is stored in MongoDB Atlas. Vehicle images are displayed by storing image paths in the database and loading them from the frontend public folder.

Example image path:

```text
/images/Toyota.png
```

## GitHub Actions

The CI/CD workflow at `.github/workflows/ci.yml` runs in three stages:

1. **Backend tests** on a GitHub-hosted runner for every push and pull request to `main`.
2. **Deploy → EC2-A** runs on merge to `main` using a self-hosted runner tagged `ec2-a`. It checks out the code, builds the frontend, writes `backend/.env` from GitHub secrets, and reloads pm2.
3. **Deploy → EC2-B** runs after EC2-A succeeds, on the `ec2-b` self-hosted runner. The two EC2 instances sit behind an Application Load Balancer, so deploying them sequentially gives a zero-downtime rolling release.

A `concurrency` group serialises runs on the same branch so two merges never reload pm2 at the same time.
