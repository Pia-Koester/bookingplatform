# Artemis Academy - Booking Platform

## Purpose

This is the backend to my booking platform for self defense and yoga classes. Class details, membership plans and user date is safed in mongodb.

## 🚀 Getting Started

To access the .env variables this project uses the `Node v20.6.0` build in .env file support. To run it you need to update your Node or install the dotenv package.
Clone this repository and install dependencies with `npm install`.
Start the project locally with ` npm run dev`.

## API

The deployed version of this api is available: https://artemisbooking.cyclic.app/

### Users

#### Signup

To sign up a new user, clients must send a POST request to the `/api/signup` endpoint with the following JSON data in the request body:

```json
{
  "email": "john@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "1234567890",
  "password": "hashedPassword",

  "profileImage": {
    "url": "exampleimage.com",
    "publicId": "1234567890"
  },
  "address": {
    "street": "123 Main St",
    "city": "Anytown",
    "postalCode": "12345"
  },
  "dateOfBirth": "1990-01-01",
  "termsOfUse": true,
  "dataProtectionInfo": true
}
```

If a users with the same email address already exists a response of 409 will be send.

If user has been successfully created 201 with the new user data will be send.

### Activities

#### Creation

To create a new activity, clients must send a POST request to the `/api/activities`` endpoint with the following JSON data in the request body:

```json
{
  "title": "Yoga Class",
  "description": "A relaxing yoga class for all levels.",
  "startTime": "2024-04-01T09:00:00Z",
  "endTime": "2024-04-01T10:00:00Z",
  "capacity": 20,
  "instructor": "615f5e2e13fc2d00166c34fd",
  "type": "615f5e2e13fc2d00166c3500"
}
```

#### Get Activities

To retrieve activities, clients can send a GET request to the `/api/activities` endpoint. Optionally, clients can filter activities by specifying query parameters:

- instructor: Filter activities by instructor ID.
- start: Start date range for activities (inclusive) in ISO 8601 format.
- end: End date range for activities (inclusive) in ISO 8601 format.
- type: Filter activities by activity type ID.

The response will contain a list of activities matching the specified filters.

#### Booking and Cancelation

To book a user for an activity, send a PUT request to ` /api/activities/:activity_id` with the user ID in the request body.
To cancel a user's booking for an activity, send a PUT request to `/api/activities/:activity_id/cancel` with the user ID in the request body.
Admin Update
Admins can update activity details by sending a PUT request to `/api/activities/admin/:activity_id` with the updated activity details.

### Membership Plans

The naming of membership Plans might be a little bit confusing. What these mean is something which in german we would call 10er Karte. You have a set amount of times you can attend classes during a specific time frame. These memberships make it cheaper to attend compared to paying single price each time.

#### Creating new membership plans

To create a new membership plan, admins must send a POST request to the `/api/membershipPlans/create` endpoint with the following JSON data in the request body:

```json
{
  "title": "10-Class Pass",
  "price": 100,
  "totalCredits": 10,
  "validity": 30,
  "bookableType": "615f5e2e13fc2d00166c3500"
}
```

#### Get Membership Plans

To retrieve all available membership plans, clients can send a GET request to the `/api/membershipPlans` endpoint.

#### Get single Membership Plan

To retrieve a specific membership plan, clients can send a GET request to the `/api/membershipPlans/:id` endpoint, where :id is the MongoDB ID of the membership plan.

#### Update Membership Plan

To update a membership plan, admins must send a PUT request to the `/api/membershipPlans/update/:id` endpoint with the updated plan details in the request body.

### User Memberships

#### Creation

After booking a specific membership plan, a new user membership needs to be created. To achieve this, clients must send a POST request to the /api/usermemberships endpoint with the following JSON data in the request body:

```json
{
  "membershipPlan": "615f5e2e13fc2d00166c3500",
  "user": "615f5e2e13fc2d00166c3501",
  "expiryDate": "2024-12-31"
}
```

#### Get User Memberships

To retrieve all user memberships, clients can send a GET request to the `/api/usermemberships` endpoint.

#### Get User Membership by ID

To retrieve a specific user membership by ID, clients can send a GET request to the `/api/usermemberships/:membershipId` endpoint, where :membershipId is the MongoDB ID of the user membership.

### Activity Types

Each activity and each membership plan is linked to a specific activity type. Examples are Krav Maga, Yoga or Self Defense for women.

#### Creation

To create a new activity type, clients must send a POST request to the `/api/types` endpoint with the following JSON data in the request body:

```json
{
  "type": "Yoga",
  "images": ["image1.jpg", "image2.jpg"]
}
```

#### Get Activity Types

To retrieve all available activity types, clients can send a GET request to the `/api/types` endpoint.
