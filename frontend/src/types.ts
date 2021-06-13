export enum BelongsTo {
    Yours = 'Yours',
    Theirs = 'Theirs'
}

export enum Ships {
    Battleship = 'Battleship',
    Cruiser = 'Cruiser',
    Destroyer = 'Destroyer',
    Submarine = 'Submarine'
}

export enum DirectionsOfGeneration {
    Left = 'Left',
    Up = 'Up',
    Right = 'Right',
    Down = 'Down'
}

export type GridProps = {
    belongsTo: BelongsTo;
    size: number;
    cellCount: number;
    cellSize: number;
    coords: GeneratedCoords;
    ships: CellArgs[][];
    finishGame: () => void;
    gameIsFinished: boolean;
};

export type ShipsSet = {
    type?: Ships;
    size: number;
    quantity: number;
};

type ContextArgs = {
    context: CanvasRenderingContext2D;
    cellSize: number;
};

export type CellArgs = {
    x: number;
    y: number;
};

export type DrawCellArgs = ContextArgs & CellArgs;

export type DrawCellsArgs = ContextArgs & {
    cellCount: number;
};

export type GeneratedCoords = {
    letterCoords: string[];
    numberCoords: number[];
};

export type CellIsWithinArgs = {
    cell: CellArgs;
    cellCount: number;
};

export type CellIsEngagedArgs = {
    cell: CellArgs;
    engagedCells: CellArgs[];
};

export type GetEngagedCellsAroundCellArgs = {
    cell: CellArgs;
    engagedCells: CellArgs[];
    cellCount: number;
};

export type GetEngagedCellsAroundShipArgs = {
    ship: CellArgs[];
    engagedCells: CellArgs[];
    cellCount: number;
};

export type GenerateShipsLayoutArgs = {
    shipsSet: ShipsSet[];
    cellCount: number;
};

export type DrawShipsArgs = ContextArgs & {
    ships: CellArgs[][];
};
