# Ranked Games

Ranked games play a pivotal role in competitive gaming, where players' skill levels shape match outcomes and influence their standings in the broader community. The process of implementing ranked games involves several key steps to ensure fairness, accuracy, and an engaging player experience.

The system should safeguard against latecomers impacting ongoing games' rankings, thereby safeguarding an equitable ranking framework for all involved participants.

## Implementation

To establish a robust ranked game system, consider the following implementation steps:

- **Queue System**: When a player decides to play a ranked game, they enter a queue. The system continuously checks the queue for suitable opponents based on similar skill levels and availability.
- **Matchmaking and Game Initialization**: Once a suitable match is found, the system initializes a ranked game with all the participating players from the queue. These players are in the game from the start, ensuring fairness and consistent ranking adjustments.
- **Match Outcome and Rating Adjustment**: After the game concludes, an algorithm calculates the updated ratings for each player based on the match outcome and the ratings of their opponents. The ratings and deviations are adjusted to reflect the results, with more significant adjustments for players with higher uncertainties.
- **Repeat Process**: Players continue to enter the queue and participate in ranked games. The algorithm consistently updates their ratings based on their performance in these games over time.

## Ranking algorithms

An effective ranking system is crucial for accurately assessing player skill in ranked games. One notable approach is the **Glicko2 algorithm** for its ability to generate meaningful and dynamic ratings.

### Glicko2

The Glicko2 algorithm is a popular choice for ranking systems in competitive gaming. It calculates player ratings based on their performance in matches and adjusts the ratings over time to reflect their current skill level.

#### Glicko2 Parameters

The Glicko2 algorithm uses parameters such as:

- Rating: represents a player's skill
- Rating Deviation: represents a player's uncertainty in their skill
- Volatility: represents a player's consistency

#### Rating Deviation based on Recent Performance

To keep the ratings current and accurate, the rating deviation should be influenced by the games played in the last X days. This means that recent games have a stronger impact on a player's rating than older ones. You can refer to the [Lichess GitHub repository](https://github.com/lichess-org/lila/blob/21f0eef20576b43bd8942e9a9f9a35543e346a76/modules/rating/src/main/Glicko.scala) for an example of how this can be implemented.
