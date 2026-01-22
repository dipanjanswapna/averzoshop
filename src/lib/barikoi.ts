
"use client";

const apiKey = process.env.NEXT_PUBLIC_BARIKOI_API_KEY;

export async function barikoiAutocomplete(query: string) {
  if (!apiKey) {
    console.error("Barikoi API key is not set.");
    // Returning a structure that matches the expected success response but is empty.
    return { status: 400, places: [] };
  }
  try {
    const res = await fetch(
      `https://barikoi.xyz/v2/api/search/autocomplete/place?api_key=${apiKey}&q=${query}`
    );
    if (!res.ok) {
        console.error("Barikoi autocomplete API failed with status:", res.status);
        return { status: res.status, places: [] };
    }
    return res.json();
  } catch (error) {
    console.error("barikoiAutocomplete fetch error:", error);
    return { status: 500, places: [] };
  }
}

export async function barikoiReverseGeocode(lat: number, lng: number) {
    if (!apiKey) {
        console.error("Barikoi API key is not set.");
        return { status: 400, place: null };
    }
    try {
        const queryParams = new URLSearchParams({
            api_key: apiKey,
            longitude: String(lng),
            latitude: String(lat),
            district: 'true',
            post_code: 'true',
            sub_district: 'true',
            division: 'true',
            address: 'true',
            area: 'true',
        });

        const res = await fetch(
            `https://barikoi.xyz/v2/api/search/reverse/geocode?${queryParams.toString()}`
        );
        if (!res.ok) {
            console.error("Barikoi reverse geocode API failed with status:", res.status);
            return { status: res.status, place: null };
        }
        return res.json();
    } catch (error) {
        console.error("barikoiReverseGeocode fetch error:", error);
        return { status: 500, place: null };
    }
}
