export default {
  item: {},
  data: {
    values: {
      story: {
        sections: [
          {
            media: {
              type: "webmap",
              webmap: {
                id: "234"
              }
            }
          },
          {
            notmedia: {
              type: "other",
              props: {
                val: "234"
              }
            }
          },
          {
            media: {
              type: "webmap",
              webmap: {
                id: "567"
              }
            }
          },
          {
            media: {
              type: "webmap",
              webmap: {
                noid: "othervalue"
              }
            }
          },
          {
            media: {
              type: "webpage",
              webpage: {
                url:
                  "https://www.arcgis.com/home/webscene/viewer.html?webscene=91b46c2b162c48dba264b2190e1dbcff&ui=min"
              }
            }
          },
          {
            media: {
              type: "webpage",
              webpage: {
                nourl: "notaurl"
              }
            }
          }
        ]
      }
    }
  }
};
