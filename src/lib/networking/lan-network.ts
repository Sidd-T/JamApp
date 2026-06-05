import type { JamNetworkMessage, JamRoom } from '@/features/jams/jams-types';
import dgram from 'react-native-udp';
import Zeroconf from 'react-native-zeroconf';

export type LanDiscoveredRoom = {
  roomCode: string;
  hostName: string;
  address: string;
  port: number;
  serviceName: string;
};

export type JamNetwork = {
  startDiscovery: (onRoomFound: (room: LanDiscoveredRoom) => void) => Promise<void>;
  stopDiscovery: () => Promise<void>;
  advertise: (room: JamRoom) => Promise<void>;
  stopAdvertising: () => Promise<void>;
  connectToRoom: (room: LanDiscoveredRoom) => Promise<void>;
  send: (message: JamNetworkMessage) => Promise<void>;
  closeConnection: () => Promise<void>;
  onMessage: (handler: (message: JamNetworkMessage) => void) => () => void;
};

const SERVICE_TYPE = 'flashjams';
const SERVICE_PROTOCOL = 'udp';
const SERVICE_DOMAIN = 'local.';
const SERVICE_PORT = 54321;
const MESSAGE_TERMINATOR = '\n';

function parseService(service: any): LanDiscoveredRoom | null {
  const txtRecord = service.txtRecord ?? service.txtRecords ?? {};
  const roomCode = typeof txtRecord.roomCode === 'string' ? txtRecord.roomCode : '';
  const hostName = typeof txtRecord.hostName === 'string' ? txtRecord.hostName : String(service.name ?? 'Jam Host');
  const port = typeof service.port === 'number' ? service.port : SERVICE_PORT;
  const address = Array.isArray(service.addresses) && service.addresses.length > 0
    ? service.addresses[0]
    : service.host ?? '';

  if (!roomCode || !address) {
    return null;
  }

  return {
    roomCode,
    hostName,
    address,
    port,
    serviceName: String(service.name ?? roomCode),
  };
}

function decodeUdpPayload(rawData: unknown): string {
  if (typeof rawData === 'string') {
    return rawData;
  }

  if (rawData instanceof Uint8Array) {
    try {
      return new TextDecoder('utf-8').decode(rawData);
    }
    catch {
      return Array.prototype.map.call(rawData, (byte: number) => String.fromCharCode(byte)).join('');
    }
  }

  if (rawData instanceof ArrayBuffer) {
    try {
      return new TextDecoder('utf-8').decode(new Uint8Array(rawData));
    }
    catch {
      return Array.prototype.map.call(new Uint8Array(rawData), (byte: number) => String.fromCharCode(byte)).join('');
    }
  }

  return String(rawData);
}

function parseUdpMessages(rawData: unknown): JamNetworkMessage[] {
  const stringData = decodeUdpPayload(rawData);
  const segments = stringData.split(MESSAGE_TERMINATOR).filter(Boolean);
  const messages: JamNetworkMessage[] = [];

  for (const segment of segments) {
    try {
      messages.push(JSON.parse(segment) as JamNetworkMessage);
    }
    catch {
      continue;
    }
  }

  return messages;
}

function createLanJamNetwork(): JamNetwork {
  const zeroconf = new Zeroconf();
  let discoveryCallback: ((room: LanDiscoveredRoom) => void) | null = null;
  let messageHandler: ((message: JamNetworkMessage) => void) | null = null;
  let socket: any = null;
  let advertisedRoom: JamRoom | null = null;
  let connectedPeer: { address: string; port: number } | null = null;
  let clientPeers: Array<{ address: string; port: number }> = [];

  const handleSocketMessage = (message: unknown, rinfo: any) => {
    const parsedMessages = parseUdpMessages(message);
    if (!parsedMessages.length) {
      return;
    }

    if (advertisedRoom && rinfo?.address && typeof rinfo.port === 'number') {
      addClientPeer(rinfo.address, rinfo.port);
    }
    parsedMessages.forEach(parsed => messageHandler?.(parsed));
  };

  const addClientPeer = (address: string, port: number) => {
    const exists = clientPeers.some(peer => peer.address === address && peer.port === port);
    if (!exists) {
      clientPeers.push({ address, port });
    }
  };

  const closeSocket = async () => {
    if (!socket) {
      return;
    }

    try {
      socket.close?.();
    }
    catch (error) {
      console.warn('Failed to close UDP socket:', error);
    }

    socket = null;
    connectedPeer = null;
    clientPeers = [];
  };

  const createSocket = async (port: number) => {
    if (socket) {
      return;
    }

    try {
      socket = dgram.createSocket({ type: 'udp4', debug: false });
    }
    catch (err) {
      console.warn('Failed to construct UDP socket (native module missing?):', err);
      socket = null;
      return;
    }

    socket.on('error', (error: unknown) => {
      console.warn('UDP socket error:', error);
    });

    socket.on('message', (message: unknown, rinfo: any) => {
      handleSocketMessage(message, rinfo);
    });

    await new Promise<void>((resolve, reject) => {
      try {
        socket.bind(port, '0.0.0.0', () => {
          resolve();
        });
      }
      catch (error) {
        reject(error);
      }
    });
  };

  return {
    async startDiscovery(onRoomFound) {
      discoveryCallback = onRoomFound;
      zeroconf.removeAllListeners?.();

      zeroconf.on('resolved', (service) => {
        const room = parseService(service);
        if (room) {
          discoveryCallback?.(room);
        }
      });

      zeroconf.on('error', (error) => {
        console.warn('Zeroconf discovery error:', error);
      });

      zeroconf.scan(SERVICE_TYPE, SERVICE_PROTOCOL, SERVICE_DOMAIN);
    },

    async stopDiscovery() {
      discoveryCallback = null;
      zeroconf.stop();
    },

    async advertise(room) {
      advertisedRoom = room;
      await createSocket(SERVICE_PORT);

      if (!socket) {
        // UDP not available; clear advertisedRoom and log a warning but don't throw.
        // Hosts can still operate locally without LAN advertising.
        console.warn('UDP socket unavailable; skipping LAN advertisement. Host will run locally only.');
        advertisedRoom = null;
        return;
      }

      return new Promise<void>((resolve, reject) => {
        try {
          zeroconf.publishService(SERVICE_TYPE, SERVICE_PROTOCOL, SERVICE_DOMAIN, room.name, SERVICE_PORT, {
            roomCode: room.roomCode,
            hostName: room.hostName,
          });
          resolve();
        }
        catch (error) {
          console.warn('Zeroconf publishService error:', error);
          reject(error);
        }
      });
    },

    async stopAdvertising() {
      if (advertisedRoom) {
        try {
          zeroconf.unpublishService(advertisedRoom.name);
        }
        catch (error) {
          console.warn('Zeroconf unpublishService error:', error);
        }
      }

      advertisedRoom = null;
      zeroconf.stop();
      await closeSocket();
    },

    async connectToRoom(room) {
      await closeSocket();
      await createSocket(0);
      connectedPeer = { address: room.address, port: room.port };
    },

    async send(message) {
      if (!socket) {
        console.warn('UDP socket is not initialized for sending');
        return;
      }

      const payload = `${JSON.stringify(message)}${MESSAGE_TERMINATOR}`;

      if (advertisedRoom) {
        if (!clientPeers.length) {
          return;
        }

        await Promise.all(
          clientPeers.map(
            peer =>
              new Promise<void>((resolve) => {
                socket.send(payload, undefined, undefined, peer.port, peer.address, (error: unknown) => {
                  if (error) {
                    console.warn('Failed to send UDP message to client:', error);
                  }
                  resolve();
                });
              }),
          ),
        );
        return;
      }

      if (connectedPeer) {
        await new Promise<void>((resolve) => {
          socket.send(payload, undefined, undefined, connectedPeer!.port, connectedPeer!.address, (error: unknown) => {
            if (error) {
              console.warn('Failed to send UDP message to host:', error);
            }
            resolve();
          });
        });
      }
    },

    async closeConnection() {
      await closeSocket();
    },

    onMessage(handler) {
      messageHandler = handler;
      return () => {
        if (messageHandler === handler) {
          messageHandler = null;
        }
      };
    },
  };
}

export function createJamNetwork(): JamNetwork {
  return createLanJamNetwork();
}
