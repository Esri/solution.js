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

import { CherryBlossoms } from "../fixtures/storymap-fixtures";
import { cloneObject, getProp, IModel } from "@esri/hub-common";

import { convertStoryMapToTemplate } from "../../src/helpers/convert-storymap-to-template";
import * as utils from "../../../common/test/mocks/utils";

const MOCK_USER_SESSION = utils.createRuntimeMockUserSession();

describe("convert-storymap-to-template :: ", () => {
  let model: IModel;
  beforeEach(() => {
    model = cloneObject(CherryBlossoms);
  });

  it("converts new storymap", () => {
    return convertStoryMapToTemplate(model, MOCK_USER_SESSION).then(tmpl => {
      // ensure top props are right
      expect(tmpl.itemId).toBe(model.item.id, "should hold itemId");
      expect(tmpl.type).toBe("StoryMap", "should hold type");
      // ensure we have remapped the webmap keys
      // get original key from the model
      const webmapKey = Object.keys(model.data.resources).reduce((acc, key) => {
        if (getProp(model, `data.resources.${key}.type`) === "webmap") {
          acc = getProp(model, `data.resources.${key}.data.itemId`);
        }
        return acc;
      }, "");
      // now see if we have any references to that in the data graph
      const ct = JSON.stringify(tmpl.data.nodes).indexOf(webmapKey);
      expect(ct).toBe(
        -1,
        "should replace all occurences of the old webmap key"
      );
      // ensure we have the dependencies
      expect(tmpl.dependencies.length).toBe(1, "should find one webmap dep");
      expect(tmpl.dependencies[0]).toBe(
        "7cde2828cb7042e39930412313935372",
        "should find this webmap"
      );
      expect(tmpl.properties).toBeDefined("should have props");
      expect(tmpl.properties.draftFileName).toBeDefined(
        "should have props.draftFileName"
      );
      expect(tmpl.properties.oembed).toBeDefined("should have props.oembed");
      expect(tmpl.properties.oembedXML).toBeDefined(
        "should have props.oembedXML"
      );
    });
  });

  it("removes unpublished kwd", () => {
    const modelWithUnpublished = cloneObject(model);
    modelWithUnpublished.item.typeKeywords.push("smstatusunpublishedchanges");

    return convertStoryMapToTemplate(
      modelWithUnpublished,
      MOCK_USER_SESSION
    ).then(tmpl => {
      expect(tmpl.item.typeKeywords.indexOf("smstatusunpublishedchanges")).toBe(
        -1,
        "should remove unpublished kwd"
      );
    });
  });
});
