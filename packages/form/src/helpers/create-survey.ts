import {
  ISurvey123CreateParams,
  ISurvey123CreateResult
} from "@esri/solution-common";
import { encodeFormData } from "@esri/arcgis-rest-request";

/**
 * Provides utility method to call Survey123 create endpoint
 *
 * @module create-survey
 */

/**
 * Calls the Survey123 create API with the given parameters
 * @param {ISurvey123CreateParams} params
 * @param {string} [survey123Url=https://survey123.arcgis.com] An optional, Survey123 base URL override
 * @throws Will throw if the Survey123 API returns an error response
 * @returns {Promise<ISurvey123CreateResult>}
 */
export function createSurvey(
  params: ISurvey123CreateParams,
  survey123Url = "https://survey123.arcgis.com"
): Promise<ISurvey123CreateResult> {
  const createUrl = `${survey123Url}/api/survey/create`;
  const ro = {
    credentials: "same-origin" as RequestCredentials,
    method: "POST",
    body: encodeFormData(
      {
        f: "json",
        ...params
      },
      true
    )
  };
  // Using @esri/arcgis-request "request" method was resulting in a 404 for
  // a CORS preflight request related to this request, but calling fetch directly
  // circumvents the issue.
  return fetch(createUrl, ro)
    .then(response => response.json())
    .then(response => {
      if (!response.success) {
        throw new Error(`Failed to create survey: ${response.error.message}`);
      }
      return {
        formId: response.id,
        featureServiceId: response.featureService.source.itemId,
        folderId: response.formItemInfo.ownerFolder
      };
    });
}
