## Rest server to MCP server mini Project
this is a mini representation of a mcp server that acts as a middleman between a client (copilot chat for my example) and the Rest Server
it allows us to register, login and view authenticated user using email, password and JWT credentials
api endpoints provided as tools in the mcp:
- `/api/auth/register`: register a new user.
- `/api/auth/login`: login as a user.
- `/api/auth/me`: view connected user (check the token validity).
- `/api/health`: check the Rest server health.

--
## Instructions
launch the `startup.sh` script