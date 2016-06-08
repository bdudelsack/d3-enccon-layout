"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = enccon;
function enccon() {
    var C = 0.45;

    var globalRect,
        _nodes,
        _links,
        groupedLinks,
        _rects = [];

    return {
        size: function size(w, h) {
            globalRect = new Rect(0, 0, w, h);
            return this;
        },
        nodes: function nodes(n) {
            if (n) {
                _nodes = n;
                return this;
            } else {
                return _nodes;
            }
        },
        node: function node(i) {
            return _nodes[i];
        },
        links: function links(l) {
            if (l) {
                _links = l;
                return this;
            } else {
                return _links;
            }
        },
        rects: function rects() {
            return _rects;
        },
        start: function start() {
            var _this = this;

            groupedLinks = _.groupBy(_links, function (l) {
                return l.source;
            });
            _nodes = _.map(_nodes, function (node, nodeId) {
                return _extends({}, node, { weight: _this._calculateWeight(nodeId) });
            });
            _links = _.map(_links, function (l) {
                return { source: _nodes[l.source], target: _nodes[l.target] };
            });

            this._layoutNode(globalRect, 0);

            return this;
        },
        _layoutNode: function _layoutNode(rect, nodeId) {
            var depth = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];

            _nodes[nodeId].x = rect.center().x;
            _nodes[nodeId].y = rect.center().y;
            _nodes[nodeId].rect = rect;
            _nodes[nodeId].depth = depth;
            _rects[nodeId] = rect;

            var children = this._getChildren(nodeId);
            var weights = _.map(children, function (n) {
                return _nodes[n].weight;
            });
            var resRects = [];
            var position = 0;

            while (weights.length > 0) {
                var res = partition(rect, weights, position);

                resRects = _.concat(resRects, res.rects);
                weights = _.takeRight(weights, weights.length - res.rects.length);
                rect = res.remainingRect;

                if (++position > 3) position = 0;
            }

            for (var i = 0; i < resRects.length; i++) {
                this._layoutNode(resRects[i], children[i], depth + 1);
            }
        },
        _calculateWeight: function _calculateWeight(nodeId) {
            var cw = 0.0;
            var children = this._getChildren(nodeId);

            for (var i = 0; i < children.length; i++) {
                cw += this._calculateWeight(children[i]);
            }

            return 1.0 + C * cw;
        },
        _getChildren: function _getChildren(nodeId) {
            return _.map(groupedLinks[nodeId], function (e) {
                return e.target;
            });
        }
    };
}

function partition(rect, weights, position) {
    var Position = {
        LEFT: 0,
        TOP: 1,
        RIGHT: 2,
        BOTTOM: 3
    };

    var weightTotal = _.reduce(weights, function (sum, n) {
        return sum + n;
    }, 0);

    var solutions = [];

    for (var count = 1; count <= weights.length; count++) {
        var subWeights = _.take(weights, count);
        var subWeightTotal = _.reduce(subWeights, function (sum, n) {
            return sum + n;
        }, 0);

        if (position == Position.RIGHT) {

            var y = rect.y + rect.height();
            var rects = [];

            var innerWidth = rect.width() * subWeightTotal / weightTotal;

            for (var i = 0; i < count; i++) {
                var weight = subWeights[i];
                var rectHeight = rect.height() * weight / subWeightTotal;
                var r = new Rect(rect.x, y - rectHeight, innerWidth, rectHeight);

                r.weight = weight;

                rects.push(r);
                y -= r.height();
            }

            var minRatio = _.reduce(rects, function (ratio, r) {
                return Math.min(ratio, r.ratio());
            }, 1.0);
            var solution = {
                rects: rects,
                remainingRect: new Rect(rect.x + innerWidth, rect.y, rect.width() - innerWidth, rect.height()),
                minRatio: minRatio,
                worse: count > 1 && minRatio < _.last(solutions).minRatio
            };

            if (solution.worse) {
                return _.last(solutions);
            }

            solutions.push(solution);
        } else if (position == Position.TOP) {
            var x = rect.x;
            var rects = [];

            var innerHeight = rect.height() * subWeightTotal / weightTotal;

            for (var i = 0; i < count; i++) {
                var weight = subWeights[i];
                var rectWidth = rect.width() * weight / subWeightTotal;
                var r = new Rect(x, rect.y, rectWidth, innerHeight);

                r.weight = weight;

                rects.push(r);
                x += r.width();
            }

            var minRatio = _.reduce(rects, function (ratio, r) {
                return Math.min(ratio, r.ratio());
            }, 1.0);
            var solution = {
                rects: rects,
                remainingRect: new Rect(rect.x, rect.y + innerHeight, rect.width(), rect.height() - innerHeight),
                minRatio: minRatio,
                worse: count > 1 && minRatio < _.last(solutions).minRatio
            };

            if (solution.worse) {
                return _.last(solutions);
            }

            solutions.push(solution);
        } else if (position == Position.LEFT) {

            var y = rect.y;
            var rects = [];

            var innerWidth = rect.width() * subWeightTotal / weightTotal;

            for (var i = 0; i < count; i++) {
                var weight = subWeights[i];
                var rectHeight = rect.height() * weight / subWeightTotal;
                var r = new Rect(rect.x, y, innerWidth, rectHeight);

                r.weight = weight;

                rects.push(r);
                y += r.height();
            }

            var minRatio = _.reduce(rects, function (ratio, r) {
                return Math.min(ratio, r.ratio());
            }, 1.0);
            var solution = {
                rects: rects,
                remainingRect: new Rect(rect.x + innerWidth, rect.y, rect.width() - innerWidth, rect.height()),
                minRatio: minRatio,
                worse: count > 1 && minRatio < _.last(solutions).minRatio
            };

            if (solution.worse) {
                return _.last(solutions);
            }

            solutions.push(solution);
        } else if (position == Position.BOTTOM) {
            var x = rect.x + rect.width();
            var rects = [];

            var innerHeight = rect.height() * subWeightTotal / weightTotal;

            for (var i = 0; i < count; i++) {
                var weight = subWeights[i];
                var rectWidth = rect.width() * weight / subWeightTotal;
                var r = new Rect(x - rectWidth, rect.y, rectWidth, innerHeight);

                r.weight = weight;

                rects.push(r);
                x -= r.width();
            }

            var minRatio = _.reduce(rects, function (ratio, r) {
                return Math.min(ratio, r.ratio());
            }, 1.0);
            var solution = {
                rects: rects,
                remainingRect: new Rect(rect.x, rect.y + innerHeight, rect.width(), rect.height() - innerHeight),
                minRatio: minRatio,
                worse: count > 1 && minRatio < _.last(solutions).minRatio
            };

            if (solution.worse) {
                return _.last(solutions);
            }

            solutions.push(solution);
        }
    }

    return _.last(solutions);
}