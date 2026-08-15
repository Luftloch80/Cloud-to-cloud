import Link from "next/link";

export default function HomePage() {
  return (
    <div className="shell">
      <section className="hero">
        <div className="hero__visual" aria-hidden>
          {/* Full-bleed photographic plane — coastal sky / cloud atmosphere */}
          <img
            src="https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?auto=format&fit=crop&w=1200&q=80"
            alt=""
          />
          <div className="hero__veil" />
        </div>

        <div className="hero__content page" style={{ minHeight: "auto", paddingBottom: 0 }}>
          <h1 className="brand">
            <span>Meridian</span>
          </h1>
          <p className="lede">
            Move Apple Photos to Dropbox — cloud to cloud, on your phone.
          </p>
          <div className="cta-row">
            <Link href="/connect" className="btn btn--primary">
              Start transfer
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
