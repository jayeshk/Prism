// Generated by CoffeeScript 1.11.1

/*
  Template:

  Takes layer data from the Template file to copy it on your document. Cool right?
 */
var Template;

Template = (function() {
  Template.prototype.templateFileName = "Template.sketch";

  Template.prototype.artboardName = "Prism Palette";

  Template.prototype.cellName = "Cell";

  function Template(pluginURL) {
    var url;
    this.pluginURL = pluginURL;
    this.app = NSApplication.sharedApplication();
    url = this.pluginURL.URLByAppendingPathComponent(this.templateFileName);
    this.document = MSDocument.alloc().init();
    if (!this.document.readFromURL_ofType_error(url, "com.bohemiancoding.sketch.drawing", nil)) {
      this.app.displayDialog_withTitle("There was an error loading the Prism cell template file. Make sure a valid '" + this.templateFileName + "' file is inside the 'Prism.sketchplugin' folder.", "Oops!");
    }
  }

  Template.prototype.openTemplateFile = function() {
    var url, workspace;
    workspace = NSWorkspace.sharedWorkspace();
    url = this.pluginURL.URLByAppendingPathComponent(this.templateFileName);
    return workspace.openURL(url);
  };

  Template.prototype.getCell = function() {
    return this.getLayerByName(this.cellName);
  };

  Template.prototype.getArtboard = function() {
    return this.getLayerByName(this.artboardName);
  };

  Template.prototype.getLayerByName = function(name) {
    var i, j, layer, layers, ref;
    layers = this.document.currentPage().children();
    for (i = j = 0, ref = layers.count(); 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
      layer = layers[i];
      if (("" + (layer.name())) === name) {
        return layer.copy();
      }
    }
    this.app.displayDialog_withTitle("Couln't find the layer named " + name + " in the Template file.", "Cannot generate the palette");
    return null;
  };

  return Template;

})();
