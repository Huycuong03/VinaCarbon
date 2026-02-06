import * as L from "leaflet";

declare module "leaflet" {
  namespace LeafletGeotiff {
    function plotty(options: any): any;
  }

  function leafletGeotiff(url: string, options?: any): any;
}
