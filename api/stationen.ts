import { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';
import { handleError } from '../api/lib/error-handler';

// Prisma Client initialisieren
const prisma = new PrismaClient();

// Temporäre statische Daten für Polizeistationen
const staticStations = [
  {
    id: "static-1",
    name: "Polizeipräsidium Stuttgart",
    address: "Taubenheimstraße 85, 70372 Stuttgart",
    coordinates: { lat: 48.7758, lng: 9.1829 },
    phone: "0711 8990-0",
    email: "poststelle.pp.stuttgart@polizei.bwl.de"
  },
  {
    id: "static-2",
    name: "Polizeipräsidium Karlsruhe",
    address: "Erbprinzenstraße 96, 76133 Karlsruhe",
    coordinates: { lat: 49.0069, lng: 8.4037 },
    phone: "0721 666-0",
    email: "poststelle.pp.karlsruhe@polizei.bwl.de"
  },
  {
    id: "static-3",
    name: "Polizeipräsidium Mannheim",
    address: "Collinistraße 1, 68161 Mannheim",
    coordinates: { lat: 49.4875, lng: 8.4660 },
    phone: "0621 174-0",
    email: "poststelle.pp.mannheim@polizei.bwl.de"
  },
  {
    id: "static-4",
    name: "Polizeipräsidium Freiburg",
    address: "Basler Landstraße 113, 79111 Freiburg",
    coordinates: { lat: 47.9990, lng: 7.8421 },
    phone: "0761 882-0",
    email: "poststelle.pp.freiburg@polizei.bwl.de"
  },
  {
    id: "static-5",
    name: "Polizeipräsidium Heilbronn",
    address: "Cäcilienstraße 56, 74072 Heilbronn",
    coordinates: { lat: 49.1406, lng: 9.2185 },
    phone: "07131 104-0",
    email: "poststelle.pp.heilbronn@polizei.bwl.de"
  }
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Headers - erweitert für bessere Kompatibilität
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400'); // 1 Tag

  // Debug-Logging für Request-Methode
  console.log('Request-Methode:', req.method, 'URL:', req.url);

  // Wichtig: OPTIONS requests vorab beantworten
  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
  }

  try {
    switch (req.method) {
      case 'GET':
        console.log('GET-Request erkannt');
        return await getStations(req, res);
      case 'POST':
        console.log('POST-Request erkannt');
        return await createStation(req, res);
      case 'PUT':
        console.log('PUT-Request erkannt');
        return await updateStation(req, res);
      case 'DELETE':
        console.log('DELETE-Request erkannt');
        return await deleteAllStations(req, res);
      default:
        console.error('POST-Request abgelehnt. Method:', req.method, 'URL:', req.url);
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}

async function getStations(req: VercelRequest, res: VercelResponse) {
  try {
    // Versuche zuerst die Datenbank zu verwenden
    const stations = await prisma.policeStation.findMany({
      orderBy: { name: 'asc' }
    });
    
    const processedStations = stations.map(station => ({
      ...station,
      coordinates: station.coordinates ? JSON.parse(station.coordinates) : null
    }));
    
    res.json(processedStations);
  } catch (error) {
    // Fallback zu statischen Daten wenn Datenbank nicht verfügbar
    console.log('Datenbank nicht verfügbar, verwende statische Daten');
    res.json(staticStations);
  }
}

async function createStation(req: VercelRequest, res: VercelResponse) {
  try {
    console.log('createStation aufgerufen mit Body:', JSON.stringify(req.body));
    
    const { id, ...stationData } = req.body;
    
    // Validierung
    if (!stationData.name) {
      console.error('Validierungsfehler: Name fehlt');
      return res.status(400).json({ error: 'Name ist erforderlich' });
    }
    
    // Prüfe, ob Coordinates als String oder Objekt kommt
    let coordinates = null;
    if (stationData.coordinates) {
      if (typeof stationData.coordinates === 'string') {
        try {
          coordinates = JSON.parse(stationData.coordinates);
        } catch (e) {
          // Falls Parsing fehlschlägt, als String speichern
          coordinates = stationData.coordinates;
        }
      } else {
        coordinates = stationData.coordinates;
      }
    }
    
    // Station erstellen
    const newStation = await prisma.policeStation.create({
      data: {
        ...stationData,
        coordinates: coordinates ? JSON.stringify(coordinates) : null,
        id: undefined // id wird auto-generiert
      }
    });
    
    // Koordinaten zurück als Objekt parsen für die Antwort
    const processedStation = {
      ...newStation,
      coordinates: newStation.coordinates ? JSON.parse(newStation.coordinates) : null
    };
    
    res.status(201).json(processedStation);
  } catch (error) {
    console.error('Fehler beim Erstellen der Station:', error);
    res.status(503).json({ 
      error: 'Datenbank nicht verfügbar', 
      details: error.message 
    });
  }
}

async function updateStation(req: VercelRequest, res: VercelResponse) {
  try {
    const { id, ...stationData } = req.body;
    
    if (!id) {
      return res.status(400).json({ error: 'ID ist erforderlich' });
    }
    
    // Prüfe, ob Coordinates als String oder Objekt kommt
    let coordinates = null;
    if (stationData.coordinates) {
      if (typeof stationData.coordinates === 'string') {
        try {
          coordinates = JSON.parse(stationData.coordinates);
        } catch (e) {
          coordinates = stationData.coordinates;
        }
      } else {
        coordinates = stationData.coordinates;
      }
    }
    
    const updatedStation = await prisma.policeStation.update({
      where: { id: id },
      data: {
        ...stationData,
        coordinates: coordinates ? JSON.stringify(coordinates) : null
      }
    });
    
    const processedStation = {
      ...updatedStation,
      coordinates: updatedStation.coordinates ? JSON.parse(updatedStation.coordinates) : null
    };
    
    res.json(processedStation);
  } catch (error) {
    console.error('Fehler beim Aktualisieren der Station:', error);
    res.status(503).json({ 
      error: 'Datenbank nicht verfügbar', 
      details: error.message 
    });
  }
}

// Handler zum Löschen aller Stationen
async function deleteAllStations(req: VercelRequest, res: VercelResponse) {
  try {
    const deleted = await prisma.policeStation.deleteMany({});
    res.json({ message: `${deleted.count} Stationen erfolgreich gelöscht`, deletedCount: deleted.count });
  } catch (error) {
    res.status(500).json({ error: 'Fehler beim Löschen der Stationen' });
  }
} 