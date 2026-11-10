// LPG Tracker Offline Draft & Idempotency Store
const STORAGE_KEY = 'lpg_offline_drafts_v1';

export class OfflineDraftManager {
  static getDrafts() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static saveDraft({ type, payload }) {
    const drafts = this.getDrafts();
    const idempotencyKey = 'IDEM-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9);
    
    const draft = {
      id: 'DRAFT-' + Date.now(),
      idempotencyKey,
      type, // 'DISPATCH' | 'RECEIVING' | 'STOCK_ADJUSTMENT' | 'COMPLAINT'
      payload,
      status: 'PENDING_SYNC', // Never labeled as confirmed server record!
      createdAt: new Date().toISOString(),
    };

    drafts.unshift(draft);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
    return draft;
  }

  static removeDraft(id) {
    const drafts = this.getDrafts().filter(d => d.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
  }

  static markSynced(id, serverRecordId) {
    const drafts = this.getDrafts().map(d => {
      if (d.id === id) {
        return {
          ...d,
          status: 'CONFIRMED',
          serverRecordId,
          syncedAt: new Date().toISOString(),
        };
      }
      return d;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
  }

  static getPendingCount() {
    return this.getDrafts().filter(d => d.status === 'PENDING_SYNC').length;
  }
}
