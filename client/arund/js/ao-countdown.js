/*! aRund v.1.7.3 - 2017-01-20 */

/* global aRunD, moment */

(function(aRD){
    var Countdown                                   = function(el){
            var context                             = this,
                tmp
            ;
            this.$el                                = jQuery(el);
            this.options                            = aRD.fromDataString( this.$el, 'aoCountdown', {
                'nextTiming'                        : 'time'
            } ) || {};
            
            tmp                                     = this.$el.find('[data-ao-counter]');
            this.$counter                           = tmp.length ? tmp : this.$el;

            this
                .setNextTiming(this.options.nextTiming)
                .setTemplate(this.options.template)
                .setRoundType(this.options.roundType)
                .setMinLength(this.options.minLength)
                .setType(this.options.type)
                .setTimeMark(this.options.timeMark)
                .setFormat(this.options.format)
            ;

            
            context.$el
                .data('aoCountdown__obj', context)
                .on('destroyed.aoCountdown aoTimeMarkRemove.aoCountdown', function(){
                    context.destroy();
                })
            ;
            if( typeof this.options.autostart === 'undefined' || this.options.autostart ){
                this.start();
            }
        },
        _templateInsert                             = function(){
            var $prev                               = this.$val,
                context                             = this;
            aRD.createFromTemplate(this.$el, this.template, this, this.$counter)
                .done(function($block){
                    context.$val                    = $block;
                    if( $prev ){
                        $prev.aoAnimaze(null, 'counterhide', {
                            hide                    : true,
                            stopKeys                : 'countershow',
                            onComplete              : function($el) {
                                $el.remove();
                            }
                        });
                    }
                    context.$val.aoAnimaze(null, 'countershow', {
                        show                        : true,
                        stopKeys                    : 'counterhide',
                    });
                })
            ;
            return this;
        },
        _simpleInsert                               = function(){
            this.$counter.html( this.str );
            return this;
        }
    ;
    Countdown.prototype                             = {
        setNextTiming                               : function(val){
            this.nextTiming                         = aRD.isInt(val) ? val : 0;
            return this;
        },
        setTemplate                                 : function(val){
            var $template                           = jQuery('[data-ao-template="' + val + '"]');
            if( this.$val ){
                this.$val.aoAnimaze(null, 'counterhide', {
                    hide        : true,
                    stopKeys    : 'countershow',
                    onComplete  : function($el) {
                        $el.remove();
                    }
                });
                this.$val                           = null;
            }
            if( $template.length ){
                this.template                       = val;
                this.applyValue                     = _templateInsert;
            }else{
                this.applyValue                     = _simpleInsert;
            }
            return this;
        },
        setRoundType                                : function(val){
            switch( val ){
                case 'round':
                    this.round               = Math.round;
                    break;
                case 'no':
                    this.round               = aRD.returnFirst;
                    break;
                case 'ceil':
                    this.round               = Math.ceil;
                    break;
                default:
                    this.round               = Math.floor;
                    break;
            }
            return this;
        },
        setMinLength                                : function(val){
            this.minLength                          = val;
            this.padLeft                            = val > 0 ? aRD.padLeft : aRD.returnFirst;
            return this;
        },
        setType                                     : function(type){
            switch(type){
                case 'timepass':
                case 'pass':
                    this.prop                       = 'timePass';
                    this.nextOp                     = 1;
                    break;
                //timeleft
                default:
                    this.prop                       = 'timeLeft';
                    this.nextOp                     = -1;
                    break;
            }
            return this;
        },
        setFormat                                   : function(format){
            this.format                             = format;
            switch(format){
                case 'years' :
                case 'months' :
                case 'weeks' :
                case 'days' :
                case 'hours' :
                case 'minutes' :
                case 'seconds' :
                case 'milliseconds' :
                    break;
                default :
                    this.format                     = 'seconds';
                    break;
            }
            this.fullFormat                         = 'as' + aRD.ucfirst(this.format);
            if( this.options.full ){
                this.format                         = this.fullFormat;
            }
            return this;
        },
        setTimeMark                                 : function(val){
            var timeMark                            = null;
            if( val ){
                timeMark                            = aRD.getTimeMark(val);
            }
            if( !(timeMark || this.timeMark) ){
                timeMark                            = aRD.createTimeMark( aRD.randomId(), this.time || moment() );
            }
            if( timeMark ){
                if( this.timeMark ){
                    this.timeMark.removeElement(this.$el);
                }
                this.timeMark                       = timeMark;
                timeMark.addElement(this.$el);
            }
            return this;
        },
        getValue                                    : function(){
            return this.round(this.duration[this.format]());
        },
        checkEnded                                  : function(){
            var val                                 = this.round(this.duration[this.fullFormat]());
            if( val > (val + this.nextOp) && !val){
                this.ended                          = true;
                this.stop();
                if( this.options.hideEnded ){
                    this.$el.aoAnimaze(null, 'counterended', {
                        hide        : true,
                        onComplete  : function($el) {
                            $el.addClass('ao-countdown-ended');
                        }
                    });
                }
            }
            return this;
        },
        trigger                                     : function(){
            var val                                 = this.timeMark[this.prop].asMilliseconds() + this.nextOp * this.nextTiming;
            this.duration                           = moment.duration(val > 0 ? val : 0);
            val                                     = this.getValue();
            if( this.val !== val ){
                this.val                            = val;
                this.str                            = this.padLeft(val, this.minLength, this.options.padStr);
                this.applyValue();
                if( !val ){
                    this.checkEnded();
                }
            }
            return this;
        },
        stop                                        : function(){
            if( this.isRunning ){
                this.isRunning                      = false;
                this.$el.off('.aoCountdownRun');
            }
            return this;
        },
        start                                       : function(){
            if( !this.isRunning && !this.ended ){
                var context                         = this;
                this.isRunning                      = true;
                this.$el.on('aoTimeMarkTick.aoCountdownRun aoTimeMarkChange.aoCountdownRun', function(){
                    context.trigger();
                });
            }
            return this;
        },
        destroy                                     : function(){
            this.timeMark.removeElement(this.$el);
            this.$el.off('.aoCountdown').off('.aoCountdownRun');
            this.$el                                = null;
        }
    };
    aRD.countdown                                   = function($el){
        return $el.data('aoCountdown__obj') || (new Countdown($el));
    };

    jQuery.fn.aoAddCountdownStartOn                 = function(opts){
        if( !aRD.hasElements(this, "aRunD - FireOn: add CountdownStartOn - Nothing selected.") ){
            return this;
        }
        jQuery(this).aoAddFireOn('CountdownStart', opts, false, function(el){
            aRD.countdown(jQuery(el)).start();
        });
        return this;
    };

    jQuery.fn.aoAddCountdownStopOn                 = function(opts){
        if( !aRD.hasElements(this, "aRunD - FireOn: add CountdownStopOn - Nothing selected.") ){
            return this;
        }
        jQuery(this).aoAddFireOn('CountdownStop', opts, false, function(el){
            aRD.countdown(jQuery(el)).stop();
        });
        return this;
    };

    aRD.pushFlist('init', function($container, findFn){
        $container[findFn]('[data-ao-countdown]').each(function(i, el){
            aRD.countdown(jQuery(el));
        });
        $container[findFn]('[data-ao-countdown-start-on]').each(function(i, el){
            var $el                                     = jQuery(el);
            $el.aoAddCountdownStartOn( aRD.fromDataString( $el, 'aoCountdownStartOn' ) );
        });
        $container[findFn]('[data-ao-countdown-stop-on]').each(function(i, el){
            var $el                                     = jQuery(el);
            $el.aoAddCountdownStopOn( aRD.fromDataString( $el, 'aoCountdownStopOn' ) );
        });
    });
})(aRunD);