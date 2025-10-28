<script lang="ts">
	import { Button } from "@/components/ui/button";
	import * as Dialog from "@/components/ui/dialog";
	import * as Select from "@/components/ui/select";
	import { Label } from "@/components/ui/label";
	import { Input } from "@/components/ui/input";
	import { Checkbox } from "@/components/ui/checkbox";
	import { testIds } from "@/config/test-ids";
	import {
		GameModeEnum,
		GameVisibilityEnum,
		DEFAULT_GAME_LENGTH_IN_SECONDS,
		type ProgrammingLanguageDto,
		type GameOptions
	} from "types";
	import { languages } from "@/stores/languages";

	let {
		open = $bindable(false),
		onHostRoom
	}: {
		open?: boolean;
		onHostRoom: (options: Partial<GameOptions>) => void;
	} = $props();

	// Game options state
	let selectedMode = $state<string>(GameModeEnum.FASTEST);
	let selectedVisibility = $state<string>(GameVisibilityEnum.PUBLIC);
	let durationMinutes = $state<number>(DEFAULT_GAME_LENGTH_IN_SECONDS / 60);
	let selectedLanguageIds = $state<Set<string>>(new Set());

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
		const options: Partial<GameOptions> = {
			mode: selectedMode as any,
			visibility: selectedVisibility as any,
			maxGameDurationInSeconds: durationMinutes * 60
		};

		// Only include allowedLanguages if specific languages are selected
		if (selectedLanguageIds.size > 0 && !allLanguagesSelected) {
			options.allowedLanguages = Array.from(selectedLanguageIds);
		}

		onHostRoom(options);
		open = false;

		// Reset form
		selectedMode = GameModeEnum.FASTEST;
		selectedVisibility = GameVisibilityEnum.PUBLIC;
		durationMinutes = DEFAULT_GAME_LENGTH_IN_SECONDS / 60;
		selectedLanguageIds.clear();
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="max-h-[90vh] overflow-y-auto sm:max-w-[500px]">
		<Dialog.Header>
			<Dialog.Title>Create Custom Game</Dialog.Title>
			<Dialog.Description>
				Configure your game settings. Leave languages empty to allow all
				languages.
			</Dialog.Description>
		</Dialog.Header>

		<div class="space-y-6 py-4">
			<!-- Game Mode -->
			<div class="space-y-2">
				<Label for="game-mode">Game Mode</Label>
				<Select.Root bind:value={selectedMode} type="single">
					<Select.Trigger id="game-mode" class="w-full">
						{selectedMode === GameModeEnum.FASTEST && "🏃 Fastest"}
						{selectedMode === GameModeEnum.SHORTEST && "📏 Shortest"}
						{selectedMode === GameModeEnum.RATED && "⭐ Rated"}
						{selectedMode === GameModeEnum.CASUAL && "🎮 Casual"}
					</Select.Trigger>
					<Select.Content>
						<Select.Group>
							<Select.Item value={GameModeEnum.FASTEST} label="Fastest">
								Fastest
							</Select.Item>
							<Select.Item value={GameModeEnum.SHORTEST} label="Shortest">
								Shortest
							</Select.Item>
							<Select.Item value={GameModeEnum.RATED} label="Rated">
								Rated
							</Select.Item>
							<Select.Item value={GameModeEnum.CASUAL} label="Casual">
								Casual
							</Select.Item>
						</Select.Group>
					</Select.Content>
				</Select.Root>
				<p class="text-muted-foreground text-sm">
					{#if selectedMode === GameModeEnum.FASTEST}
						Win by submitting a correct solution first
					{:else if selectedMode === GameModeEnum.SHORTEST}
						Win by writing the shortest correct code
					{:else if selectedMode === GameModeEnum.RATED}
						Ranked matchmaking with ELO rating
					{:else}
						Casual play without ratings
					{/if}
				</p>
			</div>

			<!-- Visibility -->
			<div class="space-y-2">
				<Label for="visibility">Visibility</Label>
				<Select.Root bind:value={selectedVisibility} type="single">
					<Select.Trigger id="visibility" class="w-full">
						{selectedVisibility === GameVisibilityEnum.PUBLIC && "🌐 Public"}
						{selectedVisibility === GameVisibilityEnum.PRIVATE && "🔒 Private"}
					</Select.Trigger>
					<Select.Content>
						<Select.Group>
							<Select.Item value={GameVisibilityEnum.PUBLIC} label="Public">
								🌐 Public
							</Select.Item>
							<Select.Item value={GameVisibilityEnum.PRIVATE} label="Private">
								🔒 Private
							</Select.Item>
						</Select.Group>
					</Select.Content>
				</Select.Root>
				<p class="text-muted-foreground text-sm">
					{#if selectedVisibility === GameVisibilityEnum.PUBLIC}
						Anyone can join this game
					{:else}
						Only players with invite link can join
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
