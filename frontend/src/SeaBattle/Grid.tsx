import React, { useRef, useState, useEffect, ReactElement, RefObject } from 'react';
import {
    drawCells,
    cellIsEngaged,
    cellSetsIsEqual,
    getEngagedCellsAroundCell,
    getEngagedCellsAroundShip,
    drawShips,
    drawSunkenShips,
    drawPastCells
} from './helpers';
import { BelongsTo, GridProps, CellArgs } from '../types';
import css from './SeaBattle.css';

export const Grid = ({
    belongsTo,
    size,
    cellCount,
    cellSize,
    coords,
    ships,
    finishGame,
    gameIsFinished
}: GridProps): ReactElement => {
    const canvasRef: RefObject<HTMLCanvasElement> = useRef<HTMLCanvasElement | null>(null);
    let context: CanvasRenderingContext2D;

    const [previousShips, setPreviousShips] = useState<CellArgs[][]>(ships);
    const [sunkenShips, setSunkenShips] = useState<CellArgs[]>([]);
    const [pastCells, setPastCells] = useState<CellArgs[]>([]);

    useEffect(() => {
        context = canvasRef.current.getContext('2d');
        context.scale(2, 2); // retina display fix
    }, []);

    useEffect(() => {
        if (belongsTo === BelongsTo.Theirs && !cellSetsIsEqual(ships.flat(), previousShips.flat())) {
            setPreviousShips(ships);
            setSunkenShips([]);
            setPastCells([]);
        }

        context = canvasRef.current.getContext('2d');
        drawGrid(context);
        belongsTo === BelongsTo.Theirs && !gameIsFinished && canvasRef.current.addEventListener('click', clickHandler);

        return () => canvasRef.current.removeEventListener('click', clickHandler);
    }, [gameIsFinished, ships, sunkenShips, pastCells]);

    const clickHandler = ({ layerX, layerY }: any): void => {
        const cell: CellArgs = {
            x: Math.ceil(layerX / cellSize),
            y: Math.ceil(layerY / cellSize)
        };

        if (cellIsEngaged({ cell, engagedCells: ships.flat() })) {
            const ship: CellArgs[] = ships.find((ship: CellArgs[]) =>
                ship.find(({ x, y }: CellArgs) => cell.x === x && cell.y === y));
            const newSunkenShips: CellArgs[] = [...sunkenShips, cell];
            const engagedCells = ship.every((shipCell: CellArgs) => newSunkenShips.find(
                (sunkenShip: CellArgs) => shipCell.x === sunkenShip.x && shipCell.y === sunkenShip.y))
                    ? getEngagedCellsAroundShip({ ship, engagedCells: [...pastCells, ...ship], cellCount })
                    : getEngagedCellsAroundCell({ cell, engagedCells: pastCells, cellCount });

            setSunkenShips(newSunkenShips);
            setPastCells((prevPastCells) => [...prevPastCells, ...engagedCells]);

            if (cellSetsIsEqual(ships.flat(), newSunkenShips)) {
                finishGame();
            }
        } else {
            setPastCells((prevPastCells) => [...prevPastCells, cell]);
        }
    };

    const drawGrid = (context: CanvasRenderingContext2D): void => {
        context.clearRect(0, 0, size, size);
        drawCells({ context, cellSize, cellCount });
        belongsTo === BelongsTo.Yours && drawShips({ context, cellSize, ships });
        drawSunkenShips({ context, cellSize, sunkenShips });
        drawPastCells({ context, cellSize, pastCells });
    };

    return <div className={css.grid}>
        <div className={css.letterCoords}>
            {coords.letterCoords.map((letter: string) => (
                <span key={letter} className={css.letterCoord}>
                    {letter}
                </span>
            ))}
        </div>
        <div className={css.numberCoords}>
            {coords.numberCoords.map((number: number) => (
                <span key={number} className={css.numberCoord}>
                    {number}
                </span>
            ))}
        </div>
        <canvas
            ref={canvasRef}
            className={`${css.canvas} ${belongsTo === BelongsTo.Yours && css.yoursCanvas}`}
            width={size * 2}
            height={size * 2}
        />
    </div>;
};
