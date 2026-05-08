# User Profile Feature Guide

## Overview
The Daily Task Tracker now includes a comprehensive user profile section that identifies whose task board it is. Users can view and edit their profile information directly from the sidebar.

## User Profile Components

### 1. Profile Card in Sidebar
Located at the top of the left sidebar, the profile card displays:
- **Avatar**: A visual emoji representation (e.g., 👨‍💼)
- **Full Name**: User's complete name
- **Job Title**: Position/role

Click the profile card to open the profile details popover.

### 2. Profile Popover (View Mode)
When you click the profile card, a popover opens showing:
- **Full Name**: Complete name
- **Job Title**: Position/role
- **Email**: Contact email
- **Department**: Department assignment

An **Edit** button in the top-right corner lets you modify the profile.

### 3. Profile Edit Mode
Click the Edit button to modify your profile with:
- **Full Name**: Your complete name
- **Email**: Your email address
- **Job Title**: Your position/role
- **Department**: Your department
- **Avatar**: An emoji to represent you

All changes are saved to localStorage and persist across sessions.

## Default Profile
If no profile is set, the system uses a default profile:
- **Name**: John Doe
- **Email**: john.doe@company.com
- **Job Title**: Software Developer
- **Department**: Engineering
- **Avatar**: 👨‍💼

## How to Use

### View Your Profile
1. Click the profile card at the top of the sidebar
2. See your full profile information
3. Close by clicking outside the popover

### Edit Your Profile
1. Click the profile card to open the popover
2. Click the Edit button (pencil icon)
3. Modify any field you want to change
4. Click "Save" to apply changes
5. Click "Cancel" to discard changes

### Reset Profile
To reset to the default profile, clear localStorage using browser dev tools or modify the `useUserProfile` hook.

## Data Persistence
- All profile data is saved to localStorage under the key `user_profile`
- Changes persist across page refreshes and browser sessions
- Each user's browser has its own separate profile data

## Integration with Dashboard
The user profile appears throughout the dashboard:
- **Sidebar**: Shows profile card for quick identification
- **Work Log**: Helps track whose work hours are being logged
- **Tasks**: Identifies the task owner for team collaboration features (future)

## Technical Details

### UserProfile Type
```typescript
interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  jobTitle: string;
  department: string;
  avatar: string;
}
```

### useUserProfile Hook
The custom hook provides:
- `profile`: Current user profile object
- `updateProfile(updates)`: Update profile fields
- `resetProfile()`: Reset to default profile
- `isLoaded`: Loading state for async operations

## Future Enhancements
- Multi-user support with authentication
- Profile pictures instead of emoji avatars
- Team profiles and role-based access
- Profile synchronization with HRMS system
