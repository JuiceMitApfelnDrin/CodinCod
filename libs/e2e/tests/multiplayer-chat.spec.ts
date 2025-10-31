import { test, expect } from '@/fixtures/base.fixtures';
import { generateTestUsername } from '@/utils/test-helpers';
import { testIds } from 'types';

/**
 * Multiplayer Chat E2E tests
 * Tests waiting room and in-game chat functionality
 * @e2e @multiplayer @chat
 */
test.describe('Multiplayer - Chat System', () => {
	test('should send and receive messages in waiting room @e2e @multiplayer', async ({ browser }) => {
		const context1 = await browser.newContext();
		const context2 = await browser.newContext();

		const page1 = await context1.newPage();
		const page2 = await context2.newPage();

		try {
			const { AuthPage } = await import('@/pages/auth.page');
			const { MultiplayerPage } = await import('@/pages/multiplayer.page');

			const auth1 = new AuthPage(page1);
			const multiplayer1 = new MultiplayerPage(page1);

			// Host creates a room
			await auth1.gotoRegister();
			await auth1.register(generateTestUsername('host'), 'TestPassword123!');
			await multiplayer1.gotoMultiplayer();
			await page1.getByTestId(testIds.MULTIPLAYER_PAGE_BUTTON_HOST_ROOM).click();
			await page1.waitForTimeout(500);

			// Player joins the room
			const auth2 = new AuthPage(page2);
			const multiplayer2 = new MultiplayerPage(page2);

			await auth2.gotoRegister();
			await auth2.register(generateTestUsername('player'), 'TestPassword123!');
			await multiplayer2.gotoMultiplayer();
			await page2.waitForTimeout(1000);

			const joinButton = page2.getByTestId(testIds.MULTIPLAYER_PAGE_BUTTON_JOIN_ROOM).first();
			await joinButton.click();
			await page2.waitForTimeout(500);

			// Host sends a message
			const testMessage = `Hello from host! ${Date.now()}`;
			await multiplayer1.sendChatMessage(testMessage);

			// Wait for message to appear on both clients
			await page1.waitForTimeout(1000);
			await page2.waitForTimeout(1000);

			// Both should see the message
			const chat1Content = await page1.locator('[data-testid*="chat"], .chat-messages').first().textContent();
			const chat2Content = await page2.locator('[data-testid*="chat"], .chat-messages').first().textContent();

			expect(chat1Content).toContain(testMessage);
			expect(chat2Content).toContain(testMessage);

		} finally {
			await context1.close();
			await context2.close();
		}
	});

	test('should support bidirectional chat in waiting room @e2e @multiplayer', async ({ browser }) => {
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

			// Setup both users
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

			// Both users send messages
			const hostMessage = `Host message ${Date.now()}`;
			const playerMessage = `Player message ${Date.now()}`;

			await multiplayer1.sendChatMessage(hostMessage);
			await page1.waitForTimeout(500);
			await multiplayer2.sendChatMessage(playerMessage);
			await page2.waitForTimeout(1000);

			// Both should see both messages
			const chat1Content = await page1.locator('[data-testid*="chat"], .chat-messages').first().textContent();
			const chat2Content = await page2.locator('[data-testid*="chat"], .chat-messages').first().textContent();

			expect(chat1Content).toContain(hostMessage);
			expect(chat1Content).toContain(playerMessage);
			expect(chat2Content).toContain(hostMessage);
			expect(chat2Content).toContain(playerMessage);

		} finally {
			await context1.close();
			await context2.close();
		}
	});

	test('should handle chat with 3+ players @e2e @multiplayer', async ({ browser }) => {
		const context1 = await browser.newContext();
		const context2 = await browser.newContext();
		const context3 = await browser.newContext();

		const page1 = await context1.newPage();
		const page2 = await context2.newPage();
		const page3 = await context3.newPage();

		try {
			const { AuthPage } = await import('@/pages/auth.page');
			const { MultiplayerPage } = await import('@/pages/multiplayer.page');

			// Host
			const auth1 = new AuthPage(page1);
			const multiplayer1 = new MultiplayerPage(page1);
			await auth1.gotoRegister();
			await auth1.register(generateTestUsername('host'), 'TestPassword123!');
			await multiplayer1.gotoMultiplayer();
			await page1.getByTestId(testIds.MULTIPLAYER_PAGE_BUTTON_HOST_ROOM).click();
			await page1.waitForTimeout(500);

			// Player 2
			const auth2 = new AuthPage(page2);
			const multiplayer2 = new MultiplayerPage(page2);
			await auth2.gotoRegister();
			await auth2.register(generateTestUsername('player2'), 'TestPassword123!');
			await multiplayer2.gotoMultiplayer();
			await page2.waitForTimeout(1000);
			await page2.getByTestId(testIds.MULTIPLAYER_PAGE_BUTTON_JOIN_ROOM).first().click();
			await page2.waitForTimeout(500);

			// Player 3
			const auth3 = new AuthPage(page3);
			const multiplayer3 = new MultiplayerPage(page3);
			await auth3.gotoRegister();
			await auth3.register(generateTestUsername('player3'), 'TestPassword123!');
			await multiplayer3.gotoMultiplayer();
			await page3.waitForTimeout(1000);
			await page3.getByTestId(testIds.MULTIPLAYER_PAGE_BUTTON_JOIN_ROOM).first().click();
			await page3.waitForTimeout(500);

			// All players send messages
			const msg1 = `Message from player 1 ${Date.now()}`;
			const msg2 = `Message from player 2 ${Date.now()}`;
			const msg3 = `Message from player 3 ${Date.now()}`;

			await multiplayer1.sendChatMessage(msg1);
			await page1.waitForTimeout(300);
			await multiplayer2.sendChatMessage(msg2);
			await page2.waitForTimeout(300);
			await multiplayer3.sendChatMessage(msg3);
			await page3.waitForTimeout(1000);

			// All players should see all messages
			const chat1 = await page1.locator('[data-testid*="chat"], .chat-messages').first().textContent();
			const chat2 = await page2.locator('[data-testid*="chat"], .chat-messages').first().textContent();
			const chat3 = await page3.locator('[data-testid*="chat"], .chat-messages').first().textContent();

			for (const chatContent of [chat1, chat2, chat3]) {
				expect(chatContent).toContain(msg1);
				expect(chatContent).toContain(msg2);
				expect(chatContent).toContain(msg3);
			}

		} finally {
			await context1.close();
			await context2.close();
			await context3.close();
		}
	});
});
