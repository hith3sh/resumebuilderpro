# ProResumeDesign - Resume Builder Application

## Project Overview
This is a comprehensive resume builder application built with React and Vite, designed to help users create professional resumes. The application features user authentication, resume services, and admin functionality.

## Technology Stack
- **Frontend Framework**: React 18.2.0 with Vite 4.4.5
- **Routing**: React Router DOM 6.16.0
- **Styling**: TailwindCSS 3.3.3 with Framer Motion 10.16.4 for animations
- **UI Components**: Radix UI components (Dialog, Dropdown, Avatar, etc.)
- **Authentication & Database**: Supabase (supabase-js 2.30.0)
- **Icons**: Lucide React 0.285.0
- **Build Tools**: Vite with custom plugins for visual editing

## Project Structure
```
src/
├── api/                    # API services
│   └── EcommerceApi.js
├── components/             # Reusable components
│   ├── ui/                # UI components (Button, Dialog, Input, etc.)
│   ├── Footer.jsx
│   ├── ResumeGrader.jsx
│   ├── BeforeAndAfter.jsx
│   ├── SocialProof.jsx
│   ├── Services.jsx
│   ├── Contact.jsx
│   ├── Features.jsx
│   └── AdminProtectedRoute.jsx
├── contexts/              # React contexts
│   └── SupabaseAuthContext.jsx
├── lib/                   # Utility libraries
│   ├── customSupabaseClient.js
│   └── utils.js
├── pages/                 # Page components
│   ├── HomePage.jsx
│   ├── LoginPage.jsx
│   ├── ProfilePage.jsx
│   ├── ResumeServicesPage.jsx
│   ├── QuestionnairePage.jsx
│   ├── AdminDashboardPage.jsx
│   └── [other pages...]
└── main.jsx              # Application entry point
```

## Key Features
1. **User Authentication**: Supabase-based authentication system
2. **Resume Services**: Professional resume building services
3. **Admin Dashboard**: Administrative interface for managing the application
4. **Protected Routes**: Authentication-based route protection
5. **Questionnaire System**: User onboarding and data collection
6. **E-commerce Integration**: Hostinger e-commerce API integration
7. **Responsive Design**: Mobile-first responsive design with TailwindCSS

## Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production (includes LLM generation step)
- `npm run preview` - Preview production build

## Environment Configuration
The application uses environment variables for configuration:
- **Supabase**: Database and authentication
- **E-commerce API**: Hostinger e-commerce integration
- **Template Configuration**: Production deployment settings
- **Optional Services**: Analytics, payment processing, email services

## Development Setup
1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env` and configure environment variables
3. Start development server: `npm run dev`
4. Application runs on Vite's default port (usually 5173)

## Authentication Flow
- Uses Supabase for user authentication
- Protected routes for user profiles and admin areas
- Context-based authentication state management
- Redirect URL configured for post-authentication flow

## Deployment
- Built for production hosting on VPS
- Configured with Hostinger Horizons integration
- Custom Vite plugins for error handling and development features
- Production build includes template banner and redirect functionality

## Custom Development Tools
- **Visual Editor Plugins**: Custom Vite plugins for inline editing
- **Error Handling**: Comprehensive error tracking for development and production
- **Console Monitoring**: Enhanced console error reporting
- **Fetch Monitoring**: Network request monitoring and error handling

## Admin Features
- Protected admin dashboard
- User management capabilities
- Service administration
- Analytics and reporting

## UI/UX Features
- Modern, professional design
- Smooth animations with Framer Motion
- Accessible components using Radix UI
- Toast notifications for user feedback
- Progress indicators for multi-step processes

## Code Quality
- ESLint configuration for code quality
- React-specific linting rules
- TypeScript support for enhanced development
- Organized component structure with separation of concerns