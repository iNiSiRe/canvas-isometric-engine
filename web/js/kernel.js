var viewport = document.getElementById('viewport');
var context = viewport.getContext('2d');

var objects = [];

//        var width = window.innerWidth
//            || document.documentElement.clientWidth
//            || document.body.clientWidth;

var zoom = 1;
var offset = {x: 0, y: 0};

var width = document.getElementById('main').clientWidth;

var height = window.innerHeight
    || document.documentElement.clientHeight
    || document.body.clientHeight;

height -= 2;

viewport.width = width;
viewport.height = height;

function Tile(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    this.object = null;

    this.setObject = function (object) {
        object.x = this.x - this.width / 2 + (this.width - object.template.w) / 2;
        object.y = this.y - this.height / 2 + (this.height - object.template.h) / 2;


        this.object = object;
    };

    this.draw = function () {
        var a = width / 2;
        var b = height / 2;

        context.beginPath();
        context.moveTo((x - a) * zoom + offset.x, y * zoom + offset.y);
        context.lineTo(x * zoom + offset.x, (y + b) * zoom + offset.y);
        context.lineTo((x + a) * zoom + offset.x, y * zoom + offset.y);
        context.lineTo(x * zoom + offset.x, (y - b) * zoom + offset.y);
        context.lineTo((x - a) * zoom + offset.x, y * zoom + offset.y);

        context.strokeStyle = "#99895e";
        context.fillStyle = "#8ca95e";

        context.stroke();
        context.fill();

        if (this.object != null) {
            this.object.draw();
        }
    }
}

function g2l(point) {
    point.x = point.x * zoom + offset.x;
    point.y = point.y * zoom + offset.y;

    return point;
}

function Unit(template, x, y) {

    this.template = template;

    this.x = x;
    this.y = y;

    this.drawn = false;

    this.frameDrawn = false;

    this.draw = function () {

        if (this.drawn) {
            return;
        }

        context.drawImage(
            this.template.resource.image,
            this.template.sx,
            this.template.sy,
            this.template.sw,
            this.template.sh,
            this.x * zoom + offset.x,
            this.y * zoom + offset.y,
            this.template.w * zoom,
            this.template.h * zoom
        );

        this.drawn = true;
    };

    window.emitter.listen("clean", function () {
        this.drawn = false;
        this.frameDrawn = false;
    }.bind(this));

    // Draw image frame
    window.emitter.listen("drawn", function () {
        context.beginPath();
        context.rect(
            this.x * zoom + offset.x,
            this.y * zoom + offset.y,
            this.template.w * zoom,
            this.template.h * zoom
        );
        context.stroke();
        this.frameDrawn = true;
    }.bind(this));
}

function UnitTemplate(name, resource, sx, sy, sh, sw, w) {
    this.resource = resource;

    this.sx = parseInt(sx);
    this.sy = parseInt(sy);
    this.sh = parseInt(sh);
    this.sw = parseInt(sw);

    this.w = w == undefined ? sw : w;
    this.h = sh / sw  * w;

    this.name = name;
}

function Resource(src) {
    this.url = src;
    this.image = new Image();
    this.image.src = src;
    this.image.onload = function (event) {
        console.log(src, 'loaded');
    }.bind(this)
}

function ResourceCollection() {

    this.all = [];

    this.add = function (resource) {
        this.all.push(resource);
    }
}

function UnitCollection() {
    this.all = [];

    this.add = function (unit) {
        var number = this.all.push(unit);

        var select = document.forms.create.template;

        var option = document.createElement("option");
        option.text = unit.name;
        option.value = number;

        select.add(option);
    };

    this.get = function(id) {
        return this.all[id] == undefined ? null : this.all[id];
    };

    this.draw = function () {
        for (var i = 0; i < this.all.length; i++) {
            this.all[i].draw();
        }
    }
}

function EventEmitter() {

    this.listeners = [];

    this.listen = function (event, callback, once) {
        if (this.listeners[event] == undefined) {
            this.listeners[event] = [];
        }

        this.listeners[event].push({callable: callback, once: once != undefined});
    };

    this.emit = function (event, data) {

        if (this.listeners[event] == undefined) {
            this.listeners[event] = [];
        }

        for (var i = 0; i < this.listeners[event].length; i++) {
            this.listeners[event][i].callable(data);

            if (this.listeners[event][i].once) {
                this.listeners[event].splice(i, 1);

            }
        }
    };
}

window.emitter = new EventEmitter();

function Tiles(width, height) {

    this.all = new Array(10);

    this.emitter = new EventEmitter();

    this.init = function () {
        var shift = 0;

        for (var i = 1; i <= 20; i++) {

            this.all[i - 1] = new Array(10);

            for (var j = 1; j <= 10; j++) {

                if (i % 2 == 0) {
                    this.all[i - 1][j - 1] = new Tile(j * width + width / 2, height * (i - shift) - height / 2, width, height);
                } else {
                    this.all[i - 1][j - 1] = new Tile(j * width, height * (i - shift), width, height);
                }

            }

            if (i % 2 == 0) {
                shift++;
            }
        }
    };

    this.draw = function () {
        for (var i = 0; i < 20; i++) {
            for (var j = 0; j < 10; j++) {
                this.all[i][j].draw();
            }
        }
    };

    this.init();
}

var tiles = new Tiles(160, 80 / Math.tan(Math.PI / 3) * 2);

var resources = new ResourceCollection();
resources.add(new Resource('road_1.png'));
resources.add(new Resource('road_2.png'));
resources.add(new Resource('road_3.png'));
resources.add(new Resource('road_4.png'));
resources.add(new Resource('building_1.png'));
resources.add(new Resource('building_2.png'));
resources.add(new Resource('building_3.png'));
resources.add(new Resource('bouling_room_1.png'));
resources.add(new Resource('factory.png'));

var units = new UnitCollection();
units.add(new UnitTemplate('road0', resources.all[0], 0, 0, 128, 216, 100));
units.add(new UnitTemplate('road1', resources.all[1], 0, 0, 128, 216, 100));
units.add(new UnitTemplate('road2', resources.all[2], 0, 0, 107, 261, 121));
units.add(new UnitTemplate('road3', resources.all[3], 0, 0, 203, 346, 160));

tiles.all[7][7].setObject(new Unit(units.all[0], 0, 0));
tiles.all[6][7].setObject(new Unit(units.all[0], 0, 0));
tiles.all[5][8].setObject(new Unit(units.all[0], 0, 0));

document.forms.create.add.onclick = function (event) {
    var form = document.forms.create;

    var template = units.all[form.template.selectedIndex];

    tiles.emitter.listen("click", function (event) {
        tiles.all[event.i][event.j].setObject(new Unit(template, 0, 0));
    }, true);
};

//
//        document.forms.createObject.sw.value = resource.image.width;
//        document.forms.createObject.sh.value = resource.image.height;

document.forms.editObject.object.onchange = function (event) {
    var form = document.forms.editObject;
    var number = form.object.selectedIndex;

    var object = units.all[number];

    form.sx.value = object.sx;
    form.sy.value = object.sy;
    form.sw.value = object.sw;
    form.sh.value = object.sh;
    form.x.value = object.x;
    form.y.value = object.y;
    form.w.value = object.w;
    form.h.value = object.h;
};

var hold = false;

var objectPosition = {x: 0, y: 0};
var mousePosition = {x: 0, y: 0};

viewport.onmousemove = function (event) {
    if (!hold) {
        return true;
    }

    // var form = document.forms.editObject;
    // var number = form.object.selectedIndex;
    // var object = units.all[number];

    // object.x = parseInt(objectPosition.x) + event.layerX - mousePosition.x;
    // object.y = parseInt(objectPosition.y) + event.layerY - mousePosition.y;

    // document.forms.editObject.x.value = object.x;
    // document.forms.editObject.y.value = object.y;

    offset.x = parseInt(startOffset.x) + event.layerX - mousePosition.x;
    offset.y = parseInt(startOffset.y) + event.layerY - mousePosition.y;
};

var startOffset = {x: 0, y: 0};

viewport.onmousedown = function (event) {
    hold = true;

    // var form = document.forms.editObject;
    // var number = form.object.selectedIndex;
    // var object = units.all[number];

    // objectPosition.x = object.x;
    // objectPosition.y = object.y;

    startOffset.x = offset.x;
    startOffset.y = offset.y;

    mousePosition.x = event.layerX;
    mousePosition.y = event.layerY;
};

viewport.onmouseup = function (event) {
    hold = false;
};

viewport.onclick = function (event) {

    var distances = new Array(tiles.all.length);

    for (var i = 0; i < tiles.all.length; i++) {

        distances[i] = new Array(tiles.all[i].length);

        for (var j = 0; j < tiles.all[i].length; j++) {
            var tile = tiles.all[i][j];
            distances[i][j] = Math.sqrt(Math.pow(tile.x + offset.x - event.layerX, 2) + Math.pow(tile.y + offset.y - event.layerY, 2));
        }
    }

    var target = {i: 0, j: 0, d: distances[0][0]};

    for (i = 0; i < distances.length; i++) {
        for (j = 0; j < distances[i].length; j++) {
            if (distances[i][j] < target.d) {
                target.i = i;
                target.j = j;
                target.d = distances[i][j];
            }
        }
    }

    console.log("tiles", "click", target);

    tiles.emitter.emit("click", {i: target.i, j: target.j});
};

window.setInterval(function () {
    context.clearRect(0, 0, viewport.width, viewport.height);

    window.emitter.emit("clean", []);

    tiles.draw();
    // units.draw();

    window.emitter.emit("drawn", []);

}, 1000 / 30);

document.forms.editObject.save.onclick = function (event) {
    var form = document.forms.editObject;
    var number = form.object.selectedIndex;
    var object = units.all[number];

    object.sx = form.sx.value;
    object.sy = form.sy.value;
    object.sw = form.sw.value;
    object.sh = form.sh.value;
    object.x = form.x.value;
    object.y = form.y.value;
    object.w = form.w.value;
    object.h = form.h.value;
};

document.forms.control.save.onclick = function () {
    zoom = parseFloat(document.forms.control.zoom.value);
    console.log('Zoom', zoom);
};