# Learning MCP Server in TypeScript

A comprehensive example of building a **Model Context Protocol (MCP)** server in TypeScript.

## What is MCP?

**Model Context Protocol (MCP)** is an open protocol developed by Anthropic that standardizes how AI assistants connect to external data sources and tools.

### Key Concepts

- **MCP Server**: Exposes capabilities (tools, resources, prompts) to AI models
- **MCP Client**: Applications like Claude Desktop that connect to servers
- **Tools**: Functions that the AI can execute (like APIs)
- **Resources**: Data sources the AI can read (files, databases, etc.)
- **Prompts**: Reusable prompt templates with placeholders

### Architecture

```
┌─────────────┐         ┌─────────────┐         ┌──────────────┐
│   Claude    │ ◄─────► │ MCP Client  │ ◄─────► │  MCP Server  │
│  (AI Model) │         │  (Desktop)  │         │ (Your Code)  │
└─────────────┘         └─────────────┘         └──────────────┘
```

## This Project

This MCP server demonstrates all three capabilities:

### 🛠️ **Tools** (3 tools implemented)

1. **calculate** - Perform arithmetic operations
2. **get_current_time** - Get current date/time
3. **generate_uuid** - Generate random UUIDs

### 📚 **Resources** (3 resources implemented)

1. `user://list` - User data
2. `config://app` - App configuration
3. `doc://readme` - Documentation

### 💬 **Prompts** (2 prompts implemented)

1. **code_review** - Code review template
2. **debug_helper** - Debugging assistance

## Project Structure

```
Projet-MCP/
├── server.ts        # MCP server implementation
├── package.json     # Dependencies and scripts
├── tsconfig.json    # TypeScript configuration
└── build/           # Compiled JavaScript output
    └── server.js
```

## Installation

Dependencies are already installed, but if starting fresh:

```bash
npm install
```

## Usage

### Build the Server

```bash
npm run build
```

### Run the Server

```bash
npm start
```

The server communicates via stdio (standard input/output), which is how MCP clients connect to it.

## Connecting to Claude Desktop

To use this server with Claude Desktop:

1. **Build the server** (if not already built):
   ```bash
   npm run build
   ```

2. **Find your Claude config file**:
   - **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
   - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

3. **Add your server to the config**:
   ```json
   {
     "mcpServers": {
       "learning-mcp": {
         "command": "node",
         "args": [
           "C:\\Users\\mrdrg\\OneDrive\\Bureau\\Backups\\infos_data\\StagePFE\\Projet-MCP\\build\\server.js"
         ]
       }
     }
   }
   ```

4. **Restart Claude Desktop**

5. **Test it**: Ask Claude to use the tools, read resources, or use prompts!

## Example Interactions

Once connected to Claude:

### Using Tools
- "Can you calculate 45 * 23 for me?"
- "What's the current time?"
- "Generate a UUID for me"

### Reading Resources
- "Show me the user list"
- "What's in the app configuration?"

### Using Prompts
- "Use the code_review prompt for Python with a focus on security"

## Code Walkthrough

### 1. Server Initialization

```typescript
const server = new Server(
  { name: "learning-mcp-server", version: "1.0.0" },
  { capabilities: { tools: {}, resources: {}, prompts: {} } }
);
```

### 2. Defining Tools

```typescript
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "calculate",
        description: "Perform arithmetic",
        inputSchema: { /* JSON Schema */ }
      }
    ]
  };
});
```

### 3. Handling Tool Calls

```typescript
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  // Execute tool logic
  return { content: [{ type: "text", text: result }] };
});
```

### 4. Exposing Resources

```typescript
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      { uri: "user://list", name: "Users", mimeType: "application/json" }
    ]
  };
});
```

### 5. Starting the Server

```typescript
const transport = new StdioServerTransport();
await server.connect(transport);
```

## Understanding the Flow

1. **Client Discovery**: Claude Desktop asks "what tools do you have?"
2. **Server Response**: Server lists available tools/resources/prompts
3. **Client Request**: Claude decides to use a tool with specific arguments
4. **Server Execution**: Server runs the tool and returns results
5. **Client Processing**: Claude uses the results in its response

## Key TypeScript Features

- **Type Safety**: Zod schemas for runtime validation
- **ES Modules**: Modern import/export syntax
- **Async/Await**: Clean asynchronous code
- **Error Handling**: Try/catch with typed errors
- **Request Schemas**: Strongly-typed MCP request handlers

## Building Your Own MCP Server

### Common Use Cases

1. **Database Access**: Connect AI to your database
2. **API Integration**: Wrap external APIs as tools
3. **File System**: Expose files/directories as resources
4. **Custom Logic**: Business-specific functions

### Best Practices

1. **Input Validation**: Always validate tool arguments
2. **Error Handling**: Return helpful error messages
3. **Documentation**: Clear descriptions for all capabilities
4. **Security**: Never expose sensitive data without authentication
5. **Testing**: Test each tool/resource independently

## Learning Resources

- **Official Docs**: https://modelcontextprotocol.io
- **MCP Spec**: https://spec.modelcontextprotocol.io
- **SDK GitHub**: https://github.com/modelcontextprotocol/typescript-sdk
- **Example Servers**: https://github.com/modelcontextprotocol/servers

## Next Steps

1. **Modify tools**: Add your own business logic
2. **Connect to real data**: Replace sample data with databases/APIs
3. **Add authentication**: Implement security if needed
4. **Create more resources**: Expose more data sources
5. **Build complex prompts**: Create domain-specific templates

## Troubleshooting

### Server won't start
- Run `npm run build` first
- Check for TypeScript errors

### Claude can't see the server
- Verify the path in `claude_desktop_config.json`
- Restart Claude Desktop
- Check Claude's developer tools for logs

### Tools fail silently
- Add logging to your tool handlers
- Check the error messages in responses

## Contributing

This is a learning project. Feel free to experiment and modify!

---

**Happy MCP Building! 🚀**
