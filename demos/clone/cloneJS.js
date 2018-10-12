/* Copyright (c) 2018 Esri
 * Apache-2.0 */
define([
  '../../dist/src/index',
  '@esri/arcgis-rest-items',
  '@esri/arcgis-rest-request'
], function (
  clone,
  items,
  request
) {
  return {
    swizzleList: {},

    createItemHierachyFromJSON: function (orgUrl, portalUrl, solutionName, solutionItems, userSession) {
      return new Promise((resolve, reject) => {

        var buildList = clone.Solution.topologicallySortItems(solutionItems);
        console.log('Build order list: ' + buildList);//???

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
        this.createFolder(folderName, solutionItems, userSession)
        .then(
          createdFolderId => {
            folderId = createdFolderId;
            request.request(options.url, options)
            .then(
              orgResp => {
                organization = (orgResp.allSSL ? 'https://' : 'http://') + orgResp.urlKey + '.' + orgResp.customBaseUrl;
                console.log('orgUrl: ' + orgUrl);//???
                console.log('organization: ' + organization);//???

                resolve({folderName: folderName});//???
                //hydrateTopOfList();  //???
              }
            );
          }
        );

        // Hydrate the top item in the to-do list
        function hydrateTopOfList () {
          if (buildList.length === 0) {
            resolve({
              folderName: folderName
            });
            return;
          }
          var dfd;
          var sourceId = buildList.shift();
          var itemType = solutionItems[sourceId].type;
          var item = solutionItems[sourceId].itemSection;
          switch (itemType) {
            case 'Feature Service':
              dfd = this.createFeatureService(sourceId, folderId, solutionItems, userSession);
              break;
            case 'Feature Layer':
              console.error('solo feature layer not implemented');
              break;
            case 'Table':
              console.error('solo table not implemented');
              break;
            case 'Web Map':
              dfd = this.createWebmap(sourceId, folderId, solutionItems, userSession);
              break;
            case 'Web Mapping Application':
              dfd = this.createWebApp(sourceId, folderId, solutionItems, userSession);
              break;
            case 'Group':
              dfd = this.createGroup(sourceId, solutionItems, userSession);
              break;
            case 'Dashboard':
              dfd = this.createDashboard(sourceId, folderId, solutionItems, userSession);
              break;
            default:
              console.warn('Item ' + sourceId + ' ("' + (item.title || item.name) + '" ' + item.type + ') not hydrated');
              hydrateTopOfList();
              break;
          }
          if (dfd) {
            dfd.then(hydrateTopOfList, function (error) {
              console.warn(error);
            });
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

    createGroup: function (sourceId, solutionItems, userSession) {
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
            this.swizzleList[sourceId] = {
              'id': createResp.group.id
            };
            console.log('swizzle ' + sourceId + ' to ' + JSON.stringify(this.swizzleList[sourceId]) + ' (group)');//???

            if (component.dependencies.length > 0) {
              // Add each of the group's items to it
              var awaitGroupAdds = [];
              component.dependencies.forEach(function (depId) {
                awaitGroupAdds.push(new Promise(resolve => {
                  var swizzledDepId = this.swizzleList[depId].id;
                  sharing.shareItemWithGroup({
                    id: this.swizzleList[depId].id,
                    groupId: createResp.group.id,
                    authentication: userSession
                  })
                  .then(resolve(),
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

    createFeatureService: function (sourceId, folderId, solutionItems, userSession) {
      var component = solutionItems[sourceId];
      return new Promise((resolve, reject) => {

        var item = solutionItems[sourceId].itemSection;
        item.name += '_' + cloningUniquenessTimestamp();

        var relationships = {};

        // Remove the layers and tables because they aren't added when the service is added, but their presence
        // prevents them from being added later via addToDefinition
        var layers = solutionItems[sourceId].layers || [];
        item.layers = [];
        var tables = solutionItems[sourceId].tables || [];
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
              this.swizzleList[sourceId] = {
                'serviceItemId': createResp.serviceItemId,
                'serviceurl': createResp.serviceurl
              };
              console.log('swizzle ' + sourceId + ' to ' + JSON.stringify(this.swizzleList[sourceId]) + ' (feat svc)');//???

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
                        this.swizzleList[sourceId + '_' + originalId] = {
                          'name': response.layers[0].name,
                          'itemId': createResp.serviceItemId,
                          'url': createResp.serviceurl + '/' + response.layers[0].id
                        };
                        console.log('swizzle ' + sourceId + '_' + originalId + ' to ' + JSON.stringify(this.swizzleList[sourceId + '_' + originalId]) + ' (feat layer)');//???
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
                            restoredRelationships += '<li>Layer ' + id + ' -> ' + JSON.stringify(relationships[id]) + '</li>';
                            resolve();
                          },
                          addRelationshipsResponse => {
                            console.log('failed to update relationships for ' + id + ': ' + JSON.stringify(addRelationshipsResponse));
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

    createWebmap: function (sourceId, folderId, solutionItems, userSession) {
      var component = solutionItems[sourceId];
      return new Promise((resolve, reject) => {

        //  Set up clone item for creation
        var options = {
          authentication: userSession,
          item: solutionItems[sourceId].itemSection
        };
        options.item.text = solutionItems[sourceId].dataSection;

        // Swizzle its map layers
        if (Array.isArray(options.item.text.operationalLayers)) {
          options.item.text.operationalLayers.forEach(function(layer) {
            var itsSwizzle = this.swizzleList[layer.itemId];
            if (itsSwizzle) {
              layer.title = itsSwizzle.name;
              layer.itemId = itsSwizzle.itemId;
              layer.url = itsSwizzle.url;
            }
          });
        }
        if (Array.isArray(options.item.text.tables)) {
          options.item.text.tables.forEach(function (layer) {
            var itsSwizzle = this.swizzleList[layer.itemId];
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
            this.swizzleList[sourceId] = {
              'id': createResp.id
            };
            console.log('swizzle ' + sourceId + ' to ' + JSON.stringify(this.swizzleList[sourceId]) + ' (webmap)');//???
            resolve();
          },
          error => {
            reject('Unable to create webmap');
          }
        );

      });
    },

    createWebApp: function (sourceId, folderId, solutionItems, userSession) {
      var component = solutionItems[sourceId];
      return new Promise((resolve, reject) => {

        //  Set up clone item for creation
        var options = {
          authentication: userSession,
          item: solutionItems[sourceId].itemSection
        };
        options.item.text = solutionItems[sourceId].dataSection;

        // Swizzle its webmap
        if (options.item.text.values && options.item.text.values.webmap) {
          options.item.text.values.webmap = this.swizzleList[solutionItems[sourceId].dependencies[0]].id;
        }

        if (folderId) {
          options.folder = folderId;
        }

        var appUrl = solutionItems[sourceId].itemSection.url;

        // Create the item
        items.createItemInFolder(options)
        .then(
          createResp => {
            this.swizzleList[sourceId] = {
              'id': createResp.id
            };
            console.log('swizzle ' + sourceId + ' to ' + JSON.stringify(this.swizzleList[sourceId]) + ' (web app)');//???

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

    createDashboard: function (sourceId, folderId, solutionItems, userSession) {
      var component = solutionItems[sourceId];
      return new Promise((resolve, reject) => {
        //  Set up clone item for creation
        var options = {
          authentication: userSession,
          item: solutionItems[sourceId].itemSection
        };
        options.item.text = solutionItems[sourceId].dataSection;
        if (folderId) {
          options.folder = folderId;
        }

        // Swizzle its webmap(s)
        var widgets = options.item.text.widgets;
        if (widgets) {
          widgets.forEach(function (widget) {
            if (widget.type === 'mapWidget') {
              widget.itemId = this.swizzleList[widget.itemId].id;
            }
          });
        }

        // Create the item
        items.createItemInFolder(options)
        .then(
          createResp => {
            this.swizzleList[sourceId] = {
              'id': createResp.id
            };
            console.log('swizzle ' + sourceId + ' to ' + JSON.stringify(this.swizzleList[sourceId]) + ' (dashboard)');//???
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
