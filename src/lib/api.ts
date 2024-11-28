import axios from 'axios';
import { io, Socket } from 'socket.io-client';
import { handleError, createAppError } from './errorHandler';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let socket: Socket | null = null;

const signMessage = async (message: string): Promise<{ signature: string, publicKey: string }> => {
  try {
    const solana = (window as { solana?: { isPhantom?: boolean; signMessage: (message: Uint8Array, encoding: string) => Promise<{ signature: string; publicKey: { toString: () => string } }> } }).solana;
    if (!solana?.isPhantom) {
      throw createAppError('Phantom wallet is not installed', 'WALLET_NOT_FOUND', 'high');
    }

    const encodedMessage = new TextEncoder().encode(message);
    const signedMessage = await solana.signMessage(encodedMessage, 'utf8');
    return {
      signature: signedMessage.signature,
      publicKey: signedMessage.publicKey.toString(),
    };
  } catch (error) {
    console.error('Error signing message:', error);
    throw createAppError('Failed to sign message with wallet', 'SIGNATURE_FAILED', 'high');
  }
};

api.interceptors.request.use(async (config) => {
  const walletAddress = localStorage.getItem('walletAddress');
  if (walletAddress) {
    const message = `Authenticate for Solana Trading Bot: ${Date.now()}`;
    try {
      const { signature, publicKey } = await signMessage(message);
      config.headers['X-Wallet-Address'] = publicKey;
      config.headers['X-Wallet-Signature'] = signature;
      config.headers['X-Wallet-Message'] = message;
    } catch (error) {
      handleError(error);
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          handleError(createAppError('Authentication failed. Please reconnect your wallet.', 'AUTH_FAILED', 'high'));
          // Redirect to login or wallet connection page
          window.location.href = '/login';
          break;
        case 403:
          handleError(createAppError('You do not have permission to perform this action.', 'FORBIDDEN', 'medium'));
          break;
        case 404:
          handleError(createAppError('The requested resource was not found.', 'NOT_FOUND', 'low'));
          break;
        case 500:
          handleError(createAppError('An internal server error occurred. Please try again later.', 'SERVER_ERROR', 'high'));
          break;
        default:
          handleError(createAppError('An unexpected error occurred. Please try again.', 'UNKNOWN_ERROR', 'medium'));
      }
    } else if (error.request) {
      handleError(createAppError('No response received from the server. Please check your internet connection.', 'NO_RESPONSE', 'high'));
    } else {
      handleError(error);
    }
    return Promise.reject(error);
  }
);

export interface TradingStrategy {
  name: string;
  description: string;
  riskLevel: 'low' | 'medium' | 'high';
  parameters: {
    buyCondition: string;
    sellCondition: string;
    stopLoss: number;
    takeProfit: number;
  };
}

export interface UserSettings {
  userId: string;
  profitThreshold: number;
  lossThreshold: number;
  holdingTimer: number;
  slippageTolerance: number;
  maxTradesPerDay: number;
  tradingStrategy: TradingStrategy;
  enableNotifications: boolean;
}

export const register = (walletAddress: string) =>
  api.post('/register', { walletAddress });

export const getUserSettings = () => api.get('/settings');

export const updateUserSettings = (settings: UserSettings) => api.put('/settings', settings);

export const getTrades = () => api.get('/trades');

export const getPerformanceMetrics = () => api.get('/performance');

export const getNotifications = () => api.get('/notifications');

export const getTradingStrategies = () => api.get<TradingStrategy[]>('/trading-strategies');

export const connectWebSocket = async () => {
  if (!socket) {
    const walletAddress = localStorage.getItem('walletAddress');
    if (!walletAddress) {
      throw createAppError('Wallet not connected', 'WALLET_NOT_CONNECTED', 'high');
    }

    const message = `Authenticate for Solana Trading Bot WebSocket: ${Date.now()}`;
    try {
      const { signature, publicKey } = await signMessage(message);

      socket = io(WS_URL, {
        auth: { walletAddress: publicKey, signature, message },
      });

      socket.on('connect', () => {
        console.log('WebSocket connected');
      });

      socket.on('disconnect', () => {
        console.log('WebSocket disconnected');
      });

      socket.on('error', (error) => {
        handleError(createAppError('WebSocket error occurred', 'WEBSOCKET_ERROR', 'medium'));
      });
    } catch (error) {
      handleError(error);
    }
  }

  return socket;
};

export const disconnectWebSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export interface LoginResponse {
  token: string;
  user: {
    walletAddress: string;
  };
}

export const login = async (username: string, password: string): Promise<{ data: LoginResponse }> => {
  return api.post('/auth/login', { username, password });
};

export default api;