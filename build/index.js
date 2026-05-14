#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as os from "node:os";
import { fileURLToPath } from "node:url";
const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Use the bundled executable inside the package
const BUNDLED_BIN_PATH = path.resolve(__dirname, "../bin/nexusq.exe");
// Allow override via ENV, fallback to bundled binary
let NEXUSQ_BIN = process.env.NEXUSQ_BIN_PATH || BUNDLED_BIN_PATH;
const server = new Server({
    name: "nexusq-mcp-server",
    version: "1.0.0",
}, {
    capabilities: {
        tools: {},
    }
});
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "nexusq_docs",
                description: "Get the official Nexus-Q language documentation (AI manual). Use this to learn the syntax and available operators.",
                inputSchema: {
                    type: "object",
                    properties: {},
                }
            },
            {
                name: "nexusq_examples",
                description: "Get official Nexus-Q code examples. Use this to see patterns of how Nexus-Q is written.",
                inputSchema: {
                    type: "object",
                    properties: {},
                }
            },
            {
                name: "nexusq_version",
                description: "Get the current version of the Nexus-Q compiler.",
                inputSchema: {
                    type: "object",
                    properties: {},
                }
            },
            {
                name: "nexusq_compile",
                description: "Compile a Nexus-Q script or directory to validate its syntax. This does not run the script.",
                inputSchema: {
                    type: "object",
                    properties: {
                        targetPath: {
                            type: "string",
                            description: "Absolute or relative path to the .n6q script file or directory."
                        }
                    },
                    required: ["targetPath"]
                }
            },
            {
                name: "nexusq_run",
                description: "Run an existing Nexus-Q script file.",
                inputSchema: {
                    type: "object",
                    properties: {
                        scriptPath: {
                            type: "string",
                            description: "Absolute or relative path to the .n6q script file."
                        },
                        payloadJson: {
                            type: "string",
                            description: "Optional JSON string to pass as payload (∇) to the script. Must be valid JSON."
                        },
                        configPath: {
                            type: "string",
                            description: "Optional path to a nexus.config.json file for database configuration."
                        }
                    },
                    required: ["scriptPath"]
                }
            },
            {
                name: "nexusq_serve",
                description: "Start the Nexus-Q Web Host to serve scripts as RESTful APIs.",
                inputSchema: {
                    type: "object",
                    properties: {
                        directoryPath: {
                            type: "string",
                            description: "Path to the directory containing .n6q scripts."
                        },
                        port: {
                            type: "number",
                            description: "Port to run the server on (e.g. 2823)."
                        },
                        configPath: {
                            type: "string",
                            description: "Optional path to a nexus.config.json file for database configuration."
                        }
                    },
                    required: ["directoryPath", "port"]
                }
            }
        ]
    };
});
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const toolName = request.params.name;
    const args = request.params.arguments || {};
    try {
        if (toolName === "nexusq_docs") {
            const { stdout, stderr } = await execAsync(`"${NEXUSQ_BIN}" --docs`);
            return { content: [{ type: "text", text: stdout || stderr }] };
        }
        else if (toolName === "nexusq_examples") {
            const { stdout, stderr } = await execAsync(`"${NEXUSQ_BIN}" --examples`);
            return { content: [{ type: "text", text: stdout || stderr }] };
        }
        else if (toolName === "nexusq_version") {
            const { stdout, stderr } = await execAsync(`"${NEXUSQ_BIN}" --version`);
            return { content: [{ type: "text", text: stdout || stderr }] };
        }
        else if (toolName === "nexusq_compile") {
            const targetPath = args.targetPath;
            try {
                const { stdout, stderr } = await execAsync(`"${NEXUSQ_BIN}" compile "${targetPath}"`);
                return { content: [{ type: "text", text: stdout || stderr }] };
            }
            catch (e) {
                return { content: [{ type: "text", text: `Compilation Error:\n${e.message}\n\nStdout: ${e.stdout}\nStderr: ${e.stderr}` }], isError: true };
            }
        }
        else if (toolName === "nexusq_run") {
            const scriptPath = args.scriptPath;
            const payloadJson = args.payloadJson;
            const configPath = args.configPath;
            let cmd = `"${NEXUSQ_BIN}" run "${scriptPath}"`;
            let payloadFile = null;
            if (payloadJson) {
                payloadFile = path.join(os.tmpdir(), `payload_${Date.now()}.json`);
                await fs.writeFile(payloadFile, payloadJson, "utf8");
                cmd += ` --payload-file "${payloadFile}"`;
            }
            if (configPath) {
                cmd += ` --config "${configPath}"`;
            }
            try {
                const { stdout, stderr } = await execAsync(cmd);
                return { content: [{ type: "text", text: stdout || stderr }] };
            }
            catch (e) {
                return { content: [{ type: "text", text: `Execution Error:\n${e.message}\n\nStdout: ${e.stdout}\nStderr: ${e.stderr}` }], isError: true };
            }
            finally {
                // Cleanup temp payload file if it was created
                if (payloadFile) {
                    try {
                        await fs.unlink(payloadFile);
                    }
                    catch (_) { }
                }
            }
        }
        else if (toolName === "nexusq_serve") {
            const directoryPath = args.directoryPath;
            const port = args.port;
            const configPath = args.configPath;
            let cmd = `"${NEXUSQ_BIN}" serve "${directoryPath}" --port ${port}`;
            if (configPath) {
                cmd += ` --config "${configPath}"`;
            }
            try {
                // Warning: Since 'serve' starts a long-running web server, this command will block 
                // until the server is killed. We'll return a message that it has started, but MCP 
                // typically expects tools to return. We can wrap it to run in background or just start it.
                // For MCP context, maybe we just spawn it detached, or run it normally if it's meant to be long-running.
                exec(cmd); // Spawn and don't await to let MCP return immediately.
                return { content: [{ type: "text", text: `Started Nexus-Q server on port ${port} serving directory ${directoryPath}` }] };
            }
            catch (e) {
                return { content: [{ type: "text", text: `Execution Error:\n${e.message}` }], isError: true };
            }
        }
        return {
            content: [{ type: "text", text: `Unknown tool: ${toolName}` }],
            isError: true,
        };
    }
    catch (error) {
        return {
            content: [{ type: "text", text: `Server error: ${error.message}` }],
            isError: true,
        };
    }
});
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Nexus-Q MCP Server running on stdio");
}
main().catch((err) => {
    console.error("Failed to start server", err);
    process.exit(1);
});
