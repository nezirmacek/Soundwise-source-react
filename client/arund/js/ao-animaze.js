/*! aRund v.1.7.3 - 2017-01-20 */

/* global aRunD, tirray */

(function(aRD, TRR){
    var
        __fn                                        = {},
        __conf                                      = {
            keyCheck                                : { 
                type                                    : 'string',
                name                                    : 'animation',
                keyObj                                  : __fn
            },
            delay                                   : 'time'
        },
        __addAnimation                              = function(name, data, params, noDelay, noDuration, noEase, aliases){
            __fn[name]                              = data;
            __fn[name].__name                       = name;
            var _conf                               = {
                type                                : 'datastring',
                params                              : params ? jQuery.extend(true, {}, params) : {
                    keyCheck                            : { byCheck : {
                        type                                : 'string',
                        name                                : 'animation'
                    } },
                    list                                : []
                }
            };
            if( typeof(_conf.params.maxLength) !== 'number' ){
                if( !noDuration ){
                    _conf.params.list.unshift({ byCheck : aRD.checks.duration });
                }
                if( !noDelay ){
                    _conf.params.list.unshift({ byCheck : aRD.checks.delay });
                }
                if( !noEase ){
                    _conf.params.list.push(
                        { byCheck : {
                            name                        : 'ease',
                            type                        : 'string',
                            check                       : function(value){
                                return !!__ease[value];
                            }
                        }},
                        { byCheck : aRD.createTypeCheck('easeX', 'number')}
                    );
                }
            }
            __conf[name]                            = _conf;
            if( aliases ){
                var al                              = typeof aliases === 'string' ? [aliases] : aliases;
                for (var i = al.length - 1; i >= 0; i--) {
                    __conf[al[i]]                   = _conf;
                }
            }
        },
        Animaze                                     = function(el){
            var context                             = this;
            context.current                         = new TRR(); //current animations
            context.pending                         = new TRR(); //pending animations
            context.timerName                       = null;
            context._cache                          = {};
            context._onComplete                     = {};
            context.$el                             = jQuery(el);
            context.$el.data('aoAnimazeObj', context);
            context.$el.on('destroyed.aoAnimazeDestroy', function(){
                context.destroy();
                context                             = null;
            });
        },
        __defaultFn                                 = function($el, params, delay){
            var props                               = typeof(params) === 'object' ? params : {duration : params},
                ret                                 = {
                    keys                            : [],
                    oDelay                          : props.delay === true ? 0 : aRD.toNumber(props.delay, 0),
                    duration                        : props.duration === true ? 0 : aRD.toNumber(props.duration, 0),
                    init                            : jQuery.noop,
                    start                           : jQuery.noop,
                    step                            : jQuery.noop,
                    finish                          : jQuery.noop,
                    stop                            : jQuery.noop
                }
            ;
            ret.delay                               = ret.oDelay + delay;
            if( typeof(props.easeX) === 'number' ){
                ret.easeX                           = props.easeX;
            }
            if( props.ease ){
                if( typeof(props.ease) === 'function' ){
                    ret.ease                        = props.ease;
                }else if( typeof(props.ease) === 'string' && typeof(__ease[props.ease]) !== 'undefined' ){
                    ret.ease                        = __ease[props.ease];
                }else{
                    ret.ease                        = __ease.linear;
                }
            }else{
                ret.ease                            = __ease.linear;
            }
            return ret;
        },
        __easeOut                                   = function(fn){
            return function(t, x) {
                return 1 - fn(1 - t, x);
            };
        },
        __easeInOut                                 = function(fn){
            return function(t, x) {
                return t < 0.5 ? fn(2*t, x)/2 : (2 - fn(2*(1-t), x))/2;
            };
        },
        easeIn                                      = function(t, x){
            var _x                                  = x && x > 0 ? x : 2;
            return Math.pow(t, _x);
        },
        __ease                                      = {
            linear                                  : function(t){ return t; },
            easeIn                                  : easeIn,
            easeOut                                 : __easeOut(easeIn),
            easeInOut                               : __easeInOut(easeIn)
        },
        __addEase                                   = function(name, func, noIn, noOut, noInOut){
            var __upCamel                           = aRD.ucfirst(name);
            if( !noIn ){
                __ease['easeIn' + __upCamel]        = func;
            }else{
                __ease[name]                        = func;
            }
            if( !noOut ){
                __ease['easeOut' + __upCamel]       = __easeOut(func);
            }
            if( !noInOut ){
                __ease['easeInOut' + __upCamel]     = __easeInOut(func);
            }
        },
        __hasAnimation                              = function(el, keys){
            var $el                                 = jQuery(el),
                ani                                 = $el.data('aoAnimazeObj')
            ;
            if( !ani ){
                return false;
            }
            return !!ani.getAnimations(keys).length;
        },
        __fadeConf                                  = {
            list                                        : [
                { byCheck                                   : aRD.checks.display },
                { byCheck                                   : aRD.createTypeCheck('toOpacity', 'percent') },
                { byCheck                                   : aRD.createTypeCheck('fromOpacity', 'percent') }
            ]
        },
        _colorAnimation                             = {
            init                                    : function($el, params){
                var props                           = typeof(params) === 'object' ? params : {};
                this.toCurrent                      = !!props.toCurrent || !props.toColor;
                this.toColor                        = props.toColor;
                this.fromColor                      = props.fromColor;
            },
            start                                   : function($el){
                var css                             = {},
                    current                         = aRD.types.color.parse(aRD.getStyle($el, this._cssName, 'current'))
                ;
                
                this.toColor                        = aRD.hexToRGBA(this.toCurrent ? current : this.toColor, null, this.fromColor, true);
                if( !(this.fromColor && this.toColor) ){
                    this.fromColor                  = jQuery.extend({}, current, {a: 0});
                }else{
                    this.fromColor                  = aRD.hexToRGBA(this.fromColor || current, null, this.toColor, true);
                }
                
                this._parts                         = aRD.getRGBAdiffParts(this.fromColor, this.toColor);
                aRD.storeStyle($el, this._cssName, this.toColor, 'current');
                if( !this._parts.length ){
                    this.duration                   = 0;
                    return;
                }
                this._current                       = jQuery.extend({}, this.fromColor);
                css[this._cssName]                  = aRD.colorToString(this.fromColor);
                return css;
            },
            step                                    : function(){
                for (var i = 0; i < this._parts.length; i++) {
                    if( this._parts[i] === 'a' ){
                        this._current[this._parts[i]] = aRD.inCincleRange( aRD.getValuesDelta(
                            this.fromColor[this._parts[i]],
                            this.toColor[this._parts[i]],
                            this.delta,
                            true
                        ), 0, 1);
                    }else{
                        this._current[this._parts[i]] = aRD.inCincleRange( aRD.getValuesDelta(
                            this.fromColor[this._parts[i]],
                            this.toColor[this._parts[i]],
                            this.delta
                        ), 0, 255);
                    }
                    
                }
                var
                    css                             = {},
                    color                           = aRD.colorToString(this._current)
                ;
                if( this._color !== color ){
                    this._color                     = color;
                    css[this._cssName]              = color;
                }
                return css;
            },
            finish                                  : function($el){
                var css                             = {};
                css[this._cssName]                  = aRD.colorToString(this.toColor);
                aRD.storeStyle($el, this._cssName, css[this._cssName], 'current');
                return css;
            }
        },
        _createColorAnimation                       = function(cssName, obj){
            var ret                                 = obj || {};
            return jQuery.extend(ret, _colorAnimation, {
                _cssName                            : cssName
            });
        },
        _minMax                                     = function(params, animation){
            switch( params.minMax ){
                case 'min' :
                    animation._css                  = {
                        height                      : 'minHeight',
                        width                       : 'minWidth'
                    };
                    break;
                case 'max' :
                    animation._css                  = {
                        height                      : 'maxHeight',
                        width                       : 'maxWidth'
                    };
                    break;
                default :
                    animation._css                  = {
                        height                      : 'height',
                        width                       : 'width'
                    };
                    break;
            }
            if( params.heightRange ){
                animation.heightRange               = params.heightRange;
            }
            if( params.widthRange ){
                animation.widthRange                = params.widthRange;
            }
        },
        _checkSize                                  = function(animation, $el, size){
            if( animation.heightRange ){
                size.heightRange                    = animation.heightRange;
            }
            if( animation.widthRange ){
                size.widthRange                     = animation.widthRange;
            }
            return size;
        }
    ;
    __addAnimation('show', {
        keys                                        : ['display'],
        init                                        : function($el, params){
            var props                               = typeof(params) === 'object' ? params : {};
            this.display                            = props.display || null;
        },
        start                                       : function($el){
            if( this.display ){
                return {
                    display                         : this.display
                };
            }else if( $el.is(':hidden') ){
                return {
                    display                         : aRD.getOriginalCss($el, 'display')
                };
            }
        }
    }, {
        list                                    : [
            { byCheck                                   : aRD.checks.display }
        ]
    }, false, true, true);
    __addAnimation('hide', {
        keys                                        : ['display'],
        start                                       : function($el){
            if( $el.is(':visible') ){
                return {
                    display                         : 'none'
                };
            }
        }
    }, false, false, true, true);
    __addAnimation('windowSize', {
            init                                    : function($el, params){
                if( params.width ){
                    this.width                          = params.width === true ? 1 : aRD.toNumber( params.width ) / 100;
                }
                if( params.height ){
                    this.height                         = params.height === true ? 1 : aRD.toNumber( params.height ) / 100;
                }
                _minMax(params, this);
            },
            step                                    : function($el){
                return _checkSize( this, $el, aRD.getWindowSizePartCss(
                                                this.width ? this.width * this.delta : null,
                                                this.height ? this.height * this.delta : null,
                                                this._css )
                );
            },
            finish                                  : function($el){
                return _checkSize( this, $el, aRD.getWindowSizePartCss(this.width, this.height, this._css) );
            }
        }, {
            list                                    : [
                { byCheck : {
                    name    : 'minMax',
                    allowed : ['min', 'max']
                }},
                { byCheck : aRD.createTypeCheck('height', 'percent')},
                { byCheck : aRD.createTypeCheck('width', 'percent')},
                { byCheck : [aRD.createTypeCheck('heightRange', 'sizeRange'), aRD.checks.fitHeight]},
                { byCheck : [aRD.createTypeCheck('widthRange', 'sizeRange'), aRD.checks.fitWidth]}
            ]
        }
    );
    __addAnimation('resize', {
            check                                   : function($el, params){
                return !!(params.height || params.width);
            },
            init                                    : function($el, params){
                if( params.height ){
                    if( params.height.from ){
                        this.toHeight               = params.height.from;
                    }
                    if( params.height.to ){
                        this.fromHeight             = params.height.to;
                    }
                }
                if( params.width ){
                    if( params.width.from ){
                        this.toWidth                = params.width.from;
                    }
                    if( params.width.to ){
                        this.fromWidth              = params.width.to;
                    }
                }
                _minMax(params, this);
            },
            start                                   : function($el){
                if( !this.duration ){
                    return;
                }
                this._parts                         = [];
                this._uparts                        = [];
                this._current                       = {};
                if( this.toHeight ){
                    if( !this.fromHeight ){
                        this.fromHeight             = {
                            value                   : $el.height(),
                            type                    : 'px'
                        };
                    }
                    aRD.parentHeightToType($el, this.fromHeight, this.toHeight.type);
                    this._current.height            = jQuery.extend({}, this.fromHeight);
                    if( this.fromHeight.value !== this.toHeight.value ){
                        this._parts.push('height');
                        this._uparts.push('Height');
                    }
                }
                if( this.toWidth ){
                    if( !this.fromWidth ){
                        this.fromWidth              = {
                            value                   : $el.width(),
                            type                    : 'px'
                        };
                    }
                    aRD.parentWidthToType($el, this.fromWidth, this.toWidth.type);
                    this._current.width             = jQuery.extend({}, this.fromWidth);
                    if( this.fromWidth.value !== this.toWidth.value ){
                        this._parts.push('width');
                        this._uparts.push('Width');
                    }
                }
                if( !this._parts.length ){
                    this.duration                   = 0;
                }
                return _checkSize( this, $el, aRD.createByObject(this._current, this._css) );
            },
            step                                    : function($el){
                var tmp;
                for (var i = 0; i < this._parts.length; i++) {
                    tmp                             = aRD.ucfirst(this._parts[i]);
                    this._current[this._parts[i]].value = aRD.getValuesDelta(
                        this['from' + this._uparts[i]].value,
                        this['to' + this._uparts[i]].value,
                        this.delta
                    );
                }
                return _checkSize( this, $el, aRD.createByObject(this._current, this._css) );
            },
            finish                                  : function($el){
                return _checkSize( this, $el, aRD.createByObject({
                    'height'                        : this.toHeight,
                    'width'                         : this.toWidth
                }, this._css) );
            }
        }, {
            list                                    : [
                { byCheck : {
                    name    : 'minMax',
                    allowed : ['min', 'max']
                }},
                { byCheck : aRD.createTypeCheck('height', 'sizeRange')},
                { byCheck : aRD.createTypeCheck('width', 'sizeRange')},
                { byCheck : [aRD.createTypeCheck('heightRange', 'sizeRange'), aRD.checks.fitHeight]},
                { byCheck : [aRD.createTypeCheck('widthRange', 'sizeRange'), aRD.checks.fitWidth]}
            ]
        }
    );
    __addAnimation('fadein', {
            init                                    : function($el, params){
                var props                           = typeof(params) === 'object' ? params : {};
                this.display                        = props.display || null;
                this.toOpacity                      = aRD.toNumber(props.toOpacity, 100)/100;
                this.fromOpacity                    = aRD.toNumber(props.fromOpacity, false);
                if( this.fromOpacity ){
                    this.fromOpacity                = this.fromOpacity/100;
                }
                if( $el.is(':hidden') ){
                    $el.css('opacity', this.fromOpacity || 0);
                }
            },
            start                                   : function($el){
                var css                             = {};
                if( this.fromOpacity === false ){
                    if( $el.is(':hidden') ){
                        this.fromOpacity            = 0;
                    }else{
                        var curOp                   = $el.css('opacity');
                        if( curOp ){
                            this.fromOpacity        = aRD.toNumber(curOp, 0);
                        }
                    }
                }

                if( this.display ){
                    css.display                     = this.display;
                }else if( $el.is(':hidden') ){
                    css.display                     = aRD.getOriginalCss($el, 'display');
                }

                if( this.fromOpacity === this.toOpacity ){
                    this.duration                   = 0;
                }else{
                    this.perc                       = this.toOpacity - this.fromOpacity;
                    css.opacity                     = this.fromOpacity;
                }
                
                return css;
            },
            step                                    : function(){
                return this.perc ? {
                    opacity                         : this.fromOpacity + (this.perc * aRD.inCincleRange(this.delta, 0, 1))
                } : null;
            },
            finish                                  : function(){
                return {
                    opacity                         : this.toOpacity
                };
            }
        }, __fadeConf
    );
    __addAnimation('fadeout', {
            init                                    : function($el, params){
                var props                           = typeof(params) === 'object' ? params : {};
                this.display                        = props.display || null;
                this.toOpacity                      = aRD.toNumber(props.toOpacity, 0)/100;
                this.fromOpacity                    = aRD.toNumber(props.fromOpacity, false);
                if( this.fromOpacity ){
                    this.fromOpacity                = this.fromOpacity/100;
                }
            },
            start                                   : function($el){
                var css                             = {};
                if( this.fromOpacity === false ){
                    if( $el.is(':hidden') ){
                        this.fromOpacity            = 0;
                    }else{
                        var curOp                   = $el.css('opacity');
                        if( curOp ){
                            this.fromOpacity        = aRD.toNumber(curOp, 1);
                        }
                    }
                }

                if( this.fromOpacity === this.toOpacity ){
                    this.duration                   = 0;
                }else{
                    if( this.display ){
                        css.display                 = this.display;
                    }else if( $el.is(':hidden') ){
                        css.display                 = aRD.getOriginalCss($el, 'display');
                    }else{
                        css.display                 = $el.css('display');
                    }
                    this.perc                       = this.fromOpacity - this.toOpacity;
                    css.opacity                     = this.fromOpacity;
                }
                
                return css;
            },
            step                                    : function(){
                return this.perc ? {
                    opacity                         : aRD.inCincleRange(this.fromOpacity - (this.perc * this.delta), 0, 1)
                } : null;
            },
            finish                                  : function(){
                return {
                    opacity                         : this.toOpacity,
                    display                         : this.display || 'none'
                };
            }
        }, __fadeConf
    );
    __addAnimation('bgColor', _createColorAnimation('backgroundColor'), {
            list                                        : [
                { byCheck                                   : [aRD.createTypeCheck('toColor', 'color'),
                    {
                        name                                            : 'toCurrent',
                        allowed                                         : ['current'],
                        parse                                           : function(value){ return value === 'current'; }
                    }
                ] },
                { byCheck                                   : aRD.createTypeCheck('fromColor', 'color') }
            ]
        }
    );
    __addAnimation('tColor', _createColorAnimation('color'), {
            list                                        : [
                { byCheck                                   : [aRD.createTypeCheck('toColor', 'color'),
                    {
                        name                                            : 'toCurrent',
                        allowed                                         : ['current'],
                        parse                                           : function(value){ return value === 'current'; }
                    }
                ] },
                { byCheck                                   : aRD.createTypeCheck('fromColor', 'color') }
            ]
        }
    );
    __addAnimation('move', {
            _getPosDelta                            : function(from, to){
                var pos                             = jQuery.extend({}, from);
                if( !to ){
                    return pos;
                }
                if( pos.value !== to.value ){
                    pos.value                       = pos.value + ( to.value - pos.value ) * this.delta;
                }
                if( pos.offset !== to.offset ){
                    pos.offset                       = pos.offset + ( to.offset - pos.offset ) * this.delta;
                }
                return pos;
            },
            init                                    : function($el, params){
                var props                           = typeof(params) === 'object' ? params : {};
                this.position                       = props.position ? props.position : 'absolute';
                this.toX                            = props.toX ? props.toX : false;
                this.toY                            = props.toY ? props.toY : false;
                this.fromX                          = props.fromX ? props.fromX : false;
                this.fromY                          = props.fromY ? props.fromY : false;
            },
            start                                   : function($el){
                if( !(this.toX || this.toY) ){
                    //skip
                    this.duration                   = 0;
                    this.step = this.finish         = jQuery.noop;
                }
                if( !this.duration ){
                    return;
                }

                if( $el.is(':hidden') ){
                    this.needFix                    = true;
                }
                this._pos                           = aRD.convertPosition($el, this.fromX, this.fromY, this.position, this.toX, this.toY);
                
                return {
                    position                        : this._pos.position,
                    x                               : this._pos.posX,
                    y                               : this._pos.posY
                };
            },
            step                                    : function($el){
                if( this.needFix && $el.is(':visible') ){
                    this.needFix                    = false;
                    this._pos                       = aRD.convertPosition($el, this.fromX, this.fromY, this.position, this.toX, this.toY);
                }
                return {
                    position                        : this._pos.position,
                    x                               : this._getPosDelta(this._pos.posX, this._pos.toX),
                    y                               : this._getPosDelta(this._pos.posY, this._pos.toY)
                };
            },
            finish                                  : function(){
                return {
                    position                        : this.position,
                    x                               : this.toX,
                    y                               : this.toY
                };
            }
        }, {
            list                                    : [
                { byCheck                               : aRD.checks.absposition },
                { byCheck                               : aRD.createTypeCheck('toX', 'positionX') },
                { byCheck                               : aRD.createTypeCheck('toY', 'positionY') },
                { byCheck                               : aRD.createTypeCheck('fromX', 'positionX') },
                { byCheck                               : aRD.createTypeCheck('fromY', 'positionY') },
            ]
        }
    );
    __addEase('circ', function(t) { return 1 - Math.sin(Math.acos(t)); });
    __addEase('back', function(t, x) {
        var _x                                      = x || 1.5;
        return Math.pow(t, 2) * ((_x + 1) * t - _x);
    });
    __addEase('bounce', function(t){
        for(var a = 0, b = 1; 1; a += b, b /= 2) {
            if (t >= (7 - 4 * a) / 11) {
                return -Math.pow((11 - 6 * a - 11 * t) / 4, 2) + Math.pow(b, 2);
            }
        }
    });
    __addEase('elastic', function(t, x) {
        var _x                                      = x && x > 0 ? x : 10;
        return Math.pow(2, _x * (t-1)) * Math.sin(10.5*Math.PI*t);
    });
    __addEase('wave', function(t, x) {
        var _x                                      = (x && x > 0 ? x : 2) - 1;
        return (_x ? Math.pow((2-1/_x), 2 * (t-1)) : 1) * Math.sin((2*_x+0.5)*Math.PI*t);
    });

    aRD.ease                                        = __ease;
    aRD.aniFn                                       = __fn;
    aRD.addEase                                     = __addEase;
    aRD.aniAdd                                      = __addAnimation;

    aRD.css.isAnimated                              = 'ao-is-animated';

    aRD.getAniObj                                   = function(el){
        var $el                                     = jQuery(el);
        return ($el.data('aoAnimazeObj') || new Animaze($el));
    };
    aRD.animaze                                     = function(el, opts, name, def, triggerSub){
        return aRD.getAniObj(el).animate(opts, name, def, triggerSub);
    };
    aRD.animazeStop                                 = function(el, keys){
        var ani                                     = jQuery(el).data('aoAnimazeObj');
        if( ani && (ani instanceof Animaze) ){
            ani.stop(keys);
        }
    };
    aRD.animazeFinish                               = function(el, keys){
        var ani                                     = jQuery(el).data('aoAnimazeObj');
        if( ani && (ani instanceof Animaze) ){
            ani.finish(keys);
        }
    };

    Animaze.prototype                               = {
        triggerSub                                  : function(name, selfTrigger){
            var $els                                = this.$el.find('[data-ao-animaze-on-' + name + ']');
            if( (typeof(selfTrigger) === 'undefined' || selfTrigger) && this.$el.is('[data-ao-animaze-on-' + name + ']') ){
                $els                                = $els.add(this.$el);
            }
            if( $els.length ){
                $els.aoAnimaze({
                    extraDelay                      : 10
                }, 'on-' + name, false, false);
            }
            return this;
        },
        animate                                     : function(opts, name, def, triggerSub){
            var
                dataName                            = name,
                props                               = opts
            ;
            if( typeof(opts) === 'string' ){
                dataName                            = opts;
                props                               = false;
            }
            if( !(props && props.force) ){
                props                               = jQuery.extend({}, def, this.__getCache(this.$el, dataName), props);
            }
            if( typeof(triggerSub) === 'undefined' || triggerSub ){
                this.triggerSub('animated');
                if( dataName && typeof(dataName) === 'string' ){
                    this.triggerSub(dataName);
                }
            }

            return this.__animate(props, dataName);
        },
        stop                                        : function(keys){
            var context                             = this,
                cssList                             = [],
                css
            ;
            context.__getAnimations(keys, function(item){
                css                                 = item.data.stop(context.$el);
                if( css ){
                    cssList.push(css);
                }
                if( context._onComplete[item.data.__aniId] ){
                    --context._onComplete[item.data.__aniId].left;
                    if( context._onComplete[item.data.__aniId].left <= 0 ){
                        delete context._onComplete[item.data.__aniId];
                    }
                }
            }, true);
            if( cssList.length ){
                aRD.setCss( context.$el, jQuery.extend.apply({}, cssList) );
            }

            context.__check();
            return context;
        },
        finish                                      : function(keys){
            var context                             = this,
                cssList                             = [],
                css
            ;
            context.__getAnimations(keys, function(item){
                css                                 = context.__finish(item.data);
                if( css.length ){
                    cssList                         = cssList.concat(css);
                }
            }, true);
            if( cssList.length ){
                aRD.setCss( context.$el, jQuery.extend.apply({}, cssList) );
            }

            context.__check();
            return context;
        },
        destroy                                     : function(){
            this.stop();
            this.$el.data('aoAnimazeObj', null);
            this.$el                                = null;
        },
        getAnimations                               : function(keys){
            return this.__getAnimations(keys);
        },
        __getCache                                  : function($el, name){
            if( !(name && typeof(name) === 'string') ){
                return {};
            }
            var dataStr                             = $el.attr('data-ao-animaze-' + name);
            if( !this._cache[name] || this._cache[name].key !== dataStr ){
                this._cache[name]                   = {
                    key                             : dataStr,
                    obj                             : aRD.getDataFromString( dataStr, __conf )
                };
            }

            return jQuery.extend(true, {}, this._cache[name].obj);
        },
        __getAnimations                             : function(keys, asItem, clear, limit){
            var
                checkKeys, inc, name,
                animations                          = [],
                context                             = this
            ;
            switch(limit){
                case 'current':
                    inc                             = { current : true };
                    break;
                case 'pending':
                    inc                             = { pending : true };
                    break;
                default:
                    inc                             = {
                        current                     : true,
                        pending                     : true
                    };
                    break;
            }
            if( keys && keys.length ){
                checkKeys                           = aRD.createKeys(keys);
                for(name in inc){
                    if(inc.hasOwnProperty(name) && inc[name]){
                        animations                  = animations.concat(context[name].getByKeys(checkKeys, asItem, clear));
                    }
                }
            }else{
                for(name in inc){
                    if(inc.hasOwnProperty(name) && inc[name]){
                        animations                  = animations.concat(context[name].getData(asItem, clear));
                    }
                }
            }
            return animations;
        },
        __animate                                   : function(opts, name){
            var
                context                             = this,
                stopKeys                            = [],
                animations                          = new TRR(),
                _id                                 = (name ? name : '')  + '__' + aRD.randomId(),
                delay                               = 0,
                prop, params, tmp, _ani
            ;
            if( typeof(opts.delay) !== 'undefined' ){
                delay                               += aRD.toNumber(opts.delay, 0);
                delete opts.delay;
            }
            if( typeof(opts.extraDelay) !== 'undefined' ){
                delay                               += aRD.toNumber(opts.extraDelay, 0);
                delete opts.extraDelay;
            }
            for(prop in opts){
                if(opts.hasOwnProperty(prop)){
                    params                          = opts[prop];
                    _ani                            = params.animation || prop;
                    if( params === false || !(__fn[_ani] && (!__fn[_ani].check || __fn[_ani].check(context.$el, params))) ){
                        continue;
                    }
                    tmp                             = jQuery.extend(
                            __defaultFn(context.$el, params, delay),
                            __fn[_ani],
                            {
                                id                  : aRD.randomId( context.animations )
                            }
                        )
                    ;
                    tmp.__aniId                     = _id;
                    tmp.keys.push(_id);
                    if( name ){
                        tmp.keys.push(name);
                    }

                    tmp.init(context.$el, params, opts);
                    if( tmp.stopKeys ){
                        stopKeys                    = stopKeys.concat(tmp.stopKeys);
                    }
                    animations.add(tmp, tmp.delay, tmp.keys);
                }
            }
            prop = params = tmp = _ani              = null;
            
            if( animations.length ){
                if( name ){
                    stopKeys.push(name);
                }
                if( opts.stopKeys ){
                    stopKeys                        = stopKeys.concat(typeof(opts.stopKeys) === 'string' ? opts.stopKeys.split(' ') : opts.stopKeys);
                }
                if( stopKeys.length ){
                    context.stop(stopKeys);
                }
                
                if( opts.onComplete ){
                    context._onComplete[_id]        = {
                        length                      : animations.length,
                        left                        : animations.length,
                        func                        : opts.onComplete
                    };
                }
                animations                          = animations.getData();
                var time                            = Date.now();
                for (var i = 0; i < animations.length; i++) {
                    context.pending.add( animations[i], time + animations[i].delay, animations[i].keys );
                }

                context.__setupTimer();
            }

            return context;
        },
        __checkPending                              : function(time){
            var context                             = this,
                cssList                             = [],
                clearKeys                           = [],
                css
            ;
            context.pending.getUpTo(time, function(item){
                item.data.at                        = time;
                css                                 = item.data.start(context.$el);
                if( css ){
                    cssList.push(css);
                }
                if( item.data.duration ){
                    context.current.add(item.data, time + (item.data.duration ? item.data.duration : 0), item.data.keys);
                }else{
                    css                             = context.__finish(item.data);
                    if( css.length ){
                        cssList                     = cssList.concat(css);
                    }
                }
                
                if( item.data.clearKeys ){
                    clearKeys                       = clearKeys.concat(item.data.clearKeys);
                }
            }, true);
            context.current.getByKeys(clearKeys, function(item){
                css                                 = item.data.stop();
                if( css ){
                    cssList.push(css);
                }
            }, true);
            return cssList;
        },
        __finish                                    : function(animation){
            var
                context                             = this,
                ret                                 = [],
                css                                 = animation.finish(this.$el)
            ;
            if( css ){
                ret.push(css);
            }
            if( animation.endCss ){
                ret.push(animation.endCss);
            }
            if( context._onComplete[animation.__aniId] ){
                --context._onComplete[animation.__aniId].left;
                if( context._onComplete[animation.__aniId].left <= 0 ){
                    setTimeout(function(){
                        context._onComplete[animation.__aniId].func(context.$el);
                        delete context._onComplete[animation.__aniId];
                    });
                }
            }
            return ret;
        },
        __checkFinished                             : function(time){
            var context                             = this,
                cssList                             = [],
                css
            ;
            this.current.getUpTo(time, function(item){
                css                                 = context.__finish(item.data);
                if( css.length ){
                    cssList                         = cssList.concat(css);
                }
            }, true);
            return cssList;
        },
        __runCurrent                                : function(time){
            var context                             = this,
                cssList                             = [],
                css
            ;
            context.current.getData(function(item){
                item.data.progress                  = (time - item.data.at) / item.data.duration;
                var delta                           = item.data.ease( item.data.progress, item.data.easeX );
                if( item.data.delta !== delta ){
                    item.data.delta                 = delta;
                    css                             = item.data.step( context.$el );
                    if( css ){
                        cssList.push(css);
                    }
                }
            });
            return cssList;
        },
        __step                                      : function(now){
            var time                                = now ? now.valueOf() : Date.now(),
                cssList                             = []
            ;
            cssList                                 = cssList.concat(
                this.__checkPending(time),
                this.__checkFinished(time),
                this.__runCurrent(time)
            );
            if( cssList.length ){
                aRD.setCss( this.$el, jQuery.extend.apply({}, cssList) );
            }
            return this;
        },
        __setupTimer                                : function(){
            if( !this.timerName ){
                this.timerName                      = aRD.addTimer(this);
            }
        },
        __check                                     : function(){
            if( !(this.current.length || this.pending.length) ){
                if( this.timerName ){
                    aRD.removeTimer(this.timerName);
                    this.timerName                  = null;
                }
                this.$el.css('transition', '').removeClass(aRD.css.isAnimated);
            }
        },
        run                                         : function(now){
            this.$el.css('transition', 'none').addClass(aRD.css.isAnimated);
            this
                .__step(now)
                .__check()
            ;
            return this;
        }
    };
    Animaze.prototype.trigger                       = Animaze.prototype.run;

    jQuery.fn.aoAnimaze                             = function(opts, name, def, triggerSub){
        if( !aRD.hasElements(this, "aRunD - Animaze: Nothing selected.") ){
            return this;
        }
        jQuery(this).each(function(i, el){
            aRD.animaze(el, opts, name, def, triggerSub);
        });
        return this;
    };

    jQuery.fn.aoAnimazeStop                         = function(keys){
        jQuery(this).each(function(i, el){
            aRD.animazeStop(el, keys);
        });
        return this;
    };

    jQuery.fn.aoAnimazeFinish                       = function(keys){
        jQuery(this).each(function(i, el){
            aRD.animazeFinish(el, keys);
        });
        return this;
    };

    jQuery.fn.aoHasAnimation                        = function(keys){
        if( !aRD.hasElements(this, "aRunD - Animaze: Nothing selected.") ){
            return this;
        }
        return __hasAnimation(this[0], keys);
    };

    jQuery.fn.aoShow                                = function(opts, onComplete, subAction, def){
        if( !aRD.hasElements(this, "aRunD - Animaze: show - Nothing selected.") ){
            return this;
        }
        var obj                                     = {
            'show'                                  : true,
            'stopKeys'                              : 'hide',
            'onComplete'                            : onComplete
        };
        if( subAction && typeof(subAction) === 'string' ){
            obj[subAction]                          = true;
        }
        jQuery(this).aoAnimaze(opts, 'show', jQuery.extend(obj, def));
        return this;
    };

    jQuery.fn.aoHide                                = function(opts, onComplete){
        if( !aRD.hasElements(this, "aRunD - Animaze: hide - Nothing selected.") ){
            return this;
        }
        var obj                                     = {
            'hide'                                  : true,
            'stopKeys'                              : 'show',
            'onComplete'                            : onComplete
        };
        jQuery(this).aoAnimaze(opts, 'hide', obj);
        return this;
    };

    jQuery.fn.aoAnimazeDelayed                      = function(animation, delay){
        var $this                                   = jQuery(this),
            ani                                     = animation || 'resize',
            edelay                                  = aRD.toNumber(delay, 0),
            tName                                   = 'ao_aniElTimeout_' + ani,
            timeout                                 = $this.data(tName)
        ;
        if( timeout ){
            clearTimeout(timeout);
        }
        $this.data(tName, setTimeout(function(){
            $this.data(tName, null);
            $this.aoAnimaze(ani);
        }, edelay) );
        return this;
    };

    aRD.pushFlist('init', function($container, findFn){
        if( $container[findFn]('[data-ao-animaze-resize]').length ){
            aRD.runResize();
            $container[findFn]('img[data-ao-animaze-resize]').off('.aoResizeLoad').on('load.aoResizeLoad aoLoad.aoResizeLoad', function(){
                jQuery(this).aoFindVertical('[data-ao-animaze-resize]').aoAnimazeDelayed();
            });
        }
        $container[findFn]('[data-ao-window-scroll]').on('click.aoWindowScroll', function(e){
            aRD.$w.off('.aoWindowScroll').on({
                'scroll.aoWindowScroll'                 : function(){
                    var isScrolling                     = aRD.$w.data('aoIsScrolling');
                        timeout                         = aRD.$w.data('aoWindowScroll')
                    ;
                    if(!isScrolling && timeout){
                        clearTimeout(timeout);
                        aRD.$w
                            .data('aoWindowScroll', null)
                            .off('.aoWindowScroll')
                        ;
                        aRD.canFireOn                   = true;
                    }
                    aRD.$w.data('aoIsScrolling', null);
                },
                'wheel.aoWindowScroll'                  : function(){
                    var timeout                         = aRD.$w.data('aoWindowScroll');
                    if(timeout){
                        clearTimeout(timeout);
                    }
                    aRD.$w
                        .data('aoWindowScroll', null)
                        .data('aoIsScrolling', null)
                        .off('.aoWindowScroll')
                    ;
                    aRD.canFireOn                       = true;
                }
            });
            var $el                                     = jQuery(this),
                easeCheck                               = {
                    name                                : 'ease',
                    type                                : 'string',
                    check                               : function(value){
                        return !!__ease[value];
                    }
                },
                params                                  = jQuery.extend({
                        duration                        : 0,
                        delay                           : 0,
                        to                              : {
                            value                       : 0,
                            type                        : 'px'
                        },
                        ease                            : 'linear'
                    }, aRD.getValueFromSettings($el.attr('data-ao-window-scroll'), {
                        type                                : 'datastring',
                        params                              : {
                            list                                : [
                                { byCheck : aRD.checks.duration },
                                { byCheck : aRD.checks.delay },
                                { byCheck : [easeCheck,
                                    aRD.createTypeCheck('to', 'size'),
                                    {
                                        name                                : 'block',
                                        type                                : 'string'
                                    }]},
                                { byCheck : easeCheck},
                                { byCheck : aRD.createTypeCheck('easeX', 'number')}
                            ]
                        }
                    })),
                from                                    = aRD.$w.scrollTop(),
                time                                    = params.delay + Date.now(),
                toTime                                  = time + params.duration,
                timeout                                 = aRD.$w.data('aoWindowScroll'),
                func                                    = function(){
                    var now                             = Date.now();
                    aRD.$w.data('aoIsScrolling', true);
                    if( now >= toTime ){
                        aRD.canFireOn                   = true;
                        aRD.$w
                            .off('.aoWindowScroll')
                            .scrollTop(params.to)
                        ;
                    }else{
                        var delta                       = params.ease((now - time)/params.duration, params.easeX);
                        aRD.$w.scrollTop(aRD.inCincleRange( from + params.distance * delta, 0, jQuery('body')[0].scrollHeight ));
                        aRD.$w.data('aoWindowScroll', setTimeout(func, 20));
                    }
                },
                $toEl, fixTo
            ;
            if( $el.is('a') ){
                e.preventDefault();
            }
            if( params.ease && __ease[params.ease] ){
                params.ease                             = __ease[params.ease];
            }else{
                params.ease                             = __ease.linear;
            }
            
            if( timeout ){
                clearTimeout(timeout);
            }
            if( params.block ){
                $toEl                                   = aRD.findBlock(params.block);
                if( !$toEl.length ){
                    aRD.canFireOn                       = true;
                    return;
                }
                params.to                               = $toEl.offset().top;
            }else if( params.to ){
                params.to                               = aRD.fixSizeValue(params.to, aRD.getContentSize().height);
            }else{
                params.to                               = 0;
            }
            aRD.canFireOn                               = false;
            fixTo                                       = Math.round(params.to);
            if( fixTo !== params.to && jQuery('body')[0].scrollHeight >= fixTo ){
                params.to                               = fixTo;
            }else{
                params.to                               = Math.floor(params.to);
            }
            params.distance                             = params.to - from;
            aRD.$w.data('aoWindowScroll', setTimeout(func, params.delay));
        });
    });
})(aRunD, tirray);