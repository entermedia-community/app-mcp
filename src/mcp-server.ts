import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
	CallToolRequestSchema,
	ListToolsRequestSchema,
	ToolSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
// import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";

const server = new Server(
	{
		name: "logic-gates",
		version: "1.0.0",
	},
	{
		capabilities: {
			tools: {},
		},
	}
);

// const transports: Record<string, SSEServerTransport> = {};

const ValueSchema = z.object({
	leftHand: z
		.number()
		.max(1)
		.nonnegative()
		.describe(
			"Left hand value of logic gate, either 0 or 1. 0 is FALSE and 1 is TRUE"
		),
	rightHand: z
		.number()
		.max(1)
		.nonnegative()
		.describe(
			"Right hand value of logic gate, either 0 or 1. 0 is FALSE and 1 is TRUE"
		),
});

const ToolInputSchema = ToolSchema.shape.inputSchema;
type ToolInput = z.infer<typeof ToolInputSchema>;

const AND = "AND",
	OR = "OR",
	XOR = "XOR",
	AND_GATE = "and_gate",
	OR_GATE = "or_gate",
	XOR_GATE = "xor_gate";

server.setRequestHandler(ListToolsRequestSchema, async () => ({
	tools: [
		{
			name: AND_GATE,
			description:
				"Returns TRUE if both inputs are TRUE, otherwise returns FALSE",
			inputSchema: zodToJsonSchema(ValueSchema) as ToolInput,
		},
		{
			name: OR_GATE,
			description:
				"Returns TRUE if either input is TRUE, otherwise returns FALSE",
			inputSchema: zodToJsonSchema(ValueSchema) as ToolInput,
		},
		{
			name: XOR_GATE,
			description:
				"Returns TRUE if exactly one input is TRUE, otherwise returns FALSE",
			inputSchema: zodToJsonSchema(ValueSchema) as ToolInput,
		},
	],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
	try {
		const { name, arguments: args } = request.params;
		switch (name) {
			case AND_GATE: {
				const parsed = ValueSchema.safeParse(args);

				if (!parsed.success) {
					throw new Error(`Invalid arguments for ${AND_GATE}: ${parsed.error}`);
				}

				const leftHand = parsed.data.leftHand;
				const rightHand = parsed.data.rightHand;
				const leftText = leftHand ? "true" : "false";
				const rightText = rightHand ? "true" : "false";

				return {
					content: [
						{
							type: "text",
							text: `${leftText} ${AND} ${rightText} = ${
								leftHand && rightHand ? "true" : "false"
							}`,
						},
					],
				};
			}

			case OR_GATE: {
				const parsed = ValueSchema.safeParse(args);
				if (!parsed.success) {
					throw new Error(`Invalid arguments for ${OR_GATE}: ${parsed.error}`);
				}
				const leftHand = parsed.data.leftHand;
				const rightHand = parsed.data.rightHand;
				const leftText = leftHand ? "true" : "false";
				const rightText = rightHand ? "true" : "false";

				return {
					content: [
						{
							type: "text",
							text: `${leftText} ${OR} ${rightText} = ${
								leftHand || rightHand ? "true" : "false"
							}`,
						},
					],
				};
			}

			case XOR_GATE: {
				const parsed = ValueSchema.safeParse(args);
				if (!parsed.success) {
					throw new Error(`Invalid arguments for ${XOR_GATE}: ${parsed.error}`);
				}
				const leftHand = parsed.data.leftHand;
				const rightHand = parsed.data.rightHand;
				const leftText = leftHand ? "true" : "false";
				const rightText = rightHand ? "true" : "false";

				return {
					content: [
						{
							type: "text",
							text: `${leftText} ${XOR} ${rightText} = ${
								leftHand !== rightHand ? "true" : "false"
							}`,
						},
					],
				};
			}

			default:
				throw new Error(`Unknown tool: ${name}`);
		}
	} catch (e) {
		return {
			content: [{ type: "text", text: `Error: ${e}` }],
			isError: true,
		};
	}
});

// async function runServer() {
// 	const transport = new StdioServerTransport();
// 	await server.connect(transport);
// 	console.error("Logic Gates MCP Server running on stdio");
// }

// runServer().catch((error) => {
// 	console.error("Fatal error in runServer():", error);
// 	process.exit(1);
// });

export default server;
