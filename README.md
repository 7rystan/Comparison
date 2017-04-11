# Comparison Bar Graph
The purpose of this graph is to visualize two collumns of data within the same CSV file, as well as load different CSV files with the drop down menu.  You can also select to view just one set of data or both with the checkbox.

## Installation
* Download the zip file and extract
* Open index.html in any supporter browser
* **If you get the error "Cross origin requests are only supported for protocol schemes: http, data, chrome, chrome-extension, https", try opening it in Firefox or opening it with an editor like Brackets, then previewing it from there.**

## Personalization
* Open the HTML file in an editor
* Go to line 54 - 61
```html
    <div class="selector">
        <select onchange="loadData()" id="metric">
            <option>Example_1</option>
            <option>Example_2</option>
            <option>Example_3</option>
            <option>Example_4</option>
        </select>
    </div>
```
* Change the values within the option tags to the names of the csv files you want to load, also change the description divs (line 38 - 44) to whatever you want
* Open javascript.js
* Change any instances where you see data being loaded to the specific data that you personally want to load

## Supported Browsers
* Chrome
* Firefox 3+
* Edge
* IE 8+
* Safari 3.2+
* Opera 10.1+
