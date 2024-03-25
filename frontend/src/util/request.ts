export function serverUrl() {
    if (process.env.NODE_ENV === "production") {
        return window.location.origin;
    }
    return "http://localhost:4000";
}