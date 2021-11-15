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

import { cloneObject, IItemTemplate } from "@esri/hub-common";
import { _upgradeTwoDotFive } from "../../src/migrations/upgrade-two-dot-five";
import * as utils from "../../../common/test/mocks/utils";
import { ISolutionItem } from "../../src/interfaces";

describe("Upgrade 2.5 ::", () => {
  const theme = {
    id: "hrEKQnEsn",
    name: "theme-custom"
  };
  const question = {
    appearance: {
      layout: "horizontal"
    }
  };
  const defaultModel = {
    item: {
      type: "Solution",
      typeKeywords: ["Solution", "Template"],
      properties: {
        schemaVersion: 2.4
      }
    },
    data: {
      templates: [
        {
          type: "Form",
          properties: {
            form: {
              version: "3.7",
              portalUrl: utils.PORTAL_SUBSET.portalUrl,
              layerName: "someName",
              theme,
              questions: [question]
            }
          }
        }
      ] as IItemTemplate[]
    }
  } as ISolutionItem;

  const MOCK_USER_SESSION = utils.createRuntimeMockUserSession();

  it("returns same model if on or above 2.5", () => {
    const model = cloneObject(defaultModel);
    model.item.properties.schemaVersion = 2.5;
    const results = _upgradeTwoDotFive(model);
    expect(results).toBe(model, "should return the exact same object");
  });

  it("only upgrades the schema version for non-Form templates", () => {
    const model = cloneObject(defaultModel);
    model.data.templates[0].type = "Feature Service";
    const results = _upgradeTwoDotFive(model);
    const expected = cloneObject(model);
    expected.item.properties.schemaVersion = 2.5;
    expect(results).toEqual(expected);
  });

  it("it always tokenizes portalUrl when the key/value exists for Form templates", () => {
    const model = cloneObject(defaultModel);
    model.data.templates[0].properties.form.version = 3.8;
    const results = _upgradeTwoDotFive(model);
    const expected = cloneObject(model);
    expected.item.properties.schemaVersion = 2.5;
    expected.data.templates[0].properties.form.portalUrl = "{{portalBaseUrl}}";
    expect(results).toEqual(expected);
  });

  it("it doesn't tokenize portalUrl when the key/value is missing for Form templates", () => {
    const model = cloneObject(defaultModel);
    model.data.templates[0].properties.form.version = 3.8;
    delete model.data.templates[0].properties.form.portalUrl;
    const results = _upgradeTwoDotFive(model);
    const expected = cloneObject(model);
    expected.item.properties.schemaVersion = 2.5;
    expect(results).toEqual(expected);
  });

  it("it doesn't migrate the Form template's form config schema when the version is >= 3.8", () => {
    const model = cloneObject(defaultModel);
    model.data.templates[0].properties.form.version = 3.8;
    const results = _upgradeTwoDotFive(model);
    const expected = cloneObject(model);
    expected.data.templates[0].properties.form.portalUrl = "{{portalBaseUrl}}";
    expected.item.properties.schemaVersion = 2.5;
    expect(results).toEqual(expected);
  });

  it("it doesn't migrate the Form template's form config schema when that schema is missing", () => {
    const model = cloneObject(defaultModel);
    delete model.data.templates[0].properties.form;
    const results = _upgradeTwoDotFive(model);
    const expected = cloneObject(model);
    expected.item.properties.schemaVersion = 2.5;
    expect(results).toEqual(expected);
  });

  it("it defaults the Form template's form config schema to 2.5 if not set then upgrades the form config schema", () => {
    const model = cloneObject(defaultModel);
    delete model.data.templates[0].properties.form.version;
    const results = _upgradeTwoDotFive(model);
    const expected = cloneObject(model);
    expected.data.templates[0].properties.form.portalUrl = "{{portalBaseUrl}}";
    expected.data.templates[0].properties.form.layerName = "survey";
    expected.data.templates[0].properties.form.themes = [theme];
    delete expected.data.templates[0].properties.form.theme;
    expected.data.templates[0].properties.form.questions[0].appearance.layout =
      "vertical";
    expected.data.templates[0].properties.form.version = 3.8;
    expected.item.properties.schemaVersion = 2.5;
    expect(results).toEqual(expected);
  });

  it("it upgrades the Form template's form config schema when it's < 3.8", () => {
    const model = cloneObject(defaultModel);
    const results = _upgradeTwoDotFive(model);
    const expected = cloneObject(model);
    expected.data.templates[0].properties.form.portalUrl = "{{portalBaseUrl}}";
    expected.data.templates[0].properties.form.layerName = "survey";
    expected.data.templates[0].properties.form.themes = [theme];
    delete expected.data.templates[0].properties.form.theme;
    expected.data.templates[0].properties.form.questions[0].appearance.layout =
      "vertical";
    expected.data.templates[0].properties.form.version = 3.8;
    expected.item.properties.schemaVersion = 2.5;
    expect(results).toEqual(expected);
  });

  it("it upgrades the Form template's form config schema when it's < 3.8 with pages", () => {
    const model = cloneObject(defaultModel);
    model.data.templates[0].properties.form.questions = [{
      questions: model.data.templates[0].properties.form.questions
    }];
    const results = _upgradeTwoDotFive(model);
    const expected = cloneObject(model);
    expected.data.templates[0].properties.form.portalUrl = "{{portalBaseUrl}}";
    expected.data.templates[0].properties.form.layerName = "survey";
    expected.data.templates[0].properties.form.themes = [theme];
    delete expected.data.templates[0].properties.form.theme;
    expected.data.templates[0].properties.form.questions[0].questions[0].appearance.layout =
      "vertical";
    expected.data.templates[0].properties.form.version = 3.8;
    expected.item.properties.schemaVersion = 2.5;
    expect(results).toEqual(expected);
  });

  it("it doesn't wrap the theme in an array when it's missing", () => {
    const model = cloneObject(defaultModel);
    delete model.data.templates[0].properties.form.theme;
    const results = _upgradeTwoDotFive(model);
    const expected = cloneObject(model);
    expected.data.templates[0].properties.form.portalUrl = "{{portalBaseUrl}}";
    expected.data.templates[0].properties.form.layerName = "survey";
    delete expected.data.templates[0].properties.form.theme;
    expected.data.templates[0].properties.form.questions[0].appearance.layout =
      "vertical";
    expected.data.templates[0].properties.form.version = 3.8;
    expected.item.properties.schemaVersion = 2.5;
    expect(results).toEqual(expected);
  });

  it("it doesn't migrate appearance.layout when appearance is missing", () => {
    const model = cloneObject(defaultModel);
    delete model.data.templates[0].properties.form.questions[0].appearance;
    const results = _upgradeTwoDotFive(model);
    const expected = cloneObject(model);
    delete expected.data.templates[0].properties.form.questions[0].appearance;
    expected.data.templates[0].properties.form.portalUrl = "{{portalBaseUrl}}";
    expected.data.templates[0].properties.form.layerName = "survey";
    expected.data.templates[0].properties.form.themes = [theme];
    delete expected.data.templates[0].properties.form.theme;
    expected.data.templates[0].properties.form.version = 3.8;
    expected.item.properties.schemaVersion = 2.5;
    expect(results).toEqual(expected);
  });

  it("it doesn't migrate appearance.layout when layout is missing", () => {
    const model = cloneObject(defaultModel);
    delete model.data.templates[0].properties.form.questions[0].appearance
      .layout;
    const results = _upgradeTwoDotFive(model);
    const expected = cloneObject(model);
    delete expected.data.templates[0].properties.form.questions[0].appearance
      .layout;
    expected.data.templates[0].properties.form.portalUrl = "{{portalBaseUrl}}";
    expected.data.templates[0].properties.form.layerName = "survey";
    expected.data.templates[0].properties.form.themes = [theme];
    delete expected.data.templates[0].properties.form.theme;
    expected.data.templates[0].properties.form.version = 3.8;
    expected.item.properties.schemaVersion = 2.5;
    expect(results).toEqual(expected);
  });
});
