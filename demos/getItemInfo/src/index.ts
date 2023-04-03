import "./style.css";
import * as auth from "@esri/arcgis-rest-auth";
import * as getFormattedItemInfo from "./getFormattedItemInfo";

declare var goFcn: any;

(document.getElementById("srcPortal") as HTMLInputElement).value = "https://www.arcgis.com";

/**
 * Runs the item fetch and formatting.
 */
function go () {
  document.getElementById("input").style.display = "none";
  document.getElementById("output").style.display = "block";

  getFormattedItemInfo.getFormattedItemInfo(
    (document.getElementById("id") as HTMLInputElement).value.trim(),
    new auth.UserSession({
      username: (document.getElementById("username") as HTMLInputElement).value,
      password: (document.getElementById("password") as HTMLInputElement).value,
      portal: (document.getElementById("srcPortal") as HTMLInputElement).value + "/sharing/rest"
    })
  ).then(
    html => {
      document.getElementById("output").innerHTML = html;
    },
    error => {
      document.getElementById("output").innerHTML = "<span style=\"color:red\">" + error + "</span>";
    }
  );
}

goFcn = go;

document.getElementById("input").style.display = "block";
