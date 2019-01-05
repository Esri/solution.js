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

// -- Externals ------------------------------------------------------------------------------------------------------//

/**
 * Returns the url for an item's icon based on its type and typeKeywords
 * @param imgDir - the JSAPI image directory to use for the icon
 * @param type - the item's type
 * @param typeKeywords - the item's typeKeywords
 */
export const getItemIcon = (imgDir: string, type: string, typeKeywords = [] as string[]): string => {
    const itemType = type && type.toLowerCase();
    const size = "16";
    let isRouteLayer = false;
    let isMarkupLayer = false;
    let isSpatiotemporal = false;
    let isTable = false;
    let imgName;

    if (itemType.indexOf("service") > 0 || itemType === "feature collection" || itemType === "kml" ||
        itemType === "wms" || itemType === "wmts" || itemType === "wfs") {
      const isHosted = typeKeywords.indexOf("Hosted Service") > -1;
      if (itemType === "feature service" || itemType === "feature collection" || itemType === "kml" ||
          itemType === "wfs") {
        isTable = typeKeywords.indexOf("Table") > -1;
        isRouteLayer = typeKeywords.indexOf("Route Layer") > -1;
        isMarkupLayer = typeKeywords.indexOf("Markup") > -1;
        isSpatiotemporal = typeKeywords.indexOf("Spatiotemporal") !== -1;
        imgName =
          isSpatiotemporal && isTable
            ? "spatiotemporaltable"
            : isTable
              ? "table"
              : isRouteLayer
                ? "routelayer"
                : isMarkupLayer
                  ? "markup"
                  : isSpatiotemporal
                    ? "spatiotemporal"
                    : isHosted
                      ? "featureshosted"
                      : "features";
      } else if (itemType === "map service" || itemType === "wms" || itemType === "wmts") {
        imgName = (isHosted || typeKeywords.indexOf("Tiled") > -1 || itemType === "wmts") ? "maptiles" : "mapimages";
      } else if (itemType === "scene service") {
        if (typeKeywords.indexOf("Line") > -1) {
          imgName = "sceneweblayerline";
        } else if (typeKeywords.indexOf("3DObject") > -1) {
          imgName = "sceneweblayermultipatch";
        } else if (typeKeywords.indexOf("Point") > -1) {
          imgName = "sceneweblayerpoint";
        } else if (typeKeywords.indexOf("IntegratedMesh") > -1) {
          imgName = "sceneweblayermesh";
        } else if (typeKeywords.indexOf("PointCloud") > -1) {
          imgName = "sceneweblayerpointcloud";
        } else if (typeKeywords.indexOf("Polygon") > -1) {
          imgName = "sceneweblayerpolygon";
        } else {
          imgName = "sceneweblayer";
        }
      } else if (itemType === "image service") {
        imgName = typeKeywords.indexOf("Elevation 3D Layer") > -1 ? "elevationlayer" : "imagery";
      } else if (itemType === "stream service") {
        imgName = "streamlayer";
      } else if (itemType === "vector tile service") {
        imgName = "vectortile";
      } else if (itemType === "datastore catalog service") {
        imgName = "datastorecollection";
      } else if (itemType === "geocoding service") {
        imgName = "geocodeservice";
      } else if (itemType === "geoprocessing service") {
        imgName = (typeKeywords.indexOf("Web Tool") > -1) ? "tool" : "layers";
      } else {
        imgName = "layers";
      }
    } else if (itemType === "web map" || itemType === "cityengine web scene") {
      imgName = "maps";
    } else if (itemType === "web scene") {
      imgName = typeKeywords.indexOf("ViewingMode-Local") > -1 ? "webscenelocal": "websceneglobal";
    } else if (itemType === "web mapping application" || itemType === "mobile application" ||
      itemType === "application" || itemType === "operation view" || itemType === "desktop application") {
      imgName = "apps";
    } else if (itemType === "map document" || itemType === "map package" || itemType === "published map" ||
      itemType === "scene document" || itemType === "globe document" || itemType === "basemap package" ||
      itemType === "mobile basemap package" || itemType === "mobile map package" || itemType === "project package" ||
      itemType === "project template" || itemType === "pro map" || itemType === "layout" ||
      (itemType === "layer" && typeKeywords.indexOf("ArcGIS Pro") > -1) ||
      (itemType === "explorer map" && typeKeywords.indexOf("Explorer Document") > -1)) {
      imgName = "mapsgray";
    } else if (itemType === "service definition" || itemType === "csv" || itemType === "shapefile" ||
      itemType === "cad drawing" || itemType === "geojson" || itemType === "360 vr experience" ||
      itemType === "netcdf") {
      imgName = "datafiles";
    } else if (itemType === "explorer add in" || itemType === "desktop add in" ||
      itemType === "windows viewer add in" || itemType === "windows viewer configuration") {
      imgName = "appsgray";
    } else if (itemType === "arcgis pro add in" || itemType === "arcgis pro configuration") {
      imgName = "addindesktop";
    } else if (itemType === "rule package" || itemType === "file geodatabase" || itemType === "csv collection" ||
      itemType === "kml collection" || itemType === "windows mobile package" || itemType === "map template" ||
      itemType === "desktop application template" || itemType === "arcpad package" || itemType === "code sample" ||
      itemType === "form" || itemType === "document link" || itemType === "vector tile package" ||
      itemType === "operations dashboard add in" || itemType === "rules package" || itemType === "image" ||
      itemType === "workflow manager package" ||
      (itemType === "explorer map" && typeKeywords.indexOf("Explorer Mapping Application") > -1 ||
       typeKeywords.indexOf("Document") > -1)) {
      imgName = "datafilesgray";
    } else if (itemType === "network analysis service" || itemType === "geoprocessing service" ||
      itemType === "geodata service" || itemType === "geometry service" || itemType === "geoprocessing package" ||
      itemType === "locator package" || itemType === "geoprocessing sample" ||
      itemType === "workflow manager service" || itemType === "raster function template") {
      imgName = "toolsgray";
    } else if (itemType === "layer" || itemType === "layer package" || itemType === "explorer layer") {
      imgName = "layersgray";
    } else if (itemType === "scene package") {
      imgName = "scenepackage";
    } else if (itemType === "tile package") {
      imgName = "tilepackage";
    } else if (itemType === "task file") {
      imgName = "taskfile";
    } else if (itemType === "report template") {
      imgName = "report-template";
    } else if (itemType === "statistical data collection") {
      imgName = "statisticaldatacollection";
    } else if (itemType === "insights workbook") {
      imgName = "workbook";
    } else if (itemType === "insights model") {
      imgName = "insightsmodel";
    } else if (itemType === "insights page") {
      imgName = "insightspage";
    } else if (itemType === "hub initiative") {
      imgName = "hubinitiative";
    } else if (itemType === "hub page") {
      imgName = "hubpage";
    } else if (itemType === "hub site application") {
      imgName = "hubsite";
    } else if (itemType === "relational database connection") {
      imgName = "relationaldatabaseconnection";
    } else if (itemType === "big data file share") {
      imgName = "datastorecollection";
    } else if (itemType === "image collection") {
      imgName = "imagecollection";
    } else if (itemType === "desktop style") {
      imgName = "desktopstyle";
    } else if (itemType === "style") {
      imgName = "style";
    } else if (itemType === "dashboard") {
      imgName = "dashboard";
    } else {
      imgName = "maps";
    }

    return `${imgDir}/${imgName}${size}.svg`;
};
