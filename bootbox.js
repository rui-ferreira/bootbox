/**
 * bootbox.js [master branch]
 *
 * http://bootboxjs.com/license.txt
 */
var bootbox = window.bootbox || (function(document, $) {
        /*jshint scripturl:true sub:true */

        var _locale        = 'en',
            _defaultLocale = 'en',
            _animate       = true,
            _backdrop      = 'static',
            _defaultHref   = 'javascript:;',
            _classes       = '',
            _btnClasses    = {},
            _icons         = {},
            _autoFocus     = true,
            /* last var should always be the public object we'll return */
            that           = {};


        /**
         * public API
         */
        that.setLocale = function(locale) {
            for (var i in _locales) {
                if (i == locale) {
                    _locale = locale;
                    return;
                }
            }
            throw new Error('Invalid locale: '+locale);
        };

        that.addLocale = function(locale, translations) {
            if (typeof _locales[locale] === 'undefined') {
                _locales[locale] = {};
            }
            for (var str in translations) {
                _locales[locale][str] = translations[str];
            }
        };

        that.setIcons = function(icons) {
            _icons = icons;
            if (typeof _icons !== 'object' || _icons === null) {
                _icons = {};
            }
        };

        that.setBtnClasses = function(btnClasses) {
            _btnClasses = btnClasses;
            if (typeof _btnClasses !== 'object' || _btnClasses === null) {
                _btnClasses = {};
            }
        };

        that.setAutoFocus = function(autoFocus) {
            _autoFocus = autoFocus;
            if (typeof _autoFocus !== 'boolean' || _autoFocus === null) {
                _autoFocus = true;
            }
        };

        that.alert = function(/*str, label, cb, options*/) {
            var str     = "",
                label   = _translate('OK'),
                cb      = null,
                options = {};

            switch (arguments.length) {
                case 1:
                    // no callback, default button label
                    str = arguments[0];
                    break;
                case 2:
                    // callback *or* custom button label *or* options object dependent on type
                    str = arguments[0];
                    if (typeof arguments[1] == 'function') {
                        cb = arguments[1];
                    } else if (typeof arguments[1] == 'string') {
                        label = arguments[1];
                    } else { //options
                        options = $.extend(options, arguments[1]);
                    }
                    break;
                case 3:
                    // callback and custom button label
                    str   = arguments[0];
                    label = arguments[1];
                    cb    = arguments[2];
                    break;
                case 4:
                    str = arguments[0];
                    label = arguments[1];
                    cb = arguments[2];
                    options = $.extend(options, arguments[3]);
                    break;
                default:
                    throw new Error("Incorrect number of arguments: expected 1-4");
            }

            // ensure that the escape key works; either invoking the user's
            // callback or true to just close the dialog
            options.onEscape = options.onEscape || cb || true;

            options.aria = $.extend({
                                        role: "alertdialog",
                                        label: "Alert"
                                    }, options.aria);

            return that.dialog(str, {
                // only button (ok)
                "label"   : label,
                "icon"    : _icons.OK,
                "class"   : _btnClasses.OK,
                "callback": cb,
                "attr"    : {"role": "button", "aria-label": label, "tabindex": 1}
            }, options);
        };

        that.confirm = function(/*str, labelCancel, labelOk, cb*/) {
            var str         = "",
                labelCancel = _translate('CANCEL'),
                labelOk     = _translate('CONFIRM'),
                cb          = null;

            switch (arguments.length) {
                case 1:
                    str = arguments[0];
                    break;
                case 2:
                    str = arguments[0];
                    if (typeof arguments[1] == 'function') {
                        cb = arguments[1];
                    } else {
                        labelCancel = arguments[1];
                    }
                    break;
                case 3:
                    str         = arguments[0];
                    labelCancel = arguments[1];
                    if (typeof arguments[2] == 'function') {
                        cb = arguments[2];
                    } else {
                        labelOk = arguments[2];
                    }
                    break;
                case 4:
                    str         = arguments[0];
                    labelCancel = arguments[1];
                    labelOk     = arguments[2];
                    cb          = arguments[3];
                    break;
                default:
                    throw new Error("Incorrect number of arguments: expected 1-4");
            }

            var cancelCallback = function() {
                if (typeof cb === 'function') {
                    return cb(false);
                }
            };

            var confirmCallback = function() {
                if (typeof cb === 'function') {
                    return cb(true);
                }
            };

            return that.dialog(str, [{
                // first button (cancel)
                "label"   : labelCancel,
                "icon"    : _icons.CANCEL,
                "class"   : _btnClasses.CANCEL,
                "callback": cancelCallback,
                "attr"    : {"role": "button", "aria-label": labelCancel, "tabindex": 1}
            }, {
                // second button (confirm)
                "label"   : labelOk,
                "icon"    : _icons.CONFIRM,
                "class"   : _btnClasses.CONFIRM,
                "callback": confirmCallback,
                "attr"    : {"role": "button", "aria-label": labelOk, "tabindex": 2}
            }], {
                                   // escape key bindings
                                   "onEscape": cancelCallback,
                                   "aria": {
                                       label: "Confirm"
                                   }
                               });
        };

        that.prompt = function(/*str, labelCancel, labelOk, cb, defaultVal*/) {
            var str         = "",
                labelCancel = _translate('CANCEL'),
                labelOk     = _translate('CONFIRM'),
                cb          = null,
                defaultVal  = "";

            switch (arguments.length) {
                case 1:
                    str = arguments[0];
                    break;
                case 2:
                    str = arguments[0];
                    if (typeof arguments[1] == 'function') {
                        cb = arguments[1];
                    } else {
                        labelCancel = arguments[1];
                    }
                    break;
                case 3:
                    str         = arguments[0];
                    labelCancel = arguments[1];
                    if (typeof arguments[2] == 'function') {
                        cb = arguments[2];
                    } else {
                        labelOk = arguments[2];
                    }
                    break;
                case 4:
                    str         = arguments[0];
                    labelCancel = arguments[1];
                    labelOk     = arguments[2];
                    cb          = arguments[3];
                    break;
                case 5:
                    str         = arguments[0];
                    labelCancel = arguments[1];
                    labelOk     = arguments[2];
                    cb          = arguments[3];
                    defaultVal  = arguments[4];
                    break;
                default:
                    throw new Error("Incorrect number of arguments: expected 1-5");
            }

            var header = str;

            // let's keep a reference to the form object for later
            var form = $("<form></form>");
            form.append("<input class='input-block-level' autocomplete=off type=text value='" + defaultVal + "' />");

            var cancelCallback = function() {
                if (typeof cb === 'function') {
                    // yep, native prompts dismiss with null, whereas native
                    // confirms dismiss with false...
                    return cb(null);
                }
            };

            var confirmCallback = function() {
                if (typeof cb === 'function') {
                    return cb(form.find("input[type=text]").val());
                }
            };

            var div = that.dialog(form, [{
                // first button (cancel)
                "label"   : labelCancel,
                "icon"    : _icons.CANCEL,
                "class"   : _btnClasses.CANCEL,
                "callback":  cancelCallback,
                "attr"    : {"role": "button", "aria-label": labelCancel, "tabindex": 1}
            }, {
                // second button (confirm)
                "label"   : labelOk,
                "icon"    : _icons.CONFIRM,
                "class"   : _btnClasses.CONFIRM,
                "callback": confirmCallback,
                "attr"    : {"role": "button", "aria-label": labelOk, "tabindex": 2}
            }], {
                                      // prompts need a few extra options
                                      "header"  : header,
                                      // explicitly tell dialog NOT to show the dialog...
                                      "show"    : false,
                                      "onEscape": cancelCallback
                                  });

            // ... the reason the prompt needs to be hidden is because we need
            // to bind our own "shown" handler, after creating the modal but
            // before any show(n) events are triggered
            // @see https://github.com/makeusabrew/bootbox/issues/69

            div.on("shown", function(ev) {
                if (ev.target === this) {
                    form.find("input[type=text]").focus();

                    // ensure that submitting the form (e.g. with the enter key)
                    // replicates the behaviour of a normal prompt()
                    form.on("submit", function(e) {
                        e.preventDefault();
                        div.find(".btn-primary").click();
                    });
                }
            });

            div.modal("show");

            return div;
        };

        that.dialog = function(str, handlers, options) {
            var buttons    = "",
                callbacks  = [];

            if (!options) {
                options = {};
            }

            // check for single object and convert to array if necessary
            if (typeof handlers === 'undefined') {
                handlers = [];
            } else if (typeof handlers.length == 'undefined') {
                handlers = [handlers];
            }

            var i = handlers.length;
            while (i--) {
                var label    = null,
                    href     = null,
                    _class   = null,
                    icon     = '',
                    callback = null,
                    data     = '';

                if (typeof handlers[i]['label']    == 'undefined' &&
                    typeof handlers[i]['class']    == 'undefined' &&
                    typeof handlers[i]['callback'] == 'undefined') {
                    // if we've got nothing we expect, check for condensed format

                    var propCount = 0,      // condensed will only match if this == 1
                        property  = null;   // save the last property we found

                    // be nicer to count the properties without this, but don't think it's possible...
                    for (var j in handlers[i]) {
                        property = j;
                        if (++propCount > 1) {
                            // forget it, too many properties
                            break;
                        }
                    }

                    if (propCount == 1 && typeof handlers[i][j] == 'function') {
                        // matches condensed format of label -> function
                        handlers[i]['label']    = property;
                        handlers[i]['callback'] = handlers[i][j];
                    }
                }

                if (typeof handlers[i]['callback']== 'function') {
                    callback = handlers[i]['callback'];
                }

                if (handlers[i]['class']) {
                    _class = handlers[i]['class'];
                } else if (i == handlers.length -1 && handlers.length <= 2) {
                    // always add a primary to the main option in a two-button dialog
                    _class = 'btn-primary';
                }

                if (handlers[i]['link'] !== true) {
                    _class = 'btn ' + _class;
                }

                if (handlers[i]['label']) {
                    label = handlers[i]['label'];
                } else {
                    label = "Option "+(i+1);
                }

                if (handlers[i]['icon']) {
                    icon = "<i class='"+handlers[i]['icon']+"'></i> ";
                }

                if (handlers[i]['href']) {
                    href = handlers[i]['href'];
                }
                else {
                    href = _defaultHref;
                }

                if (handlers[i]['data']) {
                    for(var key in handlers[i]['data']){
                        data = data + ' ' + 'data-' + key + '=' + handlers[i]['data'][key];
                    }
                }

                if (handlers[i]['attr']) {
                    for(var key in handlers[i]['attr']){
                        data = data + ' ' + key + '=' + handlers[i]['attr'][key];
                    }
                }

                buttons = "<a data-handler='"+i+"' class='"+_class+"' href='" + href + "' " + data + ">"+icon+""+label+"</a>" + buttons;

                callbacks[i] = callback;
            }

            // @see https://github.com/makeusabrew/bootbox/issues/46#issuecomment-8235302
            // and https://github.com/twitter/bootstrap/issues/4474
            // for an explanation of the inline overflow: hidden
            // @see https://github.com/twitter/bootstrap/issues/4854
            // for an explanation of tabIndex=-1

            options.aria = $.extend({
                                        role: "dialog",
                                        label: null,
                                        labelledby: "bootbox-title",
                                        describedby: "bootbox-desc"
                                    }, options.aria);

            var ariaOptsStr = "role='" + options.aria.role + "' aria-describedby='" + options.aria.describedby + "'";
            if(options.aria.label){
                ariaOptsStr += "aria-label='" + options.aria.label + "'";
            }
            else{
                ariaOptsStr += "aria-labelledby='" + options.aria.labelledby + "'";
            }

            var parts = ["<div class='bootbox modal' tabindex='-1' style='overflow:hidden;' " + ariaOptsStr + ">"];

            if (options['header']) {
                var closeButton = '';
                if (typeof options['headerCloseButton'] == 'undefined' || options['headerCloseButton']) {
                    closeButton = "<a href='"+_defaultHref+"' class='close'>&times;</a>";
                }

                parts.push("<div class='modal-header'>"+closeButton+"<h3>"+options['header']+"</h3></div>");
            }

            // push an empty body into which we'll inject the proper content later
            parts.push("<div class='modal-body'></div>");

            if (buttons) {
                parts.push("<div class='modal-footer'>"+buttons+"</div>");
            }

            parts.push("</div>");

            var div = $(parts.join("\n"));

            // check whether we should fade in/out
            var shouldFade = (typeof options.animate === 'undefined') ? _animate : options.animate;

            if (shouldFade) {
                div.addClass("fade");
            }

            var optionalClasses = (typeof options.classes === 'undefined') ? _classes : options.classes;
            if (optionalClasses) {
                div.addClass(optionalClasses);
            }

            // now we've built up the div properly we can inject the content whether it was a string or a jQuery object
            div.find(".modal-body").html(str);


            function onFocus(event) {
                if (!div[0].contains(event.target)) {
                    event.stopPropagation();
                    div[0].focus();
                }
            }

            /**
             * While the dialog is active, check that focus is never set to an element that is not in the container and
             * nothing else is ARIA visible.
             */
            function onCreated() {
                document.addEventListener("focus", onFocus, true);

                $(".modal-scrollable").siblings().each(function(idx, el){
                    var $el = $(el);
                    if(el.hasAttribute("aria-hidden")){
                        $el.attr("original-aria-hidden", $el.attr("aria-hidden"));
                    }
                    $el.attr("aria-hidden", "true");
                });
            }

            /**
             * When closing the dialog, remove focus listener and put back original ARIA attributes on siblings.
             */
            function onClosed() {
                document.removeEventListener("focus", onFocus, true);

                $(".modal-scrollable").siblings().each(function(idx, el){
                    var $el = $(el);
                    if(el.hasAttribute("original-aria-hidden")){
                        $el.attr("aria-hidden", $el.attr("original-aria-hidden"));
                    }
                    else{
                        $el.removeAttr("aria-hidden");
                    }
                });
            }

            function onCancel(source) {
                // for now source is unused, but it will be in future
                var hideModal = null;
                if (typeof options.onEscape === 'function') {
                    // @see https://github.com/makeusabrew/bootbox/issues/91
                    hideModal = options.onEscape();
                }

                if (hideModal !== false) {
                    div.modal('hide');
                }

                onClosed();
            }

            // hook into the modal's keyup trigger to check for the escape key
            div.on('keyup.dismiss.modal', function(e) {
                // any truthy value passed to onEscape will dismiss the dialog
                // as long as the onEscape function (if defined) doesn't prevent it
                if (e.which === 27 && options.onEscape) {
                    onCancel('escape');
                }
            });

            // handle close buttons too
            div.on('click', 'a.close', function(e) {
                e.preventDefault();
                onCancel('close');
            });

            // well, *if* we have a primary - give the first dom element focus
            if(_autoFocus) {
                div.on('shown', function (e) {
                    if (e.target === this) {
                        div.find("a.btn-primary:first").focus();
                    }
                });
            }

            div.on('hidden', function(e) {
                // @see https://github.com/makeusabrew/bootbox/issues/115
                // allow for the fact hidden events can propagate up from
                // child elements like tooltips
                if (e.target === this) {
                    div.remove();
                    onClosed();
                }
            });

            // wire up button handlers
            div.on('click', '.modal-footer a', function(e) {

                var handler   = $(this).data("handler"),
                    cb        = callbacks[handler],
                    hideModal = null;

                // sort of @see https://github.com/makeusabrew/bootbox/pull/68 - heavily adapted
                // if we've got a custom href attribute, all bets are off
                if (typeof handler                   !== 'undefined' &&
                    typeof handlers[handler]['href'] !== 'undefined') {

                    return;
                }

                e.preventDefault();

                if (typeof cb === 'function') {
                    hideModal = cb(e);
                }

                // the only way hideModal *will* be false is if a callback exists and
                // returns it as a value. in those situations, don't hide the dialog
                // @see https://github.com/makeusabrew/bootbox/pull/25
                if (hideModal !== false) {
                    div.modal("hide");
                }
            });

            // stick the modal right at the bottom of the main body out of the way
            $("body").append(div);

            div.modal({
                          // unless explicitly overridden take whatever our default backdrop value is
                          backdrop : (typeof options.backdrop  === 'undefined') ? _backdrop : options.backdrop,
                          // ignore bootstrap's keyboard options; we'll handle this ourselves (more fine-grained control)
                          keyboard : false,
                          // @ see https://github.com/makeusabrew/bootbox/issues/69
                          // we *never* want the modal to be shown before we can bind stuff to it
                          // this method can also take a 'show' option, but we'll only use that
                          // later if we need to
                          show     : false
                      });

            // @see https://github.com/makeusabrew/bootbox/issues/64
            // @see https://github.com/makeusabrew/bootbox/issues/60
            // ...caused by...
            // @see https://github.com/twitter/bootstrap/issues/4781
            div.on("show", function(e) {
                if (e.target === this) {
                    $(document).off("focusin.modal");
                }
            });

            if (typeof options.show === 'undefined' || options.show === true) {
                div.modal("show");
            }

            onCreated();

            return div;
        };

        /**
         * #modal is deprecated in v3; it can still be used but no guarantees are
         * made - have never been truly convinced of its merit but perhaps just
         * needs a tidyup and some TLC
         */
        that.modal = function(/*str, label, options*/) {
            var str;
            var label;
            var options;

            var defaultOptions = {
                "onEscape": null,
                "keyboard": true,
                "backdrop": _backdrop
            };

            switch (arguments.length) {
                case 1:
                    str = arguments[0];
                    break;
                case 2:
                    str = arguments[0];
                    if (typeof arguments[1] == 'object') {
                        options = arguments[1];
                    } else {
                        label = arguments[1];
                    }
                    break;
                case 3:
                    str     = arguments[0];
                    label   = arguments[1];
                    options = arguments[2];
                    break;
                default:
                    throw new Error("Incorrect number of arguments: expected 1-3");
            }

            defaultOptions['header'] = label;

            if (typeof options == 'object') {
                options = $.extend(defaultOptions, options);
            } else {
                options = defaultOptions;
            }

            return that.dialog(str, [], options);
        };


        that.hideAll = function() {
            $(".bootbox").modal("hide");
        };

        that.animate = function(animate) {
            _animate = animate;
        };

        that.backdrop = function(backdrop) {
            _backdrop = backdrop;
        };

        that.classes = function(classes) {
            _classes = classes;
        };

        /**
         * private API
         */

        /**
         * standard locales. Please add more according to ISO 639-1 standard. Multiple language variants are
         * unlikely to be required. If this gets too large it can be split out into separate JS files.
         */
        var _locales = {
            'br' : {
                OK      : 'OK',
                CANCEL  : 'Cancelar',
                CONFIRM : 'Sim'
            },
            'da' : {
                OK      : 'OK',
                CANCEL  : 'Annuller',
                CONFIRM : 'Accepter'
            },
            'de' : {
                OK      : 'OK',
                CANCEL  : 'Abbrechen',
                CONFIRM : 'Akzeptieren'
            },
            'en' : {
                OK      : 'OK',
                CANCEL  : 'Cancel',
                CONFIRM : 'OK'
            },
            'es' : {
                OK      : 'OK',
                CANCEL  : 'Cancelar',
                CONFIRM : 'Aceptar'
            },
            'fr' : {
                OK      : 'OK',
                CANCEL  : 'Annuler',
                CONFIRM : 'D\'accord'
            },
            'it' : {
                OK      : 'OK',
                CANCEL  : 'Annulla',
                CONFIRM : 'Conferma'
            },
            'nl' : {
                OK      : 'OK',
                CANCEL  : 'Annuleren',
                CONFIRM : 'Accepteren'
            },
            'pl' : {
                OK      : 'OK',
                CANCEL  : 'Anuluj',
                CONFIRM : 'Potwierdź'
            },
            'ru' : {
                OK      : 'OK',
                CANCEL  : 'Отмена',
                CONFIRM : 'Применить'
            },
            'zh_CN' : {
                OK      : 'OK',
                CANCEL  : '取消',
                CONFIRM : '确认'
            },
            'zh_TW' : {
                OK      : 'OK',
                CANCEL  : '取消',
                CONFIRM : '確認'
            }
        };

        function _translate(str, locale) {
            // we assume if no target locale is probided then we should take it from current setting
            if (typeof locale === 'undefined') {
                locale = _locale;
            }
            if (typeof _locales[locale][str] === 'string') {
                return _locales[locale][str];
            }

            // if we couldn't find a lookup then try and fallback to a default translation

            if (locale != _defaultLocale) {
                return _translate(str, _defaultLocale);
            }

            // if we can't do anything then bail out with whatever string was passed in - last resort
            return str;
        }

        return that;

    }(document, window.jQuery));

// @see https://github.com/makeusabrew/bootbox/issues/71
window.bootbox = bootbox;
