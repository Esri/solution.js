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
import { ICredential } from "@esri/arcgis-rest-auth";

// ------------------------------------------------------------------------------------------------------------------ //

const MOCK_USER_SESSION = utils.createRuntimeMockUserSession();

describe("buildCreateParams", () => {
  if (typeof window !== "undefined") {
    let templateDictionary: any;
    let credential: ICredential;
    let unencodedForm: any;
    let encodedForm: any;
    let template: common.IItemTemplate;
    let defaultBasemap: common.IItem;

    beforeEach(() => {
      templateDictionary = {
        portalBaseUrl: utils.PORTAL_SUBSET.portalUrl,
        user: items.getAGOLUser("myUser"),
        organization: {
          basemapGalleryGroupQuery: `title:"United States Basemaps" AND owner:Esri_cy_US`,
          defaultBasemap: { title: "Topographic" }
        }
      };

      credential = {
        expires: 1591039350661,
        server: "https://some.arcgis.com/sharing/rest",
        ssl: true,
        token: "my-token",
        userId: "myUser"
      };

      unencodedForm = {
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
            description: "This is encoded",
            maps: [
              {
                type: "webmap",
                itemId: "ffc1d78bd0674d8e967bf389c0070a02",
                isDefault: true
              }
            ]
          }
        ],
        settings: {
          thankYouScreenContent: "This is encoded"
        }
      };

      encodedForm = {
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
            description: "This%20is%20encoded",
            maps: [
              {
                type: "webmap",
                itemId: "cac1d78bd0674d8e967bf389c0070a02",
                isDefault: true
              }
            ]
          }
        ],
        settings: {
          thankYouScreenContent: "This%20is%20encoded"
        }
      };
      const baseTemplate = templates.getItemTemplate("Form");
      template = {
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
      defaultBasemap = {
        id: "cac1d78bd0674d8e967bf389c0070a02"
      } as common.IItem;
    });

    it("should resolve a ISurvey123CreateParams", done => {
      const toCredentialSpy = spyOn(
        MOCK_USER_SESSION,
        "toCredential"
      ).and.returnValue(credential);
      const getUniqueTitleSpy = spyOn(common, "getUniqueTitle").and.returnValue(
        "Survey-" + template.item.title
      );
      const encodeSurveyFormSpy = spyOn(
        surveyEncodingUtils,
        "encodeSurveyForm"
      ).and.returnValue(encodedForm);
      const getPortalDefaultBasemapSpy = spyOn(
        common,
        "getPortalDefaultBasemap"
      ).and.resolveTo(defaultBasemap);
      return buildCreateParams(template, templateDictionary, MOCK_USER_SESSION)
        .then(results => {
          const expectedUnencodedForm = common.cloneObject(unencodedForm);
          expectedUnencodedForm.questions[0].maps[0].itemId = defaultBasemap.id;
          expect(toCredentialSpy.calls.count()).toEqual(1);
          expect(getPortalDefaultBasemapSpy.calls.count()).toEqual(1);
          expect(getPortalDefaultBasemapSpy.calls.first().args).toEqual([
            templateDictionary.organization.basemapGalleryGroupQuery,
            templateDictionary.organization.defaultBasemap.title,
            MOCK_USER_SESSION
          ]);
          expect(getUniqueTitleSpy.calls.count()).toEqual(1);
          expect(getUniqueTitleSpy.calls.first().args).toEqual([
            "Survey-An AGOL item",
            templateDictionary,
            "user.folders"
          ]);
          expect(encodeSurveyFormSpy.calls.count()).toEqual(1);
          expect(encodeSurveyFormSpy.calls.first().args).toEqual([
            expectedUnencodedForm
          ]);
          expect(results).toEqual({
            description: "Description of an AGOL item",
            form: encodedForm,
            portalUrl: "https://myorg.maps.arcgis.com",
            tags: ["test"],
            title: "An AGOL item",
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

    it("should support questions being absent", done => {
      delete unencodedForm.questions;
      const toCredentialSpy = spyOn(
        MOCK_USER_SESSION,
        "toCredential"
      ).and.returnValue(credential);
      const getUniqueTitleSpy = spyOn(common, "getUniqueTitle").and.returnValue(
        "Survey-" + template.item.title
      );
      const encodeSurveyFormSpy = spyOn(
        surveyEncodingUtils,
        "encodeSurveyForm"
      ).and.returnValue(encodedForm);
      const getPortalDefaultBasemapSpy = spyOn(
        common,
        "getPortalDefaultBasemap"
      ).and.resolveTo(defaultBasemap);
      return buildCreateParams(template, templateDictionary, MOCK_USER_SESSION)
        .then(results => {
          const expectedUnencodedForm = common.cloneObject(unencodedForm);
          delete expectedUnencodedForm.questions;
          expect(toCredentialSpy.calls.count()).toEqual(1);
          expect(getPortalDefaultBasemapSpy.calls.count()).toEqual(1);
          expect(getPortalDefaultBasemapSpy.calls.first().args).toEqual([
            templateDictionary.organization.basemapGalleryGroupQuery,
            templateDictionary.organization.defaultBasemap.title,
            MOCK_USER_SESSION
          ]);
          expect(getUniqueTitleSpy.calls.count()).toEqual(1);
          expect(getUniqueTitleSpy.calls.first().args).toEqual([
            "Survey-An AGOL item",
            templateDictionary,
            "user.folders"
          ]);
          expect(encodeSurveyFormSpy.calls.count()).toEqual(1);
          expect(encodeSurveyFormSpy.calls.first().args).toEqual([
            expectedUnencodedForm
          ]);
          expect(results).toEqual({
            description: "Description of an AGOL item",
            form: encodedForm,
            portalUrl: "https://myorg.maps.arcgis.com",
            tags: ["test"],
            title: "An AGOL item",
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

    it("should support questions without maps", done => {
      delete unencodedForm.questions[0].maps;
      const toCredentialSpy = spyOn(
        MOCK_USER_SESSION,
        "toCredential"
      ).and.returnValue(credential);
      const getUniqueTitleSpy = spyOn(common, "getUniqueTitle").and.returnValue(
        "Survey-" + template.item.title
      );
      const encodeSurveyFormSpy = spyOn(
        surveyEncodingUtils,
        "encodeSurveyForm"
      ).and.returnValue(encodedForm);
      const getPortalDefaultBasemapSpy = spyOn(
        common,
        "getPortalDefaultBasemap"
      ).and.resolveTo(defaultBasemap);
      return buildCreateParams(template, templateDictionary, MOCK_USER_SESSION)
        .then(results => {
          const expectedUnencodedForm = common.cloneObject(unencodedForm);
          delete expectedUnencodedForm.questions[0].maps;
          expect(toCredentialSpy.calls.count()).toEqual(1);
          expect(getPortalDefaultBasemapSpy.calls.count()).toEqual(1);
          expect(getPortalDefaultBasemapSpy.calls.first().args).toEqual([
            templateDictionary.organization.basemapGalleryGroupQuery,
            templateDictionary.organization.defaultBasemap.title,
            MOCK_USER_SESSION
          ]);
          expect(getUniqueTitleSpy.calls.count()).toEqual(1);
          expect(getUniqueTitleSpy.calls.first().args).toEqual([
            "Survey-An AGOL item",
            templateDictionary,
            "user.folders"
          ]);
          expect(encodeSurveyFormSpy.calls.count()).toEqual(1);
          expect(encodeSurveyFormSpy.calls.first().args).toEqual([
            expectedUnencodedForm
          ]);
          expect(results).toEqual({
            description: "Description of an AGOL item",
            form: encodedForm,
            portalUrl: "https://myorg.maps.arcgis.com",
            tags: ["test"],
            title: "An AGOL item",
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
