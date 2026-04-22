const mapContainer = document.getElementById("map");
if (mapContainer && typeof mapboxgl !== "undefined") {
    const token = typeof globalThis.mapToken === "string" ? globalThis.mapToken : "";
    const rawCoordinates = globalThis.coordinates;
    let parsedCoordinates = rawCoordinates;

    if (typeof rawCoordinates === "string") {
        try {
            parsedCoordinates = JSON.parse(rawCoordinates);
        } catch (error) {
            parsedCoordinates = null;
        }
    }

    if (!token) {
        console.error("Missing MAP_ACCESS_TOKEN. Set it in your .env file.");
    } else if (!Array.isArray(parsedCoordinates) || parsedCoordinates.length !== 2) {
        console.error("Invalid coordinates for this listing:", rawCoordinates);
    } else {
        mapboxgl.accessToken = token;

        const map = new mapboxgl.Map({
            container: "map",
            style: "mapbox://styles/mapbox/streets-v12",
            center: parsedCoordinates,
            zoom: 9
        });

        new mapboxgl.Marker({color: "red"}).setLngLat(parsedCoordinates).addTo(map);
    }
}