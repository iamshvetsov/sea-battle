import React, { useMemo, useState, ReactElement } from 'react';
import { BelongsTo, Ships, ShipsSet, CellArgs, GeneratedCoords } from '../types';
import { generateCoords, generateShipsLayout } from './helpers';
import { Grid } from './Grid';
import css from './SeaBattle.css';

export const SeaBattleApp = (): ReactElement => {
    const size: number = 300;
    const cellCount: number = 10;
    const cellSize: number = useMemo(() => size / cellCount, [size, cellCount]);
    const shipsSet: ShipsSet[] = [
        { type: Ships.Battleship, size: 4, quantity: 1 },
        { type: Ships.Cruiser, size: 3, quantity: 2 },
        { type: Ships.Destroyer, size: 2, quantity: 3 },
        { type: Ships.Submarine, size: 1, quantity: 4 }
    ];

    const [coords] = useState<GeneratedCoords>(generateCoords(cellCount));
    const [yoursShips, setYoursShips] = useState<CellArgs[][]>(generateShipsLayout({ shipsSet, cellCount }));
    const [theirsShips, setTheirsShips] = useState<CellArgs[][]>(generateShipsLayout({ shipsSet, cellCount }));
    const [gameIsStarted, setGameIsStarted] = useState<boolean>(false);
    const [gameIsFinished, setGameIsFinished] = useState<boolean>(false);

    const generateYoursShips = (): void => setYoursShips(generateShipsLayout({ shipsSet, cellCount }));

    const startGame = (): void => {
        if (gameIsFinished) {
            setGameIsFinished((prevGameIsFinished) => !prevGameIsFinished);
            setTheirsShips(generateShipsLayout({ shipsSet, cellCount }));
        }

        setGameIsStarted((prevGameIsStarted) => !prevGameIsStarted);
    };

    const finishGame = (): void => {
        setGameIsFinished((prevGameIsFinished) => !prevGameIsFinished);
        setGameIsStarted((prevGameIsStarted) => !prevGameIsStarted);
    };

    return <div className={css.seaBattleApp}>
        <div className={css.seaBattleGrid}>
            <Grid
                belongsTo={BelongsTo.Yours}
                size={size}
                cellCount={cellCount}
                cellSize={cellSize}
                coords={coords}
                ships={yoursShips}
                finishGame={finishGame}
                gameIsFinished={gameIsFinished}
            />
            {!gameIsStarted && <span className={css.generateBtnLabel} onClick={generateYoursShips}>
                Generate ships layout
            </span>}
            {!gameIsStarted && <span className={css.startGameBtnLabel} onClick={startGame}>
                {gameIsFinished ? 'Start new game' : 'Start game'}
            </span>}
        </div>
        {(gameIsStarted || gameIsFinished) && <Grid
            belongsTo={BelongsTo.Theirs}
            size={size}
            cellCount={cellCount}
            cellSize={cellSize}
            coords={coords}
            ships={theirsShips}
            finishGame={finishGame}
            gameIsFinished={gameIsFinished}
        />}
    </div>;
};
