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
						var row = getRow(rowIndex );

						// position form
						var positionOfRow = $( row ).position();
						util.position( $formDiv, positionOfRow.top, positionOfRow.left );					
						$formDiv.show();
						setFormValues(rowIndex);
						
						var offset = getButtonBarOffset( $buttonBar );
						$buttonBar.css({left: offset, position:'absolute'});
						
						
						// set plugin global
						$currentRow = row;	
						$currentRowIndex = rowIndex;
					}

				};
				
				base.hide = function(){
					if( $formDiv != null ){
						$formDiv.hide();
					}
				};
				
				
				base.save = function(e){	
					var i, inputValue;
					var saved = true;
					
					var onSave = getOptions().onSave;			
					if( util.functionExists( onSave ) ){
						saved = onSave(e, $form, $currentRow);	
					}
					
					if( saved || util.isEmpty(saved) ){
						for( i = 0; i < getColumnCount(); i++ ){
							inputValue = getInputValue( i, $form );
							setCellValue( $currentRowIndex, i, inputValue, $currentRow );
						}
						base.hide();
					}
				};
					
				base.cancel = function (e){
					var hide = true;
					
					var onCancel = getOptions().onCancel;		
					if( util.functionExists( onCancel ) ){
						hide = onCancel( e, $form, $currentRow);
					}			
					
					if( hide || util.isEmpty( hide ) ){
						base.hide();
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
		        var $buttonBar = null;
		        var $currentRow = null;
		        var $currentRowIndex = null;
		        var INPUT_OFFSET = 4;

		        				
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
				
				
				function getCellValue( rowIndex, colIndex, row ){
					var cell = getCell( colIndex, row );
					var value = $(cell).html().trim();
			
					var getCellValueFunc = getOptions().getCellValue;
					if( util.functionExists(  getCellValueFunc ) ){
						value = getCellValueFunc( value, cell, rowIndex, colIndex, row );
					}

					return value;
				};
				
				function setCellValue( rowIndex, colIndex, value, row ){
					var cell = getCell( colIndex, row );
					$( cell ).html( value );
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
						value = getCellValue( rowIndex, i, row );
						inputId = idGen.getInputId( i );
						colType = getColumnType( i );
						setInputValue( inputId, value, $form, row  );
					}
				};
				
				
				function setInputValue( inputId, value, form, row ){	
					var func = getOptions().setInputValue;
					if( util.functionExists(  func ) ){
						func( inputId, value, form, row );
					}
					else{
						$( "#" + inputId, form ).val( value );
					}
				};
				
				
				function getInputValue( colIndex, form ){
					var value;
					
					input = $( ".col-" + colIndex , form );
					if( util.isNotEmpty( input ) ){
						value = $(input).val();
					}
					
					return value;
				};
				
				
				function renderInput( colIndex, width  ){
					var inputId = idGen.getInputId(colIndex);
					var inputName = idGen.getInputName(colIndex);
					var colType = getColumnType( colIndex );
					var input;
					
					if( colType == "checkbox" ){
						input = $( template.checkbox );
					}
					else {
						input = $( template.textfield );
					}					
					input.prop( "id", inputId );
					input.prop( "name", inputName );
					input.width( width );
					
					// Check if a function was passed into the option and execute that
					var func = getOptions().renderInput;
					if( util.functionExists(  func ) ){
						input = $(func( input, colIndex, width ));
						// input must have an id!!
						if( util.isEmpty( input.prop("id")) ){
							input.prop("id", inputId);
						}
					}
					
					input.addClass( "col-" + colIndex );
									
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
					div.prop( "id", idGen.getEditRowFormId() );
					div.addClass( "erf" );
					div.addClass( getOptions().cssClass );
					div.width( util.getWidth(base.el) );
					div.height( getRowHeight() );
					div.hide();
					div.appendTo( document.body );		
			
					var form = $( template.form );
					form.prop( "id", idGen.getFormId() );
					form.addClass( "form" );
					form.appendTo( div );				
							
					var row = buildFormRow();
					row.appendTo( form );	
					
					var buttonBar = buildButtonBar();
					buttonBar.appendTo( div );
					
					// add to plugin global scope
					$buttonBar = buttonBar;
					$formDiv = div;
					$form = form
					
				};
								
				
				function buildFormRow(){
					var div = $( template.div );
					div.prop( "id", idGen.getFormRowId() );
					div.height( getRowHeight() );
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
					div.prop( "id", idGen.getFormCellId( colIndex ) );
					div.addClass( "cell" );						
					div.width(  width );
							
					// offset the size of the input
					var offsetWidth = width - INPUT_OFFSET;
					var input = renderInput( colIndex, offsetWidth );	
					input.appendTo( div );			
					return div;
				};
				
				
				function buildButtonBar(){
					var div = $( template.div );

					var save = $( template.button );
					save.prop( "id", idGen.getSaveButtonId() );
					save.addClass( "save");
					save.appendTo( div );
					save.html( getOptions().saveText );
					save.on( "click", base.save );
					
					var cancel = $( template.button );
					cancel.prop( "id", idGen.getCancelButtonId() );
					cancel.addClass( "cancel");
					cancel.appendTo( div );
					cancel.html( getOptions().cancelText );
					cancel.on( "click", base.cancel );
					
					var wrapper = $( template.div );
					wrapper.addClass( "save-and-cancel-bar" );	
					div.appendTo( wrapper );
					
					return wrapper;
				};
				
				function getButtonBarOffset( bar ){
					var barWidth = $(bar).innerWidth();
					var width = base.$el.innerWidth();
					var space = (width - barWidth)/2;
					return space;
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
				
				function getRowHeight(){
					var row = getRow( 0 );
					if( util.isNotEmpty( row ) ){
						return $(row).innerHeight();
					}
							
					return 0;
				};
							
				
				var idGen = {
						idSuffix: "-erf",
						
						getEditRowFormId: function( colIndex ){
							var id = base.options.id;
							if( util.isEmpty( id ) ){
								id = base.el.id;
							}
							
							if( util.isEmpty( id ) ){
								id = "noid";
							}			
							return  id + this.idSuffix;
						},
						
						getInputId: function( colIndex ){
							var id = $columnMap[colIndex].id;
							if( util.isNotEmpty( id ) ){
								return id;
							}
							
							// get header name
							var header = getHeader( colIndex );
							id = $(header).html().trim()
							if( util.isNotEmpty( id ) ){
								return this.getEditRowFormId() + "-" + id;
							}
							
							// default to generating an id
							return this.getEditRowFormId() + "-input" + colIndex;
						},
						
						
						getInputName: function( colIndex ){
							var name = $columnMap[colIndex].name;
							if( util.isNotEmpty( name ) ){
								return name;
							}
							
							// get header name
							var header = getHeader( colIndex );
							name = $(header).html().trim()
							if( util.isNotEmpty( name ) ){
								return name;
							}
							
							// default to generating an id
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
		    		click: true,
		    		saveText: "Save",
		    		cancelText: "Cancel",
		    		defaultColumn: {
		    			id: "",
		    			name: "",
		    			width: "",
		    			height: "",
		    			type: "text",
		    			editable: true
		    		},
	
		    		/* function(event, form, row){} */
		    		onSave: "",
		    		
		    		/* function(event, form, row){} */
		    		onCancel: "",

		    		/* function(value, cell, rowIndex, colIndex, row){} */
		    		getCellValue: "", 
		    		
		    		/* function(inputId, value, colType, rowIndex, i, row, cell ){} */
		    		setInputValue: "", 
		    		
		    		/* function(input, colIndex, width){} */
		    		renderInput: "" 
		    };
		    
		    
		}

);