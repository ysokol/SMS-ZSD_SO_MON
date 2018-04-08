(function() {
	"use strict";
	jQuery.sap.require("sap.ca.ui.CustomerContext");
	jQuery.sap.require("sap.ca.scfld.md.controller.BaseMasterController");
	jQuery.sap.require("cus.sd.salesorder.monitor.utils.Utilities");
	jQuery.sap.require("sap.ca.scfld.md.controller.ScfldMasterController");
	sap.ui.controller("cus.sd.salesorder.monitor.ZSD_SO_MON.view.S2Custom", {
		onInit: function() {
			sap.ca.scfld.md.controller.ScfldMasterController.prototype.onInit.call(this);
			var c = new sap.ui.component(sap.ui.core.Component.getOwnerIdFor(this.getView()));
			this.version = c.getNewVersion();
			this.salesOrderPath = "/SalesOrders";
			if (!this.version) {
				this.fragment = new sap.ui.xmlfragment("cus.sd.salesorder.monitor.view.ListItemTemplate", this);
			} else {
				this.fragment = new sap.ui.xmlfragment("cus.sd.salesorder.monitor.view.ListItemTemplateNew", this);
			}
			this.getList().attachUpdateStarted({}, this.onListUpdateStarted, this);
			this.getList().attachUpdateFinished({}, this.onListUpdateFinished, this);
			this.setDefaultSelection = false;
			this.numberOfRows = 0;
			this.numberOfItems = 0;
			this.resourceBundle = this.oApplicationFacade.getResourceBundle();
			this.getView().addEventDelegate({
				onAfterShow: jQuery.proxy(this.onShow, this)
			});
			var t = this;
			this.oRouter.attachRouteMatched(function(e) {
				if (e.getParameter("name") === "master") {
					var d = e.getParameter("arguments");
					t.urlContextPath = d.contextPath;
					t.urlCustomerID = d.customerID;
					t.urlCustomerName = decodeURIComponent(d.customerName);
					t.urlSalesOrganization = d.salesOrganization;
					t.urlDistributionChannel = d.distributionChannel;
					t.urlDivision = d.division;
					t.loadFromUrl = true;
				}
			}, this);
		},
		onShow: function() {
			this._setCustomerControl();
		},
		onListUpdateStarted: function() {
			this.getView().byId("list").setNoDataText(this.oApplicationFacade.getResourceBundle().getText("LOADING"));
		},
		onListUpdateFinished: function() {
			this.getView().byId("list").setNoDataText(this.oApplicationFacade.getResourceBundle().getText("NO_ITEMS_AVAILABLE"));
		},
		onRequestSent: function() {
			this.getView().byId("list").setNoDataText(this.oApplicationFacade.getResourceBundle().getText("LOADING"));
		},
		onDataLoaded: function() {
			this.onRequestCompleted();
		},
		onRequestCompleted: function() {
			this.numberOfRows = this.getList().getItems().length;
			if (this.numberOfRows > 0) {
				if (this.setDefaultSelection) {
					this.setDefaultSelection = false;
					if (this.version) {
						this.setListItem(this.getList().getItems()[0]);
					} else {
						this.setListItem(this.getList().getItems()[1]);
					}
				} else if (this.loadFromUrl) {
					this._findLoadedItemInList();
				}
			} else {
				this.getView().byId("list").setNoDataText(this.oApplicationFacade.getResourceBundle().getText("NO_ITEMS_AVAILABLE"));
				this.navToEmpty();
			}
		},
		_findLoadedItemInList: function() {
			var i = false;
			var a = 0;
			for (a = 0; a < this.numberOfRows; a++) {
				if (this.getList().getItems()[a].getMetadata().getName() === "sap.m.ObjectListItem") {
					if (this.getList().getItems()[a].getBindingContext().getPath().substr(1) === this.urlContextPath) {
						this.setListItem(this.getList().getItems()[a]);
						a = this.numberOfRows;
						i = true;
					}
				}
			}
			if (!i) {
				this.applyFilterFromContext(this.urlContextPath);
			}
		},
		applyFilterFromContext: function(c) {
			/*c = c.replace(/[^0-9]/g, "");
			this.getView().getController()._oControlStore.oMasterSearchField.setValue(c);
			var f = [
				new sap.ui.model.Filter("SalesOrderNumber", sap.ui.model.FilterOperator.Contains, c),
				new sap.ui.model.Filter("CustomerID", sap.ui.model.FilterOperator.EQ, this.oCustomerID),
				new sap.ui.model.Filter("SalesOrganization", sap.ui.model.FilterOperator.EQ, this.oSalesOrganization),
				new sap.ui.model.Filter("DistributionChannel", sap.ui.model.FilterOperator.EQ, this.DistributionChannel),
				new sap.ui.model.Filter("Division", sap.ui.model.FilterOperator.EQ, this.oDivision)
			];
			var s = null;
			if (!this.version) {
				s = new sap.ui.model.Sorter("PO", false, this.oGroupPO);
			}
			this.getList().bindItems(this.salesOrderPath, this.fragment, s, f);
			this.registerMasterListBind(this.getList());*/
		},
		setListItem: function(i) {
			this.setDefaultSelection = false;
			var l = this.getList();
			l.removeSelections();
			i.setSelected(true);
			l.setSelectedItem(i, true);
			var c = this.getView().getController();
			var d = "newDetail";
			if (!this.version) {
				d = "detail";
			}
			sap.ca.scfld.md.app.Application.getImpl().getComponent().setTabKey(true);
			this.oRouter.navTo(d, {
				contextPath: i.getBindingContext().sPath.substr(1),
				customerID: encodeURIComponent(c.oCustomerID),
				customerName: encodeURIComponent(c.oCustomerName),
				salesOrganization: encodeURIComponent(c.oSalesOrganization),
				distributionChannel: encodeURIComponent(c.DistributionChannel),
				division: encodeURIComponent(c.oDivision)
			});
		},
		navToEmpty: function() {
			this.oRouter.navTo("noData", {
				viewTitle: "SALES_ORDER",
				languageKey: "NO_ITEMS_AVAILABLE"
			}, !sap.ui.Device.system.phone);
		},
		_setCustomerControl: function() {
			this.getList().bindItems(this.salesOrderPath, this.fragment);
			this.registerMasterListBind(this.getList());
			/*this.customerContext = new sap.ca.ui.CustomerContext({
				customerSelected: jQuery.proxy(this.onCustomerSelected, this),
				showSalesArea: true,
				personalizationPageName: "SRA018_SD_SO_MON",
				path: "/Customers"
			});
			this.customerContext.setModel(this.oApplicationFacade.getODataModel());
			if (this.urlCustomerID && this.loadFromUrl) {
				var c = {
					CustomerID: this.urlCustomerID,
					CustomerName: this.urlCustomerName,
					SalesOrganization: this.urlSalesOrganization,
					DistributionChannel: this.urlDistributionChannel,
					Division: this.urlDivision
				};
				this.updateListBinding(c);
			} else {
				this.customerContext.select();
			}*/
		},
		updateListBinding: function(c) {
			/*if (!c) {
				return;
			}
			var f = [];
			f.push(new sap.ui.model.Filter("CustomerID", sap.ui.model.FilterOperator.EQ, c.CustomerID));
			f.push(new sap.ui.model.Filter("SalesOrganization", sap.ui.model.FilterOperator.EQ, c.SalesOrganization));
			f.push(new sap.ui.model.Filter("DistributionChannel", sap.ui.model.FilterOperator.EQ, c.DistributionChannel));
			f.push(new sap.ui.model.Filter("Division", sap.ui.model.FilterOperator.EQ, c.Division));
			var s = null;
			if (!this.version) {
				s = new sap.ui.model.Sorter("PO", false, this.oGroupPO);
			}
			this.getList().bindItems(this.salesOrderPath, this.fragment, s, f);
			this.registerMasterListBind(this.getList());
			this.oCustomerID = c.CustomerID;
			this.oCustomerName = c.CustomerName;
			this.oSalesOrganization = c.SalesOrganization;
			this.oDivision = c.Division;
			this.DistributionChannel = c.DistributionChannel;
			this.getView().byId("masterListHeaderTitle").setText(this.oApplicationFacade.getResourceBundle().getText("SALES_ORDERS", [this.oCustomerName]));*/
		},
		changeInCustomerContext: function() {
			this.customerContext.change();
		},
		onCustomerSelected: function(e) {
			this.setDefaultSelection = true;
			var c = e.getParameters();
			if (this.existingCustomer) {
				if (this.existingCustomer.CustomerID === c.CustomerID) {
					if (this.existingCustomer.SalesOrganization === c.SalesOrganization && this.existingCustomer.Division === c.Division && this.existingCustomer
						.DistributionChannel === c.DistributionChannel) {
						return;
					}
				}
			}
			this.updateListBinding(c);
			this.existingCustomer = c;
		},
		applySearchPatternToListItem: function(i, f) {
			if (f === "") {
				return true;
			}
			if (!i.getBindingContext()) {
				return false;
			}
			return sap.ca.scfld.md.controller.ScfldMasterController.prototype.applySearchPatternToListItem.call(null, i, f);
		},
		oGroupPO: function(c) {
			return c.getProperty("PO");
		},
		isLiveSearch: function() {
			return true;
		},
		isBackendSearch: function() {
			return true;
		},
		applyBackendSearchPattern: function(f, b) {
			/*var F = [
				new sap.ui.model.Filter("SalesOrderNumber", sap.ui.model.FilterOperator.Contains, f),
				new sap.ui.model.Filter("CustomerID", sap.ui.model.FilterOperator.EQ, this.oCustomerID),
				new sap.ui.model.Filter("SalesOrganization", sap.ui.model.FilterOperator.EQ, this.oSalesOrganization),
				new sap.ui.model.Filter("DistributionChannel", sap.ui.model.FilterOperator.EQ, this.DistributionChannel),
				new sap.ui.model.Filter("Division", sap.ui.model.FilterOperator.EQ, this.oDivision)
			];*
			this.setDefaultSelection = true;
			b.filter(F, sap.ui.model.FilterType.Application);*/
		},
		_onNavBack: function() {
			var h = sap.ui.core.routing.History.getInstance(),
				p = h.getPreviousHash(),
				c = sap.ushell.Container.getService("CrossApplicationNavigation");
			c.toExternal({
				target: {
					shellHash: "#"
				}
			});
		},
		getHeaderFooterOptions: function() {
			if (sap.ui.Device.system.phone) {
				return {};
			}
			return {
				onBack: this._onNavBack
			};
		}
	});
}());