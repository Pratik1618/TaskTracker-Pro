# API Documentation

## Overview

This application currently has **no backend HTTP API**. As of May 9, 2026, TaskTracker is a **client-only Next.js app** that stores all state in the browser using `localStorage`.

That means the current "API surface" of the app is:

- Client-side state hooks
- Shared TypeScript data contracts
- Browser storage keys
- A `mailto:` integration used to open the user's default email client

This document covers:

1. The **implemented client-side contract**
2. The **data models** used throughout the app
3. The **storage schema**
4. A **recommended future REST API** if you later move persistence to a server

## API Design Artifacts

The repository now includes two implementation-planning artifacts for all current screens:

- [openapi.yaml](/d:/pratik/TaskTracker/openapi.yaml): proposed OpenAPI contract
- [TaskTracker.postman_collection.json](/d:/pratik/TaskTracker/TaskTracker.postman_collection.json): matching Postman collection

These are design documents only. They describe the intended HTTP API for:

- Login and session
- Profile
- Dashboard summary
- Tasks
- Work logs
- Work log email/report generation

## Current Architecture

There are currently **no route handlers** under `app/api/*` and no `pages/api/*` endpoints.

Implemented persistence and integration points:

- Authentication state: `localStorage`
- Tasks: `localStorage`
- Work log entries: `localStorage`
- User profile: `localStorage`
- Email report: `window.open("mailto:...")`

Relevant source files:

- [lib/hooks/useAuth.ts](/d:/pratik/TaskTracker/lib/hooks/useAuth.ts)
- [lib/hooks/useTasks.ts](/d:/pratik/TaskTracker/lib/hooks/useTasks.ts)
- [lib/hooks/useWorkLog.ts](/d:/pratik/TaskTracker/lib/hooks/useWorkLog.ts)
- [lib/hooks/useUserProfile.ts](/d:/pratik/TaskTracker/lib/hooks/useUserProfile.ts)
- [lib/types/index.ts](/d:/pratik/TaskTracker/lib/types/index.ts)
- [lib/task-state.ts](/d:/pratik/TaskTracker/lib/task-state.ts)
- [components/WorkLogScreen.tsx](/d:/pratik/TaskTracker/components/WorkLogScreen.tsx)

## Client-Side API

### 1. Auth API

Defined in [lib/hooks/useAuth.ts](/d:/pratik/TaskTracker/lib/hooks/useAuth.ts).

#### State

```ts
{
  isAuthenticated: boolean;
  isAuthLoaded: boolean;
}
```

#### Operations

##### `login(email: string, password: string): Promise<boolean>`

Behavior:

- Accepts any non-empty email and password
- Sets `auth_state = "true"` in `localStorage`
- Returns `true` on success
- Returns `false` if either field is empty

##### `logout(): void`

Behavior:

- Clears authenticated state in memory
- Removes `auth_state` from `localStorage`

#### Storage key

```txt
auth_state
```

Stored value:

```txt
"true"
```

### 2. Task API

Defined in [lib/hooks/useTasks.ts](/d:/pratik/TaskTracker/lib/hooks/useTasks.ts).

#### State

```ts
{
  tasks: Task[];
  isLoaded: boolean;
}
```

#### Operations

##### `addTask(draft: TaskDraft): Task`

Creates a new task using normalization and task rules from [lib/task-state.ts](/d:/pratik/TaskTracker/lib/task-state.ts).

Behavior:

- Generates `id` from the current ISO timestamp
- Sets `createdAt` and `updatedAt`
- Normalizes progress
- Auto-adjusts status when required

##### `updateTask(id: string, updates: Partial<Task>, source?: 'task' | 'worklog'): void`

Default source is `'task'`.

Behavior:

- Updates the matching task
- Recomputes progress and status
- Updates `updatedAt`
- Preserves or updates `lastSyncedEntryId` depending on update source

##### `deleteTask(id: string): void`

Behavior:

- Removes the task from the local task collection
- The UI blocks deletion when work log history exists, but that restriction is enforced in the component layer, not in the hook

##### `getTasksByStatus(status: Status): Task[]`

Returns tasks matching a status.

##### `getOverdueTasks(): Task[]`

Returns non-archived tasks where:

- `expectedEndDate < today`
- `status !== 'completed'`
- `status !== 'cancelled'`

##### `filterTasks(filterType: 'all' | 'pending' | 'completed' | 'overdue'): Task[]`

Returns a filtered task list.

#### Storage key

```txt
tasks
```

Stored value:

```json
Task[]
```

If storage is empty or invalid, the app seeds default tasks from [lib/mock-data.ts](/d:/pratik/TaskTracker/lib/mock-data.ts).

### 3. Work Log API

Defined in [lib/hooks/useWorkLog.ts](/d:/pratik/TaskTracker/lib/hooks/useWorkLog.ts).

#### State

```ts
{
  entries: WorkLogEntry[];
  isLoaded: boolean;
}
```

#### Operations

##### `calculateTotalHours(startTime: string, endTime: string, breakDuration: number): number`

Behavior:

- Parses `HH:mm` values
- Supports overnight spans by rolling into the next day when end time is earlier than start time
- Subtracts break duration in minutes
- Never returns a negative number

##### `addEntry(draft: WorkLogEntryDraft): WorkLogEntry`

Behavior:

- Creates a normalized entry
- Generates `id`, `createdAt`, and `updatedAt`

##### `updateEntry(id: string, updates: Partial<WorkLogEntryDraft>): WorkLogEntry | null`

Behavior:

- Merges updates with the existing entry
- Rebuilds the full normalized object
- Updates `updatedAt`
- Returns the updated entry or `null` if not found

##### `deleteEntry(id: string): void`

Removes the entry from the local collection.

##### `getEntriesForDate(date: string): WorkLogEntry[]`

Returns entries matching a `YYYY-MM-DD` date.

##### `getTotalHoursForDate(date: string): number`

Sums total hours for all entries on a date.

##### `getEntriesForTask(taskId: string): WorkLogEntry[]`

Returns entries mapped to a task.

#### Storage key

```txt
work_log
```

Stored value:

```json
WorkLogEntry[]
```

If storage is empty or invalid, the app seeds default entries from [lib/mock-data.ts](/d:/pratik/TaskTracker/lib/mock-data.ts).

### 4. User Profile API

Defined in [lib/hooks/useUserProfile.ts](/d:/pratik/TaskTracker/lib/hooks/useUserProfile.ts).

#### State

```ts
{
  profile: UserProfile;
  isLoaded: boolean;
}
```

#### Operations

##### `updateProfile(updates: Partial<UserProfile>): void`

Behavior:

- Merges updates into the current profile
- Persists the merged profile immediately to `localStorage`

##### `resetProfile(): void`

Behavior:

- Resets to the built-in default profile
- Removes the `user_profile` storage key

#### Storage key

```txt
user_profile
```

Stored value:

```json
UserProfile
```

## Data Models

Defined in [lib/types/index.ts](/d:/pratik/TaskTracker/lib/types/index.ts).

### Enums / unions

```ts
type Priority = 'normal' | 'medium' | 'critical';
type Status = 'pending' | 'in-progress' | 'on-hold' | 'completed' | 'cancelled';
type AppView = 'dashboard' | 'tasks' | 'worklog';
type TaskFilter = 'all' | 'active' | 'completed' | 'archived' | 'overdue' | Status;
type TaskUpdateSource = 'task' | 'worklog';
```

### `UserProfile`

```ts
interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  jobTitle: string;
  department: string;
  avatar: string;
  managerName: string;
  managerEmail: string;
}
```

### `Task`

```ts
interface Task {
  id: string;
  title: string;
  priority: Priority;
  expectedEndDate: string;
  progress: number;
  status: Status;
  createdAt: string;
  updatedAt: string;
  archived?: boolean;
  lastUpdatedSource?: TaskUpdateSource;
  lastSyncedEntryId?: string | null;
}
```

### `TaskDraft`

```ts
interface TaskDraft {
  title: string;
  priority: Priority;
  expectedEndDate: string;
  progress: number;
  status: Status;
}
```

### `WorkLogEntry`

```ts
interface WorkLogEntry {
  id: string;
  taskId: string;
  startTime: string;
  endTime: string;
  breakDuration: number;
  remarks: string;
  progressPercentage: number;
  progressNotes: string;
  statusUpdate: Status;
  date: string;
  createdAt: string;
  updatedAt: string;
}
```

### `WorkLogEntryDraft`

```ts
interface WorkLogEntryDraft {
  taskId: string;
  date: string;
  startTime: string;
  endTime: string;
  breakDuration: number;
  remarks: string;
  progressPercentage: number;
  progressNotes: string;
  statusUpdate: Status;
}
```

## Business Rules

Defined mostly in [lib/task-state.ts](/d:/pratik/TaskTracker/lib/task-state.ts).

### Task normalization

- Progress is clamped to `0..100`
- If `status === 'completed'`, progress becomes `100`
- If progress reaches `100`, status becomes `'completed'`
- If status is `'pending'` and progress is greater than `0`, status becomes `'in-progress'`

### Work log normalization

- `breakDuration` cannot be negative
- `progressPercentage` is clamped to `0..100`
- Missing time fields are normalized to defaults

### Seed behavior

When storage is empty or JSON parsing fails:

- Tasks are initialized from `createSeedTasks()`
- Work logs are initialized from `createSeedEntries()`

## Local Storage Schema

### `auth_state`

```txt
"true"
```

### `tasks`

Example:

```json
[
  {
    "id": "seed-task-1",
    "title": "Review pending approvals",
    "priority": "critical",
    "expectedEndDate": "2026-05-09",
    "progress": 65,
    "status": "in-progress",
    "createdAt": "2026-05-06T09:00:00.000Z",
    "updatedAt": "2026-05-09T11:30:00.000Z",
    "archived": false,
    "lastUpdatedSource": "task",
    "lastSyncedEntryId": null
  }
]
```

### `work_log`

Example:

```json
[
  {
    "id": "seed-entry-1",
    "taskId": "seed-task-1",
    "startTime": "09:00",
    "endTime": "11:00",
    "breakDuration": 10,
    "remarks": "Collected pending approvals from team leads.",
    "progressPercentage": 40,
    "progressNotes": "Validated most pending records and flagged exceptions.",
    "statusUpdate": "in-progress",
    "date": "2026-05-07",
    "createdAt": "2026-05-07T11:00:00.000Z",
    "updatedAt": "2026-05-07T11:00:00.000Z"
  }
]
```

### `user_profile`

Example:

```json
{
  "id": "1",
  "fullName": "Team Member",
  "email": "team.member@company.com",
  "jobTitle": "Operations Associate",
  "department": "Operations",
  "avatar": "TM",
  "managerName": "",
  "managerEmail": ""
}
```

## External Integration

### Email report

Defined in [components/WorkLogScreen.tsx](/d:/pratik/TaskTracker/components/WorkLogScreen.tsx).

Current behavior:

- Builds a report from the currently filtered work log entries
- Uses `userProfile.managerEmail` as the main recipient when available
- Opens the user’s default email client using `window.open(mailtoUrl)`

This is not a network API call. It is a client-side `mailto:` handoff.

## Recommended Future REST API

If you later add a backend, the current data model maps cleanly to these endpoints.

### Auth

#### `POST /api/auth/login`

Request:

```json
{
  "email": "user@company.com",
  "password": "secret"
}
```

Response:

```json
{
  "token": "jwt-or-session-token",
  "user": {
    "id": "1",
    "fullName": "Team Member",
    "email": "user@company.com"
  }
}
```

#### `POST /api/auth/logout`

Response:

```json
{
  "success": true
}
```

### User Profile

#### `GET /api/profile`

Response:

```json
{
  "id": "1",
  "fullName": "Team Member",
  "email": "team.member@company.com",
  "jobTitle": "Operations Associate",
  "department": "Operations",
  "avatar": "TM",
  "managerName": "",
  "managerEmail": ""
}
```

#### `PATCH /api/profile`

Request:

```json
{
  "managerName": "Alex Manager",
  "managerEmail": "alex.manager@company.com"
}
```

### Tasks

#### `GET /api/tasks`

Query params:

- `status`
- `archived`
- `overdue`

#### `POST /api/tasks`

Request:

```json
{
  "title": "Review pending approvals",
  "priority": "critical",
  "expectedEndDate": "2026-05-09",
  "progress": 0,
  "status": "pending"
}
```

#### `GET /api/tasks/:taskId`

Returns a single task.

#### `PATCH /api/tasks/:taskId`

Request example:

```json
{
  "progress": 65,
  "status": "in-progress",
  "archived": false
}
```

#### `DELETE /api/tasks/:taskId`

Recommended rule:

- Reject deletion with `409 Conflict` if work log entries exist for the task

### Work Logs

#### `GET /api/work-logs`

Query params:

- `fromDate`
- `toDate`
- `taskId`
- `status`

#### `POST /api/work-logs`

Request:

```json
{
  "taskId": "seed-task-1",
  "date": "2026-05-09",
  "startTime": "09:00",
  "endTime": "11:00",
  "breakDuration": 15,
  "remarks": "Reviewed approvals",
  "progressPercentage": 65,
  "progressNotes": "Validated exceptions and escalated blockers.",
  "statusUpdate": "in-progress"
}
```

#### `GET /api/work-logs/:entryId`

Returns a single work log entry.

#### `PATCH /api/work-logs/:entryId`

Updates an existing entry.

#### `DELETE /api/work-logs/:entryId`

Deletes an entry.

### Reports

#### `POST /api/reports/work-log-email`

Suggested purpose:

- Build an email payload server-side
- Optionally send through Outlook, SMTP, or Microsoft Graph later

Suggested request:

```json
{
  "fromDate": "2026-05-07",
  "toDate": "2026-05-09",
  "taskId": "all",
  "status": "all",
  "recipient": "manager@company.com",
  "cc": []
}
```

## Known Gaps

- No HTTP API is implemented yet
- No server-side validation exists
- No database persistence exists
- No real authentication exists
- No OpenAPI or Swagger spec exists yet

## Suggested Next Step

If you want this app to expose a real API, the cleanest first step is:

1. Add `app/api/tasks/route.ts` and `app/api/work-logs/route.ts`
2. Move localStorage logic behind fetch calls
3. Keep the TypeScript models in `lib/types/index.ts` as the shared contract
