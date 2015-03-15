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

		            build();
		            
		            // add listeners
		            if( base.options.click ){
		            	$( "tr", base.el ).dblclick( function(e){
		            		base.show( $(this).index() );
		            	});

		            	$( "tr", base.el ).on( "click", function(e){
		            		if( !util.isHidden( $formDiv ) ){
		            			setFormValues( $(this).index() );
		            		}	
		            	});
		            	
		            }
		        };
		        
				
				base.show = function(rowIndex){
					if( $formDiv != null ){
						$formDiv.show();
						setFormValues(rowIndex);
					}

				};
				
				base.hide = function(){
					if( $formDiv != null ){
						$formDiv.hide();
					}
				};
				
				
				base.save = function(e){	
					var onSave = getOptions().onSave;
					
					if( util.functionExists( onSave ) ){
						onSave(e, $form);	
					}
				};
					
				base.cancel = function (e){
					base.hide();
					
					var onCancel = getOptions().onCancel;		
					if( util.functionExists( onCancel ) ){
						onCancel( e, $form);
					}				
				};
				 
				base.destroy = function(){
					 base.$el.removeData( "editrowform" );				 
				};
				
				// ---------------------------------------
				// private variables and functions
				// ---------------------------------------
		        var $rowCount = null;
		        var $colCount = null;
		        var $formDiv = null;
		        var $form = null;
		        var $columnMap = {};

		        				
				// private functions	
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
					if( util.isEmpty($colCount) ){
						$colCount = $( 'td', getRow(0) ).length;
					}
					return $colCount;
				};
				
				function getRowCount(){
					if( util.isEmpty($rowCount) ){
						$rowCount = $( 'tbody tr', base.el ).length;
					}				
					return $rowCount;			
				};
				
				
				function setFormValues(rowIndex){
					var row = getRow( rowIndex );
					for( var i = 0; i < getColumnCount(); i++ ){
						var value = getCellValue( rowIndex, i, row );
						$( "#" + idGen.getInputId( i ) ).val( value );
					}
				};
				
		
				
				function build(){
					buildColumnMap();
					buildForm();				
				};
				

		        function buildColumnMap(){
		            var columns = base.options.columns;
		        	var i = 0;
		        	var col, index;
		        	var columnMap = {};
		        	
		        	// fill with default values;
	            	for( i = 0; i < getColumnCount(); i++ ){
	            		columnMap[i] = util.clone(base.options.defaultColumn);
	            	}
		        	            	
		            if( !util.isEmpty( columns ) && $.isArray(columns) ){
		            	for( i = 0; i < columns.length; i++ ){
		            		col = columns[i];
			            	if( !util.isEmpty( col ) ){
			            		index = col.colIndex || i;            		
			            		columnMap[index] = col;
			            	}
		            	}
		            }
		            
		            $columnMap = columnMap;
		        };
		        
				
				
				function buildForm(){
					var div = $( template.div );
					div.attr( "id", idGen.getEditRowFormId() );
					div.addClass( "erf" );
					div.addClass( getOptions().cssClass );
					div.hide();
					div.appendTo( document.body );
		
					var form = $( template.form );
					form.attr( "id", idGen.getFormId() );
					form.addClass( "form" );
					form.appendTo( div );				
							
					var row = buildFormRow();
					row.appendTo( form );	
					
					var saveAndCancel = buildSaveAndCancelButton();
					saveAndCancel.appendTo( div );
					
					// add to plugin global scope
					$formDiv = div;
					$form = form
				};
								
				
				function buildFormRow(){
					var div = $( template.div );
					div.attr( "id", idGen.getFormRowId() );
					div.addClass( "row" );
					
					var cell = null;
					for( var i = 0; i < getColumnCount(); i++ ){
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
				
				
				function buildSaveAndCancelButton(){
					var div = $( template.div );
					div.addClass( "save-and-cancel-bar" );	
					
					var save = $( template.button );
					save.attr( "id", idGen.getSaveButtonId() );
					save.addClass( "save");
					save.appendTo( div );
					save.html( getOptions().saveText );
					save.on( "click", base.save );
					
					var cancel = $( template.button );
					cancel.attr( "id", idGen.getCancelButtonId() );
					cancel.addClass( "cancel");
					cancel.appendTo( div );
					cancel.html( getOptions().cancelText );
					cancel.on( "click", base.cancel );
					
					return div;
				};
				
				function getColumnType(colIndex){
					return $columnMap[colIndex].colType;
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
							var id = base.options.id;
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
						},
						
						getSaveButtonId: function( ){
							return this.getEditRowFormId() + "-save";
						},
						
						getCancelButtonId: function( ){
							return this.getEditRowFormId() + "-cancel";
						}	
				};
				

				var util = {
						functionExists: function( func ){
							return typeof func !== 'undefined' && $.isFunction(func);
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
						},
						
						isHidden: function( el ){
							return $(el).css('display') == 'none';
						}
				};
				
				
				var template = {
						div: "<div />",
						form: "<form />",
						button: "<button />",
						textfield: "<input type='text' />",
						checkbox: "<input type='checkbox' />"
				};

		    };
		    
		    
			
			// Default options
		    $.editrowform.defaultOptions = {
		    		id: "",
		    		cssClass: "",
		    		columns: "",
		    		defaultColumn: {
		    			colType: "text",
		    			editable: true
		    		},
		    		click: true,
		    		getCellValue: "",
		    		onSave: "",
		    		onCancel: "",
		    		saveText: "Save",
		    		cancelText: "Cancel"
		    };
		    
		    
		}

);