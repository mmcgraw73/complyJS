# complyJS
An 8kb ADA compliancy jQuery module!

### What does it do?
* Programmatically builds navigation items
* Allows ADA user notification of system behavior
* Sanitizes your DOM with proper HTML syntax compliant with AA level WCAG 2.0
* Programmatically builds image alt tags for your page
* Programmatically builds ARIA label and tagging
* Built in debugging tools directly accessible from console

# CSS CLASSES AND IDs
#### $.adaNotify()
Creates two divs with ids applied **#adaStatus** and **#adaContent**
  
In addition to the IDs when the system is actived these divs while have an additional class for status.  
**.start** is applied upon system activation  
**.exit** is applied upon system close

#### General Navigation
If an menu item has no parent or the sub-menu is not opened current item class selected has the class **.working**
  
If a submenu is open the current item has the class **.working** while the submenu header has the class **.ada-parent**

# Methods and usage
### $.adaSanitize()
Sanitizes the current page after the DOM is ready to ensure proper HTML tag usage. An example would be changing all of the \<b\> and \<i\> tags to \<strong\> and \<em\>. 

### $.adaAria()
Creates ARIA tags for elements. Currently only implemented for labels and buttons. 

### $.adaImages([ [options],[options] ])
Creates alt attributes for all images passed in.

##### Param options
$.adaImages(["selector", "method", "text to use"])

**Method options**  
* "parent" - Retrieves the inner text of the selector's parent
* "sibling" - Retrieves the inner text of the selector's sibling
* "combo" - Retrieves the inner text of the selector's parent's child 
* "custom" - Passes a string literal as the alt attribute

##### Use case examples
```javascript
$.adaImages([
  ["#selector", "parent", "#parent to retrieve"],
  ["#selector", "sibling", "#sibling to retrieve"],
  ["#selector", "combo", "#parent to target", "#child to find in parent"],
  ["#selector", "custom", "My custom string"]
]);
```
### $.adaBuilder([ [selector, optional-parent] ])
Programmatically builds an ADA compliant navigation menu

##### Param options
$.adaBuilder([ [selector, optional-parent] ]) **or** with no parent needed $.adaBuilder([ selector ])

**Selector options**  
Selector needs to a jQuery defined selector. Example: $(".my-selector a")

**Optional Parent options**  
Parent to be targeted for submenu headers are passed through a string literal Example: '.my-parent'

##### Use case examples
```javascript
$.adaBuilder(
  [
    [jQuery('.header-top-links a'), '.community'], // optional parent param used
    jQuery('#search'),
    jQuery('.skip-cart'),
  ]
);
```
### $.adaMainContent(section,scrollSpeed)
Allows a section to be defined to skip to on SPACEBARD keydown event

**Param options**
* 'selector' - Needs to be passed a string literal. Example: '.my-selector'
* scrollSpeed - optional integer to pass. If not default is 1000ms

##### Use case example
```javascript
$.adaMainContent(".trending", 1000);
```

### $.adaDebug(option)
Accessible through console allowing you to recieve debug information for diagnosing system problems.

**Param options**
* "adaLinks" - Prints out all menus being used
* "parentLinks"- Prints out parent selectors being monitored by menus
* "index" - Monitors and prints out current index placement
* "event" - Monitors and prints out event
* "allMenu" - Prints out all the menu information, monitors and prints out event, monitors and prints out current index placement
