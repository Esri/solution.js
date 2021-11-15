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

import { getProp, cloneObject } from "@esri/solution-common";
import { encodeSurveyForm } from "../../src/helpers/encode-survey-form";

// ------------------------------------------------------------------------------------------------------------------ //

describe("encodeSurveyForm", () => {
  let form: any;
  beforeEach(() => {
    form = {
      header: {
        encoded:
          "%3Cp%20title%3D'Whos%20the%20best%20cat'%3EWhos%20the%20best%20cat%3C%2Fp%3E",
        content: "<p title='Whos the best cat'>Whos the best cat</p>"
      },
      subHeader: {
        encoded: "This%20is%20encoded",
        content: "This is encoded"
      },
      footer: {
        encoded: "This%20is%20encoded",
        content: "This is encoded"
      },
      questions: [
        {
          encoded: "This%20is%20encoded",
          description: "This is encoded"
        }
      ],
      settings: {
        encoded: "This%20is%20encoded",
        thankYouScreenContent: "This is encoded"
      }
    };
  });
  it("should encode specific property values", () => {
    const checks = [
      { contentPath: "header.content", verifyPath: "header.encoded" },
      { contentPath: "subHeader.content", verifyPath: "subHeader.encoded" },
      { contentPath: "footer.content", verifyPath: "footer.encoded" },
      {
        contentPath: "settings.thankYouScreenContent",
        verifyPath: "settings.encoded"
      }
    ];
    const results = encodeSurveyForm(form);
    expect(form).not.toEqual(results, "should not mutate the passed in form");
    checks.forEach(e => {
      expect(getProp(results, e.contentPath)).toEqual(
        getProp(results, e.verifyPath),
        `${e.contentPath} should be encoded`
      );
    });
    const question = results.questions[0];
    expect(question.description).toEqual(
      question.encoded,
      "Question descriptions should be encoded"
    );
  });

  it("should encode pages", () => {
    form.questions = [{ questions: form.questions }];
    const checks = [
      { contentPath: "header.content", verifyPath: "header.encoded" },
      { contentPath: "subHeader.content", verifyPath: "subHeader.encoded" },
      { contentPath: "footer.content", verifyPath: "footer.encoded" },
      {
        contentPath: "settings.thankYouScreenContent",
        verifyPath: "settings.encoded"
      }
    ];
    const results = encodeSurveyForm(form);
    expect(form).not.toEqual(results, "should not mutate the passed in form");
    checks.forEach(e => {
      expect(getProp(results, e.contentPath)).toEqual(
        getProp(results, e.verifyPath),
        `${e.contentPath} should be encoded`
      );
    });
    const question = results.questions[0].questions[0];
    expect(question.description).toEqual(
      question.encoded,
      "Question descriptions should be encoded"
    );
  });

  it("should set questions to an empty array when the property is missing", () => {
    delete form.questions;
    const results = encodeSurveyForm(form);
    expect(results.questions).toEqual([]);
  });

  it("should not encode missing properties", () => {
    const checks = [
      { contentPath: "header.content", verifyPath: "header.encoded" },
      { contentPath: "subHeader.content", verifyPath: "subHeader.encoded" },
      { contentPath: "footer.content", verifyPath: "footer.encoded" }
    ];
    const cloned = cloneObject(form);
    const expected = cloneObject(form);
    delete cloned.settings;
    delete expected.settings;
    const results = encodeSurveyForm(cloned);
    checks.forEach(e => {
      expect(getProp(results, e.contentPath)).toEqual(
        getProp(results, e.verifyPath),
        `${e.contentPath} should be encoded`
      );
    });
    expect(results.settings).toBeUndefined();
  });
});
