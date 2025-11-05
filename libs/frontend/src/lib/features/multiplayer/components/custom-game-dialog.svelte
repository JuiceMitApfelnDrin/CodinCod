<script lang="ts">
	import { Button } from "@/components/ui/button";
	import * as Dialog from "@/components/ui/dialog";
	import * as Select from "@/components/ui/select";
	import { Label } from "@/components/ui/label";
	import { Input } from "@/components/ui/input";
	import { Checkbox } from "@/components/ui/checkbox";
	import { testIds } from "$lib/types";
	import {
		DEFAULT_GAME_LENGTH_IN_SECONDS,
		type GameOptions,
		isString,
		DEFAULT_GAME_LENGTH_IN_MINUTES,
		type GameMode,
		type GameVisibility,
		gameModeEnum,
		gameVisibilityEnum
	} from "$lib/types";
	import { languages } from "@/stores/languages.store";

	let {
		open = $bindable(false),
		onHostRoom
	}: {
		open?: boolean;
		onHostRoom: (options: GameOptions) => void;
	} = $props();

	// Game options state
	let selectedMode = $state<GameMode>(gameModeEnum.FASTEST);
	let selectedVisibility = $state<GameVisibility>(gameVisibilityEnum.PUBLIC);
	let durationMinutes = $state<number>(DEFAULT_GAME_LENGTH_IN_MINUTES);
	let rated = $state<string>(String(true));
	let selectedLanguageIds = $state<Set<string>>(
		new Set(
			$languages
				.map((language) => language._id)
				.filter((languageId) => isString(languageId))
		)
	);

	// Derived states
	let allLanguagesSelected = $derived(
		$languages && selectedLanguageIds.size === $languages.length
	);
	let someLanguagesSelected = $derived(
		selectedLanguageIds.size > 0 && !allLanguagesSelected
	);

	function toggleLanguage(languageId: string) {
		if (selectedLanguageIds.has(languageId)) {
			selectedLanguageIds.delete(languageId);
		} else {
			selectedLanguageIds.add(languageId);
		}
		selectedLanguageIds = new Set(selectedLanguageIds);
	}

	function toggleAllLanguages() {
		if (allLanguagesSelected) {
			selectedLanguageIds.clear();
		} else {
			const ids =
				$languages
					?.map((l) => l._id)
					.filter((id): id is string => id !== undefined) || [];
			selectedLanguageIds = new Set(ids);
		}
	}

	function handleCreateRoom() {
		const options: GameOptions = {
			mode: selectedMode,
			visibility: selectedVisibility,
			maxGameDurationInSeconds: durationMinutes * 60,
			rated: Boolean(rated),
			allowedLanguages: []
		};

		// Only include allowedLanguages if specific languages are selected
		if (selectedLanguageIds.size > 0 && !allLanguagesSelected) {
			options.allowedLanguages = Array.from(selectedLanguageIds);
		}

		onHostRoom(options);
		open = false;

		// Reset form
		selectedMode = gameModeEnum.FASTEST;
		selectedVisibility = gameVisibilityEnum.PUBLIC;
		durationMinutes = DEFAULT_GAME_LENGTH_IN_SECONDS / 60;
		selectedLanguageIds.clear();
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="max-h-[90vh] overflow-y-auto sm:max-w-[500px]">
		<Dialog.Header>
			<Dialog.Title>Create a custom game</Dialog.Title>
			<Dialog.Description>Configure your game settings.</Dialog.Description>
		</Dialog.Header>

		<div class="space-y-6 py-4">
			<!-- Game Mode -->
			<div class="space-y-2">
				<Label for="game-mode">Game Mode</Label>
				<Select.Root bind:value={selectedMode} type="single">
					<Select.Trigger id="game-mode" class="w-full">
						{selectedMode}
					</Select.Trigger>
					<Select.Content>
						<Select.Group>
							{#each Object.values(gameModeEnum) as gameMode}
								<Select.Item value={gameMode}>
									{gameMode}
								</Select.Item>
							{/each}
						</Select.Group>
					</Select.Content>
				</Select.Root>
				<p class="text-muted-foreground text-sm">
					{#if selectedMode === gameModeEnum.FASTEST}
						Win by submitting a correct solution first
					{:else if selectedMode === gameModeEnum.SHORTEST}
						Win by writing the shortest correct code
					{:else if selectedMode === gameModeEnum.RANDOM}
						A random game mode will be select for you
					{/if}
				</p>
			</div>

			<!-- Visibility -->
			<div class="space-y-2">
				<Label for="visibility">Visibility</Label>
				<Select.Root bind:value={selectedVisibility} type="single">
					<Select.Trigger id="visibility" class="w-full">
						{selectedVisibility}
					</Select.Trigger>
					<Select.Content>
						<Select.Group>
							{#each Object.values(gameVisibilityEnum) as gameVisibility}
								<Select.Item value={gameVisibility}
									>{gameVisibility}</Select.Item
								>
							{/each}
						</Select.Group>
					</Select.Content>
				</Select.Root>
				<p class="text-muted-foreground text-sm">
					{#if selectedVisibility === gameVisibilityEnum.PUBLIC}
						Anyone can join this game
					{:else if selectedVisibility === gameVisibilityEnum.PRIVATE}
						Only players with an invite link can join
					{/if}
				</p>
			</div>

			<!-- Rated -->
			<div class="space-y-2">
				<Label for="visibility">Rated</Label>
				<Select.Root bind:value={rated} type="single">
					<Select.Trigger id="game-mode" class="w-full">
						{#if Boolean(rated)}
							Rated
						{:else}
							Casual
						{/if}
					</Select.Trigger>
					<Select.Content>
						<Select.Group>
							<Select.Item value={String(true)}>Rated</Select.Item>
							<Select.Item value={String(false)}>Casual</Select.Item>
						</Select.Group>
					</Select.Content>
				</Select.Root>
				<p class="text-muted-foreground text-sm">
					{#if rated}
						This game will affect your rating and appear on leaderboards
					{:else}
						Play for fun, this game won't affect your rating
					{/if}
				</p>
			</div>

			<!-- Duration -->
			<div class="space-y-2">
				<Label for="duration">
					Duration: {durationMinutes} minute{durationMinutes !== 1 ? "s" : ""}
				</Label>
				<Input
					id="duration"
					type="range"
					min="5"
					max="60"
					step="5"
					bind:value={durationMinutes}
					class="cursor-pointer"
				/>
				<div class="text-muted-foreground flex justify-between text-xs">
					<span>5 min</span>
					<span>60 min</span>
				</div>
			</div>

			<!-- Languages -->
			<div class="space-y-2">
				<Label>Allowed Languages (optional)</Label>
				<div class="max-h-48 space-y-2 overflow-y-auto rounded-md border p-3">
					<div class="flex items-center space-x-2">
						<Checkbox
							id="all-languages"
							checked={allLanguagesSelected || false}
							indeterminate={someLanguagesSelected}
							onCheckedChange={toggleAllLanguages}
						/>
						<Label for="all-languages" class="cursor-pointer font-semibold">
							All Languages
						</Label>
					</div>

					<div class="border-t pt-2">
						{#if $languages}
							{#each $languages as language}
								{@const langId = language._id}
								{#if langId}
									<div class="flex items-center space-x-2 py-1">
										<Checkbox
											id={`lang-${langId}`}
											checked={selectedLanguageIds.has(langId)}
											onCheckedChange={() => toggleLanguage(langId)}
										/>
										<Label
											for={`lang-${langId}`}
											class="cursor-pointer text-sm"
										>
											{language.language}
											{language.version}
										</Label>
									</div>
								{/if}
							{/each}
						{:else}
							<p class="text-muted-foreground text-sm">Loading languages...</p>
						{/if}
					</div>
				</div>
				<p class="text-muted-foreground text-sm">
					{selectedLanguageIds.size === 0
						? "All languages allowed"
						: `${selectedLanguageIds.size} language${selectedLanguageIds.size !== 1 ? "s" : ""} selected`}
				</p>
			</div>
		</div>

		<Dialog.Footer>
			<Button
				data-testid={testIds.CUSTOM_GAME_DIALOG_BUTTON_CANCEL}
				variant="outline"
				onclick={() => (open = false)}
			>
				Cancel
			</Button>
			<Button
				data-testid={testIds.CUSTOM_GAME_DIALOG_BUTTON_CREATE}
				onclick={handleCreateRoom}
			>
				Create Room
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
