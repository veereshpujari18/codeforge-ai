import { io, Socket } from 'socket.io-client';
import { SystemMetrics, AISuggestion } from '../types';

class SocketService {
  private socket: Socket | null = null;
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private readonly maxReconnectAttempts: number = 5;

  public initialize(serverUrl?: string): Socket {
    if (this.socket) {
      return this.socket;
    }

    const url = serverUrl || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');

    this.socket = io(url, {
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    this.socket.on('connect', () => {
      this.isConnected = true;
      this.reconnectAttempts = 0;
      console.log('⚡ [Socket] Connected to CodeForge WebSocket server:', this.socket?.id);
    });

    this.socket.on('disconnect', (reason) => {
      this.isConnected = false;
      console.warn('⚠️ [Socket] Disconnected from server:', reason);
    });

    this.socket.on('connect_error', (error) => {
      this.reconnectAttempts++;
      console.warn(`⚠️ [Socket] Connection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} failed:`, error.message);
    });

    return this.socket;
  }

  public getSocket(): Socket | null {
    return this.socket;
  }

  public getIsConnected(): boolean {
    return this.isConnected;
  }

  public emitCodeUpdate(fileId: string, content: string, cursor?: { line: number; column: number }) {
    if (this.socket && this.isConnected) {
      this.socket.emit('code:update', { fileId, content, cursor });
    }
  }

  public emitMetricsUpdate(metrics: SystemMetrics) {
    if (this.socket && this.isConnected) {
      this.socket.emit('metrics:update', metrics);
    }
  }

  public emitAgentAction(agentId: string, action: string, taskId?: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('agent:action', { agentId, action, taskId });
    }
  }

  public onCodeUpdate(callback: (payload: { fileId: string; content: string; cursor?: { line: number; column: number } }) => void) {
    if (!this.socket) return () => {};
    this.socket.on('code:update', callback);
    return () => {
      this.socket?.off('code:update', callback);
    };
  }

  public onMetricsUpdate(callback: (metrics: SystemMetrics) => void) {
    if (!this.socket) return () => {};
    this.socket.on('metrics:update', callback);
    return () => {
      this.socket?.off('metrics:update', callback);
    };
  }

  public onSuggestions(callback: (payload: { fileId: string; suggestions: AISuggestion[] }) => void) {
    if (!this.socket) return () => {};
    this.socket.on('ai:suggestions', callback);
    return () => {
      this.socket?.off('ai:suggestions', callback);
    };
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }
}

export const socketService = new SocketService();
