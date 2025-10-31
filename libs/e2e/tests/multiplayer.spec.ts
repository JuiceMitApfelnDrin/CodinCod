import { test, expect, testUsers } from '@/fixtures/base.fixtures';
import { generateTestUsername } from '@/utils/test-helpers';
import { testIds } from 'types';

/**
 * Multiplayer E2E tests
 * @e2e @multiplayer
 */
test.describe('Multiplayer - Waiting Room', () => {
test('should create and join a room @e2e @multiplayer', async ({ browser }) => {
const context1 = await browser.newContext();
const context2 = await browser.newContext();

const page1 = await context1.newPage();
const page2 = await context2.newPage();

try {
const { AuthPage } = await import('@/pages/auth.page');
const { MultiplayerPage } = await import('@/pages/multiplayer.page');

const auth1 = new AuthPage(page1);
const multiplayer1 = new MultiplayerPage(page1);

await auth1.gotoRegister();
await auth1.register(generateTestUsername('host'), 'TestPassword123!');
await multiplayer1.gotoMultiplayer();

await page1.getByTestId(testIds.MULTIPLAYER_PAGE_BUTTON_HOST_ROOM).click();
await page1.waitForTimeout(500);

expect(await multiplayer1.isInRoom()).toBe(true);
expect(await multiplayer1.isHost()).toBe(true);

const auth2 = new AuthPage(page2);
const multiplayer2 = new MultiplayerPage(page2);

await auth2.gotoRegister();
await auth2.register(generateTestUsername('player'), 'TestPassword123!');
await multiplayer2.gotoMultiplayer();
await page2.waitForTimeout(1000);

const joinButton = page2.getByTestId(testIds.MULTIPLAYER_PAGE_BUTTON_JOIN_ROOM).first();
await joinButton.click();
await page2.waitForTimeout(500);

expect(await multiplayer2.isInRoom()).toBe(true);

const players1 = await multiplayer1.getPlayersInRoom();
const players2 = await multiplayer2.getPlayersInRoom();

expect(players1.length).toBe(2);
expect(players2.length).toBe(2);

} finally {
await context1.close();
await context2.close();
}
});

test('should handle game start countdown @e2e @multiplayer', async ({ browser }) => {
const context1 = await browser.newContext();
const context2 = await browser.newContext();

const page1 = await context1.newPage();
const page2 = await context2.newPage();

try {
const { AuthPage } = await import('@/pages/auth.page');
const { MultiplayerPage } = await import('@/pages/multiplayer.page');

const auth1 = new AuthPage(page1);
const multiplayer1 = new MultiplayerPage(page1);
const auth2 = new AuthPage(page2);
const multiplayer2 = new MultiplayerPage(page2);

await auth1.gotoRegister();
await auth1.register(generateTestUsername('host'), 'TestPassword123!');
await multiplayer1.gotoMultiplayer();
await page1.getByTestId(testIds.MULTIPLAYER_PAGE_BUTTON_HOST_ROOM).click();
await page1.waitForTimeout(500);

await auth2.gotoRegister();
await auth2.register(generateTestUsername('player'), 'TestPassword123!');
await multiplayer2.gotoMultiplayer();
await page2.waitForTimeout(1000);

const joinButton = page2.getByTestId(testIds.MULTIPLAYER_PAGE_BUTTON_JOIN_ROOM).first();
await joinButton.click();
await page2.waitForTimeout(500);

await page1.getByTestId(testIds.MULTIPLAYER_PAGE_BUTTON_START_ROOM).click();

expect(await multiplayer1.isGameStarting()).toBe(true);
expect(await multiplayer2.isGameStarting()).toBe(true);

await Promise.all([
multiplayer1.waitForGameStart(),
multiplayer2.waitForGameStart()
]);

await expect(page1).toHaveURL(/.*multiplayer\/[a-f0-9]+/);
await expect(page2).toHaveURL(/.*multiplayer\/[a-f0-9]+/);

} finally {
await context1.close();
await context2.close();
}
});
});
