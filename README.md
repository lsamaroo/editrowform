# editrowform
"A jquery plugin which allows you to edit each row of a table inline as a comprehensive form complete with a save and cancel button.  You can also use it to add or delete rows."

<h3>What's new?</h3>
Check the changelog.txt for all the changes in each version.
<b>
Important!!! v1.2.5 has a change to the onSave and onCancel options that's not backwards compatible.  The first argument to these callback functions (the event object) is being removed.  This was to facilitate making the "save" function public.
</b>

<h3>Usage:</h3>
Include the javascript and css file in your page.  The stylesheet is pretty simple so overide it to fit your needs.

<h3>Examples:</h3>
Take a look at the test directory for examples.  The following are currently available:

<ul>
	<li>A simple example showing checkboxes and disabling a column</li>
	<li>A datepicker example</li>
	<li>A select dropdown example by overriding renderInput</li>
	<li>Saving with a ajax call</li>
</ul>

Below are a couple of screen shots.

<br/>

![alt tag](test/images/simple.png)

![alt tag](test/images/datepicker.png)

![alt tag](test/images/select.png)


<h3>API</h3>
<h5>Options</h5>



<h5>Public Methods</h5>

	 Save
    /**
     * Saves the input to the table and hides the dialog.
     * 
     * @example
     * .editrowform( "save" )
     * 
     */

		        
		   
		        /* 
		         * Add a row to the table. In order to create the new row, it clones the last row of the table. If none exists, it will 
		         * create a brand new row.
		         *  
		         * @example
		         * .editrowform( "addRow", cloneExisting )
		         * 
		         * @param cloneExisting is an optional argument which default to true.  It will clone an existing row from the 
		         * table (the last one) to create a new row.  If false, it will create a brand new row.
		         * 
		         * @return the rowIndex of the newly created row or false if the function call did not add the row.
		         *
		         * 
		         */	        
		        base.addRow = addRow;
				
				
		        /* 
		         * Remove the indicated row from the table.  This will remove it from the table DOM. 
		         *
		         * @example
		         * .editrowform( "deleteRow", rowIndex )
		         *  
		         * @param rowIndex is the row index to perform the operation on.
		         *   
		         */
		        base.deleteRow = deleteRow;
		        

		        /* 
		         * Set the value for the given row index.  Takes an array of values.
		         *
		         * @example
		         * .editrowform( "setRowValues", rowIndex, rowValues )
		         *  
		         * @param rowIndex is the row index to set the values for.
		         *  
		         * @param rowValues is an array of values to set for the row.  The index of the array corresponds to the column index.
		         *   
		         */
		        base.setRowValues = setRowValues; 
				
				
				/* 
				 * 
				 * Shows the edit form for the specified row.  If the row index is not valid, it will not do nothing.
				 * 
		         * @example
		         * .editrowform( "show", rowIndex )
				 * 
				 * @param rowIndex is the row index to show the form for.
				 * 
				 */
				base.show = show;
				
				
				/* 
				 * Hides the edit form if it is currently visible. 
				 * 
		         * @example
		         * .editrowform( "hide" )
				 * 
				 */
				base.hide = hide;
				
				
				/* 
				 * Remove the plugin from the DOM and cleanup.
				 * 
		         * @example
		         * .editrowform( "destroy")
				 * 
				 */
				base.destroy = destroy;
				
				
				/* 
				 * Get the number of rows in the table.
				 * 
		         * @example
		         * .editrowform( "getRowCount" )
		         * 
		         * @return the number of rows in the table associated with this plugin
				 * 
				 */
				base.getRowCount = getRowCount;
				
				
				/* 
				 * Get the number of columns in the table.
				 * 
		         * @example
		         * .editrowform( "getColumnCount" )
		         * 
		         * @return the number of columns in the table associated with this plugin
				 * 
				 */
				base.getColumnCount = getColumnCount;

