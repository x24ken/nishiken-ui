# nishiken-ui-mcp-server

MCP (Model Context Protocol) server for nishiken-ui design system. This enables Claude Code to access nishiken-ui components, design tokens, and integration tools directly.

## Installation

### Global Installation (Recommended for Teams)

```bash
npm install -g nishiken-ui-mcp-server
```

### Local Development Installation

```bash
git clone https://github.com/x24ken/nishiken-ui.git
cd nishiken-ui/design-system-mcp
npm install
npm run build
```

## Configuration

Add the following to your Claude Code MCP settings:

### Option 1: Using Global Command (Recommended)

```json
{
  "mcpServers": {
    "nishiken-ui": {
      "command": "nishiken-ui-mcp"
    }
  }
}
```

### Option 2: Using npx (Alternative)

```json
{
  "mcpServers": {
    "nishiken-ui": {
      "command": "npx",
      "args": ["nishiken-ui-mcp-server"]
    }
  }
}
```

### Option 3: Local Development Setup

```json
{
  "mcpServers": {
    "nishiken-ui": {
      "command": "node",
      "args": ["/path/to/nishiken-ui/design-system-mcp/dist/server.js"],
      "env": {}
    }
  }
}
```

## Team Setup Guide

1. **Install globally** on each team member's machine:
   ```bash
   npm install -g nishiken-ui-mcp-server
   ```

2. **Configure Claude Code** with the global command setting shown above.

3. **Start using** nishiken-ui components directly in Claude Code conversations.

4. **Automatic updates**: When nishiken-ui is updated, team members can run:
   ```bash
   npm update -g nishiken-ui-mcp-server
   ```

## Available Tools

### `search_components`
Search for components in the nishiken-ui design system.

**Parameters:**
- `query` (string): Search keyword
- `category` (string, optional): Component category (button, input, card, typography, label)

**Usage Examples:**
```
"Search for Button components"
"Show all input category components"
```

### `get_component_code`
Get the source code for a specific component.

**Parameters:**
- `componentName` (string): Component name
- `includeStories` (boolean): Include Storybook stories
- `includeTypes` (boolean): Include type definitions
- `includeIndex` (boolean): Include index file

**Usage Examples:**
```
"Get Button component code with stories"
"Show Card component implementation"
```

### `get_design_tokens`
Retrieve design tokens from the design system.

**Parameters:**
- `category` (string, optional): Token category (color, spacing, border-radius, typography, shadow, animation)
- `format` (string): Output format (json, css, js)

**Usage Examples:**
```
"Get color tokens in CSS format"
"Show all design tokens as JavaScript"
```

### `apply_theme_setup`
Apply theme configuration to a project.

**Parameters:**
- `targetPath` (string): Target project path
- `framework` (string): Framework (react, next, vite)
- `typescript` (boolean): Use TypeScript
- `setupTailwind` (boolean): Setup Tailwind CSS v4

### `integrate_components`
Integrate components into a project.

**Parameters:**
- `components` (array): Component names to integrate
- `targetPath` (string): Target project path
- `framework` (string): Framework (react, next, vite)
- `setupStorybook` (boolean): Include Storybook stories

## Resources

- `nishiken-ui://components/catalog` - Complete component catalog
- `nishiken-ui://design-tokens/colors` - Color design tokens

## Troubleshooting

### MCP Server Not Recognized

1. **Verify Installation**
   ```bash
   # Check if globally installed
   npm list -g nishiken-ui-mcp-server
   
   # Reinstall if needed
   npm install -g nishiken-ui-mcp-server
   ```

2. **Check Command**
   ```bash
   # Test if command is available
   which nishiken-ui-mcp
   
   # Or try running directly
   nishiken-ui-mcp
   ```

3. **Restart Claude Code**
   - Completely quit Claude Code
   - Restart the application
   - Try using the MCP server again

### Testing the Server

Try these commands in Claude Code:

```
"Search for nishiken-ui components"
"Get Button component code"
"Show color design tokens"
```

### Local Development Testing

For debugging during development:

```bash
cd design-system-mcp
npm run build
npm run start
```

## Development

### Architecture

- **ComponentReader**: Analyzes component files and extracts metadata
- **TailwindTokenReader**: Extracts design tokens from Tailwind CSS configuration
- **IntegrationManager**: Handles project integration processes

### Adding New Tools

To add new functionality:

1. Add tool definition to `ListToolsRequestSchema` handler in `src/server.ts`
2. Add processing logic to `CallToolRequestSchema` handler
3. Create utility classes as needed

### Testing

```bash
# Full test suite
npm run test

# Development mode (watch files)
npm run dev

# Type checking
npm run typecheck
```

## Requirements

- Node.js 18 or higher
- nishiken-ui package (automatically installed as dependency)

## License

MIT - See [LICENSE](../LICENSE) file for details.