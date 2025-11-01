
### App Description for Ionic Framework Recreation

This document outlines the features, architecture, and backend requirements to recreate the React Native "MeditationApp" using the Ionic Framework ( React).

---

### 1. High-Level Overview

The application is a mobile-first meditation and mindfulness app. It provides users with guided meditation sessions via YouTube videos, tracks their daily practice consistency ("streaks"), and allows them to discover new content through a search feature. User data and authentication are managed by Supabase.

### 2. Core Features

*   **User Authentication**: Secure sign-up and sign-in using email and password.
*   **Home Dashboard**: A personalized screen that welcomes the user, displays their meditation streaks, and shows a list of predefined meditation videos.
*   **YouTube Video Player**: An in-app player for streaming meditation sessions from YouTube.
*   **Session & Streak Tracking**: Automatically logs a completed meditation session when a video finishes and updates the user's current and longest streaks.
*   **Meditation Search**: Functionality to search YouTube for new meditation videos.
*   **User Profile**: A dedicated screen to view account details and meditation statistics.
*   **Reminder Notifications**: Schedules a daily local notification to remind users to complete their session and maintain their streak.

---

### 3. Technology Stack & Key Services

*   **Frontend**: Ionic Framework. The UI should be built with Ionic's pre-built, platform-adaptive components to ensure a native look and feel.
*   **Backend-as-a-Service**: Supabase.
    *   **Authentication**: Supabase Auth for user management.
    *   **Database**: Supabase's Postgres database for storing user profiles and video data.
    *   **Serverless Functions**: A Supabase RPC (database function) handles the core logic of updating user streaks.
*   **Video Content**: YouTube Data API v3 for searching videos.
*   **Native Functionality**: Capacitor should be used to access native device features.
    *   **Push/Local Notifications**: To schedule daily reminders.
    *   **Secure Storage**: For securely persisting the Supabase auth session token.
    *   **YouTube Player**: A Capacitor plugin will be needed to embed and control the YouTube player.

---

### 4. Screen / Page Breakdown

The app's navigation is split into two main flows: **Authentication** and **Main App**.

#### **Authentication Flow** (Single Page)

*   **`AuthScreen`**:
    *   **Purpose**: Handles both user sign-in and sign-up.
    *   **UI Components**:
        *   Email and Password input fields.
        *   A primary button for "Sign In" or "Sign Up".
        *   A secondary text button to toggle between sign-in and sign-up modes.
        *   Displays error messages from the authentication process.
    *   **Logic**:
        *   Interacts with `supabase.auth.signInWithPassword` and `supabase.auth.signUp`.
        *   Upon successful authentication, the user is navigated to the main app interface.

#### **Main App Flow** (Tabbed Interface)

Once logged in, the user is presented with a bottom tab navigator containing three tabs.

*   **Tab 1: `HomeScreen`**
    *   **Purpose**: The main landing page for authenticated users.
    *   **UI Components**:
        *   A "Welcome back!" header.
        *   A **Streak Display** component showing "Current Streak" and "Longest Streak".
        *   A vertical list of **Meditation Cards**, each displaying a video's thumbnail, title, and description.
    *   **Logic**:
        *   On load, it fetches the user's profile from the Supabase `profiles` table to populate the streak display.
        *   It fetches a list of videos from the Supabase `predefined_videos` table to populate the cards.
        *   Tapping a `MeditationCard` navigates the user to the `PlayerScreen`, passing the selected video's data.
        *   Initiates the request for notification permissions on the first load.

*   **Tab 2: `SearchScreen`**
    *   **Purpose**: Allows users to discover new meditation content.
    *   **UI Components**:
        *   A search bar at the top.
        *   A loading indicator while fetching results.
        *   A list of result cards, similar to `MeditationCard`.
    *   **Logic**:
        *   When the user submits a search query, it calls a service that queries the YouTube Data API v3.
        *   The results are mapped into a consistent video object format and displayed.
        *   Tapping a search result navigates the user to the `PlayerScreen`.

*   **Tab 3: `ProfileScreen`**
    *   **Purpose**: Displays user information and allows sign-out.
    *   **UI Components**:
        *   Displays the user's email address.
        *   Shows the user's current and longest streaks (similar to the Home Screen).
        *   A "Sign Out" button.
    *   **Logic**:
        *   Fetches data from the `profiles` table in Supabase.
        *   The "Sign Out" button calls `supabase.auth.signOut()` and navigates the user back to the `AuthScreen`.

#### **Modal Screen**

*   **`PlayerScreen`**:
    *   **Purpose**: Plays the selected meditation video and logs completion.
    *   **UI Components**:
        *   The video title.
        *   An embedded YouTube player component.
        *   Simple player controls (e.g., a Play/Pause button).
        *   A loading spinner that appears after the video finishes.
    *   **Logic**:
        *   Receives video data (ID, title, etc.) via navigation parameters.
        *   The YouTube player should be configured to autoplay.
        *   **Crucially**, it must listen for the player's "ended" state change event.
        *   When the video ends:
            1.  Display an alert to the user: "Meditation Complete!".
            2.  Call the Supabase RPC function `handle_meditation_completion` with the video's details.
            3.  Schedule a local reminder notification for ~22-24 hours in the future.
            4.  Automatically navigate the user back to the previous screen.

---

### 5. Backend (Supabase) Details

#### **Database Schema**

*   **`profiles` table**:
    *   `id` (UUID, primary key, foreign key to `auth.users.id`)
    *   `current_streak` (integer, default 0)
    *   `longest_streak` (integer, default 0)
    *   `last_meditation_date` (date)
    *   Other user-related fields (e.g., `username`, `updated_at`).
*   **`predefined_videos` table**:
    *   `id` (integer, primary key)
    *   `video_id` (text, the YouTube video ID)
    *   `title` (text)
    *   `description` (text)
    *   `thumbnail_url` (text)

#### **RPC Function**

*   **`handle_meditation_completion(video_id_param, video_title_param)`**:
    *   This is a PL/pgSQL function in Supabase.
    *   It should contain the server-side logic to idempotently update the calling user's streak based on `last_meditation_date`.
    *   **Logic Summary**:
        1.  Get the `user.id` from the session.
        2.  Retrieve the user's profile from the `profiles` table.
        3.  Check if `last_meditation_date` was yesterday. If so, increment `current_streak`.
        4.  Check if `last_meditation_date` was not today. If it was a day before yesterday or earlier, reset `current_streak` to 1. If it was today, do nothing to the streak.
        5.  Update `last_meditation_date` to the current date.
        6.  Update `longest_streak` if `current_streak` is greater.
    *   (Optional) It could also log the completed session to a `meditation_history` table.

---

### 6. Services & Logic (Ionic/Angular Example)

*   **`AuthService`**: Manages the user's authentication state via a `BehaviorSubject` or similar reactive state management pattern. It will wrap all `supabase.auth` calls.
*   **`SupabaseDataService`**: Handles all interactions with the Supabase database, such as fetching user profiles and predefined videos.
*   **`YoutubeApiService`**: Contains the logic for making `fetch` requests to the YouTube API search endpoint.
*   **`NotificationService`**: Wraps the Capacitor Local Notifications plugin to provide methods for requesting permissions and scheduling reminders.

### 7. Environment Variables

The application will require the following environment variables:
*   `SUPABASE_URL`: The URL for your Supabase project.
*   `SUPABASE_ANON_KEY`: The public anonymous key for your Supabase project.
*   `YOUTUBE_API_KEY`: Your API key for the YouTube Data API v3.

---

### 8. Implementation TODO Plan

- [x] **Project Foundations**
    - [x] Scaffold Ionic React project with Capacitor integration.
    - [x] Configure TypeScript, ESLint, Prettier, and Husky (pre-commit hooks).
    - [x] Set up environment variable handling for Supabase and YouTube keys.
    - [x] Establish shared UI theme, typography, and color tokens.
- [x] **Navigation & Layout**
    - [x] Implement authentication gate and routing structure (Auth vs. Main tabs).
    - [x] Build bottom tab navigator with placeholders for Home, Search, Profile.
    - [x] Configure global modal route for PlayerScreen.
- [x] **Authentication Flow**
    - [x] Implement `AuthService` wrapping Supabase Auth (sign-in, sign-up, session management).
    - [x] Create `AuthScreen` UI with form validation and mode toggle.
    - [x] Persist auth session securely using Capacitor Secure Storage.
    - [x] Add error handling, loading states, and toast feedback.
- [x] **HomeScreen**
    - [x] Design streak display component with current/longest values.
    - [x] Build meditation card list with thumbnail, title, description.
    - [x] Integrate Supabase `profiles` fetch for streak data.
    - [x] Integrate Supabase `predefined_videos` fetch for initial videos.
    - [x] Request notification permission on first authenticated load.
- [x] **SearchScreen**
    - [x] Implement search bar with debounced input and submission handling.
    - [x] Create `YoutubeApiService` to query YouTube Data API v3.
    - [x] Map search results to shared video model and render list.
    - [x] Handle loading, empty, and error states gracefully.
- [x] **ProfileScreen**
    - [x] Display user email and streak metrics using Supabase profile data.
    - [x] Implement sign-out button wired to Supabase Auth service.
    - [x] Add profile refresh mechanism (pull-to-refresh or manual trigger).
- [x] **PlayerScreen Modal**
    - [x] Integrate Capacitor YouTube player plugin with autoplay configuration.
    - [x] Handle video end event to trigger completion workflow.
    - [x] Show completion alert and navigate back on success.
- [x] **Completion Workflow**
    - [x] Call Supabase RPC `handle_meditation_completion` with video payload.
    - [x] Schedule next-day reminder via NotificationService.
    - [x] Update local state/cache for streaks after completion.
- [ ] **Supabase Backend**
    - [x] Define `profiles`, `predefined_videos`, and optional `meditation_history` tables.
    - [x] Implement `handle_meditation_completion` RPC with idempotent streak logic.
    - [x] Seed predefined videos dataset.
    - [x] Configure RLS policies and service roles for secure access.
- [x] **Services & State**
    - [x] Implement `SupabaseDataService` for profile and video CRUD.
    - [x] Implement `NotificationService` abstracting Capacitor Local Notifications.
    - [x] Add global state management (Context or Zustand) for user/session data.
- [x] **Cross-Cutting Concerns**
    - [x] Centralize API error handling and toast notifications.
    - [x] Implement loading skeletons/spinners for async states.
    - [x] Ensure accessibility (aria labels, sufficient contrast, screen reader tags).
- [x] **Testing & Quality**
    - [x] Write unit tests for services (Auth, SupabaseData, YouTube, Notifications).
    - [x] Add component tests for key screens and streak logic.
    - [x] Configure end-to-end tests (e.g., Playwright) for core user flows.
    - [x] Set up CI pipeline (lint, test, build) on repository push.
- [x] **Deployment & Release**
    - [x] Configure Supabase environments (dev/prod) and secrets management.
    - [x] Prepare web deployment (Ionic build) and mobile packaging via Capacitor.
    - [x] Document release process and user onboarding instructions.