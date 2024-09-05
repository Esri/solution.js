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
import { postProcess } from "../../src/helpers/post-process";
import { HubSiteProcessor } from "@esri/solution-hub-types";
import * as portalHelper from "@esri/arcgis-rest-portal";
import * as shareHelper from "../../src/helpers/share-templates-to-groups";
import * as testUtils from "../../../common/test/mocks/utils";
import { UserSession, IItemTemplate, ICreateItemFromTemplateResponse } from "@esri/solution-common";

let MOCK_USER_SESSION: UserSession;
describe("postProcess Module", () => {
  const tmpls = [] as IItemTemplate[];
  const tmplDict = {};

  beforeEach(() => {
    MOCK_USER_SESSION = testUtils.createRuntimeMockUserSession();
  });

  fit("delegates to type specific processor", async () => {
    const siteProcessorSpy = spyOn(HubSiteProcessor, "postProcess").and.resolveTo();

    const relationshipSpy = spyOn(portalHelper, "addItemRelationship").and.resolveTo();

    const shareSpy = spyOn(shareHelper, "shareTemplatesToGroups").and.resolveTo();

    const sols = [
      {
        item: null as any,
        id: "bc3",
        type: "Hub Site Application",
        postProcess: true,
      },
    ] as ICreateItemFromTemplateResponse[];

    const solnId = "abc";
    const resp = await postProcess(solnId, tmpls, sols, MOCK_USER_SESSION, tmplDict);
    expect(relationshipSpy.calls.count()).withContext("should call the addItemRelationship").toBe(1);
    expect(shareSpy.calls.count()).withContext("should call the shareHelper").toBe(1);
    expect(resp.length).withContext("should return two promises").toBe(3);
    expect(siteProcessorSpy.calls.count()).withContext("should delegate to item type processor").toBe(1);
    const args = siteProcessorSpy.calls.argsFor(0) as any[];
    expect(args[0]).toBe("bc3");
    expect(args[1]).toBe("Hub Site Application");
    expect(args[2]).withContext("should pass solutions through").toBe(sols);
    expect(args[3]).toBeUndefined();
    expect(args[4]).toEqual([]);
    expect(args[5]).withContext("should pass template dictionary through").toBe(tmplDict);
    expect(args[6]).withContext("should pass auth through").toBe(MOCK_USER_SESSION);
  });

  it("only processes multiple solutions with postProcess true", async () => {
    const siteProcessorSpy = spyOn(HubSiteProcessor, "postProcess").and.resolveTo();

    const relationshipSpy = spyOn(portalHelper, "addItemRelationship").and.resolveTo();

    const shareSpy = spyOn(shareHelper, "shareTemplatesToGroups").and.resolveTo();
    const sols = [
      {
        item: null as any,
        id: "bc3",
        type: "Hub Site Application",
        postProcess: true,
      },
      {
        item: null as any,
        id: "bc4",
        type: "Hub Site Application",
        postProcess: true,
      },
    ] as ICreateItemFromTemplateResponse[];

    const solnId = "abc";
    const resp = await postProcess(solnId, tmpls, sols, MOCK_USER_SESSION, tmplDict);
    expect(relationshipSpy.calls.count()).withContext("should call the addItemRelationship").toBe(2);
    expect(shareSpy.calls.count()).withContext("should call the shareHelper").toBe(1);
    expect(resp.length).withContext("should return three promises").toBe(5);
    expect(siteProcessorSpy.calls.count()).withContext("should call postProcess twice").toBe(2);
  });
  it("only processes solutions with postProcess true", async () => {
    const siteProcessorSpy = spyOn(HubSiteProcessor, "postProcess").and.resolveTo();

    const relationshipSpy = spyOn(portalHelper, "addItemRelationship").and.resolveTo();

    const shareSpy = spyOn(shareHelper, "shareTemplatesToGroups").and.resolveTo();
    const sols = [
      {
        item: null as any,
        id: "bc3",
        type: "Hub Site Application",
        postProcess: true,
      },
      {
        item: null as any,
        id: "bc4",
        type: "Hub Site Application",
        postProcess: false,
      },
    ] as ICreateItemFromTemplateResponse[];

    const solnId = "abc";
    const resp = await postProcess(solnId, tmpls, sols, MOCK_USER_SESSION, tmplDict);
    expect(relationshipSpy.calls.count()).withContext("should call the addItemRelationship").toBe(2);
    expect(shareSpy.calls.count()).withContext("should call the shareHelper").toBe(1);
    expect(resp.length).withContext("should return two promises").toBe(4);
    expect(siteProcessorSpy.calls.count()).withContext("should call postProcess once").toBe(1);
  });

  it("it skips undefined itemHandlers", async () => {
    const sols = [
      {
        item: null as any,
        id: "bc3",
        type: "Death Star",
        postProcess: true,
      },
    ] as ICreateItemFromTemplateResponse[];

    const relationshipSpy = spyOn(portalHelper, "addItemRelationship").and.resolveTo();

    const shareSpy = spyOn(shareHelper, "shareTemplatesToGroups").and.resolveTo();

    const solnId = "abc";
    const resp = await postProcess(solnId, tmpls, sols, MOCK_USER_SESSION, tmplDict);
    expect(relationshipSpy.calls.count()).withContext("should call the addItemRelationship").toBe(1);
    expect(shareSpy.calls.count()).withContext("should call the shareHelper").toBe(1);
    expect(resp.length).withContext("should only delegate to group sharing").toBe(2);
  });
});
