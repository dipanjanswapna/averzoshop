'use server';

import * as admin from 'firebase-admin';
import { getApps, initializeApp, App, cert, ServiceAccount } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

/**
 * This file acts as a server-side helper only.
 * It is NOT a Server Actions file, but is used by them.
 */

let app: App;

if (getApps().length === 0) {
  const serviceAccount: ServiceAccount = {
    projectId: "averzo-home",
    privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC5nzBY1IyIoHa5\nWB/K/YfenFoIAhhjAzt2E1xCqKxho8PBzfbZtkKwrQG8j+19w0/uS6BIye+Svh5K\nMOsYb+RcTf7K7eF15OWc2SI0IWPWm1K4RL/pXzHCoBmunvNB/wS8hD2MFRUcR193\n0KQswyDJ+XjQ5+CIUWOw//ZtfOE5ZJbwdhLhTCTsu8yFMXN9NbGp+ybYbhMbVB1b\ngv6XB6MsF1j6VAfe37ohYUUJJQM0Wfn+VqyDhD2KOcnpRgtWIM3mK4ahGLGY+oWh\ngryMSihg7dHLTPBeuwXjgx515Zi0elZaLHIJ7i0GhJZ7DYdMUHEi3w0LGj1TceIZ\niUBixEMdAgMBAAECggEAFkTlYXrag1ew9qp+YfWJs+jRGk3aDCLqos9OzcZ7q9kg\nVqN1nofxt02CPFOOG/zvHXkgOStU3SeG7cKxqcRewr4ut7zTRDgaXfdk1Zk955TJ\n10aUOZTMnPtlKWBzcbL9J/q7gY9T8YkUiITU9XPRfrm5x2JSOzh8e9MxhtApGx/k\nUh8sntsf489l3+ALNtBIFXiUrB7WX6htyGcvSsk8G16YJkVu4bU1b6+ZWDVwJ9bL\nZDFqvF3bKvS4W0j8Ki+aYpO5GOTGOo5oD9FU9iLffUK7OW5APMmHYwpctfqzmrrb\nfbdD4H09fXiqxisIiKQ4tUibp8BmDSxfol+jFq6gFwKBgQDq9HFk4n4hnKIL5T2M\nJ/r9hIVb0p1m6lg1pnNKB9/jDyBqbv5fsLF3+pLuVFeC4TY3eCGJWorU1MPDAYGq\nlTkjiRKYJF5qktH4bV3R22NjIRQU3Z1oNaJD5VKpm1RClV1tLUhglrTjUGCj+Y7r\nB73mA0nzmhruyTZrenZ3CElA+wKBgQDKP4fjFTKhZFfi7wrvyWsfiTeqJbDQL6fO\nN/O68RwpptkXHjErPpqlCeAqAhcO0BrplHVpj52OpZuwMut70kAgrfB8o4KlNVEN\nSTKM1sYPbqGru1EWVLOfN40c6liAOS2bUqsBISMdke3TQQQ6gH13S11kURp3ymjj\n6n0o+HxAxwKBgQCVlWLME9axl4Mjh6MTpDCLTt+IgiJr7y6RmZM0wqarbGn62Qdh\n7KBP/lulGFVOogtebUEMrXRN49duQ3tGGxLxqMcJzb2+pBLB0v80KDSyW9DpJ96b\nBep0x39FM/sFGQsOAxJdTBWF0xpzyuJOh/NCiT1/tdEHzVq0OpdJWSEqGQKBgHKe\n6s5htx4MllqAizw2dMWcqLV/QuPZ/ko7H6C1APcCHkqhy8/sXQxnumlUYej9PCNh\nBeHbiLnNVZzYXuj/0WQz7/VTXblvrA3RjBqRphIc6vc+48e6HUqA2zKmBZ41yYkb\notqzAwnBKH3vfQwCwhiX18gAxvVY+3Uf8esEWLcFAoGBAN+1vY+MIpCjwTO3GOuU\nYuyierzB3nNJT71uOMFXktMOVgR8GnhQ1/P66uElwgJkOYlHIrAso84QH6COcMSs\nMMB+JoTt+bgcO3Xa3NqKPEg7EX6K73Q4aKmqDUkwAhYMS4BX0dMW4wVh6rINyhP8\n7NU0fFbDBgALpNo+2C7qg5XD\n-----END PRIVATE KEY-----\n".replace(/\\n/g, '\n'),
    clientEmail: "firebase-adminsdk-fbsvc@averzo-home.iam.gserviceaccount.com",
  };
  app = initializeApp({
    credential: cert(serviceAccount),
  });
} else {
  app = getApps()[0]!;
}

const firestore = getFirestore(app);

// Export admin for other services like messaging
export { firestore, admin };
