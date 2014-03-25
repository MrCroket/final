package com.smartgwt.sample.client;

/*
 * Isomorphic SmartGWT web presentation layer
 * Copyright 2000 and beyond Isomorphic Software, Inc.
 *
 * OWNERSHIP NOTICE
 * Isomorphic Software owns and reserves all rights not expressly granted in this source code,
 * including all intellectual property rights to the structure, sequence, and format of this code
 * and to all designs, interfaces, algorithms, schema, protocols, and inventions expressed herein.
 *
 *  If you have any questions, please email <sourcecode@isomorphic.com>.
 *
 *  This entire comment must accompany any portion of Isomorphic Software source code that is
 *  copied or moved from this file.
 */


import java.sql.Date;

import com.smartgwt.client.data.Criteria;
import com.smartgwt.client.data.DSCallback;
import com.smartgwt.client.data.DSRequest;
import com.smartgwt.client.data.DSResponse;
import com.smartgwt.client.data.DataSource;
import com.smartgwt.client.data.Record;
import com.smartgwt.client.data.RecordList;
import com.smartgwt.client.types.Alignment;
import com.smartgwt.client.types.ChartType;
import com.smartgwt.client.types.VerticalAlignment;
import com.smartgwt.client.util.SC;
import com.smartgwt.client.widgets.HTMLFlow;
import com.smartgwt.client.widgets.IButton;
import com.smartgwt.client.widgets.Window;
import com.smartgwt.client.widgets.chart.FacetChart;
import com.smartgwt.client.widgets.cube.Facet;
import com.smartgwt.client.widgets.events.ClickHandler;
import com.smartgwt.client.widgets.events.ClickEvent;
import com.smartgwt.client.widgets.form.DynamicForm;
import com.smartgwt.client.widgets.form.fields.DateItem;
import com.smartgwt.client.widgets.grid.ListGrid;
import com.smartgwt.client.widgets.grid.events.RecordClickEvent;
import com.smartgwt.client.widgets.grid.events.RecordClickHandler;
import com.smartgwt.client.widgets.layout.VLayout;
import com.smartgwt.client.widgets.tab.Tab;
import com.smartgwt.client.widgets.tab.TabSet;
import com.smartgwt.client.widgets.tab.events.TabDeselectedEvent;
import com.smartgwt.client.widgets.tab.events.TabDeselectedHandler;
import com.smartgwt.client.widgets.tab.events.TabSelectedEvent;
import com.smartgwt.client.widgets.tab.events.TabSelectedHandler;
import com.google.gwt.core.client.EntryPoint;

//CREAR VARIABLE PARA QUE SE ABRA EL WINDOW SOLO CUANDO CLIQUE EN EL MODULO DE FACTURAS
public class Index implements EntryPoint {

	String Moduloseleccionado;
	//private Chart chartRentaSexo;
	private FacetChart chartSexo;
	private VLayout layCompraSexo;
	
    public void onModuleLoad() {
       
    	VLayout VLOMain = new VLayout();
    	VLOMain.setWidth100();
    	VLOMain.setHeight100();
    	
    	
    	VLayout titulo = new VLayout();  
    	titulo.setWidth100();  
    	titulo.setHeight(75);  
    	titulo.setBackgroundColor("#ffffff");
    	titulo.setAlign(VerticalAlignment.CENTER);
    	titulo.setAlign(Alignment.CENTER);
    	   	
    	 HTMLFlow billing = new HTMLFlow();  
    	 billing.setWidth(230);      	    	         
         String contents = "<font size="+"18"+" color="+"blue"+">"+"ALMACEN"+"</font>";           
         billing.setContents(contents);
         billing.setMargin(3);
      
    	titulo.addMember(billing);
    	
    	IButton importarBBDD = new IButton("IMPORTAR");
    	importarBBDD.setWidth("20%");
    	
	importarBBDD.addClickHandler(new ClickHandler() {
			
			@Override
			public void onClick(ClickEvent event) {
				// TODO Auto-generated method stub
				SC.openDataSourceConsole();
			}
		});
	
		
		VLOMain.addMember(importarBBDD);
		
		TabSet contenedorArriba = new TabSet();
		Tab tabClientes= new Tab("Clientes");
		
		ModuloGestion moduloClientes = new ModuloGestion(DataSource.get("clientes"), false, false);
		tabClientes.setPane(moduloClientes);
		contenedorArriba.addTab(tabClientes);
		
		Tab tabAlmacen= new Tab("Almacen");
		
		ModuloGestion moduloAlmacen= new ModuloGestion(DataSource.get("proveedor"), false, false);
		tabAlmacen.setPane(moduloAlmacen);
		contenedorArriba.addTab(tabAlmacen);
		
		//////////////////////////////
		//INFORMES
		/////////////////////////////
		Tab tabInformes = new Tab("Informes");
		contenedorArriba.addTab(tabInformes);
		
		final TabSet contenedorAlmacen = new TabSet();
		contenedorAlmacen.setVisible(false);
		
		Tab tabTopPedidos = new Tab("TOP PEDIDOS");
		
		ListGrid topPedidos= new ListGrid();
		topPedidos.setWidth100();
		topPedidos.setHeight(100);
		topPedidos.setDataSource(DataSource.get("toppedidos"));
		tabTopPedidos.setPane(topPedidos);
		contenedorAlmacen.addTab(tabTopPedidos);
		topPedidos.setFetchOperation("queryDashboard");
		topPedidos.fetchData();
		
		
		Tab tabTopVendidos = new Tab("TOP VENDIDOS");
		
		ListGrid topVendidos= new ListGrid();
		topVendidos.setWidth100();
		topVendidos.setHeight(100);
		topVendidos.setDataSource(DataSource.get("topvendidos"));
		tabTopVendidos.setPane(topVendidos);
		contenedorAlmacen.addTab(tabTopVendidos);
		topVendidos.setFetchOperation("queryDashboard");
		topVendidos.fetchData();
		
		Tab tabClientesRentables = new Tab("CLIENTES MAS RENTABLES");
		
		ListGrid topClientesRentables= new ListGrid();
		topClientesRentables.setWidth100();
		topClientesRentables.setHeight(100);
		topClientesRentables.setDataSource(DataSource.get("toprentabilidadclientes"));
		tabClientesRentables.setPane(topClientesRentables);
		contenedorAlmacen.addTab(tabClientesRentables);
		topClientesRentables.setFetchOperation("queryDashboard");
		topClientesRentables.fetchData();
		
		Tab tabProductosRentables = new Tab("PRODUCTOS MAS RENTABLES");
	
		ListGrid topProductosRentables= new ListGrid();
		topProductosRentables.setWidth100();
		topProductosRentables.setHeight(100);
		topProductosRentables.setDataSource(DataSource.get("toprentabilidadproductos"));
		tabProductosRentables.setPane(topProductosRentables);
		contenedorAlmacen.addTab(tabProductosRentables);
		topProductosRentables.setFetchOperation("queryDashboard");
		topProductosRentables.fetchData();
			
		
		Tab tabSexosRentables = new Tab("RENTABILIDAD POR SEXOS");
		
		ListGrid sexosRentables= new ListGrid();
		sexosRentables.setWidth100();
		sexosRentables.setHeight(100);
		sexosRentables.setDataSource(DataSource.get("rentabilidadsexos"));
		tabSexosRentables.setPane(sexosRentables);
		contenedorAlmacen.addTab(tabSexosRentables);
		sexosRentables.setFetchOperation("queryDashboard");
		sexosRentables.fetchData();
		
		Tab TabPaisRentable = new Tab("RENTABILIDAD POR PAISES");
		
		ListGrid paisRentables= new ListGrid();
		paisRentables.setWidth100();
		paisRentables.setHeight(100);
		paisRentables.setDataSource(DataSource.get("rentabilidadpaises"));
		TabPaisRentable.setPane(paisRentables);
		contenedorAlmacen.addTab(TabPaisRentable);
		paisRentables.setFetchOperation("queryDashboard");
		paisRentables.fetchData();
			
		Tab TabCategoriaRentable = new Tab("RENTABILIDAD POR CATEGORIA");
		
		ListGrid categoriaRentables= new ListGrid();
		categoriaRentables.setWidth100();
		categoriaRentables.setHeight(100);
		categoriaRentables.setDataSource(DataSource.get("rentabilidadcategorias"));
		TabCategoriaRentable.setPane(categoriaRentables);
		contenedorAlmacen.addTab(TabCategoriaRentable);
		categoriaRentables.setFetchOperation("queryDashboard");
		categoriaRentables.fetchData();
			
		
		Tab TabProveedorRentable = new Tab("RENTABILIDAD POR PROVEEDOR");
		
		ListGrid proveedorRentables= new ListGrid();
		proveedorRentables.setWidth100();
		proveedorRentables.setHeight(100);
		proveedorRentables.setDataSource(DataSource.get("rentabilidadproveedor"));
		TabProveedorRentable.setPane(proveedorRentables);
		contenedorAlmacen.addTab(TabProveedorRentable);
		proveedorRentables.setFetchOperation("queryDashboard");
		proveedorRentables.fetchData();
		/////////////////////////////
		////////////////////////////
		

		final TabSet contenedorTabs= new TabSet();
		contenedorTabs.setVisible(false);
		
		Tab tabFacturas= new Tab("FACTURAS");
		
		final ModuloGestion moduloFacturas = new ModuloGestion(DataSource.get("factura"),false,true);
    	tabFacturas.setPane(moduloFacturas);    	
    	contenedorTabs.addTab(tabFacturas);
    	
    	final TabSet contenedorCategorias= new TabSet();
    	contenedorCategorias.setVisible(false);
    	
    	Tab tabCategoriaProductos= new Tab("CATEGORIA DE PRODUCTOS");
    	
    	final ModuloGestion moduloCategoriaProductos= new ModuloGestion(DataSource.get("categoriaproductos"),true,true);
    	tabCategoriaProductos.setPane(moduloCategoriaProductos);
    	contenedorCategorias.addTab(tabCategoriaProductos);
		

		final TabSet contenedorProductos = new TabSet();
		contenedorProductos.setVisible(false);
    	
    	Tab tabProductos= new Tab("COMPRAR PRODUCTOS");
    	
    	final ModuloGestion moduloProductos = new ModuloGestion(DataSource.get("productos"),false,false);
    	tabProductos.setPane(moduloProductos);
    	contenedorProductos.addTab(tabProductos);
    	
    	///////////////////////////////////////////////////
    	///////////////////////////////////////////////////
    	//AL PULSAR EN EL TAB DE CATEGORIAS APARECE EL TAB DE PRODUCTOS
    	tabAlmacen.addTabSelectedHandler(new TabSelectedHandler() {
			
			@Override
			public void onTabSelected(TabSelectedEvent event) {
				// TODO Auto-generated method stub
				contenedorProductos.setVisible(true);
				contenedorCategorias.setVisible(true);
				contenedorTabs.setVisible(false);
				contenedorAlmacen.setVisible(false);
			}
		});
    	
    	//AL NO PULSAR EN EL TAB DE CATEGORIAS DESAPARECE EL TAB DE PRODUCTOS
    	tabAlmacen.addTabDeselectedHandler(new TabDeselectedHandler() {
			
			@Override
			public void onTabDeselected(TabDeselectedEvent event) {
				// TODO Auto-generated method stub
				contenedorProductos.setVisible(false);
				contenedorCategorias.setVisible(false);

			}
		});
    	
    	tabClientes.addTabSelectedHandler(new TabSelectedHandler() {
			
			@Override
			public void onTabSelected(TabSelectedEvent event) {
				// TODO Auto-generated method stub
				contenedorAlmacen.setVisible(false);
				contenedorTabs.setVisible(true);
			}
		});
    	
    	tabInformes.addTabSelectedHandler(new TabSelectedHandler() {
			
			@Override
			public void onTabSelected(TabSelectedEvent event) {
				// TODO Auto-generated method stub
				contenedorAlmacen.setVisible(true);
				contenedorTabs.setVisible(false);
				
			}
		});
    	
    	tabInformes.addTabDeselectedHandler(new TabDeselectedHandler() {
			
			@Override
			public void onTabDeselected(TabDeselectedEvent event) {
				// TODO Auto-generated method stub
				contenedorAlmacen.setVisible(false);

			}
		});
    	///////////////////////////////////////////////////
    	///////////////////////////////////////////////////
    	
    	//CREAR LOS CRITERIA DEL CLIENTE PARA QUE SOLO APAREZCAN LAS FACTURAS DEL SELECCIONADO
    	moduloClientes.getTabla().addRecordClickHandler(new RecordClickHandler() {
    		
			@Override
			public void onRecordClick(RecordClickEvent event) {
				// TODO Auto-generated method stub
				int clienteID= event.getRecord().getAttributeAsInt("idCliente");
				
				Criteria criteria= new Criteria();
				criteria.addCriteria("idCliente", event.getRecord().getAttribute("idCliente"));
				
				moduloFacturas.getTabla().filterData(criteria);
				
			}
		});
    	
    	//CREAR LOS CRITERIA DE LAS CATEGORIAS DEL PRODUCTO PARA QUE SOLO APAREZCAN LOS PRODUCTOS QUE PERTENEZCAN A ESA CATEGORIA
    	moduloCategoriaProductos.getArbol().addRecordClickHandler(new RecordClickHandler() {
			
			@Override
			public void onRecordClick(RecordClickEvent event) {
				// TODO Auto-generated method stub
				
				int categoriaID= event.getRecord().getAttributeAsInt("idCategoriaProductos");
				
				Criteria criteria= new Criteria();
				criteria.addCriteria("idCategoriaProducto", event.getRecord().getAttribute("idCategoriaProductos"));
				
				moduloProductos.getTabla().filterData(criteria);
			}
		});
    	
    	//CREAR LOS CRITERIA DE FACTURAS PARA QUE SOLO APAREZCAN LOS DESGLOSES DEL SELECCIONADO
    	moduloFacturas.getTabla().addRecordClickHandler(new RecordClickHandler() {
			
    		
			@Override
			public void onRecordClick(RecordClickEvent event) {
				// TODO Auto-generated method stub
				
				//AL CLICAR EN UNA FACTURA SE ABRE UNA VENTANA CON EL MODULO DE DESGLOSE
				final ModuloGestion moduloDesglose = new ModuloGestion(DataSource.get("factura_productos"),false,true);
		    
				Window ventanasDesglose= new Window();
				ventanasDesglose.setWidth(600);
				ventanasDesglose.setHeight(600);
				ventanasDesglose.addItem(moduloDesglose);
				ventanasDesglose.centerInPage();
				ventanasDesglose.show();
				
				
				int facturaID= event.getRecord().getAttributeAsInt("idFactura");
				
				Criteria criteria= new Criteria();
				criteria.addCriteria("idFactura", event.getRecord().getAttribute("idFactura"));
				
				moduloDesglose.getTabla().filterData(criteria);
				
			}
		});
		
    	VLOMain.addMember(titulo);
    	VLOMain.addMember(contenedorArriba);
		VLOMain.addMember(contenedorTabs);
		VLOMain.addMember(contenedorCategorias);
		VLOMain.addMember(contenedorProductos);
		VLOMain.addMember(contenedorAlmacen);
		VLOMain.draw();
		//layCompraSexo.draw();
}

}