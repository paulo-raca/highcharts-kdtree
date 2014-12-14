/*
* This plugin extends Highcharts to add a K-D-tree to find the nearest point on mouse move.
*
* This code comes from Extended Heatmap Demo, with minor modifications: http://www.highcharts.com/demo/heatmap-canvas
*/
(function (H) {
	var wrap = H.wrap,
		seriesTypes = H.seriesTypes;

	/**
	* Recursively builds a K-D-tree
	*/
	function KDTree(points, depth) {
		var axis, median, length = points && points.length;

		if (length) {

			// alternate between the axis
			axis = ['plotX', 'plotY'][depth % 2];

			// sort point array
			points.sort(function (a, b) {
				return a[axis] - b[axis];
			});

			median = Math.floor(length / 2);

			// build and return node
			return {
				point: points[median],
				left: KDTree(points.slice(0, median), depth + 1),
				right: KDTree(points.slice(median + 1), depth + 1)
			};

		}
	}

	/**
	* Recursively searches for the nearest neighbour using the given K-D-tree
	*/
	function nearest(search, tree, depth) {
		var point = tree.point,
			axis = ['plotX', 'plotY'][depth % 2],
			tdist,
			sideA,
			sideB,
			ret = point,
			nPoint1,
			nPoint2;

		// Get distance
		point.dist = Math.pow(search.plotX - point.plotX, 2) +
			Math.pow(search.plotY - point.plotY, 2);

		// Pick side based on distance to splitting point
		tdist = search[axis] - point[axis];
		sideA = tdist < 0 ? 'left' : 'right';

		// End of tree
		if (tree[sideA]) {
			nPoint1 = nearest(search, tree[sideA], depth + 1);

			ret = (nPoint1.dist < ret.dist ? nPoint1 : point);

			sideB = tdist < 0 ? 'right' : 'left';
			if (tree[sideB]) {
				// compare distance to current best to splitting point to decide wether to check side B or not
				if (Math.abs(tdist) < ret.dist) {
					nPoint2 = nearest(search, tree[sideB], depth + 1);
					ret = (nPoint2.dist < ret.dist ? nPoint2 : ret);
				}
			}
		}
		return ret;
	}

	// Extend the heatmap to use the K-D-tree to search for nearest points
	H.wrap(Highcharts.Series.prototype, 'setTooltipPoints', function (proceed, renew) {
		var series = this;
		var chart = series.chart;

		series.kdtree = null;
		if (!chart.options.tooltip.nearest) {
			proceed.call(this, renew);
		} else {
			setTimeout(function () {
				series.kdtree = KDTree(series.points, 0);
			});
		}
	});

	H.wrap(H.Pointer.prototype, 'runPointActions', function (proceed, e) {
		var series = this;
		var chart = series.chart;
		if (!chart.options.tooltip.nearest) {
			proceed.call(this, e);
		} else {
			var nearest_point = null;
			H.each(chart.series, function (series) {
				if (series.visible && series.options.enableMouseTracking !== false && series.kdtree) {
					var point = nearest(
						{
							plotX: e.chartX - chart.plotLeft,
							plotY: e.chartY - chart.plotTop
						},
						series.kdtree,
						0);
					if (point) {
						if (!nearest_point || (point.dist < nearest_point.dist)) {
							nearest_point = point;
						}
					}
				}
			});
			if (nearest_point) {
				nearest_point.onMouseOver(e);
			}
		}
	});
}(Highcharts));
