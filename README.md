# Cursor 2D - AI-Powered 2D Animation Generator

Generate high-quality 2D animations using AI. This application allows users to create animations by describing them in natural language, which are then generated using Manim and AI.

## Features

- 🤖 AI-powered animation generation using OpenAI
- 🎬 Manim-based 2D animation rendering
- �� Google OAuth authentication
- 💾 PostgreSQL database with Prisma ORM
- 🚀 Redis-based job queue for background processing
- 📦 MinIO/S3 storage for video assets
- 🐳 Docker-based development environment

## Tech Stack

- **Frontend**: Next.js 15, Tailwind, TypeScript
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with Google OAuth
- **Job Queue**: Redis with BullMQ
- **Storage**: MinIO (local) / AWS S3 (production)
- **Animation**: Manim (Python)

## Quick Start (Docker)

### Prerequisites
- Docker and Docker Compose installed
- Google OAuth credentials (you'll need to get your own credentials)

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cursor-for-2d-animations-video
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your actual values
   ```

3. **Start the development environment**
   ```bash
   docker-compose -f docker-compose.dev.yml up --build -d
   ```

4. **Initialize the database**
   ```bash
   docker-compose -f docker-compose.dev.yml exec web npx prisma db push
   ```

5. **Access the application**
   - Web App: http://localhost:3000
   - MinIO Console: http://localhost:9001 (admin/minioadmin123)
   - Express API: http://localhost:8080

6. **Create bucket inside minio**
    - Go to localhost:9001
    - Use user/passowrd(admin/minioadmin123)
    - Create a bucket name video-assets
### Required Environment Variables

See `.env.example` for all required variables. Key ones include:
- `AUTH_GOOGLE_ID` & `AUTH_GOOGLE_SECRET` - Google OAuth credentials
- `OPENAI_API_KEY` - OpenAI API key for AI generation
- `AUTH_SECRET` - NextAuth secret (generate with `openssl rand -base64 32`)

## Development

### Services
- **Web** (Next.js): Port 3000
- **HTTP** (Express): Port 8080  
- **Worker** (Manim): Background processing
- **PostgreSQL**: Port 5432
- **Redis**: Port 6379
- **MinIO**: Port 9000 (API), 9001 (Console)

### Development Workflow

**Note**: Currently, when you make changes to the code, you need to rebuild the containers to see the changes:

```bash
# After making code changes
docker-compose -f docker-compose.dev.yml up --build -d
```

### Useful Commands
```bash
# View logs
docker-compose -f docker-compose.dev.yml logs -f web

# Restart a service
docker-compose -f docker-compose.dev.yml restart web

# Stop all services
docker-compose -f docker-compose.dev.yml down

# Rebuild and restart
docker-compose -f docker-compose.dev.yml up --build -d
```

## Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Check what's using the port
   lsof -i :3000
   # Kill the process or change the port in docker-compose.dev.yml
   ```

2. **Database connection issues**
   ```bash
   # Check if postgres is running
   docker-compose -f docker-compose.dev.yml ps postgres
   # View postgres logs
   docker-compose -f docker-compose.dev.yml logs postgres
   ```

3. **MinIO not accessible**
   - Check if MinIO is running: `docker-compose -f docker-compose.dev.yml ps minio`
   - Access console at http://localhost:9001
   - Default credentials: admin/minioadmin123

4. **Worker not processing jobs**
   ```bash
   # Check worker logs
   docker-compose -f docker-compose.dev.yml logs worker
   # Check Redis connection
   docker-compose -f docker-compose.dev.yml exec redis redis-cli ping
   ```

5. **Authentication issues**
   - Ensure Google OAuth credentials are correctly set in `.env`
   - Check `NEXTAUTH_URL` matches your local setup
   - Verify `AUTH_SECRET` is properly set

### Reset Everything
```bash
# Stop and remove all containers, volumes, and images
docker-compose -f docker-compose.dev.yml down -v --rmi all
# Start fresh
docker-compose -f docker-compose.dev.yml up --build -d
```

## Architecture

The application consists of:
1. **Next.js Frontend**: User interface and authentication
2. **Express Backend**: API endpoints and job creation
3. **Worker Service**: Background animation generation using Manim
4. **PostgreSQL**: User data, conversations, and job tracking
5. **Redis**: Job queue management
6. **MinIO/S3**: Video file storage

## Contributing

1. Clone the repository
2. Create a feature branch
3. Make your changes
4. Test with the Docker development environment
5. Submit a pull request

