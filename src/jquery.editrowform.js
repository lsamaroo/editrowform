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
				
				base.hide = function(){
					if( $formDiv != null ){
						$formDiv.hide();
					}
				};
				
				
				base.save = function(event){	
					var i, inputValue;
					var saved = true;
					
					var onSave = getOptions().onSave;			
					if( util.functionExists( onSave ) ){
						saved = onSave(event, $form, $currentRowIndex, $currentRow);	
					}
					
					if( saved || util.isEmpty(saved) ){
						for( i = 0; i < getColumnCount(); i++ ){
							inputValue = getInputValue( i );
							setCellValue( $currentRowIndex, i, inputValue );
						}
						base.hide();
					}
				};
					
				base.cancel = function (event){
					var hide = true;
					
					var onCancel = getOptions().onCancel;		
					if( util.functionExists( onCancel ) ){
						hide = onCancel( event, $form, $currentRowIndex, $currentRow);
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
		        var INPUT_OFFSET = 4;
		        var PLUGIN_CSS_CLASS = "erf";
		        var INPUT_CLASS_PREFIX = "input-";
		        var CELL_CLASS_PREFIX = "cell-";
		        var $columnMap = {};
		        var $rowCount = null;
		        var $colCount = null;
		        var $formDiv = null;
		        var $form = null;
		        var $buttonBar = null;
		        var $currentRow = null;
		        var $currentRowIndex = null;

				function getOptions(){
					return base.options;
				};
				
				function getHeaderRow(){
					var header = $( 'thead tr', base.el );
					if( util.isNotEmpty( header ) ){
						return header;
					}
					
					return $( 'th', base.el ).parent;
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
					
					if( colType == "checkbox" ){
					   value = inputUtil.getCheckboxValue( $( "input", cell ) );
					}
					else{
					   value = $(cell).html().trim();
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

					var func = getOptions().setCellValue;
					if( util.functionExists(  func ) ){
						func( rowIndex, colIndex, value, getRow( rowIndex ), cell );
					}
					else{
						if( colType == "checkbox"){
							inputUtil.setCheckboxValue( $( "input", cell ), value );
						}
						else{
							$( cell ).html( value );
						}						
					}
					

					
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
						func( rowIndex, colIndex, value, inputId, $form, getRow( rowIndex ), getCell( rowIndex, colIndex ) );
					}
					else{
						colType = getColumnType( colIndex );
						input = $( "." + INPUT_CLASS_PREFIX + colIndex, $form );
						if( colType == "checkbox" ){
							inputUtil.setCheckboxValue( input, value );
						}
						else{
							input.val( value );
						}
					}
				};
				
				
				function getInputValue( colIndex ){
					var value, colType;
					
					input = $( "." + INPUT_CLASS_PREFIX + colIndex , $form );
					if( util.isNotEmpty( input ) ){
						colType = getColumnType( colIndex );
						if( colType == "checkbox"){
							value = inputUtil.getCheckboxValue( input );
						}
						else{
							value = $(input).val();
						}	
					}
					
					var func = getOptions().getInputValue;
					if( util.functionExists(  func ) ){
						value = func( $currentRowIndex, colIndex, value, idGen.getInputId(colIndex), $form, getRow( rowIndex ), getCell( $currentRowIndex, colIndex ) );
					}
				
					return value;
				};
				
				
				function renderInput( colIndex  ){				
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
					
					// Check if a function was passed into the option and execute that
					var func = getOptions().renderInput;
					if( util.functionExists(  func ) ){
						input = $(func( input, $currentRowIndex, colIndex ));
					}
					
					input.addClass( INPUT_CLASS_PREFIX + colIndex );				
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
					$form = form					
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
				
				
				function setButtonBarPosition(){
					var barWidth = $($buttonBar).innerWidth();
					var width = base.$el.innerWidth();
					var offset = (width - barWidth)/2;
					$buttonBar.css({left: offset, position:'absolute'});
				};
				
				
				function getColumnType(colIndex){
					var type = $columnMap[colIndex].type;
					if( util.isNotEmpty(type) ){
						return type;
					}
					else{
						return "text";
					}
				};
				
				function getColumnWidth(colIndex){
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
				
				
				function getRowHeight(rowIndex){
					var row = getRow( rowIndex );
					if( util.isNotEmpty( row ) ){
						return $(row).innerHeight();
					}
							
					return 0;
				};
				
				
				function setPluginWidthHeightForRow( rowIndex ){
					$formDiv.width( util.getWidth(base.el) );
					$formDiv.height( getRowHeight(0) );
					
					$( ".row", $formDiv ).height( getRowHeight( rowIndex ) );
					
					for( var i = 0; i < getColumnCount(); i++ ){
						var cell = $(  "." + CELL_CLASS_PREFIX + i, $formDiv );
						var colWidth = getColumnWidth(i);
						cell.width( colWidth );
						$( "." + INPUT_CLASS_PREFIX + i, cell ).width( colWidth - INPUT_OFFSET );
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
						},
						
						toBoolean: function( text ){
							if( this.isEmpty(text ) ){
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
						getValue : function( selector, colType){
							
						},
											
						setValue : function( selector, colType, value){
							
						},
								
						
						getCheckboxValue: function( input ){
							return $( input ).prop( "checked" )
						},
						
						setCheckboxValue: function( input, value ){
							$( input ).prop( "checked", util.toBoolean( value ) )
						}
				}
				
				
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
		    			colIndex: "",
		    			id: "",
		    			name: "",
		    			type: "", /* defaults to text */
		    			editable: true
		    		},
	
		    		/* function(event, form, rowIndex, row){} */
		    		onSave: "",
		    		
		    		/* function(event, form, rowIndex, row){} */
		    		onCancel: "",

		    		/* function(rowIndex, colIndex, computedValue, row, cell){} */
		    		getCellValue: "", 
		    		
		    		/* function(rowIndex, colIndex, value, row, cell){} */   		
		    		setCellValue: "",
		    		
		    		/* function(rowIndex, colIndex, computedValue, inputId, form, row, cell){} */   
		    		getInputValue: "",
		    		
		    		/* function( rowIndex, colIndex, value, inputId, form, row, cell ){} */
		    		setInputValue: "", 
		    		
		    		/* function(input, rowIdex, colIndex){} */
		    		renderInput: "" 
		    };
		    
		    
		}

);