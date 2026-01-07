# Cursor & Claude Code Background Agents

> **Eight specialized AI agents that run automatically in the background** to assist with code development, quality assurance, debugging, and learning.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🎯 Overview

This repository contains **eight AI development agents** designed to work automatically with Cursor IDE and Claude Code. These agents provide continuous background support for:

- 📚 **Library Research** - Finding and evaluating existing solutions
- 🎓 **Learning & Onboarding** - Beginner-friendly explanations and guides
- ✅ **Code Quality & Review** - Security, best practices, and code review
- 🔍 **API Endpoint Monitoring** - Automatic endpoint health checks
- 🐛 **Debugging** - Systematic error analysis and fixes
- ✓ **Code Validation** - Automatic testing and validation
- 🔄 **Auto-Debugging Escalation** - Escalated problem-solving when fixes fail
- 🧠 **Error Memory** - Tracks recurring errors and learns from past mistakes

## 🚀 Quick Start

### For Cursor IDE Users

1. **Copy the agent files** to your project root:
   ```bash
   git clone https://github.com/dumpsticks/cursor-claude-code-background-agents.git
   cp cursor-claude-code-background-agents/.cursorrules.txt ./
   cp cursor-claude-code-background-agents/CLAUDE.md ./
   ```

2. **The agents will activate automatically** - Cursor reads `.cursorrules.txt` automatically

### For Claude Code Users

1. **Copy `CLAUDE.md`** to your project root:
   ```bash
   cp cursor-claude-code-background-agents/CLAUDE.md ./
   ```

2. **Agents activate automatically** - Claude Code reads `CLAUDE.md` on startup

### Manual Usage

Copy agent prompts from `AGENTS.md` and paste into:
- Claude (claude.ai/code)
- ChatGPT
- Any AI assistant that accepts system prompts

## 🤖 The Eight Agents

### 1. Library Research Agent
**Purpose:** Searches GitHub repositories and evaluates existing solutions before writing custom code.

**When to use:** Starting a new feature, need to find a library, comparing alternatives

**Key Features:**
- Automatically checks approved libraries first
- Searches GitHub (500+ stars minimum)
- Evaluates 2-3 candidates with detailed comparison
- Recommends libraries over custom code

### 2. Learning & Onboarding Agent
**Purpose:** Helps new developers understand codebases, learn patterns, and find resources.

**When to use:** New to codebase, don't understand a concept, need learning resources

**Key Features:**
- Beginner-friendly explanations
- Code examples from your codebase
- Links to learning resources
- Practical next steps

### 3. Code Quality & Review Agent
**Purpose:** Reviews code for quality, security, and best practices.

**When to use:** Before committing, want code review, need best practices

**Key Features:**
- Security vulnerability detection
- Error handling verification
- Input validation checks
- Performance suggestions
- Project pattern compliance

### 4. API Endpoint Monitor Agent
**Purpose:** Continuously monitors API endpoints, detects errors, and validates responses.

**When to use:** Check endpoints, find API errors, validate responses

**Key Features:**
- Automatic endpoint scanning
- Health status checks
- Error detection
- Missing test identification
- Fix suggestions

### 5. Debugging Agent
**Purpose:** Helps debug code issues, analyze errors, trace problems, and suggest fixes.

**When to use:** Have an error, need to debug, trace a problem

**Key Features:**
- Systematic error analysis
- Code trace through codebase
- Root cause identification
- Fix suggestions with examples
- Common issue detection

### 6. Code Validation Agent
**Purpose:** Automatically validates code changes work as expected.

**When to use:** After code changes, want to verify it works, need automated testing

**Key Features:**
- Automatic test running
- Error reporting with fix instructions
- BEFORE/AFTER code examples
- Severity prioritization
- Husky + lint-staged recommendations

### 7. Auto-Debugging Escalation Agent
**Purpose:** Automatically escalates debugging efforts when initial fixes fail.

**When to use:** Automatic - activates after 2 failed fix attempts

**Key Features:**
- Tracks fix attempts
- Searches web/GitHub for solutions
- Tests multiple solutions systematically
- Creative problem solving when all else fails
- Never gives up approach

### 8. Error Memory Agent
**Purpose:** Tracks errors that occur more than once, records how they were resolved, and helps the AI learn from past mistakes.

**When to use:** Automatic - activates when errors occur

**Key Features:**
- Automatic error detection and pattern matching
- Persistent memory in ERROR-MEMORY.md
- Retrieves known solutions from memory
- Records new error resolutions
- Prevents repeating the same mistakes
- Pattern recognition across similar errors

## 📁 Repository Contents

- **`AGENTS.md`** - Complete agent definitions with full prompts
- **`AGENTS-QUICK-START.md`** - Quick reference guide
- **`CLAUDE.md`** - Configuration file for Claude Code
- **`.cursorrules.txt`** - Configuration file for Cursor IDE
- **`USAGE.md`** - Detailed usage guide with setup instructions
- **`CONTRIBUTING.md`** - Contribution guidelines
- **`LICENSE`** - MIT License
- **`README.md`** - This file

## 💡 Usage Examples

### Example 1: Finding a Library

```
You: I need to add PDF watermarking to my Node.js app.

Agent (Library Research): 
- Searches APPROVED_GITHUB_LIBRARIES.md
- Finds pdf-lib (8k+ stars)
- Evaluates alternatives
- Recommends best solution with pros/cons
```

### Example 2: Learning the Codebase

```
You: I'm new. How does the document processing pipeline work?

Agent (Learning): 
- Explains in beginner terms
- Shows code examples from your codebase
- Links to relevant files
- Suggests next learning steps
```

### Example 3: Code Review

```
You: Review this code before I commit: [paste code]

Agent (Code Quality): 
- Checks security (SQL injection, secrets)
- Verifies error handling
- Suggests performance improvements
- Ensures follows project patterns
```

### Example 4: Debugging

```
You: I'm getting this error: [paste error]

Agent (Debugging): 
- Analyzes error message
- Traces through codebase
- Identifies root cause
- Suggests systematic fix
```

## 🔧 Configuration

### For Cursor IDE

The agents are configured in `.cursorrules.txt`. Cursor automatically reads this file.

### For Claude Code

The agents are configured in `CLAUDE.md`. Claude Code reads this on startup.

### Customization

Edit the agent prompts in `AGENTS.md` to customize behavior for your project:

1. Update project context (tech stack, project name)
2. Modify evaluation criteria
3. Adjust output formats
4. Add project-specific rules

## 📊 Agent Workflows

### Adding a New Feature

```
1. Library Research Agent → Finds library
2. Learning Agent → Explains usage
3. You implement
4. Code Quality Agent → Reviews code
5. Code Validation Agent → Tests changes
```

### Fixing a Bug

```
1. Error Memory Agent → Checks if error occurred before
2. Debugging Agent → Analyzes error
3. Auto-Debugging Escalation → Searches solutions (if needed)
4. Code Quality Agent → Reviews fix
5. Code Validation Agent → Verifies fix
6. Error Memory Agent → Records resolution for future
```

### API Development

```
1. API Endpoint Monitor → Scans endpoints
2. Debugging Agent → Analyzes errors
3. Code Quality Agent → Reviews fixes
4. Code Validation Agent → Validates changes
```

## 🎓 Learning Resources

- **Full Documentation:** See `AGENTS.md` for complete agent prompts
- **Quick Reference:** See `AGENTS-QUICK-START.md` for usage examples
- **Detailed Setup:** See `USAGE.md` for comprehensive setup instructions

## 🤝 Contributing

Contributions are welcome! Please feel free to:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

These agents are designed to be reusable across any development project. They work with any codebase regardless of the technology stack.

## 📧 Support

For questions or issues:
- Open an issue on GitHub
- Review the documentation in `AGENTS.md`
- Check `AGENTS-QUICK-START.md` for examples

## 🔗 Related Resources

- [Claude Code](https://claude.ai/code) - AI coding assistant by Anthropic
- [Cursor IDE](https://cursor.sh/) - AI-powered code editor

---

**Made with ❤️ for developers who want better AI assistance**

