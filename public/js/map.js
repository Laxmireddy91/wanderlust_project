const map = new maptilersdk.Map({
  container: "map",
  style: maptilersdk.MapStyle.STREETS,
  center: listingData.coordinates,
  zoom: 9,
  apiKey: maptilerKey
});

map.addControl(new maptilersdk.NavigationControl());

const marker = new maptilersdk.Marker()
  .setLngLat(listingData.coordinates)
  .setPopup(
    new maptilersdk.Popup({ offset: 25 }).setHTML(
      `<h4>${listingData.title}</h4>`
    )
  )
  .addTo(map);