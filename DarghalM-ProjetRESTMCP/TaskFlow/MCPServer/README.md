# TaskFlow Auth MCP Server

An MCP (Model Context Protocol) server that provides AI assistants with tools to interact with the TaskFlow authentication API.

## Features

This MCP server exposes the following tools to AI assistants:

- **register_user**: Register a new user in the TaskFlow system
- **login_user**: Authenticate an existing user
- **get_current_user**: Retrieve current user information
- **check_api_health**: Check if the TaskFlow API server is running

## Prerequisites

- Node.js 18 or higher
- TaskFlow API server running on `http://localhost:5000`

## Installation

```bash
npm install
```

## Configuration

Create a `.env` file in the root directory:

```env
API_BASE_URL=http://localhost:5000
```

## Running the MCP Server

### Development Mode

```bash
npm run server:dev
```

### Using MCP Inspector (for testing)

```bash
npm run server:inspect
```

This will open the MCP Inspector in your browser where you can test the tools interactively.

## Integrating with Claude Desktop or Other MCP Clients

Add this configuration to your MCP client settings (e.g., Claude Desktop's config file):

```json
{
  "mcpServers": {
    "taskflow-auth": {
      "command": "node",
      "args": [
        "/path/to/MCPServer/dist/server.js"
      ],
      "env": {
        "API_BASE_URL": "http://localhost:5000"
      }
    }
  }
}
```

Or for development:

```json
{
  "mcpServers": {
    "taskflow-auth": {
      "command": "npx",
      "args": [
        "tsx",
        "/path/to/MCPServer/src/server.ts"
      ],
      "env": {
        "API_BASE_URL": "http://localhost:5000"
      }
    }
  }
}
```

## Usage Examples

Once integrated with an AI assistant, you can use natural language prompts like:

- "Register a new user with name 'John Doe', email 'john@example.com', and password 'securepass123'"
- "Login with email 'john@example.com' and password 'securepass123'"
- "Check if the API server is healthy"
- "Get my user information using this token: eyJhbGc..."

## API Endpoints

The MCP server interacts with these TaskFlow API endpoints:

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `GET /api/auth/me` - Get current user (requires authentication)
- `GET /api/health` - Health check

## Development

### Build

```bash
npm run server:build
```

### Watch Mode

```bash
npm run server:build:watch
```

## Troubleshooting

1. **Connection refused**: Ensure the TaskFlow API server is running on port 5000
2. **Authentication errors**: Check that the token is valid and not expired
3. **Validation errors**: Ensure all required fields are provided with correct formats

## Example Registration Request

```json
{
  "name": "Darghal Med",
  "email": "mrdrgh2003@gmail.com",
  "password": "12345678"
}
```

## License

ISC
