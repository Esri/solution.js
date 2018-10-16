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

define([
  '../../dist/src/index',
  '@esri/arcgis-rest-feature-service-admin',
  '@esri/arcgis-rest-groups',
  '@esri/arcgis-rest-items',
  '@esri/arcgis-rest-request',
  '@esri/arcgis-rest-sharing'
], function (
  clone,
  featureServiceAdmin,
  groups,
  items,
  request,
  sharing
) {
  return {
    cloneJS: null,
    swizzleList: {},
    groups: [],

    createItemHierachyFromJSON: function (orgUrl, portalUrl, solutionName, solutionItems,
      progressCallback, userSession) {
      cloneJS = this;
      return new Promise((resolve, reject) => {

        var buildList = clone.Solution.topologicallySortItems(solutionItems);

        // Get the estimated cost of the rehydration
        var currentProgress = 0, estimatedCost = 0;
        Object.keys(solutionItems).forEach(key => {
          estimatedCost += solutionItems[key].estimatedCost;
        });
        estimatedCost += 2; // item costs plus creating folder & getting org info

        var progressStep = 100 / estimatedCost;
        progressCallback(0);

        var folderId;
        var portalClone = portalUrl + 'sharing/rest';
        cloningUniquenessTimestamp = function () {
          return (new Date()).getTime();
        }

        // Create a folder to hold the hydrated items to avoid name clashes
        var options = {
          authentication: userSession,
          url: portalClone + '/portals/self'
        };
        var folderName = solutionName + ' (' + cloningUniquenessTimestamp() + ')';
        cloneJS.createFolder(folderName, solutionItems, userSession)
        .then(
          createdFolderId => {
            progressIncrement();
            folderId = createdFolderId;
            request.request(options.url, options)
            .then(
              orgResp => {
                progressIncrement();
                organization = (orgResp.allSSL ? 'https://' : 'http://') + orgResp.urlKey + '.' + orgResp.customBaseUrl;
                console.log('orgUrl: ' + orgUrl);//???
                console.log('organization: ' + organization);//???

                hydrateTopOfList();
              }
            );
          }
        );

        function progressIncrement (costMultiplier) {
          var increase = costMultiplier ? costMultiplier * progressStep : progressStep;
          progressCallback(currentProgress += increase);
        }

        // Hydrate the top item in the to-do list
        function hydrateTopOfList () {
          if (buildList.length === 0) {
            progressCallback(100);
            resolve({
              folderName: folderName,
              folderId: folderId,
              groups: cloneJS.groups
            });
            return;
          }
          var dfd;
          var sourceId = buildList.shift();
          var itemType = solutionItems[sourceId].type;
          var item = solutionItems[sourceId].itemSection;
          switch (itemType) {
            case 'Feature Service':
              dfd = cloneJS.createFeatureService(sourceId, folderId, solutionItems, userSession, progressIncrement);
              break;
            case 'Feature Layer':
              console.error('solo feature layer not implemented');
              break;
            case 'Table':
              console.error('solo table not implemented');
              break;
            case 'Web Map':
              dfd = cloneJS.createWebmap(sourceId, folderId, solutionItems, userSession, progressIncrement);
              break;
            case 'Web Mapping Application':
              dfd = cloneJS.createWebApp(sourceId, folderId, solutionItems, userSession, progressIncrement);
              break;
            case 'Group':
              dfd = cloneJS.createGroup(sourceId, solutionItems, userSession, progressIncrement);
              break;
            case 'Dashboard':
              dfd = cloneJS.createDashboard(sourceId, folderId, solutionItems, userSession, progressIncrement);
              break;
            default:
              console.warn('Item ' + sourceId + ' ("' + (item.title || item.name) + '" ' +
                item.type + ') not hydrated');
              hydrateTopOfList();
              break;
          }
          if (dfd) {
            dfd.then(
              result => {
                hydrateTopOfList();
              },
              error => {
                console.warn(error);
              }
            );
          }
        }
      });
    },

    //----------------------------------------------------------------------------------------------------------------//

    createFolder: function (folderName, solutionItems, userSession) {
      return new Promise((resolve, reject) => {
        var options = {
          title: folderName,
          authentication: userSession
        };

        items.createFolder(options)
        .then(
          createResp => {
            resolve(createResp.folder.id);
          },
          error => {
            reject('Unable to create folder');
          }
        );
      });
    },

    moveItemToFolder: function (itemId, folderId, solutionItems, userSession) {
      return new Promise((resolve, reject) => {

        var options = {
          itemId: itemId,
          folderId: folderId,
          authentication: userSession
        };

        items.moveItem(options)
        .then(
          moveResp => {
            resolve(moveResp);
          },
          error => {
            reject('Unable to move item to folder');
          }
        );

      });
    },

    createGroup: function (sourceId, solutionItems, userSession, progressIncrement) {
      var component = solutionItems[sourceId];
      return new Promise((resolve, reject) => {

        var options = {
          group: component.itemSection,
          authentication: userSession
        };
        options.group.title += '_' + cloningUniquenessTimestamp();

        groups.createGroup(options)
        .then(
          createResp => {
            progressIncrement();
            cloneJS.swizzleList[sourceId] = {
              'id': createResp.group.id
            };
            console.log('swizzle ' + sourceId + ' to ' + JSON.stringify(cloneJS.swizzleList[sourceId]) + //???
              ' (group)');//???
            cloneJS.groups.push(createResp.group.id);

            if (component.dependencies.length > 0) {
              // Add each of the group's items to it
              var awaitGroupAdds = [];
              component.dependencies.forEach(function (depId) {
                awaitGroupAdds.push(new Promise(resolve => {
                  var swizzledDepId = cloneJS.swizzleList[depId].id;
                  sharing.shareItemWithGroup({
                    id: cloneJS.swizzleList[depId].id,
                    groupId: createResp.group.id,
                    authentication: userSession
                  })
                  .then(
                    () => {
                      progressIncrement();
                      resolve();
                    },
                    error => {
                      console.log("Unable to share group's items with it: " + JSON.stringify(error));
                    }
                  );
                }));
              });
              // After all items have been added to the group
              Promise.all(awaitGroupAdds)
              .then(
                () => {
                  resolve(createResp.group.id);
                }
              );
            } else {
              // No items in this group
              resolve(createResp.group.id);
            }
          },
          error => {
            reject('Unable to create group');
          }
        );

      });
    },

    createFeatureService: function (sourceId, folderId, solutionItems, userSession, progressIncrement) {
      var component = solutionItems[sourceId];
      return new Promise((resolve, reject) => {

        var item = component.itemSection;
        item.name += '_' + cloningUniquenessTimestamp();

        var relationships = {};

        // Remove the layers and tables because they aren't added when the service is added, but their presence
        // prevents them from being added later via addToDefinition
        var layers = component.layers || [];
        item.layers = [];
        var tables = component.tables || [];
        item.tables = [];

        var options = {
          item,
          folderId: folderId,
          authentication: userSession
        };
        featureServiceAdmin.createFeatureService(options)
        .then(
          createResp => {
            if (createResp.success) {
              progressIncrement(3);
              cloneJS.swizzleList[sourceId] = {
                'serviceItemId': createResp.serviceItemId,
                'serviceurl': createResp.serviceurl
              };
              console.log('swizzle ' + sourceId + ' to ' + JSON.stringify(cloneJS.swizzleList[sourceId]) +  //???
                ' (feat svc)');//???

              // Sort layers and tables by id so that they're added with the same ids
              var layersAndTables = [];

              layers.forEach(function (layer) {
                layersAndTables[layer.id] = {
                  item: layer,
                  type: 'layer'
                };
              });

              tables.forEach(function (table) {
                layersAndTables[table.id] = {
                  item: table,
                  type: 'table'
                };
              });

              // Launch the adds serially (server doesn't support parallel adds)
              function addToDefinition(listToAdd) {
                return new Promise((resolve) => {
                  if (listToAdd.length > 0) {
                    var toAdd = listToAdd.shift();

                    var item = toAdd.item;
                    var originalId = item.id;
                    //delete item.id;  // Updated by addToDefinition
                    delete item.serviceItemId;  // Updated by addToDefinition

                    // Need to remove relationships and add them back individually after all layers and tables
                    // have been added to the definition
                    if (Array.isArray(item.relationships) && item.relationships.length > 0) {
                      relationships[originalId] = item.relationships;
                      item.relationships = [];
                    }

                    var options = {
                      authentication: userSession
                    };

                    if (toAdd.type === 'layer') {
                      item.adminLayerInfo = {
                        'geometryField': {
                          'name': 'Shape',
                          'srid': 102100
                        }
                      };
                      options.layers = [item];
                    } else {
                      options.tables = [item];
                    }

                    featureServiceAdmin.addToServiceDefinition(createResp.serviceurl, options)
                    .then(
                      response => {
                        progressIncrement(2);
                        cloneJS.swizzleList[sourceId + '_' + originalId] = {
                          'name': response.layers[0].name,
                          'itemId': createResp.serviceItemId,
                          'url': createResp.serviceurl + '/' + response.layers[0].id
                        };
                        console.log('swizzle ' + sourceId + '_' + originalId + ' to ' +   //???
                          JSON.stringify(cloneJS.swizzleList[sourceId + '_' + originalId]) + ' (feat layer)');//???
                        addToDefinition(listToAdd).then(resolve);
                      },
                      response => {
                        addToDefinition(listToAdd).then(resolve);
                      }
                    );
                  } else {
                    resolve();
                  }
                });
              }  //----- end of addToDefinition function -----

              // Add the service's layers and tables to it
              addToDefinition(layersAndTables)
              .then(
                () => {
                  // Restore relationships for all layers and tables in the service
                  var restoredRelationships = '<ul>';
                  var awaitRelationshipUpdates = [];
                  Object.keys(relationships).forEach(
                    id => {

                      awaitRelationshipUpdates.push(new Promise(resolve => {
                        var options = {
                          authentication: userSession,
                          params: {
                            addToDefinition: {
                              relationships: relationships[id]
                            }
                          }
                        };
                        featureServiceAdmin.addToServiceDefinition(createResp.serviceurl + "/" + id, options)
                        .then(
                          addRelationshipsResponse => {
                            progressIncrement(2);
                            restoredRelationships += '<li>Layer ' + id + ' -> ' +
                              JSON.stringify(relationships[id]) + '</li>';
                            resolve();
                          },
                          addRelationshipsResponse => {
                            console.log('failed to update relationships for ' + id + ': ' +
                              JSON.stringify(addRelationshipsResponse));
                            resolve();
                          }
                        );
                      }));
                    }
                  );
                  Promise.all(awaitRelationshipUpdates)
                  .then(
                    () => {
                      restoredRelationships += '</ul>';
                      resolve(createResp.serviceItemId);
                    }
                  );
                }
              );

            } else {
              reject('Unable to create feature service');
            }
          },
          error => {
            reject('Unable to create feature service');
          }
        );

      });
    },

    createWebmap: function (sourceId, folderId, solutionItems, userSession, progressIncrement) {
      var component = solutionItems[sourceId];
      return new Promise((resolve, reject) => {

        //  Set up clone item for creation
        var options = {
          authentication: userSession,
          item: component.itemSection
        };
        options.item.text = component.dataSection;

        // Swizzle its map layers
        if (Array.isArray(options.item.text.operationalLayers)) {
          options.item.text.operationalLayers.forEach(function(layer) {
            var itsSwizzle = cloneJS.swizzleList[layer.itemId];
            if (itsSwizzle) {
              layer.title = itsSwizzle.name;
              layer.itemId = itsSwizzle.itemId;
              layer.url = itsSwizzle.url;
            }
          });
        }
        if (Array.isArray(options.item.text.tables)) {
          options.item.text.tables.forEach(function (layer) {
            var itsSwizzle = cloneJS.swizzleList[layer.itemId];
            if (itsSwizzle) {
              layer.title = itsSwizzle.name;
              layer.itemId = itsSwizzle.itemId;
              layer.url = itsSwizzle.url;
            }
          });
        }

        if (folderId) {
          options.folder = folderId;
        }

        // Create the item
        items.createItemInFolder(options)
        .then(
          createResp => {
            progressIncrement();
            cloneJS.swizzleList[sourceId] = {
              'id': createResp.id
            };
            console.log('swizzle ' + sourceId + ' to ' + JSON.stringify(cloneJS.swizzleList[sourceId]) +   //???
              ' (webmap)');//???
            resolve();
          },
          error => {
            reject('Unable to create webmap');
          }
        );

      });
    },

    createWebApp: function (sourceId, folderId, solutionItems, userSession, progressIncrement) {
      var component = solutionItems[sourceId];
      return new Promise((resolve, reject) => {

        //  Set up clone item for creation
        var options = {
          authentication: userSession,
          item: component.itemSection
        };
        options.item.text = component.dataSection;

        // Swizzle its webmap
        if (options.item.text.values) {
          if (options.item.text.values.webmap) {
            options.item.text.values.webmap = cloneJS.swizzleList[component.dependencies[0]].id;
          }
          if (options.item.text.values.group) {
            options.item.text.values.group = cloneJS.swizzleList[component.dependencies[0]].id;
          }
        }

        if (folderId) {
          options.folder = folderId;
        }

        var appUrl = component.itemSection.url;

        // Create the item
        items.createItemInFolder(options)
        .then(
          createResp => {
            progressIncrement();
            cloneJS.swizzleList[sourceId] = {
              'id': createResp.id
            };
            console.log('swizzle ' + sourceId + ' to ' + JSON.stringify(cloneJS.swizzleList[sourceId]) +   //???
              ' (web app)');//???

            // Update its URL
            var options = {
              authentication: userSession,
              item: {
                'id': createResp.id,
                'url': organization + appUrl + createResp.id
              }
            };
            items.updateItem(options)
            .then(
              updateResp => {
                progressIncrement();
                resolve();
              },
              error => {
                reject('Unable to update webmap');
              }
            );
          },
          error => {
            reject('Unable to create webmap');
          }
        );

      });
    },

    createDashboard: function (sourceId, folderId, solutionItems, userSession, progressIncrement) {
      var component = solutionItems[sourceId];
      return new Promise((resolve, reject) => {
        //  Set up clone item for creation
        var options = {
          authentication: userSession,
          item: component.itemSection
        };
        options.item.text = component.dataSection;
        if (folderId) {
          options.folder = folderId;
        }

        // Swizzle its webmap(s)
        var widgets = options.item.text.widgets;
        if (widgets) {
          widgets.forEach(function (widget) {
            if (widget.type === 'mapWidget') {
              widget.itemId = cloneJS.swizzleList[widget.itemId].id;
            }
          });
        }

        // Create the item
        items.createItemInFolder(options)
        .then(
          createResp => {
            progressIncrement();
            cloneJS.swizzleList[sourceId] = {
              'id': createResp.id
            };
            console.log('swizzle ' + sourceId + ' to ' + JSON.stringify(cloneJS.swizzleList[sourceId]) +   //???
              ' (dashboard)');//???
            resolve();
          },
          error => {
            reject('Unable to create dashboard');
          }
        );

      });
    }

  }
});
