/* Copyright (c) 2018 Esri
 * Apache-2.0 */
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "@esri/arcgis-rest-items", "@esri/arcgis-rest-sharing"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var items = require("@esri/arcgis-rest-items");
    var sharing = require("@esri/arcgis-rest-sharing");
    var SortVisitColor;
    (function (SortVisitColor) {
        SortVisitColor[SortVisitColor["White"] = 0] = "White";
        SortVisitColor[SortVisitColor["Gray"] = 1] = "Gray";
        SortVisitColor[SortVisitColor["Black"] = 2] = "Black"; // finished
    })(SortVisitColor || (SortVisitColor = {}));
    var SolutionItem = /** @class */ (function () {
        function SolutionItem() {
        }
        /**
         * Creates a Solution item containing JSON descriptions of items forming the solution.
         *
         * @param title Title for Solution item to create
         * @param collection Hash of JSON descriptions of items to publish into Solution
         * @param access Access to set for item: 'public', 'org', 'private'
         * @param requestOptions Options for the request
         * @returns A promise that will resolve with an object reporting success and the Solution id
         */
        SolutionItem.publishItemJSON = function (title, collection, access, requestOptions) {
            return new Promise(function (resolve) {
                // Define the solution item
                var itemSection = {
                    title: title,
                    type: 'Solution',
                    itemType: 'text',
                    access: access,
                    listed: false,
                    commentsEnabled: false
                };
                var dataSection = {
                    items: collection
                };
                // Create it and add its data section
                var options = tslib_1.__assign({ title: title, item: itemSection }, requestOptions);
                items.createItem(options)
                    .then(function (results) {
                    if (results.success) {
                        var options_1 = tslib_1.__assign({ id: results.id, data: dataSection }, requestOptions);
                        items.addItemJsonData(options_1)
                            .then(function (results) {
                            // Set the access manually since the access value in createItem appears to be ignored
                            var options = tslib_1.__assign({ id: results.id, access: access }, requestOptions);
                            sharing.setItemAccess(options)
                                .then(function (results) {
                                resolve({
                                    success: true,
                                    id: results.itemId
                                });
                            });
                        });
                    }
                });
            });
        };
        /**
         * Topologically sort solution items into a build list.
         *
         * @param items Hash of JSON descriptions of items
         * @return List of ids of items in the order in which they need to be built so that dependencies
         * are built before items that require those dependencies
         */
        SolutionItem.topologicallySortItems = function (items) {
            // Cormen, Thomas H.; Leiserson, Charles E.; Rivest, Ronald L.; Stein, Clifford (2009)
            // Sections 22.3 (Depth-first search) & 22.4 (Topological sort), pp. 603-615
            // Introduction to Algorithms (3rd ed.), The MIT Press, ISBN 978-0-262-03384-8
            //
            // DFS(G)
            // 1 for each vertex u ∈ G,V
            // 2     u.color = WHITE
            // 3     u.π = NIL
            // 4 time = 0
            // 5 for each vertex u ∈ G,V
            // 6     if u.color == WHITE
            // 7         DFS-VISIT(G,u)
            //
            // DFS-VISIT(G,u)
            // 1 time = time + 1    // white vertex u has just been discovered
            // 2 u.d = time
            // 3 u.color = GRAY
            // 4 for each v ∈ G.Adj[u]     // explore edge (u,v)
            // 5     if v.color == WHITE
            // 6         v.π = u
            // 7         DFS-VISIT(G,v)
            // 8 u.color = BLACK         // blacken u; it is finished
            // 9 time = time + 1
            // 10 u.f = time
            //
            // TOPOLOGICAL-SORT(G)
            // 1 call DFS(G) to compute finishing times v.f for each vertex v
            // 2 as each vertex is finished, insert it onto front of a linked list
            // 3 return the linked list of vertices
            var buildList = []; // list of ordered vertices--don't need linked list because we just want relative ordering
            var verticesToVisit = {};
            Object.keys(items).forEach(function (vertexId) {
                verticesToVisit[vertexId] = SortVisitColor.White; // not yet visited
            });
            // Algorithm visits each vertex once. Don't need to record times or "from' nodes ("π" in pseudocode)
            Object.keys(verticesToVisit).forEach(function (vertexId) {
                if (verticesToVisit[vertexId] === SortVisitColor.White) { // if not yet visited
                    visit(vertexId);
                }
            });
            // Visit vertex
            function visit(vertexId) {
                verticesToVisit[vertexId] = SortVisitColor.Gray; // visited, in progress
                // Visit dependents if not already visited
                var dependencies = items[vertexId].dependencies || [];
                dependencies.forEach(function (dependencyId) {
                    dependencyId = dependencyId.substr(0, 32);
                    if (verticesToVisit[dependencyId] === SortVisitColor.White) { // if not yet visited
                        visit(dependencyId);
                    }
                });
                verticesToVisit[vertexId] = SortVisitColor.Black; // finished
                buildList.push(vertexId); // add to end of list of ordered vertices because we want dependents first
            }
            return buildList;
        };
        /**
         * Extract item hierarchy from solution items list.
         *
         * @param items Hash of JSON descriptions of items
         * @return JSON structure reflecting dependency hierarchy of items; shared dependencies are repeated;
         * each element of structure contains 1) AGOL type of item, 2) AGOL id of item (groups have a type of 'Group'),
         * 3) list of dependencies, and, for Feature Services only, 4) the feature layer id in the feature service
         */
        SolutionItem.getItemHierarchy = function (items) {
            var hierarchy = [];
            // Find the top-level nodes. Start with all nodes, then remove those that other nodes depend on
            var topLevelNodes = Object.keys(items);
            Object.keys(items).forEach(function (id) {
                (items[id].dependencies || []).forEach(function (dependencyId) {
                    var iNode = topLevelNodes.indexOf(dependencyId.substr(0, 32));
                    if (iNode >= 0) {
                        // Node is somebody's dependency, so remove the node from the list of top-level nodes
                        topLevelNodes.splice(iNode, 1);
                    }
                });
            });
            // Hierarchically list the children of specified nodes
            function itemChildren(children, hierarchy) {
                children.forEach(function (id) {
                    var baseId = id.substr(0, 32);
                    var child = {
                        id: baseId,
                        type: items[baseId].type,
                        dependencies: []
                    };
                    // Add  the feature layer id in the service
                    if (child.type === 'Feature Service') {
                        child.idPart = id.substr(33);
                    }
                    // Fill in the dependencies array with any children
                    var dependencyIds = items[baseId].dependencies;
                    if (Array.isArray(dependencyIds) && dependencyIds.length > 0) {
                        itemChildren(dependencyIds, child.dependencies);
                    }
                    hierarchy.push(child);
                });
            }
            itemChildren(topLevelNodes, hierarchy);
            return hierarchy;
        };
        /**
         * Extracts the 32-character AGOL id from the front of a string.
         *
         * @param extendedId A string of 32 or more characters that begins with an AGOL id
         * @returns A 32-character string
         */
        SolutionItem.baseId = function (extendedId) {
            // AGOL ids are 32 characters long; additional chars after that hold modifiers
            return extendedId.substr(0, 32);
        };
        return SolutionItem;
    }());
    exports.SolutionItem = SolutionItem;
});
//# sourceMappingURL=agolSupport.js.map