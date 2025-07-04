import { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    switch (req.method) {
      case 'GET':
        return await getAddresses(req, res);
      case 'POST':
        return await createAddress(req, res);
      case 'DELETE':
        return await deleteAllAddresses(req, res);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}

async function getAddresses(req: VercelRequest, res: VercelResponse) {
  try {
    const addresses = await prisma.customAddress.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(addresses);
  } catch (error) {
    res.status(503).json({ error: 'Datenbank nicht verfügbar' });
  }
}

async function createAddress(req: VercelRequest, res: VercelResponse) {
  try {
    const addressData = req.body;
    if (!addressData.name) {
      return res.status(400).json({ error: 'Name ist erforderlich' });
    }
    const newAddress = await prisma.customAddress.create({
      data: addressData
    });
    res.status(201).json(newAddress);
  } catch (error) {
    res.status(503).json({ error: 'Datenbank nicht verfügbar' });
  }
}

async function deleteAllAddresses(req: VercelRequest, res: VercelResponse) {
  try {
    const deleted = await prisma.customAddress.deleteMany({});
    res.json({ message: `${deleted.count} Adressen erfolgreich gelöscht`, deletedCount: deleted.count });
  } catch (error) {
    res.status(500).json({ error: 'Fehler beim Löschen der Adressen' });
  }
} 