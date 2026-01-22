
const apiKey = process.env.NEXT_PUBLIC_BARIKOI_API_KEY;

if (!apiKey) {
    console.error("Barikoi API key is missing. Please add NEXT_PUBLIC_BARIKOI_API_KEY to your .env file.");
}

/**
 * Searches for a location using Barikoi's Autocomplete API.
 * @param query The search query string.
 * @returns A promise that resolves to the API response.
 */
export async function barikoiAutocomplete(query: string) {
    if (!apiKey) throw new Error("Barikoi API key not configured.");
    
    const url = `https://barikoi.xyz/v2/api/search/autocomplete/place?api_key=${apiKey}&q=${query}`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Barikoi Autocomplete API failed with status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching from Barikoi Autocomplete API:", error);
        throw error;
    }
}

/**
 * Performs reverse geocoding to get an address from coordinates.
 * @param lat The latitude.
 * @param lng The longitude.
 * @returns A promise that resolves to the API response.
 */
export async function barikoiReverseGeocode(lat: number, lng: number) {
    if (!apiKey) throw new Error("Barikoi API key not configured.");

    const url = `https://barikoi.xyz/v2/api/search/reverse/geocode?api_key=${apiKey}&longitude=${lng}&latitude=${lat}&district=true&post_code=true&country=true&sub_district=true&division=true&area=true&address=true&thana=true`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Barikoi Reverse Geocode API failed with status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching from Barikoi Reverse Geocode API:", error);
        throw error;
    }
}
