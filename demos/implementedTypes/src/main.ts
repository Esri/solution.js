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
// @esri/solution-deployer implementedTypes example

import * as creatorModuleMap from "@esri/solution-creator";
import * as deployerModuleMap from "@esri/solution-deployer";

export function implementedTypes(): string {
  let html: string =
    "<h3>AGO types implemented or being worked on as of " +
    new Date().toString() +
    "</h3>";

  ////////////////////////////////////////////////////////
  // Layer types
  const layerTypes = [
    "Big Data Analytic",
    "Feature Collection",
    "Feature Service",
    "Feed",
    "Geocoding Service",
    "Geodata Service",
    "Geometry Service",
    "Geoprocessing Service",
    "Globe Service",
    "Image Service",
    "KML",
    "Map Service",
    "Network Analysis Service",
    "Real Time Analytic",
    "Relational Database Connection",
    "Scene Service",
    "Stream Service",
    "Tool",
    "Vector Tile Service",
    "WFS",
    "WMS",
    "WMTS",
    "Workflow Manager Service"
  ];

  ////////////////////////////////////////////////////////
  // Map types
  const mapTypes = ["3D Web Scene", "Web Map", "Web Scene"];

  ////////////////////////////////////////////////////////
  // App types
  const appTypes = [
    "Application",
    "Dashboard",
    "Data Store",
    "Desktop Application",
    "Excalibur Imagery Project",
    "Form",
    "Hub Initiative",
    "Hub Page",
    "Hub Site Application",
    "Insights Model",
    "Insights Page",
    "Insights Theme",
    "Insights Workbook",
    "Mission",
    "Mobile Application",
    "Native Application",
    "Notebook",
    "Ortho Mapping Project",
    "QuickCapture Project",
    "Site Application",
    "Site Initiative",
    "Site Page",
    "Solution",
    "StoryMap",
    "Urban Model",
    "Web Experience Template",
    "Web Experience",
    "Web Mapping Application",
    "Workforce Project"
  ];

  ////////////////////////////////////////////////////////
  // File types
  const fileTypes = [
    "360 VR Experience",
    "AppBuilder Extension",
    "AppBuilder Widget Package",
    "Application Configuration",
    "ArcGIS Pro Add In",
    "ArcGIS Pro Configuration",
    "ArcPad Package",
    "Basemap Package",
    "CAD Drawing",
    "CityEngine Web Scene",
    "Code Attachment",
    "Code Sample",
    "Color Set",
    "Compact Tile Package",
    "CSV Collection",
    "CSV",
    "Deep Learning Package",
    "Desktop Add In",
    "Desktop Application Template",
    "Desktop Style",
    "Document Link",
    "Explorer Add In",
    "Explorer Layer",
    "Explorer Map",
    "Feature Collection Template",
    "File Geodatabase",
    "GeoJson",
    "GeoPackage",
    "Geoprocessing Package",
    "Geoprocessing Sample",
    "Globe Document",
    "Image Collection",
    "Image",
    "iWork Keynote",
    "iWork Numbers",
    "iWork Pages",
    "KML Collection",
    "Layer Package",
    "Layer Template",
    "Layer",
    "Layout",
    "Locator Package",
    "Map Document",
    "Map Package",
    "Map Template",
    "Microsoft Excel",
    "Microsoft Powerpoint",
    "Microsoft Word",
    "Mobile Basemap Package",
    "Mobile Map Package",
    "Mobile Scene Package",
    "Native Application Installer",
    "Native Application Template",
    "netCDF",
    "Operation View",
    "Operations Dashboard Add In",
    "Operations Dashboard Extension",
    "PDF",
    "Pro Layer Package",
    "Pro Layer",
    "Pro Map Package",
    "Pro Map",
    "Pro Report",
    "Project Package",
    "Project Template",
    "Published Map",
    "Raster function template",
    "Report Template",
    "Rule Package",
    "Scene Document",
    "Scene Package",
    "Service Definition",
    "Shapefile",
    "Statistical Data Collection",
    "Style",
    "Survey123 Add In",
    "Symbol Set",
    "Task File",
    "Tile Package",
    "Toolbox Package",
    "Vector Tile Package",
    "Viewer Configuration",
    "Visio Document",
    "Window Mobile Package",
    "Windows Mobile Package",
    "Windows Viewer Add In",
    "Windows Viewer Configuration",
    "Workflow Manager Package"
  ];

  html += getImplementedTypes("Layer types", layerTypes);
  html += getImplementedTypes("Map types", mapTypes);
  html += getImplementedTypes("App types", appTypes);
  html += getImplementedTypes("File types", fileTypes);

  return html;
}

function getImplementedTypes(title: string, typeNames: string[]): string {
  let html: string = "<h4>" + title + "</h4>";

  html += "<ul>";
  typeNames.forEach(typeName => {
    const createable = creatorModuleMap.moduleMap[typeName];
    const deployable = deployerModuleMap.moduleMap[typeName];
    if (
      typeof createable !== "undefined" &&
      createable !== null &&
      typeof deployable !== "undefined" &&
      deployable !== null
    ) {
      html += "<li>" + typeName + "</li>";
    }
  });
  html += "</ul>";

  return html;
}
