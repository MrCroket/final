package com.smartgwt.sample.client;

import com.smartgwt.client.data.DSCallback;
import com.smartgwt.client.data.DSRequest;
import com.smartgwt.client.data.DSResponse;
import com.smartgwt.client.data.DataSource;
import com.smartgwt.client.data.RecordList;
import com.smartgwt.client.types.ChartType;
import com.smartgwt.client.widgets.chart.FacetChart;
import com.smartgwt.client.widgets.cube.Facet;
import com.smartgwt.client.widgets.layout.VLayout;

public class Chart extends VLayout {
	private FacetChart chart;
	private String facet, val, titulo;
	private VLayout esto;
	
	Chart(String data, String faceta, String valor, String title){
		
		DSRequest req = new DSRequest();
    	req.setOperationId("queryDashboard");
    	esto=this;
		facet=faceta;
		val=valor;
		titulo=title;
		
     DataSource.get(data).fetchData(null, new DSCallback() {
  			
  			@Override
  			public void execute(DSResponse dsResponse, Object data, DSRequest dsRequest) {
  				// TODO Auto-generated method stub										
  				RecordList rl = dsResponse.getDataAsRecordList();  		
  				chart = new FacetChart();
  		        chart.setData(rl);			        	        
  		        chart.setFacets(new Facet(facet, facet));  
  		        chart.setValueProperty(val);  
  		        chart.setChartType(ChartType.PIE);  
  		        chart.setTitle(titulo);	
  		        chart.setHeight("50%");
  		        chart.setWidth100();
  		        //distribucion.addMember(chart);	
  		      esto.addMember(chart);
  			}
  		}, req);	
    
	}

}
