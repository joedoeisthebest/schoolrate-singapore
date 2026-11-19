
"use client";

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

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
  status: string;
};

const ratingCategories = [
  { label: "Teachers", field: "teachers_rating" },
  { label: "School atmosphere", field: "atmosphere_rating" },
  { label: "Friends & social life", field: "friends_rating" },
  { label: "Facilities & activities", field: "facilities_rating" },
  { label: "Learning experience", field: "learning_rating" },
] as const;

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#F6F5F0",
    color: "#26382F",
    padding: "36px 24px 70px",
    fontFamily: "inherit",
  },
  container: {
    maxWidth: "1050px",
    margin: "0 auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    flexWrap: "wrap",
    marginBottom: "34px",
  },
  eyebrow: {
    color: "#718174",
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "2px",
    margin: "0 0 10px",
  },
  heading: {
    color: "#26382F",
    fontSize: "clamp(28px, 4vw, 38px)",
    fontWeight: 700,
    letterSpacing: "-1.2px",
    margin: "0 0 8px",
  },
  subtitle: {
    color: "#7B817B",
    fontSize: "14px",
    margin: 0,
  },
  logout: {
    background: "#FFFFFF",
    color: "#536459",
    border: "1px solid #E4E6DF",
    borderRadius: "9px",
    padding: "11px 18px",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
  },
  summary: {
    display: "flex",
    alignItems: "center",
    gap: "18px",
    background: "#EAEDE5",
    border: "1px solid #E0E5DB",
    borderRadius: "14px",
    padding: "20px 24px",
    marginBottom: "30px",
  },
  summaryNumber: {
    fontSize: "32px",
    fontWeight: 700,
    color: "#315B43",
    lineHeight: 1,
  },
  summaryLabel: {
    fontSize: "14px",
    fontWeight: 600,
    color: "#45594A",
    margin: "0 0 4px",
  },
  summaryDescription: {
    fontSize: "12px",
    color: "#788276",
    margin: 0,
  },
  sectionHeading: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    marginBottom: "18px",
    flexWrap: "wrap",
  },
  sectionTitle: {
    fontSize: "19px",
    fontWeight: 700,
    color: "#303D34",
    margin: 0,
  },
  sectionCount: {
    fontSize: "12px",
    color: "#718174",
    background: "#E9ECE5",
    padding: "6px 11px",
    borderRadius: "20px",
    fontWeight: 600,
  },
  card: {
    background: "#FFFFFF",
    border: "1px solid #EAEAE3",
    borderRadius: "15px",
    padding: "25px",
    marginBottom: "18px",
    boxShadow: "0 3px 14px rgba(38, 56, 47, 0.035)",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
    paddingBottom: "17px",
    borderBottom: "1px solid #F0F0EA",
    marginBottom: "18px",
  },
  schoolName: {
    fontSize: "15px",
    fontWeight: 700,
    color: "#34483A",
    margin: 0,
    overflowWrap: "anywhere",
  },
  date: {
    fontSize: "12px",
    color: "#969B93",
    margin: 0,
  },
  pending: {
    fontSize: "11px",
    fontWeight: 700,
    color: "#97733B",
    background: "#F8F1E2",
    borderRadius: "20px",
    padding: "6px 11px",
  },
  ratingsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(145px, 1fr))",
    gap: "10px",
    marginBottom: "21px",
  },
  ratingItem: {
    background: "#F7F8F4",
    borderRadius: "9px",
    padding: "12px",
  },
  ratingLabel: {
    fontSize: "11px",
    color: "#858D82",
    margin: "0 0 7px",
  },
  ratingValue: {
    fontSize: "14px",
    fontWeight: 700,
    color: "#405C47",
    margin: 0,
  },
  reviewLabel: {
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "1px",
    color: "#879083",
    margin: "0 0 10px",
    textTransform: "uppercase",
  },
  reviewText: {
    background: "#FAFAF7",
    border: "1px solid #F0F0EA",
    borderRadius: "10px",
    padding: "17px",
    color: "#505A51",
    fontSize: "14px",
    lineHeight: 1.8,
    whiteSpace: "pre-wrap",
    overflowWrap: "anywhere",
    marginBottom: "21px",
  },
  actions: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },
  approve: {
    background: "#315B43",
    color: "#FFFFFF",
    border: "none",
    borderRadius: "8px",
    padding: "11px 22px",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
  },
  reject: {
    background: "#FFFFFF",
    color: "#A4514A",
    border: "1px solid #E8D7D4",
    borderRadius: "8px",
    padding: "11px 22px",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
  },
  disabled: {
    opacity: 0.5,
    cursor: "not-allowed",
  },
  notice: {
    padding: "13px 16px",
    borderRadius: "9px",
    fontSize: "13px",
    marginBottom: "18px",
    background: "#EDF3EC",
    color: "#386044",
    border: "1px solid #DDE9DB",
  },
  error: {
    padding: "13px 16px",
    borderRadius: "9px",
    fontSize: "13px",
    marginBottom: "18px",
    background: "#FAEEEE",
    color: "#A3433B",
    border: "1px solid #EEDADA",
  },
  empty: {
    background: "#FFFFFF",
    border: "1px solid #EAEAE3",
    borderRadius: "15px",
    padding: "55px 24px",
    textAlign: "center",
  },
  emptyTitle: {
    color: "#405C47",
    fontSize: "18px",
    fontWeight: 700,
    margin: "0 0 8px",
  },
  emptyText: {
    color: "#858D82",
    fontSize: "13px",
    margin: 0,
    lineHeight: 1.6,
  },
};

function formatSchoolName(slug: string) {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-SG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Singapore",
  }).format(new Date(date));
}

export default function AdminPage() {
  const router = useRouter();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadReviews() {
      const { data: userData, error: userError } =
        await supabase.auth.getUser();

      if (userError || !userData.user) {
        router.replace("/admin/login");
        return;
      }

      const { data: admin, error: adminError } = await supabase
        .from("admin_users")
        .select("user_id")
        .eq("user_id", userData.user.id)
        .maybeSingle();

      if (adminError || !admin) {
        await supabase.auth.signOut();
        router.replace("/admin/login");
        return;
      }

      const { data, error: reviewsError } = await supabase
        .from("reviews")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (reviewsError) {
        setError("Could not load reviews. Please try again.");
      } else {
        setReviews((data ?? []) as Review[]);
      }

      setLoading(false);
    }

    loadReviews();
  }, [router]);

  async function handleDecision(
    reviewId: string,
    decision: "approved" | "rejected"
  ) {
    setUpdatingId(reviewId);
    setError("");
    setMessage("");

    const { error: updateError } = await supabase
      .from("reviews")
      .update({ status: decision })
      .eq("id", reviewId);

    if (updateError) {
      setError("The review could not be updated. Please try again.");
      setUpdatingId(null);
      return;
    }

    setReviews((current) =>
      current.filter((review) => review.id !== reviewId)
    );

    setMessage(
      decision === "approved"
        ? "Review approved successfully."
        : "Review rejected successfully."
    );

    setUpdatingId(null);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/admin/login");
  }

  if (loading) {
    return (
      <main style={styles.page}>
        <div style={styles.container}>
          <p style={styles.subtitle}>Loading your moderation dashboard...</p>
        </div>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <header style={styles.header}>
          <div>
            <p style={styles.eyebrow}>SCHOOLRATESG · ADMINISTRATION</p>
            <h1 style={styles.heading}>Review moderation</h1>
            <p style={styles.subtitle}>
              Review student experiences and help keep our community trustworthy.
            </p>
          </div>

          <button
            type="button"
            style={styles.logout}
            onClick={handleLogout}
          >
            Log out
          </button>
        </header>

        <section style={styles.summary}>
          <div style={styles.summaryNumber}>{reviews.length}</div>
          <div>
            <p style={styles.summaryLabel}>Reviews waiting for you</p>
            <p style={styles.summaryDescription}>
              These reviews are awaiting moderation.
            </p>
          </div>
        </section>

        <section>
          <div style={styles.sectionHeading}>
            <h2 style={styles.sectionTitle}>Your review inbox</h2>
            <span style={styles.sectionCount}>
              {reviews.length} pending
            </span>
          </div>

          {error && (
            <p role="alert" style={styles.error}>
              {error}
            </p>
          )}

          {message && (
            <p role="status" style={styles.notice}>
              {message}
            </p>
          )}

          {reviews.length === 0 ? (
            <div style={styles.empty}>
              <p style={styles.emptyTitle}>All caught up!</p>
              <p style={styles.emptyText}>
                There are no pending reviews right now.
                <br />
                New student submissions will appear here.
              </p>
            </div>
          ) : (
            reviews.map((review) => (
              <article style={styles.card} key={review.id}>
                <div style={styles.cardHeader}>
                  <div>
                    <p style={styles.schoolName}>
                      {formatSchoolName(review.school_slug)}
                    </p>
                    <p style={styles.date}>
                      Submitted {formatDate(review.created_at)}
                    </p>
                  </div>

                  <span style={styles.pending}>PENDING REVIEW</span>
                </div>

                <div style={styles.ratingsGrid}>
                  {ratingCategories.map((category) => (
                    <div style={styles.ratingItem} key={category.field}>
                      <p style={styles.ratingLabel}>{category.label}</p>
                      <p style={styles.ratingValue}>
                        {"★".repeat(
                          Math.max(
                            0,
                            Math.min(5, review[category.field])
                          )
                        )}
                        <span style={{ color: "#DADDD5" }}>
                          {"☆".repeat(
                            5 -
                              Math.max(
                                0,
                                Math.min(5, review[category.field])
                              )
                          )}
                        </span>
                        {" "}
                        {review[category.field]}/5
                      </p>
                    </div>
                  ))}
                </div>

                <p style={styles.reviewLabel}>Student's review</p>

                <div style={styles.reviewText}>
                  {review.review_text}
                </div>

                <div style={styles.actions}>
                  <button
                    type="button"
                    style={{
                      ...styles.approve,
                      ...(updatingId !== null ? styles.disabled : {}),
                    }}
                    onClick={() =>
                      handleDecision(review.id, "approved")
                    }
                    disabled={updatingId !== null}
                  >
                    {updatingId === review.id
                      ? "Updating..."
                      : "✓ Approve review"}
                  </button>

                  <button
                    type="button"
                    style={{
                      ...styles.reject,
                      ...(updatingId !== null ? styles.disabled : {}),
                    }}
                    onClick={() =>
                      handleDecision(review.id, "rejected")
                    }
                    disabled={updatingId !== null}
                  >
                    {updatingId === review.id
                      ? "Updating..."
                      : "Reject review"}
                  </button>
                </div>
              </article>
            ))
          )}
        </section>
      </div>
    </main>
  );
}
