import {
    DirectionsOfGeneration,
    ShipsSet,
    CellArgs,
    DrawCellArgs,
    DrawCellsArgs,
    GeneratedCoords,
    CellIsWithinArgs,
    CellIsEngagedArgs,
    GetEngagedCellsAroundCellArgs,
    GetEngagedCellsAroundShipArgs,
    GenerateShipsLayoutArgs,
    DrawShipsArgs,
    DrawSunkenShipsArgs,
    DrawPastCellsArgs
} from '../types';

const drawCell = ({ context, cellSize, x, y }: DrawCellArgs): void => {
    context.strokeStyle = '#aaa';
    context.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
};

export const drawCells = ({ context, cellSize, cellCount }: DrawCellsArgs): void => {
    for (let x: number = 0; x < cellCount; x++) {
        for (let y: number = 0; y < cellCount; y++) {
            drawCell({ context, cellSize, x, y });
        }
    }
};

export const generateCoords = (cellCount: number): GeneratedCoords => {
    const letterCoords: string[] = [];
    const numberCoords: number[] = [];

    for (let i: number = 1; i <= cellCount; i++) {
        letterCoords.push(String.fromCharCode(64 + i));
        numberCoords.push(i);
    }

    return { letterCoords, numberCoords };
};

const cellIsWithin = ({ cell, cellCount }: CellIsWithinArgs): boolean =>
    cell.x > 0 && cell.x <= cellCount && cell.y > 0 && cell.y <= cellCount;

export const cellIsEngaged = ({ cell, engagedCells }: CellIsEngagedArgs): boolean =>
    engagedCells.some(({ x, y }: CellArgs) => x === cell.x && y === cell.y);

const removeDuplicates = (array: CellArgs[]): CellArgs[] =>
    array.filter((element1: CellArgs, index: number, array: CellArgs[]) =>
        index === array.findIndex((element2: CellArgs) => element2.x === element1.x && element2.y === element1.y));

export const cellSetsIsEqual = (set1: CellArgs[], set2: CellArgs[]): boolean =>
    set1.length === set2.length && set1.every((cellSet1: CellArgs) =>
        set2.find((cellSet2: CellArgs) => cellSet1.x === cellSet2.x && cellSet1.y === cellSet2.y));

export const getEngagedCellsAroundCell = ({
    cell,
    engagedCells,
    cellCount
}: GetEngagedCellsAroundCellArgs): CellArgs[] => {
    let engagedCellsAroundCell: CellArgs[] = [];

    engagedCellsAroundCell.push({ x: cell.x - 1, y: cell.y - 1 });
    engagedCellsAroundCell.push({ x: cell.x + 1, y: cell.y - 1 });
    engagedCellsAroundCell.push({ x: cell.x + 1, y: cell.y + 1 });
    engagedCellsAroundCell.push({ x: cell.x - 1, y: cell.y + 1 });

    return engagedCellsAroundCell.filter((engagedCell: CellArgs) =>
        cellIsWithin({ cell: engagedCell, cellCount }) && !cellIsEngaged({ cell: engagedCell, engagedCells }));
};

export const getEngagedCellsAroundShip = ({
    ship,
    engagedCells,
    cellCount
}: GetEngagedCellsAroundShipArgs): CellArgs[] => {
    let engagedCellsAroundShip: CellArgs[] = [];

    for (let shipCell: number = 0; shipCell < ship.length; shipCell++) {
        engagedCellsAroundShip.push({ x: ship[shipCell].x, y: ship[shipCell].y });
        engagedCellsAroundShip.push({ x: ship[shipCell].x - 1, y: ship[shipCell].y - 1 });
        engagedCellsAroundShip.push({ x: ship[shipCell].x, y: ship[shipCell].y - 1 });
        engagedCellsAroundShip.push({ x: ship[shipCell].x + 1, y: ship[shipCell].y - 1 });
        engagedCellsAroundShip.push({ x: ship[shipCell].x + 1, y: ship[shipCell].y });
        engagedCellsAroundShip.push({ x: ship[shipCell].x + 1, y: ship[shipCell].y + 1 });
        engagedCellsAroundShip.push({ x: ship[shipCell].x, y: ship[shipCell].y + 1 });
        engagedCellsAroundShip.push({ x: ship[shipCell].x - 1, y: ship[shipCell].y + 1 });
        engagedCellsAroundShip.push({ x: ship[shipCell].x - 1, y: ship[shipCell].y });
    }

    return removeDuplicates(engagedCellsAroundShip).filter((engagedCell: CellArgs) =>
        cellIsWithin({ cell: engagedCell, cellCount }) && !cellIsEngaged({ cell: engagedCell, engagedCells }));
};

export const generateShipsLayout = ({ shipsSet, cellCount }: GenerateShipsLayoutArgs): CellArgs[][] => {
    let ships: CellArgs[][] = [];
    let engagedCells: CellArgs[] = [];

    shipsSet.map(({ quantity, size }: ShipsSet) => {
        for (let number: number = 1; number <= quantity; number++) {
            let ship: CellArgs[] = [];
            let currentSize: number = 1;
            let directionsOfGeneration: DirectionsOfGeneration[];
            let directionOfGeneration: DirectionsOfGeneration;

            while (currentSize <= size) {
                if (currentSize === 1) {
                    ship = [];
                    directionsOfGeneration = Object.keys(DirectionsOfGeneration)
                        .map((direction) => ({ sort: Math.random(), direction }))
                        .sort((d1, d2) => d1.sort - d2.sort)
                        .map(({ direction }) => direction as DirectionsOfGeneration);
                    let shipHead: CellArgs = {} as CellArgs;

                    do {
                        shipHead = {
                            x: Math.round(Math.random() * (cellCount - 1) + 1),
                            y: Math.round(Math.random() * (cellCount - 1) + 1)
                        };
                    } while (cellIsEngaged({ cell: shipHead, engagedCells }));

                    ship.push(shipHead);
                    currentSize++;
                } else if (currentSize === 2) {
                    let secondShipCell: CellArgs = {} as CellArgs;

                    do {
                        directionOfGeneration = directionsOfGeneration.pop();

                        switch (directionOfGeneration) {
                            case DirectionsOfGeneration.Left: {
                                const shipCell: CellArgs = { x: ship[0].x - 1, y: ship[0].y };

                                if (
                                    cellIsWithin({ cell: shipCell, cellCount }) &&
                                    !cellIsEngaged({ cell: shipCell, engagedCells })
                                ) {
                                    secondShipCell = shipCell;
                                }
                                break;
                            }
                            case DirectionsOfGeneration.Up: {
                                const shipCell: CellArgs = { x: ship[0].x, y: ship[0].y - 1 };

                                if (
                                    cellIsWithin({ cell: shipCell, cellCount }) &&
                                    !cellIsEngaged({ cell: shipCell, engagedCells })
                                ) {
                                    secondShipCell = shipCell;
                                }
                                break;
                            }
                            case DirectionsOfGeneration.Right: {
                                const shipCell: CellArgs = { x: ship[0].x + 1, y: ship[0].y };

                                if (
                                    cellIsWithin({ cell: shipCell, cellCount }) &&
                                    !cellIsEngaged({ cell: shipCell, engagedCells })
                                ) {
                                    secondShipCell = shipCell;
                                }
                                break;
                            }
                            case DirectionsOfGeneration.Down: {
                                const shipCell: CellArgs = { x: ship[0].x, y: ship[0].y + 1 };

                                if (
                                    cellIsWithin({ cell: shipCell, cellCount }) &&
                                    !cellIsEngaged({ cell: shipCell, engagedCells })
                                ) {
                                    secondShipCell = shipCell;
                                }
                                break;
                            }
                        }
                    } while (!Object.keys(secondShipCell).length && directionsOfGeneration.length);

                    if (Object.keys(secondShipCell).length) {
                        ship.push(secondShipCell);
                        currentSize++;
                    } else {
                        currentSize = 1;
                    }
                } else {
                    let nextShipCell: CellArgs = {} as CellArgs;

                    switch (directionOfGeneration) {
                        case DirectionsOfGeneration.Left: {
                            const shipCell: CellArgs = {
                                x: ship[currentSize - 1 - 1].x - 1,
                                y: ship[currentSize - 1 - 1].y
                            };

                            if (
                                cellIsWithin({ cell: shipCell, cellCount }) &&
                                !cellIsEngaged({ cell: shipCell, engagedCells })
                            ) {
                                nextShipCell = shipCell;
                            }
                            break;
                        }
                        case DirectionsOfGeneration.Up: {
                            const shipCell: CellArgs = {
                                x: ship[currentSize - 1 - 1].x,
                                y: ship[currentSize - 1 - 1].y - 1
                            };

                            if (
                                cellIsWithin({ cell: shipCell, cellCount }) &&
                                !cellIsEngaged({ cell: shipCell, engagedCells })
                            ) {
                                nextShipCell = shipCell;
                            }
                            break;
                        }
                        case DirectionsOfGeneration.Right: {
                            const shipCell: CellArgs = {
                                x: ship[currentSize - 1 - 1].x + 1,
                                y: ship[currentSize - 1 - 1].y
                            };

                            if (
                                cellIsWithin({ cell: shipCell, cellCount }) &&
                                !cellIsEngaged({ cell: shipCell, engagedCells })
                            ) {
                                nextShipCell = shipCell;
                            }
                            break;
                        }
                        case DirectionsOfGeneration.Down: {
                            const shipCell: CellArgs = {
                                x: ship[currentSize - 1 - 1].x,
                                y: ship[currentSize - 1 - 1].y + 1
                            };

                            if (
                                cellIsWithin({ cell: shipCell, cellCount }) &&
                                !cellIsEngaged({ cell: shipCell, engagedCells })
                            ) {
                                nextShipCell = shipCell;
                            }
                            break;
                        }
                    }

                    if (Object.keys(nextShipCell).length) {
                        ship.push(nextShipCell);
                        currentSize++;
                    } else {
                        currentSize = 1;
                    }
                }
            }

            const engagedCellsAroundShip: CellArgs[] = getEngagedCellsAroundShip({ ship, engagedCells, cellCount });

            engagedCells.push(...engagedCellsAroundShip);
            ships.push(ship);
        }
    });

    return ships;
};

const fillCell = ({ context, cellSize, x, y }: DrawCellArgs): void => {
    context.beginPath();
    context.rect((x - 1) * cellSize, (y - 1) * cellSize, cellSize, cellSize);
    context.closePath();
    context.fillStyle = '#ddd';
    context.fill();
    context.stroke();
};

export const drawShips = ({ context, cellSize, ships }: DrawShipsArgs): void => {
    ships.flat().forEach(({ x, y }: CellArgs) => fillCell({ context, cellSize, x, y }));
};

export const drawSunkenShips = ({ context, cellSize, sunkenShips }: DrawSunkenShipsArgs): void => {
    sunkenShips.forEach(({ x, y }: CellArgs) => {
        fillCell({ context, cellSize, x, y });

        context.beginPath();
        context.moveTo((x - 1) * cellSize, (y - 1) * cellSize);
        context.lineTo(x * cellSize, y * cellSize);
        context.closePath();
        context.strokeStyle = '#aaa';
        context.stroke();
    });
};

export const drawPastCells = ({ context, cellSize, pastCells }: DrawPastCellsArgs): void => {
    pastCells.forEach(({ x, y }: CellArgs) => {
        context.beginPath();
        context.arc(x * cellSize - cellSize / 2, y * cellSize - cellSize / 2, 2, 0, 2 * Math.PI);
        context.closePath();
        context.fillStyle = '#000';
        context.fill();
    });
};
