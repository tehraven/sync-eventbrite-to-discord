import "../env";

import {
  Client,
  DiscordAPIError,
  Events,
  GatewayIntentBits,
  GuildScheduledEvent,
  GuildScheduledEventCreateOptions,
  GuildScheduledEventEntityType,
  GuildScheduledEventPrivacyLevel,
  Partials,
} from "discord.js";
import {
  getGuildEvents,
  isNewDiscordEventDuplicateOfAnyDiscordEvents,
  mergeDiscordEvents,
  postNewEventAndThread,
} from "../utils/discord";
import { getEventbriteEvents, getVenueById } from "../utils/eventbrite";

const DiscordClient = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMembers,
  ],
  partials: [Partials.Channel, Partials.Message],
});

DiscordClient.on(Events.ClientReady, async () => {});
DiscordClient.on(Events.Error, (error) => {});

DiscordClient.on(Events.MessageCreate, async (msg) => {
  /* You could listen for messages here and react to them. */
});

DiscordClient.login(process.env.DISCORD_BOT_TOKEN as string)
  .then(() => {
    console.log("Discord Bot logged in");
    return DiscordClient.guilds.fetch(process.env.DISCORD_SERVER_ID as string);
  })
  .then(async (guild) => {
    const existingDiscordEvents = await getGuildEvents(guild);
    console.log("Discord Events", existingDiscordEvents.size);
    return getEventbriteEvents().then((events) => {
      return Promise.all(
        events.map(async (event) => {
          const venue = await getVenueById(event.venue_id);
          const newEvent: GuildScheduledEventCreateOptions = {
            name: event.name.text,
            scheduledStartTime: event.start?.utc as string,
            scheduledEndTime:
              event.end?.utc ??
              new Date(event.start?.utc as string).getTime() +
                1000 * 60 * 60 * 3,
            privacyLevel: GuildScheduledEventPrivacyLevel.GuildOnly,
            entityType: GuildScheduledEventEntityType.External,
            description: event.description?.text,
            entityMetadata: {
              location:
                venue?.address?.localized_address_display || "See EventBrite",
            },
            image: event.logo?.original?.url,
          };

          const match = isNewDiscordEventDuplicateOfAnyDiscordEvents(
            newEvent,
            existingDiscordEvents
          );
          if (match) {
            if (process.env.DRY_RUN != "1") {
              return mergeDiscordEvents(match, newEvent, { label: 'Tickets', url: event.url })
                .then((e) => {
                  console.log(
                    "Updated from EventBrite",
                    match.name,
                    newEvent.name
                  );
                  return null;
                })
                .catch((e: DiscordAPIError) => {
                  console.error("Error Updating", e.message);
                  return null;
                });
            } else {
              console.log(
                "DRY RUN, Dupe skipped",
                newEvent.name,
                newEvent.scheduledStartTime
              );
            }
          }

          console.log(event.name.text);
          if (process.env.DRY_RUN != "1") {
            const DiscordEvent: Promise<GuildScheduledEvent> =
              guild.scheduledEvents.create(newEvent);
            return DiscordEvent;
          } else {
            console.log("DRY RUN, Skipping Creation:", newEvent.name);
          }
        })
      );
    });
  })
  .then(async (discordEvents) => {
    await Promise.all(
      discordEvents
        .filter((discordEvent) => !!discordEvent)
        .map(e => postNewEventAndThread(e))
    ).catch((e) => {
      console.error(e);
    });
    return discordEvents;
  })
  .then((discordEvents) =>
    console.log(
      "Created Events:",
      discordEvents?.filter((e) => e)?.map((e: any) => e?.name)
    )
  )
  .catch((e) => {
    console.error("EventBrite-Discord Error", e);
  })
  .finally(async () => {
    await DiscordClient.destroy();
    process.exit();
  });
