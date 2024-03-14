export const getEventURLsFromString = (input: string) => {
    const URLMatch =
      /(?:(?:https?|ftp|file):\/\/|www\.|ftp\.)(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#\/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[A-Z0-9+&@#\/%=~_|$])/gim;
    const matchesA = input.matchAll(URLMatch);

    const matches = [
      ...Array.from(matchesA).map((a) => a[0])
    ];

    let fetlifeURL = '', eventBriteURL = '', websiteURL = '';

    for (var i = 0; i < matches.length; i++) {
      if (matches[i].toLowerCase().includes("https://fetlife.com/events/")) {
        fetlifeURL = matches[i].toLowerCase();
      }
      if (matches[i].toLowerCase().includes("https://www.eventbrite.com/e/")) {
        eventBriteURL = matches[i].toLowerCase();
      }
      if (
        matches[i].toLowerCase().includes("https://jesterpresents.com/") &&
        !matches[i].toLowerCase().includes("https://jesterpresents.com/accessibility")
      ) {
        if (!websiteURL?.length || websiteURL.length < matches[i].toLowerCase().length)
          websiteURL = matches[i].toLowerCase();
      }
    }

    return { fetlifeURL, eventBriteURL, websiteURL };
}