# FinSight Frontend

The FinSight frontend is a modern, responsive web application built with Next.js and TypeScript. It provides an intuitive interface for users to manage their finances, visualize spending patterns, and receive AI-powered insights.

## Overview

This frontend application connects to the FinSight backend API to deliver a seamless financial management experience. Users can track transactions, view analytics, upload CSV files, and receive personalized financial recommendations—all through a clean, user-friendly interface.

## Technology Stack

- **Next.js 16** - React framework with App Router for optimal performance
- **TypeScript** - Type-safe JavaScript for reliable code
- **Tailwind CSS** - Utility-first CSS framework for responsive design
- **Recharts** - Composable charting library for data visualization
- **Supabase Auth** - Authentication client for user management
- **React Context API** - State management for authentication

## Core Features

### 🔐 Authentication System
Secure user authentication with:
- Login and registration pages
- JWT token management
- Protected routes
- Session persistence
- Automatic token refresh

### 📊 Dashboard
Financial overview at a glance:
- Total income and expenses summary
- Net savings calculation
- Category-wise spending breakdown (pie chart)
- Recent transactions list
- Latest AI-generated insights

### 💳 Transaction Management
Complete transaction interface:
- View all transactions in a searchable table
- Filter by date range, category, or type
- Sort by date, amount, or category
- Add new transactions manually
- Edit or delete existing transactions
- Automatic AI categorization for new entries

### 📈 Analytics View
Visual spending analysis:
- Summary statistics cards
- Category distribution pie chart
- Monthly trend line charts
- Anomaly detection alerts
- Customizable date range filtering

### 💡 Insights Page
AI-powered financial advice:
- Generate new insights on demand
- View historical insights
- Categorized by type (trend, advice, alert, summary)
- Natural language recommendations
- Actionable financial tips

### 📤 CSV Upload
Bulk transaction import:
- Drag-and-drop CSV upload
- File format validation
- Preview before import
- Bulk AI categorization
- Download template file
- Import status and error reporting

## Application Structure

### Pages

#### `/` - Landing Page
Welcome page with application overview and login/register options.

#### `/auth/login` - Login Page
User authentication form:
- Email input
- Password input
- Submit button
- Link to registration page
- Error message display

#### `/auth/register` - Registration Page
New user account creation:
- Email input
- Password input (with confirmation)
- Submit button
- Link to login page
- Validation feedback

#### `/dashboard` - Dashboard
Main application hub:
- Financial summary cards
- Spending breakdown chart
- Recent transactions widget
- Latest insights preview
- Quick action buttons

#### `/transactions` - Transactions Page
Transaction management interface:
- Transaction list table
- Add transaction button
- Search/filter controls
- Date range selector
- Category filter dropdown
- Type filter (income/expense)
- Edit/delete actions

#### `/insights` - Insights Page
AI insights center:
- Generate insights button
- Insights list
- Type badges (trend, advice, alert, summary)
- Timestamp display
- Refresh button

#### `/upload` - Upload Page
CSV import interface:
- File upload dropzone
- Template download link
- Format instructions
- Upload progress indicator
- Success/error messages
- Import summary

### Components

#### `NavBar`
Application navigation:
- Logo and brand name
- Navigation links (Dashboard, Transactions, Insights, Upload)
- User account menu
- Logout button
- Responsive mobile menu

#### `AppLayout`
Shared layout wrapper:
- Includes NavBar
- Main content area
- Footer (optional)
- Consistent padding and styling

#### `PageHeader`
Reusable page title component:
- Page title
- Optional subtitle
- Optional action buttons
- Consistent styling

#### `Loading`
Loading state indicator:
- Spinner animation
- Loading message
- Centered layout

### Context

#### `AuthContext`
Authentication state management:
- Current user data
- Login function
- Logout function
- Register function
- Token management
- Loading states

### API Client (`lib/api.ts`)

Centralized API communication:
- Base URL configuration
- Request interceptors (auth headers)
- Response interceptors (error handling)
- Type-safe API methods
- Automatic token injection

**API Methods:**
- `auth.login(email, password)`
- `auth.register(email, password)`
- `transactions.list(filters)`
- `transactions.create(data)`
- `transactions.update(id, data)`
- `transactions.delete(id)`
- `analytics.getSummary(dateRange)`
- `analytics.getAnomalies()`
- `analytics.getTrends(months)`
- `insights.generate(days)`
- `insights.list(limit)`
- `upload.uploadCSV(file)`
- `upload.downloadTemplate()`

### Type Definitions (`types/index.ts`)

TypeScript interfaces for type safety:

```typescript
interface User {
  id: string;
  email: string;
}

interface Transaction {
  id: string;
  user_id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  source: string;
  created_at: string;
}

interface Insight {
  id: string;
  user_id: string;
  generated_at: string;
  content: string;
  type: 'trend' | 'advice' | 'alert' | 'summary';
}

interface AnalyticsSummary {
  total_income: number;
  total_expenses: number;
  net_savings: number;
  by_category: Record<string, number>;
}
```

## User Experience Flow

### First-Time User
1. **Landing** → View welcome page
2. **Register** → Create account
3. **Redirect** → Automatically logged in to dashboard
4. **Empty State** → Prompted to add transactions or upload CSV
5. **Add Data** → Manual entry or CSV upload
6. **Explore** → View analytics and generate insights

### Returning User
1. **Login** → Enter credentials
2. **Dashboard** → View financial summary
3. **Navigate** → Use NavBar to access features
4. **Manage** → Add, edit, or delete transactions
5. **Analyze** → Check analytics and insights
6. **Logout** → Secure session termination

## Styling & Theming

### Tailwind CSS
Utility-first approach with custom configuration:
- Custom color palette
- Responsive breakpoints
- Custom spacing scale
- Typography presets
- Component classes

### Design System
- **Primary Color**: Blue (#3B82F6)
- **Success**: Green (#10B981)
- **Warning**: Yellow (#F59E0B)
- **Danger**: Red (#EF4444)
- **Neutral**: Gray scale

### Component Patterns
- Card-based layouts
- Consistent spacing (4px grid)
- Rounded corners (border-radius: 8px)
- Shadow depths (sm, md, lg)
- Hover states and transitions

## Data Visualization (Ongoing Development)

### Charts (Recharts)

#### Pie Chart - Category Breakdown
Shows spending distribution by category:
- Interactive tooltips
- Color-coded segments
- Percentage labels
- Responsive sizing

#### Line Chart - Monthly Trends
Displays spending over time:
- Multiple data series (income, expenses, savings)
- Grid lines for readability
- X-axis: Months
- Y-axis: Amount in currency
- Legend for data series
- Interactive hover states

#### Bar Chart - Category Comparison
Compares spending across categories:
- Horizontal or vertical bars
- Color-coded by category
- Value labels
- Sortable by amount

## State Management

### AuthContext Provider
Wraps the entire application:
- Manages user authentication state
- Provides auth functions to all components
- Handles token storage in localStorage
- Automatic token refresh

### Local Component State
Each page manages its own data:
- Transaction list in transactions page
- Insights list in insights page
- Analytics data in dashboard
- Form states in modals

### API State
- Loading states during API calls
- Error states for failed requests
- Success states for confirmations
- Optimistic UI updates where applicable

## Error Handling

### API Errors
- Display user-friendly error messages
- Retry failed requests
- Redirect to login on 401 errors
- Toast notifications for errors

### Validation Errors
- Form field validation
- Real-time feedback
- Clear error messages
- Disabled submit on invalid input

### Network Errors
- Offline detection
- Retry mechanism
- Graceful degradation
- Cached data display

## Performance Optimization

### Next.js Features
- **Server-Side Rendering (SSR)**: Fast initial page load
- **Static Generation**: Pre-rendered pages where possible
- **Code Splitting**: Automatic route-based splitting
- **Image Optimization**: Next.js Image component
- **Font Optimization**: Automatic font optimization

### React Optimizations
- **Lazy Loading**: Components loaded on demand
- **Memoization**: Prevent unnecessary re-renders
- **Virtual Scrolling**: For large transaction lists
- **Debounced Search**: Reduce API calls

## Accessibility

### ARIA Standards
- Semantic HTML elements
- ARIA labels for screen readers
- Keyboard navigation support
- Focus management

### Contrast & Readability
- WCAG AA compliant color contrast
- Readable font sizes
- Clear focus indicators
- Sufficient spacing

## API Integration

The frontend communicates with the backend API:
- **Base URL**: Configured via `NEXT_PUBLIC_API_URL` environment variable
- **Authentication**: JWT token in Authorization header
- **Request Format**: JSON
- **Response Format**: JSON

### Environment Variables
```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Security Considerations

- **Protected Routes**: Authentication required for app pages
- **Token Storage**: Secure localStorage with expiration
- **XSS Prevention**: React's built-in escaping
- **CSRF Protection**: SameSite cookies
- **Input Sanitization**: Validation on all user inputs

---

**FinSight Frontend** - A beautiful interface for financial clarity
