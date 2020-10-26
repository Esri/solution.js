/** @license
 * Copyright 2020 Esri
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  IItemTemplate,
  UserSession,
  getUniqueTitle,
  ISurvey123CreateParams,
  getPortalDefaultBasemap
} from "@esri/solution-common";
import { encodeSurveyForm } from "./encode-survey-form";

/**
 * Utility method for creating Survey123 parameters
 *
 * @module build-create-params
 */

/**
 * Builds the Survey123 create API parameters
 * @param {IItemTemplate} template The template
 * @param {any} templateDictionary The template dictionary
 * @param {UserSession} destinationAuthentication The destination session info
 * @returns {Promise<ISurvey123CreateParams>}
 */
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
    portalBaseUrl: portalUrl,
    organization: {
      basemapGalleryGroupQuery,
      defaultBasemap: { title: basemapTitle }
    }
  } = templateDictionary;
  const { token } = destinationAuthentication.toCredential();
  return getPortalDefaultBasemap(
    basemapGalleryGroupQuery,
    basemapTitle,
    destinationAuthentication
  ).then(defaultBasemap => {
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
    // set any map question's basemaps to default org basemap
    if (unencodedForm.questions) {
      unencodedForm.questions = unencodedForm.questions.map((question: any) => {
        if (question.maps) {
          question.maps = question.maps.map((map: any) => ({
            ...map,
            itemId: defaultBasemap.id
          }));
        }
        return question;
      });
    }
    const form = encodeSurveyForm(unencodedForm);
    // intentionally undefined, handled downstream by core logic now
    return {
      description,
      form,
      portalUrl,
      tags,
      title,
      token,
      typeKeywords,
      username
    };
  });
}
