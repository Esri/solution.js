/** @license
 * Copyright 2021 Esri
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
  templatizeVelocity,
  _templatize,
  _templatizeDatasources,
  _templatizeFeed,
  _templatizeFeeds
} from "../../src/helpers/velocity-templatize";
import * as templates from "../../../common/test/mocks/templates";
import * as agolItems from "../../../common/test/mocks/agolItems";

describe("templatizeVelocity", () => {
  it("handles Real Time Analytic", () => {
    const itemId: string = "aaaaf0cf8bdc4fb19749cc1cbad1651b";
    const type: string = "Real Time Analytic";
    const t = templates.getItemTemplateSkeleton();
    t.itemId = itemId;
    t.type = type;
    t.item = agolItems.getAGOLItem(type, "", itemId);
    t.item.title = type;
    t.data = agolItems.getAGOLItemData(type, itemId);

    templatizeVelocity(t);

    expect(t.data.sources[0].properties["feature-layer.portalItemId"]).toEqual(
      `{{${itemId}.itemId}}`
    );

    expect(t.data.feeds[0].id).toEqual(
      "{{bbb9398bcf8c4dc5a50cceaa59baf513.itemId}}"
    );
    expect(t.data.feeds[0].label).toEqual(
      "{{bbb9398bcf8c4dc5a50cceaa59baf513.label}}"
    );

    expect(t.data.feeds[1].id).toEqual(
      "{{ccc6347e0c4f4dc8909da399418cafbe.itemId}}"
    );
    expect(t.data.feeds[1].label).toEqual(
      "{{ccc6347e0c4f4dc8909da399418cafbe.label}}"
    );
  });
});

describe("_templatizeFeeds", () => {
  it("does not change feed values with missing id", () => {
    const feed: any = {
      id: undefined,
      label: "A"
    };
    const feeds: any[] = [feed];
    const actual = _templatizeFeeds(feeds);
    expect(actual[0]).toEqual(feed);
  });

  it("updates id and label", () => {
    const feed: any = {
      id: "ABC133",
      label: "A"
    };
    const feeds: any[] = [feed];
    const actual = _templatizeFeeds(feeds);
    const expected = {
      label: `{{ABC133.label}}`,
      id: `{{ABC133.itemId}}`
    };
    expect(actual[0]).toEqual(expected);
  });
});

describe("_templatizeFeed", () => {
  it("updates feature-layer.layerId", () => {
    const id = "ABC123";
    const feed: any = {
      properties: {
        "feature-layer.layerId": 0,
        "feature-layer.portalItemId": id
      }
    };
    const actual = _templatizeFeed(feed);
    const expected = {
      properties: {
        "feature-layer.layerId": `{{${id}.layer0.layerId}}`,
        "feature-layer.portalItemId": `{{${id}.itemId}}`
      }
    };
    expect(actual).toEqual(expected);
  });
});
