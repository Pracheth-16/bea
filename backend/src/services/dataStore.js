import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getInitialData } from '../data/seedData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, '../data/store.json');

class DataStore {
  constructor() {
    this.data = null;
    this.init();
  }

  init() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
        console.log('[DataStore] Loaded existing persistent store from JSON');
      } else {
        this.resetToDefaults();
      }
    } catch (err) {
      console.error('[DataStore] Error initializing data store, falling back to seed:', err);
      this.resetToDefaults();
    }
  }

  resetToDefaults() {
    this.data = getInitialData();
    this.save();
    console.log('[DataStore] Seeded fresh enterprise records for BMSIT ITSM');
  }

  save() {
    try {
      const dir = path.dirname(DB_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('[DataStore] Failed to save store to file:', err);
    }
  }

  // Generic collection accessors
  getCollection(name) {
    if (!this.data[name]) {
      this.data[name] = [];
    }
    return this.data[name];
  }

  find(collectionName, query = {}) {
    const list = this.getCollection(collectionName);
    return list.filter((item) => {
      for (const [key, val] of Object.entries(query)) {
        if (item[key] !== val) return false;
      }
      return true;
    });
  }

  findOne(collectionName, query = {}) {
    const list = this.getCollection(collectionName);
    return list.find((item) => {
      for (const [key, val] of Object.entries(query)) {
        if (item[key] !== val) return false;
      }
      return true;
    }) || null;
  }

  findById(collectionName, id) {
    return this.findOne(collectionName, { id });
  }

  create(collectionName, item) {
    const list = this.getCollection(collectionName);
    const newItem = {
      id: item.id || `${collectionName.slice(0, 3)}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: item.createdAt || new Date().toISOString(),
      ...item
    };
    list.unshift(newItem);
    this.save();
    return newItem;
  }

  updateById(collectionName, id, updates) {
    const list = this.getCollection(collectionName);
    const index = list.findIndex((item) => item.id === id);
    if (index === -1) return null;
    list[index] = { ...list[index], ...updates, updatedAt: new Date().toISOString() };
    this.save();
    return list[index];
  }

  deleteById(collectionName, id) {
    const list = this.getCollection(collectionName);
    const index = list.findIndex((item) => item.id === id);
    if (index === -1) return false;
    list.splice(index, 1);
    this.save();
    return true;
  }

  // Audit Logger
  logAudit(action, userId, userName, details, ip = '127.0.0.1') {
    return this.create('auditLogs', {
      action,
      userId,
      userName,
      details,
      ip,
      timestamp: new Date().toISOString()
    });
  }
}

export const store = new DataStore();

