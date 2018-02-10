// Generated by CoffeeScript 1.12.6

/*
  ColorFormatter:
  Used to transform a color into different color formats
  it also has the logic to display the color formatter dialog and some class methods to transform a MSColor
  to a color Dictionary that can be saved in a layer
 */
var AndroidJavaFormatter, AndroidXMLFormatter, CLRFormatter, ColorFormatter, FormatterBase, HexFormatter, RGBACSSFormatter, SASSFormatter, UIColorObjCFormatter, UIColorSwiftFormatter,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

ColorFormatter = (function() {
  ColorFormatter.prototype.FORMATS = [];

  ColorFormatter.prototype.colorClassifier = new ColorClassifier();

  function ColorFormatter() {
    this.FORMATS.push(new HexFormatter());
    this.FORMATS.push(new RGBACSSFormatter());
    this.FORMATS.push(new SASSFormatter());
    this.FORMATS.push(new CLRFormatter());
    this.FORMATS.push(new UIColorSwiftFormatter());
    this.FORMATS.push(new UIColorObjCFormatter());
    this.FORMATS.push(new AndroidJavaFormatter());
    this.FORMATS.push(new AndroidXMLFormatter());
  }


  /*
    Shows the dialog to export the color dictionaries you provide
    returns a response code to know which button the user clicked.
   */

  ColorFormatter.prototype.showDialogWithColorDictionaries = function(colorDictionaries) {
    var accessory, alert, allColorsString, copyButton, formatObj, names, pasteboard, responseCode, savePanel, selection, types;
    names = this.FORMATS.map(function(enc) {
      return enc.name();
    });
    types = this.FORMATS.map(function(enc) {
      return enc.type();
    });
    accessory = NSPopUpButton.alloc().initWithFrame_pullsDown(NSMakeRect(0, 0, 400, 25), false);
    accessory.addItemsWithTitles(names);
    accessory.selectItemAtIndex(0);
    alert = NSAlert.alloc().init();
    alert.setMessageText("Export colors");
    alert.setInformativeText("Select the color format:");
    alert.addButtonWithTitle('Save to file...');
    copyButton = alert.addButtonWithTitle('Copy to clipboard');
    alert.addButtonWithTitle('Cancel');
    alert.setAccessoryView(accessory);
    accessory.setCOSJSTargetFunction((function(_this) {
      return function(sender) {
        var obj, selection;
        selection = accessory.indexOfSelectedItem();
        obj = _this.FORMATS[selection];
        return copyButton.setEnabled(obj.supportClipboard());
      };
    })(this));
    responseCode = alert.runModal();
    selection = accessory.indexOfSelectedItem();
    formatObj = this.FORMATS[selection];
    switch (responseCode) {
      case 1000:
        log("Saving...");
        switch (formatObj.type()) {
          case FormatterBase.EXPORT_TYPE_FILE:
            savePanel = NSSavePanel.savePanel();
            savePanel.setNameFieldStringValue(formatObj.format());
            savePanel.setAllowsOtherFileTypes(true);
            savePanel.setExtensionHidden(false);
            if (savePanel.runModal()) {
              formatObj.exportAsFile(colorDictionaries, savePanel.URL());
            }
            break;
          default:
            log("Not implemented CLR");
        }
        break;
      case 1001:
        log("Copying...");
        allColorsString = formatObj.exportAsString(colorDictionaries);
        pasteboard = NSPasteboard.generalPasteboard();
        pasteboard.declareTypes_owner([NSPasteboardTypeString], null);
        pasteboard.setString_forType(allColorsString, NSPasteboardTypeString);
    }
    return responseCode;
  };

  ColorFormatter.prototype.formatTextFromColorDictionary = function(format, colorDictionaries) {
    var allColorsString, colorDictionary, i, len, lines;
    lines = [];
    for (i = 0, len = colorDictionaries.length; i < len; i++) {
      colorDictionary = colorDictionaries[i];
      lines.push(this.formatColorDictionary_withFormat_commented(colorDictionary, format, true));
    }
    return allColorsString = lines.join("\n");
  };

  ColorFormatter.prototype.writeStringToFile = function(filePath, string) {
    var fileString;
    fileString = NSString.stringWithString(string);
    return fileString.writeToFile_atomically_encoding_error(filePath, true, NSUTF8StringEncoding, null);
  };


  /*
    Takes a color dictionary and a format and returns a formatted string
    The commented flag is used to add comments (like when we export colors)
    or removing them (like when we are populating the cell layers with color data)
   */

  ColorFormatter.prototype.formatColorDictionary_withFormat_commented = function(colorDictionary, format, commented, url) {
    var formatIDs;
    formatIDs = this.FORMATS.map(function(enc) {
      return enc.id;
    });
    if (indexOf.call(formatIDs, format) >= 0) {
      return eval("this.format_" + format + "(colorDictionary, commented, url);");
    } else {
      return log("'" + format + "' format not implemented.");
    }
  };


  /*
    Takes a MSColor and a name or alias and packs it on a dictionary representation that can be then saved on a layer using the PluginCommand
   */

  ColorFormatter.colorToDictionary = function(color, name) {
    var dictionary;
    return dictionary = {
      name: name,
      hex: color.immutableModelObject().hexValue(),
      red: color.red(),
      blue: color.blue(),
      green: color.green(),
      alpha: color.alpha()
    };
  };


  /*
    Takes a the dictionary representation from above and returns a new MSColor instance
   */

  ColorFormatter.dictionaryToColor = function(dictionary) {
    var color;
    return color = MSColor.colorWithRed_green_blue_alpha(dictionary.red, dictionary.green, dictionary.blue, dictionary.alpha);
  };

  return ColorFormatter;

})();


/*
**************** FORMATS ****************
  HERE is when you have to do the implementation of the new format you want to add.

  all these methods must be prefixed with "format_" and then the format ID specified in he FORMATS constant
 */

FormatterBase = (function() {
  function FormatterBase() {}

  FormatterBase.prototype.EXPORT_TYPE_FILE = "file";

  FormatterBase.prototype.EXPORT_TYPE_FILES = "files";

  FormatterBase.prototype.identifier = function() {};

  FormatterBase.prototype.name = function() {};

  FormatterBase.prototype.format = function() {};

  FormatterBase.prototype.type = function() {
    return this.constructor.EXPORT_TYPE_FILE;
  };

  FormatterBase.prototype.supportClipboard = function() {
    return true;
  };

  FormatterBase.prototype.formatText = function(color, commented) {};

  FormatterBase.prototype.formatTextFromColorDictionaries = function(colorDictionaries) {
    var allColorsString, colorDictionary, i, len, lines;
    lines = [];
    for (i = 0, len = colorDictionaries.length; i < len; i++) {
      colorDictionary = colorDictionaries[i];
      lines.push(this.formatText(colorDictionary, true));
    }
    return allColorsString = lines.join("\n");
  };

  FormatterBase.prototype.writeStringToFile = function(filePath, string) {
    var fileString;
    fileString = NSString.stringWithString(string);
    return fileString.writeToFile_atomically_encoding_error(filePath, true, NSUTF8StringEncoding, null);
  };

  FormatterBase.prototype.exportAsFile = function(colorDictionaries, url) {
    var text;
    text = this.formatTextFromColorDictionaries(colorDictionaries);
    return this.writeStringToFile(url.path(), text);
  };

  FormatterBase.prototype.exportAsString = function(colorDictionaries) {
    var text;
    return text = this.formatTextFromColorDictionaries(colorDictionaries);
  };

  return FormatterBase;

})();

HexFormatter = (function(superClass) {
  extend(HexFormatter, superClass);

  function HexFormatter() {
    return HexFormatter.__super__.constructor.apply(this, arguments);
  }

  HexFormatter.prototype.identifier = function() {
    return "HEX";
  };

  HexFormatter.prototype.name = function() {
    return "HEX CSS";
  };

  HexFormatter.prototype.format = function() {
    return "colors.css";
  };

  HexFormatter.prototype.formatText = function(color, commented) {
    var formattedColor;
    formattedColor = '#' + color.hex;
    if (commented) {
      return formattedColor + "; /* " + color.name + " */";
    } else {
      return formattedColor;
    }
  };

  return HexFormatter;

})(FormatterBase);

RGBACSSFormatter = (function(superClass) {
  extend(RGBACSSFormatter, superClass);

  function RGBACSSFormatter() {
    return RGBACSSFormatter.__super__.constructor.apply(this, arguments);
  }

  RGBACSSFormatter.prototype.identifier = function() {
    return "RGBA_CSS";
  };

  RGBACSSFormatter.prototype.name = function() {
    return "RGBA CSS";
  };

  RGBACSSFormatter.prototype.format = function() {
    return "colors.css";
  };

  RGBACSSFormatter.prototype.formatText = function(color, commented) {
    var alpha, formattedColor;
    alpha = color.alpha < 1 ? color.alpha.toFixed(2) : color.alpha;
    formattedColor = "rgba(" + (Math.round(color.red * 255)) + "," + (Math.round(color.green * 255)) + "," + (Math.round(color.blue * 255)) + "," + alpha + ");";
    if (commented) {
      return formattedColor + " /* " + color.name + " */";
    } else {
      return formattedColor;
    }
  };

  return RGBACSSFormatter;

})(FormatterBase);

SASSFormatter = (function(superClass) {
  extend(SASSFormatter, superClass);

  function SASSFormatter() {
    return SASSFormatter.__super__.constructor.apply(this, arguments);
  }

  SASSFormatter.prototype.identifier = function() {
    return "SASS";
  };

  SASSFormatter.prototype.name = function() {
    return "SASS variables";
  };

  SASSFormatter.prototype.format = function() {
    return "_colors.scss";
  };

  SASSFormatter.prototype.formatText = function(color, commented) {
    var formattedColor, sassVariableName;
    formattedColor = '#' + color.hex;
    sassVariableName = '$' + color.name.toLowerCase().trim().split(" ").join("-").replace("'", "");
    return sassVariableName + ": " + formattedColor + ";";
  };

  return SASSFormatter;

})(FormatterBase);

UIColorSwiftFormatter = (function(superClass) {
  extend(UIColorSwiftFormatter, superClass);

  function UIColorSwiftFormatter() {
    return UIColorSwiftFormatter.__super__.constructor.apply(this, arguments);
  }

  UIColorSwiftFormatter.prototype.identifier = function() {
    return "UICOLOR_SWIFT";
  };

  UIColorSwiftFormatter.prototype.name = function() {
    return "UIColor (Swift)";
  };

  UIColorSwiftFormatter.prototype.format = function() {
    return "colors.m";
  };

  UIColorSwiftFormatter.prototype.formatText = function(color, commented) {
    var alpha, blue, formattedColor, green, red;
    red = Math.round(color.red * 100) / 100;
    green = Math.round(color.green * 100) / 100;
    blue = Math.round(color.blue * 100) / 100;
    alpha = Math.round(color.alpha * 100) / 100;
    formattedColor = "UIColor(red:" + red + ", green:" + green + ", blue:" + blue + ", alpha:" + alpha + ")";
    if (commented) {
      return formattedColor + " // " + color.name;
    } else {
      return formattedColor;
    }
  };

  return UIColorSwiftFormatter;

})(FormatterBase);

UIColorObjCFormatter = (function(superClass) {
  extend(UIColorObjCFormatter, superClass);

  function UIColorObjCFormatter() {
    return UIColorObjCFormatter.__super__.constructor.apply(this, arguments);
  }

  UIColorObjCFormatter.prototype.identifier = function() {
    return "UICOLOR_OBJC";
  };

  UIColorObjCFormatter.prototype.name = function() {
    return "UIColor (Objective-C)";
  };

  UIColorObjCFormatter.prototype.format = function() {
    return "colors.m";
  };

  UIColorObjCFormatter.prototype.formatText = function(color, commented) {
    var alpha, blue, formattedColor, green, red;
    red = Math.round(color.red * 100) / 100;
    green = Math.round(color.green * 100) / 100;
    blue = Math.round(color.blue * 100) / 100;
    alpha = Math.round(color.alpha * 100) / 100;
    formattedColor = "[UIColor colorWithRed:" + red + " green:" + green + " blue:" + blue + " alpha:" + alpha + "];";
    if (commented) {
      return formattedColor + " // " + color.name;
    } else {
      return formattedColor;
    }
  };

  return UIColorObjCFormatter;

})(FormatterBase);

AndroidJavaFormatter = (function(superClass) {
  extend(AndroidJavaFormatter, superClass);

  function AndroidJavaFormatter() {
    return AndroidJavaFormatter.__super__.constructor.apply(this, arguments);
  }

  AndroidJavaFormatter.prototype.identifier = function() {
    return "ANDROID";
  };

  AndroidJavaFormatter.prototype.name = function() {
    return "Android ARGB (Java code)";
  };

  AndroidJavaFormatter.prototype.format = function() {
    return "colors.java";
  };

  AndroidJavaFormatter.prototype.formatText = function(color, commented) {
    var formattedColor;
    formattedColor = "Color.argb(" + (Math.round(color.alpha * 255)) + "," + (Math.round(color.red * 255)) + "," + (Math.round(color.green * 255)) + "," + (Math.round(color.blue * 255)) + ");";
    if (commented) {
      return formattedColor + " // " + color.name;
    } else {
      return formattedColor;
    }
  };

  return AndroidJavaFormatter;

})(FormatterBase);

AndroidXMLFormatter = (function(superClass) {
  extend(AndroidXMLFormatter, superClass);

  function AndroidXMLFormatter() {
    return AndroidXMLFormatter.__super__.constructor.apply(this, arguments);
  }

  AndroidXMLFormatter.prototype.identifier = function() {
    return "ANDROID_XML";
  };

  AndroidXMLFormatter.prototype.name = function() {
    return "Android ARGB (XML)";
  };

  AndroidXMLFormatter.prototype.format = function() {
    return "colors.xml";
  };

  AndroidXMLFormatter.prototype.formatText = function(color, commented) {
    var formattedColor, xmlVariable;
    formattedColor = "" + helperHex(color.alpha * 255) + color.hex;
    xmlVariable = '<color name="' + color.name.toLowerCase().trim().split(" ").join("_") + '">#' + formattedColor + "</color>";
    return xmlVariable;
  };

  return AndroidXMLFormatter;

})(FormatterBase);

CLRFormatter = (function(superClass) {
  extend(CLRFormatter, superClass);

  function CLRFormatter() {
    return CLRFormatter.__super__.constructor.apply(this, arguments);
  }

  CLRFormatter.prototype.identifier = function() {
    return "CLR";
  };

  CLRFormatter.prototype.name = function() {
    return "clr";
  };

  CLRFormatter.prototype.format = function() {
    return "colors.clr";
  };

  CLRFormatter.prototype.supportClipboard = function() {
    return false;
  };

  CLRFormatter.prototype.exportAsFile = function(colorDictionaries, url) {
    var alpha, blue, color, colorDictionary, colorList, green, i, len, red;
    colorList = NSColorList.alloc().initWithName("colors");
    for (i = 0, len = colorDictionaries.length; i < len; i++) {
      colorDictionary = colorDictionaries[i];
      red = Math.round(colorDictionary.red * 100) / 100;
      green = Math.round(colorDictionary.green * 100) / 100;
      blue = Math.round(colorDictionary.blue * 100) / 100;
      alpha = Math.round(colorDictionary.alpha * 100) / 100;
      color = NSColor.colorWithSRGBRed_green_blue_alpha(red, green, blue, alpha);
      colorList.setColor_forKey(color, colorDictionary.name);
    }
    return colorList.writeToFile(url.path());
  };

  return CLRFormatter;

})(FormatterBase);
