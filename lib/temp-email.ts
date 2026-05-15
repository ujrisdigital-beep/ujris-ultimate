import { db } from "@/lib/db";

// Built-in blocklist — supplemented by database table BlockedEmailDomain
const BUILT_IN_BLOCKED = new Set([
  "mailinator.com", "guerrillamail.com", "guerrillamail.net", "guerrillamail.org",
  "guerrillamail.biz", "guerrillamail.de", "guerrillamail.info", "guerrillamailblock.com",
  "10minutemail.com", "10minutemail.net", "10minutemail.org", "10minutemail.de",
  "10minutemail.co.za", "trashmail.com", "trashmail.at", "trashmail.io", "trashmail.me",
  "trashmail.net", "trashmail.org", "trashmail.xyz", "yopmail.com", "yopmail.fr",
  "cool.fr.nf", "jetable.fr.nf", "nospam.ze.tc", "nomail.xl.cx", "mega.zik.dj",
  "speed.1s.fr", "courriel.fr.nf", "moncourrier.fr.nf", "monemail.fr.nf",
  "monmail.fr.nf", "throwam.com", "dispostable.com", "spamgourmet.com",
  "spamgourmet.net", "spamgourmet.org", "spamgourmet.com", "sharklasers.com",
  "guerrillamail.info", "grr.la", "guerrillamailblock.com", "spam4.me",
  "maildrop.cc", "discard.email", "throwaway.email", "fakeinbox.com",
  "mailnull.com", "spamfree24.org", "spam.la", "tempmail.com", "temp-mail.org",
  "tempmail.net", "tempr.email", "getairmail.com", "filzmail.com", "anonaddy.com",
  "simplelogin.io", "33mail.com", "spamgourmet.com", "mintemail.com", "mt2014.com",
  "mt2015.com", "bumpymail.com", "tempinbox.com", "throwam.com", "emailondeck.com",
  "tempail.com", "tempsky.com", "nwytg.net", "mailexpire.com", "spamex.com",
  "jetable.net", "jetable.org", "jetable.com", "spammotel.com", "safetymail.info",
  "dodgit.com", "mailfreeonline.com", "incognitomail.org", "mailnew.com",
  "gowiki.com", "ovpn.to", "jnxjn.com", "vkcode.ru", "zetmail.com",
]);

export async function isDisposableEmail(email: string): Promise<boolean> {
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return true;

  if (BUILT_IN_BLOCKED.has(domain)) return true;

  try {
    const dbBlock = await db.blockedEmailDomain.findUnique({ where: { domain } });
    if (dbBlock) return true;
  } catch {
    // DB unavailable — fall through to built-in check only
  }

  return false;
}

export async function validateEmail(email: string): Promise<{ valid: boolean; reason?: string }> {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return { valid: false, reason: "Invalid email format" };

  const disposable = await isDisposableEmail(email);
  if (disposable) return { valid: false, reason: "Temporary or disposable email addresses are not permitted. Please use your real email." };

  const domain = email.split("@")[1].toLowerCase();
  const tld = domain.split(".").pop();
  const suspiciousTlds = ["tk", "ml", "ga", "cf", "gq"];
  if (suspiciousTlds.includes(tld ?? "")) {
    return { valid: false, reason: "Email domain not accepted. Please use a recognised email provider." };
  }

  return { valid: true };
}
