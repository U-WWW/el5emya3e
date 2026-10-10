import fs from "fs";
import path from "path";

const STATE_FILE = path.resolve(process.cwd(), "system-state.json");
const DEFAULT_KEY = process.env.DEV_SECRET_KEY || process.env.DEV_MAINTENANCE_KEY || "dev_secret_2026_khemiai";

interface SystemState {
  active: boolean;
  maintenance: boolean;
  message: string;
  updatedAt: string;
}

// Sync directly to Firestore via REST API so all connected clients update in real time
async function syncToFirestore(active: boolean, message: string) {
  try {
    const configPath = path.resolve(process.cwd(), "firebase-applet-config.json");
    if (!fs.existsSync(configPath)) return;
    const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
    const projectId = config.projectId;
    const dbId = config.firestoreDatabaseId || "(default)";
    const apiKey = config.apiKey;
    if (!projectId || !apiKey) return;

    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${dbId}/documents/settings/system_control?key=${apiKey}`;
    const body = {
      fields: {
        active: { booleanValue: active },
        isMaintenance: { booleanValue: !active },
        message: { stringValue: message },
        updatedAt: { stringValue: new Date().toISOString() }
      }
    };

    await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
  } catch (err) {
    console.warn("[Maintenance] Firestore REST sync warning:", err);
  }
}

export function getStoredState(): SystemState {
  try {
    if (fs.existsSync(STATE_FILE)) {
      const content = fs.readFileSync(STATE_FILE, "utf8");
      const parsed = JSON.parse(content);
      const active = parsed.active !== undefined 
        ? Boolean(parsed.active) 
        : (parsed.maintenance === true ? false : true);

      return {
        active,
        maintenance: !active,
        message: parsed.message || (active ? "المنصة تعمل بصورة طبيعية" : "الموقع تحت الصيانة حالياً"),
        updatedAt: parsed.updatedAt || new Date().toISOString()
      };
    }
  } catch (err) {
    console.warn("[Maintenance] Error reading state file:", err);
  }

  return {
    active: true,
    maintenance: false,
    message: "المنصة تعمل بصورة طبيعية",
    updatedAt: new Date().toISOString()
  };
}

export function saveStoredState(active: boolean, customMessage?: string): SystemState {
  const message = customMessage || (active ? "المنصة تعمل بصورة طبيعية" : "الموقع تحت الصيانة حالياً");
  const state: SystemState = {
    active,
    maintenance: !active,
    message,
    updatedAt: new Date().toISOString()
  };

  try {
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), "utf8");
  } catch (err) {
    console.warn("[Maintenance] Error saving state file:", err);
  }

  // Sync to Firestore in background
  syncToFirestore(active, message).catch(() => {});

  return state;
}

function extractKey(req: any): string | null {
  const authHeader = req.headers["authorization"];
  const bearer = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;
  return (
    req.body?.key ||
    req.body?.secret ||
    req.query?.key ||
    req.query?.secret ||
    req.headers["x-dev-key"] ||
    bearer ||
    null
  );
}

export default async function maintenanceHandler(req: any, res: any) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, x-dev-key");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Quick GET with toggle parameters: ?key=...&active=true/false
  const providedKey = extractKey(req);
  const hasToggleParam = 
    req.query?.active !== undefined || 
    req.query?.maintenance !== undefined || 
    req.query?.status !== undefined;

  // Handle toggle via GET
  if (req.method === "GET" && hasToggleParam) {
    if (providedKey !== DEFAULT_KEY) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized: مفتاح المطور غير صحيح. يُرجى تمرير key=...",
        example: "/api/maintenance?key=dev_secret_2026_khemiai&active=false"
      });
    }

    let targetActive = true;
    if (req.query.active !== undefined) {
      targetActive = req.query.active === "true" || req.query.active === "1";
    } else if (req.query.maintenance !== undefined) {
      targetActive = !(req.query.maintenance === "true" || req.query.maintenance === "1");
    } else if (req.query.status !== undefined) {
      targetActive = req.query.status === "true" || req.query.status === "1";
    }

    const message = req.query.message 
      ? String(req.query.message) 
      : (targetActive ? "المنصة تعمل بصورة طبيعية" : "الموقع تحت الصيانة حالياً");

    const newState = saveStoredState(targetActive, message);
    return res.json({
      success: true,
      active: newState.active,
      maintenance: newState.maintenance,
      message: newState.message,
      updatedAt: newState.updatedAt
    });
  }

  // Handle standard GET query (just return current state)
  if (req.method === "GET") {
    const currentState = getStoredState();
    return res.json(currentState);
  }

  // Handle POST request
  if (req.method === "POST") {
    if (providedKey !== DEFAULT_KEY) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized: مفتاح المطور غير صحيح (Invalid developer key)",
        hint: "مرر key في الـ body أو query أو في header 'x-dev-key'"
      });
    }

    let targetActive: boolean = true;
    const body = req.body || {};

    if (body.active !== undefined) {
      targetActive = Boolean(body.active);
    } else if (body.maintenance !== undefined) {
      targetActive = !Boolean(body.maintenance);
    } else if (body.status !== undefined) {
      targetActive = Boolean(body.status);
    } else if (typeof body === "boolean") {
      targetActive = body;
    } else if (req.query?.active !== undefined) {
      targetActive = req.query.active === "true" || req.query.active === "1";
    } else if (req.query?.maintenance !== undefined) {
      targetActive = !(req.query.maintenance === "true" || req.query.maintenance === "1");
    }

    const message = body.message || (targetActive ? "المنصة تعمل بصورة طبيعية" : "الموقع تحت الصيانة حالياً");
    const newState = saveStoredState(targetActive, message);

    return res.json({
      success: true,
      active: newState.active,
      maintenance: newState.maintenance,
      message: newState.message,
      updatedAt: newState.updatedAt
    });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
