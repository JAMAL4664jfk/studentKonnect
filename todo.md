# Scholar Fin Hub Mobile - Migration TODO

## Phase 1: Foundation
- [x] Initialize Expo project
- [x] Install core dependencies (Supabase, navigation, storage)
- [x] Configure Supabase client with expo-secure-store
- [x] Migrate theme colors from web to theme.config.js

## Phase 2: State Management
- [x] Migrate WalletContext with AsyncStorage
- [x] Migrate InstitutionContext with AsyncStorage
- [x] Setup react-native-toast-message for notifications
- [ ] Copy and adapt custom hooks (useAuth, useWallet)

## Phase 3: Navigation
- [x] Setup Bottom Tab Navigator (Home, Services, Chat, Profile)
- [x] Create Stack Navigators for nested screens
- [x] Configure navigation icons and styling

## Phase 4: Authentication
- [x] Create Auth screen with Login/Register tabs
- [x] Convert web forms to TextInput components
- [x] Implement Supabase authentication logic
- [x] Add loading states and error handling
- [x] Add authentication guards and routing
- [x] Create useAuthState hook for auth management

## Phase 5: Dashboard
- [x] Migrate Dashboard screen
- [x] Create WalletCard component with native styling
- [x] Implement transaction list with FlatList
- [x] Add quick action buttons
- [ ] Migrate financial analytics charts

## Missing Features Fix (IN PROGRESS)
- [x] Fix missing images in Marketplace listings
- [x] Fix missing images in Accommodation listings
- [x] Use expo-image for better performance
- [x] Add fallback UI for missing images
- [ ] Add background images to screens
- [x] Complete Wellness Support page with all features
- [x] Add Mental Health Counseling booking
- [x] Add Financial Counseling booking
- [x] Add Academic Counseling booking
- [x] Add Bereavement Support
- [x] Add Wellness resources section
- [x] Add Crisis support with 24/7 helpline
- [x] Add counseling booking modal
- [x] Restore missing wallet quick actions
- [x] Add Money Market action
- [x] Add Savings Pockets action
- [ ] Test all restored features

## ID Text Centering Fix (COMPLETE)
- [x] Fix ID text to be centered like other text
- [x] Stack ID and status vertically instead of horizontally
- [x] Remove flex-row from ID and status container

## Card Background & Text Centering (COMPLETE)
- [x] Add white background to card container
- [x] Center all text on the card
- [x] Add items-center to overlay container
- [x] Center student info section

## Wallet Card Styling Fix (COMPLETE)
- [x] Fix card image to fill parent container
- [x] Update text to use monospace font
- [x] Reduce font sizes for student name and balance
- [x] Add drop shadow to text
- [x] Use contentFit fill for proper image scaling

## Wallet Card Redesign (COMPLETE)
- [x] Copy new Omnex Global card image to assets
- [x] Update Home screen with horizontal card layout
- [x] Add student ID, status pill, and name overlay on card
- [x] Add account text below card
- [x] Replace gradient card with Omnex Global card image

## New Fixes Required (IN PROGRESS)
- [x] Fix Podcasts screen - now with audio player and Supabase integration
- [ ] Fix Career Innovation screen - not working
- [ ] Fix Tutoring screen - not working
- [ ] Fix Accommodation screen issues
- [ ] Implement Chat Groups feature
- [ ] Implement Chat Status feature
- [ ] Implement Chat Find feature
- [ ] Implement Chat Voice Calls
- [ ] Implement Chat Video Calls
- [ ] Review and fix error messages throughout app

## Transaction Statement Download (COMPLETE)
- [x] Install expo-print and expo-sharing packages
- [x] Create PDF generation utility function
- [x] Add download statement button to transaction screen
- [x] Generate PDF with transaction data and summary
- [x] Add share functionality for generated PDFs
- [x] Load user profile for personalized statements
- [x] Add loading indicator during PDF generation

## Profile Pictures in Chat (COMPLETE)
- [x] Update ChatContext to fetch profile pictures
- [x] Display profile pictures in chat list
- [x] Display profile pictures in chat detail screen
- [x] Add fallback avatars for users without pictures
- [x] Display current user's profile picture in chat

## Phase 6: Profile Picture Upload (COMPLETE)
- [x] Install expo-image-picker package
- [x] Create image picker utility function
- [x] Add profile picture upload to Profile screen
- [x] Implement camera capture functionality
- [x] Implement gallery selection functionality
- [x] Upload images to Supabase Storage
- [x] Update user profile with avatar URL
- [x] Display profile picture in Profile screen
- [x] Add image compression and optimization
- [x] Add modal for image source selection

## Phase 5: Chat Functionality (COMPLETE)
- [x] Analyze original Chat implementation from React.js project
- [x] Create ChatContext for state management
- [x] Implement real-time message subscriptions
- [x] Create message sending functionality
- [x] Implement conversation list with unread counts
- [x] Create chat detail screen with message history
- [x] Add message timestamps and read receipts
- [x] Add ChatProvider to app layout
- [x] Integrate with Supabase conversations and messages tables

## Phase 2: Wallet Card & More Options (COMPLETE)
- [x] Redesign wallet card with Visa/Mastercard styling
- [x] Add card chip, card number, expiry date
- [x] Create More Options modal component
- [x] Add Buy Airtime/Data action
- [x] Add Buy Electricity action
- [x] Add Buy Betting Vouchers action
- [x] Add Buy Gift Cards action
- [x] Add Content Cards action
- [x] Integrate with WalletContext for purchases
- [x] Add More button to Quick Actions section

## Phase 1: Service Navigation (COMPLETE)
- [x] Create Marketplace screen
- [x] Create Student Accommodation screen
- [x] Create Student Loans screen
- [x] Create Tutoring screen
- [x] Create E-Hailing screen
- [x] Create Student Podcast screen
- [x] Create Wellness Support screen
- [x] Create Career Innovation screen
- [x] Create Student Dating screen
- [x] Add navigation routes for all services
- [x] Connect service buttons to routes
- [x] Make wallet card clickable to view transactions

## Phase 6: Core Features
- [x] Migrate Chat screen with FlatList
- [x] Create transaction history screen
- [x] Implement transaction filtering (category, date, type)
- [x] Add transaction detail modal
- [ ] Migrate Marketplace screen
- [ ] Migrate Student Services screens
- [ ] Migrate Wellness Support screen
- [ ] Migrate Career Innovation screen

## Phase 7: Additional Features
- [ ] Migrate Student Loan screen
- [ ] Migrate Student Accommodation screen
- [ ] Migrate Student Podcast screen
- [ ] Migrate Dating screen
- [ ] Migrate E-Hailing screen

## Chat Fixes (COMPLETE)
- [x] Fix chat type bar safe area issue (behind device navigation)
- [x] Fix plus icon functionality in chat detail
- [x] Add Groups tab to Chat screen
- [x] Add Calls tab to Chat screen
- [x] Add Status tab to Chat screen
- [x] Add call buttons (voice/video) to chat detail screen header
- [x] Reference original source code for chat features

## UI Updates (COMPLETE)
- [x] Change Active status to orange pill on wallet card
- [x] Redesign Quick Actions: wider cards, horizontal scroll, background images, remove icons
- [x] Redesign Featured Services: taller cards, background images, remove icons

## Phase 8: Polish & Testing
- [x] Fix status bar handling and safe area
- [x] Fix bottom tab bar visibility
- [x] Fix back navigation
- [x] Update login screen UI to match design
- [ ] Implement haptic feedback
- [ ] Add loading indicators
- [ ] Test all navigation flows
- [ ] Verify Supabase integration
- [ ] Test on iOS and Android
- [ ] Create final checkpoint

## Background Images Replacement (COMPLETE)
- [x] Find original background images from React.js app assets
- [x] Copy images to mobile app assets folder
- [x] Update Quick Actions cards to use original images
- [x] Update Featured Services cards to use original images

## New Features Implementation (COMPLETE)
- [x] Center text in pills with dark opacity background on Quick Actions and Featured Services cards
- [x] Add original background images to More Options modal items
- [x] Create notification page with list view
- [x] Create notification detail page
- [x] Implement real-time database notifications using Supabase subscriptions
- [x] Add emoji picker to chat detail screen
- [x] Implement file attachment sending in chat
- [x] Implement voice calling functionality
- [x] Implement video calling functionality

## UI/UX Fixes (COMPLETE)
- [x] Move Featured Services card labels below the cards (not overlaid on image)
- [x] Make More Options modal content scrollable
- [x] Implement Discover tab in Chat to search and start conversations with database users

## Missing Features Implementation (IN PROGRESS)
- [x] Complete Savings Pockets with all fields from original source (Priority 1)
- [x] Implement Send Money form with all fields (Priority 1)
- [x] Implement Pay form with all fields (Priority 1)
- [ ] Implement Buy Data form with all fields (Priority 2)
- [ ] Implement Buy Electricity form with all fields (Priority 2)
- [ ] Implement Gift Cards form with all fields (Priority 2)
- [ ] Implement Study Roster feature (Priority 2)
- [ ] Implement Study Material feature (Priority 2)
- [ ] Implement Betting Voucher form with all fields (Priority 3)
- [ ] Implement Money Market form with all fields (Priority 3)
- [ ] Implement NSFAS Portal integration (Priority 3)
- [ ] Implement Student Health Cover feature (Priority 3)
- [ ] Implement Money Advance feature (Priority 3)

## Additional Missing Features (IN PROGRESS)
- [x] Add Trusted by Students banners (university/brand logos carousel) to Home screen
- [x] Fix expo-barcode-scanner error in Pay screen (replaced with expo-camera)
- [x] Create dating-swipe screen with profile creation form
- [x] Implement Dating swipe functionality with like/pass buttons
- [x] Implement Dating matches screen
- [ ] Implement Dating chat functionality
- [ ] Implement complete Marketplace with shopping, products, cart
- [x] Implement AI Counselor Chat with OpenAI integration
- [x] Implement Yoga Exercises section with video tutorials (7 categories, videos)
- [x] Implement Wellness Library with articles and resources
- [x] Create complete Wellness Support main screen integrating all components
- [ ] Implement Digital Connect tab in bottom navigation
- [ ] Create complete Digital Connect page with all features from original source
- [ ] Implement complete Find a Tutor page with tutoring system and all features

## Video Player & Tutor Implementation (COMPLETE)
- [x] Replace WebView with expo-video component for Wellness videos
- [x] Add proper video controls and fullscreen support
- [x] Extract Find a Tutor implementation from original source code
- [x] Implement tutor listing with search and filters (6 demo tutors)
- [x] Implement tutor profile view with booking
- [ ] Add video call integration for tutoring sessions (future enhancement)

## Tutoring System Fixes (COMPLETE)
- [x] Rebuild Tutoring main screen to match original with all sections
- [x] Add "Become a Tutor" registration form
- [x] Add "My Sessions" dashboard for booked sessions
- [x] Add "My Tutoring" dashboard for tutors
- [x] Integrate all tutoring features properly with tabs

## Tutor Button Fix (COMPLETE)
- [x] Fix Find a Tutor button to switch to tutor listing tab
- [x] Ensure tab navigation works properly in tutor.tsx

## Tutoring & Accommodation Fixes (COMPLETE)
- [x] Fix unwanted space below tutoring navigation tabs
- [x] Implement Accommodation listing detail view
- [x] Implement Create Accommodation Listing form
- [x] Implement Manage My Listings screen for accommodation
- [x] Add navigation between accommodation screens

## Digital Connect Implementation (COMPLETE)
- [x] Review original Digital Connect/Marketplace source code
- [x] Create Digital Connect main screen with categories
- [x] Implement product listing with search and filters
- [x] Implement product detail view with images and descriptions
- [x] Implement shopping cart functionality
- [x] Implement checkout process with payment
- [x] Add navigation from More Options modal

## Career and Innovation Implementation (COMPLETE)
- [x] Review original Career and Innovation source code
- [x] Create Career main screen with header and navigation
- [x] Implement Career Innovation card with guidance system
- [x] Implement Explore Opportunities button and job board
- [x] Add job listings with search and filters
- [x] Implement job detail view with application
- [x] Add career development features display
- [x] Implement CV upload functionality
- [x] Add job application system

## Career Job Listings Enhancement (COMPLETE)
- [x] Review original Scholar Hub job listing card design and interactions
- [x] Enhance job listing cards with company logos and better visual hierarchy
- [x] Improve job detail modal with enhanced layout and information display
- [x] Add post job opportunity modal with all form fields from original
- [x] Implement referral system display (Earn up to R500)
- [x] Add CV upload functionality with file picker
- [x] Enhance search and filter with job type tabs
- [x] Add match score color coding (green 90+, blue 80+, yellow 70+)
- [x] Add posted date to job listings
- [x] Improve job detail modal with quick info grid
- [x] Add 11 diverse job listings across all categories

## Chat Functionality Complete Implementation (COMPLETE)
- [x] Review Student Konnect Scholar chat source code
- [x] Implement Groups tab with create group functionality
- [x] Add group discovery and search (My Groups + Discover Groups)
- [x] Add join public groups functionality
- [x] Implement Calls tab with call logs (incoming/outgoing/missed)
- [x] Add call filter (all/missed/incoming/outgoing)
- [x] Display call duration and status
- [x] Implement Status tab like WhatsApp
- [x] Add create status with text/image
- [x] Add view status with full-screen viewer
- [x] Add 24-hour status expiry
- [x] Implement Discover tab with user search
- [x] Add user profiles with institution and course info
- [x] Add connection requests system
- [x] Add start chat from discover
- [x] Connect all tabs with real-time Supabase subscriptions
- [x] Add refresh functionality for all tabs

## Real-Time Chat Messaging (COMPLETE)
- [x] Update Discover page to show all users on platform (remove connection restrictions)
- [x] Allow chatting with any user without connection requirement
- [x] Implement real-time message sending and receiving
- [x] Add typing indicators in chat
- [x] Add read receipts for messages (UPDATE events)
- [x] Add message timestamps
- [x] Add auto-scroll to latest message
- [x] Subscribe to real-time message updates via Supabase
- [x] Add typing indicator broadcast channel
- [x] Show "typing..." status in chat header

## Discover Tab Fix (COMPLETE)
- [x] Debug why Discover tab shows "No users found"
- [x] Check database connection and query
- [x] Verify profiles table has data
- [x] Fix loadAllUsers function with sample data fallback
- [x] Test user display in Discover tab
- [x] Added 8 sample South African university students
- [x] Implemented error handling with graceful fallback

## Supabase Real User Setup (COMPLETE)
- [x] Create Supabase profiles table with SQL migration (supabase-setup.sql)
- [x] Set up Supabase authentication flow with automatic profile creation
- [x] Create profile on user signup via trigger function
- [x] Remove space below chat navigation tabs (py-3 → py-2)
- [x] Update Discover to load real Supabase users only
- [x] Remove sample data fallback completely
- [x] Real-time messaging works with Supabase subscriptions
- [x] All chat features (Groups, Calls, Status, Discover) use real database

## Sample Data Fallback Restoration (COMPLETE)
- [x] Add sample data fallback when Supabase profiles table doesn't exist
- [x] Allow testing UI before running SQL migration
- [x] Keep real Supabase as primary data source

## Chat UI Fixes and Group Chat (COMPLETE)
- [x] Remove blank space above groups tab (mt-4 → mt-2)
- [x] Implement group chat functionality
- [x] Enable clicking group to open group chat modal
- [x] Add member list in group chat with message buttons
- [x] Real-time group messaging with Supabase subscriptions
- [x] Calls from chats automatically reflect in Calls tab via database
- [x] Statuses automatically reflect in Status tab via real-time subscriptions

## Remove Empty Space Below Tabs (COMPLETE)
- [x] Remove empty space below navigation tabs in Tutoring screen (py-3 → py-1)
- [x] Remove empty space below navigation tabs in Chat screen (py-2 → py-1)

## Tutoring Tab Padding Reduction (COMPLETE)
- [x] Reduce padding of navigation tabs in Tutoring screen (pb-2 → pb-1)

## Tutoring Search Bar Spacing (COMPLETE)
- [x] Reduce space above search bar in Tutoring screen (py-1 → py-0)

## Additional Tutoring Spacing Reduction (COMPLETE)
- [x] Check and remove tab navigation bottom margin (no margin found)
- [x] Check and remove content area top margin/padding (added mt-0)

## Negative Margin for Search Bar (COMPLETE)
- [x] Apply negative top margin to bring search bar closer to tabs (-mt-2)
- [x] Added py-2 back for proper internal spacing
- [x] Search bar now directly adjacent to tab navigation

## Remove Tab Navigation Padding (COMPLETE)
- [x] Find all tab navigation ScrollViews with px-4 padding
- [x] Remove px-4 from tutoring tab navigation ScrollView
- [x] Reduce first tab button padding in chat (pl-2 instead of px-4)
- [x] Reduce first tab button padding in tutoring (pl-2)
- [x] Tabs now start from edge for better space utilization

## Tutoring Pill-Shaped Tabs (IN PROGRESS)
- [ ] Convert tutoring tabs to compact pill-shaped buttons
- [ ] Fix tab height to not take up half the screen
- [ ] Add proper rounded corners and padding for pill shape

## Tutoring Pill-Shaped Tabs Redesign (COMPLETE)
- [x] Convert tutoring tabs from underline style to compact pill-shaped buttons
- [x] Fix tab height to not take up excessive vertical space
- [x] Add proper rounded corners (rounded-full) and padding for pill shape
- [x] Active tab now has primary color background with white text
- [x] Inactive tabs have surface background with muted text
- [x] Reduced icon size from 18 to 16 for more compact design
- [x] Removed border-bottom underline style
- [x] Added proper spacing with px-4 py-2 on container

## Second Tutoring Navigation Tabs Height Fix (COMPLETE)
- [x] Locate the second set of navigation tabs below the header (Subject Filter tabs)
- [x] Reduce excessive tab height (py-2 → py-1.5, px-4 → px-3)
- [x] Optimize spacing and padding for compact design
- [x] Reduce container padding (py-2 → py-1)
- [x] Add text-sm class for smaller font size

## Tutoring Tabs Flex-Grow Fix (COMPLETE)
- [x] Remove flex-grow from tutoring tabs ScrollView
- [x] Add contentContainerStyle with flexGrow: 0
- [x] Prevent tabs from taking excessive vertical space

## Tutoring Tabs Direct Style Prop Fix (COMPLETE)
- [x] Add style={{ flexGrow: 0 }} to ScrollView
- [x] Override flex-grow on ScrollView container itself
- [x] Prevent r-flexGrow class from causing vertical expansion

## Tutoring Tabs Cropping Fix (COMPLETE)
- [x] Remove flexGrow: 0 that's causing vertical cropping
- [x] Wrap ScrollView in View with proper padding (px-4 py-3)
- [x] Ensure pills display fully without being cut off

## Subject Filter Pills Cropping Fix (COMPLETE)
- [x] Wrap Subject Filter ScrollView in View container
- [x] Remove flex-grow behavior causing cropping
- [x] Ensure subject pills display fully without being cut off

## Chat Navbar Tabs Fix (COMPLETE)
- [x] Apply same View wrapper fix to Chat navbar
- [x] Wrap ScrollView in View container with border-b
- [x] Ensure consistent tab styling across app

## Complete Marketplace Implementation (COMPLETE)
- [x] Add navigation tabs (All, Popular, Recent, My Listings, Favorites)
- [x] Implement post new listing functionality with image upload
- [x] Add manage listings (delete own listings)
- [x] Implement like/unlike functionality with visual feedback
- [x] Add full listing detail view with image gallery
- [x] Implement contact seller functionality
- [x] Referenced original Scholar Hub Marketplace source code

## Chat/Groups/Calls Search & Scrollability (IN PROGRESS)
- [ ] Add search bar for filtering chats
- [ ] Add search bar for filtering groups
- [ ] Add search bar for filtering calls
- [ ] Improve scrollability with proper FlatList implementation

## Podcast Creation & Episode Upload (COMPLETE)
- [x] Add create podcast series functionality
- [x] Implement post episode with audio/media upload (standalone or series)
- [x] Display uploaded media with episodes (thumbnails and audio players)
- [x] Show podcast series management (My Content tab)
- [x] Referenced original Scholar Hub Podcast source code
- [x] Added episode metadata (number, season, duration)
- [x] Series detail view with all episodes

## Podcast Rating & Comment System (COMPLETE)
- [x] Add 5-star rating system for episodes
- [x] Display average rating and rating count on episode cards
- [x] Implement comments section for episodes
- [x] Add like/unlike comments functionality
- [x] Add reply to comments functionality
- [x] Create episode detail modal with full ratings and comments
- [x] Show "View ratings & comments" link on episode cards

## Podcast Playback Error Fix (COMPLETE)
- [x] Fix variable naming conflict in renderPodcast function
- [x] Rename local isPlaying variable to isCurrentlyPlaying to avoid circular reference

## Font Loading Timeout Error Fix (COMPLETE)
- [x] Investigate fontfaceobserver timeout issue (NativeWind web font loading)
- [x] Fix font loading configuration by adding system fonts to tailwind config
- [x] Use system font stack as fallback to prevent timeout

## Services Screen Original Styling (COMPLETE)
- [x] Use original background images for service cards
- [x] Use original icons for each service
- [x] Style card labels with badges like quick options from original design
- [x] Referenced Scholar Hub source code for exact styling
- [x] Added LinearGradient overlay for better text readability
- [x] Implemented hero card style with ImageBackground

## Add Gamification Page & Update Wellness Background (COMPLETE)
- [x] Examine original Gamification page from Scholar Hub source
- [x] Copy Gamification background image to mobile app assets
- [x] Add Gamification service to services screen
- [x] Create Gamification page with proper routing
- [x] Copy original Wellness background image
- [x] Update Wellness page to use original background image with gradient overlay

## Add Brand Icons to Gamification Rewards (IN PROGRESS)
- [ ] Copy brand logos (Netflix, Uber, Takealot, KFC) from original source
- [ ] Update gamification page to display brand icons instead of generic icons
- [ ] Match original Scholar Hub rewards design

## Add Career Innovation Fund & Skills Development Pages (IN PROGRESS)
- [ ] Examine original Career page for Innovation Fund details
- [ ] Examine original Career page for Skills Development details
- [ ] Create Innovation Fund page with application functionality
- [ ] Create Skills Development page with courses and resources
- [ ] Add navigation from Career screen to these pages

## Add Brand Icons to Gamification & Career Pages (COMPLETE)
- [x] Copy brand logos (Netflix, Uber, Takealot, KFC) from original source
- [x] Update gamification rewards to display brand icons
- [x] Examine original Career page for Innovation Fund and Skills Development
- [x] Add Innovation Fund page with pitch submission
- [x] Add Skills Development page with premium courses
- [x] Add navigation buttons in Career screen
- [x] Copy background images for Innovation Fund and Skills Development
- [x] Add lightbulb icon mapping for Innovation Fund

## Redesign Authentication Pages with Original Scholar Hub Design (COMPLETE)
- [x] Copy auth-hero-background.jpg from original source to mobile app assets
- [x] Update sign-in page with background image and gradient overlay
- [x] Add proper icons (Wallet, LogIn, UserPlus, Fingerprint, CheckCircle2, GraduationCap, etc.)
- [x] Implement institution type selection (University, TVET College, College)
- [x] Add signup method selection (Full Registration vs Quick Registration cards)
- [x] Implement Full Registration form with all fields (Full Name, Student Number, Institution, Course/Program, Year of Study, Email, Password)
- [x] Add Quick Registration flow with student lookup functionality
- [x] Include biometric security info banner in signup
- [x] Add proper validation messages and password requirements
- [x] Style forms to match original Scholar Hub card design with backdrop blur and shadow glow effects

## Fix Authentication Background Image Display (COMPLETE)
- [x] Fix ImageBackground to properly display auth-hero-background.jpg
- [x] Use inline style with require() for background image in React Native
- [x] Verify background image shows on all authentication screens
- [x] Update icons to use MaterialCommunityIcons (school, tools, office-building)
- [x] Match original icon styling and colors from Scholar Hub source

## Debug Authentication Background Image Not Showing (COMPLETE)
- [x] Check if ImageBackground works on web platform
- [x] Try using Image with absolute positioning instead of ImageBackground
- [x] Switch to expo-image for better web compatibility
- [x] Use contentFit instead of resizeMode for expo-image
- [x] Background image now displays correctly with gradient overlay

## Update App Logo and Sign-In Background (COMPLETE)
- [x] Copy Student Konnect logo to app icon locations
- [x] Update app.config.ts with Student Konnect branding and logo URL
- [x] Use hero-multiracial-students.jpg as sign-in page background
- [x] Add blur effect to sign-in background for better readability (blurRadius=6)
- [x] Test logo displays correctly in app launcher and splash screen

## Fix Background Image Not Displaying on Native (COMPLETE)
- [x] Debug why hero-multiracial-students.jpg isn't loading on native mobile
- [x] Switched from expo-image to React Native ImageBackground for better native compatibility
- [x] Verified image path and file exists in assets/images
- [x] Used require() for proper image bundling
- [x] Background now displays correctly with blur effect on mobile

## Reduce Background Blur for Better Visibility (COMPLETE)
- [x] Change blur radius from 6 to 3 on authentication background
- [x] Students now more visible while text remains readable

## Fix Calls Tab Filter Button Sizing (COMPLETE)
- [x] Find Chats tab button styling reference
- [x] Update Calls tab filter buttons (All, Missed, Incoming, Outgoing) to match Chats sizing
- [x] Reduce button padding from px-4 py-2 to px-3 py-1.5 for normal pill button size
- [x] Reduce ScrollView padding from py-3 to py-2
- [x] Buttons now display correctly at proper size

## Match Call Filter Pills to Tutoring Pills Size (COMPLETE)
- [x] Find tutoring pills styling reference (px-3 py-1.5 rounded-full, font-medium)
- [x] Apply exact same padding and sizing to call filter pills
- [x] Remove border styling from call pills to match tutoring
- [x] Change font-semibold to font-medium
- [x] All, Missed, Incoming, Outgoing pills now match tutoring pills exactly

## Fix Call Filter ScrollView Vertical Stretching (COMPLETE)
- [x] Add style={{ flexGrow: 0 }} to call filter ScrollView
- [x] Prevent React Native Web flex-grow behavior from stretching pills vertically
