# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**AutoDrafter** is an AI-powered legal matter management and document drafting platform for litigation attorneys. It combines matter management, document processing with semantic search, persistent AI memory per matter, knowledge base management, and AI-assisted document drafting using Claude.

**Tech Stack:**
- Backend: Node.js/Express
- Database: PostgreSQL with pgvector + pg_trgm extensions (AWS RDS)
- Storage: AWS S3
- AI: Anthropic Claude (Sonnet 4.5 / Opus 4.5) for drafting, OpenAI ada-002 for embeddings, AWS Comprehend Medical for medical entity extraction
- Frontend: Vanilla HTML/CSS/JavaScript (no framework)

**Recent Feature Additions (January 2026):**
- Legal metadata extraction (citations, statutes, deposition page:line)
- Hybrid search (70% vector + 30% text matching via pg_trgm)
- Medical document processing with AWS Comprehend Medical
- 30+ subject matter categories with enhanced classification
- Dual-path processing (legal vs. medical with recommendation engine)

## 🤖 ACTIVE AGENTS (Always Running in Background)

**SEVEN agents are ALWAYS ACTIVE and working automatically. See [AGENTS.md](./AGENTS.md) for full definitions.**

### Agent 1: Library Research Agent (AUTOMATIC)
**You MUST AUTOMATICALLY:**
- Check [APPROVED_GITHUB_LIBRARIES.md](./APPROVED_GITHUB_LIBRARIES.md) BEFORE any code implementation
- Search GitHub (500+ stars) for existing solutions
- Evaluate 2-3 candidates with comparison
- Recommend libraries over custom code
- NEVER create new functions without this search process

### Agent 2: Learning & Onboarding Agent (AUTOMATIC)
**You MUST AUTOMATICALLY:**
- Explain concepts in beginner-friendly terms
- Provide code examples from codebase
- Link to learning resources
- Break down complex topics
- Suggest practical next steps

### Agent 3: Code Quality & Review Agent (AUTOMATIC)
**You MUST AUTOMATICALLY on EVERY code interaction:**
- Review for security vulnerabilities (SQL injection, secrets, auth)
- Check error handling and input validation
- Suggest performance improvements
- Enforce best practices
- Verify follows project patterns
- Check documentation

### Agent 4: API Endpoint Monitor Agent (AUTOMATIC)
**You MUST AUTOMATICALLY on EVERY API/endpoint interaction:**
- Scan and monitor all API endpoints
- Check endpoint health and validate responses
- Detect errors and missing error handling
- Validate status codes and response formats
- Check for security issues (auth, validation, SQL injection)
- Suggest fixes for endpoint issues
- Verify endpoints have tests

### Agent 5: Debugging Agent (AUTOMATIC)
**You MUST AUTOMATICALLY on EVERY error or debugging request:**
- Analyze error messages and stack traces
- Trace problems through codebase systematically
- Identify root causes (not just symptoms)
- Suggest systematic fixes with code examples
- Check for common Node.js/PostgreSQL/Express issues
- Provide debugging strategies
- Verify async/await usage and error handling

### Agent 6: Code Validation Agent (AUTOMATIC)
**You MUST AUTOMATICALLY on EVERY code change:**
- Validate code changes work as expected
- Run relevant tests for changed files (Jest)
- Check if changes break existing functionality
- Verify code compiles/runs without errors
- Report ALL errors found with DETAILED fix instructions
- Provide code examples (BEFORE/AFTER) for each error
- Prioritize errors by severity (Critical, High, Medium, Low)
- Explain WHY each error is a problem
- List ALL errors (don't stop at the first one)
- Recommend Husky (30k+ stars) + lint-staged (15k+ stars) for automation
- Suggest test coverage for new code
- Run tests before confirming code is ready

### Agent 7: Auto-Debugging Escalation Agent (AUTOMATIC)
**You MUST AUTOMATICALLY on EVERY debugging/fix attempt:**
- Track fix attempts (count failures)
- After 2 unsuccessful fix attempts: AUTOMATICALLY search web and GitHub for top 2 solutions, test both
- If top 2 solutions fail: AUTOMATICALLY search for 4 more solutions from web/GitHub/forums/chatboards, implement and test all 4 one by one
- If all 6 solutions fail: AUTOMATICALLY propose creative new solutions that haven't been tried
- Test each solution before moving to next
- Document all attempts and sources with URLs
- Stop as soon as problem is fixed
- NEVER give up - escalate through all phases systematically

---

## Development Rules (MANDATORY)

**⚠️ CRITICAL:** Before creating any new function, module, or feature, you MUST follow the GitHub-first development process:

1. **AUTOMATICALLY check [APPROVED_GITHUB_LIBRARIES.md](./APPROVED_GITHUB_LIBRARIES.md)** - Search for existing solutions FIRST
2. **AUTOMATICALLY search GitHub** - Find highly-rated repos (>500 stars minimum)
3. **AUTOMATICALLY evaluate alternatives** - Compare 2-3 options before custom implementation
4. **AUTOMATICALLY recommend libraries** - Prefer existing solutions over custom code
5. **Only create custom code** - If no suitable libraries exist after thorough search

**Key Rule:** Never create new functions from scratch without first searching GitHub for existing solutions.

---

## PostgreSQL Best Practices Reference

**IMPORTANT:** When writing or modifying PostgreSQL schemas, always consult the pg-aiguide repository for best practices:
- GitHub: https://github.com/timescale/pg-aiguide
- Clone locally: `/tmp/pg-aiguide-review` (clone if not present)

**Key Best Practices Applied (from pg-aiguide):**
1. **Use `BIGINT GENERATED ALWAYS AS IDENTITY`** instead of `SERIAL` for primary keys
2. **Use `TIMESTAMPTZ`** instead of `TIMESTAMP` (handles timezones correctly)
3. **Use `TEXT`** instead of `VARCHAR(n)` (PostgreSQL handles TEXT efficiently)
4. **Use `NUMERIC`** instead of `DECIMAL` for money/precision values
5. **Add `NOT NULL`** constraints where semantically required
6. **Use `CHECK` constraints** for enum-like values (TEXT + CHECK, not custom ENUM)
7. **Use HNSW indexes** for vector search (better recall than IVFFlat)
8. **Add GIN indexes** for JSONB columns (enables @>, ?, containment queries)
9. **Create partial indexes** for frequently filtered subsets
10. **Add expression indexes** for case-insensitive lookups: `CREATE INDEX ON users (LOWER(email))`

**Before creating new tables or modifying schemas:**
```bash
# Clone pg-aiguide if not present
cd /tmp && git clone --depth 1 https://github.com/timescale/pg-aiguide pg-aiguide-review

# Read the design skill for comprehensive guidance
cat /tmp/pg-aiguide-review/skills/design-postgres-tables/SKILL.md
```

## Git Workflow (IMPORTANT)

**Claude Code must automatically manage git commits and pushes. Do not ask the user for permission.**

### Automatic Commit Rules:
1. **Commit after completing features** - After implementing any new feature or fix, commit immediately
2. **Push to GitHub automatically** - Always push commits to origin/main after committing
3. **Never commit sensitive data** - Check .gitignore before committing; never commit:
   - `.env` files (contain API keys, passwords)
   - `.env.tunnel` (contains database credentials)
   - AWS credentials
   - Any file with passwords or secrets
4. **Keep .gitignore updated** - Add new sensitive file patterns as needed
5. **Do this silently** - Don't ask user permission or announce commits; handle in background

### Commit Message Format:
```
<type>: <short description>

<optional longer description>

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: <model name> <noreply@anthropic.com>
```

Types: feat, fix, docs, refactor, test, chore

### Files to Never Commit:
- `.env`, `.env.local`, `.env.tunnel` (credentials)
- `upload files/` (source files before processing)
- `.claude/settings.local.json` (local IDE settings)
- Any `*.log` files
- `node_modules/`

## Development Agents

**Three specialized agents are available to assist with development:**

**Quick Start:** See [AGENTS-QUICK-START.md](./AGENTS-QUICK-START.md)  
**Full Documentation:** See [AGENTS.md](./AGENTS.md)

1. **Library Research Agent** - Finds and evaluates GitHub repositories before coding (enforces GitHub-first rule)
2. **Learning & Onboarding Agent** - Helps new developers understand the codebase and learn patterns  
3. **Code Quality & Review Agent** - Reviews code for quality, security, and best practices

**Usage:** Copy agent prompts from AGENTS.md and use with AI assistants (Claude, ChatGPT, etc.)

---

## Browser Testing with Playwright MCP

**Claude Code can control a browser to test the frontend.** The Playwright MCP server is installed and configured.

### Usage:
- Say "Use playwright to navigate to http://localhost:3000" to open a browser
- Claude can take screenshots, click elements, fill forms, and observe behavior
- The browser window will be visible so you can also see what's happening

### Common Commands:
- Navigate to URL
- Take screenshot
- Click on element
- Fill input field
- Check page content

**Note:** Server must be running (`node server.js`) before testing frontend.

## Development Commands

### Running the Application
```bash
# Start server (port 3000 by default)
node server.js

# Start with specific port
PORT=3000 node server.js

# Access the application
# http://localhost:3000
```

### Testing
```bash
# Run comprehensive API tests
node comprehensive-test.js

# Test document vectorization
node test-vectorization.js

# Test new features
node test-new-features.js

# Test database connection
node test-connection.js
```

### Database Access & SSM Tunnel

**CRITICAL: Automatic Tunnel Management for Claude Code**

The RDS database is security-locked to specific IP addresses. When working away from the home IP, all database access MUST go through the SSM tunnel. Claude Code should handle this automatically.

**Home IP Address:** `69.111.182.221`

**Automatic Tunnel Protocol:**
1. **Always check current IP first** before any database operation
2. **If current IP ≠ home IP:** Automatically start tunnel in background, use localhost connection
3. **If current IP = home IP:** Use direct RDS connection
4. **Never ask the user** - handle this transparently in the background

**Check Current IP:**
```bash
curl -s ifconfig.me
```

**Start Tunnel in Background (when away from home):**
```bash
# Start tunnel as background process
./connect-db-tunnel.sh > /tmp/tunnel.log 2>&1 &

# Wait 5 seconds for tunnel to establish
sleep 5

# Verify tunnel is listening
lsof -i :5432

# Use .env.tunnel for all operations (DB_HOST=localhost)
```

**Stop Tunnel (when done):**
```bash
# Find and kill tunnel process
lsof -ti :5432 | grep -v postgres | xargs kill -9
```

**Database Connection Settings:**

When using tunnel (away from home):
- DB_HOST=localhost
- DB_PORT=5432
- Use `.env.tunnel` configuration

When direct (at home IP):
- DB_HOST=autodrafter-db-prototype.cub6ooe2g1kc.us-east-1.rds.amazonaws.com
- DB_PORT=5432
- Use standard `.env` configuration

### Database Operations

**IMPORTANT:** Claude Code should automatically determine if tunnel is needed before running these commands.

```bash
# Connect to database directly (tunnel or direct, based on IP)
psql -h $DB_HOST -U $DB_USER -d $DB_NAME

# Run schema migrations (if tables are missing)
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f setup-pgvector.sql
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f setup-knowledge.sql
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f setup-drafting-sessions.sql
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f setup-document-styles.sql
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f setup-legal-metadata.sql
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f setup-medical-metadata.sql

# Run schema updates
node run-schema-updates.js

# Reprocess knowledge items (for new metadata extraction)
node reprocess-knowledge.js --all           # All items
node reprocess-knowledge.js --guardianship  # Guardianship items only
node reprocess-knowledge.js --failed        # Failed items only
node reprocess-knowledge.js --id=123        # Specific item by ID
```

**For Direct Database Access (via psql, DBeaver, pgAdmin, etc.):**

If tunnel is active, connect to:
```bash
Host: localhost
Port: 5432
Database: autodrafter
User: postgres
Password: m?hQgh2~R>QOup3nB~14RFL0HX#G
```

### AWS CLI Commands
```bash
# List S3 files
npm run aws:s3

# Check RDS status
npm run aws:rds

# Check security configuration
npm run aws:security

# View cost estimates
npm run aws:cost
```

## High-Level Architecture

### Five Application Modes
AutoDrafter is organized into five distinct modes accessible from the navigation bar:

1. **Administrator** (`/admin`) - User management, firm settings, analytics
2. **User** (`/user`) - Personal settings, matter access, personal knowledge
3. **Matters** (`/matters`) - Matter management, documents, memory, search
4. **Knowledge** (`/knowledge`) - Templates, examples, treatises, reference materials
5. **Drafter** (`/drafter`) - AI-assisted document drafting

### Core Architecture Principles

#### Matter-Centric Organization
Everything revolves around "matters" (legal cases). Each matter has:
- Documents (uploaded to S3, vectorized for search)
- Persistent memory (editable facts/context about the case)
- Drafting sessions (AI drafting history)
- Associated knowledge (templates, examples specific to the matter)

#### Persistent Memory Architecture
**Key Innovation:** Solves AI chat degradation problem
- Each matter has editable persistent memory stored in `matter_memory` table
- Memory is vectorized for semantic understanding
- Automatically injected into every drafting session
- One document per session (prevents context window degradation)
- User has full control: can add/edit/remove facts as case evolves

#### Knowledge Management System
**Key Innovation:** Forced knowledge injection controls what AI uses
- Upload any content: treatises, cases, websites, templates, examples
- Auto-categorization by subject matter and document type (using Claude)
- Six access levels: system, firm, team, matter, personal, shared
- All knowledge vectorized and semantically searchable
- Selected knowledge explicitly injected into AI prompts

#### Document Processing Pipeline
```
Upload → S3 Storage → Text Extraction → Chunking → Embedding → pgvector Storage → Semantic Search
```

**Document Flow:**
1. File uploaded via multer (memory storage)
2. Stored in AWS S3 with metadata in `documents` table
3. Text extracted (PDF via pdf-parse, DOCX via mammoth, images via tesseract.js)
4. Text chunked into 500-char segments with 50-char overlap
5. Chunks vectorized using OpenAI ada-002 (1536 dimensions)
6. Stored in `document_chunks` table with pgvector embeddings
7. Searchable via cosine similarity search

**Special handling:** Depositions and transcripts preserve page/line numbers

#### Multi-Phase Drafting Workflow
Sessions follow a structured workflow in `drafter-session-api.js`:

1. **Planning Phase** - AI analyzes request, searches knowledge/documents, creates drafting plan
2. **Confirmation Phase** - User reviews plan, makes adjustments
3. **Drafting Phase** - AI generates document based on confirmed plan
4. **Refinement Phase** - User iterates with AI to refine document

Each phase maintains context, with matter memory and selected knowledge/documents injected into prompts.

#### Document Formatting System
**Key Innovation:** Court-ready formatted output (no other AI legal platform has this)

- 50+ formatting parameters per style (fonts, spacing, alignment, margins, etc.)
- Legal-specific features: case captions, certificates of service
- 42 document types (pleadings, discovery, contracts, estate planning, etc.)
- Style templates: system, firm-wide, matter-specific
- Direct DOCX and PDF generation (not converted)

**Backend Complete, UI Incomplete:** All formatting APIs in `document-formatter.js`, `caption-api.js`, `certificate-api.js` are functional and tested, but frontend UI not yet built.

### Database Schema Architecture

**Core Tables:**
- `users` - User accounts with roles (superadmin, admin, full, regular, drafter)
- `matters` - Legal matters/cases
- `matter_memory` - Persistent editable memory per matter
- `documents` - Document metadata (files stored in S3)
- `document_chunks` - Text chunks with embeddings (pgvector)

**Knowledge Tables:**
- `knowledge_items` - Knowledge base entries (with medical processing columns)
- `knowledge_chunks` - Chunked knowledge with embeddings + legal metadata
- `knowledge_subject_options` - 30+ subject matter categories
- `knowledge_doctype_options` - Document type taxonomy
- `knowledge_type_options` - Knowledge type taxonomy

**New Schema Columns (Legal Metadata - knowledge_chunks):**
- page_number, line_number, legal_citation, statute_number, statute_title
- case_name, case_citation, case_page, deposition_page_line
- is_legal_citation, citation_type

**New Schema Columns (Medical Processing - knowledge_items):**
- is_medical, medical_confidence, medical_doc_type
- medical_summary (JSONB), medical_entities (JSONB)
- icd10_codes (JSONB), medications (JSONB)
- phi_detected, processing_recommendation

**Drafting Tables:**
- `drafting_sessions` - Drafting session metadata
- `drafting_messages` - Chat messages in sessions
- `document_exports` - Export records

**Formatting Tables:**
- `document_styles` - 50+ formatting parameters
- `matter_captions` - Case caption data
- `certificates_of_service` - Certificate templates
- `document_type_options` - 42 document types

**Admin Tables:**
- `user_sessions` - Session tracking
- `user_activity` - Activity logging
- `api_usage_daily` - Usage analytics
- `matter_access` - Access control

### Key Module Structure

**Authentication (`auth-middleware.js`):**
- Database-backed authentication with bcrypt password hashing
- Three users configured: superadmin (admin/admin123), admin (demo/demo123), regular (dumpsticks324$/autodrafter2024)
- Session-based auth using express-session
- Features: account locking, failed login tracking, user roles
- Middleware: `requireAuth`, `requireGuest`

**Document Processing:**
- `document-processor.js` - Main orchestrator, text extraction
- `document-chunker.js` - Intelligent text chunking (500 chars, 50 overlap)
- `document-vectorizer.js` - Coordinates vectorization process
- `embedding-generator.js` - OpenAI API calls for embeddings
- `legal-metadata-extractor.js` - Legal citation and metadata extraction (NEW)
- `medical-content-processor.js` - AWS Comprehend Medical integration (NEW)

**Search:**
- `vector-search.js` - Semantic search for matter documents
- `knowledge-search.js` - Semantic search for knowledge base
- Both support **hybrid search** (70% vector + 30% text via pg_trgm)
- PostgreSQL functions: `hybrid_search_knowledge()`, `hybrid_search_documents()`

**Drafting:**
- `drafter-api.js` - Simple single-phase drafter (legacy)
- `drafter-session-api.js` - Advanced multi-phase workflow (current)
- Model selection: Sonnet 4.5 (fast/cheap) or Opus 4.5 (powerful)

**Knowledge Processing:**
- `knowledge-processor.js` - Upload, auto-classify, auto-summarize, vectorize
- Uses Claude for classification and summarization
- **Dual-path processing:** Detects medical content and processes with AWS Comprehend Medical
- `reprocess-knowledge.js` - Batch reprocessing script for existing items (NEW)
- 30+ subject matter categories with enhanced classification

**Formatting:**
- `document-formatter.js` - DOCX/PDF generation with styles
- `caption-api.js` - Case caption management and AI extraction
- `certificate-api.js` - Certificate of service rendering
- `document-style-api.js` - Style CRUD operations

**Main Server (`server.js`):**
- Single monolithic Express server with all routes
- ~1600 lines, handles all API endpoints
- Uses multer for file uploads (memory storage)
- Session management with express-session
- Serves static frontend files from `public/`

### Environment Configuration

Required environment variables (see `.env.example`):
```bash
# Database (PostgreSQL with pgvector)
DB_HOST=
DB_PORT=5432
DB_NAME=
DB_USER=
DB_PASSWORD=

# AWS
AWS_REGION=us-east-1
S3_BUCKET=

# AI APIs
ANTHROPIC_API_KEY=
OPENAI_API_KEY=  # For embeddings only

# Optional
NODE_ENV=development
PORT=3000
SESSION_SECRET=
```

### Vector Search Implementation

**Chunking Strategy:**
- 500 characters per chunk
- 50 character overlap between chunks
- Preserves context across boundaries
- Special handling for page/line numbers in transcripts

**Embedding Model:**
- OpenAI text-embedding-ada-002
- 1536 dimensions
- Industry standard for legal text

**Search Algorithm:**
- Cosine similarity using pgvector
- IVFFlat index for performance
- Configurable similarity threshold (default 0.7)
- Returns ranked results with scores

**Search Query:**
```sql
SELECT chunk_text, 1 - (embedding <=> $1) as similarity
FROM document_chunks
WHERE matter_id = $2 AND 1 - (embedding <=> $1) > $3
ORDER BY similarity DESC
LIMIT $4
```

### Prompt Construction for Drafting

AI drafting prompts are hierarchically constructed in `drafter-session-api.js`:

1. **System Instructions** - Role, constraints, format requirements
2. **Matter Context** - Matter name, client, court, case type
3. **Matter Memory** - Persistent facts about the case (injected)
4. **Selected Knowledge** - Explicitly chosen templates/examples (injected)
5. **Selected Documents** - Relevant case documents (injected)
6. **Task Description** - User's drafting request
7. **Phase-Specific Instructions** - Planning vs drafting vs refinement

This hierarchical structure ensures AI uses firm knowledge and case context, preventing hallucinations.

### AI Model Selection

Platform supports multiple models per task:
- **Sonnet 4.5** (`claude-sonnet-4-5-20250929`) - Fast, cost-effective, routine work
- **Opus 4.5** (`claude-opus-4-20250514`) - Powerful, complex briefs

Model selection in `drafter-session-api.js`:
```javascript
const MODEL_MAP = {
    'sonnet': 'claude-sonnet-4-5-20250929',
    'opus': 'claude-opus-4-20250514'
};
```

### Frontend Architecture

**No Framework:** Pure HTML/CSS/JavaScript
- `public/index.html` - Landing/login page
- `public/admin-v2.html` - Admin interface
- `public/user.html` - User profile
- `public/matters.html` - Matter management
- `public/knowledge.html` - Knowledge base
- `public/drafter-v2.html` - Split-panel drafter interface
- `public/app.js` - Main frontend JavaScript (~1000 lines)
- `public/style.css` - Main styles
- `public/navigation.css` - Nav bar styles

**UI Pattern:** Single-page apps that fetch data via API, render dynamically with JavaScript

### Known Issues and Gotchas

1. **Database SSL** - Currently `rejectUnauthorized: false` in `db.js` for AWS RDS (TODO: download AWS RDS CA certificate for production)
2. **Formatting UI incomplete** - Backend APIs work, but no UI to access them from frontend
3. **PDF Processing disabled** - pdf-parse requires Node.js 20+, currently running 18.19.1, so PDF processing gracefully disabled
4. **SSM Tunnel Required** - When away from home IP (69.111.182.221), database access requires SSM tunnel (Claude Code handles automatically)
5. **File paths** - Some references to `C:\tmp\autodrafter` in comments may need updating
6. **v2 directory** - Contains earlier prototype, can be ignored

### Development Workflow

**Making Changes:**
1. Modify backend module (e.g., `drafter-session-api.js`)
2. Test with standalone script (e.g., `test-new-features.js`)
3. Update `server.js` if adding new routes
4. Update frontend HTML/JS if UI changes needed
5. Test in browser with `node server.js`

**Adding New Features:**
1. Create module file (e.g., `new-feature-api.js`)
2. Write SQL schema if needed (e.g., `setup-new-feature.sql`)
3. Add routes to `server.js`
4. Create/update frontend HTML page
5. Add to navigation in `app.js`

**Database Changes:**
1. Write SQL migration file
2. Test locally first
3. Run against production database
4. Update schema documentation

### Testing Strategy

**No formal test framework** - Uses custom test scripts:
- `comprehensive-test.js` - Tests all major API endpoints
- `test-vectorization.js` - Tests document chunking and embedding
- `test-new-features.js` - Tests latest features
- `test-connection.js` - Database connectivity check

**Manual testing workflow:**
1. Start server: `node server.js`
2. Open browser to `http://localhost:3000`
3. Login (admin/admin123)
4. Test feature end-to-end
5. Check server logs for errors
6. Check database with psql if needed

### Deployment Notes

**Current deployment:** Development only (local Windows machine)

**AWS Elastic Beanstalk planned:**
- Dockerized deployment
- `Dockerfile` and `Dockerrun.aws.json` present
- Environment variables configured via EB console
- See `DEPLOYMENT_GUIDE.md` and `QUICK_START.md` for details

**Security for production:**
- Change `SESSION_SECRET`
- Enable proper SSL/TLS for database
- Remove hardcoded credentials
- Implement database-backed user management
- Add rate limiting
- Enable CORS restrictions

### Key Files Reference

**Must read for understanding:**
- `HANDOFF-CLAUDE-CODE.md` - Complete project handoff documentation
- `PROJECT-STATUS-AND-WHITEPAPER-INSTRUCTIONS.md` - Technical architecture and status
- `server.js` - All API routes and server configuration
- `drafter-session-api.js` - Multi-phase drafting workflow
- `knowledge-processor.js` - Knowledge management logic
- `document-processor.js` - Document processing pipeline

**SQL schemas:**
- `setup-pgvector.sql` - Vector extension and document chunks
- `setup-knowledge.sql` - Knowledge base tables
- `setup-drafting-sessions.sql` - Drafting session tables
- `setup-document-styles.sql` - Formatting system tables
- `setup-legal-metadata.sql` - Legal metadata columns, pg_trgm extension, hybrid search functions (NEW)
- `setup-medical-metadata.sql` - Medical processing columns and indexes (NEW)

**Testing:**
- `comprehensive-test.js` - API testing suite
- `test-vectorization.js` - Vectorization tests
- `test-new-features.js` - Feature testing

### Common Tasks

**Add a new API endpoint:**
1. Write handler function in appropriate module (e.g., `my-feature-api.js`)
2. Export function from module
3. Import in `server.js`: `const { myFunction } = require('./my-feature-api');`
4. Add route in `server.js`: `app.post('/api/my-endpoint', requireAuth, async (req, res) => { ... });`

**Add a new database table:**
1. Write SQL in `setup-my-feature.sql`
2. Run via psql: `psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f setup-my-feature.sql`
3. Document in relevant API module

**Process a new file type:**
1. Add extraction logic to `document-processor.js` in `processDocument()` function
2. Add mime type detection
3. Test with `test-new-features.js`

**Add UI for existing backend feature:**
1. Create/modify HTML page in `public/` directory
2. Add JavaScript fetch calls to API endpoints
3. Add navigation link in `app.js`
4. Style with CSS in `style.css`
