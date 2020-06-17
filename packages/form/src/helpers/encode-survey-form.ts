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

import { cloneObject } from "@esri/solution-common";

/**
 * Manages Survey123 parameter encoding
 *
 * @module encode-survey-form
 */

/**
 * URI Encodes Survey123 form content parameter
 * values
 * @param {any} form Unencoded form data
 * @returns {any} Encoded form data
 */
export const encodeSurveyForm = function encodeForm(form: any) {
  const clone = cloneObject(form);
  const props = [
    ["header", "content"],
    ["subHeader", "content"],
    ["footer", "content"],
    ["settings", "thankYouScreenContent"]
  ];
  const encode = (
    obj: { [key: string]: string },
    key: string
  ): { [key: string]: string } => {
    if (obj && obj[key]) {
      obj[key] = encodeURIComponent(obj[key]);
    }
    return obj;
  };

  // encode props from array above
  props.forEach(([objKey, propKey]) => encode(clone[objKey], propKey));

  // encode question descriptions
  clone.questions = (clone.questions || []).map((question: any) =>
    encode(question, "description")
  );

  return clone;
};
