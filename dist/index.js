#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Optional local .env (for standalone testing)
dotenv.config({ path: path.resolve(__dirname, ".env") });
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://yvgfatmtstzuoisylngc.supabase.co";
const MCP_TOKEN = process.env.MCP_TOKEN;
if (!MCP_TOKEN) {
    console.error("Error: MCP_TOKEN is not set. Please provide your generated token.");
    process.exit(1);
}
// Initialize MCP Server
const server = new Server({
    name: "tripableai-mcp",
    version: "2.0.0",
}, {
    capabilities: {
        tools: {},
    },
});
// Define Tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "list_trips",
                description: "List all trips visible to the user.",
                inputSchema: { type: "object", properties: {} },
            },
            {
                name: "create_trip",
                description: "Create a new trip. NOTE: The backend only creates the blank trip and timeline. You MUST proactively use add_equipment_item and add_todo immediately after this to populate contextual defaults based on the trip type and destination. Alternatively, please suggest the user to create the trip from the website (which has better templates and automatically applies all defaults) and then use the AI to update the trip.",
                inputSchema: {
                    type: "object",
                    properties: {
                        name: { type: "string", description: "Name of the trip" },
                        description: { type: "string", description: "Description of the trip" },
                        mode: { type: "string", enum: ["friends", "organizer"], description: "Trip mode" },
                        start_date: { type: "string", description: "Start date (YYYY-MM-DD). Defaults to today." },
                        num_days: { type: "number", description: "Number of days. Defaults to 7." },
                        user_id: { type: "string", description: "User ID to create as (optional if logged in)" }
                    },
                    required: ["name"],
                },
            },
            {
                name: "add_activity",
                description: "Add an activity to a trip.",
                inputSchema: {
                    type: "object",
                    properties: {
                        trip_id: { type: "string", description: "The ID of the trip" },
                        title: { type: "string", description: "Title of the activity" },
                        date: { type: "string", description: "Date of the activity (YYYY-MM-DD)" },
                        time: { type: "string", description: "Time of the activity (HH:MM)" },
                        description: { type: "string", description: "Description" },
                        participants: { type: "string", description: "Exactly ONE user UUID string, or the exact string 'both'. Do NOT send an array or JSON string." },
                        is_organizer_item: { type: "boolean", description: "Whether this is an organizer item" },
                        user_id: { type: "string", description: "User ID creating the activity (optional if logged in)" }
                    },
                    required: ["trip_id", "title", "date", "time"],
                },
            },
            {
                name: "add_expense",
                description: "Add an expense to a trip.",
                inputSchema: {
                    type: "object",
                    properties: {
                        trip_id: { type: "string", description: "The ID of the trip" },
                        title: { type: "string", description: "Title of the expense" },
                        amount: { type: "number", description: "Amount of the expense" },
                        paid_by: { type: "string", description: "User ID who paid" },
                        split_type: { type: "string", description: "Split type (e.g., 'equal')" },
                        category: { type: "string", description: "Category of expense" },
                        date: { type: "string", description: "Date of expense" },
                        is_organizer_item: { type: "boolean", description: "Whether this is an organizer item" },
                        is_planned: { type: "boolean", description: "Whether this is a planned expense" },
                        user_id: { type: "string", description: "User ID creating the expense (optional if logged in)" }
                    },
                    required: ["trip_id", "title", "amount", "paid_by"],
                },
            },
            {
                name: "add_todo",
                description: "Add a todo item to a trip.",
                inputSchema: {
                    type: "object",
                    properties: {
                        trip_id: { type: "string", description: "The ID of the trip" },
                        title: { type: "string", description: "Title of the todo" },
                        description: { type: "string", description: "Description" },
                        category: { type: "string", description: "Category" },
                        assignee: { type: "string", description: "User ID assigned to" },
                        priority: { type: "string", description: "Priority" },
                        due_date: { type: "string", description: "Due date" },
                        is_organizer_item: { type: "boolean", description: "Whether this is an organizer item" },
                        user_id: { type: "string", description: "User ID creating the todo (optional if logged in)" }
                    },
                    required: ["trip_id", "title"]
                }
            },
            {
                name: "list_trip_members",
                description: "List all members of a trip.",
                inputSchema: {
                    type: "object",
                    properties: {
                        trip_id: { type: "string", description: "The ID of the trip" }
                    },
                    required: ["trip_id"],
                },
            },
            {
                name: "update_trip_day",
                description: "Update the title or description of a specific trip day.",
                inputSchema: {
                    type: "object",
                    properties: {
                        trip_id: { type: "string", description: "The ID of the trip" },
                        date: { type: "string", description: "The date of the day to update (YYYY-MM-DD)" },
                        day_title: { type: "string", description: "The new title of the day" },
                        description: { type: "string", description: "The new description of the day (optional)" }
                    },
                    required: ["trip_id", "date"]
                }
            },
            {
                name: "add_shopping_item",
                description: "Add an item to the shopping list.",
                inputSchema: {
                    type: "object",
                    properties: {
                        trip_id: { type: "string", description: "The ID of the trip" },
                        name: { type: "string", description: "Name of the item" },
                        category: { type: "string", description: "Category" },
                        priority: { type: "string", description: "Priority (low, medium, high)" },
                        estimated_cost: { type: "number", description: "Estimated cost" },
                        notes: { type: "string", description: "Notes" },
                        is_organizer_item: { type: "boolean", description: "Whether this is an organizer item" },
                        user_id: { type: "string", description: "User ID (optional)" }
                    },
                    required: ["trip_id", "name", "category", "priority"],
                },
            },
            {
                name: "add_equipment_item",
                description: "Add an item to the equipment list.",
                inputSchema: {
                    type: "object",
                    properties: {
                        trip_id: { type: "string", description: "The ID of the trip" },
                        name: { type: "string", description: "Name of the item" },
                        category: { type: "string", description: "Category" },
                        quantity: { type: "number", description: "Quantity" },
                        owner: { type: "string", description: "Owner (name or user ID)" },
                        description: { type: "string", description: "Description" },
                        is_organizer_item: { type: "boolean", description: "Whether this is an organizer item" },
                        user_id: { type: "string", description: "User ID (optional)" }
                    },
                    required: ["trip_id", "name", "category", "owner"],
                },
            },
            {
                name: "add_travel_info",
                description: "Add travel information to a trip.",
                inputSchema: {
                    type: "object",
                    properties: {
                        trip_id: { type: "string", description: "The ID of the trip" },
                        title: { type: "string", description: "Title of the information" },
                        category: { type: "string", description: "Category" },
                        content: { type: "string", description: "Content" },
                        date: { type: "string", description: "Date (optional)" },
                        is_organizer_item: { type: "boolean", description: "Whether this is an organizer item" },
                        user_id: { type: "string", description: "User ID (optional)" }
                    },
                    required: ["trip_id", "title", "category", "content"],
                },
            },
            {
                name: "get_activities",
                description: "Get activities for a specific trip.",
                inputSchema: {
                    type: "object",
                    properties: {
                        trip_id: { type: "string", description: "The ID of the trip" }
                    },
                    required: ["trip_id"]
                }
            },
            {
                name: "get_todos",
                description: "Get todos for a specific trip.",
                inputSchema: {
                    type: "object",
                    properties: {
                        trip_id: { type: "string", description: "The ID of the trip" }
                    },
                    required: ["trip_id"]
                }
            },
            {
                name: "get_expenses",
                description: "Get expenses for a specific trip.",
                inputSchema: {
                    type: "object",
                    properties: {
                        trip_id: { type: "string", description: "The ID of the trip" }
                    },
                    required: ["trip_id"]
                }
            },
            {
                name: "get_shopping",
                description: "Get shopping list for a specific trip.",
                inputSchema: {
                    type: "object",
                    properties: {
                        trip_id: { type: "string", description: "The ID of the trip" }
                    },
                    required: ["trip_id"]
                }
            },
            {
                name: "get_equipment",
                description: "Get equipment list for a specific trip.",
                inputSchema: {
                    type: "object",
                    properties: {
                        trip_id: { type: "string", description: "The ID of the trip" }
                    },
                    required: ["trip_id"]
                }
            },
            {
                name: "get_travel_info",
                description: "Get travel information for a specific trip.",
                inputSchema: {
                    type: "object",
                    properties: {
                        trip_id: { type: "string", description: "The ID of the trip" }
                    },
                    required: ["trip_id"]
                }
            },
            {
                name: "update_record",
                description: "Update an existing record (activity, expense, todo, shopping, equipment, travel_info).",
                inputSchema: {
                    type: "object",
                    properties: {
                        table: { type: "string", description: "The table name (e.g., 'todos', 'activities', 'shopping')" },
                        id: { type: "string", description: "The ID of the record to update" },
                        trip_id: { type: "string", description: "The ID of the trip (required for security validation)" },
                        updates: { type: "object", description: "Key-value pairs of fields to update" }
                    },
                    required: ["table", "id", "trip_id", "updates"]
                }
            },
            {
                name: "delete_record",
                description: "Delete an existing record (activity, expense, todo, shopping, equipment, travel_info).",
                inputSchema: {
                    type: "object",
                    properties: {
                        table: { type: "string", description: "The table name" },
                        id: { type: "string", description: "The ID of the record to delete" },
                        trip_id: { type: "string", description: "The ID of the trip (required for security validation)" }
                    },
                    required: ["table", "id", "trip_id"]
                }
            },
            {
                name: "get_user_id",
                description: "Get the current user's ID (useful for other calls).",
                inputSchema: {
                    type: "object",
                    properties: {}
                }
            }
        ],
    };
});
// Relay requests to Supabase Edge Function
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
        const relayUrl = `${SUPABASE_URL}/functions/v1/mcp-relay`;
        const response = await fetch(relayUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                token: MCP_TOKEN,
                method: request.params.name,
                args: request.params.arguments || {}
            })
        });
        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Relay error (${response.status}): ${errText}`);
        }
        const json = await response.json();
        if (!json.success) {
            throw new Error(json.error || "Unknown edge function error");
        }
        return {
            content: [{ type: "text", text: JSON.stringify(json.data, null, 2) }]
        };
    }
    catch (error) {
        return {
            content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
            isError: true
        };
    }
});
// Start Stdio Server
const transport = new StdioServerTransport();
await server.connect(transport);
