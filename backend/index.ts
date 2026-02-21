import { createServer } from "./src/api/server";

const PORT = Number(process.env.PORT ?? 3001);
const server = createServer(PORT);

console.log(`Cortex API Server running on :${PORT}`);
console.log(`  REST: http://localhost:${PORT}/api`);
console.log(`  WebSocket: ws://localhost:${PORT}/ws`);
console.log(`  Health: http://localhost:${PORT}/health`);
