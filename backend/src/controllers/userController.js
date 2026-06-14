// Controller stubs for user data export and deletion
// Replace placeholder DB calls with real queries in your data layer.

'use strict';

const fs = require('fs').promises;

async function exportUserData(userId, opts = {}) {
  // Placeholder: collect user-related data from DB (User, Habit, Entry, Backup)
  // Return JSON-serializable object or stream in production
  const now = new Date().toISOString();
  const payload = {
    exported_at: now,
    user_id: userId,
    data: {
      user: { id: userId, name: null, email: null },
      habits: [],
      entries: []
    }
  };

  // Example: write a temp file or return payload directly
  return payload;
}

async function deleteUserData(userId, opts = {}) {
  // Placeholder: perform deletion or anonymization in DB.
  // For SQLite, wrap in transaction; for MySQL use proper DELETE queries.
  // Ensure you create backups or soft-delete if desired.

  // Example side-effect: write an audit record (replace with DB insert)
  const audit = {
    timestamp: new Date().toISOString(),
    actor: userId,
    action: 'user_delete',
    resource_type: 'user',
    resource_id: userId,
    metadata: { irreversible: !!opts.irreversible }
  };

  // In production, insert audit into audit_logs table. Here we append to a local file for visibility.
  try {
    await fs.appendFile('audit_log_stub.txt', JSON.stringify(audit) + '\n');
  } catch (err) {
    // best-effort, do not fail deletion because audit write failed in this stub
    console.error('Failed to record audit stub:', err.message);
  }

  // Return without error to indicate success
  return;
}

module.exports = {
  exportUserData,
  deleteUserData
};
