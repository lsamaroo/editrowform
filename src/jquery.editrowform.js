/*!
 * Edit Row Form v1.2.2
 * Docs & License: https://github.com/lsamaroo/editrowform
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

					// a new plug-in initialization because one does not exist
					else if( !thisplugin ){
						thisplugin = (new $.editrowform(el, options));
					}
		        });
		        
		        return ret;
		    };	
	

		    
		    // Plugin definition
		    $.editrowform = function(el, options){	    	
		        var base = this;
		        
		        // Access to jQuery and DOM versions of element
		        base.$el = $(el);
		        base.el = el;
		        
    
		        // ---------------------------------------
				// Public API
				// ---------------------------------------
		        
		        /* 
		         * Add a row to the table. In order to create the new row, it clones the last row of the table. If none exists, it will 
		         * create a brand new row.
		         * 
		         * Returns the rowIndex of the newly created row or false if the function call did not add the row.
		         * 
		         * function(){}
		         * 
		         * 
		         */	        
		        base.addRow = addRow;
				
				
		        /* 
		         * Remove the indicated row from the table.  This will remove it from the DOM 
		         *
		         *  function( rowIndex ){}
		         *   
		         */
		        base.deleteRow = deleteRow;
		        

		        /* 
		         * Set the value for the given row index.  Takes an array of values.
		         *
		         *  function( rowIndex, rowValues ){}
		         *   
		         */
		        base.setRowValues = setRowValues; 
				
				
				/* Shows the edit form for the specified row.  If the row index is not valid, it will not do nothing 
				 * 
				 * function( rowIndex ){} 
				 * 
				 */
				base.show = show;
				
				
				/* Hide the edit form if it is currently visible 
				 * 
				 * function( rowIndex ){} 
				 * 
				 */
				base.hide = hide;
				
				
				/* Remove the plugin from the DOM and cleanup 
				 * 
				 * function( rowIndex ){} 
				 * 
				 */
				base.destroy = destroy;
				
				
				/* Get the number of rows in the table 
				 * 
				 * function(){} 
				 * 
				 */
				base.getRowCount = getRowCount;
				
				
				/* Get the number of columns in the table 
				 * 
				 * function(){} 
				 * 
				 */
				base.getColumnCount = getColumnCount;
		
				
				
				// ---------------------------------------
				// Private variables and functions
				// ---------------------------------------
		        var INPUT_OFFSET = 4;
		        var PLUGIN_CSS_CLASS = "erf";
		        var INPUT_CLASS_PREFIX = "input-";
		        var CELL_CLASS_PREFIX = "cell-";
		        var DEFAULT_COL_TYPE = "text";
		        var $columnMap = {};
		        var $formDiv = null;
		        var $form = null;
		        var $buttonBar = null;
		        var $currentRow = null;
		        var $currentRowIndex = null;
		        
		        	        
		        function init(){
			        // Add a reverse reference to the DOM object
			        base.$el.data("editrowform", base);
		            base.options = $.extend({},$.editrowform.defaultOptions, options);

		            build();
		            
		            // add listeners
		            if( base.options.click ){
		            	$( "tr", base.el ).dblclick( function(e){
		            		doubleClick( this );
		            	});

		            	$( "tr", base.el ).on( "click", function(e){
		            		singleClick( this );
		            	});
		            	
		            }
		        };
		        
		        function doubleClick( tr ){
		        	show( $(tr).index() );
		        };
		        
		        
		        function singleClick( tr ){
            		if( !util.isHidden( $formDiv ) ){
            			show( $(tr).index() );
            		}	        	
		        };
		        
		      
				function save(event){	
					var i, inputValue;
					var saved = true;
					var rowValues = [];
					
					for( i = 0; i < getColumnCount(); i++ ){
						inputValue = getInputValue( i );
						rowValues.push( inputValue );						
					}	
									
					var onSave = getOptions().onSave;			
					if( util.functionExists( onSave ) ){
						saved = onSave(event, $form, $currentRowIndex, $currentRow, rowValues);	
					}
					
					if( saved || util.isEmpty(saved) ){					
						setRowValues( $currentRowIndex, rowValues );				
						hide();
					}
				};
					
				
				function cancel (event){
					var cancelled = true;
					
					var onCancel = getOptions().onCancel;		
					if( util.functionExists( onCancel ) ){
						cancelled = onCancel( event, $form, $currentRowIndex, $currentRow);
					}			
					
					if( cancelled || util.isEmpty( cancelled ) ){
						hide();
					}					
				};	
				
				
		        function addRow(){
		        	var add = true;
		        	var rowCount = getRowCount();     	
		        	var newRow = rowCount == 0 ? createRow() : cloneLastRow();
	
					var onAddRow = getOptions().onAddRow;		
					if( util.functionExists( onAddRow ) ){
						add = onAddRow( event, rowCount, newRow);
					}	

					if( ( add || util.isEmpty( add ) ) && !util.isEmpty( newRow ) ){					
						// add click listener if it's enabled
						if( getOptions().click ){
							newRow.dblclick( function( e){
								doubleClick( this );
							});
							
							newRow.click( function( e){
								singleClick( this );
							});
						}
						
						// add the new row to the table
						newRow.appendTo( base.$el );
						return rowCount;
					}
					else {
						return false;
					}
				};
				
				function cloneLastRow(){
		        	var rowCount = getRowCount();
		        	var row = getRow( getRowCount() - 1 );
		        	var newRow = $(row).clone();
		        	
		        	// blank out any id and data
		        	newRow.prop( "id", "");
		        	$( "td", newRow ).html( "&nbsp;" );
		        	
		        	return newRow;
				};
				
				
				function createRow(){
					var columnCount = getColumnCount();
					var row = $( template.tr );
					var cell;
					
					for( var i = 0; i < columnCount; i++ ){
						cell = $( template.td );
						cell.appendTo( row );
						cell.html( "&nbsp;" );
					}
					
					return row;
				}
				
				
		        function deleteRow(rowIndex){
					if( ! isValidRowIndex(rowIndex) ){
						return;
					}
					
		        	var deleted = true;
		        	var row = getRow( rowIndex );
		        	
					var onDeleteRow = getOptions().onDeleteRow;		
					if( util.functionExists( onDeleteRow ) ){
						deleted = onDeleteRow( event, rowIndex, row);
					}	

					if( (deleted || util.isEmpty( deleted ) ) && !util.isEmptyArray(row) ){
						// remove the row from the DOM.
						row.remove();
					}
				};
				
				
				function setRowValues( rowIndex, rowValues ){
					if( !isValidRowIndex(rowIndex) ){
						return;
					}
					
					for( i = 0; i < getColumnCount(); i++ ){
						if( !isDisabled( i ) && !ignoreColumn(i) ){
							setCellValue( rowIndex, i, rowValues[i] );
						}
					}
				};
				
				
				function show(rowIndex){
					if( ! isValidRowIndex(rowIndex) ){
						return;
					}
					
					if( $formDiv != null ){
						setPluginWidthHeightForRow( rowIndex );
						
						var row = getRow(rowIndex );

						// position form
						var positionOfRow = $( row ).position();
						util.position( $formDiv, positionOfRow.top, positionOfRow.left );					
						$formDiv.show();
						setFormValues(rowIndex);
						
						setButtonBarPosition();
						
						// set plugin global
						$currentRow = row;	
						$currentRowIndex = rowIndex;
					}

				};
				
				
				/* Hide the edit form if it is currently visible */
				function hide(){
					if( $formDiv != null ){
						$formDiv.hide();
					}
				};
				
				
				/* Remove the plugin from the DOM and cleanup */
				function destroy(){
					 base.$el.removeData( "editrowform" );	
					 if( $formDiv ){
						 $formDiv.remove();
						 $formDiv = null;
					 }
				};				
		        

				function getOptions(){
					return base.options;
				};
				
				
				function getHeaderRow(){
					var header = $( 'thead tr', base.el );
					if( util.isNotEmpty( header ) ){
						return header;
					}					
					return $( 'th', base.el ).parent();
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
				
				
				function getCell( rowIndex, colIndex ){
					var row = getRow( rowIndex );
					var cell;
					if( util.isNotEmpty( row ) ){
						cell = $( 'td', row )[colIndex];;
					}
					return cell;
				};
				
				
				function getCellValue( rowIndex, colIndex ){
					var value;
					var cell = getCell( rowIndex, colIndex );
					var colType = getColumnType( colIndex );
					
					var input = $( "input", cell );
					if( !util.isEmptyArray( input) ){
						value = inputUtil.getValue( input, colType  );
					}
					else{
					   value = $(cell).text().trim();
					}
			
					var getCellValueFunc = getOptions().getCellValue;
					if( util.functionExists(  getCellValueFunc ) ){
						value = getCellValueFunc( rowIndex, colIndex, value, getRow(rowIndex), cell );
					}
					return value;
				};
				
				
				function setCellValue( rowIndex, colIndex, value ){
					var colType = getColumnType( colIndex );
					var cell = getCell( rowIndex, colIndex );
					var input;

					var func = getOptions().setCellValue;
					if( util.functionExists(  func ) ){
						func( rowIndex, colIndex, value, getRow( rowIndex ), cell );
					}
					else{
						input = $( "input", cell );
						if( !util.isEmptyArray( input) ){
							inputUtil.setValue( input, colType, value);
						}
						else{
							$( cell ).text( value );	
						}
					}
				};
				
				
				function getColumnCount(){
					var headerRow = getHeaderRow();
					if( !util.isEmptyArray( headerRow ) ){
						return $( 'th', headerRow ).length;
					}
					else{
						return $( 'td', getRow(0) ).length;
					}
				};
				
				
				function getRowCount(){
					return $( 'tbody tr', base.el ).length;			
				};
				
				
				function isValidRowIndex( rowIndex ){
					if( util.isEmpty(rowIndex) ){
						return false;
					}
					
					if( isNaN( rowIndex ) ){
						return false;
					}
					
					if( rowIndex < 0 || rowIndex >= getRowCount() ) {
						return false;
					}
					
					return true;
				};
				
				
				function setFormValues(rowIndex){		
					for( var i = 0; i < getColumnCount(); i++ ){
						setInputValue( rowIndex, i, getCellValue( rowIndex, i ) );
					}
				};
				
				
				function setInputValue( rowIndex, colIndex, value){	
					var inputId = idGen.getInputId( colIndex );
					var row = getRow( rowIndex );	
					var colType, input;
					
					var func = getOptions().setInputValue;
					if( util.functionExists(  func ) ){
						func( rowIndex, colIndex, value, inputId, $form, getRow( rowIndex ), getCell( rowIndex, colIndex ), getHeader( colIndex) );
					}
					else{
						colType = getColumnType( colIndex );
						input = $( "." + INPUT_CLASS_PREFIX + colIndex, $form );
						inputUtil.setValue( input, colType, value );
					}
				};
				
				
				function getInputValue( colIndex ){
					var value;
					
					input = $( "." + INPUT_CLASS_PREFIX + colIndex , $form );
					if( !util.isEmptyArray( input) ){
						value = inputUtil.getValue( input, getColumnType( colIndex ) );
					}
					
					var func = getOptions().getInputValue;
					if( util.functionExists(  func ) ){
						value = func( $currentRowIndex, colIndex, value, idGen.getInputId(colIndex), $form, $currentRow, getCell( $currentRowIndex, colIndex ), getHeader( colIndex)  );
					}
				
					return value;
				};
				
				
				function renderInput( colIndex  ){	
					if( ignoreColumn(colIndex) ){
						return;
					}
					
					var inputId = idGen.getInputId(colIndex);
					var inputName = idGen.getInputName(colIndex);
					var input = inputUtil.createInput( inputId, inputName, getColumnType( colIndex ) );	
					
					if( isDisabled( colIndex ) ){
						input.prop( "disabled", true );
					}

					// Check if a function was passed into the option and execute that
					var func = getOptions().renderInput;
					if( util.functionExists(  func ) ){
						input = func( input, $currentRowIndex, colIndex, getHeader( colIndex ) );
					}
					if( input ){
						$(input).addClass( INPUT_CLASS_PREFIX + colIndex );	
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
			            		index = col.colIndex;
			            		if( util.isEmpty( index) ){
			            			index = i;
			            		}     		
			            		columnMap[index] = col;
			            	}
		            	}
		            }
		            	            
		            // set plugin global
		            $columnMap = columnMap;
		        };
		        
				
				
				function buildForm(){
					var div = $( template.div );
					div.prop( "id", idGen.getEditRowFormId() );
					div.addClass( PLUGIN_CSS_CLASS );
					div.addClass( getOptions().cssClass );
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
					$form = form;				
				};
								
				
				function buildFormRow(){
					var div = $( template.div );
					div.prop( "id", idGen.getFormRowId() );
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
					div.prop( "id", idGen.getFormCellId( colIndex ) );
					div.addClass( "cell" );
					div.addClass( CELL_CLASS_PREFIX + colIndex );						
					var input = renderInput( colIndex );
					if( input ){
						input.appendTo( div );	
					}
					return div;
				};
				
				
				function buildButtonBar(){
					var div = $( template.div );

					var saveButton = $( template.button );
					saveButton.prop( "id", idGen.getSaveButtonId() );
					saveButton.addClass( "save");
					saveButton.appendTo( div );
					saveButton.text( getOptions().saveText );
					saveButton.on( "click", save );
					
					var cancelButton = $( template.button );
					cancelButton.prop( "id", idGen.getCancelButtonId() );
					cancelButton.addClass( "cancel");
					cancelButton.appendTo( div );
					cancelButton.text( getOptions().cancelText );
					cancelButton.on( "click", cancel );
					
					var wrapper = $( template.div );
					wrapper.addClass( "save-and-cancel-bar" );	
					div.appendTo( wrapper );
					
					return wrapper;
				};
				
				
				function setButtonBarPosition(){
					var barWidth = $($buttonBar).innerWidth();
					var width = base.$el.innerWidth();
					var offset = (width - barWidth)/2;
					$buttonBar.css({left: offset, position:'absolute'});
				};
				
				
				function getColumnType(colIndex){
					var type = $columnMap[colIndex].type;
					if( type === "datepicker" && !$.datepicker ){
						// if jquery ui datepicker is not available default to text
						return DEFAULT_COL_TYPE;
					}
										
					if( util.isNotEmpty(type) ){
						return type;
					}
					
					// try to auto-detect type
					return getColumnTypeFromCell( colIndex );
				};
				
				function getColumnTypeFromCell( colIndex ){
					// May not need all of this logic since the table cell will 
					// probably only have html or checkbox  and not other types 
					// of input or select.
					
					//var rowIndex =  util.isEmpty( $currentRowIndex ) ? 0 : $currentRowIndex;
					var cell = getCell(0, colIndex);
					var type = $( "input, select, textarea", cell ).prop( "type" );
					
					if( util.isNotEmpty(type) && type.indexOf( "select" ) != -1 ){
						return "select";
					}
					else if ( util.isNotEmpty(type) ){
						return type;
					}	
					else{
						return DEFAULT_COL_TYPE;
					}
				};
				
				function isDisabled( colIndex ){
					var disabled = $columnMap[colIndex].disabled;
					if( util.isNotEmpty( disabled ) ){
						return util.toBoolean( disabled );
					}					
					return false;
				};
				
				
				function ignoreColumn( colIndex ){
					var ignore = $columnMap[colIndex].ignore;
					if( util.isNotEmpty( ignore ) ){
						return util.toBoolean( ignore );
					}					
					return false;
				};
				
				
				function getColumnWidth(colIndex){
					// check for header
					var header = getHeader(colIndex);
					if( util.isNotEmpty( header ) ){
						var innerWidth = $(header).innerWidth();
						var width = $(header).innerWidth();
						return $(header).innerWidth();
					}
					
					var cell = getCell( $currentRowIndex, colIndex );
					if( util.isNotEmpty( cell ) ){
						return $(cell).innerWidth();
					}
					
					return 0;
				};
				
				
				function getRowHeight(rowIndex){
					var row = getRow( rowIndex );
					if( util.isNotEmpty( row ) ){
						return $(row).innerHeight();
					}						
					return 0;
				};
				
				
				function setPluginWidthHeightForRow( rowIndex ){
					$formDiv.width( util.getWidth(base.el) );
					$formDiv.height( getRowHeight( rowIndex ) );
					
					$( ".row", $formDiv ).height( getRowHeight( rowIndex ) );
					
					for( var i = 0; i < getColumnCount(); i++ ){
						var cell = $(  "." + CELL_CLASS_PREFIX + i, $formDiv );
						var colWidth = getColumnWidth(i);
						cell.width( colWidth );
						
						var colType = getColumnType( i );
						if( colType !== "checkbox" ){
							// set input width
							$( "." + INPUT_CLASS_PREFIX + i, cell ).width( colWidth - INPUT_OFFSET );
						}
					}
				};
							
				
				var idGen = {
						idSuffix: "-erf",
						
						getEditRowFormId: function( colIndex ){
							var id = base.options.id;
							if( util.isEmpty( id ) ){
								id = base.el.id;
							}
							
							if( util.isEmpty( id ) ){
								id = "no-id";
							}			
							return  id + this.idSuffix;
						},
						
						getInputId: function( colIndex ){
							var id = $columnMap[colIndex].id;
							if( util.isNotEmpty( id ) ){
								return id;
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
							name = $(header).text().trim()
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
						
						isEmptyArray: function( obj ){
							if( this.isEmpty(obj) ){
								return true;
							}
							
							if( typeof obj.length !== 'undefined' ){
								return obj.length == 0;
							}
							
							return true;
						},
						
						isEmpty: function( obj ){
							return ( 
									obj == null || obj === null || 
									typeof obj === 'undefined' ||
									 $.trim(obj) == 'null' || 
									 $.trim(obj) == ''
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
						},
						
						toBoolean: function( text ){
							if( this.isEmpty( text ) ){
								return false;
							}
							
							if( text === true || text === false ){
								return text;
							}
							
							text = text.toLowerCase();
							if( text == "y" || text == "true" || text == "yes" || text == "1"){
								return true;
							}
							else{
								return false;
							}
						}
				};
				
				var inputUtil = {	
						createInput: function( id, name, colType ){
							var input;
							
							if( colType == "checkbox" ){
								input = $( template.checkbox );
								input.prop( "id", id );
								input.prop( "name", name );
							}
							else if( colType == "datepicker" ){
								input = $( template.textfield );
								input.prop( "id", id );
								input.prop( "name", name );
								$(input).datepicker();
							}
							else {
								input = $( template.textfield );
								input.prop( "id", id );
								input.prop( "name", name );
							}	
							
							return input;
						},
								
						getValue : function( input, colType){
							if( colType == "checkbox" ){
								return this.getCheckboxValue( input );
							}
							else{
								return $(input).val();
							}
						},
											
						setValue : function( input, colType, value){
							if( colType == "checkbox" ){
								this.setCheckboxValue( input, value );
							}
							else{
								$(input).val( value );
							}
						},
						
													
						getCheckboxValue: function( input ){
							return $( input ).prop( "checked" );
						},
						
						setCheckboxValue: function( input, value ){
							$( input ).prop( "checked", util.toBoolean( value ) );
						}
				}
				
				
				var template = {
						td: "<td />",
						tr: "<tr />",
						div: "<div />",
						form: "<form />",
						button: "<button />",
						textfield: "<input type='text' />",
						checkbox: "<input type='checkbox' />"
				};
				

				// Run initializer
				init();
		    };
		    
		    
			
			// Default options
		    $.editrowform.defaultOptions = {
		    		/* An id to use for the plugin, if empty one will be generated */
		    		id: "",
		    		
		    		/* An optional css class to add to the plugin */
		    		cssClass: "",
		    		
		    		/* 
		    		 * A array of column object with properties overridden.  Look at the defaultColumn option below to see available options.
		    		 * If colIndex is not specified it will use the index of the array as the colIndex.
		    		 * e.g. [  {colIndex:0, type: "checkbox"}, { colIndex:1, disabled: true} ]
		    		 * 
		    		 * */
		    		columns: "", 
		    		
		    		/* True or false to turn on or off the double click and single click feature */
		    		click: true,
		    		
		    		/* The text of the save button */
		    		saveText: "Save",
		    		
		    		/* The text of the cancel button */
		    		cancelText: "Cancel",
		    		
		    		defaultColumn: {
		    			/* The index of the column these options are for */
		    			colIndex: "",
		    			
		    			/* Used as the id of the input, one is generated if left empty */
		    			id: "",
		    			
		    			/* Used as the name of the input, one is generated if left empty */
		    			name: "", 
		    			
		    			/* Current supported options are: text, checkbox, datepicker */
		    			type: "", 
		    			
		    			/* Will render the input for that column as disabled */
		    			disabled: "",
		    			
		    			/* Unlike disabled, ignore will simply not render any input for the column */
		    			ignore: "", 
		    		},
	
		    		/* function(event, form, rowIndex, row){}. Return false to stop the save*/
		    		onSave: "",
		    		
		    		/* function(event, form, rowIndex, row){}. Return false to stop the cancel*/
		    		onCancel: "",
		    		
		    		/* function(event, rowIndex, row){}. Return false to stop the delete*/
		    		onDeleteRow: "",
		    		
		    		/* function(event, rowIndex, row){}. Return false to stop the adding of the row to the table*/
		    		onAddRow: "",

		    		/* function(rowIndex, colIndex, computedValue, row, cell){} */
		    		getCellValue: "", 
		    		
		    		/* function(rowIndex, colIndex, value, row, cell){} */   		
		    		setCellValue: "",
		    		
		    		/* function(rowIndex, colIndex, computedValue, inputId, form, row, cell, header){} */   
		    		getInputValue: "",
		    		
		    		/* function( rowIndex, colIndex, value, inputId, form, row, cell, header ){} */
		    		setInputValue: "", 
		    		
		    		/* function(input, rowIdex, colIndex, header ){} */
		    		renderInput: "" 
		    };
		    
		    
		}

);