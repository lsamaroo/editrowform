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
		            			base.show( $(this).index() );
		            		}	
		            	});
		            	
		            }
		        };
		        
				
				base.show = function(rowIndex){
					if( $formDiv != null ){
						// position form
						var positionOfRow = $(getRow(rowIndex )).position();
						util.position( $formDiv, positionOfRow.top, positionOfRow.left );					
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
				
				function getHeaderRow(){
					var header = $( 'thead tr', base.el );
					if( util.isEmpty( header ) ){
						// find parent of a th
						header = $( 'th', base.el ).parent;
					}					
					return header;
				};
				
				function getHeader( colIndex ){
					var headerRow = getHeaderRow();
					var header;				
					if( util.isNotEmpty( headerRow ) ){
						header = $( "th", headerRow )[colIndex];
					}					
					return header;
				};
				
							
				function getRow( rowIndex ){
					return $( 'tbody tr', base.el ).eq( rowIndex );
				};
				
				
				function getCell( colIndex, row ){
					var cell;
					if( util.isNotEmpty( row ) ){
						cell = $( 'td', row )[colIndex];;
					}
					return cell;
				};
				
				
				function getCellValue( cell, rowIndex, colIndex, row ){
					var value = $(cell).html().trim();
			
					var getCellValueFunc = getOptions().getCellValue;
					if( util.functionExists(  getCellValueFunc ) ){
						value = getCellValueFunc( value, cell, rowIndex, colIndex, row );
					}

					return value;
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
					var i, value, inputId, colType, cell;
					
					for( i = 0; i < getColumnCount(); i++ ){
						cell = getCell( i, row );
						value = getCellValue( cell, rowIndex, i, row );
						inputId = idGen.getInputId( i );
						colType = getColumnType( i );
						setInputValue( inputId, value, colType, rowIndex, i, row, cell );
					}
				};
				
				
				function setInputValue( inputId, value, colType, rowIndex, colIndex, row, cell ){	
					var func = getOptions().setInputValue;
					if( util.functionExists(  func ) ){
						func( inputId, value, colType, rowIndex, colIndex, row );
					}
					else{
						$( "#" + inputId ).val( value );
					}
				};
				
				
				function renderInput( colIndex, width  ){
					var inputId = idGen.getInputId(colIndex);
					var inputName = "";
					var colType = getColumnType( colIndex );
					var input;
					
					if( colType == "checkbox" ){
						input = $( template.checkbox );
					}
					else {
						input = $( template.textfield );
					}					
					input.attr( "id", inputId );	
					input.width( width );
					
					// Check if a function was passed into the option and execute that
					var func = getOptions().renderInput;
					if( util.functionExists(  func ) ){
						input = $(func( input, colIndex, width ));
						// input must have an id!!
						if( util.isEmpty( input.attr("id")) ){
							input.attr("id", inputId);
						}
					}
									
					return input;
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
		        	            	
		            if( util.isNotEmpty( columns ) && $.isArray(columns) ){
		            	for( i = 0; i < columns.length; i++ ){
		            		col = columns[i];
			            	if( util.isNotEmpty( col ) ){
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
					div.width( util.getWidth(base.el) );
					div.hide();
					div.appendTo( document.body );		
			
					var form = $( template.form );
					form.attr( "id", idGen.getFormId() );
					form.addClass( "form" );
					form.appendTo( div );				
							
					var row = buildFormRow();
					row.appendTo( form );	
					
					var wrapper = $( template.div );
					var saveAndCancel = buildSaveAndCancelButton();
					saveAndCancel.appendTo( wrapper );
					wrapper.appendTo( div );
					
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
					var width = getColumnWidth(colIndex);
					var div = $( template.div );
					div.attr( "id", idGen.getFormCellId( colIndex ) );
					div.addClass( "cell" );						
					div.width(  width );
					//div.height( getColumnHeight(colIndex) );
								
					var input = renderInput( colIndex, width );	
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
					return $columnMap[colIndex].type;
				};
				
				function getColumnWidth(colIndex){
					var width = $columnMap[colIndex].width;
					if( util.isNotEmpty( width ) ){
						return width;
					}
					
					// check for header
					var header = getHeader(colIndex);
					if( util.isNotEmpty( header ) ){
						var innerWidth = $(header).innerWidth();
						var width = $(header).innerWidth();
						return $(header).innerWidth();
					}
					
					var cell = getCell( colIndex, getRow( 0 ) );
					if( util.isNotEmpty( cell ) ){
						return $(cell).innerWidth();
					}
					
					return 0;
				};
				
				
				function getColumnHeight(colIndex){
					var height = $columnMap[colIndex].height;
					if( util.isNotEmpty( height ) ){
						return height;
					}
					
					// check for header
					var header = getHeader(colIndex);
					if( util.isNotEmpty( header ) ){
						return $(header).innerHeight();
					}
					
					var cell = getCell( colIndex, getRow( 0 ) );
					if( util.isNotEmpty( cell ) ){
						return $(cell).innerHeight();
					}
							
					return 0;
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
						
						isEmpty: function( obj ){
							return ( 
									obj == null || obj === null || 
									obj === undefined ||  
									typeof obj === 'undefined' ||
									 $.trim(obj) == 'null' || 
									 $.trim(obj) == '' ||
									 ( $.isArray( obj ) && obj.length == 0 )
								   );							
						},
						
						isNotEmpty: function( obj ){
							return ! this.isEmpty( obj );
						},
						
						getWidth: function( el ){
							return $(el).width();
						},
						
						clone: function( obj ){
							return $.extend(true, {}, obj);
						},
						
						isHidden: function( el ){
							return $(el).css('display') == 'none';
						},
						
						position: function( obj, top, left ){
							$( obj ).css({top: top, left: left, position:'absolute'});
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
		    			name: "",
		    			width: "",
		    			height: "",
		    			type: "text",
		    			editable: true
		    		},
		    		click: true,
		    		onSave: "",
		    		onCancel: "",
		    		saveText: "Save",
		    		cancelText: "Cancel",

		    		/* function(value, cell, rowIndex, colIndex, row){} */
		    		getCellValue: "", 
		    		
		    		/* function(inputId, value, colType, rowIndex, i, row, cell ){} */
		    		setInputValue: "", 
		    		
		    		/* function(input, colIndex, width){} */
		    		renderInput: "" 
		    };
		    
		    
		}

);