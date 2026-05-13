# Nexus-Q MCP Server

An official Model Context Protocol (MCP) server for the **Nexus-Q** compiler and ecosystem.

This server allows AI agents (like Claude Desktop, Cursor, and Roo Code) to interact natively with the Nexus-Q compiler. It empowers the AI to read the official language documentation, fetch code examples, evaluate code on the fly, and even spawn the Nexus-Q Web Host for testing REST APIs.

## Features / Tools

- `nexusq_docs`: Fetches the official AI-optimized Nexus-Q manual.
- `nexusq_examples`: Retrieves official implementation patterns and examples.
- `nexusq_run`: Executes a Nexus-Q `.n6q` script locally. Supports injecting a JSON payload and custom database configurations.
- `nexusq_serve`: Starts the Nexus-Q Quantum Web Host to serve a directory of microservices as a RESTful API.

## Installation for Claude Desktop / Cursor

You don't need to download anything manually. You can run this MCP directly from GitHub using `npx`. Add the following to your MCP configuration file (e.g. `claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "nexusq": {
      "command": "npx",
      "args": [
        "-y",
        "github:YOUR_GITHUB_USERNAME/nexusq-mcp"
      ]
    }
  }
}
```

*Note: The server comes pre-bundled with the Windows `nexusq.exe` compiler.*

## License

Copyright © 2026 NEXUS-Q Project. All rights reserved.
