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
 * Manages the creation and deployment of simple item types.
 *
 * @module simple-types
 */
import * as simpleTypeHelpers from "./helpers/simple-type-helpers";
import * as notebookHelpers from "./helpers/notebook-helpers";

import * as simpleTypes from "./simple-types";
import * as notebookProcessor from "./notebook/notebook-processor";
import * as quickcaptureProcessor from "./quickcapture/quickcapture-processor";
import * as webmapProcessor from "./webmap/webmap-processor";
import * as webappProcessor from "./webapp/webapp-processor";
import * as dashboardProcessor from "./dashboard/dashboard-processor";
import * as workforceProcessor from "./workforce/workforce-processor";

export {
  dashboardProcessor,
  notebookHelpers,
  notebookProcessor,
  quickcaptureProcessor,
  simpleTypeHelpers,
  simpleTypes,
  webappProcessor,
  webmapProcessor,
  workforceProcessor
};
