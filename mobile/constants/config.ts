const LOCAL_IP = "192.168.29.196";

export const API_BASE = __DEV__
  ? `http://${LOCAL_IP}:3001`
  : "https://api.cortex.app";

export const WS_URL = __DEV__
  ? `ws://${LOCAL_IP}:3001/ws`
  : "wss://api.cortex.app/ws";
