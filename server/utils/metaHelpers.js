const DEFAULT_TENANT_ID = process.env.META_DEFAULT_TENANT_ID || '6a077f67b28c9045e705cf00';
const DEFAULT_USER_ID = process.env.META_DEFAULT_USER_ID || '6a077f67b28c9045e705cf02';

function getMetaDefaults() {
  return {
    tenantId: DEFAULT_TENANT_ID,
    createdBy: DEFAULT_USER_ID,
  };
}

/**
 * Normalize phone to digits only (keep country code if present).
 */
function normalizePhone(phone) {
  if (!phone) return '';
  return String(phone).replace(/[^\d]/g, '');
}

/**
 * Find field value from Facebook Lead Ads field_data array.
 */
function getLeadField(fieldData = [], keys = []) {
  const lowerKeys = keys.map((k) => k.toLowerCase());
  const found = fieldData.find((f) => lowerKeys.includes(String(f.name || '').toLowerCase()));
  if (!found) return '';
  const val = Array.isArray(found.values) ? found.values[0] : found.value;
  return val ? String(val).trim() : '';
}

module.exports = {
  getMetaDefaults,
  normalizePhone,
  getLeadField,
};
