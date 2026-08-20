export const generateDnaShareToken = (userId) => {
  const oneYearExpiry = Date.now() + 365 * 24 * 60 * 60 * 1000;
  const payload = { u: userId, e: oneYearExpiry, v: 1 };
  const str = JSON.stringify(payload);
  const base64 = btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return `dna_${base64}`;
};

export const decodeDnaShareToken = (token) => {
  if (!token || !token.startsWith('dna_')) return { valid: false, reason: 'invalid_format' };
  try {
    let base64 = token.replace('dna_', '').replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) base64 += '=';
    const jsonStr = atob(base64);
    const data = JSON.parse(jsonStr);
    
    if (!data.u || !data.e) return { valid: false, reason: 'corrupted' };
    
    const now = Date.now();
    if (now > data.e) {
      return { valid: false, expired: true, userId: data.u, expiresAt: data.e, reason: 'expired' };
    }
    
    return { valid: true, userId: data.u, expiresAt: data.e };
  } catch (err) {
    return { valid: false, reason: 'parse_error' };
  }
};
