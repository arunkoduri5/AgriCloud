# AgriRent — Cloud-Based Agricultural Equipment Rental Platform

A responsive React web app for discovering agricultural machinery, requesting rental dates, and managing bookings. It includes a browser-based demo mode so the full workflow can be shown without cloud credentials, plus Firebase Authentication and Cloud Firestore integration when configured.

## Run on Windows

Install Node.js LTS from [nodejs.org](https://nodejs.org/). Open PowerShell in this project folder and run:

```powershell
npm.cmd install
npm.cmd run dev
```

Open the local URL shown in the terminal (usually `http://localhost:5173`). If PowerShell blocks `npm`, use the `.cmd` form above.

To create and test a production build:

```powershell
npm.cmd run build
npm.cmd run preview
```

## Demo mode

The app starts in demo mode when Firebase variables are empty. Data is stored in that browser's local storage; it is not shared with other devices.

- Farmer: choose **Log in**, select **Farmer**, then create a farmer account. You can also browse without logging in.
- Admin: choose **Log in**, select **Admin**, and use any email and password. The default email shown is `admin@agrirent.demo`.
- Admin can add, edit, and remove listings, approve pending requests, or reject them.
- The catalog has separate Vehicles (10 listings) and Equipment (9 listings) sections, using names and hourly rates from the previous farm-machinery-booking project. Booking cost is total rental hours × hourly rental rate. Only overlapping **approved** bookings block a date range.
- Use the same browser to show the farmer and admin views. Log out to switch roles.
- To reset demo records, clear this site's local storage in browser developer tools (Application/Storage → Local Storage → remove `agrirent-demo-v1`).

Demo mode is intended for local presentation. It does not provide production authentication or cross-user cloud storage.

## Connect Firebase

1. Create a Firebase project and register a **Web app** in the Firebase console.
2. Enable **Authentication → Sign-in method → Email/Password**.
3. Create a **Cloud Firestore** database.
4. Copy `.env.example` to `.env` and fill in the Web app config values:

```text
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

5. In Firestore Rules, publish the contents of `firestore.rules`.
6. Add the sample equipment from the app's demo catalog as documents in the `equipment` collection. Each document uses `name`, `category`, `pricePerHour` (number), `group` (Vehicles or Equipment), `location`, `description`, `image`, `active` (boolean), and optional `badge` fields. Firestore does not automatically receive demo-mode local data.
7. Register your farmer account through the app. To grant an administrator role, change that user's document in `users/{uid}` to `{ role: "admin" }` in the Firebase console. Only a trusted project owner should do this. New users can create only farmer profiles.
8. Restart the dev server after changing `.env`:

```powershell
npm.cmd run dev
```

The green cloud indicator changes to **Cloud connected** when all Firebase values are present. Never commit `.env` or share private service account credentials. Firebase web app config is designed to be present in the client; Firestore rules enforce access.

## Deploy to Vercel

1. Push this project to a Git repository and import it into Vercel.
2. Set the six `VITE_FIREBASE_...` variables in the Vercel project settings if using Firebase.
3. Use `npm run build` as the build command and `dist` as the output directory.
4. Deploy. Add the deployed domain to Firebase Authentication's authorized domains.

For a simple local showcase, no deployment is required. The Vercel live URL requires a Vercel account and your own project configuration.

## What to demonstrate

1. Browse equipment and use search, category filters, and price sorting.
2. Register as a farmer, open a listing, choose a date range, and submit a request.
3. Log out and enter the admin dashboard. Approve or reject the request and add/edit equipment.
4. Return to the farmer account and show the updated booking status.

## Project structure

```text
src/
  App.jsx       Main pages, booking workflow, and UI components
  data.js       Demo storage and Firestore data operations
  firebase.js   Firebase initialization
  main.jsx      React entry point
  styles.css    Responsive green-and-white interface
firestore.rules
.env.example
```

## Demo farmers

20 fictional farmer accounts are included in browser demo mode: `farmer01@agrirent.demo` through `farmer20@agrirent.demo`. All use the demo password `demo1234`. The admin dashboard lists farmer profiles. These test accounts are not created in Firebase Authentication; cloud mode lists actual registered farmers. Existing browser accounts and bookings are preserved when these demo profiles are added.

## Full demo dataset and farmer inspection

Demo mode includes 40 fictional booking requests distributed across Pending, Approved, Rejected, and Cancelled, with rental hours, matching hourly prices, dates, crop, field location, delivery preference, and status notes. The initial mix is 12 Pending, 12 Approved, 8 Rejected, and 8 Cancelled. Counts always use actual stored records and change when requests are reviewed. Click a farmer card or a farmer name on an admin booking to inspect the profile, farm details, per-status counts, and booking history. Phone numbers are masked fictional placeholders. Existing bookings, accounts, and admin decisions are retained; sample records are inserted only once. No demo records are uploaded to Firebase.
