/**
 * deaddrop.js
 *
 * DeadDrop is a minimal library that provides a style-able alternative to
 * file input elements with HTML5 drag-and-drop functionality.
 *
 * @author: Bill Israel <bill.israel@gmail.com>
 * @license: MIT
 */
;

var DeadDrop = (function(window, document, undefined) {
    var version = '0.0.1',

        noop = function() { },

        __slice = [].slice,
        
        __supported = function() {
            // Method for detection shamelessly borrowed from Modernizr
            div = document.createElement('div')
            return ('draggable' in div) || ('ondragstart' in div && 'ondrop' in div)
        },

        extend = function() {
            var target = arguments[0], objects = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
            for (var i = 0, len = objects.length; i < len; i++) {
                object = objects[i];
                for (key in object) {
                    val = object[key];
                    target[key] = val;
                }
            }
            return target;
        },
        cancel = function(evt) {
            if (evt.preventDefault) evt.preventDefault();
            return false;
        }

    DeadDrop.prototype.events = ['click', 'drop'];
    DeadDrop.prototype.defaultOptions = {
        name: 'file',
        clickable: true,
        dropzone: 'deaddrop',
        click: function() { return noop; },
        drop: function() { return noop; }
    }

    function DeadDrop(element, options) {
        this.version = version;
        this.element = element;
        this.options = extend({}, this.defaultOptions, options != null ? options : {});

        if (typeof this.element === 'string') {
            this.element = document.querySelector(this.element);
        }

        if (!(this.element && (this.element.nodeType != null))) {
            throw new Error("Invalid DeadDrop element.");
        }

        this.init();
    }

    DeadDrop.prototype.init = function() {
        var el = this.element, _dropzones, _dropzone;

        if (this.element.tagName !== "form") {
            new Error('DeadDrop must be used with FORM elements');
        }

        this.fileElement = this.createFileInput();
        this.element.appendChild(this.fileElement);

        _dropzones = el.getElementsByClassName(this.options['dropzone']);
        if (! _dropzones.length || _dropzones.length > 1) {
            throw new Error("DeadDrop requires at least one drop zone.");
        }

        this.initializeDropzone(_dropzones[0]);

        events = this.events;
        for (var i = 0, len = events.length; i < len; i++) {
            eventName = events[i];
            this.on(eventName, this.options[eventName]);
        }
    }

    DeadDrop.prototype.initializeDropzone = function(dropzone) {
        var _this = this, d = document,
            noPropagation = function(e) {
                e.stopPropagation();
                if (e.preventDefault) {
                    return e.preventDefault();
                } else {
                    return e.returnValue = false;
                }
            };
        
        dropzone.addEventListener('dragover', cancel, false);
        dropzone.addEventListener('dragenter', cancel, false);

        dropzone.addEventListener('drop', function(evt) {
            noPropagation(evt);
            return _this.drop(evt);
        }, false);

        if (this.options['clickable']) {
            dropzone.addEventListener('click', function(evt) {
                noPropagation(evt);
                return _this.click(evt);
            }, false);
        }
    }

    DeadDrop.prototype.on = function(evt, callable) {
        this._callbacks = this._callbacks || {};
        this._callbacks[evt] = this._callbacks[evt] || [];
        this._callbacks[evt].push(callable);
        return this;
    }

    DeadDrop.prototype.off = function(evt, callable) {
        var callbacks = this._callbacks[evt];
        if (!callbacks) {
            return;
        }

        if (arguments.length == 1) {
            delete this._callbacks[evt];
        } else {
            var idx = callbacks.indexOf(callable)
            if (idx !== false) {
                this._callbacks[evt].splice(idx, 1);
            }
        }

        return this;
    }

    DeadDrop.prototype.trigger = function(evt) {
        var args = __slice.call(arguments, 1),
            callbacks = this._callbacks[evt];

        if (callbacks) {
            for (var i = 0, len = callbacks.length; i < len; i++) {
                callbacks[i].apply(this, args);
            }
        }
    }

    DeadDrop.prototype.click = function(evt) {
        this.trigger('click', evt);
        return this.fileElement.click();
    }

    DeadDrop.prototype.drop = function(evt) {
        if (!evt || !evt.dataTransfer) {
            return;
        }

        this.trigger('drop', evt);
        if (evt.dataTransfer.files.length) {
            this.fileElement.files = evt.dataTransfer.files;
            console.log(this.fileElement.files)
        }
    }

    DeadDrop.prototype.createFileInput = function() {
        var fileInput = document.createElement('input');
        fileInput.setAttribute('type', 'file');
        fileInput.setAttribute('name', this.options['name']);
        fileInput.style.visibility = 'hidden';
        fileInput.style.position = 'absolute';
        fileInput.style.height = '0';
        fileInput.style.width = '0';
        return fileInput;
    }

    return DeadDrop;
})(this, document);
