/*! aRund v.1.7.3 - 2017-01-20 */

/* global aRunD */
(function(aRD){
    var
        _lazyIds                                    = {},
        FireOn                                      = function($el, fn, runOnce){
            var context                             = this;
            context.dfds                            = {};
            context.cookies                         = {};
            context.fn                              = typeof(fn) === 'function' ? fn : function(){ return fn; };
            context.executed                        = false;
            context.runOnce                         = !!runOnce;
            context.$el                             = jQuery($el)
                .on('destroyed', function(){
                    context.destroy();
                    context                         = null;
                })
            ;
        },
        _fromCollection                             = function(el, name, params, collections){
            var _collection                         = jQuery.isArray(collections) ? collections : collections ? [collections] : ['default'];
            for (var i = 0; i < _collection.length; i++) {
                if( _fireOnCollections[ _collection[i] ][name] ){
                    return _fireOnCollections[ _collection[i] ][name](el, params);
                }
            }
            if( typeof(params) === 'string' ){
                var
                    temp                            = params.split(' '),
                    first                           = temp[0]
                ;
                for (i = 0; i < _collection.length; i++) {
                    if( _fireOnCollections[ _collection[i] ][first] ){
                        return _fireOnCollections[ _collection[i] ][first](el, temp.slice(1).join(" "));
                    }
                }
            }
            return {disabled : true};
        },
        _fireOnHelpers                              = {
            defaultFn                               : function(params, checks){
                var _checks                         = checks || [];
                _checks.unshift({
                        byCheck : aRD.checks.cookie
                    },
                    {
                        byCheck : aRD.createTypeCheck('delay', 'timeRange')
                    },
                    {
                        byCheck                     : {
                            name                        : 'runOnce',
                            allowed                     : ['once']
                        }
                    },
                    {
                        byCheck                     : [{
                            name                        : 'single',
                            allowed                     : ['single']
                        },{
                            name                        : 'cancel',
                            allowed                     : ['cancel']
                        }]
                    }
                );
                return typeof(params) === 'object' ? params : aRD.getValueFromSettings(params, {
                    type                            : 'datastring',
                    params                          : {
                        list                            : _checks
                    }
                });
            },
            blockFn                                 : function(params, action, checks){
                var _checks                         = [{
                        byCheck                     : {
                            type                        : 'string',
                            name                        : 'block',
                            parse                       : function(value){
                                return value === 'self' ? false : value;
                            }
                }}];
                if( typeof(action) === 'undefined' || action ){
                    _checks.push({ byCheck          : {
                        type                            : 'string',
                        name                            : 'action'
                    }});
                }
                if(jQuery.isArray(checks)){
                    _checks                         = checks.concat(_checks);
                }else if(typeof(checks) === 'object'){
                    _checks.unshift(checks);
                }
                
                return _fireOnHelpers.defaultFn(params, _checks);
            },
            blockEvents                             : function(opts, eName){
                opts.events                         = {};
                if( opts.block ){
                    opts.events[eName + (opts.block === 'any' ? '__gl' : opts.block)] = aRD.$doc;
                }else{
                    opts.events[eName]              = null;
                }
                return opts;
            },
            checkSizeRange                          : function(obj, prop, fillTo){
                if( !(obj[prop] && obj[prop].from ) ){
                    obj[prop]                       = obj[prop] || {};
                    obj[prop].from                  = {
                        value                       : 0,
                        type                        : 'px'
                    };
                }
                if( fillTo && !obj[prop].to ){
                    obj[prop].to                    = {
                        value                       : 100,
                        type                        : '%'
                    };
                }
            }
        },
        _scrollCheckBoth                            = function($el, scroll, opts){
            var
                offsFrom                            = opts.y.from ? aRD.heightToType($el, jQuery.extend({}, opts.y.from), 'px').value : 0,
                offsTo                              = opts.y.to ? aRD.heightToType($el, jQuery.extend({}, opts.y.to), 'px').value : offsFrom
            ;
            if( opts.$blockEl ){
                var tmp                             = opts.$blockEl.offset().top;
                offsFrom                            += tmp;
                offsTo                              += tmp;
            }
            return opts.previous < scroll ?
                opts.previous < offsFrom && offsFrom <= scroll :
                opts.previous > scroll && opts.previous > offsTo && offsTo >= scroll
            ;
        },
        _scrollCheckFrom                            = function($el, scroll, opts){
            var offs                                = opts.y.from ? aRD.heightToType($el, jQuery.extend({}, opts.y.from), 'px').value : 0;
            if( opts.$blockEl ){
                offs                                += opts.$blockEl.offset().top;
            }
            return opts.previous < scroll && opts.previous < offs && offs <= scroll;
        },
        _scrollCheckTo                              = function($el, scroll, opts){
            var offs                                = opts.y.to ? aRD.heightToType($el, jQuery.extend({}, opts.y.to), 'px').value : 0;
            if( opts.$blockEl ){
                offs                                += opts.$blockEl.offset().top;
            }
            return opts.previous > scroll && opts.previous > offs && offs >= scroll;
        },
        _fireOnCollections                          = {
            default                                     : {
                init                                        : function(el, params){
                    var obj                                 = _fireOnHelpers.defaultFn(params, [{
                        byCheck                             : {
                            name                                : 'eventType',
                            allowed                             : ['load', 'ready']
                        }
                    }]);
                    if( obj.eventType === 'load' && !aRD.loaded ){
                        obj.events                          = {
                            load                                : aRD.$w
                        };
                    }else{
                        obj.events                          = {
                            ready                               : aRD.$doc
                        };
                    }
                    return obj;
                },
                inactive                                    : function(el, params){
                    var obj                                 = _fireOnHelpers.defaultFn(params);
                    obj.events                              = {
                        ready                               : aRD.$doc,
                        mousemove                           : aRD.$doc,
                        mousedawn                           : aRD.$doc,
                        mouseup                             : aRD.$doc,
                        keydown                             : aRD.$doc,
                        keyup                               : aRD.$doc,
                        scroll                              : aRD.$doc
                    };
                    return obj;
                },
                leave                                       : function(el, params){
                    var obj                                 = _fireOnHelpers.blockFn(params, false),
                        $el                                 = jQuery(el)
                    ;
                    switch( obj.block ){
                        case 'window':
                            obj.checkFn                     = function(e){
                                return e.clientY <= 0;
                            };
                            obj.events                      = {
                                mouseleave                  : aRD.$doc
                            };
                            break;
                        case 'page':
                            obj.events                      = {
                                mouseleave                  : aRD.$doc
                            };
                            break;
                        default:
                            var $block                      = aRD.findBlock(obj.block);
                            obj.events                      = {
                                mouseleave                  : $block.length ? $block : $el
                            };
                            break;
                    }
                    
                    return obj;
                },
                mouseat                                     : function(el, params){
                    var obj                                 = _fireOnHelpers.blockFn(params, false, [
                            {byCheck : aRD.createTypeCheck('y', 'sizeRange')},
                            {byCheck : aRD.createTypeCheck('x', 'sizeRange')}
                        ])
                    ;
                    obj.events                              = {
                        mousemove                           : aRD.$doc,
                        mouseleave                          : aRD.$doc
                    };
                    _fireOnHelpers.checkSizeRange( obj, 'y', true );
                    _fireOnHelpers.checkSizeRange( obj, 'x', true );
                    obj.doCheck                             = function(opts, offsX, offsY, width, height){
                        return (!opts.y || (
                                (!opts.y.from || aRD.fixSizeValue(opts.y.from, height) <= offsY) &&
                                (!opts.y.to || aRD.fixSizeValue(opts.y.to, height) >= offsY)
                            )) &&
                            (!opts.x || (
                                (!opts.x.from || aRD.fixSizeValue(opts.x.from, width) <= offsX) &&
                                (!opts.x.to || aRD.fixSizeValue(opts.x.to, width) >= offsX)
                            ))
                        ;
                    };
                    switch( obj.block ){
                        case 'page':
                            obj.mouseinCheck                = function(e, opts){
                                var
                                    size                        = aRD.getContentSize(),
                                    offs                        = opts.$parent.offset(),
                                    offsY                       = e.pageY - offs.top,
                                    offsX                       = e.pageX - offs.left
                                ;
                                return obj.doCheck(opts, offsX, offsY, size.width, size.height);
                            };
                            break;
                        default:
                            var $block                      = aRD.findBlock(obj.block);
                            obj.$parent                     = $block.length ? $block : jQuery(el);
                            obj.mouseinCheck                = function(e, opts){
                                if( opts.$parent.is(':hidden') ){
                                    return false;
                                }
                                var
                                    height                      = opts.y ? opts.$parent.innerHeight() : null,
                                    width                       = opts.x ? opts.$parent.innerWidth() : null,
                                    offs                        = opts.$parent.offset(),
                                    offsY                       = e.pageY - offs.top,
                                    offsX                       = e.pageX - offs.left
                                ;
                                return obj.doCheck(opts, offsX, offsY, width, height);
                            };
                            break;
                    }

                    obj.checkFn                             = function(e, params, opts){
                        var check                           = opts.mouseinCheck(e, opts);
                        if( opts.mousein !== check ){
                            opts.mousein = check;
                            return opts.mousein;
                        }
                        return false;
                    };
                    
                    return obj;
                },
                inview                                      : function(el, params){
                    var obj                                 = _fireOnHelpers.blockFn(params, false, {byCheck : aRD.createTypeCheck('y', 'sizeRange')});
                    obj.events                              = {
                        scroll                              : aRD.$w,
                        load                                : aRD.$w
                    };
                    _fireOnHelpers.checkSizeRange( obj, 'y' );
                    if( obj.block ){
                        var $block                          = aRD.findBlock(obj.block);
                        if( $block.length ){
                            obj.$blockEl                    = $block;
                            obj.events.aoBlockShow          = $block;
                        }
                    }

                    obj.checkFn                             = function(e, params, opts){
                        if( opts.$blockEl && opts.$blockEl.is(':hidden') ){
                            return false;
                        }
                        var
                            $el                             = opts.$blockEl || aRD.$w,
                            offsFrom                        = aRD.heightToType($el, jQuery.extend({}, opts.y.from), 'px').value,
                            offsTo                          = opts.y.to ? aRD.heightToType($el, jQuery.extend({}, opts.y.to), 'px').value : offsFrom,
                            wSize                           = aRD.getWindowSize(),
                            scroll                          = aRD.$w.scrollTop(),
                            scrollTo                        = aRD.$w.scrollTop() + wSize.height,
                            ret                             = false
                        ;
                        if( opts.$blockEl ){
                            var tmp                         = $el.offset().top;
                            offsFrom                        += tmp;
                            offsTo                          += tmp;
                        }
                        if( opts.crossed ){
                            if( scrollTo <= offsFrom || scroll > offsTo){
                                opts.crossed                = false;
                            }
                        }else if( (scroll <= offsFrom && scrollTo >= offsTo) || (scroll >= offsFrom && scrollTo <= offsTo) ){
                            opts.crossed = ret              = true;
                        }
                        return ret;
                    };
                    
                    return obj;
                },
                scroll                                      : function(el, params){
                    var obj                                 = _fireOnHelpers.blockFn(params, false, {byCheck : aRD.createTypeCheck('y', 'sizeRange')});
                    obj.events                              = {
                        scroll                              : aRD.$w,
                        load                                : aRD.$w
                    };
                    if( obj.block ){
                        var $block                          = aRD.findBlock(obj.block);
                        if( $block.length ){
                            obj.$blockEl                    = $block;
                            obj.events.aoBlockShow          = $block;
                        }
                    }
                    if( !obj.y || !(obj.y.from || obj.y.to) ){
                        if( obj.$blockEl ){
                            obj.y                           = {
                                from                        : {
                                    value                       : 0,
                                    type                        : 'px'
                                }
                            };
                        }else{
                            obj.disabled                    = true;
                            return obj;
                        }
                    }
                    obj.previous                            = -1;

                    if( obj.y.from && obj.y.to ){
                        obj._retFn                          = _scrollCheckBoth;
                    }else{
                        obj._retFn                          = obj.y.from ? _scrollCheckFrom : _scrollCheckTo;
                    }

                    obj.checkFn                             = function(e, params, opts){
                        if( opts.$blockEl && opts.$blockEl.is(':hidden') ){
                            return false;
                        }
                        var
                            scroll                          = aRD.$w.scrollTop(),
                            ret                             = obj._retFn(opts.$blockEl || aRD.$w, scroll, opts)
                        ;
                        opts.previous                       = scroll;
                        return ret;
                    };
                    
                    return obj;
                },
                blockhide                                   : function(el, params){
                    var obj                                 = _fireOnHelpers.blockFn(params);
                    return _fireOnHelpers.blockEvents(obj, 'aoBlockHide');
                },
                blockshow                                   : function(el, params){
                    var obj                                 = _fireOnHelpers.blockFn(params);
                    return _fireOnHelpers.blockEvents(obj, 'aoBlockShow');
                },
                blockprehide                                : function(el, params){
                    var obj                                 = _fireOnHelpers.blockFn(params);
                    return _fireOnHelpers.blockEvents(obj, 'aoBlockPreHide');
                },
                blockpreshow                                : function(el, params){
                    var obj                                 = _fireOnHelpers.blockFn(params);
                    return _fireOnHelpers.blockEvents(obj, 'aoBlockPreShow');
                }
            }
        }
    ;
    FireOn.prototype                                = {
        add                                         : function(params, collections){
            var context                             = this;
            jQuery.each(params, function(key, opts){
                var name                            = typeof(opts) === 'object' && opts.name ? opts.name : key;
                opts                                = _fromCollection(context.$el, key, opts, collections);
                if( typeof(opts) === 'object' && opts.disabled === true ){
                    return;
                }

                context.remove(name);

                if( opts.rawParams ){
                    jQuery.extend(opts, aRD.getDataFromString(opts.rawParams));
                    opts.rawParams                  = null;
                }
                context.__createDfd(name, opts);
                var runFn                           = function(e, p){
                    var
                        action                      = p && p.action ? p.action : false, //aoShow
                        oAction                     = opts.action || false //false
                    ;
                    if( !aRD.canFireOn || (!context.dfds[name] || context.dfds[name].state() !== 'pending') ||
                        oAction && (action !== oAction || (oAction === 'none' && action)) ||
                        opts.checkFn && !opts.checkFn(e, p, opts) ||
                        (context.cookie && !aRD.checkCookie(context.cookie)) ||
                        (opts.cookie && !aRD.checkCookie(opts.cookie))
                        ){
                        return;
                    }
                    /* cancel all */
                    if( opts.cancel ){
                        context.cancel();
                        return;
                    }
                    /* reset other triggers */
                    if( opts.single ){
                        context.cancel();
                    }

                    if( opts.delay ){
                        var delay                   = opts.delay;
                        if( typeof(delay) === 'object' ){
                            delay                   = aRD.getRangeRandom(delay.from || 0, delay.to);
                            if( !delay || delay < 0 ){
                                delay               = 0;
                            }
                        }

                        if( typeof(delay) !== 'number' || delay < 0 ){
                            delay                   = 0;
                        }
                        if(opts.delayID){
                            clearTimeout(opts.delayID);
                        }
                        opts.delayID                = setTimeout(function(){
                            context.dfds[name].resolve();
                        }, delay);
                    }else{
                        context.dfds[name].resolve();
                    }
                };
                if(opts.events){
                    if( !opts.eventSpace ){
                        opts.eventSpace             = '.fo__' + key + '__' + aRD.randomId();
                    }
                    jQuery.each(opts.events, function(name, $el){
                        if( $el ){
                            if( $el.length ){
                                if( $el === aRD.$doc && name === 'ready' ){
                                    jQuery(runFn);
                                }else{
                                    $el.on(name + opts.eventSpace, runFn);
                                }
                            }
                        }else{
                            context.$el.on(name + opts.eventSpace, runFn);
                        }
                    });
                }else{
                    runFn();
                }
            });
            return context;
        },
        __createDfd                                 : function(name, opts){
            var context                             = this;
            context.dfds[name]                      = jQuery.Deferred()
                .done(function(state){
                    var canExecute                  = !(context.runOnce && context.executed || opts.runOnce && opts.executed);
                    if( state === 'cancel' ){
                        if(opts.delayID){
                            clearTimeout(opts.delayID);
                        }
                    }else if( canExecute ){
                        opts.executed               = true;
                        context.run(name);
                    }
                    opts.delayID                    = null;
                    if( canExecute ){
                        setTimeout(function(){
                            context.__createDfd(name, opts);
                        });
                    }
                })
                .fail(function(){
                    context.__clear(opts);
                    opts = context                  = null;
                })
            ;
            return context;
        },
        __clear                                     : function(opts){
            if(opts.delayID){
                clearTimeout(opts.delayID);
                opts.delayID                        = null;
            }
            if(opts.events){
                var $els                            = jQuery([]).add(this.$el);
                jQuery.each(opts.events, function(name, $el){
                    if( $el && $el.length ){
                        $els                        = $els.add($el);
                    }
                });
                $els.off(opts.eventSpace);
            }
        },
        run                                         : function(name){
            this.executed                           = true;
            this.fn(this.$el, name);
            return this;
        },
        cancel                                      : function(name){
            var context                             = this;
            if( name ){
                if( context.dfds[name] ){
                    context.dfds[name].resolve('cancel');
                }
            }else{
                jQuery.each(context.dfds, function(i, dfd){
                    dfd.resolve('cancel');
                });
            }
        },
        remove                                      : function(name){
            var context                             = this;
            if( name ){
                if( context.dfds[name] ){
                    context.dfds[name].reject();
                }
            }else{
                jQuery.each(context.dfds, function(i, dfd){
                    dfd.reject();
                });
            }
        },
        destroy                                     : function(){
            this.remove();
            this.dfds                               = null;
            this.cookies                            = null;
            this.fn                                 = null;
            this.executed                           = null;
            this.runOnce                            = null;
            this.$el                                = null;
        }
    };

    aRD.canFireOn                                   = true;
    aRD.fireOnHelpers                               = _fireOnHelpers;
    aRD.fireOnCollections                           = _fireOnCollections;

    jQuery.fn.aoAddFireOn                           = function(name, opts, collectionName, fn){
        if( !aRD.hasElements(this, "aRunD - FireOn: add - Nothing selected.") ){
            return this;
        }
        jQuery(this).each(function(i, $el){
            $el                                     = jQuery($el);
            var dName                               = 'aoFOE' + name,
                foe                                 = $el.data(dName)
            ;
            if( !foe ){
                foe                                 = new FireOn($el, fn);
                $el.data(dName, foe);
            }
            foe.add(opts, collectionName);
        });
        return this;
    };
    jQuery.fn.aoCancelFireOn                        = function(name){
        if( !name || !aRD.hasElements(this, "aRunD - FireOn: cancel - Nothing selected.") ){
            return this;
        }
        jQuery(this).each(function(i, $el){
            $el                                     = jQuery($el);
            if( $el.data('aoFOE' + name) ){
                var foe                             = $el.data('aoFOE' + name);
                foe.cancel();
            }
        });
        return this;
    };
    jQuery.fn.aoAddShowOn                           = function(opts, force, action){
        if( !aRD.hasElements(this, "aRunD - FireOn: add showOn - Nothing selected.") ){
            return this;
        }
        jQuery(this)
            .aoAddFireOn('show', opts, false, function(el){
                var $el                             = jQuery(el);
                if( $el.is('[data-ao-template]') ){
                    aRD.triggerToggleBlock($el, $el.data('aoTemplate'), true, 'popup');
                }else{
                    aRD.showBlock($el, action || 'aoShowOn', force);
                }
            })
            .on('aoBlockPreShow', function(){
                jQuery(this).aoCancelFireOn('show');
            })
        ;
        return this;
    };
    jQuery.fn.aoAddHideOn                           = function(opts){
        if( !aRD.hasElements(this, "aRunD - FireOn: add hideOn - Nothing selected.") ){
            return this;
        }
        jQuery(this)
            .aoAddFireOn('hide', opts, false, function(el){
                aRD.hideBlock(jQuery(el), 'aoHideOn');
            })
            .on('aoBlockPreHide', function(){
                jQuery(this).aoCancelFireOn('hide');
            })
        ;
        return this;
    };

    var _inView                                     = function(el, off){
        if (typeof jQuery === "function" && el instanceof jQuery) {
            el = el[0];
        }

        var rect = el.getBoundingClientRect(),
            height = (window.innerHeight || document.documentElement.clientHeight) + off,
            width = (window.innerWidth || document.documentElement.clientWidth) + off
        ;

        return (
            (rect.top <= height || rect.bottom <= height) &&
            (rect.left <= width || rect.right <= width)
        );
    };

    aRD.pushFlist('init', function($container, findFn){
        $container[findFn]('[data-ao-show-on]').each(function(i, el){
            var $el                                 = jQuery(el);
            $el.aoAddShowOn( aRD.fromDataString( $el, 'aoShowOn' ) );
        });
        $container[findFn]('[data-ao-hide-on]').each(function(i, el){
            var $el                                 = jQuery(el);
            $el.aoAddHideOn( aRD.fromDataString( $el, 'aoHideOn' ) );
        });
        $container[findFn]('[data-ao-lazy]:not(.ao-lazy)').each(function(i, el){
            var id                                  = aRD.randomId(_lazyIds),
                $el                                 = jQuery(el),
                fn                                  = function(){
                    if( $el.is(':visible') && _inView($el, 100) ){
                        var src                         = $el.data('aoLazy');
                        jQuery('[data-ao-lazy="' + src + '"]').triggerHandler('aoLazyLoaded');
                        aRD.loadImage(src)
                            .done(function(src){
                                jQuery('[data-ao-lazy="' + src + '"]').attr('src', src);
                            })
                        ;
                    }
                }
            ;
            _lazyIds[id]                            = true;
            aRD.$w.on('DOMContentLoaded.aoLazy_' + id + ' load.aoLazy_' + id + ' resize.aoLazy_' + id + ' scroll.aoLazy_' + id, fn);
            aRD.$doc.on('aoBlockShow.aoLazy_' + id, fn);
            $el.addClass('ao-lazy').on('aoLazyLoaded', function(){
                aRD.$w.off('.aoLazy_' + id);
                aRD.$doc.off('.aoLazy_' + id);
                $el.off('aoLazyLoaded');
                delete _lazyIds[id];
                $el = id = null;
            });
        });
    });
})(aRunD);
