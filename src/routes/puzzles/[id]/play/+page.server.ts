import { buildBackendUrl } from '@/config/backend.js';
import { fail, error } from '@sveltejs/kit';
import { message, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { backendUrls, POST, submissionSchema, type PuzzleEntity } from 'types';

export async function load({ fetch, params }) {
    const id = params.id;
    const url = buildBackendUrl(backendUrls.PUZZLE_DETAIL, { id });

    try {
        const response = await fetch(url);

        if (!response.ok) {
            error(response.status, "Failed to fetch the puzzle.");
        }

        const puzzle: PuzzleEntity = await response.json();

        return { puzzle };

    } catch (err) {
        error(500, "Server error occurred while attempting to fetch the puzzle.");
    }
}

/**
 * TODO: fix this action, make it go to backend and execute a submission when clicked on run button thingy, otherwise the other thingy
 */
export const actions = {
    default: async ({ request, params }) => {
        const form = await superValidate(request, zod(submissionSchema));

        if (!form.valid) {
            // Again, return { form } and things will just work.
            fail(400, { form });
        }

        const id = params.id;
        const cookie = request.headers.get("cookie") || "";

        // Prepare the payload
        const body = form.data;

        // Update puzzle data to backend
        // const updateUrl = buildBackendUrl(backendUrls.PUZZLE_DETAIL, { id });
        // const response = await fetch(updateUrl, {
        //     method: POST,
        //     headers: {
        //         Cookie: cookie,
        //         "Content-Type": "application/json"
        //     },
        //     body: JSON.stringify(body),
        //     credentials: "include"
        // });

        // if (!response.ok) {
        //     fail(response.status, { form, error: "Failed to update the puzzle." });
        // }

        // Display a success status message
        return message(form, "Form updated successfully!");
    }
};
