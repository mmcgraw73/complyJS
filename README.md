# complyJS
An 8kb ADA compliancy jQuery module!

### What does it do?
* Programmatically builds navigation items
* Allows ADA user notification of system behavior
* Sanitizes your DOM with proper HTML syntax compliant with AA level WCAG 2.0
* Programmatically builds image alt tags for your page
* Programmatically builds ARIA label and tagging
* Built in debugging tools directly accessible from console

# Methods and usage
### $.adaSanitize()
Sanitizes the current page after the DOM is ready to ensure proper HTML tag usage. An example would be changing all of the \<b\> and \<i\> tags to \<strong\> and \<em\>. 

### $.adaAria()
Creates ARIA tags for elements. Currently only implemented for labels and buttons. 

### $.adaImages([[options],[options]])
Creates alt attributes for all images passed in.

##### Param options
$.adaImages(["selector", "method", "text to use"])

**Method options**
* "parent" - Retrieves the inner text of the selector's parent
* "sibling" - Retrieves the inner text of the selector's sibling
* "combo" - Retrieves the inner text of the selector's parent's child 
* "custom" - Passes a string literal as the alt attribute

##### Use case examples
```
$.adaImages([
  ["#selector", "parent", "#parent to retrieve"],
  ["#selector", "sibling", "#sibling to retrieve"],
  ["#selector", "combo", "#parent to target", "#child to find in parent"],
  ["#selector", "custom", "My custom string"]
]);
```
