import express, { Application, Request, Response } from 'express';
import MongoClient, { MongoError } from 'mongodb';

const app: Application = express();

app.get('/', (_req: Request, res: Response): Response => res.send('hello from SeaBattle'));

MongoClient.connect('mongodb://database:27017', (err: MongoError, _client: any) => {
    if (err) throw err;

    app.listen(3000, () => console.log(`App starting at *:3000`));
});
