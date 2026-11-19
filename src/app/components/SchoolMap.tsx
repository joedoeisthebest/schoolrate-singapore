
"use client";

import { useEffect, useRef } from "react";
import * as maplibregl from "maplibre-gl";

type SchoolCampus = {
  name: string;
  campus: string;
  lat: number;
  lng: number;
};

type SchoolRating = {
  rating: number;
  reviews: number;
};

type SchoolMapProps = {
  campuses: SchoolCampus[];
  ratings: Record<string, SchoolRating>;
};

const schoolSlugs: Record<string, string> = {
  "UWC South East Asia": "uwc-sea",
  "Tanglin Trust School": "tanglin-trust",
  "Dulwich College (Singapore)": "dulwich-college",
  "Singapore American School": "singapore-american",
  "Stamford American International School": "stamford-american",
  "Canadian International School": "canadian-international",
  "Australian International School": "australian-international",
  "Nexus International School": "nexus-international",
  "Dover Court International School": "dover-court",
  "Chatsworth International School": "chatsworth",
  "Overseas Family School": "overseas-family-school",
  "XCL World Academy": "xcl-world-academy",
  "One World International School": "one-world",
  "North London Collegiate School Singapore": "north-london",
  "St. Joseph's Institution International": "st-josephs-international",
  "International Community School": "international-community-school",
  "Global Indian International School": "global-indian",
  "Middleton International School": "middleton",
  "Invictus International School": "invictus",
  "German European School Singapore": "german-european",
  "Hwa Chong International School": "hwa-chong-international",
  "ACS (International) Singapore": "acs-international",
  "Brighton College (Singapore)": "brighton-college",
  "EtonHouse International School": "etonhouse",
  "ISS International School": "iss-international",
  "International French School (Singapore)": "international-french",
  "NPS International School": "nps-international",
  "Holland International School": "holland-international",
  "Sir Manasseh Meyer International School": "sir-manasseh-meyer",
  "Swiss School in Singapore": "swiss-school",
  "The Grange Institution": "the-grange",
  "The Perse School Singapore": "perse-school",
  "Astor International School": "astor-international",
  "DPS International School": "dps-international",
  "Knightsbridge House International School": "knightsbridge-house",
  "Westbourne College Singapore": "westbourne-college",
  "5 Steps Academy": "5-steps-academy",
};

export default function SchoolMap({ campuses, ratings }: SchoolMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://tiles.openfreemap.org/styles/liberty",
      center: [103.8198, 1.3521],
      zoom: 11,
      minZoom: 10,
      maxZoom: 18,
      maxBounds: [
        [103.55, 1.15],
        [104.1, 1.48],
      ],
    });

    map.addControl(
      new maplibregl.NavigationControl({
        showCompass: false,
      }),
      "top-right"
    );

    const markers: maplibregl.Marker[] = [];

    map.on("load", () => {
      campuses.forEach((campus) => {
        const slug = schoolSlugs[campus.name];

        const markerElement = document.createElement("div");
        markerElement.className = "school-map-marker";

        const pin = document.createElement("div");
        pin.className = "school-pin-dot";
        markerElement.appendChild(pin);

        const popupLink = document.createElement("a");
        popupLink.className = "school-popup-link";
        popupLink.href = slug ? `/schools/${slug}` : "#";
        popupLink.setAttribute(
          "aria-label",
          `View ratings for ${campus.name}`
        );

        const popupContent = document.createElement("div");
        popupContent.className = "school-popup-content";

        const schoolName = document.createElement("strong");
        schoolName.textContent = campus.name;

        const campusName = document.createElement("span");
        campusName.textContent = campus.campus;

        popupContent.appendChild(schoolName);
        popupContent.appendChild(campusName);

        const ratingRow = document.createElement("div");
        ratingRow.className = "school-popup-rating";

        const star = document.createElement("span");
        star.className = "school-popup-star";
        star.textContent = "★";

        ratingRow.appendChild(star);

        const rating = slug ? ratings[slug] : undefined;

        const ratingValue = document.createElement("strong");
        const reviewCount = document.createElement("small");

        if (rating && rating.reviews > 0) {
          ratingValue.textContent = rating.rating.toFixed(1);
          reviewCount.textContent = `${rating.reviews} ${
            rating.reviews === 1 ? "review" : "reviews"
          }`;
        } else {
          ratingValue.textContent = "Not rated yet";
          reviewCount.textContent = "No approved reviews";
        }

        ratingRow.appendChild(ratingValue);
        ratingRow.appendChild(reviewCount);

        popupContent.appendChild(ratingRow);
        popupLink.appendChild(popupContent);

        const popup = new maplibregl.Popup({
          offset: 16,
          closeButton: true,
          className: "school-map-popup",
        }).setDOMContent(popupLink);

        const marker = new maplibregl.Marker({
          element: markerElement,
          anchor: "center",
        })
          .setLngLat([campus.lng, campus.lat])
          .setPopup(popup)
          .addTo(map);

        markers.push(marker);
      });

      map.resize();
    });

    const resizeObserver = new ResizeObserver(() => {
      map.resize();
    });

    resizeObserver.observe(mapContainer.current);

    return () => {
      resizeObserver.disconnect();
      markers.forEach((marker) => marker.remove());
      map.remove();
    };
  }, [campuses, ratings]);

  return (
    <div className="school-map">
      <div ref={mapContainer} className="school-map-canvas" />
    </div>
  );
}
