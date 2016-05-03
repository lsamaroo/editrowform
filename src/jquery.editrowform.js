/**
 * @fileOverview jquery plugin pattern (featured)
 *               <p>License MIT
 *               <br />Copyright 2015 Leon Samaroo
 *
 * @version 1.3.6
 * @author Leon Samaroo
 * @requires jQuery
 */

/**
 * See <a href="http://jquery.com">http://jquery.com</a>.
 * @name $
 * @class
 * See the jQuery Library  (<a href="http://jquery.com">http://jquery.com</a>) for full details.  This just
 * documents the function and classes that are added to jQuery by this plug-in.
 */

/**
 * See <a href="http://jquery.com">http://jquery.com</a>
 * @name fn
 * @class
 * See the jQuery Library  (<a href="http://jquery.com">http://jquery.com</a>) for full details.  This just
 * documents the function and classes that are added to jQuery by this plug-in.
 * @memberOf $
 */

'use strict';
/* eslint no-unused-expressions: 0 */
(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    }
    // Node and CommonJS
    else if (typeof module === 'object' && module.exports) {
        module.exports = factory(require('jquery'));
    }
    // Global
    else {
        factory(root.jQuery);
    }
}(this, function($) {
    $.fn.editrowform = function(options) {
        var args = Array.prototype.slice.call(arguments, 1); // for a possible method call
        var ret = this; // what this function will return (this jQuery object by default)
        var singleRes; // the returned value of this single method call

        this.each(function(i, el) {
            var element = $(el);
            var thisplugin = element.data('editrowform'); // get the existing plug-in object (if one exist)

            // If options is a string then it's a method call
            if (typeof options === 'string') {
                // Check if the method exists
                if (thisplugin && $.isFunction(thisplugin[options])) {
                    singleRes = thisplugin[options].apply(thisplugin, args);
                    if (!i) {
                        ret = singleRes; // record the first method call result
                    }
                }
            }
            // Otherwise it was an instantiation so we create a 
            // new plug-in and initialize because one does not exist
            else if (!thisplugin) {
                /* eslint new-cap: 0 */
                (new $.editrowform(el, options));
            }
        });
        return ret;
    };

    $.editrowform = function(el, options) {

        // ---------------------------------------
        // Private variables
        // ---------------------------------------
        var base = this;

        // Access to jQuery and DOM versions of element
        base.$el = $(el);
        base.el = el;

        // Add a reverse reference to the DOM object
        base.$el.data('editrowform', base);

        var PLUGIN_CSS_CLASS = 'erf';
        var INPUT_CLASS_PREFIX = 'input-';
        var INPUT_CLASS_SUFFIX = '-input';
        var CELL_CLASS_PREFIX = 'cell-';
        var DEFAULT_COL_TYPE = 'text';
        var currentColumnMap = {};
        var $formDiv = null;
        var $form = null;
        var $buttonBar = null;
        var currentRow = null;
        var currentRowIndex = null;
        var publicShowCalled;


        // ---------------------------------------
        // Utility & template classes
        // ---------------------------------------

        var Template = {
            table: '<table />',
            tr: '<tr />',
            td: '<td />',
            div: '<div />',
            form: '<form />',
            button: '<button />',
            textfield: '<input type="text" />',
            checkbox: '<input type="checkbox" />'
        };

        var Util = {
            timeoutButton: function(id, time) {
                if (!time) {
                    time = 1000; // default one second
                }
                var itemId = '#' + id;
                $(itemId).prop('disabled', true);

                setTimeout(function() {
                    $(itemId).prop('disabled', false);
                }, time);
            },

            functionExists: function(func) {
                return typeof func !== 'undefined' && $.isFunction(func);
            },

            isEmptyArray: function(obj) {
                if (this.isEmpty(obj)) {
                    return true;
                }

                if (typeof obj.length !== 'undefined') {
                    return obj.length === 0;
                }

                return true;
            },

            /* eslint eqeqeq:0 */
            isEmpty: function(obj) {
                var isNill = obj === undefined ||
                    obj === null ||
                    typeof obj === 'undefined';

                return (
                    isNill ||
                    $.trim(obj) === 'null' ||
                    $.trim(obj) === ''
                );
            },

            isNotEmpty: function(obj) {
                return !this.isEmpty(obj);
            },

            clone: function(obj) {
                return $.extend(true, {}, obj);
            },

            isHidden: function(element) {
                return $(element).css('display') === 'none';
            },

            position: function(obj, top, left) {
                $(obj).css({
                    top: top,
                    left: left
                });
            },

            toBoolean: function(text) {
                if (this.isEmpty(text)) {
                    return false;
                }

                if (text === true || text === false) {
                    return text;
                }

                text = text.toLowerCase();
                return text === 'y' || text === 'true' || text === 'yes' || text === '1';
            }
        };

        var IdGenerator = {
            idSuffix: '-erf',

            getEditRowFormId: function() {
                var id = base.options.id;
                if (Util.isEmpty(id)) {
                    id = base.el.id;
                }

                if (Util.isEmpty(id)) {
                    id = 'no-id-' + new Date().getTime();
                }
                return id + this.idSuffix;
            },

            getInputId: function(colIndex) {
                var id = currentColumnMap[colIndex].id;
                if (Util.isNotEmpty(id)) {
                    return id;
                }

                // default to generating an id
                return this.getEditRowFormId() + INPUT_CLASS_SUFFIX + colIndex;
            },


            getInputName: function(colIndex) {
                var name = currentColumnMap[colIndex].name;
                if (Util.isNotEmpty(name)) {
                    return name;
                }

                // or else use id
                name = currentColumnMap[colIndex].id;
                if (Util.isNotEmpty(name)) {
                    return name;
                }

                // or get header name
                var header = getHeader(colIndex);
                name = $(header).text().trim();
                if (Util.isNotEmpty(name)) {
                    return name;
                }

                // default to generating an id
                return this.getEditRowFormId() + INPUT_CLASS_SUFFIX + colIndex;
            },

            getFormCellId: function(colIndex) {
                return this.getEditRowFormId() + '-cell-' + colIndex;
            },

            getFormRowId: function() {
                return this.getEditRowFormId() + '-row';
            },

            getFormId: function() {
                return this.getEditRowFormId() + '-form';
            },

            getSaveButtonId: function() {
                return this.getEditRowFormId() + '-save';
            },

            getCancelButtonId: function() {
                return this.getEditRowFormId() + '-cancel';
            }
        };


        var InputUtil = {
            createInput: function(id, name, colType) {
                var input;

                if (colType === 'checkbox') {
                    input = $(Template.checkbox);
                    input.prop('id', id);
                    input.prop('name', name);
                }
                else if (colType === 'datepicker') {
                    input = $(Template.textfield);
                    input.prop('id', id);
                    input.prop('name', name);
                    $(input).datepicker();
                }
                else {
                    input = $(Template.textfield);
                    input.prop('id', id);
                    input.prop('name', name);
                }

                return input;
            },

            getValue: function(input, colType) {
                if (colType === 'checkbox') {
                    return this.getCheckboxValue(input);
                }
                else {
                    return $(input).val();
                }
            },

            setValue: function(input, colType, value) {
                if (colType === 'checkbox') {
                    this.setCheckboxValue(input, value);
                }
                else {
                    $(input).val(value);
                }
            },

            getCheckboxValue: function(input) {
                return $(input).prop('checked');
            },

            setCheckboxValue: function(input, value) {
                $(input).prop('checked', Util.toBoolean(value));
            }
        };




        // ---------------------------------------
        // Public API
        // ---------------------------------------


        base.save = save;
        base.addRow = addRow;
        base.deleteRow = deleteRow;
        base.setRowValues = setRowValues;
        base.show = show;
        base.hide = hide;
        base.destroy = destroy;
        base.getRowCount = getRowCount;
        base.getColumnCount = getColumnCount;
        base.getForm = getForm;



        // ---------------------------------------
        // Private functions
        // ---------------------------------------

        function keydown(e) {
            if (base.options.disableArrowKeys) {
                return;
            }
            switch (e.which) {
                case 38: // up
                    arrowUpPressed();
                    break;

                case 40: // down
                    arrowDownPressed();
                    break;

                default:
                    return; // exit this handler for other keys
            }
            e.preventDefault(); // prevent the default action (scroll / move caret)
        };

        function doubleClick(tr) {
            hide();
            internalShow($(tr).index());
        };


        function singleClick(tr) {
            if (isVisible()) {
                hide();
                internalShow($(tr).index());
            }
        };

        function arrowUpPressed() {
            if (isVisible()) {
                internalShow(currentRowIndex - 1);
            }
        };

        function arrowDownPressed() {
            if (isVisible()) {
                internalShow(currentRowIndex + 1);
            }
        };




        /* 
         * Get the form created by this plugin.
         * 
         * @example
         * .editrowform( 'getForm' )
         * 
         * @return the form object created by this plugin
         * 
         */
        function getForm() {
            return $form;
        };


        function isVisible() {
            return !Util.isHidden($formDiv);
        };

        /**
         * Saves the input to the table and hides the dialog.
         * 
         * @example
         * .editrowform( 'save' )
         */
        function save() {
            var timeout = getOptions().saveButtonTimeout;
            if (Util.isNotEmpty(timeout)) {
                Util.timeoutButton(IdGenerator.getSaveButtonId(), timeout);
            }
            var inputValue;
            var saved = true;
            var rowValues = [];

            for (var i = 0; i < getColumnCount(); i++) {
                inputValue = getInputValue(i);
                rowValues.push(inputValue);
            }

            var onSave = getOptions().onSave;
            if (Util.functionExists(onSave)) {
                saved = onSave($form, currentRowIndex, currentRow, rowValues);
            }

            if (saved || Util.isEmpty(saved)) {
                setRowValues(currentRowIndex, rowValues);
                hide();
            }
        };


        function cancel() {
            var timeout = getOptions().cancelButtonTimeout;
            if (Util.isNotEmpty(timeout)) {
                Util.timeoutButton(IdGenerator.getCancelButtonId(), timeout);
            }

            var cancelled = true;

            var onCancel = getOptions().onCancel;
            if (Util.functionExists(onCancel)) {
                cancelled = onCancel($form, currentRowIndex, currentRow);
            }

            if (cancelled || Util.isEmpty(cancelled)) {
                hide();
            }
        };




        /* 
         * Add a row to the table. 
         * If templateRow is passed in, it will use that to add the row.  
         * Otherwise it will create a new row.
         *  
         * @example
         * .editrowform( 'addRow', templateRow )
         * 
         * @param templateRow is an optional argument. It can be
         * a dom element or string representing a row or a function
         * which return a row to add.
         * 
         * For backward compatibility if left empty or set to true, it will still   
         * attempt to clone an the existing last row.  In future releases
         * this will be removed.
         * 
         * @return the rowIndex of the newly created row or false if the 
         * function call did not add the row.
         */
        function addRow(templateRow /* optional */ ) {
            var add = true;
            var rowCount = getRowCount();
            var newRow;

            if ((templateRow === true || Util.isEmpty(templateRow)) && rowCount !== 0) {
                newRow = cloneLastRow();
            }
            else if (templateRow === true || templateRow === false || Util.isEmpty(templateRow)) {
                newRow = createRow();
            }
            else if (Util.functionExists(templateRow)) {
                newRow = cloneRow(templateRow());
            }
            else {
                newRow = cloneRow(templateRow);
            }

            var onAddRow = getOptions().onAddRow;
            if (Util.functionExists(onAddRow)) {
                add = onAddRow(rowCount, newRow);
            }

            if ((add || Util.isEmpty(add)) && !Util.isEmpty(newRow)) {
                // add click listener if it's enabled
                if (getOptions().click) {
                    newRow.dblclick(function() {
                        doubleClick(this);
                    });

                    newRow.click(function() {
                        singleClick(this);
                    });
                }

                // add the new row to the table
                newRow.appendTo(base.$el);
                return rowCount;
            }
            else {
                return false;
            }
        };


        function cloneRow(templateRow) {
            return $(templateRow).clone();
        };


        function cloneLastRow() {
            var row = getRow(getRowCount() - 1);
            var newRow = $(row).clone();

            // blank out any id 
            newRow.prop('id', '');

            // blank out the row
            $('td', newRow).each(function(index) {
                var column = currentColumnMap[index];
                if (!column.ignore) {
                    $(this).html('&nbsp;');
                }
            });
            return newRow;
        };


        function createRow() {
            var columnCount = getColumnCount();
            var row = $(Template.tr);
            var cell;

            for (var i = 0; i < columnCount; i++) {
                cell = $(Template.td);
                cell.appendTo(row);
                cell.html('&nbsp;');
            }
            return row;
        };



        /* 
         * Remove the indicated row from the table.  This will remove it 
         * from the table DOM. 
         *
         * @example
         * .editrowform( 'deleteRow', rowIndex )
         *  
         * @param rowIndex is the row index to perform the operation on.
         */
        function deleteRow(rowIndex) {
            if (!isValidRowIndex(rowIndex)) {
                return;
            }

            var deleted = true;
            var row = getRow(rowIndex);

            var onDeleteRow = getOptions().onDeleteRow;
            if (Util.functionExists(onDeleteRow)) {
                deleted = onDeleteRow(rowIndex, row);
            }

            if ((deleted || Util.isEmpty(deleted)) && !Util.isEmptyArray(row)) {
                // remove the row from the DOM.
                row.remove();
            }
        };



        /* 
         * Set the value for the given row index.  Takes an array of values.
         *
         * @example
         * .editrowform( 'setRowValues', rowIndex, rowValues )
         *  
         * @param rowIndex is the row index to set the values for.
         *  
         * @param rowValues is an array of values to set for the row.  The index 
         * of the array corresponds to the column index.   
         */
        function setRowValues(rowIndex, rowValues) {
            if (!isValidRowIndex(rowIndex)) {
                return;
            }

            for (var i = 0; i < getColumnCount(); i++) {
                if (!isDisabled(i) && !ignoreColumn(i)) {
                    setCellValue(rowIndex, i, rowValues[i]);
                }
            }
        };



        /* 
         * Shows the edit form for the specified row.  Does nothing for invalid row index.
         * 
         * @example
         * .editrowform( 'show', rowIndex )
         * 
         * @param rowIndex is the row index to show the form for.
         */
        function show(rowIndex) {
            publicShowCalled = true;
            internalShow(rowIndex);
        };


        function internalShow(rowIndex) {
            if (!isValidRowIndex(rowIndex)) {
                return;
            }

            if ($formDiv !== null) {
                setPluginWidthAndHeight(rowIndex);
                var row = getRow(rowIndex);
                setFormPosition(row);
                setFormValues(rowIndex);
                $formDiv.show();
                setButtonBarPosition();
                if (getOptions().focusOnInput) {
                    focusFirstInput();
                }

                // set plugin global
                currentRow = row;
                currentRowIndex = rowIndex;
            }
        };


        function focusFirstInput() {
            $('input', $formDiv).each(function(index, input) {
                var disabled = $(input).prop('disabled');
                if (!disabled) {
                    $(input).focus();
                    return false;
                }
            });
        };



        /* 
         * Hides the edit form if it is currently visible. 
         * 
         * @example
         * .editrowform( 'hide' )
         * 
         */
        function hide() {
            if ($formDiv !== null && isVisible()) {
                $formDiv.hide();
                var onHide = getOptions().onHide;
                if (Util.functionExists(onHide)) {
                    onHide($form, currentRowIndex, currentRow);
                }
            }
        };




        /* 
         * Remove the plugin from the DOM and cleanup.
         * 
         * @example
         * .editrowform( 'destroy')
         * 
         */
        function destroy() {
            base.$el.removeData('editrowform');
            if ($formDiv) {
                $formDiv.remove();
                $formDiv = null;
            }
        };


        function getOptions() {
            return base.options;
        };


        function getHeaderRow() {
            var header = $('thead tr', base.el);
            if (Util.isNotEmpty(header)) {
                return header;
            }
            return $('th', base.el).parent();
        };


        function getHeader(colIndex) {
            var headerRow = getHeaderRow();

            var header;
            if (Util.isNotEmpty(headerRow)) {
                header = $('th', headerRow)[colIndex];
            }
            return header;
        };


        function getRow(rowIndex) {
            return $('tbody tr', base.el).eq(rowIndex);
        };


        function getCell(rowIndex, colIndex) {
            var row = getRow(rowIndex);
            var cell;
            if (Util.isNotEmpty(row)) {
                cell = $('td', row)[colIndex];
            }
            return cell;
        };


        function getCellValue(rowIndex, colIndex) {
            var value;
            var cell = getCell(rowIndex, colIndex);
            var colType = getColumnType(colIndex);

            var input = $('input', cell);
            if (!Util.isEmptyArray(input)) {
                value = InputUtil.getValue(input, colType);
            }
            else {
                value = $(cell).text().trim();
            }

            var getCellValueFunc = getOptions().getCellValue;
            if (Util.functionExists(getCellValueFunc)) {
                value = getCellValueFunc(rowIndex, colIndex, value, getRow(rowIndex), cell);
            }
            return value;
        };


        function setCellValue(rowIndex, colIndex, value) {
            var colType = getColumnType(colIndex);
            var cell = getCell(rowIndex, colIndex);
            var input;

            var func = getOptions().setCellValue;
            if (Util.functionExists(func)) {
                func(rowIndex, colIndex, value, getRow(rowIndex), cell);
            }
            else {
                input = $('input', cell);
                if (!Util.isEmptyArray(input)) {
                    InputUtil.setValue(input, colType, value);
                }
                else {
                    $(cell).text(value);
                }
            }
        };



        /* 
         * Get the number of columns in the table.
         * 
         * @example
         * .editrowform( 'getColumnCount' )
         * 
         * @return the number of columns in the table associated with this plugin
         */
        function getColumnCount() {
            var headerRow = getHeaderRow();
            if (!Util.isEmptyArray(headerRow)) {
                return $('th', headerRow).length;
            }
            else {
                return $('td', getRow(0)).length;
            }
        };




        /* 
         * Get the number of rows in the table.
         * 
         * @example
         * .editrowform( 'getRowCount' )
         * 
         * @return the number of rows in the table associated with this plugin
         */
        function getRowCount() {
            return $('tbody tr', base.el).length;
        };


        function isValidRowIndex(rowIndex) {
            if (Util.isEmpty(rowIndex)) {
                return false;
            }

            if (isNaN(rowIndex)) {
                return false;
            }

            if (rowIndex < 0 || rowIndex >= getRowCount()) {
                return false;
            }
            return true;
        };


        function setFormValues(rowIndex) {
            for (var i = 0; i < getColumnCount(); i++) {
                setInputValue(rowIndex, i, getCellValue(rowIndex, i));
            }
        };


        function setInputValue(rowIndex, colIndex, value) {
            var inputId = IdGenerator.getInputId(colIndex);
            var colType, input;

            var func = getOptions().setInputValue;
            if (Util.functionExists(func)) {
                func(rowIndex, colIndex, value, inputId, $form, getRow(rowIndex), getCell(rowIndex, colIndex), getHeader(colIndex));
            }
            else {
                colType = getColumnType(colIndex);
                input = $('.' + INPUT_CLASS_PREFIX + colIndex, $form);
                InputUtil.setValue(input, colType, value);
            }
        };


        function getInputValue(colIndex) {
            var value;

            var input = $('.' + INPUT_CLASS_PREFIX + colIndex, $form);
            if (!Util.isEmptyArray(input)) {
                value = InputUtil.getValue(input, getColumnType(colIndex));
            }

            var func = getOptions().getInputValue;
            if (Util.functionExists(func)) {
                value = func(currentRowIndex, colIndex, value, IdGenerator.getInputId(colIndex),
                    $form, currentRow, getCell(currentRowIndex, colIndex), getHeader(colIndex));
            }

            return value;
        };


        function renderInput(colIndex) {
            if (ignoreColumn(colIndex)) {
                return;
            }

            var inputId = IdGenerator.getInputId(colIndex);
            var inputName = IdGenerator.getInputName(colIndex);
            var input = InputUtil.createInput(inputId, inputName, getColumnType(colIndex));

            var defaultValue = getDefaultValue(colIndex);
            if (Util.isNotEmpty(defaultValue)) {
                input.val(defaultValue);
            }

            if (isDisabled(colIndex)) {
                input.prop('disabled', true);
            }

            // Check if a function was passed into the option and execute that
            var func = getOptions().renderInput;
            if (Util.functionExists(func)) {
                input = func(input, currentRowIndex, colIndex, getHeader(colIndex));
            }
            if (input) {
                $(input).addClass(INPUT_CLASS_PREFIX + colIndex);
                $(input).addClass(PLUGIN_CSS_CLASS + INPUT_CLASS_SUFFIX);
            }
            return input;
        };


        function build() {
            buildColumnMap();
            buildForm();
        };


        function buildColumnMap() {
            var columns = base.options.columns;
            var i, col, index;
            var columnMap = {};

            // Fill with default values;
            for (i = 0; i < getColumnCount(); i++) {
                columnMap[i] = Util.clone(base.options.defaultColumn);
            }

            if (Util.isNotEmpty(columns) && $.isArray(columns)) {
                for (i = 0; i < columns.length; i++) {
                    index = i;
                    col = columns[i];
                    if (Util.isNotEmpty(col) && col.colIndex) {
                        index = col.colIndex;
                    }
                    columnMap[index] = col;
                }
            }
            // set plugin global
            currentColumnMap = columnMap;
        };


        function buildForm() {
            var div = $(Template.div);
            div.prop('id', IdGenerator.getEditRowFormId());
            div.prop('tabIndex', 0);
            div.addClass(PLUGIN_CSS_CLASS);
            div.addClass(getOptions().cssClass);
            div.hide();
            div.appendTo(document.body);

            var form = $(Template.form);
            form.prop('id', IdGenerator.getFormId());
            form.prop('tabindex', 0);
            form.addClass(PLUGIN_CSS_CLASS + '-form');
            form.appendTo(div);

            var row = buildFormRow();
            row.appendTo(form);

            var buttonBar = buildButtonBar();
            buttonBar.appendTo(div);

            form.submit(function(event) {
                event.preventDefault();
                save();
            });

            // add to plugin global scope
            $buttonBar = buttonBar;
            $formDiv = div;
            $form = form;
        };


        function buildFormRow() {
            var div = $(Template.div);
            div.prop('id', IdGenerator.getFormRowId());
            div.addClass('row');

            for (var i = 0; i < getColumnCount(); i++) {
                var cell = buildFormCell(i);
                cell.appendTo(div);
            }
            return div;
        };


        function buildFormCell(colIndex) {
            var div = $(Template.div);
            div.prop('id', IdGenerator.getFormCellId(colIndex));
            div.addClass('cell');
            div.addClass(CELL_CLASS_PREFIX + colIndex);
            var input = renderInput(colIndex);
            if (input) {
                input.appendTo(div);
            }
            return div;
        };


        function buildButtonBar() {
            var div = $(Template.div);

            var saveButton = $(Template.button);
            saveButton.prop('id', IdGenerator.getSaveButtonId());
            saveButton.addClass('save');
            saveButton.appendTo(div);
            saveButton.text(getOptions().saveText);
            saveButton.on('click', save);

            var cancelButton = $(Template.button);
            cancelButton.prop('id', IdGenerator.getCancelButtonId());
            cancelButton.addClass('cancel');
            cancelButton.appendTo(div);
            cancelButton.text(getOptions().cancelText);
            cancelButton.on('click', cancel);

            var wrapper = $(Template.div);
            wrapper.addClass('save-and-cancel-bar');
            wrapper.addClass('button-bar');
            div.appendTo(wrapper);
            return wrapper;
        };


        function setFormPosition(row) {
            if (Util.isEmpty(row)) {
                return;
            }
            var positionOfRow = $(row).offset();
            Util.position($formDiv, positionOfRow.top, positionOfRow.left);
        };


        function setButtonBarPosition() {
            var barWidth = $($buttonBar).innerWidth();
            var width = base.$el.innerWidth();
            var offset = (width - barWidth) / 2;
            $buttonBar.css({
                left: offset,
                position: 'absolute'
            });
        };


        function getColumnType(colIndex) {
            var type = currentColumnMap[colIndex].type;
            if (type === 'datepicker' && !$.datepicker) {
                // if jquery ui datepicker is not available default to text
                return DEFAULT_COL_TYPE;
            }

            if (Util.isNotEmpty(type)) {
                return type;
            }

            // try to auto-detect type
            return getColumnTypeFromCell(colIndex);
        };


        function getColumnTypeFromCell(colIndex) {
            var cell = getCell(0, colIndex);
            var type = $('input, select, textarea', cell).prop('type');

            if (Util.isNotEmpty(type) && type.indexOf('select') !== -1) {
                return 'select';
            }
            else if (Util.isNotEmpty(type)) {
                return type;
            }
            else {
                return DEFAULT_COL_TYPE;
            }
        };


        function isDisabled(colIndex) {
            var disabled = currentColumnMap[colIndex].disabled;
            if (Util.isNotEmpty(disabled)) {
                return Util.toBoolean(disabled);
            }
            return false;
        };


        function ignoreColumn(colIndex) {
            var ignore = currentColumnMap[colIndex].ignore;
            if (Util.isNotEmpty(ignore)) {
                return Util.toBoolean(ignore);
            }
            return false;
        };


        function getDefaultValue(colIndex) {
            return currentColumnMap[colIndex].defaultValue;
        };


        function getColumnWidth(colIndex) {
            // check for header
            var header = getHeader(colIndex);
            if (Util.isNotEmpty(header)) {
                return $(header).outerWidth();
            }

            var cell = getCell(currentRowIndex, colIndex);
            if (Util.isNotEmpty(cell)) {
                return $(cell).outerWidth();
            }

            return 0;
        };


        function getRowHeight(rowIndex) {
            var row = getRow(rowIndex);
            if (Util.isNotEmpty(row)) {
                return $(row).outerHeight();
            }
            return 0;
        };


        function setPluginWidthAndHeight(rowIndex) {
            $formDiv.width(base.$el.width());
            var height = getRowHeight(rowIndex);

            $('.row', $formDiv).height(height);
            $('.row .cell', $formDiv).height(height);

            for (var i = 0; i < getColumnCount(); i++) {
                var cell = $('.' + CELL_CLASS_PREFIX + i, $formDiv);
                var colWidth = getColumnWidth(i);
                cell.width(colWidth);
            }
        };


        // ---------------------------------------
        // Options
        // ---------------------------------------
        $.editrowform.defaultOptions = {
            /* 
             * An id to use for the plugin, if empty one will be generated 
             */
            id: '',


            /* 
             * An optional css class to add to the plugin 
             */
            cssClass: '',


            /* 
             * True or false to turn on or off the double click and single click feature.  
             * Defaults to true.
             */
            click: true,


            /* 
             * The text of the save button.
             */
            saveText: 'Save',


            /* 
             * The text of the cancel button.
             */
            cancelText: 'Cancel',


            /* 
             * A time in millis to disable the save button when it's clicked.
             */
            saveButtonTimeout: '',


            /* 
             * A time in millis to disable the cancel button when it's clicked.
             */
            cancelButtonTimeout: '',


            /* 
             * Hides the form when you click outside of the form or table.
             * Defaults to true.
             */
            hideOnBlur: true,


            /* 
             * True to focus on the first input when the form is shown.
             * Defaults to false.
             */
            focusOnInput: false,

            /* 
             * True to disable the up and down arrow keys for navigating the table.
             * Defaults to false.
             */
            disableArrowKeys: false,


            /* 
             * A array of column objects.  The column object has the same set of properties 
             * as defined in the defaultColumn option below.  The defaultColumn option 
             * list all the available properties that can be set. 
             * 
             * Note: If colIndex is not specified as a property, it will use the index 
             * of this array as the colIndex.
             * 
             * Usage e.g. [  {id: 'myid', colIndex:0, type: 'checkbox'}, { colIndex:1, disabled: true} ]
             *
             */
            columns: '',


            defaultColumn: {
                /* 
                 * The index of the column you want to set these properties for.
                 */
                colIndex: '',


                /* 
                 * If set, it is used as the id for input element for that column. 
                 * One is generated if left empty. 
                 */
                id: '',


                /* 
                 * If set, it is used as the name of the input element for that column.
                 * If empty, it will use the id.  If the id is not set then it will use the 
                 * header text.  Finally if that is not available, then it generates a name.
                 */
                name: '',


                /* 
                 * The type of input to display on the form.
                 * Current supported options are: text, checkbox, datepicker.
                 * 
                 */
                type: '',


                /* 
                 * If true, it will render the input for that column as disabled 
                 */
                disabled: '',


                /* 
                 * Unlike disabled, ignore will simply not render any input 
                 * for the column when set to true.
                 */
                ignore: '',

                /* 
                 * A default value to set the input to
                 */
                defaultValue: ''


            },



            /* 
             * Called when the save button is clicked.  Can be overridden to perform 
             * your own save action. 
             * 
             * @example
             * function(form, rowIndex, row, rowValues){}. 
             * 
             * @param form is the form element displayed by the plugin.
             * @param rowIndex is the index of the row being edited.
             * @param row is the row element being edited
             * @param rowValues is an array of values entered into the form.  
             * 
             * @return false to stop the plugin from updating the row values 
             * and hiding the dialog.  For example you may want to wait untill 
             * after a ajax callback before updating the row.
             * True to contine as normal.
             */
            onSave: '',



            /* 
             * Called when the cancel button is clicked.
             * 
             * @example
             * function(form, rowIndex, row){}. 
             * 
             * @param form is the form element displayed by the plugin.
             * @param rowIndex is the index of the row being edited.
             * @param row is the row element being edited.
             *  
             * @return false to stop the save.  True to continue as normal.
             */
            onCancel: '',


            /* 
             * Triggered when the plugin form is hidden.  
             * This callback will only trigger when the form goes from a 
             * visible state to a hidden state. 
             * 
             * @example
             * function(form, rowIndex, row){}. 
             * 
             * @param form is the form element.
             * @param rowIndex is the index of the row being edited.
             * @param row is the row element being edited. 
             */
            onHide: '',



            /* 
             * Trigger when deleteRow is called.  Can be used to perform additional 
             * task associated with deletion of a row.  For example you can override to
             * have deletion gray out a row instead of actually deleting it.
             * 
             * @example
             * function(rowIndex, row){}. 
             * 
             * @param rowIndex is the index of the row being deleted.
             * @param row is the row element being deleted.
             * 
             * @return false to stop the plugin from removing the row from 
             * the table.  True or empty to remove the row.
             */
            onDeleteRow: '',



            /* 
             * Called when addRow is called.  Can be used to perform additional
             * task associated with adding the row. For example you can add 
             * a css class to the row.
             * 
             * @example
             * function(rowIndex, row){}. 
             * 
             * @param rowIndex is the index of the newly created row.
             * @param row is the row element of the newly created row.
             * 
             * @return false to stop the plugin from adding the row to the table.  
             * True or empty to continue as normal.
             */
            onAddRow: '',



            /* 
             * Override to return your own interpretation of what the cell 
             * value should be.  By default it will read the text from the td element (cell).
             * 
             * @example
             * function(rowIndex, colIndex, computedValue, row, cell){} 
             * 
             * @param rowIndex is the row index of the row.
             * @param colIndex is the column index of the column.
             * @param computedValue is the value the plugin extracted from the cell.
             * @param row is the row element the cell is in.
             * @param cell is the cell element.
             */
            getCellValue: '',



            /* 
             * Override this to get complete control of how the cell value 
             * should be set on the table.
             * 
             * @example
             * function(rowIndex, colIndex, value, row, cell){} 
             * 
             * @param rowIndex is the row index of the row.
             * @param colIndex is the column index of the column.
             * @param value is the value being set to the cell.
             * @param row is the row element the cell is in.
             * @param cell is the cell element.
             */
            setCellValue: '',



            /* 
             * Override this to determine the value the plugin gets from 
             * the form input.
             * 
             * @example
             * function(rowIndex, colIndex, computedValue, inputId, form, row, cell, header){} 
             * 
             * @param rowIndex is the row index of the row.
             * @param colIndex is the column index of the column.
             * @param computedValue is the value the plugin extracted from the input.
             * @param inputId is the id of the input.
             * @param form is the form element.
             * @param row is the row element.
             * @param cell is the cell element.
             * @param header is the header element.
             * 
             * @return a value from the input.
             */
            getInputValue: '',



            /* 
             * Override to determine how the plugin sets the value of the plugin.
             * 
             * @example
             * function( rowIndex, colIndex, value, inputId, form, row, cell, header ){} 
             * 
             * @param rowIndex is the row index of the row.
             * @param colIndex is the column index of the column.
             * @param value is the value being set.
             * @param inputId is the id of the input.
             * @param form is the form element.
             * @param row is the row element.
             * @param cell is the cell element.
             * @param header is the header element.
             */
            setInputValue: '',



            /* 
             * Override to render your own custom input.  For example you can 
             * override this to return a select element for a specific column.
             * 
             * @example
             * function(input, rowIdex, colIndex, header ){} 
             * 
             * @param input is the input element the plugin created to add to the form.
             * @param rowIndex is the index of the row.
             * @param colIndex is the index of the column.
             * @param header is the header element
             * 
             * @return a form element to display on the edit form.
             */
            renderInput: ''
        };


        // ---------------------------------------
        // Initialize everything!!
        // ---------------------------------------
        (function() {
            base.options = $.extend({}, $.editrowform.defaultOptions, options);

            build();

            // add listeners
            if (base.options.click) {
                var tr = $('tr td', base.el).parent();
                tr.dblclick(function() {
                    doubleClick(this);
                });

                tr.click(function() {
                    singleClick(this);
                });
            }

            if (base.options.hideOnBlur) {
                $(document).click(function(e) {
                    var isClickOnForm = $(e.target).closest($formDiv).length;
                    var isClickOnTable = $(e.target).closest(base.el).length;

                    if (!(isClickOnForm || isClickOnTable) && !publicShowCalled) {
                        hide();
                    }

                    // reset
                    publicShowCalled = false;
                });
            }


            // Dynamically position the form based on window size 
            $(window).resize(function() {
                setFormPosition(currentRow);
            });


            // add up/down arrow key listener
            $formDiv.keydown(function(e) {
                keydown(e);
            });

        }());
    };
}));
