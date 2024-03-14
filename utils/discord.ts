import {
  AnyThreadChannel, Guild, GuildScheduledEvent,
  GuildScheduledEventCreateOptions,
  GuildScheduledEventStatus, Snowflake,
  TextChannel
} from "discord.js";
import { compareTwoStrings } from "string-similarity";
import { getEventURLsFromString } from "./urls";

export const getGuildEvents = (guild: Guild) =>
  guild.scheduledEvents
    .fetch({ withUserCount: true, cache: false })
    .then((events) =>
      events.sort((a, b) => a.scheduledStartTimestamp - b.scheduledEndTimestamp)
    );

export const isSameEvent = <
  Compareable extends {
    name: string;
    start: Date;
    end: Date;
  }
>(
  a: Compareable,
  b: Compareable
) => {
  const textSimilarity = compareTwoStrings(a.name, b.name);

  const nameIsSimilar =
    a.name.toLowerCase() === b.name.toLowerCase() ||
    a.name.toLowerCase().includes(b.name.toLowerCase()) ||
    b.name.toLowerCase().includes(a.name.toLowerCase()) ||
    textSimilarity >= 0.5;

  const sameStartMonth =
    a.start && b.start && a.start.getMonth() === b.start.getMonth();
  const sameStartDate =
    a.start && b.start && a.start.getDate() === b.start.getDate();
  const sameEndMonth = a.end && b.end && a.end.getMonth() === b.end.getMonth();
  const sameHourOrSimilar =
    a.start.getHours() === b.start.getHours() || nameIsSimilar;

  return sameStartMonth && sameStartDate && sameEndMonth && sameHourOrSimilar;
};

export const isNewDiscordEventDuplicateOfAnyDiscordEvents = (
  newEvent: GuildScheduledEventCreateOptions,
  existingEvents: Awaited<ReturnType<typeof getGuildEvents>>
) => {
  const foundMatch = existingEvents.find((e) =>
    isSameEvent(
      {
        name: e.name,
        start: e.scheduledStartAt,
        end: e.scheduledEndAt,
      },
      {
        name: newEvent.name,
        start: new Date(newEvent.scheduledStartTime),
        end: new Date(newEvent.scheduledEndTime),
      }
    )
  );
  return foundMatch;
};

type DiscordEventsAndThreadType = Record<
  GuildScheduledEvent["id"],
  {
    event: GuildScheduledEvent;
    threadId?: AnyThreadChannel["id"];
  }
>;

export const postNewEventAndThread = async (
  event: GuildScheduledEvent<GuildScheduledEventStatus>,
  forceDisablePings = false
) => {
  if (!event?.id) return;

  let destination: Snowflake = "1147248200718233630";

  const eventDate = `${new Date(
    event.scheduledStartTimestamp
  ).toLocaleDateString("en-us", {
    month: "short",
    day: "numeric",
    timeZone: "America/Los_Angeles",
  })}`;

  if (forceDisablePings) {
    return;
  }
  const pingMessage = await event.guild.channels
    .fetch(destination)
    .then((channel: TextChannel) => channel.send(event.url))
    .catch(() => null);

  await pingMessage
    .startThread({
      name: `${eventDate} - ${event.name}`,
    })
    .catch((e) => {
      console.error(e);
    });
};

export const mergeDiscordEvents = async (
  existingEvent: GuildScheduledEvent,
  newEvent: GuildScheduledEventCreateOptions,
  addLink: { label?: "Fetlife" | "Website" | "Tickets"; url?: string }
) => {
  const matchesA = getEventURLsFromString(existingEvent.description);
  const matchesB = getEventURLsFromString(newEvent.description);
  let fetlifeURL = matchesA.fetlifeURL || matchesB.fetlifeURL;
  let eventBriteURL = matchesA.eventBriteURL || matchesB.eventBriteURL;
  let websiteURL = matchesA.websiteURL || matchesB.websiteURL;

  if (addLink?.label && addLink?.url?.length) {
    switch (addLink?.label) {
      case "Fetlife":
        fetlifeURL = addLink.url;
        break;
      case "Website":
        websiteURL = addLink.url;
        break;
      case "Tickets":
        eventBriteURL = addLink.url;
        break;
    }
  }

  let newDescription: string = existingEvent.description;
  if (newEvent.description?.length > existingEvent.description?.length + 10) {
    newDescription = newEvent.description;
  }

  let matcher = /(Fetlife: https:\/\/fetlife\.com\/events\/\d+)/gi;
  newDescription = newDescription.replaceAll(matcher, "");
  newDescription = newDescription.replace(fetlifeURL || "", "");
  matcher = /(Website: https:\/\/jesterpresents\.com\/[a-zA-Z\-\d\/]*)/gi;
  newDescription = newDescription.replaceAll(matcher, "");
  newDescription = newDescription.replace(websiteURL || "", "");
  matcher = /(Tickets: https:\/\/www\.eventbrite\.com\/e\/[a-zA-Z\-\d\/]*)/gi;
  newDescription = newDescription.replaceAll(matcher, "");
  newDescription = newDescription.replace(eventBriteURL, "");

  if (newDescription.length > 750)
    newDescription = newEvent.description.slice(0, 750) + "...";

  if (fetlifeURL?.length) {
    newDescription = `${newDescription}\n\n Fetlife: ${fetlifeURL}`;
    newDescription = newDescription.replace("Fetlife: \n", "");
  }
  if (websiteURL?.length) {
    newDescription = `${newDescription}\n\n Website: ${websiteURL}`;
    newDescription = newDescription.replace("Website: \n", "");
  }
  if (eventBriteURL?.length) {
    newDescription = `${newDescription}\n\n Tickets: ${eventBriteURL}`;
    newDescription = newDescription.replace("Tickets: \n", "");
  }
  while (newDescription.includes("\n\n ")) {
    newDescription = newDescription.replace("\n\n ", "\n\n");
  }
  while (newDescription.includes("\n\n\n")) {
    newDescription = newDescription.replace("\n\n\n", "\n\n");
  }
  newDescription = newDescription.trim();

  let newImage = existingEvent.image;
  if (typeof newEvent.image === "string" && newEvent.image?.length) {
    newImage = newEvent.image;
  }

  const editValues: Parameters<GuildScheduledEvent["edit"]>[0] = {
    description:
      newDescription !== existingEvent.description ? newDescription : undefined,
    image: newImage !== existingEvent.image ? newImage : undefined,
    reason: "merged update",
  };

  return existingEvent.edit(
    Object.keys(editValues).reduce((acc, cur) => {
      if (editValues[cur]) {
        return {
          ...acc,
          [cur]: editValues[cur],
        };
      }
      return acc;
    }, {})
  );
};
