import {
  UserSession,
  ISurvey123CreateParams,
  ISurvey123CreateSuccess,
  ISurvey123CreateError,
  ISurvey123CreateResult
} from "@esri/solution-common";
import {
  IRequestOptions,
  request,
  encodeFormData
} from "@esri/arcgis-rest-request";

export function createSurvey(
  params: ISurvey123CreateParams,
  authentication: UserSession,
  survey123Url = "https://survey123.arcgis.com"
): Promise<ISurvey123CreateResult> {
  const createUrl = `${survey123Url}/api/survey/create`;
  const requestOptions = {
    httpMethod: "POST",
    authentication,
    params: {
      f: "json",
      ...params
    }
  } as IRequestOptions;
  return request(createUrl, requestOptions).then(
    (
      response: ISurvey123CreateSuccess | ISurvey123CreateError
    ): ISurvey123CreateResult => {
      if (!response.success) {
        throw new Error(`Failed to create survey: ${response.error.message}`);
      }
      return {
        formId: response.id,
        featureServiceId: response.featureService.source.itemId,
        folderId: response.formItemInfo.ownerFolder
      };
    }
  );
}
