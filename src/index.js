export default function enccon() {
    const C = 0.45;

    var globalRect, nodes, links, groupedLinks, rects = [];

    return {

        size(w, h) {
            globalRect = new Rect(0,0,w,h);
            return this;
        },

        nodes(n) {
            if (n) {
                nodes = n;
                return this;
            } else {
                return nodes;
            }
        },

        node(i) {
            return nodes[i];
        },

        links(l) {
            if(l) {
                links = l;
                return this;
            } else {
                return links;
            }
        },

        rects() {
            return rects;
        },

        start() {

            groupedLinks = _.groupBy(links, (l) => l.source);
            nodes = _.map(nodes, (node, nodeId) => ({ ...node, weight: this._calculateWeight(nodeId) }));
            links = _.map(links, (l) => ({ source: nodes[l.source], target: nodes[l.target]}));

            this._layoutNode(globalRect, 0);

            return this;
        },

        _layoutNode(rect, nodeId, depth = 0) {
            nodes[nodeId].x = rect.center().x;
            nodes[nodeId].y = rect.center().y;
            nodes[nodeId].rect = rect;
            nodes[nodeId].depth = depth;
            rects[nodeId] = rect;

            var children = this._getChildren(nodeId);
            var weights = _.map(children, (n) => nodes[n].weight);
            var resRects = [];
            var position = 0;

            while(weights.length > 0) {
                var res = partition(rect, weights, position);

                resRects = _.concat(resRects, res.rects);
                weights = _.takeRight(weights, weights.length - res.rects.length);
                rect = res.remainingRect;

                if(++position > 3)
                    position = 0;
            }

            for(var i = 0; i < resRects.length; i++) {
                this._layoutNode(resRects[i], children[i], depth + 1);
            }
        },

        _calculateWeight(nodeId) {
            var cw = 0.0;
            var children = this._getChildren(nodeId);

            for(var i = 0; i < children.length; i++) {
                cw += this._calculateWeight(children[i]);
            }

            return 1.0 + C * cw;
        },

        _getChildren(nodeId) {
            return _.map(groupedLinks[nodeId], (e) => e.target);
        }
    }
}

function partition(rect, weights, position) {
    const Position = {
        LEFT: 0,
        TOP: 1,
        RIGHT: 2,
        BOTTOM: 3
    }

    var weightTotal = _.reduce(weights, (sum, n) => sum + n, 0);

    var solutions = [];

    for (var count = 1; count <= weights.length; count++) {
        var subWeights = _.take(weights, count);
        var subWeightTotal = _.reduce(subWeights, (sum, n) => sum + n, 0);

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

            var minRatio = _.reduce(rects, (ratio, r) => Math.min(ratio, r.ratio()), 1.0);
            var solution = {
                rects,
                remainingRect: new Rect(rect.x + innerWidth, rect.y, rect.width() - innerWidth, rect.height()),
                minRatio,
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

            var minRatio = _.reduce(rects, (ratio, r) => Math.min(ratio, r.ratio()), 1.0);
            var solution = {
                rects,
                remainingRect: new Rect(rect.x, rect.y + innerHeight, rect.width(), rect.height() - innerHeight),
                minRatio,
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

            var minRatio = _.reduce(rects, (ratio, r) => Math.min(ratio, r.ratio()), 1.0);
            var solution = {
                rects,
                remainingRect: new Rect(rect.x + innerWidth, rect.y, rect.width() - innerWidth, rect.height()),
                minRatio,
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

            var minRatio = _.reduce(rects, (ratio, r) => Math.min(ratio, r.ratio()), 1.0);
            var solution = {
                rects,
                remainingRect: new Rect(rect.x, rect.y + innerHeight, rect.width(), rect.height() - innerHeight),
                minRatio,
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