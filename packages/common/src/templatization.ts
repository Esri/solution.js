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

/**
 * Provides common functions involving the adlib library.
 *
 * @module templatization
 */

import * as adlib from "adlib";

// ------------------------------------------------------------------------------------------------------------------ //

export function deTemplatize(
  context: string,
  term: string,
  suffix = ""
): string {
  if (!context) {
    return context;
  }
  const pattern = new RegExp("{{" + term + suffix + "}}", "g");
  return context.replace(pattern, term);
}

export function replaceInTemplate(template: any, replacements: any): any {
  return adlib.adlib(template, replacements);
}

export function templatize(context: string, term: string, suffix = ""): string {
  if (!context) {
    return context;
  }
  const pattern = new RegExp(term, "g");
  return context.replace(pattern, "{{" + term + suffix + "}}");
}
