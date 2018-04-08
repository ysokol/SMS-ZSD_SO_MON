(function() {
	"use strict";
	jQuery.sap.require("sap.ca.ui.model.type.Date");
	jQuery.sap.require("sap.m.Table");
	jQuery.sap.require("sap.ca.scfld.md.controller.BaseDetailController");
	jQuery.sap.require("cus.sd.salesorder.monitor.utils.Formatter");
	jQuery.sap.require("sap.ca.ui.quickoverview.EmployeeLaunch");
	jQuery.sap.require("cus.sd.salesorder.monitor.utils.Utilities");
	sap.ui.controller("cus.sd.salesorder.monitor.ZSD_SO_MON.view.S3NewCustom", {
		    onInit: function () {
		        sap.ca.scfld.md.controller.BaseDetailController.prototype.onInit.call(this);
		        var v = this.getView();
		        this.version = this.oApplicationImplementation.getComponent().getNewVersion();
		        this.oRouter.attachRouteMatched(function (e) {
		            if (e.getParameter("name") === "display") {
		                this.fullScreenMode = true;
		            }
		            if (e.getParameter("name") === "newDetail" || e.getParameter("name") === "display") {
		                var m = new sap.ui.model.json.JSONModel();
		                m.setProperty("Contacts", []);
		                this.oApplicationFacade.setApplicationModel("contacts", m);
		                this.getView().setModel(m, "contacts");
		                var c = new sap.ui.model.Context(v.getModel(), "/" + e.getParameter("arguments").contextPath);
		                var d = e.getParameter("arguments");
		                this.customerID = d.customerID;
		                v.setBindingContext(c);
		                var t = this.oApplicationImplementation.getComponent().getTabKey();
		                this.maintainFilter(t);
		                if (t) {
		                    this.refresh(e);
		                }
		                this.addFooterOptions();
		            }
		        }, this);
		        // CHANGES BEGIN
		        this._oDataModel = this.getView().getModel();
		        // CHANGES END
		    },
		    maintainFilter: function (t) {
		        var i = this.getView().byId("SO_TAB_CON");
		        if (t) {
		            if (i.getSelectedKey() !== "All") {
		                i.setSelectedKey("All");
		            }
		        }
		    },
		    handleItemFilterSelect: function () {
		        var b = this.getView().byId("itemsTable").getBinding("items"), k = this.getView().byId("SO_TAB_CON").getSelectedKey(), f;
		        this.hideShowTables(k);
		        if (k === "Open") {
		            f = new sap.ui.model.Filter("ItemStatusCode", "EQ", "OP");
		            b.filter([f]);
		        } else if (k === "InProcess") {
		            f = new sap.ui.model.Filter("inProcessCount", "EQ", 1);
		            b.filter([f]);
		        } else if (k === "Shipped") {
		            f = new sap.ui.model.Filter("shippedCount", "EQ", 1);
		            b.filter([f]);
		        } else {
		            b.filter([]);
		        }
		    },
		    navToEmpty: function () {
		        this.oRouter.navTo("noData");
		    },
		    _onDetailListItemPressed: function (e) {
		        var m = this.getView().getModel("LocalOrderItems");
		        var i = e.getSource().getBindingContextPath().substr(1);
		        var d = m.oData[i];
		        var p = "OrderItems(ItemNumber='" + d.ItemNumber + "',SalesOrderNumber='" + d.SalesOrderNumber + "')";
		        var a = "newItemDetail";
		        if (this.fullScreenMode) {
		            a = "itemDisplay";
		        }
		        if (!this.version) {
		            a = "itemDetail";
		        }
		        this.oRouter.navTo(a, { contextPath: p });
		    },
		    onContacts: function () {
		        var o = this.getView().getModel("LocalDetails");
		        this.oRouter.navTo("contactDetail", {
		            customerID: this.customerID,
		            salesOrderNo: o.oData.SalesOrderNumber
		        });
		    },
		    hideShowTables: function () {
		        if (this.getView().getModel("serviceModel").getData().length !== 0) {
		            this.getView().byId("serviceItemsTable").setVisible(true);
		            if (this.getView().getModel("LocalOrderItems").getData().length === 0) {
		                this.getView().byId("SO_TAB_CON").setVisible(false);
		                this.getView().byId("itemsTable").setVisible(false);
		            } else {
		                this.getView().byId("SO_TAB_CON").setVisible(true);
		                this.getView().byId("itemsTable").setVisible(true);
		            }
		        } else {
		            this.getView().byId("SO_TAB_CON").setVisible(true);
		            this.getView().byId("itemsTable").setVisible(true);
		            this.getView().byId("serviceItemsTable").setVisible(false);
		        }
		    },
		    addFooterOptions: function () {
		        var t = this;
		        var o = {
		            oJamOptions: {
		                fGetShareSettings: function () {
		                    var O = new sap.m.ObjectListItem({
		                        title: t.byId("headerInfo").getTitle(),
		                        number: t.byId("headerInfo").getNumber(),
		                        numberUnit: t.byId("headerInfo").getNumberUnit(),
		                        firstStatus: new sap.m.ObjectStatus({
		                            text: t.byId("headerInfo").getStatuses()[0].getText(),
		                            state: t.byId("headerInfo").getStatuses()[0].getState()
		                        })
		                    });
		                    return {
		                        object: {
		                            id: window.location.href,
		                            display: O,
		                            share: t.byId("headerInfo").getTitle() + "\n" + t.byId("headerInfo").getNumber() + " " + t.byId("headerInfo").getNumberUnit() + "\n" + t.byId("headerInfo").getStatuses()[0].getText()
		                        }
		                    };
		                }
		            },
		            oAddBookmarkSettings: {
		                icon: "sap-icon:Fiori2/F0020",
		                title: this.getView().getModel("i18n").getProperty("SALES_ORDER_DETAIL")
		            },
		            onBack: this.fullScreenMode ? function () {
		                window.history.back(1);
		            } : void 0,
		            sI18NDetailTitle: "SALES_ORDER"
		        };
		        this.setHeaderFooterOptions(o);
		    },
		    refresh: function () {
		        var t = this;
		        var v = this.getView();
		        var i = v.byId("SO_TAB_CON");
		        i.setExpanded(true);
		        var m = v.getBindingContext().getPath();
		        var a = this.oApplicationFacade;
		        var M = v.getModel();
		        var d = 0;
		        var b = 1;
		        M.addBatchReadOperations([
		            M.createBatchOperation(m, "GET"),
		            M.createBatchOperation(m + "/OrderItems", "GET")
		        ]);
		        M.submitBatch(function (D) {
		            var c = new sap.ui.model.json.JSONModel();
		            c.setData(D.__batchResponses[d].data);
		            v.setModel(c, "LocalDetails");
		            var e = new sap.ui.model.json.JSONModel();
		            e.setData(D.__batchResponses[b].data.results);
		            var s = t.getItemCountsForFilter(e);
		            v.setModel(e, "LocalOrderItems");
		            v.byId("itemsTable").setShowSeparators("Inner");
		            v.byId("SO_TAB_CON").insertContent(v.byId("itemsTable"));
		            if (s !== 0) {
		                v.byId("serviceItemsTable").setVisible(true);
		                v.byId("serviceItemsTable").setHeaderText(a.getResourceBundle().getText("SO_SERV_ITM_ITMS", [s]));
		                if (e.getData().length === 0) {
		                    v.byId("SO_TAB_CON").setVisible(false);
		                    v.byId("itemsTable").setVisible(false);
		                } else {
		                    v.byId("SO_TAB_CON").setVisible(true);
		                    v.byId("itemsTable").setVisible(true);
		                }
		            } else {
		                v.byId("SO_TAB_CON").setVisible(true);
		                v.byId("itemsTable").setVisible(true);
		                v.byId("serviceItemsTable").setVisible(false);
		            }
		            t.handleItemFilterSelect();
		        });
		    },
		    getItemCountsForFilter: function (a) {
		        var s = new sap.ui.model.json.JSONModel();
		        var j = [];
		        var b = 0;
		        var c = new sap.ui.model.json.JSONModel();
		        c.setData({
		            openCount: 0,
		            inProcessCount: 0,
		            shippedCount: 0
		        });
		        var i;
		        for (i = 0; i < a.getData().length; i) {
		            if (a.oData[i].ItemClassification === "SERV") {
		                j.push(a.oData[i]);
		                b++;
		                s.setData(j);
		                a.oData.splice(i, 1);
		            } else {
		                if (a.oData[i].ItemStatusCode === "PR") {
		                    a.oData[i].shippedCount = 1;
		                    c.oData.shippedCount++;
		                } else if (a.oData[i].ItemStatusCode === "PS") {
		                    a.oData[i].inProcessCount = 1;
		                    c.oData.inProcessCount++;
		                } else if (a.oData[i].ItemStatusCode === "OP") {
		                    a.oData[i].openCount = 1;
		                    c.oData.openCount++;
		                } else if (a.oData[i].ItemStatusCode === "SH") {
		                    a.oData[i].shippedCount = 1;
		                    c.oData.shippedCount++;
		                } else if (a.oData[i].ItemStatusCode === "IP") {
		                    a.oData[i].inProcessCount = 1;
		                    c.oData.inProcessCount++;
		                }
		                i++;
		            }
		        }
		        s.oData.length = b;
		        c.oData.OrderItemsCount = a.getData().length;
		        this.getView().setModel(c, "ItemCountModel");
		        this.getView().setModel(s, "serviceModel");
		        return b;
		    },
		    // CHANGES BEGIN
		    onApprovePress: function(oEvent) {
		    	var nextStatus = this.getView().getModel("LocalDetails").getProperty("/UserStatusNext");
		    	var currentStatus = this.getView().getModel("LocalDetails").getProperty("/UserStatusCurrent");
		    	if ( currentStatus === "E0004" ) {
		    		sap.m.MessageBox.alert(this.getView().getModel("i18n").getProperty("ZSO_ERR_ORDER_REJECTED"));
		    		return;
		    	}
		    	if ( currentStatus === "E0023" ) {
		    		sap.m.MessageBox.alert(this.getView().getModel("i18n").getProperty("ZSO_ERR_ORDER_RELEASED"));
		    		return;
		    	}
		    	if ( !nextStatus || nextStatus == "" ) {
		    		sap.m.MessageBox.alert(this.getView().getModel("i18n").getProperty("ZSO_ERR_ORDER_NEXT_STATUS_NOT_DEFINED"));
		    		return;
		    	}
		    	
		    	var soNumber = oEvent.getSource().getParent().getBindingContext().getProperty("SalesOrderNumber");
		    	var that = this;
		    	var oUrlParameters = {
		    		SalesOrderNumber: soNumber
		    	};
		    	//this._oDataModel.remove(oEvent.getSource().getParent().getBindingContext().getPath());
		    	//this.oApplicationFacade.getODataModel().remove(oEvent.getSource().getParent().getBindingContext().getPath());
		    	this.getView().setBusy(true);
		    	this._oDataModel.callFunction("ApproveSalesOrder", {
		    		method: "POST",
		    		urlParameters: oUrlParameters,
		    		success: function (oData) {
		    			that.byId("objStatusApproval").setState("Success");
		    			that.byId("objStatusApproval").setText(this.getView().getModel("i18n").getProperty("ZSO_APPROVE_DONE"));
		    			that.refresh();	
		    			that.getView().setBusy(false);
		    		},
		    		error: function (oError) {
		    			that.getView().setBusy(false);
		    		}
		    	});
		    },
		    
		    onRejectPress: function(oEvent) {
		    	var nextStatus = this.getView().getModel("LocalDetails").getProperty("/UserStatusNext");
		    	var currentStatus = this.getView().getModel("LocalDetails").getProperty("/UserStatusCurrent");
		    	if ( currentStatus === "E0004" ) {
		    		sap.m.MessageBox.alert(this.getView().getModel("i18n").getProperty("ZSO_ERR_ORDER_REJECTED"));
		    		return;
		    	}
		    	if ( currentStatus === "E0023" ) {
		    		sap.m.MessageBox.alert(this.getView().getModel("i18n").getProperty("ZSO_ERR_ORDER_RELEASED"));
		    		return;
		    	}
		    	
		    	var soNumber = oEvent.getSource().getParent().getBindingContext().getProperty("SalesOrderNumber");
		    	var that = this;
		    	var oUrlParameters = {
		    		SalesOrderNumber: soNumber
		    	};
		    	//this._oDataModel.remove(oEvent.getSource().getParent().getBindingContext().getPath());
		    	//this.oApplicationFacade.getODataModel().remove(oEvent.getSource().getParent().getBindingContext().getPath());
		    	this.getView().setBusy(true);
		    	this._oDataModel.callFunction("RejectSalesOrder", {
		    		method: "POST",
		    		urlParameters: oUrlParameters,
		    		success: function (oData) {
		    			that.byId("objStatusApproval").setState("Success");
		    			that.byId("objStatusApproval").setText(this.getView().getModel("i18n").getProperty("ZSO_REJECT_DONE"));
		    			that.refresh();	
		    			that.getView().setBusy(false);
		    		},
		    		error: function (oError) {
		    			that.getView().setBusy(false);
		    		}
		    		
		    	});
		    }
		    // CHANGES END
	});
}());