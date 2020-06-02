import {
  IItemTemplate,
  UserSession,
  getUniqueTitle,
  getItemThumbnail,
  blobToFile,
  ISurvey123CreateParams
} from "@esri/solution-common";
import { encodeSurveyForm } from "./encode-survey-form";

export function buildCreateParams(
  template: IItemTemplate,
  templateDictionary: any,
  destinationAuthentication: UserSession
): Promise<ISurvey123CreateParams> {
  const {
    item: { title: originalTitle, description, tags, typeKeywords },
    properties: { form: unencodedForm }
  } = template;
  const {
    user: { username },
    portalBaseUrl: portalUrl
  } = templateDictionary;
  const { token } = destinationAuthentication.toCredential();
  return getItemThumbnail(
    template.itemId,
    template.item.thumbnail,
    false,
    destinationAuthentication
  ).then(blob => {
    // The S123 API appends "Survey-" to the survey title when computing
    // the folder name. We need to use the same prefix to successfully
    // calculate a unique folder name. Afterwards, we can safely remove the
    // prefix from the title
    const folderPrefix = "Survey-";
    const title = getUniqueTitle(
      `${folderPrefix}${originalTitle}`,
      templateDictionary,
      "user.folders"
    ).replace(folderPrefix, "");
    const thumbnailFile = blobToFile(blob, template.item.thumbnail);
    const form = encodeSurveyForm(unencodedForm);
    return {
      description,
      form,
      portalUrl,
      tags,
      thumbnailFile,
      title,
      token,
      typeKeywords,
      username
    };
  });
}
