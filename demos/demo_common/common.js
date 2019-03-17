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
  '@esri/arcgis-rest-auth',
  '@esri/arcgis-rest-items',
  '@esri/arcgis-rest-groups',
  '@esri/solution-creator',
  './icon'
], function (
  arcgisRestAuth,
  arcgisRestItems,
  arcgisRestGroups,
  arcgis_clone_js,
  icon
) {
  return {

    /**
     * Creates an arcgis-rest-arcgis-rest-auth IAuthenticatedRequestOptions object with an active UserSession.
     * @param {string} usernameElementId HTML element with username
     * @param {string} passwordElementId HTML element with password
     * @param {string?} requestOptions Base url for the portal you want to make the request to; defaults
     *        to 'https://www.arcgis.com/sharing/rest'
     * @return {object} IAuthenticatedRequestOptions object
     * @see @esri/arcgis-rest-auth
     * @see @esri/arcgis-rest-request
     */
    getRequestOptions: function (username, password, portal) {
      var userSessionOptions = {
        username: username || undefined,
        password: password || undefined,
        portal: portal || undefined
      };

      var requestOptions = {
        authentication: new arcgisRestAuth.UserSession(userSessionOptions)
      };
      if (portal) {
        requestOptions.portal = portal.replace('http:', 'https:');
      }
      return requestOptions;
    },

    /**
     * Creates a display of the hierarchy involving in a set of AGOL arcgis-rest-items.
     * @param {object} solutionItems Hash containing arcgis-rest-items in solution
     * @param {object} hierachy Hash contining, at each level, an item id and array of dependencies
     * @param {boolean} createLinks Indicates if a link to AGOL should be created for each item
     * @param {string} orgUrl URL to organization's home, e.g.,
     *        "https://arcgis4localgov2.maps.arcgis.com/home/"
     * @return {string} Generated display
     * @note Only handles simple hierarchies at this time--no circular or shared dependencies
     */
    createHierarchyDisplay: function (solutionItems, hierarchy, createLinks, orgUrl) {
      // Show solution contents as they'd be in the solution's AGOL item
      var display = '<ul class="solutionList">';
      hierarchy.forEach(hierarchyItem => {
        var fullItem = arcgis_clone_js.findTemplateInList(solutionItems, hierarchyItem.id);
        var item = fullItem.item;
        var itemLabel = (item.title || item.name || fullItem.type);
        var itemIcon = icon.getItemIcon('../demo_common/images/', fullItem.type, fullItem.item.typeKeywords);

        var webpage = fullItem.type === 'Group' ? 'group' : 'item';
        display += '<li><img class="item-type-icon margin-right-quarter" src="' + itemIcon +
          '" width="16" height="16" alt="">&nbsp;&nbsp;';
        if (createLinks) {
          display += '<a href="' + orgUrl + webpage + '.html?id=' + hierarchyItem.id + '" target="_blank">' +
            itemLabel + '</a>';
        } else {
          display += itemLabel;
        }

        if (Array.isArray(hierarchyItem.dependencies) && hierarchyItem.dependencies.length > 0) {
          display += this.createHierarchyDisplay(solutionItems, hierarchyItem.dependencies, createLinks, orgUrl);
        }

        display += '</li>';
      });
      display += '</ul>';
      return display;
    },

    /**
     * Creates a list with links to an AGOL item and its JSON item and data parts.
     * @param {string} agolId AGOL item id
     * @param {string} orgUrl URL to organization's home, e.g.,
     *        "https://arcgis4localgov2.maps.arcgis.com/home/"
     * @param {string} portalUrl URL to portal, e.g., "https://www.arcgis.com/"
     * @return {string} Generated display
     */
    createItemLinksDisplay: function (agolId, orgUrl, portalUrl) {
      var display = '<ul>';
      display += '<li><a href="' + orgUrl + 'item.html?id=' + agolId +
        '" target="_blank">Item</a></li>';
      display += '<li><a href="' + portalUrl + 'sharing/content/items/' + agolId +
        '?f=json" target="_blank">Item JSON</a></li>';
      display += '<li><a href="' + portalUrl + 'sharing/content/items/' + agolId +
        '/data?f=json" target="_blank">Data JSON</a></li>';
      display += '</ul>';

      return display;
    },

    createIdsList: function (solutionItemIds) {
      var display = '<ol>';
      solutionItemIds.forEach(function (id) {
        display += '<li>' + id + '</li>';
      });
      display += '</ol>';
      return display;
    },

    /**
     * Creates a display of solution item, its JSON, and the hierarchy of arcgis-rest-items that it contains.
     * @param {string} publishedSolutionId
     * @see @esri/arcgis-rest-items
     */
    showPublishedSolutionHierarchy: function (publishedSolutionId) {
      document.getElementById('display').style.display = 'block';
      document.getElementById('fetchingDetails').style.display = 'block';
      document.getElementById('detailsResults').style.display = 'none';

      arcgisRestItems.getItemData(publishedSolutionId)
      .then(
        publishedSolution => {
          // Solution details
          document.getElementById('detailsDisplay').innerHTML =
            // List of links to Solution item, its item JSON, its data JSON
            this.createItemLinksDisplay(publishedSolutionId,
              'https://localdeployment.maps.arcgis.com/home/', 'https://www.arcgis.com/') +

            // Hierarchical display of item
            '<br>Published Solution item hierarchy:' +
            this.createHierarchyDisplay(publishedSolution.templates,
              arcgis_clone_js.getItemHierarchy(publishedSolution.templates)) +

            // Topological sort displays
            '<br>Linear build order (' + publishedSolution.templates.length + '):' +
            this.createIdsList(arcgis_clone_js.topologicallySortItems(publishedSolution.templates)) +

            '<br>Dependencies graph:<div id="topologicalSortGraphic"></div>';
            this.showTopologicalSortGraph(publishedSolution.templates, '#topologicalSortGraphic');
        }
      )
      .finally(() => {
        document.getElementById('fetchingDetails').style.display = 'none';
        document.getElementById('detailsResults').style.display = 'block';
      });
    },

    showTopologicalSortGraph: function (templates, canvas) {
      var self = this, typeLookupTable = {};
      templates.forEach(function (template) {
        typeLookupTable[template.itemId] = template.type;
      });

      // Topologically sort solution items into graphic display
      requirejs(['../lib/raphael_2.2.1.min'], function (Raphael) {
        window.Raphael = Raphael;
        requirejs(['../lib/dracula_1.2.1.min'], function (Dracula) {
          var g = new Dracula.Graph();

          templates.forEach(function (template) {
            g.addNode(self.shortName(template.type, template.itemId));  // to insure that dependencyless items appear

            var dependencies = template.dependencies || [];
            dependencies.forEach(function (dependencyId) {
              g.addEdge(
                self.shortName(typeLookupTable[dependencyId], dependencyId),
                self.shortName(template.type, template.itemId),
                { directed : true }
              );
            });
          });
          (new Dracula.Layout.Spring(g)).layout();
          (new Dracula.Renderer.Raphael(canvas, g, 800, Math.max(400, templates.length * 24))).draw();
        });
      });
    },

    shortName: function (itemType, itemId) {
      var shortTypes = {
        "ArcGIS Pro Add In": "pad",
        "Code Attachment": "att",
        "Desktop Add In": "dad",
        "Document Link": "lnk",
        "Feature Collection": "col",
        "Feature Service": "svc",
        "Geoprocessing Package": "gpk",
        "Geoprocessing Sample": "gsm",
        "Project Template": "ptm",
        "Web Map": "map",
        "Web Mapping Application": "wma"
      };
      var shortItemType = shortTypes[itemType] || itemType.toLowerCase().replace(/[\s\daeiou]/g, "").substr(0, 3);
      return shortItemType + ' ' + itemId.substr(0, 4);
    },

    /**
     * Creates a list of published solution arcgis-rest-items.
     * @see @esri/arcgis-rest-items
     */
    showAvailableSolutions: function () {
      arcgisRestItems.searchItems('type:Solution owner:LocalGovDeployMikeT typekeywords:Template')
      .then(
        function (foundItems) {
          if (foundItems.total === 0) {
            document.getElementById('solutionsDisplay').innerHTML = 'No Solution items found';
          } else {
            var itemsDisplay = '';
            foundItems.results.forEach(function (item) {
              itemsDisplay += '<input type="radio" onclick="onRadioClicked(this)" name="solutions" value="' +
                item.id + '|' + item.title + '">' + item.title + '</input><br>';
            });
            document.getElementById('solutionsDisplay').innerHTML = itemsDisplay;
          }
        },
        function (error) {
          document.getElementById('solutionsDisplay').innerHTML = error.toString();
        }
      )
      .finally(() => {
        document.getElementById('fetchingSolutions').style.display = 'none';
        document.getElementById('solutionsResults').style.display = 'block';
      });
    },

    /**
     * Displays the folder and its contents created from a solution into a user's organization; also
     * lists any arcgis-rest-groups created as part of the solution.
     * @param {object} portalResponse Response from calling arcgis-rest-js' request.getPortal
     * @param {object} createResponse Response from calling arcgis-clone-js' createItemHierachyFromJSON
     *       to create solution arcgis-rest-items
     * @see @esri/arcgis-rest-request
     */
    showCreatedItems: function (portalResponse, createResponse) {
       var display = 'Folder "' + createResponse.folderName + '" contains:<br>';
       var searchOptions = {
         searchForm: {
           q: 'owner:' + portalResponse.user.username +
             ' orgid:' + portalResponse.id +
             ' ownerfolder:' + createResponse.folderId
         },
         authentication: requestOptions.authentication
       }
       arcgisRestItems.searchItems(searchOptions)
       .then(
         foundItems => {
           if (foundItems.total === 0) {
             document.getElementById('solutionsDisplay').innerHTML = 'Solution not found';
           } else {
             // List the solution's items
             display += '<ul>';
             foundItems.results.forEach(function (item) {
               display += '<li><a href="' + orgUrl + 'item.html?id=' + item.id +
               '" target="_blank">' + item.title + ' (' + item.type + ')</a></li>';
             });
             display += '</ul>';

             // List the solution's groups
             if (Array.isArray(createResponse.groups) && createResponse.groups.length > 0) {
               var groupDfds = [];
               display += '<br>The following groups were created:<ul>';
               createResponse.groups.forEach(
                 groupId => {
                   var groupDfd = arcgisRestGroups.getGroup(groupId, requestOptions);
                   groupDfds.push(groupDfd);
                   groupDfd
                   .then(
                     group => {
                       display += '<li><a href="' + orgUrl + 'group.html?id=' + group.id +
                         '" target="_blank">' + group.title + '</a></li>';
                     }
                   );
                 }
               );
               Promise.all(groupDfds)
               .then(
                 () => {
                   display += '</ul>';
                   document.getElementById('createDisplay').innerHTML = display;
                 }
               );
             } else {
               document.getElementById('createDisplay').innerHTML = display;
             }
           }
         },
         error => {
           document.getElementById('createDisplay').innerHTML = error.toString();
         }
       )
       .finally(
         () => {
           document.getElementById('creating').style.display = 'none';
           document.getElementById('createResults').style.display = 'block';
         }
       );
    }
  }
});

