/*
 | Copyright 2018 Esri
 |
 | Licensed under the Apache License, Version 2.0 (the "License");
 | you may not use this file except in compliance with the License.
 | You may obtain a copy of the License at
 |
 |    http://www.apache.org/licenses/LICENSE-2.0
 |
 | Unless required by applicable law or agreed to in writing, software
 | distributed under the License is distributed on an "AS IS" BASIS,
 | WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 | See the License for the specific language governing permissions and
 | limitations under the License.
 */

/**
 * Check if a given string is a GUID
 * @param stringToTest string that may be a guid
 *
 * @returns boolean indicating if the string is a guid
 */
export default function isGuid(stringToTest: any): boolean {
  if (typeof stringToTest !== "string") {
    return false;
  }
  if (stringToTest[0] === "{") {
    stringToTest = stringToTest.substring(1, stringToTest.length - 1);
  }
  const regexGuid = /^(\{){0,1}[0-9a-fA-F]{8}[-]?[0-9a-fA-F]{4}[-]?[0-9a-fA-F]{4}[-]?[0-9a-fA-F]{4}[-]?[0-9a-fA-F]{12}(\}){0,1}$/gi;
  return regexGuid.test(stringToTest);
}
