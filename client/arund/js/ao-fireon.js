/*! aRund v.1.7.5 - 2017-04-02 */

/* global aRunD */

(function (fn) {
    if (typeof jQuery === 'undefined') {
        throw 'aRunD FineOn requires jQuery to be loaded first';
    }
    if (typeof aRunD === 'undefined') {
        throw 'aRunD FineOn requires aRunD to be loaded first';
    }
    fn(jQuery, aRunD);
}(function ($, aRD) {
    var trList                                              = {},
        setOptions                                          = function (context, initOpts, defaults){
            var options                                     = $.extend({}, defaults || {}, initOpts || {});
            $.each(options, function (name, val){
                if( typeof(context[name]) === 'function' ){
                    context[name](val);
                }
            });
            return context;
        }
    ;
    /* TriggerType */
        var dataParser                                      = aRD.parser.newData({
                keyCheck                                    : {
                    name                                        : 'name',
                    keyObj                                      : trList
                }
            }),
            TriggerType                                     = function (name){
                this._parser                                = aRD.parser.newProperty();
                this._setupFn                               = $.noop;
                this._check                                 = null;
                this._setupFn                               = [];

                trList[name]                                = this;
                dataParser.addProperty(name, this._parser);
            },
            newTrigger                                      = function (name, opts){
                var type                                    = typeof(opts) === 'object' && opts.name ? opts.name : name;
                return trList[type] ? trList[type].createTrigger(name, opts) : null;
            }
        ;
        TriggerType.prototype                               = {
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
            setupFn                                         : function (val){
                var type                                    = typeof val;
                if( type === 'undefined' ){
                    return this._setupFn;
                }
                if( type === 'function' ){
                    this._setupFn.push(val);
                }
                return this;
            },
            checkFn                                         : function (val){
                var type                                    = typeof val;
                if( type === 'undefined' ){
                    return this._check;
                }
                if( type === 'function' ){
                    this._check                             = val;
                }else{
                    this._check                             = null;
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
            setupTrigger                                    : function (trigger, opts){
                var data                                    = $.extend(true, {}, opts || {}, this._data);
                if( this._check ){
                    trigger.addCheck(this._check);
                }
                trigger.data                                = data;
                for (var i = 0; i < this._setupFn.length; i++) {
                    this._setupFn[i](trigger);
                }
                return this;
            },
            createTrigger                                   : function (key, opts){
                var trigger                                 = new Trigger(key);
                this.setupTrigger(trigger, opts);
                return trigger;
            }
        };

    /* Trigger */
        var Trigger                                         = function (name){
                this.name                                   = name;
                this.namespace                              = '.aotrigger_' + this.name + '__' + aRD.randomId();
                this.checks                                 = [];
                this.watchers                               = {};
                this.events                                 = {};
            },
            baseTriggerCheck                                = function (trigger){
                if( trigger.state !== 'active' ){
                    trigger.stop();
                    return false;
                }
                return true;
            },
            checkTrigger                                    = function (trigger){
                if( !(aRD.canFireOn )  ){
                    return false;
                }
                for (var i = 0; i < trigger.checks.length; i++) {
                    if( trigger.checks[i](trigger) === false ){
                        return false;
                    }
                }
                return true;
            },
            runTriggerEvent                                 = function (trigger, triggerEvent, event, props){
                if( baseTriggerCheck(trigger) && (!triggerEvent.checkFn || triggerEvent.checkFn(trigger, event, props)) ){
                    switch ( triggerEvent.type ){
                        case 'reset':
                            trigger.reset();
                            break;
                        case 'stop':
                            trigger.stop();
                            break;
                        default:
                            if(checkTrigger(trigger)){
                                runTrigger(trigger);
                            }
                            break;
                    }
                }
            },
            runTrigger                                      = function (trigger){
                var data                                    = trigger.data;
                if( !callTriggerWatchers(trigger, 'catch') ){
                    return;
                }

                if( data.delay ){
                    var delay                               = data.delay;
                    if( typeof(delay) === 'object' ){
                        delay                               = aRD.getRangeRandom(delay.from || 0, delay.to);
                        if( !delay || delay < 0 ){
                            delay                           = 0;
                        }
                    }

                    if( typeof(delay) !== 'number' || delay < 0 ){
                        delay                               = 0;
                    }
                    trigger.reset();
                    trigger.delayID                         = setTimeout(function (){
                        trigger.delayID                     = null;
                        callTriggerWatchers(trigger, 'call');
                    }, delay);
                }else{
                    callTriggerWatchers(trigger, 'call');
                }
            },
            callTriggerWatchers                             = function (trigger, name){
                if( trigger.watchers[name] ){
                    for (var i = 0; i < trigger.watchers[name].length; i++) {
                        if( trigger.watchers[name][i](trigger) === false ){
                            return false;
                        }
                    }
                }
                return true;
            },
            bindEvent                                       = function(trigger, name, event){
                if( name === 'ready' ){
                    $(function(){
                        runTriggerEvent(trigger, event);
                    });
                }else if( name && typeof name === 'string' ){
                    event.$el.on(name + trigger.namespace, function(e, p){
                        runTriggerEvent(trigger, event, e, p);
                    });
                }
            }
        ;

        Trigger.prototype                                   = {
            start                                           : function (){
                var context                                 = this;
                context.state                               = 'active';
                if( !context.disabled ){
                    if( context.hasEvents ){
                        $.each(context.events, function(id, event){
                            if( event.name instanceof Array ){
                                for (var i = 0; i < event.name.length; i++) {
                                    bindEvent(context, event.name[i], event);
                                }
                            }else{
                                bindEvent(context, event.name, event);
                            }
                        });
                    }else if( baseTriggerCheck(this) && checkTrigger(this) ){
                        runTrigger(context);
                    }
                }
                return context;
            },
            addEvent                                        : function (name, $el, checkFn, type, id){
                var context                                 = this,
                    _id                                     = typeof id === 'undefined' ? aRD.randomId(context.events) : id
                ;
                context.hasEvents                           = true;
                context.events[_id]                         = {
                    id                                      : _id,
                    name                                    : name,
                    $el                                     : $el,
                    checkFn                                 : checkFn,
                    type                                    : type
                };
                if( $('body').find($el) ){
                    $el.on('destroyed' + context.namespace, function(){
                        delete context.events[_id];
                    });
                }
                return context;
            },
            addWatcher                                      : function (type, fn){
                if( typeof fn === 'function' ){
                    if( !this.watchers[type] ){
                        this.watchers[type]                 = [];
                    }
                    this.watchers[type].push(fn);
                }
                return this;
            },
            addCheck                                        : function (fn){
                if( typeof fn === 'function' ){
                    this.checks.push(fn);
                }
                return this;
            },
            stop                                            : function (){
                this.state                                  = 'inactive';
                this.reset();
                if( this.hasEvents ){
                    var context                             = this;
                    $.each(context.events, function(id, event){
                        event.$el.off(context.namespace);
                    });
                }
                return this;
            },
            reset                                           : function (){
                if(this.delayID){
                    clearTimeout(this.delayID);
                    this.delayID                            = null;
                }
                return this;
            },
            destroy                                         : function (){
                this.stop();
                this.checks                                 = [];
                this.watchers                               = {};
                this.events                                 = {};
            }
        };

    /* FireOn */
        var FireOn                                          = function ($el, fn){
                var context                                 = this;
                context.triggers                            = {};
                context.fn                                  = typeof(fn) === 'function' ? fn : function (){ return fn; };
                context.$el                                 = $($el)
                    .on('destroyed', function (){
                        context.destroy();
                        context                             = null;
                    })
                ;
            }
        ;

        FireOn.prototype                                    = {
            add                                             : function (params){
                var context                                 = this;
                $.each(params, function (key, opts){
                    context.remove(key);
                    opts.$el                                = context.$el;
                    var trigger                             = newTrigger(key, opts);
                    if( trigger && !trigger.disabled ){
                        context.triggers[trigger.name]      = trigger;
                        trigger
                            .addWatcher('catch', function(trigger){
                                if( trigger.data.cancel ){
                                    context.reset();
                                    return false;
                                }
                                if( trigger.data.single ){
                                    context.reset();
                                }
                            })
                            .addWatcher('call', function(trigger){
                                context.fn(context.$el);
                                if( trigger.data.runOnce ){
                                    context.remove(trigger.name);
                                    return false;
                                }
                            })
                            .start()
                        ;
                    }
                });
                return context;
            },
            reset                                           : function (key){
                var context                                 = this;
                if( key ){
                    if( context.triggers[key] ){
                        context.triggers[key].reset();
                    }
                }else{
                    $.each(context.triggers, function (i, trigger){
                        trigger.reset();
                    });
                }
                return this;
            },
            cancel                                          : function (key){
                var context                                 = this;
                if( key ){
                    if( context.triggers[key] ){
                        context.triggers[key].stop();
                    }
                }else{
                    $.each(context.triggers, function (i, trigger){
                        trigger.stop();
                    });
                }
                return this;
            },
            remove                                          : function (key){
                var context                                 = this;
                if( key ){
                    if( context.triggers[key] ){
                        context.triggers[key].destroy();
                        delete context.triggers[key];
                    }
                }else{
                    $.each(context.triggers, function (i, trigger){
                        trigger.destroy();
                    });
                    context.triggers                        = {};
                }
                return this;
            },
            destroy                                         : function (){
                this.remove();
                this.triggers                               = null;
                this.fn                                     = null;
                this.executed                               = null;
                this.$el                                    = null;
            }
        };

    /* TriggerType types */
        var cookieProperty                                  = aRD.parser.hasCheck('cookie') ? aRD.parser.newPropertyCheck({
                checks                                      : aRD.parser.check('cookie')
            }) : null,
            delayProperty                                   = aRD.parser.newPropertyCheck({
                checks                                      : aRD.parser.newCheck('delay', 'timeRange')
            }),
            onceProperty                                    = aRD.parser.newPropertyCheck({
                checks                                      : {
                    name                                        : 'runOnce',
                    allowed                                     : ['once']
                }
            }),
            actionProperty                                  = aRD.parser.newPropertyCheck({
                checks                                      : [{
                    name                                        : 'single',
                    allowed                                     : ['single']
                },{
                    name                                        : 'cancel',
                    allowed                                     : ['cancel']
                }]
            }),
            cookieCheck                                     = function (trigger){
                return aRD.cookie.check(trigger.data.cookie);
            },
            provideTriggerType                              = function (name, options){
                if( arguments.length < 2 ){
                    if( typeof name === 'undefined' ){
                        return trList;
                    }
                    return trList[name] || null;
                }
                if( trList[name] ){
                    return trList[name];
                }
                var obj                                     = new TriggerType(name);
                if( options ){
                    obj.options(options);
                }
                obj
                    .addProperty(delayProperty, 0)
                    .addProperty(onceProperty, 1)
                    .addProperty(actionProperty, 2)
                ;
                if( cookieProperty ){
                    obj.addProperty(cookieProperty, 0);
                    obj.setupFn(function(trigger){
                        if(trigger.data.cookie){
                            trigger.addCheck( cookieCheck );
                        }
                    });
                }
                return obj;
            }
        ;

        provideTriggerType('init', {
            properties                                      : {
                checks                                          : {
                    name                                            : 'eventType',
                    allowed                                         : ['load', 'ready']
                }
            },
            setupFn                                          : function (trigger){
                if( trigger.data.eventType === 'load' && !aRD.loaded ){
                    trigger.addEvent('load', aRD.$w);
                }else{
                    trigger.addEvent('ready', aRD.$doc);
                }
            }
        });
        provideTriggerType('inactive', {
            setupFn                                        : function (trigger){
                trigger.addEvent(['ready', 'mousemove', 'mousedawn', 'mouseup', 'keydown', 'keyup', 'scroll'], aRD.$doc);
            }
        });

        var blockProperty                                   = aRD.parser.newPropertyCheck({
                checks                                      : {
                    type                                        : 'string',
                    name                                        : 'block',
                    parser                                      : function (value){
                        return value === 'self' ? false : value;
                    }
                }
            }),
            blockActionProperty                             = aRD.parser.newPropertyCheck({
                checks                                      : {
                    type                                        : 'string',
                    name                                        : 'action'
                }
            }),
            provideBlockTriggerType                         = function(name, options, action){
                var obj                                     = provideTriggerType(name, options);
                obj.addProperty(blockProperty);
                if( typeof(action) === 'undefined' || action ){
                    obj.addProperty(blockActionProperty);
                }
                return obj;
            },
            leaveTopCheck                                   = function (trigger, event){
                return event.clientY <= 0;
            }
        ;
        provideBlockTriggerType('leave', {
            setupFn                                         : function (trigger){
                var data                                    = trigger.data;
                switch( data.block ){
                    case 'window':
                        trigger.addEvent('mouseleave', aRD.$doc, leaveTopCheck);
                        trigger.addEvent('mouseenter', aRD.$doc, null, 'reset');
                        break;
                    case 'page':
                        trigger.addEvent('mouseleave', aRD.$doc);
                        trigger.addEvent('mouseenter', aRD.$doc, null, 'reset');
                        break;
                    default:
                        var $block                          = aRD.block.find(data.block);
                        $block                              = $block.length ? $block : data.$el;
                        trigger.addEvent('mouseleave', $block);
                        trigger.addEvent('mouseenter', $block, null, 'reset');
                        break;
                }
            }
        }, false);

        var checkSizeRange                                  = function (data, prop, fillTo){
                if( !(data[prop] && data[prop].from ) ){
                    data[prop]                              = data[prop] || {};
                    data[prop].from                         = {
                        value                               : 0,
                        type                                : 'px'
                    };
                }
                if( fillTo && !data[prop].to ){
                    data[prop].to                           = {
                        value                               : 100,
                        type                                : '%'
                    };
                }
            },
            mouseAtCheck                                    = function (data, offsX, offsY, width, height){
                return (!data.y || (
                        (!data.y.from || aRD.fixSizeValue(data.y.from, height) <= offsY) &&
                        (!data.y.to || aRD.fixSizeValue(data.y.to, height) >= offsY)
                    )) &&
                    (!data.x || (
                        (!data.x.from || aRD.fixSizeValue(data.x.from, width) <= offsX) &&
                        (!data.x.to || aRD.fixSizeValue(data.x.to, width) >= offsX)
                    ))
                ;
            },
            mouseInCheck                                    = function (data, event){
                if( data.$parent.is(':hidden') ){
                    return false;
                }
                var
                    height                                  = data.y ? data.$parent.innerHeight() : null,
                    width                                   = data.x ? data.$parent.innerWidth() : null,
                    offsY                                   = event.pageY,
                    offsX                                   = event.pageX
                ;
                if( data.$parent ){
                    var offs                                = data.$parent.offset();
                    offsY                                   = event.pageY - offs.top;
                    offsX                                   = event.pageX - offs.left;
                }
                return mouseAtCheck(data, offsX, offsY, width, height);
            },
            mouseInCheck_page                               = function (data, event){
                var
                    size                                    = aRD.getContentSize(),
                    offsY                                   = event.pageY,
                    offsX                                   = event.pageX
                ;
                if( data.$parent ){
                    var offs                                = data.$parent.offset();
                    offsY                                   = event.pageY - offs.top;
                    offsX                                   = event.pageX - offs.left;
                }
                return mouseAtCheck(data, offsX, offsY, size.width, size.height);
            },
            triggerMouseAtCheck                             = function (trigger, event){
                var data                                    = trigger.data,
                    check                                   = data.mouseInCheck(data, event)
                ;
                if( data.mousein !== check ){
                    data.mousein = check;
                    return data.mousein;
                }
                return false;
            }
        ;
        provideBlockTriggerType('mouseat', {
            properties                                      : [
                { checks                                        : aRD.parser.newCheck('y', 'sizeRange') },
                { checks                                        : aRD.parser.newCheck('x', 'sizeRange') }
            ],
            setupFn                                         : function (trigger){
                var data                                    = trigger.data;
                checkSizeRange( data, 'y', true );
                checkSizeRange( data, 'x', true );
                switch( data.block ){
                    case 'page':
                        data.mouseInCheck                   = mouseInCheck_page;
                        break;
                    default:
                        var $block                          = aRD.block.find(data.block);
                        data.$parent                        = $block.length ? $block : data.$el;
                        data.mouseInCheck                   = mouseInCheck;
                        break;
                }
                trigger.addEvent(['mousemove', 'mouseleave'], aRD.$doc, triggerMouseAtCheck);
            }
        }, false);

        var inviewCheck                                     = function (trigger){
                var data                                    = trigger.data;
                if( data.$blockEl && data.$blockEl.is(':hidden') ){
                    return false;
                }
                var
                    $cEl                                    = data.$blockEl || 'page',
                    offsFrom                                = aRD.heightToType($cEl, $.extend({}, data.y.from), 'px').value,
                    offsTo                                  = data.y.to ? aRD.heightToType($cEl, $.extend({}, data.y.to), 'px').value : offsFrom,
                    wSize                                   = aRD.getWindowSize(),
                    scroll                                  = aRD.$w.scrollTop(),
                    scrollTo                                = aRD.$w.scrollTop() + wSize.height,
                    ret                                     = false
                ;
                if( data.$blockEl ){
                    var tmp                                 = $cEl.offset().top;
                    offsFrom                                += tmp;
                    offsTo                                  += tmp;
                }
                if( data.crossed ){
                    if( scrollTo <= offsFrom || scroll > offsTo){
                        data.crossed                        = false;
                    }
                }else if( (scroll <= offsFrom && scrollTo >= offsTo) || (scroll >= offsFrom && scrollTo <= offsTo) ){
                    data.crossed = ret                      = true;
                }
                return ret;
            }
        ;
        provideBlockTriggerType('inview', {
            properties                                      : { checks : aRD.parser.newCheck('y', 'sizeRange') },
            setupFn                                         : function (trigger){
                var data                                    = trigger.data;
                checkSizeRange( data, 'y' );
                if( data.block ){
                    var $block                              = aRD.block.find(data.block);
                    if( $block.length ){
                        data.$blockEl                       = $block;
                        trigger.addEvent('aoBlockShow', $block);
                    }
                }
                trigger.addEvent(['scroll', 'load'], aRD.$w);
                trigger.addCheck(inviewCheck);
            }
        }, false);

        var scrollCheckBoth                                 = function ($el, data, scroll){
                var
                    offsFrom                                = data.y.from ? aRD.heightToType($el, $.extend({}, data.y.from), 'px').value : 0,
                    offsTo                                  = data.y.to ? aRD.heightToType($el, $.extend({}, data.y.to), 'px').value : offsFrom
                ;
                if( data.$blockEl ){
                    var tmp                                 = data.$blockEl.offset().top;
                    offsFrom                                += tmp;
                    offsTo                                  += tmp;
                }
                return (data.previous < offsFrom || data.previous > offsTo ) && scroll >= offsFrom && scroll <= offsTo;
            },
            scrollCheckFrom                                 = function ($el, data, scroll){
                var offs                                    = data.y.from ? aRD.heightToType($el, $.extend({}, data.y.from), 'px').value : 0;
                if( data.$blockEl ){
                    offs                                    += data.$blockEl.offset().top;
                }
                return data.previous < scroll && data.previous < offs && offs <= scroll;
            },
            scrollCheckTo                                   = function ($el, data, scroll){
                var offs                                    = data.y.to ? aRD.heightToType($el, $.extend({}, data.y.to), 'px').value : 0;
                if( data.$blockEl ){
                    offs                                    += data.$blockEl.offset().top;
                }
                return data.previous > scroll && data.previous > offs && offs >= scroll;
            },
            scrollCheck                                     = function (trigger){
                var data                                    = trigger.data;
                if( data.$blockEl && data.$blockEl.is(':hidden') ){
                    return false;
                }
                var
                    scroll                                  = aRD.$w.scrollTop(),
                    ret                                     = data.extraCheck(data.$blockEl || 'page', data, scroll)
                ;
                data.previous                               = scroll;
                return ret;
            }
        ;
        provideBlockTriggerType('scroll', {
            properties                                      : [
                { checks                                        : aRD.parser.newCheck('y', 'sizeRange') }
            ],
            setupFn                                         : function (trigger){
                var data                                    = trigger.data;
                if( data.block ){
                    var $block                              = aRD.block.find(data.block);
                    if( $block.length ){
                        data.$blockEl                       = $block;
                        trigger.addEvent('aoBlockShow', $block);
                    }
                }
                if( !data.y || !(data.y.from || data.y.to) ){
                    if( data.$blockEl ){
                        data.y                              = {
                            from                            : {
                                value                           : 0,
                                type                            : 'px'
                            }
                        };
                    }else{
                        data.disabled                       = true;
                        return data;
                    }
                }
                data.previous                               = -1;

                if( data.y.from && data.y.to ){
                    data.extraCheck                         = scrollCheckBoth;
                }else{
                    data.extraCheck                         = data.y.from ? scrollCheckFrom : scrollCheckTo;
                }

                trigger.addEvent(['scroll', 'load'], aRD.$w);
                trigger.addCheck(scrollCheck);
            }
        }, false);

        var blockActionCheck                                = function (trigger, event, eProps){
                var
                    action                                  = eProps && eProps.action ? eProps.action : false, //aoShow
                    oAction                                 = trigger.data.action || false //false
                ;
                return !!( !oAction || action === oAction || (oAction === 'none' && !action) );
            },
            blockSetupFn                                    = function (trigger){
                var data                                    = trigger.data;
                if( data.block ){
                    trigger.addEvent(data.eName + (data.block === 'any' ? '__gl' : data.block), aRD.$doc, blockActionCheck);
                }else{
                    trigger.addEvent(data.eName, data.$el, blockActionCheck);
                }
            }
        ;
        provideBlockTriggerType('blockhide', {
            data                                            : { eName : 'aoBlockHide' },
            setupFn                                         : blockSetupFn
        });
        provideBlockTriggerType('blockshow', {
            data                                            : { eName : 'aoBlockShow' },
            setupFn                                         : blockSetupFn
        });
        provideBlockTriggerType('blockprehide', {
            data                                            : { eName : 'aoBlockPreHide' },
            setupFn                                         : blockSetupFn
        });
        provideBlockTriggerType('blockpreshow', {
            data                                            : { eName : 'aoBlockPreShow' },
            setupFn                                         : blockSetupFn
        });

    /* extending aRunD */
    aRD.canFireOn                                           = true;
    aRD.trigger                                             = {
        new                                                 : newTrigger,
        type                                                : provideTriggerType,
        blockType                                           : provideBlockTriggerType,
        hasType                                             : function (name){
            return !!trList[name];
        }
    };

    $.fn.aoCancelFireOn                                     = function (name){
        if( !name || !aRD.hasElements(this, "aRunD - FireOn: cancel - Nothing selected.") ){
            return this;
        }
        $(this).each(function (i, $el){
            $el                                     = $($el);
            if( $el.data('aoFOE' + name) ){
                var foe                             = $el.data('aoFOE' + name);
                foe.cancel();
            }
        });
        return this;
    };
    $.fn.aoAddFireOn                                        = function (name, opts, fn){
        if( !aRD.hasElements(this, "aRunD - FireOn: add - Nothing selected.") ){
            return this;
        }
        $(this).each(function (i, el){
            var $el                                         = $(el),
                data
            ;
            if( typeof opts === 'object' ){
                data                                        = opts;
            }else{
                var oData                                   = $el.data('ao' + aRD.ucfirst(name) + 'On');
                if( oData ){
                    data                                    = dataParser.parse(oData);
                }
            }
            if( !data ){
                return;
            }
            var dName                                       = 'aoFOE' + name,
                foe                                         = $el.data(dName)
            ;
            if( !foe ){
                foe                                         = new FireOn($el, fn);
                $el.data(dName, foe);
            }
            foe.add(data);
        });
        return this;
    };

    $.fn.aoAddShowOn                                        = function (opts, force, action){
        if( !aRD.hasElements(this, "aRunD - FireOn: add showOn - Nothing selected.") ){
            return this;
        }
        $(this)
            .aoAddFireOn('show', opts, function (el){
                var $el                                     = $(el);
                if( $el.is('[data-ao-template]') ){
                    aRD.block.triggerToggle($el, $el.data('aoTemplate'), true, 'popup');
                }else{
                    aRD.block.show($el, action || 'aoShowOn', force);
                }
            })
        ;
        return this;
    };
    $.fn.aoAddHideOn                                        = function (opts){
        if( !aRD.hasElements(this, "aRunD - FireOn: add hideOn - Nothing selected.") ){
            return this;
        }
        $(this)
            .aoAddFireOn('hide', opts, function (el){
                aRD.block.hide($(el), 'aoHideOn');
            })
        ;
        return this;
    };

    aRD.pushFlist('init', function ($container, findFn){
        $container[findFn]('[data-ao-show-on]').aoAddShowOn();
        $container[findFn]('[data-ao-hide-on]').aoAddHideOn();
    });
}));
