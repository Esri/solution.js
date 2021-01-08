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
import * as restPortal from "@esri/arcgis-rest-portal";
import { createItemFromHubTemplate } from "../../src/helpers/create-item-from-hub-template";
import * as createSurveyHelper from "../../src/helpers/create-survey";
import * as buildParamsHelper from "../../src/helpers/build-create-params";
import * as templates from "../../../common/test/mocks/templates";
import * as utils from "../../../common/test/mocks/utils";
import * as items from "../../../common/test/mocks/agolItems";

// ------------------------------------------------------------------------------------------------------------------ //

describe("createItemFromHubTemplate", () => {
  let templateDictionary: any;
  let template: common.IItemTemplate;
  let interpolatedTemplate: common.IItemTemplate;
  let paramResults: common.ISurvey123CreateParams;
  let createResult: common.ISurvey123CreateResult;
  let MOCK_USER_SESSION: common.UserSession;
  let getItemBaseResult: common.IItem;

  beforeEach(() => {
    MOCK_USER_SESSION = utils.createRuntimeMockUserSession();
    templateDictionary = {
      portalBaseUrl: utils.PORTAL_SUBSET.portalUrl,
      user: items.getAGOLUser("myUser"),
      folderId: "h7bf45f98d114c3ab85fd63bb44e240d"
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
        info: {
          ...baseTemplate.properties.info,
          serviceInfo: {
            itemId: "i7bf45f98d114c3ab85fd63bb44e240d"
          }
        },
        form: {
          portalUrl: "{{portalBaseUrl}}",
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
        }
      }
    };

    interpolatedTemplate = {
      ...template,
      properties: {
        ...template.properties,
        form: {
          ...template.properties.form,
          portalUrl: utils.PORTAL_SUBSET.portalUrl
        }
      }
    };

    paramResults = {
      description: "Description of an AGOL item",
      form: template.properties.form,
      portalUrl: "https://myorg.maps.arcgis.com",
      tags: ["test"],
      title: "An AGOL item",
      token: "my-token",
      typeKeywords: ["JavaScript"],
      username: "myUser"
    };

    createResult = {
      formId: "e7bf45f98d114c3ab85fd63bb44e240d",
      featureServiceId: "f7bf45f98d114c3ab85fd63bb44e240d",
      folderId: "g7bf45f98d114c3ab85fd63bb44e240d"
    };

    getItemBaseResult = {
      ...items.getAGOLItem("form"),
      id: createResult.formId
    };
  });

  it("should resolve a ISurvey123CreateParams", done => {
    const replaceInTemplateSpy = spyOn(
      common,
      "replaceInTemplate"
    ).and.returnValue(interpolatedTemplate);
    const buildCreateParamsSpy = spyOn(
      buildParamsHelper,
      "buildCreateParams"
    ).and.resolveTo(paramResults);
    const createSurveySpy = spyOn(
      createSurveyHelper,
      "createSurvey"
    ).and.resolveTo(createResult);
    const updateItemExtendedSpy = spyOn(
      common,
      "updateItemExtended"
    ).and.resolveTo();
    const itemProgressCallbackSpy = jasmine.createSpy();
    const getItemBaseSpy = spyOn(common, "getItemBase").and.resolveTo(
      getItemBaseResult
    );
    return createItemFromHubTemplate(
      template,
      templateDictionary,
      MOCK_USER_SESSION,
      itemProgressCallbackSpy
    )
      .then(results => {
        expect(replaceInTemplateSpy.calls.count()).toEqual(1);
        expect(replaceInTemplateSpy.calls.first().args).toEqual([
          template,
          templateDictionary
        ]);
        expect(buildCreateParamsSpy.calls.count()).toEqual(1);
        expect(buildCreateParamsSpy.calls.first().args).toEqual([
          interpolatedTemplate,
          templateDictionary,
          MOCK_USER_SESSION
        ]);
        expect(createSurveySpy.calls.count()).toEqual(1);
        expect(createSurveySpy.calls.first().args).toEqual([
          paramResults,
          undefined
        ]);
        expect(updateItemExtendedSpy.calls.count()).toEqual(1);
        expect(updateItemExtendedSpy.calls.argsFor(0)[0].id).toBe(
          createResult.formId
        );
        expect(getItemBaseSpy.calls.count()).toEqual(1);
        expect(getItemBaseSpy.calls.first().args).toEqual([
          createResult.formId,
          MOCK_USER_SESSION
        ]);
        expect(templateDictionary[template.itemId]).toEqual({
          itemId: createResult.formId
        });
        expect(
          templateDictionary[template.properties.info.serviceInfo.itemId]
        ).toEqual({ itemId: createResult.featureServiceId });
        expect(itemProgressCallbackSpy.calls.count()).toEqual(1);
        expect(itemProgressCallbackSpy.calls.first().args).toEqual([
          template.itemId,
          common.EItemProgressStatus.Finished,
          template.estimatedDeploymentCostFactor,
          createResult.formId
        ]);
        expect(results).toEqual({
          item: {
            ...template,
            item: getItemBaseResult,
            itemId: createResult.formId
          } as common.IItemTemplate,
          id: createResult.formId,
          type: "Form",
          postProcess: true
        });
        done();
      })
      .catch(e => {
        done.fail(e);
      });
  });

  it("should allow survey123Url override from templateDictionary", done => {
    const replaceInTemplateSpy = spyOn(
      common,
      "replaceInTemplate"
    ).and.returnValue(interpolatedTemplate);
    const buildCreateParamsSpy = spyOn(
      buildParamsHelper,
      "buildCreateParams"
    ).and.resolveTo(paramResults);
    const createSurveySpy = spyOn(
      createSurveyHelper,
      "createSurvey"
    ).and.resolveTo(createResult);
    const updateItemExtendedSpy = spyOn(
      common,
      "updateItemExtended"
    ).and.resolveTo();
    const itemProgressCallbackSpy = jasmine.createSpy();
    const getItemBaseSpy = spyOn(common, "getItemBase").and.resolveTo(
      getItemBaseResult
    );
    templateDictionary.survey123Url = "https://survey123qa.arcgis.com";
    return createItemFromHubTemplate(
      template,
      templateDictionary,
      MOCK_USER_SESSION,
      itemProgressCallbackSpy
    )
      .then(results => {
        expect(replaceInTemplateSpy.calls.count()).toEqual(1);
        expect(replaceInTemplateSpy.calls.first().args).toEqual([
          template,
          templateDictionary
        ]);
        expect(buildCreateParamsSpy.calls.count()).toEqual(1);
        expect(buildCreateParamsSpy.calls.first().args).toEqual([
          interpolatedTemplate,
          templateDictionary,
          MOCK_USER_SESSION
        ]);
        expect(createSurveySpy.calls.count()).toEqual(1);
        expect(createSurveySpy.calls.first().args).toEqual([
          paramResults,
          "https://survey123qa.arcgis.com"
        ]);
        expect(updateItemExtendedSpy.calls.count()).toEqual(1);
        expect(updateItemExtendedSpy.calls.argsFor(0)[0].id).toBe(
          createResult.formId
        );
        expect(getItemBaseSpy.calls.count()).toEqual(1);
        expect(getItemBaseSpy.calls.first().args).toEqual([
          createResult.formId,
          MOCK_USER_SESSION
        ]);
        expect(templateDictionary[template.itemId]).toEqual({
          itemId: createResult.formId
        });
        expect(
          templateDictionary[template.properties.info.serviceInfo.itemId]
        ).toEqual({ itemId: createResult.featureServiceId });
        expect(itemProgressCallbackSpy.calls.count()).toEqual(1);
        expect(itemProgressCallbackSpy.calls.first().args).toEqual([
          template.itemId,
          common.EItemProgressStatus.Finished,
          template.estimatedDeploymentCostFactor,
          createResult.formId
        ]);
        expect(results).toEqual({
          item: {
            ...template,
            item: getItemBaseResult,
            itemId: createResult.formId
          } as common.IItemTemplate,
          id: createResult.formId,
          type: "Form",
          postProcess: true
        });
        done();
      })
      .catch(e => {
        done.fail(e);
      });
  });

  it("should call itemProgressCallback with Failed then reject", done => {
    const error = new Error("Failed to build params");
    spyOn(common, "replaceInTemplate").and.returnValue(interpolatedTemplate);
    spyOn(buildParamsHelper, "buildCreateParams").and.rejectWith(error);
    spyOn(createSurveyHelper, "createSurvey").and.resolveTo(createResult);
    spyOn(restPortal, "moveItem").and.resolveTo();
    spyOn(common, "removeFolder").and.resolveTo();
    const itemProgressCallbackSpy = jasmine.createSpy();
    return createItemFromHubTemplate(
      template,
      templateDictionary,
      MOCK_USER_SESSION,
      itemProgressCallbackSpy
    )
      .then(_ => {
        done.fail("Should have rejected");
      })
      .catch(e => {
        expect(itemProgressCallbackSpy.calls.count()).toEqual(1);
        expect(itemProgressCallbackSpy.calls.first().args).toEqual([
          template.itemId,
          common.EItemProgressStatus.Failed,
          0
        ]);
        expect(e).toBe(error);
        done();
      });
  });
});
