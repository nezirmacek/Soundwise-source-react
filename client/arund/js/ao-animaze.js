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
    var Animaze                                             = function (el){
            var context                                     = this;
            context.current                                 = new TRR(); //current animations
            context.pending                                 = new TRR(); //pending animations
            context.timerName                               = null;
            context._cache                                  = {};
            context._onComplete                             = {};
            context.$el                                     = $(el);
            context.$el.data('aoAnimazeObj', context);
            context.$el.on('destroyed.aoAnimazeDestroy', function (){
                context.destroy();
                context                                     = null;
            });
        },
        getCache                                            = function (context, $el, name){
            if( !(name && typeof(name) === 'string') ){
                return {};
            }
            var dataStr                                     = $el.attr('data-ao-animaze-' + name);
            if( !context._cache[name] || context._cache[name].key !== dataStr ){
                context._cache[name]                        = {
                    key                                     : dataStr,
                    obj                                     : aRD.animation.parse(dataStr)
                };
            }

            return $.extend(true, {}, context._cache[name].obj);
        },
        getAnimations                                       = function (context, keys, asItem, clear, limit){
            var
                checkKeys, inc, name,
                animations                                  = []
            ;
            switch(limit){
                case 'current':
                    inc                                     = { current : true };
                    break;
                case 'pending':
                    inc                                     = { pending : true };
                    break;
                default:
                    inc                                     = {
                        current                             : true,
                        pending                             : true
                    };
                    break;
            }
            if( keys && keys.length ){
                checkKeys                                   = aRD.createKeys(keys);
                for(name in inc){
                    if(inc.hasOwnProperty(name) && inc[name]){
                        animations                          = animations.concat(context[name].getByKeys(checkKeys, asItem, clear));
                    }
                }
            }else{
                for(name in inc){
                    if(inc.hasOwnProperty(name) && inc[name]){
                        animations                          = animations.concat(context[name].getData(asItem, clear));
                    }
                }
            }
            return animations;
        },
        animate                                             = function (context, opts, name){
            if( context.isAnimating(name) ){
                return context;
            }
            if( opts.stopKeys ){
                if( opts.stopKeys.length ){
                    context.stop(opts.stopKeys);
                }
                delete opts.stopKeys;
            }

            var animation                                   = aRD.animation.new(),
                delay                                       = 0,
                onComplete                                  = $.noop
            ;
            if( typeof(opts.delay) !== 'undefined' ){
                delay                                       += aRD.toNumber(opts.delay, 0);
                delete opts.delay;
            }
            if( typeof(opts.extraDelay) !== 'undefined' ){
                delay                                       += aRD.toNumber(opts.extraDelay, 0);
                delete opts.extraDelay;
            }
            if( typeof(opts.onComplete) !== 'undefined' ){
                if( typeof(opts.onComplete) === 'function' ){
                    onComplete                              = opts.onComplete;
                }
                delete opts.onComplete;
            }
            animation.animations(opts);

            if( animation.hasAnimations() ){
                var stopKeys                                = animation.keys();
                if( stopKeys.length ){
                    context.stop(stopKeys);
                }
                var item                                    = {
                    animation                               : animation,
                    delay                                   : delay,
                    onComplete                              : onComplete,
                    data                                    : animation.init(context.$el)
                };
                context.pending.add( item, Date.now() + delay, aRD.createKeys(stopKeys, name) );

                if( !context.timerName ){
                    context.$el.css('transition', 'none').addClass(aRD.css.isAnimated);
                    context.timerName                       = aRD.addTimer(context);
                }
            }

            return context;
        },
        step                                                = function (context, now){
            if( context.destroyed ){
                return;
            }
            var time                                        = now ? now.valueOf() : Date.now();
            context.pending.getUpTo(time, function (item){
                item.data.last                              = time;
                item.data.pass                              = 0;
                context.current.add(item.data, item.time, item.keys);
            }, true);
            var cssList                                     = [],
                css
            ;
            context.current.each(function (item){
                item.data.pass                              += time - item.data.last;
                item.data.last                              = time;
                css                                         = item.data.animation.step( context.$el, item.data.data, item.data.pass );
                if( css ){
                    cssList                                 = cssList.concat(css);
                }
                if( !item.data.data.animationsLength ){
                    if( !context.destroyed ){
                        setTimeout(function (){
                            if( !context.destroyed ){
                                item.data.onComplete(context.$el);
                            }
                        });
                    }
                    context.current.remove(item.id);
                }
            });
            if( cssList.length ){
                aRD.setCss( context.$el, jQuery.extend.apply({}, cssList) );
            }
        }
    ;
    Animaze.prototype                                       = {
        destroy                                             : function (){
            this.stop();
            this.$el.data('aoAnimazeObj', null);
            this.destroyed                                  = true;
            this.$el                                        = $([]);
        },
        getAnimations                                       : function (keys){
            return getAnimations(this, keys);
        },
        isAnimating                                         : function (keys){
            return !!getAnimations(this, keys).length;
        },
        animate                                             : function (opts, name, def, triggerSub){
            if( this.destroyed ){
                return this;
            }
            var
                dataName                                    = name,
                props                                       = opts
            ;
            if( typeof(opts) === 'string' ){
                dataName                                    = opts;
                props                                       = false;
            }
            if( !(props && props.force) ){
                props                                       = $.extend({}, def, getCache(this, this.$el, dataName), props);
            }
            if( typeof(triggerSub) === 'undefined' || triggerSub ){
                this.triggerSub('animated');
                if( dataName && typeof(dataName) === 'string' ){
                    this.triggerSub(dataName);
                }
            }

            return animate(this, props, dataName);
        },
        triggerSub                                          : function (name, selfTrigger){
            var $els                                        = this.$el.find('[data-ao-animaze-on-' + name + ']');
            if( (typeof(selfTrigger) === 'undefined' || selfTrigger) && this.$el.is('[data-ao-animaze-on-' + name + ']') ){
                $els                                        = $els.add(this.$el);
            }
            if( $els.length ){
                $els.aoAnimaze({
                    extraDelay                              : 10
                }, 'on-' + name, false, false);
            }
            return this;
        },
        stop                                                : function (keys){
            var context                                     = this,
                cssList                                     = [],
                css
            ;
            getAnimations(context, keys, function (item){
                css                                         = item.data.animation.stop(context.$el, item.data.data);
                if( css ){
                    cssList.push(css);
                }
            }, true);
            if( cssList.length ){
                aRD.setCss( context.$el, $.extend.apply({}, cssList) );
            }
            return context.check();
        },
        check                                               : function (){
            if( this.destroyed || !(this.current.length || this.pending.length) ){
                if( this.timerName ){
                    aRD.removeTimer(this.timerName);
                    this.timerName                          = null;
                }
                this.$el.css('transition', '').removeClass(aRD.css.isAnimated);
            }
            return this;
        },
        finish                                              : function (keys){
            var context                                     = this,
                cssList                                     = [],
                css
            ;
            getAnimations(context, keys, function (item){
                if( !context.destroyed ){
                    setTimeout(function (){
                        item.data.onComplete(context.$el);
                    });
                    css                                     = item.data.animation.finish(context.$el, item.data.data, item.data.pass || 0) || [];
                    if( css.length ){
                        cssList                             = cssList.concat(css);
                    }
                }
            }, true);
            if( cssList.length ){
                aRD.setCss( context.$el, $.extend.apply({}, cssList) );
            }
            context.check();
            return context;
        },
        run                                                 : function (now){
            step(this, now);
            this.check();
            return this;
        }
    };
    Animaze.prototype.trigger                               = Animaze.prototype.run;

    aRD.css.isAnimated                                      = 'ao-is-animated';
    aRD.getAniObj                                           = function (el){
        var $el                                             = jQuery(el);
        return ($el.data('aoAnimazeObj') || new Animaze($el));
    };
    aRD.animaze                                             = function (el, opts, name, def, triggerSub){
        return aRD.getAniObj(el).animate(opts, name, def, triggerSub);
    };
    aRD.animazeStop                                         = function (el, keys){
        var ani                                             = jQuery(el).data('aoAnimazeObj');
        if( ani && (ani instanceof Animaze) ){
            ani.stop(keys);
        }
    };
    aRD.animazeFinish                                       = function (el, keys){
        var ani                                             = jQuery(el).data('aoAnimazeObj');
        if( ani && (ani instanceof Animaze) ){
            ani.finish(keys);
        }
    };

    jQuery.fn.aoAnimaze                                     = function (opts, name, def, triggerSub){
        if( !aRD.hasElements(this, "aRunD - Animaze: Nothing selected.") ){
            return this;
        }
        jQuery(this).each(function (i, el){
            aRD.animaze(el, opts, name, def, triggerSub);
        });
        return this;
    };

    jQuery.fn.aoAnimazeStop                                 = function (keys){
        jQuery(this).each(function (i, el){
            aRD.animazeStop(el, keys);
        });
        return this;
    };

    jQuery.fn.aoAnimazeFinish                               = function (keys){
        jQuery(this).each(function (i, el){
            aRD.animazeFinish(el, keys);
        });
        return this;
    };

    jQuery.fn.aoHasAnimation                                = function (keys){
        if( !aRD.hasElements(this, "aRunD - Animaze: Nothing selected.") ){
            return this;
        }
        var $el                                             = jQuery(this[0]),
            ani                                             = $el.data('aoAnimazeObj')
        ;
        if( !ani ){
            return false;
        }
        return !!ani.getAnimations(keys).length;
    };

    jQuery.fn.aoShow                                        = function (opts, onComplete, subAction, def){
        if( !aRD.hasElements(this, "aRunD - Animaze: show - Nothing selected.") ){
            return this;
        }
        var obj                                             = {
            show                                            : true,
            stopKeys                                        : 'hide',
            onComplete                                      : onComplete
        };
        if( subAction && typeof(subAction) === 'string' ){
            obj[subAction]                                  = true;
        }
        jQuery(this).aoAnimaze(opts, 'show', jQuery.extend(obj, def));
        return this;
    };

    jQuery.fn.aoHide                                        = function (opts, onComplete){
        if( !aRD.hasElements(this, "aRunD - Animaze: hide - Nothing selected.") ){
            return this;
        }
        var obj                                             = {
                hide                                        : true,
                stopKeys                                    : 'show',
                onComplete                                  : onComplete
            }
        ;
        jQuery(this).aoAnimaze(opts, 'hide', obj);
        return this;
    };

    jQuery.fn.aoAnimazeDelayed                              = function (animation, delay){
        var $this                                           = jQuery(this),
            ani                                             = animation || 'resize',
            edelay                                          = aRD.toNumber(delay, 0),
            tName                                           = 'ao_aniElTimeout_' + ani,
            timeout                                         = $this.data(tName)
        ;
        if( timeout ){
            clearTimeout(timeout);
        }
        $this.data(tName, setTimeout(function (){
            $this.data(tName, null);
            $this.aoAnimaze(ani);
        }, edelay) );
        return this;
    };
}));