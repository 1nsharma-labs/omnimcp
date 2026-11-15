import crypto from 'node:crypto';

/**
 * OmniMCP Enterprise Offline License Verifier (BSL 1.1)
 */
export class LicenseVerifier {
  constructor(secretKey = process.env.OMNIMCP_LICENSE_SECRET || 'omnimcp-enterprise-master-2026') {
    this.secretKey = secretKey;
  }

  generateKey(organization, validDays = 365, tier = 'ENT') {
    const orgClean = organization.toUpperCase().replace(/[^A-Z0-9]/g, '');
    const expiresAt = Math.floor(Date.now() / 1000) + (validDays * 86400);
    const payload = `OMNI-${tier}-${orgClean}-${expiresAt}`;
    
    const signature = crypto
      .createHmac('sha256', this.secretKey)
      .update(payload)
      .digest('hex')
      .slice(0, 16)
      .toUpperCase();

    return `${payload}-${signature}`;
  }

  verifyKey(keyString) {
    if (!keyString) return { valid: false, reason: 'License key missing', tier: 'COMMUNITY' };
    const parts = keyString.split('-');
    if (parts.length < 5 || parts[0] !== 'OMNI') {
      return { valid: false, reason: 'Malformed license key format', tier: 'COMMUNITY' };
    }

    const tier = parts[1];
    const organization = parts[2];
    const expiresAt = parseInt(parts[3], 10);
    const signature = parts[4];

    const expectedPayload = `OMNI-${tier}-${organization}-${expiresAt}`;
    const expectedSig = crypto
      .createHmac('sha256', this.secretKey)
      .update(expectedPayload)
      .digest('hex')
      .slice(0, 16)
      .toUpperCase();

    if (signature !== expectedSig) {
      return { valid: false, reason: 'Invalid signature', tier: 'COMMUNITY' };
    }

    const now = Math.floor(Date.now() / 1000);
    if (now > expiresAt) {
      return { valid: false, reason: 'License key expired', tier: 'COMMUNITY' };
    }

    return {
      valid: true,
      organization,
      expiresAt: new Date(expiresAt * 1000).toISOString(),
      tier: tier === 'ENT' ? 'ENTERPRISE' : 'PRO'
    };
  }

  getEnvironmentStatus() {
    const envKey = process.env.OMNIMCP_LICENSE_KEY;
    if (!envKey) {
      return { valid: false, tier: 'Community (Apache 2.0)', licensed: false };
    }
    return this.verifyKey(envKey);
  }
}

export const globalLicenseVerifier = new LicenseVerifier();
