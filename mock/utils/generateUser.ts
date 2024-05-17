import { faker } from "@faker-js/faker"
import { generateSubmissions } from "./generateSubmission";

export const generateUser = () => {
    return {
        id: faker.string.uuid(),
        nickname: faker.internet.userName(),

        // in order to personalize the profile a bit a these fields could be added
        profile: {
            country: faker.location.countryCode(),
            bio: faker.lorem.paragraphs(),

            // links to various websites the user wants to direct attention to
            links: [
                "https://www.twitch.tv/juicemitapfelndrin",
                faker.internet.domainName()
            ],
            // banner_url: undefined,
            avatar_url: faker.image.avatar()
        },

        // achievements: [
        // 	// predetermined achievements with flags on a certain user if they have reached them or not
        // ],
        // guilds: [
        // 	// a group of friends that you can join to either battle other groups
        // 	// collect an overall better standing
        // 	// collect more achievements
        // 	// ...
        // 	// overall meant to motivate people into coding more
        // ],

        activity: {
            // created items
            contributions: [],
            submissions: generateSubmissions(500),
            games: []
        },
        created_at: faker.date.past(),
        streamer: {
            twitch: {},
            youtube: {}
        },
        followsYou: false,
        following: false,
        followable: true,
        blocking: false,
        patron: false,
        streaming: false
    };
};

export const generateUsers = (numUsers: number) => {
    return Array.from({ length: numUsers }, generateUser);
};