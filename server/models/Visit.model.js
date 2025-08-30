// server/models/Visit.model.js
import mongoose from 'mongoose';
const { Schema } = mongoose;

const visitSchema = new mongoose.Schema({
  // A unique, human-readable ID for this specific visit
  visitId: {
    type: String,
    required: true,
    unique: true,
  },
  // The link to the patient document. This is the key relationship.
  patient: {
    type: Schema.Types.ObjectId, // Stores the unique _id of a document in the Patient collection
    ref: 'Patient',              // Tells Mongoose this ID refers to the 'Patient' model
    required: true,
  },
  // We'll store an array of strings for report URLs or file paths
  reports: {
    type: [String],
    default: [],
  },
}, { timestamps: true }); // `timestamps` adds createdAt and updatedAt fields

const Visit = mongoose.model('Visit', visitSchema);

export default Visit;