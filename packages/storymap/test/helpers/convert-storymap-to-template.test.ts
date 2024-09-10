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

describe("convert-storymap-to-template :: ", () => {
  let model: IModel;
  beforeEach(() => {
    model = cloneObject(CherryBlossoms);
  });

  it("converts new storymap", async() => {
    const tmpl = await convertStoryMapToTemplate(model);
    // ensure top props are right
    expect(tmpl.itemId).withContext("should hold itemId").toBe(model.item.id);
    expect(tmpl.type).withContext("should hold type").toBe("StoryMap");
    // ensure we have remapped the webmap keys
    // get original key from the model
    const webmapKey = Object.keys(model.data?.resources).reduce((acc, key) => {
      if (getProp(model, `data.resources.${key}.type`) === "webmap") {
        acc = getProp(model, `data.resources.${key}.data.itemId`);
      }
      return acc;
    }, "");
    // now see if we have any references to that in the data graph
    const ct = JSON.stringify(tmpl.data.nodes).indexOf(webmapKey);
    expect(ct).withContext("should replace all occurences of the old webmap key").toBe(-1);
    // ensure we have the dependencies
    expect(tmpl.dependencies.length).withContext("should find one webmap dep").toBe(1);
    expect(tmpl.dependencies[0]).withContext("should find this webmap").toBe("7cde2828cb7042e39930412313935372");
    expect(tmpl.properties).withContext("should have props").toBeDefined();
    expect(tmpl.properties.draftFileName).withContext("should have props.draftFileName").toBeDefined();
    expect(tmpl.properties.oembed).withContext("should have props.oembed").toBeDefined();
    expect(tmpl.properties.oembedXML).withContext("should have props.oembedXML").toBeDefined();
  });

  it("removes unpublished kwd", async() => {
    const modelWithUnpublished = cloneObject(model);
    if (modelWithUnpublished.item.typeKeywords) {
      modelWithUnpublished.item.typeKeywords.push("smstatusunpublishedchanges");
    }

    const tmpl = await convertStoryMapToTemplate(modelWithUnpublished);
    expect(tmpl.item.typeKeywords?.indexOf("smstatusunpublishedchanges"))
      .withContext("should remove unpublished kwd")
      .toBe(-1);
  });
});
