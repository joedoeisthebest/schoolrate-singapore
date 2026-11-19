
"use client";

import { useEffect, useState, type FormEvent } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "../../lib/supabase";
import filter from "leo-profanity";

type SchoolProfileProps = {
  name: string;
  location: string;
  curriculum: string;
};

type Review = {
  id: string;
  school_slug: string;
  teachers_rating: number;
  atmosphere_rating: number;
  friends_rating: number;
  facilities_rating: number;
  learning_rating: number;
  review_text: string;
  created_at: string;
};

const categories = [
  "Teachers",
  "School atmosphere",
  "Friends & social life",
  "Facilities & activities",
  "Learning experience",
];

const categoryDescriptions = [
  "Teaching quality, subject knowledge, fairness and how approachable teachers are.",
  "Consider whether the school feels welcoming, inclusive, safe and supportive of students.",
  "Consider how easy it is to make friends, social opportunities and relationships between students.",
  "Consider classrooms, sports facilities, libraries, clubs, extracurricular activities and available equipment.",
  "Consider lesson quality, academic support, workload, learning resources and preparation for future studies.",
];

const ratingFields = [
  "teachers_rating",
  "atmosphere_rating",
  "friends_rating",
  "facilities_rating",
  "learning_rating",
] as const;

// Add Singaporean English and local slang to the
// package's built-in English profanity dictionary.
filter.add([
  "knn",
  "kknn",
  "kanina",
  "kanina",
  "cibai",
  "chibai",
  "cheebai",
  "cheebye",
  "cb",
  "ccb",
  "lanjiao",
  "lanjiao",
  "pukimak",
  "pukimak",
  "sial",
  "bodoh",
  "n1gga",
  "frick",
]);

function filterProfanity(text: string) {
  return filter.clean(text, {
    replaceKey: "*",
  });
}


function formatReviewDate(date: string) {
  return new Intl.DateTimeFormat("en-SG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Singapore",
  }).format(new Date(date));
}

const REVIEWS_PER_PAGE = 5;

export default function SchoolProfile({
  name,
  location,
  curriculum,
}: SchoolProfileProps) {
  const pathname = usePathname();
  const schoolSlug = pathname.split("/").filter(Boolean).pop() ?? "";

  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [review, setReview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");

  const [approvedReviews, setApprovedReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [currentReviewPage, setCurrentReviewPage] = useState(1);
  const [totalReviewCount, setTotalReviewCount] = useState(0);

  const [allRatingAverages, setAllRatingAverages] = useState<
    Record<string, number>
  >({});

  const [ratingsLoading, setRatingsLoading] = useState(true);

  const wordCount = review.trim()
    ? review.trim().split(/\s+/).length
    : 0;

  const allRatingsSelected = categories.every(
    (category) => ratings[category] !== undefined
  );

  const overallRating =
    Object.keys(allRatingAverages).length === ratingFields.length
      ? ratingFields.reduce(
          (sum, field) => sum + allRatingAverages[field],
          0
        ) / ratingFields.length
      : null;

  const totalReviewPages = Math.max(
    1,
    Math.ceil(totalReviewCount / REVIEWS_PER_PAGE)
  );

  useEffect(() => {
    let cancelled = false;

    async function loadRatingSummary() {
      setRatingsLoading(true);

      const { data, error } = await supabase
        .from("reviews")
        .select(
          "teachers_rating, atmosphere_rating, friends_rating, facilities_rating, learning_rating"
        )
        .eq("school_slug", schoolSlug)
        .eq("status", "approved");

      if (cancelled) return;

      if (error) {
        console.error("Could not load rating summary:", error);
        setAllRatingAverages({});
        setRatingsLoading(false);
        return;
      }

      const rows = data ?? [];
      const averages: Record<string, number> = {};

      for (const field of ratingFields) {
        if (rows.length === 0) continue;

        const total = rows.reduce(
          (sum, item) => sum + item[field],
          0
        );

        averages[field] = total / rows.length;
      }

      setAllRatingAverages(averages);
      setRatingsLoading(false);
    }

    if (schoolSlug) {
      loadRatingSummary();
    }

    return () => {
      cancelled = true;
    };
  }, [schoolSlug]);

  useEffect(() => {
    let cancelled = false;

    async function loadApprovedReviews() {
      setReviewsLoading(true);

      const from = (currentReviewPage - 1) * REVIEWS_PER_PAGE;
      const to = from + REVIEWS_PER_PAGE - 1;

      const { data, error, count } = await supabase
        .from("reviews")
        .select(
          "id, school_slug, teachers_rating, atmosphere_rating, friends_rating, facilities_rating, learning_rating, review_text, created_at",
          { count: "exact" }
        )
        .eq("school_slug", schoolSlug)
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .range(from, to);

      if (cancelled) return;

      if (error) {
        console.error("Could not load approved reviews:", error);
      } else {
        setApprovedReviews((data ?? []) as Review[]);
        setTotalReviewCount(count ?? 0);
      }

      setReviewsLoading(false);
    }

    if (schoolSlug) {
      loadApprovedReviews();
    }

    return () => {
      cancelled = true;
    };
  }, [schoolSlug, currentReviewPage]);

  function getAverage(field: (typeof ratingFields)[number]) {
    return allRatingAverages[field] ?? null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setMessageType("");

    if (!allRatingsSelected) {
      setMessage("Please rate all five categories before submitting.");
      setMessageType("error");
      return;
    }

    if (!review.trim()) {
      setMessage("Please write a review before submitting.");
      setMessageType("error");
      return;
    }

    if (wordCount > 500) {
      setMessage("Your review cannot exceed 500 words.");
      setMessageType("error");
      return;
    }

    setSubmitting(true);

    const { error } = await supabase.from("reviews").insert({
      school_slug: schoolSlug,
      teachers_rating: ratings["Teachers"],
      atmosphere_rating: ratings["School atmosphere"],
      friends_rating: ratings["Friends & social life"],
      facilities_rating: ratings["Facilities & activities"],
      learning_rating: ratings["Learning experience"],
      review_text: review.trim(),
    });

    setSubmitting(false);

    if (error) {
      console.error("Review submission error:", error);
      setMessage(
        "Sorry, your review could not be submitted. Please try again later."
      );
      setMessageType("error");
      return;
    }


    setRatings({});
setReview("");
setMessage(
  "Thank you! Your review has been submitted and is awaiting approval."
);
setMessageType("success");

setTimeout(() => {
  setShowReviewForm(false);
  setMessage("");
  setMessageType("");
}, 1500);
  }

  return (
    <main>
      <nav className="navbar">
        <a className="brand" href="/">
          SchoolRate<span>SG</span>
        </a>
        <div className="navlinks">
          <a href="/">Explore schools</a>
          <a href="/">Home</a>
        </div>
      </nav>

      <section className="school-profile-hero school-profile-header">
        <div className="school-profile-info">
          <p className="eyebrow">SCHOOL PROFILE · SINGAPORE</p>

          <h1>{name}</h1>

          <p>
            {location} · {curriculum}
          </p>

          <button
            type="button"
            className="review-cta"
            onClick={() => {
              setShowReviewForm(true);
              setMessage("");
              setMessageType("");
            }}
          >
            <span>Leave a review of this school</span>
            <span className="review-cta-arrow">→</span>
          </button>
        </div>

        <div className="school-profile-rating-panel">
          <p className="eyebrow">STUDENT RATINGS</p>

          <h2>How do students rate this school?</h2>

          <div className="profile-rating">
            <strong>
              {overallRating !== null ? overallRating.toFixed(1) : "—"}
            </strong>

            <span>
              {totalReviewCount === 1
                ? "1 approved student review"
                : `${totalReviewCount} approved student reviews`}
            </span>
          </div>

          <div className="profile-rating-stars">
            {overallRating !== null
              ? "★".repeat(Math.max(0, Math.min(5, Math.round(overallRating)))) +
                "☆".repeat(5 - Math.max(0, Math.min(5, Math.round(overallRating))))
              : "☆☆☆☆☆"}
          </div>

          <div className="school-rating-summary">
            <h3>Rating breakdown</h3>

            {categories.map((category, index) => {
              const average = getAverage(ratingFields[index]);

              return (
                <div className="rating-summary-row" key={category}>
                  <span>{category}</span>

                  <div className="rating-summary-score">
                    <strong>
                      {average !== null ? average.toFixed(1) : "—"}
                    </strong>

                    <span>
                      {average !== null
                        ? "★".repeat(Math.max(0, Math.min(5, Math.round(average)))) +
                          "☆".repeat(5 - Math.max(0, Math.min(5, Math.round(average))))
                        : "☆☆☆☆☆"}
                    </span>
                  </div>
                </div>
              );
            })}

            {ratingsLoading ? (
              <p className="rating-summary-note">
                Loading approved ratings...
              </p>
            ) : (
              <p className="rating-summary-note">
                {totalReviewCount === 0
                  ? "No approved reviews yet. Ratings will appear here when student reviews have been approved."
                  : `Based on ${totalReviewCount} approved ${
                      totalReviewCount === 1 ? "review" : "reviews"
                    }.`}
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="review-section">
        <p className="eyebrow">STUDENT EXPERIENCES</p>
        <h2>What students say</h2>

        {reviewsLoading ? (
          <p>Loading reviews...</p>
        ) : totalReviewCount === 0 ? (
          <p>No approved student reviews yet.</p>
        ) : (
          <div className="approved-reviews-list">
            {approvedReviews.map((item) => (
              <article className="student-review-card" key={item.id}>
                <div className="admin-review-meta">
                  <span>Anonymous student</span>

                  <span>{formatReviewDate(item.created_at)}</span>
                </div>

                <div className="student-review-ratings">
                  {categories.map((category, index) => (
                    <div
                      className="student-review-rating-row"
                      key={category}
                    >
                      <span>{category}</span>

                      <span
                        className="student-review-stars"
                        aria-label={`${item[ratingFields[index]]} out of 5 stars`}
                      >
                        {"★".repeat(item[ratingFields[index]])}
                        <span className="empty-stars">
                          {"☆".repeat(5 - item[ratingFields[index]])}
                        </span>
                      </span>
                    </div>
                  ))}
                </div>

                <p className="admin-review-text">
                  {item.review_text}
                </p>
              </article>
            ))}
          </div>
        )}

        {!reviewsLoading && totalReviewPages > 1 && (
          <div className="review-pagination">
            <button
              type="button"
              onClick={() =>
                setCurrentReviewPage((page) => page - 1)
              }
              disabled={currentReviewPage === 1}
            >
              Previous
            </button>

            <span>
              Page {currentReviewPage} of {totalReviewPages}
            </span>

            <button
              type="button"
              onClick={() =>
                setCurrentReviewPage((page) => page + 1)
              }
              disabled={currentReviewPage === totalReviewPages}
            >
              Next
            </button>
          </div>
        )}
      </section>

      {showReviewForm && (
        <div className="review-modal-overlay">
          <section
            className="review-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="review-modal-title"
          >
            <button
              type="button"
              className="review-modal-close"
              onClick={() => setShowReviewForm(false)}
              aria-label="Close review form"
            >
              ×
            </button>

            <p className="eyebrow">SHARE YOUR EXPERIENCE</p>

            <h2 id="review-modal-title">Review {name}</h2>

           
            <form
              className="student-review-form"
              onSubmit={handleSubmit}
            >
              {categories.map((category, index) => (
                <div
                  className="student-rating-field"
                  key={category}
                >
                  <label>{category}</label>

                  <p className="rating-category-description">
                    {categoryDescriptions[index]}
                  </p>

                  <div className="interactive-stars">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        className={
                          star <= (ratings[category] || 0)
                            ? "rating-star selected"
                            : "rating-star"
                        }
                        onClick={() => {
                          setRatings((previous) => ({
                            ...previous,
                            [category]: star,
                          }));
                          setMessage("");
                          setMessageType("");
                        }}
                        aria-label={`${star} out of 5 stars for ${category}`}
                        aria-pressed={ratings[category] === star}
                      >
                        ★
                      </button>
                    ))}

                    <span className="rating-value">
                      {ratings[category]
                        ? `${ratings[category]}/5`
                        : "Not rated"}
                    </span>
                  </div>
                </div>
              ))}

              <div className="student-review-text">
                <label htmlFor="student-review">
                  Tell us about your experience
                </label>

                <textarea
                  id="student-review"
                  value={review}
                  onChange={(event) => {
                    const filteredText = filterProfanity(
                      event.target.value
                    );

                    const words = filteredText.trim()
                      ? filteredText.trim().split(/\s+/)
                      : [];

                    if (words.length <= 500) {
                      setReview(filteredText);
                    } else {
                      setReview(words.slice(0, 500).join(" "));
                    }

                    setMessage("");
                    setMessageType("");
                  }}
                  placeholder="What is it really like to study here? Share your honest experience..."
                  rows={6}
                />

                <p className="review-word-counter">
                  {wordCount} / 500 words
                </p>
              </div>

              <button
                type="submit"
                className="review-button"
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Submit review"}
              </button>

              {message && (
                <p
                  className="review-form-note"
                  role="status"
                  style={{
                    color:
                      messageType === "success"
                        ? "#287747"
                        : "#b42318",
                  }}
                >
                  {message}
                </p>
              )}

              <p className="review-form-note">
                Reviews are submitted anonymously and checked before
                publication. Please do not include personal information
                about yourself or other people.
              </p>
            </form>
          </section>
        </div>
      )}

      <footer>
        <a className="brand" href="/">
          SchoolRate<span>SG</span>
        </a>

        <p>
          Independent school reviews and student experiences.
        </p>

        <small>
          © 2026 SchoolRate Singapore. All rights reserved.
        </small>
      </footer>
    </main>
  );
}
