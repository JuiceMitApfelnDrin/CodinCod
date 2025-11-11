<script lang="ts">
	import type { AccountProfileUpdateRequest } from "@/api/generated/schemas/accountProfileUpdateRequest";
	import {
		showErrorNotification,
		showSuccessNotification
	} from "$lib/api/notifications";
	import { Input } from "@/components/ui/input";
	import { Textarea } from "@/components/ui/textarea";
	import { testIds } from "@codincod/shared/constants/test-ids";
	import { updateProfileSchema } from "$lib/types/core/profile/schema/update-profile.schema";
	import { z } from "zod";
	import { toast } from "svelte-sonner";
	import { authenticatedUserInfo } from "@/stores/auth.store";
	import { onMount } from "svelte";
	import Button from "#/ui/button/button.svelte";
	import LogicalUnit from "@/components/ui/logical-unit/logical-unit.svelte";
	import H2 from "@/components/typography/h2.svelte";
	import { ApiError } from "@/api/errors";
	import { codincodApiWebAccountControllerUpdateProfile } from "@/api/generated/account/account";
	import { codincodApiWebUserControllerShow } from "@/api/generated/user/user";

	let bio = $state("");
	let location = $state("");
	let picture = $state("");
	let socials = $state<string[]>([]);
	let newSocial = $state("");
	let loading = $state(false);
	let mounted = $state(false);
	let validationErrors = $state<Record<string, string>>({});

	onMount(async () => {
		mounted = true;

		// Load current user data
		const username = $authenticatedUserInfo?.username;
		if (!username) {
			toast.error("Not authenticated");
			return;
		}

		try {
			const userData = await codincodApiWebUserControllerShow(username);
			const userProfile = userData.user?.profile;
			if (userProfile) {
				bio = userProfile.bio ?? "";
				location = userProfile.location ?? "";
				picture = userProfile.picture ?? "";
				socials = userProfile.socials ?? [];
			}
		} catch (error) {
			showErrorNotification(error, { title: "Failed to Load Profile" });
		}
	});

	async function handleSubmit(e: Event) {
		e.preventDefault();
		loading = true;
		validationErrors = {};

		try {
			// Validate with Zod schema
			const profileData = {
				bio: bio.trim() || undefined,
				location: location.trim() || undefined,
				picture: picture.trim() || undefined,
				socials:
					socials.filter((s) => s.trim()).length > 0
						? socials.filter((s) => s.trim())
						: undefined
			};

			const validationResult = updateProfileSchema.safeParse(profileData);

			if (!validationResult.success) {
				const errors: Record<string, string> = {};
				validationResult.error.issues.forEach((err: z.ZodIssue) => {
					const path = err.path.join(".");
					errors[path] = err.message;
				});
				validationErrors = errors;

				// Show first error to user
				const firstError = Object.values(errors)[0];
				toast.error(firstError);
				loading = false;
				return;
			}

			// Clean up undefined values
			const cleanData = {
				...(profileData.bio && { bio: profileData.bio }),
				...(profileData.location && { location: profileData.location }),
				...(profileData.picture && { picture: profileData.picture }),
				...(profileData.socials && { socials: profileData.socials })
			};

			// Clean and prepare data for API call
			const apiPayload: AccountProfileUpdateRequest = {};
			if (cleanData.bio) apiPayload.bio = cleanData.bio;
			if (cleanData.location) apiPayload.location = cleanData.location;
			if (cleanData.picture) apiPayload.picture = cleanData.picture;
			if (cleanData.socials) apiPayload.socials = cleanData.socials;

			await codincodApiWebAccountControllerUpdateProfile(apiPayload);

			showSuccessNotification("Profile updated successfully!");
			validationErrors = {};
		} catch (error) {
			if (error instanceof ApiError) {
				// Handle field-level errors
				const fieldErrors = error.getFieldErrors();
				if (Object.keys(fieldErrors).length > 0) {
					validationErrors = Object.entries(fieldErrors).reduce(
						(acc, [key, msgs]: [string, string[]]) => {
							acc[key] = msgs[0];
							return acc;
						},
						{} as Record<string, string>
					);
					toast.error("Please fix the validation errors");
				} else {
					showErrorNotification(error, { title: "Failed to Update Profile" });
				}
			} else {
				showErrorNotification(error, { title: "Failed to Update Profile" });
			}
		} finally {
			loading = false;
		}
	}

	function addSocial() {
		const trimmedSocial = newSocial.trim();

		if (!trimmedSocial) {
			toast.error("Please enter a URL");
			return;
		}

		if (socials.length >= 5) {
			toast.error("Maximum of 5 social links allowed");
			return;
		}

		const urlSchema = z.string().trim().url("Social link must be a valid URL");
		const result = urlSchema.safeParse(trimmedSocial);
		if (!result.success) {
			toast.error(
				result.error.issues[0]?.message || "Please enter a valid URL"
			);
			return;
		}

		// Check for duplicates
		if (socials.includes(trimmedSocial)) {
			toast.error("This link is already added");
			return;
		}

		socials = [...socials, trimmedSocial];
		newSocial = "";
		toast.success("Social link added");
	}

	function removeSocial(index: number) {
		socials = socials.filter((_, i) => i !== index);
		toast.success("Social link removed");
	}
</script>

<svelte:head>
	<title>Profile settings | CodinCod</title>
	<meta
		name="description"
		content="Update your profile information, bio, and social links."
	/>
	<meta name="author" content="CodinCod contributors" />
</svelte:head>

<h1 class="sr-only">Profile</h1>

<LogicalUnit class="flex w-full flex-col gap-8">
	<LogicalUnit class="flex flex-col gap-4">
		<H2>Edit Profile</H2>
		<p class="text-muted-foreground text-sm">
			Update your public profile information that other users can see
		</p>
	</LogicalUnit>

	<form onsubmit={handleSubmit} class="flex flex-col gap-8">
		<LogicalUnit class="flex flex-col gap-4">
			<H2>Bio</H2>
			<div class="flex flex-col gap-2">
				<p class="text-muted-foreground text-sm">
					Share a bit about yourself. This will be displayed on your public
					profile.
				</p>
				<Textarea
					id="bio"
					bind:value={bio}
					placeholder="Tell us about yourself..."
					maxlength={500}
					rows={4}
					data-testid={testIds.PROFILE_SETTINGS_TEXTAREA_BIO}
				/>
				<div class="flex items-center justify-between">
					<p class="text-muted-foreground text-xs">
						{bio.length}/500 characters
					</p>
					{#if validationErrors.bio}
						<p class="text-destructive text-xs">{validationErrors.bio}</p>
					{/if}
				</div>
			</div>
		</LogicalUnit>

		<LogicalUnit class="flex flex-col gap-4">
			<H2>Location</H2>
			<div class="flex flex-col gap-2">
				<p class="text-muted-foreground text-sm">
					Where are you based? This helps other users connect with you.
				</p>
				<Input
					id="location"
					bind:value={location}
					placeholder="City, Country"
					maxlength={100}
					data-testid={testIds.PROFILE_SETTINGS_INPUT_LOCATION}
				/>
				{#if validationErrors.location}
					<p class="text-destructive text-xs">{validationErrors.location}</p>
				{/if}
			</div>
		</LogicalUnit>

		<LogicalUnit class="flex flex-col gap-4">
			<H2>Profile Picture</H2>
			<div class="flex flex-col gap-2">
				<p class="text-muted-foreground text-sm">
					Add a profile picture URL. Must be a valid image URL.
				</p>
				<Input
					id="picture"
					type="url"
					bind:value={picture}
					placeholder="https://example.com/avatar.jpg"
					data-testid={testIds.PROFILE_SETTINGS_INPUT_PICTURE}
				/>
				{#if validationErrors.picture}
					<p class="text-destructive text-xs">{validationErrors.picture}</p>
				{/if}
			</div>
		</LogicalUnit>

		<LogicalUnit class="flex flex-col gap-4">
			<H2>Social Links</H2>
			<div class="flex flex-col gap-2">
				<p class="text-muted-foreground text-sm">
					Add up to 5 social media links to your profile (Twitter, GitHub,
					LinkedIn, etc.)
				</p>
				{#if validationErrors.socials}
					<p class="text-destructive text-xs">{validationErrors.socials}</p>
				{/if}

				<div class="flex flex-col gap-2">
					{#each socials as social, index}
						<div class="flex items-center gap-2">
							<Input
								value={social}
								readonly
								class="flex-1"
								data-testid={testIds.PROFILE_SETTINGS_INPUT_SOCIAL_LINK}
							/>
							<Button
								type="button"
								variant="destructive"
								size="sm"
								onclick={() => removeSocial(index)}
								data-testid={testIds.PROFILE_SETTINGS_BUTTON_REMOVE_SOCIAL}
							>
								Remove
							</Button>
						</div>
					{/each}

					{#if socials.length < 5}
						<div class="flex items-center gap-2">
							<Input
								type="url"
								bind:value={newSocial}
								placeholder="https://twitter.com/username"
								class="flex-1"
								data-testid={testIds.PROFILE_SETTINGS_INPUT_NEW_SOCIAL}
								onkeydown={(e: KeyboardEvent) => {
									if (e.key === "Enter") {
										e.preventDefault();
										addSocial();
									}
								}}
							/>
							<Button
								type="button"
								variant="outline"
								size="sm"
								onclick={addSocial}
								disabled={!newSocial.trim()}
								data-testid={testIds.PROFILE_SETTINGS_BUTTON_ADD_SOCIAL}
							>
								Add
							</Button>
						</div>
					{:else}
						<p class="text-muted-foreground text-xs">
							Maximum of 5 social links reached
						</p>
					{/if}
				</div>
			</div>
		</LogicalUnit>

		<Button
			type="submit"
			disabled={loading}
			data-testid={testIds.PROFILE_SETTINGS_BUTTON_SAVE}
		>
			{loading ? "Saving..." : "Save Changes"}
		</Button>
	</form>
</LogicalUnit>
