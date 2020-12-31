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

import { simpleTypes } from "@esri/solution-simple-types";
import * as common from "@esri/solution-common";
import * as postProcessor from "../src/post-process";
import * as utils from "../../common/test/mocks/utils";
import * as fetchMock from "fetch-mock";
import * as templates from "../../common/test/mocks/templates";
import * as hubFormTemplateHelpers from "../src/helpers/is-hub-form-template";
import * as hubFormProcessingHelpers from "../src/helpers/post-process-survey";

describe("postProcess", () => {
  let MOCK_USER_SESSION: common.UserSession;
  let template: common.IItemTemplate;
  let templateDictionary: any;
  let itemInfos: any[];

  beforeEach(() => {
    MOCK_USER_SESSION = utils.createRuntimeMockUserSession();
    template = templates.getItemTemplate("Form");
    itemInfos = [{ itemId: template.itemId }];
    templateDictionary = { key: "value" };
  });

  afterEach(() => {
    fetchMock.restore();
  });

  // Postprocessing uses common.updateItemTemplateFromDictionary, which uses common.getItemDataAsJson, which
  // requires browser features
  if (typeof window !== "undefined") {
    it("should delegate to custom template post processing for Hub Survey templates", done => {
      const expectedResults = { success: true };
      const postProcessHubSurveySpy = spyOn(
        hubFormProcessingHelpers,
        "postProcessHubSurvey"
      ).and.resolveTo(expectedResults);
      const isHubFormTemplateSpy = spyOn(
        hubFormTemplateHelpers,
        "isHubFormTemplate"
      ).and.returnValue(true);
      const progressCallback = jasmine.createSpy();
      postProcessor
        .postProcess(
          template.id,
          template.type,
          itemInfos,
          template,
          [template],
          templateDictionary,
          MOCK_USER_SESSION
        )
        .then(
          results => {
            expect(isHubFormTemplateSpy.calls.count()).toBe(1);
            expect(isHubFormTemplateSpy.calls.first().args).toEqual([template]);
            expect(postProcessHubSurveySpy.calls.count()).toBe(1);
            expect(postProcessHubSurveySpy.calls.first().args).toEqual([
              template.id,
              template.type,
              itemInfos,
              template,
              [template],
              templateDictionary,
              MOCK_USER_SESSION
            ]);
            expect(results).toEqual(expectedResults);
            done();
          },
          e => {
            done.fail(e);
          }
        );
    });

    it("should delegate to common post processing for non-Hub Survey templates", () => {
      const expectedResults = utils.getSuccessResponse({ id: "itm1234567890" });
      const isHubFormTemplateSpy = spyOn(
        hubFormTemplateHelpers,
        "isHubFormTemplate"
      ).and.returnValue(false);

      template.item.id = template.itemId;
      const updateUrl =
        utils.PORTAL_SUBSET.restUrl +
        "/content/users/casey/items/frm1234567890/update";
      fetchMock
        .get(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/frm1234567890?f=json&token=fake-token",
          template.item
        )
        .post(
          utils.PORTAL_SUBSET.restUrl + "/content/items/frm1234567890/data",
          {}
        )
        .post(updateUrl, utils.getSuccessResponse({ id: template.item.id }));

      spyOn(console, "log").and.callFake(() => {});
      return postProcessor
        .postProcess(
          template.itemId,
          template.type,
          itemInfos,
          template,
          [template],
          templateDictionary,
          MOCK_USER_SESSION
        )
        .then(result => {
          expect(result).toEqual(
            utils.getSuccessResponse({ id: template.item.id })
          );

          const callBody = fetchMock.calls(updateUrl)[0][1].body as string;
          expect(callBody).toEqual(
            "f=json&text=%7B%7D&id=frm1234567890&name=Name%20of%20an%20AGOL%20item&title=An%20AGOL%20item&" +
              "type=Form&typeKeywords=JavaScript&description=Description%20of%20an%20AGOL%20item&tags=test&" +
              "snippet=Snippet%20of%20an%20AGOL%20item&thumbnail=https%3A%2F%2Fmyorg.maps.arcgis.com%2F" +
              "sharing%2Frest%2Fcontent%2Fitems%2Ffrm1234567890%2Finfo%2Fthumbnail%2Fago_downloaded.png&" +
              "extent=%7B%7BsolutionItemExtent%7D%7D&categories=&accessInformation=Esri%2C%20Inc.&" +
              "culture=en-us&url=&token=fake-token"
          );
        });
    });
  }
});
