import {
  GEOCODE_SERVER_NAME,
  NA_SERVER_NAME,
  SERVER_NAME,
  placeholder,
  rest_request
} from "@esri/solution-common";
import { UserSession } from "@esri/solution-common";
import { replaceUrl } from "./replaceUrl";
/**
 *
 * @param testString
 * @param portalUrl
 * @param requestUrls
 * @param serviceRequests
 * @param authentication
 * @private
 */
export function findUrls(
  testString: string,
  portalUrl: string,
  requestUrls: string[],
  serviceRequests: any[],
  authentication: UserSession
) {
  const options: any = {
    f: "json",
    authentication: authentication
  };
  // test for URLs
  const results = testString.match(/(\bhttps?:\/\/[-A-Z0-9\/._]*)/gim);
  if (results && results.length) {
    results.forEach((url: string) => {
      if (url.indexOf("NAServer") > -1) {
        testString = replaceUrl(testString, url, placeholder(NA_SERVER_NAME));
      } else if (url.indexOf("GeocodeServer") > -1) {
        testString = replaceUrl(
          testString,
          url,
          placeholder(GEOCODE_SERVER_NAME)
        );
      } else if (portalUrl && url.indexOf(portalUrl) > -1) {
        testString = replaceUrl(
          testString,
          portalUrl,
          placeholder(SERVER_NAME)
        );
      } else if (url.indexOf("FeatureServer") > -1) {
        if (requestUrls.indexOf(url) === -1) {
          requestUrls.push(url);
          serviceRequests.push(rest_request(url, options));
        }
      }
    });
  }
  return {
    testString,
    requestUrls,
    serviceRequests
  };
}
