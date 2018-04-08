jQuery.sap.declare("cus.sd.salesorder.monitor.ZSD_SO_MON.Component");
// use the load function for getting the optimized preload file if present
sap.ui.component.load({
	name: "cus.sd.salesorder.monitor",
	// Use the below URL to run the extended application when SAP-delivered application is deployed on SAPUI5 ABAP Repository
	url: "/sap/bc/ui5_ui5/sap/SD_SO_MON" // we use a URL relative to our own component
		// extension application is deployed with customer namespace
});
this.cus.sd.salesorder.monitor.Component.extend("cus.sd.salesorder.monitor.ZSD_SO_MON.Component", {
	metadata: {
		version: "1.0",
		config: {
			"sap.ca.serviceConfigs": [{
				"name": "SRA018_SO_TRACKING_SRV",
				"serviceUrl": "/sap/opu/odata/sap/ZSD_SO_TRACKING_SRV/",
				"isDefault": true,
				"useBatch": false,
				"mockedDataSource": "./localService/metadata.xml"
			}],
			"sap.ca.i18Nconfigs": {
				"bundleName": "cus.sd.salesorder.monitor.ZSD_SO_MON.i18n.i18n"
			}
		},
		customizing: {
			"sap.ui.viewReplacements": {
				"cus.sd.salesorder.monitor.view.S3New": {
					"viewName": "cus.sd.salesorder.monitor.ZSD_SO_MON.view.S3NewCustom",
					"type": "XML"
				}
			},
			"sap.ui.controllerExtensions": {
				"cus.sd.salesorder.monitor.view.S3New": {
					"controllerName": "cus.sd.salesorder.monitor.ZSD_SO_MON.view.S3NewCustom"
				},
				"cus.sd.salesorder.monitor.view.S2": {
					"controllerName": "cus.sd.salesorder.monitor.ZSD_SO_MON.view.S2Custom"
				}
			}
		}
	}
});