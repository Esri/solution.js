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

import { IItemTemplate, cloneObject } from "@esri/hub-common";
import { _upgradeTwoDotSix } from "../../src/migrations/upgrade-two-dot-six";
import * as utils from "../../../common/test/mocks/utils";
import {
  ISolutionItem,
  IPortal,
  ISearchResult,
  IGroup,
  IItem,
  UserSession
} from "../../src/interfaces";
import * as restHelpersGet from "../../src/restHelpersGet";
import * as restHelpers from "../../src/restHelpers";

describe("Upgrade 2.6 ::", () => {
  let mapQuestion: any;
  let otherQuestion: any;
  let defaultModel: ISolutionItem;
  let MOCK_USER_SESSION: UserSession;
  let organization: IPortal;
  let searchGroupsResponse: ISearchResult<IGroup>;
  let searchGroupContentsResponse: ISearchResult<IItem>;

  beforeEach(() => {
    mapQuestion = {
      id: "map_question",
      label: "where are you?",
      maps: [
        {
          type: "webmap",
          itemId: "{{05dba3d96cd94b358dff421661300286.itemId}}"
        }
      ]
    };

    otherQuestion = {
      id: "other_question",
      label: "what's your favorite color?"
    };

    defaultModel = {
      item: {
        type: "Solution",
        typeKeywords: ["Solution", "Template"],
        properties: {
          schemaVersion: 2.5
        }
      },
      data: {
        templates: [
          {
            type: "Form",
            properties: {
              form: {
                questions: [mapQuestion, otherQuestion]
              }
            },
            dependencies: ["05dba3d96cd94b358dff421661300286"]
          },
          {
            type: "Web Map",
            itemId: "05dba3d96cd94b358dff421661300286"
          },
          {
            type: "Web Map",
            itemId: "15dba3d96cd94b358dff421661300286"
          }
        ] as IItemTemplate[]
      }
    } as ISolutionItem;

    MOCK_USER_SESSION = utils.createRuntimeMockUserSession();

    organization = {
      id: "Bj56SBi2udA78cC9",
      isPortal: false,
      name: "my organizationd",
      basemapGalleryGroupQuery: `title:"United States Basemaps" AND owner:Esri_cy_US`,
      defaultBasemap: { title: "default base map" },
      authentication: MOCK_USER_SESSION
    };

    searchGroupsResponse = utils.getGroupResponse(
      `title:"United States Basemaps" AND owner:Esri_cy_US`,
      true
    ) as ISearchResult<IGroup>;

    searchGroupContentsResponse = {
      results: [
        {
          id: "14dba3d96cd94b358dff421661300286"
        }
      ]
    } as ISearchResult<IItem>;
  });

  it("resolves the same model if on or above 2.6", done => {
    const model = cloneObject(defaultModel);
    model.item.properties.schemaVersion = 2.6;
    return _upgradeTwoDotSix(model, MOCK_USER_SESSION)
      .then(results => {
        expect(results).toBe(model, "should resolve the same object");
        done();
      })
      .catch(done.fail);
  });

  it("only updates the version when no form templates exist", done => {
    defaultModel.data.templates.splice(0, 1);
    const model = cloneObject(defaultModel);
    const expected = cloneObject(defaultModel);
    expected.item.properties.schemaVersion = 2.6;
    return _upgradeTwoDotSix(model, MOCK_USER_SESSION)
      .then(results => {
        expect(results).toEqual(expected, "should only update the version");
        done();
      })
      .catch(done.fail);
  });

  it("resolves the migrated model if less than 2.6", done => {
    const model = cloneObject(defaultModel);
    const getPortalSpy = spyOn(restHelpersGet, "getPortal").and.resolveTo(
      organization
    );
    const searchGroupsSpy = spyOn(restHelpers, "searchGroups").and.resolveTo(
      searchGroupsResponse
    );
    const searchGroupContentsSpy = spyOn(
      restHelpers,
      "searchGroupContents"
    ).and.resolveTo(searchGroupContentsResponse);
    return _upgradeTwoDotSix(model, MOCK_USER_SESSION)
      .then(results => {
        expect(getPortalSpy.calls.count()).toBe(1);
        expect(getPortalSpy.calls.first().args).toEqual([
          "",
          MOCK_USER_SESSION
        ]);
        expect(searchGroupsSpy.calls.count()).toBe(1);
        expect(searchGroupsSpy.calls.first().args).toEqual([
          organization.basemapGalleryGroupQuery,
          MOCK_USER_SESSION
        ]);
        expect(searchGroupContentsSpy.calls.count()).toBe(1);
        expect(searchGroupContentsSpy.calls.first().args).toEqual([
          searchGroupsResponse.results[0].id,
          `title:${organization.defaultBasemap.title}`,
          MOCK_USER_SESSION
        ]);
        expect(results.data.templates.length).toBe(2);
        expect(results.data.templates[0].type).toEqual("Form");
        expect(
          results.data.templates[0].dependencies.includes(
            "05dba3d96cd94b358dff421661300286"
          )
        ).toBeFalse();
        expect(results.data.templates[0].properties.form.questions.length).toBe(
          2
        );
        expect(
          results.data.templates[0].properties.form.questions[0].maps.length
        ).toBe(1);
        expect(
          results.data.templates[0].properties.form.questions[0].maps[0].itemId
        ).toEqual("14dba3d96cd94b358dff421661300286");
        expect(results.data.templates[1].type).toEqual("Web Map");
        expect(results.data.templates[1].itemId).toEqual(
          "15dba3d96cd94b358dff421661300286"
        );
        expect(results.item.properties.schemaVersion).toEqual(2.6);
        done();
      })
      .catch(done.fail);
  });

  it("doesn't filter templates or update web map ids when no map question exists", done => {
    const model = cloneObject(defaultModel);
    delete model.data.templates[0].properties.form;
    const getPortalSpy = spyOn(restHelpersGet, "getPortal").and.resolveTo(
      organization
    );
    const searchGroupsSpy = spyOn(restHelpers, "searchGroups").and.resolveTo(
      searchGroupsResponse
    );
    const searchGroupContentsSpy = spyOn(
      restHelpers,
      "searchGroupContents"
    ).and.resolveTo(searchGroupContentsResponse);
    return _upgradeTwoDotSix(model, MOCK_USER_SESSION)
      .then(results => {
        expect(getPortalSpy.calls.count()).toBe(1);
        expect(getPortalSpy.calls.first().args).toEqual([
          "",
          MOCK_USER_SESSION
        ]);
        expect(searchGroupsSpy.calls.count()).toBe(1);
        expect(searchGroupsSpy.calls.first().args).toEqual([
          organization.basemapGalleryGroupQuery,
          MOCK_USER_SESSION
        ]);
        expect(searchGroupContentsSpy.calls.count()).toBe(1);
        expect(searchGroupContentsSpy.calls.first().args).toEqual([
          searchGroupsResponse.results[0].id,
          `title:${organization.defaultBasemap.title}`,
          MOCK_USER_SESSION
        ]);
        expect(results.data.templates.length).toBe(3);
        expect(
          results.data.templates[0].dependencies.includes(
            "05dba3d96cd94b358dff421661300286"
          )
        ).toBeTrue();
        expect(results.item.properties.schemaVersion).toEqual(2.6);
        done();
      })
      .catch(done.fail);
  });
});
