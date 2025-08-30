// server/services/whatsapp.service.js
import axios from 'axios';
import 'dotenv/config';

const accessToken = process.env.WHATSAPP_TOKEN;
const phoneNumberId = process.env.PHONE_NUMBER_ID;
const url = `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`;

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${accessToken}`,
};

// --- Reusable Function for All API Calls ---
async function sendApiRequest(data) {
  try {
    console.log('Sending API Request:', JSON.stringify(data, null, 2));
    await axios.post(url, data, { headers });
    console.log('Message sent successfully!');
  } catch (error) {
    console.error("--- DETAILED WHATSAPP API ERROR ---");
    if (error.response) {
      console.error("Error Data:", JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error Message:', error.message);
    }
    throw new Error('Failed to send WhatsApp message');
  }
}

// --- Specific Message Functions ---

// For the generic inbound auto-reply
function sendTextMessage(to, text) {
  const data = {
    messaging_product: 'whatsapp', to, type: 'text',
    text: { body: text },
  };
  return sendApiRequest(data);
}

// For new patient registration
function sendPatientWelcome(to, name) {
  const data = {
    messaging_product: 'whatsapp', to, type: 'template',
    template: {
      name: 'demo_patient_welcome', // Use the new template name
      language: { code: 'en_US' },
      components: [{
        type: 'body',
        parameters: [{ type: 'text', text: name }],
      }],
    },
  };
  return sendApiRequest(data);
}

// For follow-up visits
function sendFollowUpVisit(to, name) {
  const data = {
    messaging_product: 'whatsapp', to, type: 'template',
    template: {
      name: 'demo_follow_up_visit',
      language: { code: 'en_US' },
      components: [{
        type: 'body',
        parameters: [{ type: 'text', text: name }],
      }],
    },
  };
  return sendApiRequest(data);
}

// For sending the report download link
function sendReportLink(to, name, visitId, filename) {
    const data = {
      messaging_product: 'whatsapp', to, type: 'template',
      template: {
        name: 'demo_report_link', // Use the new template name
        language: { code: 'en_US' },
        components: [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: name },
              { type: 'text', text: visitId },
            ],
          },
          {
            type: 'button',
            sub_type: 'url',
            index: 0,
            parameters: [{ type: 'text', text: filename }]
          }
        ]
      }
    };
    return sendApiRequest(data);
  }

// --- EXPORTS ---
export {
  sendTextMessage,
  sendPatientWelcome,
  sendFollowUpVisit,
  sendReportLink
};