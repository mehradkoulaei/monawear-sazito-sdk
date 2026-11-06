import { Fragment } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BannerImage } from "./banner-image";
import { siteConfig } from "@/config/site";

/** One static campaign banner; no carousel controls or rotation. */
export function HeroSlider() {
  const slide = siteConfig.heroSlides[0];
  return (
    <section className="hero-shell" aria-label="مجموعهٔ مونا">
      <h1 className="sr-only">پوشاک مونا؛ لباس خواب و پوشاک زنانه</h1>
      <div className="hero-stage">
        <div id={`hero-${slide.id}`} className="hero-slide is-active">
          <div className="hero-copy">
            <p className="editorial-kicker" dir="ltr">{slide.eyebrow}</p>
            <p className="hero-intro">{slide.intro}</p>
            <h2>{slide.title.split("\n").map((line, i) => <Fragment key={line}>{i > 0 && <br />}{i > 0 ? <em>{line}</em> : line}</Fragment>)}</h2>
            <p className="hero-description">{slide.text}</p>
            <Link href={slide.href} className="editorial-button">{slide.cta}<ArrowLeft size={18} /></Link>
            <p className="hero-footnote"><span />{slide.footnote}</p>
          </div>
          <div className="hero-art">
            <BannerImage src={slide.image} alt={slide.alt} priority sizes="(max-width: 767px) 100vw, 55vw" />
            <span className="art-annotation" dir="ltr">{slide.annotation}</span>
            <span className="art-stamp" aria-hidden="true">M<small>the art of feeling good</small></span>
            <span className="hero-edition" dir="ltr">{slide.edition}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
