import React, { useMemo, useState, useEffect, ReactElement } from 'react';
import { io, Socket } from 'socket.io-client';
import { generateCoords, generateShipsLayout } from './helpers';
import { BelongsTo, Ships, ShipsSet, CellArgs, GeneratedCoords } from '../types';
import { Grid } from './Grid';
import css from './SeaBattle.css';

export const SeaBattleApp = (): ReactElement => {
    const socket: Socket = useMemo(() => io('http://localhost:3000'), []);

    const size: number = 300;
    const cellCount: number = 10;
    const cellSize: number = useMemo(() => size / cellCount, [size, cellCount]);
    const shipsSet: ShipsSet[] = [
        { type: Ships.Battleship, size: 4, quantity: 1 },
        { type: Ships.Cruiser, size: 3, quantity: 2 },
        { type: Ships.Destroyer, size: 2, quantity: 3 },
        { type: Ships.Submarine, size: 1, quantity: 4 }
    ];
    const coords: GeneratedCoords = useMemo(() => generateCoords(cellCount), []);

    const [activePlayer, setActivePlayer] = useState<string>(null);
    const [yoursShips, setYoursShips] = useState<CellArgs[][]>(generateShipsLayout({ shipsSet, cellCount }));
    const [theirsShips, setTheirsShips] = useState<CellArgs[][]>([]);
    const [gameIsStarted, setGameIsStarted] = useState<boolean>(false);
    const [gameIsFinished, setGameIsFinished] = useState<boolean>(false);

    useEffect(() => {
        socket.on('another-player-is-ready', (theirsShips: CellArgs[][]) => setTheirsShips(theirsShips));
        socket.on('set-active-player', (activePlayer: string) => setActivePlayer(activePlayer));
        socket.on('another-player-leave-game', finishGame);
        socket.on('game-is-finished', finishGame);

        return () => {
            socket.disconnect();
        };
    }, [socket]);

    const generateYoursShips = (): void => setYoursShips(generateShipsLayout({ shipsSet, cellCount }));

    const startGame = async (): Promise<void> => {
        if (gameIsFinished) {
            setGameIsFinished((prevGameIsFinished) => !prevGameIsFinished);
        }

        if (!socket.connected) {
            await socket.connect();
        }

        await socket.emit('player-start-game', yoursShips);
        setGameIsStarted((prevGameIsStarted) => !prevGameIsStarted);
    };

    const finishGame = async (): Promise<void> => {
        await socket.disconnect();
        setGameIsFinished((prevGameIsFinished) => !prevGameIsFinished);
        setGameIsStarted((prevGameIsStarted) => !prevGameIsStarted);
        setTheirsShips([]);
        setActivePlayer(null);
    };

    return <div className={css.seaBattleApp}>
        <div className={css.seaBattleGrid}>
            <Grid
                socket={socket}
                playerIsActive={activePlayer === socket.id}
                belongsTo={BelongsTo.Yours}
                size={size}
                cellCount={cellCount}
                cellSize={cellSize}
                coords={coords}
                ships={yoursShips}
                gameIsFinished={gameIsFinished}
            />
            {!gameIsStarted && (
                <div className={css.gridActionBar}>
                    <span className={css.generateBtnLabel} onClick={generateYoursShips}>
                        Generate ships layout
                    </span>
                    <span className={css.startGameBtnLabel} onClick={startGame}>
                        {gameIsFinished ? 'Start new game' : 'Start game'}
                    </span>
                </div>
            )}
            {gameIsStarted && !theirsShips.length && (
                <div className={css.gridHintBar}>
                    <span className={css.loader} />
                    Waiting for an opponent
                </div>
            )}
        </div>
        {gameIsStarted && Boolean(theirsShips.length) && (
            <Grid
                socket={socket}
                playerIsActive={activePlayer === socket.id}
                belongsTo={BelongsTo.Theirs}
                size={size}
                cellCount={cellCount}
                cellSize={cellSize}
                coords={coords}
                ships={theirsShips}
                gameIsFinished={gameIsFinished}
            />
        )}
    </div>;
};
