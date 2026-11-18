/** Tiny DOM helpers. */
export const $ = (selector) => document.querySelector(selector);
export const canvas = $('#canvas');

/** Escape text for safe use in HTML/XML. */
export const escapeXml = (s) => String(s).replace(/[&<>"]/g, (c) => '&#' + c.charCodeAt(0) + ';');
