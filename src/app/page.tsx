
"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import SchoolMapLoader from "./components/SchoolMapLoader";
import { schoolCampuses } from "../data/schoolCampuses";

type School = {
  name: string;
  slug: string;
  location: string;
  curriculum: string;
};

type ReviewRow = {
  school_slug: string;
  teachers_rating: number;
  atmosphere_rating: number;
  friends_rating: number;
  facilities_rating: number;
  learning_rating: number;
};

type SchoolRating = {
  rating: number;
  reviews: number;
};

const schools: School[] = [
  { name: "UWC South East Asia", slug: "uwc-sea", location: "Dover & Tampines", curriculum: "IB" },
  { name: "Tanglin Trust School", slug: "tanglin-trust", location: "Portsdown Road", curriculum: "British / IB" },
  { name: "Dulwich College (Singapore)", slug: "dulwich-college", location: "Bukit Batok", curriculum: "British / IB" },
  { name: "Singapore American School", slug: "singapore-american", location: "Woodlands", curriculum: "American" },
  { name: "Stamford American International School", slug: "stamford-american", location: "Woodleigh", curriculum: "IB / American" },
  { name: "Canadian International School", slug: "canadian-international", location: "Lakeside", curriculum: "IB" },
  { name: "Australian International School", slug: "australian-international", location: "Lorong Chuan", curriculum: "Australian / IB / IGCSE" },
  { name: "Nexus International School", slug: "nexus-international", location: "Aljunied", curriculum: "IB / IGCSE" },
  { name: "Dover Court International School", slug: "dover-court", location: "Dover Road", curriculum: "British / IB" },
  { name: "Chatsworth International School", slug: "chatsworth", location: "Bukit Tinggi Road", curriculum: "IB" },
  { name: "Overseas Family School", slug: "overseas-family-school", location: "Pasir Ris", curriculum: "IEYC / IPC / IB" },
  { name: "XCL World Academy", slug: "xcl-world-academy", location: "Yishun", curriculum: "IB / American Diploma / AP" },
  { name: "One World International School", slug: "one-world", location: "Nanyang, Punggol & Newton", curriculum: "IB / Cambridge" },
  { name: "North London Collegiate School Singapore", slug: "north-london", location: "Depot Road", curriculum: "NLCS / IB" },
  { name: "St. Joseph's Institution International", slug: "st-josephs-international", location: "Thomson Road", curriculum: "IPC / IGCSE / IB" },
  { name: "International Community School", slug: "international-community-school", location: "West Coast", curriculum: "American / AP" },
  { name: "Global Indian International School", slug: "global-indian", location: "Punggol", curriculum: "IB / Cambridge / CBSE" },
  { name: "Middleton International School", slug: "middleton", location: "Tampines", curriculum: "IPC / Cambridge IGCSE / A-Levels" },
  { name: "Invictus International School", slug: "invictus", location: "Dempsey Hill & Centrium Square", curriculum: "Cambridge / Bilingual" },
  { name: "German European School Singapore", slug: "german-european", location: "Dairy Farm", curriculum: "IB / German Curriculum" },
  { name: "Hwa Chong International School", slug: "hwa-chong-international", location: "Bukit Timah", curriculum: "Integrated Curriculum / IB" },
  { name: "ACS (International) Singapore", slug: "acs-international", location: "Holland Village", curriculum: "Cambridge IGCSE / IB" },
  { name: "Brighton College (Singapore)", slug: "brighton-college", location: "Chuan Lane", curriculum: "British / IGCSE / A-Levels" },
  { name: "EtonHouse International School", slug: "etonhouse", location: "Broadrick & Orchard", curriculum: "IB / IGCSE / International A-Levels" },
  { name: "ISS International School", slug: "iss-international", location: "Preston Road", curriculum: "IB" },
  { name: "International French School (Singapore)", slug: "international-french", location: "Ang Mo Kio", curriculum: "French / English International Stream" },
  { name: "NPS International School", slug: "nps-international", location: "Hillside & Scotts Road", curriculum: "Cambridge / IB / CBSE" },
  { name: "Holland International School", slug: "holland-international", location: "Newton / Novena", curriculum: "Dutch / English" },
  { name: "Sir Manasseh Meyer International School", slug: "sir-manasseh-meyer", location: "Sembawang", curriculum: "British" },
  { name: "Swiss School in Singapore", slug: "swiss-school", location: "Novena", curriculum: "Swiss / German / French" },
  { name: "The Grange Institution", slug: "the-grange", location: "Seletar", curriculum: "British" },
  { name: "The Perse School Singapore", slug: "perse-school", location: "Bukit Batok", curriculum: "British" },
  { name: "Astor International School", slug: "astor-international", location: "Tanglin", curriculum: "International Primary Curriculum (IPC)" },
  { name: "DPS International School", slug: "dps-international", location: "Kovan & Alexandra", curriculum: "Cambridge / ICSE" },
  { name: "Knightsbridge House International School", slug: "knightsbridge-house", location: "Bukit Merah & Changi", curriculum: "Cambridge / IGCSE / A-Levels" },
  { name: "Westbourne College Singapore", slug: "westbourne-college", location: "River Valley", curriculum: "IB Diploma Programme" },
  { name: "5 Steps Academy", slug: "5-steps-academy", location: "East Coast Road", curriculum: "Cambridge / US Curriculum" },
];

const SCHOOLS_PER_PAGE = 4;

export default function Home() {
  const [search, setSearch] = useState("");
  const [selectedCurriculum, setSelectedCurriculum] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [selectedRating, setSelectedRating] = useState("Default");
  const [viewMode, setViewMode] = useState<"top" | "list" | "map">("top");
  const [currentPage, setCurrentPage] = useState(1);
  const [schoolRatings, setSchoolRatings] = useState<Record<string, SchoolRating>>({});

  useEffect(() => {
    async function loadSchoolRatings() {
      const { data, error } = await supabase
        .from("reviews")
        .select("school_slug, teachers_rating, atmosphere_rating, friends_rating, facilities_rating, learning_rating")
        .eq("status", "approved");

      if (error) {
        console.error("Could not load school ratings:", error);
        return;
      }

      const totals: Record<string, { total: number; reviews: number }> = {};

      ((data ?? []) as ReviewRow[]).forEach((review) => {
        const total =
          review.teachers_rating +
          review.atmosphere_rating +
          review.friends_rating +
          review.facilities_rating +
          review.learning_rating;

        if (!totals[review.school_slug]) {
          totals[review.school_slug] = { total: 0, reviews: 0 };
        }

        totals[review.school_slug].total += total;
        totals[review.school_slug].reviews += 1;
      });

      const calculatedRatings: Record<string, SchoolRating> = {};

      Object.entries(totals).forEach(([slug, values]) => {
        calculatedRatings[slug] = {
          rating: values.total / (values.reviews * 5),
          reviews: values.reviews,
        };
      });

      setSchoolRatings(calculatedRatings);
    }

    loadSchoolRatings();
  }, []);

  const filtered = schools.filter((school) => {
    const matchesSearch =
      `${school.name} ${school.location} ${school.curriculum}`
        .toLowerCase()
        .includes(search.trim().toLowerCase());

    const matchesCurriculum =
      selectedCurriculum === "All" ||
      school.curriculum.toLowerCase().includes(selectedCurriculum.toLowerCase());

    const matchesLocation =
      selectedLocation === "All" || school.location === selectedLocation;

    return matchesSearch && matchesCurriculum && matchesLocation;
  });

  const visibleCampuses = schoolCampuses.filter((campus) =>
    filtered.some((school) => school.name === campus.name)
  );

  const sortedSchools = [...filtered].sort((a, b) => {
    if (selectedRating === "Default") return 0;

    const ratingA = schoolRatings[a.slug];
    const ratingB = schoolRatings[b.slug];

    if (!ratingA && !ratingB) return 0;
    if (!ratingA) return 1;
    if (!ratingB) return -1;

    if (selectedRating === "Highest") return ratingB.rating - ratingA.rating;
    if (selectedRating === "Lowest") return ratingA.rating - ratingB.rating;

    return 0;
  });

  const topRatedSchools = [...schools]
    .filter((school) => schoolRatings[school.slug]?.reviews > 0)
    .sort((a, b) => {
      const ratingA = schoolRatings[a.slug];
      const ratingB = schoolRatings[b.slug];

      if (ratingB.rating !== ratingA.rating) {
        return ratingB.rating - ratingA.rating;
      }

      return ratingB.reviews - ratingA.reviews;
    })
    .slice(0, 4);

  const totalPages = Math.ceil(filtered.length / SCHOOLS_PER_PAGE);
  const startIndex = (currentPage - 1) * SCHOOLS_PER_PAGE;

  const paginatedSchools = sortedSchools.slice(
    startIndex,
    startIndex + SCHOOLS_PER_PAGE
  );

  function handleSearchChange(value: string) {
    setSearch(value);
    setCurrentPage(1);
  }

  return (
    <main>
      <nav className="navbar">
        <a className="brand" href="/">
          SchoolRate<span>SG</span>
        </a>
      </nav>

      <section className="hero">
        <p className="eyebrow">SCHOOLRATESG</p>
        <h1>School Ratings Singapore</h1>
        <p className="subtitle">Reviews from students</p>

        <div className="hero-search">
          <span>⌕</span>
          <input
            type="search"
            placeholder="Search for your school..."
            value={search}
            onChange={(event) => handleSearchChange(event.target.value)}
          />
          {search && (
            <button type="button" onClick={() => handleSearchChange("")}>
              Clear
            </button>
          )}
        </div>

        {search.trim() && (
          <div className="hero-search-results">
            {filtered.length > 0 ? (
              filtered.map((school) => (
                <a key={school.slug} href={`/schools/${school.slug}`}>
                  <span>{school.name}</span>
                  <span>View →</span>
                </a>
              ))
            ) : (
              <p>No schools found. Try another name.</p>
            )}
          </div>
        )}
      </section>

      <div className="directory-view-toggle homepage-view-controls">
        <button
          type="button"
          className={viewMode === "list" ? "active" : ""}
          onClick={() => {
            setViewMode("list");
            setCurrentPage(1);
          }}
          aria-pressed={viewMode === "list"}
        >
          Full listing
        </button>

        <button
          type="button"
          className={viewMode === "map" ? "active" : ""}
          onClick={() => setViewMode("map")}
          aria-pressed={viewMode === "map"}
        >
          Map
        </button>
      </div>

      {viewMode === "top" && (
        <section className="top-rated-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">STUDENT RATINGS</p>
              <h2>Top 4 highest-rated schools</h2>
              <p className="description">
                The highest-rated schools based on approved student reviews.
              </p>
            </div>
          </div>

          {topRatedSchools.length > 0 ? (
            <div className="top-rated-grid">
              {topRatedSchools.map((school, index) => {
                const rating = schoolRatings[school.slug];

                return (
                  <article className="top-rated-card" key={school.slug}>
                    <div className="top-rated-rank">#{index + 1}</div>
                    <div className="top-rated-info">
                      <h3>{school.name}</h3>
                      <p>{school.location}</p>
                      <span>{school.curriculum}</span>
                    </div>
                    <div className="top-rated-score">
                      <strong>★ {rating.rating.toFixed(1)}</strong>
                      <small>
                        {rating.reviews} {rating.reviews === 1 ? "review" : "reviews"}
                      </small>
                    </div>
                    <a href={`/schools/${school.slug}`}>View school →</a>
                  </article>
                );
              })}
            </div>
          ) : (
            <p className="description">
              No approved student reviews yet. Top-rated schools will appear here
              once reviews have been approved.
            </p>
          )}
        </section>
      )}

      {(viewMode === "list" || viewMode === "map") && (
        <section className="directory" id="schools">
          <div className="section-heading">
            <div>
              <p className="eyebrow">INTERNATIONAL SCHOOLS</p>
              <h2>
                {viewMode === "list"
                  ? "International school ratings"
                  : "Explore schools on the map"}
              </h2>
            </div>
          </div>

          {viewMode === "list" && (
            <>
              <div className="school-grid">
                {paginatedSchools.map((school) => {
                  const rating = schoolRatings[school.slug];

                  return (
                    <article className="school-card" key={school.slug}>
                      <div className="school-info">
                        <h3>{school.name}</h3>
                        <p>{school.location}</p>
                        <span className="curriculum">{school.curriculum}</span>
                      </div>

                      <div className="school-rating">
                        <strong>{rating ? rating.rating.toFixed(1) : "—"}</strong>
                        <small>
                          {rating
                            ? `${rating.reviews} ${rating.reviews === 1 ? "review" : "reviews"}`
                            : "0 reviews"}
                        </small>
                      </div>

                      <a className="school-link" href={`/schools/${school.slug}`}>
                        View <span>→</span>
                      </a>
                    </article>
                  );
                })}

                {filtered.length === 0 && (
                  <p className="no-schools-found">
                    No schools found. Try another search.
                  </p>
                )}
              </div>

              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                    disabled={currentPage === 1}
                    aria-label="Previous page"
                  >
                    ←
                  </button>

                  {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                    (page) => (
                      <button
                        key={page}
                        type="button"
                        className={currentPage === page ? "active" : ""}
                        onClick={() => setCurrentPage(page)}
                        aria-current={currentPage === page ? "page" : undefined}
                      >
                        {page}
                      </button>
                    )
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage((page) => Math.min(totalPages, page + 1))
                    }
                    disabled={currentPage === totalPages}
                    aria-label="Next page"
                  >
                    →
                  </button>
                </div>
              )}

              <p className="pagination-info">
                {filtered.length > 0
                  ? `Showing ${startIndex + 1}–${Math.min(
                      startIndex + SCHOOLS_PER_PAGE,
                      filtered.length
                    )} of ${filtered.length} schools`
                  : "No schools to display"}
              </p>
            </>
          )}

          {viewMode === "map" && (
            <div className="school-map-container">
              <SchoolMapLoader
                campuses={visibleCampuses}
                ratings={schoolRatings}
              />
            </div>
          )}

          <p className="demo-note">
            School listings are demonstration content. Ratings and reviews will
            appear only when genuine approved reviews are submitted.
          </p>
        </section>
      )}

      <footer>
        <a className="brand" href="/">
          SchoolRate<span>SG</span>
        </a>

        <div className="footer-links">
          <a href="/privacy">Privacy Policy</a>
          <a href="/review-guidelines">Review Guidelines</a>
          <a href="/contact">Contact</a>
          <a href="/about">About</a>
        </div>

        <small>© 2026 SchoolRate Singapore. All rights reserved.</small>
      </footer>
    </main>
  );
}
