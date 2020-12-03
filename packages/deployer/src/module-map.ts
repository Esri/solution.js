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

import { moduleHandler, IItemTypeModuleMap } from "@esri/solution-common";
import * as featureLayer from "@esri/solution-feature-layer";
import * as fileProcessor from "@esri/solution-file";
import * as formProcessor from "@esri/solution-form";
import * as group from "@esri/solution-group";
import {
  simpleTypes,
  notebookProcessor,
  quickcaptureProcessor
} from "@esri/solution-simple-types";
import { StoryMapProcessor } from "@esri/solution-storymap";
import { WebExperienceProcessor } from "@esri/solution-web-experience";
import { HubPageProcessor, HubSiteProcessor } from "@esri/solution-hub-types";

export const UNSUPPORTED: moduleHandler = null;

/**
 * Mapping from item type to module with type-specific template-handling code.
 * AGO types come from a blend of arcgis-portal-app\src\js\arcgisonline\pages\item\_Info.js and
 * arcgis-portal-app\src\js\arcgis-components\src\_utils\metadata\item\displayName.ts
 */
export const moduleMap: IItemTypeModuleMap = {
  ////////////////////////////////////////////////////////
  // Group type
  Group: group,

  ////////////////////////////////////////////////////////
  // Layer types
  "Big Data Analytic": undefined,
  "Feature Collection": undefined,
  "Feature Service": featureLayer,
  Feed: undefined,
  "Geocoding Service": undefined,
  "Geodata Service": undefined,
  "Geometry Service": undefined,
  "Geoprocessing Service": undefined,
  "Globe Service": undefined,
  "Image Service": undefined,
  KML: undefined,
  "Map Service": featureLayer,
  "Network Analysis Service": undefined,
  "Real Time Analytic": undefined,
  "Relational Database Connection": undefined,
  "Scene Service": undefined,
  "Stream Service": undefined,
  Tool: undefined,
  "Vector Tile Service": undefined,
  WFS: undefined,
  WMS: undefined,
  WMTS: undefined,
  "Workflow Manager Service": undefined,

  ////////////////////////////////////////////////////////
  // Map types
  "3D Web Scene": undefined,
  "Web Map": simpleTypes,
  "Web Scene": undefined,

  ////////////////////////////////////////////////////////
  // App types
  Application: undefined,
  Dashboard: simpleTypes,
  "Data Store": undefined,
  "Desktop Application": undefined,
  "Excalibur Imagery Project": undefined,
  Form: formProcessor,
  "Hub Initiative": UNSUPPORTED,
  "Hub Page": HubPageProcessor,
  "Hub Site Application": HubSiteProcessor,
  "Insights Model": simpleTypes,
  "Insights Page": undefined,
  "Insights Theme": undefined,
  "Insights Workbook": undefined,
  Mission: undefined,
  "Mobile Application": undefined,
  Notebook: notebookProcessor,
  "Oriented Imagery Catalog": simpleTypes,
  "Ortho Mapping Project": undefined,
  "QuickCapture Project": quickcaptureProcessor,
  "Site Application": HubSiteProcessor,
  "Site Page": HubPageProcessor,
  Solution: UNSUPPORTED,
  StoryMap: StoryMapProcessor,
  "Urban Model": undefined,
  "Web Experience Template": undefined,
  "Web Experience": WebExperienceProcessor,
  "Web Mapping Application": simpleTypes,
  "Workforce Project": simpleTypes,

  ////////////////////////////////////////////////////////
  // File types
  "360 VR Experience": fileProcessor,
  "AppBuilder Extension": fileProcessor,
  "AppBuilder Widget Package": fileProcessor,
  "Application Configuration": fileProcessor,
  "ArcGIS Pro Add In": fileProcessor,
  "ArcGIS Pro Configuration": fileProcessor,
  "ArcPad Package": fileProcessor,
  "Basemap Package": fileProcessor,
  "CAD Drawing": fileProcessor,
  "CityEngine Web Scene": fileProcessor,
  "Code Attachment": UNSUPPORTED,
  "Code Sample": fileProcessor,
  "Color Set": fileProcessor,
  "Compact Tile Package": fileProcessor,
  "CSV Collection": fileProcessor,
  CSV: fileProcessor,
  "Deep Learning Package": fileProcessor,
  "Desktop Add In": fileProcessor,
  "Desktop Application Template": fileProcessor,
  "Desktop Style": fileProcessor,
  "Document Link": fileProcessor,
  "Explorer Add In": fileProcessor,
  "Explorer Layer": fileProcessor,
  "Explorer Map": fileProcessor,
  "Feature Collection Template": fileProcessor,
  "File Geodatabase": fileProcessor,
  GeoJson: fileProcessor,
  GeoPackage: fileProcessor,
  "Geoprocessing Package": fileProcessor,
  "Geoprocessing Sample": fileProcessor,
  "Globe Document": fileProcessor,
  "Image Collection": fileProcessor,
  Image: fileProcessor,
  "iWork Keynote": fileProcessor,
  "iWork Numbers": fileProcessor,
  "iWork Pages": fileProcessor,
  "KML Collection": fileProcessor,
  "Layer Package": fileProcessor,
  "Layer Template": fileProcessor,
  Layer: fileProcessor,
  Layout: fileProcessor,
  "Locator Package": fileProcessor,
  "Map Document": fileProcessor,
  "Map Package": fileProcessor,
  "Map Template": fileProcessor,
  "Microsoft Excel": fileProcessor,
  "Microsoft Powerpoint": fileProcessor,
  "Microsoft Word": fileProcessor,
  "Mobile Basemap Package": fileProcessor,
  "Mobile Map Package": fileProcessor,
  "Mobile Scene Package": fileProcessor,
  "Native Application": fileProcessor,
  "Native Application Installer": fileProcessor,
  "Native Application Template": fileProcessor,
  netCDF: fileProcessor,
  "Operation View": fileProcessor,
  "Operations Dashboard Add In": fileProcessor,
  "Operations Dashboard Extension": fileProcessor,
  PDF: fileProcessor,
  "Pro Layer Package": fileProcessor,
  "Pro Layer": fileProcessor,
  "Pro Map Package": fileProcessor,
  "Pro Map": fileProcessor,
  "Pro Report": fileProcessor,
  "Project Package": fileProcessor,
  "Project Template": fileProcessor,
  "Published Map": fileProcessor,
  "Raster function template": fileProcessor,
  "Report Template": fileProcessor,
  "Rule Package": fileProcessor,
  "Scene Document": fileProcessor,
  "Scene Package": fileProcessor,
  "Service Definition": fileProcessor,
  Shapefile: fileProcessor,
  "Statistical Data Collection": fileProcessor,
  Style: fileProcessor,
  "Survey123 Add In": fileProcessor,
  "Symbol Set": fileProcessor,
  "Task File": fileProcessor,
  "Tile Package": fileProcessor,
  "Toolbox Package": fileProcessor,
  "Vector Tile Package": fileProcessor,
  "Viewer Configuration": fileProcessor,
  "Visio Document": fileProcessor,
  "Window Mobile Package": fileProcessor,
  "Windows Mobile Package": fileProcessor,
  "Windows Viewer Add In": fileProcessor,
  "Windows Viewer Configuration": fileProcessor,
  "Workflow Manager Package": fileProcessor,

  ////////////////////////////////////////////////////////
  // Testing "types"
  Undefined: undefined,
  Unsupported: UNSUPPORTED
};
