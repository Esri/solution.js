import { fail } from "@esri/solution-common";
import { getProp } from "@esri/hub-common";
import { replaceUrl } from "./replaceUrl";
/**
 *
 * @param serviceRequests
 * @param requestUrls
 * @param objString
 * @private
 */

export function handleServiceRequests(
  serviceRequests: any[],
  requestUrls: string[],
  objString: string
): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    if (serviceRequests && serviceRequests.length > 0) {
      let i: number = 0;
      Promise.all(serviceRequests).then(
        serviceResponses => {
          serviceResponses.forEach(serviceResponse => {
            if (getProp(serviceResponse, "serviceItemId")) {
              const serviceTemplate: string =
                "{{" +
                serviceResponse.serviceItemId +
                (serviceResponse.hasOwnProperty("id")
                  ? ".layer" + serviceResponse.id
                  : "") +
                ".url}}";
              objString = replaceUrl(
                objString,
                requestUrls[i],
                serviceTemplate,
                true
              );
            }
            i++;
          });
          resolve(objString);
        },
        e => reject(fail(e))
      );
    } else {
      resolve(objString);
    }
  });
}
