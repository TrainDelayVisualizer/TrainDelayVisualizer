export function serverUrl() {
    if (process.env.NODE_ENV === "production") {
        return window.location.origin + "/api";
    }
    return "http://localhost:4000/api";
}