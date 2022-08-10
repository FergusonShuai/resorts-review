mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
  container: "map", // container ID
  style: "mapbox://styles/mapbox/outdoors-v11", // style URL
  center: resort.geometry.coordinates,
  zoom: 9, // starting zoom
});

new mapboxgl.Marker()
  .setLngLat(resort.geometry.coordinates)
  .setPopup(
    new mapboxgl.Popup({ offset: 20 }).setHTML(
      `<h4>${resort.title}</h4><p>${resort.location}</p>`
    )
  )
  .addTo(map);
