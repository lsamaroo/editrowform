requirejs.config({
    "baseUrl": "js/lib",
    "waitSeconds": 0,
    "paths": {
      "app": "../app",
      "jquery": "https://ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min",
      /* 
       * Loading the plug in this way to avoid making a copy of 
       * the source files to the baseUrl directory.
       * This is just for the demo.  You would be able to add the 
       * file directly to your baseUrl directory.
       */
      "jquery.editrowform": "../../../../dist/jquery.editrowform.min"
    }
});

// Load the main app module to start the app
requirejs(["app/main"]);