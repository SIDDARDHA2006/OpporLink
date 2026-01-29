# OpporLink Platform - Full Stack Application

A complete platform for discovering opportunities, building skills, and growing together with peers.

## Features

### Frontend
- **Dropdown Navigation Menus** - Navigate through Events, Opportunities, Skill Exchange, and Community with detailed submenus
- **Real-time Search** - Search across events, opportunities, and skills with live results
- **Dynamic Filtering** - Filter content by categories (workshops, internships, skills)
- **Interactive Cards** - Clickable event and opportunity cards with detailed modals
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices
- **API Integration** - Fetches real-time data from backend API

### Backend (Node.js + Express)
- **RESTful API** - Complete API with endpoints for events, opportunities, skills, and community
- **In-memory Database** - Fast data storage (easily replaceable with MongoDB/PostgreSQL)
- **Search Functionality** - Global search across all content types
- **Registration System** - Track event registrations and job applications
- **Community Features** - Posts and study groups management
- **Statistics Endpoint** - Platform analytics and metrics

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm (comes with Node.js)

### Setup Steps

1. **Extract the files** to a directory

2. **Install dependencies:**
```bash
npm install
```

3. **Start the backend server:**
```bash
npm start
```

The server will start at `http://localhost:3000`

4. **Open the frontend:**
   - Open `index.html` in your web browser
   - Or serve it using a local server:
   ```bash
   npx http-server -p 8080
   ```
   Then visit `http://localhost:8080`

## API Endpoints

### Events
- `GET /api/events` - Get all events (supports ?category, ?search, ?limit)
- `GET /api/events/:id` - Get single event
- `POST /api/events/:id/register` - Register for an event

### Opportunities
- `GET /api/opportunities` - Get all opportunities (supports ?category, ?search, ?limit, ?company)
- `GET /api/opportunities/:id` - Get single opportunity
- `POST /api/opportunities/:id/apply` - Apply to an opportunity

### Skills
- `GET /api/skills` - Get all skills (supports ?category, ?search, ?limit)
- `GET /api/skills/:id` - Get single skill details

### Community
- `GET /api/community` - Get all community data
- `GET /api/community/posts` - Get community posts
- `GET /api/community/study-groups` - Get study groups
- `POST /api/community/posts` - Create new post

### Search & Stats
- `GET /api/search?query=<term>` - Search across all content
- `GET /api/stats` - Get platform statistics

## API Usage Examples

### Search for events:
```bash
curl http://localhost:3000/api/events?search=hackathon
```

### Register for an event:
```bash
curl -X POST http://localhost:3000/api/events/1/register
```

### Apply to an opportunity:
```bash
curl -X POST http://localhost:3000/api/opportunities/1/apply
```

### Global search:
```bash
curl http://localhost:3000/api/search?query=python
```

## Features in Detail

### Navigation System
The top navigation bar includes dropdown menus for:

1. **Events**
   - Workshops
   - Hackathons
   - Webinars
   - View All Events

2. **Opportunities**
   - Internships
   - Full-time Jobs
   - Fellowships
   - Explore All

3. **Skill Exchange**
   - Learn Skills
   - Teach Skills
   - Find a Mentor
   - Learning Paths

4. **Community**
   - Discussions
   - Study Groups
   - Success Stories
   - Community Events

### Interactive Features
- Click on event cards to see full details
- Click on opportunity cards to apply
- Click on skills to see learning paths
- Real-time search with categorized results
- Filter tabs for quick content filtering
- Toast notifications for user actions
- Modal dialogs for detailed information

## Project Structure

```
ascendify-platform/
├── server.js           # Backend API server
├── index.html          # Frontend application
├── package.json        # Node.js dependencies
└── README.md          # This file
```

## Technology Stack

**Frontend:**
- HTML5
- CSS3 (Custom styling with animations)
- Vanilla JavaScript (ES6+)
- Fetch API for backend communication

**Backend:**
- Node.js
- Express.js
- CORS middleware
- RESTful API design

## Database Schema

The current implementation uses an in-memory database with the following collections:

- **events** - Workshops, hackathons, and webinars
- **opportunities** - Internships, jobs, and fellowships
- **skills** - In-demand skills with learning resources
- **users** - User profiles and preferences
- **community** - Posts and study groups

## Future Enhancements

- [ ] User authentication and authorization
- [ ] Real database integration (MongoDB/PostgreSQL)
- [ ] Email notifications
- [ ] Calendar integration
- [ ] Payment processing for premium features
- [ ] Advanced search with filters
- [ ] User dashboard and profile pages
- [ ] Real-time chat for study groups
- [ ] File uploads for resumes and portfolios
- [ ] Admin panel for content management

## Development

To run in development mode with auto-restart:

```bash
npm run dev
```

This uses nodemon to automatically restart the server when files change.

## Production Deployment

For production deployment:

1. Set up environment variables
2. Use a production-grade database (MongoDB/PostgreSQL)
3. Add authentication middleware
4. Enable HTTPS
5. Set up proper error handling and logging
6. Use a process manager like PM2

## Support

For issues or questions, please check:
- API documentation at `http://localhost:3000/api`
- Browser console for frontend errors
- Server logs for backend issues

## License

MIT License

---

**Built with ❤️ for students and professionals seeking growth opportunities**
