import { goto } from "$app/navigation";
import { buildBackendUrl } from "@/config/backend";
import { fetchWithAuthenticationCookie } from "@/utils/fetch-with-authentication-cookie";
import { backendUrls, DELETE, frontendUrls } from "types";

export async function deletePuzzle(id: string) {
    const response = await fetchWithAuthenticationCookie(
        buildBackendUrl(backendUrls.PUZZLE_DETAIL, {
            id
        }),
        {
            method: DELETE
        }
    );

    console.log(response)

    if (response.ok) {
        goto(frontendUrls.PUZZLES);
    } else {
        alert("Failed to delete puzzle.");
    }
}