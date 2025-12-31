# SchemaCraft

A professional full-stack web application for visually designing database schemas with draggable tables, fields, and relationships. Export your designs to production-ready MySQL SQL files.

## Features

### Core Features
- Visual database schema designer with drag-and-drop interface
- Create and manage tables with columns
- Define column properties:
  - Data types (VARCHAR, INT, TEXT, DATE, etc.)
  - Primary keys
  - Foreign keys
  - Unique constraints
  - Nullable/NOT NULL
  - Auto-increment
- Visual relationship drawing between tables (One-to-One, One-to-Many, Many-to-Many)
- Export schema as MySQL SQL file with:
  - CREATE TABLE statements
  - Foreign key constraints
  - All column properties
- Save/Load schemas to/from database
- Professional, clean UI with Tailwind CSS

## Tech Stack

### Frontend
- **React 19** with TypeScript (strict mode)
- **TailwindCSS** for styling
- **Redux Toolkit** for state management
- **react-draggable** for drag-and-drop functionality
- **Vite** for development and building
- **Axios** for API communication
- **Lucide React** for icons

### Backend
- **Node.js** with **Express.js**
- **TypeScript** for type safety
- **MongoDB** with Mongoose for data persistence
- **CORS** enabled for cross-origin requests

## Project Structure

```
schema-craft/
├── src/                      # Frontend source
│   ├── components/          # Reusable UI components
│   ├── modules/             # Feature modules
│   ├── store/               # Redux store and slices
│   ├── types/               # TypeScript type definitions
│   ├── utils/               # Utility functions (SQL export)
│   └── services/            # API services
├── backend/                  # Backend source
│   └── src/
│       ├── models/          # Mongoose models
│       ├── routes/          # Express routes
│       ├── controllers/     # Route controllers
│       ├── services/        # Business logic
│       └── config/          # Configuration files
└── README.md
```

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- MongoDB (running locally or remote instance)

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` and set your MongoDB connection string:
```env
MONGODB_URI=mongodb://localhost:27017/schema-craft
PORT=5000
```

4. Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. From the project root, install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
```

The default API URL is `http://localhost:5000/api`

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

### Running Both Servers

Open two terminal windows:

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
npm run dev
```

## Usage

1. **Create a Schema**: Click "New Schema" and give it a name
2. **Add Tables**: Use the sidebar to create tables
3. **Add Columns**: Select a table and add columns with their properties
4. **Position Tables**: Drag tables around the canvas
5. **Create Relationships**: Click "Add Relationship" to link tables
6. **Export SQL**: Click "Export SQL" to generate and download MySQL code
7. **Save**: Click "Save" to persist your schema to the database
8. **Load**: Click "Load" to retrieve previously saved schemas

## Development

### Frontend Build
```bash
npm run build
```

### Backend Build
```bash
cd backend
npm run build
npm start
```

### Type Checking
TypeScript strict mode is enabled for both frontend and backend.

## Architecture Highlights

- **Modular Component Design**: All UI components are reusable and typed
- **Type Safety**: Comprehensive TypeScript interfaces for all data models
- **State Management**: Redux Toolkit with typed hooks
- **Clean Architecture**: Separation of concerns (UI / Logic / Data)
- **SOLID Principles**: Applied in both frontend and backend
- **RESTful API**: Standard CRUD operations for schemas

## Future Enhancements

- PostgreSQL export support
- Multi-user collaboration
- User authentication
- Schema versioning
- Visual query builder
- Database migrations generator
- Dark mode

## License

MIT

---

Built with modern best practices for scalability and maintainability.
