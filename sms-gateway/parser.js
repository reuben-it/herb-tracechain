/**
 * SMS Parser — Parses incoming SMS text into structured herb harvest data.
 *
 * Expected SMS format (case-insensitive):
 *   HARVEST HerbID:H001 Collector:C01 Location:Kerala Herb:Ashwagandha Qty:50 Unit:kg Notes:Fresh
 *
 * All fields except Notes are required.
 * Returns parsed object or { error: string } on failure.
 */

function parseSMS(text) {
  if (!text || typeof text !== 'string') return null;

  const trimmed = text.trim();
  const upper = trimmed.toUpperCase();

  if (!upper.startsWith('HARVEST')) {
    return {
      error: 'Unknown command. Send: HARVEST HerbID:xxx Collector:xxx Location:xxx Herb:xxx Qty:xxx Unit:xxx'
    };
  }

  // Extract field:value pairs (no spaces in values — use hyphens)
  const extract = (key) => {
    const regex = new RegExp(key + ':([^\\s]+)', 'i');
    const match = trimmed.match(regex);
    return match ? match[1] : null;
  };

  const herbId    = extract('HerbID');
  const collector = extract('Collector');
  const location  = extract('Location');
  const herb      = extract('Herb');
  const qty       = extract('Qty');
  const unit      = extract('Unit');
  const notes     = extract('Notes') || 'Via SMS';

  // Check required fields
  const missing = [];
  if (!herbId)    missing.push('HerbID');
  if (!collector) missing.push('Collector');
  if (!location)  missing.push('Location');
  if (!herb)      missing.push('Herb');
  if (!qty)       missing.push('Qty');
  if (!unit)      missing.push('Unit');

  if (missing.length > 0) {
    return { error: `Missing fields: ${missing.join(', ')}` };
  }

  return { herbId, collector, location, herb, qty, unit, notes };
}

module.exports = { parseSMS };
