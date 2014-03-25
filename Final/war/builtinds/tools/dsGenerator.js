// This file contains the UI window for the Batch DataSource Generator

isc.DynamicForm.create({
    ID: "isc_generatorForm",
    autoDraw: false,
    margin: 10,
    numCols: 3,
    colWidths: [220, 190, 190],
    fields: [
        { type: "blurb",
          showTitle: false,
          colSpan: 3,
          wrap: true,
          defaultValue: 
          "This tool can generate DataSource definitions from existing database tables, Hibernate " +
          "mappings and Java classes, and save them into your project datasource folder (<code>" + 
          dsPath + "</code>).<ul>" +
          "<li>For database tables, select a database configuration to connect to, and use the " +
          "radio-buttons to choose whether to select table-names from a drop-down " +
          "list or to enter a comma-separated list manually into a text field</li>" +
          "<li>For Hibernate mappings and/or Java classes, enter a comma-separated list of Hibernate " +
          "entity names or fully-qualified Java class names (eg, bar.foo.ClassName) in the 'class " +
          "names' field</li>" +
          "<li>For JPA 1.0 mappings, enter a comma-separated list of fully-qualified Java class names " +
          "(eg, bar.foo.ClassName) in the 'class names' field</li>" +
          "<li>For JPA 2.0 mappings, enter a persistence unit name - DataSource definitions will be generated " +
          "for all mapped entities in the specified persistence unit.</li></ul><p>" +
          "The tool can output XML or JSON, and it can also extract test data from your existing " +
          "database tables.  For full details of all the options, including instructions on how " +
          "to run the tool in pure batch mode, look at file tools/batchDSGenerator.jsp.  This is " +
          "the source code to the tool, and has been designed specifically for you to amend to " +
          "suit your needs."
        },
        { name: "dbName", 
          title: "Database", 
          type: "select", 
          disabled: disableFields,
          defaultValue: dbName,
          changed : function (form, item, value) {
            if (form.useTableList()) {
                form.fetchTableList(value);
            }
          }
        },
        { name: "schemaName", 
          title: "Schema name (if required)", 
          type: "text", 
          disabled: disableFields,
          defaultValue: schemaName,
          endRow: disableFields
        },
        { name: "dbLink", 
          linkTitle: "Add new database configuration", 
          visible: !disableFields,
          showTitle: false,
          defaultValue: "adminConsole.jsp",
          _constructor: "LinkItem"
        },
        { name: "tableNameOptions",
          showTitle: false,
          type: "RadioGroupItem",
          valueMap: { "select": "Select Tables", "text": "Enter Table-names" },
          defaultValue: "select",
          vertical: false,
          disabled: disableFields,
          changed : function (form, item, value) {
            if (value == "select") {
                form.getItem("tableNameText").hide();
                form.getItem("tableNameSelect").show();
            } else {
                form.getItem("tableNameSelect").hide();
                form.getItem("tableNameText").show();
            }
          }
        },
        { name: "tableNameSelect", 
          showTitle: false,
          title: "Select table-names", 
          type: "select",
          width: 340, 
          disabled: disableFields,
          defaultValue: (tableName.length > 1 ? tableName : null),
          multiple: true,
          colSpan: 2,
          icons: [
              { name: "refreshTableList", src: "[SKINIMG]actions/refresh.png", 
                prompt: "Refresh List",
                showIf: function() { return !disableFields; },
                click : function (form, item, icon) {
                    form.fetchTableList();
                }
              }
          ]
        },
        { name: "tableNameText", 
          showTitle: false,
          title: "List of Table names (comma-separated)", 
          type: "text", 
          width: 340, 
          disabled: disableFields,
          defaultValue: (tableName.length > 1 ? tableName : null),
          colSpan: 2
        },
        { name: "className", 
          title: "List of class names (comma-separated)", 
          type: "text", 
          width: 340, 
          disabled: disableFields,
          defaultValue: className,
          colSpan: 2
        },
        { name: "puName", 
          title: "JPA persistence unit name", 
          type: "text", 
          width: 340, 
          disabled: disableFields,
          defaultValue: puName,
          colSpan: 2
        },
        { name: "outputFormat", 
          title: "Output Format", 
          type: "radioGroup", 
          vertical: false,
          width: 60, 
          valueMap: {xml: "XML", js: "JSON"}, 
          disabled: disableFields, 
          defaultValue: outputFormat,
          colSpan: 2
        },
        { name: "overwrite", 
          title: "Overwrite files if they exist", 
          type: "boolean", 
          disabled: disableFields,
          defaultValue: overwrite,
          colSpan: 2
        },
        { name: "dumpTestData", 
          title: "Also extract table data", 
          type: "boolean", 
          disabled: disableFields,
          defaultValue: dumpTestData,
          colSpan: 2
        },
        { name: "returnSQLType", 
          title: "Include 'sqlType' property on fields retrieved from database metadata", 
          type: "boolean", 
          disabled: disableFields,
          defaultValue: returnSQLType,
          colSpan: 2
        },
        { name: "timestampsAsDates", 
          title: 'Treat JDBC TIMESTAMP columns as type "date" (ignore time value)', 
          type: "boolean", 
          disabled: disableFields,
          defaultValue: timestampsAsDates,
          colSpan: 2
        },
        { name: "ok", 
          title: "OK", 
          type: "button", 
          width: 80, 
          visible: !disableFields, 
          click: function (form, item) {
                var props = form.getValuesAsCriteria(),
                    isSelect = form.useTableList();
                    
                for (var propName in props) {
                    if (propName == "tableNameText" || propName == "tableNameSelect" || propName == "className") {
                        if (isc.isA.String(props[propName])) props[propName] = props[propName].split(",");

                        // Trim whitespace off the individual table/class names
                        for (var i = 0; i < props[propName].length; i++) {
                            props[propName][i] = props[propName][i].replace(/^\s+|\s+$/g, '')
                        }

                        if (propName != "className") {
                            if ((propName == "tableNameSelect" && isSelect) || !isSelect)
                                props["tableName"] = props[propName];
                            props[propName] = null;
                        }
                    }
                }
                
                // Let the batch generator know that we came from the UI
                props.fromUI = true;
                                
                isc.HTMLFlow.create({
                    ID: "isc_generatorResults",
                    width: "100%", height: "100%"
                });

                isc_generatorResults.setContentsURL(requestURL, props);
            }
        }
    ],

    initWidget : function () {
        this.Super("initWidget", arguments);
        if (this.useTableList()) {
            this.getItem("tableNameSelect").show();
            this.getItem("tableNameText").hide();
        }
    },

    useTableList : function () {
        return (this.getValue("tableNameOptions") == "select");
    },

    fetchTableList : function (value) {
        if (!value) value = this.getValue("dbName");
        if (value) {
            isc.DMI.call("isc_builtin","com.isomorphic.tools.BuiltinRPC","getTables",
                "sql",
                value,
                true,true,
                null,
                this.getValue("schemaName"),
                null,null,
                this.getID()+".fetchTableListReply(data)"
            );
        }
    },

    fetchTableListReply : function (data) {
        if (!this.useTableList()) return;
        
        if (isc.isAn.Array(data)) data = data.sortByProperty("TABLE_NAME", true);

        var entries = data.getProperty("TABLE_NAME"),
            item = this.getItem("tableNameSelect");

        item.setValueMap(entries);
    }
});
