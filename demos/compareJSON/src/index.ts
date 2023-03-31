import "./style.css";
import * as common from "@esri/solution-common";
import * as compareJSON from "./compare-json-main";

declare var goFcn: any;
declare var loadFcn: any;

/**
 * Loads the second window with a sanitized version of the first window.
 */
function load () {
  var json1 = (document.getElementById("json1") as HTMLInputElement).value;
  (document.getElementById("json2") as HTMLInputElement).value = !json1 ? "" :
    JSON.stringify(
      common.sanitizeJSON(
        JSON.parse((document.getElementById("json1") as HTMLInputElement).value)
      ), null, 2
    );
}

/**
 * Runs the JSON comparison.
 */
function go () {
  document.getElementById("input").style.display = "none";
  document.getElementById("output").style.display = "block";

  var json1 = (document.getElementById("json1") as HTMLInputElement).value;
  var json2 = (document.getElementById("json2") as HTMLInputElement).value;
  json1 = json1 ? JSON.parse(json1) : null;
  json2 = json2 ? JSON.parse(json2) : null;

  document.getElementById("output").innerHTML = compareJSON.compareJSON(json1, json2);
}

goFcn = go;
loadFcn = load;

document.getElementById("input").style.display = "block";
