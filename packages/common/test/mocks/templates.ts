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

// This file contains examples of templates of AGOL items.

// import * as mFeatureService from "../../../feature-layer/src/feature-layer";
// import * as fsUtils from "../../../feature-layer/src/featureServiceHelpers";
import * as interfaces from "../../src/interfaces";
import * as mockItems from "./agolItems";
import * as utils from "./utils";

// -- Exports -------------------------------------------------------------------------------------------------------//

export function getFailedDeployment(failedItemIds: string[] = []): any {
  return {
    success: false,
    itemIds: failedItemIds,
    error: "One or more items cannot be deployed"
  };
}

export function getFailedItem(
  itemType: string
): interfaces.ICreateItemFromTemplateResponse {
  return {
    id: "",
    type: itemType,
    postProcess: false
  };
}

export function getSolutionTemplateItem(
  templates = [] as interfaces.IItemTemplate[]
): interfaces.ISolutionItem {
  return {
    item: {
      commentsEnabled: false,
      id: "sln1234567890",
      itemType: "text",
      name: null,
      title: "title",
      type: "Solution",
      typeKeywords: ["Solution", "Template"],
      url: utils.PORTAL_SUBSET.portalUrl + "/home/item.html?id=sln1234567890"
    },
    data: {
      metadata: {
        version: "x",
        resourceStorageItemId: "sln1234567890"
      },
      templates
    }
  };
}

export function getItemTemplateSkeleton(): interfaces.IItemTemplate {
  return {
    itemId: "",
    type: "",
    key: "",
    item: {
      id: "",
      type: ""
    },
    data: {},
    resources: [],
    properties: {},
    dependencies: [],
    relatedItems: [],
    groups: [],
    estimatedDeploymentCostFactor: 0
  };
}

export function getItemTemplate(
  type: string,
  dependencies = [] as string[],
  url = ""
): interfaces.IItemTemplate {
  let templatePart: interfaces.IItemTemplate = null;

  // Supported item types
  switch (type) {
    case "ArcGIS Pro Add In":
      break;

    case "Code Attachment":
      break;

    case "Code Sample":
      break;

    case "Dashboard":
      templatePart = getItemTemplateFundamentals(
        type,
        mockItems.getItemTypeAbbrev(type),
        dependencies,
        url
      );
      templatePart.data = getItemTemplateData(type);
      templatePart.resources = [];
      break;

    case "Desktop Add In":
      break;

    case "Desktop Application Template":
      break;

    case "Document Link":
      break;

    case "Feature Collection":
      break;

    case "Feature Service":
      templatePart = getItemTemplateFundamentals(
        type,
        mockItems.getItemTypeAbbrev(type),
        dependencies,
        url || "{{svc1234567890.itemId}}"
      );
      templatePart.item.url = url || "{{svc1234567890.url}}";
      templatePart.data = getItemTemplateData(type);
      templatePart.resources = [];
      templatePart.estimatedDeploymentCostFactor = 10;

      const layer0: any = getLayerOrTableTemplate(
        // removeEditFieldsInfoField(
        0,
        "ROW Permits",
        "Feature Layer",
        [createItemTemplateRelationship(0, 1, "esriRelRoleOrigin")]
      );
      // );

      const table1: any = getLayerOrTableTemplate(
        // removeEditFieldsInfoField(
        1,
        "ROW Permit Comment",
        "Table",
        [createItemTemplateRelationship(0, 1, "esriRelRoleDestination")]
      );
      // );

      const properties: any = {
        service: getServiceTemplate([layer0], [table1]),
        layers: [layer0],
        tables: [table1]
      };

      templatePart.properties = properties;
      break;

    case "Form":
      templatePart = getItemTemplateFundamentals(
        type,
        mockItems.getItemTypeAbbrev(type),
        dependencies,
        url
      );
      break;

    case "Geoprocessing Package":
      break;

    case "Geoprocessing Sample":
      break;

    case "Layer Package":
      break;

    case "Map Template": // // ??? temporary definition
      templatePart = getItemTemplateFundamentals(
        type,
        mockItems.getItemTypeAbbrev(type),
        dependencies,
        url
      );
      templatePart.resources = [];
      break;

    case "Notebook":
      templatePart = getItemTemplateFundamentals(
        type,
        mockItems.getItemTypeAbbrev(type),
        dependencies,
        url
      );
      templatePart.data = getItemTemplateData(type);
      templatePart.resources = [];
      break;

    case "Operation View":
      break;

    case "Pro Map":
      break;

    case "Project Package":
      break;

    case "Project Template":
      break;

    case "StoryMap":
      templatePart = getItemTemplateFundamentals(
        type,
        mockItems.getItemTypeAbbrev(type),
        dependencies,
        url || "https://storymaps.arcgis.com/stories/{{sto1234567890.itemId}}"
      );
      templatePart.data = getItemTemplateData(type);
      templatePart.resources = [];
      break;

    case "Web Map":
      templatePart = getItemTemplateFundamentals(
        type,
        mockItems.getItemTypeAbbrev(type),
        dependencies,
        url ||
          "{{portalBaseUrl}}/home/webmap/viewer.html?webmap={{map1234567890.itemId}}"
      );
      templatePart.data = getItemTemplateData(type);
      templatePart.resources = [];
      break;

    case "Web Mapping Application":
      templatePart = getItemTemplateFundamentals(
        type,
        mockItems.getItemTypeAbbrev(type),
        dependencies,
        url ||
          "{{portalBaseUrl}}/apps/CrowdsourcePolling/index.html?appid={{wma1234567890.itemId}}"
      );
      templatePart.data = getItemTemplateData(type);
      templatePart.resources = [];
      break;

    case "Workforce Project":
      templatePart = getItemTemplateFundamentals(
        type,
        mockItems.getItemTypeAbbrev(type),
        dependencies,
        url
      );
      templatePart.data = getItemTemplateData(type);
      templatePart.resources = [];
      break;

    case "Undefined":
      templatePart = getItemTemplateFundamentals(
        type,
        "und",
        dependencies,
        url
      );
      templatePart.data = getItemTemplateData(type);
      templatePart.resources = [];
      break;

    case "Unsupported":
      templatePart = getItemTemplateFundamentals(
        type,
        "unk",
        dependencies,
        url
      );
      templatePart.data = getItemTemplateData(type);
      templatePart.resources = [];
      break;

    default:
      fail("Unsupported template item type");
      break;
  }

  return templatePart;
}

export function getDashboardTemplatePartNoWidgets(): any {
  const templatePart: any = getItemTemplate("Dashboard");
  templatePart.data.widgets = [];
  return templatePart;
}

export function getTemplatePartNoData(type: string): any {
  const templatePart: any = getItemTemplate(type);
  templatePart.data = null;
  return templatePart;
}

export function getTemplatePartNoExtent(type: string): any {
  const templatePart: any = getItemTemplate(type);
  templatePart.item.extent = null;
  return templatePart;
}

export function getFeatureServiceTemplatePartNoRelationships(): any {
  const templatePart: any = getItemTemplate("Feature Service");
  templatePart.properties.layers[0].relationships = [];
  templatePart.properties.tables[0].relationships = [];
  return templatePart;
}

/* export function getFourItemFeatureServiceTemplatePart(): any {
  const templatePart: any = getItemTemplate("Feature Service");

  // Update data section
  templatePart.data.layers.push({
    id: 2,
    popupInfo: {
      title: "layer 2"
    },
    layerDefinition: {
      defaultVisibility: true
    }
  });
  templatePart.data.layers.push({
    id: 3,
    popupInfo: {
      title: "layer 3"
    },
    layerDefinition: {
      defaultVisibility: true
    }
  });

  // Update service properties
  const layer2: any = getLayerOrTableTemplate(
    // removeEditFieldsInfoField(
    2,
    "ROW Permits layer 2",
    "Feature Layer"
  );
  // );
  const layer3: any = getLayerOrTableTemplate(
    // removeEditFieldsInfoField(
    3,
    "ROW Permits layer 3",
    "Feature Layer"
  );
  // );
  addCondensedFormOfLayer(
    [layer2, layer3],
    templatePart.properties.service.layers
  );

  // Update layers section
  templatePart.properties.layers.push(layer2);
  templatePart.properties.layers.push(layer3);

  return templatePart;
} */

export function getGroupTemplatePart(dependencies = [] as string[]): any {
  return {
    itemId: "grp1234567890",
    type: "Group",
    key: "i1a2b3c4",
    item: {
      id: "{{grp1234567890.itemId}}",
      title: "An AGOL group",
      isInvitationOnly: true,
      description: "Description of an AGOL group",
      snippet: "Snippet of an AGOL group",
      tags: ["JavaScript"],
      phone: null,
      sortField: "title",
      sortOrder: "asc",
      isViewOnly: true,
      thumbnail:
        utils.PORTAL_SUBSET.restUrl +
        "/community/groups/grp1234567890/info/ROWPermitManager.png",
      access: "public",
      capabilities: [],
      isFav: false,
      isReadOnly: false,
      protected: false,
      autoJoin: false,
      notificationsEnabled: false,
      provider: null,
      providerGroupName: null,
      userMembership: {
        username: "casey",
        memberType: "none"
      },
      collaborationInfo: {},
      type: "Group"
    },
    groups: [],
    dependencies: dependencies,
    estimatedDeploymentCostFactor: 2
  };
}

export function getWebMappingApplicationTemplate(): interfaces.IItemTemplate[] {
  const template: interfaces.IItemTemplate[] = [
    getItemTemplate(
      "Web Mapping Application",
      ["map1234567890"],
      "{{portalBaseUrl}}/apps/CrowdsourcePolling/index.html?appid={{wma1234567890.itemId}}"
    ),
    getItemTemplate(
      "Web Map",
      ["svc1234567890"],
      "{{portalBaseUrl}}/home/webmap/viewer.html?webmap={{map1234567890.itemId}}"
    ),
    getItemTemplate("Feature Service")
  ];

  return template;
}

export function getWebMappingApplicationTemplateGroup(): interfaces.IItemTemplate[] {
  const template: interfaces.IItemTemplate[] = [
    getItemTemplate(
      "Web Mapping Application",
      ["map1234567890"],
      "{{portalBaseUrl}}/apps/CrowdsourcePolling/index.html?appid={{wma1234567890.itemId}}"
    ),
    getItemTemplate(
      "Web Map",
      ["svc1234567890"],
      "{{portalBaseUrl}}/home/webmap/viewer.html?webmap={{map1234567890.itemId}}"
    ),
    getItemTemplate("Feature Service", [])
  ];

  // Switch from webmap to group
  template[0].data.values.group = template[0].data.values.webmap;
  delete template[0].data.values.webmap;

  //  Give the WMA a resource
  template[0].resources = [
    utils.PORTAL_SUBSET.restUrl +
      "/content/items/wma1234567890/resources/anImage.png"
  ];

  return template;
}

export function getWebMappingApplicationTemplateNoWebmapOrGroup(): interfaces.IItemTemplate[] {
  const template: interfaces.IItemTemplate[] = [
    getItemTemplate(
      "Web Mapping Application",
      undefined,
      "{{portalBaseUrl}}/apps/CrowdsourcePolling/index.html?appid={{wma1234567890.itemId}}"
    )
  ];

  // Change the dependencies from null to an empty array
  template[0].dependencies = [];

  // Remove folderId & values.webmap
  delete template[0].data.folderId;
  delete template[0].data.values.webmap;

  return template;
}

// -- Internals ------------------------------------------------------------------------------------------------------//

function addCondensedFormOfLayer(
  layersOrTables: any[],
  serviceLayerList: any[]
) {
  layersOrTables.forEach(layer => {
    serviceLayerList.push({
      id: layer.id,
      name: layer.name,
      parentLayerId: -1,
      defaultVisibility: true,
      subLayerIds: null,
      minScale: 0,
      maxScale: 0,
      geometryType: "esriGeometryPoint"
    });
  });
}

function createItemTemplateRelationship(
  id: number,
  relatedTableId: number,
  role: string
): any {
  const relationship: any = {
    id: id,
    name: "",
    relatedTableId: relatedTableId,
    cardinality: "esriRelCardinalityOneToMany",
    role: role,
    "": "globalid",
    composite: true
  };
  relationship.keyField =
    role === "esriRelRoleOrigin"
      ? "{{svc1234567890.layer" + id + ".fields.globalid.name}}"
      : "{{svc1234567890.layer" + relatedTableId + ".fields.globalid.name}}";
  return relationship;
}

export function getItemTemplateData(type?: string): any {
  let data: any = {
    error: {
      code: 400,
      messageCode: "CONT_0001",
      message: "Item does not exist or is inaccessible.",
      details: []
    }
  };

  // Supported item types
  switch (type) {
    case "ArcGIS Pro Add In":
      break;

    case "Code Attachment":
      break;

    case "Code Sample":
      break;

    case "Dashboard":
      data = {
        version: 24,
        layout: {
          rootElement: {
            type: "stackLayoutElement",
            orientation: "col",
            elements: []
          }
        },
        headerPanel: {
          type: "headerPanel"
        },
        leftPanel: {
          type: "leftPanel",
          title: "<p>left panel description</p>\n",
          selectors: []
        },
        widgets: [
          {
            showNavigation: true,
            events: [],
            flashRepeats: 3,
            itemId: "{{map1234567890.itemId}}",
            mapTools: [
              {
                type: "bookmarksTool"
              }
            ],
            type: "mapWidget",
            showPopup: true,
            layers: [
              {
                type: "featureLayerDataSource",
                layerId: "ROWPermitApplication_4605",
                name: "ROW Permits"
              }
            ],
            id: "1200f3f1-8f72-4ea6-af16-14f19e9a4517",
            name: "ROW Permit Map"
          },
          {
            type: "indicatorWidget",
            id: "3e796f16-722b-437f-89a4-e3787e105b24",
            name: "ROW Permit Count"
          },
          {
            type: "listWidget",
            id: "0f994268-e553-4d11-b8d1-afecf0818841",
            name: "ROW Permit List"
          },
          {
            type: "serialChartWidget",
            id: "ff698ea5-2812-4ba5-a0ba-d89fc302f8f4",
            name: "Permit Type"
          },
          {
            type: "serialChartWidget",
            id: "d2e11f43-8d61-422c-b7fe-00dc8a9c2b14",
            name: "Submission Date"
          }
        ],
        settings: {
          maxPaginationRecords: 50000
        },
        theme: "light"
      };
      break;

    case "Desktop Add In":
      break;

    case "Desktop Application Template":
      break;

    case "Document Link":
      break;

    case "Feature Collection":
      break;

    case "Feature Service":
      data = {
        tables: [
          {
            id: 1,
            popupInfo: {
              title: "table 1"
            }
          }
        ],
        layers: [
          {
            id: 0,
            popupInfo: {
              title: "layer 0"
            },
            layerDefinition: {
              defaultVisibility: true
            }
          }
        ]
      };
      break;

    case "Form":
      break;

    case "Geoprocessing Package":
      break;

    case "Geoprocessing Sample":
      break;

    case "Layer Package":
      break;

    case "Map Template":
      break;

    case "Operation View":
      break;

    case "Notebook":
      data = {
        metadata: {
          kernelspec: {
            name: "python3",
            display_name: "Python 3",
            language: "python"
          },
          esriNotebookRuntime: {
            notebookRuntimeName: "ArcGIS Notebook Python 3 Advanced",
            notebookRuntimeVersion: "3.0"
          },
          language_info: {
            name: "python",
            version: "3.6.9",
            mimetype: "text/x-python",
            codemirror_mode: {
              name: "ipython",
              version: 3
            },
            pygments_lexer: "ipython3",
            nbconvert_exporter: "python",
            file_extension: ".py"
          }
        },
        cells: [
          {
            metadata: {
              trusted: true
            },
            cell_type: "code",
            source: "{{3b927de78a784a5aa3981469d85cf45d.itemId}}",
            execution_count: null,
            outputs: []
          }
        ],
        nbformat: 4,
        nbformat_minor: 2
      };
      break;

    case "Pro Map":
      break;

    case "Project Package":
      break;

    case "Project Template":
      break;

    case "StoryMap":
      data = {
        root: "n-guGGJg",
        nodes: {},
        resources: {}
      };
      break;

    case "Web Map":
      data = {
        operationalLayers: [
          {
            id: "ROWPermitApplication_4605",
            layerType: "ArcGISFeatureLayer",
            url: "{{svc1234567890.layer0.url}}",
            title: "ROW Permits",
            itemId: "{{svc1234567890.itemId}}",
            popupInfo: {},
            capabilities: "Query"
          }
        ],
        baseMap: {
          baseMapLayers: [
            {
              id: "World_Hillshade_3689",
              layerType: "ArcGISTiledMapServiceLayer",
              url:
                "http://services.arcgisonline.com/arcgis/rest/services/Elevation/World_Hillshade/MapServer",
              title: "World Hillshade"
            },
            {
              id: "VectorTile_6451",
              type: "VectorTileLayer",
              layerType: "VectorTileLayer",
              title: "World Topographic Map",
              styleUrl:
                utils.PORTAL_SUBSET.restUrl +
                "/content/items/" +
                "7dc6cea0b1764a1f9af2e679f642f0f5/resources/styles/root.json",
              itemId: "7dc6cea0b1764a1f9af2e679f642f0f5"
            }
          ],
          title: "Topographic"
        },
        spatialReference: {
          wkid: 102100,
          latestWkid: 3857
        },
        tables: [
          {
            url: "{{svc1234567890.layer1.url}}",
            id: "ROWPermitApplication_4404",
            title: "ROW Permit Comment",
            layerDefinition: {},
            itemId: "{{svc1234567890.itemId}}",
            popupInfo: {}
          }
        ]
      };
      break;

    case "Web Mapping Application":
      data = {
        source: "tpl1234567890",
        folderId: "{{folderId}}",
        values: {
          webmap: "{{map1234567890.itemId}}",
          title: "A web mapping application",
          titleIcon: "images/banner.png",
          displayText: "<b>Welcome</p>",
          featureLayer: {
            id: "ROWPermitApplication_4605",
            fields: [
              {
                id: "sortField",
                fields: ["submitdt"]
              }
            ]
          },
          showAllFeatures: "true",
          customUrlLayer: {
            id: "ROWPermitApplication_4605",
            fields: [
              {
                id: "urlField",
                fields: ["OBJECTID"]
              }
            ]
          },
          customUrlParam: "id"
        }
      };
      break;

    case "Workforce Project":
      data = {
        workerWebMapId: "{{abc116555b16437f8435e079033128d0.itemId}}",
        dispatcherWebMapId: "{{abc26a244163430590151395821fb845.itemId}}",
        dispatchers: {
          serviceItemId: "{{abc302ec12b74d2f9f2b3cc549420086.layer0.itemId}}",
          url: "{{abc302ec12b74d2f9f2b3cc549420086.layer0.url}}"
        },
        assignments: {
          serviceItemId: "{{abc4494043c3459faabcfd0e1ab557fc.layer0.itemId}}",
          url: "{{abc4494043c3459faabcfd0e1ab557fc.layer0.url}}"
        },
        workers: {
          serviceItemId: "{{abc5dd4bdd18437f8d5ff1aa2d25fd7c.layer0.itemId}}",
          url: "{{abc5dd4bdd18437f8d5ff1aa2d25fd7c.layer0.url}}"
        },
        tracks: {
          serviceItemId: "{{abc64329e69144c59f69f3f3e0d45269.layer0.itemId}}",
          url: "{{abc64329e69144c59f69f3f3e0d45269.layer0.url}}",
          enabled: true,
          updateInterval: 300
        },
        version: "1.2.0",
        groupId: "{{abc715c2df2b466da05577776e82d044.itemId}}",
        folderId: "{{folderId}}",
        assignmentIntegrations: [
          {
            id: "default-navigator",
            prompt: "Navigate to Assignment",
            urlTemplate:
              "arcgis-navigator://?stop=${assignment.latitude},{itemID={{cad3483e025c47338d43df308c117308.itemId}}},${assignment.longitude}&stopname=${assignment.location}&callback=arcgis-workforce://&callbackprompt={itemID={{bad3483e025c47338d43df308c117308.itemId}}}://Workforce",
            assignmentTypes: [
              {
                urlTemplate:
                  "arcgis-navigator://?stop=${assignment.latitude},{itemID={{cad3483e025c47338d43df308c117308.itemId}}},${assignment.longitude}&stopname=${assignment.location}&callback=arcgis-workforce://&callbackprompt={itemID={{bad3483e025c47338d43df308c117308.itemId}}}://Workforce"
              }
            ]
          }
        ]
      };
      break;

    case "Unknown":
      data = {};
      break;
  }

  return data;
}

function getServiceTemplate(layers = [] as any, tables = [] as any): any {
  const service: any = {
    currentVersion: 10.61,
    serviceItemId: "{{svc1234567890.itemId}}",
    isView: true,
    isUpdatableView: true,
    sourceSchemaChangesAllowed: true,
    serviceDescription: "",
    hasVersionedData: false,
    supportsDisconnectedEditing: false,
    hasStaticData: false,
    maxRecordCount: 1000,
    supportedQueryFormats: "JSON",
    supportsVCSProjection: false,
    capabilities: "Create,Query,Editing",
    description: "",
    copyrightText: "",
    spatialReference: {
      wkid: 102100,
      latestWkid: 3857
    },
    initialExtent: {
      xmin: -14999999.999989873,
      ymin: 2699999.9999980442,
      xmax: -6199999.9999958146,
      ymax: 6499999.99999407,
      spatialReference: {
        wkid: 102100,
        latestWkid: 3857
      }
    },
    fullExtent: {
      xmin: -14999999.999989873,
      ymin: 2699999.9999980442,
      xmax: -6199999.9999958146,
      ymax: 6499999.99999407,
      spatialReference: {
        wkid: 102100,
        latestWkid: 3857
      }
    },
    allowGeometryUpdates: true,
    units: "esriMeters",
    supportsAppend: true,
    syncEnabled: false,
    supportsApplyEditsWithGlobalIds: true,
    editorTrackingInfo: {
      enableEditorTracking: true,
      enableOwnershipAccessControl: false,
      allowOthersToQuery: true,
      allowOthersToUpdate: true,
      allowOthersToDelete: true,
      allowAnonymousToQuery: true,
      allowAnonymousToUpdate: true,
      allowAnonymousToDelete: true
    },
    xssPreventionInfo: {
      xssPreventionEnabled: true,
      xssPreventionRule: "InputOnly",
      xssInputRule: "rejectInvalid"
    },
    layers: [],
    tables: []
  };

  addCondensedFormOfLayer(layers, service.layers);
  addCondensedFormOfLayer(tables, service.tables);

  return service;
}

function getLayerOrTableTemplate(
  id: number,
  name: string,
  type: string,
  relationships = [] as any
): any {
  return {
    currentVersion: 10.61,
    id: id,
    name: name,
    type: type,
    serviceItemId: "{{svc1234567890.itemId}}",
    isView: true,
    isUpdatableView: true,
    sourceSchemaChangesAllowed: true,
    displayField: "appname",
    description: "PermitApplication",
    copyrightText: "",
    defaultVisibility: true,
    editFieldsInfo: {
      creationDateField: "CreationDate",
      creatorField: "Creator",
      editDateField: "EditDate",
      editorField: "Editor"
    },
    editingInfo: {
      lastEditDate: 1538579807130
    },
    fields: [
      {
        name: "appname",
        type: "esriFieldTypeString",
        alias: "appname",
        sqlType: "sqlTypeOther",
        length: 0,
        nullable: true,
        editable: true,
        visible: true,
        domain: null,
        defaultValue: null
      },
      {
        name: "BoardReview",
        type: "esriFieldTypeString",
        alias: "Board Review",
        sqlType: "sqlTypeOther",
        length: 0,
        nullable: true,
        editable: true,
        visible: true,
        domain: null,
        defaultValue: null
      },
      {
        name: "globalid",
        type: "esriFieldTypeGlobalID",
        alias: "globalid",
        sqlType: "sqlTypeOther",
        length: 0,
        nullable: false,
        editable: true,
        visible: true,
        domain: null,
        defaultValue: null
      },
      {
        name: "CreationDate",
        type: "esriFieldTypeDate",
        alias: "CreationDate",
        sqlType: "sqlTypeOther",
        length: 0,
        nullable: true,
        editable: true,
        visible: true,
        domain: null,
        defaultValue: null
      },
      {
        name: "Creator",
        type: "esriFieldTypeString",
        alias: "Creator",
        sqlType: "sqlTypeOther",
        length: 0,
        nullable: true,
        editable: true,
        visible: true,
        domain: null,
        defaultValue: null
      },
      {
        name: "EditDate",
        type: "esriFieldTypeDate",
        alias: "EditDate",
        sqlType: "sqlTypeOther",
        length: 0,
        nullable: true,
        editable: true,
        visible: true,
        domain: null,
        defaultValue: null
      },
      {
        name: "Editor",
        type: "esriFieldTypeString",
        alias: "Editor",
        sqlType: "sqlTypeOther",
        length: 0,
        nullable: true,
        editable: true,
        visible: true,
        domain: null,
        defaultValue: null
      },
      {
        name: "OBJECTID",
        type: "esriFieldTypeOID",
        alias: "OBJECTID",
        sqlType: "sqlTypeOther",
        length: 8,
        nullable: false,
        editable: false,
        visible: true,
        domain: null,
        defaultValue: null
      }
    ],
    relationships: relationships,
    geometryType: "esriGeometryPoint",
    minScale: 0,
    maxScale: 0,
    extent: {
      xmin: -14999999.999989873,
      ymin: -13315943.826968452,
      xmax: 1604565.8194646926,
      ymax: 6499999.99999407,
      spatialReference: {
        wkid: 102100,
        latestWkid: 3857
      }
    },
    allowGeometryUpdates: true,
    hasAttachments: true,
    viewSourceHasAttachments: false,
    attachmentProperties: [
      {
        name: "name",
        isEnabled: true
      },
      {
        name: "size",
        isEnabled: true
      },
      {
        name: "contentType",
        isEnabled: true
      },
      {
        name: "keywords",
        isEnabled: true
      }
    ],
    objectIdField: "OBJECTID",
    uniqueIdField: {
      name: "OBJECTID",
      isSystemMaintained: true
    },
    globalIdField: "globalid",
    capabilities: "Create,Query,Editing",
    viewDefinitionQuery:
      "status = '{{svc1234567890.layer" + id + ".fields.boardreview.name}}'",
    definitionQuery: "status = 'BoardReview'"
  };
}

function getItemTemplateFundamentals(
  type: string,
  typePrefix: string,
  dependencies = [] as string[],
  url = "",
  groups = [] as string[]
): interfaces.IItemTemplate {
  return {
    itemId: typePrefix + "1234567890",
    type: type,
    key: "i1a2b3c4",
    item: {
      id: "{{" + typePrefix + "1234567890.itemId}}",
      name: "Name of an AGOL item",
      title: "An AGOL item",
      type: type,
      typeKeywords: ["JavaScript"],
      description: "Description of an AGOL item",
      tags: ["test"],
      snippet: "Snippet of an AGOL item",
      thumbnail:
        utils.PORTAL_SUBSET.restUrl +
        "/content/items/" +
        typePrefix +
        "1234567890/info/thumbnail/ago_downloaded.png",
      extent: "{{solutionItemExtent}}",
      categories: [],
      contentStatus: null,
      spatialReference: undefined,
      accessInformation: "Esri, Inc.",
      licenseInfo: null,
      properties: null,
      culture: "en-us",
      url: url
    },
    data: undefined,
    resources: [],
    dependencies: dependencies,
    relatedItems: [],
    groups: groups,
    properties: {},
    estimatedDeploymentCostFactor: 2
  };
}

export function removeEditFieldsInfoField(layerOrTable: any): any {
  layerOrTable.editFieldsInfo = null;
  return layerOrTable;
}
