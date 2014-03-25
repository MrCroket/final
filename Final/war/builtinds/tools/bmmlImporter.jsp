<%@ taglib uri="/WEB-INF/iscTaglib.xml" prefix="isomorphic"

%><%@ page contentType="text/html;charset=UTF-8"

%><%@ page import="com.isomorphic.base.Config"
%><%@ page import="com.isomorphic.base.ISCInit"

%><%@ page import="java.util.HashSet"
%><%@ page import="java.util.Set"

%><%!
    static {
        ISCInit.go();
    }

    private Config baseConfig;
    private boolean allowAnyRPC = false;
    private final Set enabledBuiltinMethods = new HashSet();
    private boolean useIDACall = false;

    private final boolean isBuiltinMethodEnabled(String methodName) {
        return (allowAnyRPC || enabledBuiltinMethods.contains(methodName));
    }

%><%!

    {
        baseConfig = Config.getGlobal();

        enabledBuiltinMethods.addAll(baseConfig.getList("RPCManager.enabledBuiltinMethods"));
        allowAnyRPC = enabledBuiltinMethods.contains("*");
    }

%><%
useIDACall = (// Use IDACall if the server is explicitly configured to use it rather than bmmlImporterOperations.jsp.
              baseConfig.getBoolean("BMMLImporter.useIDACall", false) ||
              // Also use IDACall if bmmlImporterOperations.jsp does not exist.
              application.getResource("/tools/bmmlImporterOperations.jsp") == null);
%><html>
<head>
<title>Standalone Balsamiq Mockup Tool</title>

</head>
<body>
<%
String skin = request.getParameter("skin");
if (skin == null || "".equals(skin.trim())) skin = "Enterprise";
%>

<isomorphic:loadISC skin="<%=skin%>" modulesDir="system/development/" includeModules="Drawing,Charts,Analytics,FileLoader,FileBrowser,DocViewer,VisualBuilder" />
<script>
<isomorphic:loadSystemSchema/>

var useIDACall = <%= useIDACall %>,
    saveFileBuiltinIsEnabled = <%= isBuiltinMethodEnabled("saveFile") %>,
    loadFileBuiltinIsEnabled = <%= isBuiltinMethodEnabled("loadFile") %>;

if (!useIDACall) {
    RPCManager.actionURL = Page.getAppDir() + "bmmlImporterOperations.jsp";
}

var checkForChangesTmrID = null;

var importDialog, mockupLayout;
(function createBMMLImportDialog(dialogProperties) {
    dialogProperties = dialogProperties || {};

    isc.addProperties(dialogProperties, {
        showFileNameField: !useIDACall || loadFileBuiltinIsEnabled,
        showAssetsNameField: !useIDACall || saveFileBuiltinIsEnabled,
        showOutputField: !useIDACall || saveFileBuiltinIsEnabled,
        skin: isc.params.skin || "Enterprise"
    });

    dialogProperties.submit = function (filePath, outputFileName, fileContent, skin, dropMarkup,
            trimSpace, fillSpace, fieldNamingConvention, autoRefresh, fileUploaded, artificial)
    {
        // what file to convert
        var mockupParam = filePath;
        // output file to determine js or xml and file name
        var outputFileParam = outputFileName;
        var dropMarkupParam = dropMarkup ? "yes" : "no";
        var trimSpaceParam = trimSpace ? "yes" : "no";
        var fillSpaceParam = fillSpace ? "yes" : "no";
        var autoRefreshParam = String(autoRefresh);
        var fieldNamingConventionParam = fieldNamingConvention;
        var mockupUploadedParam = "yes";

        if (!artificial && !fileContent) {
            var workBuilder = isc.URIBuilder.create(isc.Page.getAppDir());
            workBuilder.appendPath("bmmlImporter.jsp");
            workBuilder.setQueryParam("mockup", mockupParam);
            if (outputFileParam) {
                workBuilder.setQueryParam("outputFile", outputFileParam);
            }
            if (skin) {
                workBuilder.setQueryParam("skin", skin);
            }
            if (fieldNamingConvention) {
                workBuilder.setQueryParam("fieldNamingConvention", fieldNamingConventionParam);
            }
            if (!dropMarkup) {
                workBuilder.setQueryParam("dropMarkup", "no");
            }
            if (!trimSpace) {
                workBuilder.setQueryParam("trimSpace", "no");
            }
            if (!fillSpace) {
                workBuilder.setQueryParam("fillSpace", "no");
            }
            if (autoRefresh != null) {
                workBuilder.setQueryParam("autoRefresh", autoRefreshParam);
            }
            if (fileUploaded) {
                workBuilder.setQueryParam("mockupUploaded", "yes");
            }
            window.location = workBuilder.uri;
            return;
        }

        var mockupUrl = mockupParam;
        if (mockupUrl.startsWith("http://") || mockupUrl.startsWith("https://")) {
            mockupParam = null;
            mockupUrl = mockupUrl.replaceAll(" ", "%20");
        } else {
            mockupUrl = null;
        }
        var bmmlImporter = isc.BMMLImporter.create({
            dropMarkup: dropMarkupParam != "no",
            trimSpace:  trimSpaceParam != "no",
            fillSpace:  fillSpaceParam != "no",
            mockupPath: mockupParam,
            fieldNamingConvention: fieldNamingConventionParam
        });
        var toolTitle = isc.Label.create({
            contents: "Balsamiq Importer",
            autoDraw: false
        });
        var autoRefreshDefaultValue = true;
        if (autoRefreshParam == "false") {
            autoRefreshDefaultValue = false;
        }
        var refreshCheckbox = isc.DynamicForm.create({
            ID: "refreshCheckbox",
            autoDraw: false,
            fields: [
                {name: "refresh", type: "checkbox", title: "Refresh automatically", defaultValue: autoRefreshDefaultValue,
                    changed : function (form, item, value) {
                        if (value && form.changeAction) {
                            form.changeAction();
                        }
                    }
                }
            ]
        });
        var refreshItem = refreshCheckbox.getItem("refresh");
        var downloadButton = isc.ToolStripButton.create({
            ID: "downloadButton",    
            title: "Download Source",
            icon: "[SKIN]actions/download.png",
            autoDraw: false,
            click : function () {
                isc.DMI.callBuiltin({
                    methodName: "downloadClientContent",
                    arguments: [ tools.xml, tools.xmlFileName, "text/xml" ],
                    requestParams: {
                        showPrompt:false,
                        useXmlHttpRequest: false,
                        timeout: 0
                    }
                 });
            }
        });
        var showButton = isc.ToolStripButton.create({
            ID: "showButton",    
            title: "Show Source",
            icon: "[SKIN]actions/view.png",
            autoDraw: false,
            _showingSource: false,
            click : function () {
                var taForm = isc.DynamicForm.create({
                    width: "100%",
                    height: "100%",
                    numCols: 1,
                    fields: [ {
                        name: "content",
                        type:"textArea", 
                        height: "100%", 
                        width: "*",
                        showTitle: false,
                        value: tools.xml} ]
                });
                var _this = this;
                this._showingSource = true;
                var wnd = isc.Window.create({
                    title: "Content",
                    height: "85%",
                    width: "85%",
                    autoCenter: true,
                    items: [taForm],
                    closeClick : function () {
                        _this._showingSource = false;
                        return this.Super("closeClick", arguments);
                    }
                });
                wnd.show();
                taForm.getItem("content").delayCall("selectValue", [], 100);
            }
        });
        var settingsButton = isc.ToolStripButton.create({
            ID: "settingsButton",
            title: "Settings..",
            icon: "[SKIN]/actions/configure.png",
            autoDraw: false,
            click : function () {
                if (importDialog) importDialog.destroy();
                importDialog = createBMMLImportDialog({
                    showSkinSelector: false,
                    fileUrl: mockupUrl,
                    fileName: mockupParam,
                    outputFileName: outputFileParam,
                    skin: skin,
                    dropMarkup: dropMarkupParam != "no",
                    trimSpace: trimSpaceParam != "no",
                    fillSpace: fillSpaceParam != "no",
                    fieldNamingConvention: fieldNamingConventionParam,
                    autoRefresh: autoRefreshParam != "false",
                    _fileUploaded: mockupUploadedParam == "yes"
                });
            }
        });
        var toolStripMembers = [ toolTitle, settingsButton, downloadButton, showButton ];
        if (saveFileBuiltinIsEnabled) {
            toolStripMembers.push(refreshCheckbox);
        }
        var tools = isc.ToolStrip.create({
            width: "100%", height:24,
            layoutLeftMargin: 10,
            members: toolStripMembers,
            autoDraw: false
        });
        var canvas = isc.Canvas.create({
            overflow: "auto",
            autoDraw: false
        });
        if (mockupLayout) {
            mockupLayout.destroy();
        }
        mockupLayout = isc.VLayout.create({
            width: "100%",
            height: "100%",
            members: [tools, canvas]
        });

        isc.Label.create({
            ID: "errLabel",
            width: 400,
            height: 20,
            top: 25,
            padding: 10,
            opacity: 0,
            contents: "<font color='red'>Can't auto-refresh mockup</font>" 
        });

        if (mockupUrl) {
            isc.RPCManager.sendProxied({
                actionURL: mockupUrl,
                callback: function (resp) {
                    refreshItem.enable();
                    refreshItem.show();

                    var lastChangeDate = resp.httpHeaders["Last-Modified"];
                    if (mockupUrl.endsWith("/")) {
                        mockupUrl = mockupUrl.substring(0, url.length - 1);
                    }
                    var tmp = decodeURI(mockupUrl.replace(/\+|%20/g, " "));
                    var fileName = tmp.substring(tmp.lastIndexOf("/") + 1);
                    fileName = fileName.replace(/[^- _.,$0-9A-Za-z]/g, "");
                    var contents = resp.data;

                    var checkForChanges = function () {
                        if (!refreshItem.disabled && refreshItem.getValue() && !showButton._showingSource) {
                            isc.RPCManager.sendProxied({
                                actionURL: mockupUrl,
                                callback: function (resp) {
                                    if (resp.status == 0) {
                                        var dataLastChangeDate = resp.httpHeaders["Last-Modified"];
                                        var changed = false;
                                        if (lastChangeDate && dataLastChangeDate) {
                                            changed = lastChangeDate != dataLastChangeDate;
                                        } else {
                                            changed = contents != resp.data;
                                        }
                                        if (changed) {
                                            var href = window.location.href;
                                            if (href.contains("autoRefresh=false")) {
                                                href = href.replace("autoRefresh=false", "autoRefresh=true");
                                                window.location.replace(href);
                                            } else {
                                                window.location.reload();
                                            }
                                        }
                                    } else {
                                        errLabel.bringToFront();
                                        errLabel.animateFade(100);
                                        isc.Timer.setTimeout(function () {
                                            errLabel.animateFade(0);
                                        }, 5000);
                                    }
                                }
                            });
                        }
                    };

                    var checkForChangesScheduler = function () {
                        checkForChanges();
                        if (checkForChangesTmrID != null) isc.Timer.clearTimeout(checkForChangesTmrID);
                        checkForChangesTmrID = isc.Timer.setTimeout(checkForChangesScheduler, 10000);
                    };
                    if (checkForChangesTmrID != null) isc.Timer.clearTimeout(checkForChangesTmrID);
                    checkForChangesTmrID = isc.Timer.setTimeout(checkForChangesScheduler, 10000);

                    refreshCheckbox.changeAction = function () {
                        if (checkForChangesTmrID != null) {
                            isc.Timer.clearTimeout(checkForChangesTmrID);
                            checkForChangesTmrID = null;
                        }
                        checkForChangesScheduler();
                    };

                    // convert bmml to smartclient
                    bmmlImporter.bmmlToXml(contents, function (xmlContent, layout) {
                        if (xmlContent == null) {
                            window.location = "bmmlImporter.jsp";
                            return;
                        }
                        tools.xml = xmlContent;
                        var onScriptEvaluated = function () {
                            for (var i = 0; i < layout.length; i++) {
                                var widget = layout[i];
                                if (widget._constructor != "ValuesManager" &&
                                    widget._constructor != "MockDataSource" &&
                                    window[widget.ID].parentElement == null) {
                                    canvas.addChild(window[widget.ID]);
                                }
                            }
                        }

                        var ind = fileName.lastIndexOf(".");
                        var mockupFilePrefix = null;
                        if (ind > 0) {
                            mockupFilePrefix = fileName.substring(0, ind);
                        }
                        tools.xmlFileName = mockupFilePrefix + ".xml";

                        if (outputFileParam) {
                            if (outputFileParam.substr(outputFileParam.length - 4) == ".xml") {
                                var path = outputFileParam;
                                if (!path.startsWith("/")) path = "tools/" + path;
                                if (saveFileBuiltinIsEnabled) {
                                    isc.DMI.callBuiltin({
                                        methodName: "saveFile",
                                        arguments: [path, xmlContent]
                                    });
                                }
                                tools.xmlFileName = outputFileParam;
                            } else {
                                ind = outputFileParam.lastIndexOf(".");
                                if (ind > 0) {
                                    tools.xmlFileName = outputFileParam.substring(0, ind);
                                } else {
                                    tools.xmlFileName = outputFileParam;
                                }
                                tools.xmlFileName += ".xml";
                            }
                            isc.DMI.callBuiltin({
                                methodName: "xmlToJS",
                                arguments: xmlContent,
                                callback : function (rpcResponse) {
                                    if (!outputFileParam ||
                                        outputFileParam.substr(outputFileParam.length - 3) == ".js") {
                                        var path = outputFileParam;
                                        if (!path.startsWith("/")) path = "tools/" + path;
                                        if (saveFileBuiltinIsEnabled) {
                                            isc.DMI.callBuiltin({
                                                methodName: "saveFile",
                                                arguments: [
                                                    path,
                                                    rpcResponse.data
                                                ]
                                            });
                                        }
                                    }
                                    isc.Class.evaluate(rpcResponse.data);
                                    onScriptEvaluated();
                                } 
                            });
                        } else {
                            if (saveFileBuiltinIsEnabled) {
                                isc.DMI.callBuiltin({
                                    methodName: "saveFile",
                                    arguments: ["tools/" + mockupFilePrefix + ".xml", xmlContent]
                                });
                            }
                            isc.DMI.callBuiltin({
                                methodName: "xmlToJS",
                                arguments: xmlContent,
                                callback : function (rpcResponse) {
                                    if (saveFileBuiltinIsEnabled) {
                                        isc.DMI.callBuiltin({
                                            methodName: "saveFile",
                                            arguments: [
                                                "tools/" + mockupFilePrefix + ".js",
                                                rpcResponse.data
                                            ]
                                        });
                                    }
                                    isc.Class.evaluate(rpcResponse.data);
                                    onScriptEvaluated();
                                }
                            });
                        }
                    });
                }
            });
        } else {
            var processContents = function processContents(contents, path) {
                if (saveFileBuiltinIsEnabled) {
                    var ds = isc.DataSource.get("SCUploadSaveFile");

                    var lastChangeDate = null;
                    ds.fetchData({path: path}, function(dsResponse, data){
                        lastChangeDate = data.lastChangeDate;
                    });

                    var checkForChanges = function () {
                        if (!refreshItem.disabled && refreshItem.getValue() && !showButton._showingSource) {
                            ds.fetchData({path: path}, function(dsResponse, data) {
                                if (dsResponse.status == 0) {
                                    if (lastChangeDate != data.lastChangeDate) {
                                        window.location.reload()
                                    }
                                } else {
                                    errLabel.bringToFront();
                                    errLabel.animateFade(100);
                                    isc.Timer.setTimeout(function () {
                                        errLabel.animateFade(0);
                                    }, 5000);
                                }
                            }, {willHandleError: true});
                        }
                    };

                    var checkForChangesScheduler = function () {
                        checkForChanges();
                        if (checkForChangesTmrID != null) isc.Timer.clearTimeout(checkForChangesTmrID);
                        checkForChangesTmrID = isc.Timer.setTimeout(checkForChangesScheduler, 10000);
                    };
                    if (checkForChangesTmrID != null) isc.Timer.clearTimeout(checkForChangesTmrID);
                    checkForChangesTmrID = isc.Timer.setTimeout(checkForChangesScheduler, 10000);

                    refreshCheckbox.changeAction = function () {
                        if (checkForChangesTmrID != null) {
                            isc.Timer.clearTimeout(checkForChangesTmrID);
                            checkForChangesTmrID = null;
                        }
                        checkForChangesScheduler();
                    };
                }

                // convert bmml to smartclient
                bmmlImporter.bmmlToXml(contents, function (xmlContent, layout) {
                    if (xmlContent == null) {
                        window.location = "bmmlImporter.jsp";
                        return;
                    }
                    tools.xml = xmlContent;
                    var onScriptEvaluated = function () {
                        for (var i = 0; i < layout.length; i++) {
                            var widget = layout[i];
                            if (widget._constructor != "ValuesManager" &&
                                widget._constructor != "MockDataSource" &&
                                window[widget.ID].parentElement == null) {
                                canvas.addChild(window[widget.ID]);
                            }
                        }
                    };

                    var mockupFilePrefix = mockupParam;
                    var ind;
                    ind = mockupParam.lastIndexOf("/");
                    if (ind > 0) {
                        mockupFilePrefix = mockupFilePrefix.substring(ind);
                    }
                    ind = mockupFilePrefix.lastIndexOf("\\");
                    if (ind > 0) {
                        mockupFilePrefix = mockupFilePrefix.substring(ind);
                    }
                    ind = mockupFilePrefix.lastIndexOf(".");
                    if (ind > 0) {
                        mockupFilePrefix = mockupFilePrefix.substring(0, ind);
                    }
                    tools.xmlFileName = mockupFilePrefix + ".xml";
                    if (outputFileParam) {
                        if (outputFileParam.substr(outputFileParam.length - 4) == ".xml") {
                            var path = outputFileParam;
                            if (!path.startsWith("/")) path = "tools/" + path;
                            if (saveFileBuiltinIsEnabled) {
                                isc.DMI.callBuiltin({
                                    methodName: "saveFile",
                                    "arguments": [ path, xmlContent ]
                                });
                            }
                            tools.xmlFileName = outputFileParam;
                        } else {
                            ind = outputFileParam.lastIndexOf(".");
                            if (ind > 0) {
                                tools.xmlFileName = outputFileParam.substring(0, ind);
                            } else {
                                tools.xmlFileName = outputFileParam;
                            }
                            tools.xmlFileName += ".xml";
                        }
                        isc.DMI.callBuiltin({
                            methodName: "xmlToJS",
                            "arguments": xmlContent,
                            callback : function (rpcResponse) {
                                if (!outputFileParam ||
                                    outputFileParam.substr(outputFileParam.length - 3) == ".js") {
                                    var path = outputFileParam;
                                    if (!path.startsWith("/")) path = "tools/" + path;
                                    if (saveFileBuiltinIsEnabled) {
                                        isc.DMI.callBuiltin({
                                            methodName: "saveFile",
                                            "arguments": [
                                                path,
                                                rpcResponse.data
                                            ]
                                        });
                                    }
                                }
                                isc.Class.evaluate(rpcResponse.data);
                                onScriptEvaluated();
                            }
                        });
                    } else {
                        var toolsMockupFilePrefix = "tools";
                        if (mockupFilePrefix && mockupFilePrefix[0] == '/') {
                            toolsMockupFilePrefix += "/";
                        }
                        toolsMockupFilePrefix += mockupFilePrefix;
                        if (saveFileBuiltinIsEnabled) {
                            isc.DMI.callBuiltin({
                                methodName: "saveFile",
                                "arguments": [toolsMockupFilePrefix + ".xml", xmlContent]
                            });
                        }
                        isc.DMI.callBuiltin({
                            methodName: "xmlToJS",
                            "arguments": xmlContent,
                            callback : function (rpcResponse) {
                                if (saveFileBuiltinIsEnabled) {
                                    isc.DMI.callBuiltin({
                                        methodName: "saveFile",
                                        "arguments": [
                                            toolsMockupFilePrefix + ".js",
                                            rpcResponse.data
                                        ]
                                    });
                                }
                                isc.Class.evaluate(rpcResponse.data);
                                onScriptEvaluated();
                            }
                        });
                    }
                });
            };

            var contents = fileContent;
            var path = filePath;
            if (contents != null) {
                // If the browser supports HTML5 history.pushState(), use it to change the URL
                // to the generic `bmmlImporter.jsp' URL because the previous bookmarkable URL
                // does not represent the import of an uploaded BMML file.
                if (isc.isA.Function(history.pushState)) {
                    var workBuilder = isc.URIBuilder.create(isc.Page.getAppDir());
                    workBuilder.appendPath("bmmlImporter.jsp");
                    if (skin) {
                        workBuilder.setQueryParam("skin", skin);
                    }
                    history.pushState(null, null, workBuilder.uri);
                }

                refreshItem.disable();
                refreshItem.hide();
                processContents(contents, path);
            } else {
                // Load from file
                var fileSystemDs = isc.DataSource.getDataSource("Filesystem");
                fileSystemDs.fetchData({
                    path: mockupParam,
                    webrootOnly: false
                }, function (rpcResponse, data) {
                    var contents = data[0].contents;
                    var path = data[0].path;
                    refreshItem.enable();
                    refreshItem.show();
                    processContents(contents, path);
                }, { operationId: "loadFile" });
            }
        }
    };

    return (importDialog = isc.BMMLImportDialog.create(dialogProperties));
})();

var mockupParam = isc.params.mockup;
var outputFileParam = isc.params.outputFile;
var dropMarkupParam = isc.params.dropMarkup;
var trimSpaceParam = isc.params.trimSpace;
var fillSpaceParam = isc.params.fillSpace;
var autoRefreshParam = isc.params.autoRefresh;
var fieldNamingConventionParam = isc.params.fieldNamingConvention;
var mockupUploadedParam = isc.params.mockupUploaded;
if (mockupParam) {
    importDialog.hide();
    importDialog.submit(mockupParam, outputFileParam, null, isc.params.skin || "Enterprise",
                        dropMarkupParam != "no", trimSpaceParam != "no", fillSpaceParam != "no",
                        fieldNamingConventionParam, autoRefreshParam, false, true);
}

</script>
</body>
</html>
