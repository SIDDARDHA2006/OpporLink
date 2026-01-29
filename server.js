// server.js - Node.js Backend Server
const express = require('express');
const cors = require('cors');
const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const app = express();
const PORT = 3001;
const path = require('path');

// Middleware
app.use(cors({
  origin: ["http://127.0.0.1:3002", "http://localhost:3002"],
  methods: ["GET", "POST"],
  credentials: true
}));
app.use(express.json());

// NOTE: Static middleware moved to END of file (after all API routes)
// This ensures API routes are checked first before serving static files

// ===== TEST ROUTE =====
app.get("/test", (req, res) => {
  console.log("GET /test called");
  res.json({ message: "Backend working" });
});

// ===== EVENTS ROUTE (Non-API) =====
app.get("/events", (req, res) => {
  console.log("GET /events called");
  res.status(200).json(database.events);
});

async function verifyFirebaseToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: "Invalid token" });
  }
}


// In-memory database (replace with MongoDB/PostgreSQL in production)
let database = {
      users: [],
    // UPDATED: events now use richer structure while keeping backward-compatible fields like `date` and `type`
    events: [
        {
            id: 1,
            title: 'Future Hack 2026',
            description: 'Join us for an exciting AI/ML hackathon where you will build innovative solutions using cutting-edge technologies.',
            // legacy fields (kept so existing UI/search continue to work)
            date: 'Jan 30 - Feb 2',
            type: 'Hackathon',
            // NEW required fields
            rules: [
                'Teams of up to 4 members',
                'All code must be written during the event',
                'Use only publicly available datasets or those provided by organizers'
            ],
            timeline: [
                'Jan 15, 2026 – Registrations open',
                'Jan 28, 2026 – Shortlisting & team confirmations',
                'Jan 30 - Feb 2, 2026 – Main hackathon'
            ],
            category: 'hackathons',
            mode: 'online',
            domain: 'ai-ml',
            difficulty: 'intermediate',
            eventDate: '2026-01-30T09:00:00Z',
            registrationDeadline: '2026-01-28T23:59:59Z',
            prize: '$10,000',
            organizer: 'Tech Institute',
            requiredSkills: ['Python', 'Machine Learning', 'TensorFlow'],
            registrations: 245,
            maxParticipants: 500,
            // existing fields used elsewhere
            location: 'Online',
            tags: ['creative', 'coding', 'ai'],
            skills: ['Python', 'Machine Learning', 'TensorFlow']
        },
        {
            id: 2,
            title: 'Web Dev Bootcamp',
            description: 'Intensive 3-day bootcamp covering modern web development with React, Node.js, and MongoDB.',
            date: 'Feb 5 - Feb 7',
            type: 'Workshop',
            rules: [
                'Individual or pair participation allowed',
                'Bring your own laptop',
                'Complete all daily assignments to receive certificate'
            ],
            timeline: [
                'Feb 1, 2026 – Registrations close',
                'Feb 5 - Feb 7, 2026 – Bootcamp sessions',
                'Feb 10, 2026 – Project feedback & certificates'
            ],
            category: 'workshops',
            mode: 'offline',
            domain: 'web-dev',
            difficulty: 'beginner',
            eventDate: '2026-02-05T10:00:00Z',
            registrationDeadline: '2026-02-01T23:59:59Z',
            prize: 'Certificate',
            organizer: 'Code Academy',
            requiredSkills: ['HTML', 'CSS', 'JavaScript'],
            registrations: 180,
            maxParticipants: 200,
            location: 'New York, NY',
            tags: ['coding'],
            skills: ['React', 'Node.js', 'MongoDB']
        },
        {
            id: 3,
            title: 'Design Sprint 2026',
            description: 'Collaborative design sprint focusing on UI/UX principles and user-centered design methodologies.',
            date: 'Feb 10 - Feb 12',
            type: 'Competition',
            rules: [
                'Teams of 3-5 designers',
                'Submit Figma prototypes and presentation deck',
                'Follow provided design brief and accessibility guidelines'
            ],
            timeline: [
                'Feb 1, 2026 – Design brief release',
                'Feb 10 - Feb 12, 2026 – Sprint days',
                'Feb 15, 2026 – Jury presentations & results'
            ],
            category: 'competitions',
            mode: 'hybrid',
            domain: 'ui-ux',
            difficulty: 'intermediate',
            eventDate: '2026-02-10T09:30:00Z',
            registrationDeadline: '2026-02-08T23:59:59Z',
            prize: '$5,000',
            organizer: 'Design Studio',
            requiredSkills: ['Figma', 'UI/UX', 'Prototyping'],
            registrations: 95,
            maxParticipants: 150,
            location: 'San Francisco, CA',
            tags: ['creative', 'design'],
            skills: ['Figma', 'UI/UX', 'Prototyping']
        },
        {
            id: 4,
            title: 'Startup Weekend',
            description: 'Build a startup from scratch in 54 hours with mentorship from successful entrepreneurs.',
            date: 'Feb 15 - Feb 17',
            type: 'Competition',
            rules: [
                'Teams of 2-6 members',
                'Original startup ideas only',
                'Pitch deck and demo required for final presentation'
            ],
            timeline: [
                'Feb 10, 2026 – Idea submission & team formation',
                'Feb 15 - Feb 17, 2026 – Build & mentor sessions',
                'Feb 18, 2026 – Final pitches & awards'
            ],
            category: 'college-events',
            mode: 'offline',
            domain: 'business',
            difficulty: 'advanced',
            eventDate: '2026-02-15T09:00:00Z',
            registrationDeadline: '2026-02-12T23:59:59Z',
            prize: '$15,000',
            organizer: 'Startup Hub',
            requiredSkills: ['Business Strategy', 'Pitching', 'Marketing'],
            registrations: 320,
            maxParticipants: 400,
            location: 'Boston, MA',
            tags: ['business', 'creative'],
            skills: ['Business Strategy', 'Pitching', 'Marketing']
        },
        {
            id: 5,
            title: 'Cloud Computing Workshop',
            description: 'Hands-on workshop on AWS, Azure, and Google Cloud Platform for modern cloud architecture.',
            date: 'Feb 20 - Feb 22',
            type: 'Workshop',
            rules: [
                'Basic programming knowledge required',
                'Participants must have trial accounts on at least one cloud provider',
                'Complete final lab to receive completion badge'
            ],
            timeline: [
                'Feb 10, 2026 – Pre-work & setup instructions',
                'Feb 20 - Feb 22, 2026 – Live workshop',
                'Feb 25, 2026 – Follow-up Q&A session'
            ],
            category: 'webinars',
            mode: 'online',
            domain: 'data-science',
            difficulty: 'intermediate',
            eventDate: '2026-02-20T11:00:00Z',
            registrationDeadline: '2026-02-18T23:59:59Z',
            prize: 'AWS Certification Voucher',
            organizer: 'Cloud Academy',
            requiredSkills: ['AWS', 'Docker', 'Kubernetes'],
            registrations: 410,
            maxParticipants: 600,
            location: 'Online',
            tags: ['coding'],
            skills: ['AWS', 'Docker', 'Kubernetes']
        }
    ],
    opportunities: [
        {
            id: 1,
            title: 'Software Engineer Intern',
            company: 'Google',
            description: 'Work on cutting-edge projects with world-class engineers. Build scalable systems serving billions of users.',
            deadline: 'Feb 28, 2026',
            location: 'Mountain View, CA',
            type: 'Internship',
            duration: '12 weeks',
            stipend: '$8,000/month',
            skills: ['Python', 'DSA', 'System Design'],
            requirements: ['CS degree or equivalent', '3.0+ GPA', 'Strong problem-solving skills'],
            logo: 'G',
            category: 'internships',
            applicants: 1250,
            openings: 50
        },
        {
            id: 2,
            title: 'Data Analyst Internship',
            company: 'Global CobsF Jam',
            description: 'Analyze large datasets to derive insights and support business decision-making.',
            deadline: 'Mar 10, 2026',
            location: 'Chicago, IL',
            type: 'Internship',
            duration: '10 weeks',
            stipend: '$6,000/month',
            skills: ['UI/UX', 'Figma', 'SQL', 'Excel', 'Tableau'],
            requirements: ['Statistics background', 'Excel proficiency', 'SQL knowledge'],
            logo: 'GC',
            category: 'internships',
            applicants: 890,
            openings: 30
        },
        {
            id: 3,
            title: 'Frontend Developer',
            company: 'Meta',
            description: 'Build beautiful, responsive user interfaces for Facebook and Instagram products.',
            deadline: 'Mar 15, 2026',
            location: 'Menlo Park, CA',
            type: 'Internship',
            duration: '12 weeks',
            stipend: '$9,000/month',
            skills: ['React', 'JavaScript', 'CSS', 'TypeScript'],
            requirements: ['Strong JavaScript skills', 'React experience', 'Portfolio required'],
            logo: 'M',
            category: 'internships',
            applicants: 2100,
            openings: 40
        },
        {
            id: 4,
            title: 'ML Engineer Intern',
            company: 'Microsoft',
            description: 'Develop machine learning models and AI solutions for Azure cloud services.',
            deadline: 'Mar 20, 2026',
            location: 'Redmond, WA',
            type: 'Internship',
            duration: '12 weeks',
            stipend: '$8,500/month',
            skills: ['Python', 'TensorFlow', 'ML', 'PyTorch'],
            requirements: ['ML coursework', 'Python expertise', 'Research experience preferred'],
            logo: 'MS',
            category: 'internships',
            applicants: 1680,
            openings: 35
        },
        {
            id: 5,
            title: 'Product Designer',
            company: 'Apple',
            description: 'Design next-generation products and experiences for millions of users worldwide.',
            deadline: 'Mar 25, 2026',
            location: 'Cupertino, CA',
            type: 'Internship',
            duration: '14 weeks',
            stipend: '$9,500/month',
            skills: ['Figma', 'UI/UX', 'Design', 'Prototyping'],
            requirements: ['Design portfolio', '3+ years design experience', 'User research skills'],
            logo: 'A',
            category: 'internships',
            applicants: 3200,
            openings: 20
        }
    ],
    skills: [
        {
            id: 1,
            name: 'React',
            category: 'Frontend Development',
            difficulty: 'Intermediate',
            learners: 15420,
            courses: 45,
            avgTime: '8 weeks',
            description: 'Modern JavaScript library for building user interfaces',
            relatedSkills: ['JavaScript', 'HTML', 'CSS']
        },
        {
            id: 2,
            name: 'DSA',
            category: 'Computer Science',
            difficulty: 'Advanced',
            learners: 28900,
            courses: 62,
            avgTime: '12 weeks',
            description: 'Data Structures and Algorithms - fundamental CS concepts',
            relatedSkills: ['Python', 'Java', 'C++']
        },
        {
            id: 3,
            name: 'Python',
            category: 'Programming',
            difficulty: 'Beginner',
            learners: 42300,
            courses: 89,
            avgTime: '6 weeks',
            description: 'Versatile programming language for web, data science, and automation',
            relatedSkills: ['Django', 'Flask', 'Pandas']
        },
        {
            id: 4,
            name: 'UI/UX',
            category: 'Design',
            difficulty: 'Intermediate',
            learners: 19800,
            courses: 38,
            avgTime: '10 weeks',
            description: 'User Interface and User Experience design principles',
            relatedSkills: ['Figma', 'Adobe XD', 'Sketch']
        },
        {
            id: 5,
            name: 'Machine Learning',
            category: 'AI/ML',
            difficulty: 'Advanced',
            learners: 24600,
            courses: 53,
            avgTime: '16 weeks',
            description: 'Build intelligent systems that learn from data',
            relatedSkills: ['Python', 'TensorFlow', 'Statistics']
        },
        {
            id: 6,
            name: 'Cloud Computing',
            category: 'Infrastructure',
            difficulty: 'Intermediate',
            learners: 18700,
            courses: 47,
            avgTime: '10 weeks',
            description: 'AWS, Azure, and GCP cloud platforms and services',
            relatedSkills: ['Docker', 'Kubernetes', 'DevOps']
        }
    ],
    users: [
        {
            id: 1,
            name: 'John Doe',
            email: 'john@example.com',
            skills: ['React', 'Python'],
            appliedOpportunities: [1, 3],
            registeredEvents: [1, 2]
        }
    ],
    community: {
        posts: [
            {
                id: 1,
                author: 'Sarah Chen',
                title: 'How I landed my dream internship at Google',
                content: 'Sharing my journey and tips...',
                likes: 342,
                comments: 28,
                date: '2026-01-25'
            },
            {
                id: 2,
                author: 'Mike Johnson',
                title: 'Best resources for learning React in 2026',
                content: 'Here are my favorite courses and tutorials...',
                likes: 256,
                comments: 19,
                date: '2026-01-26'
            }
        ],
        studyGroups: [
            {
                id: 1,
                name: 'DSA Interview Prep',
                members: 45,
                nextMeeting: 'Jan 30, 2026 - 6:00 PM'
            },
            {
                id: 2,
                name: 'React Developers Circle',
                members: 78,
                nextMeeting: 'Jan 31, 2026 - 7:00 PM'
            }
        ]
    }
};

// API Routes

// Helper: parse ISO-like date strings safely
function parseDate(dateString) {
    const d = new Date(dateString);
    return isNaN(d.getTime()) ? null : d;
}

// GET all events with comprehensive filtering
app.get('/api/events', (req, res) => {
    const { tab, category, mode, domain, level, deadline, search, limit } = req.query;
    let events = [...database.events];

    // Apply tab-based filtering (All, Workshops, Internships, Skills)
    // Note: "My Events" is handled by separate /api/events/my endpoint with authentication
    if (tab && tab !== 'All' && tab !== 'My Events') {
        if (tab === 'Workshops') {
            events = events.filter(e => e.category === 'workshops');
        } else if (tab === 'Internships') {
            events = events.filter(e => e.category === 'internships');
        } else if (tab === 'Skills') {
            // Skills-related events (domain-based)
            events = events.filter(e => ['ai-ml', 'web-dev', 'data-science', 'ui-ux', 'cybersecurity'].includes(e.domain));
        }
    }
    // If tab === 'All' or tab is undefined, return all events (no tab-based filtering)

    // Apply category filter (if not already applied by tab)
    if (category && category !== '' && category !== 'all') {
        events = events.filter(e => e.category === category);
    }

    // Apply mode filter (online | offline | hybrid)
    if (mode && mode !== '' && mode !== 'all') {
        events = events.filter(e => e.mode === mode);
    }

    // Apply domain filter (ai-ml | web-dev | cybersecurity | data-science | ui-ux | business)
    if (domain && domain !== '' && domain !== 'all') {
        events = events.filter(e => e.domain === domain);
    }

    // Apply level/difficulty filter (beginner | intermediate | advanced)
    if (level && level !== '' && level !== 'all') {
        events = events.filter(e => e.difficulty === level);
    }

    // Apply deadline filter (this_week | this_month | upcoming)
    if (deadline && deadline !== '') {
        const now = new Date();
        const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        const oneMonthFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

        events = events.filter(e => {
            const regDeadline = parseDate(e.registrationDeadline);
            if (!regDeadline) return false;

            if (deadline === 'this_week') {
                return regDeadline >= now && regDeadline <= oneWeekFromNow;
            }
            if (deadline === 'this_month') {
                return regDeadline >= now && regDeadline <= oneMonthFromNow;
            }
            if (deadline === 'upcoming') {
                return regDeadline >= now;
            }
            return true;
        });
    }

    // Apply search filter (title or organizer)
    if (search && search.trim() !== '') {
        const query = search.toLowerCase().trim();
        events = events.filter(e =>
            e.title.toLowerCase().includes(query) ||
            (e.organizer && e.organizer.toLowerCase().includes(query))
        );
    }

    // Limit results if specified
    if (limit) {
        events = events.slice(0, parseInt(limit));
    }

    res.json(events);
});

// ALIAS: GET /events (without /api prefix for events.html)
app.get('/events', (req, res) => {
    const { tab, category, mode, domain, level, deadline, search, limit } = req.query;
    let events = [...database.events];

    // Apply category filter
    if (category && category !== '' && category !== 'all') {
        events = events.filter(e => e.category === category);
    }

    // Apply mode filter
    if (mode && mode !== '' && mode !== 'all') {
        events = events.filter(e => e.mode === mode);
    }

    // Apply domain filter
    if (domain && domain !== '' && domain !== 'all') {
        events = events.filter(e => e.domain === domain);
    }

    // Apply level/difficulty filter
    if (level && level !== '' && level !== 'all') {
        events = events.filter(e => e.difficulty === level);
    }

    // Apply search filter (title or organizer)
    if (search && search.trim() !== '') {
        const query = search.toLowerCase().trim();
        events = events.filter(e =>
            e.title.toLowerCase().includes(query) ||
            (e.organizer && e.organizer.toLowerCase().includes(query))
        );
    }

    res.json(events);
});

// GET single event (full detail)
app.get('/api/events/:id', (req, res) => {
    const event = database.events.find(e => e.id === parseInt(req.params.id));
    if (event) {
        res.json(event);
    } else {
        res.status(404).json({ error: 'Event not found' });
    }
});

// ALIAS: GET /events/:id (without /api prefix)
app.get('/events/:id', (req, res) => {
    const event = database.events.find(e => e.id === parseInt(req.params.id));
    if (event) {
        res.json(event);
    } else {
        res.status(404).json({ error: 'Event not found' });
    }
});

// NEW: GET events registered by current user
app.get('/api/events/my', verifyFirebaseToken, (req, res) => {
    // Find or create user based on Firebase token
    let currentUser = database.users.find(u => u.email === req.user.email);
    
    if (!currentUser) {
        return res.json([]); // No events if user not found
    }

    const { category, mode, domain, level, deadline, search } = req.query;
    const registeredIds = new Set(currentUser.registeredEvents || []);

    let events = database.events.filter(e => registeredIds.has(e.id));

    // Apply category filter
    if (category && category !== '' && category !== 'all') {
        events = events.filter(e => e.category === category);
    }

    // Apply mode filter
    if (mode && mode !== '' && mode !== 'all') {
        events = events.filter(e => e.mode === mode);
    }

    // Apply domain filter
    if (domain && domain !== '' && domain !== 'all') {
        events = events.filter(e => e.domain === domain);
    }

    // Apply level/difficulty filter
    if (level && level !== '' && level !== 'all') {
        events = events.filter(e => e.difficulty === level);
    }

    // Apply deadline filter
    if (deadline && deadline !== '') {
        const now = new Date();
        const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        const oneMonthFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

        events = events.filter(e => {
            const regDeadline = parseDate(e.registrationDeadline);
            if (!regDeadline) return false;

            if (deadline === 'this_week') {
                return regDeadline >= now && regDeadline <= oneWeekFromNow;
            }
            if (deadline === 'this_month') {
                return regDeadline >= now && regDeadline <= oneMonthFromNow;
            }
            if (deadline === 'upcoming') {
                return regDeadline >= now;
            }
            return true;
        });
    }

    // Apply search filter
    if (search && search.trim() !== '') {
        const query = search.toLowerCase().trim();
        events = events.filter(e =>
            e.title.toLowerCase().includes(query) ||
            (e.organizer && e.organizer.toLowerCase().includes(query))
        );
    }

    res.json(events);
});

// NEW: GET event-user compatibility matches
app.get('/api/events/:id/match', (req, res) => {
    const eventId = parseInt(req.params.id);
    const event = database.events.find(e => e.id === eventId);

    if (!event) {
        return res.status(404).json({ error: 'Event not found' });
    }

    const requiredSkills = Array.isArray(event.requiredSkills) ? event.requiredSkills : [];
    const totalRequired = requiredSkills.length || 1; // avoid division by zero

    const matches = database.users.map(user => {
        const userSkills = Array.isArray(user.skills) ? user.skills : [];
        const matchingSkills = requiredSkills.filter(skill =>
            userSkills.map(s => s.toLowerCase()).includes(skill.toLowerCase())
        );

        const compatibility = Math.round((matchingSkills.length / totalRequired) * 100);

        return {
            userId: user.id,
            name: user.name,
            email: user.email,
            skills: user.skills,
            matchingSkills,
            compatibility,
            // mock rating if not present
            rating: user.rating || 4.5
        };
    })
    .filter(match => match.compatibility > 0)
    .sort((a, b) => b.compatibility - a.compatibility)
    .slice(0, 5);

    res.json({
        eventId,
        requiredSkills,
        matches
    });
});

// POST register for event (duplicate-safe, capacity-aware)
app.post('/api/events/:id/register', verifyFirebaseToken, (req, res) => {
    
    // 🔥 AUTO CREATE USER IF NOT EXISTS
let existingUser = database.users.find(
  user => user.email === req.user.email
);

if (!existingUser) {
  const newUser = {
    id: Date.now(),
    name: req.user.name || "User",
    email: req.user.email,
    role: "user",
    registeredEvents: []
  };

  database.users.push(newUser);
  existingUser = newUser;
}


    const eventId = parseInt(req.params.id);
    const event = database.events.find(e => e.id === eventId);

    if (!event) {
        return res.status(404).json({ error: 'Event not found' });
    }

    

    // Prevent duplicate registration
    if (existingUser.registeredEvents.includes(eventId)) {

        return res.status(400).json({ error: 'Already registered for this event' });
    }

    // Capacity check
    if (event.registrations >= event.maxParticipants) {
        return res.status(400).json({ error: 'Event is full' });
    }

    event.registrations++;
    existingUser.registeredEvents.push(eventId);


    res.json({ success: true, message: 'Successfully registered!', event });
});

// GET all opportunities
app.get('/api/opportunities', (req, res) => {
    const { category, search, limit, company } = req.query;
    let opportunities = [...database.opportunities];
    
    // Filter by category
    if (category && category !== 'all') {
        opportunities = opportunities.filter(o => o.category === category);
    }
    
    // Filter by company
    if (company) {
        opportunities = opportunities.filter(o => 
            o.company.toLowerCase().includes(company.toLowerCase())
        );
    }
    
    // Search
    if (search) {
        const query = search.toLowerCase();
        opportunities = opportunities.filter(o => 
            o.title.toLowerCase().includes(query) ||
            o.company.toLowerCase().includes(query) ||
            o.skills.some(s => s.toLowerCase().includes(query))
        );
    }
    
    // Limit results
    if (limit) {
        opportunities = opportunities.slice(0, parseInt(limit));
    }
    
    res.json(opportunities);
});

// GET single opportunity
app.get('/api/opportunities/:id', (req, res) => {
    const opportunity = database.opportunities.find(o => o.id === parseInt(req.params.id));
    if (opportunity) {
        res.json(opportunity);
    } else {
        res.status(404).json({ error: 'Opportunity not found' });
    }
});

// POST apply to opportunity
app.post('/api/opportunities/:id/apply', (req, res) => {
    const opportunity = database.opportunities.find(o => o.id === parseInt(req.params.id));
    if (opportunity) {
        opportunity.applicants++;
        res.json({ success: true, message: 'Application submitted!', opportunity });
    } else {
        res.status(404).json({ error: 'Opportunity not found' });
    }
});

// GET all skills
app.get('/api/skills', (req, res) => {
    const { category, search, limit } = req.query;
    let skills = [...database.skills];
    
    // Filter by category
    if (category) {
        skills = skills.filter(s => s.category === category);
    }
    
    // Search
    if (search) {
        const query = search.toLowerCase();
        skills = skills.filter(s => 
            s.name.toLowerCase().includes(query) ||
            s.description.toLowerCase().includes(query)
        );
    }
    
    // Limit results
    if (limit) {
        skills = skills.slice(0, parseInt(limit));
    }
    
    res.json(skills);
});

// GET single skill
app.get('/api/skills/:id', (req, res) => {
    const skill = database.skills.find(s => s.id === parseInt(req.params.id));
    if (skill) {
        res.json(skill);
    } else {
        res.status(404).json({ error: 'Skill not found' });
    }
});

// GET community data
app.get('/api/community', (req, res) => {
    res.json(database.community);
});

// GET community posts
app.get('/api/community/posts', (req, res) => {
    res.json(database.community.posts);
});

// GET study groups
app.get('/api/community/study-groups', (req, res) => {
    res.json(database.community.studyGroups);
});

// POST new community post
app.post('/api/community/posts', (req, res) => {
    const { author, title, content } = req.body;
    const newPost = {
        id: database.community.posts.length + 1,
        author,
        title,
        content,
        likes: 0,
        comments: 0,
        date: new Date().toISOString().split('T')[0]
    };
    database.community.posts.push(newPost);
    res.json({ success: true, post: newPost });
});

// Search across all content
app.get('/api/search', (req, res) => {
    const { query } = req.query;
    if (!query) {
        return res.json({ events: [], opportunities: [], skills: [] });
    }
    
    const searchQuery = query.toLowerCase();
    
    const events = database.events.filter(e => 
        e.title.toLowerCase().includes(searchQuery) ||
        (e.organizer && e.organizer.toLowerCase().includes(searchQuery)) ||
        e.description.toLowerCase().includes(searchQuery)
    );
    
    const opportunities = database.opportunities.filter(o => 
        o.title.toLowerCase().includes(searchQuery) ||
        o.company.toLowerCase().includes(searchQuery) ||
        o.skills.some(s => s.toLowerCase().includes(searchQuery))
    );
    
    const skills = database.skills.filter(s => 
        s.name.toLowerCase().includes(searchQuery) ||
        s.description.toLowerCase().includes(searchQuery)
    );
    
    res.json({ events, opportunities, skills });
});

// Statistics endpoint
app.get('/api/stats', (req, res) => {
    res.json({
        totalEvents: database.events.length,
        totalOpportunities: database.opportunities.length,
        totalSkills: database.skills.length,
        totalUsers: database.users.length,
        totalCommunityPosts: database.community.posts.length,
        totalStudyGroups: database.community.studyGroups.length
    });
});

// ===== IMPORTANT: Register static middleware LAST =====
// This ensures all API routes are checked first
app.use(express.static(__dirname));

// Fallback for root path
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('\nAvailable API endpoints:');
    console.log('GET  /events');
    console.log('GET  /events/:id');
    console.log('GET  /api/events');
    console.log('GET  /api/events/:id');
    console.log('POST /api/events/:id/register');
    console.log('GET  /api/opportunities');
    console.log('GET  /api/opportunities/:id');
    console.log('POST /api/opportunities/:id/apply');
    console.log('GET  /api/skills');
    console.log('GET  /api/skills/:id');
    console.log('GET  /api/community');
    console.log('GET  /api/community/posts');
    console.log('GET  /api/community/study-groups');
    console.log('POST /api/community/posts');
    console.log('GET  /api/search?query=<term>');
    console.log('GET  /api/stats');
});

module.exports = app;
