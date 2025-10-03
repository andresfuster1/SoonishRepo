# Soonish - Social Future Planning App

## Application Description

**Soonish** is a modern React.js social application that revolutionizes how friends plan and coordinate future activities. The app allows users to share three types of future-focused content:

- **Micro-plans** - Quick plans for the next 24 hours
- **Events** - Concerts, parties, and meetups with ticketing integration
- **Travel plans** - Trips and travel itineraries with flight details

The core innovation is **overlap detection** - users receive real-time notifications when their future plans align with friends' activities, enabling spontaneous meetups and shared experiences. With an integrated map view, users can visualize upcoming plans and discover when they'll be in the same location as friends.

## APIs Used

### Core APIs (Implemented)
- **Firebase Authentication API** - User registration, login, and session management
- **Firebase Firestore API** - Real-time database for posts, user profiles, and notifications
- **Firebase Real-time Database** - Live feed updates and real-time synchronization

### External APIs (Planned Integration)
- **Google Maps Places API** - Venue search, location autocomplete, and map visualization
- **Ticketmaster Discovery API** - Event search, venue details, and ticket information
- **Amadeus Travel API** - Flight search, booking details, and travel itineraries
- **Firebase Cloud Messaging API** - Push notifications for overlap detection and friend activities

## Installation Instructions

### Prerequisites
- Node.js 16+ and npm
- Firebase project with Firestore and Authentication enabled

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd soonish
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Fill in your Firebase configuration and API keys in `.env`:
   ```env
   VITE_FIREBASE_API_KEY=your_firebase_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   
   # Optional API keys for enhanced features
   VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
   VITE_TICKETMASTER_API_KEY=your_ticketmaster_api_key_here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## Usage Instructions

### Getting Started with Soonish

#### 1. **Account Setup**
- Open the app and click "Sign Up" to create a new account
- Enter your email and password, then verify your email address
- Complete your profile with a display name and optional profile picture

#### 2. **Creating Your First Post**
- Click the "+" button in the navigation bar to create a new post
- Choose from three post types:
  - **Micro Plan**: Quick activities for the next 24 hours (e.g., "Coffee at Starbucks at 3pm")
  - **Event**: Concerts, parties, or meetups (e.g., "Taylor Swift concert next Friday")
  - **Travel**: Trips and travel plans (e.g., "Weekend in Paris, March 15-17")
- Add location, time, and description details
- Click "Post" to share with your friends

#### 3. **Finding and Adding Friends**
- Navigate to the "Friends" tab
- Search for friends by email or username
- Send friend requests and accept incoming requests
- Your feed will show posts from accepted friends

#### 4. **Using the Feed**
- View the main feed to see all posts from friends in chronological order
- Posts are color-coded by type (blue for micro-plans, purple for events, orange for travel)
- Like and comment on friends' posts
- The feed updates in real-time as friends post new content

#### 5. **Map View**
- Click the "Map" tab to see a visual representation of upcoming plans
- Location pins show where you and your friends will be
- Overlapping plans are highlighted with special indicators
- Click on pins to see post details

#### 6. **Notifications**
- Receive notifications when friends post plans near your location or time
- Get alerts for overlapping plans with friends
- Notifications appear in the bell icon in the navigation bar
- Configure notification preferences in your profile settings

#### 7. **Managing Your Plans**
- View your own posts in your profile
- Edit or delete your plans as needed
- See statistics about your posting activity
- Update your profile information and preferences

### Tips for Best Experience
- **Be specific with locations** - Include venue names or addresses for better overlap detection
- **Post in advance** - Share plans early so friends can coordinate
- **Check the map regularly** - Discover unexpected overlaps with friends
- **Engage with friends' posts** - Like and comment to stay connected
- **Keep plans updated** - Edit or delete plans if they change
