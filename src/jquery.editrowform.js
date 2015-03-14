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
		    $.editrowform = function(el, options){
		    	var editrowform
		    	
		        // To avoid scope issues, use 'base' instead of 'this'
		        // to reference this class from internal events and functions.
		        var base = this;
		        
		        // Access to jQuery and DOM versions of element
		        base.$el = $(el);
		        base.el = el;

		        // Add a reverse reference to the DOM object
		        base.$el.data("editrowform", base);
	
		        
		        base.init = function(){
		            base.options = $.extend({},$.editrowform.defaultOptions, options);
		            console.log( "init");
		        };
		        
		        
				base.getName = function(args){
					 return "editrowform";
				};
				 
				base.destroy = function(args){
					 console.log( "destroy");
					 base.$el.removeData( "editrowform" );
					 return base;					 
				};

		    };
		    
		    
		    $.editrowform.defaultOptions = {
		    };
		    
		    
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
		    
		}

);