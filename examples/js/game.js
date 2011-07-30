var mapWidth = 30, 
    mapHeight = 30, 
    mapY = 0,
    tileTypes = [
        {type: "earth",  weight: 50, density:  5},
        {type: "rock",   weight: 10, density: 100},
        {type: "silver", weight: 10, density:  10},
        {type: "gold",   weight:  1, density:  15}
    ],
    tileTypeTotal = getTotalWeight(tileTypes),
    scrollTop = $(window).scrollTop(),
    $countdownTimeoutOption,
    $details,
    $selectedStructure,
    countDown = new Date(),
    finder;

function initGame($map) {
    buildLevel($map);
    buildStructure(getTile(8, 10), $('#structures #treasury'));
    buildStructure(getTile(9, 10), $('#structures #treasury'));
    buildStructure(getTile(10, 10), $('#structures #treasury'));
    buildStructure(getTile(11, 10), $('#structures #treasury'));
    buildStructure(getTile(12, 10), $('#structures #treasury'));
    buildStructure(getTile(12, 9), $('#structures #treasury'));
    buildStructure(getTile(12, 8), $('#structures #treasury'));
    buildStructure(getTile(12, 7), $('#structures #treasury'));
    buildStructure(getTile(12, 6), $('#structures #treasury'));
    buildStructure(getTile(12, 5), $('#structures #treasury'));
    $countdownTimeoutOption = $('#countdown-timeout');
    $details = $('#details');
    $('#structures div').click(function(event) {
        $('#structures div').removeClass('selected');
        var $structure = $(event.currentTarget);
        $structure.addClass('selected');
        $selectedStructure = $structure;
    });
    
    countDown = countDown.setSeconds(countDown.getSeconds() + 10);
    setInterval('update()', 100);
}

function update() {
    var now = new Date();
    if(now < countDown) {
        var diff = Math.floor(countDown - now / 1000);
        var msg = Math.floor(diff / 60) + ':' + diff % 60;
        $('#next-round #countdown').html(msg);
    } else {
        $('#next-round #countdown').html('Round Begun');
    }
}

function getTotalWeight(tileTypes) {
    var totalWeight = 0;
    for(var i = 0; i < tileTypes.length; i++) {
        totalWeight += tileTypes[i].weight;
    }
    return totalWeight;
}

function buildLevel($map) {
    for(var i = mapY; i < mapHeight; i++, mapY++) {
        buildLevelRow($map, i, 'grass');
    }
}

function setTileType($tile, type) {
    $tile.removeClass().addClass('tile').addClass(type);
}

function buildLevelRow($map, y, type) {
    for(var x = 0; x < mapWidth; x++) {
        $tile = $('<div class="tile ' + type + '" data-x="' + x + '" data-y="' + y + '"></div>')
            .click(tileClick);
        $map.append($tile);
    }
}

function tileClick(event) {
    var $tile = $(event.currentTarget);
    if(! $selectedStructure) {
        return false;
    }
    console.debug('click', isCountdown($tile), ! isReachable($tile), isTileExplored($tile));
    if(! isReachable($tile) || isTileExplored($tile)) {
        return false;
    }
    
    buildStructure($tile, $selectedStructure);
    clearHighlight();
    finder.findPath(0, 0, 10, 15);
    return true;
}

function clearHighlight() {
    $('#map .tile').html('');
}

function buildStructure($tile, $structure) {
    console.debug($structure.attr('id'));
    $tile.removeClass('grass');
    $tile.addClass($structure.attr('id'));
//    setTileCountdown($tile, getTileType($tile).density);
//    beginCountdown($tile);
}

function isCountdown($tile) {
    return ($tile.html() != '');
}

function setTileCountdown($tile, duration) {
    $tile.html(duration);
}

function beginCountdown($tile) {
    var newCountdown = parseInt($tile.html()) - 1;
    $tile.html(newCountdown);
    if(newCountdown <= 0) {
        tileExploded($tile);
    } else {
        setTimeout(function() {beginCountdown($tile)}, $countdownTimeoutOption.val());
    }
}

function tileExploded($tile) {
    $tile.html('');
    updateScore(getTileType($tile).type, 1);
    $tile.removeClass().addClass('tile').addClass('mine');
    exploreAdjacentTiles($tile);
}

function getTileType($tile) {
    for(var i = 0; i < tileTypes.length; i++) {
        if($tile.hasClass(tileTypes[i].type)) {
            return tileTypes[i];
        }
    }
    return false;
}

function exploreAdjacentTiles($centerTile) {
    var x = parseInt($centerTile.attr('data-x')),
        y = parseInt($centerTile.attr('data-y'));

    exploreTile(getTile(x-1, y-1));
    exploreTile(getTile(x-1, y));
    exploreTile(getTile(x-1, y+1));
    exploreTile(getTile(x, y+1));
    exploreTile(getTile(x+1, y+1));
    exploreTile(getTile(x+1, y));
    exploreTile(getTile(x+1, y-1));
    exploreTile(getTile(x, y-1));
}

function exploreTile($tile) {
    if(! $tile || ! $tile.hasClass('undiscovered')) {
        return;
    }

    $tile.removeClass('undiscovered').addClass(getRandomWeightedType());
}

function getRandomWeightedType() {
    var selected = Math.floor(Math.random()*tileTypeTotal);
    var weightCounter = 0;
    for(var i = 0; i < tileTypes.length; i++) {
        weightCounter += tileTypes[i].weight;
        if(weightCounter > selected) {
            return tileTypes[i].type;
        }
    }

    console.error('Failed to locate type: ' + selected);
    return false;
}

function updateScore(id, increment) {
    var $value = $('#' + id + ' .value');
    $value.html(parseInt($value.html()) + increment);
}

function isReachable($tile) {
    var x = parseInt($tile.attr('data-x')), 
        y = parseInt($tile.attr('data-y'));

    if(! isWithinMap(x, y)) {
        return false;
    }

    return isConnectedToMaze(x, y);
}

function isConnectedToMaze(x, y) {
    return true;
    
    if(0) { // todo
        return true;
    } else if(isTileExplored(getTile(x, y - 1))) { // up
        return true;
    } else if(isTileExplored(getTile(x - 1, y))) { // left
        return true;
    } else if(isTileExplored(getTile(x + 1, y))) { // right
        return true;
    }
    return false;
}

function isWithinMap(x, y) {
    return (x < mapWidth && x >= 0 || y < mapHeight && y >= 0);
}

function isTileDiscovered($tile) {
    if($tile) {
        if(! $tile.hasClass('undiscovered')) {
            return true;
        }
    }

    return false;
}

function isTileExplored($tile) {
    if($tile) {
        if(! $tile.hasClass('grass')) {
            return true;
        }
    }

    return false;
}

function getTileRow(y) {
    return $('.tile[data-y=' + y + ']');
}

function getTile(x, y) {
    var tiles = getTileRow(y);
    for(var i = 0; i < tiles.length; i++) {
        var $tile = $(tiles[i]);
        if($tile.attr('data-x') == x) {
            return $tile;
        }
    }

    console.warn('Failed to locate tile: [' + x + ',' + y + ']');
    return false;
}

PathFinder = function() {}
PathFinder.prototype = {
    closed: [],
    open: [],
    counter: 0,
    
    findPath: function(sx, sy, dx, dy) {
        this.closed = [];
        this.open = [];
        this.counter = 0;
        
        var nextNode = {x: sx, y: sy, h: 0};
        this.addOpenNodes([nextNode]);
        
        do {
            var nodes = this.getSurroundingNodes(nextNode, dx, dy);
            nodes = this.filterUndefinedNodes(nodes);
            nodes = this.filterKnownNodes(nodes);
            this.addOpenNodes(nodes);
            
            nextNode = this.popBestNodeByHeuristic();
            this.highlightNode(nextNode, ++this.counter);
            this.closed.push(nextNode);
            console.debug('closed', nextNode);
            
            if(nextNode.x == dx && nextNode.y == dy) {
                console.debug('reached destination');
                return nextNode;
            }
        } while(this.open.length > 0);
        
        return false;
    },
    
    filterKnownNodes: function(nodes) {
        var filteredNodes = [];
        for(var i = 0; i < nodes.length; i++) {
            if(! this.nodeExists(nodes[i], this.open) && ! this.nodeExists(nodes[i], this.closed)) {
                filteredNodes.push(nodes[i]);
            }
        }
        return filteredNodes;
    },
    
    filterUndefinedNodes: function(nodes) {
        var filteredNodes = [];
        for(var i = 0; i < nodes.length; i++) {
            if(this.isNode(nodes[i].x, nodes[i].y)) {
                filteredNodes.push(nodes[i]);
            }
        }
        return filteredNodes;
    },
    
    isNode: function(x, y) {
        console.error('isRealNode() not implemented');
    },
    
    highlightNode: function(node, count) {
        console.error('isRealNode() not implemented');
    },
    
    nodeExists: function(node, nodes) {
        for(var i = 0; i < nodes.length; i++) {
            var open = nodes[i];
            if(open.x == node.x && open.y == node.y) {
                return true;
            }
        }
        
        return false;
    },
    
    popBestNodeByHeuristic: function() {
        var nextNodeIndex = 0;
        for(var i = 1; i < this.open.length; i++) {
            if(this.open[i].h < this.open[nextNodeIndex].h) {
                nextNodeIndex = i;
            }
        }
        
        var nextNode = this.open[nextNodeIndex];
        console.debug(this.open.length);
        this.open.splice(nextNodeIndex, 1);
        console.debug(this.open.length);
        return nextNode;
    },
    
    addOpenNodes: function(nodes) {
        for(var i = 0; i < nodes.length; i++) {
            this.open.push(nodes[i]);
        }
    },
    
    getSurroundingNodes: function(node, dx, dy) {
        return [
            this.getNode(node.x + 1, node.y, dx, dy),
            this.getNode(node.x - 1, node.y, dx, dy),
            this.getNode(node.x, node.y + 1, dx, dy),
            this.getNode(node.x, node.y - 1, dx, dy),
            
            this.getNode(node.x + 1, node.y + 1, dx, dy),
            this.getNode(node.x - 1, node.y - 1, dx, dy),
            this.getNode(node.x - 1, node.y + 1, dx, dy),
            this.getNode(node.x + 1, node.y - 1, dx, dy),
        ];
    },
    
    getNode: function(sx, sy, dx, dy) {
        var hx;
        if(sx > dx) {
            hx = sx - dx;
        } else {
            hx = dx - sx;
        }
        
        var hy;
        if(sy > dy) {
            hy = sy - dy;
        } else {
            hy = dy - sy;
        }
        
        return {
            x: sx,
            y: sy,
            h: hx + hy
        }
    }
}