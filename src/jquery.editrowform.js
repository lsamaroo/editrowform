/*!
 * Edit Row Form v1.0
 * Docs & License: http://coreleo.com/editrowform/
 * (c) 2015 Leon Samaroo
 */

!function(root, factory) {
	if (typeof define === 'function' && define.amd) {
		define([ 'jquery' ], factory);
	} 
	else {
		factory(root.jQuery);
	}
}( this, 

		function($){
	
		    // Add plugin to JQuery
		    $.fn.editrowform = function(options){
		    	var args = Array.prototype.slice.call(arguments, 1); // for a possible method call
		    	var ret = this; // what this function will return (this jQuery object by default)
		    	var singleRes; // the returned value of this single method call
		
		        this.each(function(i, el){
		        	var element = $(el);
			    	var thisplugin = element.data('editrowform'); // get the existing plugin object (if any)
									
					// a method call
					if (typeof options === 'string') {
						if (thisplugin && $.isFunction(thisplugin[options])) {
							singleRes = thisplugin[options].apply(thisplugin, args);
							if (!i) {
								ret = singleRes; // record the first method call result
							}
						}					
					}
					// a new plugin initialization
					else {
						thisplugin = (new $.editrowform(el, options));
						thisplugin.init();
					}
		        });
		        
		        return ret;
		    };	
	

		    
		    // Plugin definition
		    $.editrowform = function(el, options){	    	
		        // To avoid scope issues, use 'base' instead of 'this'
		        // to reference this class from internal events and functions.
		        var base = this;
		        
		        // Access to jQuery and DOM versions of element
		        base.$el = $(el);
		        base.el = el;
		        
		        
		        base.init = function(){
			        // Add a reverse reference to the DOM object
			        base.$el.data("editrowform", base);
		            base.options = $.extend({},$.editrowform.defaultOptions, options);
		            rowCount =  getRowCount();
		            colCount =  getColumnCount();	
		            
		            buildFormDiv();
		        };
		        
				
				base.showForm = function(rowIndex){
					if( formDiv != null ){
						formDiv.show();
					}

				};
				
				base.hideForm = function(rowIndex){
					if( formDiv != null ){
						formDiv.hide();
					}

				};
				 
				base.destroy = function(){
					 base.$el.removeData( "editrowform" );				 
				};
				

				//private variables
		        var rowCount = 0;
		        var colCount = 0;
		        var formDiv = null;
		        var formDivTemplate = "<div id='{id}' style='display:none' class='erf'>{formContent}</div>";
		        var formTemplate = "<form id='{id}' class='form'>{formContent}</form>";
		        var formRowTemplate = "<div id='{id}' class='row'>{rowContent}</div>";
		        var formCellTemplate = "<div id='{id}' class='cell'>{cellContent}</div>";
				
				// private functions
		        
		        
		        function getIdPrefix(){
		        	return "erf-";
		        };
		        		        
		        function getTableId(){
					var tableId = base.el.id;
					if( isEmpty( tableId ) ){
						tableId = "table-id";
					};					
					return tableId;
		        };
		        
				function getRow( rowIndex ){
					return $( 'tbody tr', base.el ).eq( rowIndex );
				};
				
				function getCellValue( rowIndex, colIndex, row ){
					var cell = $( 'td', row )[colIndex];
					
					if( functionExists( base.options.getCellValue ) ){
						return base.options.getCellValue( rowIndex, colIndex, cell );
					}
					else{
						return $(cell).html().trim();
					}
					
					return base.getCellValue( rowIndex, colIndex, cell );
				};
				
				function getColumnCount(){
					return $( 'td', getRow(0) ).length;
				};
				
				function getRowCount(){
					return $( 'tbody tr', base.el ).length;
				};
				
				
				function buildFormDiv(){
					var template = formDivTemplate;
					template = template.replace( "{id}", getIdPrefix() + getTableId() );
					template = template.replace( "{formContent}", buildForm() );
										
					formDiv = $( template  );
					formDiv.appendTo( document.body );
				}
				
				
				function buildForm(){
					var template = formTemplate;
					template = template.replace( "{id}", getIdPrefix() + getTableId() + "-form" );
					template = template.replace( "{formContent}", buildFormRow() );
					return template;
				}
				
				
				function buildFormRow(){
					var temp = "";
					for( var i = 0; i < colCount; i++ ){
						temp = temp + buildFormCell( i );
					}
					
					var template = formRowTemplate;
					template = template.replace( "{id}", getIdPrefix() + getTableId() + "-row" );
					template = template.replace( "{rowContent}", temp );
					return template;
				}
				
				
				function buildFormCell(colIndex){
					var input = getInput( colIndex );				
					var template = formCellTemplate;
					template = template.replace( "{id}", getIdPrefix() + getTableId() + "-cell-" + colIndex );
					template = template.replace( "{cellContent}", input );			
					return template;
				}
				
				
				function getColumnType(colIndex){
					return "text";
				}
				
				function getInput( colIndex ){
					var colType = getColumnType( colIndex );
					if( colType == "checkbox" ){
						return "<input type='checkbox' />";
					}
					else {
						return "<input type='text' />";
					}
					
				}
				
				
				function functionExists( myfunc ){
					return typeof myfunc !== 'undefined' && $.isFunction(myfunc)
				};
				
				
				function isEmpty(text){
					return ( 
							 text == null || text === null || 
							 text === undefined || 
							 $.trim(text) == 'null' || 
							 $.trim(text) == '' 
						   );
				};

		    };
		    
		    
			
			// Default options
		    $.editrowform.defaultOptions = {
		    		getCellValue: ""
		    };
		    
		    
		}

);