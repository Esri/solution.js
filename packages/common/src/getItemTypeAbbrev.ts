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

// ------------------------------------------------------------------------------------------------------------------ //

export interface IItemTypeAbbrev {
  [id: string]: string;
}

export function getItemTypeAbbrev(type: string): string {
  // Supported item types
  return (
    ({
      ////////////////////////////////////////////////////////
      // Group type
      Group: "grp",

      ////////////////////////////////////////////////////////
      // Layer types
      "Big Data Analytic": "xxx",
      "Feature Collection": "col",
      "Feature Service": "svc",
      Feed: "xxx",
      "Geocoding Service": "xxx",
      "Geodata Service": "xxx",
      "Geometry Service": "xxx",
      "Geoprocessing Service": "xxx",
      "Globe Service": "xxx",
      "Image Service": "xxx",
      KML: "xxx",
      "Map Service": "xxx",
      "Network Analysis Service": "xxx",
      "Real Time Analytic": "xxx",
      "Relational Database Connection": "xxx",
      "Scene Service": "xxx",
      "Stream Service": "xxx",
      Tool: "xxx",
      "Vector Tile Service": "xxx",
      WFS: "xxx",
      WMS: "xxx",
      WMTS: "xxx",
      "Workflow Manager Service": "xxx",

      ////////////////////////////////////////////////////////
      // Map types
      "3D Web Scene": "xxx",
      "Web Map": "map",
      "Web Scene": "sc2",

      ////////////////////////////////////////////////////////
      // App types
      Application: "xxx",
      "Data Store": "xxx",
      "Desktop Application": "xxx",
      "Excalibur Imagery Project": "xxx",
      Form: "frm",
      "Hub Initiative": "hin",
      "Hub Page": "hpg",
      "Hub Site Application": "hsa",
      "Insights Model": "xxx",
      "Insights Page": "xxx",
      "Insights Theme": "xxx",
      "Insights Workbook": "xxx",
      Mission: "xxx",
      "Mobile Application": "xxx",
      "Native Application": "xxx",
      Notebook: "nbk",
      "Oriented Imagery Catalog": "oic",
      "Ortho Mapping Project": "xxx",
      "QuickCapture Project": "qck",
      "Site Application": "xxx",
      "Site Initiative": "xxx",
      "Site Page": "xxx",
      Solution: "sol",
      StoryMap: "sty",
      "Urban Model": "xxx",
      "Web Experience Template": "wxt",
      "Web Experience": "wex",
      "Web Mapping Application": "wma",
      "Workforce Project": "wrk",

      ////////////////////////////////////////////////////////
      // File types
      "360 VR Experience": "xxx",
      "AppBuilder Extension": "xxx",
      "AppBuilder Widget Package": "xxx",
      "Application Configuration": "xxx",
      "ArcGIS Pro Add In": "pro",
      "ArcGIS Pro Configuration": "xxx",
      "ArcPad Package": "xxx",
      "Basemap Package": "xxx",
      "CAD Drawing": "xxx",
      "CityEngine Web Scene": "xxx",
      "Code Attachment": "cod",
      "Code Sample": "sam",
      "Color Set": "xxx",
      "Compact Tile Package": "xxx",
      "CSV Collection": "xxx",
      CSV: "csv",
      Dashboard: "dsh",
      "Deep Learning Package": "xxx",
      "Desktop Add In": "dai",
      "Desktop Application Template": "dat",
      "Desktop Style": "xxx",
      "Document Link": "doc",
      "Explorer Add In": "xxx",
      "Explorer Layer": "xxx",
      "Explorer Map": "xxx",
      "Feature Collection Template": "xxx",
      "File Geodatabase": "xxx",
      GeoJson: "jsn",
      GeoPackage: "xxx",
      "Geoprocessing Package": "gpk",
      "Geoprocessing Sample": "geo",
      "Globe Document": "xxx",
      "Image Collection": "xxx",
      Image: "img",
      "iWork Keynote": "xxx",
      "iWork Numbers": "xxx",
      "iWork Pages": "xxx",
      "KML Collection": "xxx",
      "Layer Package": "lyp",
      "Layer Template": "xxx",
      Layer: "xxx",
      Layout: "xxx",
      "Locator Package": "xxx",
      "Map Document": "xxx",
      "Map Package": "xxx",
      "Map Template": "mpt",
      "Microsoft Excel": "xls",
      "Microsoft Powerpoint": "ppt",
      "Microsoft Word": "wrd",
      "Mobile Basemap Package": "xxx",
      "Mobile Map Package": "xxx",
      "Mobile Scene Package": "xxx",
      "Native Application Installer": "xxx",
      "Native Application Template": "xxx",
      netCDF: "xxx",
      "Operation View": "opv",
      "Operations Dashboard Add In": "xxx",
      "Operations Dashboard Extension": "xxx",
      PDF: "xxx",
      "Pro Layer Package": "xxx",
      "Pro Layer": "xxx",
      "Pro Map Package": "prm",
      "Pro Map": "xxx",
      "Pro Report": "xxx",
      "Project Package": "ppk",
      "Project Template": "prt",
      "Published Map": "xxx",
      "Raster function template": "xxx",
      "Report Template": "xxx",
      "Rule Package": "xxx",
      "Scene Document": "xxx",
      "Scene Package": "xxx",
      "Service Definition": "xxx",
      Shapefile: "xxx",
      "Statistical Data Collection": "xxx",
      Style: "xxx",
      "Survey123 Add In": "xxx",
      "Symbol Set": "xxx",
      "Task File": "xxx",
      "Tile Package": "xxx",
      "Toolbox Package": "xxx",
      "Vector Tile Package": "xxx",
      "Viewer Configuration": "xxx",
      "Visio Document": "xxx",
      "Window Mobile Package": "xxx",
      "Windows Mobile Package": "xxx",
      "Windows Viewer Add In": "xxx",
      "Windows Viewer Configuration": "xxx",
      "Workflow Manager Package": "xxx",

      ////////////////////////////////////////////////////////
      // Testing "types"
      Undefined: "und",
      Unsupported: "unk"
    } as IItemTypeAbbrev)[type] || "xxx"
  );
}
