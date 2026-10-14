import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();
app.use(express.json());

const httpServer = createServer(app);

// Socket.io connection handler with CORS (Step 15)
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

// In-memory Redis-compatible metrics & state cache
const redisMetricsStore: Record<string, any> = {};

// Socket.io Event Routing & Room Management (Step 15)
io.on('connection', (socket: Socket) => {
  console.log(`⚡ [SocketServer] Client connected: ${socket.id}`);

  // Default join to active project room
  socket.join('project-room');

  // 1. Room management
  socket.on('room:join', (room: string) => {
    socket.join(room);
    console.log(`[SocketServer] ${socket.id} joined room: ${room}`);
  });

  socket.on('room:leave', (room: string) => {
    socket.leave(room);
    console.log(`[SocketServer] ${socket.id} left room: ${room}`);
  });

  // 2. Code update routing (Step 15)
  socket.on('code:update', (payload: { fileId: string; content: string; cursor?: any }) => {
    // Broadcast to other peers in room
    socket.to('project-room').emit('code:update', payload);

    // Trigger speculative AI suggestion generation
    if (payload.content.length > 20) {
      setTimeout(() => {
        socket.emit('ai:suggestions', {
          fileId: payload.fileId,
          suggestions: [
            {
              id: `gen-${Date.now()}`,
              label: 'Auto-Vectorize Loop Pass',
              description: 'Generated SIMD unroll pass matching AVX2 cacheline constraints.',
              confidence: 96.8,
              code: '// SIMD vectorized pass auto-synthesized by server agent\n#pragma omp simd'
            }
          ]
        });
      }, 500);
    }
  });

  // 3. Metrics storage in Redis mock (Step 15)
  socket.on('metrics:update', (metrics: any) => {
    redisMetricsStore[socket.id] = { ...metrics, updatedAt: Date.now() };
    socket.to('project-room').emit('metrics:update', metrics);
  });

  // 4. Agent action routing (Step 15)
  socket.on('agent:action', (payload: { agentId: string; action: string; taskId?: string }) => {
    console.log(`[SocketServer] Agent ${payload.agentId} action: ${payload.action}`);
    io.to('project-room').emit('agent:action', {
      ...payload,
      timestamp: Date.now(),
      status: 'acknowledged'
    });
  });

  socket.on('disconnect', (reason) => {
    delete redisMetricsStore[socket.id];
    console.log(`[SocketServer] Client disconnected (${socket.id}): ${reason}`);
  });
});

// REST Health API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    activeSockets: io.engine.clientsCount,
    timestamp: Date.now(),
  });
});

// In dev environment, mount Vite middlewares if run directly
async function startServer() {
  const PORT = process.env.PORT || 3000;

  if (process.env.NODE_ENV !== 'production') {
    try {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } catch (e) {
      console.log('Serving without Vite middlewareMode');
    }
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
  }

  httpServer.listen(PORT, () => {
    console.log(`🚀 CodeForge AI Server listening on port ${PORT}`);
  });
}

// Only start when invoked as main entry
if (process.argv[1]?.endsWith('server.ts') || process.argv[1]?.endsWith('server.js')) {
  startServer();
}

export default app;
