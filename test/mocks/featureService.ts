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

export const FeatureServiceSuccessResponse: any = {
  "currentVersion": 10.61,
  "serviceItemId": "svc1234567890",
  "isView": true,
  "isUpdatableView": true,
  "sourceSchemaChangesAllowed": true,
  "serviceDescription": "",
  "hasVersionedData": false,
  "supportsDisconnectedEditing": false,
  "hasStaticData": false,
  "maxRecordCount": 1000,
  "supportedQueryFormats": "JSON",
  "supportsVCSProjection": false,
  "capabilities": "Create,Query,Editing",
  "description": "",
  "copyrightText": "",
  "spatialReference": {
    "wkid": 102100,
    "latestWkid": 3857
  },
  "initialExtent": {
    "xmin": -14999999.999989873,
    "ymin": 2699999.9999980442,
    "xmax": -6199999.9999958146,
    "ymax": 6499999.99999407,
    "spatialReference": {
      "wkid": 102100,
      "latestWkid": 3857
    }
  },
  "fullExtent": {
    "xmin": -14999999.999989873,
    "ymin": 2699999.9999980442,
    "xmax": -6199999.9999958146,
    "ymax": 6499999.99999407,
    "spatialReference": {
      "wkid": 102100,
      "latestWkid": 3857
    }
  },
  "allowGeometryUpdates": true,
  "units": "esriMeters",
  "supportsAppend": true,
  "syncEnabled": false,
  "supportsApplyEditsWithGlobalIds": true,
  "editorTrackingInfo": {
    "enableEditorTracking": true,
    "enableOwnershipAccessControl": false,
    "allowOthersToQuery": true,
    "allowOthersToUpdate": true,
    "allowOthersToDelete": true,
    "allowAnonymousToQuery": true,
    "allowAnonymousToUpdate": true,
    "allowAnonymousToDelete": true
  },
  "xssPreventionInfo": {
    "xssPreventionEnabled": true,
    "xssPreventionRule": "InputOnly",
    "xssInputRule": "rejectInvalid"
  },
  "layers": [{
    "id": 0,
    "name": "ROW Permits",
    "parentLayerId": -1,
    "defaultVisibility": true,
    "subLayerIds": null,
    "minScale": 0,
    "maxScale": 0,
    "geometryType": "esriGeometryPoint"
  }],
  "tables": [{
    "id": 1,
    "name": "ROW Permit Comment",
    "parentLayerId": -1,
    "defaultVisibility": true,
    "subLayerIds": null,
    "minScale": 0,
    "maxScale": 0
  }]
};

export const FeatureServiceLayer0SuccessResponse: any = {
  "currentVersion": 10.61,
  "id": 0,
  "name": "ROW Permits",
  "type": "Feature Layer",
  "serviceItemId": "svc1234567890",
  "isView": true,
  "isUpdatableView": true,
  "sourceSchemaChangesAllowed": true,
  "displayField": "appname",
  "description": "PermitApplication",
  "copyrightText": "",
  "defaultVisibility": true,
  "editFieldsInfo": {
    "creationDateField": "CreationDate",
    "creatorField": "Creator",
    "editDateField": "EditDate",
    "editorField": "Editor"
  },
  "editingInfo": {
    "lastEditDate": 1538579807130
  },
  "relationships": [{
    "id": 0,
    "name": "",
    "relatedTableId": 1,
    "cardinality": "esriRelCardinalityOneToMany",
    "role": "esriRelRoleOrigin",
    "keyField": "globalid",
    "composite": true
  }],
  "isDataVersioned": false,
  "supportsAppend": true,
  "supportsCalculate": true,
  "supportsTruncate": false,
  "supportsAttachmentsByUploadId": true,
  "supportsAttachmentsResizing": true,
  "supportsRollbackOnFailureParameter": true,
  "supportsStatistics": true,
  "supportsAdvancedQueries": true,
  "supportsValidateSql": true,
  "supportsCoordinatesQuantization": true,
  "supportsQuantizationEditMode": true,
  "supportsApplyEditsWithGlobalIds": true,
  "advancedQueryCapabilities": {
    "supportsPagination": true,
    "supportsPaginationOnAggregatedQueries": true,
    "supportsQueryRelatedPagination": true,
    "supportsQueryWithDistance": true,
    "supportsReturningQueryExtent": true,
    "supportsStatistics": true,
    "supportsOrderBy": true,
    "supportsDistinct": true,
    "supportsQueryWithResultType": true,
    "supportsSqlExpression": true,
    "supportsAdvancedQueryRelated": true,
    "supportsCountDistinct": true,
    "supportsQueryAttachments": true,
    "supportsLod": true,
    "supportsReturningGeometryCentroid": false,
    "supportsQueryWithDatumTransformation": true,
    "supportsHavingClause": true,
    "supportsOutFieldSQLExpression": true,
    "supportsMaxRecordCountFactor": true,
    "supportsTopFeaturesQuery": true
  },
  "useStandardizedQueries": true,
  "geometryType": "esriGeometryPoint",
  "minScale": 0,
  "maxScale": 0,
  "extent": {
    "xmin": -14999999.999989873,
    "ymin": -13315943.826968452,
    "xmax": 1604565.8194646926,
    "ymax": 6499999.99999407,
    "spatialReference": {
      "wkid": 102100,
      "latestWkid": 3857
    }
  },
  "drawingInfo": {
    "renderer": {
      "type": "uniqueValue",
      "field1": "status",
      "uniqueValueInfos": [{
        "symbol": {
          "type": "esriPMS",
          "url": "dcb8875a-42e4-461d-9843-b739a1f56040",
          "imageData": "iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAtxJREFUSIm1lr1LG3EYxz8kd6lJjIl40hgRS5dsgZLFpdBNhESKDnXrIMTBTlksiq2itjjUSQf9CzJJIWI7dGk7NMtRcHMRQQwKF2hIvTRectfhPF/uJYZCn+3gd8/n+T7f5/ndCfznEDo4IxbypKNhUhgkGhqiDuVwgNLoCvI/AzanGU5IZAQfOSlCSvSDKIDgh2YLqioU51EiXew+e8MrQOsYsL9AtqmzOhAj1ReB0APnmXgMtBZSpUauOM/EZYPJyQ98uxfw8TUvwl0U4jGIhtpoB0S/CeoJIh2d8/X7GjNPF9jxBOwvkA13UXj8ELofZRGldHuCBTopkhRkDk/ZLuQ5mNqg5ABsTjPc1FmNx8zKRClN+MlbGid7NBWnl4GhzJ0CNEUmOQj1Y4pAvwOQkMgMxEjZ29JUZH7/XHIAusGhUPRDPIq0O8fsxDpbtwGi4CPXF3HKDwxl6HZpi+DRvngvnFVZgluAQp60FCHlNi2ilO7YC0tFTxCpkGdkaoOSABANm3PuFpYH9p63i1AABvtIwRUAg4TosXKWB24991QhgFIjAVctamiIgocCywOvnruF4DdzXgN0KDdbHtXYPHAbW8323GxB6AHla0A4QKmqmltpD7sHTUVGU+Q7UL1evvNOVQXDMJdNABhdQf68iKK1kOxmu3lgLaFVvXp4czuoDaiqHIy/N2/aa2sNnd1KjZxdRTsPNEXm15dxdPVGQaUGos/lqhhbY6Y4z0RPEOn2PnjtgVtytQFKDXlsjbwDAHDxh+zROT+Sg9A4KTqSWon1ehn1cMeR/KQChsEycOEKmNqg9GmRmcNTtpPIjunwCiv58TlTLze5U5ljvcZW2CnkOagfU4xHkeK95vp7Ja7UzLYYBsv25K4ASwnQvzvH7FmVpZ4gUijg/GRWVQ50nb3n67zjVlvuBVhxdeVuFfKMRMOk6peIPkhYH31rFNtFJ38VlqLSvQdd4i/JvicwsP6X/QAAAABJRU5ErkJggg==",
          "contentType": "image/png",
          "width": 18,
          "height": 18,
          "angle": 0,
          "xoffset": 0,
          "yoffset": 0
        },
        "value": "Submitted",
        "label": "Submitted"
      }, {
        "symbol": {
          "type": "esriPMS",
          "url": "18a7f922-a5d6-4265-9a42-4ebd15ce52ac",
          "imageData": "iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAxVJREFUSIm1lb1OG0EQx/+392H2DLGQTOMGzAM4IqRArk7YgIyBAorkCaAgVZ4AJJQmShOJAp6AIkEJjgkyNjI0ceNA3JvDDRUIHAfw2veRAp8xvuUjiTLd6WbnNzP/nVkJ/9mkR/jIWlQbVFQaAuyAaZoybByLgpBLJVP5vwaEh8O9tMM7AUJmOzyeECEERCQQiADbslFjNUTiYyeyLK1vfUq+AlB/NGB0IjZpwlpSKQ15qAeS5HajKoVlWX5WZbOR+Ni0bddndjZ39h4ERGKjL0RZXOv0dkJRlPuqByEEVKWQFdlfKVd24zNTc8mPG6t3AkYnYpOiLK51+brwfGAQ/X3BewGO5Q/2UdSLKJ+VV7SoVsimszkXIDwc7jVhLXV6O0EIQX9fEDNT0/j+Yx96SXcFffZ0AMHemwT0kg5ftw+nhpkA0OMC0A7vhEppqL0teknHh8/r3MxbAcB1y1SV+iPjI/OZze3lVoAMQmY91MPN9DHBm4l6KS4vrxYA3AC0qDbY4fGEeLcl2Bu8MxjPCCFQFNmvRbWhbDqbkwBAUWmIEMI94GjQ3vP7TJIkeH1PQgByjZTtABH5gFYNHgsgIgFj1QDQaJFpmrJABK6zo8GftEkgAkzTlJsA2Di2LZvr3K4B79oeHt3+ti0bkiQfNwGiIORqrAaqUhegXQO9pOPwSL81hGfn57fO1FgNtmHkmoBUMpUfmYydWJblbxebp4EzhM7/zO5O098wDNTq9UKmsWmb99KGvc6qbLa9ivs00Es63r5/d6sCdsUgCIJ7VaQTW3OR+Ni0rMj+1nm4aw54wQ3DQJWxfDqx9doFAACTsclKufLN1+1D/mDfFRS4FvTs/ByZ3R1X8IvKBQQLiwAuuIBsOpsbnYrNlc/KK0UUuUuOZ07wi5+/Xu5lsonWf67dkNr4uqpFtcKpYSZUlfqpl+KuKTcMA+yKocpYXrCw2B6cC3AqAdATGR+Zv7y8WlAaurQ/mbV6vQDb+pJJbr9pbcuDAMcaK3dZi2pDikpDpmHIEBBwHv3Mvzz6nIpyDzpy7Dej6WVVLLdqyAAAAABJRU5ErkJggg==",
          "contentType": "image/png",
          "width": 18,
          "height": 18,
          "angle": 0,
          "xoffset": 0,
          "yoffset": 0
        },
        "value": "StaffReview",
        "label": "Staff Review"
      }, {
        "symbol": {
          "type": "esriPMS",
          "url": "cee93f85-09c8-42aa-b66e-ebaf7b427468",
          "imageData": "iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAvdJREFUSIm1lj9r20AYxh/nZOsPCM72hUBMKPkChtClH6JZ2qHdDcnQTgcCgTK4uCoJIZrSof0EnbqkW6Z2qRdnyOTNIHDAQQKD0gNbnNWhlmtbsmMKfTdJr97fvc9zr04K/nMoG+QUOedPdV2vFwqF3TiOi5PJ5E7TtHar1er8M6DRaDypVCrPCSFHpmnWCSFQFAWEEEgpIYSAbduBpmlfm83mWwDxxgDHcQ6llO8ppXXTNKGqaiaHUgopJYui6Mi27RdxHL+8uLj48SjAsqxXqqp+oZTCMIx13YMQAkopdF1ng8Hgu+u6x47jfF4JcBznUFXVLzs7O9jf3wdjbC0gDd/3oSgK+v3+J875red57Qyg0Wg8mcoCQggYYzg4OIDv+wjDMFN0b29vYQFBEKBWq6HX610B2M4AKpXKc0ppfVmWMAxxc3OTu/LlDqeSMcuy3pyfn3+cBxSnuyV3pXlRrVZz75fLZQyHwyaAvwDO+VPTNOt5u4UxtrEXaReGYTDO+TPP89oKAOi6XieE5L6QerCs+boolUqoVqt1AH8AhUJhV1HyZ27eg00BiqLg4eFhF5hKFMdxcVUHqQerNM8LQgjiOC7OAJPJ5E5KmZu87EHetg2CYOFaSglVVe9mAE3T2kIIUEozgGUPwjBEEAQLUCHEwjtCCCRJ0p4BWq1W5+TkJJBSsmWp8jxIhzBdfbfbneWPRiMIIW5PT087MwAAJEnyNYqio+Uu1nkQBAGur68XOoiiCISQ7KfCdd1j27Zf6LrO5udh1RzkFR+NRoiiqOO6Ls8AAGA8Hh8OBoOftVoNvu9niqaFhRDodruZ4lPz3wH4lQvwPK/tOM5xv9//lBbbJNLi9/f3ry8vL6/mn2Wmy3Xdz5zz216vd0UpZeVyGatmZCoJoijqAHi3XDwXkHYCYNuyrDfD4bBpGAYrlUqZI1MIcZskybezs7MPmJPlUUAa00/uR875M13X6+PxuLi1tbWbHvrpVlwXm/xVpB21H03Mid9YxGhCaPhLywAAAABJRU5ErkJggg==",
          "contentType": "image/png",
          "width": 18,
          "height": 18,
          "angle": 0,
          "xoffset": 0,
          "yoffset": 0
        },
        "value": "BoardReview",
        "label": "Board Review"
      }, {
        "symbol": {
          "type": "esriPMS",
          "url": "ddaa254b-47a6-4e18-a1a2-d7de3f087308",
          "imageData": "iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAyFJREFUSIm1lr1rE2Ecx7+9l1zikxypvSs2Uh2KIAi3uHRyFuktKa0FEUKwiS+lg4NzheIfENSaWCSiQmu1SwRnHTRLO5R2sThoaAOxaVLimUtyLw7txeTukkbB33Y8v+f7eX5vz3MM/rMxPfiwkYR8kfMTqc9ESKtrrGGau9wJKrsQWVn7Z0B4/srZ4EnfGMVQMdLvk2iGAs3SoBkKumZArdQwnZrY4wi3+vDayxkAjZ4B8cVJWTfMeV4kEun3weNjHT68SKBrhqCUqrHp1ES4XtfHn8+sfjwWcONJ+KqHeJZ4kcAb4LpFD5qhwIsEXr9HKH4vf5h9fT2emHyR6giIL07KHuJZGjgTxHlBwhAZ7gqwbLu8CZr9hsLXYjKSkDfSs5msAxCev3L2KC2gGQpDZBiXTl/GdnkLeSXnED0XvNB2gLySw+DIAHa2tAwA0QEInvSN8SKR7GnJKzl83HnvenJ7hDRDISASIfp4/M6z228ftQLYo25xPWkv4pbxg35UfihzAP4AIgn5Iun3SW7dMkSGe66FFYU3wAmRhDyans1kGQDg/ESiGcp1g1UDe867GetlwJ8KSgAOAX0mQjRLuzq31qBXAM3S+LWvhoCjFGl1je0UgVWDv02TVtfYJsAwzV1dM1yd7TVwa1v7t64ZYAmz2wRwJ6isWqmBF4kDYK9BXskhr+TaoD8bB2171EoNMPRsE7AQWVm7mZ7a0zVDsKfKrQbWEFrr64VPTf96tYFqpbaxGDu8aZuDZhrmqlKqxuxRdKtBXslh+cvTtgiUUhU0QzmvimR0OT6dmgh7/R6hdR46zYGbeL3agFJS15LR5bsOAAA0VFUufi9/HhwZwHZ50yFqCf9sHGC98MkhXs5XAMO4D0BxBaRnM9n4s6l44WsxiRFnd3QyS3w/V556de9dpnXN8R4ko0upSELe2NnSMgGRCPygH51m5DAlVSgldQ2Gcd8u7gqwIgEgRh+P36n8UOa8AU5gvYzjyaxWahvQzXeLt948aE3LsQDLjq7cR5GEPMr5idRQGyzV1xeyHn2rFbtZL38VVkTZYx1d7Dda921C9+yatQAAAABJRU5ErkJggg==",
          "contentType": "image/png",
          "width": 18,
          "height": 18,
          "angle": 0,
          "xoffset": 0,
          "yoffset": 0
        },
        "value": "Approved",
        "label": "Approved"
      }, {
        "symbol": {
          "type": "esriPMS",
          "url": "a82867fe-92da-4d93-804d-a33edabb03ec",
          "imageData": "iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAsJJREFUSIm1lj9LG2Ecxz+X3IOpiVDlTkoKFTGkSiFLFqf2DZgOFtpCF3FIaBUpHbpWQfoCAkoNUjpKhyz6BurSLLcENCHVxdIUjDRCiMbkctfhcja5XGJa6Hc77rnf5/f/OZn/LHmAMyIZIhqQiZgQrBsIE4rDHjILebR/BqxPMjEmmJMhPioTkSUQEsgS6CZUmpAKc+b3kH6RZxloDAzYniZmGKyrgsioDLc83WdUAbqJUtaJp8LM102eLH9j/0bAhzDP/BI7qg9GvH1ix4pGFRDwopxc8eXzAxJPD0j1BGxPE/NL7NwbAuVRDP9MtD+hpfP9XcShxnGNrWSI7MoRmS7A+iQThsG66rM8889EuZt4x/n+HtVcdy1vP5zrcKCa05jywcEFu4DaBRgTzKmCiDMt1ZzGj61VV8+dEbZSpmyGWXpVYKMdIFrd4urpIMZtjQsoNViFNkAyRHRUJuLWLf6Z6MC1sKMY8aIkQ8yuHJGRAQKtPneTXQNnzvvJ54E7Q0SgBTAhKHoA2mswKEBI8EsnCK0U1Q1ErwjsGvxtmuoG4hpgQlE33Q87a+DWts5n3QS/l+I1YNhDptK0ptIpZw2qOY1qTuuANkrFjm8qTTBMa9hkgIU82qf7nOkmijNVbjWwh9B+f5r+sx0uDag0ycYL1qa97nzDJF3WiTuj6FeDak6j8PpxRwRlHWRcVsVigUQqzHzAi9I+D73mwM34pQFlHW2xwJsuAEDNIHZyxdcpn7XA3FTNaTRKRU7TqS7jP+tgSKwBVVfAyhGZj9MkjmtsTR1qrkvOTbbx73Wevz2mw7Ou7bOYJ5UMkT24YFcVKOPC6utehsu6lRZDYs1p3BVgRwKom2GWSg1WR7woPk/3lVlpkm3C3ssC72lLy40AW62Vu5EMMRuQidQMhARB+9K3W7GfBvmrsCPK3HjQRb8B4FQk/kc7k/0AAAAASUVORK5CYII=",
          "contentType": "image/png",
          "width": 18,
          "height": 18,
          "angle": 0,
          "xoffset": 0,
          "yoffset": 0
        },
        "value": "Denied",
        "label": "Denied"
      }],
      "fieldDelimiter": ","
    },
    "transparency": 0,
    "labelingInfo": null
  },
  "allowGeometryUpdates": true,
  "hasAttachments": true,
  "viewSourceHasAttachments": false,
  "attachmentProperties": [{
    "name": "name",
    "isEnabled": true
  }, {
    "name": "size",
    "isEnabled": true
  }, {
    "name": "contentType",
    "isEnabled": true
  }, {
    "name": "keywords",
    "isEnabled": true
  }],
  "htmlPopupType": "esriServerHTMLPopupTypeAsHTMLText",
  "hasM": false,
  "hasZ": false,
  "objectIdField": "OBJECTID",
  "uniqueIdField": {
    "name": "OBJECTID",
    "isSystemMaintained": true
  },
  "globalIdField": "globalid",
  "typeIdField": "status",
  "fields": [{
    "name": "OBJECTID",
    "type": "esriFieldTypeOID",
    "alias": "OBJECTID",
    "sqlType": "sqlTypeOther",
    "nullable": false,
    "editable": false,
    "domain": null,
    "defaultValue": null
  }, {
    "name": "globalid",
    "type": "esriFieldTypeGlobalID",
    "alias": "GlobalID",
    "sqlType": "sqlTypeOther",
    "length": 38,
    "nullable": false,
    "editable": false,
    "domain": null,
    "defaultValue": null
  }, {
    "name": "appname",
    "type": "esriFieldTypeString",
    "alias": "Applicant Name",
    "sqlType": "sqlTypeOther",
    "length": 150,
    "nullable": true,
    "editable": true,
    "domain": null,
    "defaultValue": null
  }, {
    "name": "appaddr",
    "type": "esriFieldTypeString",
    "alias": "Applicant Address",
    "sqlType": "sqlTypeOther",
    "length": 255,
    "nullable": true,
    "editable": true,
    "domain": null,
    "defaultValue": null
  }, {
    "name": "appcity",
    "type": "esriFieldTypeString",
    "alias": "Applicant City",
    "sqlType": "sqlTypeOther",
    "length": 255,
    "nullable": true,
    "editable": true,
    "domain": null,
    "defaultValue": null
  }, {
    "name": "appstate",
    "type": "esriFieldTypeString",
    "alias": "Applicant State",
    "sqlType": "sqlTypeOther",
    "length": 2,
    "nullable": true,
    "editable": true,
    "domain": {
      "type": "codedValue",
      "name": "state",
      "codedValues": [{
        "name": "AL",
        "code": "AL"
      }, {
        "name": "AK",
        "code": "AK"
      }, {
        "name": "AZ",
        "code": "AZ"
      }, {
        "name": "AR",
        "code": "AR"
      }, {
        "name": "CA",
        "code": "CA"
      }, {
        "name": "CO",
        "code": "CO"
      }, {
        "name": "CT",
        "code": "CT"
      }, {
        "name": "DE",
        "code": "DE"
      }, {
        "name": "FL",
        "code": "FL"
      }, {
        "name": "GA",
        "code": "GA"
      }, {
        "name": "HI",
        "code": "HI"
      }, {
        "name": "ID",
        "code": "ID"
      }, {
        "name": "IL",
        "code": "IL"
      }, {
        "name": "IN",
        "code": "IN"
      }, {
        "name": "IA",
        "code": "IA"
      }, {
        "name": "KS",
        "code": "KS"
      }, {
        "name": "KY",
        "code": "KY"
      }, {
        "name": "LA",
        "code": "LA"
      }, {
        "name": "ME",
        "code": "ME"
      }, {
        "name": "MD",
        "code": "MD"
      }, {
        "name": "MA",
        "code": "MA"
      }, {
        "name": "MI",
        "code": "MI"
      }, {
        "name": "MN",
        "code": "MN"
      }, {
        "name": "MS",
        "code": "MS"
      }, {
        "name": "MO",
        "code": "MO"
      }, {
        "name": "MT",
        "code": "MT"
      }, {
        "name": "NE",
        "code": "NE"
      }, {
        "name": "NV",
        "code": "NV"
      }, {
        "name": "NH",
        "code": "NH"
      }, {
        "name": "NJ",
        "code": "NJ"
      }, {
        "name": "NM",
        "code": "NM"
      }, {
        "name": "NY",
        "code": "NY"
      }, {
        "name": "NC",
        "code": "NC"
      }, {
        "name": "ND",
        "code": "ND"
      }, {
        "name": "OH",
        "code": "OH"
      }, {
        "name": "OK",
        "code": "OK"
      }, {
        "name": "OR",
        "code": "OR"
      }, {
        "name": "PA",
        "code": "PA"
      }, {
        "name": "RI",
        "code": "RI"
      }, {
        "name": "SC",
        "code": "SC"
      }, {
        "name": "SD",
        "code": "SD"
      }, {
        "name": "TN",
        "code": "TN"
      }, {
        "name": "TX",
        "code": "TX"
      }, {
        "name": "UT",
        "code": "UT"
      }, {
        "name": "VT",
        "code": "VT"
      }, {
        "name": "VA",
        "code": "VA"
      }, {
        "name": "WA",
        "code": "WA"
      }, {
        "name": "WV",
        "code": "WV"
      }, {
        "name": "WI",
        "code": "WI"
      }, {
        "name": "WY",
        "code": "WY"
      }]
    },
    "defaultValue": null
  }, {
    "name": "appzip",
    "type": "esriFieldTypeString",
    "alias": "Applicant Zip",
    "sqlType": "sqlTypeOther",
    "length": 5,
    "nullable": true,
    "editable": true,
    "domain": null,
    "defaultValue": null
  }, {
    "name": "appphone",
    "type": "esriFieldTypeString",
    "alias": "Applicant Phone",
    "sqlType": "sqlTypeOther",
    "length": 15,
    "nullable": true,
    "editable": true,
    "domain": null,
    "defaultValue": null
  }, {
    "name": "appemail",
    "type": "esriFieldTypeString",
    "alias": "Applicant Email",
    "sqlType": "sqlTypeOther",
    "length": 100,
    "nullable": true,
    "editable": true,
    "domain": null,
    "defaultValue": null
  }, {
    "name": "sameapp",
    "type": "esriFieldTypeString",
    "alias": "Contractor Same as Applicant",
    "sqlType": "sqlTypeOther",
    "length": 5,
    "nullable": true,
    "editable": true,
    "domain": {
      "type": "codedValue",
      "name": "yesno",
      "codedValues": [{
        "name": "Yes",
        "code": "Yes"
      }, {
        "name": "No",
        "code": "No"
      }]
    },
    "defaultValue": null
  }, {
    "name": "contname",
    "type": "esriFieldTypeString",
    "alias": "Contractor Name",
    "sqlType": "sqlTypeOther",
    "length": 150,
    "nullable": true,
    "editable": true,
    "domain": null,
    "defaultValue": null
  }, {
    "name": "contaddr",
    "type": "esriFieldTypeString",
    "alias": "Contractor Address",
    "sqlType": "sqlTypeOther",
    "length": 255,
    "nullable": true,
    "editable": true,
    "domain": null,
    "defaultValue": null
  }, {
    "name": "contcity",
    "type": "esriFieldTypeString",
    "alias": "Contractor City",
    "sqlType": "sqlTypeOther",
    "length": 255,
    "nullable": true,
    "editable": true,
    "domain": null,
    "defaultValue": null
  }, {
    "name": "contstate",
    "type": "esriFieldTypeString",
    "alias": "Contractor State",
    "sqlType": "sqlTypeOther",
    "length": 2,
    "nullable": true,
    "editable": true,
    "domain": {
      "type": "codedValue",
      "name": "state",
      "codedValues": [{
        "name": "AL",
        "code": "AL"
      }, {
        "name": "AK",
        "code": "AK"
      }, {
        "name": "AZ",
        "code": "AZ"
      }, {
        "name": "AR",
        "code": "AR"
      }, {
        "name": "CA",
        "code": "CA"
      }, {
        "name": "CO",
        "code": "CO"
      }, {
        "name": "CT",
        "code": "CT"
      }, {
        "name": "DE",
        "code": "DE"
      }, {
        "name": "FL",
        "code": "FL"
      }, {
        "name": "GA",
        "code": "GA"
      }, {
        "name": "HI",
        "code": "HI"
      }, {
        "name": "ID",
        "code": "ID"
      }, {
        "name": "IL",
        "code": "IL"
      }, {
        "name": "IN",
        "code": "IN"
      }, {
        "name": "IA",
        "code": "IA"
      }, {
        "name": "KS",
        "code": "KS"
      }, {
        "name": "KY",
        "code": "KY"
      }, {
        "name": "LA",
        "code": "LA"
      }, {
        "name": "ME",
        "code": "ME"
      }, {
        "name": "MD",
        "code": "MD"
      }, {
        "name": "MA",
        "code": "MA"
      }, {
        "name": "MI",
        "code": "MI"
      }, {
        "name": "MN",
        "code": "MN"
      }, {
        "name": "MS",
        "code": "MS"
      }, {
        "name": "MO",
        "code": "MO"
      }, {
        "name": "MT",
        "code": "MT"
      }, {
        "name": "NE",
        "code": "NE"
      }, {
        "name": "NV",
        "code": "NV"
      }, {
        "name": "NH",
        "code": "NH"
      }, {
        "name": "NJ",
        "code": "NJ"
      }, {
        "name": "NM",
        "code": "NM"
      }, {
        "name": "NY",
        "code": "NY"
      }, {
        "name": "NC",
        "code": "NC"
      }, {
        "name": "ND",
        "code": "ND"
      }, {
        "name": "OH",
        "code": "OH"
      }, {
        "name": "OK",
        "code": "OK"
      }, {
        "name": "OR",
        "code": "OR"
      }, {
        "name": "PA",
        "code": "PA"
      }, {
        "name": "RI",
        "code": "RI"
      }, {
        "name": "SC",
        "code": "SC"
      }, {
        "name": "SD",
        "code": "SD"
      }, {
        "name": "TN",
        "code": "TN"
      }, {
        "name": "TX",
        "code": "TX"
      }, {
        "name": "UT",
        "code": "UT"
      }, {
        "name": "VT",
        "code": "VT"
      }, {
        "name": "VA",
        "code": "VA"
      }, {
        "name": "WA",
        "code": "WA"
      }, {
        "name": "WV",
        "code": "WV"
      }, {
        "name": "WI",
        "code": "WI"
      }, {
        "name": "WY",
        "code": "WY"
      }]
    },
    "defaultValue": null
  }, {
    "name": "contzip",
    "type": "esriFieldTypeString",
    "alias": "Contractor Zip",
    "sqlType": "sqlTypeOther",
    "length": 5,
    "nullable": true,
    "editable": true,
    "domain": null,
    "defaultValue": null
  }, {
    "name": "contphone",
    "type": "esriFieldTypeString",
    "alias": "Contractor Phone",
    "sqlType": "sqlTypeOther",
    "length": 15,
    "nullable": true,
    "editable": true,
    "domain": null,
    "defaultValue": null
  }, {
    "name": "contemail",
    "type": "esriFieldTypeString",
    "alias": "Contractor Email",
    "sqlType": "sqlTypeOther",
    "length": 100,
    "nullable": true,
    "editable": true,
    "domain": null,
    "defaultValue": null
  }, {
    "name": "contlicense",
    "type": "esriFieldTypeString",
    "alias": "Contractor License #",
    "sqlType": "sqlTypeOther",
    "length": 50,
    "nullable": true,
    "editable": true,
    "domain": null,
    "defaultValue": null
  }, {
    "name": "project",
    "type": "esriFieldTypeString",
    "alias": "Project",
    "sqlType": "sqlTypeOther",
    "length": 255,
    "nullable": true,
    "editable": true,
    "domain": null,
    "defaultValue": null
  }, {
    "name": "type",
    "type": "esriFieldTypeString",
    "alias": "Permit Type",
    "sqlType": "sqlTypeOther",
    "length": 15,
    "nullable": true,
    "editable": true,
    "domain": {
      "type": "codedValue",
      "name": "type",
      "codedValues": [{
        "name": "Surface or Sub-surface Alterations",
        "code": "Alterations"
      }, {
        "name": "Temporary Use",
        "code": "Temporary"
      }, {
        "name": "Encroachment",
        "code": "Encroachment"
      }]
    },
    "defaultValue": null
  }, {
    "name": "subtype",
    "type": "esriFieldTypeString",
    "alias": "Permit Subtype",
    "sqlType": "sqlTypeOther",
    "length": 255,
    "nullable": true,
    "editable": true,
    "domain": null,
    "defaultValue": null
  }, {
    "name": "subtypeother",
    "type": "esriFieldTypeString",
    "alias": "Permit Subtype Other",
    "sqlType": "sqlTypeOther",
    "length": 255,
    "nullable": true,
    "editable": true,
    "domain": null,
    "defaultValue": null
  }, {
    "name": "description",
    "type": "esriFieldTypeString",
    "alias": "Description of Work",
    "sqlType": "sqlTypeOther",
    "length": 1000,
    "nullable": true,
    "editable": true,
    "domain": null,
    "defaultValue": null
  }, {
    "name": "propstartdt",
    "type": "esriFieldTypeDate",
    "alias": "Proposed Start Date",
    "sqlType": "sqlTypeOther",
    "length": 8,
    "nullable": true,
    "editable": true,
    "domain": null,
    "defaultValue": null
  }, {
    "name": "propenddt",
    "type": "esriFieldTypeDate",
    "alias": "Proposed Completion Date",
    "sqlType": "sqlTypeOther",
    "length": 8,
    "nullable": true,
    "editable": true,
    "domain": null,
    "defaultValue": null
  }, {
    "name": "laneclosure",
    "type": "esriFieldTypeString",
    "alias": "Lane Closure Required",
    "sqlType": "sqlTypeOther",
    "length": 5,
    "nullable": true,
    "editable": true,
    "domain": {
      "type": "codedValue",
      "name": "yesno",
      "codedValues": [{
        "name": "Yes",
        "code": "Yes"
      }, {
        "name": "No",
        "code": "No"
      }]
    },
    "defaultValue": null
  }, {
    "name": "status",
    "type": "esriFieldTypeString",
    "alias": "Status",
    "sqlType": "sqlTypeOther",
    "length": 35,
    "nullable": true,
    "editable": true,
    "domain": {
      "type": "codedValue",
      "name": "status",
      "codedValues": [{
        "name": "Submitted",
        "code": "Submitted"
      }, {
        "name": "Staff Review",
        "code": "StaffReview"
      }, {
        "name": "Board Review",
        "code": "BoardReview"
      }, {
        "name": "Approved",
        "code": "Approved"
      }, {
        "name": "Denied",
        "code": "Denied"
      }]
    },
    "defaultValue": null
  }, {
    "name": "submitdt",
    "type": "esriFieldTypeDate",
    "alias": "Submission Date",
    "sqlType": "sqlTypeOther",
    "length": 8,
    "nullable": true,
    "editable": true,
    "domain": null,
    "defaultValue": null
  }, {
    "name": "actiondt",
    "type": "esriFieldTypeDate",
    "alias": "Approved or Denied Date",
    "sqlType": "sqlTypeOther",
    "length": 8,
    "nullable": true,
    "editable": true,
    "domain": null,
    "defaultValue": null
  }, {
    "name": "apprstartdt",
    "type": "esriFieldTypeDate",
    "alias": "Approved Start Date",
    "sqlType": "sqlTypeOther",
    "length": 8,
    "nullable": true,
    "editable": true,
    "domain": null,
    "defaultValue": null
  }, {
    "name": "apprenddt",
    "type": "esriFieldTypeDate",
    "alias": "Approved Completion Date",
    "sqlType": "sqlTypeOther",
    "length": 8,
    "nullable": true,
    "editable": true,
    "domain": null,
    "defaultValue": null
  }, {
    "name": "moreinfo",
    "type": "esriFieldTypeString",
    "alias": "More Information Required",
    "sqlType": "sqlTypeOther",
    "length": 5,
    "nullable": true,
    "editable": true,
    "domain": {
      "type": "codedValue",
      "name": "yesno",
      "codedValues": [{
        "name": "Yes",
        "code": "Yes"
      }, {
        "name": "No",
        "code": "No"
      }]
    },
    "defaultValue": null
  }, {
    "name": "comments",
    "type": "esriFieldTypeString",
    "alias": "Comments",
    "sqlType": "sqlTypeOther",
    "length": 1000,
    "nullable": true,
    "editable": true,
    "domain": null,
    "defaultValue": null
  }, {
    "name": "CreationDate",
    "type": "esriFieldTypeDate",
    "alias": "CreationDate",
    "sqlType": "sqlTypeOther",
    "length": 8,
    "nullable": true,
    "editable": false,
    "domain": null,
    "defaultValue": null
  }, {
    "name": "Creator",
    "type": "esriFieldTypeString",
    "alias": "Creator",
    "sqlType": "sqlTypeOther",
    "length": 50,
    "nullable": true,
    "editable": false,
    "domain": null,
    "defaultValue": null
  }, {
    "name": "EditDate",
    "type": "esriFieldTypeDate",
    "alias": "EditDate",
    "sqlType": "sqlTypeOther",
    "length": 8,
    "nullable": true,
    "editable": false,
    "domain": null,
    "defaultValue": null
  }, {
    "name": "Editor",
    "type": "esriFieldTypeString",
    "alias": "Editor",
    "sqlType": "sqlTypeOther",
    "length": 50,
    "nullable": true,
    "editable": false,
    "domain": null,
    "defaultValue": null
  }],
  "indexes": [{
    "name": "FDO_globalid",
    "fields": "globalid",
    "isAscending": true,
    "isUnique": true,
    "description": ""
  }, {
    "name": "CreationDateIndex",
    "fields": "CreationDate",
    "isAscending": true,
    "isUnique": false,
    "description": "CreationDate Field index"
  }, {
    "name": "CreatorIndex",
    "fields": "Creator",
    "isAscending": false,
    "isUnique": false,
    "description": "Creator Field index"
  }, {
    "name": "EditDateIndex",
    "fields": "EditDate",
    "isAscending": true,
    "isUnique": false,
    "description": "EditDate Field index"
  }, {
    "name": "EditorIndex",
    "fields": "Editor",
    "isAscending": false,
    "isUnique": false,
    "description": "Editor Field index"
  }, {
    "name": "user_4375.ROWPermits_ROW_PERMITS_Shape_sidx",
    "fields": "Shape",
    "isAscending": false,
    "isUnique": false,
    "description": "Shape Index"
  }, {
    "name": "PK__ROWPermi__F4B70D859D5FEDE7",
    "fields": "OBJECTID",
    "isAscending": true,
    "isUnique": true,
    "description": "clustered, unique, primary key"
  }],
  "types": [{
    "id": "Submitted",
    "name": "Submitted",
    "domains": {
      "appstate": {
        "type": "inherited"
      },
      "sameapp": {
        "type": "inherited"
      },
      "type": {
        "type": "inherited"
      },
      "laneclosure": {
        "type": "inherited"
      },
      "status": {
        "type": "inherited"
      },
      "moreinfo": {
        "type": "inherited"
      }
    },
    "templates": [{
      "name": "Submitted",
      "description": "",
      "drawingTool": "esriFeatureEditToolPoint",
      "prototype": {
        "attributes": {
          "laneclosure": null,
          "Editor": null,
          "EditDate": null,
          "appname": null,
          "appaddr": null,
          "appcity": null,
          "appstate": null,
          "appzip": null,
          "appphone": null,
          "appemail": null,
          "sameapp": null,
          "contname": null,
          "contaddr": null,
          "contcity": null,
          "contstate": null,
          "contzip": null,
          "contphone": null,
          "contemail": null,
          "contlicense": null,
          "project": null,
          "type": null,
          "subtype": null,
          "subtypeother": null,
          "description": null,
          "propstartdt": null,
          "propenddt": null,
          "status": "Submitted",
          "submitdt": null,
          "actiondt": null,
          "apprstartdt": null,
          "apprenddt": null,
          "moreinfo": null,
          "comments": null,
          "CreationDate": null,
          "Creator": null
        }
      }
    }]
  }, {
    "id": "StaffReview",
    "name": "StaffReview",
    "domains": {
      "appstate": {
        "type": "inherited"
      },
      "sameapp": {
        "type": "inherited"
      },
      "type": {
        "type": "inherited"
      },
      "laneclosure": {
        "type": "inherited"
      },
      "status": {
        "type": "inherited"
      },
      "moreinfo": {
        "type": "inherited"
      }
    },
    "templates": [{
      "name": "Staff Review",
      "description": "",
      "drawingTool": "esriFeatureEditToolPoint",
      "prototype": {
        "attributes": {
          "laneclosure": null,
          "Editor": null,
          "EditDate": null,
          "appname": null,
          "appaddr": null,
          "appcity": null,
          "appstate": null,
          "appzip": null,
          "appphone": null,
          "appemail": null,
          "sameapp": null,
          "contname": null,
          "contaddr": null,
          "contcity": null,
          "contstate": null,
          "contzip": null,
          "contphone": null,
          "contemail": null,
          "contlicense": null,
          "project": null,
          "type": null,
          "subtype": null,
          "subtypeother": null,
          "description": null,
          "propstartdt": null,
          "propenddt": null,
          "status": "StaffReview",
          "submitdt": null,
          "actiondt": null,
          "apprstartdt": null,
          "apprenddt": null,
          "moreinfo": null,
          "comments": null,
          "CreationDate": null,
          "Creator": null
        }
      }
    }]
  }, {
    "id": "BoardReview",
    "name": "BoardReview",
    "domains": {
      "appstate": {
        "type": "inherited"
      },
      "sameapp": {
        "type": "inherited"
      },
      "type": {
        "type": "inherited"
      },
      "laneclosure": {
        "type": "inherited"
      },
      "status": {
        "type": "inherited"
      },
      "moreinfo": {
        "type": "inherited"
      }
    },
    "templates": [{
      "name": "Board Review",
      "description": "",
      "drawingTool": "esriFeatureEditToolPoint",
      "prototype": {
        "attributes": {
          "laneclosure": null,
          "Editor": null,
          "EditDate": null,
          "appname": null,
          "appaddr": null,
          "appcity": null,
          "appstate": null,
          "appzip": null,
          "appphone": null,
          "appemail": null,
          "sameapp": null,
          "contname": null,
          "contaddr": null,
          "contcity": null,
          "contstate": null,
          "contzip": null,
          "contphone": null,
          "contemail": null,
          "contlicense": null,
          "project": null,
          "type": null,
          "subtype": null,
          "subtypeother": null,
          "description": null,
          "propstartdt": null,
          "propenddt": null,
          "status": "BoardReview",
          "submitdt": null,
          "actiondt": null,
          "apprstartdt": null,
          "apprenddt": null,
          "moreinfo": null,
          "comments": null,
          "CreationDate": null,
          "Creator": null
        }
      }
    }]
  }, {
    "id": "Approved",
    "name": "Approved",
    "domains": {
      "appstate": {
        "type": "inherited"
      },
      "sameapp": {
        "type": "inherited"
      },
      "type": {
        "type": "inherited"
      },
      "laneclosure": {
        "type": "inherited"
      },
      "status": {
        "type": "inherited"
      },
      "moreinfo": {
        "type": "inherited"
      }
    },
    "templates": [{
      "name": "Approved",
      "description": "",
      "drawingTool": "esriFeatureEditToolPoint",
      "prototype": {
        "attributes": {
          "laneclosure": null,
          "Editor": null,
          "EditDate": null,
          "appname": null,
          "appaddr": null,
          "appcity": null,
          "appstate": null,
          "appzip": null,
          "appphone": null,
          "appemail": null,
          "sameapp": null,
          "contname": null,
          "contaddr": null,
          "contcity": null,
          "contstate": null,
          "contzip": null,
          "contphone": null,
          "contemail": null,
          "contlicense": null,
          "project": null,
          "type": null,
          "subtype": null,
          "subtypeother": null,
          "description": null,
          "propstartdt": null,
          "propenddt": null,
          "status": "Approved",
          "submitdt": null,
          "actiondt": null,
          "apprstartdt": null,
          "apprenddt": null,
          "moreinfo": null,
          "comments": null,
          "CreationDate": null,
          "Creator": null
        }
      }
    }]
  }, {
    "id": "Denied",
    "name": "Denied",
    "domains": {
      "appstate": {
        "type": "inherited"
      },
      "sameapp": {
        "type": "inherited"
      },
      "type": {
        "type": "inherited"
      },
      "laneclosure": {
        "type": "inherited"
      },
      "status": {
        "type": "inherited"
      },
      "moreinfo": {
        "type": "inherited"
      }
    },
    "templates": [{
      "name": "Denied",
      "description": "",
      "drawingTool": "esriFeatureEditToolPoint",
      "prototype": {
        "attributes": {
          "laneclosure": null,
          "Editor": null,
          "EditDate": null,
          "appname": null,
          "appaddr": null,
          "appcity": null,
          "appstate": null,
          "appzip": null,
          "appphone": null,
          "appemail": null,
          "sameapp": null,
          "contname": null,
          "contaddr": null,
          "contcity": null,
          "contstate": null,
          "contzip": null,
          "contphone": null,
          "contemail": null,
          "contlicense": null,
          "project": null,
          "type": null,
          "subtype": null,
          "subtypeother": null,
          "description": null,
          "propstartdt": null,
          "propenddt": null,
          "status": "Denied",
          "submitdt": null,
          "actiondt": null,
          "apprstartdt": null,
          "apprenddt": null,
          "moreinfo": null,
          "comments": null,
          "CreationDate": null,
          "Creator": null
        }
      }
    }]
  }],
  "templates": [],
  "supportedQueryFormats": "JSON, geoJSON, PBF",
  "hasStaticData": false,
  "maxRecordCount": 2000,
  "standardMaxRecordCount": 32000,
  "tileMaxRecordCount": 8000,
  "maxRecordCountFactor": 1,
  "capabilities": "Create,Query,Editing",
  "viewDefinitionQuery": "status = 'BoardReview'",
  "definitionQuery": "status = 'BoardReview'"
};

export const FeatureServiceLayer1SuccessResponse: any = {
  "currentVersion": 10.61,
  "id": 1,
  "name": "ROW Permit Comment",
  "type": "Table",
  "serviceItemId": "svc1234567890",
  "isView": true,
  "isUpdatableView": true,
  "sourceSchemaChangesAllowed": true,
  "displayField": "name",
  "description": "",
  "copyrightText": "",
  "defaultVisibility": true,
  "ownershipBasedAccessControlForFeatures": {
    "allowOthersToQuery": true,
    "allowOthersToDelete": true,
    "allowOthersToUpdate": true,
    "allowAnonymousToQuery": true,
    "allowAnonymousToUpdate": true,
    "allowAnonymousToDelete": true
  },
  "editFieldsInfo": {
    "creationDateField": "CreationDate",
    "creatorField": "Creator",
    "editDateField": "EditDate",
    "editorField": "Editor"
  },
  "editingInfo": {
    "lastEditDate": 1538579807130
  },
  "relationships": [{
    "id": 0,
    "name": "",
    "relatedTableId": 0,
    "cardinality": "esriRelCardinalityOneToMany",
    "role": "esriRelRoleDestination",
    "keyField": "parentglobalid",
    "composite": true
  }],
  "isDataVersioned": false,
  "supportsAppend": true,
  "supportsCalculate": true,
  "supportsTruncate": true,
  "supportsAttachmentsByUploadId": true,
  "supportsAttachmentsResizing": true,
  "supportsRollbackOnFailureParameter": true,
  "supportsStatistics": true,
  "supportsAdvancedQueries": true,
  "supportsValidateSql": true,
  "supportsCoordinatesQuantization": true,
  "supportsQuantizationEditMode": true,
  "supportsApplyEditsWithGlobalIds": true,
  "supportsOBACForAnonymousUsers": true,
  "advancedQueryCapabilities": {
    "supportsPagination": true,
    "supportsPaginationOnAggregatedQueries": true,
    "supportsQueryRelatedPagination": true,
    "supportsQueryWithDistance": true,
    "supportsReturningQueryExtent": true,
    "supportsStatistics": true,
    "supportsOrderBy": true,
    "supportsDistinct": true,
    "supportsQueryWithResultType": true,
    "supportsSqlExpression": true,
    "supportsAdvancedQueryRelated": true,
    "supportsCountDistinct": true,
    "supportsLod": true,
    "supportsReturningGeometryCentroid": false,
    "supportsQueryWithDatumTransformation": true,
    "supportsHavingClause": true,
    "supportsOutFieldSQLExpression": true,
    "supportsMaxRecordCountFactor": true,
    "supportsTopFeaturesQuery": true
  },
  "useStandardizedQueries": true,
  "allowGeometryUpdates": true,
  "hasAttachments": false,
  "viewSourceHasAttachments": false,
  "htmlPopupType": "esriServerHTMLPopupTypeNone",
  "hasM": false,
  "hasZ": false,
  "objectIdField": "OBJECTID",
  "uniqueIdField": {
    "name": "OBJECTID",
    "isSystemMaintained": true
  },
  "globalIdField": "globalid",
  "typeIdField": "",
  "fields": [{
    "name": "OBJECTID",
    "type": "esriFieldTypeOID",
    "alias": "OBJECTID",
    "sqlType": "sqlTypeOther",
    "nullable": false,
    "editable": false,
    "domain": null,
    "defaultValue": null
  }, {
    "name": "globalid",
    "type": "esriFieldTypeGlobalID",
    "alias": "GlobalID",
    "sqlType": "sqlTypeOther",
    "length": 38,
    "nullable": false,
    "editable": false,
    "domain": null,
    "defaultValue": null
  }, {
    "name": "name",
    "type": "esriFieldTypeString",
    "alias": "Name",
    "sqlType": "sqlTypeOther",
    "length": 150,
    "nullable": true,
    "editable": true,
    "domain": null,
    "defaultValue": null
  }, {
    "name": "address",
    "type": "esriFieldTypeString",
    "alias": "Address",
    "sqlType": "sqlTypeOther",
    "length": 255,
    "nullable": true,
    "editable": true,
    "domain": null,
    "defaultValue": null
  }, {
    "name": "organization",
    "type": "esriFieldTypeString",
    "alias": "Organization",
    "sqlType": "sqlTypeOther",
    "length": 50,
    "nullable": true,
    "editable": true,
    "domain": {
      "type": "codedValue",
      "name": "organization",
      "codedValues": [{
        "name": "Public Works",
        "code": "PublicWorks"
      }, {
        "name": "Parks & Recreation",
        "code": "ParksRec"
      }, {
        "name": "Planning & Development",
        "code": "PlanningDev"
      }, {
        "name": "Transportation",
        "code": "Transportation"
      }, {
        "name": "Water & Sewer",
        "code": "WaterSewer"
      }, {
        "name": "General Public",
        "code": "GeneralPublic"
      }, {
        "name": "Other",
        "code": "Other"
      }]
    },
    "defaultValue": null
  }, {
    "name": "comments",
    "type": "esriFieldTypeString",
    "alias": "Comments",
    "sqlType": "sqlTypeOther",
    "length": 1000,
    "nullable": true,
    "editable": true,
    "domain": null,
    "defaultValue": null
  }, {
    "name": "instructions",
    "type": "esriFieldTypeString",
    "alias": "Any Instructions",
    "sqlType": "sqlTypeOther",
    "length": 1000,
    "nullable": true,
    "editable": true,
    "domain": null,
    "defaultValue": null
  }, {
    "name": "actiontaken",
    "type": "esriFieldTypeString",
    "alias": "Action Taken",
    "sqlType": "sqlTypeOther",
    "length": 35,
    "nullable": true,
    "editable": true,
    "domain": {
      "type": "codedValue",
      "name": "actiontaken",
      "codedValues": [{
        "name": "Under Review",
        "code": "UnderReview"
      }, {
        "name": "More Information Required",
        "code": "MoreInformationRequired"
      }, {
        "name": "Approved",
        "code": "Approved"
      }, {
        "name": "Denied",
        "code": "Denied"
      }]
    },
    "defaultValue": null
  }, {
    "name": "publicview",
    "type": "esriFieldTypeString",
    "alias": "Public View",
    "sqlType": "sqlTypeOther",
    "length": 5,
    "nullable": true,
    "editable": true,
    "domain": {
      "type": "codedValue",
      "name": "yesno",
      "codedValues": [{
        "name": "Yes",
        "code": "Yes"
      }, {
        "name": "No",
        "code": "No"
      }]
    },
    "defaultValue": null
  }, {
    "name": "submitdate",
    "type": "esriFieldTypeDate",
    "alias": "Submission Date",
    "sqlType": "sqlTypeOther",
    "length": 8,
    "nullable": true,
    "editable": true,
    "domain": null,
    "defaultValue": null
  }, {
    "name": "parentglobalid",
    "type": "esriFieldTypeGUID",
    "alias": "ParentGlobalID",
    "sqlType": "sqlTypeOther",
    "length": 38,
    "nullable": true,
    "editable": true,
    "domain": null,
    "defaultValue": null
  }, {
    "name": "CreationDate",
    "type": "esriFieldTypeDate",
    "alias": "CreationDate",
    "sqlType": "sqlTypeOther",
    "length": 8,
    "nullable": true,
    "editable": false,
    "domain": null,
    "defaultValue": null
  }, {
    "name": "Creator",
    "type": "esriFieldTypeString",
    "alias": "Creator",
    "sqlType": "sqlTypeOther",
    "length": 50,
    "nullable": true,
    "editable": false,
    "domain": null,
    "defaultValue": null
  }, {
    "name": "EditDate",
    "type": "esriFieldTypeDate",
    "alias": "EditDate",
    "sqlType": "sqlTypeOther",
    "length": 8,
    "nullable": true,
    "editable": false,
    "domain": null,
    "defaultValue": null
  }, {
    "name": "Editor",
    "type": "esriFieldTypeString",
    "alias": "Editor",
    "sqlType": "sqlTypeOther",
    "length": 50,
    "nullable": true,
    "editable": false,
    "domain": null,
    "defaultValue": null
  }],
  "indexes": [{
    "name": "FDO_globalid",
    "fields": "globalid",
    "isAscending": true,
    "isUnique": true,
    "description": ""
  }, {
    "name": "G11parentglobali",
    "fields": "parentglobalid",
    "isAscending": true,
    "isUnique": false,
    "description": ""
  }, {
    "name": "CreationDateIndex",
    "fields": "CreationDate",
    "isAscending": true,
    "isUnique": false,
    "description": "CreationDate Field index"
  }, {
    "name": "CreatorIndex",
    "fields": "Creator",
    "isAscending": false,
    "isUnique": false,
    "description": "Creator Field index"
  }, {
    "name": "EditDateIndex",
    "fields": "EditDate",
    "isAscending": true,
    "isUnique": false,
    "description": "EditDate Field index"
  }, {
    "name": "EditorIndex",
    "fields": "Editor",
    "isAscending": false,
    "isUnique": false,
    "description": "Editor Field index"
  }, {
    "name": "PK__ROWPermi__F4B70D85BE37697A",
    "fields": "OBJECTID",
    "isAscending": true,
    "isUnique": true,
    "description": "clustered, unique, primary key"
  }],
  "types": [],
  "templates": [{
    "name": "ROW Permit Comment",
    "description": "",
    "drawingTool": "esriFeatureEditToolNone",
    "prototype": {
      "attributes": {
        "EditDate": null,
        "Editor": null,
        "Creator": null,
        "name": null,
        "address": null,
        "organization": "GeneralPublic",
        "comments": null,
        "instructions": null,
        "actiontaken": null,
        "publicview": "Yes",
        "submitdate": null,
        "parentglobalid": null,
        "CreationDate": null
      }
    }
  }],
  "supportedQueryFormats": "JSON, geoJSON, PBF",
  "hasStaticData": false,
  "maxRecordCount": 2000,
  "standardMaxRecordCount": 32000,
  "tileMaxRecordCount": 8000,
  "maxRecordCountFactor": 1,
  "capabilities": "Create,Query,Editing",
  "viewDefinitionQuery": "(organization = 'GeneralPublic') AND (publicview = 'Yes')",
  "definitionQuery": "(organization = 'GeneralPublic') AND (publicview = 'Yes')"
};
