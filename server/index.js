// server/index.js
import 'dotenv/config';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import path from 'path';

// Import all models and services
import Patient from './models/Patient.model.js';
import Visit from './models/Visit.model.js';
import {
  sendTextMessage,
  sendPatientWelcome,
  sendFollowUpVisit,
  sendReportLink
} from './services/whatsapp.service.js';

const app = express();
const PORT = process.env.PORT || 8080;

// --- DATABASE CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully.'))
  .catch(err => console.error('MongoDB connection error:', err));

// --- MIDDLEWARE ---
app.use(cors());
app.use(bodyParser.json());
// Serve static files from the 'uploads' directory
app.use('/uploads', express.static('uploads'));

// --- ROUTES ---

// 1. INBOUND MESSAGE HANDLER (WEBHOOK)
app.post('/webhook', async (req, res) => {
  const body = req.body;
  if (body.object === 'whatsapp_business_account' && body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]) {
    const from = body.entry[0].changes[0].value.messages[0].from;
    const replyText = "Thank you for contacting Gemini Hospital. Our staff will assist you shortly.";
    await sendTextMessage(from, replyText);
  }
  res.sendStatus(200);
});

// 2. PATIENT REGISTRATION
app.post('/api/register-patient', async (req, res) => {
  const { name, phone } = req.body;
  if (!name || !phone) {
    return res.status(400).json({ error: 'Name and phone number are required.' });
  }
  try {
    const existingUser = await Patient.findOne({ whatsappId: phone });
    if (existingUser) {
      return res.status(400).json({ error: 'This phone number is already registered.' });
    }
    const patientId = `PAT-${uuidv4().split('-')[0].toUpperCase()}`;
    const newPatient = new Patient({ name, whatsappId: phone, patientId });
    await newPatient.save();
    await sendPatientWelcome(phone, name);
    res.status(201).json({ message: 'Patient registered successfully!', patient: newPatient });
  } catch (error) {
    res.status(500).json({ error: 'An internal server error occurred.' });
  }
});

// 3. CREATE FOLLOW-UP VISIT
app.post('/api/create-visit', async (req, res) => {
  const { phone } = req.body;
  if (!phone) {
    return res.status(400).json({ error: 'Phone number is required.' });
  }
  try {
    const patient = await Patient.findOne({ whatsappId: phone });
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found.' });
    }
    const visitId = `VIS-${uuidv4().split('-')[0].toUpperCase()}`;
    const newVisit = new Visit({ visitId, patient: patient._id });
    await newVisit.save();
    await sendFollowUpVisit(phone, patient.name);
    res.status(201).json({ message: 'Follow-up visit created successfully!', visit: newVisit });
  } catch (error) {
    res.status(500).json({ error: 'An internal server error occurred.' });
  }
});

// 4. UPLOAD REPORT & SEND LINK
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// --- Replace the existing upload route with this ---
app.post('/api/upload-report', upload.single('report'), async (req, res) => {
  const { visitId } = req.body;
  const reportFile = req.file;

  if (!visitId || !reportFile) {
    return res.status(400).json({ error: 'Visit ID and report file are required.' });
  }

  try {
    // 1. Find the visit and populate the patient details
    const visit = await Visit.findOne({ visitId }).populate('patient');
    if (!visit) {
      return res.status(404).json({ error: 'Visit not found.' });
    }

    // 2. Save the report's path to the database
    const reportUrl = `uploads/${reportFile.filename}`;
    visit.reports.push(reportUrl);
    await visit.save();

    // 3. Send the WhatsApp notification to the correct patient
    await sendReportLink(
      visit.patient.whatsappId,
      visit.patient.name,
      visit.visitId,
      reportFile.filename // This is the dynamic part of the URL
    );
    
    res.status(200).json({ message: 'Report uploaded and link sent successfully!', report: reportUrl });

  } catch (error) {
    console.error('Report Upload Error:', error);
    res.status(500).json({ error: 'An internal server error occurred.' });
  }
});


// 5. WEBHOOK VERIFICATION
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  if (mode && token && mode === 'subscribe' && token === process.env.VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

app.get('/', (req, res) => {
  res.send('Welcome to the WhatsApp API Server');
});

// --- START SERVER ---
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});