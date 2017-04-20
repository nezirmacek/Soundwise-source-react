/*! aRund v.1.7.5 - 2017-04-02 */

/* global aRunD, tirray */

(function (fn) {
    if (typeof jQuery === 'undefined') {
        throw 'aRunD Animaze requires jQuery to be loaded first';
    }
    if (typeof aRunD === 'undefined') {
        throw 'aRunD Animaze requires aRunD to be loaded first';
    }
    if (typeof tirray === 'undefined') {
        throw 'aRunD Animaze requires tirray to be loaded first';
    }
    fn(jQuery, aRunD, tirray);
}(function ($, aRD, TRR) {
    var setOptions                                          = function (context, initOpts){
            var options                                     = $.extend(true, {}, initOpts || {});
            $.each(options, function (name, val){
                if( typeof(context[name]) === 'function' ){
                    context[name](val);
                }
            });
            return context;
        }
    ;

    /* Ease */
        var easeOut                                         = function (fn){
                return function (t, x) {
                    return 1 - fn(1 - t, x);
                };
            },
            easeInOut                                       = function (fn){
                return function (t, x) {
                    return t < 0.5 ? fn(2*t, x)/2 : (2 - fn(2*(1-t), x))/2;
                };
            },
            easeIn                                          = function (t, x){
                var _x                                      = x && x > 0 ? x : 2;
                return Math.pow(t, _x);
            },
            easeList                                        = {
                linear                                          : function (t){ return t; },
                easeIn                                          : easeIn,
                easeOut                                         : easeOut(easeIn),
                easeInOut                                       : easeInOut(easeIn)
            },
            provideEase                                     = function (name, func, inFN, outFn, inOutFn){
                if( arguments.length < 2 ){
                    if( typeof name === 'undefined' ){
                        return easeList;
                    }
                    return easeList[name] || null;
                }
                var upCamel                                 = aRD.ucfirst(name);
                if( inFN === true || inFN === undefined ){
                    easeList['easeIn' + upCamel]            = func;
                }else if( typeof inFN === 'function' ){
                    easeList['easeIn' + upCamel]            = inFN;
                }else{
                    easeList[name]                          = func;
                }
                if( outFn === true || outFn === undefined ){
                    easeList['easeOut' + upCamel]           = easeOut(func);
                }else if( typeof outFn === 'function' ){
                    easeList['easeOut' + upCamel]           = outFn;
                }
                if( inOutFn === true || inOutFn === undefined ){
                    easeList['easeInOut' + upCamel]         = easeInOut(func);
                }else if( typeof inOutFn === 'function' ){
                    easeList['easeInOut' + upCamel]         = inOutFn;
                }
                return aRD;
            }
        ;

        provideEase('circ', function (t) { return 1 - Math.sin(Math.acos(t)); });
        provideEase('back', function (t, x) {
            var _x                                          = x || 1.5;
            return Math.pow(t, 2) * ((_x + 1) * t - _x);
        });
        provideEase('bounce', function (t){
            for(var a = 0, b = 1; 1; a += b, b /= 2) {
                if (t >= (7 - 4 * a) / 11) {
                    return -Math.pow((11 - 6 * a - 11 * t) / 4, 2) + Math.pow(b, 2);
                }
            }
        });
        provideEase('elastic', function (t, x) {
            var _x                                          = x && x > 0 ? x : 10;
            return Math.pow(2, _x * (t-1)) * Math.sin(10.5*Math.PI*t);
        });
        provideEase('wave', function (t, x) {
            var _x                                          = (x && x > 0 ? x : 2) - 1;
            return (_x ? Math.pow((2-1/_x), 2 * (t-1)) : 1) * Math.sin((2*_x+0.5)*Math.PI*t);
        });

    /* Animation type */
        var aniList                                         = {},
            dataParser                                      = aRD.parser.newData({
                keyCheck                                    : {
                    name                                        : 'animation',
                    keyObj                                      : aniList
                },
                properties                                  : {
                    delay                                       : 'time'
                }
            }),
            setAnimationType                                = function (name, animation){
                aniList[name]                               = animation;
                dataParser.addProperty(name, animation._parser);
            },
            createData                                      = function (val){
                var props                                   = typeof(val) === 'object' ? val : {duration : val},
                    ret                                     = {
                        delay                               : props.delay === true ? 0 : aRD.toNumber(props.delay, 0),
                        duration                            : props.duration === true ? 0 : aRD.toNumber(props.duration, 0),
                    }
                ;
                if( typeof(props.easeX) === 'number' ){
                    ret.easeX                               = props.easeX;
                }
                if( props.ease ){
                    if( typeof(props.ease) === 'function' ){
                        ret.ease                            = props.ease;
                    }else if( typeof(props.ease) === 'string' && easeList[props.ease] ){
                        ret.ease                            = easeList[props.ease];
                    }else{
                        ret.ease                            = easeList.linear;
                    }
                }else{
                    ret.ease                                = easeList.linear;
                }
                return ret;
            },
            AnimationType                                   = function (name){
                this._parser                                = aRD.parser.newProperty();
                this._aliases                               = [];
                this._keys                                  = [];
                this._name                                  = name;
                this._check                                 = $.noop;
                this._init                                  = $.noop;
                this._start                                 = $.noop;
                this._step                                  = $.noop;
                this._finish                                = $.noop;
                this._stop                                  = $.noop;
                this._dataFn                                = createData;
                setAnimationType(name, this);
            }
        ;
        AnimationType.prototype                             = {
            options                                         : function (options){
                setOptions(this, options);
                return this;
            },
            properties                                      : function (val){
                if( val === undefined ){
                    return this._parser.dataCheck();
                }
                if( val instanceof Array ){
                    for (var i = 0; i < val.length; i++) {
                        this._parser.dataCheck().addPropertyCheck(val[i]);
                    }
                }else if(typeof val === 'object'){
                    this._parser.dataCheck().addPropertyCheck(val);
                }
                return this;
            },
            addProperty                                     : function (val, pos){
                this._parser.dataCheck().addPropertyCheck(val, pos);
                return this;
            },
            aliases                                         : function (val){
                if( val === undefined ){
                    return this._aliases;
                }
                if( typeof val === 'string' && !aniList[val] ){
                    this._aliases.push(val);
                    setAnimationType(val, this);
                }else if( val instanceof Array ){
                    for (var i = 0; i < val.length; i++) {
                        if( typeof val[i] === 'string' && !aniList[val[i]] ){
                            this._aliases.push(val[i]);
                            setAnimationType(val[i], this);
                        }
                    }
                }
                return this;
            },
            keys                                            : function (val){
                if( val === undefined ){
                    return this.keys;
                }
                this._keys                                  = aRD.createKeys(this._keys, val);
                return this;
            },
            checkFn                                         : function (val){
                var type                                    = typeof val;
                if( type === 'undefined' ){
                    return this._check;
                }
                if( type === 'function' ){
                    this._check                             = val;
                }
                return this;
            },
            initFn                                          : function (val){
                var type                                    = typeof val;
                if( type === 'undefined' ){
                    return this._init;
                }
                if( type === 'function' ){
                    this._init                              = val;
                }
                return this;
            },
            startFn                                         : function (val){
                var type                                    = typeof val;
                if( type === 'undefined' ){
                    return this._start;
                }
                if( type === 'function' ){
                    this._start                             = val;
                }
                return this;
            },
            stepFn                                          : function (val){
                var type                                    = typeof val;
                if( type === 'undefined' ){
                    return this._step;
                }
                if( type === 'function' ){
                    this._step                              = val;
                }
                return this;
            },
            finishFn                                        : function (val){
                var type                                    = typeof val;
                if( type === 'undefined' ){
                    return this._finish;
                }
                if( type === 'function' ){
                    this._finish                            = val;
                }
                return this;
            },
            stopFn                                          : function (val){
                var type                                    = typeof val;
                if( type === 'undefined' ){
                    return this._stop;
                }
                if( type === 'function' ){
                    this._stop                              = val;
                }
                return this;
            },
            dataFn                                          : function (val){
                var type                                    = typeof val;
                if( type === 'undefined' ){
                    return this._dataFn;
                }
                if( type === 'function' ){
                    this._dataFn                            = val;
                }
                return this;
            },
            data                                            : function (val){
                if(val === undefined){
                    return this._data;
                }
                this._data                                  = val;
                return this;
            },
            createData                                      : function (val){
                var data                                    = $.extend(true, {}, this._data, this._dataFn(val));
                data.delay                                  = data.delay || 0;
                data.duration                               = data.duration || 0;
                return data;
            }
        };

    /* Animation types */
        var durationProperty                                = aRD.parser.newPropertyCheck({
                checks                                      : aRD.parser.check('duration')
            }),
            delayProperty                                   = aRD.parser.newPropertyCheck({
                checks                                      : aRD.parser.check('delay')
            }),
            easeProperty                                    = aRD.parser.newPropertyCheck({
                checks                                      : {
                    name                                        : 'ease',
                    keyObj                                      : easeList
                }
            }),
            easeXProperty                                   = aRD.parser.newPropertyCheck({
                checks                                      : {
                    name                                        : 'easeX',
                    type                                        : 'number'
                }
            }),
            provideAnimationType                            = function (name, options, delay, duration, ease){
                if( arguments.length < 2 ){
                    if( typeof name === 'undefined' ){
                        return aniList;
                    }
                    return aniList[name] || null;
                }
                if( aniList[name] ){
                    return aniList[name];
                }
                var obj                                     = new AnimationType(name);
                if( options ){
                    obj.options(options);
                }
                if( duration === true || duration === undefined ){
                    obj.addProperty(durationProperty, 0);
                }
                if( delay === true || delay === undefined ){
                    obj.addProperty(delayProperty, 0);
                }
                if( ease === true || ease === undefined ){
                    obj
                        .addProperty(easeProperty)
                        .addProperty(easeXProperty)
                    ;
                }
                return aRD;
            }
        ;

        provideAnimationType('show', {
            keys                                            : ['display'],
            dataFn                                          : function (val){
                var data                                    = createData(val);
                data.display                                = val.display || null;
                return data;
            },
            startFn                                         : function ($el, data){
                if( data.display ){
                    return {
                        display                             : data.display
                    };
                }else if( $el.is(':hidden') ){
                    return {
                        display                             : aRD.getOriginalCss($el, 'display')
                    };
                }
            },
            properties                                      : [
                { checks                                        : aRD.parser.check('display') }
            ]
        }, true, false, false);
        provideAnimationType('hide', {
            keys                                            : ['display'],
            startFn                                         : function ($el){
                if( $el.is(':visible') ){
                    return {
                        display                             : 'none'
                    };
                }
            }
        }, true, false, false);

        var fadeProps                                       = [
            aRD.parser.newPropertyCheck({
                checks                                      : aRD.parser.check('display')
            }),
            aRD.parser.newPropertyCheck({
                checks                                      : aRD.parser.newCheck('toOpacity', 'percent')
            }),
            aRD.parser.newPropertyCheck({
                checks                                      : aRD.parser.newCheck('fromOpacity', 'percent')
            })  
        ];

        provideAnimationType('fadein', {
            dataFn                                          : function (val){
                var data                                    = createData(val);
                data.display                                = val.display || null;
                data.toOpacity                              = aRD.toNumber(val.toOpacity, 100)/100;
                data.fromOpacity                            = aRD.toNumber(val.fromOpacity, false);
                if( data.fromOpacity ){
                    data.fromOpacity                        = data.fromOpacity/100;
                }
                return data;
            },
            initFn                                          : function ($el, data){
                if( $el.is(':hidden') ){
                    $el.css('opacity', data.fromOpacity || 0);
                }
            },
            startFn                                         : function ($el, data){
                var css                                     = {};
                if( data.fromOpacity === false ){
                    if( $el.is(':hidden') ){
                        data.fromOpacity                    = 0;
                    }else{
                        var curOp                           = $el.css('opacity');
                        if( curOp ){
                            data.fromOpacity                = aRD.toNumber(curOp, 0);
                        }
                    }
                }

                if( data.display ){
                    css.display                             = data.display;
                }else if( $el.is(':hidden') ){
                    css.display                             = aRD.getOriginalCss($el, 'display');
                }

                if( data.fromOpacity === data.toOpacity ){
                    data.duration                           = 0;
                }else{
                    data.perc                               = data.toOpacity - data.fromOpacity;
                    css.opacity                             = data.fromOpacity;
                }
                
                return css;
            },
            stepFn                                          : function ($el, data){
                return data.perc ? {
                    opacity                                 : data.fromOpacity + (data.perc * aRD.loopRange(data.delta, 0, 1))
                } : null;
            },
            finishFn                                        : function ($el, data){
                return {
                    opacity                                 : data.toOpacity
                };
            },
            properties                                      : fadeProps
        });
        provideAnimationType('fadeout', {
            dataFn                                          : function (val){
                var data                                    = createData(val);
                data.display                                = val.display || null;
                data.toOpacity                              = aRD.toNumber(val.toOpacity, 0)/100;
                data.fromOpacity                            = aRD.toNumber(val.fromOpacity, false);
                if( data.fromOpacity ){
                    data.fromOpacity                        = data.fromOpacity/100;
                }
                return data;
            },
            startFn                                         : function ($el, data){
                var css                                     = {};
                if( data.fromOpacity === false ){
                    if( $el.is(':hidden') ){
                        data.fromOpacity                    = 0;
                    }else{
                        var curOp                           = $el.css('opacity');
                        if( curOp ){
                            data.fromOpacity                = aRD.toNumber(curOp, 1);
                        }
                    }
                }

                if( data.fromOpacity === data.toOpacity ){
                    data.duration                           = 0;
                }else{
                    if( data.display ){
                        css.display                         = data.display;
                    }else if( $el.is(':hidden') ){
                        css.display                         = aRD.getOriginalCss($el, 'display');
                    }else{
                        css.display                         = $el.css('display');
                    }
                    data.perc                               = data.fromOpacity - data.toOpacity;
                    css.opacity                             = data.fromOpacity;
                }
                
                return css;
            },
            stepFn                                          : function ($el, data){
                return data.perc ? {
                    opacity                                 : aRD.loopRange(data.fromOpacity - (data.perc * data.delta), 0, 1)
                } : null;
            },
            finishFn                                        : function ($el, data){
                return {
                    opacity                                 : data.toOpacity,
                    display                                 : data.display || 'none'
                };
            },
            properties                                      : fadeProps
        });

        var getPosDelta                                     = function (delta, from, to){
            var pos                                         = jQuery.extend({}, from);
            if( !to ){
                return pos;
            }
            if( pos.value !== to.value ){
                pos.value                                   = pos.value + ( to.value - pos.value ) * delta;
            }
            if( pos.offset !== to.offset ){
                pos.offset                                  = pos.offset + ( to.offset - pos.offset ) * delta;
            }
            return pos;
        };
        provideAnimationType('move', {
            dataFn                                          : function (val){
                var data                                    = createData(val);
                data.position                               = val.position ? val.position : 'absolute';
                data.toX                                    = val.toX ? val.toX : false;
                data.toY                                    = val.toY ? val.toY : false;
                data.fromX                                  = val.fromX ? val.fromX : false;
                data.fromY                                  = val.fromY ? val.fromY : false;
                if( !(data.toX || data.toY) ){
                    //skip
                    data.disabled                           = true;
                }
                return data;
            },
            startFn                                         : function ($el, data){
                if( $el.is(':hidden') ){
                    data.needFix                            = true;
                }
                data._pos                                   = aRD.convertPosition($el, data.fromX, data.fromY, data.position, data.toX, data.toY);
                return {
                    position                                : data._pos.position,
                    x                                       : data._pos.posX,
                    y                                       : data._pos.posY
                };
            },
            stepFn                                          : function ($el, data){
                if( data.needFix && $el.is(':visible') ){
                    data.needFix                            = false;
                    data._pos                               = aRD.convertPosition($el, data.fromX, data.fromY, data.position, data.toX, data.toY);
                }
                return {
                    position                                : data._pos.position,
                    x                                       : getPosDelta(data.delta, data._pos.posX, data._pos.toX),
                    y                                       : getPosDelta(data.delta, data._pos.posY, data._pos.toY)
                };
            },
            finishFn                                        : function ($el, data){
                return {
                    position                                : data.position,
                    x                                       : data.toX,
                    y                                       : data.toY
                };
            },
            properties                                      : [
                { checks                                        : aRD.parser.check('absposition') },
                { checks                                        : aRD.parser.newCheck('toX', 'positionX') },
                { checks                                        : aRD.parser.newCheck('toY', 'positionY') },
                { checks                                        : aRD.parser.newCheck('fromX', 'positionX') },
                { checks                                        : aRD.parser.newCheck('fromY', 'positionY') },
            ]
        });

    /* Animation */
        var Animation                                       = function (options){
                this._list                                  = new TRR();
                this.options(options);
            },
            aniFinish                                       = function (context, $el, item, itemData){
                var cssList                                 = [],
                    css
                ;
                if( !itemData.started ){
                    itemData.started                        = true;
                    css                                     = item.data.animation.startFn()($el, itemData, context);
                    itemData.endTime                        = itemData.delay + itemData.duration;
                    if( css ){
                        cssList.push(css);
                    }
                }
                if( !itemData.finished ){
                    itemData.finished                       = true;
                    itemData.progress                       = 1;
                    css                                     = item.data.animation.finishFn()($el, itemData, context);
                    if( css ){
                        cssList.push(css);
                    }
                }
                return cssList;
            }
        ;
        Animation.prototype                                 = {
            options                                         : function (options){
                setOptions(this, options);
                return this;
            },
            animations                                      : function (val){
                this._list                                  = new TRR();
                var context                                 = this;
                $.each(val, function (name, opts){
                    context.addAnimation(name, opts);
                });
                return this;
            },
            addAnimation                                    : function (name, val){
                var aniName                                 = aRD.getObjProp(val, false, 'animation') || name,
                    aniType                                 = provideAnimationType(aniName)
                ;
                if( aniType ){
                    if( aniType.checkFn()(val) !== false ){
                        var settings                        = {
                            name                            : name,
                            animation                       : aniType,
                            data                            : aniType.createData(val, this),
                        };
                        settings.data.title                 = name;
                        if( !settings.data.disabled ){
                            this._list.add(settings, settings.data.delay, aRD.createKeys(aniType.keys(), name, aniName));
                        }
                    }
                }
                return this;
            },
            hasAnimations                                   : function (){
                return !!this._list.length;
            },
            keys                                            : function (val){
                if(val === undefined){
                    return aRD.createKeys(this._keys, this._list.getKeys());
                }
                if( val instanceof Array ){
                    this._keys                              = val;
                }else if( typeof keys !== 'object' ){
                    this._keys                              = [val];
                }
                return this;
            },
            hasKey                                          : function (val){
                var oKeys                                   = this.keys(),
                    keys                                    = val instanceof Array ? val : [val]
                ;
                for (var i = 0; i < keys.length; i++) {
                    if( jQuery.inArray(keys[i], oKeys) > -1 ){
                        return true;
                    }
                }
                return false;
            },
            init                                            : function ($el){
                var data                                    = {};
                this._list.each(function (item){
                    data[item.data.name]                    = {};
                    item.data.animation.initFn()($el, $.extend(true, data[item.data.name], item.data.data || {}) );
                });
                data.animationsLength                       = this._list.length;
                return data;
            },
            stop                                            : function ($el, data){
                var cssList                                 = [],
                    context                                 = this,
                    css
                ;
                data.animationsLength                       = context._list.length;
                context._list.each(function (item){
                    var itemData                            = data[item.data.name];
                    --data.animationsLength;
                    itemData.stopped                        = true;
                    css                                     = item.data.animation.stopFn()($el, itemData, context);
                    if( css ){
                        cssList.push(css);
                    }
                });
                return cssList;
            },
            finish                                          : function ($el, data){
                var cssList                                 = [],
                    context                                 = this,
                    css
                ;
                data.animationsLength                       = context._list.length;
                context._list.each(function (item){
                    --data.animationsLength;
                    css                                     = aniFinish(context, $el, item, data[item.data.name]);
                    if( css.length ){
                        cssList                             = cssList.concat(css);
                    }
                });
                return cssList;
            },
            step                                            : function ($el, data, time){
                var cssList                                 = [],
                    context                                 = this,
                    css
                ;
                data.animationsLength                       = context._list.length;
                context._list.each(function (item){
                    var itemData                            = data[item.data.name];
                    if( !itemData.finished && time >= item.time ){
                        if( !itemData.started ){
                            itemData.started                = true;
                            css                             = item.data.animation.startFn()($el, itemData, context);
                            itemData.endTime                = itemData.delay + itemData.duration;
                            if( css ){
                                cssList.push(css);
                            }
                        }
                        if( time >= itemData.endTime ){
                            --data.animationsLength;
                            css                             = aniFinish(context, $el, item, data[item.data.name]);
                            if( css.length ){
                                cssList                     = cssList.concat(css);
                            }
                        }else{
                            itemData.progress               = (time - itemData.delay) / itemData.duration;
                            var delta                       = itemData.ease( itemData.progress, itemData.easeX );
                            if( itemData.delta !== delta ){
                                itemData.delta              = delta;
                                css                         = item.data.animation.stepFn()($el, itemData, context);
                                if( css ){
                                    cssList.push(css);
                                }
                            }
                        }
                    }else if(itemData.finished){
                        --data.animationsLength;
                    }
                });
                return cssList;
            }
        };
    
    /* extending aRunD */
        aRD.animation                                       = {
            ease                                            : provideEase,
            hasEase                                         : function (name){
                return !!easeList[name];
            },
            getEasings                                      : function (){
                return Object.keys(easeList);
            },
            type                                            : provideAnimationType,
            hasType                                         : function (name){
                return !!aniList[name];
            },
            new                                             : function (options){
                return new Animation(options);
            },
            getTypes                                        : function (){
                return Object.keys(aniList);
            },
            data                                            : createData,
            parse                                           : function (val){
                return dataParser.parse(val);
            },
            stringify                                       : function (val){
                return dataParser.stringify(val);
            }
        };
}));