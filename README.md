highcharts-nearest-marker
==================

This is a plugin for Highcharts to highlight the nearest marker. Instead of using mouse-over events, it relies on a tree data structure to find the neares marker.

Advantages:
- Doesn't rely on SVG mouse-over events. This will work transparently with a canvas renderer (http://www.highcharts.com/demo/heatmap-canvas)
- Doesn't require markers to be drawn. Otherwise "transparent markers" would had been needed.

Disadvantages:
- Won't work on shared tooltip and probably number of other special cases.
- This might not be what you want

DEMO
====

http://jsfiddle.net/9fab6kog/

This demo is based on the Extended Heatmap Demo (http://www.highcharts.com/demo/heatmap-canvas), modified to use this plugin instead of the inline code
