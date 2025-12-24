// Unified Goong API Key - same key used across all map components
const GOONG_API_KEY = 'HSFVF5OYPQRcB5mKoJvyYJuknI16LAzvrgtDARwO';

const GOONG_MAPS_KEY = process.env.REACT_APP_GOONG_MAPS_KEY || GOONG_API_KEY;
const GOONG_PLACES_KEY = process.env.REACT_APP_GOONG_PLACES_KEY || GOONG_API_KEY;

const BASE_URL = 'https://rsapi.goong.io';
const PLACES_URL = `${BASE_URL}/Place`;
const GEOCODE_URL = `${BASE_URL}/Geocode`;

export interface PlaceSuggestion {
  placeId: string;
  description: string;
}

export interface PlaceDetails {
  name: string;
  formattedAddress: string;
  latitude: number;
  longitude: number;
}

export const goongService = {
  getStyleUrl(): string {
    return `https://tiles.goong.io/assets/goong_map_web.json?api_key=${GOONG_MAPS_KEY}`;
  },

  async searchPlaces(query: string, location?: { latitude: number; longitude: number }) {
    if (!query.trim()) {
      return [];
    }
    const params = new URLSearchParams({
      input: query,
      api_key: GOONG_PLACES_KEY,
    });
    if (location) {
      params.set('location', `${location.latitude},${location.longitude}`);
      params.set('radius', '50000');
    }
    const response = await fetch(`${PLACES_URL}/AutoComplete?${params.toString()}`);
    const data = await response.json();
    if (data.status !== 'OK') {
      return [];
    }
    return (data.predictions || []).map((pred: any) => ({
      placeId: pred.place_id,
      description: pred.description,
    })) as PlaceSuggestion[];
  },

  async getPlaceDetails(placeId: string): Promise<PlaceDetails | null> {
    if (!placeId) return null;
    const response = await fetch(
      `${PLACES_URL}/Detail?place_id=${encodeURIComponent(placeId)}&api_key=${GOONG_PLACES_KEY}`
    );
    const data = await response.json();
    if (data.status !== 'OK' || !data.result) {
      return null;
    }
    const result = data.result;
    return {
      name: result.name,
      formattedAddress: result.formatted_address,
      latitude: result.geometry?.location?.lat,
      longitude: result.geometry?.location?.lng,
    };
  },

  async reverseGeocode(latitude: number, longitude: number): Promise<string | null> {
    const response = await fetch(
      `${GEOCODE_URL}?latlng=${latitude},${longitude}&api_key=${GOONG_PLACES_KEY}`
    );
    const data = await response.json();
    if (data.status === 'OK' && data.results?.length > 0) {
      return data.results[0].formatted_address;
    }
    return null;
  },
};
