# Agents Quick Start Guide

> **Quick reference for using the three AutoDrafter development agents**  
> **Full documentation:** See [AGENTS.md](./AGENTS.md)

---

## 🚀 Quick Reference

### Agent 1: Library Research Agent
**When to use:** Starting a new feature, need to find a library  
**Prompt:** "Find me the best library for [feature]"  
**Output:** Evaluated GitHub repos with recommendations

### Agent 2: Learning & Onboarding Agent  
**When to use:** New to codebase, don't understand something, need learning resources  
**Prompt:** "Explain how [concept] works" or "I'm new, help me understand [topic]"  
**Output:** Beginner-friendly explanations with code examples

### Agent 3: Code Quality & Review Agent
**When to use:** Before committing, want code review, need best practices  
**Prompt:** "Review this code:" [paste code]  
**Output:** Security review, quality suggestions, best practices

### Agent 4: API Endpoint Monitor Agent
**When to use:** Check endpoints, find API errors, validate responses  
**Prompt:** "Check all API endpoints" or "Monitor this endpoint: [endpoint]"  
**Output:** Endpoint health report, errors found, suggested fixes

### Agent 5: Debugging Agent
**When to use:** Have an error, need to debug, trace a problem  
**Prompt:** "Debug this error:" [paste error] or "Help me debug [issue]"  
**Output:** Root cause analysis, code trace, suggested fixes

### Agent 6: Code Validation Agent
**When to use:** After code changes, want to verify it works, need automated testing  
**Prompt:** "Validate my code changes" or "Check if my changes work"  
**Output:** Test results, validation status, recommendations for Husky + lint-staged

---

## 📝 Usage with Claude/ChatGPT

1. **Copy the agent prompt** from [AGENTS.md](./AGENTS.md)
2. **Paste as system/context message**
3. **Ask your question**
4. **Agent responds in structured format**

---

## 🎯 Common Workflows

### Workflow 1: Adding a New Feature
```
1. Library Research Agent → Finds library
2. Learning Agent → Explains how to use it
3. You implement
4. Code Quality Agent → Reviews your code
```

### Workflow 2: Learning the Codebase
```
1. Learning Agent → Explains architecture
2. Learning Agent → Explains specific modules
3. Learning Agent → Points to examples
```

### Workflow 3: Code Review
```
1. Code Quality Agent → Reviews code
2. Library Research Agent → Finds better solutions (if needed)
3. Learning Agent → Explains improvements
```

### Workflow 4: Endpoint Monitoring
```
1. API Endpoint Monitor Agent → Scans all endpoints
2. API Endpoint Monitor Agent → Detects errors
3. Debugging Agent → Analyzes errors found
4. Code Quality Agent → Reviews fixes
```

### Workflow 5: Debugging
```
1. Debugging Agent → Analyzes error
2. Debugging Agent → Traces through code
3. API Endpoint Monitor Agent → Checks related endpoints
4. Code Quality Agent → Reviews fix
```

---

## 💡 Example Prompts

**Library Research:**
- "Find the best PDF watermarking library for Node.js"
- "What library should I use for real-time collaboration?"
- "Search for Express middleware for rate limiting"

**Learning:**
- "Explain how document processing works in this codebase"
- "I'm new. How does the drafter session API work?"
- "What is pgvector and how do we use it?"

**Code Quality:**
- "Review this Express route for security issues"
- "Check this code before I commit"
- "Is this the right way to handle errors?"

**API Monitoring:**
- "Check all API endpoints for errors"
- "Monitor the POST /api/matters endpoint"
- "Validate all endpoint responses"

**Debugging:**
- "I'm getting this error: [paste error]"
- "Debug why documents aren't uploading"
- "Help me trace this performance issue"

**Code Validation:**
- "Validate my recent code changes"
- "Check if my changes broke anything"
- "Set up automated code validation with Husky"

---

## 🔗 Full Documentation

See [AGENTS.md](./AGENTS.md) for:
- Complete agent prompts
- Detailed output formats
- Advanced usage examples
- Agent collaboration patterns

---

*Last Updated: 2026-01-06*

