import * as barikoiapis from 'barikoiapis';

const apiKey = process.env.NEXT_PUBLIC_BARIKOI_API_KEY;

if (!apiKey) {
  // This warning will appear in the server console during build, and in the browser console.
  console.warn(
    'Barikoi API key is not set in NEXT_PUBLIC_BARIKOI_API_KEY. Location services will be unavailable.'
  );
}

// Create a singleton client instance
export const barikoi = barikoiapis.createBarikoiClient({
  apiKey: apiKey || '', // Pass an empty string if undefined to avoid crashing the client
});
