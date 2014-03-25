<%@ taglib uri="/WEB-INF/iscTaglib.xml" prefix="isomorphic" %>

<%@ page import="com.isomorphic.base.Config" %>
<%@ page import="com.isomorphic.js.JSTranslater" %>
<%@ page import="com.isomorphic.datasource.DataSource" %>
<%@ page import="com.isomorphic.datasource.DataSourceManager" %>

<HTML><HEAD>
<STYLE>
.normal			{font-family:Verdana; font-size:12px;}
.pageHeader2	{font-family:Verdana; font-size:24px; font-weight:bold;}
</STYLE>
<TITLE>Result Viewer</TITLE>

</HEAD><BODY BGCOLOR='#DDDDDD' CLASS=normal>

<!-- load Isomorphic SmartClient -->
<isomorphic:loadISC modulesDir="system/development/" includeModules="RichTextEditor" skin="Enterprise"/>

<%
Config myConfig  = Config.getGlobal();
String batchRunDS   = myConfig.getString("autotest.batchRunDS");
String testResultDS = myConfig.getString("autotest.testResultDS");
String testUploadDS = myConfig.getString("autotest.testUploadDS");

if (batchRunDS   == null) batchRunDS   = "batchRun";
if (testResultDS == null) testResultDS = "testResult";
if (testUploadDS == null) testUploadDS = "testUpload";
%>

<SCRIPT>

// load the DataSources from Java using Config object, and emit them into the JS code stream
<%JSTranslater.get().toJSVariable(DataSourceManager.get(batchRunDS),   "batchRunDS",   out); %>
<%JSTranslater.get().toJSVariable(DataSourceManager.get(testResultDS), "testResultDS", out); %>
<%JSTranslater.get().toJSVariable(DataSourceManager.get(testUploadDS), "testUploadDS", out); %>

function logContainsHTML()    { return batchRunDS.fields["modifiedFiles"] != null; }
function supportsTestNumber() { return testResultDS.fields["testNumber" ] != null; }
function descriptionPresent() { return testResultDS.fields["description"] != null; }

// BranchesSelectItem is the branch selection picker
isc.defineClass("BranchesSelectItem", "SelectItem").addProperties({

// Toggle commented line below to switch behavior:
// - SelectItem.defaultToFirstOption:true picks branch with most recent commit
// - SelectItem.defaultValue allows you select a static default branch

//  defaultToFirstOption: true,
    defaultValue: "MAIN",
    valueField: "branch",

    pickListProperties: {
        sortField: "id",
        sortDirection: "descending",
        autoFitFieldWidths: true,
        autoFitWidthApproach: "both",
        datetimeFormatter: "toSerializeableDate"
    },

    pickListFields: [
        // fields from DataSource
        {name: "branch", autoFitWidth: true},
        {name: "id"},
        {name: "batchStartTime", autoFitWidth: true},
        {name: "user"},
        // derived stats fields
        {name: "nPassedFiles", title: "Passed Files"},
        {name: "nTotalFiles",  title: "Total Files" },
        {name: "nFixes",       title: "Fixes"       },
        {name: "nRegressions", title: "Regressions" }
    ],
    _testFields: [
        {name: "nPassedTests", title: "Passed Tests"},
        {name: "nTotalTests",  title: "Total Tests"}
    ],

    init : function () {
        if (testResultDS.fields["testNumber"] != null) {
            this.pickListFields.addListAt(this._testFields, 4);
        }
        this.Super("init", arguments);
        this.delayCall("initStats");
    },
    initStats : function () {
        var branch = this.getValue();
        if (branch != null) {
            var pickList = this.pickList;
            if (pickList && pickList.data && pickList.data.lengthIsKnown()) {
                this.changed(this.viewer, null, branch);  
                this.fetchStatistics();
                return;
            }
        }
        this.delayCall("initStats");
    },
    changed : function (form, item, value) {
        form.batchesGrid.load(value);
    },

    // if the branch is changed, wipe out the URL-targeted batch
    change : function (form, item, value, oldValue) {
        if (oldValue && oldValue != value) this.form.clearTargetBatch();
    },

    // load the stats for most recent batch for each branch
    fetchStatistics : function () {
        var pickList = this.pickList;
        for (var i = 0; i < pickList.getTotalRows(); i++) {
            var record = pickList.getRecord(i),
                context = { record: record, viewer: this.viewer };
                this.optionDataSource.fetchData({
                    id: record.id, branch: record.branch
                }, this.fetchStatisticsReply, {
                    clientContext: context, 
                    operationId: "fetchPredecessor"
                });
        }
    },
    fetchStatisticsReply : function(dsResponse, data, dsRequest) {
        var context = dsRequest.clientContext,
            viewer  = context.viewer,
            record1 = context.record || {},
            record2 = data[0]        || {};

        var time1 = record1.batchStartTime,
            time2 = record2.batchStartTime;

        viewer.fetchFileResults(time1, time2 ? time2 : time1, 
                                record1, viewer.branchSelector);
    },
    installStats : function () {
        this.pickList.markForRedraw();
    }

});

// BatchesGrid shows all the batches for the selected branch
isc.defineClass("BatchesGrid", "ListGrid").addProperties({

    sortField: "batchStartTime",
    sortDirection: "descending",

    canDragResize: true,
    autoFitFieldWidths: true,
    autoFitWidthApproach: "both",
    autoFitClipFields: [],

    autoFetchData: false,
    showFilterEditor: true,
    datetimeFormatter: "toSerializeableDate",

    fields: [{name: "id"},
             {name: "batchStartTime"},
             {name: "batchEndTime"},
             {name: "user"}],

    initWidget : function () {
        var fieldName = logContainsHTML() ? "modifiedFiles" : "log";
        this.fields.add({name: fieldName});
        this.autoFitClipFields.add(fieldName);
        this.autoFitExpandField = fieldName;
        this.Super("initWidget", arguments);
    },

    // selection changes trigger recomputation of fixes/regression statistics
    updateFirstRecord : function (selection) {
        if (selection.length < 1 && this.firstRecord != null) {
            var viewer = this.viewer;
            this.firstRecord = null;
            viewer.logArea.clearValue();
            viewer.fileGrid.setData([]);
            return true;
        }
        if (selection.length > 0 && selection[0] != this.firstRecord) {
            var record = this.firstRecord = selection[0],
                viewer = this.viewer;
            viewer.logArea.setValue(record.log);
            viewer.fileGrid.loadBatch(record.batchStartTime);
            return true;
        }
        return false;
    },
    updateSecondRecord : function (selection) {
        if (selection.length < 2 && this.secondRecord != null) {
            this.secondRecord = null;
            return true;
        }
        if (selection.length > 1 && selection[1] != this.secondRecord) {
            this.secondRecord = selection[1];
            return true;
        }
        return false;
    },
    selectionChanged : function (record, state) {
        var selection = this.getSelection() || [];

        // countermand attempt to select more than 2 records
        if (selection.length > 2 && state) {
            this.deselectRecord(record);
        }
        var firstUpdated  = this.updateFirstRecord(selection),
            secondUpdated = this.updateSecondRecord(selection);

        // update the statistics to deal with the changed batch selection
        if (firstUpdated || secondUpdated) {

            var time1 = this.firstRecord  ? this.firstRecord.batchStartTime  : null,
                time2 = this.secondRecord ? this.secondRecord.batchStartTime : null;

            if (time1 != null) {
                if (time2 == null) {
                    var index = this.getRecordIndex(this.firstRecord),
                        predecessor = index >= 0 ? this.getRecord(index + 1) : null;
                    if (predecessor != null) time2 = predecessor.batchStartTime;
                }
                var record = isc.shallowClone(this.firstRecord),
                    viewer = this.viewer;
                viewer.fetchFileResults(time1, time2 ? time2 : time1, 
                                        record, viewer.statsGrid);
            }
        }
    },

    // select the batch requested by user via URL parameters
    findTargetBatch : function (targetRow) {

        if (!isc.AutoTest.isGridDone(this) || 
            targetRow && Array.isLoading(this.getRecord(targetRow)))
        {
            return this.delayCall("findTargetBatch", [targetRow], 500);
        }

        var grid = this,
            batchStartTime = new Date(parseInt(this.targetBatch)),
            record = this.find(isc.DataSource.convertCriteria({
                batchStartTime: batchStartTime
            }));

        // if the row has already been loaded, go to it now and select it
        if (record != null) {
            var index = this.getRecordIndex(record);
            this.scrollToRow(index);
            this.selectRecord(index);
            return;
        }

        // don't keep fetching in the event of an error
        if (targetRow != null) return;

        var grid = this,
            dataSource = this.dataSource,
            branch = this.viewer.getBranch();

        // since target row not found find it and scroll to it
        dataSource.performCustomOperation("getTargetBatchOffset", {
            branch: branch, batchStartTime: batchStartTime
        }, function(dsResponse, data, dsRequest) {
            if (isc.isAn.Array(data)) data = data[0];
            if (isc.isAn.Object(data)) {
                grid.scrollToRow(data.offset);
                grid.delayCall("findTargetBatch", [data.offset], 500);
            }
        });
    },

    // install initial per-branch view
    load : function (branch) {
        var grid = this,
            viewer = this.viewer;
        this.firstRecord = null;
        this.secondRecord = null;
        this.fetchData({branch: branch}, this.targetBatch != null ? 
                      function () { grid.findTargetBatch(); } : null);
        viewer.logArea.clearValue();
        viewer.statsGrid.setData([]);
        viewer.fileGrid.setData([]);
    }

});

// BatchStatsGrid shows the fixes/regressions for selected pair of batches
isc.defineClass("BatchStatsGrid", "ListGrid").addProperties({

    autoFitFieldWidths: true,
    autoFitWidthApproach: "both",

    autoFetchData: false,
    datetimeFormatter: "toSerializeableDate",

    fields: [
        // fields from DataSource
        {name: "id"},
        {name: "batchStartTime"}, 
        {name: "batchEndTime"}, 
        {name: "user"},
        // derived stats fields
        {name: "nPassedFiles", title: "Passed Files" },
        {name: "nTotalFiles",  title: "Total Files"  },
        {name: "nFixes",       title: "Fixes"        },
        {name: "nRegressions", title: "Regressions"  }
    ],
    _testFields: [
        {name: "nPassedTests", title: "Passed Tests"},
        {name: "nTotalTests",  title: "Total Tests"}
    ],

    hilites:
    [{fieldName: "nPassedTests", criteria: {}, textColor: "green"},
     {fieldName: "nPassedFiles", criteria: {}, textColor: "green"},
     {fieldName: "nFixes",       criteria: {}, textColor: "green"},
     {fieldName: "nRegressions", criteria: {}, textColor: "red"  }],

    initWidget : function () {
        if (testResultDS.fields["testNumber"] != null) {
            this.fields.addListAt(this._testFields, 4);
        }
        this.Super("initWidget", arguments);
    },

    installStats : function (record) {
        this.setData([record]);
    }

});

// LogAreaCanvasItem provides special handling for HTML-based log mesasges
isc.defineClass("LogAreaCanvasItem", "CanvasItem").addProperties({

    canvasConstructor: "RichTextCanvas",
    canvasProperties: { overflow: "auto", width: "*" },
    
    clearValue : function () { this.canvas.setContents(""); },

    setValue : function (value) {
        // wrap plain text in protective <pre> tags
        if (isc.isA.String(value) && !value.match(/^\s*<html>/i)) {
            value = "<pre>" + value + "</pre>";
        }
        this.canvas.setContents(value); 
    }

});

// TestFileGrid shows all the files associated with first selected batch
isc.defineClass("TestFileGrid", "ListGrid").addProperties({

    autoFitFieldWidths: true,
    autoFitWidthApproach: "both",
    autoFitExpandField: "details",
    autoFitClipFields: ["details", "description"],

    canDragResize: true,
    autoFetchData: false,
    showFilterEditor: true,
    datetimeFormatter: "toSerializeableDate",

    useAllDataSourceFields: true,
    fields: [{name: "branch",         showIf: "false"},
             {name: "batchStartTime", showIf: "false"}],

    hilites:
    [{criteria: {result: "success"}, textColor: "green" },
     {criteria: {result: "timeout"}, textColor: "orange"},
     {criteria: {result: "failure"}, textColor: "red"}],

    loadBatch : function (batchStartTime) {
        var showcase = this.targetShowcase,
            hidePass = this.targetHidePass,
            batchStartTime = isc.Date.parseInput(batchStartTime);

        var advancedCriteria = {
            _constructor:"AdvancedCriteria",
            operator:"and",
            criteria:[
                {fieldName: "batchStartTime", operator:"equals", value: batchStartTime}
            ]
        };
        var criteria = advancedCriteria.criteria;
        if (hidePass) {
            criteria.add({fieldName:"result", operator:"notEqual", value:"success"});
        }
        if (showcase) {
            var operator = showcase == "dotTest" ? "isNull" : "equals";            
            criteria.add({fieldName: "showcase", operator: operator, value: showcase});
        }
        this.fetchData(advancedCriteria);
    }

});

// FileUploadForm allows a server path and file to upload be seelcted
isc.defineClass("FileUploadForm", "DynamicForm").addProperties({

    numCols: 5,
    colWidths: [80, 40, 80, 40, 80],
    autoDraw: false,

    items: [
        // choose the file to be uploaded
        {
            name: "file",
            title: "Test File to Upload",
            wrapTitle: false,
            height: 40,
            width: 250,
            colSpan: 4
        },
        // choose the server path for upload
        {
            name: "serverPath",
            title: "Server Path",
            titleAlign: "left",
            type: "text",
            width: 250,
            colSpan: 4
        }
    ],

    addButtonItem : function (properties, addSpacer) {
        this.addItem(isc.addProperties(properties, {
            name: properties.title.toLowerCase(),
            editorType: "ButtonItem",
            validateOnExit: true,
            vAlign: "center",
            startRow: false,
            endRow: false,
            width: 60,
            colSpan: 1
        }));
        if (addSpacer) this.addItem({
            editorType: "StaticTextItem",
            showTitle: false,
            height: 40
        });
    },
    initWidget : function () {
        this.Super("initWidget", arguments);
        this.file = this.getItem("file");
        this.path = this.getItem("serverPath");
        // add cancel, clear, upload buttons
        this.addButtonItem({
            title: "Cancel",
            click : function(form) { 
                form.dialog.closeClick();
            }
        }, true);
        this.addButtonItem({
            title: "Clear",
            click: function(form) { 
                form.file.clearValue(); 
                form.path.clearValue();
            }
        }, true);
        this.addButtonItem({
            title: "Upload",
            click: function(form) { 
                form.saveData(form.callback, {callingForm: form});
            }
        });
    },

    callback : function (dsResponse, data, dsRequest) {
        var status = dsResponse.status;
        if (status >= 0) {
            var form = dsRequest.callingForm;
            form.dialog.closeClick();
            isc.say("Saved Successfully");
        }
        else isc.warn("Error " + status + " received while saving");
    }

});

// FileUploadDialog simply wraps FileUploadForm
isc.defineClass("FileUploadDialog", "Dialog").addProperties({

    title: "Upload Selenium RC Test File to Server",

    isModal: true,
    autoSize:  true,
    autoCenter: true,
    showModalMask: true,
    canDragReposition: true,

    initWidget : function () {
        this.Super("initWidget", arguments);
        var form = isc.FileUploadForm.create({dataSource: testUploadDS});
        form.dialog = this;
        this.addItem(form);
    }

});
                    
// ResultViewer is the main class containing all sections
isc.defineClass("ResultViewer", isc.DynamicForm).addProperties({

    numCols: 2,
    colWidths: [supportsTestNumber() ? "75%" : "50%", "*"],

    fields: [
        // branch selector
        { 
            name: "branchSelector", 
            optionDataSource: batchRunDS,
            editorType: "BranchesSelectItem", 
            optionOperationId: "branches",
            titleOrientation: "top", 
            title: "Selected Branch to View",
            width: "100%"
        },
        // add file upload controls
        { 
            name: "addNewTest",
            editorType: "ButtonItem",
            title: "Add New Test",
            click: function () { isc.FileUploadDialog.create(); },
            startRow: false,
            align: "right",
            height: 30,
            width: 100,
            colSpan: 1
        },

        // list of batches for the selected branch
        { 
            name: "batchesHeader",
            editorType: "SectionItem",
            itemIds: ["batchesGrid"],
            defaultValue: "Batches for the Selected Branch",
            showTitle: false,
            colSpan: 2
        },
        { 
            name: "batchesGrid",
            editorType: "CanvasItem",
            canvasProperties: { dataSource: batchRunDS },
            canvasConstructor: "BatchesGrid",
            showTitle: false,
            height: "*",
            colSpan: 2
        },

        // stats for the selected batch(es)
        { 
            name: "batchStatsHeader",
            editorType: "SectionItem",
            itemIds: ["batchStatsGrid"],
            defaultValue: "Stats for the Selected Batch(es)",
            canCollapse: false,
            showTitle: false,
            colSpan: 2
        },
        { 
            name: "batchStatsGrid",
            editorType: "CanvasItem",
            canvasConstructor: "BatchStatsGrid",
            canvasProperties: { autoFitData: "vertical", dataSource: batchRunDS },
            showTitle: false,
            height: 60,
            colSpan: 2
        },

        // log message for the selected batch
        { 
            name: "batchLogHeader",
            editorType: "SectionItem",
            itemIds: ["batchLogArea"],
            defaultValue: "Log Message for the Selected Batch",
            showTitle: false,
            colSpan: 2

        },
        { 
            name: "batchLogArea",
            editorType: logContainsHTML() ? "LogAreaCanvasItem" : "TextAreaItem",
            showTitle: false,
            canEdit: false,
            colSpan: 2,
            width: "100%",
            height: "*"
        },

        // list of files for the selected batch
        { 
            name: "testFileHeader",
            editorType: "SectionItem",
            itemIds: ["testFileSection"],
            defaultValue: "Test Results for the Selected Batch",
            sectionExpanded: false,
            showTitle: false,
            colSpan: 2
        },
        { 
            name: "testFileSection",
            editorType: "CanvasItem",
            canvasConstructor: "TestFileGrid",
            canvasProperties: { dataSource: testResultDS },
            showTitle: false,
            colSpan: 2,
            height: "*"
        }

    ],

    getItem : function (itemName) {
        var item = this.Super("getItem", arguments);
        if (item != null) item.viewer = this;
        return item;
    },
    getCanvas : function (itemName) {
        var item = this.Super("getItem", arguments);
        if (item == null) return;

        var canvas = item.canvas;
        if (canvas != null) canvas.viewer = this;
        return canvas;
    },

    clearTargetBatch : function () {
        delete this.batchesGrid.targetBatch;
    },

    initWidget : function () {
        this.Super("initWidget", arguments);
        this.branchSelector = this.getItem("branchSelector");
        this.batchesGrid    = this.getCanvas("batchesGrid");
        this.statsGrid      = this.getCanvas("batchStatsGrid");
        this.logArea        = this.getItem("batchLogArea");
        this.fileGrid       = this.getCanvas("testFileSection");

        // allow a specific branch, batch, and showcase to be specified at launch
        var target = this.target;
        if (target) {
            this.branchSelector.setValue(target.branch);
            this.batchesGrid.targetBatch = target.batch;
            this.fileGrid.targetShowcase = target.showcase;
            this.fileGrid.targetHidePass = target.hidePass;
            this.getItem("testFileHeader").expandSection();
            this.getItem("batchLogHeader").collapseSection();
        }
    },

    // fetch the raw data needed to compute fixes/regressions
    fetchFileResults : function(batch1StartTime, batch2StartTime, 
                                targetRecord, targetWidget) 
    {
        var context = { 
            count: 0,
            viewer: this,
            record: targetRecord, 
            widget: targetWidget
        };
        this.testResultDS.fetchData({batchStartTime: batch1StartTime},
                                    this.fileResultsReply,
                                    {clientContext: {context: context, batch: "one"},
                                     operationId: "fetchFileResults"});
        this.testResultDS.fetchData({batchStartTime: batch2StartTime},
                                    this.fileResultsReply,
                                    {clientContext: {context: context, batch: "two"},
                                     operationId: "fetchFileResults"});
    },
    fileResultsReply : function(dsResponse, data, dsRequest) {
        var clientContext = dsRequest.clientContext,
            context       = clientContext.context,
            viewer        = context.viewer;

        context[clientContext.batch] = data;
        if (++context.count >= 2) {
            viewer.computeStatistics(context);
        }
    },

    // algorithms to compute fixes/regressions
    buildObjectFromFileStats : function(batchRun) {
        // create a map with all testFiles marked as initially passing
        var passedFiles = {}, 
            nPassedFiles = 0, nTotalFiles = 0;
        for (var i = 0; i < batchRun.length; i++) {
            var record = batchRun[i],
                testFile = record.testFile;
            if (passedFiles[testFile] == null) {
                passedFiles[testFile] = true;
                nPassedFiles++; nTotalFiles++;
            }
        }
        // now, sweep through all <testFile, testNumber, result> tuples
        var results = {}, 
            nPassedTests = 0, nTotalTests = 0;
        for (var i = 0; i < batchRun.length; i++) {
            var record = batchRun[i],
                testFile = record.testFile,
                testNumber = record.testNumber || 1;
            // create a binding for the <testFile, testNumber>
            results[testFile + "_" + testNumber] = record.result;
            // record the success or failure of the <testFile, testNumber>
            if (record.result == "success") nPassedTests++;
            else if (passedFiles[testFile]) {
                passedFiles[testFile] = false;
                nPassedFiles--;
            }                
            nTotalTests++;
        }
        return {results: results, 
                nPassedTests: nPassedTests, nTotalTests: nTotalTests,
                nPassedFiles: nPassedFiles, nTotalFiles: nTotalFiles};
    },

    computeStatistics : function(computationContext) {
        var target = computationContext.record,
            widget = computationContext.widget,
            batchOne = computationContext.one,
            batchTwo = computationContext.two;

        var nFixes = 0, nRegressions = 0, nNewFailures = 0;

        var mapOne = this.buildObjectFromFileStats(batchOne),
            mapTwo = this.buildObjectFromFileStats(batchTwo);

        // install intra-batch stats for current batch
        target.nTotalTests  = mapOne.nTotalTests;
        target.nPassedTests = mapOne.nPassedTests
        target.nTotalFiles  = mapOne.nTotalFiles;
        target.nPassedFiles = mapOne.nPassedFiles

        var firstResults = mapOne.results,
            secondResults = mapTwo.results;

        for (var i = 0; i < batchOne.length; i++) {
            var record = batchOne[i],
                testFile = record.testFile,
                testNumber = record.testNumber || 1;

            first = testFile + "_" + testNumber;
            var firstResult = firstResults[first];
            if (!firstResult) continue;

            var secondResult = secondResults[first];
            if (secondResult) {
                // normal case; both old and new test results exist
                if      (firstResult == "success" && secondResult != "success") nFixes++;
                else if (firstResult != "success" && secondResult == "success") nRegressions++;
            } else {
                // special case; detect initial run failure of new test
                if (firstResult != "success") {
                    var secondRootResult = secondResults[testFile + "_1"];
                    if (secondRootResult != "timeout") nNewFailures++;
                }
            }
        }

        // indicate new failures as a separate total for clarity
        if (nNewFailures > 0) nRegressions += "+" + nNewFailures;

        // finally, install inter-batch stats and update widget
        target.nFixes       = nFixes;
        target.nRegressions = nRegressions;
        widget.installStats(target);
    },

    getBranch : function () {
        return this.branchSelector.getValue();
    }

});

// capability to launch into a view specified via URL parameters

function getURLParameter(name) {
    var match = location.href.match(new RegExp("[?&](?:" + name + ")=([^&#]*)"));
    return match && match.length > 1 ? match[1] : null;
};

var target = {
    branch:   getURLParameter("branch"),
    batch:    getURLParameter("batch"),
    showcase: getURLParameter("showcase"),
    hidePass: getURLParameter("hidePass")
};

// create the viewer

isc.ResultViewer.create({
    batchRunDS: batchRunDS,
    testResultDS: testResultDS,
    target: target.branch ? target : null,
    width: "100%", 
    height: "100%" 
});

</SCRIPT>
</BODY>
</HTML>
