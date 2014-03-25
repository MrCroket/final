<%@ taglib uri="/WEB-INF/iscTaglib.xml" prefix="isomorphic" %>

<!-- This file bootstraps the user interface for the Batch DataSource Generator.  There
     is nothing of particular interest in here - file batchDSGenerator.jsp contains the 
     code for the DataSource generator   -->

 <%@ page import="com.isomorphic.base.Config" %>
    
<html>
<head>
<title>Batch DataSource Generator</title>

<isomorphic:loadISC modulesDir="system/development/" skin="Enterprise" />

</head>
<body>

<script>

<% 
    // Remember that we came in through the UI
    request.getSession().setAttribute("uiDisplayed", "true");
    // Remember the path we're going to store to, so we can put it in the instructions
    String path = Config.getGlobal().getString("project.datasources");
	if (path == null) path = "";
    if (path.indexOf(",") != -1) path = path.substring(0, path.indexOf(","));

    // Replace '\' with '/' to prevent unwanted escaping on Windows servers
    path = path.replace('\\', '/');
%>

var dsPath = "<% out.write(path); %>"

var requestURL = "<% out.write(request.getRequestURL().toString()); %>"
var viewURL = requestURL.substring(0, requestURL.lastIndexOf("/") + 1) + "dsGenerator.js";
requestURL = requestURL.substring(0, requestURL.lastIndexOf("/") + 1) + "batchDSGenerator.jsp";

var disableFields = false;
var dbName = "";
var schemaName = "";
var tableName = "";
var className = "";
var puName = "";
var outputFormat = "xml";
var overwrite = false;
var dumpTestData = false;
var timestampsAsDates = false;
var returnSQLType = false;

isc.Window.create({
    ID: "isc_generatorWindow",
	title: "Batch DataSource Generator",
	autoCenter: true, width: 620, height: 580, 
    items: [
        isc.ViewLoader.create({
            ID: "isc_generatorView",
            width: "100%", height: "100%",
            viewURL: viewURL,
            loadingMessage: " "
        })
    ],
    populateDatabaseList : function(data) {
        var valueMap = [];
        var dft = null;
        for (var i = 0; i < data.length; i++) {
            if (data[i].dbStatus == "OK") {
                valueMap.add(data[i].dbName);
                if (data[i].isDefault) dft = data[i].dbName;
            }
        }
        var item = isc_generatorForm.getField("dbName");
        item.setValueMap(valueMap);
        item.setValue(dft);
        isc_generatorForm.fetchTableList(dft);
    }
});

RPCManager.actionURL = Page.getAppDir() + "batchDSGeneratorOperations.jsp";

isc.DMI.call({
    appID: "isc_builtin",
    className: "com.isomorphic.tools.AdminConsole",
    methodName: "getDefinedDatabases",
    arguments: [ true ],
    callback: "isc_generatorWindow.populateDatabaseList(data)",
    requestParams: {
        prompt: "Please wait, getting available databases...",
        showPrompt: true
    }
});
</script>
</body>
</html>
