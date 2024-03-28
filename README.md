# Artemis Academy - Booking Platform

## Purpose

This is the backend to my booking platform for self defense and yoga classes. Class details, membership plans and user date is safed in mongodb.

## API

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

### Creation

To create a new activity, clients must send a POST request to the /api/activities endpoint with the following JSON data in the request body:


### Get Activities
To retrieve activities, clients can send a GET request to the /api/activities endpoint. Optionally, clients can filter activities by specifying query parameters:

- instructor: Filter activities by instructor ID.
- mon: Start date range for activities (inclusive) in ISO 8601 format.
- sun: End date range for activities (inclusive) in ISO 8601 format.
- type: Filter activities by activity type ID.

The response will contain a list of activities matching the specified filters.
