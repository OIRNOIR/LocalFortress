# LocalFortress

This extension blocks requests to localhost from websites that are not running on localhost. You can whitelist individual sites to be exempt from this.
## Why would you want to block requests to localhost?
Websites can use javascript to scan ports on your computer to look for web servers running on your computer. For example, Discord runs a web server that can be found by a simple port scan, and you can be profiled as a Discord user. Blocking these requests would prevent profiling by websites you visit.

In addition, this extension helps to prevent exploitation of unsecured web servers that applications you install may run. For example, Zoom used to have an unsecured web server that gave access to the webcam.

This extension requires host permissions for all websites because it needs to monitor and block web requests. We don't collect your data, your data never leaves your device, and your data is only used for this extension's functionality.

Install here: https://addons.mozilla.org/en-US/firefox/addon/localfortress/