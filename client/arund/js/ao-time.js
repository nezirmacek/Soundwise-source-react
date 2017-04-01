/*! aRund v.1.7.3 - 2017-01-20 */

/* global aRunD, moment */

(function(aRD){
    var _timersList                                 = {},
        _timersCount                                = 0,
        _timeout                                    = false,
        _timeMarks                                  = {},
        _toTime                                     = function(value, type){
            if( typeof(value) === 'number' ){
                switch(type){
                    case 's'    :
                        value                       = value * 1000;
                        break;
                    case 'm'    :
                        value                       = value * 60000;
                        break;
                    case 'h'    :
                        value                       = value * 3600000;
                        break;
                    case 'd'    :
                        value                       = value * 86400000;
                        break;
                    case 'w'    :
                        value                       = value * 604800000;
                        break;
                }
            }
            
            return value;
        },
        _TTime                                      = {
            regStr                                  : "(" + aRD.types.number.regStr + ")([smh]?)",
            check                                   : function(value){
                var type                            = typeof(value);
                return type === 'number' || ( type === 'string' && _TTime._reg.test(value) );
            },
            parse                                   : function(value){
                var type                            = typeof(value),
                    ret                             = 0
                ;
                if( type === 'number' ){
                    return value;
                }
                if( type === 'string' ){
                    var matches                     = _TTime._reg.exec(value);
                    if( matches && matches.length > 1 ){
                        ret                         = aRD.toNumber(matches[1], ret);
                        if( matches.length > 3 ){
                            ret                     = _toTime(ret, matches[3]);
                        }
                    }
                }
                return ret;
            }
        },
        _TTimeRange                             = {
            _reg                                    : new RegExp( aRD.makeRangeRegStr(_TTime.regStr) ),
            check                                   : function(value){
                var type                            = typeof(value);
                return type === 'number' || ( value && type === 'string' && _TTimeRange._reg.test(value) );
            },
            parse                                   : function(value){
                return aRD.parseRange(_TTimeRange._reg, value, 5, function(all, number, rest, type){
                    return _toTime(aRD.toNumber(arguments.length > 1 ? number : all, null), type);
                });
            }
        },
        _getMoment                                  = function(value, format, useStrict){
            if( typeof(moment) === 'undefined' ){
                aRunD.log('Please include moment.js!');
                return null;
            }
            try{
                return moment(value, format, useStrict);
            }catch(e){
                aRunD.log('getMoment error:');
                aRunD.log(e);
                return null;
            }
        },
        _toDate                                     = function(str, parseFormats, useStrict, date){
            if( typeof(moment) === 'undefined' ){
                aRunD.log('Please include moment.js!');
                return null;
            }
            if( str === null ){
                return null;
            }
            if( typeof(str) === 'object' && str.isValid && str.isValid() ){
                return str;
            }
            try{
                if( str === 'today' ){
                    str                             = moment(new Date()).startOf('day');
                }else if( str === 'tomorrow' ){
                    str                             = moment(new Date()).startOf('day').add(1, 'day');
                }else if( jQuery.inArray(str.charAt(0), ['-', '+']) !== -1 ){
                    date                            = date || moment(new Date()).startOf('day');
                    switch( str.charAt(0) ){
                        case '+'                    :
                            str                     = date.add( parseInt(str), str.split(' ').pop() );
                            break;
                        case '-'                    :
                            str                     = date.subtract( parseInt(str), str.split(' ').pop() );
                            break;
                    }
                }else{
                    useStrict                       = useStrict || false;
                    str                             = moment(str, parseFormats, useStrict );
                }
            }catch(e){
                aRunD.log('toDate error:');
                aRunD.log(e);
                return null;
            }
            return str;
        },
        _checkTimeMarks                             = function(){
            if( _timersCount ){
                if( !_timeout ){
                    _runTime();
                }
            }else if( _timeout ){
                clearTimeout(_timeout);
                _timeout                            = false;
            }
        },
        _runTime                                    = function(){
            _timeout                                = setTimeout(function(){
                var now                             = moment();
                for(var name in _timersList){
                    if(_timersList.hasOwnProperty(name)){
                        _timersList[name](now);
                    }
                }
                _timeout                            = false;
                _checkTimeMarks();
            }, 20);
        },
        TimeMark                                    = function(name){
            this.name                               = name;
            this.$els                               = jQuery([]);
            this.time                               = null;
            this.timeLeft                           = null;
            this.timePass                           = null;
            this.now                                = null;
            _timeMarks[name]                        = this;
        }
    ;
    _TTime._reg                                     = new RegExp("^" + _TTime.regStr + "$");

    TimeMark.prototype                              = {
        setTime                                     : function(str){
            this.time                               = _toDate(str);
            if( !(this.time && this.time.isValid()) ){
                if( this.timerName ){
                    aRD.removeTimer(this.timerName);
                    this.timerName                  = null;
                }
            }else if( !this.timerName ){
                this.timerName                      = aRD.addTimer(this);
            }
            return this.trigger()._elsTrigger('aoTimeMarkChange');
        },
        clearDate                                   : function(){
            this.time                               = null;
            return this.trigger()._elsTrigger('aoTimeMarkChange');
        },
        addElement                                  : function($el){
            this.$els                               = this.$els.add($el);
            return this.trigger();
        },
        removeElement                               : function($el){
            this.$els                               = this.$els.not($el);
            return this;
        },
        trigger                                     : function(_now){
            this.now                                = _now || moment();
            this.timeLeft                           = null;
            this.timePass                           = null;

            if( this.time ){
                if( this.now.isBefore( this.time ) ){
                    this.timeLeft                   = moment.duration( this.time.diff(this.now) );
                    this.timePass                   = moment.duration( 0 );
                }else{
                    this.timeLeft                   = moment.duration( 0 );
                    this.timePass                   = moment.duration( this.now.diff(this.time) );
                }
            }
            return this._elsTrigger('aoTimeMarkTick');
        },
        _elsTrigger                                : function(eName){
            var context                             = this;
            if( !this.timerName ){
                return this;
            }
            if( context.$els.length ){
                context.$els.each(function(i, el){
                    jQuery(el).triggerHandler(eName, [context]);
                });
            }
            return this;
        },
        remove                                      : function(){
            this._elsTrigger('aoTimeMarkRemove');
            aRD.removeTimer(this.timerName);
            this.$els                               = null;
            delete _timeMarks[name];
        }
    };
    aRD.getMoment                                   = _getMoment;
    aRD.toDate                                      = _toDate;
    aRD.getTimeMark                                 = function(name){
        return _timeMarks[name] || null;
    };
    aRD.createTimeMark                              = function(name, time){
        var timeMark                                = _timeMarks[name] || new TimeMark(name);
        if( time ){
            timeMark.setTime(time);
        }
        return timeMark;
    };
    aRD.addTimer                                    = function(value){
        var type                                    = typeof(value),
            name                                    = aRD.randomId(_timersList),
            fn
        ;
        switch(type) {
            case 'function':
                fn                                  = value;
                break;
            case 'object':
                if(value.trigger){
                    fn                              = function(now){
                        value.trigger(now);
                    };
                }
                break;
            case 'string':
                fn                                  = function(now){
                    aRD.$doc.trigger(value, [now]);
                };
        }
        if( !fn ){
            return null;
        }
        _timersList[name]                           = fn;
        ++_timersCount;
        _checkTimeMarks();
        return name;
    };
    aRD.removeTimer                                 = function(name){
        if( _timersList[name] ){
            delete _timersList[name];
            --_timersCount;
            _checkTimeMarks();
            return true;
        }
        return false;
    };
    aRD.types.time                                  = _TTime;
    aRD.types.timeRange                             = _TTimeRange;
    aRD.checks.delay                                = aRD.createTypeCheck('delay', 'time');
    aRD.checks.duration                             = aRD.createTypeCheck('duration', 'time');

    aRD.pushFlist('init', function($container, findFn){
        $container[findFn]('[data-ao-timemark]').each(function(i, el){
            var marks                               = aRD.fromDataString( jQuery(el), 'aoTimemark' );
            if(marks){
                for(var name in marks) {
                    if(marks.hasOwnProperty(name)){
                        aRD.createTimeMark(name, marks[name]);
                    }
                }
            }
        });
    });
})(aRunD);