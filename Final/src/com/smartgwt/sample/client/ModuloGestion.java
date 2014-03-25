package com.smartgwt.sample.client;


import com.smartgwt.client.data.Criteria;
import com.smartgwt.client.data.DSCallback;
import com.smartgwt.client.data.DSRequest;
import com.smartgwt.client.data.DSResponse;
import com.smartgwt.client.data.DataSource;
import com.smartgwt.client.data.DataSourceField;
import com.smartgwt.client.data.Record;
import com.smartgwt.client.types.FieldType;
import com.smartgwt.client.widgets.IButton;
import com.smartgwt.client.widgets.events.ClickEvent;
import com.smartgwt.client.widgets.events.ClickHandler;
import com.smartgwt.client.widgets.form.DynamicForm;
import com.smartgwt.client.widgets.form.fields.DateItem;
import com.smartgwt.client.widgets.form.fields.DateTimeItem;
import com.smartgwt.client.widgets.form.fields.FormItem;
import com.smartgwt.client.widgets.form.fields.SelectItem;
import com.smartgwt.client.widgets.form.fields.TextItem;
import com.smartgwt.client.widgets.grid.ListGrid;
import com.smartgwt.client.widgets.grid.ListGridField;
import com.smartgwt.client.widgets.grid.events.RecordClickEvent;
import com.smartgwt.client.widgets.grid.events.RecordClickHandler;
import com.smartgwt.client.widgets.layout.HLayout;
import com.smartgwt.client.widgets.layout.VLayout;
import com.smartgwt.client.widgets.tree.TreeGrid;
import com.smartgwt.client.widgets.tree.TreeGridField;

public class ModuloGestion extends VLayout {

	
	ListGrid tabla;
	TreeGrid arbol;
	DynamicForm form;
	HLayout botonera;
	IButton botonSave;
	IButton botonRemove;
	IButton botonClear;
	private String strData;
	
	public ModuloGestion(final DataSource ds,final boolean tree,boolean sub)
	{
		
		DataSourceField[] camposDS = ds.getFields();

		
		if(!tree)
		{
			tabla = new ListGrid();
			tabla.setWidth100();
			tabla.setHeight(100);
			tabla.setDataSource(ds);
			
			
			tabla.setAutoFetchData(true);
			
			ListGridField[] camposTabla = new ListGridField[camposDS.length];


			for (int i=0;i<camposDS.length;i++)
			{
				
				ListGridField campoTabla = new ListGridField(camposDS[i].getName(),camposDS[i].getTitle());

				String FK = camposDS[i].getForeignKey();
				if(FK !=null)
				{
					campoTabla.setOptionDataSource(DataSource.get(FK.split("\\.")[0]));
					campoTabla.setDisplayField(camposDS[i].getDisplayField());

				}
				
				
				if(camposDS[i].getHidden())
				{
					campoTabla.setHidden(true);
					
				}
				
				camposTabla[i] = campoTabla;

			}
			tabla.setFields(camposTabla);
			
			tabla.addRecordClickHandler(new RecordClickHandler() {
				
				@Override
				public void onRecordClick(RecordClickEvent event) {
					// TODO Auto-generated method stub
				
					form.editRecord(event.getRecord());
				}
			});
			
			this.addMember(tabla);

		}
		else
		{
			arbol = new TreeGrid();
			arbol.setWidth100();
			arbol.setHeight(100);
			arbol.setDataSource(ds);
			arbol.setAutoFetchData(true);	
			
			TreeGridField[] camposTabla = new TreeGridField[camposDS.length];
			
			for (int i=0;i<camposDS.length;i++)
			{
				
				TreeGridField campoTabla = new TreeGridField(camposDS[i].getName(),camposDS[i].getTitle());

				String FK = camposDS[i].getForeignKey();
				if(FK !=null)
				{
					campoTabla.setOptionDataSource(DataSource.get(FK.split("\\.")[0]));
					campoTabla.setDisplayField(camposDS[i].getDisplayField());
					campoTabla.setHidden(true);
				}
				
				
				if(camposDS[i].getHidden())
				{
					campoTabla.setHidden(true);
					
				}
				
				camposTabla[i] = campoTabla;

			}
			arbol.setFields(camposTabla);
			
			arbol.addRecordClickHandler(new RecordClickHandler() {
				
				@Override
				public void onRecordClick(RecordClickEvent event) {
					// TODO Auto-generated method stub
				
					form.editRecord(event.getRecord());
				}
			});
			
			this.addMember(arbol);
			
		}
		
		form = new DynamicForm();
		form.setDataSource(ds);
		
		FormItem[] camposForm = new FormItem[camposDS.length];
		
		for (int i=0;i<camposDS.length;i++)
		{
						
			FormItem campoForm;
			
			String FK = camposDS[i].getForeignKey();
			if(FK !=null)
			{
				
				campoForm = new SelectItem(camposDS[i].getName(),camposDS[i].getTitle());
				campoForm.setOptionDataSource(DataSource.get(FK.split("\\.")[0]));
				campoForm.setDisplayField(camposDS[i].getDisplayField());
			}
			else if (camposDS[i].getType().equals(FieldType.DATETIME))
				campoForm = new DateTimeItem(camposDS[i].getName(),camposDS[i].getTitle());
			else if (camposDS[i].getType().equals(FieldType.DATE))
				campoForm = new DateItem(camposDS[i].getName(),camposDS[i].getTitle());

			else
			{
				campoForm = new TextItem(camposDS[i].getName(),camposDS[i].getTitle());

			}
			
			if(camposDS[i].getHidden())
			{
				campoForm.setVisible(false);
			}
			
			camposForm[i] = campoForm;
			
			
			
		}
	
		
		form.setFields(camposForm);
		
		
		
		
		
		
		this.addMember(form);
		
		botonera = new HLayout();
		
		botonSave = new IButton("Guardar");
		
		botonSave.addClickHandler(new ClickHandler() {
			
			@Override
			public void onClick(ClickEvent event) {
				// TODO Auto-generated method stub
			
				form.saveData(new DSCallback() {
					@Override
					public void execute(DSResponse dsResponse, Object data, DSRequest dsRequest) {
						// TODO Auto-generated method stub
						form.editNewRecord();
					}
				});
				
				String productos="Productos";
				if(ds.equals(productos))
				{
					Criteria c= new Criteria();
					DataSource.get("Productos").fetchData(c, new DSCallback() {

					@Override
					public void execute(DSResponse dsResponse, Object data,
							DSRequest dsRequest) {
						// TODO Auto-generated method stub
						final int cantidadComprada = Integer.parseInt(form.getValueAsString("Cantidad"));
						
						Record r= dsResponse.getDataAsRecordList().get(0);
						
						
						int cantidad=r.getAttributeAsInt("Stock")-cantidadComprada;
						r.setAttribute("Cantidad", r.getAttribute("Cantidad"));
						DataSource.get("Productos").updateData(r);
						
					}
		    		
		    	});
			}
			}
		});
	
		botonera.addMember(botonSave);
		
		botonRemove = new IButton("Eliminar");
		
		
		botonRemove.addClickHandler(new ClickHandler() {
			
			@Override
			public void onClick(ClickEvent event) {
				// TODO Auto-generated method stub
			
				
				if(!tree)
					tabla.removeSelectedData();
				else
					arbol.removeSelectedData();
				
				form.editNewRecord();
				
			}
		});
		
		
		botonera.addMember(botonRemove);
		
		botonClear = new IButton("Limpiar");
		
		botonClear.addClickHandler(new ClickHandler() {
			
			@Override
			public void onClick(ClickEvent event) {
				// TODO Auto-generated method stub
			
				form.editNewRecord();
				if(!tree)
					tabla.deselectAllRecords();
				else
					arbol.deselectAllRecords();
			}
		});

		botonera.addMember(botonClear);
		
		this.addMember(botonera);
		
	}
	
	
	
	
	
	public TreeGrid getArbol() {
		return arbol;
	}

	public void setArbol(TreeGrid arbol) {
		this.arbol = arbol;
	}

	public ListGrid getTabla() {
		return tabla;
	}
	public void setTabla(ListGrid tabla) {
		this.tabla = tabla;
	}
	public DynamicForm getForm() {
		return form;
	}
	public void setForm(DynamicForm form) {
		this.form = form;
	}
	public HLayout getBotonera() {
		return botonera;
	}
	public void setBotonera(HLayout botonera) {
		this.botonera = botonera;
	}
	public IButton getBotonSave() {
		return botonSave;
	}
	public void setBotonSave(IButton botonSave) {
		this.botonSave = botonSave;
	}
	public IButton getBotonRemove() {
		return botonRemove;
	}
	public void setBotonRemove(IButton botonRemove) {
		this.botonRemove = botonRemove;
	}
	public IButton getBotonClear() {
		return botonClear;
	}
	public void setBotonClear(IButton botonClear) {
		this.botonClear = botonClear;
	}
	

	
}
