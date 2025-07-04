import { Request, Response, Router } from 'express';
import { createStation, getStations, updateStation, deleteStation } from '../controllers/station.controller';
import { PrismaClient } from '@prisma/client';
import rateLimit from 'express-rate-limit';

const router = Router();
const prisma = new PrismaClient();

// Rate Limiter korrigieren
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 Minuten
  max: 100 // Limit auf 100 Anfragen pro Fenster
});

// Rate Limiter anwenden
router.use(limiter);

// GET /api/stationen?all=true&take=1000
router.get('/', async (req: Request, res: Response) => {
  try {
    const { all, take } = req.query;
    const where = all ? {} : { isActive: true };
    const stations = await getStations(where, parseInt(take as string) || 50);
    res.json(stations);
  } catch (error) {
    res.status(500).json({ error: 'Fehler beim Laden der Stationen' });
  }
});

// POST /api/stationen
router.post('/', async (req: Request, res: Response) => {
  try {
    const newStation = await createStation(req.body);
    res.status(201).json(newStation);
  } catch (error) {
    res.status(500).json({ error: 'Station konnte nicht erstellt werden' });
  }
});

// PUT /api/stationen/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const updated = await updateStation(req.params.id, req.body);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Station konnte nicht aktualisiert werden' });
  }
});

// DELETE /api/stationen - Alle Stationen löschen (für Datenbank-Bereinigung)
router.delete('/', async (req: Request, res: Response) => {
  try {
    const deletedCount = await prisma.policeStation.deleteMany({});
    console.log(`🧹 ${deletedCount.count} Stationen gelöscht`);
    res.json({ 
      message: `${deletedCount.count} Stationen erfolgreich gelöscht`,
      deletedCount: deletedCount.count 
    });
  } catch (error) {
    console.error('Fehler beim Löschen aller Stationen:', error);
    res.status(500).json({ error: 'Stationen konnten nicht gelöscht werden' });
  }
});

// DELETE /api/stationen/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await deleteStation(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Station konnte nicht gelöscht werden' });
  }
});

export default router;
