'use client';

import { useState } from 'react';

const url = process.env.NEXT_PUBLIC_API_URL;

// A single component for displaying feedback messages
function FeedbackMessage({ message }) {
  if (!message) return null;
  const isError = message.startsWith('Error:');
  return (
    <p className={`mt-4 text-center text-sm font-medium ${isError ? 'text-red-500' : 'text-green-500'}`}>
      {message}
    </p>
  );
}

// --- Component for Patient Registration ---
function PatientRegistration({ setFeedbackMessage }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setFeedbackMessage('');
    try {
      const response = await fetch(`${url}/api/register-patient`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Registration failed');
      setFeedbackMessage(`Success: Patient ${data.patient.name} registered. Welcome message sent.`);
      setName('');
      setPhone('');
    } catch (error) {
      setFeedbackMessage(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full">
      <h2 className="text-xl font-bold mb-4 text-gray-700">1. New Patient Registration</h2>
      <form onSubmit={handleSubmit}>
        {/* Form fields for name and phone */}
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium text-gray-600 mb-1">Patient Name</label>
          <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border rounded-md" placeholder="Enter patient name" required />
        </div>
        <div className="mb-4">
          <label htmlFor="phone" className="block text-sm font-medium text-gray-600 mb-1">WhatsApp Number</label>
          <input type="text" id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-3 py-2 border rounded-md" placeholder="e.g., 919876543210" required />
        </div>
        <button type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white py-2 rounded-md disabled:bg-gray-400">
          {isLoading ? 'Registering...' : 'Register & Send Welcome'}
        </button>
      </form>
    </div>
  );
}

// --- Component for Creating a Follow-up Visit ---
function CreateVisit({ setFeedbackMessage }) {
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setFeedbackMessage('');
    try {
      const response = await fetch(`${url}/api/create-visit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create visit');
      setFeedbackMessage(`Success: New visit created with ID ${data.visit.visitId}. Notification sent.`);
      setPhone('');
    } catch (error) {
      setFeedbackMessage(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full">
      <h2 className="text-xl font-bold mb-4 text-gray-700">2. Create Follow-up Visit</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="visit-phone" className="block text-sm font-medium text-gray-600 mb-1">Patient&apos;s WhatsApp Number</label>
          <input type="text" id="visit-phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-3 py-2 border rounded-md" placeholder="Find patient by phone number" required />
        </div>
        <button type="submit" disabled={isLoading} className="w-full bg-green-600 text-white py-2 rounded-md disabled:bg-gray-400">
          {isLoading ? 'Creating...' : 'Create Visit & Send Update'}
        </button>
      </form>
    </div>
  );
}

// --- Component for Uploading a Report ---
function UploadReport({ setFeedbackMessage }) {
  const [visitId, setVisitId] = useState('');
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setFeedbackMessage('Error: Please select a file to upload.');
      return;
    }
    setIsLoading(true);
    setFeedbackMessage('');

    // We use FormData for file uploads
    const formData = new FormData();
    formData.append('visitId', visitId);
    formData.append('report', file);

    try {
      const response = await fetch(`${url}/api/upload-report`, {
        method: 'POST',
        body: formData, // No 'Content-Type' header needed, browser sets it for FormData
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'File upload failed');
      setFeedbackMessage(`Success: Report uploaded for Visit ${visitId}. Download link sent.`);
      setVisitId('');
      setFile(null);
    } catch (error) {
      setFeedbackMessage(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full">
      <h2 className="text-xl font-bold mb-4 text-gray-700">3. Upload Report</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="visitId" className="block text-sm font-medium text-gray-600 mb-1">Visit ID</label>
          <input type="text" id="visitId" value={visitId} onChange={(e) => setVisitId(e.target.value)} className="w-full px-3 py-2 border rounded-md" placeholder="e.g., VIS-ABC123" required />
        </div>
        <div className="mb-4">
          <label htmlFor="reportFile" className="block text-sm font-medium text-gray-600 mb-1">Report File (PDF/Image)</label>
          <input type="file" id="reportFile" onChange={(e) => setFile(e.target.files[0])} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
        </div>
        <button type="submit" disabled={isLoading} className="w-full bg-purple-600 text-white py-2 rounded-md disabled:bg-gray-400">
          {isLoading ? 'Uploading...' : 'Upload & Send Link'}
        </button>
      </form>
    </div>
  );
}


// --- Main Page Component ---
export default function Home() {
  const [feedbackMessage, setFeedbackMessage] = useState('');

  return (
    <main className="flex min-h-screen flex-col items-center bg-gray-100 p-8 space-y-8">
      <h1 className="text-4xl font-bold text-gray-800">Hospital Demo Dashboard</h1>
      <div className="w-full max-w-lg space-y-8">
        <PatientRegistration setFeedbackMessage={setFeedbackMessage} />
        <CreateVisit setFeedbackMessage={setFeedbackMessage} />
        <UploadReport setFeedbackMessage={setFeedbackMessage} />
      </div>
      <FeedbackMessage message={feedbackMessage} />
    </main>
  );
}