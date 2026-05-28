export function getCurrencySymbolForDestination(destination: string): string {
  const dest = destination.toLowerCase();

  // Europe (Eurozone)
  if (
    dest.match(/france|paris|germany|berlin|italy|rome|spain|barcelona|madrid|netherlands|amsterdam|greece|athens|portugal|lisbon|ireland|belgium|austria|finland/)
  ) {
    return '€';
  }

  // UK
  if (dest.match(/uk|united kingdom|london|england|scotland|wales/)) {
    return '£';
  }

  // Japan
  if (dest.match(/japan|tokyo|kyoto|osaka/)) {
    return '¥';
  }

  // India
  if (dest.match(/india|delhi|mumbai|goa|kerala|bangalore|chennai|kolkata|jaipur|agra/)) {
    return '₹';
  }

  // Australia
  if (dest.match(/australia|sydney|melbourne|brisbane/)) {
    return 'A$';
  }

  // Canada
  if (dest.match(/canada|toronto|vancouver|montreal/)) {
    return 'C$';
  }

  // UAE
  if (dest.match(/uae|dubai|abu dhabi/)) {
    return 'AED ';
  }

  // Thailand
  if (dest.match(/thailand|bangkok|phuket|chiang mai/)) {
    return '฿';
  }

  // Indonesia (Bali)
  if (dest.match(/indonesia|bali|jakarta/)) {
    return 'Rp ';
  }

  // Singapore
  if (dest.match(/singapore/)) {
    return 'S$';
  }

  // Malaysia
  if (dest.match(/malaysia|kuala lumpur/)) {
    return 'RM ';
  }

  // Vietnam
  if (dest.match(/vietnam|hanoi|ho chi minh/)) {
    return '₫';
  }

  // Philippines
  if (dest.match(/philippines|manila|palawan|cebu/)) {
    return '₱';
  }

  // South Africa
  if (dest.match(/south africa|cape town|johannesburg/)) {
    return 'R ';
  }

  // Default to USD
  return '$';
}
