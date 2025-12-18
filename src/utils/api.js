export const API_BASE =
    process.env.NODE_ENV === "production"
        ? process.env.REACT_APP_API
        : "http://localhost:4005";

export const EMP_PROFILE_FILE_BASE =
    process.env.NODE_ENV === "production"
        ? process.env.REACT_APP_EMP_PROFILE_FILE
        : "http://localhost:4000";

export const DASSIST_TICKET_FILES_BASE =
    process.env.NODE_ENV === "production"
        ? process.env.REACT_APP_DASSIST_TICKET_FILES
        : "http://localhost:4002";

export const DBUG_TICKET_FILES_BASE =
    process.env.NODE_ENV === "production"
        ? process.env.REACT_APP_DBUG_TICKET_FILES
        : "http://localhost:4004";

export const DTIME_LEAVE_FILES_BASE =
    process.env.NODE_ENV === "production"
        ? process.env.REACT_APP_DTIME_LEAVE_FILES
        : "http://localhost:4003";

export async function apiFetch(endpoint, options = {}) {
    return fetch(`${API_BASE}${endpoint}`, {
        credentials: "include",
        ...options,
    });
}
