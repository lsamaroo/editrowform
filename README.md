# editrowform
I wanted to be able to treat each row of a table as a cohesive form item (without me manually building the form) that I could edit and send to the server but I couldn't find anything out there fitting what I had in mind.  So presenting the editrowform plugin:

"A jquery plugin which allows you to edit each row of a table inline as a comprehensive form complete with a save and cancel button."

Examples:
Take a look at the test directory for examples.

Usage:
Download the javascript and css file and include it in your page as
	<link rel="stylesheet" href="../src/jquery.editrowform.css">
	<script src="../src/jquery.editrowform.js"></script>
	
	
	
$( "#myTable" ).editrowform();
