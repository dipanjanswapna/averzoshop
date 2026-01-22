"use client";

const apiKey = process.env.NEXT_PUBLIC_BARIKOI_API_KEY;

if (!apiKey) {
  console.warn(
    'Barikoi API key is not set in NEXT_PUBLIC_BARIKOI_API_KEY. Location services will be unavailable.'
  );
}

const autocomplete = async (params: { q: string }) => {
  if (!apiKey) throw new Error("Barikoi API key is not set.");
  const res = await fetch(
    `https://barikoi.xyz/v2/api/search/autocomplete/place?api_key=${apiKey}&q=${params.q}`
  );
  if (!res.ok) throw new Error("Barikoi autocomplete API failed");
  const data = await res.json();
  return { data }; // Mimic SDK-like response structure
};

const reverseGeocode = async (params: { longitude: number; latitude: number; [key: string]: any }) => {
    if (!apiKey) throw new Error("Barikoi API key is not set.");

    const queryParams = new URLSearchParams({
        api_key: apiKey,
        longitude: String(params.longitude),
        latitude: String(params.latitude),
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
    if (!res.ok) throw new Error("Barikoi reverse geocode API failed");
    const data = await res.json();
    return { data }; // Mimic SDK-like response structure
};

export const barikoi = {
  autocomplete,
  reverseGeocode,
};
