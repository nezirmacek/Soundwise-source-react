/*! aRund v.1.7.3 - 2017-01-20 */

/* global aRunD, tirray: true */

tirray                                              = function(){
    this.clear();
};
tirray.prototype                                    = {
    clear                                           : function(){
        this.length                                 = 0;
        this.items                                  = {};
        this.timeStuck                              = [];
        this.at                                     = {};
        this.keys                                   = {};
        this.minTime                                = false;
        this.maxTime                                = false;
        return this;
    },
    getByKeys                                       : function(keys, asItem, clear){
        var ret                                     = [],
            checkTime                               = [],
            getDataFn                               = this.__getDataFn(asItem),
            itemIds                                 = [],
            checkKeys, ind, i, j, tKeys
        ;
        if( this.length && keys && keys.length ){
            if( typeof(keys) === 'string' ){
                checkKeys                           = [keys];
            }else{
                checkKeys                           = keys;
            }

            for (i = 0; i < checkKeys.length; i++) {
                if( this.keys[checkKeys[i]] ){
                    tKeys                           = [];
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
                        this.keys[checkKeys[i]]     = tKeys;
                    }
                }
            }
        }
        if( clear && (itemIds.length || checkTime.length) ){
            for (i = 0; i < itemIds.length; i++) {
                ind                                 = this.items[itemIds[i]] ? jQuery.inArray(itemIds[i], this.at[this.items[itemIds[i]].time]) : -1;
                if( ind !== -1 ){
                    checkTime.push(this.items[itemIds[i]].time);
                    this.at[this.items[itemIds[i]].time].splice(ind, 1);
                }
                this.__removeItem(itemIds[i], true);
            }
            for (i = 0; i < checkTime.length; i++) {
                this.__checkAt(checkTime[i]);
            }
            this.__resetMinMax();
        }
        return ret;
    },
    getByTime                                       : function(time, asItem, clear, _clearPartly){
        if( !this.length ){
            return [];
        }
        if( !jQuery.isArray(time) ){
            time                                    = [time];
        }

        var ret                                     = [],
            itemIds                                 = [],
            getDataFn                               = this.__getDataFn(asItem)
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
                    this.at[time[i]]                = [];
                }
                this.__checkAt(time[i], _clearPartly);
            }
        }
        if( clear ){
            for (i = 0; i < itemIds.length; i++) {
                this.__removeItem(itemIds[i]);
            }
            this.__resetMinMax();
        }
        return ret;
    },
    getData                                         : function(asItem, clear){
        if( !this.length ){
            return [];
        }
        var ret                                     = [],
            getDataFn                               = this.__getDataFn(asItem)
        ;
        jQuery.each(this.items, function(t, item){
            ret.push( getDataFn(item) );
        });
        if( clear ){
            this.clear();
        }
        return ret;
    },
    getByPeriod                                     : function(from, to, asItem, clear){
        if( !this.length ){
            return [];
        }
        var
            start                                   = from || from === 0 ? this.__getNearestTimeKey(from, true) : 0,
            end                                     = to || to === 0 ? this.__getNearestTimeKey(to) : this.timeStuck.length - 1,
            time                                    = this.timeStuck.slice(start, end + 1),
            ret                                     = []
        ;
        if( time.length ){
            ret                                     = this.getByTime(time, asItem, clear, clear);
            if( clear ){
                this.timeStuck.splice(start, time.length);
                this.__resetMinMax();
            }
        }
        return ret;
    },
    getUpTo                                         : function(time, asItem, clear){
        if( !this.length ){
            return [];
        }
        var ret                                     = [];
        if( this.maxTime < time ){
            ret                                     = this.getData(asItem, clear);
        }else if( this.minTime < time ){
            ret                                     = this.getByPeriod(false, time, asItem, clear);
        }
        return ret;
    },
    getUpToNow                                      : function(equal, asItem, clear){
        return this.upTo(Date.now() - ( equal ? 0 : 1), asItem, clear);
    },
    add                                             : function(data, time, keys, id){
        var
            context                                 = this,
            item                                    = {
                id                                  : id || aRunD.randomId( context.items ),
                data                                : data,
                time                                : aRunD.isInt(time) ? time : Date.now()
            }
        ;

        if( !jQuery.isArray(keys) ){
            keys                                    = keys && typeof(keys) === 'string' ? [keys] : [];
        }
        item.keys                                   = keys;



        context.items[item.id]                      = item;
        for (var i = 0; i < keys.length; i++) {
            if( !context.keys[ keys[i] ] ){
                context.keys[ keys[i] ]             = [];
            }
            context.keys[ keys[i] ].push(item.id);
        }

        var hasTime                                 = true;
        if( !context.at[item.time] ){
            hasTime                                 = false;
            context.at[item.time]                   = [];
        }
        if( context.minTime === false || context.minTime > item.time ){
            context.minTime                         = item.time;
            if( !hasTime ){
                context.timeStuck.unshift(item.time);
                hasTime                             = true;
            }
        }
        if( context.minTime === false || context.maxTime < item.time ){
            context.maxTime                         = item.time;
            if( !hasTime ){
                context.timeStuck.push(item.time);
                hasTime                             = true;
            }
        }

        if( !hasTime ){
            context.timeStuck.splice(context.__getNearestTimeKey(item.time) + 1, 0, item.time);
        }
        
        context.at[item.time].push(item.id);
        ++context.length;

        return context;
    },
    __removeItem                                    : function(ind){
        --this.length;
        delete this.items[ind];
        return this;
    },
    __getDataFn                                     : function(asItem){
        if( typeof(asItem) === 'function' ){
            return asItem;
        }
        return asItem ? function(item){
            return item;
        } : function(item){
            return item.data;
        };
    },
    __checkAt                                       : function(time, partly){
        if( this.at[time] && !this.at[time].length ){
            if( !partly ){
                var tmp                             = jQuery.inArray( time, this.timeStuck );
                if( tmp > -1 ){
                    this.timeStuck.splice(tmp, 1);
                }
            }
            delete this.at[time];
        }
        return this;
    },
    __resetMinMax                                   : function(){
        if( this.timeStuck.length ){
            this.minTime                            = this.timeStuck[0];
            this.maxTime                            = this.timeStuck[this.timeStuck.length-1];
        }else{
            this.minTime                            = false;
            this.maxTime                            = false;
        }
        
        return this;
    },
    __getNearestTimeKey_simple                      : function(time, rev){
        var i;
        for (i = 0; i < this.timeStuck.length; i++) {
            if( this.timeStuck[i] > time ){
                return rev || !i ? i : --i;
            }else if(this.timeStuck[i] === time){
                return i;
            }
        }
        return i;
    },
    __getNearestTimeKey_mid                         : function(time, rev){
        var start                                   = 0,
            end                                     = this.timeStuck.length - 1,
            mid
        ;
        while( true ){
            if( start >= end ){
                return rev ? start : end;
            }
            if( time <= this.timeStuck[start] ){
                return time === this.timeStuck[start] || rev ? start : start - 1;
            }
            if( time >= this.timeStuck[end] ){
                return time !== this.timeStuck[end] && rev ? end + 1 : end;
            }
            mid                                     = Math.ceil((start + end) / 2);
            if( time < this.timeStuck[mid] ){
                ++start;
                end                                 = mid - 1;
            }else if( time > this.timeStuck[mid] ){
                --end;
                start                               = mid + 1;
            }else{
                return mid;
            }
        }
    },
    __getNearestTimeKey_smart                        : function(time, rev){
        var start                                   = 0,
            end                                     = this.timeStuck.length - 1,
            mid
        ;
        while( true ){
            if( start >= end ){
                return rev ? start : end;
            }
            if( time <= this.timeStuck[start] ){
                return time === this.timeStuck[start] || rev ? start : start - 1;
            }
            if( time >= this.timeStuck[end] ){
                return time !== this.timeStuck[end] && rev ? end + 1 : end;
            }
            mid                                     = start + Math.ceil( (time - this.timeStuck[start]) / (this.timeStuck[end] - this.timeStuck[start]) * (end - start) );
            if( time < this.timeStuck[mid] ){
                ++start;
                end                                 = mid - 1;
            }else if( time > this.timeStuck[mid] ){
                --end;
                start                               = mid + 1;
            }else{
                return mid;
            }
        }
    },
    __getNearestTimeKey                        : function(time, rev){
        if( this.timeStuck.length > 20 ){
            return this.__getNearestTimeKey_smart(time, rev);
        }else if( this.timeStuck.length > 10 ){
            return this.__getNearestTimeKey_mid(time, rev);
        }else{
            return this.__getNearestTimeKey_simple(time, rev);
        }
    }
};