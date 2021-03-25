/** @license
 * Copyright 2019 Esri
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
// @esri/solution-common getItemInfo example

import * as common from "@esri/solution-common";

let gItemDataBlob: Blob;

export function getItemInfo(
  itemId: string,
  authentication: common.UserSession
): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    if (!itemId) {
      reject("Item's ID is not defined");
      return;
    }

    // Get the item information
    const itemFwdRelatedItemsDef = common.getItemRelatedItemsInSameDirection(
      itemId,
      "forward",
      authentication
    );
    const itemRevRelatedItemsDef = common.getItemRelatedItemsInSameDirection(
      itemId,
      "reverse",
      authentication
    );

    const itemBaseDef = common.getItemBase(itemId, authentication);
    const itemDataDef = new Promise<Blob>((resolve2, reject2) => {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      itemBaseDef.then(
        // any error fetching item base will be handled via Promise.all later
        (itemBase: any) => {
          common
            .getItemDataAsFile(itemId, itemBase.name, authentication)
            .then(resolve2, (error: any) => reject2(JSON.stringify(error)));
        }
      );
    });
    const itemThumbnailDef = new Promise<Blob>((resolve3, reject3) => {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      itemBaseDef.then(
        // any error fetching item base will be handled via Promise.all later
        (itemBase: any) => {
          common
            .getItemThumbnail(itemId, itemBase.thumbnail, false, authentication)
            .then(resolve3, (error: any) => reject3(JSON.stringify(error)));
        }
      );
    });
    const itemMetadataDef = common.getItemMetadataBlob(itemId, authentication);
    const itemResourcesDef = common.getItemResourcesFiles(
      itemId,
      authentication
    );

    Promise.all([
      itemBaseDef,
      itemDataDef,
      itemThumbnailDef,
      itemMetadataDef,
      itemResourcesDef,
      itemFwdRelatedItemsDef,
      itemRevRelatedItemsDef
    ]).then(
      async responses => {
        const [
          itemBase,
          itemDataBlob,
          itemThumbnail,
          itemMetadataBlob,
          itemResourceFiles,
          itemFwdRelatedItems,
          itemRevRelatedItems
        ] = responses;
        // Summarize what we have
        // ----------------------
        // (itemBase: common.IItem)  text/plain JSON
        // (itemDataBlob: Blob)  */*
        // (itemThumbnail: Blob)  image/*
        // (itemMetadata: Blob)  application/xml
        // (itemResources: File[])  list of */*
        // (itemFwdRelatedItems: common.IRelatedItems[])  list of forward relationshipType/relatedItems[] pairs
        // (itemRevRelatedItems: common.IRelatedItems[])  list of reverse relationshipType/relatedItems[] pairs
        console.log("itemBase", itemBase);
        console.log("itemData", itemDataBlob);
        console.log("itemThumbnail", itemThumbnail);
        console.log("itemMetadata", itemMetadataBlob);
        console.log("itemResources", JSON.stringify(itemResourceFiles));
        console.log("itemFwdRelatedItems", JSON.stringify(itemFwdRelatedItems));
        console.log("itemRevRelatedItems", JSON.stringify(itemRevRelatedItems));
        gItemDataBlob = itemDataBlob;

        const portalUrl = common.getPortalUrlFromAuth(authentication);

        // Show item and data sections
        let html = `
          <h3>${itemBase.type} "${itemBase.title}" ( <a href="${portalUrl}/home/item.html?id=${itemBase.id}" target="_blank">${itemBase.id}</a> )</h3>
          `;

        html +=
          '<div style="width:48%;display:inline-block;">Item</div>' +
          '<div style="width:2%;display:inline-block;"></div>' +
          '<div style="width:48%;display:inline-block;">Data</div>' +
          '<div style="width:48%;display:inline-block;">' +
          textAreaHtmlFromJSON(itemBase) +
          '</div><div style="width:2%;display:inline-block;"></div>' +
          '<div style="width:48%;display:inline-block;vertical-align:top;">';
        html += await showBlob(itemDataBlob);
        html += "</div>";

        // Reserve a place for error messages
        html += "<div id=\"errors\"/ style=\"color:red;font-weight:bold;padding-bottom:24px;\"></div>";

        // Show thumbnail section
        html += "<p>Thumbnail<br/><div>";
        html += await showBlob(itemThumbnail);
        html += "</div></p>";

        // Show metadata section
        html += "<p>Metadata<br/><div>";
        html += await showBlob(itemMetadataBlob);
        html += "</div></p>";

        // Show resources section
        html += "<p>Resources<br/>";
        if (itemResourceFiles.length === 0) {
          html += "<p><i>none</i>";
        } else {
          html += "<ol>";
          // tslint:disable-next-line: prefer-for-of
          for (const resource of itemResourceFiles)
          {
            html += "<li><div>";
            html += await showBlob(resource);
            html += "</div></li>";
          }
          html += "</ol>";
        }
        html += "</p>";

        // Show related items section
        html += "<p>Related Items<br/>";
        if (
          itemFwdRelatedItems.length === 0 &&
          itemRevRelatedItems.length === 0
        ) {
          html += "<p><i>none</i>";
        } else {
          html +=
            "<ul style='margin-left:-36px;list-style-type:none;font-size:smaller;'>";
          for (const relatedItem of itemFwdRelatedItems) {
            html +=
              "<li><span style=\"font-size:x-large\">&rarr;</span> " +
              relatedItem.relationshipType +
              " " +
              JSON.stringify(relatedItem.relatedItemIds) +
              "</li>";
          }
          for (const relatedItem of itemRevRelatedItems) {
            html +=
              "<li><span style=\"font-size:x-large\">&larr;</span> " +
              relatedItem.relationshipType +
              " " +
              JSON.stringify(relatedItem.relatedItemIds) +
              "</li>";
          }
          html += "</ul>";
        }
        html += "</p>";

        // Show sections custom to item types
        if (itemBase.type === "Feature Service") {
          if (authentication.token) {
            // These queries require authentication
            // Show resources section
            common
              .getFeatureServiceProperties(itemBase.url, authentication)
              .then(
                (properties: common.IFeatureServiceProperties) => {
                  html += "<p>Feature Service Properties<br/>";

                  html +=
                    "<p><i>Service description</i><br/>" +
                    textAreaHtmlFromJSON(properties.service) +
                    "</p>";

                  html += "<p><i>Layers</i>";
                  properties.layers.forEach(
                    layer =>
                      (html += textAreaHtmlFromJSON(layer))
                  );
                  html += "</p>";

                  html += "<p><i>Tables</i>";
                  properties.tables.forEach(
                    layer =>
                      (html += textAreaHtmlFromJSON(layer))
                  );
                  html += "</p>";

                  html += "</p>";
                  resolve(html);
                },
                (error: any) => reject(JSON.stringify(error))
              );
          } else {
            resolve(html);
          }
        } else if (itemBase.type === "Solution") {
          html += "<p>Dependency graph<br/><div id=\"topologicalSortGraphic\"/>";
          resolve(html);

          common.blobToJson(gItemDataBlob)
          .then(
            itemData => {
              // Run some quick checks
              try {
                const {buildOrder, missingDependencies, itemsToBePatched} = common.topologicallySortItems(itemData.templates);
                if (buildOrder.length !== itemData.templates.length) {
                  // Duplicate item(s) detected
                  const sortedTemplateIds: string[] = itemData.templates.map((template: any) => template.itemId).sort();
                  let duplicates = "";
                  let lastTemplateId = "";
                  sortedTemplateIds.forEach(
                    templateId => {
                      if (templateId === lastTemplateId) {
                        duplicates += " " + templateId;
                      }
                      lastTemplateId = templateId;
                    }
                  );
                  document.getElementById("errors").innerHTML += "<i>Duplicate template item(s) detected:" +
                    duplicates + " ; only first one found in template list will be used</i>";
                }
              } catch (error) {
                // Cyclical dependency detected
                document.getElementById("errors").innerHTML += "<i>" + error.message + "</i>";
              }
            }
          )
          .catch(
            error => {
              document.getElementById("errors").innerHTML += "<i>error getting templates: " + error + "</i>";
            }
          );
        } else {
          resolve(html);
        }
      },
      (error: any) => reject(JSON.stringify(error))
    );
  });
}

/**
 * Creates the HTML for a textarea using the supplied JSON.
 *
 * @param json JSON to insert into textarea
 * @return textarea HTML
 */
function textAreaHtmlFromJSON(json: any): string {
  return textAreaHtmlFromText(
    JSON.stringify(
      common.sanitizeJSON(json),
      null, 2
    )
  );
}

/**
 * Creates the HTML for a textarea using the supplied text.
 *
 * @param text Text to insert into textarea
 * @return textarea HTML
 */
function textAreaHtmlFromText(text: string): string {
  return (
    '<textarea rows="10" style="width:99%;font-size:x-small">' +
    text +
    "</textarea>"
  );
}

function createGraphTag(template: common.IItemTemplate) {
  return getItemTypeAbbrev(template.type) + ' ' + template.itemId.substr(0, 6);
}

export function showDependencyGraph(
  canvas: HTMLCanvasElement,
  width: number,
  height: number,
  Raphael: any,
  Dracula: any
): Promise<string> {
  // tslint:disable-next-line: no-floating-promises
  return new Promise<string>(resolve => {
    common.blobToJson(gItemDataBlob)
      .then(
        itemData => {
          showTopologicalSortGraph(itemData.templates, canvas, width, height, Raphael, Dracula);
          resolve(null);
        }
      )
      .catch(
        error => resolve("<i>error creating dependency graph: " + error + "</i>")
      );
  });
}

function showTopologicalSortGraph(
  collection: common.IItemTemplate[],
  canvas: HTMLCanvasElement,
  width: number,
  height: number,
  Raphael: any,
  Dracula: any
): void {
  // Draw solution items as a directed graph
  const g = new Dracula.Graph();

  collection.map(template => template.itemId)
  .forEach((id: string) => {
    const template = collection.find(entry => entry.itemId === id);
    const dependencies = template.dependencies || [];
    dependencies.forEach(function (dependencyId: string) {
      const dependencyTemplate = collection.find(entry => entry.itemId === dependencyId);
      g.addEdge(createGraphTag(dependencyTemplate), createGraphTag(template), { directed : true });
    });
  });
  (new Dracula.Layout.Spring(g)).layout();
  (new Dracula.Renderer.Raphael(canvas, g, width, height)).draw();
}

/**
 * Creates the HTML for a blob.
 *
 * @param blob Blob or File to display
 * @return Promise resolving to a string of HTML
 */
function showBlob(blob: Blob): Promise<string> {
  // tslint:disable-next-line: no-floating-promises
  return new Promise<string>(resolve => {
    if (!blob || blob.size === 0) {
      resolve("<i>none</i>");
      return;
    }
    const file = blob as File;
    const filename = file.name || "";

    // Make sure that a JSON file has the right MIME type; forms have a JSON file with an unsupported extension
    if (filename.endsWith(".json")) {
      blob = common.convertResourceToFile({
        blob: file,
        filename: filename,
        mimeType: "application/json"
      });
    }

    if (blob.type === "application/json") {
      common.blobToJson(blob).then(
        text =>
          resolve(
            textAreaHtmlFromJSON(text) + addFilename(filename)
          ),
        error => resolve("<i>problem extracting JSON: " + error + "</i>")
      );
    } else if (
      blob.type.startsWith("text/plain") ||
      blob.type === "text/xml" ||
      blob.type === "application/xml"
    ) {
      common.blobToText(blob).then(
        text => resolve(textAreaHtmlFromText(text) + addFilename(filename)),
        error => resolve("<i>problem extracting text: " + error + "</i>")
      );
    } else if (blob.type.startsWith("image/")) {
      let html =
        '<img src="' +
        window.URL.createObjectURL(blob) +
        '" style="max-width:256px;border:1px solid lightgray;"/>';
      if (filename) {
        html +=
          '&nbsp;&nbsp;&nbsp;&nbsp;<a href="' +
          window.URL.createObjectURL(file) +
          '" download="' +
          filename +
          '">' +
          filename +
          "</a>";
      }
      html += "</p>";
      resolve(html);
    } else {
      if (filename) {
        resolve(
          '<a href="' +
          window.URL.createObjectURL(file) +
          '" download="' +
          filename +
          '">' +
          filename +
          "</a>"
        );
      } else {
        resolve(
          '<a href="' +
          window.URL.createObjectURL(blob) +
          '">' +
          blob.type +
          "</a>"
        );
      }
    }
  });
}

function addFilename(filename: string): string {
  return filename ? "&nbsp;" + filename : "";
}

function getItemTypeAbbrev(type: string): string {
  interface IItemTypeAbbrev {
    [id: string]: string;
  }
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
      "Web Scene": "xxx",

      ////////////////////////////////////////////////////////
      // App types
      Application: "xxx",
      "Data Store": "xxx",
      "Desktop Application": "xxx",
      "Excalibur Imagery Project": "xxx",
      Form: "frm",
      "Hub Initiative": "xxx",
      "Hub Page": "hpg",
      "Hub Site Application": "hsa",
      "Insights Model": "xxx",
      "Insights Page": "xxx",
      "Insights Theme": "xxx",
      "Insights Workbook": "xxx",
      Mission: "xxx",
      "Mobile Application": "xxx",
      "Native Application": "ntv",
      Notebook: "nbk",
      "Ortho Mapping Project": "xxx",
      "QuickCapture Project": "qck",
      "Site Application": "xxx",
      "Site Initiative": "xxx",
      "Site Page": "xxx",
      Solution: "sol",
      StoryMap: "xxx",
      "Urban Model": "xxx",
      "Web Experience Template": "xxx",
      "Web Experience": "xxx",
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
      CSV: "xxx",
      Dashboard: "dsh",
      "Deep Learning Package": "xxx",
      "Desktop Add In": "dai",
      "Desktop Application Template": "dat",
      "Desktop Style": "xxx",
      "Document Link": "dlk",
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
      "Microsoft Word": "doc",
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
