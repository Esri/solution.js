/** @license
 * Copyright 2018 Esri
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

import * as common from "@esri/solution-common";
import { buildCreateParams } from "../../src/helpers/build-create-params";
import * as surveyEncodingUtils from "../../src/helpers/encode-survey-form";
import * as templates from "../../../common/test/mocks/templates";
import * as utils from "../../../common/test/mocks/utils";
import * as items from "../../../common/test/mocks/agolItems";

// ------------------------------------------------------------------------------------------------------------------ //

const MOCK_USER_SESSION = utils.createRuntimeMockUserSession();

describe("buildCreateParams", () => {
  if (typeof window !== "undefined") {
    it("should resolve a ISurvey123CreateParams", done => {
      const templateDictionary = {
        portalBaseUrl: utils.PORTAL_SUBSET.portalUrl,
        user: items.getAGOLUser("myUser")
      };
      const credential = {
        expires: 1591039350661,
        server: "https://some.arcgis.com/sharing/rest",
        ssl: true,
        token: "my-token",
        userId: "myUser"
      };
      const unencodedForm = {
        header: {
          content: "<p title='Whos the best cat'>Whos the best cat</p>"
        },
        subHeader: {
          content: "This is encoded"
        },
        footer: {
          content: "This is encoded"
        },
        questions: [
          {
            description: "This is encoded"
          }
        ],
        settings: {
          thankYouScreenContent: "This is encoded"
        }
      };
      const encodedForm = {
        header: {
          content:
            "%3Cp%20title%3D'Whos%20the%20best%20cat'%3EWhos%20the%20best%20cat%3C%2Fp%3E"
        },
        subHeader: {
          content: "This%20is%20encoded"
        },
        footer: {
          content: "This%20is%20encoded"
        },
        questions: [
          {
            description: "This%20is%20encoded"
          }
        ],
        settings: {
          thankYouScreenContent: "This%20is%20encoded"
        }
      };
      const baseTemplate = templates.getItemTemplate("Form");
      const template = {
        ...baseTemplate,
        item: {
          ...baseTemplate.item,
          thumbnail: "thumbnail/ago_downloaded.png"
        },
        properties: {
          ...baseTemplate.properties,
          form: unencodedForm
        }
      };
      const thumbnailBlob = utils.getSampleImage();
      const thumbnailFile = new File([thumbnailBlob], "thumbnail.png");
      const toCredentialSpy = spyOn(
        MOCK_USER_SESSION,
        "toCredential"
      ).and.returnValue(credential);
      const getItemThumbnailSpy = spyOn(
        common,
        "getItemThumbnail"
      ).and.resolveTo(thumbnailBlob);
      const getUniqueTitleSpy = spyOn(common, "getUniqueTitle").and.returnValue(
        ""
      );
      const blobToFileSpy = spyOn(common, "blobToFile").and.returnValue(
        thumbnailFile
      );
      const encodeSurveyFormSpy = spyOn(
        surveyEncodingUtils,
        "encodeSurveyForm"
      ).and.returnValue(encodedForm);
      return buildCreateParams(template, templateDictionary, MOCK_USER_SESSION)
        .then(results => {
          expect(toCredentialSpy.calls.count()).toEqual(1);
          expect(getItemThumbnailSpy.calls.count()).toEqual(1);
          expect(getItemThumbnailSpy.calls.first().args).toEqual([
            "frm1234567890",
            "thumbnail/ago_downloaded.png",
            false,
            MOCK_USER_SESSION
          ]);
          expect(getUniqueTitleSpy.calls.count()).toEqual(1);
          expect(getUniqueTitleSpy.calls.first().args).toEqual([
            "Survey-An AGOL item",
            templateDictionary,
            "user.folders"
          ]);
          expect(blobToFileSpy.calls.count()).toEqual(1);
          expect(blobToFileSpy.calls.first().args).toEqual([
            thumbnailBlob,
            "thumbnail/ago_downloaded.png"
          ]);
          expect(encodeSurveyFormSpy.calls.count()).toEqual(1);
          expect(encodeSurveyFormSpy.calls.first().args).toEqual([
            unencodedForm
          ]);
          expect(results).toEqual({
            description: "Description of an AGOL item",
            form: encodedForm,
            portalUrl: "https://myorg.maps.arcgis.com",
            tags: ["test"],
            thumbnailFile,
            title: "",
            token: "my-token",
            typeKeywords: ["JavaScript"],
            username: "myUser"
          });
          done();
        })
        .catch(e => {
          done.fail(e);
        });
    });
  }
});
