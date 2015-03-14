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

		            build();
		            
		            // add listeners
		            if( base.options.doubleClick ){
		            	$( "tr", base.el ).dblclick( function(e){
		            		base.show( $(this).index() );
		            	});
		            }
		        };
		        
				
				base.show = function(rowIndex){
					if( formDiv != null ){
						formDiv.show();
						setFormValues(rowIndex);
					}

				};
				
				base.hide = function(rowIndex){
					if( formDiv != null ){
						formDiv.hide();
					}

				};
				 
				base.destroy = function(){
					 base.$el.removeData( "editrowform" );				 
				};
				
				// ---------------------------------------
				// private variables and functions
				// ---------------------------------------
		        var rowCount = 0;
		        var colCount = 0;
		        var formDiv = null;
		        var columnMap = {};

		        				
				// private functions	
		        function buildColumnMap(){
		            var columns = base.options.columns;
		        	var i = 0;
		        	var col = null;

		            if( !util.isEmpty( columns ) && $.isArray(columns) ){
		            	col = columns[i];
		            	if( !util.isEmpty( col ) ){
		            		columnMap[i] = col;
		            	}
		            	else{
		            		columnMap[i] = $(base.options.defaultColumn).clone();
		            	}
		            }
		            else{
		            	for( i = 0; i < getColumnCount(); i++ ){
		            		columnMap[i] = util.clone(base.options.defaultColumn);
		            	}
		            }
		        };
		        
				function getOptions(){
					return base.options;
				};
				
				
				function getRow( rowIndex ){
					return $( 'tbody tr', base.el ).eq( rowIndex );
				};
				
				function getCellValue( rowIndex, colIndex, row ){
					var cell = $( 'td', row )[colIndex];
					
					if( util.functionExists( getOptions().getCellValue ) ){
						return getOptions().getCellValue( rowIndex, colIndex, cell );
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
				
				
				function setFormValues(rowIndex){
					var row = getRow( rowIndex );
					for( var i = 0; i < colCount; i++ ){
						var value = getCellValue( rowIndex, i, row );
						$( "#" + idGen.getInputId( i ) ).val( value );
					}
				};
				
				
				function build(){
					buildColumnMap();
					buildForm();
				};
				
				
				function buildForm(){
					var div = $( template.div );
					div.attr( "id", idGen.getEditRowFormId() );
					div.addClass( "erf" );	
					div.hide();
					div.appendTo( document.body );
		
					var form = $( template.form );
					form.attr( "id", idGen.getFormId() );
					form.addClass( "form" );
					form.appendTo( div );				
							
					var row = buildFormRow();
					row.appendTo( form );	
					
					formDiv = div;
				};
								
				
				function buildFormRow(){
					var div = $( template.div );
					div.attr( "id", idGen.getFormRowId() );
					div.addClass( "row" );
					
					var cell = null;
					for( var i = 0; i < colCount; i++ ){
						cell =  buildFormCell( i );
						cell.appendTo( div );
					}				
					return div;
				};
								
				
				function buildFormCell(colIndex){
					var div = $( template.div );
					div.attr( "id", idGen.getFormCellId( colIndex ) );
					div.addClass( "cell" );					
					var input = getInput( colIndex );	
					input.appendTo( div );			
					return div;
				};
				
				
				function getColumnType(colIndex){
					return "text";
				};
				
				
				function getInput( colIndex ){
					var input = null;
					var inputId = idGen.getInputId(colIndex);
					var colType = getColumnType( colIndex );

					if( colType == "checkbox" ){
						input = $( template.checkbox );
					}
					else {
						input = $( template.textfield );
					}	
					
					input.attr( "id", inputId );
					return input;
				};
				
			
				
				var idGen = {
						idPrefix: "erf-",
						
						getEditRowFormId: function( colIndex ){
							var id = options.id;
							if( util.isEmpty( id ) ){
								id = base.el.id;
							}
							
							if( util.isEmpty( id ) ){
								id = "defaultid";
							}			
							return this.idPrefix + id;
						},
						
						getInputId: function( colIndex ){
							return this.getEditRowFormId() + "-input" + colIndex;
						},
						
						getFormCellId: function( colIndex ){
							return this.getEditRowFormId() + "-cell-" + colIndex;
						},
						
						getFormRowId: function( ){
							return this.getEditRowFormId() + "-row";
						},
												
						getFormId: function( ){
							return this.getEditRowFormId() + "-form";
						}								
				};
				

				var util = {
						functionExists: function( myFunc ){
							return typeof myfunc !== 'undefined' && $.isFunction(myfunc);
						},
						
						isEmpty: function( text ){
							return ( 
									 text == null || text === null || 
									 text === undefined || 
									 $.trim(text) == 'null' || 
									 $.trim(text) == '' 
								   );							
						},
						
						getTableWidth: function( table ){
							return $(table).width();
						},
						
						clone: function( obj ){
							return $.extend(true, {}, obj);
						}
				};
				
				
				var template = {
						div: "<div />",
						form: "<form />",
						textfield: "<input type='text' />",
						checkbox: "<input type='checkbox' />"
				};

		    };
		    
		    


		    
			
			// Default options
		    $.editrowform.defaultOptions = {
		    		id: "",
		    		columns: "",
		    		defaultColumn: {
		    			colType: "text",
		    			editable: true
		    		},
		    		doubleClick: true,
		    		getCellValue: ""
		    };
		    
		    
		}

);