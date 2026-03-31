import express from "express";
import type { Request,Response } from "express";
import dotenv from 'dotenv';
import channelRouter from './routes/channel.router.js';
import followRouter from './routes/follow.router.js';

dotenv.config()

const app = express();
app.use(express.json()); // adding body parser for PUT requests

const PORT = process.env.PORT || 3000;

app.use('/api/channels', channelRouter);
app.use('/api/follows', followRouter);

app.get("/", (req:Request, res:Response) => {
  res.send("Hello World!");
});

app.listen(PORT, () => {
  console.log(`listening to port ${PORT}`);
});