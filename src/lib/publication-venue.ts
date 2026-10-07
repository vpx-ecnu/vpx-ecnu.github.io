/** Normalize display labels without changing the source publication metadata. */
export function formatPublicationVenue(venue: string): string {
  const value = venue.trim();
  const aaaiMatch = value.match(
    /^The Conference on Association for the Advancement of Artificial Intelligence(?: \(AAAI\))? (\d{4})$/,
  );
  if (aaaiMatch) return `AAAI ${aaaiMatch[1]}`;

  const acmMultimediaMatch = value.match(/^ACM Multimedia (\d{4})$/);
  if (acmMultimediaMatch) return `ACM MM ${acmMultimediaMatch[1]}`;

  return value;
}
