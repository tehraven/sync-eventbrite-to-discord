import "../env";
import axios from "axios";
import eventbrite from "eventbrite";
import { EventBriteEvent, EventBriteVenue } from "../types/eventbrite";

const sdk = eventbrite({
  token: process.env.EVENTBRITE_PERSONAL_OAUTH_TOKEN,
});

export const getEventbriteEvents = async (filterToFutureAvailable = true) => {
  return sdk
    .request(
      `/organizations/${process.env.EVENTBRITE_ORGANIZATION_API_ID}/events/?time_filter=current_future&expand=venue,ticket_availability,event_sales_status`
    )
    .then(({ events }: any) => events as EventBriteEvent[])
    .then((apiEvents) =>
      apiEvents.filter(
        (e) =>
          !filterToFutureAvailable ||
          (e.published &&
            (!e.ticket_availability ||
              e.ticket_availability?.has_available_tickets) &&
            !e.is_locked &&
            e.start?.utc &&
            new Date(e.start?.utc).getTime() > new Date().getTime())
      )
    )
    .catch((e) => {
      console.error(e);
      return [] as EventBriteEvent[];
    });
};

export const getEventbriteEvent = async (
  id: EventBriteEvent["id"]
) => {
  return sdk
    .request(
      `/events/${id}/?expand=venue,ticket_availability,event_sales_status`
    )
    .catch((e) => {
      console.error(e);
      return [] as EventBriteEvent[];
    });
};

export const getVenueById = async (
  venueId?: EventBriteVenue["id"]
): Promise<Partial<EventBriteVenue>> => {
  if (!venueId) return null;
  const venue = await axios
    .get<EventBriteVenue>(
      `https://www.eventbrite.com/api/v3/venues/${venueId}}/`
    )
    .then((response) => {
      const thisVenue = response.data;
      return thisVenue;
    })
    .catch(() => null);
  return venue;
};
