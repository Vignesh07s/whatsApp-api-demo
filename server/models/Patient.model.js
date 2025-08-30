// server/models/Patient.model.js
import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema({
  // A unique, human-readable ID for the patient
  patientId: {
    type: String,
    required: true,
    unique: true,
  },
  // The patient's full name
  name: {
    type: String,
    required: true,
  },
  // The patient's WhatsApp number, used for communication
  whatsappId: {
    type: String,
    required: true,
    unique: true,
  },
}, { timestamps: true }); // `timestamps` adds createdAt and updatedAt fields

const Patient = mongoose.model('Patient', patientSchema);

export default Patient;