/**
 * Thai Font Loader for jsPDF
 * Downloads Sarabun from Google Fonts and registers with jsPDF.
 * Caches in memory to avoid repeated downloads.
 */

import jsPDF from 'jspdf';

let _cachedFontBase64: string | null = null;

const SARABUN_URL = 'https://fonts.gstatic.com/s/sarabun/v15/DtVjJx26TKEr37c9YL5rilwm.ttf';

async function loadSarabunFont(): Promise<string> {
  if (_cachedFontBase64) return _cachedFontBase64;

  try {
    const response = await fetch(SARABUN_URL);
    if (!response.ok) throw new Error(`Font fetch failed: ${response.status}`);
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    _cachedFontBase64 = buffer.toString('base64');
    
    console.log('[ThaiFont] Sarabun loaded and cached');
    return _cachedFontBase64;
  } catch (err) {
    console.error('[ThaiFont] Failed to load Sarabun:', err);
    throw err;
  }
}

/**
 * Register Sarabun font with a jsPDF instance
 * Must be called before using Thai text
 */
export async function registerThaiFont(doc: jsPDF): Promise<void> {
  try {
    const fontBase64 = await loadSarabunFont();
    
    doc.addFileToVFS('Sarabun-Regular.ttf', fontBase64);
    doc.addFont('Sarabun-Regular.ttf', 'Sarabun', 'normal');
    
    // Set as default font
    doc.setFont('Sarabun');
  } catch {
    // Fallback to helvetica if font loading fails
    console.warn('[ThaiFont] Falling back to helvetica');
    doc.setFont('helvetica');
  }
}

/**
 * Set Thai-safe font on a jsPDF doc (non-async version for already-registered fonts)
 */
export function setThaiFont(doc: jsPDF) {
  try {
    doc.setFont('Sarabun');
  } catch {
    doc.setFont('helvetica');
  }
}
