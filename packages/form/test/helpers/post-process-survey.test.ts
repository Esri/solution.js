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
import { postProcessHubSurvey } from "../../src/helpers/post-process-survey";
import * as utils from "../../../common/test/mocks/utils";
import * as agolItems from "../../../common/test/mocks/agolItems";
import * as mockTemplates from "../../../common/test/mocks/templates";

describe("postProcessHubSurvey", () => {
  let MOCK_USER_SESSION: common.UserSession;
  let template: common.IItemTemplate;
  let interpolatedTemplate: common.IItemTemplate;
  let templateDictionary: any;
  let itemInfos: any[];
  let formId: string;
  let featureServiceSourceBase: common.IItem;
  let featureServiceResultBase: common.IItem;
  let formTemplate: common.IItemTemplate;
  let featureServiceTemplate: common.IItemTemplate;
  let templates: common.IItemTemplate[];
  let orgExtent;

  beforeEach(() => {
    orgExtent = [
      [-134.7472926179282, 23.560962423770285],
      [-55.69554761541033, 50.309217030289695]
    ];
    formId = "2c36d3679e7f4934ac599051df22daf6";
    MOCK_USER_SESSION = utils.createRuntimeMockUserSession();
    template = mockTemplates.getItemTemplate("Form");
    itemInfos = [{ id: formId }];
    templateDictionary = {
      "3c36d3679e7f4934ac599051df22daf6": {
        itemId: "4c36d3679e7f4934ac599051df22daf6"
      }
    };
    interpolatedTemplate = {
      ...template,
      title: "interpolated title",
      snippet: "interpolated snippet",
      extent: orgExtent,
      culture: "interpolated culture"
    };
    featureServiceSourceBase = {
      ...agolItems.getAGOLItem("Feature Service"),
      id: "3c36d3679e7f4934ac599051df22daf6",
      title: "fs base title",
      typeKeywords: ["fsBaseTypekeywords"]
    };
    featureServiceResultBase = {
      ...agolItems.getAGOLItem("Feature Service"),
      id: "4c36d3679e7f4934ac599051df22daf6",
      title: "original title",
      snippet: "original snippet",
      culture: "original-culture"
    };
    const formTemplateBase = mockTemplates.getItemTemplate("Form");
    formTemplate = {
      ...formTemplateBase,
      properties: {
        ...formTemplateBase.properties,
        info: {
          serviceInfo: {
            itemId: "3c36d3679e7f4934ac599051df22daf6"
          }
        }
      }
    };
    featureServiceTemplate = mockTemplates.getItemTemplate("Feature Service");
    templates = [formTemplate];
  });

  it("should post process the survey", done => {
    const replaceInTemplateSpy = spyOn(
      common,
      "replaceInTemplate"
    ).and.returnValue(interpolatedTemplate);
    const getItemBaseSpy = spyOn(common, "getItemBase").and.returnValue(
      Promise.resolve(featureServiceResultBase)
    );
    const updateItemSpy = spyOn(common, "updateItem").and.resolveTo();
    const createInitializedItemTemplateSpy = spyOn(
      common,
      "createInitializedItemTemplate"
    ).and.returnValue(featureServiceTemplate);
    return postProcessHubSurvey(
      formId,
      "Form",
      itemInfos,
      formTemplate,
      templates,
      templateDictionary,
      MOCK_USER_SESSION
    )
      .then(results => {
        expect(replaceInTemplateSpy.calls.count()).toEqual(1);
        expect(replaceInTemplateSpy.calls.first().args).toEqual([
          formTemplate,
          templateDictionary
        ]);
        expect(getItemBaseSpy.calls.count()).toEqual(1);
        expect(getItemBaseSpy.calls.argsFor(0)).toEqual([
          featureServiceResultBase.id,
          MOCK_USER_SESSION
        ]);
        expect(updateItemSpy.calls.count()).toEqual(2);
        expect(updateItemSpy.calls.argsFor(0)).toEqual([
          {
            id: formId,
            title: interpolatedTemplate.item.title,
            snippet: interpolatedTemplate.item.snippet,
            extent: interpolatedTemplate.item.extent,
            culture: interpolatedTemplate.item.culture
          },
          MOCK_USER_SESSION
        ]);
        expect(updateItemSpy.calls.argsFor(1)).toEqual([
          {
            id: featureServiceResultBase.id,
            extent: interpolatedTemplate.item.extent,
            typeKeywords: [
              ...featureServiceResultBase.typeKeywords,
              `source-${featureServiceSourceBase.id}`
            ]
          },
          MOCK_USER_SESSION
        ]);
        expect(createInitializedItemTemplateSpy.calls.count()).toEqual(1);
        expect(createInitializedItemTemplateSpy.calls.first().args).toEqual([
          featureServiceResultBase
        ]);
        expect(templates).toEqual([formTemplate, featureServiceTemplate]);
        expect(results).toBeTrue();
        expect(
          formTemplate.dependencies.includes(featureServiceResultBase.id)
        ).toBeTrue();
        done();
      })
      .catch(e => {
        done.fail(e);
      });
  });
});
