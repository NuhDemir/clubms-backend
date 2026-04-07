import express, {Application} from 'express';
import cors from 'cors';


const app: Application = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', message: 'ClubMS API is running' });
});

export { app };