#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  CallToolRequest,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";


const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:5000";

const RegisterUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const LoginUserSchema = z.object({
  email: z.string().email("Valid email is required"),
  password: z.string().min(1, "Password is required"),
});

const GetMeSchema = z.object({
  token: z.string().min(1, "Authentication token is required"),
});

async function makeApiRequest(
    endpoint: string,
    method: string = "GET",
    body?: any,
    token?: string
) {
    const headers: HeadersInit = {
        "Content-Type": "application/json",
    };

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();

    return {
        status: response.status,
        statusText: response.statusText,
        data,
    };
}

const server = new Server(
  {
    name: "taskflow-auth-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "register_user",
        description:
          "Register a new user in . Require name, email, and password. return user details and authentication token on success",
        inputSchema: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "Full name of the user",
            },
            email: {
              type: "string",
              description: "Email address of the user",
            },
            password: {
              type: "string",
              description: "Password for the user account (minimum 6 characters)",
            },
          },
          required: ["name", "email", "password"],
        },
      },
      {
        name: "login_user",
        description:
          "Login an existing user. Requires email and password. Returns user details and authentication token on success.",
        inputSchema: {
          type: "object",
          properties: {
            email: {
              type: "string",
              description: "Email address of the user",
            },
            password: {
              type: "string",
              description: "Password for the user account",
            },
          },
          required: ["email", "password"],
        },
      },
      {
        name: "get_current_user",
        description:
          "Get the current authenticated user's information. Requires a valid authentication token.",
        inputSchema: {
          type: "object",
          properties: {
            token: {
              type: "string",
              description: "Authentication token from login or registration",
            },
          },
          required: ["token"],
        },
      },
      {
        name: "check_api_health",
        description:
          "Check if the TaskFlow API server is running and healthy.",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "register_user": {
        const validated = RegisterUserSchema.parse(args);
        const result = await makeApiRequest("/api/auth/register", "POST", validated);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: result.status === 201,
                  status: result.status,
                  message: result.status === 201
                    ? "User registered successfully"
                    : "Registration failed",
                  data: result.data,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case "login_user": {
        const validated = LoginUserSchema.parse(args);
        const result = await makeApiRequest("/api/auth/login", "POST", validated);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: result.status === 200,
                  status: result.status,
                  message: result.status === 200
                    ? "Login successful"
                    : "Login failed",
                  data: result.data,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case "get_current_user": {
        const validated = GetMeSchema.parse(args);
        const result = await makeApiRequest("/api/auth/me", "GET", undefined, validated.token);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: result.status === 200,
                  status: result.status,
                  data: result.data,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case "check_api_health": {
        const result = await makeApiRequest("/api/health", "GET");

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: result.status === 200,
                  status: result.status,
                  data: result.data,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: false,
                error: "Validation error",
                details: error.errors,
              },
              null,
              2
            ),
          },
        ],
        isError: true,
      };
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              success: false,
              error: error instanceof Error ? error.message : "Unknown error occurred",
            },
            null,
            2
          ),
        },
      ],
      isError: true,
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("TaskFlow Auth MCP Server running on stdio");
  console.error(`API Base URL: ${API_BASE_URL}`);
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
