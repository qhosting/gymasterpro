import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Prisma Setup (Prisma 7 Driver Adapter)
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

app.use(cors());
app.use(express.json());

// Routes
app.get('/api/members', async (req, res) => {
    try {
        const members = await prisma.member.findMany({
            include: {
                user: true,
                plan: true
            }
        });
        
        // Transform to match frontend types if necessary
        const transformedMembers = members.map(m => ({
            ...m.user,
            ...m,
            user: undefined // Remove nested user to flat structure
        }));
        
        res.json(transformedMembers);
    } catch (error) {
        console.error('Error fetching members:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/api/plans', async (req, res) => {
    try {
        const plans = await prisma.plan.findMany();
        res.json(plans);
    } catch (error) {
        console.error('Error fetching plans:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Serve static files from the Vite build
app.use(express.static(path.join(__dirname, '../dist')));

// SPA Catch-all: Send all other requests to index.html
app.get('(.*)', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
