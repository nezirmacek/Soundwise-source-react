/*! aRund v.1.7.5 - 2017-04-02 */

/* global aRunD, tirray: true */

(function (fn) {
    if (typeof jQuery === 'undefined') {
        throw 'tirray requires jQuery to be loaded first';
    }
    fn(jQuery);
}(function ($) {
    tirray                                                  = function (){
        this.clear();
    };
    var removeItem                                          = function (context, id){
            --context.length;
            delete context.items[id];
            return context;
        },
        getData                                             = function (asItem){
            if( typeof(asItem) === 'function' ){
                return asItem;
            }
            return asItem ? function (item){
                return item;
            } : function (item){
                return item.data;
            };
        },
        checkAt                                             = function (at, timeStuck, time, partly){
            if( at[time] && !at[time].length ){
                if( !partly ){
                    var tmp                                 = $.inArray( time, timeStuck );
                    if( tmp > -1 ){
                        timeStuck.splice(tmp, 1);
                    }
                }
                delete at[time];
            }
        },
        resetMinMax                                         = function (context){
            if( context.timeStuck.length ){
                context.minTime                             = context.timeStuck[0];
                context.maxTime                             = context.timeStuck[context.timeStuck.length-1];
            }else{
                context.minTime                             = false;
                context.maxTime                             = false;
            }
        },
        getNearestTimeKey_simple                            = function (timeStuck, time, rev){
            var i;
            for (i = 0; i < timeStuck.length; i++) {
                if( timeStuck[i] > time ){
                    return rev || !i ? i : --i;
                }else if(timeStuck[i] === time){
                    return i;
                }
            }
            return i;
        },
        getNearestTimeKey_mid                               = function (timeStuck, time, rev){
            var start                                       = 0,
                end                                         = timeStuck.length - 1,
                mid
            ;
            while( true ){
                if( start >= end ){
                    return rev ? start : end;
                }
                if( time <= timeStuck[start] ){
                    return time === timeStuck[start] || rev ? start : start - 1;
                }
                if( time >= timeStuck[end] ){
                    return time !== timeStuck[end] && rev ? end + 1 : end;
                }
                mid                                         = Math.ceil((start + end) / 2);
                if( time < timeStuck[mid] ){
                    ++start;
                    end                                     = mid - 1;
                }else if( time > timeStuck[mid] ){
                    --end;
                    start                                   = mid + 1;
                }else{
                    return mid;
                }
            }
        },
        getNearestTimeKey_smart                             = function (timeStuck, time, rev){
            var start                                       = 0,
                end                                         = timeStuck.length - 1,
                mid
            ;
            while( true ){
                if( start >= end ){
                    return rev ? start : end;
                }
                if( time <= timeStuck[start] ){
                    return time === timeStuck[start] || rev ? start : start - 1;
                }
                if( time >= timeStuck[end] ){
                    return time !== timeStuck[end] && rev ? end + 1 : end;
                }
                mid                                         = start + Math.ceil( (time - timeStuck[start]) / (timeStuck[end] - timeStuck[start]) * (end - start) );
                if( time < timeStuck[mid] ){
                    ++start;
                    end                                     = mid - 1;
                }else if( time > timeStuck[mid] ){
                    --end;
                    start                                   = mid + 1;
                }else{
                    return mid;
                }
            }
        },
        getNearestTimeKey                                   = function (timeStuck, time, rev){
            if( timeStuck.length > 20 ){
                return getNearestTimeKey_smart(timeStuck, time, rev);
            }else if( timeStuck.length > 10 ){
                return getNearestTimeKey_mid(timeStuck, time, rev);
            }else{
                return getNearestTimeKey_simple(timeStuck, time, rev);
            }
        }
    ;
    tirray.prototype                                        = {
        clear                                               : function (){
            this.length                                     = 0;
            this.items                                      = {};
            this.timeStuck                                  = [];
            this.at                                         = {};
            this.keys                                       = {};
            this.minTime                                    = false;
            this.maxTime                                    = false;
            return this;
        },
        remove                                              : function (id){
            if( this.items[id] ){
                var ind                                     = $.inArray(id, this.at[this.items[id].time]);
                if( ind !== -1 ){
                    this.at[this.items[id].time].splice(ind, 1);
                    checkAt(this.at, this.timeStuck, this.items[id].time);
                }
                removeItem(this, id);
                resetMinMax(this);
            }
            return this;
        },
        each                                                : function (fn){
            if( this.length && typeof fn === 'function' ){
                for(var time in this.timeStuck){
                    var ids                                 = this.at[this.timeStuck[time]];
                    if( ids && ids.length ){
                        for (var i = 0; i < ids.length; i++) {
                            if( fn(this.items[ids[i]]) === false ){
                                return this;
                            }
                        }
                    }
                }
            }
            return this;
        },
        getByKeys                                           : function (keys, asItem, clear){
            var ret                                         = [],
                checkTime                                   = [],
                getDataFn                                   = getData(asItem),
                itemIds                                     = [],
                checkKeys, ind, i, j, tKeys
            ;
            if( this.length && keys && keys.length ){
                if( typeof(keys) === 'string' ){
                    checkKeys                               = [keys];
                }else{
                    checkKeys                               = keys;
                }

                for (i = 0; i < checkKeys.length; i++) {
                    if( this.keys[checkKeys[i]] ){
                        tKeys                               = [];
                        for (j = 0; j < this.keys[checkKeys[i]].length; j++) {
                            if( this.items[this.keys[checkKeys[i]][j]] ){
                                tKeys.push(this.keys[checkKeys[i]][j]);
                                itemIds.push(this.keys[checkKeys[i]][j]);
                                ret.push(getDataFn(this.items[this.keys[checkKeys[i]][j]]));
                            }
                        }
                        if( !tKeys.length ){
                            delete this.keys[checkKeys[i]];
                        }else{
                            this.keys[checkKeys[i]]         = tKeys;
                        }
                    }
                }
            }
            if( clear && (itemIds.length || checkTime.length) ){
                for (i = 0; i < itemIds.length; i++) {
                    ind                                     = this.items[itemIds[i]] ? $.inArray(itemIds[i], this.at[this.items[itemIds[i]].time]) : -1;
                    if( ind !== -1 ){
                        checkTime.push(this.items[itemIds[i]].time);
                        this.at[this.items[itemIds[i]].time].splice(ind, 1);
                    }
                    removeItem(this, itemIds[i]);
                }
                for (i = 0; i < checkTime.length; i++) {
                    checkAt(this.at, this.timeStuck, checkTime[i]);
                }
                resetMinMax(this);
            }
            return ret;
        },
        getByTime                                           : function (time, asItem, clear, _clearPartly){
            if( !this.length ){
                return [];
            }
            if( !$.isArray(time) ){
                time                                        = [time];
            }

            var ret                                         = [],
                itemIds                                     = [],
                getDataFn                                   = getData(asItem)
            ;
            for (var i = 0; i < time.length; i++) {
                if( this.at[time[i]] ){
                    for (var j = 0; j < this.at[time[i]].length; j++) {
                        if( this.items[this.at[time[i]][j]] ){
                            itemIds.push(this.at[time[i]][j]);
                            ret.push(getDataFn(this.items[this.at[time[i]][j]]));
                        }
                    }
                    if( clear ){
                        this.at[time[i]]                    = [];
                    }
                    checkAt(this.at, this.timeStuck, time[i], _clearPartly);
                }
            }
            if( clear ){
                for (i = 0; i < itemIds.length; i++) {
                    removeItem(this, itemIds[i]);
                }
                resetMinMax(this);
            }
            return ret;
        },
        getData                                             : function (asItem, clear){
            if( !this.length ){
                return [];
            }
            var ret                                         = [],
                getDataFn                                   = getData(asItem)
            ;
            $.each(this.items, function (t, item){
                ret.push( getDataFn(item) );
            });
            if( clear ){
                this.clear();
            }
            return ret;
        },
        getByPeriod                                         : function (from, to, asItem, clear){
            if( !this.length ){
                return [];
            }
            var
                start                                       = from || from === 0 ? getNearestTimeKey(this.timeStuck, from, true) : 0,
                end                                         = to || to === 0 ? getNearestTimeKey(this.timeStuck, to) : this.timeStuck.length - 1,
                time                                        = this.timeStuck.slice(start, end + 1),
                ret                                         = []
            ;
            if( time.length ){
                ret                                         = this.getByTime(time, asItem, clear, clear);
                if( clear ){
                    this.timeStuck.splice(start, time.length);
                    resetMinMax(this);
                }
            }
            return ret;
        },
        getUpTo                                             : function (time, asItem, clear){
            if( !this.length ){
                return [];
            }
            var ret                                         = [];
            if( this.maxTime < time ){
                ret                                         = this.getData(asItem, clear);
            }else if( this.minTime < time ){
                ret                                         = this.getByPeriod(false, time, asItem, clear);
            }
            return ret;
        },
        getUpToNow                                          : function (equal, asItem, clear){
            return this.upTo(Date.now() - ( equal ? 0 : 1), asItem, clear);
        },
        add                                                 : function (data, time, keys, id){
            var item                                        = {
                    id                                      : id || aRunD.randomId( this.items ),
                    data                                    : data,
                    time                                    : aRunD.isInt(time) ? time : Date.now()
                }
            ;

            if( !$.isArray(keys) ){
                keys                                        = keys && typeof(keys) === 'string' ? [keys] : [];
            }
            item.keys                                       = keys;



            this.items[item.id]                             = item;
            for (var i = 0; i < keys.length; i++) {
                if( !this.keys[ keys[i] ] ){
                    this.keys[ keys[i] ]                    = [];
                }
                this.keys[ keys[i] ].push(item.id);
            }

            var hasTime                                     = true;
            if( !this.at[item.time] ){
                hasTime                                     = false;
                this.at[item.time]                          = [];
            }
            if( this.minTime === false || this.minTime > item.time ){
                this.minTime                                = item.time;
                if( !hasTime ){
                    this.timeStuck.unshift(item.time);
                    hasTime                                 = true;
                }
            }
            if( this.minTime === false || this.maxTime < item.time ){
                this.maxTime                                = item.time;
                if( !hasTime ){
                    this.timeStuck.push(item.time);
                    hasTime                                 = true;
                }
            }

            if( !hasTime ){
                this.timeStuck.splice(getNearestTimeKey(this.timeStuck, item.time) + 1, 0, item.time);
            }
            
            this.at[item.time].push(item.id);
            ++this.length;

            return this;
        },
        getKeys                                             : function (){
            var keys                                        = [];
            for (var key in this.keys) {
                keys.push(key);
            }
            return keys;
        }
    };
}));