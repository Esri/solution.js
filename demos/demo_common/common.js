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
  '../../dist/tsumd/src/index',
  '../../dist/tsumd/demos/demo_common/icon',
  '@esri/arcgis-rest-auth',
  '@esri/arcgis-rest-groups',
  '@esri/arcgis-rest-items',
], function (
  clone,
  icon,
  auth,
  groups,
  items
) {
  return {

    /**
     * Creates an arcgis-rest-auth IAuthenticatedRequestOptions object with an active UserSession.
     * @param {string} usernameElementId HTML element with username
     * @param {string} passwordElementId HTML element with password
     * @return {object} IAuthenticatedRequestOptions object
     * @see @esri/arcgis-rest-auth
     * @see @esri/arcgis-rest-request
     */
    getRequestOptions: function (usernameElementId, passwordElementId) {
      return {
        authentication: new auth.UserSession({
          username: document.getElementById(usernameElementId).value,
          password: document.getElementById(passwordElementId).value
        })
      };
    },

    /**
     * Creates a display of the hierarchy involving in a set of AGOL items.
     * @param {object} solutionItems Hash containing items in solution
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
        var fullItem = clone.getTemplateInSolution(solutionItems, hierarchyItem.id);
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

    /**
     * Creates a display of solution item, its JSON, and the hierarchy of items that it contains.
     * @param {string} publishedSolutionId
     * @see @esri/arcgis-rest-items
     */
    showPublishedSolutionHierarchy: function (publishedSolutionId) {
      document.getElementById('display').style.display = 'block';
      document.getElementById('fetchingDetails').style.display = 'block';
      document.getElementById('detailsResults').style.display = 'none';

      items.getItemData(publishedSolutionId)
      .then(
        publishedSolution => {
          document.getElementById('detailsDisplay').innerHTML =
            this.createItemLinksDisplay(publishedSolutionId,
              'http://arcgis4localgov2.maps.arcgis.com/home/', 'https://www.arcgis.com/') +
            '<br>Published Solution item hierarchy:' +
            this.createHierarchyDisplay(publishedSolution.templates,
              clone.getItemHierarchy(publishedSolution.templates));
        }
      )
      .finally(() => {
        document.getElementById('fetchingDetails').style.display = 'none';
        document.getElementById('detailsResults').style.display = 'block';
      });
    },

    /**
     * Creates a list of published solution items.
     * @see @esri/arcgis-rest-items
     */
    showAvailableSolutions: function () {
      items.searchItems('type:Solution owner:ArcGISTeamLocalGovOrg')
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
     * lists any groups created as part of the solution.
     * @param {object} portalResponse Response from calling arcgis-rest-js' request.getPortal
     * @param {object} createResponse Response from calling arcgis-clone-js' createItemHierachyFromJSON
     *       to create solution items
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
       items.searchItems(searchOptions)
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
                   var groupDfd = groups.getGroup(groupId, requestOptions);
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
