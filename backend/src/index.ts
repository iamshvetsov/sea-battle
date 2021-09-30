import { createServer, Server as ServerType } from 'http';
import { MongoClient, Db, MongoError, Document } from 'mongodb';
import { Server, Socket } from 'socket.io';
import { CellArgs } from './types';

const server: ServerType = createServer();
let db: Db = null;
const io: Server = new Server(server, { cors: { origin: 'http://localhost:8080' } });

io.on('connect', (socket: Socket) => {
    socket.on('disconnect', async () => {
        socket.leave('game');
        await db.collection('players').deleteOne({ player: socket.id });

        if (io.sockets.adapter.rooms.get('game')) {
            const anotherPlayerId: string = io.sockets.adapter.rooms.get('game').values().next().value;

            io.to(anotherPlayerId).emit('another-player-leave-game');
        }
    });

    socket.on('player-finish-game', () => {
        io.to('game').emit('game-is-finished');
    });

    socket.on('player-start-game', async (ships: CellArgs[][]) => {
        socket.join('game');
        await db.collection('players').updateOne({ player: socket.id }, { $set: { ships } }, { upsert: true });

        if (io.sockets.adapter.rooms.get('game').size === 2) {
            const playerIds: string[] = Array.from(io.sockets.adapter.rooms.get('game'));

            playerIds.forEach(async (playerId: string) => {
                const anotherPlayerId: string = playerIds.find(
                    (anotherPlayerId: string) => anotherPlayerId !== playerId
                );
                const anotherPlayer: Document = await db.collection('players').findOne({ player: anotherPlayerId });

                io.to(playerId).emit('another-player-is-ready', anotherPlayer.ships);
            });

            io.to(playerIds[0]).emit('set-active-player', playerIds[0]);
        }
    });

    socket.on('player-did-step', (cell: CellArgs) => {
        const playerIds: string[] = Array.from(io.sockets.adapter.rooms.get('game'));
        const anotherPlayerId: string = playerIds.find((anotherPlayerId: string) => anotherPlayerId !== socket.id);

        io.to(anotherPlayerId).emit('another-player-did-step', cell);
    });

    socket.on('changeover-active-player', () => {
        const playerIds: string[] = Array.from(io.sockets.adapter.rooms.get('game'));
        const anotherPlayerId: string = playerIds.find((anotherPlayerId: string) => anotherPlayerId !== socket.id);

        io.to(socket.id).emit('set-active-player', null);
        io.to(anotherPlayerId).emit('set-active-player', anotherPlayerId);
    });
});

MongoClient.connect('mongodb://database:27017', (err: MongoError, client: MongoClient) => {
    if (err) throw err;

    db = client.db();
    server.listen(3000);
});
