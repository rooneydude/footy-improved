# Usage Guide

This guide provides detailed instructions for using the background agents in different environments.

## Table of Contents

- [Cursor IDE Setup](#cursor-ide-setup)
- [Claude Code Setup](#claude-code-setup)
- [Manual Usage](#manual-usage)
- [Customization](#customization)
- [Troubleshooting](#troubleshooting)

## Cursor IDE Setup

### Automatic Setup

1. **Clone or download this repository**
   ```bash
   git clone https://github.com/dumpsticks/cursor-claude-code-background-agents.git
   ```

2. **Copy configuration to your project**
   ```bash
   cd your-project
   cp ../cursor-claude-code-background-agents/.cursorrules.txt ./
   cp ../cursor-claude-code-background-agents/CLAUDE.md ./
   ```

3. **Restart Cursor IDE** - Agents will activate automatically

### Manual Setup

1. Copy `.cursorrules.txt` to your project root
2. Optionally copy `CLAUDE.md` for reference
3. Restart Cursor IDE

### Verification

To verify agents are active:
1. Ask Cursor to implement a feature
2. It should automatically search for libraries first (Library Research Agent)
3. It should explain concepts clearly (Learning & Onboarding Agent)
4. It should review code quality (Code Quality & Review Agent)
5. It should monitor API endpoints (API Endpoint Monitor Agent)
6. It should help debug errors (Debugging Agent)
7. It should validate code changes (Code Validation Agent)
8. It should escalate debugging when fixes fail (Auto-Debugging Escalation Agent)
9. It should track and learn from errors (Error Memory Agent)

## Claude Code Setup

### Setup Steps

1. **Copy `CLAUDE.md` to your project root**
   ```bash
   cp cursor-claude-code-background-agents/CLAUDE.md ./
   ```

2. **Start Claude Code** - It will read `CLAUDE.md` automatically

3. **Agents are now active** - All eight agents run in the background

### Customization

Edit `CLAUDE.md` to:
- Update project context (tech stack, project name)
- Modify agent behaviors
- Add project-specific rules

## Manual Usage

### With Claude (claude.ai/code)

1. **Copy agent prompt** from `AGENTS.md`
2. **Paste as system/context message**
3. **Ask your question** - Agent responds in structured format

### With ChatGPT

1. **Copy agent prompt** from `AGENTS.md`
2. **Set as system message** or paste in conversation
3. **Use the agent** for your specific task

### Example: Library Research Agent

```markdown
You are the Library Research Agent. Your job is to find and evaluate GitHub repositories before any new code is written.

[Full prompt from AGENTS.md]

---

User: I need to add PDF watermarking to my Node.js app.
```

## Customization

### Project-Specific Context

Edit `.cursorrules.txt` or `CLAUDE.md` to update:

```markdown
PROJECT CONTEXT:
- Tech Stack: [Your tech stack]
- Project: [Your project name]
- Location: [Path to your libraries/configuration]
```

### Agent Behavior

Modify agent prompts in `AGENTS.md` to:
- Change evaluation criteria
- Adjust output formats
- Add project-specific rules
- Customize examples

### Configuration Files

- **`.cursorrules.txt`** - Cursor IDE configuration
- **`CLAUDE.md`** - Claude Code configuration
- **`AGENTS.md`** - Full agent definitions (edit for customization)

## Troubleshooting

### Agents Not Activating

**Problem:** Agents don't seem to be running

**Solutions:**
1. Ensure `.cursorrules.txt` is in project root
2. Restart Cursor IDE
3. Check file permissions
4. Verify file syntax is correct

### Agents Not Following Instructions

**Problem:** Agents ignore the prompts

**Solutions:**
1. Check prompt syntax in configuration files
2. Ensure project context is updated
3. Verify agents are reading correct files
4. Review examples in `AGENTS-QUICK-START.md`

### Getting Too Many Recommendations

**Problem:** Library Research Agent suggests too many options

**Solutions:**
1. Adjust star count minimum in agent prompt
2. Modify evaluation criteria
3. Limit number of candidates evaluated

### Agents Too Verbose/Too Brief

**Problem:** Output doesn't match your needs

**Solutions:**
1. Modify output format in agent prompts
2. Adjust verbosity settings
3. Customize examples in prompts

## Advanced Usage

### Using Multiple Agents Together

Agents can work together. For example:

```
1. Library Research Agent finds solution
2. Learning Agent explains how to use it
3. Code Quality Agent reviews implementation
4. Code Validation Agent tests the code
5. Error Memory Agent records any errors encountered
```

### Agent Workflows

See `README.md` for common agent workflows:
- Adding a new feature
- Fixing a bug
- API development
- Debugging

### Custom Agent Prompts

Create custom agents by:
1. Copying an existing agent prompt from `AGENTS.md`
2. Modifying for your specific use case
3. Adding to `.cursorrules.txt` or `CLAUDE.md`
4. Testing and iterating

## Best Practices

1. **Keep prompts updated** - Update project context as it changes
2. **Test agents regularly** - Verify they're working as expected
3. **Iterate on prompts** - Refine based on results
4. **Share improvements** - Contribute back to the project
5. **Document customizations** - Keep notes on changes you make

## Getting Help

- Review `AGENTS.md` for full documentation
- Check `AGENTS-QUICK-START.md` for examples
- Open an issue on GitHub
- Review existing issues and discussions

---

For more information, see [README.md](README.md) and [AGENTS.md](AGENTS.md).

