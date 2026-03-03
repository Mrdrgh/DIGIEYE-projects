import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import z from "zod";
import fs from "node:fs/promises"

const server = new McpServer({
    name: "server",
    version: "1.0.0"
});

const createdUserSchema = z.object({
    name: z.string(),
    email: z.string().email(),
    address: z.string(),
    phone: z.string()
})

type createdUserInput = z.infer<typeof createdUserSchema>;


server.registerTool(
    "create-user",
    {
        description: "creates a user",
        inputSchema: createdUserSchema
    },
    async (input: createdUserInput) => {
        try {
            const id = await createUser(input)
            return {
                content: [
                    {
                        type: "text",
                        text: `Successfuly created user ${id}`
                    }
                ]
            }
        } catch {
            return {
                isError: true,
                content: [
                    {
                        type: "text",
                        text: "error creating user"
                    }
                ]
            }
        }
    }
)


const createUser = async (input: createdUserInput) => {
    const users = await import("./data/users.json", {
        with: { type: "json" },
    }).then(m => m.default);

    const id = users.length + 1;
    users.push({ id, ...input})

    await fs.writeFile("./src/data/users.json", JSON.stringify(users, null, 2));
    return id;
}

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
}


main();