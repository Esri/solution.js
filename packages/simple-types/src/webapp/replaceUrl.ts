/**
 * Replace url with templatized url value
 *
 * @param obj can be a single url string or a stringified JSON object
 * @param url the current url we are testing for
 * @param newUrl the templatized url
 * @param validateFullUrl should only replace url when we have a full match.
 * This property is only relevant when the obj is a stringified JSON object.
 *
 * @returns the obj with any instances of the url replaced
 * @private
 */

export function replaceUrl(
  obj: string,
  url: string,
  newUrl: string,
  validateFullUrl: boolean = false
) {
  const enforceFullUrl: boolean = validateFullUrl && obj.indexOf('"') > -1;
  const re = new RegExp(enforceFullUrl ? '"' + url + '"' : url, "gmi");
  return obj.replace(re, enforceFullUrl ? '"' + newUrl + '"' : newUrl);
}
