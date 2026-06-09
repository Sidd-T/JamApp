import type { JamNetworkMessage, JamRoom } from '@/features/jams/jams-types';
import TcpSocket from 'react-native-tcp-socket';
import Zeroconf from 'react-native-zeroconf';

export type LanDiscoveredRoom = {
  roomCode: string;
  hostName: string;
  address: string;
  port: number;
  serviceName: string;
};

export type JamNetwork = {
  startDiscovery: (
    onRoomFound: (room: LanDiscoveredRoom) => void,
  ) => Promise<void>;
  stopDiscovery: () => Promise<void>;
  advertise: (room: JamRoom) => Promise<void>;
  stopAdvertising: () => Promise<void>;
  connectToRoom: (room: LanDiscoveredRoom) => Promise<void>;
  send: (message: JamNetworkMessage) => Promise<void>;
  closeConnection: () => Promise<void>;
  onMessage: (
    handler: (message: JamNetworkMessage) => void,
  ) => () => void;
};

const SERVICE_TYPE = 'flashjams';
const SERVICE_PROTOCOL = 'tcp';
const SERVICE_DOMAIN = 'local.';
const SERVICE_PORT = 54321;
const MESSAGE_TERMINATOR = '\n';

function parseService(service: any): LanDiscoveredRoom | null {
  console.log('[JamNetwork] parseService: raw service:', JSON.stringify(service));

  const txtRecord
    = service.txtRecord
      ?? service.txtRecords
      ?? service.txt
      ?? {};

  const roomCode
    = typeof txtRecord.roomCode === 'string'
      ? txtRecord.roomCode
      : '';

  const hostName
    = typeof txtRecord.hostName === 'string'
      ? txtRecord.hostName
      : String(service.name ?? 'Jam Host');

  const port
    = typeof service.port === 'number'
      ? service.port
      : SERVICE_PORT;

  const address
    = Array.isArray(service.addresses)
      && service.addresses.length > 0
      ? service.addresses[0]
      : service.host ?? '';

  if (!roomCode || !address) {
    console.warn('[JamNetwork] parseService: missing roomCode or address — skipping. roomCode:', roomCode, 'address:', address);
    return null;
  }

  const room: LanDiscoveredRoom = {
    roomCode,
    hostName,
    address,
    port,
    serviceName: String(service.name ?? roomCode),
  };

  console.log('[JamNetwork] parseService: parsed room:', room);
  return room;
}

function decodePayload(rawData: unknown): string {
  if (typeof rawData === 'string') {
    return rawData;
  }

  if (rawData instanceof Uint8Array) {
    console.log('[JamNetwork] decodePayload: decoding Uint8Array of length', rawData.length);
    try {
      return new TextDecoder('utf-8').decode(rawData);
    }
    catch {
      return Array.prototype.map
        .call(rawData, (byte: number) => String.fromCharCode(byte))
        .join('');
    }
  }

  if (rawData instanceof ArrayBuffer) {
    console.log('[JamNetwork] decodePayload: decoding ArrayBuffer of byteLength', rawData.byteLength);
    try {
      return new TextDecoder('utf-8').decode(new Uint8Array(rawData));
    }
    catch {
      return Array.prototype.map
        .call(new Uint8Array(rawData), (byte: number) => String.fromCharCode(byte))
        .join('');
    }
  }

  console.warn('[JamNetwork] decodePayload: unexpected data type:', typeof rawData, '— falling back to String()');
  return String(rawData);
}

function attachMessageParser(
  socket: any,
  onMessage: (message: JamNetworkMessage) => void,
) {
  let buffer = '';

  socket.on('data', (data: unknown) => {
    const chunk = decodePayload(data);
    console.log('[JamNetwork] attachMessageParser: received chunk of length', chunk.length);
    buffer += chunk;

    let terminatorIndex = buffer.indexOf(MESSAGE_TERMINATOR);

    while (terminatorIndex !== -1) {
      const rawMessage = buffer.slice(0, terminatorIndex);
      buffer = buffer.slice(terminatorIndex + MESSAGE_TERMINATOR.length);

      console.log('[JamNetwork] attachMessageParser: parsing message:', rawMessage);

      try {
        const parsed = JSON.parse(rawMessage) as JamNetworkMessage;
        console.log('[JamNetwork] attachMessageParser: dispatching message type:', (parsed as any)?.type);
        onMessage(parsed);
      }
      catch (e) {
        console.warn('[JamNetwork] attachMessageParser: failed to parse message:', rawMessage, 'error:', e);
      }

      terminatorIndex = buffer.indexOf(MESSAGE_TERMINATOR);
    }

    if (buffer.length > 0) {
      console.log('[JamNetwork] attachMessageParser: partial buffer waiting for terminator, length:', buffer.length);
    }
  });
}

function createLanJamNetwork(): JamNetwork {
  console.log('[JamNetwork] createLanJamNetwork: initializing');

  const zeroconf = new Zeroconf();

  let discoveryCallback: ((room: LanDiscoveredRoom) => void) | null = null;
  let messageHandler: ((message: JamNetworkMessage) => void) | null = null;
  let advertisedRoom: JamRoom | null = null;
  let server: any = null;
  let clientSocket: any = null;
  let clientSockets: any[] = [];

  const closeSockets = async () => {
    console.log('[JamNetwork] closeSockets: closing client socket, clientSockets count:', clientSockets.length, ', server:', !!server);

    try {
      clientSocket?.destroy?.();
    }
    catch (error) {
      console.warn('[JamNetwork] closeSockets: failed to destroy client socket:', error);
    }

    for (const socket of clientSockets) {
      try {
        socket.destroy?.();
      }
      catch {}
    }

    if (server) {
      try {
        await new Promise<void>((resolve) => {
          server.close((error: unknown) => {
            if (error) {
              console.warn('[JamNetwork] closeSockets: failed to close TCP server:', error);
            }
            resolve();
          });
        });
      }
      catch (error) {
        console.warn('[JamNetwork] closeSockets: failed to close TCP server:', error);
      }
    }

    clientSocket = null;
    clientSockets = [];
    server = null;
    console.log('[JamNetwork] closeSockets: done');
  };

  const createServer = async (port: number) => {
    if (server) {
      console.log('[JamNetwork] createServer: server already running on port', port, '— skipping');
      return;
    }

    console.log('[JamNetwork] createServer: starting TCP server on port', port);

    server = TcpSocket.createServer((socket: any) => {
      console.log('[JamNetwork] createServer: new client connected, total clients:', clientSockets.length + 1);
      clientSockets.push(socket);

      attachMessageParser(socket, (message) => {
        messageHandler?.(message);
      });

      socket.on('close', () => {
        console.log('[JamNetwork] createServer: client disconnected, remaining clients:', clientSockets.length - 1);
        clientSockets = clientSockets.filter(client => client !== socket);
      });

      socket.on('error', (error: unknown) => {
        console.warn('[JamNetwork] createServer: client socket error:', error);
      });
    });

    await new Promise<void>((resolve, reject) => {
      server.on('error', (error: unknown) => {
        console.error('[JamNetwork] createServer: server error:', error);
        reject(error);
      });

      server.listen({ host: '0.0.0.0', port }, () => {
        console.log('[JamNetwork] createServer: TCP server listening on port', port);
        resolve();
      });
    });
  };

  return {
    async startDiscovery(onRoomFound) {
      console.log('[JamNetwork] startDiscovery: scanning for', SERVICE_TYPE, 'services');
      discoveryCallback = onRoomFound;

      zeroconf.removeAllListeners?.();

      zeroconf.on('resolved', (service) => {
        console.log('[JamNetwork] startDiscovery: resolved service:', service?.name);
        const room = parseService(service);

        if (room) {
          console.log('[JamNetwork] startDiscovery: found room:', room.roomCode, 'at', room.address, ':', room.port);
          discoveryCallback?.(room);
        }
      });

      zeroconf.on('error', (error) => {
        console.warn('[JamNetwork] startDiscovery: zeroconf error:', error);
      });

      zeroconf.scan(SERVICE_TYPE, SERVICE_PROTOCOL, SERVICE_DOMAIN);
    },

    async stopDiscovery() {
      console.log('[JamNetwork] stopDiscovery: stopping scan');
      discoveryCallback = null;
      zeroconf.stop();
      zeroconf.removeAllListeners?.();
    },

    async advertise(room) {
      // Unpublish any previously advertised service first
      if (advertisedRoom) {
        try {
          zeroconf.unpublishService(advertisedRoom.name);
        }
        catch {}
      }

      console.log('[JamNetwork] advertise: advertising room:', room.roomCode, 'name:', room.name);
      advertisedRoom = room;

      await createServer(SERVICE_PORT);

      if (!server) {
        console.warn('[JamNetwork] advertise: TCP server unavailable — skipping LAN advertisement');
        advertisedRoom = null;
        return;
      }

      return new Promise<void>((resolve, reject) => {
        try {
          zeroconf.publishService(
            SERVICE_TYPE,
            SERVICE_PROTOCOL,
            SERVICE_DOMAIN,
            room.name,
            SERVICE_PORT,
            { roomCode: room.roomCode, hostName: room.hostName },
          );

          console.log('[JamNetwork] advertise: service published for room:', room.roomCode);
          resolve();
        }
        catch (error) {
          console.warn('[JamNetwork] advertise: publishService error:', error);
          reject(error);
        }
      });
    },

    async stopAdvertising() {
      console.log('[JamNetwork] stopAdvertising: stopping advertisement for room:', advertisedRoom?.roomCode ?? 'none');

      if (advertisedRoom) {
        try {
          zeroconf.unpublishService(advertisedRoom.name);
          console.log('[JamNetwork] stopAdvertising: unpublished service:', advertisedRoom.name);
        }
        catch (error) {
          console.warn('[JamNetwork] stopAdvertising: unpublishService error:', error);
        }
      }

      advertisedRoom = null;
      zeroconf.stop();
      await closeSockets();
      console.log('[JamNetwork] stopAdvertising: done');
    },

    async connectToRoom(room) {
      console.log('[JamNetwork] connectToRoom: connecting to', room.roomCode, 'at', room.address, ':', room.port);
      await closeSockets();

      await new Promise<void>((resolve, reject) => {
        clientSocket = TcpSocket.createConnection(
          { host: room.address, port: room.port },
          () => {
            console.log('[JamNetwork] connectToRoom: connected to', room.address, ':', room.port);
            resolve();
          },
        );

        clientSocket.once('error', (err: unknown) => {
          console.error('[JamNetwork] connectToRoom: connection error:', err);
          reject(err);
        });

        attachMessageParser(clientSocket, (message) => {
          messageHandler?.(message);
        });

        clientSocket.on('error', (error: unknown) => {
          console.warn('[JamNetwork] connectToRoom: socket error after connect:', error);
        });
      });
    },

    async send(message) {
      const payload = `${JSON.stringify(message)}${MESSAGE_TERMINATOR}`;

      if (advertisedRoom) {
        console.log('[JamNetwork] send: broadcasting to', clientSockets.length, 'client(s), message type:', (message as any)?.type);

        if (!clientSockets.length) {
          console.warn('[JamNetwork] send: no clients connected — message dropped');
          return;
        }

        await Promise.all(
          clientSockets.map(
            socket =>
              new Promise<void>((resolve) => {
                try {
                  socket.write(payload);
                }
                catch (error) {
                  console.warn('[JamNetwork] send: failed to write to client socket:', error);
                }
                resolve();
              }),
          ),
        );

        return;
      }

      if (clientSocket) {
        console.log('[JamNetwork] send: sending to host, message type:', (message as any)?.type);
        try {
          clientSocket.write(payload);
        }
        catch (error) {
          console.warn('[JamNetwork] send: failed to write to host socket:', error);
        }
      }
      else {
        console.warn('[JamNetwork] send: no socket available — message dropped');
      }
    },

    async closeConnection() {
      console.log('[JamNetwork] closeConnection: closing all connections');
      await closeSockets();
    },

    onMessage(handler) {
      console.log('[JamNetwork] onMessage: registering message handler');
      messageHandler = handler;

      return () => {
        console.log('[JamNetwork] onMessage: unregistering message handler');
        if (messageHandler === handler) {
          messageHandler = null;
        }
      };
    },
  };
}

export function createJamNetwork(): JamNetwork {
  console.log('[JamNetwork] createJamNetwork: creating LAN network');
  return createLanJamNetwork();
}
