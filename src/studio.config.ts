// The studio's settings. Every episode renders at this size and frame rate.
export const STUDIO = {
  fps: 30,
  width: 1920,
  height: 1080,
  /**
   * A local display face for titles, as a file in public/ (your brand font, say). null uses Bricolage Grotesque
   * from Google Fonts. Example: { family: 'My Brand Font', file: 'fonts/MyBrandFont.woff2', weight: '200 700' }
   */
  titleFont: null as null | { family: string; file: string; weight: string },
  /**
   * TheGodmanFiles brand type, used by the brand's own episodes (raktabija) for cards and thumbnails. Kept separate from
   * titleFont so the existing episodes keep their look. wordmark: the closest Google Font to the banner's
   * "TheGodmanFiles" (candidates: 'Cormorant Garamond', 'Marcellus'); devanagari: Hindi titles and cards.
   */
  brand: { wordmark: 'Cormorant Garamond', devanagari: 'Tiro Devanagari Hindi' },
};
