### Mocks

#### AGOL items (items.ts)

##### Exported

###### Item

* getAGOLItem(type?, url?)
* getTrimmedAGOLItem()
* getNoNameFeatureServiceItem()

###### Item Data

* getAGOLItemData(type?)

###### Item Resource

* getAGOLItemResources(testCase?)

###### Group

* getAGOLGroup()
* getAGOLGroupContentsList(numToPutIntoGroup)

##### Internal

* getAGOLItemFundamentals(type, typePrefix, url?)

### Feature Services

* getService(layers=[], tables=[])
* getLayerOrTable(id, name, type, relationships=[])
* removeNameField(layerOrTable)
* getRelationship(id, relatedTableId, role)

### Solutions

* getItemSolutionPart(type, url?, dependencies=[])
* getDashboardSolutionNoWidgets()
* getGroupSolution(dependencies=[])
* getWebMappingApplicationSolution()

##### Internal

* getItemSolutionFundamentals(type, typePrefix url="", dependencies=[])
