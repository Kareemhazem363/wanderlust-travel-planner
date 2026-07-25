const TICKETMASTER_API_KEY = "AAc0KBpFH95E7jIF3ojtSulkEXhGA2bB";

export class EventsAPI {
  constructor() {
    this.base = "https://app.ticketmaster.com/discovery/v2";
  }

  // Searches for events in a given city/country
  async searchEvents(city, countryCode) {
    const params = new URLSearchParams({
      apikey: TICKETMASTER_API_KEY,
      city,
      countryCode,
      size: 20,
    });

    const res = await fetch(`${this.base}/events.json?${params.toString()}`);
    if (!res.ok) throw new Error("Could not load events");

    const json = await res.json();
    return json._embedded?.events ?? [];
  }
}
