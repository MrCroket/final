<%@ taglib uri="/WEB-INF/iscTaglib.xml" prefix="isomorphic" %>
<!-- 
Batch DataSource Generator
--------------------------

This file uses SmartClient server APIs to auto-generate SmartClient DataSources directly 
from database schema.  It creates .ds.xml files with the same name as the tables they 
were derived from, and places them in the shared/ds folder of your SmartClient installation.
It can also extract data from your tables and place it in .data.xml files in the
shared/ds/test_data folder of your SmartClient installation.  (Note that shared/ds is just
the default - the actual location comes from your server.properties file)

To use it, point your browser at tools/batchDSGenerator, passing parameters "dbName" and 
"tableName".  If the .ds.xml files already exist and you want the tool to overwrite them, you
should also pass "overwrite=true".  If you also want to extract the data, you should also pass
"dumpTestData=true".  

You can also pass "timestampsAsDates=true".  This tells the tool to convert table columns with
a reported JDBC type of TIMESTAMP to SmartClient "date" fields rather than "datetime" fields.
We provide this option because some databases store ALL date and time values as timestamps - for
example, MySQL reports both DATE and DATETIME columns as being of type TIMESTAMP.

Example usage:
     
http://localhost:8080/tools/batchDSGenerator.jsp?dbName=Oracle&tableName=foo&tableName=bar&overwrite=true&dumpTestData=true

It can also generate DataSource definitions directly from Hibernate mapped entities or POJOs
that follow Javabean naming semantics (ie, property foo is accessed with getFoo() and setFoo()).
In this case, provide any number of "className" parameters - these will be interpreted as 
Hibernate entity names first, then as fully-qualified Java class names if they are not found
as Hibernate mapped entities.  Example usage:

http://localhost:8080/tools/batchDSGenerator.jsp?className=OrderItem&className=org.bar.foo.MyClass

The DataSource Generator can also output Javascript instead of XML - pass outputFormat=js to 
enable this.  In this mode, it will emit both DataSource definition and test data in JSON format,
placing the definition in a .ds.js file and the extracted data in a .data.js file.

If all these parameters are getting too much for you, you can also access the tool via a SmartClient
UI, allowing you to enter the parameters in a more user-friendly, interactive fashion.  Example usage:

http://localhost:8080/tools/dsGenerator.jsp

Finally, although this is an official, supported tool, it is also intended as an example of 
using SmartClient server APIs, and as a launch point for your own, more sophisticated tool
to leverage existing schema metadata into SmartClient DataSources.  We have written this 
program in a way that makes it easy to change the derived metadata before it is serialized out 
to either XML or JS.  The main code calls into clearly-named and commented override functions 
defined at the top of the program, and we have provided extensive comments and example code to 
show how you might add code to the override functions to alter the generated XML.

You are encouraged to extend this tool for your own purposes.

-->

<%@ page import="java.util.*" %>
<%@ page import="java.io.*" %>
<%@ page import="com.isomorphic.tools.DataSourceTools" %>
<%@ page import="com.isomorphic.xml.XML" %>
<%@ page import="com.isomorphic.base.Config" %>
<%@ page import="com.isomorphic.datasource.DataSource" %>
<%@ page import="com.isomorphic.js.JSTranslater" %>
<%@ page import="com.isomorphic.jpa.JPADSGenerator" %>
<%@ page import="com.isomorphic.interfaces.InterfaceProvider" %>

<html>
<head>
<title>Batch DataSource Generator</title>

</head>
<body>


<%! 


// ===================== Override functions - add your own code here =====================


    // Datasource-level override point - put code here to add, change or remove attributes from
    // the DataSource definition itself. The tool calls this method for each DataSource it generates
	void overrideDSConfig(Map dsConfig) throws Exception {
        
        // You can modify elements of the DataSource config before it is serialized out to XML. 
        // To do this, just add or change entries in the config Map here.  This example code shows 
        // how you could generically change the DataSource ID (which is the same as the table 
        // name by default)
        // String id = (String)dsConfig.get("ID");
        // id += "_DS";
        // dsConfig.put("ID", id);
    }

    // Field-level override point - put code here to add, change or remove attributes from a DataSource
    // field definition.  The tool calls this method for each DataSource field individually.
	void overrideFieldConfig(Map field, Map dsConfig) throws Exception {

        // Here, example code shows how you might automatically change a field's SmartClient type 
        // based on the underlying JDBC type (the sqlType property returned by the SmartClient
        // server is a lower-case string the same as the corresponding enum value in 
        // java.sql.Types - thus java.sql.Types.VARCHAR is "varchar", etc)
        // String sqlType = (String)field.get("sqlType");
        // if (sqlType != null && sqlType.equals("timestamp")) {
        //     field.put("type", "time");
        // }
        
        // This sample code shows how you might use Reflection on JPA annotations to add primary key 
        // information to a DataSource definition derived from an annotated Java class. 
        // Note that this is just example code and by no means covers the entire range of possibilities. 
        // For example, it assumes the the JPA @Id annotation will be applied to a getter method, when 
        // it could just as well be applied to a public member variable.
        // if (dsConfig.get("beanClassName") != null) {  // ie, derived from a class, not a table
        //     String name = (String)field.get("name");
        //     PropertyDescriptor pd = new PropertyDescriptor(name, Class.forName(classNames[i]));
        //     Method method = pd.getReadMethod();
        //     Annotation a = method.getAnnotation(Id.class);
        //     if (a instanceof Id) {
        //         field.put("primaryKey", "true");
        //     }
        // }
                
    }

    // Data override point.  This method is called for each record in the extracted data.  Add code 
    // here to modify the test data that will be serialized out to XML or JSON.
	void overrideDataRecord(Map record, Map dsConfig) throws Exception {
    
        // This sample code adds or changes a field called "lastExtracted" to the data record.  This
        // value will be serialized out to the test data file.  If the record did not already contain 
        // a "lastExtracted" field (ie, we're adding a value to the record), the data will still be 
        // serialized out to the test data file, but will not be used by the DataSource unless you also
        // add a corresponding field to it.
        // java.sql.Timestamp ts = new java.sql.Timestamp(System.currentTimeMillis());
        // record.put("lastExtracted", ts);
    }
%>
    
<%

// ===================== Main code starts here =====================

// Read parameters into working variables

String dbName = request.getParameter("dbName");
String schemaName = request.getParameter("schemaName");
String overwrite = request.getParameter("overwrite");
String dumpTestData = request.getParameter("dumpTestData");
String returnSQLType = request.getParameter("returnSQLType");

String[] tableNames =  request.getParameterValues("tableName");
String tableNamesCSV = "";
if (tableNames != null) {
    for (int i = 0; i < tableNames.length; i++) {
        if (i != 0) tableNamesCSV += ", ";
        tableNamesCSV += tableNames[i];
    }
}
String[] classNames =  request.getParameterValues("className");
String classNamesCSV = "";
if (classNames != null) {
    for (int i = 0; i < classNames.length; i++) {
        if (i != 0) classNamesCSV += ", ";
        classNamesCSV += classNames[i];
    }
}
String puName = request.getParameter("puName");

String outputFormat = request.getParameter("outputFormat");
if (outputFormat == null) outputFormat = "xml";

String webRoot = (String)Config.getProperty("webRoot");

Config scConfig = Config.getGlobal();
String dsPath = scConfig.getString("project.datasources", webRoot);
// If there are multiple locations, just use the first one
if (dsPath.indexOf(",") != -1) dsPath = dsPath.substring(0, dsPath.indexOf(","));

// Replace '\' with '/' to prevent unwanted escaping on Windows servers
dsPath = dsPath.replace('\\', '/');

if (!dsPath.endsWith("/")) dsPath += "/";

String dataPath = dsPath + "test_data/";
String dsExtension = ".ds";
String dataExtension = ".data";

String timestampsAsDates = request.getParameter("timestampsAsDates");
String timestampType = "datetime";
if ("true".equals(timestampsAsDates)) timestampType = "date";

// ==================== Show read-only UI =====================
// If we did not come from the UI screen, display a read-only window in the
// same format to show the parameters.  This code is just for UI purposes - 
// it is not a part of the actual generator program
String fromUI = request.getParameter("fromUI");
if (!"true".equals(fromUI)) {
%>

<isomorphic:loadISC modulesDir="system/development/" skin="Enterprise"/>

<script>
var requestURL = "<% out.write(request.getRequestURL().toString()); %>"
requestURL = requestURL.substring(0, requestURL.lastIndexOf("/") + 1) + "dsGenerator.js";
var disableFields = true;

// Convert the parameters for display in the UI
var dbName = "<% if (dbName != null) out.write(dbName); %>";
var tableName = "<% if (tableNamesCSV != null) out.write(tableNamesCSV); %>";
var className = "<%  if (classNamesCSV != null) out.write(classNamesCSV); %>";
var puName = "<%  if (puName != null) out.write(puName); %>";
var outputFormat = "<%  if (outputFormat != null) out.write(outputFormat); %>";
var overwrite = "<%  if (overwrite != null) out.write(overwrite); %>";
var dumpTestData = "<%  if (dumpTestData != null) out.write(dumpTestData); %>";
var timestampsAsDates = "<%  if (timestampsAsDates != null) out.write(timestampsAsDates); %>";
var returnSQLType = "<%  if (returnSQLType != null) out.write(returnSQLType); %>";
var dsPath = "<%=dsPath%>";
var schemaName = "<%=schemaName%>";
isc.Window.create({
    ID: "isc_generatorWindow",
    title: "Batch DataSource Generator",
    autoCenter: true, width: 620, height: 580, 
    items: [
        isc.ViewLoader.create({
            ID: "isc_generatorView",
            viewURL: requestURL,
            loadingMessage: " "
        })
    ]
});
</script>
<% } %>

<p>DataSource Generator messages:</p>
<textarea rows=40 cols=120>

<%    

// ======================== Generation starts here =========================

if (tableNames != null) {
    for (int i = 0; i < tableNames.length; i++) {
        Map dsConfig = new HashMap();
        try {
            dsConfig = DataSourceTools.getDataSourceConfigFromTable(
                            tableNames[i], schemaName, "sql", dbName, timestampType, 
                            "true".equals(returnSQLType));
        } catch (Exception e) {
            out.write(e.toString());
            e.printStackTrace();
            continue;
        }
        
        // Stamp the database config name onto the datasource.  Remove this line if you do not
        // want to tie the datasource to the particular database configuration you used to 
        // derive it (with no "dbName" property, dataSources use the default configuration)
        dsConfig.put("dbName", dbName);
        
        // Call the datasource override function to pick up user-specific changes
        overrideDSConfig(dsConfig);
        
        // Set the working ID to whatever is in the dsConfig - this will ordinarily be the same as 
        // as tableNames[i], but it might have been changed in the override function
        String dsID = (String)dsConfig.get("ID");
        
        // If the dumpTestData flag is true, we'll add a testFileName property to the 
        // DataSource .ds.xml file.  This will enable the data to be re-imported to the database
        // via the SmartClient Database Admin Console.
        if ("true".equals(dumpTestData)) {
            dsConfig.put("testFileName", dsID + dataExtension + "." + outputFormat);
        }
        
        // Iterate over the contents of the config map's "fields" entry; call the override function
        // for each field
        List fields = (List)dsConfig.get("fields");
        for (Iterator j = fields.iterator(); j.hasNext(); ) {
            Map field = (Map)j.next();
            overrideFieldConfig(field, dsConfig);
        }
        
        String xmlString = toXML(dsConfig);
        if ("js".equals(outputFormat)) {

            // To ensure we pick up any changes that the above code might have made to 
            // the datasource config derived from metadata, we'll create a live DataSource 
            // object from the current config, then use the JSTranslater API to serialize 
            // it to Javascript Object Notation.
            DataSource work = DataSource.fromConfig(dsConfig, null);
            StringWriter jsOut = new StringWriter();
            JSTranslater.get().toJS(work, jsOut);
            String jsString = jsOut.toString();
            jsString = "//  Auto-generated from database table " + tableNames[i] + "\n\n" + 
                       "var " + dsID + " = " + jsString + "\n";
            writeToFileAndPage(jsString, dsID, dsPath, dsExtension,
                               outputFormat, overwrite, out);
        } else {
            xmlString = "<!-- Auto-generated from database table " + tableNames[i] +
                           " -->\n\n" + xmlString;
            writeToFileAndPage(xmlString, dsID, dsPath, dsExtension,
                               outputFormat, overwrite, out);
        }

        dsConfig.put("dbName", dbName);
        
        if ("true".equals(dumpTestData)) {
        
            // To access the data, we need to create a "live" DataSource - so far, we've 
            // only dealt with the config of a DataSource.
            DataSource ds = DataSource.fromConfig(dsConfig, null);
            List dataList = ds.fetch(new HashMap());
            
            // Call the data override function for each item in the returned data
            for (Iterator data = dataList.iterator(); data.hasNext(); ) {
                Map record = (Map)data.next();
                overrideDataRecord(record, dsConfig);
            }
                
            if ("js".equals(outputFormat)) {
                StringWriter jsOut = new StringWriter();
                JSTranslater.get().toJS(dataList, jsOut);
                String jsString = "// Auto-generated from database table " + tableNames[i] +
                                  "\n\nvar test_data = " + jsOut.toString();
                writeToFileAndPage(jsString, dsID, dataPath, 
                                   dataExtension, outputFormat, overwrite, out);
            } else {
                StringWriter xmlOut = new StringWriter();
                xmlOut.write("<List>\n");
                for (Iterator data = dataList.iterator(); data.hasNext(); ) {
                    XML.recordToXML(dsID, (Map) data.next(), xmlOut, true, null);
                }
                xmlOut.write("</List>");
                xmlString = "<!-- Auto-generated from database table " + tableNames[i] +
                            " -->\n\n" + xmlOut.toString();
                writeToFileAndPage(xmlString, dsID, dataPath, 
                                   dataExtension, outputFormat, overwrite, out);
            }
        }   
            
    }
}

// Now do the same for any class names / Hibernate entities that were passed. We attempt to
// treat the className first as a Hibernate entity; if that gives a null response, we try
// to treat it as a fully-qualified class name    
if (classNames != null) {
    for (int i = 0; i < classNames.length; i++) {
        boolean fromMapping = true;
        boolean fromJPAMapping = false;
        boolean haveHibernate = InterfaceProvider.exists("IHibernateDataSource", false);
        Map dsConfig = null;
        if (haveHibernate) {
            try {
                dsConfig = DataSourceTools.getDataSourceConfigFromHibernateMapping(classNames[i]);
            } catch(Exception e) {
                out.write(e.toString());
                e.printStackTrace();
                continue;
            }
        }
        if (dsConfig == null) {
            try {
                dsConfig = DataSourceTools.getDataSourceConfigFromJPAClass(classNames[i]);
                fromJPAMapping = true;
            } catch (Exception ex) {}
            if (dsConfig == null) {
                fromMapping = false;
                try {
                    Object jbConfig = DataSourceTools.getDataSourceConfigFromJavaClass(classNames[i]);
                    if (jbConfig instanceof Map) dsConfig = (Map)jbConfig;
                    else if (jbConfig instanceof String) {
                        out.write("ERROR:  " + (String)jbConfig);
                        continue;
                    }

                } catch (ClassNotFoundException e) {
                    out.write("ERROR:  " + classNames[i] + 
                            " is neither a Hibernate entity nor a valid Java class\n\n");
                    continue;
                }
            }
        }
        
        // Call the datasource override function to pick up user-specific changes
        overrideDSConfig(dsConfig);

        // Set the working ID to whatever is in the dsConfig - this will ordinarily be the same as 
        // as classNames[i], but it might have been changed in the override function
        String dsID = (String)dsConfig.get("ID");
        
        // Iterate over the contents of the config map's "fields" entry; call the override function
        // for each field
        List fields = (List)dsConfig.get("fields");
        for (Iterator j = fields.iterator(); j.hasNext(); ) {
            Map field = (Map)j.next();
            overrideFieldConfig(field, dsConfig);
        }
        
        String xmlString = toXML(dsConfig);
        String outputString = "";
        
        if ("js".equals(outputFormat)) {
            DataSource work = DataSource.fromConfig(dsConfig, null);
            StringWriter jsOut = new StringWriter();
            JSTranslater.get().toJS(work, jsOut);
            String jsString = jsOut.toString();
            String comment = "// Auto-generated from Java class " + classNames[i] + " -->\n\n";
            if (fromMapping) {
                comment = "//  Auto-generated from Hibernate mapping " + classNames[i] + "\n\n";
                if (fromJPAMapping) {
                    comment = "//  Auto-generated from JPA mapping " + classNames[i] + "\n\n";
                }
            }
            outputString = comment + "isc.DataSource.create(" + jsString + ")\n";
        } else {
            String comment = "<!-- Auto-generated from Java class " + classNames[i] + " -->\n\n";
            if (fromMapping) {
                comment = "<!-- Auto-generated from Hibernate mapping " + classNames[i] + " -->\n\n";
                if (fromJPAMapping) {
                    comment = "<!-- Auto-generated from JPA mapping " + classNames[i] + " -->\n\n";
                }
            }
            outputString = comment + xmlString;
        }
        
        writeToFileAndPage(outputString, dsID, dsPath, dsExtension,
                           outputFormat, overwrite, out);
    }
}

if (puName != null) {
    Map dsConfigs;
    try {
        dsConfigs = JPADSGenerator.generateFromPersistenceUnit(puName);
        for (Iterator i = dsConfigs.keySet().iterator(); i.hasNext(); ) {
            String id = (String)i.next();
            Map dsConfig = (Map)dsConfigs.get(id);
            // Call the datasource override function to pick up user-specific changes
            overrideDSConfig(dsConfig);

            // Set the working ID to whatever is in the dsConfig
            String dsID = (String)dsConfig.get("ID");
            
            // Iterate over the contents of the config map's "fields" entry; call the override function
            // for each field
            List fields = (List)dsConfig.get("fields");
            for (Iterator j = fields.iterator(); j.hasNext(); ) {
                Map field = (Map)j.next();
                overrideFieldConfig(field, dsConfig);
            }
            
            String xmlString = toXML(dsConfig);
            String outputString = "";
            
            if ("js".equals(outputFormat)) {
                DataSource work = DataSource.fromConfig(dsConfig, null);
                StringWriter jsOut = new StringWriter();
                JSTranslater.get().toJS(work, jsOut);
                String jsString = jsOut.toString();
                String comment = "//  Auto-generated from JPA mapping " + dsConfig.get("beanClassName") + "\n\n";
                outputString = comment + "isc.DataSource.create(" + jsString + ")\n";
            } else {
                String comment = "<!-- Auto-generated from JPA mapping " + dsConfig.get("beanClassName") + " -->\n\n";
                outputString = comment + xmlString;
            }
            writeToFileAndPage(outputString, dsID, dsPath, dsExtension,
                               outputFormat, overwrite, out);
        }
    } catch (Exception ex) {
        out.write("ERROR:  " + ex.getMessage() + "\n");
    }
}
%>

<%! 
	String toXML(Map dsConfig) throws Exception {
        // Serialize the DataSource config to XML. Note that this is not the simplest method
        // SmartClient provides to convert a Java object graph to XML, but doing it this way 
        // allows for maximum control of the serialization process, so it can be tweaked and 
        // added to.
        StringWriter xmlOut = new StringWriter();
        xmlOut.write("<DataSource \n");
        for (Iterator attrs = dsConfig.keySet().iterator(); attrs.hasNext(); ) {
        	String attrName = (String)attrs.next();
        	// We treat fields separately, as it is a list
        	if ("fields".equals(attrName)) continue;
        	Object attrValue = dsConfig.get(attrName);
        	xmlOut.write("\t" + attrName + "=\"" + attrValue.toString() + "\"\n");
        }
        xmlOut.write(">\n\t<fields>\n");
        List fieldList = (List) dsConfig.get("fields");
        for (Iterator fields = fieldList.iterator(); fields.hasNext(); ) {
        	xmlOut.write("\t\t");
            XML.recordToXML("field", (Map) fields.next(), xmlOut, true, null);
        }
        xmlOut.write("\t</fields>\n");
        xmlOut.write("</DataSource>");
        
        return xmlOut.toString();
    }
%>

<%!
	void writeToFileAndPage(String content, String name, String path,
	                        String extension, String format, String overwrite, Writer out) 
	throws Exception {
        // Write it to a file in {path}/shared/ds - we don't overwrite existing files unless
        // the "overwrite" parameter was passed in as "true"
        String fileName = "";
        try {
            fileName += path + name + extension + "." + format;
            File file = new File(fileName);
            String createType = "Create";
            if (file.exists()) createType = "Replace";
            if (!file.exists() || "true".equals(overwrite)) {
                FileWriter fw = new FileWriter(file);
                fw.write(content);
                fw.close();
                
                // Display the file name in the webpage
                out.write(createType + "d: " + fileName + "\n"); 
                out.write(content + "\n\n"); 
            } else {
                // Display a failure message in the webpage
                out.write("Did not create, already exists: " + fileName + "\n\n");
            }
        } catch (Exception e) {
            System.err.println("Error whilst trying to write file " + fileName + 
                               ".  Does the target path exist?");
            throw e;
        }
    }
%>

</textarea>
</body>
</html>
