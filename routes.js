// ---------- APPLICATION TIER ----------
// Business logic + validation live here. Routes call db.js for storage
// and never touch SQLite directly; they never trust request bodies blindly.
const express = require('express');
const db = require('./db');

const router = express.Router();

function str(v) { return typeof v === 'string' ? v.trim() : ''; }

router.get('/health', (req, res) => res.json({ ok: true }));

// --- Complaints ("Report a Problem") ---
router.post('/complaints', (req, res) => {
  const name = str(req.body.name), phone = str(req.body.phone);
  if (!name || !phone) return res.status(400).json({ error: 'name and phone are required' });
  const result = db.createComplaint({
    name, phone,
    service: str(req.body.service),
    issue: str(req.body.issue),
    description: str(req.body.description),
  });
  res.status(201).json(result);
});

router.get('/complaints/:ticket', (req, res) => {
  const rec = db.getComplaintByTicket(str(req.params.ticket));
  if (!rec) return res.status(404).json({ error: 'not found' });
  res.json({ ticket: rec.ticket, status: rec.status, created_at: rec.created_at });
});

// --- Contact form ---
router.post('/contact', (req, res) => {
  const name = str(req.body.name), phone = str(req.body.phone), message = str(req.body.message);
  if (!name || !phone) return res.status(400).json({ error: 'name and phone are required' });
  res.status(201).json(db.createContactMessage({ name, phone, message }));
});

// --- Check availability ---
router.post('/availability', (req, res) => {
  const name = str(req.body.name), phone = str(req.body.phone), address = str(req.body.address);
  if (!name || !phone || !address) return res.status(400).json({ error: 'name, phone and address are required' });
  res.status(201).json(db.createAvailabilityRequest({ name, phone, address }));
});

// --- Quick quote ---
router.post('/quote', (req, res) => {
  const phone = str(req.body.phone), service = str(req.body.service);
  if (!phone) return res.status(400).json({ error: 'phone is required' });
  res.status(201).json(db.createQuoteRequest({ service, phone }));
});

// --- Reviews ---
router.post('/reviews', (req, res) => {
  const name = str(req.body.name), review = str(req.body.review);
  const rating = parseInt(req.body.rating, 10);
  if (!name || !review || !(rating >= 1 && rating <= 5)) {
    return res.status(400).json({ error: 'name, review and a rating 1-5 are required' });
  }
  res.status(201).json(db.createReview({ name, rating, review }));
});

router.get('/reviews', (req, res) => {
  res.json(db.listReviews(6));
});

module.exports = router;
