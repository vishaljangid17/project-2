// ==================================================
// WANDERLUST — MODERN PREMIUM FREE MAP
// MAPLIBRE GL JS + OPENFREEMAP
// NO MAPBOX / NO API KEY
// ==================================================

import * as maplibregl from
    "https://unpkg.com/maplibre-gl@6.10.0/dist/maplibre-gl.mjs";


console.log("===== WANDERLUST MODERN MAP START =====");


// ==================================================
// FIND MAP
// ==================================================

const mapElement =
    document.getElementById("map");


if (!mapElement) {

    console.log("No map on this page.");

} else {

    console.log("✅ Map element found.");


    // ==================================================
    // GET COORDINATES
    // ==================================================

    const coordinatesData =
        mapElement.dataset.coordinates;


    console.log(
        "Raw coordinates:",
        coordinatesData
    );


    let coordinates;


    try {

        coordinates =
            JSON.parse(coordinatesData);

    } catch (error) {

        console.error(
            "❌ Invalid coordinates:",
            error
        );

    }


    // ==================================================
    // VALIDATE COORDINATES
    // ==================================================

    if (
        !Array.isArray(coordinates) ||
        coordinates.length !== 2
    ) {

        console.error(
            "❌ Coordinates missing:",
            coordinates
        );

    } else {


        coordinates =
            coordinates.map(Number);


        const longitude =
            coordinates[0];


        const latitude =
            coordinates[1];


        console.log(
            "📍 Longitude:",
            longitude
        );


        console.log(
            "📍 Latitude:",
            latitude
        );


        if (
            !Number.isFinite(longitude) ||
            !Number.isFinite(latitude)
        ) {

            console.error(
                "❌ Invalid coordinate values:",
                coordinates
            );

        } else {


            // ==================================================
            // CREATE MAP
            // ==================================================

            const map =
                new maplibregl.Map({

                    container: mapElement,

                    // ==========================================
                    // FREE OPENFREEMAP STYLE
                    // ==========================================

                    style:
                        "https://tiles.openfreemap.org/styles/liberty",


                    // ==========================================
                    // LOCATION
                    // ==========================================

                    center: [
                        longitude,
                        latitude
                    ],


                    // ==========================================
                    // PREMIUM-STYLE CAMERA
                    // ==========================================

                    zoom: 14.5,

                    pitch: 48,

                    bearing: -8,


                    // ==========================================
                    // MAP OPTIONS
                    // ==========================================

                    maxZoom: 20,

                    minZoom: 3,

                    maxPitch: 70,

                    dragRotate: true,

                    touchPitch: true,

                    attributionControl: true,

                    canvasContextAttributes: {
                        antialias: true
                    }

                });


            // ==================================================
            // NAVIGATION CONTROL
            // ==================================================

            map.addControl(

                new maplibregl.NavigationControl({

                    showCompass: true,

                    showZoom: true,

                    visualizePitch: true

                }),

                "top-right"

            );


            // ==================================================
            // FULLSCREEN CONTROL
            // ==================================================

            map.addControl(

                new maplibregl.FullscreenControl(),

                "bottom-right"

            );


            // ==================================================
            // SCALE CONTROL
            // ==================================================

            map.addControl(

                new maplibregl.ScaleControl({

                    maxWidth: 100,

                    unit: "metric"

                }),

                "bottom-left"

            );


            // ==================================================
            // MAP LOAD
            // ==================================================

            map.on(
                "load",
                function () {

                    console.log(
                        "✅ OPENFREEMAP STYLE LOADED"
                    );


                    // ==========================================
                    // PREMIUM CAMERA
                    // ==========================================

                    map.easeTo({

                        center: [
                            longitude,
                            latitude
                        ],

                        zoom: 14.5,

                        pitch: 48,

                        bearing: -8,

                        duration: 1000

                    });


                    // ==========================================
                    // FIX MAP SIZE
                    // ==========================================

                    setTimeout(
                        function () {

                            map.resize();

                        },
                        300
                    );


                    console.log(
                        "✅ WANDERLUST MAP READY"
                    );

                }
            );


            // ==================================================
            // MAP ERROR
            // ==================================================

            map.on(
                "error",
                function (event) {

                    console.error(
                        "❌ MAPLIBRE ERROR:",
                        event
                    );

                }
            );


            // ==================================================
            // CUSTOM WANDERLUST MARKER
            // ==================================================

            const markerElement =
                document.createElement("div");


            markerElement.className =
                "wanderlust-map-marker";


            markerElement.innerHTML = `

                <div class="wl-map-pin">

                    <div class="wl-map-pin-inner">

                        <i class="fa-solid fa-house"></i>

                    </div>

                </div>

            `;


            // ==================================================
            // CREATE MARKER
            // ==================================================

            const marker =
                new maplibregl.Marker({

                    element:
                        markerElement,

                    anchor:
                        "bottom"

                })

                .setLngLat([

                    longitude,

                    latitude

                ])

                .addTo(map);


            // ==================================================
            // LISTING INFORMATION
            // ==================================================

            const title =
                mapElement.dataset.title ||
                "Wanderlust Listing";


            const location =
                mapElement.dataset.location ||
                "Beautiful destination";


            // ==================================================
            // POPUP
            // ==================================================

            const popup =
                new maplibregl.Popup({

                    offset: 38,

                    closeButton: true,

                    closeOnClick: false,

                    maxWidth: "280px"

                });


            popup.setHTML(`

                <div class="wl-map-popup">

                    <div class="wl-popup-title">

                        ${title}

                    </div>


                    <div class="wl-popup-location">

                        <i class="fa-solid fa-location-dot"></i>

                        <span>
                            ${location}
                        </span>

                    </div>

                </div>

            `);


            // ==================================================
            // ATTACH POPUP
            // ==================================================

            marker.setPopup(popup);


            // ==================================================
            // MARKER CLICK
            // ==================================================

            markerElement.addEventListener(
                "click",
                function () {

                    console.log(
                        "📍 Listing marker clicked"
                    );

                }
            );


            // ==================================================
            // RESPONSIVE RESIZE
            // ==================================================

            window.addEventListener(
                "resize",
                function () {

                    map.resize();

                }
            );


            // ==================================================
            // SAFARI / FULLSCREEN RESIZE
            // ==================================================

            document.addEventListener(
                "fullscreenchange",
                function () {

                    setTimeout(
                        function () {

                            map.resize();

                        },
                        300
                    );

                }
            );


        }

    }

}