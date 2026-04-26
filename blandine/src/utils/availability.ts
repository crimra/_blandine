type PlaceOpeningHoursLike = {
  isOpen?: () => boolean;
};

export function isPharmacyOpenNow(
  openingHours?: PlaceOpeningHoursLike | null,
  fallback = false
): boolean {
  if (openingHours?.isOpen) {
    return openingHours.isOpen();
  }

  return fallback;
}
